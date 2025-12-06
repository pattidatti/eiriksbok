import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { ref, onValue, update } from 'firebase/database';
import { useManifest } from '../../hooks/useManifest';
import { fetchLesson } from '../../utils/contentLoader';
import { ArrowRight } from 'lucide-react';
import type { QuizQuestion } from '../../types';

export const QuizHost: React.FC = () => {
    const { pin } = useParams();
    const navigate = useNavigate();
    const { data: manifest } = useManifest();

    const [roomData, setRoomData] = useState<any>(null);
    const [players, setPlayers] = useState<any[]>([]);

    // Setup State
    const [isSetup, setIsSetup] = useState(true);
    const [selectedSubject, setSelectedSubject] = useState<string | 'all'>('all');
    const [selectedTopic, setSelectedTopic] = useState<string | 'all'>('all');
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

    // Game State
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
    const [showResult, setShowResult] = useState(false); // Result of current question
    const [showLeaderboard, setShowLeaderboard] = useState(false);

    // Sync Room Data
    useEffect(() => {
        if (!pin) return;
        const roomRef = ref(db, `rooms/${pin}`);
        const unsubscribe = onValue(roomRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setRoomData(data);
                if (data.players) {
                    setPlayers(Object.values(data.players));
                }

                // Sync local state with remote state
                if (data.questions) setIsSetup(false);
                setCurrentQuestionIndex(data.currentQuestion);
                setShowResult(data.showResult);
            } else {
                // Room deleted
                navigate('/quiz-battle/admin-999');
            }
        });
        return () => unsubscribe();
    }, [pin, navigate]);

    // Data Filtering
    const subjects = useMemo(() => manifest?.subjects.map(s => s.id) || [], [manifest]);
    const topics = useMemo(() => {
        if (!manifest) return [];
        if (selectedSubject === 'all') return manifest.subjects.flatMap(s => s.topics.map(t => t.id));
        const subject = manifest.subjects.find(s => s.id === selectedSubject);
        return subject ? subject.topics.map(t => t.id) : [];
    }, [manifest, selectedSubject]);

    const startGameSetup = async () => {
        if (!manifest || !pin) return;
        setIsLoadingQuestions(true);

        try {
            // 1. Fetch Questions
            const lessonsToFetch: any[] = [];
            manifest.subjects.forEach(subject => {
                if (selectedSubject !== 'all' && subject.id !== selectedSubject) return;
                subject.topics.forEach(topic => {
                    if (selectedTopic !== 'all' && topic.id !== selectedTopic) return;
                    topic.lessons?.forEach(lesson => lessonsToFetch.push({ subjectId: subject.id, topicId: topic.id, lessonId: lesson.id }));
                    topic.subTopics?.forEach(subTopic => subTopic.lessons.forEach(lesson => lessonsToFetch.push({ subjectId: subject.id, topicId: topic.id, subTopicId: subTopic.id, lessonId: lesson.id })));
                });
            });

            const results = await Promise.all(lessonsToFetch.map(l => fetchLesson(l.subjectId, l.topicId, l.lessonId, l.subTopicId)));
            let allQuestions: QuizQuestion[] = [];
            results.forEach((lesson) => {
                if (lesson?.quiz) {
                    allQuestions.push(...lesson.quiz.map(q => ({ ...q, sourceTitle: lesson.title })));
                }
            });

            // Shuffle and limit
            allQuestions = allQuestions.sort(() => Math.random() - 0.5).slice(0, 15);

            if (allQuestions.length === 0) {
                alert('Fant ingen spørsmål!');
                setIsLoadingQuestions(false);
                return;
            }

            // 2. Save to Firebase
            const updates: any = {};
            updates[`rooms/${pin}/questions`] = allQuestions;
            updates[`rooms/${pin}/status`] = 'LOBBY';
            updates[`rooms/${pin}/currentQuestion`] = -1;
            updates[`rooms/${pin}/showResult`] = false;

            await update(ref(db), updates);
            setIsSetup(false);

        } catch (e) {
            console.error(e);
            alert('Feil ved henting av spørsmål');
        } finally {
            setIsLoadingQuestions(false);
        }
    };

    const nextStep = async () => {
        if (!roomData?.questions) return;

        const total = roomData.questions.length;

        if (showLeaderboard) {
            // Was showing leaderboard, move to next question
            const nextIdx = currentQuestionIndex + 1;
            if (nextIdx >= total) {
                // End game
                update(ref(db, `rooms/${pin}`), { status: 'FINISHED' });
            } else {
                update(ref(db, `rooms/${pin}`), {
                    currentQuestion: nextIdx,
                    showResult: false,
                    // Clear player answers if you want (usually handled by player component based on qIndex change)
                });
                setShowLeaderboard(false);
            }
        } else if (showResult) {
            // Was showing result, move to leaderboard
            setShowLeaderboard(true);
        } else {
            // Was showing question, reveal result
            update(ref(db, `rooms/${pin}`), { showResult: true });
        }
    };

    // Renders
    if (!roomData) return <div className="p-8 text-center">Laster rom...</div>;

    // 1. Setup Screen
    if (isSetup) {
        return (
            <div className="max-w-4xl mx-auto p-8">
                <h1 className="text-3xl font-bold mb-6 text-slate-800">Sett opp spill for rom {pin}</h1>
                <div className="bg-white p-6 rounded-xl shadow border border-slate-200 mb-6">
                    <div className="mb-4">
                        <label className="block font-bold mb-2">Velg fag</label>
                        <div className="flex gap-2 flex-wrap">
                            <button onClick={() => setSelectedSubject('all')} className={`px-3 py-1 rounded ${selectedSubject === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}>Alle</button>
                            {subjects.map(s => (
                                <button key={s} onClick={() => setSelectedSubject(s)} className={`px-3 py-1 rounded ${selectedSubject === s ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}>{s}</button>
                            ))}
                        </div>
                    </div>
                    <div className="mb-6">
                        <label className="block font-bold mb-2">Velg emne</label>
                        <div className="flex gap-2 flex-wrap">
                            <button onClick={() => setSelectedTopic('all')} className={`px-3 py-1 rounded ${selectedTopic === 'all' ? 'bg-purple-600 text-white' : 'bg-slate-100'}`}>Alle</button>
                            {topics.map(t => (
                                <button key={t} onClick={() => setSelectedTopic(t)} className={`px-3 py-1 rounded ${selectedTopic === t ? 'bg-purple-600 text-white' : 'bg-slate-100'}`}>{t}</button>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={startGameSetup}
                        disabled={isLoadingQuestions}
                        className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-xl hover:bg-green-700 disabled:opacity-50"
                    >
                        {isLoadingQuestions ? 'Laster spørsmål...' : 'Gjør klart spill'}
                    </button>
                </div>
            </div>
        );
    }

    // 2. Lobby Screen (Waiting to start 1st question)
    if (currentQuestionIndex === -1 && roomData.status !== 'FINISHED') {
        return (
            <div className="min-h-screen p-8 flex flex-col items-center">
                <div className="text-center mb-12">
                    <h2 className="text-2xl font-bold text-slate-500 uppercase tracking-widest mb-4">Gå til <span className="text-indigo-600">bok.haaland.de/quiz-battle</span></h2>
                    <div className="text-9xl font-black font-mono text-indigo-600 tracking-tighter mb-4 inline-block drop-shadow-sm">{pin}</div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-6xl mb-12">
                    {players.map((p: any, i) => (
                        <div key={i} className="bg-white border-2 border-indigo-100 p-6 rounded-2xl text-center font-bold text-xl animate-bounce-in shadow-sm text-indigo-900">
                            {p.name}
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => update(ref(db, `rooms/${pin}`), { currentQuestion: 0, status: 'PLAYING' })}
                    className="bg-indigo-600 text-white px-16 py-8 rounded-full text-4xl font-black shadow-2xl hover:scale-105 transition-transform hover:bg-indigo-700"
                >
                    Start Spillet 🚀
                </button>
            </div>
        );
    }

    // 3. Finished Screen
    if (roomData.status === 'FINISHED') {
        const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
        return (
            <div className="min-h-screen p-8 text-center pt-20">
                <h1 className="text-6xl font-black mb-16 text-indigo-900">Resultatliste 🏆</h1>
                <div className="max-w-3xl mx-auto space-y-6">
                    {sortedPlayers.map((p, i) => (
                        <div key={i} className={`flex justify-between items-center p-8 rounded-3xl shadow-lg border-b-4 transition-transform hover:scale-[1.02] ${i === 0 ? 'bg-yellow-100 border-yellow-300 text-yellow-900 scale-110 z-10' :
                                i === 1 ? 'bg-slate-100 border-slate-300 text-slate-700' :
                                    i === 2 ? 'bg-orange-50 border-orange-200 text-orange-800' :
                                        'bg-white border-slate-100 text-slate-600'
                            }`}>
                            <span className="text-3xl font-bold flex items-center">
                                <span className="w-12 inline-block text-center mr-4 opacity-50">#{i + 1}</span>
                                {p.name}
                            </span>
                            <span className="text-4xl font-black">{p.score}p</span>
                        </div>
                    ))}
                </div>
                <button onClick={() => navigate('/quiz-battle/admin-999')} className="mt-20 text-indigo-500 hover:text-indigo-800 font-bold text-xl">Avslutt</button>
            </div>
        );
    }

    // 4. Gameplay Screen
    const question = roomData.questions[currentQuestionIndex];
    if (!question) return <div>Laster spørsmål...</div>;

    if (showLeaderboard) {
        const sortedPlayers = [...players].sort((a, b) => b.score - a.score).slice(0, 5);
        return (
            <div className="min-h-screen p-8">
                <h2 className="text-5xl font-black text-center mb-16 text-indigo-900">Topp 5</h2>
                <div className="max-w-3xl mx-auto space-y-4">
                    {sortedPlayers.map((p, i) => (
                        <div key={i} className="flex justify-between items-center bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
                            <span className="text-2xl font-bold text-slate-700">{p.name}</span>
                            <span className="text-2xl font-black text-indigo-600">{p.score}p</span>
                        </div>
                    ))}
                </div>
                <div className="flex justify-end mt-12 fixed bottom-8 right-8">
                    <button onClick={nextStep} className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-bold text-2xl hover:bg-indigo-700 shadow-xl transition-transform hover:scale-105">
                        Neste Spørsmål <ArrowRight className="inline ml-2" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 w-full">
            {/* Top Bar */}
            <div className="flex w-full justify-between items-center mb-12 max-w-7xl">
                <div className="font-mono font-bold text-xl text-slate-400">PIN: {pin}</div>
                <div className="font-bold text-2xl text-slate-400">Spørsmål <span className="text-indigo-600 text-3xl">{currentQuestionIndex + 1}</span> / {roomData.questions.length}</div>
                <button onClick={nextStep} className="bg-white text-slate-900 px-8 py-3 rounded-full font-bold hover:bg-slate-100 transition-colors text-lg shadow-sm border border-slate-200">
                    {showResult ? 'Neste ➡️' : 'Vis Svar 👀'}
                </button>
            </div>

            {/* Content - Full Screen / Immersive */}
            <div className="flex-1 flex flex-col items-center justify-center w-full">
                <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-center mb-20 leading-tight max-w-6xl mx-auto text-slate-900">
                    {question.question}
                </h2>

                <div className="grid grid-cols-2 gap-8 w-full max-w-[90vw] h-[45vh]">
                    {question.options.map((opt: string, i: number) => {
                        const isCorrect = i === question.correctAnswer || opt === question.answer;
                        const showColor = showResult;

                        const colors = [
                            'bg-red-500 border-red-700 text-white',
                            'bg-blue-500 border-blue-700 text-white',
                            'bg-yellow-500 border-yellow-700 text-white',
                            'bg-green-500 border-green-700 text-white'
                        ];

                        let containerCalss = `${colors[i % 4]} shadow-xl`;

                        if (showColor) {
                            if (!isCorrect) containerCalss = "bg-slate-100 text-slate-300 border-slate-200 opacity-50 scale-95 grayscale";
                            else containerCalss = "bg-green-500 text-white scale-105 shadow-2xl z-10 ring-8 ring-green-100 border-green-700";
                        }

                        return (
                            <div key={i} className={`
                                ${containerCalss}
                                rounded-3xl flex items-center justify-center p-8 
                                text-3xl md:text-5xl font-bold text-center transition-all duration-500 border-b-8
                            `}>
                                <span className="drop-shadow-sm leading-tight">{opt}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};
