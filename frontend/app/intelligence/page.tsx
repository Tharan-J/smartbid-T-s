"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import {
    BrainCircuit,
    TrendingUp,
    Globe,
    Zap,
    Menu,
    X,
    Sun,
    Moon,
    Lock
} from "lucide-react";

import Navbar from "@/components/Navbar";

export default function IntelligencePage() {
    return (
        <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-white font-sans selection:bg-blue-500/30">
            <Navbar />

            <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto min-h-[80vh]">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider mb-6"
                    >
                        <BrainCircuit className="w-4 h-4" /> Velora Neural Engine
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Market Intelligence</h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400">
                        Deep dive into market trends, competitor analysis, and predictive bidding insights powered by our proprietary AI.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        { title: "Competitor Watch", desc: "Track bidding patterns of 150+ identified competitors in your sector.", icon: Globe, color: "text-blue-500" },
                        { title: "Price Prediction", desc: "AI-estimated winning bid ranges for upcoming major tenders.", icon: TrendingUp, color: "text-emerald-500" },
                        { title: "Sector Alerts", desc: "Real-time notifications for policy changes in Infra & Tech.", icon: Zap, color: "text-amber-500" }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + (i * 0.1) }}
                            className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden group"
                        >
                            <div className={`w-12 h-12 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-6 shadow-sm`}>
                                <item.icon className={`w-6 h-6 ${item.color}`} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm mb-6">
                                {item.desc}
                            </p>
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white cursor-pointer group-hover:translate-x-1 transition-transform">
                                Explore <span className="text-lg">→</span>
                            </div>

                            {/* Blur Glow */}
                            <div className={`absolute -right-10 -bottom-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-20 transition-opacity blur-[50px] ${item.color.replace('text-', 'bg-')}`}></div>
                        </motion.div>
                    ))}
                </div>

                {/* Premium Teaser */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-12 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-900 dark:to-slate-950 rounded-3xl p-8 md:p-12 relative overflow-hidden text-white"
                >
                    <div className="absolute top-0 right-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4 text-amber-400 font-bold text-sm tracking-widest uppercase">
                                <Lock className="w-4 h-4" /> Premium Feature
                            </div>
                            <h2 className="text-3xl font-bold mb-4">Unlock Full Market Reports</h2>
                            <p className="text-slate-300 max-w-xl">
                                Get access to comprehensive quarterly reports on government spending trends, key decision makers, and long-term forecast models.
                            </p>
                        </div>
                        <button className="px-8 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-colors shadow-xl">
                            Upgrade to Pro
                        </button>
                    </div>
                </motion.div>

            </main>
        </div>
    );
}
