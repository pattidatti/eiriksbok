import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';

interface DiceGameProps {
    targetScore: number;
    wager?: number;
    onComplete: (success: boolean) => void;
}

const DiceIcons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

export const DiceGame: React.FC<DiceGameProps> = ({ targetScore, wager, onComplete }) => {
    const [rolling, setRolling] = useState(false);
    const [dice, setDice] = useState([1, 1]);
    const [result, setResult] = useState<'idle' | 'win' | 'loss'>('idle');

    const rollDice = () => {
        setRolling(true);
        setResult('idle');

        // Animation loop
        let rolls = 0;
        const interval = setInterval(() => {
            setDice([
                Math.ceil(Math.random() * 6),
                Math.ceil(Math.random() * 6)
            ]);
            rolls++;
            if (rolls > 10) {
                clearInterval(interval);
                finishRoll();
            }
        }, 100);
    };

    const finishRoll = () => {
        const finalDice = [
            Math.ceil(Math.random() * 6),
            Math.ceil(Math.random() * 6)
        ];
        setDice(finalDice);
        setRolling(false);

        const sum = finalDice[0] + finalDice[1];
        const success = sum >= targetScore;
        setResult(success ? 'win' : 'loss');

        setTimeout(() => {
            onComplete(success);
        }, 1500);
    };

    const DieIcon1 = DiceIcons[dice[0] - 1];
    const DieIcon2 = DiceIcons[dice[1] - 1];

    return (
        <div className="flex flex-col items-center justify-center p-8 bg-stone-100 rounded-3xl border border-stone-200 shadow-inner">
            <h3 className="text-xl font-bold text-stone-700 mb-6 uppercase tracking-wider">
                Mål: {targetScore} eller høyere
            </h3>

            <div className="flex gap-8 mb-8">
                <motion.div
                    animate={rolling ? { rotate: [0, 360], scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.5, repeat: rolling ? Infinity : 0 }}
                    className="p-4 bg-white rounded-xl shadow-md text-indigo-600"
                >
                    <DieIcon1 size={48} />
                </motion.div>
                <motion.div
                    animate={rolling ? { rotate: [360, 0], scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.5, repeat: rolling ? Infinity : 0 }}
                    className="p-4 bg-white rounded-xl shadow-md text-indigo-600"
                >
                    <DieIcon2 size={48} />
                </motion.div>
            </div>

            <div className="h-8 mb-6">
                {result === 'idle' && !rolling && <p className="text-stone-500">Kast terningene for å avgjøre din skjebne...</p>}
                {result === 'win' && <p className="text-emerald-600 font-bold text-lg animate-bounce">Suksess! ({dice[0] + dice[1]})</p>}
                {result === 'loss' && <p className="text-rose-600 font-bold text-lg shake">Feilet! ({dice[0] + dice[1]})</p>}
            </div>

            <button
                onClick={rollDice}
                disabled={rolling || result !== 'idle'}
                className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
            >
                {rolling ? 'Ruller...' : 'Kast Terningene'}
            </button>
        </div>
    );
};
