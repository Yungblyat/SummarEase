# Import necessary modules and models
from .serializers import UserSerializer
from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class createUser(generics.CreateAPIView):
	queryset = User.objects.all()
	serializer_class = UserSerializer
	permission_classes = [AllowAny]

class getUserInfo(APIView):
	permission_classes = [IsAuthenticated]
	def get(self, request):
		user = request.user
		serializer = UserSerializer(user)
		return Response(serializer.data)	
	
# @api_view(['GET'])
# @authentication_classes([SessionAuthentication, TokenAuthentication])
# @permission_classes([IsAuthenticated])
# def check_token(request):
# 	return Response(f"Passed for {request.user.email}")
class GoogleLoginView(APIView):
    def post(self, request):
        token = request.data.get("token")
        try:
            # Verify Google token
            idinfo = id_token.verify_oauth2_token(token, google_requests.Request())
            email = idinfo["email"]

            # Check if user exists
            user, created = User.objects.get_or_create(email=email, defaults={"username": email})
            if created:
                # Do anything extra like linking Google profile, etc.
                user.set_unusable_password()
                user.save()

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        except ValueError:
            return Response({'error': 'Invalid Google token'}, status=400)