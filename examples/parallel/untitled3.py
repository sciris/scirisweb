#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Fri Feb 22 17:18:08 2019

@author: cliffk
"""

from dask import compute, delayed
import pylab as pl
import sciris as sc

from distributed import LocalCluster
c = LocalCluster(processes=False)

print(c.scheduler)
print(c.workers)

inputs = [0,1,2,3]

def process(data):
   pl.seed(data)
   output = 0
   for i in pl.arange(1e6):
      this = pl.randn()
      # print('%s: %s' % (i, this))
      output += this
   return output

print('Running parallel...')
sc.tic()
values = [delayed(process)(x) for x in inputs]
results1 = compute(*values, scheduler='distributed')

print(results1)
sc.toc()

print('Running serial...')
sc.tic()
results2 = []
for inputval in inputs:
    results2.append(process(inputval))
print(results2)
sc.toc()