// @ts-nocheck
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useGameStore } from '../store';

function Gate({ initialPosition, date, isCorrect, onPass }: { initialPosition: [number, number, number], date: string, isCorrect: boolean, onPass: (hit: boolean, correct: boolean) => void }) {
    const groupRef = useRef<any>(null);
    const [passed, setPassed] = useState(false);
    const { gameState, speed } = useGameStore();
    const initialized = useRef(false);

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        if (!initialized.current) {
            groupRef.current.position.set(...initialPosition);
            initialized.current = true;
        }

        if (gameState !== 'playing') return;

        groupRef.current.position.z += speed * delta;

        // Collision Logic
        if (!passed && groupRef.current.position.z > -0.5 && groupRef.current.position.z < 0.5) {
            const playerX = state.mouse.x * 10;
            const playerY = state.mouse.y * 6;

            const dx = playerX - groupRef.current.position.x;
            const dy = playerY - groupRef.current.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 1.5) { // Radius of gate
                setPassed(true);
                onPass(true, isCorrect);
            }
        }

        // Missed Logic
        if (!passed && groupRef.current.position.z > 2) {
            setPassed(true);
            if (isCorrect) onPass(false, true); // Missed correct one
        }
    });

    if (passed) return null;

    return (
        <group ref={groupRef}>
            {/* The Ring */}
            <mesh rotation={[0, 0, 0]}>
                <torusGeometry args={[1.2, 0.1, 16, 32]} />
                <meshStandardMaterial color={isCorrect ? "#00ff88" : "#ff0055"} emissive={isCorrect ? "#004422" : "#440011"} emissiveIntensity={0.5} />
            </mesh>

            {/* The Label */}
            <Text
                position={[0, 0, 0]}
                fontSize={0.8}
                color="white"
                anchorX="center"
                anchorY="middle"
            >
                {date}
            </Text>
        </group>
    );
}

export function GateManager() {
    const { events, currentEventIndex, nextEvent, addScore, loseLife, gameState } = useGameStore();

    const [activeGroup, setActiveGroup] = useState<{ index: number, z: number, choices: { val: string, correct: boolean, x: number, y: number }[] } | null>(null);

    const currentEvent = events[currentEventIndex];

    useFrame(() => {
        if (gameState !== 'playing') return;

        // Initial spawn
        if (!activeGroup && currentEvent) {
            spawnGates(currentEventIndex, -50); // Spawn 50 units away
        }
    });

    const spawnGates = (index: number, startZ: number) => {
        const evt = events[index];
        if (!evt) return;

        // Generate 3 choices
        const correctYear = evt.year;
        const choices = [
            { val: correctYear.toString(), correct: true, x: 0, y: 0 },
            { val: (correctYear + Math.floor(Math.random() * 50 + 10)).toString(), correct: false, x: 0, y: 0 },
            { val: (correctYear - Math.floor(Math.random() * 50 + 10)).toString(), correct: false, x: 0, y: 0 },
        ];

        // Shuffle and Assign Positions
        const positions = [-4, 0, 4].sort(() => Math.random() - 0.5);

        const finalChoices = choices.map((c, i) => ({
            ...c,
            x: positions[i],
            y: (Math.random() - 0.5) * 4
        }));

        setActiveGroup({
            index,
            z: startZ,
            choices: finalChoices
        });
    };

    const handlePass = (hit: boolean, wasCorrectGate: boolean) => {
        if (hit && wasCorrectGate) {
            addScore(100);
            nextEvent();
            setActiveGroup(null);
        } else if (hit && !wasCorrectGate) {
            loseLife();
            nextEvent();
            setActiveGroup(null);
        } else if (!hit && wasCorrectGate) {
            loseLife();
            nextEvent();
            setActiveGroup(null);
        }
    };

    if (!activeGroup) return null;

    return (
        <>
            {activeGroup.choices.map((choice, i) => (
                <Gate
                    key={activeGroup.index + "-" + i}
                    initialPosition={[choice.x, choice.y, activeGroup.z]}
                    date={choice.val}
                    isCorrect={choice.correct}
                    onPass={handlePass}
                />
            ))}
        </>
    );
}
