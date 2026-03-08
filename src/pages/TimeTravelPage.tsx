import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Shield, Sword, Trophy, History, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { TimeTravelProfileProvider, useTimeTravelProfile } from '../components/chronos/context/TimeTravelProfileContext';
import type { ChronosRunLog } from '../data/chronos/types';

export const TimeTravelPage: React.FC = () => {
    return (
        <TimeTravelProfileProvider>
            <TimeTravelHub />
        </TimeTravelProfileProvider>
    );
};

const TimeTravelHub: React.FC = () => {
    const { profile, isLoading } = useTimeTravelProfile();

    const scenarios = [
        {
            id: 'roman-soldier',
            title: 'Romersk Legionær',
            era: '122 e.Kr.',
            difficulty: 'Middels',
            description: 'Stå vakt ved Hadrians mur og hold barbarene unna.',
            icon: Shield,
            color: 'bg-red-900',
            image: '/images/chronos/hadrian_mist.jpg',
            disabled: false
        },
        {
            id: 'medieval-baron',
            title: 'Baron av Rhinen',
            era: '1250 e.Kr.',
            difficulty: 'Vanskelig',
            description: 'Styr ditt len, døm dine bønder og sikre din ætt i det tysk-romerske riket.',
            icon: Crown,
            color: 'bg-red-950',
            image: '/images/chronos/medieval_castle_view.jpg',
            disabled: false
        },
        {
            id: 'ww1-vestfront',
            title: 'Skyttergravenes Ekko',
            era: '1916',
            difficulty: 'Vanskelig',
            description: 'Tre uker i skyttergravene ved Somme. Ta valgene som avgjør om du overlever Vestfronten.',
            icon: Sword,
            color: 'bg-slate-700',
            image: '/images/chronos/ww1_trench_hero.webp',
            disabled: false
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
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
                        Tre inn i historien. Ta valgene som formet fortiden.
                    </p>

                    {/* Profile Stats */}
                    {!isLoading && profile && (
                        <div className="inline-flex gap-8 p-4 bg-white rounded-2xl shadow-sm border border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                                    <History size={20} />
                                </div>
                                <div className="text-left">
                                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Reiser</div>
                                    <div className="text-xl font-black text-slate-900">{profile.totalRuns}</div>
                                </div>
                            </div>
                            <div className="w-px bg-slate-100" />
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
                                    <Trophy size={20} />
                                </div>
                                <div className="text-left">
                                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Seiere</div>
                                    <div className="text-xl font-black text-slate-900">{profile.totalWins}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {scenarios.map((scenario) => (
                        <motion.div
                            key={scenario.id}
                            whileHover={!scenario.disabled ? { y: -5 } : {}}
                            className={`group relative rounded-3xl overflow-hidden bg-white shadow-sm border border-slate-100 ${scenario.disabled ? 'opacity-60 grayscale cursor-not-allowed' : 'hover:shadow-xl transition-all duration-300'} `}
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

                {/* Graveyard / History */}
                {!isLoading && profile && profile.graveyard.length > 0 && (
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center gap-4 mb-6">
                            <h2 className="text-2xl font-display font-bold text-slate-900">Dine Forfedre</h2>
                            <div className="h-px bg-slate-200 flex-1" />
                        </div>
                        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
                            {profile.graveyard.slice(0, 5).map((log: ChronosRunLog) => (
                                <div key={log.id} className="p-4 border-b border-slate-100 last:border-0 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-2 h-12 rounded-full ${log.result === 'victory' ? 'bg-yellow-400' : 'bg-slate-300'}`} />
                                        <div>
                                            <div className="font-bold text-slate-900">{{ 'roman-soldier': 'Romersk Legionær', 'medieval-baron': 'Baron av Rhinen', 'ww1-vestfront': 'Skyttergravenes Ekko' }[log.scenarioId] ?? log.scenarioId}</div>
                                            <div className="text-xs text-slate-500 uppercase tracking-wide">
                                                {new Date(log.date).toLocaleDateString()} • {log.daysSurvived} Dager Overlevd
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-slate-900">{log.score} Poeng</div>
                                        <div className={`text-xs uppercase font-bold tracking-wider ${log.result === 'victory' ? 'text-yellow-600' : 'text-slate-400'}`}>
                                            {log.result === 'victory' ? 'Seier' : 'Falt'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
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
                    } `}>
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
