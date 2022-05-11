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
     """  Define some nondefaults for the app  """
     TESTING=True
     USE_USERS = True
     USE_DATASTORE = True
     DATASTORE_URL = f'sqlite:///:memory:'
     REGISTER_AUTOACTIVATE = True # Otherwise user register fails


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


def test_user_register(app):
    sw.make_default_users(app, include_admin=True)

    with app.flask_app.app_context():
        admin_user = sw.load_user(username='admin')
        response_admin = sw.user_register(admin_user.username, admin_user.password,
                                          admin_user.displayname, admin_user.email
                                          )

        response_gremlin  = sw.user_register('gremlin', 'Banana',
                                         'gremlin', 'scirisweb@gremlinmail.com'
                                          )

    # We already created and saved admin
    assert not response_admin == 'success'
    assert response_gremlin == 'success'


def test_make_default_users(app):
    """ Test default users including admin"""
    sw.make_default_users(app, include_admin=True)
    with app.flask_app.app_context():
        # Load admin
        admin_user = sw.load_user(username='admin')
        assert admin_user.is_admin == True


def test_jsonify():
    """ Test JSON representation"""
    user = sw.User()
    output = user.jsonify()
    output_json = sc.sanitizejson(output['user'], tostring=True)
    assert isjson(output_json) == True
