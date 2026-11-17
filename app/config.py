import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
API_KEY = os.getenv("API_KEY") or None

AWS_REGION = os.getenv("AWS_REGION", "ap-southeast-2")
AWS_S3_BUCKET_NAME = os.getenv("AWS_S3_BUCKET_NAME")