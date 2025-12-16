import os
import fitz  # PyMuPDF
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv()

def get_gemini_model():
    """Returns a configured Gemini Chat model."""
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        # Fallback for dev/demo if not set, though production should fail
        print("WARNING: GOOGLE_API_KEY not found in env.")
        return None
        
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash-lite",
        temperature=0.2, # Low temp for factual extraction
        google_api_key=api_key,
        convert_system_message_to_human=True
    )
    return llm

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extracts text from a PDF file using PyMuPDF."""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text
