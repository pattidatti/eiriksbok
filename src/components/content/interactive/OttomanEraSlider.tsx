import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark, MapPin, Globe2 } from 'lucide-react';

interface OttomanEraSliderProps {
    title?: string;
}

interface Era {
    year: string;
    label: string;
    ruler: string;
    capital: string;
    area: number; // millioner km2 (anslag)
    summary: string;
    verdict: string;
    accent: string;
}

const ERAS: Era[] = [
    {
        year: '1300',
        label: 'Grensekrigere',
        ruler: 'Osman 1.',
        capital: 'Söğüt',
        area: 0.1,
        summary: 'En liten flokk ryttere ved ruinene av Romerriket. Riket er knapt større enn et norsk fylke.',
        verdict: 'Knapt en flekk på kartet - men presset opp mot et døende Bysants.',
        accent: '#a16207',
    },
    {
        year: '1453',
        label: 'Konstantinopel faller',
        ruler: 'Mehmet 2.',
        capital: 'Konstantinopel',
        area: 0.9,
        summary: 'Den 1000 år gamle byen erobres og blir ny hovedstad. Osmanerne sitter nå på broen mellom Europa og Asia.',
        verdict: 'Bro: den som eier byen, eier porten mellom to verdensdeler.',
        accent: '#b45309',
    },
    {
        year: '1566',
        label: 'Gullalderen',
        ruler: 'Süleyman 1.',
        capital: 'Istanbul',
        area: 3.6,
        summary: 'Riket strekker seg over tre kontinenter, fra Ungarn til Jemen og fra Algerie til Irak.',
        verdict: 'Bro: handel og kultur fra øst og vest møtes i én hovedstad.',
        accent: '#15803d',
    },
    {
        year: '1683',
        label: 'Toppen',
        ruler: 'Mehmet 4.',
        capital: 'Istanbul',
        area: 5.2,
        summary: 'Riket er på sitt aller største. Men ved Wiens porter blir hæren slått tilbake for godt.',
        verdict: 'Grensen er nådd: lenger vest kommer ikke hæren.',
        accent: '#1d4ed8',
    },
    {
        year: '1914',
        label: 'Europas syke mann',
        ruler: 'Mehmet 5.',
        capital: 'Istanbul',
        area: 1.8,
        summary: 'Balkan er nesten tapt, og stormaktene sirkler. Snart trekker riket inn i sin siste krig.',
        verdict: 'Barriere: nå er riket en hindring andre vil dele mellom seg.',
        accent: '#6d28d9',
    },
];

const MAX_AREA = 5.2;

export function OttomanEraSlider({
    title = 'Dra gjennom 600 år: bro eller barriere?',
}: OttomanEraSliderProps) {
    const [index, setIndex] = useState(0);
    const era = ERAS[index];

    return (
        <div className="my-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-3">
                <div className="rounded-lg bg-amber-100 p-2 text-amber-700">
                    <Globe2 className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            </div>

            {/* Epoke-velgere */}
            <div className="mb-5 grid grid-cols-5 gap-1 sm:gap-2">
                {ERAS.map((e, i) => (
                    <button
                        key={e.year}
                        onClick={() => setIndex(i)}
                        className={`rounded-lg px-1 py-2 text-center transition-all ${
                            i === index
                                ? 'bg-slate-900 text-white shadow-md'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                    >
                        <span className="block text-sm font-bold sm:text-base">{e.year}</span>
                    </button>
                ))}
            </div>

            {/* Areal-søyle */}
            <div className="mb-5">
                <div className="mb-1 flex items-end justify-between text-xs text-slate-500">
                    <span>Rikets størrelse (anslag, mill. km²)</span>
                    <motion.span
                        key={era.area}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="font-bold text-slate-900"
                    >
                        {era.area.toLocaleString('nb-NO')} mill. km²
                    </motion.span>
                </div>
                <div className="h-6 w-full overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: era.accent }}
                        initial={false}
                        animate={{ width: `${(era.area / MAX_AREA) * 100}%` }}
                        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                    />
                </div>
            </div>

            {/* Infokort */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={era.year}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    className="rounded-xl bg-slate-50 p-4"
                >
                    <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="text-base font-bold" style={{ color: era.accent }}>
                            {era.label}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-slate-600">
                            <Landmark className="h-4 w-4" /> {era.ruler}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-slate-600">
                            <MapPin className="h-4 w-4" /> {era.capital}
                        </span>
                    </div>
                    <p className="mb-3 text-sm leading-relaxed text-slate-700">{era.summary}</p>
                    <p
                        className="rounded-lg border-l-4 bg-white px-3 py-2 text-sm font-medium text-slate-800"
                        style={{ borderColor: era.accent }}
                    >
                        {era.verdict}
                    </p>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
