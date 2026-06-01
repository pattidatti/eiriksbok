import { useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { dampV3 } from './damp';

// Cinematisk kamera-styring. Mens `active` glir kameraet mykt mot `to` og ser mot
// `lookAt` - perfekt for en innflyvning i starten eller et fokus-pull mot et
// objekt. Kall onArrive når det er framme.
//
// Anbefalt innflyvnings-mønster (unngår å sloss med OrbitControls):
//   const [introDone, setIntroDone] = useState(false);
//   <MicroGameScaffold canvas={{ controls: introDone, camera: { position: FAR_START } }}
//       scene={<><CameraRig to={REST_POS} lookAt={[0,0.8,0]} active={!introDone}
//                  onArrive={() => setIntroDone(true)} /> <Scene/></>} />
// Under innflyvningen er OrbitControls av; når kameraet er framme slås det på i
// hvileposisjonen.
interface CameraRigProps {
    to: [number, number, number];
    lookAt?: [number, number, number];
    active?: boolean;
    speed?: number;
    arriveDist?: number;
    onArrive?: () => void;
}

export function CameraRig({
    to,
    lookAt = [0, 0, 0],
    active = true,
    speed = 1.6,
    arriveDist = 0.2,
    onArrive,
}: CameraRigProps) {
    const camera = useThree((s) => s.camera);
    const toVec = useRef(new THREE.Vector3());
    const lookVec = useRef(new THREE.Vector3());
    const arrived = useRef(false);

    useFrame((_, dt) => {
        if (!active) {
            arrived.current = false;
            return;
        }
        toVec.current.set(to[0], to[1], to[2]);
        lookVec.current.set(lookAt[0], lookAt[1], lookAt[2]);
        dampV3(camera.position, toVec.current, dt, speed);
        camera.lookAt(lookVec.current);
        if (!arrived.current && camera.position.distanceTo(toVec.current) < arriveDist) {
            arrived.current = true;
            onArrive?.();
        }
    });

    return null;
}
