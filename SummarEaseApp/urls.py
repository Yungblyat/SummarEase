from django.urls import path
from . import views
from .views import transcript_list_and_view

urlpatterns = [
      path('diarize/', views.upload_audio, name='diarize'),
      path('transcripts/', transcript_list_and_view, name='transcript_list'),
      path('transcripts/<int:audio_file_id>/', transcript_list_and_view, name='view_transcript')
      #   path('transcribe/', views.upload_transcribe,name='transcribe')  # Diarization view
]
