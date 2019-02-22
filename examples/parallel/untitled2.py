#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Fri Feb 22 17:15:29 2019

@author: cliffk
"""

from distributed import Worker
from tornado.ioloop import IOLoop
from threading import Thread

loop = IOLoop.current()
t = Thread(target=loop.start, daemon=True)
t.start()

w = Worker('tcp://127.0.0.1:8786', loop=loop)
w.start()  # choose randomly assigned port