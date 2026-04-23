import { useState } from 'react';
import { GamePanel } from './GamePanel';

interface AvailableItem {
    itemId: string;
    name: string;
    count: number;
}

interface PuzzleState {
    visible: boolean;
    stepIndex: number;
    stepLabels: string[];
    question: string;
    hint: string;
    feedback: string;
    options: string[];
    // Station mode
    mode?: 'mcq' | 'station';
    stationLabel?: string;
    ingredientSlots?: string[];
    slotLabels?: string[];
    availableItems?: AvailableItem[];
}

interface PuzzleUIProps {
    puzzle: PuzzleState;
    onAnswer: (index: number) => void;
    onStationSubmit?: (selectedItemIds: string[]) => void;
}

const keyBadge: React.CSSProperties = {
    display: 'inline-block',
    background: 'rgba(0,0,0,0.45)',
    border: '1px solid #8b6f47',
    borderRadius: 3,
    fontFamily: 'monospace',
    fontSize: 12,
    padding: '1px 6px',
    marginRight: 10,
    color: '#d4a574',
    minWidth: 20,
    textAlign: 'center',
};

function StepDiagram({ stepLabels, stepIndex }: { stepLabels: string[]; stepIndex: number }) {
    return (
        <div style={{ textAlign: 'center', fontSize: 13, marginBottom: 14, letterSpacing: 1, display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {stepLabels.map((label, i) => (
                <span key={label}>
                    <span style={{ color: i < stepIndex ? '#90c090' : i === stepIndex ? '#d4a574' : '#5c4228' }}>
                        {i < stepIndex ? `✓ ${label}` : i === stepIndex ? `● ${label}?` : `○ ${label}`}
                    </span>
                    {i < stepLabels.length - 1 && <span style={{ color: '#5c4228', marginLeft: 8 }}>→</span>}
                </span>
            ))}
        </div>
    );
}

function FeedbackBlock({ feedback }: { feedback: string }) {
    if (!feedback) return null;
    return (
        <div style={{ background: 'rgba(60,30,15,0.6)', borderLeft: '3px solid #d4a574', padding: '8px 12px', marginBottom: 12, fontStyle: 'italic', fontSize: 14, color: '#f4e4c1' }}>
            {feedback}
        </div>
    );
}

function StationMode({ puzzle, onStationSubmit }: { puzzle: PuzzleState; onStationSubmit?: (ids: string[]) => void }) {
    const slotCount = puzzle.ingredientSlots?.length ?? 0;
    const [filled, setFilled] = useState<(string | null)[]>(() => Array(slotCount).fill(null));

    const addItem = (itemId: string) => {
        setFilled((prev) => {
            const next = [...prev];
            const emptyIdx = next.findIndex((v) => v === null);
            if (emptyIdx >= 0) next[emptyIdx] = itemId;
            return next;
        });
    };

    const removeSlot = (idx: number) => {
        setFilled((prev) => {
            const next = [...prev];
            next[idx] = null;
            return next;
        });
    };

    const handleSubmit = () => {
        const selected = filled.filter((v): v is string => v !== null);
        if (selected.length < slotCount) return;
        onStationSubmit?.(selected);
        setFilled(Array(slotCount).fill(null));
    };

    const getItemName = (itemId: string) =>
        puzzle.availableItems?.find((a) => a.itemId === itemId)?.name ?? itemId;

    // Inventar-telling med hensyn til hva som allerede er plassert i slots
    const slotUsage = filled.reduce<Record<string, number>>((acc, id) => {
        if (id) acc[id] = (acc[id] ?? 0) + 1;
        return acc;
    }, {});

    const available = (puzzle.availableItems ?? []).map((item) => ({
        ...item,
        remaining: item.count - (slotUsage[item.itemId] ?? 0),
    })).filter((item) => item.remaining > 0);

    return (
        <>
            <div style={{ fontSize: 15, color: '#d4a574', marginBottom: 12, letterSpacing: 1 }}>
                ⚗ {puzzle.stationLabel ?? 'Kombiner gjenstander'} — steg {puzzle.stepIndex + 1} av {puzzle.stepLabels.length}
            </div>

            <StepDiagram stepLabels={puzzle.stepLabels} stepIndex={puzzle.stepIndex} />
            <FeedbackBlock feedback={puzzle.feedback} />

            <p style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 6 }}>{puzzle.question}</p>
            <p style={{ fontSize: 13, color: '#b89968', marginBottom: 14 }}>💡 Hint: {puzzle.hint}</p>

            {/* Slots */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                {Array.from({ length: slotCount }).map((_, i) => {
                    const label = puzzle.slotLabels?.[i] ?? `Slot ${i + 1}`;
                    const item = filled[i];
                    return (
                        <button
                            key={i}
                            onClick={() => item && removeSlot(i)}
                            title={item ? 'Klikk for å fjerne' : undefined}
                            style={{
                                flex: '1 1 80px',
                                minWidth: 80,
                                padding: '10px 8px',
                                background: item ? 'rgba(90,60,20,0.7)' : 'rgba(30,18,10,0.4)',
                                border: `1px solid ${item ? '#d4a574' : '#5c4228'}`,
                                borderRadius: 4,
                                color: item ? '#f4e4c1' : '#5c4228',
                                fontSize: 13,
                                cursor: item ? 'pointer' : 'default',
                                textAlign: 'center',
                                fontFamily: 'inherit',
                                transition: 'all 0.2s',
                            }}
                        >
                            <div style={{ fontSize: 11, color: '#8b6f47', marginBottom: 4 }}>{label}</div>
                            {item ? getItemName(item) : '—'}
                        </button>
                    );
                })}
            </div>

            {/* Tilgjengelige items */}
            <div style={{ fontSize: 13, color: '#b89968', marginBottom: 8 }}>Inventar:</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                {available.length === 0 && (
                    <span style={{ color: '#5c4228', fontSize: 13 }}>Ingen gjenstander tilgjengelig</span>
                )}
                {available.map((item) => (
                    <button
                        key={item.itemId}
                        onClick={() => addItem(item.itemId)}
                        style={{
                            padding: '6px 12px',
                            background: 'rgba(60,40,10,0.5)',
                            border: '1px solid #8b6f47',
                            borderRadius: 3,
                            color: '#f4e4c1',
                            fontSize: 13,
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#5c4228'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(60,40,10,0.5)'; }}
                    >
                        {item.name} {item.remaining > 1 ? `(${item.remaining})` : ''}
                    </button>
                ))}
            </div>

            {/* Submit */}
            <button
                onClick={handleSubmit}
                disabled={filled.some((v) => v === null)}
                style={{
                    width: '100%',
                    padding: '12px',
                    background: filled.every((v) => v !== null) ? '#5c4228' : 'rgba(30,18,10,0.4)',
                    border: `1px solid ${filled.every((v) => v !== null) ? '#d4a574' : '#3a2810'}`,
                    borderRadius: 4,
                    color: filled.every((v) => v !== null) ? '#f4e4c1' : '#5c4228',
                    fontSize: 14,
                    cursor: filled.every((v) => v !== null) ? 'pointer' : 'not-allowed',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s',
                }}
            >
                Lag gjenstand
            </button>
        </>
    );
}

export function PuzzleUI({ puzzle, onAnswer, onStationSubmit }: PuzzleUIProps) {
    if (!puzzle.visible) return null;

    if (puzzle.mode === 'station') {
        return (
            <GamePanel>
                <StationMode puzzle={puzzle} onStationSubmit={onStationSubmit} />
            </GamePanel>
        );
    }

    return (
        <GamePanel>
            {/* Speaker bar */}
            <div style={{ fontSize: 15, color: '#d4a574', marginBottom: 12, letterSpacing: 1 }}>
                ⚙ Bygg maskinen — steg {puzzle.stepIndex + 1} av {puzzle.stepLabels.length}
            </div>

            <StepDiagram stepLabels={puzzle.stepLabels} stepIndex={puzzle.stepIndex} />
            <FeedbackBlock feedback={puzzle.feedback} />

            {/* Question */}
            <p style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 6 }}>
                {puzzle.question}
            </p>
            <p style={{ fontSize: 13, color: '#b89968', marginBottom: 14 }}>
                💡 Hint: {puzzle.hint}
            </p>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {puzzle.options.map((option, i) => (
                    <button
                        key={i}
                        onClick={() => onAnswer(i)}
                        style={{
                            display: 'block',
                            width: '100%',
                            background: 'transparent',
                            border: '1px solid #5c4228',
                            color: '#f4e4c1',
                            padding: '10px 14px',
                            textAlign: 'left',
                            fontFamily: 'inherit',
                            fontSize: 14,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            borderRadius: 3,
                        }}
                        onMouseEnter={(e) => {
                            const el = e.currentTarget;
                            el.style.background = '#5c4228';
                            el.style.borderColor = '#d4a574';
                            el.style.color = '#fff';
                            el.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={(e) => {
                            const el = e.currentTarget;
                            el.style.background = 'transparent';
                            el.style.borderColor = '#5c4228';
                            el.style.color = '#f4e4c1';
                            el.style.transform = 'translateX(0)';
                        }}
                    >
                        <span style={keyBadge}>{i + 1}</span>
                        {option}
                    </button>
                ))}
            </div>
        </GamePanel>
    );
}
