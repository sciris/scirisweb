"""
datastore.py -- code related to the Sciris database.
    
Last update: 2019sep30
"""


#################################################################
### Imports and global variables
#################################################################

# Imports
import os
import six
import atexit
import tempfile
import traceback
import shutil
import fnmatch
import redis
import sqlalchemy
import sciris as sc
from .sw_users import User
from .sw_tasks import Task


# Global variables
default_settingskey = '!DataStoreSettings'      # Key for holding DataStore settings
default_separator   = '::'                     # Define the separator between a key type and uid
max_key_length      = 255

#################################################################
### Classes
#################################################################

__all__ = ['Blob', 'DataStoreSettings', 'make_datastore', 'DataDir', 'copy_datastore']


class PickleError(Exception):
    """ This error gets raised if a blob in the datastore could not be unpickled """
    pass


class Blob(sc.prettyobj):
    ''' Wrapper for any Python object we want to store in the DataStore. '''
    
    def __init__(self, obj=None, key=None, objtype=None, uid=None, force=True):
        # Handle input arguments
        if uid is None: 
            if force:
                uid = sc.uuid()
            else:
                errormsg = 'DataStore: Not creating a new Blob UUID since force is set to False: key=%s, objtype=%s, uid=%s, obj=%s' % (key, objtype, uid, obj)
                raise Exception(errormsg)
        if not key: key = '%s%s%s' % (objtype, default_separator, uid)
        
        # Set attributes
        self.key      = key
        self.objtype  = objtype
        self.uid      = uid
        self.created  = sc.now()
        self.modified = [self.created]
        self.obj      = obj
        return None
    
    def update(self):
        ''' When the object is updated, append the current time to the modified list '''
        now = sc.now()
        self.modified.append(now)
        return now
        
    def save(self, obj):
        ''' Save new object to the Blob '''
        self.obj = obj
        self.update()
        return None
    
    def load(self):
        ''' Load data from the Blob '''
        output = self.obj
        return output


def make_datastore(url=None, *args, **kwargs):
    """
    Make a datastore -- interface for the DataStore classes.

    :param url: URL that identifies a database. It can be a Redis URL, a file location, or a URL supported by SQLALchemy
        - Redis: 'redis://127.0.0.1:6379/8' [default]
        - Filesystem 'file:///home/username/storage' or 'file://./storage' for a relative path
        - SQLALchemy: some examples of URLs for various backends
            - 'sqlite:///storage.db'
            - 'mssql+pyodbc:///?odbc_connect=DRIVER%3D%7BODBC+Driver+13+for+SQL+Server%7D%3BSERVER%3D127.0.0.1%3BDATABASE%3Dtestdb%3BUID%3Dusername%3BPWD%3Dpassword%3B'-
            - 'postgresql+psycopg2://username:password@localhost:5432/testdb'
            - 'mysql+pymysql://username:password@localhost:3306/testdb?charset=utf8mb4&binary_prefix=true' (note the binary_prefix and charset components in the URL)
    :param args: Extra arguments to `DataStore`
    :param kwargs: Extra keyword arguments to `DataStore`
    :return: A `DataStore` instance of the appropriate derived type e.g. `RedisDataStore` for a Redis URL
    
    Examples:
        ds = sw.make_datastore() # Create a Redis database using defaults
        ds = sw.make_datastore('redis') # Likewise
        ds = sw.make_datastore('redis://127.0.0.1:6379/8') # Set up with a specific URL
        ds = sw.make_datastore(url='redis://127.0.0.1:6379/8', )

    """

    if url is None or url.startswith('redis'):
        if url == 'redis': url = None # Reset if not an actual URL
        return RedisDataStore(url, *args, **kwargs)
    elif url.startswith('file'): # Reset if not an actual URL
        if url == 'file': url = None
        return FileDataStore(url, *args, **kwargs)
    else:
        return SQLDataStore(url, *args, **kwargs)


