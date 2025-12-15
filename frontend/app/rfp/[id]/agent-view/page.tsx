"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { fetchAgentWorkflow } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bot,
    Search,
    Database,
    Calculator,
    CheckCircle2,
    ArrowRight,
    Cpu,
    FileSearch,
    Server,
    ChevronLeft,
    Loader2
} from "lucide-react";
import Navbar from "@/components/Navbar";

export default function AgentWorkflowPage() {
    const params = useParams();
    const id = params?.id as string;

    const [workflow, setWorkflow] = useState<any>(null);
    const [currentStep, setCurrentStep] = useState(0); // 0: Init, 1: Sales, 2: Tech, 3: Pricing, 4: Done
    const [logs, setLogs] = useState<string[]>([]);

    useEffect(() => {
        if (!id) return;
        async function load() {
            try {
                const data = await fetchAgentWorkflow(id);
                setWorkflow(data);
                runSimulation();
            } catch (e) {
                console.error("Failed", e);
            }
        }
        load();
    }, [id]);

    const runSimulation = () => {
        const steps = [
            { step: 1, msg: "Master Agent: Initializing B2B Response Protocol..." },
            { step: 1, msg: "Sales Agent: Scanning infrastructure tendering portals..." },
            { step: 2, msg: "Sales Agent: RFP Identified. Qualifying against historical wins..." },
            { step: 2, msg: "Master Agent: Qualification Passed. Handing over to Technical Team." },
            { step: 3, msg: "Technical Agent: Parsing technical scope of supply..." },
            { step: 3, msg: "Technical Agent: Matching SKUs against internal product datasheet repository..." },
            { step: 4, msg: "Pricing Agent: Receiving BOM. Calculating material + testing costs..." },
            { step: 5, msg: "Master Agent: Consolidating final response package." },
        ];

        let delay = 0;
        steps.forEach((s, i) => {
            delay += 1500;
            setTimeout(() => {
                setCurrentStep(s.step);
                setLogs(prev => [...prev, s.msg]);
            }, delay);
        });
    };

    if (!workflow) return (
        <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white font-sans">
            <Navbar />

            <main className="pt-24 px-6 max-w-7xl mx-auto pb-20">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <Link href={`/rfp/${id}`} className="text-sm text-slate-500 hover:text-blue-500 mb-2 inline-flex items-center gap-1">
                            <ChevronLeft className="w-4 h-4" /> Back to Proposal
                        </Link>
                        <h1 className="text-3xl font-bold">Agentic AI Orchestration</h1>
                        <p className="text-slate-500">Real-time visualization of multi-agent RFP processing</p>
                    </div>
                    <div className="bg-slate-900 dark:bg-slate-800 text-white px-4 py-2 rounded-lg font-mono text-xs shadow-lg max-h-32 overflow-y-auto w-96 border border-slate-700">
                        {logs.map((log, i) => (
                            <div key={i} className="mb-1 text-green-400">$ {log}</div>
                        ))}
                        <div className="animate-pulse">_</div>
                    </div>
                </div>

                {/* Agents Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">

                    {/* Connecting Lines (Desktop) */}
                    <div className="hidden md:block absolute top-24 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800 -z-10">
                        <motion.div
                            className="h-full bg-blue-500"
                            initial={{ width: "0%" }}
                            animate={{ width: currentStep >= 4 ? "100%" : currentStep === 3 ? "66%" : currentStep === 2 ? "33%" : "0%" }}
                            transition={{ duration: 1 }}
                        />
                    </div>

                    {/* Sales Agent */}
                    <AgentCard
                        title="Sales Agent"
                        icon={Search}
                        isActive={currentStep >= 1}
                        isProcessing={currentStep === 1}
                        color="text-blue-500"
                        borderColor="border-blue-500"
                    >
                        <div className="space-y-4 text-sm">
                            <AgentField label="Source" value={workflow.agents.sales.scanned_url} />
                            <AgentField label="Status" value={workflow.agents.sales.status} badge="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" />
                            <div>
                                <div className="text-xs font-bold text-slate-400 uppercase mb-1">Qualification Criteria</div>
                                <div className="flex flex-wrap gap-2">
                                    {workflow.agents.sales.qualification_criteria.map((c: string, i: number) => (
                                        <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs">{c}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </AgentCard>

                    {/* Technical Agent */}
                    <AgentCard
                        title="Technical Agent"
                        icon={Cpu}
                        isActive={currentStep >= 3}
                        isProcessing={currentStep === 2}
                        color="text-purple-500"
                        borderColor="border-purple-500"
                        delay={0.2}
                    >
                        <div className="space-y-4 text-sm">
                            <AgentField label="Scope Extracted" value={`${workflow.agents.technical.scope_extracted.length} items identified`} />

                            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
                                <div className="text-xs font-bold text-slate-400 uppercase mb-2">SKU Matching</div>
                                {workflow.agents.technical.product_comparison.slice(0, 2).map((comp: any, i: number) => (
                                    <div key={i} className="mb-3 last:mb-0">
                                        <div className="text-xs text-slate-500 mb-1">Req: {comp.rfp_req}</div>
                                        <div className="flex items-center justify-between text-xs font-medium bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-100 dark:border-green-900/30 text-green-700 dark:text-green-400">
                                            <span>{comp.matches[0].name}</span>
                                            <span className="font-bold">{comp.matches[0].match_score}% Match</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </AgentCard>

                    {/* Pricing Agent */}
                    <AgentCard
                        title="Pricing Agent"
                        icon={Calculator}
                        isActive={currentStep >= 4}
                        isProcessing={currentStep === 3}
                        color="text-emerald-500"
                        borderColor="border-emerald-500"
                        delay={0.4}
                    >
                        <div className="space-y-4 text-sm">
                            <AgentField label="Strategy" value={workflow.agents.pricing.pricing_strategy} />

                            <div className="space-y-2">
                                <div className="flex justify-between items-center p-2 rounded bg-slate-50 dark:bg-slate-900">
                                    <span className="text-slate-500 text-xs">Material Cost</span>
                                    <span className="font-mono font-bold">₹{workflow.agents.pricing.material_cost.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center p-2 rounded bg-slate-50 dark:bg-slate-900">
                                    <span className="text-slate-500 text-xs">Testing Charges</span>
                                    <span className="font-mono font-bold">₹{workflow.agents.pricing.test_cost.toLocaleString()}</span>
                                </div>
                                <div className="h-px bg-slate-200 dark:bg-slate-700 my-2"></div>
                                <div className="flex justify-between items-center p-2 rounded bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                                    <span className="text-xs font-bold uppercase">Final Bid</span>
                                    <span className="font-mono font-bold text-lg">₹{workflow.agents.pricing.final_bid_value.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </AgentCard>

                </div>

                {/* Final Master Output */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: currentStep >= 5 ? 1 : 0, y: currentStep >= 5 ? 0 : 20 }}
                    className="mt-12 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl p-8 flex items-center justify-between shadow-2xl"
                >
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Bot className="w-6 h-6" />
                            <span className="font-bold text-lg tracking-wide">MASTER AGENT VERDICT</span>
                        </div>
                        <p className="opacity-80">RFP Response Package compiled successfully. Ready for manual review.</p>
                    </div>
                    <Link href={`/rfp/${id}`} className="px-6 py-3 bg-white dark:bg-black text-black dark:text-white font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                        View Final Proposal
                    </Link>
                </motion.div>

            </main>
        </div>
    );
}

function AgentCard({ title, icon: Icon, isActive, isProcessing, children, color, borderColor, delay = 0 }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className={`relative bg-white dark:bg-slate-900 rounded-2xl border-t-4 shadow-xl p-6 ${isActive ? borderColor : 'border-slate-200 dark:border-slate-800'} ${!isActive && 'opacity-50 grayscale'}`}
        >
            {isProcessing && (
                <div className="absolute top-4 right-4 animate-spin text-slate-400">
                    <Loader2 className="w-5 h-5" />
                </div>
            )}
            {isActive && !isProcessing && (
                <div className="absolute top-4 right-4 text-green-500">
                    <CheckCircle2 className="w-6 h-6" />
                </div>
            )}

            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isActive ? 'bg-slate-100 dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-900'}`}>
                <Icon className={`w-6 h-6 ${isActive ? color : 'text-slate-400'}`} />
            </div>

            <h3 className="text-xl font-bold mb-6">{title}</h3>

            <div>{children}</div>
        </motion.div>
    );
}

function AgentField({ label, value, badge }: any) {
    return (
        <div>
            <div className="text-xs font-bold text-slate-400 uppercase mb-1">{label}</div>
            {badge ? (
                <span className={`px-2 py-1 rounded text-xs font-bold ${badge}`}>{value}</span>
            ) : (
                <div className="font-medium text-slate-800 dark:text-slate-200 truncate" title={value}>{value}</div>
            )}
        </div>
    );
}
