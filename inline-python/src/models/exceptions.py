"""Custom exceptions for the application."""

class BotError(Exception):
    """Base exception for bot errors."""
    pass

class NotionSyncError(BotError):
    """Raised when Notion synchronization fails."""
    pass

class SearchError(BotError):
    """Raised when search operations fail."""
    pass

class CacheError(BotError):
    """Raised when cache operations fail."""
    pass 