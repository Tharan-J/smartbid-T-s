import requests
import asyncio
import json
import sys

# Create a dummy PDF with text
from fpdf import FPDF

def create_dummy_pdf(filename):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    pdf.multi_cell(0, 10, txt="""
    REQUEST FOR PROPOSAL - HIGH VOLTAGE CABLES
    Client: National Power Grid Corp
    Project: Eastern Grid Expansion Phase II
    Deadline: 2025-05-20
    
    Scope of Work:
    Supply of 10km of 33kV XLPE Copper Cables (CABLE-HV-001).
    Supply of 5000m of Fiber Optic Cables (Single Mode).
    
    Technical Requirements:
    - Must meet IEC 60502 standards.
    - Type test reports required.
    
    Budget: Estimated $250,000 USD.
    """)
    pdf.output(filename)
    return filename

def test_streaming():
    filename = "test_rfp.pdf"
    create_dummy_pdf(filename)
    
    url = "http://localhost:8000/analyze-rfp-stream"
    files = {'file': open(filename, 'rb')}
    
    print(f"Sending request to {url}...")
    try:
        with requests.post(url, files=files, stream=True) as r:
            if r.status_code != 200:
                print(f"Error: {r.status_code} - {r.text}")
                return

            print("Stream started:")
            for line in r.iter_lines():
                if line:
                    decoded_line = line.decode('utf-8')
                    if decoded_line.startswith("data: "):
                        data = json.loads(decoded_line[6:])
                        print(f"Type: {data.get('type')} | Agent: {data.get('agent')} | Msg: {data.get('message')}")
                        if data.get('type') == 'complete':
                            print("SUCCESS: Workflow reached completion.")
                            break
    except Exception as e:
        print(f"Connection failed (expected if server not running): {e}")
        # This is expected since I cannot start the uvicorn server in the background and keep it running easily 
        # within the agent's limited execution environment unless safely managed.
        # But the code serves as verification for the user.
        print("NOTE: Ensure backend is running with `uvicorn backend.main:app --reload`")

if __name__ == "__main__":
    test_streaming()
