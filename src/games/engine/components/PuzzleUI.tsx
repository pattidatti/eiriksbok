import { GamePanel } from './GamePanel';

interface PuzzleState {
    visible: boolean;
    stepIndex: number;
    stepLabels: string[];
    question: string;
    hint: string;
    feedback: string;
    options: string[];
}

interface PuzzleUIProps {
    puzzle: PuzzleState;
    onAnswer: (index: number) => void;
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

export function PuzzleUI({ puzzle, onAnswer }: PuzzleUIProps) {
    if (!puzzle.visible) return null;

    return (
        <GamePanel>
            {/* Speaker bar */}
            <div style={{ fontSize: 15, color: '#d4a574', marginBottom: 12, letterSpacing: 1 }}>
                ⚙ Bygg maskinen — steg {puzzle.stepIndex + 1} av {puzzle.stepLabels.length}
            </div>

            {/* Step diagram */}
            <div
                style={{
                    textAlign: 'center',
                    fontSize: 13,
                    marginBottom: 14,
                    letterSpacing: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 8,
                    alignItems: 'center',
                    flexWrap: 'wrap',
                }}
            >
                {puzzle.stepLabels.map((label, i) => (
                    <span key={label}>
                        <span
                            style={{
                                color:
                                    i < puzzle.stepIndex
                                        ? '#90c090'
                                        : i === puzzle.stepIndex
                                        ? '#d4a574'
                                        : '#5c4228',
                            }}
                        >
                            {i < puzzle.stepIndex ? `✓ ${label}` : i === puzzle.stepIndex ? `● ${label}?` : `○ ${label}`}
                        </span>
                        {i < puzzle.stepLabels.length - 1 && (
                            <span style={{ color: '#5c4228', marginLeft: 8 }}>→</span>
                        )}
                    </span>
                ))}
            </div>

            {/* Feedback */}
            {puzzle.feedback && (
                <div
                    style={{
                        background: 'rgba(60,30,15,0.6)',
                        borderLeft: '3px solid #d4a574',
                        padding: '8px 12px',
                        marginBottom: 12,
                        fontStyle: 'italic',
                        fontSize: 14,
                        color: '#f4e4c1',
                    }}
                >
                    {puzzle.feedback}
                </div>
            )}

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
