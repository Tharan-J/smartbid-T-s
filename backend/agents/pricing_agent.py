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
    print("--- PRICING AGENT WORKING ---", flush=True)
    try:
        ctx = state.get('pricing_summary', 'None')
        print(f"Context: {str(ctx)[:50]}...", flush=True)
    except:
        print("Context: Error printing context", flush=True)
    
    if not state.get("is_qualified"):
        return {"status_updates": ["Pricing Agent: Skipping (Not Qualified)."]}
        
    # We now look for 'technical_agent_output' or fallback to 'matched_products'
    # But for robustness, we'll try to use the new 'sku_recommendations' if available, 
    # coupled with 'scope_of_supply' for quantity.
    
    sku_recs = state.get("sku_recommendations") or []
    tech_output = state.get("technical_agent_output") or {}
    scope_supply = tech_output.get("scope_of_supply") or []
    
    # Fallback if new structure missing (legacy support handled via matched_products check below)
    matched = state.get("matched_products") or []

    try:
        material_pricing = []
        line_items_legacy = [] # Keep for legacy compatibility
        
        total_material_cost = 0.0
        
        import re

        # Testing costs (Dummy standard - moved to a list)
        TEST_COST_PER_PRODUCT = 5000 
        
        # 1. Calculate Material Pricing
        # Strategy: Iterate through scope items to find their selected SKUs in sku_recs
        
        # Create a map of RFP ID to Selected SKU
        rfp_sku_map = {}
        for item in sku_recs:
            rfp_sku_map[item.get("rfp_product_id")] = item.get("final_selected_sku")

        # If new structure is available, use it
        if scope_supply and sku_recs:
            for item in scope_supply:
                rfp_id = item.get("rfp_product_id")
                selected_sku = rfp_sku_map.get(rfp_id)
                
                qty_str = item.get("quantity", "0")
                
                # Sanitize quantity
                try:
                    qty_clean = re.sub(r"[^\d\.]", "", str(qty_str))
                    qty = float(qty_clean) if qty_clean else 100.0
                except:
                    qty = 100.0
                    
                unit_price = PRICE_LIST.get(selected_sku, 100) # Default
                total_price = qty * unit_price
                
                material_pricing.append({
                    "oem_sku": selected_sku,
                    "quantity": qty_str,
                    "unit_price_inr": unit_price,
                    "total_price_inr": total_price
                })
                
                total_material_cost += total_price
                
                # Populate legacy line items
                line_items_legacy.append({
                    "sku": selected_sku,
                    "product_name": item.get("product_description"),
                    "qty": qty,
                    "unit_price": unit_price,
                    "material_cost": total_price,
                    "testing_cost": TEST_COST_PER_PRODUCT, # Legacy mixed testing in
                    "total_cost": total_price + TEST_COST_PER_PRODUCT
                })

        # Fallback to old matched_products logic if new structure failed
        elif matched:
            for product_group in matched:
                sku = product_group.get("selected_sku", "")
                qty_raw = str(product_group.get("estimated_qty", 0))
                try:
                    qty_clean = re.sub(r"[^\d\.]", "", qty_raw)
                    qty = float(qty_clean) if qty_clean else 100.0
                except:
                    qty = 100.0
                    
                unit_price = PRICE_LIST.get(sku, 100)
                material_cost = qty * unit_price
                
                material_pricing.append({
                    "oem_sku": sku,
                    "quantity": qty_raw,
                    "unit_price_inr": unit_price,
                    "total_price_inr": material_cost
                })
                total_material_cost += material_cost
                
                line_items_legacy.append({
                    "sku": sku,
                    "product_name": product_group.get("rfp_product_name", "Unknown"),
                    "qty": qty,
                    "unit_price": unit_price,
                    "material_cost": material_cost,
                    "testing_cost": TEST_COST_PER_PRODUCT,
                    "total_cost": material_cost + TEST_COST_PER_PRODUCT
                })

        # 2. Testing Costs (Fixed for now)
        testing_pricing = [
            {
                "test_name": "Type Test",
                "test_category": "Factory",
                "cost_inr": 800000
            },
            {
                "test_name": "Acceptance Test",
                "test_category": "Site",
                "cost_inr": 300000
            }
        ]
        total_testing = sum(t["cost_inr"] for t in testing_pricing)
        
        grand_total = total_material_cost + total_testing

        return {
            # New Strict Structure
            "pricing_agent_output": {
                "material_pricing": material_pricing
            },
            "testing_pricing": testing_pricing,
            "pricing_summary": {
                "total_material_cost_inr": total_material_cost,
                "total_testing_cost_inr": total_testing,
                "grand_total_bid_value_inr": grand_total
            },
            
            # Legacy Fields
            "pricing_line_items": line_items_legacy,
            "total_bid_value": grand_total,
            
            "status_updates": ["Pricing Agent: Detailed costs calculated."]
        }
    except Exception as e:
        print(f"PRICING AGENT ERROR: {str(e)}", flush=True)
        return {
            "pricing_agent_output": {"material_pricing": []},
            "testing_pricing": [],
            "pricing_summary": {},
            "pricing_line_items": [],
            "total_bid_value": 0,
            "status_updates": [f"Pricing Agent: Error - {str(e)}"]
        }
