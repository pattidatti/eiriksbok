import * as THREE from 'three';
import type { GameEngineRef, DialogNode } from '../engine/types';
import { buildRoom, addProp, addNPC, addMonolog, addInteractable, addDoor } from '../engine/declarative';
import { laererDialogs, faglarerDialogs, sensorDialogs } from './EksamenSamfunnsfagDialogs';
import { FLAGS } from './EksamenSamfunnsfagFlags';

// Tre soner i ett langt rom (positiv Z = sør, mot spilleren):
//   Sone A  (z  2.5 .. 10)  Klasserom    - DEL 1: trekk faget
//   [dør låst til FAG_TRUKKET, ved z = 2.5]
//   Sone B  (z -8 .. 2.5)   Forberedelse - DEL 2: trekk oppgaven og forbered deg
//   [dør låst til HAR_MANUS, ved z = -8]
//   Sone C  (z -22 .. -8)   Eksamensrom  - DEL 3: framfør for sensor

const PARTITION_AB_Z = 2.5;
const PARTITION_BC_Z = -8;
const WALL_COLOR = 0xe6ddcd;

export function setupEksamenSamfunnsfagScene(engine: GameEngineRef): void {
    // ═══════════════════════════════════════════════════════════════════════
    // YTTERSKALL (ett langt rom, delt i tre soner med skillevegger)
    // ═══════════════════════════════════════════════════════════════════════
    buildRoom(engine, {
        id: 'skolebygg',
        center: [0, -6],
        size: [12, 4, 32],
        floor: 'wood',
        walls: 'plaster',
        ceiling: 'plaster',
        lights: 'warm-interior',
        windows: [
            { wall: 'east', offset: 5, width: 2.2, height: 1.6 },
            { wall: 'east', offset: -13, width: 2.2, height: 1.6 },
            { wall: 'west', offset: -4, width: 2.2, height: 1.6 },
        ],
    });

    // Lyst, projektor-vennlig lys (warm-interior alene blir for mørkt i et så stort rom).
    const hemi = new THREE.HemisphereLight(0xfff6e8, 0xb8a890, 1.4);
    hemi.position.set(0, 4, -6);
    engine.scene.add(hemi);
    const daylight = new THREE.DirectionalLight(0xfff2dc, 1.2);
    daylight.position.set(8, 7, 4);
    daylight.target.position.set(0, 1, -8);
    daylight.castShadow = true;
    engine.scene.add(daylight);
    engine.scene.add(daylight.target);
    // Mykt taklys per sone defineres som config.lights (engine-styrt).

    // ═══════════════════════════════════════════════════════════════════════
    // SKILLEVEGGER + LÅSTE DØRER
    // ═══════════════════════════════════════════════════════════════════════
    buildPartition(engine, 'vegg-ab', PARTITION_AB_Z);
    buildPartition(engine, 'vegg-bc', PARTITION_BC_Z);

    addDoor(engine, {
        id: 'dor-til-forberedelse',
        pos: [0, 0, PARTITION_AB_Z],
        size: [1.8, 2.4, 0.18],
        material: 'wood',
        lockedUntilFlag: FLAGS.FAG_TRUKKET,
        onLockedAttempt: () => engine.playMonolog('m_laast_fag'),
    });
    addDoor(engine, {
        id: 'dor-til-eksamen',
        pos: [0, 0, PARTITION_BC_Z],
        size: [1.8, 2.4, 0.18],
        material: 'wood',
        lockedUntilFlag: FLAGS.HAR_MANUS,
        onLockedAttempt: () => engine.playMonolog('m_laast_manus'),
    });

    // ═══════════════════════════════════════════════════════════════════════
    // SONE A - KLASSEROM (DEL 1: trekk faget)
    // ═══════════════════════════════════════════════════════════════════════
    addProp(engine, { id: 'a-kateter', model: 'lectern', pos: [1.6, 0, 3.6], rot: [0, Math.PI, 0], solid: true });
    for (let i = 0; i < 4; i++) {
        addProp(engine, { id: `a-pult-${i}`, model: 'table', pos: [-3.8 + (i % 2) * 2.4, 0, 6 + Math.floor(i / 2) * 1.6], solid: true });
    }

    addNPC(engine, {
        id: 'laerer',
        name: 'Læreren',
        characterType: 'noble',
        pos: [-1.2, 0, 3.8],
        colors: { body: 0x6a4a7a, head: 0xe8c9a0, legs: 0x3a2a4a },
        emotion: 'glad',
        questMarker: true,
        dialogs: laererDialogs,
    });

    // ═══════════════════════════════════════════════════════════════════════
    // SONE B - FORBEREDELSESROM (DEL 2: trekk oppgave + forbered)
    // ═══════════════════════════════════════════════════════════════════════
    // Oppgavearket (trekk/les oppgaven)
    addInteractable(engine, {
        id: 'b-oppgave',
        model: 'lectern',
        pos: [0, 0, 1.2],
        prompt: 'Les oppgaven (E)',
        onInteract: () => {
            if (engine.getFlag(FLAGS.OPPGAVE_TRUKKET)) {
                engine.playMonolog('m_oppgave');
                return;
            }
            engine.setFlag(FLAGS.OPPGAVE_TRUKKET, true);
            engine.playMonolog('m_oppgave');
        },
    });

    // Forberedelsesstasjoner (valgfrie, men avgjør hvor sterk framføringen blir)
    prepStation(engine, {
        id: 'b-kilder', model: 'chest', pos: [-4, 0, -1],
        prompt: 'Finn egne kilder (E)', flag: FLAGS.HAR_KILDER, doneMonolog: 'm_kilder',
    });
    prepStation(engine, {
        id: 'b-problemstilling', model: 'lectern', pos: [4, 0, -1],
        prompt: 'Skriv en problemstilling (E)', flag: FLAGS.HAR_PROBLEMSTILLING, doneMonolog: 'm_problemstilling',
    });
    prepStation(engine, {
        id: 'b-sammenligning', model: 'lectern', pos: [-4, 0, -5],
        prompt: 'Lag sammenligningen Roma/Weimar (E)', flag: FLAGS.HAR_SAMMENLIGNING, doneMonolog: 'm_sammenligning',
    });
    // Manus åpner døra til eksamen - krever at oppgaven er lest først.
    addInteractable(engine, {
        id: 'b-manus',
        model: 'table',
        pos: [4, 0, -5],
        prompt: 'Skriv og øv på manus (E)',
        onInteract: () => {
            if (engine.getFlag(FLAGS.HAR_MANUS)) {
                engine.playMonolog('m_manus');
                return;
            }
            if (!engine.getFlag(FLAGS.OPPGAVE_TRUKKET)) {
                engine.playMonolog('m_les_oppgave_forst');
                return;
            }
            engine.setFlag(FLAGS.HAR_MANUS, true);
            engine.setPhase('framfore');
            engine.setCharacterMarkerVisible('faglarer', true);
            engine.playMonolog('m_manus');
        },
    });

    // ═══════════════════════════════════════════════════════════════════════
    // SONE C - EKSAMENSROM (DEL 3: framfør)
    // ═══════════════════════════════════════════════════════════════════════
    addProp(engine, { id: 'c-sensorbord', model: 'table', pos: [0, 0, -19], solid: true });
    addProp(engine, { id: 'c-vannglass', model: 'cup', pos: [0.5, 0.9, -19], solid: false });
    addProp(engine, { id: 'c-stol-faglarer', model: 'chair', pos: [-1.3, 0, -20.2], rot: [0, Math.PI, 0], solid: true });
    addProp(engine, { id: 'c-stol-sensor', model: 'chair', pos: [1.3, 0, -20.2], rot: [0, Math.PI, 0], solid: true });
    addProp(engine, { id: 'c-kateter', model: 'lectern', pos: [0, 0, -16], rot: [0, Math.PI, 0], solid: true });
    addProp(engine, {
        id: 'c-tavle',
        model: { primitive: 'box', size: [3.2, 1.4, 0.08], color: 0x2f4a3a },
        pos: [0, 2.1, -21.9],
        solid: false,
    });
    for (let i = 0; i < 3; i++) {
        addProp(engine, { id: `c-pult-${i}`, model: 'table', pos: [-4.2, 0, -11 - i * 1.6], solid: true });
    }

    addNPC(engine, {
        id: 'faglarer',
        name: 'Faglærer Berg',
        characterType: 'noble',
        pos: [-1.3, 0, -19.7],
        colors: { body: 0x3a5a4a, head: 0xe8c9a0, legs: 0x2a3a30 },
        emotion: 'glad',
        questMarker: false,
        dialogs: faglarerDialogs,
    });
    addNPC(engine, {
        id: 'sensor',
        name: 'Sensor',
        characterType: 'scientist',
        pos: [1.3, 0, -19.7],
        colors: { body: 0x3a4850, head: 0xe8c9a0, legs: 0x2a3038 },
        emotion: 'worried',
        questMarker: false,
        dialogs: sensorDialogs,
    });

    // ═══════════════════════════════════════════════════════════════════════
    // MONOLOGER
    // ═══════════════════════════════════════════════════════════════════════
    registerMonolog(engine, 'eks_nerver', [
        'Det er eksamensdag. Hjertet hamrer.',
        'Læreren venter framme i klasserommet. Gå bort og trekk faget ditt.',
    ]);
    registerMonolog(engine, 'm_oppgave', [
        'Oppgaven: "Sammenlign to historiske eksempler på at et folkestyre ble til ettmannsstyre.',
        'Bruk egne kilder, drøft hvorfor det skjedde, og ta stilling til om det kunne vært unngått."',
        'Du tenker: Roma som ble keiserdømme under Augustus, og Weimar som ble diktatur under Hitler.',
    ]);
    registerMonolog(engine, 'm_kilder', [
        'Du graver fram egne kilder: Augustus sin egen Res Gestae, og et Goebbels-sitat fra 1928 om å bruke demokratiet mot seg selv.',
    ]);
    registerMonolog(engine, 'm_problemstilling', [
        'Du spisser temaet til en problemstilling: "Hvordan kan et folkestyre ende som ettmannsstyre - og skjer det innenfra?"',
    ]);
    registerMonolog(engine, 'm_sammenligning', [
        'Du setter opp Roma og Weimar i en tabell: republikk, krise, lovlig maktovertakelse, folkets samtykke. Punkt for punkt.',
    ]);
    registerMonolog(engine, 'm_manus', [
        'Manuset sitter, og du har øvd på å snakke fritt. Døra til eksamensrommet er åpen når du er klar.',
    ]);
    registerMonolog(engine, 'm_les_oppgave_forst', [
        'Du bør lese oppgaven før du skriver manus. Den ligger ved inngangen til forberedelsesrommet.',
    ]);
    registerMonolog(engine, 'm_laast_fag', [
        'Døra er låst. Du må trekke faget hos læreren først.',
    ]);
    registerMonolog(engine, 'm_laast_manus', [
        'Døra til eksamensrommet er låst. Du må iallfall ha skrevet et manus før du går inn.',
    ]);

    // ═══════════════════════════════════════════════════════════════════════
    // DIALOG-WIRING (flagg via choice.action, fase via node.onEnd)
    // ═══════════════════════════════════════════════════════════════════════
    const dialogs = engine.config.dialogs;

    // DEL 1: trekk fag -> åpne for forberedelse
    wireDialogEnd(dialogs, 'laerer_trekk', () => {
        engine.setFlag(FLAGS.FAG_TRUKKET, true);
        engine.setPhase('trekke-oppgave');
        engine.setCharacterMarkerVisible('laerer', false);
    });

    // DEL 3: presentasjonen. Noen grep krever forberedelse (sjekker prep-flagg).
    wireChoice(dialogs, 'pres_apning', 0, 0, () => {
        engine.setFlag(FLAGS.LESTE_MANUS, true);
        engine.setEmotion('sensor', 'worried');
    });
    wireChoice(dialogs, 'pres_apning', 0, 1, () => {
        if (engine.getFlag(FLAGS.HAR_PROBLEMSTILLING)) {
            engine.setFlag(FLAGS.APNET_TESE, true);
            engine.setEmotion('faglarer', 'glad');
        }
    });
    wireChoice(dialogs, 'pres_apning', 0, 2, () => engine.setFlag(FLAGS.BRUKTE_PATOS, true));

    wireChoice(dialogs, 'pres_innhold', 0, 1, () => {
        if (engine.getFlag(FLAGS.HAR_SAMMENLIGNING)) {
            engine.setFlag(FLAGS.BRUKTE_SAMMENLIGNING, true);
            engine.setEmotion('faglarer', 'glad');
        }
    });

    wireChoice(dialogs, 'pres_kjerne', 0, 0, () => engine.setEmotion('sensor', 'worried'));
    wireChoice(dialogs, 'pres_kjerne', 0, 1, () => {
        engine.setFlag(FLAGS.LOVLIG_MAKT, true);
        engine.setEmotion('sensor', 'surprised');
    });

    wireChoice(dialogs, 'pres_virkemiddel', 0, 0, () => {
        if (engine.getFlag(FLAGS.HAR_KILDER)) {
            engine.setFlag(FLAGS.BRUKTE_LOGOS, true);
            engine.setFlag(FLAGS.VISTE_KILDER, true);
        }
    });
    wireChoice(dialogs, 'pres_virkemiddel', 0, 1, () => engine.setFlag(FLAGS.BRUKTE_PATOS, true));
    wireChoice(dialogs, 'pres_virkemiddel', 0, 2, () => engine.setFlag(FLAGS.BRUKTE_ETOS, true));

    wireDialogEnd(dialogs, 'pres_avslutning', () => {
        engine.setFlag(FLAGS.PRESENTASJON_FERDIG, true);
        engine.setCharacterMarkerVisible('faglarer', false);
        engine.setCharacterMarkerVisible('sensor', true);
    });

    // DEL 3: fagsamtalen
    wireChoice(dialogs, 'sensor_q1', 0, 0, () => { engine.setFlag(FLAGS.Q1_RIKTIG, true); engine.setEmotion('sensor', 'glad'); });
    wireChoice(dialogs, 'sensor_q1', 0, 1, () => engine.setEmotion('sensor', 'worried'));
    wireChoice(dialogs, 'sensor_q2', 0, 0, () => { engine.setFlag(FLAGS.Q2_RIKTIG, true); engine.setEmotion('sensor', 'glad'); });
    wireChoice(dialogs, 'sensor_q2', 0, 1, () => engine.setEmotion('sensor', 'worried'));
    wireChoice(dialogs, 'sensor_q3', 0, 0, () => { engine.setFlag(FLAGS.Q3_RIKTIG, true); engine.setEmotion('sensor', 'glad'); });
    wireChoice(dialogs, 'sensor_q3', 0, 1, () => engine.setEmotion('sensor', 'worried'));
    wireChoice(dialogs, 'sensor_q4', 0, 0, () => { engine.setFlag(FLAGS.Q4_RIKTIG, true); engine.setEmotion('sensor', 'glad'); });
    wireChoice(dialogs, 'sensor_q4', 0, 1, () => engine.setEmotion('sensor', 'worried'));

    wireDialogEnd(dialogs, 'sensor_avslutning', () => engine.setFlag(FLAGS.FAGSAMTALE_FERDIG, true));

    // ═══════════════════════════════════════════════════════════════════════
    // AVSLUTNING + START
    // ═══════════════════════════════════════════════════════════════════════
    let endScheduled = false;
    engine.registerUpdate(() => {
        if (!endScheduled && engine.getFlag<boolean>(FLAGS.FAGSAMTALE_FERDIG)) {
            endScheduled = true;
            engine.schedule(() => engine.triggerEnd(), 1200);
        }
    });

    engine.setPhase('trekke-fag');
    engine.schedule(() => engine.playMonolog('eks_nerver'), 1400);
}

