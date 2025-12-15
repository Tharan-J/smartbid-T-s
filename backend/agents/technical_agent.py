from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from utils import get_gemini_model
from agents.state import AgentState

# Mock Datasheet Context
PRODUCT_CATALOG = """
1. CABLE-HV-001: High Voltage Copper Cable, 33kV, XLPE Insulation.
2. WIRE-LV-002: Low Voltage PVC Wire, 1.1kV, Copper.
3. CABLE-FO-003: Fiber Optic Cable, Single Mode, 24 Cores.
4. CABLE-AL-004: Aluminum Power Cable, 11kV.
"""

def technical_agent(state: AgentState) -> dict:
    """
    Extracts technical requirements and matches them to internal products.
    """
    print("--- TECHNICAL AGENT WORKING ---")
    
    if not state.get("is_qualified"):
        return {"status_updates": ["Technical Agent: Skipping (Not Qualified)."]}
        
    llm = get_gemini_model()
    
    prompt = ChatPromptTemplate.from_template(
        """
        You are the Technical Agent within the SmartBid.AI agentic system.
        Your role is to act as a Senior Systems Engineer responsible for interpreting
        technical requirements in industrial B2B RFPs and mapping them accurately to
        internal product SKUs.

        You deal with the following RFP Context provided by the Master Agent:
        {technical_summary}

================================
PRIMARY RESPONSIBILITIES
================================

1. STRICT SPEC EXTRACTION
- Extract ONLY specs explicitly stated in the RFP
- Mandatory specs include:
  - Voltage
  - Conductor material
  - Insulation type
  - Armouring
  - Referenced standards (IS / IEC)

2. SPEC MATCH SCORING (STRICT)
- All mandatory specs carry equal weight
- Missing ANY mandatory spec must reduce score
- Match score <70% indicates HIGH TECHNICAL RISK

3. SKU SELECTION RULES
- Select best SKU ONLY if it meets:
  - Voltage
  - Conductor material
- If no SKU meets mandatory specs:
  - Still select best available
  - BUT clearly mark as “Partial / Non-Compliant”

4. REMARKS MUST INCLUDE
- Explicit list of missing specs
- Compliance gaps
- Risk severity

================================
================================
OUTPUT RULES (CRITICAL)
================================

You MUST return a VALID JSON object (and nothing else) with this exact schema:

{{
    "matched_products": [
    {{
        "rfp_product_name": string,
        "key_specs": {{ "SpecName": "Value" }},
        "top_3_skus": [
        {{
            "sku": string,
            "match_score": number,
            "remarks": string
        }}
        ],
        "selected_sku": string,
        "estimated_qty": number
    }}
    ]
}}

- NO conversational text before or after the JSON.
- NO markdown formatting (like ```json).
- The JSON must be strictly valid.

Product Catalog: {catalog}
RFP Snippet: {rfp_text}
        """
    )
    
    chain = prompt | llm | JsonOutputParser()
    
    try:
        result = chain.invoke({
            "catalog": PRODUCT_CATALOG, 
            "rfp_text": state["rfp_text"][:10000],
            "technical_summary": state.get("technical_summary", "")
        })
        
        return {
            "matched_products": result.get("matched_products") or [],
            "status_updates": ["Technical Agent: 3-SKU comparison generated."]
        }
    except Exception as e:
        return {
            "matched_products": [],
            "status_updates": [f"Technical Agent: Error - {str(e)}"]
        }
