export interface BotTelemetry {
    id: string;
    timestamp: number;
    metrics: {
        totalGold: number;
        avgStamina: number;
        avgLevel: number;
        wealthGini: number;
        activeBots: number;
        castleProgress: Record<string, number>;
    };
    logs: {
        botId: string;
        botName: string;
        action: string;
        reason: string;
        result: string;
        timestamp: number;
    }[];
}

export interface BotFeedbackEntry {
    id: string;
    botId: string;
    botName: string;
    message: string;
    type: 'BALANCE' | 'BUG' | 'META';
    timestamp: number;
    roomYear: number;
}
