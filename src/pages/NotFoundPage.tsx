import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-9xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 mb-4">
                    404
                </h1>
                <h2 className="text-3xl font-display font-bold text-text-main mb-6">
                    Fant ikke siden
                </h2>
                <p className="text-text-muted max-w-md mx-auto mb-8 text-lg">
                    Beklager, men siden du leter etter eksisterer ikke eller har blitt flyttet.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-colors"
                    >
                        <Home className="w-5 h-5" />
                        Gå til forsiden
                    </Link>
                    <Link
                        to="/sok"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-text-main rounded-full font-medium transition-colors backdrop-blur-sm"
                    >
                        <Search className="w-5 h-5" />
                        Søk i innhold
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};
