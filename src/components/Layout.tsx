import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import './Layout.css';

export const Layout: React.FC = () => {
    const location = useLocation();

    const isActive = (path: string) => {
        return location.pathname.startsWith(path) ? 'active' : '';
    };

    return (
        <div className="layout">
            <nav className="navbar">
                <Link to="/" className="nav-brand">Interactive Concept Hub</Link>
                <div className="nav-links">
                    <Link to="/norsk" className={`nav-link ${isActive('/norsk')}`}>Norsk</Link>
                    <Link to="/samfunnsfag" className={`nav-link ${isActive('/samfunnsfag')}`}>Samfunnsfag</Link>
                    <Link to="/mat-og-helse" className={`nav-link ${isActive('/mat-og-helse')}`}>Mat & Helse</Link>
                    <Link to="/musikk" className={`nav-link ${isActive('/musikk')}`}>Musikk</Link>
                </div>
            </nav>
            <main className="main-content">
                <Outlet />
            </main>
            <footer className="footer">
                <p>© 2025 Interactive Concept Hub. Utviklet for læring.</p>
            </footer>
        </div>
    );
};
