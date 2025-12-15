from agents.state import AgentState

# Mock Pricing Database
PRICE_LIST = {
    "CABLE-HV-001": 1500,
    "WIRE-LV-002": 45,
    "CABLE-FO-003": 120,
    "CABLE-AL-004": 350
}

def pricing_agent(state: AgentState) -> dict:
    """
    Calculates the detailed pricing for the matched products.
    """
    print("--- PRICING AGENT WORKING ---")
    print(f"Context: {state.get('pricing_summary', 'None')[:50]}...")
    
    if not state.get("is_qualified"):
        return {"status_updates": ["Pricing Agent: Skipping (Not Qualified)."]}
        
    matched = state.get("matched_products", [])
    line_items = []
    total_val = 0.0
    
    import re

    # Testing costs (Dummy standard)
    TEST_COST_PER_PRODUCT = 5000 
    
    for product_group in matched:
        # product_group contains "selected_sku", "estimated_qty", "rfp_product_name"
        sku = product_group.get("selected_sku", "")
        
        # Sanitize quantity: Remove non-numeric chars (allow dots)
        qty_raw = str(product_group.get("estimated_qty", 0))
        try:
            # Extract number from string like "120 KM" -> "120"
            qty_clean = re.sub(r"[^\d\.]", "", qty_raw)
            if not qty_clean:
                qty = 100.0 # Default fallback
            else:
                qty = float(qty_clean)
        except:
            qty = 100.0
            
        unit_price = PRICE_LIST.get(sku, 100) # Default
        
        material_cost = qty * unit_price
        testing_cost = TEST_COST_PER_PRODUCT # Flat fee per product line type
        
        line_total = material_cost + testing_cost
        
        line_items.append({
            "sku": sku,
            "product_name": product_group.get("rfp_product_name", "Unknown"),
            "qty": qty,
            "unit_price": unit_price,
            "material_cost": material_cost,
            "testing_cost": testing_cost,
            "total_cost": line_total
        })
        total_val += line_total
        
    return {
        "pricing_line_items": line_items,
        "total_bid_value": total_val,
        "status_updates": ["Pricing Agent: Detailed costs calculated."]
    }
