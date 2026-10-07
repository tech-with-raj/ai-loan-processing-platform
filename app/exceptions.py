class ApplicationError(Exception):
    """Base class for application-level exceptions."""


class DuplicateCustomerError(ApplicationError):
    """Raised when a customer with the same email already exists."""


class CustomerNotFoundError(ApplicationError):
    """Raised when the requested customer does not exist."""

    
class DatabaseOperationError(ApplicationError):
    """Raised when a database operation fails."""    


class ApplicationNotFoundError(ApplicationError):
    """Raised when the requested loan application does not exist."""
