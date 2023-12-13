"""
Test that the API works
"""

import scirisweb as sw


def test_api():
    
    app = sw.ScirisApp(__name__, name="helloworld")

    @app.route("/")
    def hello():
        output = 'Hello world!'
        return output
    
    client = app.flask_app.test_client()
    response = client.get('/')

    assert response.status_code == 200
    assert 'Hello' in response.text
    
    return client
    

if __name__ == '__main__':
    client = test_api()