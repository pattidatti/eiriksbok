import { motion } from 'framer-motion';
import { ArrowRight, Lightbulb, Eye, AlertTriangle } from 'lucide-react';
import type { LiteraryDevice } from '../../data/virkemiddelverkstedet/types';
import { deviceColorMap } from '../../data/virkemiddelverkstedet/devices';

interface TheoryCardProps {
    device: LiteraryDevice;
    onStart: () => void;
    onBack: () => void;
}

export const TheoryCard = ({ device, onStart, onBack }: TheoryCardProps) => {
    const colors = deviceColorMap[device.color];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto"
        >
            <button
                onClick={onBack}
                className="text-sm text-slate-500 hover:text-slate-800 font-medium mb-4 inline-block transition-colors"
            >
                ← Tilbake
            </button>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                {/* Hero header */}
                <div className={`${colors.light} p-8 text-center border-b border-slate-100`}>
                    <span className="text-5xl mb-3 block">{device.emoji}</span>
                    <h2 className="text-2xl font-display font-bold text-slate-900">
                        {device.name}
                    </h2>
                    <p className={`text-sm font-medium mt-1 ${colors.text}`}>
                        {device.category === 'virkemiddel' ? 'Virkemiddel' : 'Analysebegrep'}
                    </p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Definition */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="w-4 h-4 text-amber-500" />
                            <h3 className="font-bold text-slate-800">Hva er det?</h3>
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                            {device.theory.definition}
                        </p>
                    </div>

                    {/* How to recognize */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Eye className="w-4 h-4 text-indigo-500" />
                            <h3 className="font-bold text-slate-800">Slik kjenner du det igjen</h3>
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                            {device.theory.howToRecognize}
                        </p>
                    </div>

                    {/* Examples */}
                    <div>
                        <h3 className="font-bold text-slate-800 mb-3">Eksempler</h3>
                        <div className="space-y-3">
                            {device.theory.examples.map((example, i) => (
                                <div
                                    key={i}
                                    className={`${colors.light} rounded-xl p-4 border ${colors.border}`}
                                >
                                    <p className="font-medium text-slate-800 italic mb-1.5">
                                        "{example.text}"
                                    </p>
                                    <p className="text-sm text-slate-600">
                                        {example.explanation}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Common mistakes */}
                    {device.theory.commonMistakes && (
                        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertTriangle className="w-4 h-4 text-amber-600" />
                                <h3 className="font-bold text-amber-800 text-sm">Pass på!</h3>
                            </div>
                            <p className="text-sm text-amber-700">
                                {device.theory.commonMistakes}
                            </p>
                        </div>
                    )}
                </div>

                {/* CTA */}
                <div className="p-6 bg-slate-50 border-t border-slate-100">
                    <motion.button
                        onClick={onStart}
                        className="w-full bg-indigo-600 text-white py-3 px-6 rounded-full font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Start ovelsene <ArrowRight className="w-5 h-5" />
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};
