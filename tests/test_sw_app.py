from . import TestScirisWebBase

class TestScirisWebBasic(TestScirisWebBase):

    def test_001_get(self):
        @self.app.route("/")
        def hello():
            return 'Hello world!'
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