// ─── Bygge-hjelpere ───────────────────────────────────────────────────────────

// Skillevegg tvers over rommet (bredde 12) med en 1.8m åpning i midten for en dør.
function buildPartition(engine: GameEngineRef, idPrefix: string, z: number): void {
    const gap = 1.8;
    const segWidth = (12 - gap) / 2; // 5.1
    const segCenter = gap / 2 + segWidth / 2; // 3.45
    for (const side of [-1, 1] as const) {
        addProp(engine, {
            id: `${idPrefix}-${side > 0 ? 'h' : 'v'}`,
            model: { primitive: 'box', size: [segWidth, 4, 0.3], color: WALL_COLOR },
            pos: [side * segCenter, 2, z],
            solid: true,
        });
    }
    // Overligger over døråpningen (fyller hullet over 2.4m-døra).
    addProp(engine, {
        id: `${idPrefix}-overligger`,
        model: { primitive: 'box', size: [gap, 1.2, 0.3], color: WALL_COLOR },
        pos: [0, 3.4, z],
        solid: true,
    });
}

// Idempotent forberedelsesstasjon: setter flagget første gang, spiller monolog.
function prepStation(
    engine: GameEngineRef,
    opts: { id: string; model: 'lectern' | 'chest' | 'table'; pos: [number, number, number]; prompt: string; flag: string; doneMonolog: string },
): void {
    addInteractable(engine, {
        id: opts.id,
        model: opts.model,
        pos: opts.pos,
        prompt: opts.prompt,
        onInteract: () => {
            if (!engine.getFlag(opts.flag)) engine.setFlag(opts.flag, true);
            engine.playMonolog(opts.doneMonolog);
        },
    });
}

