from enum import Enum
from typing import TypeVar


class ApplicationStatus(str, Enum):
    CREATED = "CREATED"
    DOCUMENTS_PENDING = "DOCUMENTS_PENDING"
    PROCESSING = "PROCESSING"
    VALIDATION = "VALIDATION"
    REVIEW = "REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class DocumentStatus(str, Enum):
    MISSING = "MISSING"
    UPLOADED = "UPLOADED"
    PROCESSING = "PROCESSING"
    PROCESSED = "PROCESSED"
    VALIDATION_REQUIRED = "VALIDATION_REQUIRED"
    VALID = "VALID"
    INVALID = "INVALID"


APPLICATION_STATUS_TRANSITIONS: dict[ApplicationStatus, set[ApplicationStatus]] = {
    ApplicationStatus.CREATED: {ApplicationStatus.DOCUMENTS_PENDING},
    ApplicationStatus.DOCUMENTS_PENDING: {ApplicationStatus.PROCESSING},
    ApplicationStatus.PROCESSING: {ApplicationStatus.VALIDATION},
    ApplicationStatus.VALIDATION: {ApplicationStatus.REVIEW},
    ApplicationStatus.REVIEW: {ApplicationStatus.APPROVED, ApplicationStatus.REJECTED},
    ApplicationStatus.APPROVED: set(),
    ApplicationStatus.REJECTED: set(),
}

DOCUMENT_STATUS_TRANSITIONS: dict[DocumentStatus, set[DocumentStatus]] = {
    DocumentStatus.MISSING: {DocumentStatus.UPLOADED},
    DocumentStatus.UPLOADED: {DocumentStatus.PROCESSING},
    DocumentStatus.PROCESSING: {DocumentStatus.PROCESSED},
    DocumentStatus.PROCESSED: {DocumentStatus.VALIDATION_REQUIRED, DocumentStatus.VALID},
    DocumentStatus.VALIDATION_REQUIRED: {DocumentStatus.VALID, DocumentStatus.INVALID},
    DocumentStatus.VALID: set(),
    DocumentStatus.INVALID: {DocumentStatus.UPLOADED},
}


EnumType = TypeVar("EnumType", bound=Enum)


def can_transition(
    transitions: dict[EnumType, set[EnumType]],
    current: EnumType,
    target: EnumType,
) -> bool:
    return target in transitions.get(current, set())