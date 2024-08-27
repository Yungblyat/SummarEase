from django.urls import path
from . import views
from .views import transcript_list_and_view,transcript_list, AudioUploadView

urlpatterns = [
      path('api/diarize/', views.upload_audio, name='diarize'),
      path('api/user/transcription-list/', transcript_list, name='transcript_list'),
      path('api/user/transcription-list/<int:audio_file_id>/', transcript_list_and_view, name='view_transcript'),
      path('api/upload/', AudioUploadView.as_view(), name='uploadAudio'),
      #   path('transcribe/', views.upload_transcribe,name='transcribe')  # Diarization view
      
]
