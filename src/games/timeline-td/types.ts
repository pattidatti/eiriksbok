export type Position = { x: number; y: number };

export type EnemyType = 'BLACK_DEATH' | 'IGNORANCE' | 'WAR' | 'INFLATION';

export type TowerType = 'GUTENBERG' | 'DA_VINCI' | 'TESLA' | 'NEWTON';

export type Particle = {
    id: string;
    text: string;
    position: Position;
    life: number; // 1.0 to 0.0
    color: string;
};

export type Enemy = {
    id: string;
    type: EnemyType;
    position: Position;
    health: number;
    maxHealth: number;
    speed: number;
    pathIndex: number; // Current index on the waypoint path
    isFrozen: boolean;
    lastHit?: number;
    // Phase 3 Stats
    armor: number; // Reduces damage
    moneyReward: number;
    activeEffects: { type: 'SLOW' | 'STUN'; duration: number; value: number }[];
};

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
