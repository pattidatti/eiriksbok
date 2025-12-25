import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, Shield, MapPin, Calendar, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const cases = [
    {
        id: 'greenland',
        title: 'Mysteriet på Grønland',
        description: 'Hvorfor forsvant de norrøne bosetningene på Grønland etter 500 år? Undersøk klimaendringer, handelsmønstre og sosiale forhold.',
        period: '1200 - 1450',
        location: 'Grønland',
        difficulty: 'Middels',
        estimatedTime: '20-30 min',
        color: 'bg-emerald-500',
        image: '/images/detective/greenland_hero.png',
        link: '/oving/detektiv/greenland'
    },
    {
        id: 'stiklestad',
        title: 'Slaget ved Stiklestad',
        description: 'Døde Olav den hellige som en kriger eller en martyr? Finn sannheten i de eldste kildene.',
        period: '1030',
        location: 'Nord-Trøndelag',
        difficulty: 'Middels',
        estimatedTime: '15-20 min',
        color: 'bg-blue-500',
        image: '/images/detective/stiklestad_hero.png',
        link: '/oving/detektiv/stiklestad'
    },
    {
        id: 'vardo',
        title: 'Vardø-mysteriet',
        description: 'Hvorfor ble Vardø sentrum for de verste hekseprosessene i norgeshistorien?',
        period: '1621 - 1663',
        location: 'Finnmark',
        difficulty: 'Høy',
        estimatedTime: '25-30 min',
        color: 'bg-red-500',
        image: '/images/detective/vardo_hero.png',
        link: '/oving/detektiv/vardo'
    },
    {
        id: 'svartedauden',
        title: 'Svartedaudens Ankomst',
        description: 'Kom pesten virkelig med et skip til Bergen, eller er sannheten mer komplisert?',
        period: '1349',
        location: 'Bergen / Oslo',
        difficulty: 'Middels',
        estimatedTime: '20 min',
        color: 'bg-slate-900',
        image: '/images/detective/svartedauden_hero.png',
        link: '/oving/detektiv/svartedauden'
    }
];

export const DetectiveHubPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 font-bold mb-6"
                    >
                        <Shield className="w-4 h-4" />
                        <span>Kaldssaks-avdelingen</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-display font-bold mb-4 text-slate-900"
                    >
                        Historisk Detektiv
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-slate-600 max-w-2xl mx-auto"
                    >
                        Gå dypt inn i historiens uoppklarte mysterier. Bruk kildemateriale, tolkningsferdigheter og logikk for å finne svar.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {cases.map((caseItem, index) => (
                        <motion.div
                            key={caseItem.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.3 }}
                        >
                            <Link
                                to={caseItem.link}
                                className="group block bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300"
                            >
                                <div className="h-48 relative overflow-hidden">
                                    <img
                                        src={caseItem.image}
                                        alt={caseItem.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                                    <div className="absolute bottom-4 left-4 right-4 text-white">
                                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1">
                                            <MapPin className="w-3 h-3" />
                                            {caseItem.location}
                                        </div>
                                        <h3 className="text-xl font-bold font-display">{caseItem.title}</h3>
                                    </div>
                                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold bg-white/90 text-slate-900 shadow-sm`}>
                                        {caseItem.difficulty}
                                    </div>
                                </div>

                                <div className="p-6">
                                    <p className="text-slate-600 mb-6 line-clamp-2">
                                        {caseItem.description}
                                    </p>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <Calendar className="w-4 h-4 text-indigo-500" />
                                            <span>{caseItem.period}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <Clock className="w-4 h-4 text-indigo-500" />
                                            <span>{caseItem.estimatedTime}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                        <div className="flex items-center text-indigo-600 font-bold group-hover:translate-x-1 transition-transform">
                                            <span>Start etterforskning</span>
                                            <ArrowRight className="w-5 h-5 ml-2" />
                                        </div>
                                        <div className={`w-8 h-8 ${caseItem.color} rounded-lg flex items-center justify-center text-white`}>
                                            <Search className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}

                    {/* Placeholder for more cases */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center opacity-70"
                    >
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-300 mb-4 shadow-sm">
                            <Shield className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-400">Nye saker kommer</h3>
                        <p className="text-sm text-slate-400">Våre etterforskere jobber med å kartlegge flere mysterier.</p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
