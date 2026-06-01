import type * as THREE from 'three';

// Eksponentiell demping mot et mål - fyndamentet for myke 3D-overganger uten
// fysikkmotor. Kall i en useFrame med dt fra R3F. `speed` er hvor raskt verdien
// trekkes mot målet (2-4 = snappy, 0.4-0.8 = rolig glid).
//
// Mønster: led hele scenen av én tilstandsvariabel (stage/verdi) og demp hvert
// delobjekt mot et mål utledet av den. Da animerer alt seg når tilstanden endres.
//
//   useFrame((_, dt) => {
//       mesh.position.y = damp(mesh.position.y, open ? 2 : 0, dt, 3);
//   });
export function damp(cur: number, target: number, dt: number, speed: number): number {
    return cur + (target - cur) * Math.min(1, dt * speed);
}

// Samme demping, men for en hel Vector3 (muteres in-place og returneres).
export function dampV3(
    cur: THREE.Vector3,
    target: THREE.Vector3,
    dt: number,
    speed: number
): THREE.Vector3 {
    const t = Math.min(1, dt * speed);
    cur.x += (target.x - cur.x) * t;
    cur.y += (target.y - cur.y) * t;
    cur.z += (target.z - cur.z) * t;
    return cur;
}
