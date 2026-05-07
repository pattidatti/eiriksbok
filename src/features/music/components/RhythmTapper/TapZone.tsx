import { useEffect } from 'react';

interface Props {
    onTap: () => void;
    disabled?: boolean;
    label?: string;
    className?: string;
}

export function TapZone({ onTap, disabled = false, label = 'TAP', className = '' }: Props) {
    useEffect(() => {
        if (disabled) return;
        const handler = (e: KeyboardEvent) => {
            if (e.code !== 'Space') return;
            const target = e.target as HTMLElement;
            if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;
            e.preventDefault();
            onTap();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onTap, disabled]);

    return (
        <button
            type="button"
            onClick={() => !disabled && onTap()}
            onTouchStart={(e) => {
                if (disabled) return;
                e.preventDefault();
                onTap();
            }}
            disabled={disabled}
            className={`select-none w-full max-w-md mx-auto h-32 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-2xl text-2xl font-bold transition-transform active:scale-95 ${className}`}
            aria-label={label}
        >
            {label}
            <div className="text-xs font-normal opacity-80 mt-1">Mellomrom eller klikk</div>
        </button>
    );
}
