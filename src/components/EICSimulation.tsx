import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BanknotesIcon, ShieldCheckIcon, UserGroupIcon, GlobeAsiaAustraliaIcon } from '@heroicons/react/24/outline';

export const EICSimulation: React.FC = () => {
    const [money, setMoney] = useState(100);
    const [influence, setInfluence] = useState(10);
    const [unrest, setUnrest] = useState(5);
    const [year, setYear] = useState(1600);
    const [log, setLog] = useState<string[]>(["1600: Kompaniet blir grunnlagt."]);

    const addLog = (message: string) => {
        setLog(prev => [message, ...prev].slice(0, 5));
    };

    const handleTrade = () => {
        setMoney(prev => prev + 30);
        setInfluence(prev => prev + 2);
        setUnrest(prev => prev + 1);
        setYear(prev => prev + 2);
        addLog(`${year}: Handelsekspedisjon vellykket. Stor profitt.`);
    };

    const handleFort = () => {
        if (money < 50) {
            addLog(`${year}: Ikke nok penger til å bygge festning.`);
            return;
        }
        setMoney(prev => prev - 50);
        setInfluence(prev => prev + 15);
        setUnrest(prev => prev + 5);
        setYear(prev => prev + 5);
        addLog(`${year}: Festning bygget. Innflytelsen øker, men lokalbefolkningen er skeptisk.`);
    };

    const handleBribe = () => {
        if (money < 20) {
            addLog(`${year}: Ikke nok penger til bestikkelser.`);
            return;
        }
        setMoney(prev => prev - 20);
        setUnrest(prev => Math.max(0, prev - 10));
        setYear(prev => prev + 1);
        addLog(`${year}: Lokale herskere blidgjort. Uroen dempes.`);
    };

    const handleArmy = () => {
        if (money < 40) {
            addLog(`${year}: Ikke nok penger til å rekruttere hær.`);
            return;
        }
        setMoney(prev => prev - 40);
        setInfluence(prev => prev + 20);
        setUnrest(prev => prev + 10);
        setYear(prev => prev + 3);
        addLog(`${year}: Sepoy-hæren utvidet. Maktposisjonen styrkes, men spenningen stiger.`);
    };

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-4xl mx-auto my-8 shadow-xl">
            <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <GlobeAsiaAustraliaIcon className="h-10 w-10 text-indigo-600" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">EIC-Simulatoren</h2>
                    <p className="text-slate-600 text-base mt-1">Styr kompaniets vei til makt. Balanser profitt med stabilitet.</p>
                </div>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-3 gap-6 mb-10">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-3 text-emerald-600">
                        <BanknotesIcon className="h-6 w-6" />
                        <span className="font-bold text-sm uppercase tracking-wider">Statskasse</span>
                    </div>
                    <div className="text-3xl font-mono text-slate-900 font-bold">£{money}k</div>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-3 text-blue-600">
                        <ShieldCheckIcon className="h-6 w-6" />
                        <span className="font-bold text-sm uppercase tracking-wider">Innflytelse</span>
                    </div>
                    <div className="w-full bg-slate-200 h-3 rounded-full mt-2 overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, influence)}%` }}></div>
                    </div>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-3 text-rose-600">
                        <UserGroupIcon className="h-6 w-6" />
                        <span className="font-bold text-sm uppercase tracking-wider">Uro</span>
                    </div>
                    <div className="w-full bg-slate-200 h-3 rounded-full mt-2 overflow-hidden">
                        <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, unrest)}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Actions & Log */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Handlinger</h3>

                    <button onClick={handleTrade} className="w-full p-5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-emerald-300 rounded-2xl text-left transition-all duration-200 flex justify-between items-center group shadow-sm hover:shadow-md">
                        <div>
                            <div className="font-bold text-slate-900 text-lg group-hover:text-emerald-700 transition-colors">Handelsekspedisjon</div>
                            <div className="text-sm text-slate-500 mt-1">+£30k, +Innflytelse, +Uro</div>
                        </div>
                        <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-emerald-100 transition-colors">
                            <BanknotesIcon className="h-6 w-6 text-slate-400 group-hover:text-emerald-600" />
                        </div>
                    </button>

                    <button onClick={handleFort} className="w-full p-5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-300 rounded-2xl text-left transition-all duration-200 flex justify-between items-center group shadow-sm hover:shadow-md">
                        <div>
                            <div className="font-bold text-slate-900 text-lg group-hover:text-blue-700 transition-colors">Bygg Festning</div>
                            <div className="text-sm text-slate-500 mt-1">-£50k, ++Innflytelse, +Uro</div>
                        </div>
                        <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                            <ShieldCheckIcon className="h-6 w-6 text-slate-400 group-hover:text-blue-600" />
                        </div>
                    </button>

                    <button onClick={handleArmy} className="w-full p-5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-rose-300 rounded-2xl text-left transition-all duration-200 flex justify-between items-center group shadow-sm hover:shadow-md">
                        <div>
                            <div className="font-bold text-slate-900 text-lg group-hover:text-rose-700 transition-colors">Rekrutter Sepoy-hær</div>
                            <div className="text-sm text-slate-500 mt-1">-£40k, ++Innflytelse, ++Uro</div>
                        </div>
                        <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-rose-100 transition-colors">
                            <UserGroupIcon className="h-6 w-6 text-slate-400 group-hover:text-rose-600" />
                        </div>
                    </button>

                    <button onClick={handleBribe} className="w-full p-5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-amber-300 rounded-2xl text-left transition-all duration-200 flex justify-between items-center group shadow-sm hover:shadow-md">
                        <div>
                            <div className="font-bold text-slate-900 text-lg group-hover:text-amber-700 transition-colors">Diplomati / Bestikkelser</div>
                            <div className="text-sm text-slate-500 mt-1">-£20k, --Uro</div>
                        </div>
                        <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-amber-100 transition-colors">
                            <UserGroupIcon className="h-6 w-6 text-slate-400 group-hover:text-amber-600" />
                        </div>
                    </button>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 font-mono text-sm h-full flex flex-col shadow-inner">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Kompani-logg</h3>
                    <div className="space-y-3 flex-grow overflow-y-auto pr-2 custom-scrollbar">
                        {log.map((entry, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`pb-3 border-b border-slate-200 last:border-0 ${i === 0 ? 'text-slate-900 font-bold' : 'text-slate-500'}`}
                            >
                                <span className="text-indigo-600 mr-2 font-bold">{entry.split(':')[0]}:</span>
                                {entry.split(':')[1]}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {unrest >= 100 && (
                <div className="mt-8 p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-center animate-pulse shadow-lg">
                    <h3 className="text-xl font-bold mb-2">⚠️ Advarsel: Kritisk Uro!</h3>
                    <p>Det store opprøret er nært forestående. Kompaniets dager kan være talte.</p>
                </div>
            )}
        </div>
    );
};
