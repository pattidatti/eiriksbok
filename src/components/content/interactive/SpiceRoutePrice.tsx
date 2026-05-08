import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, RotateCcw, MapPin, TrendingUp } from 'lucide-react';

interface Stop {
    id: string;
    location: string;
    region: string;
    actor: string;
    description: string;
    multiplier: number;
    flag?: string;
}

interface SpiceRoutePriceProps {
    title?: string;
    intro?: string;
    basePrice?: number;
    unit?: string;
    stops?: Stop[];
}

const DEFAULT_STOPS: Stop[] = [
    {
        id: 'kalikut',
        location: 'Kalikut',
        region: 'India',
        actor: 'Indisk pepperbonde',
        description: 'Pepperet plukkes og tørkes på vestkysten av India. Bonden får knapt nok til å brødfø familien.',
        multiplier: 1,
        flag: '🌶️',
    },
    {
        id: 'hormuz',
        location: 'Hormuz',
        region: 'Persiabukta',
        actor: 'Arabisk handelskaptein',
        description: 'En dhow seiler over Indiahavet med monsunvinden. Kapteinen tar betalt for risiko, mannskap og lasterom.',
        multiplier: 3,
        flag: '⛵',
    },
    {
        id: 'kairo',
        location: 'Kairo',
        region: 'Egypt (Mamluk)',
        actor: 'Karavaneier og Mamluk-toller',
        description: 'Pepperet krysser Arabia og Sinai med kameler. Mamluk-sultanen krever 33 prosent eksporttoll.',
        multiplier: 4,
        flag: '🐪',
    },
    {
        id: 'alexandria',
        location: 'Alexandria',
        region: 'Egypt',
        actor: 'Lokal grossist og havneinspektør',
        description: 'I Alexandria byttes lasten over på venetianske galeer. Havneavgifter og bestikkelser legges til.',
        multiplier: 2,
        flag: '⚓',
    },
    {
        id: 'venezia',
        location: 'Venezia',
        region: 'Italia',
        actor: 'Veneziansk patrisier',
        description: 'Republikkens konvoiseiling, lager og grossistmonopol gjør Venezia til Europas dyreste butikk.',
        multiplier: 4,
        flag: '🏛️',
    },
];

export const SpiceRoutePrice: React.FC<SpiceRoutePriceProps> = ({
    title = 'Pepperkornets reise',
    intro = 'Følg ett enkelt pepperkorn fra India til Europa. For hvert ledd legges en ny pris til. Klikk fram for å se hvordan grunnprisen vokser til hundre ganger.',
    basePrice = 1,
    unit = 'sølvenhet',
    stops = DEFAULT_STOPS,
}) => {
    const [currentStop, setCurrentStop] = useState(0);

    const cumulativePrice = (index: number) => {
        let price = basePrice;
        for (let i = 0; i <= index; i++) {
            price *= stops[i]?.multiplier ?? 1;
        }
        return price;
    };

    const isLast = currentStop === stops.length - 1;
    const stop = stops[currentStop];
    const price = cumulativePrice(currentStop);
    const startPrice = cumulativePrice(0);

    const handleNext = () => {
        if (!isLast) setCurrentStop(currentStop + 1);
    };

    const handleReset = () => setCurrentStop(0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="my-8 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50/40 to-white shadow-sm overflow-hidden"
        >
            <div className="p-6 border-b border-amber-100 bg-amber-50/60">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                        <TrendingUp size={20} />
                    </div>
                    <h3 className="font-display font-bold text-xl text-amber-900">{title}</h3>
                </div>
                <p className="text-amber-800/80 text-sm leading-relaxed">{intro}</p>
            </div>

            <div className="p-6">
                {/* Progress dots */}
                <div className="flex items-center justify-between mb-6 px-1">
                    {stops.map((s, i) => (
                        <React.Fragment key={s.id}>
                            <button
                                onClick={() => setCurrentStop(i)}
                                className={`relative flex flex-col items-center gap-1 transition-all ${
                                    i === currentStop ? 'scale-110' : 'opacity-60 hover:opacity-90'
                                }`}
                                aria-label={`Gå til ${s.location}`}
                            >
                                <div
                                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-base ${
                                        i <= currentStop
                                            ? 'border-amber-500 bg-amber-100 text-amber-700'
                                            : 'border-slate-300 bg-white text-slate-400'
                                    }`}
                                >
                                    {s.flag ?? <MapPin size={14} />}
                                </div>
                                <span
                                    className={`text-[10px] font-medium ${
                                        i <= currentStop ? 'text-amber-700' : 'text-slate-400'
                                    }`}
                                >
                                    {s.location}
                                </span>
                            </button>
                            {i < stops.length - 1 && (
                                <div
                                    className={`flex-1 h-0.5 mx-1 mb-4 ${
                                        i < currentStop ? 'bg-amber-400' : 'bg-slate-200'
                                    }`}
                                />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Active stop card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={stop.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25 }}
                        className="rounded-xl border border-amber-100 bg-white p-5 shadow-sm"
                    >
                        <div className="flex items-start justify-between gap-4 mb-3">
                            <div>
                                <div className="text-xs uppercase tracking-wider text-amber-600 font-semibold">
                                    Stopp {currentStop + 1} av {stops.length} · {stop.region}
                                </div>
                                <div className="font-display font-bold text-2xl text-slate-900 mt-1">
                                    {stop.location}
                                </div>
                                <div className="text-sm text-slate-500 mt-0.5">{stop.actor}</div>
                            </div>
                            <div className="text-right shrink-0">
                                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                                    Pris
                                </div>
                                <div className="font-display font-bold text-2xl text-amber-700 tabular-nums">
                                    {price.toLocaleString('nb-NO')}
                                </div>
                                <div className="text-[10px] text-slate-400">{unit}</div>
                            </div>
                        </div>

                        <p className="text-slate-700 leading-relaxed text-sm">{stop.description}</p>

                        {currentStop > 0 && (
                            <div className="mt-4 pt-3 border-t border-amber-100 flex items-center gap-2 text-xs">
                                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold tabular-nums">
                                    × {stop.multiplier}
                                </span>
                                <span className="text-slate-500">
                                    Prisen er nå{' '}
                                    <strong className="text-amber-700 tabular-nums">
                                        {Math.round(price / startPrice)}×
                                    </strong>{' '}
                                    av startprisen
                                </span>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Controls */}
                <div className="flex items-center justify-between mt-5">
                    <button
                        onClick={handleReset}
                        disabled={currentStop === 0}
                        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                        <RotateCcw size={14} /> Start på nytt
                    </button>
                    {!isLast ? (
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm shadow-sm transition"
                        >
                            Neste stopp <ArrowRight size={16} />
                        </button>
                    ) : (
                        <div className="text-right">
                            <div className="text-xs text-slate-500">Sluttpris i Europa</div>
                            <div className="font-display font-bold text-lg text-amber-700 tabular-nums">
                                {Math.round(price / startPrice)}× startprisen
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
