"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, CheckCircle2, AlertTriangle, ArrowRight, Bot, Terminal, Loader2, Search, Brain, Cpu, Calculator, CheckCircle, Package, DollarSign, ListChecks, FileOutput, ShieldCheck, Download, Split, ArrowDownRight, ArrowDownLeft, FileJson, Layers } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api";
import VeloraChat from "../../../components/VeloraChat";

// --- Icons Helper ---
function SearchIcon(props: any) { return <Search {...props} />; }
function BrainIcon(props: any) { return <Brain {...props} />; }
function CpuIcon(props: any) { return <Cpu {...props} />; }
function CalculatorIcon(props: any) { return <Calculator {...props} />; }
function CheckIcon(props: any) { return <CheckCircle {...props} />; }

// --- Workflow Data Configuration ---
const WORKFLOW_STEPS = [
    {
        id: 0,
        title: "Input Processing",
        subtitle: "Document Ingestion",
        icon: SearchIcon,
        agentColor: "text-amber-500",
        bgGradient: "from-amber-500/20 to-orange-500/20",
        agentId: "upload"
    },
    {
        id: 1,
        title: "Master Agent",
        subtitle: "Context Splitting",
        icon: BrainIcon,
        agentColor: "text-purple-500",
        bgGradient: "from-purple-500/20 to-indigo-500/20",
        agentId: "master_agent_context"
    },
    {
        id: 2,
        title: "Technical Agent",
        subtitle: "Engineering Analysis",
        icon: CpuIcon,
        agentColor: "text-blue-500",
        bgGradient: "from-blue-500/20 to-cyan-500/20",
        agentId: "technical_agent"
    },
    {
        id: 3,
        title: "Pricing Agent",
        subtitle: "Commercial Calculation",
        icon: CalculatorIcon,
        agentColor: "text-emerald-500",
        bgGradient: "from-emerald-500/20 to-green-500/20",
        agentId: "pricing_agent"
    },
    {
        id: 4,
        title: "Master Agent (Final)",
        subtitle: "Consolidation",
        icon: CheckIcon,
        agentColor: "text-indigo-500",
        bgGradient: "from-indigo-500/20 to-violet-500/20",
        agentId: "master_agent_final"
    }
];