def copy_datastore(src, dst):
    """
    Copy datastore so that the destination datastore is an replica of the source datastore

    'Hidden' keys starting with '_' will not be copied. This is important because keys like
    ``_kombu*`` created by Redis do not have a string type and thus cannot be moved between
    datastore backends.

    :param src: Datastore source URL
    :param dst: Datastore destination URL
    :return: None
    """

    src_ds = make_datastore(src)
    dst_ds = make_datastore(dst)
    dst_ds.flushdb()
    dst_ds = make_datastore(dst)
    keys = list(src_ds.keys())
    for i, key in enumerate(keys):
        print("Key %s (%d of %d)" % (key, i, len(keys)))
        if key.startswith('_'):
            print("Skipping %s" % (key))
            continue
        value = src_ds._get(key)
        dst_ds._set(key, value)


class DataStoreSettings(sc.prettyobj):
    ''' Global settings for the DataStore '''
    
    def __init__(self, settings=None, tempfolder=None, separator=None):
        ''' Initialize with highest priority given to the inputs, then the stored settings, then the defaults '''
        
        # 1. Arguments
        self.tempfolder = tempfolder
        self.separator  = separator
        
        # 2. Existing settings
        if not settings:
            self.is_new    = True
            old_tempfolder = None
            old_separator  = None
        else:
            self.is_new    = False
            old_tempfolder = settings.tempfolder
            old_separator  = settings.separator
        
        # 3. Defaults
        def_tempfolder = tempfile.mkdtemp()
        def_separator  = default_separator
        
        # Iterate in order 
        tempfolder_list = [old_tempfolder, def_tempfolder]
        separator_list  = [old_separator,  def_separator]
        for folder in tempfolder_list:
            if not self.tempfolder:
                self.tempfolder = folder
        for sep in separator_list:
            if not self.separator:
                self.separator = sep
        
        return None



