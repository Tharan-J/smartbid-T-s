from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from utils import get_gemini_model
from agents.state import AgentState

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
    "client_name": string,
    "project_title": string,
    "rfp_ref_number": string,
    "submission_deadline": string,
    "budget_raw": string,
    "products_in_scope": [string],
    "is_qualified": boolean,
    "qualification_reason": string
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
        result = chain.invoke({"rfp_text": state["rfp_text"][:10000]}) # Limit context
        return {
            "client_name": result.get("client_name", "Unknown"),
            "project_title": result.get("project_title", "Unknown"),
            "rfp_ref_number": result.get("rfp_ref_number", "Not specified in RFP"),
            "submission_deadline": result.get("submission_deadline", "Not specified in RFP"),
            "budget_raw": result.get("budget_raw", "Unknown"),
            "products_in_scope": result.get("products_in_scope") or [],
            "is_qualified": result.get("is_qualified", False),
            "qualification_reason": result.get("qualification_reason", "Analysis complete."),
            "status_updates": ["Sales Agent: RFP Qualified and Analyzed."]
        }
    except Exception as e:
        return {
            "is_qualified": False, 
            "qualification_reason": f"Error in analysis: {str(e)}",
            "status_updates": [f"Sales Agent: Error - {str(e)}"]
        }
