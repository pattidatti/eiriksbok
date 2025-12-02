import React, { useState } from 'react';
import { ImmersiveCard } from '../ImmersiveCard';
import { Slider } from '../ui/Slider';

const rosData: Record<number, { i: string; t: string; d: string; c: string }> = {
    1: { i: "🦶", t: "Fattigdom", d: "Du går barføtt. Mål: Kjøpe sko for å unngå sykdom.", c: "bg-red-900/20 border-red-500/30" },
    2: { i: "🚲", t: "Klatrer oppover", d: "Sykkel sparer tid på vannhenting. Du kan ta jobb lenger unna.", c: "bg-orange-900/20 border-orange-500/30" },
    3: { i: "🛵", t: "Middelklasse", d: "Motorsykkel gir frihet. Barna får skolegang. Kjøleskap.", c: "bg-blue-900/20 border-blue-500/30" },
    4: { i: "✈️", t: "Rik", d: "Bil og flyferier. Du tenker ikke på matprisene.", c: "bg-green-900/20 border-green-500/30" }
};

export const RoslingSection: React.FC = () => {
    const [wealthLevel, setWealthLevel] = useState(1);
    const data = rosData[wealthLevel];

    return (
        <ImmersiveCard className="mb-16 border-t-4 border-t-cyan-500">
            <div className="p-4 md:p-8">
                <h2 className="text-3xl font-display text-text-main mb-6">7. Hans Rosling & Veien til Rikdom</h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <div className="text-text-muted leading-relaxed">
                            <p className="mb-4">
                                Hans Rosling delte verden inn i 4 inntektsnivåer. For å klatre fra nivå 1 (fattigdom) til nivå 4 (rikdom), trenger et land visse forutsetninger, som fred, eiendomsrett og investeringer.
                            </p>
                            <p className="mb-4">
                                Men en av de viktigste faktorene (fra PDF s. 66) er <strong className="text-text-main">"En stabil valuta"</strong>. Hvorfor?
                            </p>
                            <p>
                                For å kjøpe en sykkel eller starte en bedrift, må du kunne <strong className="text-text-main">spare</strong>. Hvis pengene dine mister verdi (høy inflasjon), er det umulig å spare. Da bruker folk opp pengene med en gang, og ingen investerer i fremtiden (fabrikker, maskiner). Uten investeringer, ingen vekst.
                            </p>
                        </div>
                        <div className="bg-glass-bg border-l-4 border-cyan-500 p-4 rounded-r-xl">
                            <div className="font-bold text-cyan-500 uppercase text-sm mb-1">💡 Inflasjon ødelegger stigen</div>
                            <p className="text-sm text-text-muted">
                                Ustabil valuta knekker "rikdomsstigen". Det tvinger folk til å forbli i fattigdom fordi de ikke kan planlegge langsiktig.
                            </p>
                        </div>
                    </div>

                    <div className="bg-glass-bg p-6 rounded-2xl border border-glass-border flex flex-col justify-between h-full shadow-lg">
                        <div className={`relative flex-1 rounded-xl mb-6 flex items-center justify-center flex-col p-6 transition-colors duration-500 border ${data.c}`}>
                            <div className="text-9xl transition-transform duration-500 transform hover:scale-110 drop-shadow-md">{data.i}</div>
                            <h4 className="text-3xl font-black text-text-main mt-6">{data.t}</h4>
                            <p className="text-center text-text-muted text-sm mt-2 px-4 italic">{data.d}</p>
                        </div>

                        <Slider
                            min={1}
                            max={4}
                            value={wealthLevel}
                            step={1}
                            onChange={(e) => setWealthLevel(parseInt(e.target.value))}
                            className="mb-4"
                            color="cyan"
                        />
                        <div className="flex justify-between text-xs font-bold text-cyan-400 uppercase tracking-wider">
                            <span>1. Sko</span>
                            <span>2. Sykkel</span>
                            <span>3. Motor</span>
                            <span>4. Bil/Fly</span>
                        </div>
                    </div>
                </div>
            </div>
        </ImmersiveCard>
    );
};
