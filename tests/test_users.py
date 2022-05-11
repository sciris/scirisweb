"""
test_users.py -- test module for sw_users.py
"""

import os
import pytest
import sciris as sc
import scirisweb as sw



def test_new_user():
    """
    Create a new User and then check email, and that password is encrypted
    """
    user = sw.User(username='gremlin', email='scirisweb@gremlinmail.com', raw_password='SudoMakeMeASandwich')
    assert user.email == 'scirisweb@gremlinmail.com'
    assert user.password != user.raw_password
    assert user.is_admin == False

if __name__ == '__main__':
    # Test user stuff
    test_new_user()
