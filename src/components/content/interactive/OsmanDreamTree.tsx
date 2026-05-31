import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, Check, Sparkles } from 'lucide-react';

interface OsmanDreamTreeProps {
    title?: string;
}

interface Branch {
    id: string;
    year: string;
    label: string;
    detail: string;
}

const BRANCHES: Branch[] = [
    {
        id: 'sogut',
        year: 'ca. 1300',
        label: 'Flokken samles',
        detail: 'Osman samler ghazi-krigere ved Söğüt. De lever av å kjempe i grenselandet mot Bysants.',
    },
    {
        id: 'bursa',
        year: '1326',
        label: 'Bursa erobres',
        detail: 'Den første store byen faller og blir hovedstad. Nå har riket et fast sentrum, ikke bare en hær.',
    },
    {
        id: 'allianser',
        year: '1300-tallet',
        label: 'Allianser og giftermål',
        detail: 'Osmanerne knytter naboene til seg med ekteskap og avtaler. Vekst skjer ikke bare med sverd.',
    },
    {
        id: 'europa',
        year: '1354',
        label: 'Over til Europa',
        detail: 'Hæren krysser stredet ved Gallipoli. For første gang står osmanerne med begge bein i Europa.',
    },
    {
        id: 'kosovo',
        year: '1389',
        label: 'Slaget på Kosovosletta',
        detail: 'Serberne slås tilbake. Osmanerne blir den sterkeste makten på hele Balkan.',
    },
    {
        id: 'janitsjarer',
        year: 'ca. 1380',
        label: 'En disiplinert hær',
        detail: 'En fast elitehær gir slagkraft ingen av naboene kan måle seg med.',
    },
];

export function OsmanDreamTree({
    title = 'Osmans drøm: treet som dekket verden',
}: OsmanDreamTreeProps) {
    const [grown, setGrown] = useState<Set<string>>(new Set());
    const [active, setActive] = useState<string>(BRANCHES[0].id);

    const toggle = (id: string) => {
        setActive(id);
        setGrown((prev) => {
            const next = new Set(prev);
            next.add(id);
            return next;
        });
    };

    const count = grown.size;
    const done = count === BRANCHES.length;
    const activeBranch = BRANCHES.find((b) => b.id === active)!;

    return (
        <div className="my-8 rounded-xl border border-emerald-200 bg-gradient-to-b from-emerald-50 to-white p-5 shadow-sm sm:p-6">
            <div className="mb-2 flex items-center gap-3">
                <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
                    <Sprout className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            </div>
            <p className="mb-5 text-sm text-slate-600">
                Sagnet sier at Osman drømte om et tre som vokste ut av brystet hans og bredte
                grenene sine over hele verden. Trykk på hver gren og se riket vokse.
            </p>

            <div className="grid gap-5 sm:grid-cols-2">
                {/* Treet */}
                <div className="flex flex-col items-center justify-center rounded-xl bg-emerald-900/95 p-4">
                    <div className="flex flex-wrap items-end justify-center gap-1" style={{ minHeight: 120 }}>
                        {BRANCHES.map((b, i) => {
                            const isGrown = grown.has(b.id);
                            return (
                                <motion.div
                                    key={b.id}
                                    initial={false}
                                    animate={{
                                        height: isGrown ? 40 + i * 12 : 14,
                                        opacity: isGrown ? 1 : 0.3,
                                        backgroundColor: isGrown ? '#34d399' : '#1f4d3a',
                                    }}
                                    transition={{ type: 'spring', stiffness: 140, damping: 14 }}
                                    className="w-4 rounded-t-full"
                                />
                            );
                        })}
                    </div>
                    <div className="mt-1 h-10 w-3 rounded-b bg-amber-900" />
                    <div className="mt-3 text-center text-emerald-100">
                        <span className="text-2xl font-bold">{count}</span>
                        <span className="text-sm text-emerald-300"> / {BRANCHES.length} grener</span>
                    </div>
                </div>

                {/* Grener */}
                <div className="grid grid-cols-1 gap-2">
                    {BRANCHES.map((b) => {
                        const isGrown = grown.has(b.id);
                        return (
                            <button
                                key={b.id}
                                onClick={() => toggle(b.id)}
                                className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-all ${
                                    active === b.id
                                        ? 'bg-emerald-600 text-white shadow-md'
                                        : isGrown
                                          ? 'bg-emerald-100 text-emerald-900'
                                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                <span className="font-medium">{b.label}</span>
                                {isGrown && <Check className="h-4 w-4 shrink-0" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Detalj */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeBranch.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="mt-4 rounded-xl bg-white p-4 ring-1 ring-emerald-100"
                >
                    <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                        {activeBranch.year}
                    </span>
                    <p className="mt-1 text-sm leading-relaxed text-slate-700">{activeBranch.detail}</p>
                </motion.div>
            </AnimatePresence>

            <AnimatePresence>
                {done && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 16 }}
                        className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-white"
                    >
                        <Sparkles className="h-5 w-5 shrink-0" />
                        <p className="text-sm font-medium">
                            Fra en flokk grensekrigere til herre over Balkan på under hundre år. Treet
                            har begynt å dekke verden - akkurat som i Osmans drøm.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
