from langgraph.graph import StateGraph, END
from agents.state import AgentState
from agents.sales_agent import sales_agent
from agents.master_agent import master_agent
from agents.technical_agent import technical_agent
from agents.pricing_agent import pricing_agent

def define_graph():
    workflow = StateGraph(AgentState)
    
    # Add Nodes
    workflow.add_node("sales_agent", sales_agent)
    workflow.add_node("master_agent", master_agent)
    workflow.add_node("technical_agent", technical_agent)
    workflow.add_node("pricing_agent", pricing_agent)
    
    # Define Edges - ENTRY
    workflow.set_entry_point("sales_agent")
    workflow.add_edge("sales_agent", "master_agent")
    
    # STAR ROUTING LOGIC (Master Agent Decisions)
    def master_router(state):
        phase = state.get("master_phase", "init")
        
        # 1. If Sales said No, we stop immediately (Master Agent 'init' check handles this too, 
        #    but we can also short-circuit here if 'is_qualified' is False)
        if not state.get("is_qualified"):
            return END
            
        # 2. Phase Transitions
        if phase == "tech_dispatched":
            return "technical_agent"
        elif phase == "pricing_dispatched":
            return "pricing_agent"
        elif phase == "done":
            return END
        
        return END

    workflow.add_conditional_edges(
        "master_agent",
        master_router,
        {
            "technical_agent": "technical_agent",
            "pricing_agent": "pricing_agent",
            END: END
        }
    )
    
    # Worker Agents always report back to Master
    workflow.add_edge("technical_agent", "master_agent")
    workflow.add_edge("pricing_agent", "master_agent")
    
    return workflow.compile()

# Global Compiled Graph
agent_app = define_graph()