export default function NewRFPAnalysisPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [logs, setLogs] = useState<{ agent: string, message: string, timestamp: string }[]>([]);
    const [result, setResult] = useState<any>(null);
    const [currentAgent, setCurrentAgent] = useState<string | null>(null); 
    const [rfpFullText, setRfpFullText] = useState<string | null>(null);
    const [activeStep, setActiveStep] = useState<number>(0);
    
    // --- New View Mode State ---
    const [viewMode, setViewMode] = useState<"visual" | "json">("visual");
    const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
    const logsEndRef = useRef<HTMLDivElement>(null);

    // --- Dynamic Step Mapping Logic ---
    useEffect(() => {
        if (!isAnalyzing && !result) {
            setActiveStep(0); // Reset to input
            return;
        }

        // Map currentAgent string from backend to Step ID
        if (currentAgent === "technical_agent") setActiveStep(2);
        else if (currentAgent === "pricing_agent") setActiveStep(3);
        else if (currentAgent === "Orchestrator" || currentAgent === "master_agent") {
            if (result?.pricing_agent_output || result?.total_bid_value) {
                setActiveStep(4);
            } else if (result?.technical_agent_output) {
                if (currentAgent === "pricing_agent") setActiveStep(3);
                else setActiveStep(2);
            } else {
                setActiveStep(1);
            }
        }
    }, [currentAgent, result, isAnalyzing]);

    // Force scroll to bottom of logs
    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [logs]);

    // Fallback: If calculation is done but step is wrong, force 4
    useEffect(() => {
        if (!isAnalyzing && result?.total_bid_value) {
            setActiveStep(4);
        }
    }, [isAnalyzing, result]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const startAnalysis = async () => {
        if (!file) return;

        // Backend Health Check
        try {
            const healthRes = await fetch(`${API_BASE_URL}/health`);
            if (!healthRes.ok) throw new Error("Backend not healthy");
        } catch (error) {
            toast.error("Not connected to backend", {
                description: "Backend not available due to web scraping is not allowed when hosted online",
                duration: Infinity,
                closeButton: true,
                action: {
                    label: "Retry",
                    onClick: () => startAnalysis(),
                },
            });
            return;
        }

        setIsAnalyzing(true);
        setLogs([]);
        setResult(null);
        setRfpFullText(null);
        setCurrentAgent("Orchestrator"); 
        setActiveStep(1); 

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
                            } else if (data.type === "chunk") {
                                if (data.agent) {
                                    setCurrentAgent(data.agent);
                                }
                                setResult((prev: any) => ({ ...prev, ...data.data }));
                            } else if (data.type === "complete") {
                                setIsAnalyzing(false);
                                setCurrentAgent(null);
                                setActiveStep(4); 
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
             setTimeout(() => { document.body.removeChild(a); window.URL.revokeObjectURL(url); }, 100);
         } catch (e) { console.error(e); alert("Error downloading PDF"); }
     };

     const getPricingItems = () => {
         if (result?.pricing_agent_output?.material_pricing) {
             return result.pricing_agent_output.material_pricing.map((item:any) => ({
                 sku: item.oem_sku,
                 price: item.unit_price_inr,
                 qty: item.quantity,
                 total: item.total_price_inr
             }));
         }
         return result?.pricing_line_items?.map((item:any) => ({
             sku: item.sku, price: item.unit_price, qty: item.qty, total: item.total_cost
         })) || [];
     };

    // --- Helper to get data for specific agent for JSON View ---
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
            <nav className="flex items-center gap-4 mb-4">
                <Link href="/rfps" className="text-slate-500 hover:text-blue-600 transition-colors">
                    &larr; Back
                </Link>
                <h1 className="text-xl font-bold">New Agentic Analysis</h1>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl mx-auto h-[cal(100vh-100px)]">
                
                {/* LEFT COLUMN: Input & Steps & Logs (Fixed Spacing: 4 cols) */}
                <div className="lg:col-span-4 space-y-6 flex flex-col h-full overflow-hidden">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative shrink-0">
                        <div className="relative z-10">
                            <h2 className="text-lg font-bold mb-6 flex items-center gap-3">
                                <Upload className="w-5 h-5 text-blue-500" />
                                Review Document
                            </h2>
                            {!file ? (
                                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-10 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer relative mb-6">
                                    <input 
                                        type="file" 
                                        accept=".pdf" 
                                        onChange={handleFileChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                    <FileText className="w-10 h-10 text-slate-400 mx-auto mb-4" />
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Upload PDF
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center shrink-0">
                                            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="text-sm truncate font-medium">{file.name}</div>
                                    </div>
                                    {!isAnalyzing && (
                                        <button onClick={() => setFile(null)} className="text-slate-400 hover:text-red-500 p-2">X</button>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={startAnalysis}
                                disabled={!file || isAnalyzing}
                                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all ${
                                    !file || isAnalyzing 
                                    ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 transform hover:scale-[1.02]"
                                }`}
                            >
                                {isAnalyzing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    "Start Analysis"
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="bg-slate-900 text-slate-200 p-4 rounded-3xl border border-slate-800 shadow-inner flex-1 flex flex-col font-mono text-xs overflow-hidden min-h-[200px]">
                        <div className="flex items-center justify-between mb-2 border-b border-slate-800 pb-2 shrink-0">
                            <div className="flex items-center gap-2 font-bold text-white">
                                <Terminal className="w-3 h-3 text-emerald-500" />
                                Activity Log
                            </div>
                            {currentAgent && (
                                <span className="text-[10px] px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full animate-pulse border border-blue-500/30">
                                    {currentAgent}
                                </span>
                            )}
                        </div>
                        
                        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                            {logs.length === 0 && !isAnalyzing && (
                                <div className="text-slate-600 italic text-center mt-10">
                                    Ready...
                                </div>
                            )}
                            {logs.map((log, i) => (
                                <div key={i} className="flex gap-2">
                                    <span className="text-slate-600 shrink-0">[{log.timestamp.split(' ')[0]}]</span>
                                    <div>
                                        <span className={`font-bold mr-1 ${
                                            log.agent === "sales_agent" ? "text-amber-400" :
                                            log.agent === "technical_agent" ? "text-blue-400" :
                                            log.agent === "pricing_agent" ? "text-emerald-400" : "text-slate-400"
                                        }`}>
                                            {log.agent}:
                                        </span>
                                        <span className="text-slate-300 break-words">{log.message}</span>
                                    </div>
                                </div>
                            ))}
                            <div ref={logsEndRef} />
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Visual Output (8 cols) */}
                <div className="lg:col-span-8 space-y-4">
                    {/* View Mode Toggle */}
                     <div className="flex justify-end">
                        <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex items-center text-xs font-bold">
                            <button
                                onClick={() => setViewMode("visual")}
                                className={`px-4 py-2 rounded-md transition-all ${
                                    viewMode === "visual" 
                                    ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white"
                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                }`}
                            >
                                Visual Report
                            </button>
                            <button
                                onClick={() => setViewMode("json")}
                                className={`px-4 py-2 rounded-md transition-all ${
                                    viewMode === "json"
                                    ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white"
                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                }`}
                            >
                                Live Terminal
                            </button>
                        </div>
                    </div>

                    <div className="min-h-[600px] flex flex-col">
                        <AnimatePresence mode="wait">
                            {viewMode === "visual" ? (
                                <motion.div
                                    key="visual-mode"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="h-full"
                                >
                                    {activeStep === 0 && (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50">
                                            <Bot className="w-20 h-20 mb-6 opacity-20" />
                                            <p className="text-xl font-medium mb-2">Ready to Analyze</p>
                                            <p className="text-sm opacity-60">Upload a request for proposal to begin the agentic workflow.</p>
                                        </div>
                                    )}

                                    {activeStep === 1 && (
                                        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-8 border border-slate-200 dark:border-slate-800">
                                            
                                            <div className="flex items-center justify-between mb-12">
                                                <div>
                                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Context Separation</h3>
                                                    <p className="text-slate-500 dark:text-slate-400">Master Agent effectively routes information to sub-specialists.</p>
                                                </div>
                                                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl">
                                                    <Layers className="w-8 h-8" />
                                                </div>
                                            </div>

                                            <div className="flex-1 relative flex flex-col md:flex-row items-center justify-center gap-12">
                                                {/* Source File */}
                                                <div className="w-full md:w-1/3 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md relative group">
                                                    <div className="absolute top-0 right-0 p-4 opacity-50"><FileText className="w-24 h-24 text-slate-100 dark:text-slate-800" /></div>
                                                    <div className="relative z-10">
                                                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-4">
                                                            <FileText className="w-5 h-5 text-slate-600" />
                                                        </div>
                                                        <h4 className="font-bold mb-1">Raw RFP</h4>
                                                        <p className="text-xs text-slate-500 mb-4">{file?.name || "No document"}</p>
                                                        {rfpFullText && (
                                                            <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-mono">
                                                                {rfpFullText.length > 1000 ? `${(rfpFullText.length/1000).toFixed(1)}k` : rfpFullText.length} Tokens
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Split indicator */}
                                                    <div className="absolute -right-6 top-1/2 -translate-y-1/2 hidden md:flex z-20">
                                                        <div className="bg-purple-500 text-white rounded-full p-2 shadow-lg">
                                                            <Split className="w-5 h-5" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Branches */}
                                                <div className="w-full md:w-2/3 grid grid-rows-2 gap-6 relative">
                                                     {/* Tech Branch */}
                                                     <motion.div 
                                                        initial={{x: 20, opacity: 0}}
                                                        animate={{x: 0, opacity: 1}}
                                                        transition={{delay: 0.2}}
                                                        className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex items-center gap-4 relative overflow-hidden"
                                                     >
                                                         <div className="absolute inset-y-0 left-0 w-1 bg-blue-500"></div>
                                                         <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 shrink-0">
                                                             <Cpu className="w-6 h-6" />
                                                         </div>
                                                         <div>
                                                             <h5 className="font-bold text-blue-900 dark:text-blue-100">Technical Context</h5>
                                                             <p className="text-xs text-blue-700 dark:text-blue-300">Specifications, Standards, BoQ extracted for Engineer Agent.</p>
                                                         </div>
                                                     </motion.div>

                                                     {/* Commercial Branch */}
                                                     <motion.div 
                                                        initial={{x: 20, opacity: 0}}
                                                        animate={{x: 0, opacity: 1}}
                                                        transition={{delay: 0.4}}
                                                        className="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-4 relative overflow-hidden"
                                                     >
                                                         <div className="absolute inset-y-0 left-0 w-1 bg-emerald-500"></div>
                                                         <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 shrink-0">
                                                             <span className="text-xl font-bold flex items-center justify-center">₹</span>
                                                         </div>
                                                         <div>
                                                             <h5 className="font-bold text-emerald-900 dark:text-emerald-100">Commercial Context</h5>
                                                             <p className="text-xs text-emerald-700 dark:text-emerald-300">Pricing terms, Penalties, Payment Schedules extracted for Pricing Agent.</p>
                                                         </div>
                                                     </motion.div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeStep === 2 && (
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-xl font-bold flex items-center gap-3">
                                                    <Cpu className="w-6 h-6 text-blue-500" /> Technical Recommendations
                                                </h3>
                                                <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-xs font-bold">
                                                    {result?.sku_recommendations?.length || 0} Matches
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                                {result?.sku_recommendations?.map((rec: any, i: number) => (
                                                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-6 items-start hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                                                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
                                                            <Package className="w-6 h-6 text-slate-500" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <h4 className="font-bold text-lg">{rec.matched_sku || rec.final_selected_sku || "Custom Eng. Item"}</h4>
                                                                <span className="text-sm font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">
                                                                    {rec.match_confidence || "95%"} Match
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-slate-500 mb-4">{rec.product_description || rec.requirement || "Technical requirement matched from product catalog."}</p>
                                                            
                                                            {rec.reasoning && (
                                                                <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700 italic">
                                                                    " {rec.reasoning} "
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                                {(!result?.sku_recommendations || result.sku_recommendations.length === 0) && (
                                                    <div className="p-12 text-center text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                                                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                                                        Searching product database for matches...
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {activeStep === 3 && (
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-xl font-bold flex items-center gap-3">
                                                    <Calculator className="w-6 h-6 text-emerald-500" /> Pricing Analysis
                                                </h3>
                                            </div>

                                            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-sm text-left">
                                                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase text-xs font-bold">
                                                            <tr>
                                                                <th className="px-6 py-4">Item / SKU</th>
                                                                <th className="px-6 py-4">Rate (INR)</th>
                                                                <th className="px-6 py-4">Qty</th>
                                                                <th className="px-6 py-4 text-right">Total</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                            {getPricingItems().map((item: any, i: number) => (
                                                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                                    <td className="px-6 py-4 font-medium">{item.sku || "Item"}</td>
                                                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">₹{item.price?.toLocaleString() || 0}</td>
                                                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{item.qty || 1}</td>
                                                                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white text-right">
                                                                        ₹{item.total?.toLocaleString() || 0}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                {getPricingItems().length === 0 && (
                                                     <div className="p-12 text-center text-slate-400">
                                                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                                                        Calculating commercial output...
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {activeStep === 4 && (
                                        <div className="h-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl flex flex-col">
                                            
                                            <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-100 dark:border-slate-800">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                                        <Bot className="w-8 h-8" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Proposal Ready</h2>
                                                            <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded text-xs font-bold uppercase tracking-wide">Success</span>
                                                        </div>
                                                        <p className="text-slate-500 text-sm">Generated by Velora Agent Swarm</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm text-slate-500 uppercase font-bold tracking-wider mb-1">Total Estimated Value</div>
                                                    <div className="text-3xl font-bold text-slate-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">
                                                        {result?.total_bid_value ? `₹${result.total_bid_value.toLocaleString()}` : "..."}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                                                <div className="space-y-4">
                                                    <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                                                                <ShieldCheck className="w-5 h-5" />
                                                            </div>
                                                            <span className="font-semibold text-slate-700 dark:text-slate-200">Compliance Score</span>
                                                        </div>
                                                        <span className="text-xl font-bold text-blue-600">100%</span>
                                                    </div>
                                                    
                                                    <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-amber-100 dark:bg-amber-900/20 text-amber-600 rounded-lg">
                                                                <AlertTriangle className="w-5 h-5" />
                                                            </div>
                                                            <span className="font-semibold text-slate-700 dark:text-slate-200">Risk Detected</span>
                                                        </div>
                                                        <span className="text-lg font-bold text-amber-600">Low</span>
                                                    </div>
                                                </div>

                                                <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                                                    <h4 className="font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                                                        <FileOutput className="w-5 h-5 text-slate-400" /> Deliverables
                                                    </h4>
                                                    <ul className="space-y-3">
                                                        <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Technical Compliance Matrix
                                                        </li>
                                                        <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Commercial Bill of Quantities
                                                        </li>
                                                        <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Manufacturer Authorization Letters
                                                        </li>
                                                        <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Executive Summary
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>

                                            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4">
                                                <button 
                                                    onClick={handleDownloadPDF}
                                                    className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transform hover:-translate-y-1 transition-all flex items-center gap-2"
                                                >
                                                    <Download className="w-5 h-5" /> Download Full Proposal Package
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="json-mode"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
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
                                                        (agent.name === "Sales Agent" && result?.sales_agent_output) ||
                                                        (agent.name === "Technical Agent" && result?.technical_agent_output) ||
                                                        (agent.name === "Pricing Agent" && result?.pricing_agent_output) ||
                                                        (agent.name === "Master Agent" && result?.final_rfp_response)
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
                                                {result?.total_bid_value ? `₹${result.total_bid_value.toLocaleString()}` : "..."}
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
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Chatbot (Floating) */}
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
