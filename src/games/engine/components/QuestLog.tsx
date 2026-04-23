import { useEffect, useState } from 'react';

interface QuestView {
    id: string;
    title: string;
    description: string;
    status: 'locked' | 'active' | 'completed';
    objectives: Array<{ id: string; label: string; done: boolean }>;
}

interface QuestLogProps {
    getSnapshot: () => QuestView[] | null;
    onClose: () => void;
}

export function QuestLog({ getSnapshot, onClose }: QuestLogProps) {
    const [quests, setQuests] = useState<QuestView[]>([]);

    useEffect(() => {
        const poll = () => {
            const qs = getSnapshot();
            if (qs) setQuests(qs);
        };
        poll();
        const id = window.setInterval(poll, 500);
        return () => window.clearInterval(id);
    }, [getSnapshot]);

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
                    maxWidth: 600,
                    width: '90%',
                    maxHeight: '80vh',
                    overflowY: 'auto',
                    color: '#f4e4c1',
                    fontFamily: "Georgia, 'Times New Roman', serif",
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
                    <h2 style={{ fontSize: 18, color: '#d4a574', letterSpacing: 2, textTransform: 'uppercase', margin: 0 }}>
                        Oppdrag
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
                        Lukk (J)
                    </button>
                </div>

                {quests.length === 0 && (
                    <p style={{ fontStyle: 'italic', color: '#b89968' }}>Ingen oppdrag registrert.</p>
                )}

                {quests.map((q) => (
                    <div
                        key={q.id}
                        style={{
                            marginBottom: 18,
                            paddingBottom: 14,
                            borderBottom: '1px solid #5c4228',
                            opacity: q.status === 'locked' ? 0.45 : 1,
                        }}
                    >
                        <h3 style={{
                            fontSize: 15,
                            margin: '0 0 4px',
                            color: q.status === 'completed' ? '#90c090' : '#f4e4c1',
                            textDecoration: q.status === 'completed' ? 'line-through' : 'none',
                        }}>
                            {q.title}
                        </h3>
                        <p style={{ fontSize: 13, margin: '0 0 8px', color: '#b89968', fontStyle: 'italic' }}>
                            {q.description}
                        </p>
                        {q.status !== 'locked' && (
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {q.objectives.map((o) => (
                                    <li key={o.id} style={{
                                        fontSize: 13,
                                        color: o.done ? '#90c090' : '#d4a574',
                                        padding: '2px 0',
                                    }}>
                                        {o.done ? '✓' : '○'} {o.label}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
