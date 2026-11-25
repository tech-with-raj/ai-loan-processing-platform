import logging
import os
from typing import BinaryIO
import uuid

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models import Document
from app.services.loan_application_service import LoanApplicationService
from app.storage.s3_storage import S3Storage

logger = logging.getLogger(__name__)

# Maximum allowed document size: 5 MB
MAX_DOCUMENT_SIZE_BYTES = 5 * 1024 * 1024


# Supported document extensions and their MIME types
SUPPORTED_DOCUMENT_TYPES = {
    ".pdf": {
        "content_type": "application/pdf",
        "signature": b"%PDF-",
    },
    ".jpg": {
        "content_type": "image/jpeg",
        "signature": b"\xff\xd8\xff",
    },
    ".jpeg": {
        "content_type": "image/jpeg",
        "signature": b"\xff\xd8\xff",
    },
    ".png": {
        "content_type": "image/png",
        "signature": b"\x89PNG\r\n\x1a\n",
    },
}


class DocumentService:

    def __init__(self, storage: S3Storage):
        self.storage = storage


    def validate_filename(self, filename: str) -> str:
        if not filename or not filename.strip():
            raise ValueError("Filename cannot be empty")

        if "/" in filename or "\\" in filename or "\x00" in filename:
            raise ValueError("Invalid filename")

        extension = os.path.splitext(filename)[1].lower()

        if extension not in SUPPORTED_DOCUMENT_TYPES:
            raise ValueError("Unsupported document extension")

        return extension  


    def validate_content_type(
        self,
        extension: str,
        content_type: str,
    ) -> None:

        expected_content_type = SUPPORTED_DOCUMENT_TYPES[extension]["content_type"]

        if content_type != expected_content_type:
            raise ValueError("Invalid document content type")



    def validate_file_signature(
        self,
        file_obj: BinaryIO,
        extension: str,
    ) -> None:

        expected_signature = SUPPORTED_DOCUMENT_TYPES[extension]["signature"]

        file_obj.seek(0)

        actual_signature = file_obj.read(len(expected_signature))

        file_obj.seek(0)

        if actual_signature != expected_signature:
            raise ValueError("Invalid document file signature")


    def validate_file_size(self, file_obj: BinaryIO) -> None:

        file_obj.seek(0, os.SEEK_END)

        file_size = file_obj.tell()

        file_obj.seek(0)

        if file_size > MAX_DOCUMENT_SIZE_BYTES:
            raise ValueError("Document exceeds maximum allowed size of 5 MB")


    def validate_document(
        self,
        file_obj: BinaryIO,
        filename: str,
        content_type: str,
    ) -> str:

        extension = self.validate_filename(filename)

        self.validate_content_type(
            extension,
            content_type,
        )

        self.validate_file_signature(
            file_obj,
            extension,
        )

        self.validate_file_size(file_obj)

        return extension

    
    def generate_storage_key(
        self,
        document_id: uuid.UUID,
        extension: str,
    ) -> str:

        storage_key = f"documents/{document_id}{extension}"

        return storage_key


    def save_document_metadata(
        self,
        db: Session,
        document_id: uuid.UUID,
        application_id: uuid.UUID,
        filename: str,
        content_type: str,
        storage_key: str,
    ) -> Document:

        document = Document(
            document_id=document_id,
            application_id=application_id,
            original_filename=filename,
            content_type=content_type,
            storage_key=storage_key,
        )

        db.add(document)

        try:
            db.flush()

            db.refresh(document)

            db.commit()

        except SQLAlchemyError:
            db.rollback()
            raise

        return document


    def upload_document(
        self,
        db: Session,
        application_id: uuid.UUID,
        file_obj: BinaryIO,
        filename: str,
        content_type: str,
    ) -> Document:

        # Step 1: Verify loan application exists
        LoanApplicationService.get_application(
            db,
            application_id,
        )

        # Step 2: Validate document
        extension = self.validate_document(
            file_obj,
            filename,
            content_type,
        )

        # Step 3: Generate document UUID
        document_id = uuid.uuid4()

        # Step 4: Generate S3 storage key
        storage_key = self.generate_storage_key(
            document_id,
            extension,
        )

        # Step 5: Upload document to S3
        self.storage.upload_file(
            file_obj=file_obj,
            storage_key=storage_key,
            content_type=content_type,
        )

        # Step 6: Save metadata in PostgreSQL
        try:
            document = self.save_document_metadata(
                db=db,
                document_id=document_id,
                application_id=application_id,
                filename=filename,
                content_type=content_type,
                storage_key=storage_key,
            )

        except Exception:

            # Compensating action: Delete uploaded S3 object
            try:
                self.storage.delete_file(storage_key)

                

            except Exception:
                logger.exception(
                    "Failed to clean up S3 object: %s",
                    storage_key,
                )
        

            raise

        return document