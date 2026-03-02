import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ScaleIcon,
    HandRaisedIcon,
    BuildingLibraryIcon,
    BuildingOfficeIcon,
    ArrowPathIcon,
    ArrowsRightLeftIcon,
    ShieldExclamationIcon,
} from '@heroicons/react/24/outline';

interface MaktbalanseProps {
    balanceSystem: 'parlamentarisk' | 'maktfordeling';
    setBalanceSystem: (val: 'parlamentarisk' | 'maktfordeling') => void;
    govStatus: 'sitter' | 'felt';
    setGovStatus: (val: 'sitter' | 'felt') => void;
    triggerAction: boolean;
    setTriggerAction: (val: boolean) => void;
    handleMistillit: () => void;
    resetMistillit: () => void;
}

export const Maktbalanse: React.FC<MaktbalanseProps> = ({
    balanceSystem, setBalanceSystem,
    govStatus, setGovStatus,
    triggerAction, setTriggerAction,
    handleMistillit, resetMistillit
}) => {
    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Introduksjon */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Tre deler av makten</h2>
                <p className="text-slate-600">
                    Se hvordan forholdet mellom Lovgivende, Utøvende og Dømmende makt endrer seg basert på styringsform.
                    <br />
                    <span className="text-sm italic">Merk: Legg merke til hvordan regjeringen og parlamentet er "sammensveiset" i parlamentarismen.</span>
                </p>
            </div>

            {/* System Velger */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    onClick={() => { setBalanceSystem('parlamentarisk'); setGovStatus('sitter'); setTriggerAction(false); }}
                    className={`p-6 rounded-2xl border text-left transition-all relative overflow-hidden ${balanceSystem === 'parlamentarisk'
                        ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                >
                    <div className="flex items-center gap-3 mb-2 relative z-10">
                        <HandRaisedIcon className="h-6 w-6 text-indigo-500" />
                        <span className="text-xl font-bold text-slate-900">Parlamentarisme</span>
                    </div>
                    <p className="text-sm text-slate-500 relative z-10">Modell: Norge</p>
                    <p className="text-xs text-slate-500 mt-2 relative z-10">Lovgivende og Utøvende er tett knyttet sammen.</p>
                    {balanceSystem === 'parlamentarisk' && <div className="absolute inset-0 bg-indigo-500/5 z-0" />}
                </button>

                <button
                    onClick={() => { setBalanceSystem('maktfordeling'); setGovStatus('sitter'); setTriggerAction(false); }}
                    className={`p-6 rounded-2xl border text-left transition-all relative overflow-hidden ${balanceSystem === 'maktfordeling'
                        ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                >
                    <div className="flex items-center gap-3 mb-2 relative z-10">
                        <ScaleIcon className="h-6 w-6 text-blue-500" />
                        <span className="text-xl font-bold text-slate-900">Ren Maktfordeling</span>
                    </div>
                    <p className="text-sm text-slate-500 relative z-10">Modell: USA</p>
                    <p className="text-xs text-slate-500 mt-2 relative z-10">Alle tre organer er separerte og uavhengige.</p>
                    {balanceSystem === 'maktfordeling' && <div className="absolute inset-0 bg-blue-500/5 z-0" />}
                </button>
            </div>

            {/* Visualisering */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 h-[600px] relative overflow-hidden shadow-lg">

                {/* Bakgrunnslinjer for tilkobling */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                        </marker>
                    </defs>
                    {/* Linjer tegnes basert på posisjonene til boksene (ca koordinater) */}
                    {/* Top Center: 50% 15% | Bottom Left: 25% 75% | Bottom Right: 75% 75% */}

                    {balanceSystem === 'parlamentarisk' ? (
                        <>
                            {/* Tykk kobling mellom Lovgivende og Utøvende for å vider "Sammensveist" */}
                            <path d="M 500 150 Q 350 300 250 450" stroke="#818cf8" strokeWidth="12" fill="none" strokeDasharray="10,5" className="animate-pulse" opacity="0.4" />
                            <text x="320" y="300" fill="#6366f1" fontSize="14" fontWeight="bold" transform="rotate(30 320,300)">Utgår fra</text>

                            {/* Tynn linje til Dømmende */}
                            <line x1="500" y1="150" x2="750" y2="450" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="5,5" />
                        </>
                    ) : (
                        <>
                            {/* Trekant med sperrer for maktfordeling */}
                            <line x1="500" y1="150" x2="250" y2="450" stroke="#cbd5e1" strokeWidth="4" />
                            <circle cx="375" cy="300" r="15" fill="#f1f5f9" stroke="#ef4444" strokeWidth="2" /> {/* Sperre */}

                            <line x1="500" y1="150" x2="750" y2="450" stroke="#cbd5e1" strokeWidth="4" />
                            <circle cx="625" cy="300" r="15" fill="#f1f5f9" stroke="#ef4444" strokeWidth="2" /> {/* Sperre */}

                            <line x1="250" y1="450" x2="750" y2="450" stroke="#cbd5e1" strokeWidth="4" />
                            <circle cx="500" cy="450" r="15" fill="#f1f5f9" stroke="#ef4444" strokeWidth="2" /> {/* Sperre */}
                        </>
                    )}
                </svg>

                {/* === LOVGIVENDE (TOP) === */}
                <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-64 z-20">
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-center shadow-md relative group hover:scale-105 transition-transform">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-200 px-3 py-1 rounded-full text-xs font-bold text-slate-600 uppercase tracking-wider">Lovgivende</div>
                        <BuildingLibraryIcon className="h-10 w-10 text-indigo-500 mx-auto mb-2" />
                        <h3 className="text-slate-900 font-bold text-lg">
                            {balanceSystem === 'parlamentarisk' ? 'Stortinget' : 'Kongressen'}
                        </h3>

                        {/* Mistillit Knapp */}
                        <button
                            disabled={govStatus === 'felt'}
                            onClick={handleMistillit}
                            className={`mt-4 w-full py-2 rounded-lg font-bold text-xs transition-all shadow-sm ${govStatus === 'felt'
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                : 'bg-red-50 text-red-500 border border-red-200 hover:bg-red-500 hover:text-white'
                                }`}
                        >
                            {govStatus === 'felt' ? 'Regjeringen har gått av' : '⚠️ Fremme Mistillit'}
                        </button>
                    </div>
                </div>

                {/* === UTØVENDE (BOTTOM LEFT) === */}
                <AnimatePresence>
                    <motion.div
                        className="absolute bottom-[10%] left-[15%] w-64 z-20"
                        animate={govStatus === 'felt' ? { y: 100, opacity: 0.5, rotate: -10 } : { y: 0, opacity: 1, rotate: 0 }}
                    >
                        <div className={`bg-slate-50 rounded-xl border p-4 text-center shadow-md relative transition-all ${balanceSystem === 'parlamentarisk' ? 'border-indigo-300 shadow-indigo-200' : 'border-slate-200'}`}>
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-200 px-3 py-1 rounded-full text-xs font-bold text-slate-600 uppercase tracking-wider">Utøvende</div>
                            <BuildingOfficeIcon className="h-10 w-10 text-green-500 mx-auto mb-2" />
                            <h3 className="text-slate-900 font-bold text-lg">
                                {balanceSystem === 'parlamentarisk' ? 'Regjeringen' : 'Presidenten'}
                            </h3>
                            {/* Feedback Bubble for Maktfordeling Mistillit */}
                            {triggerAction && balanceSystem === 'maktfordeling' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute -top-24 left-0 bg-blue-600 text-white text-xs font-bold p-3 rounded-lg shadow-xl w-48 z-50 pointer-events-none"
                                >
                                    "Jeg sitter trygt! Vi er separate makter, husk?" 🇺🇸
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* === DØMMENDE (BOTTOM RIGHT) === */}
                <div className="absolute bottom-[10%] right-[15%] w-64 z-20">
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-center shadow-md relative group hover:scale-105 transition-transform">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-200 px-3 py-1 rounded-full text-xs font-bold text-slate-600 uppercase tracking-wider">Dømmende</div>
                        <ScaleIcon className="h-10 w-10 text-red-500 mx-auto mb-2" />
                        <h3 className="text-slate-900 font-bold text-lg">
                            {balanceSystem === 'parlamentarisk' ? 'Domstolene' : 'Høyesterett'}
                        </h3>
                        <div className="mt-2 text-xs text-slate-500 border-t border-slate-200 pt-2">
                            Kontrollerer at lover følges
                        </div>
                    </div>
                </div>

            </div>

            {/* Reset Button (only if fallen) */}
            {govStatus === 'felt' && (
                <div className="flex justify-center animate-bounce">
                    <button
                        onClick={resetMistillit}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg"
                    >
                        <ArrowPathIcon className="h-5 w-5" />
                        Dann ny regjering
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <h4 className="text-indigo-600 font-bold mb-2 flex items-center gap-2">
                        <ArrowsRightLeftIcon className="h-5 w-5" />
                        Forholdet mellom maktene
                    </h4>
                    <p className="text-slate-600 text-sm">
                        {balanceSystem === 'parlamentarisk'
                            ? "I parlamentarismen er det 'ekteskap' mellom Storting og Regjering. De er avhengige av hverandre. Domstolen står på sidelinjen som uavhengig kontrollør."
                            : "I maktfordelingsprinsippet er de tre 'skilt ved fødselen'. De lever separate liv og passer på hverandre (checks and balances) for at ingen skal bli for sterke."}
                    </p>
                </div>
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <h4 className="text-red-500 font-bold mb-2 flex items-center gap-2">
                        <ShieldExclamationIcon className="h-5 w-5" />
                        Mistillit?
                    </h4>
                    <p className="text-slate-600 text-sm">
                        {balanceSystem === 'parlamentarisk'
                            ? "Våpenet er skarpt! Stortinget kan når som helst kaste regjeringen hvis de er misfornøyde."
                            : "Våpenet er sløvt. Presidenten sitter trygt ut perioden sin (4 år) med mindre han bryter loven (Riksrett)."}
                    </p>
                </div>
            </div>

        </div>
    );
};
