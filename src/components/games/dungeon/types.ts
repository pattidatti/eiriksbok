export interface HeroStats {
    maxHp: number;
    currentHp: number;
    xp: number;
    level: number; // 1-10?
    mana: number;
    maxMana: number;
}

export interface Monster {
    id: string;
    name: string;
    emoji: string;
    maxHp: number;
    currentHp: number;
    damage: number;
    xpReward: number;
    level: number;
}

export type CombatAction = 'SWORD' | 'BOW' | 'MAGIC';

export interface DungeonState {
    hero: HeroStats;
    currentMonster: Monster | null;
    monstersDefeated: number;
    isGameOver: boolean;
    stage: 'SELECT' | 'COMBAT' | 'REWARD' | 'GAMEOVER';
}
