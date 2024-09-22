from django.db import models
from SummarEaseApp.models import AudioFile
import json

# Create your models here.
class ToDoItem(models.Model):
    audio_file = models.ForeignKey(AudioFile, on_delete=models.CASCADE, related_name='todo_items')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class Summary(models.Model):
    audio_file = models.OneToOneField(AudioFile, on_delete=models.CASCADE, related_name='summary')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)