"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Zap,
  Shield,
  Play,
  Moon,
  Sun,
  LayoutGrid,
  Search,
  FileText,
  TrendingUp,
  Cpu,
  Layers,
  Menu,
  X
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";

// --- UI Components ---

function Button({ children, variant = "primary", className = "", ...props }: any) {
  const base = "inline-flex items-center justify-center rounded-full font-semibold transition-all duration-300 transform active:scale-95";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg hover:shadow-blue-500/25 px-6 py-3",
    secondary: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 px-6 py-3",
    ghost: "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg",
    outline: "border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-600 px-6 py-3"
  };

  return (
    <button className={`${base} ${variants[variant as keyof typeof variants]} ${className}`} {...props}>
      {children}
    </button>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-10 h-10" />;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
      aria-label="Toggle Theme"
    >
      {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? "py-3 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800"
        : "py-6 bg-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-black dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-black font-bold text-lg md:text-xl">
            V
          </div>
          <span className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-jakarta">Velora</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
          <a href="#product" className="hover:text-black dark:hover:text-white transition-colors">Product</a>
          <a href="#solutions" className="hover:text-black dark:hover:text-white transition-colors">Solutions</a>
          <a href="#pricing" className="hover:text-black dark:hover:text-white transition-colors">Pricing</a>
          <a href="#company" className="hover:text-black dark:hover:text-white transition-colors">Company</a>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          <Link href="/dashboard" className="text-sm font-semibold text-slate-900 dark:text-white hover:opacity-80">Log in</Link>
          <Link href="/dashboard">
            <Button className="text-sm px-5 py-2.5">Start Free Trial</Button>
          </Link>
        </div>

        <div className="md:hidden flex items-center gap-4">
          <ThemeToggle />
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600 dark:text-slate-300">
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-black border-b border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4 font-medium text-slate-600 dark:text-slate-400">
              <a href="#product" onClick={() => setMobileMenuOpen(false)}>Product</a>
              <a href="#solutions" onClick={() => setMobileMenuOpen(false)}>Solutions</a>
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-blue-600 dark:text-blue-400">Sign In</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 overflow-hidden bg-white dark:bg-black">
      {/* Aurora Background Effects */}
      <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[600px] h-[600px] bg-blue-500/20 dark:bg-blue-600/10 rounded-full blur-[120px] opacity-70 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-[500px] h-[500px] bg-purple-500/20 dark:bg-purple-600/10 rounded-full blur-[120px] opacity-70"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs md:text-sm font-semibold mb-8"
        >
          <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
          Velora Intelligence 2.0 is live
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-8xl font-bold tracking-tight text-slate-900 dark:text-white mb-8 font-jakarta leading-[0.95]"
        >
          The Future of <br className="hidden md:block" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-500 to-blue-600 bg-300% animate-gradient">
            Strategic Bidding
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10"
        >
          Velora processes global tender data to predict wins, automate compliance,
          and generate perfect proposals 10x faster than humanly possible.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link href="/dashboard">
            <Button className="h-14 px-8 text-lg rounded-full">
              Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Button variant="secondary" className="h-14 px-8 text-lg rounded-full">
            <Play className="mr-2 w-5 h-5 fill-current" /> Watch Showreel
          </Button>
        </motion.div>

        {/* Dashboard Preview - 3D Tilt Effect */}
        <motion.div
          initial={{ opacity: 0, y: 100, rotateX: 20 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
          className="mt-20 relative mx-auto max-w-5xl perspective-1000"
        >
          <div className="relative rounded-2xl bg-slate-950 p-2 ring-1 ring-slate-800 shadow-2xl">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-20 blur-lg"></div>
            <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800 h-[500px] flex items-center justify-center group shadow-2xl">
              {/* Abstract UI representation */}
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
              <div className="grid grid-cols-12 gap-4 p-6 w-full h-full opacity-90 transition-opacity duration-500 group-hover:opacity-100">
                {/* Sidebar */}
                <div className="hidden md:block col-span-2 bg-slate-800/50 rounded-lg h-full border border-slate-700/50"></div>
                {/* Main */}
                <div className="col-span-12 md:col-span-10 flex flex-col gap-4">
                  {/* Header */}
                  <div className="h-12 bg-slate-800/30 rounded-lg border border-slate-700/50 flex items-center px-4 justify-between shrink-0">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
                      <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
                    </div>
                    <div className="flex items-center gap-2 opacity-50">
                      <div className="w-20 h-2 bg-slate-700 rounded-full"></div>
                    </div>
                  </div>
                  {/* Content Grid */}
                  <div className="flex-1 grid grid-cols-3 gap-4 min-h-0">
                    <div className="col-span-2 bg-slate-800/20 rounded-lg p-4 border border-slate-700/30 relative overflow-hidden flex flex-col">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>

                      {/* Header in panel */}
                      <div className="flex justify-between items-start mb-4 mt-1 shrink-0">
                        <div className="space-y-2">
                          <div className="h-2.5 w-24 bg-slate-700/50 rounded animate-pulse"></div>
                          <div className="h-2 w-16 bg-slate-700/30 rounded"></div>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 rounded border border-blue-500/20">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
                          <span className="text-[10px] text-blue-300 font-mono tracking-wide uppercase">Processing</span>
                        </div>
                      </div>

                      {/* Animated Terminal/Logs */}
                      <div className="flex-1 bg-slate-950/50 rounded-lg border border-slate-700/50 p-4 overflow-hidden relative font-mono text-xs">
                        <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-slate-900/90 to-transparent z-10"></div>
                        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-slate-900/90 to-transparent z-10"></div>

                        <motion.div
                          initial={{ y: 0 }}
                          animate={{ y: -120 }}
                          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                          className="space-y-3 text-slate-400 leading-relaxed"
                        >
                          <div className="flex items-center gap-3"><span className="text-blue-500">➜</span> Importing tender_specs_v2.pdf...</div>
                          <div className="flex items-center gap-3"><span className="text-emerald-500">✔</span> Requirements successfully parsed</div>
                          <div className="flex items-center gap-3"><span className="text-blue-500">➜</span> Analyzing competitor pricing models</div>
                          <div className="flex items-center gap-3"><span className="text-amber-500">⚠</span> Risk factor detected: Legal Compliance</div>
                          <div className="flex items-center gap-3"><span className="text-blue-500">➜</span> Optimizing proposal structure</div>
                          <div className="flex items-center gap-3"><span className="text-emerald-500">✔</span> Compliance matrix generated</div>
                          <div className="flex items-center gap-3"><span className="text-blue-500">➜</span> Calculating probability of win...</div>
                          <div className="flex items-center gap-3"><span className="text-emerald-500">✔</span> Finalizing bid documents</div>
                          <div className="flex items-center gap-3"><span className="text-purple-500">➜</span> Allocating internal resources</div>
                          <div className="flex items-center gap-3"><span className="text-blue-500">➜</span> Drafting executive summary text</div>
                          <div className="flex items-center gap-3"><span className="text-blue-500">➜</span> Reviewing historical win data</div>
                          <div className="flex items-center gap-3"><span className="text-emerald-500">✔</span> Quality assurance check passed</div>
                        </motion.div>
                      </div>
                    </div>

                    <div className="col-span-1 grid grid-rows-2 gap-4">
                      <div className="bg-blue-900/10 rounded-lg border border-blue-500/20 flex flex-col items-center justify-center p-4 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors"></div>
                        <div className="text-4xl font-bold text-blue-500">92%</div>
                        <div className="text-xs text-blue-400/60 uppercase tracking-widest mt-2 font-semibold">Win Prob</div>
                      </div>
                      <div className="bg-emerald-900/10 rounded-lg border border-emerald-500/20 flex flex-col items-center justify-center p-4 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors"></div>
                        <div className="text-4xl font-bold text-emerald-500">₹1.2M</div>
                        <div className="text-xs text-emerald-400/60 uppercase tracking-widest mt-2 font-semibold">Est. Value</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
                className="absolute bottom-6 right-6 bg-white dark:bg-black border border-slate-200 dark:border-slate-700 shadow-xl px-4 py-3 rounded-lg flex items-center gap-3 z-10"
              >
                <div className="relative">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-ping absolute top-0 right-0 opacity-75"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="text-sm">
                  <p className="font-bold text-slate-900 dark:text-white">Analysis Complete</p>
                  <p className="text-xs text-slate-500">Just now</p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div >
    </section >
  );
}

function TabbedFeatures() {
  const [activeTab, setActiveTab] = useState(0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const features = [
    {
      id: "discovery",
      label: "Discovery",
      title: "Global Tender Search",
      desc: "Stop manually checking portals. Velora aggregates RFPs from 500+ sources, filtering out noise so you only see what matters.",
      icon: Search,
      metrics: ["500+ Sources", "Real-time Sync", "Smart Filters"]
    },
    {
      id: "analysis",
      label: "Analysis",
      title: "Predictive Intelligence",
      desc: "Our proprietary ML model scores every opportunity based on your past performance, competitor activity, and resource availability.",
      icon: TrendingUp,
      metrics: ["Win Probability", "Competitor Intel", "Resource Gap"]
    },
    {
      id: "automation",
      label: "Automation",
      title: "One-Click Proposal",
      desc: "Generate compliant, on-brand technical proposals in minutes. Velora maps your product library to RFP requirements automatically.",
      icon: Cpu,
      metrics: ["Auto-Fill", "Compliance Matrix", "Pricing Calculator"]
    }
  ];

  return (
    <section id="product" className="py-24 bg-slate-50 dark:bg-slate-950 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">Intelligence at every step.</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">From discovery to submission, everything runs on autopilot.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* Tabs Navigation */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {features.map((f, index) => (
              <button
                key={f.id}
                onClick={() => setActiveTab(index)}
                className={`text-left p-6 rounded-2xl transition-all duration-300 border group ${activeTab === index
                  ? "bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-900/50 shadow-lg scale-105"
                  : "bg-transparent border-transparent hover:bg-white/50 dark:hover:bg-slate-900/50"
                  }`}
              >
                <div className={`flex items-center gap-3 mb-3 transition-colors ${activeTab === index ? "text-blue-600 dark:text-blue-400" : "text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"}`}>
                  <f.icon className="w-6 h-6" />
                  <span className="font-bold text-lg">{f.label}</span>
                </div>
                <p className={`text-sm leading-relaxed ${activeTab === index ? "text-slate-700 dark:text-slate-300" : "text-slate-400"}`}>
                  {f.desc}
                </p>
              </button>
            ))}
          </div>

          {/* Tab Content Display */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-1 min-h-[600px] flex relative shadow-2xl shadow-blue-900/5 overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

            <div className="relative w-full p-8 md:p-12 flex flex-col">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1 flex flex-col"
                >
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-100 dark:border-blue-800">
                        {features[activeTab].label} Phase
                      </div>
                      <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                        {features[activeTab].title}
                      </h3>
                    </div>
                    {/* Status Indicator */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-mono border border-emerald-100 dark:border-emerald-900/30">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      SYSTEM ACTIVE
                    </div>
                  </div>

                  {/* Dynamic Content Area based on Tab */}
                  <div className="flex-1 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 relative overflow-hidden group">
                    {activeTab === 0 && <DiscoveryAnimation />}
                    {activeTab === 1 && <AnalysisAnimation />}
                    {activeTab === 2 && <AutomationAnimation />}
                  </div>

                  {/* Metrics Footer */}
                  <div className="grid grid-cols-3 gap-4 mt-8">
                    {features[activeTab].metrics.map((m, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{m}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function DiscoveryAnimation() {
  return (
    <div className="relative w-full h-full p-6 flex flex-col gap-4">
      {/* Search Bar */}
      <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm mb-2">
        <Search className="w-4 h-4 text-slate-400" />
        <div className="h-4 w-48 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
      </div>

      {/* List Items */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: i * 0.2 }}
          className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xs ${i === 1 ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
              {i === 1 ? 'Go' : 'Pvt'}
            </div>
            <div className="space-y-2">
              <div className="h-3 w-32 bg-slate-100 dark:bg-slate-800 rounded"></div>
              <div className="h-2 w-20 bg-slate-50 dark:bg-slate-850 rounded"></div>
            </div>
          </div>
          <div className="text-xs font-mono text-slate-400">Match: {(90 - i * 5)}%</div>
        </motion.div>
      ))}

      {/* Floating Badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-6 right-6 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-2"
      >
        <CheckCircle2 className="w-3 h-3" />
        142 RFPs Found
      </motion.div>
    </div>
  )
}

function AnalysisAnimation() {
  return (
    <div className="relative w-full h-full p-6 grid grid-cols-2 gap-6">
      {/* Document Preview */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 space-y-3 relative overflow-hidden flex flex-col">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 animate-[shimmer_2s_infinite]"></div>
        <div className="h-2 w-1/3 bg-slate-200 dark:bg-slate-800 rounded"></div>
        <div className="h-2 w-full bg-slate-100 dark:bg-slate-850 rounded"></div>
        <div className="h-2 w-full bg-slate-100 dark:bg-slate-850 rounded"></div>
        <div className="h-2 w-2/3 bg-slate-100 dark:bg-slate-850 rounded"></div>

        {/* Animated Processing Section */}
        <div className="mt-4 flex-1 bg-slate-50 dark:bg-slate-950 rounded border border-slate-100 dark:border-slate-800 p-3 overflow-hidden relative">
          <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-slate-50 dark:from-slate-950 to-transparent z-10"></div>
          <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-slate-50 dark:from-slate-950 to-transparent z-10"></div>

          <motion.div
            initial={{ y: 0 }}
            animate={{ y: -100 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="space-y-2"
          >
            {[
              "Scanning document structure...",
              "Identifying key requirements...",
              "Extracting deliverable dates...",
              "Analyzing technical scope...",
              "Checking compliance metrics...",
              "Reviewing legal terms...",
              "Evaluating resource needs...",
              "Estimating budget constraints...",
              "Comparing historical data...",
              "Calculating win probability...",
              "Finalizing analysis report..."
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                {text}
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Radar/Stats */}
      <div className="flex flex-col gap-4">
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 flex items-center justify-center relative">
          {/* Fake Chart */}
          <div className="w-24 h-24 rounded-full border-4 border-slate-100 dark:border-slate-800 flex items-center justify-center relative">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="50%" cy="50%" r="44%" fill="none" stroke="#3b82f6" strokeWidth="4" strokeDasharray="200" strokeDashoffset="40" className="opacity-100 animate-[dash_1.5s_ease-out_forwards]"></circle>
            </svg>
            <div className="text-center">
              <div className="text-xl font-bold text-slate-900 dark:text-white">88%</div>
              <div className="text-[10px] text-slate-400">WIN RATE</div>
            </div>
          </div>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 p-3 rounded-lg">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">Good Fit</span>
            <span className="text-emerald-600">High Confidence</span>
          </div>
          <div className="w-full bg-emerald-200 dark:bg-emerald-900/50 h-1.5 rounded-full">
            <div className="h-full bg-emerald-500 rounded-full w-[88%]"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AutomationAnimation() {
  return (
    <div className="relative w-full h-full p-6 flex flex-col">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="w-2 h-2 rounded-full bg-red-400"></div>
        <div className="w-2 h-2 rounded-full bg-amber-400"></div>
        <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
        <div className="ml-2 text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 font-mono">proposal_v1.pdf</div>
      </div>

      <div className="flex-1 space-y-3 font-mono text-[10px] text-slate-600 dark:text-slate-400 overflow-hidden relative">
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: -20 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }}
          className="space-y-1"
        >
          <p className="text-blue-600 dark:text-blue-400">{">"} Initializing template engine...</p>
          <p className="opacity-50">  - Loading company assets</p>
          <p className="opacity-50">  - Fetching compliance matrix</p>
          <p className="text-emerald-600 dark:text-emerald-400">{">"} COMPLIANCE CHECK PASSED</p>
          <p>{">"} Generating Executive Summary...</p>
          <p className="opacity-50">  - Integrating value proposition</p>
          <p className="opacity-50">  - Calculating budget variance</p>
          <p className="text-blue-600 dark:text-blue-400">{">"} Formatting tables...</p>
          <p>{">"} Finalizing structure...</p>
          <p className="text-emerald-600 dark:text-emerald-400 font-bold">{">"} PDF GENERATED SUCCESSFULLY</p>
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-slate-950 to-transparent pointer-events-none"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="mt-4 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg rounded-lg flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded text-red-600">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Proposal_Final.pdf</div>
            <div className="text-[10px] text-slate-400">2.4 MB • Ready to Send</div>
          </div>
        </div>
        <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded">
          Download
        </button>
      </motion.div>
    </div>
  )
}

function BentoGrid() {
  return (
    <section className="py-24 bg-white dark:bg-black text-slate-900 dark:text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold mb-6">Why Industry Leaders Choose Velora</h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg">Replacing fragmented tools with one unified intelligence platform.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
          {/* Large Card */}
          <div className="md:col-span-2 row-span-1 bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity">
              <Shield className="w-64 h-64 text-slate-900 dark:text-white" />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <Shield className="w-6 h-6 text-purple-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Enterprise-Grade Security</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm">SOC 2 Type II Certified, GDPR Compliant, and end-to-end encryption for all your sensitive bid data.</p>
              </div>
              <div className="flex gap-4">
                <div className="px-3 py-1 bg-white dark:bg-slate-800 rounded text-xs font-bold border border-slate-200 dark:border-slate-700">ISO 27001</div>
                <div className="px-3 py-1 bg-white dark:bg-slate-800 rounded text-xs font-bold border border-slate-200 dark:border-slate-700">AES-256</div>
              </div>
            </div>
          </div>

          {/* Tall Card */}
          <div className="md:col-span-1 row-span-2 bg-gradient-to-b from-blue-600 to-blue-700 text-white rounded-3xl p-8 relative overflow-hidden flex flex-col">
            <div className="mb-auto">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">ROI in <br />30 Days</h3>
              <p className="text-blue-100">Most teams see a 40% reduction in time-to-bid within the first month.</p>
            </div>

            <div className="mt-8 bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-medium opacity-80">Win Rate</span>
                <span className="text-2xl font-bold">+2x</span>
              </div>
              <div className="w-full bg-black/20 h-1.5 rounded-full overflow-hidden">
                <div className="bg-white h-full w-[70%]"></div>
              </div>
            </div>
            <div className="mt-4 bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-medium opacity-80">Time Saved</span>
                <span className="text-2xl font-bold">120h</span>
              </div>
              <div className="w-full bg-black/20 h-1.5 rounded-full overflow-hidden">
                <div className="bg-white h-full w-[90%]"></div>
              </div>
            </div>
          </div>

          {/* Small Card */}
          <div className="md:col-span-1 bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 flex flex-col justify-center items-center text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-4">
              <LayoutGrid className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold mb-1">500+ Integrations</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Salesforce, HubSpot, Slack, and more.</p>
          </div>

          {/* Small Card */}
          <div className="md:col-span-1 bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 flex flex-col justify-center items-center text-center">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mb-4">
              <Layers className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-xl font-bold mb-1">Multi-Team</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Collaborate across departments in real-time.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function CTA() {
  return (
    <section className="py-24 bg-white dark:bg-black border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-slate-900 dark:bg-slate-900 rounded-[3rem] p-12 md:p-24 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-800/40 via-transparent to-transparent"></div>

          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight">
              Ready to dominate your market?
            </h2>
            <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
              Join the waiting list for Velora Enterprise and get early access to our most powerful features.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button className="h-14 px-10 text-lg rounded-full bg-black text-slate-900 shadow-xl hover:shadow-white/10">
                  Get Started Now
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="h-14 px-10 text-lg rounded-full border-slate-700 text-white hover:bg-slate-800 hover:border-slate-600">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-sans selection:bg-blue-500/30">
      <Navbar />
      <HeroSection />
      <TabbedFeatures />
      <BentoGrid />
      <CTA />

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-900 dark:bg-white rounded-md flex items-center justify-center text-white dark:text-black font-bold text-xs">V</div>
            <span className="font-bold text-slate-900 dark:text-white">Velora</span>
          </div>
          <div className="text-slate-500 dark:text-slate-500 text-sm">
            © 2025 Velora Intelligence Inc. All rights reserved.
          </div>
          <div className="flex gap-6 text-slate-500 dark:text-slate-400">
            <a href="#" className="hover:text-slate-900 dark:hover:text-white">Twitter</a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white">LinkedIn</a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
