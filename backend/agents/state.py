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
    
    # Technical Agent Outputs
    extracted_requirements: List[Dict[str, Any]]
    matched_products: List[Dict[str, Any]]
    
    # Pricing Agent Outputs
    pricing_line_items: List[Dict[str, Any]]
    total_bid_value: float
    
    # Final Output
    final_proposal_summary: str
