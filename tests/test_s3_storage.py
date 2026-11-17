from unittest.mock import Mock

import pytest

from app.storage.s3_storage import S3Storage

from botocore.exceptions import ClientError


def test_upload_file():
    mock_s3_client = Mock()

    storage = S3Storage(client=mock_s3_client)

    file_obj = Mock()
    file_obj.seek = Mock()

    storage.upload_file(
        file_obj=file_obj,
        storage_key="documents/test-document.pdf",
        content_type="application/pdf"
    )

    file_obj.seek.assert_called_once_with(0)

    mock_s3_client.upload_fileobj.assert_called_once_with(
        Fileobj=file_obj,
        Bucket=storage.bucket_name,
        Key="documents/test-document.pdf",
        ExtraArgs={
            "ContentType": "application/pdf"
        }
    )



def test_delete_file():
    mock_s3_client = Mock()

    storage = S3Storage(client=mock_s3_client)

    storage.delete_file(
        storage_key="documents/test-document.pdf"
    )

    mock_s3_client.delete_object.assert_called_once_with(
        Bucket=storage.bucket_name,
        Key="documents/test-document.pdf"
    )


def test_generate_download_url():
    mock_s3_client = Mock()

    mock_s3_client.generate_presigned_url.return_value = (
        "https://example.com/temporary-download-url"
    )

    storage = S3Storage(client=mock_s3_client)

    result = storage.generate_download_url(
        storage_key="documents/test-document.pdf"
    )

    assert result == "https://example.com/temporary-download-url"

    mock_s3_client.generate_presigned_url.assert_called_once_with(
        "get_object",
        Params={
            "Bucket": storage.bucket_name,
            "Key": "documents/test-document.pdf"
        },
        ExpiresIn=300
    )


def test_upload_file_propagates_s3_error():
    mock_s3_client = Mock()

    mock_s3_client.upload_fileobj.side_effect = ClientError(
        {
            "Error": {
                "Code": "AccessDenied",
                "Message": "Access Denied"
            }
        },
        "PutObject"
    )

    storage = S3Storage(client=mock_s3_client)

    file_obj = Mock()

    with pytest.raises(ClientError):
        storage.upload_file(
            file_obj=file_obj,
            storage_key="documents/test-document.pdf",
            content_type="application/pdf"
        )
            