import React, { useState } from 'react';
import { db } from '../../lib/firebase';
import { ref, get, set, child } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { Gamepad2 } from 'lucide-react';

export const QuizLobby: React.FC = () => {
    const [pin, setPin] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [joining, setJoining] = useState(false);
    const navigate = useNavigate();

    const joinGame = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setJoining(true);

        if (!pin || !name) {
            setError('Både PIN og navn må fylles ut');
            setJoining(false);
            return;
        }

        try {
            const roomRef = ref(db, `rooms/${pin}`);
            const snapshot = await get(roomRef);

            if (snapshot.exists()) {
                const playerId = `${name.replace(/[^a-zA-Z0-9]/g, '')}_${Date.now()}`;

                await set(child(roomRef, `players/${playerId}`), {
                    name: name,
                    score: 0,
                    status: 'active'
                });

                sessionStorage.setItem('quiz_player_id', playerId);
                sessionStorage.setItem('quiz_room_pin', pin);

                navigate(`/quiz-battle/play/${pin}`);
            } else {
                setError('Fant ikke rom med denne koden');
            }
        } catch (err) {
            console.error(err);
            setError('Noe gikk galt ved tilkobling');
        } finally {
            setJoining(false);
        }
    };

    const [showAdminInput, setShowAdminInput] = useState(false);
    const [adminPwd, setAdminPwd] = useState('');

    return (
        <div className="min-h-screen flex items-start justify-center p-4 pt-8 md:pt-20">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">Quiz Battle</h1>
                    <p className="text-slate-500 font-bold text-xl">Bli med i spillet!</p>
                </div>

                <form onSubmit={joinGame} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">PIN-kode</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={4}
                            placeholder="0000"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            className="w-full text-center text-5xl font-mono tracking-[0.5em] p-6 border-b-4 border-slate-300 bg-transparent focus:border-indigo-600 focus:outline-none transition-colors placeholder:opacity-30"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Kallenavn</label>
                        <input
                            type="text"
                            placeholder="Ditt navn..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full text-center text-2xl font-bold p-4 border-b-4 border-slate-300 bg-transparent focus:border-indigo-600 focus:outline-none transition-colors"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center font-bold">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={joining}
                        className="w-full bg-indigo-600 text-white text-2xl font-black py-6 rounded-full hover:bg-indigo-700 transform active:scale-95 transition-all shadow-xl disabled:opacity-50 mt-8"
                    >
                        {joining ? 'Kobler til...' : 'Bli med! 🚀'}
                    </button>
                </form>
            </div>

            {/* Admin Login UI */}
            {showAdminInput ? (
                <div className="fixed bottom-4 right-4 bg-white p-2 rounded-xl shadow-xl border border-slate-200 z-50 animate-in fade-in slide-in-from-bottom-2">
                    <input
                        type="password"
                        autoFocus
                        placeholder="Passord..."
                        className="p-2 border rounded-lg text-sm mr-2 w-32 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={adminPwd}
                        onChange={(e) => setAdminPwd(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                if (adminPwd === 'admin123') {
                                    navigate('/quiz-battle/admin-999');
                                } else {
                                    alert('Feil passord');
                                    setShowAdminInput(false);
                                    setAdminPwd('');
                                }
                            }
                            if (e.key === 'Escape') setShowAdminInput(false);
                        }}
                    />
                    <button onClick={() => setShowAdminInput(false)} className="text-slate-400 hover:text-red-500 font-bold px-2">X</button>
                </div>
            ) : (
                <button
                    onClick={() => setShowAdminInput(true)}
                    className="fixed bottom-4 right-4 text-slate-400 hover:text-indigo-600 p-2 text-sm font-bold uppercase tracking-widest opacity-70 hover:opacity-100 transition-all z-50 cursor-pointer"
                >
                    Admin
                </button>
            )}
        </div>
    );
};
