# Imports
import pylab as pl
import sciris as sc
import scirisweb as sw
from datetime import datetime as dt

runserver = True # Choose to run in the frontend or backend

# Convert dates to years
def convertdate(datestr, fmt):
    date = dt.strptime(datestr, fmt)
    yearnum = date.year + (date.month-1)/12. + (date.day-1)/365.
    return yearnum

# Get the data
def loaddata(verbose=True):
    if verbose:
        print('Loading data...')
    dataurl = 'https://raw.githubusercontent.com/rstudio/shiny-examples/master/120-goog-index/data/trend_data.csv'
    rawdata = sc.wget(dataurl).splitlines()
    data = []
    for r,rawline in enumerate(rawdata):
        line = rawline.split(',')
        if r==0: # Read header
            cols = line
        else: # Read data
            tag = line[0]
            yearnum = convertdate(line[1], '%Y-%m-%dT%I:%M:%fZ')
            value = float(line[2]) if r>0 else line[2]
            data.append([tag, yearnum, value])
    df = sc.dataframe(cols=cols, data=data)
    if verbose:
        print(df)
    return df

# Create the app
app = sw.ScirisApp(__name__, name="PyShiny")
df = loaddata()

# Define the RPCs
@app.register_RPC()
def getoptions(tojson=True):
    options = sc.odict([
        ('Advertising',    'advert'),
        ('Education',      'educat'),
        ('Small business', 'smallbiz'),
        ('Travel',         'travel'),
        ('Unemployment',   'unempl'),
        ])
    if tojson:
        output = sc.sanitizejson(options.keys(), tostring=False)
    else:
        output = options
    return output

@app.register_RPC()
def plotdata(trendselection=None, startdate='2000-01-01', enddate='2018-01-01', trendline=False):
    
    print(f'Plotting data for type={trendselection}, start={startdate}, end={enddate}')
    
    # Handle inputs
    startyear = convertdate(startdate, '%Y-%m-%d')
    endyear   = convertdate(enddate,   '%Y-%m-%d')
    trendoptions = getoptions(tojson=False)
    if trendselection is None: trendselection  = trendoptions.keys()[0]
    datatype = trendoptions[trendselection]

    # Make graph
    fig = pl.figure()
    fig.add_subplot(111)
    thesedata = df[df['type']==datatype]
    years = thesedata['date'].values
    vals = thesedata['close'].values
    validinds = sc.findinds(pl.logical_and(years>=startyear, years<=endyear))
    x = years[validinds]
    y = vals[validinds]
    pl.plot(x, y)
    pl.xlabel('Date')
    pl.ylabel('Trend index')

    # Add optional trendline
    if trendline:
        newy = sc.smoothinterp(x, x, y, smoothness=200)
        pl.plot(x, newy, lw=3)

    # Convert to FE
    graphjson = sw.mpld3ify(fig, jsonify=False)  # Convert to dict
    return graphjson  # Return the JSON representation of the Matplotlib figure

# Run the server
if __name__ == "__main__" and runserver:
    app.run()
else:
    plotdata()
