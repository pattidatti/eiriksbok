import React, { useState } from 'react';
import { ImmersiveCard } from '../ImmersiveCard';
import { Slider } from '../ui/Slider';

export const InflationSection: React.FC = () => {
    const [rate, setRate] = useState(2);

    const endValue = Math.round(1000 / Math.pow(1 + rate / 100, 20));

    const renderChart = () => {
        const bars = [];
        for (let i = 0; i <= 20; i += 2) {
            const h = (1 / Math.pow(1 + rate / 100, i)) * 100;
            bars.push(
                <div key={i} className="flex-1 bg-red-400 rounded-t hover:bg-red-500 transition-all" style={{ height: `${h}%` }}></div>
            );
        }
        return bars;
    };

    return (
        <ImmersiveCard className="mb-16 border-t-4 border-t-red-500">
            <div className="p-4 md:p-8">
                <h2 className="text-3xl font-display text-text-main mb-6">6. Inflasjon: Den skjulte skatten</h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="bg-glass-bg p-6 rounded-2xl border border-glass-border shadow-md">
                        <p className="text-sm text-text-muted mb-6">
                            Inflasjon er ikke at varer blir dyrere, men at <strong>pengene dine blir mindre verdt</strong> fordi staten lager for mange av dem.
                        </p>
                        <label className="block text-sm font-bold text-text-muted mb-2">Årlig inflasjon: <span className="text-red-500 text-xl font-black">{rate}</span>%</label>
                        <Slider
                            min={0}
                            max={15}
                            value={rate}
                            step={0.5}
                            onChange={(e) => setRate(parseFloat(e.target.value))}
                            color="red"
                        />
                        <div className="mt-8 flex items-end justify-between h-40 gap-1">
                            {renderChart()}
                        </div>
                        <div className="mt-4 text-center bg-glass-highlight p-4 rounded-lg border border-glass-border shadow-sm">
                            Kjøpekraft om 20 år: <span className="font-black text-4xl text-red-500">{endValue}</span> kr
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="font-bold text-xl text-red-400">Cantillon-effekten: Hvorfor ulikhet øker</h3>
                        <div className="text-text-muted leading-relaxed">
                            <p className="mb-3">
                                Richard Cantillon (1700-tallet) oppdaget at inflasjon ikke treffer alle likt. Nye penger sprer seg ujevnt:
                            </p>
                            <ul className="space-y-4">
                                <li className="bg-green-900/20 p-4 rounded-xl border border-green-500/30 shadow-sm flex gap-3">
                                    <span className="text-2xl">💰</span>
                                    <div>
                                        <strong className="text-green-400">1. De som får pengene først (Staten/Banker):</strong> De kan bruke de nye pengene <em>før</em> prisene har steget. De kjøper aksjer, boliger og varer billig.
                                    </div>
                                </li>
                                <li className="bg-red-900/20 p-4 rounded-xl border border-red-500/30 shadow-sm flex gap-3">
                                    <span className="text-2xl">💸</span>
                                    <div>
                                        <strong className="text-red-400">2. De som får pengene sist (Lønnsmottakere/Trygdede):</strong> Når de nye pengene endelig når vanlige folk (gjennom lønn), har prisene på mat og strøm allerede steget. De har mistet kjøpekraft.
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-glass-bg border-l-4 border-red-500 p-4 rounded-r-xl">
                            <div className="font-bold text-red-500 uppercase text-sm mb-1">💡 En skjult skatt</div>
                            <p className="text-sm text-text-muted">
                                Inflasjon fungerer som en skjult skatt som overfører rikdom fra vanlige folk (som sparer i penger) til staten og de rike (som har gjeld og eiendeler).
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </ImmersiveCard>
    );
};
