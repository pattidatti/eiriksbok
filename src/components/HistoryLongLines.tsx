import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen,
    ChevronRight,
    CheckCircle,
    XCircle,
    RefreshCw,
    Clock,
    Calendar,
    Tag,
    AlignLeft,
    Info
} from 'lucide-react';

// --- Types & Data ---

import { timelineData, type TimelineEvent } from '../data/timelineData';

type QuizQuestion = {
    id: number;
    question: string;
    options: string[];
    correct: number;
    explanation: string;
};

const quizData: QuizQuestion[] = [
    {
        id: 1,
        question: "Hva var en viktig årsak til at vikingene begynte å reise ut?",
        options: [
            "De ble kastet ut av kongen",
            "Befolkningsvekst og mangel på jord (plassmangel)",
            "En stor flodbølge ødela avlingene",
            "De ville spre kristendommen"
        ],
        correct: 1,
        explanation: "Jernredskaper gjorde at de kunne dyrke mer mat, som førte til at folketallet økte. Det ble trangt om plassen på Vestlandet."
    },
    {
        id: 2,
        question: "Hva kalles samfunnssystemet vikingene levde under?",
        options: [
            "Demokrati",
            "Ættesamfunn med høvdinger og ting",
            "Keiserdømme",
            "Føydalisme"
        ],
        correct: 1,
        explanation: "Samfunnet var bygget opp rundt ætten (storfamilien). Høvdingen var leder, og viktige saker ble avgjort på tinget."
    },
    {
        id: 3,
        question: "Hva måtte til for at den industrielle revolusjon kunne starte?",
        options: [
            "At man fant olje",
            "At alle sluttet å være bønder",
            "Overskudd av mat og penger til maskiner",
            "At kongen bestemte det"
        ],
        correct: 2,
        explanation: "For å frigjøre folk til å jobbe i fabrikker, måtte bøndene produsere mer mat enn de selv spiste (overskudd)."
    },
    {
        id: 4,
        question: "Hvor startet jordbruket først?",
        options: [
            "I Norge",
            "I 'Den fruktbare halvmåne' i Midtøsten",
            "I Romerriket",
            "I Amerika"
        ],
        correct: 1,
        explanation: "Jordbruket oppstod i Midtøsten ca. 8000-12 000 fvt., lenge før det kom til Norge."
    }
];

// --- Components ---

