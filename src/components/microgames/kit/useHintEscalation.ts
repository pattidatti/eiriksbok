import { useEffect, useState } from 'react';

// Adaptiv hint: hvis eleven ikke gjør framgang innen et par sekunder, eskalerer
// hint-nivået (0 -> 1 -> 2 ...). Bruk nivået til å gradvis avsløre hjelp - f.eks.
// fremheve neste hotspot. `resetKey` nullstiller telleren ved framgang.
//   const hint = useHintEscalation({ active: phase === 'velg', resetKey: stage });
//   <Hotspot ... state={hint >= 1 ? 'hover' : 'idle'} />
export function useHintEscalation({
    active = true,
    stepMs = 8000,
    max = 2,
    resetKey,
}: {
    active?: boolean;
    stepMs?: number;
    max?: number;
    resetKey?: unknown;
}) {
    const [level, setLevel] = useState(0);
    // Nullstill ved framgang (resetKey-endring) under render - Reacts anbefalte
    // mønster for å resette state fra en prop, uten setState i en effekt.
    const [prevKey, setPrevKey] = useState(resetKey);
    if (resetKey !== prevKey) {
        setPrevKey(resetKey);
        setLevel(0);
    }

    useEffect(() => {
        if (!active) return;
        const id = setInterval(() => {
            setLevel((l) => Math.min(max, l + 1));
        }, stepMs);
        return () => clearInterval(id);
    }, [active, stepMs, max, resetKey]);

    return active ? level : 0;
}
