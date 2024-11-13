from django.urls import path
from . import views


urlpatterns = [
    # path('send_email/', send_email, name='send_email'),
    path('send/', views.send_email, name='send_email'),
    path('generate_pdf/', views.generate_pdf, name='generate_pdf'),
]