const ArticleCard = ({ event, onClick }: { event: TimelineEvent; onClick: () => void }) => {
    return (
        <motion.article
            layoutId={`article-${event.id}`}
            onClick={onClick}
            className="group relative cursor-pointer mb-8 w-full max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-blue-500/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100" />

            <div className="relative bg-white border border-slate-200 backdrop-blur-md rounded-2xl overflow-hidden hover:border-indigo-400/30 transition-all shadow-sm hover:shadow-md">
                <div className="flex flex-col md:flex-row">
                    {/* Left: Visual/Date Section */}
                    <div className="md:w-1/3 bg-slate-50 p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200 relative overflow-hidden">
                        {/* Background Pattern */}
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
                        </div>

                        <div className="relative z-10">
                            <div className="inline-flex items-center space-x-2 text-indigo-600 font-mono text-xs uppercase tracking-wider mb-4">
                                <Calendar className="w-3 h-3" />
                                <span>{event.year}</span>
                            </div>
                            <div className="p-4 bg-white rounded-2xl border border-slate-200 inline-block shadow-sm mb-6 group-hover:scale-110 transition-transform duration-500">
                                {event.icon}
                            </div>
                        </div>

                        <div className="relative z-10 mt-auto">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${event.category === 'Norge'
                                ? 'bg-red-100 text-red-700 border-red-200'
                                : 'bg-blue-100 text-blue-700 border-blue-200'
                                }`}>
                                <Tag className="w-3 h-3 mr-1.5" />
                                {event.category}
                            </span>
                        </div>
                    </div>

                    {/* Right: Content Section */}
                    <div className="md:w-2/3 p-8 flex flex-col">
                        <div className="mb-4">
                            <h3 className="text-2xl md:text-3xl font-display font-bold text-slate-900 group-hover:text-indigo-700 mb-3 leading-tight">
                                {event.title}
                            </h3>
                            <p className="text-slate-600 text-base leading-relaxed line-clamp-3">
                                {event.description}
                            </p>
                        </div>

                        <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-100">
                            <div className="flex items-center text-xs text-slate-500 font-mono">
                                <Clock className="w-3 h-3 mr-2" />
                                {event.readTime}
                            </div>

                            <div className="flex items-center text-sm font-bold text-indigo-600 group-hover:text-indigo-500 transition-colors group-hover:translate-x-1 duration-300">
                                Les hele artikkelen
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.article>
    );
};

const QuizModule = () => {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [answered, setAnswered] = useState<number | null>(null);

    const question = quizData[currentIdx];

    const handleAnswer = (optionIdx: number) => {
        if (answered !== null) return;
        setAnswered(optionIdx);
        if (optionIdx === question.correct) {
            setScore(s => s + 1);
        }
    };

    const nextQuestion = () => {
        setAnswered(null);
        if (currentIdx < quizData.length - 1) {
            setCurrentIdx(c => c + 1);
        } else {
            setShowResult(true);
        }
    };

    const restart = () => {
        setCurrentIdx(0);
        setScore(0);
        setShowResult(false);
        setAnswered(null);
    };

    if (showResult) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="p-6 bg-white rounded-full border border-slate-200 shadow-sm">
                    <CheckCircle className="w-16 h-16 text-green-500" />
                </div>
                <h2 className="text-3xl font-display font-bold text-slate-900">Quiz Fullført!</h2>
                <p className="text-slate-600 text-lg">
                    Du fikk <span className="text-indigo-600 font-bold">{score}</span> av <span className="text-indigo-600 font-bold">{quizData.length}</span> riktige.
                </p>
                <button
                    onClick={restart}
                    className="flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-500/25"
                >
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Prøv igjen
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8 flex justify-between items-center text-sm text-slate-500 font-mono bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <span>SPØRSMÅL {currentIdx + 1}/{quizData.length}</span>
                <span>POENG: {score}</span>
            </div>

            <div className="bg-white border border-slate-200 backdrop-blur-md p-8 md:p-12 rounded-3xl shadow-sm mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

                <h3 className="text-2xl font-bold text-slate-900 mb-8 leading-relaxed relative z-10">
                    {question.question}
                </h3>

                <div className="space-y-4 relative z-10">
                    {question.options.map((option, idx) => {
                        const isSelected = answered === idx;
                        const isCorrect = idx === question.correct;
                        let btnClass = "w-full text-left p-5 rounded-xl border-2 transition-all duration-200 flex justify-between items-center group ";

                        if (answered === null) {
                            btnClass += "bg-slate-50 border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 hover:pl-6";
                        } else if (isCorrect) {
                            btnClass += "bg-green-50 border-green-200 text-green-800 shadow-sm";
                        } else if (isSelected && !isCorrect) {
                            btnClass += "bg-red-50 border-red-200 text-red-800";
                        } else {
                            btnClass += "bg-slate-50 border-slate-200 text-slate-400 opacity-50";
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(idx)}
                                disabled={answered !== null}
                                className={btnClass}
                            >
                                <span className="font-medium text-lg">{option}</span>
                                {answered !== null && isCorrect && <CheckCircle className="w-6 h-6 text-green-500" />}
                                {answered !== null && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-red-500" />}
                                {answered === null && <div className="w-5 h-5 rounded-full border-2 border-slate-300 group-hover:border-indigo-400 transition-colors" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            <AnimatePresence>
                {answered !== null && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-indigo-50 border-l-4 border-indigo-500 p-6 rounded-r-xl mb-6 backdrop-blur-sm"
                    >
                        <h4 className="text-indigo-700 font-bold text-sm uppercase mb-2 flex items-center tracking-wider">
                            <Info className="w-4 h-4 mr-2" /> Forklaring
                        </h4>
                        <p className="text-slate-700 text-base leading-relaxed">
                            {question.explanation}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex justify-end pt-4">
                <button
                    onClick={nextQuestion}
                    disabled={answered === null}
                    className={`flex items-center px-8 py-4 rounded-xl font-bold transition-all ${answered === null
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:scale-105 active:scale-95'
                        }`}
                >
                    {currentIdx === quizData.length - 1 ? 'Se Resultat' : 'Neste Spørsmål'}
                    <ChevronRight className="w-5 h-5 ml-2" />
                </button>
            </div>
        </div>
    );
};

// --- Main App Component ---

export const HistoryLongLines: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'artikler' | 'quiz'>('artikler');
    const navigate = useNavigate();

    const handleArticleClick = (event: TimelineEvent) => {
        const slug = event.title.toLowerCase().replace(/\s+/g, '-');
        // Navigate to the article URL. 
        // If we are at /lange-linjer, we want /lange-linjer/slug
        // We can use relative navigation.
        navigate(slug);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500/30 overflow-x-hidden">

            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-200/20 rounded-[100%] blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-200/20 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10">
                {/* Hero Section */}
                <div className="relative border-b border-slate-200 bg-white/50 backdrop-blur-sm">
                    <div className="max-w-5xl mx-auto px-6 py-20 md:py-28 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-full mb-8 border border-indigo-100"
                        >
                            <Clock className="w-5 h-5 text-indigo-600 mr-2" />
                            <span className="text-indigo-700 font-bold tracking-wider text-xs uppercase">Lærestoff - Historie</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-5xl md:text-7xl font-display font-bold text-slate-900 mb-8 tracking-tight"
                        >
                            Historien og Norge
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-light"
                        >
                            En kuratert samling av de viktigste øyeblikkene som formet oss. Fra de første menneskene til det moderne industrisamfunnet.
                        </motion.p>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="absolute bottom-0 left-0 w-full flex justify-center translate-y-1/2 z-20">
                        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xl inline-flex space-x-2">
                            <button
                                onClick={() => setActiveTab('artikler')}
                                className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 flex items-center ${activeTab === 'artikler'
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                    }`}
                            >
                                <BookOpen className="w-4 h-4 mr-2" />
                                Utforsk Artikler
                            </button>
                            <button
                                onClick={() => setActiveTab('quiz')}
                                className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 flex items-center ${activeTab === 'quiz'
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                    }`}
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Ta Quizen
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <main className="max-w-5xl mx-auto px-6 py-24 min-h-[800px]">
                    <AnimatePresence mode="wait">
                        {activeTab === 'artikler' ? (
                            <motion.div
                                key="artikler"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center justify-between mb-12 border-b border-slate-200 pb-4">
                                    <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                                        <AlignLeft className="w-6 h-6 mr-3 text-indigo-600" />
                                        Siste Læringsartikler
                                    </h2>
                                    <span className="text-sm font-mono text-slate-500">
                                        {timelineData.length} ARTIKLER TILGJENGELIG
                                    </span>
                                </div>

                                {timelineData.map((event) => (
                                    <ArticleCard key={event.id} event={event} onClick={() => handleArticleClick(event)} />
                                ))}

                                <div className="text-center pt-16 pb-8">
                                    <p className="text-slate-400 text-sm font-mono">
                                        — SLUTT PÅ LISTEN —
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="quiz"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                                className="pt-8"
                            >
                                <QuizModule />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
