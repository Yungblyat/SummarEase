from django.contrib.auth.models import User
from django.db import models

class AudioFile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, default=1)
    file = models.FileField(upload_to='audio/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
   

class Transcript(models.Model):
    audio_file = models.OneToOneField(AudioFile, on_delete=models.CASCADE, related_name='transcript')
    content = models.TextField(blank=True, null=True)
    

class SpeakerDiarization(models.Model):
    audio_file = models.OneToOneField(AudioFile, on_delete=models.CASCADE, related_name='speaker_diarization')
    content = models.TextField(blank=True, null=True)
   


#make changes according to json serializer and deserializer