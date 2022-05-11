"""
test_app.py -- test module for sw_app.py
"""

import os
import shutil
import pytest
import sciris as sc
import scirisweb as sw



def test_update_config(app):

    # Update default configuration
    app.config['SERVER_PORT'] = 8888
    app.config['USE_DATASTORE'] = True
    app.config['MATPLOTLIB_BACKEND'] = 'qtagg'

    # Check that updates were made
    assert app.config['SERVER_PORT'] == 8888
    assert app.config['USE_DATASTORE'] == True
    assert app.config['MATPLOTLIB_BACKEND'] == 'qtagg'


if __name__ == '__main__':
    # Make default app
    sw_app = sw.ScirisApp(__name__, name="test_app")
    test_update_config(sw_app)
