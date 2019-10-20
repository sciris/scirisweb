#!/usr/bin/env python

import sciris as sc
import celery_config as cc

print(sc.pr(cc.celery_instance))

cc.celery_instance.worker_main([__file__, '-l', 'info'])