class BaseDataStore(sc.prettyobj):
    """
    Base DataStore functionality

    This base class implements primary DataStore functionality independent of the specific
    storage backend being used. Derived classes implement the private methods `_set`, `_get`
    etc. as required for their specific storage mechanisms. This class implements the logical operations
    for constructing keys, storing users and tasks etc.

    This class should not be instantiated directly - instead, construct a datastore either using
    the `datastore()` function, or by instantiating one of the backend-specific datastores e.g.
    `RedisDataStore`.

    """

    def __init__(self, tempfolder=None, separator=None, settingskey=None, verbose=True):
        self.tempfolder = None # Populated by self.settings()
        self.separator  = None # Populated by self.settings()
        self.is_new     = None # Populated by self.settings()
        self.verbose    = verbose
        self.settings(settingskey=settingskey, tempfolder=tempfolder, separator=separator) # Set or get the settings
        if self.verbose: print(self)
        return None

    ### DATASTORE BACKEND-SPECIFIC METHODS, THAT NEED TO BE DEFINED IN DERIVED CLASSES FOR SPECIFIC STORAGE MECHANISMS E.G. REDIS

    def __repr__(self):
        pass


    def _set(self, key , objstr):
        """
        Store string content under key

        This method is assumed to succeed unless an error is raised. If the key is
        already present, the specification is that this method will overwrite it.
        Logic for dealing with the case where the key already exists
        should be implemented in `DataStore.set()` so that it is common to all backends.

        :param key: Database key to store the object under
        :param objstr: Binary string with the string representation of the object
        :return: `None` if operation was successful
        :raises: `Exception` if operation failed
        """
        pass


    def _get(self, key):
        """
        Return blob content as string

        Derived classes implementing this method should return `None` if the key is not present.
        The logic of what happens next is implemented in `DataStore.get()` and is common
        to all storage backends

        :param key: Database key the object is stored under
        :return: Binary string corresponding to the object. `None` if the key was not present

        """
        pass


    def _delete(self, key):
        """
        Remove entry from database

        This function is assumed to succeed unless an error is raised. If the key is not
        present, this function is considered to have succeeded and an error should
        not be raised.

        :param key: Database key the object is stored under
        :return: `None` if delete succeeded
        :raises: `Exception` if delete was not successful

        """
        pass


    def _flushdb(self):
        """
        Clear all content from the datastore

        :return: `None` if flush succeeded
        :raises: `Exception` if flush was not successful
        """
        pass


    def _keys(self):
        """
        Return all keys in datastore

        :return: List of keys
        """
        pass


    ### STANDARD DATASTORE FUNCTIONALITY

    def set(self, key=None, obj=None, objtype=None, uid=None):
        """
        Store item in datastore

        Operation is considered to succeed if this method does not raise an error

        TODO - Could add checks like checking if it's a Blob instance (but settings are not stored as blobs...)

        :param key:
        :param obj: A Blob instance
        :param objtype:
        :param uid:
        :return:

        """

        key = self.getkey(key=key, objtype=objtype, uid=uid, obj=obj)
        objstr = sc.dumpstr(obj)
        self._set(key, objstr)
        return None


    def get(self, key=None, obj=None, objtype=None, uid=None, notnone=False, die=False):
        """
        Retrieve item from datastore

        If nonnone is False, then if the key is missing, `None` will be returned.
        If the key does exist, then an sw.Blob instance will be returned

        :param key:
        :param obj: A Blob instance
        :param objtype:
        :param uid:
        :param notnone:
        :param die:
        :return:

        :raises: KeyError if key is not present. PickleError if the blob was present but could not be unpickled
        """

        key = self.getkey(key=key, objtype=objtype, uid=uid, obj=obj)

        objstr = self._get(key)

        if objstr is None and notnone:
            errormsg = 'Datastore key "%s" not found (obj=%s, objtype=%s, uid=%s)' % (key, obj, objtype, uid)
            raise KeyError(errormsg)
        elif objstr is None:
            return None

        try:
            output = sc.loadstr(objstr, die=die)
        except:
            output = None
            errormsg = 'Datastore error: unpickling failed:\n%s' % traceback.format_exc()  # Grab the trackback stack
            if die:
                raise PickleError(errormsg)
            else:
                print(errormsg)
        return output


    def delete(self, key=None, obj=None, objtype=None, uid=None, die=None):
        """
        Remove item from datastore

        :param key:
        :param obj:
        :param objtype:
        :param uid:
        :param die:
        :return:
        """
        key = self.getkey(key=key, objtype=objtype, uid=uid, obj=obj)
        self._delete(key)
        if self.verbose: print('DataStore: deleted key %s' % key)
        return None


    def exists(self, key):
        """
        Return True if key exists in the datastore

        Can overload this if the specific datastore implements
        a faster method for checking

        :param key:
        :return: True if the key exists, False otherwise

        """
        objstr = self._get(key)
        return objstr is not None


    def flushdb(self):
        self._flushdb()
        if self.verbose: print('DataStore flushed.')
        return None


    def keys(self, pattern=None):
        """
        Return list of keys, optionally filtered

        :param pattern: Regular expression, key will be retained if a search for this expression returns a result
        :return: List of keys
        """
        keys = self._keys()
        if pattern is not None:
            keys = [x for x in keys if fnmatch.fnmatch(x, pattern)]  # Use fnmatch rather than re to mirror Redis's built-in behaviour
        return keys


    def settings(self, settingskey=None, tempfolder=None, separator=None, die=False):
        ''' Handle the DataStore settings '''
        if not settingskey: settingskey = default_settingskey
        try:
            origsettings = self.get(settingskey)
        except Exception as E:
            origsettings = None
            errormsg = 'Datastore: warning, could not load settings, using defaults: %s' % str(E)
            if die: raise Exception(errormsg)
            else:   print(errormsg)
        settings = DataStoreSettings(settings=origsettings, tempfolder=tempfolder, separator=separator)
        self.tempfolder = settings.tempfolder
        self.separator  = settings.separator
        self.is_new     = settings.is_new
        self.set(settingskey, settings) # Save back to the database
        
        # Handle the temporary folder
        try:
            os.makedirs(self.tempfolder)
            atexit.register(self._rmtempfolder) # Only register this if we've just created the temp folder
        except FileExistsError:
            pass

        return settings

    
    def _rmtempfolder(self):
        ''' Remove the temporary folder that was created '''
        if os.path.exists(self.tempfolder):
            if self.verbose: print('Removing up temporary folder at %s' % self.tempfolder)
            shutil.rmtree(self.tempfolder)
        return None
    
    
    def makekey(self, objtype, uid):
        ''' Create a key from an object type and UID '''
        if objtype: key = '%s%s%s' % (objtype, self.separator, uid) # Construct a key with an object type and separator
        else:       key = '%s'     % uid                            # ...or, just return the UID
        return key
        
    
    def getkey(self, key=None, objtype=None, uid=None, obj=None, fulloutput=None, forcetype=None):
        '''
        Get a valid database key, either from a given key (do nothing), or else from
        a supplied objtype and uid, or else read them from the object supplied. The
        idea is for this method to be as forgiving as possible for different possible
        combinations of inputs.
        '''
        # Handle optional input arguments
        if fulloutput is None: fulloutput = False
        if forcetype  is None: forcetype  = True
        
        # Handle different sources for things
        props = ['key', 'objtype', 'uid']
        args    = {'key':key,  'objtype':objtype, 'uid':uid}  # These are what have been supplied by the user
        fromobj = {'key':None, 'objtype':None,    'uid':None} # This is from the object
        final   = {'key':None, 'objtype':None,    'uid':None} # These will eventually be the output values -- copy of args
        
        # Look for missing properties from the object
        if obj:
            if hasattr(obj, 'key'):     fromobj['key']     = obj.key
            if hasattr(obj, 'objtype'): fromobj['objtype'] = obj.objtype
            if hasattr(obj, 'uid'):     fromobj['uid']     = obj.uid
        
        # Populate all non-None entries from the input arguments
        for p in props:
            if args[p]:
                final[p] = sc.flexstr(args[p]) # Convert to string since you don't know what crazy thing might be passed (using flexstr since str can't handle bytes)

        # Populate what we can from the object, if it hasn't already been populated
        for p in props:
            if fromobj[p] and not final[p]:
                final[p] = fromobj[p]
        
        # If the key is supplied but other things aren't, try to create them now
        if final['key'] and (not final['objtype'] or not final['uid']):
            splitkey = final['key'].split(self.separator)
            if len(splitkey)==2: # Check that the key split properly
                if not final['objtype']: final['objtype'] = splitkey[0]
                if not final['uid']:     final['uid']     = splitkey[1]
        
        # If we're still stuck, try making a new uid
        if not final['key'] and not final['uid']:
            final['uid'] = str(sc.uuid())
        
        # If everything is supplied except the key, create it
        if not final['key']:
            if final['objtype'] and final['uid']: # Construct a key from the object type and UID
                final['key'] = self.makekey(objtype=final['objtype'], uid=final['uid'])
            elif not final['objtype'] and final['uid']: # Otherwise, just use the UID
                final['key'] = final['uid']
            
        # Check that it's found, and if not, treat the key as a UID and try again
        keyexists = self.exists(final['key']) # Check to see whether a match has been found
        if not keyexists: # If not, treat the key as a UID instead
            newkey = self.makekey(objtype=final['objtype'], uid=final['key'])
            newkeyexists = self.exists(newkey) # Check to see whether a match has been found
            if newkeyexists:
                final['key'] = newkey
        
        # Finally, force the type if requested
        if forcetype and final['objtype']:
            splitkey = final['key'].split(self.separator, 1)
            if splitkey[0] != final['objtype']:
                final['key'] = self.makekey(objtype=final['objtype'], uid=final['key'])

        if len(final['key']) > max_key_length:
            raise Exception('Key is too long')

        # Return what we need to return
        if fulloutput: return final['key'], final['objtype'], final['uid']
        else:          return final['key']


    def items(self, pattern=None):
        ''' Return all found items in an odict '''
        output = sc.odict()
        keys = self.keys(pattern=pattern)
        for key in keys:
            output[key] = self.get(key)
        return output
    
    
    def _checktype(self, key, obj, objtype):
        if   objtype == 'Blob': objclass = Blob
        elif objtype == 'User': objclass = User
        elif objtype == 'Task': objclass = Task
        else:
            errormsg = 'Unrecognized type "%s": must be Blob, User, or Task'
            raise Exception(errormsg)
        
        if obj is None:
            errormsg = 'Cannot load %s as a %s: key not found' % (key, objtype)
            raise Exception(errormsg)
        
        if not isinstance(obj, objclass):
            errormsg = 'Cannot load %s as a %s since it is %s' % (key, objtype, type(obj))
            raise Exception(errormsg)
        
        return None
        
    
    def saveblob(self, obj, key=None, objtype=None, uid=None, overwrite=None, forcetype=None, die=None):
        '''
        Add a new or update existing Blob in the datastore, returns key. If key is None,
        constructs a key from the Blob (objtype:uid); otherwise, updates the Blob with the 
        provided key.
        '''
        # Set default arguments
        if overwrite is None: overwrite = True
        if die       is None: die       = True
        
        key, objtype, uid = self.getkey(key=key, objtype=objtype, uid=uid, obj=obj, fulloutput=True, forcetype=forcetype)
        blob = self.get(key)
        if blob:
            self._checktype(key, blob, 'Blob')
            if overwrite:
                blob.save(obj)
            else:
                errormsg = 'DataStore: Blob %s already exists and overwrite is set to False' % key
                if die: raise Exception(errormsg)
                else:   print(errormsg)
        else:
            blob = Blob(key=key, objtype=objtype, uid=uid, obj=obj)
        self.set(key=key, obj=blob)
        if self.verbose: print('DataStore: Blob "%s" saved' % key)
        return key
    
    
    def loadblob(self, key=None, objtype=None, uid=None, forcetype=None, die=None):
        ''' Load a blob from the datastore '''
        if die is None: die = True
        key = self.getkey(key=key, objtype=objtype, uid=uid, forcetype=forcetype)
        blob = self.get(key)
        if die: self._checktype(key, blob, 'Blob')
        if isinstance(blob, Blob):
            obj = blob.load()
            if self.verbose: print('DataStore: Blob "%s" loaded' % key)
            return obj
        else:
            if self.verbose: print('DataStore: Blob "%s" not found' % key)
            return None
    
    
    def saveuser(self, user, overwrite=True, forcetype=None, die=None):
        '''
        Add a new or update existing User in Redis, returns key.
        '''
        if die is None: die = True
        key, objtype, username = self.getkey(objtype='user', uid=user.username, fulloutput=True, forcetype=forcetype)
        olduser = self.get(key)
        if olduser and not overwrite:
            errormsg = 'DataStore: User %s already exists, not overwriting' % key
            if die: raise Exception(errormsg)
            else:   print(errormsg)
        else:
            self._checktype(key, user, 'User')
            self.set(key=key, obj=user)
            if self.verbose:
                if olduser: print('DataStore: User "%s" updated' % key)
                else:       print('DataStore: User "%s" created' % key)
        return key
    
    
    def loaduser(self, username=None, key=None, forcetype=None, die=None):
        ''' Load a user from Redis '''
        if die is None: die = True
        key = self.getkey(key=key, objtype='user', uid=username, forcetype=forcetype)
        user = self.get(key)
        if die: self._checktype(key, user, 'User')
        if isinstance(user, User):
            if self.verbose: print('DataStore: User "%s" loaded' % key)
            return user
        else:
            if self.verbose: print('DataStore: User "%s" not found' % key)
            return None
        
    
    def savetask(self, task, key=None, uid=None, overwrite=None, forcetype=None):
        '''
        Add a new or update existing Task in Redis, returns key.
        '''
        if overwrite is None: overwrite = True
        key, objtype, uid = self.getkey(key=key, objtype='task', uid=uid, obj=task, fulloutput=True, forcetype=forcetype)
        oldtask = self.get(key)
        if oldtask and not overwrite:
            errormsg = 'DataStore: Task %s already exists' % key
            raise Exception(errormsg)
        else:
            self._checktype(key, task, 'Task')
            self.set(key=key, obj=task)
        if self.verbose: print('DataStore: Task "%s" saved' % key)
        return key
    
    
    def loadtask(self, key=None, uid=None, forcetype=None, die=None):
        ''' Load a user from Redis '''
        if die is None: die = False # Here, we won't always know whether the task exists
        key = self.getkey(key=key, objtype='task', uid=uid, forcetype=forcetype)
        task = self.get(key)
        if die: self._checktype(key, task, 'Task')
        if isinstance(task, Task):
            if self.verbose: print('DataStore: Task "%s" loaded' % key)
            return task
        else:
            if self.verbose: print('DataStore: Task "%s" not found' % key)
            return None



