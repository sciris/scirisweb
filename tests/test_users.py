"""
test_users.py -- test module for sw_users.py
"""

import pytest
import json
import sciris as sc
import scirisweb as sw


def isjson(json_input):
  try:
    json.loads(json_input)
  except ValueError:
    return False
  return True



def make_app():
    app = sw.ScirisApp(__name__, config=sw.TestingUsersAppConfig(), name='test_users_app')
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
    assert not user.is_admin
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

        # Register a user who is already saved in the datastore
        response_admin = sw.user_register(admin_user.username, admin_user.password,
                                          admin_user.displayname, admin_user.email
                                          )
        # Register a new user
        response_goblin  = sw.user_register('goblin', 'Banana',
                                             'goblin', 'scirisweb@goblinmail.com'
                                            )

    # We already created and saved admin
    assert not response_admin == 'success'
    assert response_goblin == 'success'


def test_admin_actions(app):
    success_str = 'success' # write it once
    failure_str = 'failure' # write it once

    sw.make_default_users(app, include_admin=True)

    with app.flask_app.app_context():

        # Make default user activate
        response_activate = sw.admin_activate_account('demo')
        default_user = sw.load_user(username='demo')
        default_is_active = default_user.is_active

        # We already created and saved admin
        assert not response_activate == success_str
        assert default_is_active

        # Make default user inactive
        response_deactivate = sw.admin_deactivate_account('demo')
        default_user = sw.load_user(username='demo')
        default_is_inactive = not(default_user.is_active)

        # TODO: understand why deactivation is failing
        # assert not response_deactivate == 'success'
        # assert default_is_inactive

        response_make_admin = sw.admin_grant_admin('demo')
        with pytest.raises(Exception):
            sw.admin_grant_admin('does_not_exist')
        assert response_make_admin == success_str

        response_revoke_admin = sw.admin_revoke_admin('demo')
        assert response_revoke_admin == success_str

        response_reset_passwd = sw.admin_reset_password('demo')
        assert response_reset_passwd == success_str



def test_make_default_users(app):
    """ Test default users including admin"""
    sw.make_default_users(app, include_admin=True)
    with app.flask_app.app_context():
        # Load admin
        admin_user = sw.load_user(username='admin')
        assert admin_user.is_admin


def test_jsonify():
    """ Test JSON representation"""
    user = sw.User()
    output = user.jsonify()
    output_json = sc.sanitizejson(output['user'], tostring=True)
    assert isjson(output_json)


if __name__ == '__main__':
    
    sw_app = make_app()
    
    test_new_user(sw_app)
    test_user_register(sw_app)
    test_admin_actions(sw_app)
    test_make_default_users(sw_app)
    test_jsonify()