# custom_extensions/backend/app/services/lms_errors.py
class LMSExportError(Exception):
    """Custom exception for LMS export errors"""
    pass


class SmartDriveConnectionError(LMSExportError):
    """SmartDrive connection failed"""
    pass


class PDFGenerationError(LMSExportError):
    """PDF generation failed"""
    pass


class PublicLinkError(LMSExportError):
    """Public link creation failed"""
    pass 