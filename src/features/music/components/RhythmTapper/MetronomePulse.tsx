interface Props {
    beatIndex: number;
    beatsPerBar: number;
    isCountIn: boolean;
}

export function MetronomePulse({ beatIndex, beatsPerBar, isCountIn }: Props) {
    const dots = Array.from({ length: beatsPerBar }, (_, i) => i);
    const activeIdx = beatIndex % beatsPerBar;

    return (
        <div className="flex items-center justify-center gap-3 py-4">
            {dots.map((i) => {
                const active = i === activeIdx;
                const isDownbeat = i === 0;
                return (
                    <div
                        key={i}
                        className={`rounded-full transition-all duration-100 ${
                            active
                                ? isCountIn
                                    ? 'w-8 h-8 bg-amber-500 scale-110'
                                    : isDownbeat
                                      ? 'w-8 h-8 bg-indigo-600 scale-110'
                                      : 'w-7 h-7 bg-indigo-400 scale-105'
                                : 'w-6 h-6 bg-slate-200'
                        }`}
                        aria-hidden="true"
                    />
                );
            })}
        </div>
    );
}
