import React, { useState } from 'react';
import { Clock, Gift } from 'lucide-react';

export const TimePreferenceModel: React.FC = () => {
    const [patience, setPatience] = useState(5); // 0 = Very Impatient, 10 = Very Patient

    // Calculate "Natural Interest Rate" based on patience
    // Low patience (0) -> High rate required (e.g. 20%)
    // High patience (10) -> Low rate required (e.g. 2%)
    const naturalRate = Math.max(1, 20 - (patience * 1.8));

    const getMarshmallows = (years: number) => {
        // Compound interest formula: P * (1 + r)^t
        // Base is 1 marshmallow
        return 1 * Math.pow(1 + naturalRate / 100, years);
    };

    return (
        <div className="space-y-8 p-6 bg-white rounded-xl shadow-sm border border-slate-200 my-8">
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Clock className="w-6 h-6 text-indigo-600" />
                    Tidspreferanse: Marshmallow-testen
                </h3>
                <p className="text-slate-600 text-sm">
                    Hvor tålmodig er du? Din vilje til å vente på en belønning bestemmer hvilken rente du krever for å låne bort pengene dine.
                </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-lg">
                <label className="block text-sm font-medium text-slate-700 mb-4 flex justify-between">
                    <span>Utålmodig (Høy tidspreferanse)</span>
                    <span>Tålmodig (Lav tidspreferanse)</span>
                </label>
                <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={patience}
                    onChange={(e) => setPatience(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="mt-2 text-center font-medium text-indigo-600">
                    {patience < 3 ? "Jeg vil ha alt NÅ!" : patience > 7 ? "Jeg kan vente lenge." : "Jeg kan vente litt."}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Option A: Now */}
                <div className="border-2 border-slate-200 rounded-xl p-4 text-center opacity-50">
                    <div className="text-sm text-slate-500 mb-2">I dag</div>
                    <div className="flex justify-center mb-2">
                        <Gift className="w-12 h-12 text-pink-500" />
                    </div>
                    <div className="font-bold text-slate-800">1 Marshmallow</div>
                </div>

                {/* Option B: Later */}
                <div className="border-2 border-indigo-500 bg-indigo-50 rounded-xl p-4 text-center relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
                        Du venter 1 år
                    </div>
                    <div className="text-sm text-slate-500 mb-2">Om 1 år</div>
                    <div className="flex justify-center mb-2 gap-1 flex-wrap">
                        {Array.from({ length: Math.floor(getMarshmallows(1)) }).map((_, i) => (
                            <Gift key={i} className="w-12 h-12 text-pink-500" />
                        ))}
                        {getMarshmallows(1) % 1 > 0.2 && (
                            <Gift className="w-8 h-8 text-pink-300" />
                        )}
                    </div>
                    <div className="font-bold text-indigo-900">
                        {getMarshmallows(1).toFixed(2)} Marshmallows
                    </div>
                    <div className="text-xs text-indigo-600 mt-1">
                        (+{naturalRate.toFixed(1)}% rente)
                    </div>
                </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-sm text-slate-700">
                <strong>Konklusjon:</strong>
                {patience < 5
                    ? " Fordi du er utålmodig, må noen tilby deg en VELDIG høy rente (mange flere marshmallows) for at du skal gidde å spare."
                    : " Fordi du er tålmodig, er du villig til å spare selv om renten er lav. Du trenger ikke så stor ekstra belønning."
                }
                <br /><br />
                Summen av alles tålmodighet i samfunnet skaper den <strong>naturlige renten</strong>.
            </div>
        </div>
    );
};