class RedisDataStore(BaseDataStore):
    """
    DataStore backed by Redis.
    
    :param redisargs: Arguments passed to the Redis constructor
    """

    def __init__(self, url=None, redisargs=None, *args, **kwargs):

        # Handle arguments to Redis (or lack thereof)
        if redisargs is None: 
            redisargs = {}
        
        # Handle the Redis URL
        default_url = 'redis://127.0.0.1:6379/'  # The default URL for the Redis database
        if not url:            url = default_url + '0' # e.g. sw.DataStore()
        elif sc.isnumber(url): url = default_url + '%i'%url # e.g. sw.DataStore(3)
        self.url = url
        self.redis = redis.StrictRedis.from_url(self.url, **redisargs)

        # Finish construction
        if six.PY2:
            super(RedisDataStore, self).__init__(*args, **kwargs)
        else:
            super().__init__(*args, **kwargs)
        return None
    

    ### DEFINE MANDATORY FUNCTIONS

    def __repr__(self):
        return '<RedisDataStore at %s with temp folder %s>' % (self.url, self.tempfolder)

    def _set(self, key, objstr):
        if six.PY3:
            key = key.encode()
        return self.redis.set(key, objstr)


    def _get(self, key):
        ''' Alias to redis.get() '''
        if six.PY3:
            key = key.encode()
        return self.redis.get(key)


    def _delete(self, key):
        self.redis.delete(key)
        return None


    def _flushdb(self):
        self.redis.flushdb()
        return None
        

    def _keys(self):
        keys = list(self.redis.keys())
        if six.PY3:
            keys = [x.decode() for x in keys]
        return keys


    ### OVERLOAD ADDITIONAL METHODS WITH REDIS BUILT-INS

    def keys(self, pattern=None):
        """
        Filter keys in redis to increase performance

        :param pattern:
        :return:
        """
        if pattern is None: pattern = '*'
        keys = list(self.redis.keys(pattern=pattern))
        if six.PY3:
            keys = [x.decode() for x in keys]
        return keys


    def exists(self, key):
        """
        Use Redis built-in exists function
        """
        output = self.redis.exists(key)
        return bool(output)



