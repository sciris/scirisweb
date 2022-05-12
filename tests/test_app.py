"""
test_app.py -- test module for sw_app.py
"""

import os
import pytest
import sciris as sc
import scirisweb as sw



def make_app():
    app = sw.ScirisApp(__name__, config=sw.TestingUsersAppConfig(), name='test_app')
    return app


@pytest.fixture(name='app')
def app():
    return make_app()


def test_update_config(app):

    update_dict = dict(SERVER_PORT=8888)
    app._update_config_defaults(**update_dict)
    # Check that updates were made
    assert app.config['SERVER_PORT'] == 8888


def test_defaults():

    app = sw.ScirisApp(__name__, config=sw.TestingUsersAppConfig())
    assert app.name == 'default'

    app = sw.ScirisApp(__name__, config=sw.Config())
    assert isinstance(app.datastore, sw.DataDir)


def test_logfile():

    logfile = 'temp_logfile.log'
    app = sw.ScirisApp(__name__, config=sw.Config(), logfile=logfile)
    os.remove(logfile)

    ds = sw.DataDir()
    with pytest.raises(Exception) as e:
        app = sw.ScirisApp(__name__, config=sw.Config(), logfile=ds.tempdir_obj.name)


def test_robustjsonify(app):

    info = {"data1": "Hello world",
            "data2": "Good morning",
            "data3": "See you tomorrow"}

    with app.flask_app.app_context():
        response = sw.robustjsonify(info)
        assert response.status_code == 200
        assert response.is_json == True


