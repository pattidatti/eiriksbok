import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { PrefetchLink } from './PrefetchLink';
import { SearchOverlay } from './SearchOverlay';
import { Breadcrumbs } from './Breadcrumbs';
import { ScrollToTop } from './ScrollToTop';

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
                    <Link to="/" className="flex items-center gap-3 text-xl font-display font-bold text-text-main no-underline tracking-tight group">
                        <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain transition-transform group-hover:scale-110" />
                        <span>BOK.HAALAND.DE</span>
                    </Link>

                    <nav className="hidden md:flex items-center space-x-8">
                        <PrefetchLink to="/norsk" prefetchTarget="SubjectPage" className={`text-sm transition-colors ${isActive('/norsk')}`}>Norsk</PrefetchLink>
                        <PrefetchLink to="/samfunnskunnskap" prefetchTarget="SubjectPage" className={`text-sm transition-colors ${isActive('/samfunnskunnskap')}`}>Samfunnskunnskap</PrefetchLink>
                        <PrefetchLink to="/historie" prefetchTarget="SubjectPage" className={`text-sm transition-colors ${isActive('/historie')}`}>Historie</PrefetchLink>
                        <PrefetchLink to="/krle" prefetchTarget="SubjectPage" className={`text-sm transition-colors ${isActive('/krle')}`}>KRLE</PrefetchLink>
                        <PrefetchLink to="/musikk" prefetchTarget="SubjectPage" className={`text-sm transition-colors ${isActive('/musikk')}`}>Musikk</PrefetchLink>
                        <PrefetchLink to="/oving" prefetchTarget="PracticePage" className={`text-sm transition-colors ${isActive('/oving')}`}>Øving</PrefetchLink>
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

            <ScrollToTop />
        </div>
    );
};