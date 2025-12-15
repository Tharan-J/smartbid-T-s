"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import {
    PieChart,
    BarChart,
    Activity,
    ArrowUpRight,
    Target,
    Users,
    FileText,
    Briefcase,
    Bell,
    Menu,
    X,
    Sun,
    Moon,
    Search,
    Filter
} from "lucide-react";

import Navbar from "@/components/Navbar";

// --- Dashboard Stats Components ---

// --- Dashboard Stats Components ---

function StatCard({ title, value, change, trend, icon: Icon, delay }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-blue-500/30 transition-all"
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${trend === 'up' ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600' : 'bg-blue-50 dark:bg-blue-900/10 text-blue-600'}`}>
                    <Icon className="w-6 h-6" />
                </div>
                {change && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend === 'up' ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/20' : 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'}`}>
                        {change}
                    </span>
                )}
            </div>
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</h3>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{value}</div>

            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
        </motion.div>
    );
}

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-white font-sans selection:bg-blue-500/30">
            <Navbar />

            <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto space-y-8">

                {/* Welcome Header */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-4xl font-bold mb-2"
                        >
                            Executive Overview
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="text-slate-500 dark:text-slate-400"
                        >
                            Real-time insights into your tender pipeline performance.
                        </motion.p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                            Last 30 Days
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20">
                            <FileText className="w-4 h-4" /> Generate Report
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Pipeline Value"
                        value="₹45.2Cr"
                        change="+12.5%"
                        trend="up"
                        icon={Briefcase}
                        delay={0.1}
                    />
                    <StatCard
                        title="Active Bids"
                        value="18"
                        change="4 Closing Soon"
                        trend="neutral"
                        icon={Activity}
                        delay={0.2}
                    />
                    <StatCard
                        title="Win Rate"
                        value="34%"
                        change="+2.4% vs Avg"
                        trend="up"
                        icon={Target}
                        delay={0.3}
                    />
                    <StatCard
                        title="Team Velocity"
                        value="12d"
                        change="-2 days"
                        trend="up"
                        icon={Users}
                        delay={0.4}
                    />
                </div>

                {/* Charts & Activity Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Chart Area */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="lg:col-span-2 bg-slate-50 dark:bg-slate-900/30 rounded-3xl border border-slate-200 dark:border-slate-800 p-8"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-bold">Pipeline Velocity</h3>
                            <div className="flex gap-2">
                                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                <span className="text-xs text-slate-500">Submitted</span>
                                <span className="w-3 h-3 rounded-full bg-emerald-500 ml-2"></span>
                                <span className="text-xs text-slate-500">Won</span>
                            </div>
                        </div>

                        {/* Mock Chart Area */}
                        {/* Mock Chart Area - SVG Line/Area Graph */}
                        <div className="h-64 w-full relative group">
                            <div className="absolute inset-0 flex items-end justify-between px-4 pb-6 z-0">
                                {[1, 2, 3, 4, 5, 6, 7].map((w) => (
                                    <div key={w} className="h-full border-r border-slate-100 dark:border-slate-800/30 w-px dashed last:border-0 ml-8"></div>
                                ))}
                            </div>

                            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                {/* Area Path */}
                                <motion.path
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 1.5, ease: "easeInOut" }}
                                    d="M0,100 L0,60 C16,35 33,55 50,20 C66,45 83,10 100,30 L100,100 Z"
                                    fill="url(#chartGradient)"
                                />
                                {/* Line Path */}
                                <motion.path
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 1.5, ease: "easeInOut" }}
                                    d="M0,60 C16,35 33,55 50,20 C66,45 83,10 100,30"
                                    fill="none"
                                    stroke="#3b82f6"
                                    strokeWidth="0.5"
                                    strokeLinecap="round"
                                    vectorEffect="non-scaling-stroke"
                                />
                                {/* Data Points */}
                                {[
                                    { cx: 0, cy: 60, val: 40 },
                                    { cx: 50, cy: 20, val: 80 }, // Mid peak
                                    { cx: 100, cy: 30, val: 70 }
                                ].map((pt, i) => (
                                    <circle key={i} cx={pt.cx} cy={pt.cy} r="1" fill="#2563eb" className="animate-pulse" />
                                ))}
                            </svg>

                            {/* X-Axis Labels */}
                            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-slate-400 font-mono px-2">
                                <span>Week 1</span>
                                <span>Week 2</span>
                                <span>Week 3</span>
                                <span>Week 4</span>
                                <span>Week 5</span>
                                <span>Week 6</span>
                                <span>Week 7</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Quick Actions / Activity */}
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm"
                        >
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <Bell className="w-4 h-4 text-amber-500" /> Action Required
                            </h3>
                            <div className="space-y-4">
                                <div className="flex gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-800/20 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-colors">
                                    <div className="w-2 h-2 mt-2 bg-amber-500 rounded-full shrink-0"></div>
                                    <div>
                                        <div className="text-sm font-semibold text-slate-900 dark:text-white">Signoff: Project Alpha Bid</div>
                                        <div className="text-xs text-slate-500 mt-1">Due in 4 hours</div>
                                    </div>
                                </div>
                                <div className="flex gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/20 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors">
                                    <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full shrink-0"></div>
                                    <div>
                                        <div className="text-sm font-semibold text-slate-900 dark:text-white">Review: Technical Specs</div>
                                        <div className="text-xs text-slate-500 mt-1">New content generated</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 }}
                            className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-20">
                                <Target className="w-32 h-32 text-white" />
                            </div>
                            <div className="relative z-10">
                                <div className="text-blue-200 font-medium text-sm mb-1">Monthly Goal</div>
                                <div className="text-3xl font-bold mb-4">8/10 RFPs</div>
                                <div className="w-full bg-blue-900/50 h-2 rounded-full overflow-hidden mb-2">
                                    <div className="w-[80%] h-full bg-white rounded-full"></div>
                                </div>
                                <p className="text-xs text-blue-100 opacity-80">You're on track to hit your target.</p>
                            </div>
                        </motion.div>
                    </div>

                </div>

            </main>
        </div>
    );
}
