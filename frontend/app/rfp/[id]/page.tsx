"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { analyzeRFP, generateBidPDF, fetchRFPDetail } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronLeft,
    FileCheck,
    AlertTriangle,
    CheckCircle2,
    DollarSign,
    Clock,
    Briefcase,
    FileText,
    Download,
    Share2,
    Bookmark,
    Building2,
    Calendar,
    Bot
} from "lucide-react";

export default function RFPDetailPage() {
    const params = useParams();
    const id = params?.id as string;

    const [rfp, setRfp] = useState<any>(null);
    const [analysis, setAnalysis] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [generatedPdf, setGeneratedPdf] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        async function loadData() {
            try {
                const [rfpData, analysisData] = await Promise.all([
                    fetchRFPDetail(id),
                    analyzeRFP(id)
                ]);
                setRfp(rfpData);
                setAnalysis(analysisData);
            } catch (e) {
                console.error("Error loading data", e);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [id]);

    async function handleGenerateBid() {
        setGenerating(true);
        try {
            const blob = await generateBidPDF(id, "Velora Intelligence Inc.");
            // Ensure it has the correct type
            const pdfBlob = blob.type === "application/pdf" ? blob : new Blob([blob], { type: "application/pdf" });
            const url = window.URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Velora_Proposal_${id}.pdf`;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 100);
            setGeneratedPdf("Success");
        } catch (e) {
            console.error(e);
            alert("Failed to generate bid");
        } finally {
            setGenerating(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black text-slate-900 dark:text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-xl font-medium animate-pulse">Analyzing Opportunity...</div>
                    <div className="text-sm text-slate-500 max-w-xs text-center">Comparing requirements against company capabilities and historical data.</div>
                </div>
            </div>
        );
    }

    if (!rfp || !analysis) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black p-8">
                <div className="text-center max-w-md">
                    <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold dark:text-white mb-2">Analysis Failed</h2>
                    <p className="text-slate-500 mb-6">We couldn't retrieve the necessary data for this RFP. It might have expired or been removed.</p>
                    <Link href="/rfps">
                        <button className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-black rounded-lg font-medium">Return to Dashboard</button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white pb-32 transition-colors duration-300 font-sans selection:bg-blue-500/30">
            {/* Nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-6 h-16 flex items-center justify-between">
                <Link href="/rfps" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ChevronLeft className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Back to Opportunities</span>
                </Link>
                <div className="hidden md:flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Analysis ID: {rfp.id?.substring(0, 8)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Share2 className="w-5 h-5" /></button>
                    <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Bookmark className="w-5 h-5" /></button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto pt-24 px-6 space-y-8">

                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-900/50 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                        <FileCheck className="w-64 h-64" />
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8">
                        <div className="space-y-4 max-w-3xl">
                            <div className="flex gap-3 items-center">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${analysis.go_no_go === 'GO' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' :
                                    'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20'
                                    }`}>
                                    {analysis.go_no_go} Decision
                                </span>
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                    {rfp.category}
                                </span>
                            </div>

                            <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">{rfp.title}</h1>

                            <div className="flex flex-wrap gap-6 text-slate-500 dark:text-slate-400 text-sm font-medium pt-2">
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4" />
                                    {rfp.client}
                                </div>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4" />
                                    Budget: <span className="text-slate-900 dark:text-white">{rfp.budget}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Deadline: <span className="text-slate-900 dark:text-white">{rfp.deadline}</span>
                                </div>
                            </div>
                        </div>

                        {/* Radial Progress */}
                        <div className="flex flex-col items-center justify-center shrink-0">
                            <div className="relative w-32 h-32 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="64" cy="64" r="56" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="8" fill="none" />
                                    <circle
                                        cx="64" cy="64" r="56"
                                        className={`${analysis.win_probability > 70 ? 'stroke-emerald-500' : 'stroke-amber-500'} transition-all duration-1000 ease-out`}
                                        strokeWidth="8"
                                        fill="none"
                                        strokeDasharray={`${(analysis.win_probability / 100) * 351} 351`}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute flex flex-col items-center">
                                    <span className="text-3xl font-bold">{Math.round(analysis.win_probability)}%</span>
                                    <span className="text-[10px] uppercase font-bold text-slate-400">Win Prob</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column (Detailed Metrics) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Pricing Strategy */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800"
                        >
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-emerald-500" /> Pricing Intelligence
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-black border border-slate-100 dark:border-slate-800">
                                    <div className="text-slate-500 text-xs uppercase font-bold mb-1">Client Budget</div>
                                    <div className="text-xl font-semibold opacity-70">{rfp.budget}</div>
                                </div>
                                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 md:col-span-2">
                                    <div className="text-emerald-600 dark:text-emerald-400 text-xs uppercase font-bold mb-1">Recommended Bid Amount</div>
                                    <div className="flex items-end gap-3">
                                        <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">
                                            ₹ {analysis.suggested_price.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </div>
                                        <div className="text-sm text-emerald-600/70 dark:text-emerald-400/50 font-medium mb-1">
                                            (~95% of budget)
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Technical Match */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-blue-500" /> Technical Capability Match
                                </h3>
                                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold">
                                    {Math.round(analysis.match_percentage)}% Match
                                </span>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-3">Matched Capabilities</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {analysis.matched_products.map((prod: string, i: number) => (
                                            <span key={i} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> {prod}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {analysis.missing_requirements.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-3">Missing / Gap Areas</h4>
                                        <div className="space-y-2">
                                            {analysis.missing_requirements.map((req: string, i: number) => (
                                                <div key={i} className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-lg">
                                                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                                                    <span className="text-sm text-amber-900 dark:text-amber-100 font-medium">{req}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column (AI Insights & Actions) */}
                    <div className="space-y-8">
                        <div className="bg-slate-900 dark:bg-slate-800 text-white p-8 rounded-3xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-600 blur-[80px] opacity-50"></div>
                            <div className="relative z-10">
                                <h3 className="font-bold text-xl mb-4">Velora Insight</h3>
                                <p className="text-slate-300 italic mb-6 leading-relaxed">"{analysis.reason}"</p>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm py-2 border-b border-white/10">
                                        <span className="text-slate-400">Competitor Density</span>
                                        <span className="font-semibold text-white">Medium</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm py-2 border-b border-white/10">
                                        <span className="text-slate-400">Resource Availability</span>
                                        <span className="font-semibold text-emerald-400">High</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm py-2 border-b border-white/10">
                                        <span className="text-slate-400">Client Relationship</span>
                                        <span className="font-semibold text-amber-400">New</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </main>

            {/* Bottom Action Bar */}
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 dark:bg-black/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 z-40"
            >
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="hidden md:block">
                        <div className="text-sm font-medium text-slate-500">Suggested Action</div>
                        <div className="font-bold text-lg dark:text-white">Generate Proposal Draft</div>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <button className="flex-1 md:flex-none px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            Save for Review
                        </button>
                        <Link href={`/rfp/${id}/agent-view`} className="hidden md:flex flex-1 md:flex-none px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors items-center gap-2">
                            <Bot className="w-5 h-5 text-purple-500" /> Agent Logic
                        </Link>
                        <button
                            onClick={handleGenerateBid}
                            disabled={generating}
                            className="flex-1 md:flex-none px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            {generating ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : generatedPdf ? <Download className="w-5 h-5" /> : <FileText className="w-5 h-5" />}

                            {generating ? "Generating..." : generatedPdf ? "Download PDF" : "Generate Proposal"}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
