
from typing import BinaryIO

import boto3

from app.config import AWS_REGION, AWS_S3_BUCKET_NAME


class S3Storage:

    def __init__(self, client=None):
        if not AWS_S3_BUCKET_NAME:
            raise ValueError("AWS_S3_BUCKET_NAME is not configured")

        self.bucket_name = AWS_S3_BUCKET_NAME

        self.client = client or boto3.client(
            "s3",
            region_name=AWS_REGION,
    )

    def check_bucket_access(self):
        self.client.head_bucket(
            Bucket=self.bucket_name
        )

    def upload_file(
        self,
        file_obj: BinaryIO,
        storage_key: str,
        content_type: str
    ) -> None:
        """
        Upload a file object to the configured S3 bucket.

        Args:
            file_obj: File-like object containing document bytes.
            storage_key: Unique S3 object key.
            content_type: MIME type of the document.
        """

        file_obj.seek(0)

        self.client.upload_fileobj(
            Fileobj=file_obj,
            Bucket=self.bucket_name,
            Key=storage_key,
            ExtraArgs={
                "ContentType": content_type
            }
        )


    def delete_file(self, storage_key: str) -> None:
        """
        Delete a document from the configured S3 bucket.

        Args:
            storage_key: S3 object key of the document.
        """

        self.client.delete_object(
            Bucket=self.bucket_name,
            Key=storage_key
        )



    def generate_download_url(
        self,
        storage_key: str,
        expiration: int = 300
    ) -> str:
        """
        Generate a temporary presigned URL for downloading a document.

        Args:
            storage_key: S3 object key.
            expiration: URL validity in seconds (default 5 minutes).

        Returns:
            Temporary presigned download URL.
        """

        return self.client.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": self.bucket_name,
                "Key": storage_key
            },
            ExpiresIn=expiration
        )