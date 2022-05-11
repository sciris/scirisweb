"""
test_users.py -- test module for sw_users.py
"""

import os
import pytest
import sciris as sc
import scirisweb as sw



@pytest.fixture(scope='module')
def make_ds():
    db_folder = 'temp_test_datastore_users'
    db_url = f'file://{db_folder}/'
    ds = sw.make_datastore(db_url)
    return ds


def test_new_user(ds):
    """
    Create a new User and then check email, and that password is encrypted
    """
    user = sw.User(username='gremlin', email='scirisweb@gremlinmail.com', raw_password='SudoMakeMeASandwich')
    assert user.email == 'scirisweb@gremlinmail.com'
    assert user.password != user.raw_password
    assert user.is_admin == False

    # Save user to datastore
    ds.saveuser(user)
    # Load user to datastore
    loaded_user = ds.loaduser(username='gremlin')
    assert user.username == loaded_user.username


if __name__ == '__main__':
    # Test user stuff
    test_new_user()
