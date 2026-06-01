import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { getMicroGame } from './registry';
import type { MicroGameProps, MicroGameResult } from './types';

// Bro mellom artikkel-JSON og mikrospill-registeret. Lar et hvilket som helst
// mikrospill embeddes rett i en artikkel:
//
//   { "type": "component", "name": "MicroGame", "props": { "gameId": "gladius-duell" } }
//
// Spillene eier sin egen MicroGameFrame internt, så her trengs bare oppslag,
// lazy-lasting og en trygg onComplete i artikkel-kontekst (ingen "neste steg").

interface MicroGameBlockProps {
    gameId: string;
    // Frie spillspesifikke props fra JSON sendes videre til spillet.
    [key: string]: unknown;
}

export function MicroGameBlock({ gameId, onComplete, ...rest }: MicroGameBlockProps) {
    const entry = gameId ? getMicroGame(gameId) : undefined;

    if (!entry) {
        return (
            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-5 text-rose-900 my-4">
                <p className="font-semibold mb-1">Mikro-spillet ble ikke funnet.</p>
                <p className="text-sm">
                    Artikkelen refererer til <code>{gameId ?? '(mangler gameId)'}</code>, men det
                    finnes ikke i mikrospill-registeret.
                </p>
            </div>
        );
    }

    const GameComponent = entry.Component as unknown as React.ComponentType<MicroGameProps>;

    // I artikkel-kontekst finnes ingen sti-flyt å gå videre i. Spillene viser
    // sin egen vinn/feedback-skjerm, så vi gir en trygg no-op (eller en valgfri
    // onComplete sendt inn for analytics) uten å blokkere artikkelen.
    const handleComplete =
        typeof onComplete === 'function'
            ? (onComplete as (result: MicroGameResult) => void)
            : () => {};

    return (
        <div className="my-6" data-microgame={gameId}>
            <Suspense
                fallback={
                    <div className="flex items-center justify-center py-16 bg-amber-50/60 border-2 border-amber-200 text-amber-700 rounded-2xl">
                        <Loader2 className="w-5 h-5 animate-spin mr-3" />
                        Laster {entry.title}...
                    </div>
                }
            >
                <GameComponent {...(rest as Partial<MicroGameProps>)} onComplete={handleComplete} />
            </Suspense>
        </div>
    );
}

export default MicroGameBlock;
