import type { GameConfig, DialogNode } from '../types';

// ConfigValidator: kjør mot GameConfig ved konstruksjon. Fanger silent fails før
// spillet starter. Feilnivåer:
//   FATAL    → throw (stopper spillet umiddelbart)
//   CRITICAL → console.error (synlig, men spillet fortsetter)
//   INFO     → console.warn (tips, ikke kritisk)
//
// Tanken: AI-agenter skriver konfig raskt og lett glemmer detaljer. Bedre å få en
// eksplisitt feil med forklaring enn å oppdage problemet timer senere i testing.

export type ValidationLevel = 'fatal' | 'critical' | 'info';

export interface ValidationIssue {
    level: ValidationLevel;
    message: string;
}

function isDialogArray(v: DialogNode | DialogNode[]): v is DialogNode[] {
    return Array.isArray(v);
}

export function validateGameConfig(config: GameConfig): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // ─── FATAL: preset: 'open' uten lights ──────────────────────────────────
    // Dette gjelder kun for gamle spill som bruker preset:'open' direkte.
    // Nye spill bør bruke declarative.buildOutdoor som alltid legger til lys.
    if (config.world?.preset === 'open' && (!config.lights || config.lights.length === 0)) {
        // Hvis spillet har setupScene, kan det legge til lys der - nedgradér til info.
        const hasSetup = !!config.setupScene;
        issues.push({
            level: hasSetup ? 'info' : 'fatal',
            message:
                `[validator] preset: 'open' uten config.lights. ` +
                `Scenen blir svart med mindre setupScene registrerer sol+hemi. ` +
                `Anbefaling: bruk declarative.buildOutdoor som tar en lighting-preset.`,
        });
    }

    // ─── FATAL: dialog-variants uten fallback ───────────────────────────────
    // Variants er en array der første matchende condition brukes. Hvis alle har
    // condition, kan dialog-oppslaget returnere undefined og dialogen stalle.
    for (const [key, entry] of Object.entries(config.dialogs ?? {})) {
        if (isDialogArray(entry) && entry.length > 0) {
            const hasFallback = entry.some((n) => !n.condition);
            if (!hasFallback) {
                issues.push({
                    level: 'fatal',
                    message:
                        `[validator] Dialog '${key}' er en array av varianter uten fallback-node. ` +
                        `Minst én variant må mangle 'condition' for å fungere som fallback, ` +
                        `ellers kan dialogen aldri åpnes hvis ingen condition matcher.`,
                });
            }
        }
    }

    // ─── FATAL: NPC uten characterType ──────────────────────────────────────
    // characterType trenges for å tegne ansikt og kjøre emosjonssystemet.
    const validCharTypes = new Set(['scientist', 'farmer', 'noble', 'monk']);
    for (const char of config.characters ?? []) {
        if (!char.characterType) {
            issues.push({
                level: 'info',
                message:
                    `[validator] Character '${char.id}' mangler characterType. ` +
                    `Emosjonssystem og ansikts-animasjon vil ikke fungere. ` +
                    `Sett characterType til en av: ${[...validCharTypes].join(', ')}.`,
            });
        } else if (!validCharTypes.has(char.characterType)) {
            issues.push({
                level: 'fatal',
                message:
                    `[validator] Character '${char.id}' har ugyldig characterType: '${char.characterType}'. ` +
                    `Gyldige: ${[...validCharTypes].join(', ')}.`,
            });
        }
    }

    // ─── CRITICAL: quest-objectives refererer ugyldig data ───────────────────
    const itemIds = new Set((config.items ?? []).map((i) => i.id));
    const charIds = new Set((config.characters ?? []).map((c) => c.id));
    for (const quest of config.questDefs ?? []) {
        for (const obj of quest.objectives ?? []) {
            const cond = obj.condition;
            if (!cond) continue;
            if (cond.npcTalkedTo && !charIds.has(cond.npcTalkedTo)) {
                issues.push({
                    level: 'critical',
                    message:
                        `[validator] Quest '${quest.id}' objective '${obj.id}' refererer npcTalkedTo '${cond.npcTalkedTo}' som ikke finnes i config.characters.`,
                });
            }
            if (cond.itemCollected && !itemIds.has(cond.itemCollected)) {
                issues.push({
                    level: 'critical',
                    message:
                        `[validator] Quest '${quest.id}' objective '${obj.id}' refererer itemCollected '${cond.itemCollected}' som ikke er i config.items.`,
                });
            }
        }
    }

    // ─── INFO: Fler-NPC-spill uten prefix-konvensjon ────────────────────────
    if ((config.characters?.length ?? 0) > 1 && config.dialogs) {
        const hasGenericIntro = 'intro' in config.dialogs || 'greeting' in config.dialogs;
        const npcIds = (config.characters ?? []).map((c) => c.id);
        const hasAnyPrefixed = npcIds.some((id) => Object.keys(config.dialogs).some((k) => k.startsWith(`${id}_`)));
        if (hasGenericIntro && !hasAnyPrefixed) {
            issues.push({
                level: 'info',
                message:
                    `[validator] Spillet har ${npcIds.length} NPCer, men bruker generisk dialog-id ('intro'/'greeting'). ` +
                    `Konvensjon: bruk '\${npcId}_greeting' per NPC (f.eks. '${npcIds[0]}_greeting'). ` +
                    `Da kan motoren åpne riktig dialog når spilleren trykker E på hver NPC.`,
            });
        }
    }

    return issues;
}

/**
 * Kjør validering og logg alle issues. FATAL-issues samles opp - kalleren avgjør
 * om spillet skal stoppes (throw) eller fortsette.
 */
export function runValidation(config: GameConfig): ValidationIssue[] {
    const issues = validateGameConfig(config);
    for (const issue of issues) {
        if (issue.level === 'fatal') console.error(issue.message);
        else if (issue.level === 'critical') console.error(issue.message);
        else console.warn(issue.message);
    }
    return issues;
}
