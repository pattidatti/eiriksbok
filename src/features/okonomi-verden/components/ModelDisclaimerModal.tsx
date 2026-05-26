import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LENS_LABELS } from '../data/economic-thinkers';

interface SchoolNote {
    title: string;
    body: string;
}

const SCHOOL_NOTES: SchoolNote[] = [
    {
        title: LENS_LABELS['lens-austrian'],
        body: 'Modellen i Økonomi-Verden bygger på denne brillen. For lav rente bygger bobler, for mye pengetrykk gir inflasjon, og et marked uten inngrep havner i likevekt.',
    },
    {
        title: LENS_LABELS['lens-keynesian'],
        body: 'Ville sagt: noen kriser løses ikke av markedet selv. På 1930-tallet sto millioner uten jobb fordi ingen turte å bruke penger. Da må staten gjøre det.',
    },
    {
        title: LENS_LABELS['lens-monetarist'],
        body: 'Ville sagt: pengemengden er det viktigste, ikke renten alene. Sentralbanken bør være forutsigbar og styre etter klare regler, ikke skjønn.',
    },
    {
        title: LENS_LABELS['lens-post-keynesian'],
        body: 'Ville sagt: bobler vokser oftest i finans og eiendom, ikke i industrien som modellen viser. Stabilitet skaper i seg selv ny ustabilitet (Minsky).',
    },
];

export function ModelDisclaimerButton() {
    const [open, setOpen] = useState(false);
    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-2.5 h-9 rounded-xl bg-indigo-50 hover:bg-indigo-100 active:scale-95 text-indigo-700 text-xs font-bold transition-all"
                aria-label="Om modellen"
                title="Om modellen og dens antakelser"
            >
                <Info size={13} />
                Om modellen
            </button>
            <AnimatePresence>{open && <ModalContent onClose={() => setOpen(false)} />}</AnimatePresence>
        </>
    );
}

function ModalContent({ onClose }: { onClose: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-900/55 backdrop-blur-sm flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.94, y: 14, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200/70 max-h-[90vh] overflow-y-auto"
            >
                <header className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
                            <Info size={18} className="text-white" />
                        </span>
                        <div>
                            <h2 className="text-lg font-display font-bold text-slate-900 leading-tight">
                                Om modellen
                            </h2>
                            <p className="text-xs text-slate-500">
                                Hva simuleringen antar, og hva andre skoler ville tolket annerledes
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:bg-slate-100 active:scale-95 transition-all"
                        aria-label="Lukk"
                    >
                        <X size={18} />
                    </button>
                </header>

                <div className="px-6 py-5 flex flex-col gap-5 text-sm text-slate-700 leading-relaxed">
                    <p>
                        Økonomi-Verden simulerer en liten økonomi med 80 personer og fem produksjonsledd.
                        Modellen er en pedagogisk forenkling - den viser sammenhenger, ikke prognoser.
                        Og den bygger på antakelser fra <strong>én</strong> økonomisk skole.
                    </p>
                    <p>
                        I virkeligheten finnes det flere måter å forstå økonomien på. Her er hva
                        modellen forutsetter, og hva andre skoler ville sagt:
                    </p>

                    <ul className="flex flex-col gap-3">
                        {SCHOOL_NOTES.map((s) => (
                            <li
                                key={s.title}
                                className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4"
                            >
                                <h3 className="text-sm font-bold text-slate-900 mb-1">
                                    {s.title}
                                </h3>
                                <p className="text-sm text-slate-700 leading-snug">{s.body}</p>
                            </li>
                        ))}
                    </ul>

                    <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50/60 p-4 flex items-start gap-3">
                        <BookIcon />
                        <div className="flex-1 text-sm text-slate-700 leading-snug">
                            Når du spiller, prøv å tenke kritisk: hva er det modellen viser deg, og
                            hva er det modellen ikke får med?
                            <Link
                                to="/samfunnskunnskap/okonomi/okonomiske-skoler"
                                className="mt-2 flex items-center gap-1 text-sm font-bold text-indigo-700 hover:text-indigo-900"
                                onClick={onClose}
                            >
                                Les hele artikkelen om økonomiske skoler
                                <ExternalLink size={12} />
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

function BookIcon() {
    return (
        <span className="flex-shrink-0 w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <Info size={16} />
        </span>
    );
}
