import React, { useRef, useState } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { damp } from './damp';
import { microSfx } from './sound';
import { useOrbitToggle } from './useOrbitToggle';

// Vri et objekt til en vinkel ved å dra det. Bryter ut av "klikk-hotspot"-ruten
// med en kontinuerlig 1-DOF-mekanikk: hjul, spak, ratt, solur, klokke, "still inn".
// Dra vannrett for å rotere; valgfritt mål + toleranse gir et "klikk på plass".
//
//   <Rotatable axis="y" target={Math.PI / 2} onAlign={() => setFlag(true)}>
//       <Dial />
//   </Rotatable>
//
// Krever at scenens OrbitControls er makeDefault (MicroCanvas gjør det), så
// rotasjon av objektet skrur av kamerarotasjon mens man drar.

interface RotatableProps {
    children: React.ReactNode;
    // Hvilken akse objektet roteres om. Default 'y' (rundt loddrett).
    axis?: 'x' | 'y' | 'z';
    position?: [number, number, number];
    scale?: number;
    // Startvinkel (radianer).
    initial?: number;
    // Radianer per piksel vannrett drag. Default 0.012 (rolig, trackpad-vennlig).
    sensitivity?: number;
    // Snap til increment ved slipp (radianer). F.eks. Math.PI/6 for 30-graders hakk.
    snap?: number;
    // Lås rotasjonen innenfor [min, max] (radianer). Udefinert = fri.
    min?: number;
    max?: number;
    // Målvinkel (radianer). Med toleranse gir det et "på plass"-treff ved slipp.
    target?: number;
    // Hvor nær target som teller som truffet (radianer). Default 0.12 (~7 grader).
    tolerance?: number;
    onChange?: (angle: number) => void;
    onRelease?: (angle: number) => void;
    // Fyrer ved slipp når vinkelen er innenfor toleranse av target.
    onAlign?: () => void;
    // 'pick'/'drop'-lyd + 'correct' ved align. Default true.
    sound?: boolean;
}

function clamp(v: number, lo?: number, hi?: number) {
    if (lo !== undefined) v = Math.max(lo, v);
    if (hi !== undefined) v = Math.min(hi, v);
    return v;
}

// Korteste vinkelavstand (håndterer wrap rundt 2pi).
function angleDist(a: number, b: number): number {
    let d = (a - b) % (Math.PI * 2);
    if (d > Math.PI) d -= Math.PI * 2;
    if (d < -Math.PI) d += Math.PI * 2;
    return Math.abs(d);
}

export const Rotatable: React.FC<RotatableProps> = ({
    children,
    axis = 'y',
    position,
    scale = 1,
    initial = 0,
    sensitivity = 0.012,
    snap,
    min,
    max,
    target,
    tolerance = 0.12,
    onChange,
    onRelease,
    onAlign,
    sound = true,
}) => {
    const group = useRef<THREE.Group>(null);
    const setOrbit = useOrbitToggle();
    const angleRef = useRef(initial);
    const lastX = useRef(0);
    const [dragging, setDragging] = useState(false);

    useFrame((_, dt) => {
        if (!group.current) return;
        const cur = group.current.rotation[axis];
        group.current.rotation[axis] = damp(cur, angleRef.current, dt, 16);
    });

    return (
        <group
            ref={group}
            position={position}
            scale={scale}
            onPointerDown={(e: ThreeEvent<PointerEvent>) => {
                e.stopPropagation();
                (e.target as Element).setPointerCapture?.(e.pointerId);
                lastX.current = e.nativeEvent.clientX;
                setDragging(true);
                setOrbit(false);
                document.body.style.cursor = 'grabbing';
                if (sound) microSfx.play('pick');
            }}
            onPointerMove={(e: ThreeEvent<PointerEvent>) => {
                if (!dragging) return;
                e.stopPropagation();
                const x = e.nativeEvent.clientX;
                const dx = x - lastX.current;
                lastX.current = x;
                let next = angleRef.current + dx * sensitivity;
                next = clamp(next, min, max);
                angleRef.current = next;
                onChange?.(next);
            }}
            onPointerUp={(e: ThreeEvent<PointerEvent>) => {
                if (!dragging) return;
                e.stopPropagation();
                (e.target as Element).releasePointerCapture?.(e.pointerId);
                setDragging(false);
                setOrbit(true);
                document.body.style.cursor = '';
                if (snap) angleRef.current = Math.round(angleRef.current / snap) * snap;
                angleRef.current = clamp(angleRef.current, min, max);
                if (sound) microSfx.play('drop');
                onRelease?.(angleRef.current);
                if (target !== undefined && angleDist(angleRef.current, target) <= tolerance) {
                    if (sound) microSfx.play('correct');
                    onAlign?.();
                }
            }}
            onPointerOver={(e: ThreeEvent<PointerEvent>) => {
                e.stopPropagation();
                if (!dragging) document.body.style.cursor = 'grab';
            }}
            onPointerOut={(e: ThreeEvent<PointerEvent>) => {
                e.stopPropagation();
                if (!dragging) document.body.style.cursor = '';
            }}
        >
            {children}
        </group>
    );
};
