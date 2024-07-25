from django.urls import path
from . import views

urlpatterns = [
    path('metrics/<int:audio_file_id>/', views.calculate_and_display_metrics, name='calculate_and_display_metrics'),
]
