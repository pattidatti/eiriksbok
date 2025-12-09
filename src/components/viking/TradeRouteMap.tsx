import React from 'react';
import { motion } from 'framer-motion';

export const TradeRouteMap: React.FC = () => {
    return (
        <div className="w-full max-w-3xl mx-auto my-8 bg-slate-900 rounded-xl overflow-hidden shadow-2xl text-white">
            <div className="p-6 bg-slate-800 border-b border-slate-700">
                <h3 className="text-xl font-bold">Veien mot Miklagard</h3>
                <p className="text-slate-400 text-sm">Følg elvene fra Sverige til Svartehavet</p>
            </div>

            <div className="relative aspect-video bg-slate-900 p-8">
                {/* Simplified Map Visualization */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ea/Varangian_routes.png')] bg-cover bg-center mix-blend-overlay"></div>

                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {/* The Route Path */}
                    <motion.path
                        d="M 150 100 Q 250 150 350 180 T 550 350"
                        fill="none"
                        stroke="#fbbf24"
                        strokeWidth="4"
                        strokeDasharray="10 5"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, repeatDelay: 2 }}
                    />
                </svg>

                {/* Stations */}
                <Station x={20} y={20} name="Birka" goods="Pels, jern" delay={0} />
                <Station x={45} y={35} name="Novgorod" goods="Honning, voks" delay={1.5} />
                <Station x={60} y={55} name="Kiev" goods="Slaver, korn" delay={2.5} />
                <Station x={85} y={80} name="Miklagard" goods="Silke, sølv, krydder" delay={4} isEnd />
            </div>
        </div>
    );
};

const Station: React.FC<{ x: number; y: number; name: string; goods: string; delay: number; isEnd?: boolean }> = ({ x, y, name, goods, delay, isEnd }) => {
    return (
        <motion.div
            className={`absolute flex flex-col items-center ${isEnd ? 'z-20' : 'z-10'}`}
            style={{ top: `${y}%`, left: `${x}%` }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay }}
        >
            <div className={`w-4 h-4 rounded-full border-2 border-slate-900 ${isEnd ? 'bg-yellow-500 w-6 h-6 animate-pulse' : 'bg-white'}`} />
            <div className="mt-2 bg-slate-800/90 px-3 py-1 rounded backdrop-blur-sm border border-slate-600">
                <div className={`font-bold text-sm ${isEnd ? 'text-yellow-400' : 'text-slate-200'}`}>{name}</div>
                <div className="text-[10px] text-slate-400 whitespace-nowrap">{goods}</div>
            </div>
        </motion.div>
    );
};
