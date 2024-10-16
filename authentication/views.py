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
from google.auth.transport import requests
from rest_framework import status, permissions
from rest_framework.response import Response
from django.contrib.auth.models import User
from SummarEaseFyp.settings import GOOGLE_CLIENT_ID

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

class GoogleLoginAPIView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({"error": "Token not provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Verify the token
            idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
            # Extract user information from the token
            email = idinfo.get('email')
            first_name = idinfo.get('given_name')
            # Check if user exists, if not create one
            user, created = User.objects.get_or_create(email=email, defaults={
                'username': first_name, 
                'email': email,
            })
            print("user successfully created")

            # Generate JWT tokens for the user
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)

            return Response({
                'access': access_token,
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'username': user.username,
                }
            }, status=status.HTTP_200_OK)

        except ValueError:
            # Invalid token
            return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)
