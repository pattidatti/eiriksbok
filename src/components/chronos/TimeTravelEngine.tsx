import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChronosUI } from './ChronosUI';
import type {
    ChronosScenario,
    ChronosChoice,
    ChronosStat,
    ChronosEnvironment,
    ChronosEntry,
    ChronosRunLog,
    ChronosRecipe,
} from '../../data/chronos/types';
import { Skeleton } from '../Skeleton';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTimeTravelProfile } from './context/TimeTravelProfileContext';
import { useChronosRunSave, type SavedRun } from './hooks/useChronosRunSave';

interface TimeTravelEngineProps {
    scenarioId: string;
}

function formatDate(ts: number): string {
    return new Date(ts).toLocaleString('nb-NO', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export const TimeTravelEngine: React.FC<TimeTravelEngineProps> = ({ scenarioId }) => {
    // Game State
    const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
    const [stats, setStats] = useState<ChronosStat[]>([]);
    const [inventory, setInventory] = useState<string[]>([]);
    const [environment, setEnvironment] = useState<Partial<ChronosEnvironment>>({
        time: 'day',
        weather: 'clear',
    });
    const [journal, setJournal] = useState<ChronosEntry[]>([]);
    const [flags, setFlags] = useState<string[]>([]);

    // UI State for save/restore prompts
    const [savedRun, setSavedRun] = useState<SavedRun | null>(null);
    const [showContinuePrompt, setShowContinuePrompt] = useState(false);
    const [confirmReset, setConfirmReset] = useState(false);

    // Profile Context
    const { profile, saveRun, unlockScenario, addLegacyItem } = useTimeTravelProfile();

    // Run save hook
    const runSave = useChronosRunSave(scenarioId);

    // Fetch Scenario Data
    const { data: scenario, isLoading, isError } = useQuery({
        queryKey: ['scenario', scenarioId],
        queryFn: async () => {
            const res = await fetch(`/content/scenarios/${scenarioId}.json`);
            if (!res.ok) {
                const res2 = await fetch(`/Eiriksbok/content/scenarios/${scenarioId}.json`);
                if (!res2.ok) throw new Error('Could not load scenario');
                return res2.json() as Promise<ChronosScenario>;
            }
            return res.json() as Promise<ChronosScenario>;
        },
    });

    // Initialize Game when scenario loads
    useEffect(() => {
        if (!scenario) return;
        if (!scenario.config || !scenario.config.stats) {
            console.error('Scenario config is missing!');
            return;
        }
        const saved = runSave.load();
        if (saved) {
            setSavedRun(saved);
            setShowContinuePrompt(true);
        } else {
            initFresh(scenario);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scenario, profile]);

    const initFresh = (sc: ChronosScenario = scenario!) => {
        setStats(sc.config.stats);
        setInventory([...(profile?.legacyItems || [])]);
        setEnvironment({ time: 'day', weather: 'clear' });
        setJournal([]);
        setFlags([]);
        setCurrentNodeId(sc.startingNodeId);
        setShowContinuePrompt(false);
        runSave.clear();
    };

    const handleContinue = () => {
        if (!savedRun) return;
        setStats(savedRun.stats);
        setInventory(savedRun.inventory);
        setEnvironment(savedRun.environment);
        setJournal(savedRun.journal);
        setFlags(savedRun.flags);
        setCurrentNodeId(savedRun.currentNodeId);
        setShowContinuePrompt(false);
    };

    const handleChoice = (choice: ChronosChoice) => {
        if (!scenario) return;

        // Compute new values synchronously so we can persist them
        const newStats = choice.effects
            ? stats.map((stat) => {
                  const change = choice.effects![stat.id] || 0;
                  return { ...stat, value: Math.min(stat.max, Math.max(0, stat.value + change)) };
              })
            : stats;

        let newInventory = [...inventory];
        if (choice.updateInventory?.add) newInventory.push(choice.updateInventory.add);
        if (choice.updateInventory?.remove)
            newInventory = newInventory.filter((i) => i !== choice.updateInventory!.remove);

        const newEnvironment = choice.updateEnvironment
            ? { ...environment, ...choice.updateEnvironment }
            : environment;

        let newFlags = [...flags];
        if (choice.setFlags && choice.setFlags.length > 0)
            newFlags = [...new Set([...newFlags, ...choice.setFlags])];
        if (choice.clearFlags && choice.clearFlags.length > 0)
            newFlags = newFlags.filter((f) => !choice.clearFlags!.includes(f));

        // Resolve target node
        let targetNodeId = choice.nextNodeId;
        if (
            targetNodeId === 'RANDOM_EVENT' &&
            scenario.randomEvents &&
            scenario.randomEvents.length > 0
        ) {
            targetNodeId =
                scenario.randomEvents[Math.floor(Math.random() * scenario.randomEvents.length)];
        }

        const nextNode = scenario.nodes[targetNodeId];
        if (!nextNode) {
            console.error(`Node ${targetNodeId} not found!`);
            return;
        }

        // Apply state
        setStats(newStats);
        setInventory(newInventory);
        setEnvironment(newEnvironment);
        setFlags(newFlags);
        setCurrentNodeId(targetNodeId);

        if (nextNode.isEnd) {
            // Run over — wipe save
            runSave.clear();

            const isWin = nextNode.endType === 'victory';
            const log: ChronosRunLog = {
                id: Math.random().toString(36).substr(2, 9),
                scenarioId: scenario.id,
                date: Date.now(),
                result: isWin ? 'victory' : 'defeat',
                daysSurvived: journal.length,
                score: newStats.reduce((acc, s) => acc + s.value, 0) + (isWin ? 1000 : 0),
                endingNodeId: targetNodeId,
            };
            saveRun(log);

            if (isWin) {
                if (scenario.id === 'roman-soldier') unlockScenario('feudal-peasant');
                if (newInventory.includes('celtic_brooch')) addLegacyItem('celtic_brooch');
            }
        } else {
            runSave.save({
                currentNodeId: targetNodeId,
                stats: newStats,
                inventory: newInventory,
                environment: newEnvironment,
                journal,
                flags: newFlags,
            });
        }
    };

    const handleRestart = () => {
        runSave.clear();
        initFresh();
        setConfirmReset(false);
    };

    const handleCraft = (recipe: ChronosRecipe) => {
        const newInventory = [...inventory];
        recipe.ingredients.forEach((ing) => {
            const index = newInventory.indexOf(ing);
            if (index > -1) newInventory.splice(index, 1);
        });
        newInventory.push(recipe.result);
        setInventory(newInventory);
    };

    if (isLoading)
        return (
            <div className="p-12">
                <Skeleton className="h-[600px] w-full rounded-3xl" />
            </div>
        );
    if (isError || !scenario)
        return (
            <div className="p-12 text-center text-red-500">Klarte ikke laste tidsreisen.</div>
        );

    const currentNode = currentNodeId ? scenario.nodes[currentNodeId] : null;
    if (!currentNode) return <div>Laster noder...</div>;

    return (
        <div className="w-full max-w-6xl mx-auto p-2 sm:p-4 md:p-8">
            {/* "Fortsett?" overlay */}
            {showContinuePrompt && savedRun && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center">
                        <h2 className="text-2xl font-black text-slate-900 mb-2">
                            Velkommen tilbake!
                        </h2>
                        <p className="text-slate-500 mb-6">
                            Du har en pågående tidsreise fra {formatDate(savedRun.savedAt)}.
                        </p>
                        <button
                            onClick={handleContinue}
                            className="w-full mb-3 py-3 rounded-2xl bg-indigo-900 text-white font-bold hover:bg-indigo-800 transition-colors"
                        >
                            Fortsett der jeg var
                        </button>
                        <button
                            onClick={() => initFresh()}
                            className="w-full py-3 rounded-2xl bg-stone-100 text-stone-700 font-bold hover:bg-stone-200 transition-colors"
                        >
                            Start på nytt
                        </button>
                    </div>
                </div>
            )}

            {/* Confirm reset modal */}
            {confirmReset && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center">
                        <h2 className="text-xl font-black text-slate-900 mb-2">
                            Nullstill tidsreisen?
                        </h2>
                        <p className="text-slate-500 mb-6">
                            All fremgang i dette spillet slettes. Kan ikke angres.
                        </p>
                        <button
                            onClick={handleRestart}
                            className="w-full mb-3 py-3 rounded-2xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors"
                        >
                            Ja, nullstill
                        </button>
                        <button
                            onClick={() => setConfirmReset(false)}
                            className="w-full py-3 rounded-2xl bg-stone-100 text-stone-700 font-bold hover:bg-stone-200 transition-colors"
                        >
                            Avbryt
                        </button>
                    </div>
                </div>
            )}

            <div className="mb-3 sm:mb-5 md:mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link
                        to="/oving/tidsreise"
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100"
                    >
                        <ArrowLeft size={16} />
                        <span className="font-bold text-sm uppercase tracking-wider">
                            Avslutt Tidsreise
                        </span>
                    </Link>
                    <button
                        onClick={() => setConfirmReset(true)}
                        className="flex items-center gap-1.5 text-slate-400 hover:text-red-600 transition-colors text-sm font-medium px-3 py-2 rounded-xl border border-transparent hover:border-red-100 hover:bg-red-50"
                    >
                        <RotateCcw size={14} />
                        <span>Nullstill</span>
                    </button>
                </div>
                <div className="text-right">
                    <h1 className="text-xl font-display font-black text-slate-900">
                        {scenario.title}
                    </h1>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">
                        {scenario.role} • {scenario.year}
                    </p>
                </div>
            </div>

            <ChronosUI
                node={currentNode}
                stats={stats}
                inventory={inventory}
                environment={environment}
                journal={journal}
                flags={flags}
                config={scenario.config}
                onChoice={handleChoice}
                onAddJournalEntry={(text) =>
                    setJournal((prev) => [
                        ...prev,
                        { day: journal.length + 1, text, timestamp: Date.now() },
                    ])
                }
                onRestart={handleRestart}
                onCraft={handleCraft}
            />
        </div>
    );
};
