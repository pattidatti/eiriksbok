import React, { useState } from 'react';
import { ImmersiveCard } from '../ImmersiveCard';

export const RomeSection: React.FC = () => {
    const [copperAmount, setCopperAmount] = useState(0);

    const r = 255 - (copperAmount * 0.8);
    const g = 215 - (copperAmount * 1.1);
    const b = 0 + (copperAmount * 0.4);
    const coinColor = `rgb(${r},${g},${b})`;
    const inflation = Math.round(Math.pow(copperAmount, 1.3));

    return (
        <ImmersiveCard className="mb-16 border-t-4 border-t-yellow-500">
            <div className="p-4 md:p-8">
                <h2 className="text-3xl font-display text-text-main mb-2">4. Romerriket: Historiens første inflasjon</h2>
                <p className="text-text-muted text-lg mb-8">Hva skjer når staten "jukser" med pengene?</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="bg-glass-bg p-6 rounded-2xl border border-glass-border shadow-md">
                            <div className="flex items-center gap-6 mb-8 justify-center">
                                <div
                                    className="w-40 h-40 rounded-full flex items-center justify-center text-6xl shadow-2xl transition-all duration-300 border-8 border-yellow-600/20"
                                    style={{ backgroundColor: coinColor }}
                                >
                                    🏛️
                                </div>
                            </div>

                            <label className="text-sm font-bold text-text-muted uppercase mb-2 block tracking-widest text-center">Bland inn billig kobber</label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={copperAmount}
                                onChange={(e) => setCopperAmount(parseInt(e.target.value))}
                                className="mb-6 w-full h-2 bg-glass-border rounded-lg appearance-none cursor-pointer accent-yellow-500"
                            />

                            <div className="text-center bg-glass-highlight p-4 rounded-xl border border-glass-border shadow-inner">
                                <span className="text-xs font-bold uppercase text-text-muted">Prisvekst (Inflasjon)</span>
                                <div className="text-4xl font-black text-red-500">{inflation}%</div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="font-bold text-xl text-yellow-500">Utvanning (Debasement)</h3>
                        <div className="text-text-muted leading-relaxed">
                            <p className="mb-4">
                                Romerske keisere som Nero trengte mer penger enn de hadde i skatteinntekter. De ønsket ikke å øke skattene (som er upopulært), så de fant en "smart" løsning:
                            </p>
                            <p className="mb-4">
                                De samlet inn gullmynter, smeltet dem om, og blandet inn billig kobber. Plutselig hadde de "flere" mynter! Men myntene var mindre verdt.
                            </p>
                            <p>
                                Da markedet oppdaget at myntene var utvannet, krevde kjøpmenn flere mynter for de samme varene. Dette er definisjonen på inflasjon: Pengemengden øker uten at varemengden øker.
                            </p>
                        </div>
                        <div className="bg-glass-bg border-l-4 border-yellow-500 p-4 rounded-r-xl">
                            <div className="font-bold text-yellow-500 uppercase text-sm mb-1">💡 Østerriksk Perspektiv</div>
                            <p className="text-sm text-text-muted">
                                Dette er i praksis tyveri. Staten stjeler kjøpekraft fra folket ved å vanne ut valutaen. Romerrikets økonomi kollapset til slutt fordi ingen stolte på pengene.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </ImmersiveCard>
    );
};
