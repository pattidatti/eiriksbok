import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useThree, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';

interface DragBounds {
    minX?: number;
    maxX?: number;
    minZ?: number;
    maxZ?: number;
}

interface DraggableProps {
    children: React.ReactNode;
    // Startposisjon i verden.
    position?: [number, number, number];
    // Hvilket plan dras objektet på (høyde y). Default bakkenivå 0.
    planeY?: number;
    // Lås bevegelsen til én akse om ønskelig.
    axis?: 'xz' | 'x' | 'z';
    bounds?: DragBounds;
    // Snap til rutenett (verdensenheter) ved slipp - f.eks. 1 for heltallsruter.
    snap?: number;
    onDragStart?: () => void;
    onDrag?: (pos: THREE.Vector3) => void;
    onDrop?: (pos: THREE.Vector3) => void;
    // Hvor sterkt objektet "løftes" mens det dras (visuell juice).
    liftY?: number;
}

function clamp(v: number, lo?: number, hi?: number) {
    if (lo !== undefined) v = Math.max(lo, v);
    if (hi !== undefined) v = Math.min(hi, v);
    return v;
}

// Dra et objekt langs bakkeplanet med generøs trackpad-toleranse. Krever at
// scenens OrbitControls er `makeDefault` (MicroCanvas gjør dette) slik at
// dragging kan skru av kamerarotasjon underveis.
export const Draggable: React.FC<DraggableProps> = ({
    children,
    position = [0, 0, 0],
    planeY = 0,
    axis = 'xz',
    bounds,
    snap,
    onDragStart,
    onDrag,
    onDrop,
    liftY = 0.4,
}) => {
    const group = useRef<THREE.Group>(null);
    const controls = useThree((s) => s.controls) as { enabled: boolean } | null;
    const [dragging, setDragging] = useState(false);
    const plane = useMemo(
        () => new THREE.Plane(new THREE.Vector3(0, 1, 0), -planeY),
        [planeY]
    );
    const hit = useMemo(() => new THREE.Vector3(), []);
    const start = useMemo(
        () => new THREE.Vector3(position[0], position[1], position[2]),
        // kun ved mount; senere posisjon eies av group-ref
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    useEffect(() => {
        if (group.current) group.current.position.copy(start);
    }, [start]);

    const apply = (pt: THREE.Vector3, lift: boolean) => {
        if (!group.current) return;
        let x = axis === 'z' ? start.x : pt.x;
        let z = axis === 'x' ? start.z : pt.z;
        x = clamp(x, bounds?.minX, bounds?.maxX);
        z = clamp(z, bounds?.minZ, bounds?.maxZ);
        group.current.position.set(x, planeY + (lift ? liftY : 0), z);
    };

    const end = () => {
        if (!group.current) return;
        const p = group.current.position;
        let x = p.x;
        let z = p.z;
        if (snap) {
            x = Math.round(x / snap) * snap;
            z = Math.round(z / snap) * snap;
        }
        group.current.position.set(x, planeY, z);
        onDrop?.(group.current.position.clone());
    };

    return (
        <group
            ref={group}
            onPointerDown={(e: ThreeEvent<PointerEvent>) => {
                e.stopPropagation();
                (e.target as Element).setPointerCapture?.(e.pointerId);
                setDragging(true);
                if (controls) controls.enabled = false;
                document.body.style.cursor = 'grabbing';
                onDragStart?.();
            }}
            onPointerMove={(e: ThreeEvent<PointerEvent>) => {
                if (!dragging) return;
                e.stopPropagation();
                if (e.ray.intersectPlane(plane, hit)) {
                    apply(hit, true);
                    if (group.current) onDrag?.(group.current.position.clone());
                }
            }}
            onPointerUp={(e: ThreeEvent<PointerEvent>) => {
                if (!dragging) return;
                e.stopPropagation();
                (e.target as Element).releasePointerCapture?.(e.pointerId);
                setDragging(false);
                if (controls) controls.enabled = true;
                document.body.style.cursor = '';
                end();
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
