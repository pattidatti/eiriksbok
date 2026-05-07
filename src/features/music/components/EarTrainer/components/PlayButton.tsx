import React from 'react';
import { Play, Loader2 } from 'lucide-react';

interface PlayButtonProps {
    onClick: () => void;
    isPlaying: boolean;
    isLoading: boolean;
    pulse: boolean;
    forceDisabled?: boolean;
    label?: string;
}

export const PlayButton: React.FC<PlayButtonProps> = ({
    onClick,
    isPlaying,
    isLoading,
    pulse,
    forceDisabled,
    label = 'Spill av',
}) => {
    const disabled = isPlaying || isLoading || !!forceDisabled;
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            className={`relative inline-flex items-center justify-center gap-3 rounded-2xl bg-indigo-600 px-10 py-6 text-xl font-semibold text-white shadow-lg transition-all hover:bg-indigo-700 hover:shadow-xl disabled:opacity-70 ${
                pulse && !disabled ? 'animate-pulse' : ''
            }`}
        >
            {isLoading ? (
                <>
                    <Loader2 className="h-7 w-7 animate-spin" />
                    <span>Laster piano…</span>
                </>
            ) : isPlaying ? (
                <>
                    <span className="flex h-7 items-end gap-1">
                        <span className="h-3 w-1.5 animate-pulse rounded bg-white" />
                        <span className="h-5 w-1.5 animate-pulse rounded bg-white [animation-delay:120ms]" />
                        <span className="h-7 w-1.5 animate-pulse rounded bg-white [animation-delay:240ms]" />
                        <span className="h-4 w-1.5 animate-pulse rounded bg-white [animation-delay:360ms]" />
                    </span>
                    <span>Spiller…</span>
                </>
            ) : (
                <>
                    <Play className="h-7 w-7 fill-white" />
                    <span>{label}</span>
                </>
            )}
        </button>
    );
};
