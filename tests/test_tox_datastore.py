"""
test_datastore.py -- test module for sc_datastore.py
"""

import sciris as sc
import scirisweb as sw
import pytest

urls = ['sqlite:///datastore.db', 'file://./test_datastore/']

# Some examples of other URIS
# urls += [
# 'redis://127.0.0.1/3',
# 'sqlite://',
# 'mssql+pyodbc:///?odbc_connect=DRIVER%3D%7BODBC+Driver+13+for+SQL+Server%7D%3BSERVER%3D127.0.0.1%3BDATABASE%testdb%3BUID%3Dtest%3BPWD%3Dtest%3B',
# 'postgresql+psycopg2://test:test@localhost:5432/testdb',
# 'mysql+pymysql://test:test@localhost:3306/testdb?charset=utf8mb4&binary_prefix=true',
# ]

@pytest.mark.parametrize('url', urls)
def test_datastore(url):

    # Reset the database (check flushing works)
    ds = sw.make_datastore(url)
    ds.flushdb()
    ds = sw.make_datastore(url)
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
    for url in urls:
        test_datastore(url)
