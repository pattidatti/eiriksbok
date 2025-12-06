import React, { useState } from 'react';
import { DungeonSelect } from '../components/games/dungeon/DungeonSelect';
import { DungeonRun } from '../components/games/dungeon/DungeonRun';
import { Link } from 'react-router-dom';
import { ArrowLeft, Skull } from 'lucide-react';

const DungeonGamePage: React.FC = () => {
    const [gameState, setGameState] = useState<'SELECT' | 'PLAYING'>('SELECT');
    const [selectedConfig, setSelectedConfig] = useState<{ subject: string; topic: string } | null>(null);

    const handleSelectDungeon = (subject: string, topic: string) => {
        setSelectedConfig({ subject, topic });
        setGameState('PLAYING');
    };

    const handleExit = () => {
        setGameState('SELECT');
        setSelectedConfig(null);
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500/30">
            {/* Header - Only show in Select mode or valid 'Back' context */}
            {gameState === 'SELECT' && (
                <header className="absolute top-0 left-0 w-full p-6 z-10 flex justify-between items-center bg-gradient-to-b from-slate-900 to-transparent">
                    <Link to="/oving" className="flex items-center text-slate-400 hover:text-white transition-colors group">
                        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Tilbake
                    </Link>
                    <div className="flex items-center gap-2 text-slate-500">
                        <Skull className="w-5 h-5" />
                        <span className="font-bold tracking-wider text-xs uppercase">Kunnskaps-Dungeon</span>
                    </div>
                </header>
            )}

            <main className="relative w-full h-full min-h-screen flex flex-col">
                {gameState === 'SELECT' ? (
                    <DungeonSelect onSelect={handleSelectDungeon} />
                ) : (
                    selectedConfig && (
                        <DungeonRun
                            subjectId={selectedConfig.subject}
                            topicId={selectedConfig.topic}
                            onExit={handleExit}
                        />
                    )
                )}
            </main>
        </div>
    );
};

export default DungeonGamePage;
