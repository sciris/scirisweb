#!/usr/bin/env python
# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from setuptools import setup, find_packages
import sys

# Define the requirements and extras
requirements = [
        'sciris', # Basic tools -- NB, this includes numpy, scipy, pandas, and matplotlib as dependencies
        'decorator>=4.1.2', # For API calls
        'redis==2.10.6', # Database -- Redis >=3.0 breaks Celery unfortunately
        'mpld3',    # Rendering plots in the browser
        'werkzeug', # HTTP tools
        'flask>=1.0.0', # Creating the webapp
        'flask-login>=0.4.1', # Handling users
        'flask-session>=0.3.1', # use redis for sessions
        'celery>=4.2', # Task manager
        'twisted>=18.4.0', # Server
        'service_identity', # Identity manager for Celery (not installed with Celery though)
        'pyasn1', # Required for service_identity (but not listed as a dependency!)
        'pyparsing', # Also for processing requests
        'sqlalchemy',
    ],

# Optionally define extras
if 'minimal' in sys.argv:
    print('Performing minimal installation -- celery, twisted, and redis excluded')
    sys.argv.remove('minimal')
    requirements = [
        'sciris', # Basic tools -- NB, this includes numpy, scipy, pandas, and matplotlib as dependencies
        'decorator>=4.1.2', # For API calls
        'mpld3',    # Rendering plots in the browser
        'flask>=1.0.0', # Creating the webapp
        'pyparsing', # Also for processing requests
    ],


# Get version information
versionfile = 'scirisweb/sw_version.py'
with open(versionfile, 'r') as f:
    versiondict = {}
    exec(f.read(), versiondict)
    version = versiondict['__version__']

# Get the documentation
with open("README.md", "r") as fh:
    long_description = fh.read()

CLASSIFIERS = [
    'Environment :: Console',
    'Intended Audience :: Science/Research',
    'License :: OSI Approved :: MIT License',
    'Operating System :: OS Independent',
    'Programming Language :: Python',
    'Topic :: Software Development :: Libraries :: Python Modules',
    'Development Status :: 4 - Beta',
    'Programming Language :: Python :: 3.7',
]

setup(
    name='scirisweb',
    version=version,
    author='ScirisOrg',
    author_email='info@sciris.org',
    description='Scientific webapps for Python',
    long_description=long_description,
    long_description_content_type="text/markdown",
    url='http://github.com/sciris/scirisweb',
    keywords=['scientific', 'webapp', 'framework'],
    platforms=['OS Independent'],
    classifiers=CLASSIFIERS,
    packages=find_packages(),
    include_package_data=True,
    install_requires=requirements
    )
