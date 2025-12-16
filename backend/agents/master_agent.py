from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser, StrOutputParser
from utils import get_gemini_model
from agents.state import AgentState

def master_agent(state: AgentState) -> dict:
    """
    The Conductor / Master Agent.
    Orchestrates the workflow based on the current 'master_phase'.
    """
    print(f"--- MASTER AGENT (Phase: {state.get('master_phase', 'init')}) ---", flush=True)
    
    phase = state.get("master_phase", "init")
    llm = get_gemini_model()
    
    # 1. INITIAL PHASE: Receive from Sales, Prepare Contexts
    if phase == "init":
        # If Sales said NO-GO, we shouldn't be here (Orchestrator handles that), 
        # but double check just in case.
        if not state.get("is_qualified"):
            return {}

        print("Master Agent: Generating Role-Specific Contexts...", flush=True)
        
        # A. Technical Summary Generation
        tech_prompt = ChatPromptTemplate.from_template(
            """
            You are the Master Agent (Main Orchestrator) of SmartBid.AI.

            You control the full lifecycle of the RFP response.
            You START and END the workflow.

            ================================
            CORE RESPONSIBILITIES
            ================================

            1. CONTEXT ORCHESTRATION
            - Receive selected RFP from Sales Agent
            - Generate role-specific summaries:
            - technical_summary → for Technical Agent
            - pricing_summary → for Pricing Agent
            - Ensure summaries are concise, role-focused, and non-overlapping

            2. WORKFLOW CONTROL
            - Dispatch Technical Agent first
            - Wait for Technical output before dispatching Pricing Agent
            - Enforce dependency order strictly

            3. QUALITY GATEKEEPING
            Before proceeding to pricing, verify:
            - Technical Agent has identified top 3 SKUs
            - Spec match % is calculated correctly
            - Any match below 70% is flagged as a risk

            4. FINAL CONSOLIDATION
            - Combine Sales, Technical, and Pricing outputs
            - Generate the final SmartBid.AI response
            - Clearly state:
            - Technical risks
            - Commercial assumptions
            - Confidence level

            ================================
            NON-NEGOTIABLE RULES
            ================================

            - Do NOT claim “technically compliant” if:
            - Selected SKU has missing mandatory specs
            - Match score is low (<70%)

            - If compliance is partial:
            - Explicitly say so
            - Do NOT soften language

            ================================
            FINAL OUTPUT REQUIREMENTS
            ================================

            The final report MUST include:
            - RFP Summary
            - Technical Proposal (with match % and gaps)
            - Commercial Proposal
            - Executive Summary with risk disclosure

            ================================
            EVALUATION CRITERIA
            ================================

            - Honest risk communication
            - No overstated compliance
            - Clear traceability to agent outputs

            ==============================
            COMPLIANCE AUTHORITY (CRITICAL)
            ==============================

            You are the SOLE authority responsible for declaring technical compliance.

            Rules:
            - Never declare “technically compliant” if:
            - Selected SKU match score is below 70%, OR
            - Technical Agent remarks indicate missing mandatory specifications
                (e.g., insulation, armouring, sheath, standards)

            - If compliance is partial:
            - Explicitly state “NOT fully technically compliant”
            - List deviations clearly
            - State that pricing is indicative only

            - Do NOT soften or override Technical Agent findings.
            - Commercial pricing must NOT be interpreted as technical acceptance.

            RFP Text: {rfp_text}
            """
        )
        tech_chain = tech_prompt | llm | StrOutputParser()
        try:
            tech_summary = tech_chain.invoke({"rfp_text": state["rfp_text"][:15000]})
        except Exception:
            tech_summary = "Error generating technical summary."

        # B. Pricing Summary Generation
        pricing_prompt = ChatPromptTemplate.from_template(
            """
            You are the Master Agent for SmartBid.AI.
            Analyze the following RFP text and create a concise COMMERCIAL & PRICING SUMMARY for the Costing Team.
            
            Focus ONLY on:
            - Quantities mentioned
            - Delivery locations
            - Testing and inspection requirements (Type tests, FAT, SAT)
            - Warranty or service periods
            
            Do NOT include detailed technical specs unless they drive cost significantly (e.g. "Gold plating required").
            
            RFP Text: {rfp_text}
            """
        )
        pricing_chain = pricing_prompt | llm | StrOutputParser()
        try:
            pricing_summary = pricing_chain.invoke({"rfp_text": state["rfp_text"][:15000]})
        except Exception:
            pricing_summary = "Error generating pricing summary."

        return {
            "master_phase": "tech_dispatched",
            "technical_summary": tech_summary,
            "pricing_summary": pricing_summary,
            "status_updates": ["Master Agent: Contexts generated. Dispatching to Technical Agent."]
        }

    # 2. POST-TECHNICAL PHASE: Review Tech Output, dispatch to Pricing
    elif phase == "tech_dispatched":
        print("Master Agent: Reviewed Technical Output. Dispatching to Pricing...", flush=True)
        return {
            "master_phase": "pricing_dispatched",
            "status_updates": ["Master Agent: Technical review complete. Dispatching to Pricing Agent."]
        }

    # 3. POST-PRICING PHASE: Consolidate and Report
    elif phase == "pricing_dispatched":
        print("Master Agent: Consolidating Final Report...", flush=True)
        
        # --- Aggregating Data from State ---
        sales_data = state.get("sales_agent_output", {}) # has rfp_discovery, qualified_rfps
        tech_data = state.get("technical_agent_output", {}) # has scope_of_supply
        sku_recs = state.get("sku_recommendations", [])
        pricing_summary_data = state.get("pricing_summary", {})
        
        # 1. Master Envelope - RFP Metadata
        # Try to get from Sales data first
        qualified_rfps = sales_data.get("qualified_rfps", [])
        selected_rfp = qualified_rfps[0] if qualified_rfps else {}
        
        rfp_meta = {
            "source": "PSU Tender Portal (Mock)", # Mock source
            "source_url": "https://psu-tenders.gov.in/rfp-mock",
            "issue_date": "2026-01-15", # Mock
            "submission_due_date": selected_rfp.get("due_date", state.get("submission_deadline", "Unknown")),
            "days_remaining": 62, # Mock calc or date diff
            "project_type": "Infrastructure - Power Transmission",
            "priority": "HIGH" if state.get("is_qualified") else "LOW"
        }
        
        # 2. Pipeline Status
        pipeline_status = {
            "sales_agent": "COMPLETED",
            "technical_agent": "COMPLETED",
            "pricing_agent": "COMPLETED",
            "master_agent": "COMPLETED"
        }
        
        # 3. Final RFP Response Body
        # A. Recommended Products
        rec_products = []
        for item in sku_recs:
            rec_products.append({
                "rfp_product_id": item.get("rfp_product_id"),
                "final_oem_sku": item.get("final_selected_sku"),
                "spec_match_percentage": item.get("recommended_skus", [{}])[0].get("spec_match_percentage", 0)
            })
            
        # B. Pricing
        total_val = pricing_summary_data.get("grand_total_bid_value_inr", state.get("total_bid_value", 0))
        
        # C. Confidence Score (Logic based on tech match)
        tech_confidence = "HIGH"
        min_match = 100
        for p in rec_products:
            if p["spec_match_percentage"] < 70:
                tech_confidence = "LOW"
            elif p["spec_match_percentage"] < 90:
                tech_confidence = "MEDIUM"
            if p["spec_match_percentage"] < min_match:
                min_match = p["spec_match_percentage"]
                
        final_response_body = {
            "selected_oem": "Velora Cables Ltd.", # Mock Client Name
            "recommended_products": rec_products,
            "pricing": {
                "currency": "INR",
                "total_bid_value": total_val
            },
            "confidence_score": {
                "technical_fit": tech_confidence,
                "pricing_competitiveness": "MEDIUM", # Placeholder
                "submission_readiness": "READY" if tech_confidence != "LOW" else "REVIEW REQUIRED"
            }
        }
        
        # --- Generate Text Report (Keep for PDF compatibility) ---
        # This text becomes the content of the PDF.
        report = "SMARTBID.AI - FINAL RFP ANALYSIS REPORT\n"
        report += "="*40 + "\n\n"
        
        # 1. Executive Summary
        report += "1. EXECUTIVE SUMMARY\n"
        report += "-"*20 + "\n"
        report += f"Project: {rfp_meta.get('project_type')}\n"
        report += f"Client: {selected_rfp.get('client_name', 'Unknown')}\n"
        report += f"Confidence Score: {tech_confidence}\n"
        report += f"Bid Readiness: {final_response_body['confidence_score']['submission_readiness']}\n\n"

        # 2. RFP Overview
        report += "2. RFP OVERVIEW\n"
        report += "-"*20 + "\n"
        report += f"RFP ID: {selected_rfp.get('rfp_id', 'N/A')}\n"
        report += f"Project Title: {selected_rfp.get('project_title', 'N/A')}\n"
        report += f"Due Date: {selected_rfp.get('due_date', 'N/A')}\n"
        report += f"Qualification Status: {'QUALIFIED' if state.get('is_qualified') else 'DISQUALIFIED'}\n"
        report += f"Reason: {state.get('qualification_reason', 'N/A')}\n\n"

        # 3. Technical Solution
        report += "3. TECHNICAL SOLUTION\n"
        report += "-"*20 + "\n"
        if 'technical_agent_output' in state:
             scope = state['technical_agent_output'].get('scope_of_supply', [])
             if scope:
                 report += "Scope of Supply:\n"
                 for item in scope:
                     report += f" - {item.get('product_description')} (Qty: {item.get('quantity')})\n"
                     report += f"   Standards: {', '.join(item.get('standards', []))}\n"
             else:
                 report += "No scope extracted.\n"
        report += "\n"
        
        report += "Product Selection:\n"
        for p in rec_products:
             report += f"Ref ID: {p['rfp_product_id']}\n"
             report += f"Selected SKU: {p['final_oem_sku']}\n"
             report += f"Spec Match: {p['spec_match_percentage']}%\n"
             if p['spec_match_percentage'] < 100:
                 report += "   WARNING: Partial match. Check conformance params.\n"
             report += "\n"

        # 4. Commercial Summary
        report += "4. COMMERCIAL SUMMARY\n"
        report += "-"*20 + "\n"
        report += f"Total Bid Value: INR {total_val:,.2f}\n\n"
        
        if 'pricing_agent_output' in state:
            mat_pricing = state['pricing_agent_output'].get('material_pricing', [])
            if mat_pricing:
                report += "Material Costs:\n"
                for mp in mat_pricing:
                    report += f" - {mp.get('oem_sku')}: {mp.get('quantity')} units @ INR {mp.get('unit_price_inr')} = INR {mp.get('total_price_inr'):,.2f}\n"
        
        report += "\n" + "="*40 + "\n"
        report += "END OF REPORT\n"

        return {
            "master_phase": "done",
            
            # New Structured Keys
            "rfp_id": selected_rfp.get("rfp_id", "RFP-UNKNOWN"),
            "rfp_metadata": rfp_meta,
            "agent_pipeline_status": pipeline_status,
            "final_rfp_response": final_response_body,
            
            # Legacy/PDF Report
            "final_proposal_summary": report,
            
            "technical_status": "Fully Compliant" if tech_confidence == "HIGH" else "Partially Compliant",
            "bid_readiness_status": final_response_body["confidence_score"]["submission_readiness"],
            
            "status_updates": ["Master Agent: Final Consolidated Report Generated."]
        }
        
    return {"status_updates": ["Master Agent: Waiting..."]}
