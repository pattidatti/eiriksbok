import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, EyeOff, SprayCan, Network, RotateCcw, ChevronDown } from 'lucide-react';

interface JakartaMetodenProps {
    title?: string;
}

interface Card {
    icon: typeof FileText;
    label: string;
    text: string;
}

const CARDS: Card[] = [
    {
        icon: FileText,
        label: '1965: malen',
        text: 'Etter et mislykket kuppforsøk ga hæren under general Suharto kommunistpartiet skylden. Det fulgte måneder med massedrap. Anslagsvis mellom 500 000 og over en million mennesker ble drept.',
    },
    {
        icon: EyeOff,
        label: 'Vesten så bort',
        text: 'Vestlige land, blant dem USA og Storbritannia, så Suharto som en alliert mot kommunismen. USA ga til og med hæren lister over mistenkte. Etterpå åpnet Suharto landet for vestlige selskaper.',
    },
    {
        icon: SprayCan,
        label: 'Et navn blir en trussel',
        text: 'Volden ble en slags oppskrift. Senere, under kupp i Latin-Amerika, ble ordet "Jakarta" malt på vegger som en trussel: det samme kan skje her.',
    },
    {
        icon: Network,
        label: 'Et mønster, ikke et uhell',
        text: 'Forskere kaller dette "Jakarta-metoden": å knuse motstanderne med vold, med stilltiende støtte fra Vesten, for å holde et land åpent for vestlige interesser.',
    },
];

export function JakartaMetoden({
    title = 'Jakarta-metoden: da volden ble en oppskrift',
}: JakartaMetodenProps) {
    const [shown, setShown] = useState(1);
    const all = shown >= CARDS.length;

    return (
        <div className="my-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="mb-1 text-lg font-bold text-slate-900">{title}</h3>
            <p className="mb-5 text-sm text-slate-500">
                Dette er et alvorlig kapittel. Les deg gjennom det som skjedde, ett steg om gangen.
            </p>

            <div className="space-y-2.5">
                {CARDS.slice(0, shown).map((c, i) => {
                    const Icon = c.icon;
                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3.5"
                        >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-700 text-white">
                                <Icon className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800">{c.label}</p>
                                <p className="mt-1 text-sm leading-relaxed text-slate-600">{c.text}</p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="mt-5 flex items-center justify-between">
                {all ? (
                    <button
                        onClick={() => setShown(1)}
                        className="flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-slate-600"
                    >
                        <RotateCcw className="h-4 w-4" /> Les på nytt
                    </button>
                ) : (
                    <span className="text-xs text-slate-400">
                        Steg {shown} av {CARDS.length}
                    </span>
                )}
                {!all && (
                    <button
                        onClick={() => setShown((s) => s + 1)}
                        className="flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white shadow transition-colors hover:bg-slate-800"
                    >
                        Les videre <ChevronDown className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
