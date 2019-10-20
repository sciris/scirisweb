from celery import Celery

app = Celery('celery_test', broker='redis://localhost:6379/0')