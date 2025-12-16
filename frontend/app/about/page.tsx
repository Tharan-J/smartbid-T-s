"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, Terminal, Cpu, Database, ChevronRight, Play } from "lucide-react";
import Link from "next/link";

// --- Workflow Data ---

const WORKFLOW_STEPS = [
  {
    id: 0,
    title: "STEP 0 — Sales Agent",
    subtitle: "Discovery & Qualification",
    description: "The Sales Agent constantly monitors RFP portals, scraping thousands of listings. It filters opportunities based on your specific criteria (e.g., Deadline ≤ 3 months) and selects the most promising RFP for processing.",
    icon: SearchIcon,
    agentColor: "text-amber-500",
    bgGradient: "from-amber-500/20 to-orange-500/20",
    json: {
      "selected_rfp": {
        "title": "Supply of High-Voltage Cables for Metro Project",
        "due_date": "2025-04-15",
        "source_url": "https://govt-tenders.example.com/rfp/99283",
        "rfp_pdf_text": "[PDF CONTENT EXTRACTED...]"
      }
    }
  },
  {
    id: 1,
    title: "STEP 1 — Master Agent (Phase 1)",
    subtitle: "Context Preparation",
    description: "The Master Agent analyzes the full RFP and intelligently splits the context. Instead of dumping the whole document, it extracts relevant sections for specific specialists—Technical specs for engineers, commercial terms for pricing.",
    icon: BrainIcon,
    agentColor: "text-purple-500",
    bgGradient: "from-purple-500/20 to-indigo-500/20",
    json: {
      "task": "Context Splitting",
      "technical_context": {
        "scope": "Products in scope, Standards (IEC 60502), Tech specs",
        "target_agent": "Technical Agent"
      },
      "pricing_context": {
        "scope": "Performance tests, Quantity (50km), Acceptance criteria",
        "target_agent": "Pricing Agent"
      }
    }
  },
  {
    id: 2,
    title: "STEP 2 — Technical Agent",
    subtitle: "Deep Engineering Analysis",
    description: "The Technical Agent receives the dedicated spec sheet. It scans your internal Product Catalog, matches requirements against SKUs, calculates compliance percentages, and selects the best fit products.",
    icon: CpuIcon,
    agentColor: "text-blue-500",
    bgGradient: "from-blue-500/20 to-cyan-500/20",
    json: {
      "role": "Technical Agent",
      "action": "Product Matching",
      "output": [
        {
          "requirement": "11kV XLPE Cable",
          "matched_sku": "SKU-992-A",
          "match_confidence": "98.5%",
          "spec_comparison": {
             "voltage": "Matches (11kV)",
             "insulation": "Matches (XLPE)"
          }
        }
      ]
    }
  },
  {
    id: 3,
    title: "STEP 3 — Pricing Agent",
    subtitle: "Commercial Calculation",
    description: "Receiving the selected SKUs from the Technical Agent and test requirements from the Master, the Pricing Agent builds a synthetic pricing model, calculating material costs, testing fees, and margins.",
    icon: CalculatorIcon,
    agentColor: "text-emerald-500",
    bgGradient: "from-emerald-500/20 to-green-500/20",
    json: {
        "role": "Pricing Agent",
        "input": { "sku": "SKU-992-A", "quantity": "50km" },
        "output": {
            "unit_price": "₹ 1,250 / m",
            "material_cost": "₹ 62,500,000",
            "testing_charges": "₹ 500,000",
            "logistics": "₹ 1,200,000",
            "total_line_value": "₹ 64,200,000"
        }
    }
  },
  {
    id: 4,
    title: "STEP 4 — Master Agent (Final)",
    subtitle: "Consolidation & Final Output",
    description: "The Master Agent collects outputs from all specialists. It verifies data completeness, formats the compliance matrix and pricing tables, and generates the final ready-to-submit proposal document.",
    icon: CheckIcon,
    agentColor: "text-indigo-500",
    bgGradient: "from-indigo-500/20 to-violet-500/20",
    json: {
      "final_proposal": {
        "status": "READY_TO_SUBMIT",
        "compliance_score": "100%",
        "total_bid_value": "₹ 64,200,000",
        "attachments": [
            "Technical_Compliance_Sheet.pdf",
            "Commercial_Proposal_v1.pdf"
        ]
      }
    }
  }
];

// --- Icons ---
function SearchIcon(props: any) { return <Search {...props} />; }
import { Search, Brain, Calculator, CheckCircle as Check } from "lucide-react";
function BrainIcon(props: any) { return <Brain {...props} />; }
function CpuIcon(props: any) { return <Cpu {...props} />; }
function CalculatorIcon(props: any) { return <Calculator {...props} />; }
function CheckIcon(props: any) { return <Check {...props} />; }

