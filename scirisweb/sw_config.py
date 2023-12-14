"""
sw_appconfig.py -- classes for quick configuration of Sciris (Flask-based) apps

"""

__all__ = ['Config', 'DevelopmentAppConfig', 'TestingAppConfig', 'TestingUsersAppConfig', 'TestingTasksAppConfig']


class Config(object):
    TESTING = False


class DevelopmentAppConfig(Config):
    USE_DATASTORE = True
    DATASTORE_URL =f"sqlite:///datastore.db"


class TestingAppConfig(Config):
    """ Define some nondefaults for testing"""
    TESTING = True
    USE_DATASTORE = True
    DATASTORE_URL = 'sqlite:///:memory:'


class TestingUsersAppConfig(TestingAppConfig):
    """  Define some nondefaults parameters for test_users.py  """
    USE_USERS = True
    REGISTER_AUTOACTIVATE = True  # Otherwise user register fails


class TestingTasksAppConfig(TestingAppConfig):
    """  Define some nondefaults parameters for test_tasks.py  """
    USE_TASKS = True
