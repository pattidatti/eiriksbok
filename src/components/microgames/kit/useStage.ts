import { useCallback, useState } from 'react';

// Liten tilstandsmaskin for fler-stegs mikrospill. `stage` går 0..total.
// Scenen leser `stage` og demper alt mykt mot mål utledet av den (se damp.ts).
//
//   const { stage, advance, reset, atEnd } = useStage(3);
//   <Building scale={stage >= 1 ? 1 : 0} />   // vokser fram ved steg 1
//
// Mønsteret skiller "hva har eleven gjort" (stage) fra "hvordan ser verdenen ut"
// (utledes hver frame). Da blir hele scenen animert av én enkelt setStage.
export function useStage(total: number, initial = 0) {
    const [stage, setStage] = useState(initial);

    const advance = useCallback(() => {
        setStage((s) => Math.min(total, s + 1));
    }, [total]);

    const goTo = useCallback(
        (n: number) => {
            setStage(Math.max(0, Math.min(total, n)));
        },
        [total]
    );

    const reset = useCallback(() => setStage(initial), [initial]);

    return {
        stage,
        advance,
        goTo,
        reset,
        atEnd: stage >= total,
        isFirst: stage === 0,
    };
}
