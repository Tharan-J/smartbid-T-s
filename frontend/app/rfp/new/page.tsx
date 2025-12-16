"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, CheckCircle2, AlertTriangle, ArrowRight, Bot, Terminal, Loader2 } from "lucide-react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";
import VeloraChat from "../../../components/VeloraChat";

export default function NewRFPAnalysisPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [logs, setLogs] = useState<{ agent: string, message: string, timestamp: string }[]>([]);
    const [result, setResult] = useState<any>(null);
    const [currentAgent, setCurrentAgent] = useState<string | null>(null);
    const [rfpFullText, setRfpFullText] = useState<string | null>(null);
    const logsEndRef = useRef<HTMLDivElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const startAnalysis = async () => {
        if (!file) return;

        setIsAnalyzing(true);
        setLogs([]);
        setResult(null);
        setRfpFullText(null);
        setCurrentAgent("Orchestrator");

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch(`${API_BASE_URL}/analyze-rfp-stream`, {
                method: "POST",
                body: formData,
            });

            if (!response.body) throw new Error("No response stream");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value);
                const lines = chunk.split("\n\n");
                
                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            
                            if (data.type === "context") {
                                setRfpFullText(data.rfp_text);
                            } else if (data.type === "status") {
                                setLogs(prev => [...prev, { 
                                    agent: data.agent, 
                                    message: data.message, 
                                    timestamp: new Date().toLocaleTimeString() 
                                }]);
                                setCurrentAgent(data.agent);
                                if (logsEndRef.current) {
                                    logsEndRef.current.scrollIntoView({ behavior: "smooth" });
                                }
                            } else if (data.type === "chunk") {
                                // Update active agent based on who is sending data
                                if (data.agent) {
                                    setCurrentAgent(data.agent);
                                }
                                // MERGE STATE from ALL agents
                                setResult((prev: any) => ({ ...prev, ...data.data }));
                            } else if (data.type === "complete") {
                                setIsAnalyzing(false);
                                setCurrentAgent(null);
                            } else if (data.type === "error") {
                                console.error(data.message);
                                setLogs(prev => [...prev, { agent: "System", message: `Error: ${data.message}`, timestamp: new Date().toLocaleTimeString() }]);
                                setIsAnalyzing(false);
                            }
                        } catch (e) {
                            console.error("Error parsing stream", e);
                        }
                    }
                }
            }
        } catch (error) {
            console.error(error);
            setIsAnalyzing(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!result?.final_proposal_summary) return;
        
        try {
            const res = await fetch(`${API_BASE_URL}/generate-pdf-from-text`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    report_text: result.final_proposal_summary,
                    filename: `SmartBid_${new Date().toISOString().split('T')[0]}.pdf`
                })
            });
            
            if (!res.ok) throw new Error("Failed to generate PDF");
            
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `SmartBid_Report.pdf`;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 100);
        } catch (e) {
            console.error(e);
            alert("Error downloading PDF");
        }
    };

    // --- New State for Click Interactions ---
    const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

    // --- Helper to get data for specific agent ---
    const getAgentData = (agent: string) => {
        if (!result) return null;
        switch (agent) {
            case "Sales Agent":
                return result.sales_agent_output || { status: "Pending", is_qualified: result.is_qualified };
            case "Technical Agent":
                return result.technical_agent_output ? {
                    technical_agent_output: result.technical_agent_output,
                    sku_recommendations: result.sku_recommendations,
                    spec_comparison: result.spec_comparison_table
                } : null;
            case "Pricing Agent":
                return result.pricing_agent_output ? {
                    pricing_agent_output: result.pricing_agent_output,
                    pricing_summary: result.pricing_summary
                } : null;
            case "Master Agent":
                return result.final_rfp_response ? {
                    overall_response_envelope: {
                        rfp_id: result.rfp_id,
                        rfp_metadata: result.rfp_metadata,
                        agent_pipeline_status: result.agent_pipeline_status,
                    },
                    final_rfp_response: result.final_rfp_response
                } : null;
            default:
                return null;
        }
    };

    const activeData = selectedAgent ? getAgentData(selectedAgent) : (result?.final_rfp_response || result);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white p-6 font-sans">
            <nav className="flex items-center gap-4 mb-8">
                <Link href="/rfps" className="text-slate-500 hover:text-blue-600 transition-colors">
                    &larr; Back to Dashboard
                </Link>
                <h1 className="text-2xl font-bold">New Agentic Analysis</h1>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
                {/* Left Panel: Input & Status */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Upload className="w-5 h-5 text-blue-500" />
                            Upload RFP Document
                        </h2>
                        
                        {!file ? (
                             <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-12 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer relative">
                                <input 
                                    type="file" 
                                    accept=".pdf" 
                                    onChange={handleFileChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                                <p className="font-medium text-slate-700 dark:text-slate-300">
                                    Drag and drop your PDF here
                                </p>
                                <p className="text-sm text-slate-500 mt-2">
                                    or click to browse
                                </p>
                            </div>
                        ) : (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-sm">{file.name}</div>
                                        <div className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB PDF</div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setFile(null)}
                                    className="text-slate-400 hover:text-red-500"
                                >
                                    Remove
                                </button>
                            </div>
                        )}

                        <button
                            onClick={startAnalysis}
                            disabled={!file || isAnalyzing}
                            className={`w-full mt-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                                !file || isAnalyzing 
                                ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                            }`}
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Agents Working...
                                </>
                            ) : (
                                <>
                                    Start Analysis <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </div>

                    {/* Agent Live Feed */}
                    <div className="bg-slate-900 text-slate-200 p-6 rounded-3xl border border-slate-800 shadow-inner min-h-[400px] flex flex-col font-mono text-sm">
                        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
                            <div className="flex items-center gap-2 font-bold text-white">
                                <Terminal className="w-4 h-4 text-emerald-500" />
                                Agent Activity Log
                            </div>
                            {currentAgent && (
                                <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full animate-pulse border border-blue-500/30">
                                    {currentAgent} Active
                                </span>
                            )}
                        </div>
                        
                        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                            {logs.length === 0 && !isAnalyzing && (
                                <div className="text-slate-600 italic text-center mt-20">
                                    Waiting for input...
                                </div>
                            )}
                            {logs.map((log, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex gap-3"
                                >
                                    <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                                    <div>
                                        <span className={`font-bold mr-2 ${
                                            log.agent === "sales_agent" ? "text-amber-400" :
                                            log.agent === "technical_agent" ? "text-blue-400" :
                                            log.agent === "pricing_agent" ? "text-emerald-400" : "text-slate-400"
                                        }`}>
                                            {log.agent}:
                                        </span>
                                        <span className="text-slate-300">{log.message}</span>
                                    </div>
                                </motion.div>
                            ))}
                            <div ref={logsEndRef} />
                        </div>
                    </div>
                </div>

                {/* Right Panel: Result Preview (Redesigned) */}
                <div className="space-y-6">
                    {result ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl"
                        >
                            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                                <h2 className="text-lg font-bold mb-4">Agent Pipeline Output</h2>
                                
                                {/* Pipeline Cards (Clickable) */}
                                <div className="grid grid-cols-4 gap-4">
                                    {[
                                        { name: "Sales Agent", color: "amber" },
                                        { name: "Technical Agent", color: "blue" },
                                        { name: "Pricing Agent", color: "emerald" },
                                        { name: "Master Agent", color: "purple" }
                                    ].map((agent) => (
                                        <motion.div
                                            key={agent.name}
                                            onClick={() => setSelectedAgent(prev => prev === agent.name ? null : agent.name)}
                                            className={`
                                                relative p-4 rounded-xl border cursor-pointer transition-all select-none
                                                ${selectedAgent === agent.name 
                                                    ? `bg-${agent.color}-50 dark:bg-${agent.color}-900/20 border-${agent.color}-500 shadow-md ring-2 ring-${agent.color}-500/20` 
                                                    : "bg-slate-50 dark:bg-slate-800 border-transparent hover:bg-slate-100 dark:hover:bg-slate-700"
                                                }
                                            `}
                                        >
                                            <div className="text-xs uppercase font-bold text-slate-500 mb-1">Step</div>
                                            <div className="text-sm font-bold leading-tight">{agent.name}</div>
                                            
                                            {/* Status Dot */}
                                            <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${
                                                // Simple logic for status colored dots
                                                (agent.name === "Sales Agent" && result.sales_agent_output) ||
                                                (agent.name === "Technical Agent" && result.technical_agent_output) ||
                                                (agent.name === "Pricing Agent" && result.pricing_agent_output) ||
                                                (agent.name === "Master Agent" && result.final_rfp_response)
                                                ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                                            }`}></div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* JSON / Data Display Area */}
                            <div className="p-0 bg-slate-950 min-h-[500px] border-t border-slate-800 font-mono text-xs overflow-hidden flex flex-col">
                                <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
                                    <div className="text-slate-400">
                                        Preview: <span className="text-blue-400 font-bold">{selectedAgent || "Final Master Output"}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                                        <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
                                        <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-auto p-4 custom-scrollbar text-slate-300">
                                    {activeData ? (
                                        <pre>{JSON.stringify(activeData, null, 2)}</pre>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full opacity-30 gap-2">
                                            <Loader2 className="w-8 h-8 animate-spin" />
                                            <p>Waiting for agent output...</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Summary Footer with INR */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                <div>
                                    <div className="text-xs text-slate-500 font-bold uppercase">Estimated Bid Value</div>
                                    <div className="text-lg font-bold">
                                        {result.total_bid_value ? `₹${result.total_bid_value.toLocaleString()}` : "..."}
                                    </div>
                                </div>
                                <button 
                                    onClick={handleDownloadPDF}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <FileText className="w-4 h-4" /> Download PDF Report
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50">
                            <Bot className="w-16 h-16 mb-4 opacity-20" />
                            <p className="text-lg font-medium">Results will appear here</p>
                            <p className="text-sm opacity-60">Upload a document to start the multi-agent workflow</p>
                        </div>
                    )}
                </div>
            </div>
            {result && (<VeloraChat rfpText={rfpFullText} agentData={result} />)}
        </div>
    );
}

function Badge({ children, check }: { children: React.ReactNode, check?: boolean }) {
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
            {check && <CheckCircle2 className="w-3 h-3" />}
            {children}
        </span>
    );
}
