import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import './Layout.css';

export const Layout: React.FC = () => {
    const location = useLocation();

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
                        {/* Add other links as needed */}
                    </nav>
                    <div className="nav-actions">
                        {/* Search bar or profile icon can go here */}
                    </div>
                </div>
            </header>

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};