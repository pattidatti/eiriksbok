import { create } from 'zustand';

// Basic types for the game
export type Position = { x: number; y: number };

export type EnemyType = 'BLACK_DEATH' | 'IGNORANCE' | 'WAR' | 'INFLATION';

export type Enemy = {
    id: string;
    type: EnemyType;
    position: Position;
    health: number;
    maxHealth: number;
    speed: number;
    pathIndex: number; // Current index on the waypoint path
    isFrozen: boolean;
};

export type TowerType = 'GUTENBERG' | 'DA_VINCI' | 'TESLA' | 'NEWTON';

export type Tower = {
    id: string;
    type: TowerType;
    position: Position;
    range: number;
    damage: number;
    cooldown: number;
    lastFired: number;
    level: number;
};

export type Projectile = {
    id: string;
    targetId: string;
    position: Position;
    speed: number;
    damage: number;
    type: TowerType; // Visual style based on source tower
};

export type GameStatus = 'IDLE' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'VICTORY';

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

    // Wave Management
    waveInProgress: boolean;

    // Actions
    setStatus: (status: GameStatus) => void;
    setWave: (wave: number) => void;
    updateLives: (amount: number) => void;
    updateMoney: (amount: number) => void;

    // Entity Actions
    spawnEnemy: (enemy: Enemy) => void;
    removeEnemy: (enemyId: string) => void;
    updateEnemyPosition: (enemyId: string, position: Position, pathIndex: number) => void;
    damageEnemy: (enemyId: string, amount: number) => void;

    addTower: (tower: Tower) => void;

    addProjectile: (projectile: Projectile) => void;
    removeProjectile: (projectileId: string) => void;
    updateProjectile: (projectileId: string, position: Position) => void;

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
    waveInProgress: false,

    setStatus: (status) => set({ status }),
    setWave: (wave) => set({ wave }),
    updateLives: (amount) => set((state) => ({ lives: Math.max(0, state.lives + amount) })),
    updateMoney: (amount) => set((state) => ({ money: state.money + amount })),

    spawnEnemy: (enemy) => set((state) => ({ enemies: [...state.enemies, enemy] })),
    removeEnemy: (id) => set((state) => ({ enemies: state.enemies.filter(e => e.id !== id) })),
    updateEnemyPosition: (id, pos, idx) => set((state) => ({
        enemies: state.enemies.map(e => e.id === id ? { ...e, position: pos, pathIndex: idx } : e)
    })),
    damageEnemy: (id, amount) => set((state) => ({
        enemies: state.enemies.map(e => {
            if (e.id !== id) return e;
            return { ...e, health: e.health - amount };
        }).filter(e => e.health > 0) // Auto-remove dead enemies for now, might want to animate death first later
    })),

    addTower: (tower) => set((state) => ({ towers: [...state.towers, tower] })),

    addProjectile: (proj) => set((state) => ({ projectiles: [...state.projectiles, proj] })),
    removeProjectile: (id) => set((state) => ({ projectiles: state.projectiles.filter(p => p.id !== id) })),
    updateProjectile: (id, pos) => set((state) => ({
        projectiles: state.projectiles.map(p => p.id === id ? { ...p, position: pos } : p)
    })),

    resetGame: () => set({
        status: 'IDLE',
        wave: 1,
        lives: 20,
        money: 500,
        enemies: [],
        towers: [],
        projectiles: [],
        waveInProgress: false,
    }),
}));
