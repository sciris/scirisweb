import time
from flask import Flask

import pylab as pl
import sciris as sc
import scirisweb as sw

app = Flask(__name__)

@app.route('/time')
def get_current_time():
    return {'time': time.time()}

@app.route('/showgraph')
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