class ApplicationError(Exception):
    """Base class for application-level exceptions."""


class DuplicateCustomerError(ApplicationError):
    """Raised when a customer with the same email already exists."""


class CustomerNotFoundError(ApplicationError):
    """Raised when the requested customer does not exist."""