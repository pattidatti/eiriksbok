import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { ref, onValue, update } from 'firebase/database';
import { Trophy, CheckCircle, XCircle, Clock } from 'lucide-react';

export const QuizPlayer: React.FC = () => {
    const { pin } = useParams();
    const navigate = useNavigate();

    // Local State
    const [status, setStatus] = useState<string>('LOBBY');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
    const [showResult, setShowResult] = useState(false);
    const [myScore, setMyScore] = useState(0);
    const [myName, setMyName] = useState('');
    const [hasAnswered, setHasAnswered] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    const [questionStartTime, setQuestionStartTime] = useState<number>(0);

    const [allQuestions, setAllQuestions] = useState<any[]>([]);

    useEffect(() => {
        const playerId = sessionStorage.getItem('quiz_player_id');
        if (!playerId || !pin) {
            navigate('/quiz-battle');
            return;
        }

        // Listen to Room Status
        const roomRef = ref(db, `rooms/${pin}`);
        const unsubscribe = onValue(roomRef, (snapshot) => {
            const data = snapshot.val();
            if (!data) {
                navigate('/quiz-battle');
                return;
            }

            setStatus(data.status);
            setCurrentQuestionIndex(data.currentQuestion);
            setShowResult(data.showResult);
            if (data.questions) setAllQuestions(data.questions);
            if (data.questionStartTime) setQuestionStartTime(data.questionStartTime);

            // Get my own data
            const myData = data.players?.[playerId];
            if (myData) {
                setMyName(myData.name);
                setMyScore(myData.score);
            }
        });

        return () => unsubscribe();
    }, [pin, navigate]);

    // Handle Question Change
    useEffect(() => {
        setHasAnswered(false);
        setSelectedOption(null);
        setIsCorrect(null);
    }, [currentQuestionIndex]);

    // Handle Result Reveal
    useEffect(() => {
        if (showResult && hasAnswered && allQuestions[currentQuestionIndex]) {
            const q = allQuestions[currentQuestionIndex];
            const correctString = typeof q.correctAnswer === 'number' ? q.options[q.correctAnswer] : q.answer;
            setIsCorrect(selectedOption === correctString);
        }
    }, [showResult, hasAnswered, allQuestions, currentQuestionIndex, selectedOption]);

    const submitAnswer = async (option: string) => {
        if (hasAnswered || showResult) return;

        const playerId = sessionStorage.getItem('quiz_player_id');
        if (!playerId) return;

        setSelectedOption(option);
        setHasAnswered(true);

        const q = allQuestions[currentQuestionIndex];
        const correctString = typeof q.correctAnswer === 'number' ? q.options[q.correctAnswer] : q.answer;
        const isAnswerCorrect = option === correctString;

        const updates: any = {};
        updates[`rooms/${pin}/players/${playerId}/answers/${currentQuestionIndex}`] = option;
        updates[`rooms/${pin}/players/${playerId}/lastAnswer`] = option;

        if (isAnswerCorrect) {
            // Speed Calculation
            // Default 30s. If we answer instantly -> 30s left -> 1.0 multiplier.
            // Points = Base (500) + Bonus (up to 500)
            const now = Date.now();
            const elapsed = now - questionStartTime;
            const duration = 30000; // 30s
            const timeLeft = Math.max(0, duration - elapsed);

            const speedBonus = Math.floor(500 * (timeLeft / duration));
            const points = 500 + speedBonus;

            const newScore = myScore + points;
            updates[`rooms/${pin}/players/${playerId}/score`] = newScore;

            // Optimistic update
            setMyScore(newScore);
        }

        await update(ref(db), updates);
    };

    // --- RENDER ---

    if (status === 'LOBBY' || currentQuestionIndex === -1) {
        return (
            <div className="h-screen flex flex-col items-center justify-center p-6 text-center">
                <div className="animate-bounce mb-8">
                    <Clock className="w-24 h-24 text-indigo-600 opacity-80" />
                </div>
                <h1 className="text-7xl font-black mb-4 text-slate-800">Du er inne! 🎉</h1>
                <p className="text-3xl text-slate-600 mb-12 max-w-md mx-auto font-bold">Venter på at læreren skal starte spillet...</p>

                <div className="p-8 w-full max-w-md border-b-4 border-slate-200 mb-8">
                    <div className="text-xl uppercase tracking-widest text-slate-400 mb-2 font-bold">Ditt navn</div>
                    <div className="text-6xl font-black text-indigo-600">{myName}</div>
                </div>

                <div className="text-3xl font-mono text-slate-400 font-bold">PIN: {pin}</div>
            </div>
        );
    }

    if (status === 'FINISHED') {
        return (
            <div className="h-screen flex flex-col items-center justify-center p-4 text-center">
                <Trophy className="w-32 h-32 text-yellow-500 mb-8" />
                <h1 className="text-7xl font-black mb-6">Spillet er ferdig</h1>
                <p className="text-3xl mb-4 text-slate-600 font-bold">Du fikk</p>
                <div className="text-9xl font-black text-indigo-600 mb-12">{myScore}</div>
                <button onClick={() => navigate('/quiz-battle')} className="bg-indigo-600 text-white px-12 py-6 rounded-full font-bold shadow-lg active:scale-95 transition-transform text-3xl">Spill igjen</button>
            </div>
        );
    }

    // GAMEPLAY
    const currentQ = allQuestions[currentQuestionIndex];
    if (!currentQ) return <div className="p-8 text-center h-screen flex items-center justify-center text-slate-500 font-bold text-3xl">Laster...</div>;

    if (showResult) {
        return (
            <div className={`h-screen flex flex-col items-center justify-center p-4 text-center ${isCorrect ? 'bg-green-50' : 'bg-red-50'} transition-colors duration-500`}>
                {isCorrect ? (
                    <>
                        <CheckCircle className="w-40 h-40 mb-8 text-green-600 animate-bounce" />
                        <h1 className="text-8xl font-black mb-4 text-green-800">Riktig!</h1>
                        <p className="text-5xl text-green-700 font-black">+100 poeng</p>
                    </>
                ) : (
                    <>
                        <XCircle className="w-40 h-40 mb-8 text-red-600 animate-shake" />
                        <h1 className="text-8xl font-black mb-4 text-red-800">Feil...</h1>
                        <p className="text-4xl text-red-700 font-bold">Bedre lykke neste gang!</p>
                    </>
                )}
                <div className="mt-20 text-slate-400 animate-pulse font-bold text-2xl">Se resultatliste på storskjermen</div>
            </div>
        );
    }

    return (
        <div className="h-screen p-2 flex flex-col overflow-hidden">
            {/* Header - Transparent & HUGE */}
            <div className="flex justify-between items-end p-4 mb-4 border-b-2 border-slate-100 pb-4">
                <div className="flex flex-col">
                    <span className="text-xl text-slate-500 uppercase font-bold mb-1">Spørsmål</span>
                    <span className="text-slate-900 font-black text-6xl leading-none">{currentQuestionIndex + 1}</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-xl text-slate-500 uppercase font-bold mb-1">Din Score</span>
                    <span className="text-indigo-600 font-black text-6xl leading-none">{myScore}</span>
                </div>
            </div>

            {/* Buttons - Fill remaining space, 3x taller buttons (h-48) */}
            <div className="flex-1 content-center grid grid-cols-2 gap-4 pb-safe px-2">
                {currentQ.options.map((opt: string, i: number) => {
                    // Colors for buttons
                    const colors = [
                        'bg-red-500 border-red-600 text-white',
                        'bg-blue-500 border-blue-600 text-white',
                        'bg-yellow-500 border-yellow-600 text-white',
                        'bg-green-500 border-green-600 text-white'
                    ];

                    return (
                        <button
                            key={i}
                            onClick={() => submitAnswer(opt)}
                            disabled={hasAnswered}
                            className={`
                                h-48 rounded-2xl border-b-[12px] font-black text-3xl md:text-5xl shadow-xl transition-all flex items-center justify-center p-4 leading-none
                                ${colors[i % 4]}
                                ${hasAnswered && selectedOption !== opt ? 'opacity-30 scale-95 grayscale' : ''}
                                ${hasAnswered && selectedOption === opt ? 'scale-105 ring-8 ring-slate-900 z-10' : 'active:scale-95'}
                            `}
                        >
                            <span className="line-clamp-4 drop-shadow-md">{opt}</span>
                        </button>
                    )
                })}
            </div>

            {hasAnswered && (
                <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] flex items-center justify-center z-20 animate-in fade-in duration-200">
                    <div className="bg-white text-slate-900 px-12 py-8 rounded-3xl font-black text-4xl shadow-2xl transform scale-110 border-8 border-indigo-50">
                        Svar sendt! 🚀
                    </div>
                </div>
            )}
        </div>
    );
};
