from django.urls import path
from . import views
from .views import transcript_list_and_view,transcript_list, upload_audio

urlpatterns = [
      path('diarize/', views.upload_audio, name='diarize'),
      path('user/transcription-list/', transcript_list, name='transcript_list'),
      path('user/transcription-list/<int:audio_file_id>/', transcript_list_and_view, name='view_transcript'),
      path('upload/', upload_audio, name='uploadAudio'),
      #   path('transcribe/', views.upload_transcribe,name='transcribe')  # Diarization view
      
]
