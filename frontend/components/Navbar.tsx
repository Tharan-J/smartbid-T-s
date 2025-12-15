"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon } from "lucide-react";

function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return <div className="w-10 h-10" />;
    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
    );
}

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    const links = [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/rfps", label: "Opportunities" },
        { href: "/bids", label: "Bids" },
        { href: "/intelligence", label: "Intelligence" },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 py-4 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-12">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-9 h-9 bg-black dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-black font-bold text-lg group-hover:scale-105 transition-transform">V</div>
                    <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-jakarta">Velora</span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                    {links.map((link) => {
                        const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname?.startsWith(link.href));
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`transition-colors relative py-1 ${isActive ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'}`}
                            >
                                {link.label}
                                {isActive && (
                                    <motion.div
                                        layoutId="navbar-underline"
                                        className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>

                <div className="hidden md:flex items-center gap-4">
                    <ThemeToggle />
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-[2px]">
                        <div className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300">
                            JD
                        </div>
                    </div>
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
                            {links.map(link => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={pathname === link.href ? "text-blue-600 dark:text-blue-400 font-bold" : ""}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
