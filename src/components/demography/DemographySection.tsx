import React, { useState } from 'react';
import { ImmersiveCard } from '../ImmersiveCard';

const demoData: Record<number, { t: string; d: string; b: string; de: string; g: string; sh: string }> = {
    1: { t: "Fase 1: Det Førmoderne Samfunn", d: "<strong>Hvorfor?</strong> Man trenger mange barn til å jobbe, og mange dør. Befolkningen står stille.", b: "Høy", de: "Høy", g: "Lav", sh: "concave" },
    2: { t: "Fase 2: Eksplosjonen", d: "<strong>Hvorfor?</strong> Hygiene og mat blir bedre. Dødsraten faller, men tradisjoner holder fødslene høye.", b: "Høy", de: "Faller", g: "Maksimal", sh: "triangle" },
    3: { t: "Fase 3: Modning", d: "<strong>Hvorfor?</strong> Kvinner tar utdanning, barn blir en kostnad heller enn inntekt. Færre barn.", b: "Faller", de: "Lav", g: "Avtar", sh: "bell" },
    4: { t: "Fase 4: Stagnasjon", d: "<strong>Hvorfor?</strong> Moderne samfunn. Folk lever lenge, men får få barn.", b: "Lav", de: "Lav", g: "Stabil", sh: "beehive" },
    5: { t: "Fase 5: Eldrebølgen", d: "<strong>Hvorfor?</strong> Svært lave fødselsrater. Få unge må forsørge mange gamle. Økonomisk utfordring.", b: "Veldig lav", de: "Øker litt", g: "Negativ", sh: "urn" }
};

export const DemographySection: React.FC = () => {
    const [phase, setPhase] = useState(1);
    const data = demoData[phase];

    const renderPyramid = (shape: string) => {
        const bars = [];
        for (let i = 0; i < 20; i++) {
            let w = 0;
            if (shape === 'concave') w = 1 - Math.pow(i / 20, 0.4);
            if (shape === 'triangle') w = 1 - (i / 20);
            if (shape === 'bell') w = 1 - Math.pow(i / 20, 2.5);
            if (shape === 'beehive') w = i > 14 ? 1 - ((i - 14) / 6) : 0.85;
            if (shape === 'urn') w = i < 5 ? 0.6 + (i * 0.05) : (i > 14 ? 1 - ((i - 14) / 6) : 0.9);
            const width = Math.max(5, Math.floor(w * 45));
            bars.push(
                <div key={i} className="flex justify-center h-[14px] mb-[2px] w-full">
                    <div className="h-full transition-all duration-600 ease-out bg-gradient-to-r from-blue-500 to-blue-400 rounded-l-sm mr-[1px]" style={{ width: `${width}%` }}></div>
                    <div className="h-full transition-all duration-600 ease-out bg-gradient-to-r from-pink-400 to-pink-500 rounded-r-sm ml-[1px]" style={{ width: `${width}%` }}></div>
                </div>
            );
        }
        return bars;
    };

    return (
        <ImmersiveCard className="mb-16 border-t-4 border-t-purple-500">
            <div className="p-4 md:p-8">
                <div className="mb-8 border-b border-glass-border pb-4">
                    <h2 className="text-3xl font-display text-text-main mb-2">1. Den Demografiske Overgangen</h2>
                    <p className="text-text-muted">Modellen viser hvordan fødsels- og dødsrater endrer seg når et land utvikler seg fra fattigdom til rikdom.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-5 space-y-6">
                        <div className="text-text-muted leading-relaxed">
                            <p className="mb-4">
                                Overgangen skjer vanligvis i et fast mønster. Det starter med at <strong className="text-text-main">dødsraten faller</strong> (bedre hygiene, medisiner, mat), mens <strong className="text-text-main">fødselsraten forblir høy</strong> en stund til. Dette skaper en "befolkningseksplosjon" i Fase 2 og 3.
                            </p>
                            <p>
                                Senere velger folk å få færre barn fordi barn blir en kostnad heller enn arbeidskraft, og kvinner tar utdanning. Til slutt flater veksten ut.
                            </p>
                        </div>
                        <div className="bg-glass-bg p-6 rounded-2xl border border-glass-border">
                            <label className="block text-sm font-bold text-purple-400 uppercase tracking-wider mb-4">Dra for å utforske fasene:</label>
                            <input
                                type="range"
                                min="1"
                                max="5"
                                value={phase}
                                step="1"
                                onChange={(e) => setPhase(parseInt(e.target.value))}
                                className="w-full h-2 bg-glass-border rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />
                            <div className="mt-6 transition-all duration-300">
                                <h3 className="text-2xl font-display text-purple-400 mb-2">{data.t}</h3>
                                <div className="text-text-muted leading-relaxed space-y-3" dangerouslySetInnerHTML={{ __html: data.d }}></div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-7 flex flex-col justify-center">
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="bg-green-900/20 p-3 rounded-xl text-center border border-green-500/30"><div className="text-xs font-bold text-green-400 uppercase">Fødsler</div><div className="text-xl font-black text-green-400">{data.b}</div></div>
                            <div className="bg-red-900/20 p-3 rounded-xl text-center border border-red-500/30"><div className="text-xs font-bold text-red-400 uppercase">Dødsfall</div><div className="text-xl font-black text-red-400">{data.de}</div></div>
                            <div className="bg-blue-900/20 p-3 rounded-xl text-center border border-blue-500/30"><div className="text-xs font-bold text-blue-400 uppercase">Vekst</div><div className="text-xl font-black text-blue-400">{data.g}</div></div>
                        </div>
                        <div className="bg-glass-bg rounded-2xl p-6 border border-glass-border relative h-96 flex flex-col justify-end">
                            <div className="w-full h-full flex flex-col-reverse relative items-center justify-end pb-8">
                                {renderPyramid(data.sh)}
                            </div>
                            <div className="flex justify-between w-full text-xs font-bold text-text-muted px-2 md:px-10 border-t border-glass-border pt-2 absolute bottom-2 left-0 right-0">
                                <span className="text-blue-400">Menn</span><span className="text-pink-400">Kvinner</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ImmersiveCard>
    );
};
