import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Eye, Bell, Users, Info, Skull } from 'lucide-react';

export const TotalitarianSandbox: React.FC = () => {
    const [surveillance, setSurveillance] = useState(30);
    const [propaganda, setPropaganda] = useState(30);
    const [fear, setFear] = useState(20);

    const totalControl = (surveillance + propaganda + fear) / 3;

    return (
        <div className="bg-slate-900 text-slate-100 p-8 md:p-12 rounded-3xl border border-slate-800 my-10 shadow-2xl relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,_#fff_1px,transparent_1px)] bg-[size:30px_30px]" />
            </div>

            <div className="relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h3 className="text-4xl font-black tracking-tighter mb-2 flex items-center gap-3">
                            <Eye className="text-red-500" /> TOTALITÆR-SANDKASSEN
                        </h3>
                        <p className="text-slate-400 font-medium">Hvordan krymper det offentlige rommet?</p>
                    </div>
                    <div className="bg-slate-800 px-6 py-3 rounded-2xl border border-slate-700">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Kontrollnivå</span>
                        <div className="flex items-center gap-3">
                            <div className="w-32 h-3 bg-slate-700 rounded-full overflow-hidden">
                                <motion.div
                                    animate={{ width: `${totalControl}%` }}
                                    className={`h-full ${totalControl > 70 ? 'bg-red-600' : 'bg-blue-500'}`}
                                />
                            </div>
                            <span className="font-mono font-bold text-xl">{Math.round(totalControl)}%</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Visualizer: The Public Square */}
                    <div className="relative aspect-square max-w-md mx-auto w-full bg-slate-800 rounded-3xl border border-slate-700 shadow-inner flex items-center justify-center overflow-hidden">
                        {/* The shrinking "Public Space" */}
                        <motion.div
                            animate={{
                                scale: Math.max(0.1, 1 - totalControl / 100),
                                opacity: 1 - totalControl / 150
                            }}
                            className="w-64 h-64 bg-blue-500/20 rounded-full border-4 border-dashed border-blue-400 flex items-center justify-center p-8 text-center"
                        >
                            <span className="text-blue-300 font-bold text-sm uppercase tracking-widest">Offentlig Rom</span>
                        </motion.div>

                        {/* Fear/Surveillance elements */}
                        <AnimatePresence>
                            {surveillance > 50 && (
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
                                    className="absolute top-4 right-4 text-red-500"
                                >
                                    <Eye size={40} />
                                </motion.div>
                            )}
                            {fear > 60 && (
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
                                    className="absolute bottom-4 left-4 text-red-700"
                                >
                                    <Skull size={40} />
                                </motion.div>
                            )}
                            {propaganda > 50 && (
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
                                    className="absolute top-4 left-4 text-amber-500"
                                >
                                    <Bell size={40} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* People icons scattering/vanishing */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            {[...Array(12)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    animate={{
                                        x: (Math.random() - 0.5) * 200,
                                        y: (Math.random() - 0.5) * 200,
                                        opacity: Math.max(0, 1 - (totalControl / 100) * (1 + Math.random())),
                                        scale: Math.max(0.5, 1 - (totalControl / 100))
                                    }}
                                    className="absolute text-slate-500"
                                >
                                    <Users size={20} />
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="space-y-10">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="flex items-center gap-2 font-bold text-blue-400 uppercase tracking-tighter">
                                    <Eye size={18} /> Overvåking
                                </span>
                                <span className="font-mono text-slate-500">{surveillance}%</span>
                            </div>
                            <input
                                type="range" min="0" max="100" value={surveillance}
                                onChange={(e) => setSurveillance(Number(e.target.value))}
                                className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                            <p className="text-xs text-slate-500 italic">Øker statens innsyn i privatlivet. Tilliten mellom borgere svekkes.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="flex items-center gap-2 font-bold text-amber-400 uppercase tracking-tighter">
                                    <Bell size={18} /> Propaganda
                                </span>
                                <span className="font-mono text-slate-500">{propaganda}%</span>
                            </div>
                            <input
                                type="range" min="0" max="100" value={propaganda}
                                onChange={(e) => setPropaganda(Number(e.target.value))}
                                className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                            />
                            <p className="text-xs text-slate-500 italic">Kontroll over informasjon. Språket mister sin evne til sannhet.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="flex items-center gap-2 font-bold text-red-400 uppercase tracking-tighter">
                                    <Shield size={18} /> Frykt & Terror
                                </span>
                                <span className="font-mono text-slate-500">{fear}%</span>
                            </div>
                            <input
                                type="range" min="0" max="100" value={fear}
                                onChange={(e) => setFear(Number(e.target.value))}
                                className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                            />
                            <p className="text-xs text-slate-500 italic">Vilkårlige arrestasjoner. Resultatet er fullstendig atomisering.</p>
                        </div>
                    </div>
                </div>

                <div className="mt-12 p-6 bg-slate-800/50 rounded-2xl border border-slate-700 flex gap-4 items-start">
                    <Info className="text-blue-400 shrink-0 mt-1" />
                    <p className="text-sm text-slate-400 leading-relaxed">
                        Hannah Arendt beskriver hvordan et totalitært system ikke bare undertrykker motstand,
                        men ødelegger selve rommet der mennesker kan handle sammen. Ved 100% kontroll
                        opphører mennesket å være et politisk vesen; man blir isolert, redd og ute av stand
                        til å skille mellom fakta og fiksjon.
                    </p>
                </div>
            </div>
        </div>
    );
};
