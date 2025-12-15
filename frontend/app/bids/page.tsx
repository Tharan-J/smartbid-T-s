"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText,
    Clock,
    CheckCircle2,
    AlertCircle,
    Menu,
    X,
    Sun,
    Moon,
    Filter,
    Search,
    Download
} from "lucide-react";

import Navbar from "@/components/Navbar";

export default function BidsPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-white font-sans selection:bg-blue-500/30">
            <Navbar />

            <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto min-h-[80vh]">
                <div className="flex flex-col md:flex-row justify-between items-end mb-8">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">My Bids</h1>
                        <p className="text-slate-500 dark:text-slate-400">Manage and track your active proposals.</p>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold shadow-lg hover:bg-blue-500 transition-all">
                        + New Proposal
                    </button>
                </div>

                {/* Filters */}
                <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                    {['All', 'Drafts', 'Under Review', 'Submitted', 'Won', 'Lost'].map((filter, i) => (
                        <button key={filter} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border ${i === 0 ? 'bg-slate-900 dark:bg-white text-white dark:text-black border-transparent' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                            {filter}
                        </button>
                    ))}
                </div>

                {/* Empty State / List Placeholder */}
                <div className="grid grid-cols-1 gap-4">
                    {[1, 2, 3].map((i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/30 transition-all group flex flex-col md:flex-row gap-6 items-center"
                        >
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <FileText className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400">DRAFT</span>
                                    <span className="text-xs text-slate-400">Last edited 2h ago</span>
                                </div>
                                <h3 className="font-bold text-lg">Smart City Surveillance System - Phase {i}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Client: City Municipal Corp • Value: ₹{10 + i}.5 Cr</p>
                            </div>
                            <div className="flex items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
                                <div className="flex-1 md:w-32">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-500">Progress</span>
                                        <span className="font-bold">6{i}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div style={{ width: `6${i}%` }} className="h-full bg-blue-500 rounded-full"></div>
                                    </div>
                                </div>
                                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                    Edit
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </main>
        </div>
    );
}
