import React, { useState } from 'react';
import { ImmersiveCard } from '../ImmersiveCard';

export const BankSection: React.FC = () => {
    const [gold, setGold] = useState(100);
    const [paper, setPaper] = useState(100);
    const [trust, setTrust] = useState(100);
    const [isGameOver, setIsGameOver] = useState(false);

    const loanMoney = () => {
        if (trust <= 0) return;
        const newPaper = paper + 20;
        setPaper(newPaper);

        const ratio = gold / newPaper;
        let newTrust = trust;

        if (ratio < 0.5) newTrust -= 10;
        if (ratio < 0.3) newTrust -= 25;
        if (newTrust < 0) newTrust = 0;

        setTrust(newTrust);

        if (newTrust <= 0) {
            setIsGameOver(true);
        }
    };

    const resetGame = () => {
        setGold(100);
        setPaper(100);
        setTrust(100);
        setIsGameOver(false);
    };

    return (
        <ImmersiveCard className="mb-16 border-t-4 border-t-green-500">
            <div className="p-4 md:p-8 bg-green-900/10">
                <h2 className="text-3xl font-display text-text-main mb-2">5. Banken: Penger ut av løse luften</h2>
                <p className="text-text-muted text-lg mb-8">Hvordan dagens banksystem (Brøkdelsreserver) skaper konjunkturer.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <div className="text-text-muted leading-relaxed">
                            <p className="mb-4">
                                Mange tror at en bank bare låner ut pengene som andre sparer der. Slik er det ikke. I dagens system (Brøkdelsreserver / Fractional Reserve Banking) kan banker låne ut penger de <em>ikke</em> har.
                            </p>
                            <p className="mb-4">
                                Når du tar opp et lån på 1 million, trykker banken i praksis inn tall på kontoen din. Nye penger er skapt. Dette øker pengemengden i samfunnet.
                            </p>
                        </div>
                        <div className="bg-glass-bg border-l-4 border-green-500 p-4 rounded-r-xl">
                            <div className="font-bold text-green-500 uppercase text-sm mb-1">💡 Boom & Bust (Konjunkturer)</div>
                            <p className="text-sm text-text-muted mb-2">
                                Dette skaper kunstige svingninger i økonomien:
                            </p>
                            <ol className="list-decimal list-inside text-sm text-text-muted space-y-2">
                                <li><strong>Boom (Festen):</strong> Det flyter over av "nye penger". Renten er lav. Bedrifter starter prosjekter som egentlig ikke er lønnsomme.</li>
                                <li><strong>Bust (Bakrusen):</strong> Prisene stiger (inflasjon) fordi det er for mye penger. Renten må opp. De dårlige prosjektene går konkurs.</li>
                            </ol>
                        </div>
                    </div>

                    <div className="bg-glass-bg p-6 rounded-2xl border border-glass-border relative shadow-xl transform rotate-1 hover:rotate-0 transition-transform duration-500">
                        <h3 className="text-center font-bold text-green-400 mb-4 uppercase tracking-widest">Bank Simulator</h3>
                        <div className="flex justify-between items-end mb-6 bg-glass-highlight p-4 rounded-xl border border-glass-border">
                            <div className="text-center"><div className="text-xs font-bold text-text-muted uppercase">Ekte Gull</div><div className="text-2xl font-bold text-amber-500">{gold}</div></div>
                            <div className="text-center"><div className="text-xs font-bold text-text-muted uppercase">Papirlån</div><div className="text-2xl font-bold text-text-main">{paper}</div></div>
                            <div className="text-center"><div className="text-xs font-bold text-text-muted uppercase">Tillit</div><div className="text-2xl font-bold text-green-500">{trust}%</div></div>
                        </div>

                        <button onClick={loanMoney} className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 text-lg">
                            <span>💸</span> Trykk penger (Start boblen!)
                        </button>

                        {isGameOver && (
                            <div className="absolute inset-0 bg-black/90 z-20 flex flex-col items-center justify-center text-white rounded-2xl text-center p-4 backdrop-blur-sm">
                                <div className="text-6xl mb-4 animate-ping">📉</div>
                                <h2 className="text-3xl font-black text-red-500 mb-2">BANK RUN!</h2>
                                <p className="text-sm mb-6 text-gray-300">Folket oppdaget at pengene var falske. Boblen sprakk.</p>
                                <button onClick={resetGame} className="px-8 py-2 bg-white text-black font-bold rounded-full text-sm hover:bg-gray-200">Start på nytt</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ImmersiveCard>
    );
};
