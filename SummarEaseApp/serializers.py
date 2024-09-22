from rest_framework import serializers
from .models import AudioFile

class AudioFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AudioFile
        fields = ['file', 'uploaded_at', 'id']  # Include fields that you want to return in the API
