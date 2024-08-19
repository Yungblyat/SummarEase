from rest_framework import serializers
from django.contrib.auth.models import User


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