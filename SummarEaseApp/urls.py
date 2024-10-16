from django.urls import path
from . import views
from .views import upload_audio, history, show_result_for_file,delete_audio_file

urlpatterns = [
      path('diarize/', views.upload_audio, name='diarize'),
      # path('user/transcription-list/<int:audio_file_id>/', transcript_list_and_view, name='view_transcript'),
      path('upload/', upload_audio, name='uploadAudio'),
      #   path('transcribe/', views.upload_transcribe,name='transcribe')  # Diarization view
      path('history/', history, name="history"),
      path('process/', show_result_for_file, name="result_history"),
      path('delete/', delete_audio_file, name="delete_audio_file"),
]
