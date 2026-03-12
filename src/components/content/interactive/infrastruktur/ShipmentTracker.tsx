import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    title?: string;
    description?: string;
}

const PRODUCTS = [
    {
        id: 'banana',
        name: 'Banan',
        emoji: '🍌',
        origin: 'Ecuador',
        journey: [
            { step: 'Plukket på plantasje i Ecuador', icon: '🌿' },
            { step: 'Fraktet til havn i Guayaquil', icon: '🚚' },
            { step: 'Lastet på kjølebåt i Panamakanalen', icon: '🚢' },
            { step: 'Atlanterhavskryssing (12-14 dager)', icon: '🌊' },
            { step: 'Ankomst Rotterdam, Nederland', icon: '⚓' },
            { step: 'Vogntog til Oslo (1-2 dager)', icon: '🚛' },
            { step: 'Distribusjonslager, deretter butikkhylle', icon: '🏪' },
        ],
        distance: '~12 000 km',
        time: '18–22 dager',
        emissions: '~80 g CO₂/kg',
        fact: 'Ecuador produserer 30 % av verdens bananeksport. Chiquita og Dole kontrollerer store deler av leverandørkjedene.',
    },
    {
        id: 'salmon',
        name: 'Norsk laks',
        emoji: '🐟',
        origin: 'Norsk oppdrettsanlegg',
        journey: [
            { step: 'Slaktet og fileert ved anlegg i Vestlandet', icon: '🏔️' },
            { step: 'Nedkjølt til 0°C, pakket i is', icon: '❄️' },
            { step: 'Flylastet fra Oslo Lufthavn', icon: '✈️' },
            { step: 'Ankomst Tokyo Narita eller Beijing (10 t)', icon: '🌏' },
            { step: 'Tollklarering og kaldkjedetransport', icon: '🚛' },
            { step: 'Sushirestaurant i Asia (24-36 timer etter slakt)', icon: '🍣' },
        ],
        distance: '~8 500 km (til Asia)',
        time: '1–2 døgn',
        emissions: '~6 kg CO₂/kg (fly!)',
        fact: 'Fersk norsk laks flys til Asia innen 48 timer etter slakt. Flytransport er 50 ganger dyrere enn sjøfart per kg, men laksen er verdt det.',
    },
    {
        id: 'tshirt',
        name: 'T-skjorte',
        emoji: '👕',
        origin: 'Bangladesh',
        journey: [
            { step: 'Bomull dyrket i India eller USA', icon: '🌾' },
            { step: 'Spunnet til garn, vevd til stoff', icon: '🧵' },
            { step: 'Sydd i fabrikk i Dhaka, Bangladesh', icon: '🏭' },
            { step: 'Container lastet i Chittagong havn', icon: '📦' },
            { step: 'Seilas via Malakkastredet og Suezkanalen', icon: '🚢' },
            { step: 'Ankomst Hamburgburgshavn eller Rotterdam', icon: '⚓' },
            { step: 'Distribusjonslager og butikk', icon: '🏪' },
        ],
        distance: '~12 500 km',
        time: '30–40 dager',
        emissions: '~2 kg CO₂ (produksjon + frakt)',
        fact: 'En t-skjorte til 199 kr har ofte krysset 5–6 landegrenser. 80 % av verdens klær produseres i Asia, med Bangladesh som størst etter Kina.',
    },
    {
        id: 'coffee',
        name: 'Kaffe',
        emoji: '☕',
        origin: 'Etiopia / Brasil',
        journey: [
            { step: 'Kaffe plukket for hånd på etiopisk høyland', icon: '🌿' },
            { step: 'Fermentert, tørket og sortert', icon: '☀️' },
            { step: 'Eksportert via Djibouti havn (Etiopia) eller Santos havn (Brasil)', icon: '⚓' },
            { step: 'Seilas til Europa (Antwerpen er verdens største kaffehavn)', icon: '🚢' },
            { step: 'Brennes hos norsk kafferisteri', icon: '🔥' },
            { step: 'Pakket og til butikk i Oslo', icon: '🏪' },
        ],
        distance: '~7 000–10 000 km',
        time: '4–8 uker',
        emissions: '~5 kg CO₂/kg (mesteparten fra brenn)',
        fact: 'Antwerpen havn håndterer 2/3 av Europas kaffimport. Kaffe er den nest mest omsatte råvaren i verden etter olje.',
    },
];

export function ShipmentTracker({ title, description }: Props) {
    const [selected, setSelected] = useState<(typeof PRODUCTS)[0] | null>(null);
    const [currentStep, setCurrentStep] = useState(0);

    function selectProduct(product: (typeof PRODUCTS)[0]) {
        setSelected(product);
        setCurrentStep(0);
    }

    return (
        <div className="my-6 rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="bg-blue-50 border-b border-blue-100 px-4 py-3">
                <h4 className="font-bold text-slate-800 text-sm">{title ?? 'Hvor kommer maten din fra?'}</h4>
                {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
            </div>

            <div className="p-4">
                {/* Product selector */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                    {PRODUCTS.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => selectProduct(p)}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-sm transition-all ${
                                selected?.id === p.id
                                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                            }`}
                        >
                            <span className="text-2xl">{p.emoji}</span>
                            <span className="text-xs font-medium">{p.name}</span>
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {selected && (
                        <motion.div
                            key={selected.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            {/* Stats */}
                            <div className="flex gap-3 mb-4">
                                {[
                                    { label: 'Avstand', value: selected.distance },
                                    { label: 'Tid', value: selected.time },
                                    { label: 'CO₂', value: selected.emissions },
                                ].map((s) => (
                                    <div key={s.label} className="flex-1 bg-slate-50 rounded-lg p-2 text-center text-xs">
                                        <div className="font-bold text-slate-800">{s.value}</div>
                                        <div className="text-slate-500">{s.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Journey steps */}
                            <div className="space-y-1.5 mb-3">
                                {selected.journey.map((step, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentStep(i)}
                                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-left transition-all ${
                                            i <= currentStep
                                                ? 'bg-blue-50 text-blue-800'
                                                : 'text-slate-400'
                                        }`}
                                    >
                                        <span className="text-base w-6 flex-shrink-0">{step.icon}</span>
                                        <span>{step.step}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Fact */}
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                                <span className="font-semibold">Visste du? </span>
                                {selected.fact}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!selected && (
                    <p className="text-center text-sm text-slate-400 py-4">
                        Velg en matvare for å se dens globale reise
                    </p>
                )}
            </div>
        </div>
    );
}
