import os
from dotenv import load_dotenv

# load_dotenv("D:\\SummarEase\\SummarEaseFyp\\.env")
load_dotenv(f"{os.getcwd()}\\SummarEaseApp\\.env")
print(os.getenv("AUTH"))