export default function AboutPage() {
  const [activeStep, setActiveStep] = useState(0);

  // Auto-advance for demo purposes if user doesn't interact
  // (Optional, maybe annoying, let's keep it manual or scroll-based)
  
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-500/30">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back to Home</span>
          </Link>
          <div className="font-bold text-xl tracking-tight">How <span className="text-blue-600">Velora</span> Works</div>
          <div className="w-24"></div> {/* Spacer for center alignment */}
        </div>
      </nav>

      <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-6"
          >
            <SparklesIcon className="w-4 h-4" /> Agentic Workflow Architecture
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Not just a chatbot. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">A Team of Specialists.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400"
          >
            SmartBid uses a multi-agent system where distinct AI personas collaborate to analyze, separate, and conquer complex RFPs with human-level reasoning.
          </motion.p>
        </div>

        {/* Interactive Workflow Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
          
          {/* Left Column: Steps */}
          <div className="space-y-8 relative">
            {/* Connecting Line */}
            <div className="absolute left-8 top-10 bottom-10 w-0.5 bg-slate-200 dark:bg-slate-800 -z-10 hidden lg:block"></div>

            {WORKFLOW_STEPS.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                onClick={() => setActiveStep(index)}
                className={`relative pl-24 cursor-pointer group transition-all duration-300 ${
                  activeStep === index ? "opacity-100 scale-100" : "opacity-50 hover:opacity-80 scale-95"
                }`}
              >
                {/* Step Marker */}
                <div className={`absolute left-0 top-0 w-16 h-16 rounded-2xl flex items-center justify-center text-2xl border-2 transition-all duration-300 z-10 bg-slate-50 dark:bg-black ${
                  activeStep === index 
                    ? `border-${step.agentColor.split('-')[1]}-500 shadow-xl shadow-${step.agentColor.split('-')[1]}-500/20 scale-110` 
                    : "border-slate-300 dark:border-slate-700 md:grayscale"
                }`}>
                  <step.icon className={`w-8 h-8 ${activeStep === index ? step.agentColor : "text-slate-400"}`} />
                </div>

                {/* Content */}
                <div className={`p-6 rounded-2xl border bg-white dark:bg-slate-900 transition-all duration-300 ${
                  activeStep === index 
                    ? `border-${step.agentColor.split('-')[1]}-200 dark:border-${step.agentColor.split('-')[1]}-900`
                    : "border-transparent bg-transparent"
                }`}>
                  <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${step.agentColor}`}>
                    {step.title}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{step.subtitle}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    {step.description}
                  </p>
                  
                  {/* Mobile-only visible indicator */}
                  <div className="lg:hidden mt-4 text-xs font-bold text-blue-500 uppercase tracking-wide flex items-center gap-1">
                    View Output <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right Column: Code Terminal */}
          <div className="lg:sticky lg:top-32">
             <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-[#0F1117] border border-slate-800 ring-1 ring-white/10 min-h-[500px] flex flex-col font-mono text-sm leading-6">
                
                {/* Terminal Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-[#161b22] border-b border-slate-800">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                  </div>
                  <div className="text-slate-500 text-xs font-medium flex items-center gap-2">
                    <Terminal className="w-3 h-3" />
                    agent_output_stream.json
                  </div>
                  <div className="w-10"></div>
                </div>

                {/* Terminal Content */}
                <div className="flex-1 p-6 relative overflow-hidden">
                   {/* Background Grid */}
                   <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
                   
                   <AnimatePresence mode="wait">
                     <motion.div
                       key={activeStep}
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, y: -10 }}
                       transition={{ duration: 0.2 }}
                       className="relative z-10"
                     >
                       {/* Agent Badge */}
                       <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-800/50 border border-slate-700 text-xs font-bold text-slate-300 mb-6">
                          <Cpu className="w-3 h-3" />
                          Running: {WORKFLOW_STEPS[activeStep].title}
                       </div>

                       <div className="text-blue-400 mb-2">$ cat agent_output.json</div>
                       <pre className="text-emerald-400 whitespace-pre-wrap">
                         <Typewriter text={JSON.stringify(WORKFLOW_STEPS[activeStep].json, null, 2)} />
                       </pre>
                       
                       <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1, repeat: Infinity, duration: 0.8 }}
                          className="w-2.5 h-5 bg-slate-500 inline-block align-middle ml-1"
                       />
                     </motion.div>
                   </AnimatePresence>
                </div>
             </div>
             
             {/* Info Box */}
             <motion.div 
                key={activeStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg relative overflow-hidden"
             >
                <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${WORKFLOW_STEPS[activeStep].bgGradient.replace('/20', '')}`}></div>
                <h4 className="font-bold text-lg mb-2">Why this matters?</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                   {activeStep === 0 && "Most teams waste 20h/week just finding RFPs. We automate discovery so you only bid on high-win-prob deals."}
                   {activeStep === 1 && "Generic logic fails on distinct RFPs. Splitting context ensures technical terms don't confuse the pricing model."}
                   {activeStep === 2 && "This is the hardest part. Our agent actually 'reads' your catalog and matches specs line-by-line, proving true intelligence."}
                   {activeStep === 3 && "Synthetic pricing allows you to iterate strategies instantly without spreadsheet hell."}
                   {activeStep === 4 && "The final output isn't just text. It's a structured, formatted document ready for executive review."}
                </p>
             </motion.div>
          </div>

        </div>
      </div>
    </main>
  );
}

// --- Helper Components ---

function SparklesIcon(props: any) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M9 3v4"/><path d="M3 9h4"/></svg>
    )
}

function Typewriter({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");
  
  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const timer = setInterval(() => {
      setDisplayed((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) clearInterval(timer);
    }, 10); // Speed of typing
    return () => clearInterval(timer);
  }, [text]);

  return <span>{displayed}</span>;
}
