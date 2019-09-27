"""
test_datastore.py -- test module for sc_datastore.py
"""

import sciris as sc
import scirisweb as sw
import pytest

uris = ['sqlite:///datastore.db', 'file://./test_datastore/']

# Some examples of other URIS
# uris += [
# 'redis://127.0.0.1/3',
# 'sqlite://',
# 'mssql+pyodbc:///?odbc_connect=DRIVER%3D%7BODBC+Driver+13+for+SQL+Server%7D%3BSERVER%3D127.0.0.1%3BDATABASE%3Dtestdb%3BUID%3Dusername%3BPWD%3Dpassword%3B',
# 'postgresql+psycopg2://username:password@localhost:5432/testdb',
# 'mysql+pymysql://username:password@localhost:3306/testdb?charset=utf8mb4&binary_prefix=true',
# ]

@pytest.mark.parametrize('uri', uris)
def test_datastore(uri):

    # Reset the database (check flushing works)
    ds = sw.datastore(uri)
    ds.flushdb()
    ds = sw.datastore(uri)
    assert len(ds.keys()) == 1 # There should be a datastore settings key present

    # Basic CRUD functionality

    # CREATE
    key_in   = 'testkey'
    data_in  = sc.odict({'foo':[1,2,3], 'bar':[4,5,6]})
    key_out  = ds.saveblob(obj=data_in, key=key_in)

    # READ
    data_out = ds.loadblob(key_in)
    assert key_in  == key_out
    assert data_in == data_out
    assert ds.get('nonexistent') is None
    with pytest.raises(KeyError):
        ds.get('nonexistent', notnone=True)

    # UPDATE
    data_in['foo'][0] = 2
    ds.saveblob(obj=data_in, key=key_in) # This should result in an in-place update
    data_out = ds.loadblob(key_in)
    assert data_out['foo'][0] == 2

    # DELETE
    ds.delete(key_in)
    assert 'foo' not in ds.keys()  # Check it was successfully deleted
    ds.delete('nonexistent')  # If a key doesn't exist, an error should not occur

    # TEST KEY LISTING AND FILTERING
    ds.saveblob(obj='teststr', key='foo')
    ds.saveblob(obj='teststr', key='bar')
    assert {'foo','bar'}.issubset(set(ds.keys()))
    assert set(ds.keys('f*')) == {'foo'}
    assert set(ds.keys('bar')) == {'bar'}

    # TEST EXISTENCE
    assert ds.exists('foo')
    assert not ds.exists('nonexistent')

if __name__ == '__main__':
    for uri in uris:
        test_datastore(uri)
