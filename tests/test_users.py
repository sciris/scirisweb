"""
test_users.py -- test module for sw_users.py
"""

import os
import pytest
import json
import sciris as sc
import scirisweb as sw


def isjson(json_input):
  try:
    json.loads(json_input)
  except ValueError as e:
    return False
  return True


class TestingUsersConfig(object):
     """ # Define some nondefaults for the app  """
     TESTING=True
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
    Create a new User and then check email, whther the user is admin (it should not by default)
    """
    user = sw.User(username='gremlin', email='scirisweb@gremlinmail.com', raw_password='SudoMakeMeASandwich')

    # Check a few basic things about user
    assert user.email == 'scirisweb@gremlinmail.com'
    assert user.is_admin == False
    assert user.get_id() == user.username

    with app.flask_app.app_context():
        # Save and load the new users we just made
        sw.save_user(user)
        loaded_user = sw.load_user(username='gremlin')
        assert user.username == loaded_user.username


def test_make_default_users(app):
    """ Test """
    sw.make_default_users(app, include_admin=True)


# def test_jsonify():
#     """ Test JSON representation"""
# pass
