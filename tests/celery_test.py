# Equivalent to frontend

import celery_config as cc
import scirisweb as sw
import sciris as sc

task_id = 'temp_celery_test_'+str(sc.uuid())

result = cc.celery_instance.launch_task(task_id=task_id, func_name='test_func', kwargs={'a':13, 'b':19})
print('Celery OK: %s' %result)

sc.timedsleep(1)

answer = sw.get_task_result(task_id)

print('Answer is: %s' % answer)