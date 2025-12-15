"use client";

import Link from "next/link";
import { fetchRFPs } from "@/lib/api";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import {
    Search,
    Filter,
    ArrowUpRight,
    MoreHorizontal,
    Bell,
    CheckCircle2,
    AlertCircle,
    Clock,
    Briefcase,
    DollarSign,
    Menu,
    X,
    Sun,
    Moon,
    ChevronRight
} from "lucide-react";

// --- Components ---

import Navbar from "@/components/Navbar";

// --- Components ---

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        GO: "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
        "NO GO": "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20",
        REVIEW: "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
        NEW: "bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20",
    };

    const defaultStyle = "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700";

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${styles[status] || defaultStyle}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status === 'GO' ? 'bg-emerald-500' : status === 'NO GO' ? 'bg-red-500' : 'bg-current'}`}></span>
            {status}
        </span>
    );
}

export default function RFPListPage() {
    const [rfps, setRfps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const data = await fetchRFPs();
                setRfps(data);
            } catch (err) {
                console.error("Failed to fetch RFPs", err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-white font-sans selection:bg-blue-500/30">
            <Navbar />

            <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto min-h-screen flex flex-col">

                {/* Header Section */}
                <div className="mb-12 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                            Strategic <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Opportunities</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl">
                            AI-curated tender feed tailored to your organization's capabilities and historical win data.
                        </p>
                    </motion.div>

                    {/* Metrics/Quick Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
                    >
                        {[
                            { label: "Active Opportunities", value: "142", icon: Briefcase, color: "text-blue-500" },
                            { label: "High Win Prob", value: "24", icon: CheckCircle2, color: "text-emerald-500" },
                            { label: "Closing Soon", value: "8", icon: Clock, color: "text-amber-500" },
                            { label: "Pipeline Value", value: "₹450Cr", icon: DollarSign, color: "text-purple-500" }, // Rupee Symbol
                        ].map((stat, i) => (
                            <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50 flex flex-col gap-2 relative overflow-hidden group hover:border-blue-500/30 transition-colors">
                                <div className="flex items-center justify-between">
                                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                    <ArrowUpRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors" />
                                </div>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{stat.label}</div>
                                <div className={`absolute bottom-0 left-0 h-1 bg-current opacity-10 w-full ${stat.color}`}></div>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6 sticky top-24 z-20 bg-white/80 dark:bg-black/80 backdrop-blur-xl p-4 -mx-4 rounded-xl border border-transparent dark:border-slate-800/50">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by keywords, client, or ID..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-900 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-950 rounded-lg outline-none transition-all text-sm font-medium placeholder:text-slate-400"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <Filter className="w-4 h-4" /> Filters
                        </button>
                        <Link href="/rfp/new">
                            <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white border border-transparent rounded-lg text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all active:scale-95">
                                <ArrowUpRight className="w-4 h-4" /> Analyze New RFP
                            </button>
                        </Link>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <Bell className="w-4 h-4" /> Set Alert
                        </button>
                    </div>
                </div>

                {/* List Content */}
                <div className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900/50 shadow-sm relative min-h-[500px]">
                    {/* Loading State */}
                    {loading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/50 dark:bg-black/50 backdrop-blur-sm">
                            <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                            <div className="text-sm font-medium text-slate-500 animate-pulse">Scanning global sources...</div>
                        </div>
                    )}

                    {!loading && rfps.length === 0 && (
                        <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                            No active opportunities found matching your criteria.
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Opportunity</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Client</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Deadline</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Win Prob</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {rfps.map((rfp, index) => (
                                    <motion.tr
                                        key={rfp.id || index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="group hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                                    >
                                        <td className="px-6 py-4 max-w-[300px]">
                                            <div className="font-semibold text-slate-900 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer">
                                                {rfp.title}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                                                <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] font-mono">ID: {rfp.id?.substring(0, 8) || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{rfp.client}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                                {rfp.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-600 dark:text-slate-400 font-mono">{rfp.deadline}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex flex-col items-end gap-1">
                                                <span className={`text-sm font-bold ${rfp.win_probability > 70 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                    {rfp.win_probability}%
                                                </span>
                                                <div className="w-20 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${rfp.win_probability > 70 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                                        style={{ width: `${rfp.win_probability}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <StatusBadge status={rfp.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/rfp/${rfp.id}`}>
                                                <button className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all">
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </Link>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </main>
        </div>
    );
}
