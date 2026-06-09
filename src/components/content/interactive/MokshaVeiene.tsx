import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, BookOpen, Heart, Star, RotateCcw } from 'lucide-react';

interface YogaPath {
    id: 'karma' | 'jnana' | 'bhakti';
    Icon: React.ComponentType<{ className?: string }>;
    name: string;
    subtitle: string;
    bgClass: string;
    borderClass: string;
    textClass: string;
    description: string;
    example: string;
    quote: string;
    quoteSource: string;
}

const YOGA_PATHS: YogaPath[] = [
    {
        id: 'karma',
        Icon: Zap,
        name: 'Karma Yoga',
        subtitle: 'Handlingens vei',
        bgClass: 'bg-orange-50',
        borderClass: 'border-orange-200',
        textClass: 'text-orange-600',
        description:
            'Karma Yoga er veien gjennom handling. Du gjør pliktene dine - som student, venn eller borger - men uten å forvente belønning. Handlingen er et offer til det guddommelige, ikke en transaksjon. Det er ikke hva du gjør som renser sjelen, men hvorfor du gjør det.',
        example:
            'Eksempel: Du hjelper naboen med å bære varer - ikke fordi du vil ha takk, men fordi det er riktig. Handlingen er sin egen belønning.',
        quote: 'La den rette handlingen være ditt motiv, ikke frukten som kommer av den.',
        quoteSource: 'Bhagavad Gita 2.47',
    },
    {
        id: 'jnana',
        Icon: BookOpen,
        name: 'Jnana Yoga',
        subtitle: 'Kunnskapens vei',
        bgClass: 'bg-cyan-50',
        borderClass: 'border-cyan-200',
        textClass: 'text-cyan-600',
        description:
            'Jnana Yoga er veien gjennom visdom og innsikt. Gjennom meditasjon og filosofisk undersøkelse forstår du at sjelen din (Atman) er identisk med den universelle sjelen (Brahman). Illusjonen om at du er atskilt fra verden - dette kalles maya - oppløses av sann kunnskap.',
        example:
            'Eksempel: En filosof mediterer og spør seg: "Hvem er jeg egentlig - utover kropp, tanker og navn?" Svaret Upanishadene gir er: Du er Brahman selv.',
        quote: 'Det er deg - Tat tvam asi.',
        quoteSource: 'Chandogya Upanishad 6.8.7',
    },
    {
        id: 'bhakti',
        Icon: Heart,
        name: 'Bhakti Yoga',
        subtitle: 'Kjærlighetens vei',
        bgClass: 'bg-pink-50',
        borderClass: 'border-pink-200',
        textClass: 'text-pink-600',
        description:
            'Bhakti Yoga er veien gjennom kjærlighet og hengivelse til en personlig gud - som Krishna, Vishnu eller Durga. Du ber, synger, danser og ofrer blomster - ikke av frykt, men av ren kjærlighet. Ego oppløses i møtet med det guddommelige.',
        example:
            'Eksempel: Pilegrimer reiser hundrevis av kilometer til Varanasi for å bade i Ganges og be til Shiva. Det er ikke en plikt - det er kjærlighet.',
        quote: 'Overgitt til meg med kjærlighet - du skal nå meg.',
        quoteSource: 'Bhagavad Gita 18.65',
    },
];

export function MokshaVeiene() {
    const [explored, setExplored] = useState<Set<string>>(new Set());
    const [active, setActive] = useState<'karma' | 'jnana' | 'bhakti' | null>(null);
    const [done, setDone] = useState(false);

    const handleSelect = (id: 'karma' | 'jnana' | 'bhakti') => {
        if (done) return;
        setActive(id);
        const next = new Set(explored);
        next.add(id);
        setExplored(next);
        if (next.size === 3) {
            setTimeout(() => setDone(true), 600);
        }
    };

    const reset = () => {
        setExplored(new Set());
        setActive(null);
        setDone(false);
    };

    const activePath = YOGA_PATHS.find((p) => p.id === active);

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Star className="w-5 h-5 text-amber-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">Tre veier til Moksha</h3>
                    <p className="text-sm text-slate-500">Klikk på hver vei for å utforske den</p>
                </div>
                <div className="ml-auto text-sm font-medium text-slate-400 tabular-nums">
                    {explored.size}/3 utforsket
                </div>
            </div>

            {/* Path cards */}
            <div className="p-6 pb-4">
                <div className="grid grid-cols-3 gap-3">
                    {YOGA_PATHS.map((path) => {
                        const isExplored = explored.has(path.id);
                        const isActive = active === path.id;
                        return (
                            <motion.button
                                key={path.id}
                                onClick={() => handleSelect(path.id)}
                                whileHover={{ scale: done ? 1 : 1.02 }}
                                whileTap={{ scale: done ? 1 : 0.97 }}
                                className={`text-left p-4 rounded-xl border-2 transition-colors ${
                                    isActive
                                        ? `${path.bgClass} ${path.borderClass} shadow-md`
                                        : isExplored
                                          ? `${path.bgClass} ${path.borderClass} opacity-80`
                                          : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                                }`}
                            >
                                <div
                                    className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${path.bgClass} border ${path.borderClass}`}
                                >
                                    <path.Icon className={`w-4 h-4 ${path.textClass}`} />
                                </div>
                                <div
                                    className={`font-semibold text-sm leading-snug ${isActive || isExplored ? path.textClass : 'text-slate-700'}`}
                                >
                                    {path.name}
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5">{path.subtitle}</div>
                                <AnimatePresence>
                                    {isExplored && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="mt-2 text-xs text-emerald-600 font-medium"
                                        >
                                            Utforsket
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        );
                    })}
                </div>

                {/* Detail panel */}
                <AnimatePresence mode="wait">
                    {activePath && !done && (
                        <motion.div
                            key={activePath.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.2 }}
                            className={`mt-4 p-5 rounded-xl border ${activePath.bgClass} ${activePath.borderClass}`}
                        >
                            <h4 className={`font-semibold mb-2 ${activePath.textClass}`}>
                                {activePath.name} - {activePath.subtitle}
                            </h4>
                            <p className="text-sm text-slate-700 leading-relaxed mb-3">
                                {activePath.description}
                            </p>
                            <p className="text-sm text-slate-600 italic mb-3">{activePath.example}</p>
                            <blockquote
                                className={`border-l-2 pl-3 ${activePath.borderClass} text-sm ${activePath.textClass} italic`}
                            >
                                "{activePath.quote}"
                                <span className="block text-xs text-slate-400 not-italic mt-0.5">
                                    - {activePath.quoteSource}
                                </span>
                            </blockquote>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Completion */}
                <AnimatePresence>
                    {done && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                            className="mt-4 p-5 rounded-xl bg-amber-50 border border-amber-200 text-center"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: [0, 1.3, 1] }}
                                transition={{ delay: 0.15, duration: 0.5, type: 'spring' }}
                                className="flex justify-center mb-2"
                            >
                                <Star className="w-8 h-8 text-amber-400 fill-amber-300" />
                            </motion.div>
                            <h4 className="font-semibold text-amber-800 mb-1">
                                Veiene til Moksha er kartlagt
                            </h4>
                            <p className="text-sm text-amber-700 leading-relaxed">
                                Hinduismen lærer at det ikke finnes én rett vei - hvert menneske finner sin.
                                Karma Yoga, Jnana Yoga og Bhakti Yoga er alle gyldige veier mot det samme
                                målet: gjenforening med Brahman.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-6 pb-5 flex justify-end">
                <button
                    onClick={reset}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}
