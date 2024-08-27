from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email']
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        # Remove the password from the validated_data dictionary and hash it
        password = validated_data.pop('password')
        
        # Create the user without the password initially
        user = User(**validated_data)
        
        # Hash the password and save the user
        user.set_password(password)
        user.save()
        
        return user
    


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    email = serializers.EmailField()

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        email = attrs.get('email')

        # Check if the user exists with the given username and email
        try:
            user = User.objects.get(username=username, email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError('Invalid username or email.')

        # Authenticate using the standard method
        user = authenticate(username=username, password=password)

        if user is None:
            raise serializers.ValidationError('Invalid password.')

        # Proceed with the regular validation process
        data = super().validate(attrs)
        return data

    class Meta:
        model = User
        fields = ('username', 'password', 'email')