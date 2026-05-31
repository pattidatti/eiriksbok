import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pill, RotateCcw, AlertTriangle } from 'lucide-react';

interface ResistensSimProps {
    title?: string;
}

type Cell = 'resistant' | 'sensitive' | 'empty';

const CAPACITY = 48;
const COLS = 8;

// Start: en stor koloni vanlige bakterier, og noen få tilfeldig resistente.
function initialCells(): Cell[] {
    const cells: Cell[] = Array(CAPACITY).fill('sensitive');
    let placed = 0;
    while (placed < 4) {
        const i = Math.floor(Math.random() * CAPACITY);
        if (cells[i] === 'sensitive') {
            cells[i] = 'resistant';
            placed++;
        }
    }
    return cells;
}

function countResistant(cells: Cell[]): number {
    return cells.filter((c) => c === 'resistant').length;
}

export function ResistensSim({ title = 'Antibiotikaresistens: en runde om gangen' }: ResistensSimProps) {
    const [cells, setCells] = useState<Cell[]>(initialCells);
    const [round, setRound] = useState(0);

    const resistant = countResistant(cells);
    const alive = cells.filter((c) => c !== 'empty').length;
    const pct = alive > 0 ? Math.round((resistant / alive) * 100) : 0;
    const allResistant = round > 0 && resistant === alive && alive > 0;

    const runRound = () => {
        // 1. Antibiotika: nesten alle vanlige bakterier dor, de resistente overlever.
        const survivors = cells.map<Cell>((c) => {
            if (c === 'resistant') return 'resistant';
            if (c === 'sensitive') return Math.random() < 0.18 ? 'sensitive' : 'empty';
            return 'empty';
        });

        // 2. De som overlevde formerer seg og fyller dishen igjen.
        const rSurv = survivors.filter((c) => c === 'resistant').length;
        const sSurv = survivors.filter((c) => c === 'sensitive').length;
        const total = rSurv + sSurv;
        const pResistant = total > 0 ? rSurv / total : 1;

        const next = survivors.map<Cell>((c) =>
            c === 'empty' ? (Math.random() < pResistant ? 'resistant' : 'sensitive') : c
        );

        setCells(next);
        setRound((r) => r + 1);
    };

    const reset = () => {
        setCells(initialCells());
        setRound(0);
    };

    return (
        <div className="my-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
                <Pill className="h-5 w-5 shrink-0 text-rose-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Bruk antibiotika gang på gang, og se hvorfor de resistente bakteriene til slutt tar over.
                    </p>
                </div>
            </div>

            {/* Petriskaal */}
            <div className="px-6 py-6">
                <div
                    className="mx-auto grid max-w-md gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-3"
                    style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
                >
                    {cells.map((c, i) => (
                        <motion.div
                            key={i}
                            className="aspect-square rounded-full"
                            animate={{
                                backgroundColor:
                                    c === 'resistant'
                                        ? '#e11d48'
                                        : c === 'sensitive'
                                          ? '#10b981'
                                          : '#e2e8f0',
                                scale: c === 'empty' ? 0.4 : 1,
                                opacity: c === 'empty' ? 0.4 : 1,
                            }}
                            transition={{ duration: 0.4 }}
                        />
                    ))}
                </div>

                {/* Forklaring av farger */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded-full bg-emerald-500" /> Vanlige bakterier
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded-full bg-rose-600" /> Resistente bakterier
                    </span>
                </div>
            </div>

            {/* Tall */}
            <div className="mx-6 mb-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-center">
                    <p className="text-xs text-slate-500">Runder med antibiotika</p>
                    <p className="mt-1 text-2xl font-bold text-slate-700">{round}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-center">
                    <p className="text-xs text-slate-500">Andel resistente</p>
                    <p className="mt-1 text-2xl font-bold text-rose-600">{pct}%</p>
                </div>
            </div>

            {/* Innsikt */}
            {allResistant && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mx-6 mb-3 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                >
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    Nå er nesten alle bakteriene resistente. Antibiotikaen virker ikke lenger. Derfor er det så
                    viktig at vi bare bruker antibiotika når vi virkelig trenger det.
                </motion.div>
            )}

            {/* Kontroller */}
            <div className="flex items-center justify-between gap-3 px-6 pb-5">
                <button
                    onClick={runRound}
                    disabled={allResistant}
                    className="flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                    <Pill className="h-4 w-4" />
                    Bruk antibiotika
                </button>
                <button
                    onClick={reset}
                    className="flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-slate-600"
                >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Start på nytt
                </button>
            </div>
        </div>
    );
}
