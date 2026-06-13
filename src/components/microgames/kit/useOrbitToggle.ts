import { useCallback } from 'react';
import { useThree } from '@react-three/fiber';

// Skru scenens OrbitControls av/på mens et objekt dras eller roteres. R3F er
// designet for at OrbitControls.enabled muteres direkte - immutability-regelen er
// en falsk positiv her, så vi samler det ene unntaket på ÉTT dokumentert sted.
// Brukes av Draggable, Rotatable og AimLauncher.
export function useOrbitToggle(): (enabled: boolean) => void {
    const get = useThree((s) => s.get);
    return useCallback(
        (enabled: boolean) => {
            const controls = get().controls as { enabled: boolean } | null;
            if (controls) controls.enabled = enabled;
        },
        [get]
    );
}
