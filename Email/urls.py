from django.urls import path
from .views import generate_pdf,send_email
from .views import send_test_email

urlpatterns = [
    path('generate_pdf/', generate_pdf, name='generate_pdf'),
    path('send_email/', send_email, name='send_email'),
    path('send-test-email/', send_test_email),
]
