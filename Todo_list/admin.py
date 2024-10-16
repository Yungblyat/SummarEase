from django.contrib import admin
from .models import ToDoItem, Summary
# Register your models here.

admin.site.register(ToDoItem)
admin.site.register(Summary)

