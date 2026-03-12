import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChronosUI } from './ChronosUI';
import type { ChronosScenario, ChronosChoice, ChronosStat, ChronosEnvironment, ChronosEntry, ChronosRunLog, ChronosRecipe } from '../../data/chronos/types';
import { Skeleton } from '../Skeleton';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTimeTravelProfile } from './context/TimeTravelProfileContext';

interface TimeTravelEngineProps {
    scenarioId: string;
}

export const TimeTravelEngine: React.FC<TimeTravelEngineProps> = ({ scenarioId }) => {
    // Game State
    const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
    const [stats, setStats] = useState<ChronosStat[]>([]);
    const [inventory, setInventory] = useState<string[]>([]);
    const [environment, setEnvironment] = useState<Partial<ChronosEnvironment>>({ time: 'day', weather: 'clear' });
    const [journal, setJournal] = useState<ChronosEntry[]>([]);
    // Prinsipp 1: Narrative flags
    const [flags, setFlags] = useState<string[]>([]);

    // Profile Context
    const { profile, saveRun, unlockScenario, addLegacyItem } = useTimeTravelProfile();

    // Fetch Scenario Data
    const { data: scenario, isLoading, isError } = useQuery({
        queryKey: ['scenario', scenarioId],
        queryFn: async () => {
            const res = await fetch(`/content/scenarios/${scenarioId}.json`);
            if (!res.ok) {
                const res2 = await fetch(`/Eiriksbok/content/scenarios/${scenarioId}.json`);
                if (!res2.ok) throw new Error("Could not load scenario");
                return res2.json() as Promise<ChronosScenario>;
            }
            return res.json() as Promise<ChronosScenario>;
        }
    });

    // Initialize Game when scenario loads
    useEffect(() => {
        if (scenario) {
            if (!scenario.config || !scenario.config.stats) {
                console.error("Scenario config is missing!");
                return;
            }
            setStats(scenario.config.stats);

            // Phase 9.2: Legacy Item Injection
            const legacyItems = profile?.legacyItems || [];
            setInventory([...legacyItems]);

            setEnvironment({ time: 'day', weather: 'clear' }); // Reset environment
            setJournal([]); // Reset journal
            setCurrentNodeId(scenario.startingNodeId);
        }
    }, [scenario, profile]); // Added profile dep to ensure legacy items load




    const handleChoice = (choice: ChronosChoice) => {
        if (!scenario) return;

        // 1. Apply Effects (Stats)
        if (choice.effects) {
            setStats(prevStats => prevStats.map(stat => {
                const change = choice.effects?.[stat.id] || 0;
                const newValue = Math.min(stat.max, Math.max(0, stat.value + change));
                return { ...stat, value: newValue };
            }));
        }

        // 2. Update Inventory
        if (choice.updateInventory) {
            if (choice.updateInventory.add) {
                setInventory(prev => [...prev, choice.updateInventory!.add!]);
            }
            if (choice.updateInventory.remove) {
                setInventory(prev => prev.filter(item => item !== choice.updateInventory!.remove));
            }
        }

        // 3. Update Environment
        if (choice.updateEnvironment) {
            setEnvironment(prev => ({ ...prev, ...choice.updateEnvironment }));
        }

        // 3b. Update Flags (Prinsipp 1)
        if (choice.setFlags && choice.setFlags.length > 0) {
            setFlags(prev => [...new Set([...prev, ...choice.setFlags!])]);
        }
        if (choice.clearFlags && choice.clearFlags.length > 0) {
            setFlags(prev => prev.filter(f => !choice.clearFlags!.includes(f)));
        }

        // 4. Navigate to Next Node
        let targetNodeId = choice.nextNodeId;

        // Handle Random Events
        if (targetNodeId === 'RANDOM_EVENT' && scenario.randomEvents && scenario.randomEvents.length > 0) {
            const randomIndex = Math.floor(Math.random() * scenario.randomEvents.length);
            targetNodeId = scenario.randomEvents[randomIndex];
        }

        const nextNode = scenario.nodes[targetNodeId];

        if (nextNode) {
            setCurrentNodeId(targetNodeId);

            // Phase 9.2: Save Run on End
            if (nextNode.isEnd) {
                const isWin = nextNode.endType === 'victory';
                const log: ChronosRunLog = {
                    id: Math.random().toString(36).substr(2, 9),
                    scenarioId: scenario.id,
                    date: Date.now(),
                    result: isWin ? 'victory' : 'defeat',
                    daysSurvived: journal.length, // Rough proxy for days
                    score: stats.reduce((acc, s) => acc + s.value, 0) + (isWin ? 1000 : 0),
                    endingNodeId: targetNodeId
                };
                saveRun(log);

                if (isWin) {
                    // Unlock next scenario
                    if (scenario.id === 'roman-soldier') unlockScenario('feudal-peasant');

                    // Save Legacy Items (Example: Celtic Brooch)
                    if (inventory.includes('celtic_brooch')) {
                        addLegacyItem('celtic_brooch');
                    }
                }
            }

        } else {
            console.error(`Node ${targetNodeId} not found!`);
        }
    };

    const handleRestart = () => {
        if (scenario) {
            setStats(scenario.config.stats);
            // Re-inject legacy items on restart
            const legacyItems = profile?.legacyItems || [];
            setInventory([...legacyItems]);

            setJournal([]);
            setFlags([]); // Reset narrative flags
            setCurrentNodeId(scenario.startingNodeId);
        }
    };

    const handleCraft = (recipe: ChronosRecipe) => {
        // Remove ingredients
        const newInventory = [...inventory];
        recipe.ingredients.forEach(ing => {
            const index = newInventory.indexOf(ing);
            if (index > -1) newInventory.splice(index, 1);
        });

        // Add result
        newInventory.push(recipe.result);
        setInventory(newInventory);
    };

    if (isLoading) return <div className="p-12"><Skeleton className="h-[600px] w-full rounded-3xl" /></div>;
    if (isError || !scenario) return <div className="p-12 text-center text-red-500">Klarte ikke laste tidsreisen.</div>;

    // Safety check for node
    const currentNode = currentNodeId ? scenario.nodes[currentNodeId] : null;

    if (!currentNode) return <div>Laster noder...</div>;

    return (
        <div className="w-full max-w-6xl mx-auto p-2 sm:p-4 md:p-8">
            <div className="mb-3 sm:mb-5 md:mb-6 flex items-center justify-between">
                <Link to="/oving/tidsreise" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
                    <ArrowLeft size={16} />
                    <span className="font-bold text-sm uppercase tracking-wider">Avslutt Tidsreise</span>
                </Link>
                <div className="text-right">
                    <h1 className="text-xl font-display font-black text-slate-900">{scenario.title}</h1>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">{scenario.role} • {scenario.year}</p>
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
                onAddJournalEntry={(text) => setJournal(prev => [...prev, { day: journal.length + 1, text, timestamp: Date.now() }])}
                onRestart={handleRestart}
                onCraft={handleCraft}
            />
        </div>
    );
};
