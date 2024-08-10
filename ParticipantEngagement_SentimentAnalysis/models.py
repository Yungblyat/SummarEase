from django.db import models
from SummarEaseApp.models import AudioFile
import json

class JSONField(models.TextField):
    def from_db_value(self, value, expression, connection):
        if value is None:
            return value
        return json.loads(value)

    def to_python(self, value):
        if isinstance(value, dict):
            return value
        if value is None:
            return value
        return json.loads(value)

    def get_prep_value(self, value):
        if value is None:
            return value
        return json.dumps(value)

class ParticipantEngagement(models.Model):
    audio_file = models.OneToOneField(AudioFile, on_delete=models.CASCADE, related_name='participant_engagement')
    metrics = JSONField(default=dict)
    speech_rate = JSONField(default=dict)
    interruptions = JSONField(default=dict)
    sentiment = JSONField(default=dict)
