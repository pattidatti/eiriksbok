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
    ChoiceHistoryEntry,
} from '../../data/chronos/types';
import { Skeleton } from '../Skeleton';
import { useNavigate } from 'react-router-dom';
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

function ScenarioStartScreen({
    scenario,
    isInitializing,
    savedRun,
    onContinue,
    onFresh,
}: {
    scenario: ChronosScenario;
    isInitializing: boolean;
    savedRun: SavedRun | null;
    onContinue: () => void;
    onFresh: () => void;
}) {
    return (
        <div className="relative w-full min-h-[100dvh] flex items-center justify-center overflow-hidden bg-slate-900">
            {scenario.heroImage && (
                <img
                    src={scenario.heroImage}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-40"
                />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

            <div className="relative z-10 text-center px-6 max-w-md mx-auto">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400 mb-3">
                    {scenario.role} • {scenario.year}
                </p>
                <h1 className="text-4xl sm:text-5xl font-display font-black text-white mb-8 leading-tight">
                    {scenario.title}
                </h1>

                {isInitializing ? (
                    <div className="flex items-center justify-center gap-2 text-slate-300">
                        <span className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
                        <span className="text-sm font-medium">Starter tidsreise…</span>
                    </div>
                ) : savedRun ? (
                    <div className="space-y-3">
                        <p className="text-slate-400 text-sm mb-4">
                            Pågående tidsreise fra {formatDate(savedRun.savedAt)}
                        </p>
                        <button
                            onClick={onContinue}
                            className="w-full py-3.5 rounded-2xl bg-amber-500 text-slate-900 font-black hover:bg-amber-400 transition-colors"
                        >
                            Fortsett der jeg var
                        </button>
                        <button
                            onClick={onFresh}
                            className="w-full py-3 rounded-2xl bg-white/10 text-white font-bold hover:bg-white/20 transition-colors backdrop-blur-sm"
                        >
                            Start på nytt
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export const TimeTravelEngine: React.FC<TimeTravelEngineProps> = ({ scenarioId }) => {
    const navigate = useNavigate();

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
    const [choiceHistory, setChoiceHistory] = useState<ChoiceHistoryEntry[]>([]);

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
        setChoiceHistory([]);
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

        // Track key decisions for DecisionMapModal + EndComparisonScreen
        if (currentNodeId) {
            const currentNodeData = scenario.nodes[currentNodeId];
            const isKeyDecision = currentNodeData?.choices.some((c) => c.isHistoricalChoice);
            if (isKeyDecision && choice.id !== 'minigame_complete' && !choice.id.endsWith('_complete')) {
                const historicalChoice = currentNodeData.choices.find((c) => c.isHistoricalChoice);
                setChoiceHistory((prev) => [
                    ...prev,
                    {
                        nodeId: currentNodeId,
                        nodeText: currentNodeData.text.substring(0, 70) + (currentNodeData.text.length > 70 ? '…' : ''),
                        choiceText: choice.text,
                        isHistorical: !!choice.isHistoricalChoice,
                        historicalChoiceText: historicalChoice?.text,
                        historicalConsequence: choice.isHistoricalChoice
                            ? choice.historicalConsequence
                            : historicalChoice?.historicalConsequence,
                    },
                ]);
            }
        }

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

    if (!currentNodeId || showContinuePrompt) {
        return (
            <ScenarioStartScreen
                scenario={scenario}
                isInitializing={!showContinuePrompt}
                savedRun={savedRun}
                onContinue={handleContinue}
                onFresh={() => initFresh()}
            />
        );
    }

    const currentNode = scenario.nodes[currentNodeId];
    if (!currentNode)
        return (
            <div className="p-12">
                <Skeleton className="h-[600px] w-full rounded-3xl" />
            </div>
        );

    return (
        <div className="relative">
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

            <ChronosUI
                node={currentNode}
                stats={stats}
                inventory={inventory}
                environment={environment}
                journal={journal}
                flags={flags}
                config={scenario.config}
                choiceHistory={choiceHistory}
                onChoice={handleChoice}
                onAddJournalEntry={(text) =>
                    setJournal((prev) => [
                        ...prev,
                        { day: journal.length + 1, text, timestamp: Date.now() },
                    ])
                }
                onRestart={handleRestart}
                onCraft={handleCraft}
                scenarioTitle={scenario.title}
                scenarioMeta={`${scenario.role} • ${scenario.year}`}
                onExit={() => navigate('/oving/tidsreise')}
                onRequestReset={() => setConfirmReset(true)}
            />
        </div>
    );
};
