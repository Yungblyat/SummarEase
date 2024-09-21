from django.urls import path
from .views import send_email


urlpatterns = [
    # path('generate_pdf/', generate_pdf, name='generate_pdf'),
    path('send_email/', send_email, name='send_email'),
]
