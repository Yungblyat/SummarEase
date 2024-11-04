# my_chatbot/urls.py
from django.contrib import admin
from django.urls import path, include
from .views import chatbot_endpoint

urlpatterns = [
    path('chat/', chatbot_endpoint),
    
]