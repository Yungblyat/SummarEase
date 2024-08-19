# Import necessary modules and models
from .serializers import UserSerializer
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import generics


@api_view(["POST"])
def login(request):
	user = get_object_or_404(User, username=request.data["username"])
	if not user.check_password(request.data["password"]):
		return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)
	token, created = Token.objects.get_or_create(user=user)
	serializer = UserSerializer(user)
	return Response({"token": token.key, "user": serializer.data})

class createUser(generics.CreateAPIView):
	queryset = User.objects.all()
	serializer_class = UserSerializer
	permission_classes = [AllowAny]
	



# @api_view(["POST"])
# def register(request):
# 	serializer = UserSerializer(data=request.data)
# 	if serializer.is_valid():
# 		serializer.save()
# 		user = User.objects.get(username=request.data["username"])
# 		user.set_password(request.data["password"])
# 		user.save()
# 		token = Token.objects.create(user=user)
# 		return Response({"token": token.key, "user": serializer.data})
# 	return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def check_token(request):
	return Response(f"Passed for {request.user.email}")





# def custom_logout(request):
#     logout(request)
#     return redirect('home')  # Redirect to the home page or any other page after logout


# # Define a view function for the login page
# def login_page(request):
# 	# Check if the HTTP request method is POST (form submission)
# 	if request.method == "POST":
# 		username = request.POST.get('username')
# 		password = request.POST.get('password')
		
# 		# Check if a user with the provided username exists
# 		if not User.objects.filter(username=username).exists():
# 			print("User does not exist")
# 			# Display an error message if the username does not exist
# 			messages.error(request, 'Invalid Username')
# 			return redirect('/login/')
		
# 		# Authenticate the user with the provided username and password
# 		user = authenticate(username=username, password=password)
		
# 		if user is None:
# 			# Display an error message if authentication fails (invalid password)
# 			messages.error(request, "Invalid Password")
# 			return redirect('/login/')
# 		else:
# 			# Log in the user and redirect to the home page upon successful login
# 			login(request, user)
# 			return redirect('/SummarEaseApp/diarize/')
	
# 	# Render the login page template (GET request)
# 	return render(request, 'login.html')

# # Define a view function for the registration page
# def register_page(request):
# 	# Check if the HTTP request method is POST (form submission)
# 	if request.method == 'POST':
# 		first_name = request.POST.get('first_name')
# 		last_name = request.POST.get('last_name')
# 		username = request.POST.get('username')
# 		password = request.POST.get('password')
		
# 		# Check if a user with the provided username already exists
# 		user = User.objects.filter(username=username)
		
# 		if user.exists():
# 			# Display an information message if the username is taken
# 			messages.info(request, "Username already taken!")
# 			return redirect('/register/')
		
# 		# Create a new User object with the provided information
# 		user = User.objects.create_user(
# 			first_name=first_name,
# 			last_name=last_name,
# 			username=username
# 		)
		
# 		# Set the user's password and save the user object
# 		user.set_password(password)
# 		user.save()
		
# 		# Display an information message indicating successful account creation
# 		messages.info(request, "Account created Successfully!")
# 		return redirect('/login/')
	
# 	# Render the registration page template (GET request)
# 	return render(request, 'register.html')


# def custom_logout(request):
#     logout(request)
#     return redirect('home')