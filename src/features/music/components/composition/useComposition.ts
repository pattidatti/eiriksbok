import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Composition, Section, Bar, RhythmNode, NoteDuration, SectionType, InstrumentType } from './types';
import { getCreatorId } from './utils';

export const useComposition = () => {
    const [composition, setComposition] = useState<Composition>({
        id: uuidv4(),
        title: 'Ny Sang',
        tempo: 120,
        creatorId: getCreatorId(),
        sections: [
            {
                id: uuidv4(),
                type: 'intro',
                name: 'Intro',
                repeatCount: 1,
                instruments: [],
                color: 'bg-emerald-100', // Light mode pastel
                bars: [
                    {
                        id: uuidv4(),
                        timeSignature: [4, 4],
                        nodes: Array(4).fill(null).map(() => ({ id: uuidv4(), type: 'rest', duration: '4n' })),
                        chords: []
                    },
                    {
                        id: uuidv4(),
                        timeSignature: [4, 4],
                        nodes: Array(4).fill(null).map(() => ({ id: uuidv4(), type: 'rest', duration: '4n' })),
                        chords: []
                    }
                ]
            }
        ]
    });

    const [activeSectionId, setActiveSectionId] = useState<string>(composition.sections[0].id);
    const [selectedDuration, setSelectedDuration] = useState<NoteDuration>('4n');
    const [isRestMode, setIsRestMode] = useState(false);

    const activeSection = composition.sections.find(s => s.id === activeSectionId);

    const removeSection = useCallback((id: string) => {
        setComposition(prev => ({
            ...prev,
            sections: prev.sections.filter(s => s.id !== id)
        }));
        if (activeSectionId === id) {
            setActiveSectionId(() => composition.sections.find(s => s.id !== id)?.id || '');
        }
    }, [activeSectionId, composition.sections]);

    const addSection = useCallback((type: SectionType) => {
        const newSection: Section = {
            id: uuidv4(),
            type,
            name: type.charAt(0).toUpperCase() + type.slice(1),
            repeatCount: 1,
            color: getSectionColor(type),
            instruments: [],
            bars: createDefaultBars(4)
        };
        setComposition(prev => ({
            ...prev,
            sections: [...prev.sections, newSection]
        }));
        setActiveSectionId(newSection.id);
    }, []);

    const updateSection = useCallback((id: string, updates: Partial<Section>) => {
        setComposition(prev => ({
            ...prev,
            sections: prev.sections.map(s => s.id === id ? { ...s, ...updates } : s)
        }));
    }, []);

    const getDurationBeats = (d: NoteDuration): number => {
        switch (d) {
            case '1n': return 4;
            case '2n': return 2;
            case '4n': return 1;
            case '8n': return 0.5;
            default: return 1;
        }
    };

    const updateBar = useCallback((sectionId: string, barId: string, nodeIndex: number, newDuration: NoteDuration, isRest: boolean) => {
        setComposition(prev => ({
            ...prev,
            sections: prev.sections.map(s => {
                if (s.id !== sectionId) return s;
                return {
                    ...s,
                    bars: s.bars.map(b => {
                        if (b.id !== barId) return b;

                        const oldNode = b.nodes[nodeIndex];
                        const oldBeats = getDurationBeats(oldNode.duration);
                        const newBeats = getDurationBeats(newDuration);

                        let resultingNodes: RhythmNode[] = [];
                        let nodesToSkip = 1;

                        if (newBeats < oldBeats) {
                            // Split logic
                            const splitCount = oldBeats / newBeats;
                            resultingNodes = Array(splitCount).fill(null).map(() => ({
                                id: uuidv4(),
                                type: isRest ? 'rest' : 'note',
                                duration: newDuration
                            }));
                        } else if (newBeats > oldBeats) {
                            // Consume logic: Merge multiple smaller nodes into one larger one
                            let accumulatedOldBeats = 0;
                            let i = nodeIndex;
                            while (i < b.nodes.length && accumulatedOldBeats < newBeats) {
                                accumulatedOldBeats += getDurationBeats(b.nodes[i].duration);
                                i++;
                            }
                            nodesToSkip = i - nodeIndex;

                            resultingNodes = [{
                                id: uuidv4(),
                                type: isRest ? 'rest' : 'note',
                                duration: newDuration
                            }];

                            // Handle remainders if we consumed "too much" (greedy consumption)
                            if (accumulatedOldBeats > newBeats) {
                                let remainder = accumulatedOldBeats - newBeats;
                                while (remainder > 0) {
                                    const durs: NoteDuration[] = ['2n', '4n', '8n'];
                                    const fit = durs.find(d => getDurationBeats(d) <= remainder) || '8n';
                                    resultingNodes.push({
                                        id: uuidv4(),
                                        type: 'rest',
                                        duration: fit
                                    });
                                    remainder -= getDurationBeats(fit);
                                }
                            }
                        } else {
                            // Simple replace
                            resultingNodes = [{
                                id: uuidv4(),
                                type: isRest ? 'rest' : 'note',
                                duration: newDuration
                            }];
                        }

                        const newNodes = [...b.nodes];
                        newNodes.splice(nodeIndex, nodesToSkip, ...resultingNodes);
                        return { ...b, nodes: newNodes };
                    })
                };
            })
        }));
    }, []);

    const removeChord = useCallback((sectionId: string, barId: string, chordIndex: number) => {
        setComposition(prev => ({
            ...prev,
            sections: prev.sections.map(s => {
                if (s.id !== sectionId) return s;
                return {
                    ...s,
                    bars: s.bars.map(b => {
                        if (b.id !== barId) return b;
                        const newChords = [...b.chords];
                        newChords.splice(chordIndex, 1);
                        return { ...b, chords: newChords };
                    })
                };
            })
        }));
    }, []);

    const updateSectionBars = useCallback((sectionId: string, count: number) => {
        setComposition(prev => ({
            ...prev,
            sections: prev.sections.map(s => {
                if (s.id !== sectionId) return s;

                const currentCount = s.bars.length;
                if (count > currentCount) {
                    // Add bars
                    const barsToAdd = count - currentCount;
                    return { ...s, bars: [...s.bars, ...createDefaultBars(barsToAdd)] };
                } else if (count < currentCount) {
                    // Remove bars (from the end)
                    return { ...s, bars: s.bars.slice(0, count) };
                }
                return s;
            })
        }));
    }, []);

    const addChord = useCallback((sectionId: string, barId: string, beat: number, chord: string) => {
        setComposition(prev => ({
            ...prev,
            sections: prev.sections.map(s => {
                if (s.id !== sectionId) return s;
                return {
                    ...s,
                    bars: s.bars.map(b => {
                        if (b.id !== barId) return b;
                        return {
                            ...b,
                            chords: [...b.chords, { beatPosition: beat, chord }]
                        };
                    })
                };
            })
        }));
    }, []);

    const toggleInstrument = useCallback((sectionId: string, instrument: InstrumentType) => {
        setComposition(prev => ({
            ...prev,
            sections: prev.sections.map(s => {
                if (s.id !== sectionId) return s;
                const instruments = s.instruments || [];
                const next = instruments.includes(instrument)
                    ? instruments.filter(i => i !== instrument)
                    : [...instruments, instrument];
                return { ...s, instruments: next };
            })
        }));
    }, []);

    const renameComposition = useCallback((newTitle: string) => {
        setComposition(prev => ({ ...prev, title: newTitle }));
    }, []);


    const resetToDefault = useCallback(() => {
        const defaultComp: Composition = {
            id: uuidv4(),
            title: 'Ny Sang',
            tempo: 120,
            creatorId: getCreatorId(),
            sections: [
                {
                    id: uuidv4(),
                    type: 'intro',
                    name: 'Intro',
                    repeatCount: 1,
                    instruments: [],
                    color: 'bg-emerald-100',
                    bars: createDefaultBars(4)
                }
            ]
        };
        setComposition(defaultComp);
        setActiveSectionId(defaultComp.sections[0].id);
    }, []);

    return {
        composition,
        setComposition,
        activeSection,
        activeSectionId,
        setActiveSectionId,
        addSection,
        updateSection,
        updateBar,
        addChord,
        removeChord,
        selectedDuration,
        setSelectedDuration,
        isRestMode,
        setIsRestMode,
        removeSection,
        updateSectionBars,
        toggleInstrument,
        renameComposition,
        resetToDefault
    };
};

// Helpers
const createDefaultBars = (count: number): Bar[] => {
    return Array(count).fill(null).map(() => ({
        id: uuidv4(),
        timeSignature: [4, 4],
        nodes: Array(4).fill(null).map(() => ({ id: uuidv4(), type: 'rest', duration: '4n' })),
        chords: []
    }));
};

const getSectionColor = (type: SectionType): string => {
    switch (type) {
        case 'intro': return 'bg-emerald-100';
        case 'verse': return 'bg-blue-100';
        case 'chorus': return 'bg-rose-100';
        case 'bridge': return 'bg-amber-100';
        case 'outro': return 'bg-purple-100';
        case 'solo': return 'bg-orange-100';
        default: return 'bg-slate-100';
    }
};
