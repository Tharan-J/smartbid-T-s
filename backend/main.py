from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
import fitz  # PyMuPDF
from fpdf import FPDF
import datetime
import json
import asyncio
from utils import extract_text_from_pdf
from agents.orchestrator import agent_app
from agents.state import AgentState

app = FastAPI(title="SmartBid.AI API", version="2.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODELS ---

class BidRequest(BaseModel):
    rfp_id: str
    company_name: str

class AgentInput(BaseModel):
    rfp_text: str

# --- API ENDPOINTS ---

class PDFRequest(BaseModel):
    report_text: str
    filename: str = "SmartBid_Report.pdf"

@app.post("/generate-pdf-from-text")
def generate_pdf_from_text(request: PDFRequest):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=10)
    
    # Simple text wrapping
    # FPDF's multi_cell handles wrapping
    try:
        # Sanitize text to avoid latin-1 codec errors common in FPDF
        # Replace characters not supported by Latin-1
        text = request.report_text.encode('latin-1', 'replace').decode('latin-1')
        pdf.multi_cell(0, 8, txt=text)
    except Exception as e:
        print(f"PDF Gen Error: {e}")
        pdf.multi_cell(0, 8, txt="Error encoding text for PDF.")
        
    # 'S' returns the document as a string.
    pdf_out = pdf.output(dest='S')
    # Encode to bytes
    pdf_bytes = pdf_out.encode('latin-1')
    
    return StreamingResponse(
        iter([pdf_bytes]), 
        media_type="application/pdf", 
        headers={"Content-Disposition": f"attachment; filename={request.filename}"}
    )

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/analyze-rfp-stream")
async def analyze_rfp_stream(file: UploadFile = File(...)):
    """
    Uploads a PDF, extracts text, and streams the agent workflow progress.
    """
    try:
        contents = await file.read()
        text = extract_text_from_pdf(contents)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid PDF: {str(e)}")

    async def event_generator():
        # Initialize state
        initial_state = AgentState(
            rfp_text=text,
            rfp_id="TEMP-ID",
            status_updates=[],
            master_phase="init",
            technical_summary="",
            pricing_summary="",
            technical_status="Pending",
            bid_readiness_status="Pending",
            is_qualified=False,
            qualification_reason="",
            client_name="",
            project_title="",
            budget_raw="",
            extracted_requirements=[],
            matched_products=[],
            pricing_line_items=[],
            total_bid_value=0.0,
            final_proposal_summary=""
        )

        try:
            # Stream events from LangGraph
            async for event in agent_app.astream(initial_state):
                # event is a dict like {'sales_agent': {'is_qualified': ...}}
                for agent_name, state_update in event.items():
                    # Send a specific status update event
                    if "status_updates" in state_update and state_update["status_updates"]:
                        latest_msg = state_update["status_updates"][-1]
                        yield f"data: {json.dumps({'type': 'status', 'agent': agent_name, 'message': latest_msg})}\n\n"
                    
                    # Yield partial results if needed
                    yield f"data: {json.dumps({'type': 'chunk', 'agent': agent_name, 'data': state_update})}\n\n"
            
            # Send Final Result signal
            # We can't easily get the *final* state from the stream unless we track it or use astream_events
            # But the last chunk usually contains the accumulators. 
            yield f"data: {json.dumps({'type': 'complete', 'message': 'Workflow Finished'})}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


# --- OLD MOCK ENDPOINTS (KEPT FOR REFERENCE/COMPATIBILITY IF NEEDED) ---

MOCK_RFPS = [
    {"id": "1", "title": "Supply of High-Performance Laptops", "client": "Dept of Education", "budget": "$500,000"},
    {"id": "2", "title": "Cloud Migration", "client": "City Transport", "budget": "$1.2M"},
]

@app.get("/rfps")
def get_rfps():
    return MOCK_RFPS

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
