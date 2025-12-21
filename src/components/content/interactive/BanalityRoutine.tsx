import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, CheckCircle, AlertCircle, Skull, ArrowRight } from 'lucide-react';

interface Task {
    id: number;
    title: string;
    action: string;
}

const tasks: Task[] = [
    { id: 1, title: "Transportlogistikk", action: "Godkjenn togtabell for region øst." },
    { id: 2, title: "Ressursallokering", action: "Signer for levering av 500 liter kjemikalier." },
    { id: 3, title: "Befolkningsregister", action: "Merk ut alle i nabolag B for 'omplassering'." }
];

export const BanalityRoutine: React.FC = () => {
    const [step, setStep] = useState(0);
    const [completedCount, setCompletedCount] = useState(0);
    const [showTruth, setShowTruth] = useState(false);

    const handleStamp = () => {
        if (step < tasks.length - 1) {
            setStep(step + 1);
            setCompletedCount(completedCount + 1);
        } else {
            setCompletedCount(completedCount + 1);
            setShowTruth(true);
        }
    };

    return (
        <div className="bg-slate-100 p-8 md:p-12 rounded-3xl border-4 border-slate-200 my-10 shadow-inner overflow-hidden relative min-h-[500px] flex flex-col items-center justify-center">

            <AnimatePresence mode="wait">
                {!showTruth ? (
                    <motion.div
                        key="desk"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="w-full max-w-xl text-center"
                    >
                        <div className="mb-10 inline-flex p-4 bg-white rounded-2xl shadow-sm border border-slate-200">
                            <FileText size={48} className="text-slate-400" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tight">Kontorarbeid (Seksjon 4-B)</h3>
                        <p className="text-slate-500 mb-12">Du er en pliktoppfyllende byråkrat. Gjør oppgaven din for å sikre effektiv drift.</p>

                        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 text-left mb-10 transform -rotate-1 hover:rotate-0 transition-transform duration-500">
                            <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                                <span className="text-xs font-black text-slate-300 uppercase tracking-widest">OFFISIELT DOKUMENT #{tasks[step].id}</span>
                                <AlertCircle size={16} className="text-slate-200" />
                            </div>
                            <h4 className="text-xl font-bold text-slate-800 mb-4">{tasks[step].title}</h4>
                            <p className="text-slate-600 font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                                {tasks[step].action}
                            </p>
                        </div>

                        <button
                            onClick={handleStamp}
                            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95"
                        >
                            <CheckCircle size={20} />
                            Stemplet og arkivert ({completedCount}/3)
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="truth"
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-2xl text-center py-10"
                    >
                        <div className="mb-10 inline-flex p-6 rounded-full bg-red-100 text-red-600 shadow-lg shadow-red-100">
                            <Skull size={64} />
                        </div>
                        <h3 className="text-4xl font-black text-red-900 mb-6 tracking-tighter">DU UTFØRTE BARE ORDRE...</h3>

                        <div className="space-y-6 text-slate-800 text-lg font-medium leading-relaxed bg-white p-8 rounded-3xl shadow-2xl border-2 border-red-500/20 text-left">
                            <p>
                                De kjedelige oppgavene du nettopp utførte, var en del av et gigantisk maskineri:
                                <ul className="mt-4 space-y-3 list-disc list-inside text-red-800">
                                    <li>"Togtabellen" fraktet uskyldige til konsentrasjonsleirer.</li>
                                    <li>"Kjemikaliene" ble brukt i gasskamre.</li>
                                    <li>"Omplasseringen" var egentlig en dødsliste.</li>
                                </ul>
                            </p>
                            <p className="text-slate-600 border-t border-slate-100 pt-6 italic">
                                Dette er det Hannah Arendt kaller <strong>"ondskapens banalitet"</strong>.
                                Byråkraten Adolf Eichmann så ikke på seg selv som en morder, men som en effektiv administrator.
                                Han sluttet å tenke selv, og ble bare et tannhjul i et dødelig system.
                            </p>
                        </div>

                        <button
                            onClick={() => { setStep(0); setCompletedCount(0); setShowTruth(false); }}
                            className="mt-12 text-slate-400 hover:text-slate-900 font-bold flex items-center gap-2 mx-auto transition-colors"
                        >
                            Prøv å tenke selv på nytt <ArrowRight size={18} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {[...Array(tasks.length)].map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === step ? 'w-8 bg-slate-900' : 'w-2 bg-slate-300'}`} />
                ))}
            </div>
        </div>
    );
};
