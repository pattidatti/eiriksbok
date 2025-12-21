import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Heart, Zap, Castle, Users, ShieldAlert } from 'lucide-react';

export const VirtueBalance: React.FC = () => {
    const [reason, setReason] = useState(60);
    const [will, setWill] = useState(20);
    const [desire, setDesire] = useState(20);

    // Normalize to 100%
    const handleReason = (val: number) => {
        const diff = val - reason;
        setReason(val);
        setDesire(Math.max(0, desire - diff / 2));
        setWill(Math.max(0, will - diff / 2));
    };

    const handleWill = (val: number) => {
        const diff = val - will;
        setWill(val);
        setReason(Math.max(0, reason - diff / 2));
        setDesire(Math.max(0, desire - diff / 2));
    };

    const handleDesire = (val: number) => {
        const diff = val - desire;
        setDesire(val);
        setReason(Math.max(0, reason - diff / 2));
        setWill(Math.max(0, will - diff / 2));
    };

    // State calculation
    let stateTitle = "";
    let stateDesc = "";
    let Icon = Castle;
    let colorClass = "from-blue-500 to-indigo-600";

    if (reason > 50 && reason > will && reason > desire) {
        stateTitle = "Filosofstaten (Idealstaten)";
        stateDesc = "Fornuften styrer! Samfunnet er i harmoni og rettferdighet råder. Hver klasse gjør sin oppgave.";
        Icon = Castle;
        colorClass = "from-blue-500 to-indigo-600";
    } else if (will > 40) {
        stateTitle = "Timokrati";
        stateDesc = "Viljen og æren har tatt over. Staten er preget av militær disiplin og krigføring, men har mistet visdommen.";
        Icon = ShieldAlert;
        colorClass = "from-red-500 to-orange-600";
    } else if (desire > 40) {
        stateTitle = "Oligarki eller Demokrati (Pøbelvelde)";
        stateDesc = "Begjæret styrer. Enten er det griskhet etter penger (oligarki) eller uregjerlig frihet uten mål (demokrati).";
        Icon = Users;
        colorClass = "from-amber-500 to-yellow-600";
    } else {
        stateTitle = "Tyranni";
        stateDesc = "Sjelen og staten er i ubalanse. En enkelt person kan utnytte kaoset til å ta absolutt makt.";
        Icon = Zap;
        colorClass = "from-slate-700 to-slate-900";
    }

    return (
        <div className="bg-white p-8 rounded-2xl border-2 border-slate-100 my-10 shadow-xl">
            <div className="flex flex-col md:flex-row gap-12 items-center">
                {/* Visualizer */}
                <div className="w-full md:w-1/2 flex flex-col items-center">
                    <motion.div
                        animate={{
                            scale: [1, 1.02, 1],
                            rotate: (will - desire) / 10
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className={`w-64 h-64 rounded-full bg-gradient-to-br ${colorClass} shadow-2xl flex items-center justify-center relative overflow-hidden`}
                    >
                        {/* Inner "Soul" components visual representation */}
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_white_0%,transparent_70%)]" />
                        <Icon size={80} className="text-white relative z-10" />

                        {/* Particles representing the three parts */}
                        <div className="absolute inset-0">
                            <div
                                className="absolute top-0 left-1/2 w-4 h-4 bg-blue-200 rounded-full blur-sm"
                                style={{ transform: `translate(-50%, ${100 - reason}px)`, opacity: reason / 100 }}
                            />
                            <div
                                className="absolute bottom-1/4 left-1/4 w-4 h-4 bg-red-200 rounded-full blur-sm"
                                style={{ opacity: will / 100 }}
                            />
                            <div
                                className="absolute bottom-1/4 right-1/4 w-4 h-4 bg-amber-200 rounded-full blur-sm"
                                style={{ opacity: desire / 100 }}
                            />
                        </div>
                    </motion.div>

                    <div className="mt-8 text-center">
                        <h4 className="text-2xl font-bold text-slate-800 mb-2">{stateTitle}</h4>
                        <p className="text-slate-600 text-sm max-w-sm">{stateDesc}</p>
                    </div>
                </div>

                {/* Controls */}
                <div className="w-full md:w-1/2 space-y-8">
                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="flex items-center gap-2 font-bold text-blue-600">
                                <Brain size={18} /> Fornuft (De styrende)
                            </span>
                            <span className="font-mono">{Math.round(reason)}%</span>
                        </div>
                        <input
                            type="range" min="0" max="100" value={reason}
                            onChange={(e) => handleReason(Number(e.target.value))}
                            className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="flex items-center gap-2 font-bold text-red-600">
                                <Heart size={18} /> Vilje (Vaktmennene)
                            </span>
                            <span className="font-mono">{Math.round(will)}%</span>
                        </div>
                        <input
                            type="range" min="0" max="100" value={will}
                            onChange={(e) => handleWill(Number(e.target.value))}
                            className="w-full h-2 bg-red-100 rounded-lg appearance-none cursor-pointer accent-red-600"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="flex items-center gap-2 font-bold text-amber-600">
                                <Zap size={18} /> Begjær (De næringsdrivende)
                            </span>
                            <span className="font-mono">{Math.round(desire)}%</span>
                        </div>
                        <input
                            type="range" min="0" max="100" value={desire}
                            onChange={(e) => handleDesire(Number(e.target.value))}
                            className="w-full h-2 bg-amber-100 rounded-lg appearance-none cursor-pointer accent-amber-600"
                        />
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 italic leading-relaxed">
                        Platon mente at både mennesket og staten består av disse tre delene.
                        Rettferdighet oppstår bare når Fornuften styrer de to andre.
                        Hvis Viljen eller Begjæret tar over, forfaller staten.
                    </div>
                </div>
            </div>
        </div>
    );
};
