"""
sw_app.py -- classes for Sciris (Flask-based) apps 
    
Last update: 2018nov14
"""

# Imports
import io
import os
import sys
import socket
import logging
import traceback
from collections import OrderedDict
from functools import wraps

from flask import Flask, request, abort, json, jsonify as flask_jsonify, send_from_directory, make_response, current_app as flaskapp, send_file
from flask_login import LoginManager, current_user
from twisted.internet import reactor
from twisted.internet.endpoints import serverFromString
from twisted.logger import globalLogBeginner, FileLogObserver, formatEvent
from twisted.python.threadpool import ThreadPool
from twisted.web.resource import Resource
from twisted.web.server import Site
from twisted.web.static import File
from twisted.web.wsgi import WSGIResource
from werkzeug.serving import run_with_reloader
from werkzeug.exceptions import HTTPException
from werkzeug.utils import secure_filename

import sciris as sc
from . import sw_datastore as ds
from . import sw_rpcs as rpcs
from . import sw_tasks as tasks
from . import sw_users as users

#################################################################
### Classes and functions
#################################################################

__all__ = ['robustjsonify', 'ScirisApp', 'ScirisResource', 'flaskapp']

def robustjsonify(response, fallback=False, verbose=True):
    ''' 
    Flask's default jsonifier clobbers dict order; this preserves it; however, it falls 
    back to regular Flask jsonify if needed.
    '''
    robustjson = sc.sanitizejson(response, tostring=True) + '\n' # The newline is part of Flask: https://github.com/pallets/flask/issues/1877
    lenjson = len(robustjson)
    placeholder = '_'*(lenjson-3) # Create a placeholder of the correct length -- -3 because of ""\n which gets added
    flaskjson = flask_jsonify(placeholder) # Use standard Flask jsonification
    lenplaceholder = len(flaskjson.response[0])
    if lenplaceholder == lenjson: # Lengths match, proceed
        flaskjson.response[0] = robustjson 
    else: # If there's a length mismatch, fall back to regular Flask
        if verbose: print('ScirisApp: not robustifying JSON since length mismatch (%s vs. %s): %s' % (lenjson, len(flaskjson.response[0]), robustjson))
        fallback = True
    if fallback: # Use standard Flask jsonification if anything went wrong
        try:
            flaskjson = flask_jsonify(sc.sanitizejson(response)) 
        except Exception as E:
            errormsg = 'Flask jsonification of "%s" failed: %s' % (response, str(E))
            raise Exception(errormsg)
    return flaskjson


