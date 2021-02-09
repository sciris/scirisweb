import time
# from flask import Flask

import pylab as pl
import sciris as sc
import scirisweb as sw

# app = Flask(__name__)
app = sw.ScirisApp(__name__, name="React example", server_port=5000)

# @app.register_RPC()
@app.route('/get_time')
def get_time():
    return {'time': time.time()}

# @app.route('/showgraph')
@app.register_RPC()
def showgraph(n=1000):

    # Make graph
    fig = pl.figure()
    ax = fig.add_subplot(111)
    xdata = pl.randn(n)
    ydata = pl.randn(n)
    colors = sc.vectocolor(pl.sqrt(xdata**2+ydata**2))
    ax.scatter(xdata, ydata, c=colors)

    # Convert to FE
    graphjson = sw.mpld3ify(fig, jsonify=False)  # Convert to dict
    return graphjson  # Return the JSON representation of the Matplotlib figure


if __name__ == "__main__":

    app.run(autoreload=1)