class SQLDataStore(BaseDataStore):
    """
    DataStore backed by SQLAlchemy/SQL
    """

    def __init__(self, url, sqlargs=None, *args, **kwargs):
        
        if sqlargs is None:
            sqlargs = {}

        if url is not None:
            self.url = url
        else:
            errormsg = 'To create an SQL DataStore, you must supply the URL'
            raise Exception(errormsg)

        # Define the internal class that is mapped to the SQL database
        from sqlalchemy.ext.declarative import declarative_base
        Base = declarative_base()

        class SQLBlob(Base):
            __tablename__ = 'datastore'
            key = sqlalchemy.Column('key', sqlalchemy.types.String(length=max_key_length), primary_key=True)
            content = sqlalchemy.Column('blob', sqlalchemy.types.LargeBinary)
        self.datatype = SQLBlob  # The class to use when interfacing with the database

        # Create the database
        self.engine = sqlalchemy.create_engine(self.url, **sqlargs)
        Base.metadata.create_all(self.engine)
        self.get_session = sqlalchemy.orm.session.sessionmaker(bind=self.engine)

        # Finish construction
        if six.PY2:
            super(SQLDataStore, self).__init__(*args, **kwargs)
        else:
            super().__init__(*args, **kwargs)
        return None


    ### DEFINE MANDATORY FUNCTIONS

    def __repr__(self):
        return '<SQLDataStore (%s) with temp folder %s>' % (self.url, self.tempfolder)


    def _set(self, key, objstr):
        session = self.get_session()
        obj = session.query(self.datatype).get(key)
        if obj is None:
            obj = self.datatype(key=key, content=objstr)
            session.add(obj)
        else:
            obj.content = objstr
        session.commit()
        session.close()
        return None


    def _get(self, key):
        session = self.get_session()
        obj = session.query(self.datatype).get(key)
        session.close()
        if obj is None:
            return None
        else:
            return obj.content


    def _delete(self, key):
        session = self.get_session()
        session.query(self.datatype).filter(self.datatype.key==key).delete()
        session.commit()
        session.close()
        return None


    def _flushdb(self):
        # Flush DB by dropping table - this allows the table schema to be changed
        # when the datastore is next instantiated
        self.datatype.__table__.drop(self.engine)
        self.engine.dispose()
        return None
    

    def _keys(self):
        session = self.get_session()
        keys = session.query(self.datatype.key).all() # Get all the keys
        session.close()
        return [x[0] for x in keys]



