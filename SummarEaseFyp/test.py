import os
from dotenv import load_dotenv
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(f"{BASE_DIR}\\.env")
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER")  # Your email
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")  # Your email password
DEFAULT_FROM_EMAIL = os.getenv("EMAIL_HOST_USER")

print(BASE_DIR)
print(EMAIL_HOST_USER)
print(EMAIL_HOST_PASSWORD)