export type Role = 'worker' | 'saver' | 'entrepreneur' | 'consumer';
export type Mood = 'happy' | 'struggling' | 'unemployed';
export type ViewKind = 'cockpit' | 'triangle' | 'village' | 'capsules' | 'atlas';
export type Phase = 'expansion' | 'boom' | 'bust' | 'recovery';

export interface Agent {
    id: number;
    x: number;
    y: number;
    role: Role;
    stageEmployer: number | null;
    timePreference: number;
    wage: number;
    savings: number;
    consumption: number;
    mood: Mood;
}

export interface ProductionStage {
    id: number;
    name: string;
    order: number;
    laborers: number;
    capital: number;
    output: number;
    price: number;
}

export interface LoanMarket {
    supplied: number;
    demanded: number;
    clearingRate: number;
}

export interface MoneyState {
    M: number;
    cpi: number;
    cpiPrev: number;
    inflation: number;
}

export interface KeyMetrics {
    tick: number;
    cpi: number;
    bnp: number;
    unemployment: number;
    policyRate: number;
    naturalRate: number;
    M: number;
    inflation: number;
    malinvestment: number;
    gini: number;
}

export interface SimState {
    tick: number;
    agents: Agent[];
    stages: ProductionStage[];
    loanMarket: LoanMarket;
    money: MoneyState;
    phase: Phase;
    phaseTicksRemaining: number;
    malinvestment: number;
    history: KeyMetrics[];
}

export interface GodControls {
    policyRate: number;
    moneyGrowth: number;
    taxRate: number;
    publicSpend: number;
    priceCeiling: { enabled: boolean; level: number };
    wageFloor: { enabled: boolean; level: number };
    regulation: number;
    freeMarket: boolean;
}

export interface CapsuleObjective {
    id: string;
    text: string;
    metric: keyof KeyMetrics;
    threshold: number;
    direction: 'below' | 'above';
}

export interface CapsuleBeat {
    atTick: number;
    title: string;
    body: string;
    quote?: { text: string; author: string };
}

export interface Capsule {
    id: string;
    title: string;
    subtitle: string;
    summary: string;
    icon?: string;
    initialControls?: Partial<GodControls>;
    initialState?: Partial<{
        M: number;
        avgTimePreference: number;
        phase: Phase;
    }>;
    objectives?: CapsuleObjective[];
    narrativeBeats?: CapsuleBeat[];
    lockedControls?: (keyof GodControls)[];
    linkedArticles?: string[];
}

export interface QuoteSnippet {
    text: string;
    author: string;
    source?: string;
    tags: string[];
}
