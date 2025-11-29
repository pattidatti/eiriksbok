import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { SearchOverlay } from './SearchOverlay';
import { Breadcrumbs } from './Breadcrumbs';

export const Layout: React.FC = () => {
    const location = useLocation();
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const isActive = (path: string) => {
        return location.pathname.startsWith(path) ? 'text-text-main font-semibold' : 'text-text-muted hover:text-text-main';
    };

    return (
        <div className="min-h-screen bg-bg-main text-text-main font-sans relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-400/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }}></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-400/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '10s' }}></div>
            </div>

            {/* Navbar */}
            <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/70 border-b border-white/20 shadow-sm transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="text-xl font-display font-bold text-text-main no-underline tracking-tight">
                        Eiriksbok
                    </Link>

                    <nav className="hidden md:flex items-center space-x-8">
                        <Link to="/norsk" className={`text-sm transition-colors ${isActive('/norsk')}`}>Norsk</Link>
                        <Link to="/samfunnskunnskap" className={`text-sm transition-colors ${isActive('/samfunnskunnskap')}`}>Samfunnskunnskap</Link>
                        <Link to="/historie" className={`text-sm transition-colors ${isActive('/historie')}`}>Historie</Link>
                        <Link to="/krle" className={`text-sm transition-colors ${isActive('/krle')}`}>KRLE</Link>
                        <Link to="/musikk" className={`text-sm transition-colors ${isActive('/musikk')}`}>Musikk</Link>
                    </nav>

                    <div className="flex items-center">
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="p-2 text-text-muted hover:text-text-main transition-colors rounded-full hover:bg-black/5"
                            aria-label="Søk"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

            <main className="relative z-10 pt-8">
                <div className="max-w-7xl mx-auto px-6">
                    <Breadcrumbs />
                    <Outlet />
                </div>
            </main>
        </div>
    );
};