class ScirisApp(sc.prettyobj):
    """
    An object encapsulating a Sciris webapp, generally.  This app has an 
    associated Flask app that actually runs to listen for and respond to 
    HTTP requests.
    
    Methods:
        __init__(script_path: str, self.config: config module [None], 
            client_dir: str [None]): void -- constructor
        run(with_twisted: bool [True], with_flask: bool [True], 
            with_client: [True]): void -- run the actual server
        define_endpoint_layout(rule: str, layout: list): void -- set up an 
            endpoint with a layout of a static Flask page
        add_RPC(new_RPC: ScirisRPC): void -- add an RPC to the app's dictionary
        add_RPC_dict(new_RPC_dict: dict): void -- add RPCs from another RPC 
            dictionary to the app's dictionary
        register_RPC(**kwargs): func -- decorator factory for adding a function 
            as an RPC
        _layout_render(): void -- render HTML for the layout of the given 
            rule (in the request)
        _do_RPC(): void -- process a request in such a way as to find and 
            dispatch the chosen RPC, doing any validation checking and error 
            logging necessary in the process
                    
    Attributes:
        flask_app (Flask) -- the actual Flask app
        config (flask.config.Config) -- the Flask configuration dictionary
        define_endpoint_callback (func) -- points to the flask_app.route() 
            function so you can use @app.define_endpoint_callback in the calling code
        endpoint_layout_dict (dict) -- dictionary holding static page layouts
        RPC_dict (dict) -- dictionary of site RPCs
            
    Usage:
        >>> app = ScirisApp(__file__)                      
    """
    
    def  __init__(self, filepath=None, config=None, name=None, RPC_dict=None, logfile=None, colorize=None, **kwargs):

        # If we're sending output to a logfile, initialize it at the very beginning
        if logfile:
            self.stdout = sys.stdout # Save the original so we can restore it if need be
            try:
                print('Redirecting output to %s' % logfile)
                sys.stdout = open(logfile, 'a+', 1) # Open file for appending, with buffer size of 1
            except Exception as E:
                errormsg = 'Could not open logfile "%s": %s' % (logfile, str(E))
                raise Exception(errormsg)
        
        # Decide whether to use colorization -- yes unless a logfile is being used
        if colorize is None:
            colorize = False if logfile else True
        self.colorize= colorize

        # Initialize everything else
        if name is None: 
            name = 'default'
        self.name = name
        self.flask_app = Flask(__name__) # Open a new Flask app.
        if config is not None: # If we have a config module, load it into Flask's config dict.
            self.flask_app.config.from_object(config)
        self.config = self.flask_app.config # Set an easier link to the configs dictionary.
        self.config['ROOT_ABS_DIR'] = os.path.dirname(os.path.abspath(filepath)) # Extract the absolute directory path from the above.
        self._init_logger() # Initialize the Flask logger. 
        self._set_config_defaults() # Set up default values for configs that are not already defined.
        self._update_config_defaults(**kwargs) # If additional command-line arguments are supplied, use them
        self.define_endpoint_callback = self.flask_app.route # Set an alias for the decorator factory for adding an endpoint.
        self.endpoint_layout_dict = {} # Create an empty layout dictionary.
        self.RPC_dict = {}  # Create an empty RPC dictionary.
        
        # Set up file paths.
        self._init_file_dirs()
        
        # Set up RPCs
        if RPC_dict:
            self.add_RPC_dict(RPC_dict)
        
        # If we are including DataStore functionality, initialize it.
        if self.config['USE_DATASTORE']:
            self._init_datastore(use_db=True)
            self.flask_app.datastore = self.datastore
        else: # Initialize to be a temporary folder
            self._init_datastore(use_db=False)

        # If we are including DataStore and users functionality, initialize users.
        if self.config['USE_DATASTORE'] and self.config['USE_USERS']:
            self.login_manager = LoginManager() # Create a LoginManager() object.
            
            # This function gets called when authentication gets done by 
            # Flask-Login.  userid is the user ID pulled out of the session 
            # cookie the browser passes in during an HTTP request.  The 
            # function returns the User object that matches this, so that the 
            # user data may be used to authenticate (for example their 
            # rights to have admin access).  The return sets the Flask-Login 
            # current_user value.
            @self.login_manager.user_loader
            def load_user(userid):
                return self.datastore.loaduser(userid) # Return the matching user (if any).
            
            self.login_manager.init_app(self.flask_app) # Configure Flask app for login with the LoginManager.
            self.add_RPC_dict(users.RPC_dict) # Register the RPCs in the users.py module.
            
        # If we are including DataStore and tasks, initialize them.    
        if self.config['USE_DATASTORE'] and self.config['USE_TASKS']:
            self._init_tasks() # Initialize the users.
            self.add_RPC_dict(tasks.RPC_dict) # Register the RPCs in the user.py module.

        return None # End of __init__
            
    def _init_logger(self):
        self.flask_app.logger.setLevel(logging.DEBUG)
        return None
    
    def _set_config_defaults(self):
        if 'CLIENT_DIR'         not in self.config: self.config['CLIENT_DIR']         = '.'        
