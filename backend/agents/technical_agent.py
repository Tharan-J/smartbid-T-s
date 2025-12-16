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
        OUTPUT CONTRACT (CRITICAL)
        ================================

        You MUST return a VALID JSON object (and nothing else) with this exact schema:

        {{
        "technical_agent_output": {{
            "scope_of_supply": [
            {{
                "rfp_product_id": "RFP-PROD-01",
                "product_description": string,
                "quantity": string,
                "standards": [string],
                "application": string
            }}
            ]
        }},
        "sku_recommendations": [
            {{
            "rfp_product_id": "RFP-PROD-01",
            "evaluated_parameters_count": number,
            "recommended_skus": [
                {{
                "oem_sku": string,
                "spec_match_percentage": number,
                "matching_parameters": number,
                "non_matching_parameters": number,
                "remarks": string,
                "rank": number
                }}
            ],
            "final_selected_sku": string
            }}
        ],
        "spec_comparison_table": [
            {{
            "parameter": string,
            "rfp_requirement": string,
            "sku_1": string,
            "sku_2": string,
            "sku_3": string
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
        
        # --- Legacy Mapper for Global State compatibility ---
        # We need to map the new structure back to 'matched_products' so Pricing agent (if not updated yet) and Master (if not updated) can still work temporarily
        # PRO TIP: We will update Pricing agent next, but it's good practice.
        
        legacy_matched_products = []
        sku_recs = result.get("sku_recommendations", [])
        scope_map = { item.get("rfp_product_id"): item for item in result.get("technical_agent_output", {}).get("scope_of_supply", []) }
        
        for item in sku_recs:
            pid = item.get("rfp_product_id")
            scope_info = scope_map.get(pid, {})
            
            # Map top 3 skus
            top_3 = []
            for sku in item.get("recommended_skus", []):
                top_3.append({
                    "sku": sku.get("oem_sku"),
                    "match_score": sku.get("spec_match_percentage"),
                    "remarks": sku.get("remarks", "No remarks")
                })
            
            legacy_matched_products.append({
                "rfp_product_name": scope_info.get("product_description", "Unknown Product"),
                "key_specs": {"Standard": str(scope_info.get("standards", []))},
                "top_3_skus": top_3,
                "selected_sku": item.get("final_selected_sku"),
                "estimated_qty": scope_info.get("quantity", "0")
            })

        return {
            "technical_agent_output": result.get("technical_agent_output") or {"scope_of_supply": []},
            "sku_recommendations": result.get("sku_recommendations") or [],
            "spec_comparison_table": result.get("spec_comparison_table") or [],
            
            # Legacy field populated from new data
            "matched_products": legacy_matched_products,
            
            "status_updates": ["Technical Agent: 3-SKU comparison generated."]
        }
    except Exception as e:
        print(f"TECHNICAL AGENT ERROR: {str(e)}")
        # Fallback structure
        return {
            "technical_agent_output": {"scope_of_supply": []},
            "sku_recommendations": [],
            "spec_comparison_table": [],
            "matched_products": [],
            "status_updates": [f"Technical Agent: Error - {str(e)}"]
        }
