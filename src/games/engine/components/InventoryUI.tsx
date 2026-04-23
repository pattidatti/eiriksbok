import { useEffect, useState } from 'react';

interface SlotView {
    itemId: string;
    count: number;
    name: string;
    description: string;
    icon: string;
}

interface InventorySnapshot {
    slots: SlotView[];
    maxSlots: number;
}

interface InventoryUIProps {
    getSnapshot: () => InventorySnapshot | null;
    onClose: () => void;
}

export function InventoryUI({ getSnapshot, onClose }: InventoryUIProps) {
    const [slots, setSlots] = useState<SlotView[]>([]);
    const [maxSlots, setMaxSlots] = useState(16);
    const [hover, setHover] = useState<number | null>(null);

    useEffect(() => {
        const poll = () => {
            const snap = getSnapshot();
            if (snap) {
                setSlots(snap.slots);
                setMaxSlots(snap.maxSlots);
            }
        };
        poll();
        const id = window.setInterval(poll, 300);
        return () => window.clearInterval(id);
    }, [getSnapshot]);

    // Fyll opp til maxSlots med tomme slots for grid-layout
    const displaySlots = [...slots];
    while (displaySlots.length < maxSlots) displaySlots.push(null as unknown as SlotView);

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(10,8,6,0.7)',
                backdropFilter: 'blur(6px)',
                zIndex: 22,
            }}
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: 'rgba(20,14,10,0.96)',
                    border: '2px solid #8b6f47',
                    borderRadius: 6,
                    padding: '24px 28px',
                    width: 380,
                    color: '#f4e4c1',
                    fontFamily: "Georgia, 'Times New Roman', serif",
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
                    <h2 style={{ fontSize: 18, color: '#d4a574', letterSpacing: 2, textTransform: 'uppercase', margin: 0 }}>
                        Sekk
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: '1px solid #5c4228',
                            color: '#b89968',
                            padding: '4px 12px',
                            borderRadius: 3,
                            cursor: 'pointer',
                            fontSize: 12,
                        }}
                    >
                        Lukk (I)
                    </button>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 6,
                }}>
                    {displaySlots.map((slot, i) => (
                        <div
                            key={i}
                            onMouseEnter={() => slot && setHover(i)}
                            onMouseLeave={() => setHover(null)}
                            style={{
                                aspectRatio: '1 / 1',
                                background: 'rgba(0,0,0,0.4)',
                                border: '1px solid #5c4228',
                                borderRadius: 3,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                position: 'relative',
                                cursor: slot ? 'pointer' : 'default',
                                fontSize: 24,
                            }}
                        >
                            {slot && (
                                <>
                                    <div>{slot.icon}</div>
                                    {slot.count > 1 && (
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 2,
                                            right: 4,
                                            fontSize: 11,
                                            color: '#d4a574',
                                            fontWeight: 'bold',
                                        }}>
                                            {slot.count}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>

                {hover !== null && slots[hover] && (
                    <div style={{
                        marginTop: 14,
                        padding: '10px 12px',
                        background: 'rgba(0,0,0,0.35)',
                        border: '1px solid #5c4228',
                        borderRadius: 3,
                    }}>
                        <div style={{ fontSize: 14, color: '#d4a574', marginBottom: 4, fontWeight: 'bold' }}>
                            {slots[hover].name}
                        </div>
                        <div style={{ fontSize: 12, color: '#b89968', fontStyle: 'italic' }}>
                            {slots[hover].description}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
