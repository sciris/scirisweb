"""
test_users.py -- test module for sw_users.py
"""

import os
import pytest
import sciris as sc
import scirisweb as sw

# Define some nondefaults for the app
class TestingUsersConfig(object):
     USE_USERS = True
     USE_DATASTORE = True
     DATASTORE_URL = f'sqlite:///:memory:'

def make_app():
    app = sw.ScirisApp(__name__, config=TestingUsersConfig(), name='test_users_app')
    return app


@pytest.fixture(name='app')
def app():
    return make_app()


def test_new_user(app):
    """
    Create a new User and then check email, and that password is encrypted
    """
    user = sw.User(username='gremlin', email='scirisweb@gremlinmail.com', raw_password='SudoMakeMeASandwich')
    print(user)
    assert user.email == 'scirisweb@gremlinmail.com'
    assert user.is_admin == False

    # Save
    with app.flask_app.app_context():
        sw.save_user(user)
        loaded_user = sw.load_user(username='gremlin')
        loaded_user = app.datastore.loaduser(username='gremlin')
        assert user.username == loaded_user.username