class FileDataStore(BaseDataStore):
    """
    DataStore backed by file-system storage

    WARNING - this backend may encounter errors if the files become locked by
    the OS due to another program using them (including another thread)
    """
    def __init__(self, url=None, suffix=None, prefix=None, dir=None, *args, **kwargs):
        
        if url is None: # It's not supplied, make a temporary folder
            self.path = tempfile.mkdtemp(suffix=suffix, prefix=prefix, dir=dir) # Try to create a temporary directory
        else: # It's supplied, make sure it's in the right format
            self.path = os.path.abspath(url.replace('file://','')) + os.path.sep
            if not os.path.exists(self.path):
                os.makedirs(self.path)

        if six.PY2:
            super(FileDataStore, self).__init__(*args, **kwargs)
        else:
            super().__init__(*args, **kwargs)
        return None


    ### DEFINE MANDATORY FUNCTIONS

    def __repr__(self):
        return '<FileDataStore (%s) with temp folder %s>' % (self.path, self.tempfolder)


    def _set(self, key, objstr):
        with open(self.path + key,'wb') as f:
            f.write(objstr)
        return None


    def _get(self, key):
        if os.path.exists(self.path + key):
            with open(self.path + key,'rb') as f:
                objstr = f.read()
            return objstr
        else:
            return None


    def _delete(self, key):
        if os.path.exists(self.path + key):
            os.remove(self.path + key)
        return None


    def _flushdb(self):
        shutil.rmtree(self.path)
        os.mkdir(self.path)
        return None


    def _keys(self):
        keys = os.listdir(self.path)
        return keys


    ### OVERLOAD ADDITIONAL METHODS WITH FILE SYSTEM BUILT-INS

    def exists(self, key):
        return os.path.exists(self.path + key)


class DataDir(sc.prettyobj):
    ''' Alongside/instead of a DataStore, simply create a temporary folder to store essentials (e.g. uploaded files) '''
    
    def __init__(self, die=False, *args, **kwargs):
        try:
            if six.PY2: # Python 2
                self.tempfolder = tempfile.mkdtemp(*args, **kwargs) # If no datastore, try to create a temporary directory
                self.tempdir_obj = None
            else: # Python 3
                self.tempdir_obj = tempfile.TemporaryDirectory(*args, **kwargs) # If no datastore, try to create a temporary directory
                self.tempfolder = self.tempdir_obj.name # Save an alias to the directory name to match the DataStore object
                atexit.register(self.tempdir_obj.cleanup) # Only register this if we've just created the temp folder
        except:
            exception = traceback.format_exc() # Grab the trackback stack
            errormsg = 'Could not create temporary folder: %s' % exception
            self.tempfolder = errormsg # Store the error message in lieu of the folder name
            if die: raise Exception(errormsg)
            else:   print(errormsg) # Try to proceed if no datastore and the temporary directory can't be created
        return None