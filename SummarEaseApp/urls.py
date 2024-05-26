from django.urls import path
from . import views

urlpatterns = [
      path('diarize/', views.upload_audio, name='diarize'),
      #   path('transcribe/', views.upload_transcribe,name='transcribe')  # Diarization view
]
