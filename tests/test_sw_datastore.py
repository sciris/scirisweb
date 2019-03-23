import scirisweb as sw
import unittest
import os
import sciris as sc

class TestDataStore(unittest.TestCase):

    def setUp(self):
        self.key_in = 'testkey'

        self.ds = sw.DataStore(
            redis_url=os.environ.get('REDIS_TEST_URL'), 
            verbose=True
        )

    def test_001_data_in_out(self):
        data_in = sc.odict({'foo':[1,2,3], 'bar':[4,5,6]})
        key_out = self.ds.saveblob(obj=data_in, key=self.key_in)

        data_out = self.ds.loadblob(self.key_in)

        self.assertEqual(data_out, data_in)
        self.assertEqual(self.key_in, key_out)

    def test_002_delete_present_key(self):
        result = self.ds.delete(self.key_in)
        self.assertEqual(result, 1)

    def test_003_delete_missing_key(self):
        result = self.ds.delete(self.key_in+'foo')
        self.assertEqual(result, 0)
