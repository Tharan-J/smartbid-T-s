from typing import TypedDict, List, Dict, Any, Annotated
import operator

class AgentState(TypedDict):
    """The shared state between agents."""
    rfp_text: str
    rfp_id: str
    status_updates: Annotated[List[str], operator.add]
    
    # Master Agent State
    master_phase: str  # "init", "tech_dispatched", "pricing_dispatched", "aggregating"
    technical_summary: str
    pricing_summary: str
    technical_status: str # "Fully Compliant", "Partially Compliant", "Not Compliant"
    bid_readiness_status: str # "Auto-Submittable", "Requires Management Decision", "Do Not Bid"

    # Sales Agent Outputs
    is_qualified: bool
    qualification_reason: str
    client_name: str
    project_title: str
    rfp_ref_number: str
    submission_deadline: str
    budget_raw: str
    products_in_scope: List[str]
    
    # New Structured Sales Output
    sales_agent_output: Dict[str, Any]

    # Technical Agent Outputs
    extracted_requirements: List[Dict[str, Any]]
    matched_products: List[Dict[str, Any]]
    
    # New Structured Technical Output
    technical_agent_output: Dict[str, Any]
    sku_recommendations: List[Dict[str, Any]]
    spec_comparison_table: List[Dict[str, Any]]
    
    # Pricing Agent Outputs
    pricing_line_items: List[Dict[str, Any]]
    total_bid_value: float
    
    # New Structured Pricing Output
    pricing_agent_output: Dict[str, Any]
    testing_pricing: List[Dict[str, Any]]
    
    # NOTE: 'pricing_summary' was str in master agent prompt usage. 
    # Master agent logic currently writes a Dict to it in new schema, but reads str in 'phases'. 
    # We should keep it flexible or careful. The prompts use it as text context. 
    # Master Agent Phase 1 writes a STRING to 'pricing_summary'. 
    # Pricing Agent writes a DICT to 'pricing_summary' in the new return? 
    # WAIT: pricing_agent.py returns "pricing_summary": {...dict...}
    # This CONFLICTS with Master Agent "init" phase which sets 'pricing_summary' as string context for pricing agent.
    # We need to distinguish them.
    # PROPOSAL: Let's rename the structured one or use Any. 
    # Actually, Master Agent uses 'pricing_summary' string to pass context to Pricing Agent.
    # Pricing Agent returns 'pricing_summary' DICT as result. 
    # Be careful. Let's start with Any to allow both, but ideally should be separate.
    # Let's change Pricing Agent's output key to 'pricing_output_summary' to avoid overwriting the Context string?
    # NO, the user schema requires 'pricing_summary' in 'pricing_agent_output'? 
    # User schema: "pricing_summary": { ... } inside the response? 
    # The user schema provided: "pricing_agent_output": { "material_pricing": ... }, "pricing_summary": { ... } DO (top level).
    # This overwrites the string context. That might be fine if we don't need the string context afterwards.
    # But Master Agent uses `state.get("pricing_summary")` to consolidate?
    # In 'pricing_dispatched' phase, `pricing_summary_data = state.get("pricing_summary", {})`.
    # It expects a Dict there!
    # BUT in 'init' phase, it sets `pricing_summary` as a String (LLM output).
    # So the type changes mid-stream. Any is required.
    pricing_summary: Any 
    
    # Final Output
    final_proposal_summary: str
    
    # New Structured Master Output
    rfp_metadata: Dict[str, Any]
    agent_pipeline_status: Dict[str, Any]
    final_rfp_response: Dict[str, Any]
