export const API_BASE_URL = "http://localhost:8000";

export async function fetchRFPs() {
    const res = await fetch(`${API_BASE_URL}/rfps`);
    if (!res.ok) throw new Error("Failed to fetch RFPs");
    return res.json();
}

export async function fetchRFPDetail(id: string) {
    const res = await fetch(`${API_BASE_URL}/rfp/${id}`);
    if (!res.ok) throw new Error("Failed to fetch RFP detail");
    return res.json();
}

export async function analyzeRFP(id: string) {
    const res = await fetch(`${API_BASE_URL}/analyze?rfp_id=${id}`);
    if (!res.ok) throw new Error("Failed to analyze RFP");
    return res.json();
}

export async function generateBidPDF(rfpId: string, companyName: string) {
    const res = await fetch(`${API_BASE_URL}/generate-pdf`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ rfp_id: rfpId, company_name: companyName }),
    });
    if (!res.ok) throw new Error("Failed to generate PDF");
    return res.blob();
}

export async function fetchAgentWorkflow(id: string) {
    const res = await fetch(`${API_BASE_URL}/agent-workflow/${id}`);
    if (!res.ok) throw new Error("Failed to fetch agent workflow");
    return res.json();
}
