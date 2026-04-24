import type { GameConfig, DialogNode } from '../types';

// ConfigValidator: kjør mot GameConfig ved konstruksjon. Fanger silent fails før
// spillet starter. Feilnivåer:
//   FATAL    → throw (stopper spillet umiddelbart)
//   CRITICAL → console.error (synlig, men spillet fortsetter)
//   INFO     → console.warn (tips, ikke kritisk)
//
// Tanken: AI-agenter skriver konfig raskt og lett glemmer detaljer. Bedre å få en
// eksplisitt feil med forklaring enn å oppdage problemet timer senere i testing.
//
// Realistisk avgrensning: mye av scene-oppbygging (addDoor, addNPC, setFlag) skjer
// inne i setupScene-callback eller i dialog-action-funksjoner. Disse kan vi IKKE
// introspeksjonere statisk. Derfor dekker validatoren kun det som er deklarativt
// synlig i selve GameConfig-objektet. Fallgruver som kun er synlige i kode-bodies
// (f.eks. dør med openFlag som aldri settes i noen action) må fanges av playtest
// eller code review.

export type ValidationLevel = 'fatal' | 'critical' | 'info';

export interface ValidationIssue {
    level: ValidationLevel;
    message: string;
}

function isDialogArray(v: DialogNode | DialogNode[]): v is DialogNode[] {
    return Array.isArray(v);
}

