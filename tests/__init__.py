import scirisweb as sw
import unittest
import hashlib
import os

class TestScirisWebBase(unittest.TestCase):

    @classmethod
    def loginIfNot(cls):
        response = cls.client.post('/rpcs', data={
            "funcname": "get_current_user_info"
        })
        if response.status_code == 200:
            return 

        demo_user_password_hash = hashlib.sha224("demo".encode('utf-8')).hexdigest()
        response = cls.client.post('/rpcs', data={
            "funcname": "user_register",
            "args": ["demo", demo_user_password_hash, "1", "1"]
        })

        response = cls.client.post('/rpcs', data={
            "funcname": "user_login",
            "args": ["demo", demo_user_password_hash]
        })

    @classmethod
    def tearDownClass(cls):
        cls.app.datastore.flushdb()

    @classmethod
    def setUpClass(cls):
        cls.RPC_dict = {} 

        cls.RPC = sw.RPCwrapper(cls.RPC_dict)

        config = {
            'USE_DATASTORE': True,
            'USE_USERS': True,
            'USE_TASKS': True,
            'REDIS_URL': os.environ.get('REDIS_TEST_URL'),
            'REGISTER_AUTOACTIVATE': True
        }
        config["CELERY_TASK_ALWAYS_EAGER"] = True
        config["CELERY_TASK_EAGER_PROPAGATES"] = True

        cls.app = sw.ScirisApp(
            __name__, 
            name="test",
            config=config,
            RPC_dict=cls.RPC_dict
        )
        cls.app.flask_app.config["TESTING"] = True
        cls.client = cls.app.flask_app.test_client()

        # always eager so we can test without running the celery server
        cls.celery_instance = sw.make_celery(config=config)
