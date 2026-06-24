import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe2, RotateCcw } from 'lucide-react';

interface EratosthenesJordaProps {
    title?: string;
    // Avstanden mellom byene Eratosthenes brukte (Syene–Alexandria), i km.
    cityDistanceKm?: number;
    // Vinkelen han faktisk målte i skyggen.
    targetAngle?: number;
}

type Phase = 'idle' | 'complete';

// Lyspære-øyeblikk: Med bare to skygger og litt geometri regnet Eratosthenes ut
// hvor stor HELE jorda er — uten å reise rundt den. Eleven drar skyggevinkelen til
// 7,2° og ser tallet for jordas omkrets lande på rundt 40 000 km.
export function EratosthenesJorda({
    title = 'Mål hele jorda med én skygge',
    cityDistanceKm = 800,
    targetAngle = 7.2,
}: EratosthenesJordaProps) {
    const [angle, setAngle] = useState(2);
    const [phase, setPhase] = useState<Phase>('idle');

    // Geometri for tegningen. Jordas sentrum nederst, Syene rett opp, Alexandria
    // forskjøvet med vinkelen. Vi forstørrer vinkelen litt visuelt så den synes.
    const view = useMemo(() => {
        const cx = 240;
        const cy = 290;
        const R = 200;
        const drawAngle = Math.min(angle * 2.2, 44); // visuell forsterkning
        const rad = (drawAngle * Math.PI) / 180;
        const sx = cx;
        const sy = cy - R; // Syene rett opp
        const ax = cx - R * Math.sin(rad);
        const ay = cy - R * Math.cos(rad);
        // pinne (gnomon) peker radielt utover fra hver by
        const stickLen = 46;
        const aDirX = (ax - cx) / R;
        const aDirY = (ay - cy) / R;
        const aStickX = ax + aDirX * stickLen;
        const aStickY = ay + aDirY * stickLen;
        return { cx, cy, R, sx, sy, ax, ay, aStickX, aStickY, drawAngle };
    }, [angle]);

    // Eratosthenes-regnestykket. En liten vinkel er en kjent brøkdel av hele
    // sirkelen (360°). Avstanden mellom byene ganget med den brøken gir omkretsen.
    const fraction = 360 / angle;
    const circumference = Math.round((cityDistanceKm * fraction) / 500) * 500;

    const handleAngle = (v: number) => {
        setAngle(v);
        if (v >= targetAngle - 0.3 && v <= targetAngle + 0.3) {
            setPhase('complete');
        } else {
            setPhase('idle');
        }
    };

    const reset = () => {
        setAngle(2);
        setPhase('idle');
    };

    const done = phase === 'complete';

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Globe2 className="w-5 h-5 text-indigo-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Dra glidebryteren til skyggevinkelen Eratosthenes målte: 7,2°
                    </p>
                </div>
            </div>

            {/* Tegning */}
            <div className="px-4 pt-4">
                <svg
                    viewBox="0 0 480 320"
                    className="w-full"
                    style={{ maxHeight: 340 }}
                    role="img"
                    aria-label="Diagram av Eratosthenes' måling: to byer på jorda, en pinne som kaster skygge i Alexandria"
                >
                    {/* Sol + parallelle stråler ovenfra */}
                    <motion.g
                        animate={done ? { opacity: [1, 0.7, 1] } : { opacity: 1 }}
                        transition={{ duration: 1.2, repeat: done ? Infinity : 0 }}
                    >
                        <circle cx="410" cy="34" r="18" fill="#fbbf24" stroke="#f59e0b" strokeWidth={2} />
                        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
                            const r = (deg * Math.PI) / 180;
                            return (
                                <line
                                    key={deg}
                                    x1={410 + Math.cos(r) * 22}
                                    y1={34 + Math.sin(r) * 22}
                                    x2={410 + Math.cos(r) * 30}
                                    y2={34 + Math.sin(r) * 30}
                                    stroke="#f59e0b"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                />
                            );
                        })}
                    </motion.g>
                    {[150, 240, 330].map((x) => (
                        <line
                            key={x}
                            x1={x}
                            y1={8}
                            x2={x}
                            y2={70}
                            stroke="#fcd34d"
                            strokeWidth={2}
                            strokeDasharray="4 4"
                        />
                    ))}
                    <text x="240" y="20" textAnchor="middle" className="fill-amber-600" fontSize="11">
                        Solstrålene treffer rett ovenfra
                    </text>

                    {/* Jorda */}
                    <motion.circle
                        cx={view.cx}
                        cy={view.cy}
                        r={view.R}
                        fill="#dbeafe"
                        stroke="#60a5fa"
                        strokeWidth={2}
                        animate={done ? { scale: [1, 1.015, 1] } : { scale: 1 }}
                        transition={{ duration: 1, repeat: done ? Infinity : 0 }}
                        style={{ transformOrigin: `${view.cx}px ${view.cy}px` }}
                    />

                    {/* Radier fra sentrum til byene + vinkelkile */}
                    <line x1={view.cx} y1={view.cy} x2={view.sx} y2={view.sy} stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="5 4" />
                    <line x1={view.cx} y1={view.cy} x2={view.ax} y2={view.ay} stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="5 4" />
                    <circle cx={view.cx} cy={view.cy} r={3.5} fill="#475569" />
                    <text x={view.cx} y={view.cy + 18} textAnchor="middle" className="fill-slate-500" fontSize="10">
                        Jordas sentrum
                    </text>

                    {/* Syene: sol rett over, ingen skygge */}
                    <line x1={view.sx} y1={view.sy} x2={view.sx} y2={view.sy - 40} stroke="#7c3a13" strokeWidth={4} strokeLinecap="round" />
                    <circle cx={view.sx} cy={view.sy} r={4} fill="#16a34a" />
                    <text x={view.sx + 8} y={view.sy - 30} className="fill-emerald-700" fontSize="11" fontWeight="600">
                        Syene
                    </text>
                    <text x={view.sx + 8} y={view.sy - 16} className="fill-emerald-600" fontSize="9">
                        ingen skygge
                    </text>

                    {/* Alexandria: skrå pinne fanger en skygge */}
                    <line x1={view.ax} y1={view.ay} x2={view.aStickX} y2={view.aStickY} stroke="#7c3a13" strokeWidth={4} strokeLinecap="round" />
                    {/* solstråle ned gjennom pinnens topp */}
                    <line x1={view.aStickX} y1={view.aStickY} x2={view.aStickX} y2={view.aStickY - 52} stroke="#fcd34d" strokeWidth={2} strokeDasharray="4 4" />
                    <circle cx={view.ax} cy={view.ay} r={4} fill="#b5482f" />
                    <text x={view.ax - 70} y={view.ay - 24} className="fill-rose-700" fontSize="11" fontWeight="600">
                        Alexandria
                    </text>
                    <text x={view.ax - 70} y={view.ay - 10} className="fill-rose-600" fontSize="9">
                        skygge = {angle.toFixed(1)}°
                    </text>

                    {/* Vinkel-etikett ved sentrum */}
                    <text x={view.cx - 4} y={view.cy - view.R / 2} textAnchor="end" className="fill-indigo-600" fontWeight="700" fontSize="13">
                        {angle.toFixed(1)}°
                    </text>
                </svg>
            </div>

            {/* Live regnestykke — alltid synlig */}
            <div className="mx-4 mt-2 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-slate-50 border border-slate-200 py-2">
                    <div className="text-[10px] uppercase tracking-wide text-slate-400">Skyggevinkel</div>
                    <div className="text-base font-bold text-slate-700 tabular-nums">{angle.toFixed(1)}°</div>
                </div>
                <div className="rounded-lg bg-slate-50 border border-slate-200 py-2">
                    <div className="text-[10px] uppercase tracking-wide text-slate-400">Del av sirkelen</div>
                    <div className="text-base font-bold text-slate-700 tabular-nums">1/{Math.round(fraction)}</div>
                </div>
                <div className={`rounded-lg border py-2 transition-colors ${done ? 'bg-emerald-50 border-emerald-200' : 'bg-blue-50 border-blue-200'}`}>
                    <div className="text-[10px] uppercase tracking-wide text-slate-400">Jordas omkrets</div>
                    <div className={`text-base font-bold tabular-nums ${done ? 'text-emerald-700' : 'text-blue-700'}`}>
                        {circumference.toLocaleString('nb-NO')} km
                    </div>
                </div>
            </div>

            {/* Slider med målmarkør */}
            <div className="px-6 pt-4">
                <div className="relative">
                    <input
                        type="range"
                        min={1}
                        max={20}
                        step={0.1}
                        value={angle}
                        onChange={(e) => handleAngle(Number(e.target.value))}
                        className="w-full accent-indigo-600 cursor-pointer"
                        aria-label="Skyggevinkel i Alexandria"
                    />
                    {/* målmarkør ved 7,2° (skala 1–20) */}
                    <div
                        className="absolute -top-1 flex flex-col items-center pointer-events-none"
                        style={{ left: `${((targetAngle - 1) / 19) * 100}%`, transform: 'translateX(-50%)' }}
                    >
                        <span className="text-[9px] font-semibold text-indigo-500 whitespace-nowrap">7,2°</span>
                    </div>
                </div>
            </div>

            {/* Feedback-sone */}
            <AnimatePresence mode="wait">
                {done ? (
                    <motion.div
                        key="done"
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 240, damping: 18 }}
                        className="mx-6 my-4 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm"
                    >
                        Du klarte det! En skygge på 7,2° er 1/50 av en hel sirkel. Ganger du
                        avstanden mellom byene med 50, får du rundt 40 000 km — jordas omkrets.
                        Eratosthenes regnet dette ut for over 2200 år siden, uten å reise noe sted.
                    </motion.div>
                ) : (
                    <motion.div
                        key="hint"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="mx-6 my-4 px-4 py-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm"
                    >
                        Samme dag, samme klokkeslett: i Syene står sola rett over hodet og pinnen
                        har ingen skygge. I Alexandria kaster pinnen en skygge. Dra vinkelen mot 7,2°
                        og se hva tallet for omkretsen lander på.
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Kontrollrad */}
            <div className="px-6 pb-5 flex items-center justify-end">
                <button
                    onClick={reset}
                    className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                    <RotateCcw className="w-4 h-4" />
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}