// Samle alle dialog-noder (enkelt eller array) i en flat liste.
function allDialogNodes(config: GameConfig): DialogNode[] {
    const out: DialogNode[] = [];
    for (const entry of Object.values(config.dialogs ?? {})) {
        if (isDialogArray(entry)) out.push(...entry);
        else out.push(entry);
    }
    return out;
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

    // ─── FATAL: duplikate IDer ──────────────────────────────────────────────
    // Duplikate IDer gir non-deterministisk oppslag (Record overskriver sist-vinner).
    const charIdCounts = new Map<string, number>();
    for (const c of config.characters ?? []) {
        charIdCounts.set(c.id, (charIdCounts.get(c.id) ?? 0) + 1);
    }
    for (const [id, count] of charIdCounts) {
        if (count > 1) {
            issues.push({
                level: 'fatal',
                message: `[validator] Character-ID '${id}' er duplikat (${count}x). IDer må være unike.`,
            });
        }
    }
    const itemIdCounts = new Map<string, number>();
    for (const i of config.items ?? []) {
        itemIdCounts.set(i.id, (itemIdCounts.get(i.id) ?? 0) + 1);
    }
    for (const [id, count] of itemIdCounts) {
        if (count > 1) {
            issues.push({
                level: 'fatal',
                message: `[validator] Item-ID '${id}' er duplikat (${count}x). IDer må være unike.`,
            });
        }
    }
    const questIdCounts = new Map<string, number>();
    for (const q of config.questDefs ?? []) {
        questIdCounts.set(q.id, (questIdCounts.get(q.id) ?? 0) + 1);
    }
    for (const [id, count] of questIdCounts) {
        if (count > 1) {
            issues.push({
                level: 'fatal',
                message: `[validator] Quest-ID '${id}' er duplikat (${count}x). IDer må være unike.`,
            });
        }
    }

    // ─── CRITICAL: quest-objectives refererer ugyldig data ───────────────────
    const itemIds = new Set((config.items ?? []).map((i) => i.id));
    const charIds = new Set((config.characters ?? []).map((c) => c.id));
    const questIds = new Set((config.questDefs ?? []).map((q) => q.id));
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
        // Prerequisites må peke på eksisterende quests.
        for (const pre of quest.prerequisites ?? []) {
            if (!questIds.has(pre)) {
                issues.push({
                    level: 'fatal',
                    message:
                        `[validator] Quest '${quest.id}' har prerequisite '${pre}' som ikke finnes i questDefs. ` +
                        `Quest vil være permanent låst.`,
                });
            }
        }
    }

    // ─── CRITICAL: route/behavior/detection refererer ukjent character ──────
    for (const route of config.npcRoutes ?? []) {
        if (!charIds.has(route.characterId)) {
            issues.push({
                level: 'critical',
                message: `[validator] npcRoutes refererer characterId '${route.characterId}' som ikke finnes i config.characters.`,
            });
        }
    }
    for (const beh of config.npcBehaviors ?? []) {
        if (!charIds.has(beh.characterId)) {
            issues.push({
                level: 'critical',
                message: `[validator] npcBehaviors refererer characterId '${beh.characterId}' som ikke finnes i config.characters.`,
            });
        }
    }
    for (const guard of config.detection?.guards ?? []) {
        if (!charIds.has(guard.characterId)) {
            issues.push({
                level: 'critical',
                message: `[validator] detection.guards refererer characterId '${guard.characterId}' som ikke finnes i config.characters.`,
            });
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

    // ─── CRITICAL: spawn utenfor rom / kamera bak vegg ──────────────────────
    // Kan kun sjekke når roomSize er satt og preset ikke er 'open' (utendørs).
    // Tredjeperson-kameraet følger ~3m bak spilleren på +Z-aksen (default).
    // Hvis startPosition[2] + 3 ≥ roomSize/2, havner kameraet utenfor sørveggen.
    const roomSize = config.world?.roomSize;
    const isIndoor = config.world?.preset && config.world.preset !== 'open';
    const start = config.player?.startPosition;
    if (isIndoor && typeof roomSize === 'number' && start) {
        const half = roomSize / 2;
        const [sx, , sz] = start;
        // Sjekk at spilleren er innenfor rom-grensene med 0.5m margin.
        const outX = Math.abs(sx) > half - 0.5;
        const outZ = Math.abs(sz) > half - 0.5;
        if (outX || outZ) {
            issues.push({
                level: 'critical',
                message:
                    `[validator] player.startPosition [${sx}, *, ${sz}] er utenfor rom-grensene ` +
                    `(roomSize=${roomSize}, gyldig intervall: ±${half - 0.5}). ` +
                    `Spilleren vil spawne i eller gjennom en vegg.`,
            });
        } else {
            // Kamera-sanity: default tredjepersons-kamera er ved z = player.z + 3.
            // Sørvegg er ved z = +roomSize/2. Trenger margin for at kameraet ikke
            // skal havne bak veggen - 2m clearance er Pre-Flight Checklist-kravet.
            if (sz + 3 > half - 1) {
                issues.push({
                    level: 'critical',
                    message:
                        `[validator] player.startPosition.z=${sz} er for nær sørveggen (z=${half}). ` +
                        `Tredjeperson-kameraet følger ~3m bak spilleren og vil havne utenfor rommet → scenen blir usynlig. ` +
                        `Flytt spilleren til minst z ≤ ${half - 4} (Pre-Flight Checklist §2).`,
                });
            }
        }
    }

    // Merknad: manglende `config.learningGoals` sjekkes IKKE her. Vi vil ikke
    // at validatoren skal logge én advarsel per spill-oppstart bare fordi
    // retro-dokumentasjon ikke er ferdig. Blueprint-kravet håndheves av
    // BUILD_GAME_GUIDE §7 Quality Gates før shipping, ikke av runtime-validator.

    // ─── INFO: deklarativ flagg-konsistens ──────────────────────────────────
    // Begrensning: vi kan IKKE se flagg satt i callback-funksjoner (dialog-
    // actions, setupScene, onPickup osv.). Derfor er falske positiver sannsynlig.
    // Denne sjekken holder seg til hva som er synlig i selve config-objektet.
    const flagsReferenced = new Set<string>();
    const flagsSetDeclaratively = new Set<string>();

    // Les dialog-conditions
    for (const node of allDialogNodes(config)) {
        for (const f of node.condition?.flagsRequired ?? []) flagsReferenced.add(f);
        for (const f of node.condition?.flagsExcluded ?? []) flagsReferenced.add(f);
    }
    // Quest-conditions og reward-flags
    for (const q of config.questDefs ?? []) {
        for (const obj of q.objectives ?? []) {
            if (obj.condition?.flag) flagsReferenced.add(obj.condition.flag);
        }
        for (const f of q.rewardFlags ?? []) flagsSetDeclaratively.add(f);
    }
    // Audio triggers
    for (const t of config.audio?.tracks ?? []) {
        const trig = t.trigger;
        if (typeof trig === 'object' && 'flag' in trig) flagsReferenced.add(trig.flag);
    }
    // NPC-behavior setFlag
    for (const b of config.npcBehaviors ?? []) {
        if (b.playerReaction?.setFlag) flagsSetDeclaratively.add(b.playerReaction.setFlag);
    }
    // Detection detectedFlag
    for (const g of config.detection?.guards ?? []) {
        if (g.detectedFlag) flagsSetDeclaratively.add(g.detectedFlag);
    }

    // Hengende flagg: satt deklarativt men aldri lest deklarativt.
    for (const f of flagsSetDeclaratively) {
        if (!flagsReferenced.has(f)) {
            issues.push({
                level: 'info',
                message:
                    `[validator] Flagg '${f}' settes deklarativt (quest-reward, npcBehavior eller detection) ` +
                    `men leses aldri deklarativt. Det KAN leses av dialog-action eller setupScene-kode - ` +
                    `ignorer denne hvis det stemmer. Ellers: fjern flagget eller legg til en bruker.`,
            });
        }
    }
    // Urørlige flagg: kreves deklarativt men aldri satt deklarativt. Høyere
    // risiko for falske positiver (flagg settes ofte i dialog-actions), så INFO.
    for (const f of flagsReferenced) {
        if (!flagsSetDeclaratively.has(f)) {
            issues.push({
                level: 'info',
                message:
                    `[validator] Flagg '${f}' kreves av en dialog-condition eller quest-objective, ` +
                    `men settes ikke deklarativt. Sjekk at minst én dialog-action eller setupScene-callback ` +
                    `kaller engine.setFlag('${f}', ...) - ellers vil condition aldri matche.`,
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
