"""
test_tasks.py -- test module for sw_tasks.py
"""

import os
import pytest
import sciris as sc
import scirisweb as sw


def make_app():
    app = sw.ScirisApp(__name__, config=sw.TestingTasksAppConfig(), name='test_tasks_app')
    return app


@pytest.fixture(name='app')
def app():
    return make_app()


def test_misc(app):
    ds = sw.get_datastore(config=app.config)
    assert ds.url == app.datastore.url
