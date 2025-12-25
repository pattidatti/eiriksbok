import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Shield, Anchor, Sword } from 'lucide-react';
import { motion } from 'framer-motion';

export const TimeTravelPage: React.FC = () => {
    const scenarios = [
        {
            id: 'roman-soldier',
            title: 'Romersk Legionær',
            era: '122 e.Kr.',
            difficulty: 'Middels',
            description: 'Stå vakt ved Hadrians mur og hold barbarene unna.',
            icon: Shield,
            color: 'bg-red-900',
            image: '/images/chronos/hadrian_mist.jpg' // Placeholder or the one we used in JSON
        },
        // Future scenarios
        {
            id: 'feudal-peasant',
            title: 'Bonde i 1349 (Kommer snart)',
            era: '1349',
            difficulty: 'Høy',
            description: 'Overlev Svartedauden.',
            icon: Anchor,
            color: 'bg-amber-800',
            disabled: true
        }
    ];

    return (
        <div className="min-h-screen pt-24 pb-12 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center p-3 mb-4 bg-indigo-100 rounded-2xl text-indigo-600">
                        <Clock size={32} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-slate-900">
                        Tidsreiser
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Tre inn i historien. Ta valgene som formet fortiden.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {scenarios.map((scenario) => (
                        <motion.div
                            key={scenario.id}
                            whileHover={!scenario.disabled ? { y: -5 } : {}}
                            className={`group relative rounded-3xl overflow-hidden bg-white shadow-sm border border-slate-100 ${scenario.disabled ? 'opacity-60 grayscale cursor-not-allowed' : 'hover:shadow-xl transition-all duration-300'}`}
                        >
                            {!scenario.disabled ? (
                                <Link to={`/oving/tidsreise/${scenario.id}`} className="block h-full">
                                    <ScenarioCardContent scenario={scenario} />
                                </Link>
                            ) : (
                                <div className="h-full">
                                    <ScenarioCardContent scenario={scenario} />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ScenarioCardContent: React.FC<{ scenario: any }> = ({ scenario }) => (
    <>
        <div className={`h-48 ${scenario.color} relative overflow-hidden`}>
            {/* Simple Pattern/Image Overlay */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay" />

            <div className="absolute top-4 right-4 px-3 py-1 bg-black/20 backdrop-blur-md rounded-full text-xs font-bold text-white uppercase tracking-wider border border-white/10">
                {scenario.era}
            </div>

            <div className="absolute bottom-4 left-4 text-white">
                <scenario.icon size={32} className="mb-2 opacity-80" />
                <h3 className="text-2xl font-display font-bold">{scenario.title}</h3>
            </div>
        </div>
        <div className="p-6">
            <div className="flex items-center justify-between mb-4">
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${scenario.difficulty === 'Lett' ? 'bg-green-100 text-green-700' :
                        scenario.difficulty === 'Middels' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                    }`}>
                    {scenario.difficulty}
                </span>
            </div>
            <p className="text-slate-600 mb-6 leading-relaxed">
                {scenario.description}
            </p>
            <div className="flex items-center text-indigo-600 font-bold text-sm uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                Start Reisen <Sword size={14} className="ml-2" />
            </div>
        </div>
    </>
);
