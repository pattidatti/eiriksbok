import type { GameEngineRef, CharacterConfig, MonologNode, MonologTrigger } from '../../types';
import type { AddNPCConfig, AddMonologConfig, Vec3 } from '../types';

// Character-type-preset-farger. AI trenger ikke oppgi colors eksplisitt.
const DEFAULT_COLORS: Record<AddNPCConfig['characterType'], { body: number; head: number; legs: number }> = {
    scientist: { body: 0x3a4850, head: 0xe8c9a0, legs: 0x2a3038 },
    farmer:    { body: 0x8a5a3a, head: 0xd8a878, legs: 0x4a3020 },
    noble:     { body: 0x7a2240, head: 0xe8c9a0, legs: 0x3a1020 },
    monk:      { body: 0x6a5a48, head: 0xd8b898, legs: 0x3a3028 },
};

/**
 * Legg til en NPC i spillet fra setupScene. Krever at motoren eksponerer addCharacter
 * og registerDialogs (Fase 2 engine-utvidelser). Dialog-nøklene registreres automatisk.
 *
 * Konvensjon: for fler-NPC-spill skal dialog-IDer være `${npcId}_greeting`, `${npcId}_progress`
 * osv. Motoren vet å åpne `${npcId}_greeting` automatisk ved E-trykk på NPCen.
 */
export function addNPC(
    engine: GameEngineRef,
    config: AddNPCConfig
): void {
    // Validér characterType
    const validTypes = ['scientist', 'farmer', 'noble', 'monk'];
    if (!validTypes.includes(config.characterType)) {
        throw new Error(
            `[addNPC] Ugyldig characterType: '${config.characterType}'. Gyldige: ${validTypes.join(', ')}.`
        );
    }

    const defaults = DEFAULT_COLORS[config.characterType];
    const colors = {
        body: config.colors?.body ?? defaults.body,
        head: config.colors?.head ?? defaults.head,
        legs: config.colors?.legs ?? defaults.legs,
    };

    const charCfg: CharacterConfig = {
        id: config.id,
        name: config.name,
        position: config.pos,
        colors,
        characterType: config.characterType,
        defaultEmotion: config.emotion,
        marker: config.questMarker,
        showName: config.talkable !== false,
    };

    // Engine-utvidelse: dynamisk NPC-tillegg
    engine.addCharacter(charCfg);

    // Merge dialogs i config.dialogs
    if (config.dialogs) {
        engine.registerDialogs(config.dialogs);
    }
}

/**
 * Legg til en monolog med trigger. Trigger-typer: proximity (spilleren går inn i radius),
 * onPhase (fase bytter), onFlag (flagg settes truthy), manual (kun via engine.playMonolog).
 */
export function addMonolog(
    engine: GameEngineRef,
    config: AddMonologConfig
): void {
    const node: MonologNode = {
        id: config.id,
        lines: config.lines,
        lineDurationMs: config.lineDurationMs,
        once: config.once ?? true,
    };
    engine.registerMonolog(node);

    if (config.trigger.type === 'proximity') {
        const [x, , z] = config.trigger.pos as Vec3;
        const r = config.trigger.radius ?? 2.0;
        const trigger: MonologTrigger = {
            id: `${config.id}_trigger`,
            monologId: config.id,
            area: { minX: x - r, maxX: x + r, minZ: z - r, maxZ: z + r },
            requiresPhase: config.trigger.requiresPhase,
        };
        engine.registerMonologTrigger(trigger);
    } else if (config.trigger.type === 'onPhase') {
        const targetPhase = config.trigger.phase;
        let fired = false;
        engine.registerUpdate(() => {
            if (fired) return;
            if (engine.getPhase() === targetPhase) {
                fired = true;
                engine.playMonolog(config.id);
            }
        });
    } else if (config.trigger.type === 'onFlag') {
        const flag = config.trigger.flag;
        let fired = false;
        engine.registerUpdate(() => {
            if (fired) return;
            if (engine.getFlag(flag)) {
                fired = true;
                engine.playMonolog(config.id);
            }
        });
    }
    // 'manual' - gjør ingenting, kun engine.playMonolog(id) trigger den
}
