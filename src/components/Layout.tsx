import React, { useState } from 'react';
import { Link, useLocation, useOutlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PrefetchLink } from './PrefetchLink';
import { SearchOverlay } from './SearchOverlay';
import { Breadcrumbs } from './Breadcrumbs';
import { ScrollToTop } from './ScrollToTop';
import { MobileMenu } from './MobileMenu';
import { useSettings } from '../hooks/useSettings';
import { useLayout } from '../context/LayoutContext';
import { Menu } from 'lucide-react';

export const Layout: React.FC = () => {
    const location = useLocation();
    const outlet = useOutlet();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { settings, toggleDyslexicMode } = useSettings();
    const { isFullWidth, hideHeader } = useLayout();

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
            {!hideHeader && (
                <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/70 border-b border-white/20 shadow-sm transition-all duration-300">
                    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Mobile Menu Trigger */}
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="md:hidden p-2 -ml-2 text-text-muted hover:text-text-main transition-colors"
                                aria-label="Åpne meny"
                            >
                                <Menu size={28} />
                            </button>

                            <Link to="/" className="flex items-center gap-3 text-xl font-display font-bold text-text-main no-underline tracking-tight group">
                                <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain transition-transform group-hover:scale-110" />
                                <span className="hidden sm:inline">BOK.HAALAND.DE</span>
                                <span className="sm:hidden">EIRIKSBOK</span>
                            </Link>
                        </div>

                        <nav className="hidden md:flex items-center space-x-8">
                            <PrefetchLink to="/norsk" prefetchTarget="SubjectPage" className={`text-sm transition-colors ${isActive('/norsk')}`}>Norsk</PrefetchLink>
                            <PrefetchLink to="/samfunnskunnskap" prefetchTarget="SubjectPage" className={`text-sm transition-colors ${isActive('/samfunnskunnskap')}`}>Samfunnskunnskap</PrefetchLink>
                            <PrefetchLink to="/historie" prefetchTarget="SubjectPage" className={`text-sm transition-colors ${isActive('/historie')}`}>Historie</PrefetchLink>
                            <PrefetchLink to="/krle" prefetchTarget="SubjectPage" className={`text-sm transition-colors ${isActive('/krle')}`}>KRLE</PrefetchLink>
                            <PrefetchLink to="/musikk" prefetchTarget="SubjectPage" className={`text-sm transition-colors ${isActive('/musikk')}`}>Musikk</PrefetchLink>
                            <PrefetchLink to="/oving" prefetchTarget="PracticePage" className={`text-sm transition-colors ${isActive('/oving')}`}>Øving</PrefetchLink>
                        </nav>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleDyslexicMode}
                                className={`p-2 transition-colors rounded-full hover:bg-black/5 ${settings.dyslexicMode ? 'text-blue-600 bg-blue-50' : 'text-text-muted hover:text-text-main'}`}
                                aria-label="Dysleksivennlig modus"
                                title="Dysleksivennlig modus"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            </button>
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
            )}

            <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
            <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

            <main className={`relative z-10 ${isFullWidth ? '' : 'pt-4'}`}>
                <div className={isFullWidth ? '' : 'max-w-7xl mx-auto px-6'}>
                    <Breadcrumbs />
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                            {outlet}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            <ScrollToTop />
        </div>
    );
};