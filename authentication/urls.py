from django.contrib import admin  # Django admin module
from django.urls import path, re_path, include       # URL routing
from django.conf import settings   # Application settings
from django.contrib.staticfiles.urls import staticfiles_urlpatterns  # Static files serving
from django.conf.urls.static import static
from django.contrib.auth import views as auth_views
from .views import *
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# Define URL patterns
urlpatterns = [
    path("api/login/", login, name="login"),
    path("api/register/", createUser.as_view(), name="register"),
    path("api/token/", TokenObtainPairView.as_view(), name="get_token"),
    path("api/token/refresh", TokenRefreshView.as_view(), name="refresh"),
    path("api/api-auth/", include("rest_framework.urls")),
]
 
# Serve media files if DEBUG is True (development mode)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
 
# Serve static files using staticfiles_urlpatterns
urlpatterns += staticfiles_urlpatterns()