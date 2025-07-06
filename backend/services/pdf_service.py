import PyPDF2
import pdfplumber
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

class PDFService:
    def __init__(self):
        pass
    
    def extract_text(self, pdf_path: str) -> str:
        """Extract text from PDF using multiple methods for robustness"""
        try:
            # First try with pdfplumber (better for complex layouts)
            text = self._extract_with_pdfplumber(pdf_path)
            if text and len(text.strip()) > 0:
                return text
            
            # Fallback to PyPDF2
            text = self._extract_with_pypdf2(pdf_path)
            if text and len(text.strip()) > 0:
                return text
            
            raise Exception("Could not extract text from PDF")
            
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {str(e)}")
            raise Exception(f"Failed to extract text from PDF: {str(e)}")
    
    def _extract_with_pdfplumber(self, pdf_path: str) -> str:
        """Extract text using pdfplumber"""
        try:
            text = ""
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            return text.strip()
        except Exception as e:
            logger.warning(f"pdfplumber extraction failed: {str(e)}")
            return ""
    
    def _extract_with_pypdf2(self, pdf_path: str) -> str:
        """Extract text using PyPDF2"""
        try:
            text = ""
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            return text.strip()
        except Exception as e:
            logger.warning(f"PyPDF2 extraction failed: {str(e)}")
            return "" 