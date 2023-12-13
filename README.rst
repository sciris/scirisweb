Welcome to ScirisWeb
====================

**NOTE:** While Sciris is still in active development, ScirisWeb is no longer actively maintained. It is still functional, but you may wish to use a more modern Python webapp framework instead, such as `Shiny for Python <https://shiny.posit.co/py>`_, `Plotly Dash <https://dash.plotly.com>`_, or `Streamlit <https://streamlit.io/>`_.

What is Sciris?
---------------

Glad you asked! **Sciris** (http://sciris.org) is a library of tools that can make it easier and more pleasant to write scientific Python code. Built on top of `NumPy <https://numpy.org/>`__ and `Matplotlib <https://matplotlib.org/>`__, Sciris provides functions covering a wide range of common array and plotting operations. This means you can get more done with less code, and spend less time looking things up on StackOverflow.

**ScirisWeb** is an extension of Sciris that allows you to build Python webapps without reinventing the wheel – kind of like `Shiny <https://shiny.rstudio.com/>`__ for Python. In contrast to `Plotly Dash <https://plotly.com/dash/>`__ and `Streamlit <https://www.streamlit.io/>`__, which have limited options for customization, ScirisWeb is completely modular, so you have control over which tools to use for which aspects of the project. Out of the box, ScirisWeb provides a "just works" solution using `Vuejs <https://vuejs.org/>`__ for the frontend, `Flask <https://flask.palletsprojects.com/>`__ as the web framework, `Redis <https://redis.io/>`__ for the (optional) database, and Matplotlib/`mpld3 <https://github.com/mpld3/mpld3>`__ for plotting. But if you want a React frontend linked to an SQL database with Plotly figures, ScirisWeb can serve as the glue holding all of that together.

ScirisWeb is available on `PyPi <https://pypi.org/project/scirisweb/>`__ (``pip install sciris``) and `GitHub <https://github.com/sciris/scirisweb>`__. Full documentation is available at http://docs.sciris.org. If you have questions, feature suggestions, or would like some help getting started, please reach out to us at info@sciris.org.


Highlights
~~~~~~~~~~
Some highlights of ScirisWeb (``import scirisweb as sw``):

-  **ScirisApp** – An extension of a Flask App that can be created as simply as ``app = sw.ScirisApp(config)`` and run with ``app.run()``.
-  **RPCs** – Simple "remote procedure calls" that define how the frontend (web interface) interacts with the backend (Python server).
-  **Datastore** – For more fully-featured webapps, user and data management are available based on Redis (with additional options for SQL or file-based databases).


Where did Sciris come from?
~~~~~~~~~~~~~~~~~~~~~~~~~~~
Development of Sciris began in 2014 to support development of the `Optima <http://optimamodel.com>`__ suite of models. We kept encountering the same issues and inconveniences over and over while building scientific webapps, and began collecting the tools we used to overcome these issues into a shared library. This library evolved into Sciris. (Note: while "Sciris" doesn't mean anything, "iris" means "rainbow" in Greek, and the name was loosely inspired by the wide spectrum of scientific computing features included in Sciris.)


Where has ScirisWeb been used?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
ScirisWeb is currently used by a number of scientific computing libraries, including `Atomica <http://atomica.tools>`__ and `Covasim <http://covasim.org>`__. ScirisWeb also provides the backend for webapps such as the `Cascade Analysis Tool <http://cascade.tools>`__, `HIPtool <http://hiptool.org>`__, and `Covasim <http://app.covasim.org>`__.


Installation and run instructions
---------------------------------


5-second quick start guide
~~~~~~~~~~~~~~~~~~~~~~~~~~

1. Install ScirisWeb: ``pip install scirisweb``

2. Use ScirisWeb: ``import scirisweb as sw``


20-second quick start guide

1. Download ScirisWeb (e.g. ``git clone http://github.com/sciris/scirisweb``)

2. Install ScirisWeb (which will install Sciris as well): ``cd scirisweb; pip install -e .``

3. Change to the Hello World folder: ``cd examples/helloworld``

4. Run the app: ``python app.py``

5. Go to ``localhost:8080`` in your browser

6. Have fun!


Medium-quick start guide
~~~~~~~~~~~~~~~~~~~~~~~~

Note: if you're a developer, you'll likely already have some/all of these packages installed.

1. Install `NodeJS <https://nodejs.org/en/download/>`__ (JavaScript manager)

2. Install `Redis <https://redis.io/topics/quickstart>`__ (database)

3. Install `Anaconda Python <https://www.anaconda.com/download/>`__ (scientific Python environment)

4. Clone and install Sciris: ``git clone http://github.com/sciris/sciris``

5. Clone ScirisWeb: ``git clone http://github.com/sciris/scirisweb``

6. Once you've done all that, to install, simply run ``pip install -e .`` in the root folders of ``sciris`` and ``scirisweb``. This should install Sciris and ScirisWeb as importable Python modules.

To test, open up a new Python window and type ``import sciris`` (and/or ``import scirisweb``)

If you have problems, please email info@sciris.org, or consult the rest of this guide for more information.


Installing on Linux
~~~~~~~~~~~~~~~~~~~

The easiest way to install Sciris is by using pip: ``pip install scirisweb`` (which will also automatically install ``sciris``). If you want to install from source, follow these steps:

1. Install Git: ``sudo apt install git``

2. Install NodeJS: ``sudo apt install nodejs``

3. Install Redis: https://redis.io/topics/quickstart

4. (Optional) Install `Anaconda Python <https://www.anaconda.com/download/>`__ (as of version 0.15, Sciris is only compatible with Python 3), and make sure it's the default Python, e.g.

::

   your_computer:~> python
   Python 3.7.4 (default, Aug 13 2019, 20:35:49)
   [GCC 7.3.0] :: Anaconda, Inc. on linux
   Type "help", "copyright", "credits" or "license" for more information.

5. Clone the Sciris repositories:
   ``git clone http://github.com/sciris/sciris.git`` and
   ``git clone http://github.com/sciris/scirisweb.git``.

6. Run ``pip install -e .`` in each of the two Sciris folders.

7. To test, open up a new Python window and type ``import sciris`` and
   ``import scirisweb``. You should see something like:

::

   >>> import sciris
   >>> import scirisweb


Installing on Windows
~~~~~~~~~~~~~~~~~~~~~


Package and library dependencies
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

First, make sure that you have ``npm`` (included in Node.js installation) and ``git`` installed on your machine.

Install `Anaconda Python <https://www.anaconda.com/download/>`__. In your Python setup, you also need to have the following packages (instructions in parentheses show how to install with Anaconda Python environment already installed). **Note**, these should all be installed automatically when you type ``pip install -e .`` in the Sciris and ScirisWeb folders.


Database dependencies
^^^^^^^^^^^^^^^^^^^^^

If you use Redis as your DataStore mode, you will need to have Redis installed on your computer (as a service). Redis does not directly support Windows, but there is a `MicrosoftArchive page on GitHub <https://github.com/MicrosoftArchive/redis>`__ where you may go for installation directions on your Windows machine. (For example, it can be installed at `this site <https://github.com/MicrosoftArchive/redis/releases>`__ , downloading a .msi file). It ends up being installed as a service which you can navigate to by going the Windows Task Manager and going to the Services tab. Make sure the ``Redis`` service is in the Running state.

Most likely, the directory for your Redis executables will be installed at ``C:\Program Files\Redis``. In that directory, you can double-click the icon for ``redis-cli.exe`` to start the redis database command line interface at the default Redis database (#0). You can do ``keys *`` to look at all of the store key / value pairs in the database, and ``exit`` exits the interface.

You will probably want to use a non-default (i.e. ``N`` is not 0) database. To investigate what keys are in, for example, database #2, while you are within ``redis-cli``, you can type ``select 2`` to switch to that database.


Installing on Mac
~~~~~~~~~~~~~~~~~

1. Install Git. This can be done by installing Xcode commandline tools.

::

        xcode-select --install

2. Install NodeJS. Visit https://nodejs.org/en/download/ and download the Mac version and install.

3. Install Redis: https://redis.io/topics/quickstart or run (Assumming brew is installed)

::

        brew install redis

4. Install `Anaconda Python 3 <https://www.anaconda.com/download/>`__, and make sure it's the default Python, e.g.

::

   your_computer:~> python
   Python 3.7.4 (default, Aug 13 2019, 20:35:49)
   [GCC 7.3.0] :: Anaconda, Inc. on linux
   Type "help", "copyright", "credits" or "license" for more information.

5.  Create a directory that will hold Sciris. For reference purposes we will create and refer to that directory as ``pyenv``.

6.  Clone the Sciris repository into ``pyenv``:
    ``git clone http://github.com/sciris/sciris.git``

7.  Create a Python virtual environment (venv) inside the directory of your choice. This will be the parent of the Sciris folder.

::

     `virtualenv venv`

More information about `python virtual environments <http://docs.python-guide.org/en/latest/dev/virtualenvs/>`__ can be found `here <http://docs.python-guide.org/en/latest/dev/virtualenvs/>`__. The project structure should be as follows;

::

          -pyenv
              -venv
              -sciris

8.  Get into the virtual environment. While inside the ``pyenv`` folder, to activate the virtual environment, type:

::

      ./venv/bin/activate

9.  Change to the Sciris root folder and type:

::

   python setup.py develop

10. Repeat in the ScirisWeb root folder:

::

   python setup.py develop

11. To test if the if everything is working accordingly, open Python window within the virtual environment and type ``import sciris`` and ``import scirisweb``. If no errors occur, then the import worked.


Multhreaded deployment
----------------------

The problem with the simple deployment method described above is that requests are single-threaded. If this is an issue, recommended deployment is using ``nginx`` to serve the static files, and ``gunicorn`` to run the Flask app. Note that it is common for an application to call several RPCs with each page load. This means that the multithreaded deployment can result in improved site performance even for a single user.


Requirements
~~~~~~~~~~~~

You must have nginx (``sudo apt install nginx``) and gunicorn
(``pip install gunicorn``) installed.


Set up nginx
~~~~~~~~~~~~

1. Copy ``examples/gunicorn/example_nginx_config`` to e.g.
   ``/etc/nginx/sites-enabled/my_app`` (can change filename if desired)
2. Edit the copied file to specify

   -  The hostname/URL for the site e.g. ``my_app.com``
   -  The full path to the directory containing ``index.html`` on the
      system running ``nginx``
   -  Change the port in ``proxy_pass`` line if desired - it must match
      the port in ``launch_gunicorn``

3. Reload or restart ``nginx`` e.g. ``sudo service nginx reload``

For example, this will start it running at ``localhost:8188``:

.. code:: bash

   server {
       listen 8188;
       server_name localhost;
       location / {
           root /home/my_username/my_sciris_app;
       }
       location /api {
           proxy_pass http://127.0.0.1:8097/;
       }
   }


Run gunicorn
~~~~~~~~~~~~

1. Copy ``examples/gunicorn/example_launch_gunicorn`` to the folder with your app (e.g. ``launch_my_app_gunicorn``), and set the number of workers as desired - usual recommendation is twice the number of CPUs but for applications that are CPU bound (e.g., an RPC call runs a model) then it may be better to reduce it to just the number of CPUs.
2. The example script references the Flask app using ``name_of_your_app:flask_app``. The ``name_of_your_app`` should be importable in Python (either via running Python in the current directory, or installing as a package via ``pip``) and ``flask_app`` is the name of a variable containing the Flask application. So for  example, you might have a file ``foo.py`` containing

.. code:: python

   app = sw.ScirisApp(__name__, name="My App")
   the_app = app.flask_app

in which case the ``launch_my_app_gunicorn`` script should contain ``foo:the_app`` instead of ``name_of_your_app:flask_app``.

3. Run ``launch_my_app_gunicorn``. This will need to be kept running to support the site (so run via ``nohup`` or ``screen`` etc.).

For example:

.. code:: bash

   cd my_app
   screen -S my_app_session
   ./launch_my_app_gunicorn
   <you can now close the terminal>

   ...

   <coming back later, you can restart it with>
   screen -R my_app_session

Note that for local development, you can add the ``--reload`` flag to the ``gunicorn`` command to automatically reload the site. This can be helpful if using the ``nginx+gunicorn`` setup for local development.


Examples
--------

In the ``examples`` and ``vue_proto_webapps`` directories are contained a number of working examples of web applications combining Vue, Flask, and Twisted. These are being used as stepping stones for developing the main framework based in ``user_interface``, ``session_manager``, ``model_code``, and ``bin``.


Hello World
~~~~~~~~~~~

A very simple test case of Sciris. In the ``examples/helloworld`` folder, type ``python app.py``. If you go to ``localhost:8080`` in your browser, it should be running a simple Python webapp.

See the directions `here <https://github.com/sciris/scirisweb/tree/develop/examples/helloworld>`__ on how to install and run this example.