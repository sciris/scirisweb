import scirisweb as sw
import json
import hashlib

from . import TestScirisWebBase

class TestScirisWebUser(TestScirisWebBase):

    def setUp(self):
        cls.password_hash = hashlib.sha224("somepassword".encode('utf-8')).hexdigest()
        cls.username = "joe" 

    def test_001_get_missing_user(self):
        response = self.client.post('/rpcs', data={
            "funcname": "get_current_user_info"
        })
        self.assertEqual(response.status_code, 401)

    def test_002_register_user(self):
        response = self.client.post('/rpcs', data={
            "funcname": "user_register",
            "args": [self.username, self.password_hash, "1", "1"]
        })
        self.assertEqual(response.status_code, 200)

    def test_003_login_user_wrong_pass(self):
        password_hash = hashlib.sha224("wrongpassword".encode('utf-8')).hexdigest()
        response = self.client.post('/rpcs', data={
            "funcname": "user_login",
            "args": [self.username, password_hash]
        })
        self.assertIn("Login failed", str(response.data))
        #NOTE should this status code be a 401 instead?
        self.assertEqual(response.status_code, 200)

    def test_004_login_user(self):
        response = self.client.post('/rpcs', data={
            "funcname": "user_login",
            "args": [self.username, self.password_hash]
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, b'"success"\n')

    def test_005_get_logged_in_user(self):
        response = self.client.post('/rpcs', data={
            "funcname": "get_current_user_info"
        })
        self.assertEqual(response.status_code, 200)
        got = json.loads(response.data)
        self.assertIn("user", got.keys())
        self.assertEqual(got.get("user").get("username"), self.username)

    def test_006_change_user_info(self):
        email = "smith@smithy.com"
        displayname = "smith"
        response = self.client.post('/rpcs', data={
            "funcname": "user_change_info",
            "args": [self.username, self.password_hash, displayname, email]
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, b'"success"\n')

        response = self.client.post('/rpcs', data={
            "funcname": "get_current_user_info"
        })
        self.assertEqual(response.status_code, 200)

        got = json.loads(response.data)
        self.assertIn("user", got.keys())
        self.assertEqual(got.get("user").get("username"), self.username)
        self.assertEqual(got.get("user").get("email"), email)
        self.assertEqual(got.get("user").get("displayname"), displayname)

    def test_007_change_user_password(self):
        # 1. change passowrd 
        # 2. logout
        # 3. log back in with new password

        # 1 
        password_hash_new = hashlib.sha224("updatedpassword".encode('utf-8')).hexdigest()

        response = self.client.post('/rpcs', data={
            "funcname": "user_change_password",
            "args": [self.password_hash, password_hash_new]
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, b'"success"\n')
        
        # 2 
        response = self.client.post('/rpcs', data={
            "funcname": "user_logout"
        })
        self.assertEqual(response.status_code, 200)

        # 3
        response = self.client.post('/rpcs', data={
            "funcname": "user_login",
            "args": [self.username, password_hash_new]
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, b'"success"\n')

    def test_008_logout_user(self):
        response = self.client.post('/rpcs', data={
            "funcname": "user_logout"
        })
        self.assertEqual(response.status_code, 200)

    def test_009_get_logged_out_user(self):
        response = self.client.post('/rpcs', data={
            "funcname": "get_current_user_info"
        })
        self.assertEqual(response.status_code, 401)
