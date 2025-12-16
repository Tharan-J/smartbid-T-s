from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from utils import get_gemini_model
from agents.state import AgentState
import datetime

def sales_agent(state: AgentState) -> dict:
    """
    Analyzes the RFP text to determine qualification status and extract metadata.
    """
    print("--- SALES AGENT WORKING ---")
    llm = get_gemini_model()
    if not llm:
        return {"status_updates": ["Error: Gemini API Key missing."]}

    prompt = ChatPromptTemplate.from_template(
        """
        You are the Sales Agent within the SmartBid.AI agentic system.
        Your role is to act as an RFP discovery and intake specialist for an industrial
        OEM supplying wires and cables to PSUs and large infrastructure projects.

        You DO NOT decide technical feasibility or pricing.
        You DO NOT approve or reject bids.
        You ONLY identify and select an RFP for further processing.

        ================================
        PRIMARY RESPONSIBILITIES
        ================================

        1. RFP IDENTIFICATION & INTAKE
        - Read the provided RFP text carefully.
        - Treat the RFP document as the only source of truth.
        - Extract high-level metadata required to initiate bid processing.

        2. MANDATORY METADATA EXTRACTION
        You MUST extract:
        - Issuing Authority (Client)
        - Project Title
        - RFP Reference Number
        - Submission Deadline
        - Products explicitly listed in the Scope of Supply

        If any field is missing:
        - Return "Not specified in RFP"
        - Do NOT infer or assume values.

        3. PRODUCT SCOPE RULES (STRICT)
        - Include ONLY products explicitly listed in the Scope of Supply section.
        - Do NOT generalize product categories.
        - Do NOT add inferred items (e.g., “Electrical Conductors”) unless explicitly stated.

        4. RFP SELECTION DECISION
        Your decision flag indicates ONLY whether this RFP should be
        FORWARDED to the Master Agent for analysis.

        Set:
        - is_qualified = true → RFP is relevant and within deadline
        - is_qualified = false → RFP is irrelevant, expired, or malformed

        This is NOT a bid approval decision.

        ================================
        ================================
        OUTPUT CONTRACT (CRITICAL)
        ================================

        You MUST return a VALID JSON object (and nothing else) with this exact schema:

        {{
          "sales_agent_output": {{
            "rfp_discovery": {{
              "scan_timestamp": "AUTO_GENERATED_TIMESTAMP",
              "urls_scanned": ["https://psu-tenders.gov.in", "https://lstk-executor.com/tenders"],
              "rfps_found": 1
            }},
            "qualified_rfps": [
              {{
                "rfp_id": string, // Use Reference Number
                "client_name": string,
                "project_title": string,
                "due_date": string,
                "products_in_scope": [string],
                "qualification_reason": [string], // List of reasons why it was selected
                "selection_status": "SELECTED" // or "REJECTED"
              }}
            ]
          }}
        }}

        - NO conversational text before or after the JSON.
        - NO markdown formatting (like ```json).
        - The JSON must be strictly valid.

        ================================
        EVALUATION CRITERIA
        ================================

        - No hallucinated products
        - Exact extraction from RFP text
        - Conservative interpretation
        - Clean, machine-readable JSON


                RFP Text:
                {rfp_text}
        """
    )
    
    chain = prompt | llm | JsonOutputParser()
    
    try:
        result = chain.invoke({"rfp_text": state["rfp_text"][:30000]}) # Limit context
        
        # Normalize the output if the LLM skips the root key slightly, but aim for exact match
        sales_output = result.get("sales_agent_output", {})
        qualified_rfps = sales_output.get("qualified_rfps", [])
        
        # Determine qualification based on the list
        is_qualified = False
        final_reason = "No qualified RFP found in text."
        
        if qualified_rfps:
             # Assuming we process the first one if multiple are returned (usually 1 per doc)
             first_rfp = qualified_rfps[0]
             if first_rfp.get("selection_status") == "SELECTED":
                 is_qualified = True
                 final_reason = "; ".join(first_rfp.get("qualification_reason", ["Qualified based on criteria."]))

        # We inject the structured output into a state key that the Master Agent can pick up later
        # We also flat-map some essential keys for global state convenience if needed, 
        # but the heavy lifting is now in the structured object.
        
        # Helper to safely get first rfp data for top-level state
        first_data = qualified_rfps[0] if qualified_rfps else {}

        return {
            "sales_agent_output": sales_output,
            
            # --- Legacy/Global State Support ---
            "client_name": first_data.get("client_name", "Unknown"),
            "project_title": first_data.get("project_title", "Unknown"),
            "rfp_ref_number": first_data.get("rfp_id", "Not specified"),
            "submission_deadline": first_data.get("due_date", "Not specified"),
            "products_in_scope": first_data.get("products_in_scope", []),
            "is_qualified": is_qualified,
            "qualification_reason": final_reason,
            
            "status_updates": ["Sales Agent: RFP Qualified and Analyzed."]
        }
    except Exception as e:
        print(f"SALES AGENT ERROR: {str(e)}")
        # Return a valid structure even on error so frontend doesn't break
        error_output = {
            "rfp_discovery": {
                "scan_timestamp": datetime.datetime.now().isoformat(),
                "urls_scanned": [],
                "rfps_found": 0
            },
            "qualified_rfps": []
        }
        return {
            "sales_agent_output": error_output,
            "is_qualified": False, 
            "qualification_reason": f"Error in analysis: {str(e)}",
            "status_updates": [f"Sales Agent: Error - {str(e)}"]
        }