#        if 'CLIENT_DIR'         not in self.config: self.config['CLIENT_DIR']         = None
        if 'LOGGING_MODE'       not in self.config: self.config['LOGGING_MODE']       = 'FULL' 
        if 'SERVER_PORT'        not in self.config: self.config['SERVER_PORT']        = 8080
        if 'USE_DATASTORE'      not in self.config: self.config['USE_DATASTORE']      = False
        if 'USE_USERS'          not in self.config: self.config['USE_USERS']          = False
        if 'USE_TASKS'          not in self.config: self.config['USE_TASKS']          = False
        if 'MATPLOTLIB_BACKEND' not in self.config: self.config['MATPLOTLIB_BACKEND'] = 'Agg'
        if 'SLACK'              not in self.config: self.config['SLACK']              = None
        return None
    
    def _update_config_defaults(self, **kwargs):
        ''' Used to update config with command-line arguments '''
        for key,val in kwargs.items():
            KEY = key.upper() # Since they're always uppercase
            if KEY in self.config:
                origval = self.config[KEY]
                self.config[KEY] = val
                print('Resetting configuration option "%s" from "%s" to "%s"' % (KEY, origval, val))
            else:
                warningmsg = '\nWARNING: kwarg "%s":"%.100s" will be ignored since it is not in the list of valid config options:\n' % (KEY, val)
                for validkey in sorted(self.config.keys()):
                    warningmsg += '  %s\n' % validkey
                print(warningmsg)
        return None
                

    def _init_file_dirs(self):
        # Set the absolute client directory path.
        
        # If we have a client directory...
        if self.config['CLIENT_DIR'] is not None:
            # If we do not have an absolute directory, tack what we have onto the 
            # ROOT_ABS_DIR setting.
            if not os.path.isabs(self.config['CLIENT_DIR']):
                self.config['CLIENT_DIR'] = os.path.join(self.config['ROOT_ABS_DIR'], self.config['CLIENT_DIR'])
        
        return None
        
    def _init_datastore(self, use_db=True):
        if use_db:
            # Create the DataStore object
            self.datastore = ds.make_datastore(url=self.config['DATASTORE_URL'])
            
            if self.config['LOGGING_MODE'] == 'FULL':
                maxkeystoshow = 20
                keys = self.datastore.keys()
                nkeys = len(keys)
                keyinds = range(1,nkeys+1)
                keypairs = list(zip(keyinds, keys))
                print('>> Loaded DataStore with %s key(s)' % nkeys)
                if nkeys>2*maxkeystoshow:
                    print('>> First and last %s keys:' % maxkeystoshow)
                    keypairs    = keypairs[:maxkeystoshow] + keypairs[-maxkeystoshow:]
                for k,key in keypairs:
                    print('  Key %02i: %s' % (k,key))
        else:
            self.datastore = ds.DataDir() # Initialize with a simple temp data directory instead
        return None
    
    def _init_tasks(self):
        # Have the tasks.py module make the Celery app to connect to the worker, passing in the config parameters.
        print('Making Celery instance...')
        tasks.make_celery(self.config)
        
    def run(self, with_twisted=True, with_flask=True, with_client=True, do_log=False, show_logo=True, autoreload=False, run_args=None):
        
        def run_twisted(port=8080, flask_app=None, client_dir=None, do_log=False, reactor_args=None):
            # Give an error if we pass in no Flask server or client path.
            if reactor_args is None:
                reactor_args = {}
        
            if (flask_app is None) and (client_dir is None): 
                print('ERROR: Neither client or server are defined.')
                return None
            if do_log: # Set up logging.
                globalLogBeginner.beginLoggingTo([FileLogObserver(sys.stdout, lambda _: formatEvent(_) + "\n")])
            if client_dir is not None: # If there is a client path, set up the base resource.
                base_resource = File(client_dir)
                
            # If we have a flask app...
            if flask_app is not None:
                thread_pool = ThreadPool(maxthreads=30) # Create a thread pool to use with the app.
                wsgi_app = WSGIResource(reactor, thread_pool, flask_app) # Create the WSGIResource object for the flask server.
                if client_dir is None: # If we have no client path, set the WSGI app to be the base resource.
                    base_resource = ScirisResource(wsgi_app)
                else:  # Otherwise, make the Flask app a child resource.
                    base_resource.putChild(b'api', ScirisResource(wsgi_app))
                thread_pool.start() # Start the threadpool now, shut it down when we're closing
                reactor.addSystemEventTrigger('before', 'shutdown', thread_pool.stop)
        
            # Create the site.
            site = Site(base_resource) 
            endpoint = serverFromString(reactor, "tcp:port=" + str(port)) # Create the endpoint we want to listen on, and point it to the site.
            endpoint.listen(site)
            reactor.run(**reactor_args) # Start the reactor.
            return None
        
        # To allow arguments to be passed to the run function
        if run_args is None:
            run_args = {}
        
        # Initialize plotting
        try:
            import matplotlib.pyplot as ppl # Place here so as not run on import
            ppl.switch_backend(self.config['MATPLOTLIB_BACKEND'])
            print('Matplotlib backend switched to "%s"' % (self.config['MATPLOTLIB_BACKEND']))
        except Exception as E:
            print('Switching Matplotlib backend to "%s" failed: %s' % (self.config['MATPLOTLIB_BACKEND'], repr(E)))
        
        # Display the logo
        port = int(self.config['SERVER_PORT']) # Not sure if casting to int is necessary
        appstring = 'ScirisApp "%s" is now running on port %s' % (self.name, port)
        borderstr = '='*len(appstring)
        logostr = '''\
      ___  ___    %s 
     / __|/ __|   %s     
     \__ \ |__    %s     
     |___/\___|   %s     
                  %s''' % (' '*(len(appstring)+4), borderstr, appstring, borderstr, ' '*(len(appstring)+5))
        logocolors = ['gray','bgblue'] # ['gray','bgblue']
        if show_logo:
            print('')
            for linestr in logostr.splitlines():
                sc.colorize(logocolors, linestr, enable=self.colorize)
            print('')


        if not with_twisted: # If we are not running the app with Twisted, just run the Flask app.
            run_fcn = lambda: self.flask_app.run(port=port, **run_args)
        else:
            twisted_args = {}
            twisted_args['reactor_args'] = run_args
            twisted_args['do_log'] = do_log
            twisted_args['port'] = port
            if with_client:
                twisted_args['client_dir'] = self.config['CLIENT_DIR']
            if with_flask:
                twisted_args['flask_app'] = self.flask_app
            if autoreload:
                twisted_args['reactor_args']['installSignalHandlers'] = 0
            run_fcn = lambda: run_twisted(**twisted_args)

        if autoreload:
            run_fcn = run_with_reloader(run_fcn)

        return run_fcn()
    
    def define_endpoint_layout(self, rule, layout):
        # Save the layout in the endpoint layout dictionary.
        self.endpoint_layout_dict[rule] = layout
        
        # Set up the callback, to point to the _layout_render() function.
        self.flask_app.add_url_rule(rule, 'layout_render', self._layout_render)
        return None
        
    def slacknotification(self, message=None):
        ''' Send a message on Slack '''
        if self.config.get('SLACK'):
            slack_webhook = self.config['SLACK'].get('webhook')
            slack_to      = self.config['SLACK'].get('to')
            slack_from    = self.config['SLACK'].get('from')
            sc.slacknotification(message=message, webhook=slack_webhook, to=slack_to, fromuser=slack_from, die=False)
        else:
            print('Cannot send Slack message "%s": Slack not enabled in config file' % message)
        return None
    
    def route(self, rule, methods=None, *args, **kwargs):
        ''' Shortcut to Flask route decorator '''
        if methods is None: methods = ['GET', 'POST']
        return self.flask_app.route(rule, methods=methods, *args, **kwargs)

    def add_RPC(self, new_RPC):
        # If we are setting up our first RPC, add the actual endpoint.
        if len(self.RPC_dict) == 0:
            self.flask_app.add_url_rule('/rpcs', 'do_RPC', self._do_RPC, methods=['POST'])
          
        # If the function name is in the dictionary...
        if new_RPC.funcname in self.RPC_dict:
            # If we have the power to override the function, give a warning.
            if new_RPC.override:
                if self.config['LOGGING_MODE'] == 'FULL':
                    print('>> add_RPC(): WARNING: Overriding previous version of %s:' % new_RPC.funcname)
                    print('>>   Old: %s.%s' % 
                        (self.RPC_dict[new_RPC.funcname].call_func.__module__, 
                        self.RPC_dict[new_RPC.funcname].call_func.__name__))
                    print('>>   New: %s.%s' % (new_RPC.call_func.__module__, 
                        new_RPC.call_func.__name__))
            # Else, give an error, and exit before the RPC is added.
            else:
                print('>> add_RPC(): ERROR: Attempt to override previous version of %s: %s.%s' % \
                      (new_RPC.funcname, self.RPC_dict[new_RPC.funcname].call_func.__module__, self.RPC_dict[new_RPC.funcname].funcname))
                return
        
        # Create the RPC and add it to the dictionary.
        self.RPC_dict[new_RPC.funcname] = new_RPC
    
    def add_RPC_dict(self, new_RPC_dict):
        for RPC_funcname in new_RPC_dict:
            self.add_RPC(new_RPC_dict[RPC_funcname])

    def register_RPC(self, **callerkwargs):
        def RPC_decorator(RPC_func):
            @wraps(RPC_func)
            def wrapper(*args, **kwargs):
                output = RPC_func(*args, **kwargs)
                return output

            # Create the RPC and try to add it to the dictionary.
            new_RPC = rpcs.ScirisRPC(RPC_func, **callerkwargs)
            self.add_RPC(new_RPC)
            
            return wrapper

        return RPC_decorator

    def _layout_render(self):
        render_str = '<html>'
        render_str += '<body>'
        for layout_comp in self.endpoint_layout_dict[str(request.url_rule)]:
            render_str += layout_comp.render()
        render_str += '</body>'
        render_str += '</html>'
        return render_str
    
    def _do_RPC(self, verbose=False):
        # Check to see whether the RPC is getting passed in in request.form.
        # If so, we are doing an upload, and we want to download the RPC 
        # request info from the form, not request.data.
        if 'funcname' in request.form: # Pull out the function name, args, and kwargs
            fn_name = request.form.get('funcname')
            try:    args = json.loads(request.form.get('args', "[]"), object_pairs_hook=OrderedDict)
            except: args = [] # May or may not be present
            try:    kwargs = json.loads(request.form.get('kwargs', "{}"), object_pairs_hook=OrderedDict)
            except: kwargs = {} # May or may not be present
        else: # Otherwise, we have a normal or download RPC, which means we pull the RPC request info from request.data.
            reqdict = json.loads(request.data, object_pairs_hook=OrderedDict)
            fn_name = reqdict['funcname']
            args = reqdict.get('args', [])
            kwargs = reqdict.get('kwargs', {})
        if verbose:
            print('RPC(): RPC properties:')
            print('  fn_name: %s' % fn_name)
            print('     args: %s' % args)
            print('   kwargs: %s' % kwargs)
        
        # If the function name is not in the RPC dictionary, return an error.
        if not sc.isstring(fn_name) :
            return robustjsonify({'error': 'Invalid RPC - must be a string (%s)' % fn_name})

        if not fn_name in self.RPC_dict:
            return robustjsonify({'error': 'Could not find requested RPC "%s"' % fn_name})
        
        found_RPC = self.RPC_dict[fn_name] # Get the RPC we've found.
        
        ## Do any validation checks we need to do and return errors if they don't pass.
        
        # If the RPC is disabled, always return a Status 403 (Forbidden)
        if found_RPC.validation == 'disabled':
            if verbose: print('RPC(): RPC disabled')
            abort(403)
        
        # Only do other validation if DataStore and users are included -- NOTE: Any "unknown" validation values are treated like 'none'.
        if self.config['USE_DATASTORE'] and self.config['USE_USERS']:
            if found_RPC.validation == 'any' and not (current_user.is_anonymous or current_user.is_authenticated):
                abort(401) # If the RPC should be executable by any user, including an anonymous one, but there is no authorization or anonymous login, return a Status 401 (Unauthorized)
            elif found_RPC.validation == 'named' and (current_user.is_anonymous or not current_user.is_authenticated):
                abort(401) # Else if the RPC should be executable by any non-anonymous user, but there is no authorization or there is an anonymous login, return a Status 401 (Unauthorized)
            elif found_RPC.validation == 'admin': # Else if the RPC should be executable by any admin user, but there is no admin login or it's an anonymous login...
                if current_user.is_anonymous or not current_user.is_authenticated:
                    abort(401) # If the user is anonymous or no authenticated user is logged in, return Status 401 (Unauthorized).
                elif not current_user.is_admin:
                    abort(403) # Else, if the user is not an admin user, return Status 403 (Forbidden).
                    
        # If we are doing an upload...
        if found_RPC.call_type == 'upload':
            if verbose: print('Starting upload...')
            thisfile = request.files['uploadfile'] # Grab the formData file that was uploaded.    
            filename = secure_filename(thisfile.filename) # Extract a sanitized filename from the one we start with.
            try:
                uploaded_fname = os.path.join(self.datastore.tempfolder, filename) # Generate a full upload path/file name.
            except Exception as E:
                errormsg = 'Could not create filename for uploaded file: %s' % str(E)
                raise Exception(errormsg)
            try:
                thisfile.save(uploaded_fname) # Save the file to the uploads directory
            except Exception as E:
                errormsg = 'Could not save uploaded file: %s' % str(E)
                raise Exception(errormsg)
            args.insert(0, uploaded_fname) # Prepend the file name to the args list.
        
        # Show the call of the function.
        callcolor    = ['cyan',  'bgblue']
        successcolor = ['green', 'bgblue']
        failcolor    = ['gray',  'bgred']
        timestr = '[%s]' % sc.now(tostring=True)
        try:    userstr = ' <%s>' % current_user.username
        except: userstr =' <no user>'
        RPCinfo = sc.objdict({'time':timestr, 'user':userstr, 'module':found_RPC.call_func.__module__, 'name':found_RPC.funcname})
        
        if self.config['LOGGING_MODE'] == 'FULL':
            string = '%s%s RPC called: "%s.%s"' % (RPCinfo.time, RPCinfo.user, RPCinfo.module, RPCinfo.name)
            sc.colorize(callcolor, string, enable=self.colorize)
    
        # Execute the function to get the results, putting it in a try block in case there are errors in what's being called. 
        try:
            if verbose: print('RPC(): Starting RPC...')
            T = sc.tic()
            result = found_RPC.call_func(*args, **kwargs)
            if isinstance(result, dict) and 'error' in result: # If the RPC returns an error, return it
                return robustjsonify({'error':result['error']})
            elapsed = sc.toc(T, output=True)
            if self.config['LOGGING_MODE'] == 'FULL':
                string = '%s%s RPC finished in %0.2f s: "%s.%s"' % (RPCinfo.time, RPCinfo.user, elapsed, RPCinfo.module, RPCinfo.name)
                sc.colorize(successcolor, string, enable=self.colorize)
        except Exception as E:
            if verbose: print('RPC(): Exception encountered...')
            shortmsg = str(E)
            exception = traceback.format_exc() # Grab the trackback stack
            hostname = '|%s| ' % socket.gethostname()
            tracemsg = '%s%s%s Exception during RPC "%s.%s" \nRequest: %s \n%.10000s' % (hostname, RPCinfo.time, RPCinfo.user, RPCinfo.module, RPCinfo.name, request, exception)
            sc.colorize(failcolor, tracemsg, enable=self.colorize) # Post an error to the Flask logger limiting the exception information to 10000 characters maximum (to prevent monstrous sqlalchemy outputs)
            if self.config['SLACK']:
                self.slacknotification(tracemsg)
            if isinstance(E, HTTPException): # If we have a werkzeug exception, pass it on up to werkzeug to resolve and reply to.
                raise E
            code = 500 # Send back a response with status 500 that includes the exception traceback.
            fullmsg = shortmsg + '\n\nException details:\n' + tracemsg
            reply = {'exception':fullmsg} # NB, not sure how to actually access 'traceback' on the FE, but keeping it here for future
            return make_response(robustjsonify(reply), code)

        # If we are doing a download, prepare the response and send it off.
        if found_RPC.call_type == 'download':
            # To download a file, use `this.$sciris.download` instead of `this.$sciris.rpc`. Decorate the RPC with
            # `@RPC(call_type='download')`. Finally, the RPC needs to specify the file and optionally the filename.
            # This is done with tuple unpacking. The following outputs are supported from `rpc_function()`
            #
            # 1 - filename_on_disk
            # 2 - BytesIO
            # 3 - filename_on_disk, download_filename
            # 4- BytesIO, download_filename
            #
            # Examples return values from the RPC are as follows
            #
            # 1 - "E:/test.xlsx" (uses "test.xlsx")
            # 2 - <BytesIO> (default filename will be generated in this function)
            # 3 - ("E:/test.xlsx","foo.xlsx")
            # 4 - (<BytesIO>,"foo.xlsx")
            #
            # On the RPC end, the most common cases would be it might look like
            #
            # return "E:/test.xlsx"
            #
            # OR
            #
            # return Blobject.to_file(), "foo.xlsx"

            if verbose: print('RPC(): Starting download...')

            if result is None: # If we got None for a result (the full file name), return an error to the client.
                return robustjsonify({'error': 'Could not find resource to download from RPC "%s": result is None' % fn_name})
            elif sc.isstring(result):
                from_file = True
                dir_name, file_name = os.path.split(result)
                output_name = file_name
            elif isinstance(result,io.BytesIO):
                from_file = False
                bytesio = result
                output_name = 'download.obj'
            else:
                try:
                    content = result[0]
                    output_name = result[1]
                    if sc.isstring(content):
                        from_file = True
                        dir_name, file_name = os.path.split(content)
                    elif isinstance(content,io.BytesIO):
                        from_file = False
                        bytesio = content
                    else:
                        return robustjsonify({'error': 'Unrecognized RPC output'})
                except Exception as E:
                    return robustjsonify({'error': 'Error reading RPC result (%s)' % E})

            if from_file:
                response = send_from_directory(dir_name, file_name, as_attachment=True)
                response.status_code = 201  # Status 201 = Created
                # Unfortunately, we cannot remove the actual file at this point
                # because it is in use during the actual download, so we rely on
                # later cleanup to remove download files.
            else:
                response = send_file(bytesio, as_attachment=True, attachment_filename=output_name)
            response.headers['filename'] = output_name
            print(response)
            return response # Return the response message.


        # Otherwise (normal and upload RPCs), 
        else: 
            if found_RPC.call_type == 'upload': # If we are doing an upload....
                try:
                    os.remove(uploaded_fname) # Erase the physical uploaded file, since it is no longer needed.
                    if verbose: print('RPC(): Removed uploaded file: %s' % uploaded_fname)
                except Exception as E:
                    if verbose: print('RPC(): Could not remove uploaded file: %s' % str(E)) # Probably since moved by the user
            if result is None: # If None was returned by the RPC function, return ''.
                if verbose: print('RPC(): RPC finished, returning None')
                return ''
            else: # Otherwise, convert the result (probably a dict) to JSON and return it.
                output = robustjsonify(result)
                if verbose: print('RPC(): RPC finished, returning result')
                return output
        
        
class ScirisResource(Resource):
    isLeaf = True

    def __init__(self, wsgi):
        self._wsgi = wsgi

    def render(self, request):
        r = self._wsgi.render(request) # Get the WSGI render results (i.e. for Flask app).

        # Keep the client browser from caching Flask response, and set the response as already being "expired."
        request.responseHeaders.setRawHeaders(b'Cache-Control', [b'no-cache', b'no-store', b'must-revalidate'])
        request.responseHeaders.setRawHeaders(b'expires', [b'0'])
        
        # Pass back the WSGI render results.
        return r
    
    
    
