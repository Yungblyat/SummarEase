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
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.shortcuts import render
import os
from django.db import IntegrityError
from django.core.exceptions import ValidationError


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class createUser(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        try:
            # Save the user with `is_active=False`
            user = serializer.save(is_active=False)
            
            # Generate verification token
            serializer = URLSafeTimedSerializer(settings.SECRET_KEY)
            token = serializer.dumps(user.email, salt='email-verification')
            
            # Construct verification URL
            verification_url = f"{settings.FRONTEND_URL}/verify-email/{token}"

            # Send verification email
            email_subject = 'Verify your email'
            verify_body = render_to_string('verify_email.html', {'verification_url': verification_url})

            send_mail(
                email_subject,
                '',  # Body is handled in the HTML email
                os.getenv("EMAIL_HOST_USER"),  # Sender email
                recipient_list=[user.email],  # List of recipient emails
                html_message=verify_body,  # HTML body
                fail_silently=False,
            )

        except IntegrityError:
            # Handle unique constraint violation (e.g., email already exists)
            return Response(
                {'error': 'A user with this email already exists.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        except BadSignature:
            return Response({'error': 'Token generation failed. Please try again later.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        except Exception as e:
            return Response({'error': 'Failed to send verification email. Please check your email and try again.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # send_mail(
        #     ,
        #     f'Please click the link to verify your email: {verification_url}',
        #     'from@example.com',
        #     [user.email],
        #     fail_silently=False,
        # )

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
        try:
            user = User.objects.get(email=email)
            # Generate a token for the user
            token = password_reset_serializer.dumps(user.pk, salt='password-reset-salt')
            
            # Construct the password reset URL
            reset_url = f"{settings.FRONTEND_URL}/reset-password/{token}"
            reset_body= render_to_string('reset.html',{"reset_url":reset_url})
            email_subject="Password Reset Request"

            # Send the email with the reset URL
            send_mail(
            email_subject,
            '',  # Body is handled in the HTML email
            os.getenv("EMAIL_HOST_USER"),  # Sender email
            recipient_list=[email],  # List of recipient emails
            html_message=reset_body,  # HTML body
            fail_silently=False,
        )
            # send_mail(
            #     ,
            #     '',
            #     html_message=reset_body,
            #     # message=f"Click the link to reset your password: {reset_url}",
            #     os.getenv("EMAIL_HOST_USER"),
                
            # )
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
        



def test(request):
    return render(request,"reset.html")


def test1(request):
    return render(request,"verify_email.html")
