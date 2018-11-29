# Imports
import pylab as pl
import sciris as sc
import scirisweb as sw

# Globals
# RPC_dict = {} # Dictionary to hold all of the registered RPCs in this module.
# RPC = sw.RPCwrapper(RPC_dict) # RPC registration decorator factory created using call to make_RPC().

runserver = True # Choose to run in the frontend or backend

# Create the app
app = sw.ScirisApp(__name__, name="HelloGraph")

# Define the API
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
    graphjson = sw.mpld3ify(fig)  # Convert to dict
    return graphjson  # Return the JSON representation of the Matplotlib figure

# Define the RPC
@app.register_RPC()
def showgraph2(n=1000):
    # Make graph
    fig = pl.figure()
    ax = fig.add_subplot(111)
    xdata = pl.randn(n)
    ydata = pl.randn(n)
    colors = sc.vectocolor(pl.sqrt(xdata ** 2 + ydata ** 2))
    ax.scatter(xdata, ydata, c=colors)

    # Convert to FE
    graphjson = sw.mpld3ify(fig, jsonify=False)  # Convert to dict
    return graphjson  # Return the JSON representation of the Matplotlib figure

# Run the server
if __name__ == "__main__" and runserver:
    app.run(do_log=True)
else:
    showgraph()