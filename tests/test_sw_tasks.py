import sciris as sc
import hashlib
import json
import scirisweb as sw
import os
from . import TestScirisWebBase

class TestScirisWebTask(TestScirisWebBase):

    def setUp(self):
        self.loginIfNot()

        task_func_dict = {}
        async_task = sw.taskwrapper(task_func_dict)
        self.task_id = "testing_123"
        
        @async_task
        def run_update_key():
            return 10
            """
            key_in = "10"
            self.ds = sw.DataStore(
                redis_url=os.environ.get('REDIS_TEST_URL'), 
                verbose=True
            )
            data_in = sc.odict({'foo':[1,2,3], 'bar':[4,5,6]})
            key_out = self.ds.saveblob(obj=data_in, key=key_in)

            data_out = self.ds.loadblob(key_in)

            self.assertEqual(data_out, data_in)
            self.assertEqual(key_in, key_out)
            """

        sw.add_task_funcs(task_func_dict)


    def test_001_launch_task(self):
        response = self.client.post('/rpcs', data={
            "funcname": "launch_task",
            "args": [
                self.task_id,  
                "run_update_key"
            ]
        })
        got = json.loads(response.data)
        self.assertEqual(response.status_code, 200)

        self.assertIn("task", got.keys())
        self.assertEqual(got.get("task").get("UID"), self.task_id)
        self.assertEqual(got.get("task").get("taskId"), self.task_id)
        self.assertEqual(got.get("task").get("status"), "queued")
        self.assertEqual(got.get("task").get("funcName"), "run_update_key")

    def test_002_check_task(self):
        response = self.client.post('/rpcs', data={
            "funcname": "check_task",
            "args": [
                self.task_id,  
            ]
        })
        got = json.loads(response.data)
        self.assertEqual(response.status_code, 200)

        self.assertIn("task", got.keys())
        self.assertEqual(got.get("task").get("UID"), self.task_id)
        self.assertEqual(got.get("task").get("taskId"), self.task_id)
        self.assertEqual(got.get("task").get("status"), "queued")
        self.assertEqual(got.get("task").get("funcName"), "run_update_key")
