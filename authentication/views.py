from .serializers import UserSerializer
from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework import status
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
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired, BadData
from django.urls import reverse
from verify_email import send_mail
from django.conf import settings



class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class createUser(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        # Save the user with `is_active=False`
        user = serializer.save(is_active=False)
        
        # Generate verification token
        serializer = URLSafeTimedSerializer(settings.SECRET_KEY)
        token = serializer.dumps(user.email, salt='email-verification')
        
        # Construct verification URL
        verification_url = f"{settings.FRONTEND_URL}/verify-email/{token}"

        # Send verification email
        send_mail(
            'Verify your email',
            f'Please click the link to verify your email: {verification_url}',
            'from@example.com',
            [user.email],
            fail_silently=False,
        )

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
        

class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, token):
        serializer = URLSafeTimedSerializer(settings.SECRET_KEY)
        try:
            # Verify token and get user email
            email = serializer.loads(token, salt='email-verification', max_age=3600)  # 1 hour expiry
            
            # Activate the user
            user = User.objects.get(email=email)
            user.is_active = True
            user.save()
            
            return Response({"message": "Email verified successfully!"}, status=status.HTTP_200_OK)
        except SignatureExpired:
            return Response({"error": "Token has expired"}, status=status.HTTP_400_BAD_REQUEST)
        except BadSignature:
            return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)
        

        
password_reset_serializer = URLSafeTimedSerializer(settings.SECRET_KEY)

class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        print(email)
        try:
            user = User.objects.get(email=email)
            # Generate a token for the user
            token = password_reset_serializer.dumps(user.pk, salt='password-reset-salt')
            
            # Construct the password reset URL
            reset_url = f"{settings.FRONTEND_URL}/reset-password/{token}"

            # Send the email with the reset URL
            send_mail(
                subject="Password Reset Request",
                message=f"Click the link to reset your password: {reset_url}",
                from_email="no-reply@example.com",
                recipient_list=[email],
            )
            return Response({"message": "Password reset email sent."}, status=200)

        except User.DoesNotExist:
            print("User does not exist")
            return Response({"error": "Email not found."}, status=404)


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    def post(self, request, token):
        try:
            # Validate the token and extract the user ID
            user_id = password_reset_serializer.loads(token, salt='password-reset-salt', max_age=settings.PASSWORD_RESET_TOKEN_EXPIRY)
            user = User.objects.get(pk=user_id)

            reset_url = f"{settings.FRONTEND_URL}/reset-password/{token}"
            # Get the new password from the request
            new_password = request.data.get("password")
            user.set_password(new_password)
            user.save()
            return Response({"message": "Password reset successful."}, status=200)

        except (BadData, User.DoesNotExist):
            return Response({"error": "Invalid or expired token."}, status=400)