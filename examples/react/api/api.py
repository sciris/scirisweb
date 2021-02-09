'''
Web server. Run with:
    python api.py
'''

import pylab as pl
import sciris as sc
import scirisweb as sw

autoreload = True
app = sw.ScirisApp(__name__, name="React example", server_port=5000)


@app.route('/get_time')
def get_time():
    ''' Can still define standard Flask routes '''
    return {'time': sc.getdate()}


@app.register_RPC()
def showgraph(n=1000):
    ''' Or can define Sciris remote procedure calls (RPCs) '''

    # Make graph
    fig = pl.figure()
    ax = fig.add_subplot(111)
    xdata = pl.randn(n)
    ydata = pl.randn(n)
    colors = sc.vectocolor(pl.sqrt(xdata**2+ydata**2))
    ax.scatter(xdata, ydata, c=colors)
    ax.patch.set_alpha(0.0) # Go fancy with transparent background

    # Convert to FE
    graphjson = sw.mpld3ify(fig, jsonify=False)  # Convert to dict
    return graphjson  # Return the JSON representation of the Matplotlib figure


if __name__ == "__main__":
    app.run(autoreload=autoreload)