import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Slider } from '../../../ui/Slider';
import { Coins, Fish, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

export const HanseaticLedger: React.FC = () => {
    const [stockfishAmount, setStockfishAmount] = useState<number>(800);
    const [year, setYear] = useState<number>(1350);
    const [debt, setDebt] = useState<number>(500); // Initial debt in "Lübeck Mark" (fictionalized unit)
    const [cornNeeded] = useState<number>(100); // Amount of corn needed to survive
    const [message, setMessage] = useState<string>("Vinteren har vært hard. Du trenger korn til familien.");
    const [lastOutcome, setLastOutcome] = useState<'profit' | 'loss' | null>(null);

    // Simulation prices
    const [cornPrice, setCornPrice] = useState<number>(5); // Price per unit corn
    const [fishPrice, setFishPrice] = useState<number>(0.5); // Price per kg fish

    const calculateOutcome = () => {
        // Randomize prices slightly to simulate market fluctuation
        const newFishPrice = 0.4 + Math.random() * 0.4; // 0.4 - 0.8
        const newCornPrice = 4 + Math.random() * 4; // 4 - 8

        setFishPrice(Number(newFishPrice.toFixed(2)));
        setCornPrice(Number(newCornPrice.toFixed(2)));

        const income = stockfishAmount * newFishPrice;
        const expenses = cornNeeded * newCornPrice;
        const balance = income - expenses;
        const interest = debt * 0.10; // 10% interest

        let newDebt = debt - balance + interest;
        if (newDebt < 0) newDebt = 0; // Can't have negative debt (savings) in this rigged system easily

        setDebt(Math.round(newDebt));
        setYear(prev => prev + 1);

        if (balance > interest) {
            setLastOutcome('profit');
            setMessage("En god fangst! Du betalte litt ned på gjelden.");
        } else {
            setLastOutcome('loss');
            setMessage("Prisene var dårlige i år. Gjelden din øker.");
        }
    };

    return (
        <div className="my-12 max-w-4xl mx-auto bg-[#f4f1ea] rounded-lg shadow-xl overflow-hidden border-4 border-[#5d4037] relative font-serif">
            {/* Header */}
            <div className="bg-[#5d4037] p-4 border-b-2 border-[#3e2723] flex justify-between items-center text-[#eefebe]">
                <div>
                    <h3 className="text-xl font-bold tracking-wider uppercase">Nordfarergjeld</h3>
                    <div className="text-xs opacity-80 font-mono">Kontor: Bryggen, Bergen</div>
                </div>
                <div className="text-2xl font-mono font-bold">{year}</div>
            </div>

            <div className="p-8 relative">
                {/* Paper Texture Overlay (CSS simulation) */}
                <div className="absolute inset-0 bg-[#f4f1ea] opacity-50 mix-blend-multiply pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(#8d6e63 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                <div className="relative z-10 space-y-8">

                    {/* Status Console */}
                    <div className="flex justify-between items-end border-b-2 border-[#8d6e63] pb-4 border-dashed">
                        <div className="text-center">
                            <div className="text-xs font-bold text-[#5d4037] uppercase mb-1">Din Fangst (kg)</div>
                            <div className="text-3xl font-bold text-[#8d6e63] font-mono">{stockfishAmount}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xs font-bold text-[#5d4037] uppercase mb-1">Gjeld (Mark)</div>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={debt}
                                    initial={{ scale: 1.2, color: '#b71c1c' }}
                                    animate={{ scale: 1, color: '#b71c1c' }}
                                    className="text-4xl font-bold font-mono text-red-800"
                                >
                                    -{debt}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm font-bold text-[#5d4037]">
                            <span className="flex items-center gap-2"><Fish className="w-4 h-4" /> Mengde Tørrfisk</span>
                            <span>{stockfishAmount} kg</span>
                        </div>
                        <Slider
                            min={0}
                            max={2000}
                            value={stockfishAmount}
                            onChange={(e) => setStockfishAmount(Number(e.target.value))}
                            color="blue"
                        />
                        <p className="text-xs text-[#5d4037] italic opacity-80 text-center">
                            "Jo mer du fisker, jo mer sliter du på utstyret ditt."
                        </p>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={calculateOutcome}
                        className="w-full bg-[#5d4037] text-[#eefebe] py-4 rounded font-bold uppercase tracking-widest hover:bg-[#3e2723] transition-colors shadow-lg border-2 border-[#3e2723] flex items-center justify-center gap-2"
                    >
                        <Coins className="w-5 h-5" /> Gjør opp status (Handle)
                    </button>

                    {/* Result Feedback */}
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={year}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded border-l-4 ${lastOutcome === 'profit' ? 'bg-green-50 border-green-800 text-green-900' : 'bg-red-50 border-red-800 text-red-900'}`}
                        >
                            <div className="flex items-start gap-3">
                                {lastOutcome === 'profit' ? <TrendingUp className="w-6 h-6 shrink-0" /> : <TrendingDown className="w-6 h-6 shrink-0" />}
                                <div>
                                    <div className="font-bold font-mono text-sm mb-1">Kjøpmannens notat:</div>
                                    <p className="italic font-serif leading-relaxed">"{message}"</p>
                                    <div className="mt-2 text-xs opacity-75 font-mono">
                                        Fiskepris: {fishPrice} | Kornpris: {cornPrice}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Instruction */}
                    <div className="flex items-center gap-2 text-xs text-[#5d4037] bg-[#f4f1ea] p-2 rounded border border-[#8d6e63]">
                        <AlertCircle className="w-4 h-4" />
                        <span>Målet er å bli gjeldfri, men kjøpmannen kontrollerer prisene.</span>
                    </div>

                </div>
            </div>
        </div>
    );
};
