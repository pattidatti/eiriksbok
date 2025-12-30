import React, { useState, useEffect } from 'react';

export const ApothecaryGame: React.FC<{ onComplete: (score: number) => void, speedMultiplier?: number }> = ({ onComplete, speedMultiplier: _speedMultiplier = 1.0 }) => {
    const [sequence, setSequence] = useState<string[]>([]);
    const [_playerSeq, setPlayerSeq] = useState<string[]>([]);
    const [step, setStep] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);

    const ingredients = [
        { id: 'red', icon: '🔴', label: 'Rødurt' },
        { id: 'blue', icon: '🔵', label: 'Blåbær' },
        { id: 'green', icon: '🟢', label: 'Grønnmose' },
        { id: 'yellow', icon: '🟡', label: 'Gulrot' }
    ];

    useEffect(() => {
        const newSeq = [];
        for (let i = 0; i < 5; i++) {
            newSeq.push(ingredients[Math.floor(Math.random() * ingredients.length)].id);
        }
        setSequence(newSeq);
    }, []);

    const handleMix = (id: string) => {
        if (isFinished || feedback) return;

        if (id === sequence[step]) {
            const nextStep = step + 1;
            setPlayerSeq(p => [...p, id]);
            setStep(nextStep);
            setFeedback('RIKTIG! ✨');
            setTimeout(() => setFeedback(null), 500);

            if (nextStep >= sequence.length) {
                setIsFinished(true);
                setTimeout(() => onComplete(1.0), 1000);
            }
        } else {
            setFeedback('FEIL... 💥');
            setStep(0);
            setPlayerSeq([]);
            setTimeout(() => setFeedback(null), 1000);
        }
    };

    return (
        <div className="p-12 text-center min-h-[600px] relative flex flex-col items-center justify-center overflow-hidden"
            style={{ backgroundImage: 'url("/images/minigames/apothecary_bg.png")', backgroundSize: 'cover' }}>
            <div className="absolute inset-0 bg-black/70 z-0" />
            <h2 className="relative z-10 text-4xl font-black text-white mb-8 tracking-tighter uppercase italic">Apoteker: Brygging 🌿</h2>

            <div className="relative z-10 mb-12 flex gap-4 h-24 items-center">
                {sequence.map((id, i) => (
                    <div key={i} className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-all border-2 border-white/10 ${step > i ? 'opacity-10 scale-90' : 'bg-black/40 scale-100'} `}>
                        {ingredients.find(ing => ing.id === id)?.icon}
                    </div>
                ))}
            </div>

            {feedback && (
                <div className={`relative z-10 text-3xl font-black mb-8 animate-in zoom-in ${feedback.includes('FEIL') ? 'text-rose-500' : 'text-emerald-400'} `}>
                    {feedback}
                </div>
            )}

            <div className="relative z-10 grid grid-cols-2 gap-4">
                {ingredients.map((ing) => (
                    <button
                        key={ing.id}
                        onClick={() => handleMix(ing.id)}
                        className="w-32 h-32 bg-slate-900/80 border-2 border-white/20 rounded-3xl flex flex-col items-center justify-center hover:bg-slate-800 transition-all active:scale-95 shadow-xl"
                    >
                        <span className="text-4xl mb-2">{ing.icon}</span>
                        <span className="font-bold text-white uppercase text-sm">{ing.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};
