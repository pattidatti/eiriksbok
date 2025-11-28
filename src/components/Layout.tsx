import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { SearchOverlay } from './SearchOverlay';
import './Layout.css';

export const Layout: React.FC = () => {
    const location = useLocation();
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const isActive = (path: string) => {
        return location.pathname.startsWith(path) ? 'active' : '';
    };

    return (
        <div className="layout-container">
            <div className="ambient-glow-container">
                <div className="blue-glow"></div>
                <div className="purple-glow"></div>
            </div>

            <header className="glass-navbar">
                <div className="navbar-content">
                    <Link to="/" className="nav-brand">Eiriksbok</Link>
                    <nav className="nav-links">
                        <Link to="/norsk" className={`nav-link ${isActive('/norsk')}`}>Norsk</Link>
                        <Link to="/samfunnsfag" className={`nav-link ${isActive('/samfunnsfag')}`}>Samfunnsfag</Link>
                        <Link to="/krle" className={`nav-link ${isActive('/krle')}`}>KRLE</Link>
                        <Link to="/musikk" className={`nav-link ${isActive('/musikk')}`}>Musikk</Link>
                    </nav>
                    <div className="nav-actions">
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                padding: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-main)'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
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

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};