# Equivalent to apptasks.py

import sciris as sc
import scirisweb as sw

print('STARTING CONFIG')

# TODO: make it so you can just set one URL!
config = sc.prettyobj()
config.REDIS_URL             = 'redis://127.0.0.1:6379/0'
config.DATASTORE_URL         = config.REDIS_URL
config.BROKER_URL            = config.REDIS_URL
config.CELERY_RESULT_BACKEND = config.REDIS_URL

task_func_dict = {} # Dictionary to hold all of the registered task functions in this module.
async_task = sw.taskwrapper(task_func_dict) # Task function registration decorator created using call to taskwrapper().
celery_instance = sw.make_celery(config=config) # Create the Celery instance for this module.

sc.pr(celery_instance)

@async_task
def test_func(a=None, b=None):
    return a*b

sw.add_task_funcs(task_func_dict)
print('ENDING CONFIG')
