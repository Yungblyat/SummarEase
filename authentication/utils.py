# utils.py
from rest_framework_simplejwt.settings import api_settings

def custom_payload_handler(user):
    print (user)
    return {
        'user_id': user.id,
        'username': user.username,
        'email': user.email,
        'exp': api_settings.ACCESS_TOKEN_LIFETIME.total_seconds(),
    }
