import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useGameStore } from '../store';
import { Explosion } from './Explosion';

// ... Gate component stays mostly same but maybe we can improve visuals later

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
                <meshStandardMaterial
                    color={isCorrect ? "#ff0055" : "#ff0055"} // Keep them same color to not give it away, maybe slightly different emissive? User said "Fjern grønn sirkel, alle skal være rød"
                    emissive={isCorrect ? "#440011" : "#440011"}
                    emissiveIntensity={0.5}
                />
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
    const { events, currentEventIndex, nextEvent, addScore, loseLife, gameState, triggerFeedback } = useGameStore();

    const [activeGroup, setActiveGroup] = useState<{ index: number, z: number, choices: { val: string, correct: boolean, x: number, y: number }[] } | null>(null);
    const [explosions, setExplosions] = useState<{ id: number, position: [number, number, number], color: string }[]>([]);

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
            triggerFeedback('correct', [0, 0, 0]); // Position isn't super critical for UI feedback
            setExplosions(prev => [...prev, { id: Date.now(), position: [0, 0, -2], color: '#4ade80' }]); // Green explosion closer to camera
            addScore(100);
            nextEvent();
            setActiveGroup(null);
        } else if (hit && !wasCorrectGate) {
            triggerFeedback('wrong', [0, 0, 0]);
            loseLife();
            nextEvent();
            setActiveGroup(null);
        } else if (!hit && wasCorrectGate) {
            // Missed the correct gate completely
            triggerFeedback('wrong', [0, 0, 0]);
            loseLife();
            nextEvent();
            setActiveGroup(null);
        }
    };

    const removeExplosion = (id: number) => {
        setExplosions(prev => prev.filter(e => e.id !== id));
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

            {explosions.map(ex => (
                <Explosion
                    key={ex.id}
                    position={ex.position}
                    color={ex.color}
                    onComplete={() => removeExplosion(ex.id)}
                />
            ))}
        </>
    );
}
