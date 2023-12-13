"""
test_datastore.py -- test module for sw_datastore.py
"""

import os
import shutil
import pytest
import sciris as sc
import scirisweb as sw

db_file = 'datastore.db'
db_folder = './temp_test_datastore'

sql_url = f'sqlite:///{db_file}'
file_url = f'file://{db_folder}/'

urls = [sql_url, file_url]

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

    ds.flushdb()
    ds = sw.make_datastore(url)
    assert len(ds.keys()) == 1

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
    assert not {'foo'} in ds.keys()  # Check it was successfully deleted
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

    # Manually flush default redis ds if any test fails before reaching this point
    # redis.cli -h 127.0.0.1 -p 6379 FLUSHALL
    ds.flushdb()

    # Tidy up
    cleanup = {db_file:os.remove, db_folder:shutil.rmtree}
    for fn,func in cleanup.items():
        try:
            func(fn)
            print('Removed %s' % fn)
        except:
            pass


def test_copy_datastore():
    src_name = 'datastore_src.db'
    dst_name = 'datastore_dst.db'
    src_url = f'sqlite:///{src_name}'
    dst_url = f'sqlite:///{dst_name}'

    # Make source datastore
    src_ds = sw.make_datastore(src_url)
    # Save some data
    src_ds.saveblob(obj='teststr', key='foo')
    # Copy
    dst_ds = sw.copy_datastore(src_ds.url, dst_url)
    assert {'foo'}.issubset(set(dst_ds.keys()))

    # Tidy up
    cleanup = {src_name: os.remove, dst_name: os.remove}
    for fn, func in cleanup.items():
        try:
            func(fn)
            print('Removed %s' % fn)
        except:
            pass


def test_misc():
    ds = sw.make_datastore(file_url)
    # Save some data
    ds.saveblob(obj='teststr', key='foo')
    # Try to save the same object again
    with pytest.raises(Exception):
        ds.saveblob(obj='teststr', key='foo', overwrite=False)

    # Load an object that does not exist
    with pytest.raises(Exception):
        ds.loadblob(key='bar', objtype='Unknown')

    with pytest.raises(Exception):
        ds.loadblob(key='bar')

    my_task = sw.Task(42)
    ds.savetask(my_task, key='my_task')

    load_task = ds.loadtask(key='my_task')
    assert my_task.uid == load_task.uid

    ds.flushdb()
    ds.delete()


if __name__ == '__main__':
    for url in urls:
        test_datastore(url)
    test_misc()
    test_copy_datastore()

