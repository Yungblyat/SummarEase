from django.contrib import admin
from .models import AudioFile, Transcript, SpeakerDiarization

admin.site.register(AudioFile)
admin.site.register(Transcript)
admin.site.register(SpeakerDiarization)