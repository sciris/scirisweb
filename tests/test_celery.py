if 1: #def test_celery():
    # Just check that we can import everything
    import sciris as sc
    import scirisweb as sw
    
    
    
    config = sc.prettyobj()
    config.REDIS_URL = 'redis://127.0.0.1:6379/0'
    config.DATASTORE_URL = config.REDIS_URL
    
    task_func_dict = {} # Dictionary to hold all of the registered task functions in this module.
    async_task = sw.taskwrapper(task_func_dict) # Task function registration decorator created using call to taskwrapper().
    celery_instance = sw.make_celery(config=config) # Create the Celery instance for this module.
    
    @async_task
    def test_func(a=None, b=None):
        return a*b
    
    sw.add_task_funcs(task_func_dict)
    
    result = celery_instance.launch_task(task_id='abcdef123456c', func_name='test_func', kwargs={'a':13, 'b':19})
    print('Celery OK: %s' %result)

#if __name__ == '__main__':
#    test_celery()