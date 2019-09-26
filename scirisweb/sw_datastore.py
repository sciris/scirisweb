"""
datastore.py -- code related to Sciris database persistence
    
Last update: 2018sep20
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
import redis
import sqlalchemy
import sciris as sc
from .sw_users import User
from .sw_tasks import Task
import re

class PickleError(Exception):
    """
    This error gets raised if a blob in the datastore could not be unpickled
    """
    pass

# Global variables
default_settingskey = '!DataStoreSettings'      # Key for holding DataStore settings
default_separator   = '::'                     # Define the separator between a key type and uid


#################################################################
### Classes
#################################################################

__all__ = ['Blob', 'DataStoreSettings', 'DataStore', 'DataDir']


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


class DataStore(sc.prettyobj):

    @staticmethod
    def create(uri, *args, **kwargs):
        """
        Create datastore

        This method examines the datastore URI and instantiates the appropriate
        derived class

        :param uri: Datastore URI/URL/locator
        :param args: Arguments to pass to constructors (for derived type and DataStore itself)
        :param kwargs: Arguments to pass to constructors (for derived type and DataStore itself)
        :return: A DataStore of the appropriate derived type for the requested URI

        """

        if uri.startswith('redis:'):
            return RedisDataStore(uri, *args, **kwargs)
        elif uri.startswith('disk:'):
            return DiskDataStore(uri, *args, **kwargs)
        else:
            # nb. SQLDataStore needs to support any SQLAlchemy backend e.g. mssql, postgres, sqlite
            # so there are many possible URIs
            return SQLDataStore(uri, *args, **kwargs)

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


    def _set(self, key:str , objstr:str) -> None:
        """
        Store string content under key

        :param key:
        :return:
        """
        pass


    def _get(self, key:str) -> str:
        """
        Return blob content as string

        :param self:
        :param key:
        :return:
        """
        pass


    def _delete(self, key: str) -> None:
        """
        Remove entry from database

        :param self:
        :param key:
        :return:
        """
        pass


    def _flushdb(self) -> None:
        """
        Clear all content from the datastore
        """
        pass


    def _keys(self) -> list:
        """
        Return all keys in datastore
        """
        pass


    ### STANDARD DATASTORE FUNCTIONALITY

    def set(self, key=None, obj=None, objtype=None, uid=None) -> None:
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


    def get(self, key=None, obj=None, objtype=None, uid=None, notnone=False, die=False) -> Blob:
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


    def delete(self, key=None, obj=None, objtype=None, uid=None, die=None) -> None:
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


    def exists(self, key: str) -> bool:
        """
        Return True if key exists in the datastore

        Can overload this if the specific datastore implements
        a faster method for checking

        :param key:
        :return: True if the key exists, False otherwise

        """

        objstr = self._get(key)
        return objstr is not None


    def flushdb(self) -> None:
        self._flushdb()
        if self.verbose: print('DataStore flushed.')


    def keys(self, pattern=None) -> list:
        """
        Return filtered list of keys

        :param pattern:
        :return:
        """
        keys = self._keys()
        if pattern is not None:
            # Filter the keys
            pattern = re.compile(pattern)
            keys = [x for x in keys if pattern.search(x)]
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
        if not os.path.exists(self.tempfolder):
            os.makedirs(self.tempfolder)
            atexit.register(self._rmtempfolder) # Only register this if we've just created the temp folder
        
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

        if len(final['key']) > 255:
            raise Exception('Key is too long!') # Cliff - it might be safe to just truncate the key since the UUID appears within the first 50 or so characters?

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


class RedisDataStore(DataStore):
    """
    DataStore backed by Redis
    """

    def __init__(self, redis_url=None, *args, **kwargs):

        # Handle the Redis URL
        default_url = 'redis://127.0.0.1:6379/'  # The default URL for the Redis database
        if not redis_url:            redis_url = default_url + '0' # e.g. sw.DataStore()
        elif sc.isnumber(redis_url): redis_url = default_url + '%i'%redis_url # e.g. sw.DataStore(3)
        self.redis_url = redis_url
        self.redis = redis.StrictRedis.from_url(self.redis_url)

        # Finish construction
        super().__init__(*args, **kwargs)

    ### DEFINE MANDATORY FUNCTIONS

    def __repr__(self):
        return '<RedisDataStore at %s with temp folder %s>' % (self.redis_url, self.tempfolder)

    def _set(self, key, objstr):
        self.redis.set(key, objstr)


    def _get(self, key):
        ''' Alias to redis.get() '''
        return self.redis.get(key)


    def _delete(self, key):
        self.redis.delete(key)


    def _flushdb(self):
        output = self.redis.flushdb()


    def _keys(self) -> list:
        return list(self.redis.keys())

    ### OVERLOAD ADDITIONAL METHODS WITH REDIS BUILT-INS

    def keys(self, pattern=None) -> list:
        """
        Filter keys in redis to increase performance

        :param pattern:
        :return:
        """
        if pattern is None: pattern = '*'
        output = list(self.redis.keys(pattern=pattern))
        return output


    def exists(self, key: str) -> bool:
        """
        Use Redis built-in exists function
        """

        output = self.redis.exists(key)
        return bool(output)


class SQLDataStore(DataStore):
    """
    DataStore backed by SQLAlchemy/SQL
    """
    pass

    def __init__(self, uri=None, *args, **kwargs):

        if uri is None:
            uri = 'sqlite:///:memory:' # Simple in-memory sqlite storage. Note that this will automatically be cleared when the program closes
        self.uri = uri

        # Define the internal class that is mapped to the SQL database
        from sqlalchemy.ext.declarative import declarative_base
        Base = declarative_base()

        class SQLBlob(Base):
            __tablename__ = 'datastore'
            key = sqlalchemy.Column('key', sqlalchemy.types.String(length=255), primary_key=True)
            content = sqlalchemy.Column('blob', sqlalchemy.types.LargeBinary)
        self.datatype = SQLBlob  # The class to use when interfacing with the database

        # Create the database
        engine = sqlalchemy.create_engine(self.uri)
        Base.metadata.create_all(engine)
        self.get_session = sqlalchemy.orm.session.sessionmaker(bind=engine)

        # Finish construction
        super().__init__(*args, **kwargs)


    ### DEFINE MANDATORY FUNCTIONS

    def __repr__(self):
        return '<SQLDataStore (%s) with temp folder %s>' % (self.uri, self.tempfolder)

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


    def _flushdb(self):
        session = self.get_session()
        session.query(self.datatype).delete()
        session.commit()
        session.close()
        if self.verbose: print('DataStore flushed.')


    def _keys(self):
        session = self.get_session()
        keys = session.query(self.datatype.key).all() # Get all the keys
        session.close()
        return keys



class DiskDataStore(DataStore):
    """
    DataStore backed by file-system storage
    """

    def __init__(self, uri, *args, **kwargs):
        self.path = os.path.abspath(uri.replace('disk:','')) + os.path.sep
        if not os.path.exists(self.path):
            os.makedirs(self.path)
        super().__init__(*args, **kwargs)

    ### DEFINE MANDATORY FUNCTIONS

    def __repr__(self):
        return '<DiskDataStore (%s) with temp folder %s>' % (self.path, self.tempfolder)


    def _set(self, key, objstr):
        with open(self.path + key,'wb') as f:
            f.write(objstr)


    def _get(self, key):
        if os.path.exists(self.path + key):
            with open(self.path + key,'rb') as f:
                objstr = f.read()
            return objstr
        else:
            return None


    def _delete(self, key):
        os.remove(self.path + key)


    def _flushdb(self):
        shutil.rmtree(self.path)
        os.mkdir(self.path)


    def _keys(self) -> list:
        keys = os.listdir(self.path)
        return keys


    ### OVERLOAD ADDITIONAL METHODS WITH FILE SYSTEM BUILT-INS

    def exists(self, key: str) -> bool:
        os.path.exists(self.path + key)


class DataDir(sc.prettyobj):
    ''' In lieu of a DataStore, simply create a temporary folder to store essentials (e.g. uploaded files) '''
    
    def __init__(self):
        try:
            if six.PY2: # Python 2
                self.tempfolder = tempfile.mkdtemp() # If no datastore, try to create a temporary directory
                self.tempdir_obj = None
            else: # Python 3
                self.tempdir_obj = tempfile.TemporaryDirectory() # If no datastore, try to create a temporary directory
                self.tempfolder = self.tempdir_obj.name # Save an alias to the directory name to match the DataStore object
                atexit.register(self.tempdir_obj.cleanup) # Only register this if we've just created the temp folder
        except:
            exception = traceback.format_exc() # Grab the trackback stack
            errormsg = 'Could not create temporary folder: %s' % exception
            self.tempfolder = errormsg # Store the error message in lieu of the folder name
            print(errormsg) # No point trying to proceed if no datastore and the temporary directory can't be created