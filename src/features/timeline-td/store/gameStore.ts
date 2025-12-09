import { create } from 'zustand';
import { WAVES } from '../data/gameData';
import type { Enemy, EnemyType, GameStatus, Particle, Position, Projectile, Tower, TowerType } from '../types';
export type { Enemy, EnemyType, GameStatus, Particle, Position, Projectile, Tower, TowerType };

interface GameState {
    // Game Status
    status: GameStatus;
    wave: number;
    lives: number;
    money: number;

    // Entities
    enemies: Enemy[];
    towers: Tower[];
    projectiles: Projectile[];
    particles: Particle[];

    // Wave Management
    waveInProgress: boolean;
    waveComplete: boolean;
    nextWaveAvailable: boolean;
    spawnQueue: { type: EnemyType; time: number; speedMultiplier?: number; hpMultiplier?: number }[];
    waveStartTime: number;

    // Actions
    setStatus: (status: GameStatus) => void;
    setWave: (wave: number) => void;
    updateLives: (amount: number) => void;
    updateMoney: (amount: number) => void;

    startNextWave: () => void;
    updateWaveProgress: (time: number) => void;
    checkWaveStatus: () => void;

    // Entity Actions
    spawnEnemy: (enemy: Enemy) => void;
    removeEnemy: (enemyId: string) => void;
    updateEnemyPosition: (enemyId: string, position: Position, pathIndex: number) => void;
    damageEnemy: (enemyId: string, amount: number) => void;
    applyEffect: (enemyId: string, effect: { type: 'SLOW' | 'STUN', duration: number, value: number }) => void;

    addTower: (tower: Tower) => void;
    updateTower: (towerId: string, updates: Partial<Tower>) => void;

    addProjectile: (projectile: Projectile) => void;
    removeProjectile: (projectileId: string) => void;
    updateProjectile: (projectileId: string, position: Position) => void;

    addParticle: (particle: Particle) => void;
    updateParticles: (dt: number) => void;

    resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
    status: 'IDLE',
    wave: 1,
    lives: 20,
    money: 500,
    enemies: [],
    towers: [],
    projectiles: [],
    particles: [],
    waveInProgress: false,
    waveComplete: false,
    nextWaveAvailable: true,
    spawnQueue: [],
    waveStartTime: 0,

    setStatus: (status) => set({ status }),
    setWave: (wave) => set({ wave }),
    updateLives: (amount) => set((state) => ({ lives: Math.max(0, state.lives + amount) })),
    updateMoney: (amount) => set((state) => ({ money: state.money + amount })),

    spawnEnemy: (enemy) => set((state) => ({ enemies: [...state.enemies, enemy] })),
    removeEnemy: (id) => set((state) => ({ enemies: state.enemies.filter(e => e.id !== id) })),
    updateEnemyPosition: (id, pos, idx) => set((state) => ({
        enemies: state.enemies.map(e => e.id === id ? { ...e, position: pos, pathIndex: idx } : e)
    })),
    applyEffect: (id, effect) => set((state) => ({
        enemies: state.enemies.map(e => {
            if (e.id !== id) return e;
            return { ...e, activeEffects: [...e.activeEffects, effect] };
        })
    })),
    damageEnemy: (id, amount) => set((state) => ({
        enemies: state.enemies.map(e => {
            if (e.id !== id) return e;
            // Armor reduction: simple flat reduction or percentage?
            // Let's do percentage for now: 10 armor = 10% reduction? 
            // Or flat: damage - armor. Let's do flat with clamp.
            const damageTaken = Math.max(1, amount - e.armor);
            return { ...e, health: e.health - damageTaken, lastHit: Date.now() };
        }).filter(e => e.health > 0)
    })),

    addTower: (tower) => set((state) => ({ towers: [...state.towers, tower] })),
    updateTower: (id, updates) => set((state) => ({
        towers: state.towers.map(t => t.id === id ? { ...t, ...updates } : t)
    })),

    addProjectile: (proj) => set((state) => ({ projectiles: [...state.projectiles, proj] })),
    removeProjectile: (id) => set((state) => ({ projectiles: state.projectiles.filter(p => p.id !== id) })),
    updateProjectile: (id, pos) => set((state) => ({
        projectiles: state.projectiles.map(p => p.id === id ? { ...p, position: pos } : p)
    })),

    addParticle: (p) => set((state) => ({ particles: [...state.particles, p] })),

    startNextWave: () => {
        const state = useGameStore.getState();
        if (state.waveInProgress) return;

        const nextWaveId = state.wave;
        const waveData = WAVES.find(w => w.id === nextWaveId);

        if (!waveData) {
            console.log("No more waves");
            return;
        }

        const queue: { type: EnemyType; time: number; speedMultiplier?: number; hpMultiplier?: number }[] = [];
        let timeOffset = 0;

        waveData.enemies.forEach(group => {
            for (let i = 0; i < group.count; i++) {
                queue.push({
                    type: group.type,
                    time: timeOffset + (i * group.interval),
                    speedMultiplier: group.speedMultiplier,
                    hpMultiplier: group.hpMultiplier
                });
            }
            timeOffset += (group.count * group.interval) + 1000;
        });

        queue.sort((a, b) => a.time - b.time);

        set({
            status: 'PLAYING',
            waveInProgress: true,
            waveComplete: false,
            spawnQueue: queue,
            waveStartTime: Date.now()
        });
    },

    updateWaveProgress: (_time: number) => {
        const state = useGameStore.getState();
        if (!state.waveInProgress) return;

        const elapsedTime = Date.now() - state.waveStartTime;
        const remainingQueue = [...state.spawnQueue];
        const toSpawn = remainingQueue.filter(item => item.time <= elapsedTime);

        toSpawn.forEach(item => {
            state.spawnEnemy({
                id: Math.random().toString(),
                type: item.type,
                position: { x: 0, y: 300 }, // Should use path start
                health: 100 * (item.hpMultiplier || 1),
                maxHealth: 100 * (item.hpMultiplier || 1),
                speed: 1 * (item.speedMultiplier || 1),
                pathIndex: 0,
                isFrozen: false,
                armor: 0,
                moneyReward: 10,
                activeEffects: []
            });
        });

        const newQueue = remainingQueue.filter(item => item.time > elapsedTime);

        if (newQueue.length === 0 && state.enemies.length === 0 && toSpawn.length === 0) {
            set({
                waveInProgress: false,
                waveComplete: true,
                spawnQueue: [],
                wave: state.wave + 1
            });
        } else {
            set({ spawnQueue: newQueue });
        }
    },

    checkWaveStatus: () => {
        // Placeholder
    },

    updateParticles: (dt) => set((state) => ({
        particles: state.particles
            .map(p => ({
                ...p,
                life: p.life - dt * 2, // Fade out over 0.5s approx
                position: { x: p.position.x, y: p.position.y - (50 * dt) } // Float up
            }))
            .filter(p => p.life > 0)
    })),

    resetGame: () => set({
        status: 'IDLE',
        wave: 1,
        lives: 20,
        money: 500,
        enemies: [],
        towers: [],
        projectiles: [],
        particles: [],
        waveInProgress: false,
    }),
}));
