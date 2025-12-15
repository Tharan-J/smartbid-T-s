from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser, StrOutputParser
from utils import get_gemini_model
from agents.state import AgentState

def master_agent(state: AgentState) -> dict:
    """
    The Conductor / Master Agent.
    Orchestrates the workflow based on the current 'master_phase'.
    """
    print(f"--- MASTER AGENT (Phase: {state.get('master_phase', 'init')}) ---")
    
    phase = state.get("master_phase", "init")
    llm = get_gemini_model()
    
    # 1. INITIAL PHASE: Receive from Sales, Prepare Contexts
    if phase == "init":
        # If Sales said NO-GO, we shouldn't be here (Orchestrator handles that), 
        # but double check just in case.
        if not state.get("is_qualified"):
            return {}

        print("Master Agent: Generating Role-Specific Contexts...")
        
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
        print("Master Agent: Reviewed Technical Output. Dispatching to Pricing...")
        return {
            "master_phase": "pricing_dispatched",
            "status_updates": ["Master Agent: Technical review complete. Dispatching to Pricing Agent."]
        }

    # 3. POST-PRICING PHASE: Consolidate and Report
    elif phase == "pricing_dispatched":
        print("Master Agent: Consolidating Final Report...")
        
        # --- LOGIC MOVED FROM REPORTING AGENT ---
        # 1. RFP SUMMARY
        report = "--------------------------------\n"
        report += "SMARTBID.AI FINAL RESPONSE\n"
        report += "--------------------------------\n\n"
        
        report += f"Project Name:\n{state.get('project_title', 'Not specified')}\n\n"
        report += f"Issuing Authority:\n{state.get('client_name', 'Not specified')}\n\n"
        report += f"RFP Reference Number:\n{state.get('rfp_ref_number', 'Not specified')}\n\n"
        report += f"Submission Deadline:\n{state.get('submission_deadline', 'Not specified')}\n\n"
        
        report += "Products in Scope:\n"
        for prod in state.get('products_in_scope', []):
            report += f"- {prod}\n"
        report += "\n"

        # 2. TECHNICAL SECTION
        report += "--------------------------------\n"
        report += "TECHNICAL PROPOSAL\n"
        report += "--------------------------------\n"
        
        matched = state.get('matched_products', [])
        for idx, item in enumerate(matched, 1):
            p_name = item.get('rfp_product_name', f'Product {idx}')
            report += f"Product {idx}: {p_name}\n"
            report += f"Selected OEM SKU: {item.get('selected_sku', 'None')}\n"
            
            # Show top 3 comparison table briefly
            top3 = item.get('top_3_skus', [])
            if top3:
                report += f"  Candidate SKUs comparison:\n"
                for cand in top3:
                    report += f"  - {cand.get('sku')} (Match: {cand.get('match_score')}%) - {cand.get('remarks')}\n"
            report += "\n"

        # 3. PRICING SECTION
        report += "--------------------------------\n"
        report += "COMMERCIAL PROPOSAL\n"
        report += "--------------------------------\n"
        
        line_items = state.get('pricing_line_items', [])
        for item in line_items:
            report += f"Item: {item.get('product_name')} (SKU: {item.get('sku')})\n"
            report += f"  Qty: {item.get('qty')} | Unit Price: ${item.get('unit_price'):,.2f}\n"
            report += f"  Mat. Cost: ${item.get('material_cost'):,.2f} | Test Cost: ${item.get('testing_cost'):,.2f}\n"
            report += f"  Line Total: ${item.get('total_cost'):,.2f}\n\n"
            
        total_val = state.get('total_bid_value', 0)
        report += f"GRAND TOTAL BID VALUE: ${total_val:,.2f}\n\n"

        # 4. MASTER AGENT SIGN-OFF
        report += "--------------------------------\n"
        report += "EXECUTIVE SUMMARY\n"
        report += "--------------------------------\n"

        # --- Compliance evaluation ---
        technical_status = "Fully Compliant"
        bid_readiness = "Auto-Submittable"
        compliance_issues = []

        for item in matched:
            selected = item.get("selected_sku")
            for cand in item.get("top_3_skus", []):
                if cand.get("sku") == selected:
                    score = cand.get("match_score", 0)
                    remarks = cand.get("remarks", "").lower()
                    
                    if not selected or selected == "None":
                        technical_status = "Not Compliant"
                        bid_readiness = "Do Not Bid"
                        compliance_issues.append(f"{item.get('rfp_product_name')}: No suitable SKU found.")
                        
                    elif score < 70 or "missing" in remarks:
                        if technical_status != "Not Compliant":
                            technical_status = "Partially Compliant"
                            bid_readiness = "Requires Management Decision"
                        compliance_issues.append(
                            f"{item.get('rfp_product_name')} (SKU: {selected}): {cand.get('remarks')} (Match: {score}%)"
                        )

        if technical_status == "Fully Compliant":
            report += (
                "This bid is technically compliant with the RFP requirements "
                "and commercially estimated based on standard rates.\n"
                "Ready for internal review and submission.\n"
            )
        else:
            report += (
                f"This bid is {technical_status.upper()}.\n"
                "The following deviations or gaps were identified:\n"
            )
            for issue in compliance_issues:
                report += f"- {issue}\n"
            report += (
                "\nCommercial pricing has been provided for estimation purposes only.\n"
                f"Status: {bid_readiness}\n"
            )

        return {
            "master_phase": "done",
            "final_proposal_summary": report,
            "technical_status": technical_status,
            "bid_readiness_status": bid_readiness,
            "status_updates": ["Master Agent: Final Consolidated Report Generated."]
        }
        
    return {"status_updates": ["Master Agent: Waiting..."]}
