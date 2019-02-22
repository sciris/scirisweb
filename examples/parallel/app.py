# Imports
import pylab as pl
import sciris as sc
import scirisweb as sw
from dask.distributed import Client


client = Client()

runserver = False # Choose to run in the frontend or backend

# Create the app
app = sw.ScirisApp(__name__, name="ParallelComputation")

#def 

# Define the RPCs
@app.register_RPC()
def computation(seed=0, n=1000):
    
    # Make graph
    pl.seed(int(seed))
    fig = pl.figure()
    ax = fig.add_subplot(111)
    xdata = pl.randn(n)
    ydata = pl.randn(n)
    colors = sc.vectocolor(pl.sqrt(xdata**2+ydata**2))
    ax.scatter(xdata, ydata, c=colors)
    
    # Convert to FE
    graphjson = sw.mpld3ify(fig, jsonify=False)  # Convert to dict
    return graphjson  # Return the JSON representation of the Matplotlib figure

# Run the server
if __name__ == "__main__" and runserver:
    app.run()
else:
    computation()