function registerMonolog(engine: GameEngineRef, id: string, lines: string[]): void {
    addMonolog(engine, { id, lines, once: false, trigger: { type: 'manual' } });
}

// ─── Dialog-wiring-hjelpere ───────────────────────────────────────────────────

function nodeVariants(entry: DialogNode | DialogNode[] | undefined): DialogNode[] {
    if (!entry) return [];
    return Array.isArray(entry) ? entry : [entry];
}

// Kobler en action på et bestemt valg (variant + valg-indeks). Bevarer evt.
// eksisterende action. Motoren kjører choice.action hver gang valget velges,
// også midt i en samtale (i motsetning til node.onEnd som kun fyrer ved next:null).
function wireChoice(
    dialogs: Record<string, DialogNode | DialogNode[]>,
    key: string,
    variantIndex: number,
    choiceIndex: number,
    action: () => void,
): void {
    const variant = nodeVariants(dialogs[key])[variantIndex];
    const choice = variant?.choices?.[choiceIndex];
    if (!choice) {
        console.warn(`[eksamen-samfunnsfag] wireChoice fant ikke ${key}[${variantIndex}].choices[${choiceIndex}]`);
        return;
    }
    const existing = choice.action;
    choice.action = (): void => {
        existing?.();
        action();
    };
}

// Kobler en action på node.onEnd (fyrer når en next:null-valg avslutter samtalen).
function wireDialogEnd(
    dialogs: Record<string, DialogNode | DialogNode[]>,
    key: string,
    action: () => void,
): void {
    const nodes = nodeVariants(dialogs[key]);
    if (nodes.length === 0) {
        console.warn(`[eksamen-samfunnsfag] wireDialogEnd fant ikke dialog '${key}'`);
        return;
    }
    for (const node of nodes) {
        const existing = node.onEnd;
        node.onEnd = (): void => {
            existing?.();
            action();
        };
    }
}
