import * as THREE from 'three';
import type { GameEngineRef, DialogNode, CinematicShot, AudioHandle } from '../engine/types';
import { addNPC, addPickup, addMonolog, addAmbientAudio, addCrowd } from '../engine/declarative';
import { LAYOUT, buildMarsjenMap } from './MarsjenMotRomaMap';
import {
    carloDialogs,
    ginoDialogs,
    pietroDialogs,
    kapteinDialogs,
    contiDialogs,
    telegrafDialogs,
} from './MarsjenMotRomaDialogs';
import { marsjenMotRomaMonologs } from './MarsjenMotRomaMonologs';

// ─── Wiring for marsjen-mot-roma ─────────────────────────────────────────────
// All geometri bor i MarsjenMotRomaMap.ts (LAYOUT + buildMarsjenMap). Denne
// fila kobler gameplay på kartet: NPC-er, linser, crowds, sekvenser, faser.
// Positiv Z = sør (spilleren spawner her og marsjerer mot Roma i -Z).

// De tre svar-notatene syntese-puzzlen krever. checkClimax åpner ikke puzzlen før
// alle tre er samlet, så finalen aldri soft-låser.
const REQUIRED_NOTES = ['notat-darlig-bevaepnet', 'notat-fascismens-natur', 'notat-elitens-svik'];

// Svartskjorte-palett for folkemengdene (CrowdSystem)
const BLACKSHIRT_PALETTE = {
    shirts: [0x1f1f23, 0x26262a, 0x2b2b2f, 0x1a1a1e],
    skin: 0xc89868,
    caps: 0x121216,
    pants: 0x1c1c20,
};

export function setupMarsjenMotRomaScene(engine: GameEngineRef): void {
    // ═══════════════════════════════════════════════════════════════════════
    // VÆR + LYD (overskyet, regnvåt oktoberdag - som den ekte marsjen)
    // Atmosfæren er dynamisk: vær/lys/lyd/kolonnefart endrer seg per fase.
    // ═══════════════════════════════════════════════════════════════════════
    engine.setWeather({ type: 'rain', intensity: 0.4 });

    let rainHandle: AudioHandle | null = null;
    let rainVolume = 0.45; // applyAtmosphere oppdaterer denne; handle ankommer async
    void engine.playAmbient('proc:rain', { volume: rainVolume, fadeIn: 1.5 }).then((h) => {
        rainHandle = h;
        rainHandle?.setVolume(rainVolume);
    });
    addAmbientAudio(engine, { id: 'wind-ambient', audio: 'wind-outdoor', volume: 0.18, loop: true });

    const stepsSound = engine.startProceduralSound('march-footsteps', {
        bpm: 112,
        intensity: 0.3,
        volume: 0.75,
    });
    const murmurSound = engine.startProceduralSound('crowd-murmur-live', {
        intensity: 0.5,
        volume: 0.5,
    });

    // Ett tordenskrall tidlig - etablerer regnværet i øret
    engine.schedule(() => engine.playOneShot('proc:thunder', { volume: 0.4 }), 6000);

    // ═══════════════════════════════════════════════════════════════════════
    // KARTET «VEIEN TIL ROMA» (leir → byport → bygate → piazza)
    // ═══════════════════════════════════════════════════════════════════════
    const refs = buildMarsjenMap(engine);
    const {
        sun,
        telegrafCounter,
        telegrafMarker,
        ruinWall,
        weaponRack,
        cart,
        drum,
        barrier,
        soldierGroup,
        linseSoldierBody,
        linseMarcher,
        plakat1,
        plakat2,
        bannerCloths,
        washCloths,
        fireLights,
        fireFlames,
        kongViktorGroup,
        mussoliniGroup,
        messengerHorse,
    } = refs;

    // Farger brukt av atmosfære-buen for å varme solen i klimaks.
    const sunBaseColor = new THREE.Color(0xd4cec2);
    const sunWarmColor = new THREE.Color(0xf6e2b8);

    // ═══════════════════════════════════════════════════════════════════════
    // SVARTSKJORTE-KOLONNEN (CrowdSystem - instansiert, én draw call per felt)
    // To felt PÅ veien (x ±2.5 på den 13 m brede veibanen) som flyter mot Roma.
    // Sør-enden av stien ligger 50+ m bak spilleren i tåka; nord-enden ender
    // INNI den stillestående «fronten»-mengden foran sperringen, som maskerer
    // conveyor-wrappen. I 'bloeffen' settes farten til 0: kolonnen STOPPER.
    // ═══════════════════════════════════════════════════════════════════════
    addCrowd(engine, {
        id: 'kolonne-vest',
        count: 650,
        mode: 'march',
        path: [[-LAYOUT.COLUMN_X, LAYOUT.COLUMN_Y, 80], [-LAYOUT.COLUMN_X, LAYOUT.COLUMN_Y, 2.0]],
        width: 2.6,
        speed: 0.85,
        palette: BLACKSHIRT_PALETTE,
    });
    addCrowd(engine, {
        id: 'kolonne-ost',
        count: 650,
        mode: 'march',
        path: [[LAYOUT.COLUMN_X, LAYOUT.COLUMN_Y, 80], [LAYOUT.COLUMN_X, LAYOUT.COLUMN_Y, 2.0]],
        width: 2.6,
        speed: 0.85,
        palette: BLACKSHIRT_PALETTE,
    });
    // Leiren i sør: stående mengder rundt bålene, utenfor veibanen
    addCrowd(engine, {
        id: 'leir-vest',
        count: 80,
        mode: 'static',
        area: { minX: -11, maxX: -6.5, minZ: 18, maxZ: 27 },
        palette: BLACKSHIRT_PALETTE,
    });
    addCrowd(engine, {
        id: 'leir-ost',
        count: 60,
        mode: 'static',
        area: { minX: 6.5, maxX: 11, minZ: 20, maxZ: 27.5 },
        palette: BLACKSHIRT_PALETTE,
    });
    // Fortroppen: stillestående masse foran sperringen. Skjuler kolonnehodets
    // wrap-punkt (z=2.0 ligger inni denne mengden) og selger «kolonnen har
    // stanset». Skjules når sperringen åpnes i seieren.
    addCrowd(engine, {
        id: 'fronten',
        count: 110,
        mode: 'static',
        area: { minX: -4.5, maxX: 4.5, minZ: 0.9, maxZ: 3.2 },
        y: LAYOUT.COLUMN_Y,
        palette: BLACKSHIRT_PALETTE,
    });
    // Seiersmarsjen: skjulte felt som bøyer rundt obelisken og inn i Roma.
    // Avdukes når sperringen åpnes i seieren-fasen.
    addCrowd(engine, {
        id: 'seier-vest',
        count: 320,
        mode: 'march',
        path: [[-2.5, LAYOUT.COLUMN_Y, 2], [-7.5, LAYOUT.COLUMN_Y, -12], [-8.5, LAYOUT.COLUMN_Y, -48]],
        width: 2.4,
        speed: 1.25,
        palette: BLACKSHIRT_PALETTE,
    });
    addCrowd(engine, {
        id: 'seier-ost',
        count: 320,
        mode: 'march',
        path: [[2.5, LAYOUT.COLUMN_Y, 2], [7.5, LAYOUT.COLUMN_Y, -12], [8.5, LAYOUT.COLUMN_Y, -48]],
        width: 2.4,
        speed: 1.25,
        palette: BLACKSHIRT_PALETTE,
    });
    engine.setCrowdVisible('seier-vest', false);
    engine.setCrowdVisible('seier-ost', false);

    // ═══════════════════════════════════════════════════════════════════════
    // TELEGRAFKONTORET - hit leverer spilleren forsidesaken i telegrafen-fasen
    // og velger overskrift. Aktivt klimaks i stedet for venting.
    // ═══════════════════════════════════════════════════════════════════════
    engine.registerInteract(telegrafCounter, {
        label: 'Telegrafkontoret (E)',
        radius: 2.8,
        onInteract: () => {
            if (engine.getPhase() === 'telegrafen') {
                engine.openDialog('telegraf_valg');
            } else {
                engine.playMonolog('telegraf_stengt');
            }
        },
    });

    // ═══════════════════════════════════════════════════════════════════════
    // NPC-ER
    // ═══════════════════════════════════════════════════════════════════════
    addNPC(engine, {
        id: 'carlo',
        name: 'Carlo',
        characterType: 'farmer',
        pos: [-3.5, 0, 24],
        colors: { body: 0x26262a, head: 0xc89868, legs: 0x1c1c20 },
        emotion: 'triumphant',
        questMarker: true,
        dialogs: carloDialogs,
    });

    addNPC(engine, {
        id: 'gino',
        name: 'Gino',
        characterType: 'farmer',
        pos: [4.8, 0, 10],
        colors: { body: 0x2a2a2e, head: 0xd0a070, legs: 0x1a1a1e },
        emotion: 'triumphant',
        questMarker: true,
        dialogs: ginoDialogs,
    });

    addNPC(engine, {
        id: 'pietro',
        name: 'Pietro',
        characterType: 'farmer',
        pos: [-12, 0, 4], // sidetorget, foran det utbrente trykkeriet
        colors: { body: 0x4a4038, head: 0xb88a64, legs: 0x2e271f },
        emotion: 'worried',
        questMarker: false,
        dialogs: pietroDialogs,
    });

    addNPC(engine, {
        id: 'kaptein',
        name: 'Kaptein Renzi',
        characterType: 'noble',
        pos: [LAYOUT.KAPTEIN_POS[0], 0, LAYOUT.KAPTEIN_POS[1]],
        colors: { body: 0x4a5640, head: 0xc89868, legs: 0x2c3424 },
        emotion: 'worried',
        questMarker: true,
        dialogs: kapteinDialogs,
    });

    addNPC(engine, {
        id: 'conti',
        name: 'Signor Conti',
        characterType: 'noble',
        pos: [-3.4, 0, 0.6],
        colors: { body: 0x2e2a26, head: 0xcea078, legs: 0x1f1c18 },
        emotion: 'glad',
        questMarker: true,
        dialogs: contiDialogs,
    });

    // Liten livspustende vandring på de tidlige NPC-ene (de er fortsatt lette å snakke
    // med - E virker uansett posisjon). Renzi/Conti står i ro (i givakt/på vakt).
    engine.assignRoute({
        characterId: 'carlo',
        waypoints: [[-3.5, 24], [-2.7, 24.4], [-3.5, 24]],
        mode: 'pingpong',
        speed: 0.25,
        pauseMs: 2600,
    });
    engine.assignRoute({
        characterId: 'gino',
        waypoints: [[4.8, 10], [5.4, 10.6], [4.8, 10]],
        mode: 'pingpong',
        speed: 0.3,
        pauseMs: 2200,
    });

    // ═══════════════════════════════════════════════════════════════════════
    // PICKUPS (flavor/dybde - leses i inventar)
    // ═══════════════════════════════════════════════════════════════════════
    addPickup(engine, {
        id: 'pickup-presskort',
        itemId: 'presskort',
        model: 'book',
        pos: [3, 1.0, 25],
        label: 'Ta pressekortet (E)',
        audioOnPickup: 'pickup-paper',
    });
    addPickup(engine, {
        id: 'pickup-program',
        itemId: 'fascist-program',
        model: 'scroll',
        pos: [-5, 1.05, 24],
        label: 'Plukk opp flyveblad (E)',
        audioOnPickup: 'pickup-paper',
        onPickup: () => engine.schedule(() => engine.playMonolog('lese_flyveblad'), 600),
    });

    // ═══════════════════════════════════════════════════════════════════════
    // SANNHETENS LINSE - de fysiske avsløringene (E: «Se nærmere»)
    // Avstandsbildet (løgnen) vs. nærbildet (sannheten). Hver gir et notat.
    // ALLE mål får samme juice: push-in-kamera (autogenerert hvis ikke angitt),
    // hvit flash + lukkerklikk («mentalt fotografi») og et lite kamera-rykk.
    // ═══════════════════════════════════════════════════════════════════════
    // #1 Marsjerende (hero-avsløring): hæren er en kledning
    wireLinse(engine, linseMarcher.children[0] as THREE.Mesh, {
        label: 'Se nærmere (E)',
        monolog: 'linse_marsjer',
        note: 'notat-haeren-kledning',
        flag: 'saw_costume',
        radius: 3,
        pushIn: [
            { duration: 1.7, cameraPos: [4, 1.5, 22.9], lookAt: [4, 1.0, 21], fov: 36, transition: 'cut' },
        ],
    });
    // #2 Våpnene: militært maktesløs - KREVES for finalen
    wireLinse(engine, weaponRack.children[0] as THREE.Mesh, {
        label: 'Se nærmere på våpnene (E)',
        monolog: 'linse_vaapen',
        note: 'notat-darlig-bevaepnet',
        flag: 'saw_weapons',
        radius: 3,
        pushIn: [
            { duration: 1.7, cameraPos: [-4.9, 1.3, 18], lookAt: [-4.9, 0.8, 16.2], fov: 38, transition: 'cut' },
        ],
        onAfter: () => checkClimax(engine),
    });
    // #4 Trykkeriet: volden er politikken
    wireLinse(engine, ruinWall, {
        label: 'Se nærmere på ruinene (E)',
        monolog: 'trykkeriet',
        note: 'notat-volden',
        flag: 'saw_arson',
        radius: 4,
    });
    // #5 Soldaten ved sperringen: den ekte hæren er lammet
    if (linseSoldierBody) {
        wireLinse(engine, linseSoldierBody, {
            label: 'Se nærmere på soldatene (E)',
            monolog: 'linse_soldat',
            note: 'notat-haeren-lammet',
            flag: 'saw_real_army',
            radius: 3.5,
        });
    }
    // #3 Propaganda-plakatene (vegg-decals på fasadene, bygget i Map-fila)
    wireLinse(engine, plakat1, {
        label: 'Les plakaten (E)',
        monolog: 'plakat_svart',
        note: 'notat-propaganda',
        flag: 'saw_propaganda',
        radius: 3,
    });
    wireLinse(engine, plakat2, {
        label: 'Les plakaten (E)',
        monolog: 'plakat_vilje',
        note: 'notat-propaganda', // samme notat - grantNote legger ikke til duplikat
        radius: 3,
    });

    // ═══════════════════════════════════════════════════════════════════════
    // VISTA (valgfri): klatre opp på vogna og se utover kolonnen og ned gata
    // ═══════════════════════════════════════════════════════════════════════
    engine.registerInteract(cart.children[0] as THREE.Mesh, {
        label: 'Klatre opp på vogna (E)',
        radius: 3,
        onInteract: () => {
            engine.unregisterInteract(cart.children[0] as THREE.Mesh);
            void engine.playCinematic([
                // Over kolonnen, mot byporten
                { duration: 3.2, cameraPos: [8, 4.2, 24], lookAt: [0, 1.5, 8], fov: 58, transition: 'fade' },
                // Ned gata: obelisken og palass-silhuetten i tåka
                { duration: 3.0, cameraPos: [8, 4.4, 22], lookAt: [0, 2, -13], fov: 50, transition: 'cut' },
            ]);
            engine.schedule(() => engine.playMonolog('vista'), 600);
        },
    });

    // ═══════════════════════════════════════════════════════════════════════
    // TROMME-AKTIVITET (valgfri rytme-beat: kjenn korsangens dragning)
    // Trommeslagene HØRES - spilleren skal treffe dem, ikke gjette dem.
    // ═══════════════════════════════════════════════════════════════════════
    engine.registerInteract(drum, {
        label: 'Slå med på trommen (E)',
        radius: 2.5,
        onInteract: () => {
            // Rytmisk tromme under aktiviteten (8 slag, ett per 750 ms)
            engine.playSequence(
                Array.from({ length: 8 }, (_, i) => ({
                    at: i * 750,
                    do: () => engine.playOneShot('proc:drum-hit', { volume: 0.7 }),
                })),
            );
            engine.openActivity({
                id: 'korsang',
                label: 'Korsangen',
                prompt: 'Trykk MELLOMROM i takt med slagene: «A noi! A noi!»',
                variant: 'rhythm',
                durationMs: 6000,
                windowMs: 720,
                successThreshold: 0.55,
                onSuccess: () => {
                    engine.setFlag('felt_the_pull', true);
                    engine.schedule(() => engine.playMonolog('marsj_rop'), 300);
                },
                onFail: () => engine.playMonolog('marsj_rop'),
            });
        },
    });

    // ═══════════════════════════════════════════════════════════════════════
    // MONOLOGER
    // ═══════════════════════════════════════════════════════════════════════
    for (const node of Object.values(marsjenMotRomaMonologs)) {
        engine.registerMonolog(node);
    }
    // Proximity-teaser ved sperringen (selve notatet gis via linse på soldaten)
    addMonolog(engine, {
        id: 'haeren',
        lines: marsjenMotRomaMonologs.haeren.lines,
        once: true,
        trigger: { type: 'proximity', pos: [0, 0, 2], radius: 4 },
    });
    // Breadcrumb ved torgåpningen: spilleren legger merke til telegrafkontoret
    // tidlig, så det er kjent terreng når forsiden skal leveres.
    addMonolog(engine, {
        id: 'sidetorg_glimt',
        lines: marsjenMotRomaMonologs.sidetorg_glimt.lines,
        once: true,
        trigger: { type: 'proximity', pos: [-7.5, 0, 4.5], radius: 4 },
    });

    // ═══════════════════════════════════════════════════════════════════════
    // DIALOG-ACTIONS (kobler engine-flagg + notater på dialog-noder)
    // ═══════════════════════════════════════════════════════════════════════
    // Telegraf-dialogene har ingen NPC (skranke-interact) - merge dem inn manuelt.
    Object.assign(engine.config.dialogs, telegrafDialogs);
    const dialogs = engine.config.dialogs;

    // VIKTIG: node.onEnd fyrer KUN på noden der spilleren velger et `next:null`-valg
    // (ikke på mellomnoder man navigerer videre fra). Derfor settes gating-flagg via
    // choice.action i det øyeblikket spilleren ENGASJERER temaet - uavhengig av hvor
    // dypt de navigerer eller hvor de avslutter. checkClimax kjøres når samtalen LUKKES
    // (onEnd på alle Renzi/Conti-noder; bare terminal-noden fyrer = riktig timing).

    // Carlo (ikke gating - bare marker + flavor-flagg)
    wireChoiceAction(dialogs, ['carlo_mussolini', 'carlo_why', 'carlo_quiz_sosialist'], () => {
        engine.setFlag('learned_mussolini_background', true);
        engine.setCharacterMarkerVisible('carlo', false);
    });

    // Gino: fascismens kjerne (gir svar-notatet, men er IKKE påkrevd for å åpne finalen -
    // checkClimax fyller inn manglende notater som sikkerhetsnett)
    wireChoiceAction(dialogs, ['gino_creed'], () => {
        engine.setFlag('learned_fascism_traits', true);
        engine.setCharacterMarkerVisible('gino', false);
        grantNote(engine, 'notat-fascismens-natur');
    });
    wireChoiceAction(dialogs, ['gino_violence'], () => {
        engine.setFlag('saw_squadristi_violence', true);
        engine.setCharacterMarkerVisible('gino', false);
    });

    wireChoiceAction(dialogs, ['pietro_state'], () =>
        engine.setFlag('saw_squadristi_violence', true),
    );

    // Renzi: bløffen (gating-flagg). Settes så snart spilleren spør om hæren kan stoppe
    // marsjen ELLER hvorfor de venter - dekker alle grener inkl. quiz.
    wireChoiceAction(dialogs, ['kaptein_bluff', 'kaptein_orders', 'kaptein_quiz_ordre'], () => {
        engine.setFlag('learned_bluff', true);
        engine.setCharacterMarkerVisible('kaptein', false);
        grantNote(engine, 'notat-darlig-bevaepnet'); // Renzis poeng: dårlig bevæpnet
    });

    // Conti: elitens motiv (gating-flagg). Settes ved begge inngangsvalg.
    wireChoiceAction(dialogs, ['conti_motive', 'conti_compare'], () => {
        engine.setFlag('learned_elite_motive', true);
        engine.setCharacterMarkerVisible('conti', false);
        grantNote(engine, 'notat-elitens-svik');
    });
    wireChoiceAction(dialogs, ['conti_compare'], () =>
        engine.setFlag('compared_communism', true),
    );

    // Åpne syntese-finalen når spilleren LUKKER en Renzi/Conti-samtale og begge
    // gating-flagg er satt. onEnd på alle noder → bare terminal-noden fyrer = ved lukking.
    for (const key of [
        'kaptein_greeting', 'kaptein_bluff', 'kaptein_orders', 'kaptein_quiz_ordre', 'kaptein_quiz_riktig',
        'conti_greeting', 'conti_motive', 'conti_compare',
    ]) {
        wireDialogEnd(dialogs, key, () => checkClimax(engine));
    }

    // Telegraf: overskriftsvalget setter flagg (valg-indeks = vinkling), og når
    // samtalen lukkes etter sending starter kongens-valg-sekvensen.
    const telegrafValgNode = dialogs.telegraf_valg as DialogNode;
    const headlineFlags = ['overskrift_bloeff', 'overskrift_vold', 'overskrift_elite'];
    telegrafValgNode.choices.forEach((choice, i) => {
        const existing = choice.action;
        choice.action = (): void => {
            existing?.();
            engine.setFlag(headlineFlags[i], true);
        };
    });
    wireDialogEnd(dialogs, 'telegraf_sendt', () => {
        engine.playOneShot('proc:chime-success', { volume: 0.6 });
        startKingSequence();
    });

    // ═══════════════════════════════════════════════════════════════════════
    // SYNTESE-PUZZLE: riktig forsidesak åpner telegrafen-fasen - spilleren
    // leverer selv saken (aktiv handling, ikke venting)
    // ═══════════════════════════════════════════════════════════════════════
    const puzzleConfig = engine.config.puzzle;
    if (puzzleConfig?.steps?.length) {
        const lastStep = puzzleConfig.steps[puzzleConfig.steps.length - 1];
        const existingOnCorrect = lastStep.onCorrect;
        lastStep.onCorrect = () => {
            existingOnCorrect?.();
            engine.setFlag('forside_klar', true);
            engine.setPhase('telegrafen');
            engine.schedule(() => engine.playMonolog('forside_klar'), 1000);
        };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ATMOSFÆRE-BUE: vær + lys + LYD + KOLONNEFART følger fortellingen.
    // Stillheten i bloeffen er et poeng: kolonnen stopper, trampingen dør,
    // og verden holder pusten foran sperringen.
    // ═══════════════════════════════════════════════════════════════════════
    let todCurrent = 0.42; // lokal sannhet for timeOfDay (lerpes mot mål)
    let todTarget = 0.42;
    let atmospherePhase = '';
    function applyAtmosphere(phase: string): void {
        switch (phase) {
            case 'samling':
                engine.setWeather({ type: 'rain', intensity: 0.4 });
                todTarget = 0.42;
                rainVolume = 0.45;
                engine.setCrowdSpeed('kolonne-vest', 0.85);
                engine.setCrowdSpeed('kolonne-ost', 0.85);
                stepsSound?.setParam('intensity', 0.3);
                stepsSound?.setParam('bpm', 110);
                murmurSound?.setParam('intensity', 0.5);
                break;
            case 'marsjen':
                engine.setWeather({ type: 'rain', intensity: 0.3 }); // regnet letner
                todTarget = 0.44;
                rainVolume = 0.32;
                engine.setCrowdSpeed('kolonne-vest', 1.1);
                engine.setCrowdSpeed('kolonne-ost', 1.1);
                stepsSound?.setParam('intensity', 0.8);
                stepsSound?.setParam('bpm', 116);
                murmurSound?.setParam('intensity', 0.6);
                break;
            case 'bloeffen':
                engine.setWeather({ type: 'clear', intensity: 0 }); // regnet stopper, uhyggelig stille
                todTarget = 0.43;
                rainVolume = 0;
                engine.setCrowdSpeed('kolonne-vest', 0); // kolonnen STOPPER foran sperringen
                engine.setCrowdSpeed('kolonne-ost', 0);
                stepsSound?.setParam('intensity', 0); // trampingen dør - stillhet
                murmurSound?.setParam('intensity', 0.35);
                break;
            case 'telegrafen':
                engine.setWeather({ type: 'clear', intensity: 0 });
                todTarget = 0.47;
                rainVolume = 0;
                engine.setCrowdSpeed('kolonne-vest', 0);
                engine.setCrowdSpeed('kolonne-ost', 0);
                stepsSound?.setParam('intensity', 0);
                murmurSound?.setParam('intensity', 0.4);
                engine.setBloom(0.45);
                break;
            case 'kongens-valg':
                engine.setWeather({ type: 'clear', intensity: 0 });
                todTarget = 0.60; // ettermiddagssol bryter gjennom — TimeOfDaySystem driver intensitet
                rainVolume = 0;
                stepsSound?.setParam('intensity', 0);
                murmurSound?.setParam('intensity', 0.25);
                engine.setBloom(0.55);
                break;
            case 'seieren':
                engine.setWeather({ type: 'fog', intensity: 0.3 });
                todTarget = 0.32; // grått igjen, mot demring - hul «seier»
                rainVolume = 0.12;
                engine.setCrowdSpeed('kolonne-vest', 1.25);
                engine.setCrowdSpeed('kolonne-ost', 1.25);
                engine.setCrowdVisible('seier-vest', true);
                engine.setCrowdVisible('seier-ost', true);
                engine.setCrowdSpeed('seier-vest', 1.25);
                engine.setCrowdSpeed('seier-ost', 1.25);
                engine.setCrowdVisible('fronten', false); // restore-sikkerhetsnett (save/load)
                stepsSound?.setParam('intensity', 1.0);
                stepsSound?.setParam('bpm', 120);
                murmurSound?.setParam('intensity', 0.9);
                break;
        }
        rainHandle?.setVolume(rainVolume);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // KLIMAKS-SEKVENSER (SequenceRunner - erstatter de gamle schedule-kjedene)
    // ═══════════════════════════════════════════════════════════════════════
    let kingSequenceStarted = false;
    let finaleStarted = false;
    let barrierOpened = false;
    let soldiersAside = false;
    let messengerRiding = false;
    let messengerArrived = false;

    function openBarrier(): void {
        if (barrierOpened) return;
        barrierOpened = true;
        engine.removeStaticCollider(barrier);
        barrier.visible = false;
        soldiersAside = true;
        engine.setCrowdVisible('fronten', false); // fortroppen setter seg i bevegelse
    }

    function startKingSequence(): void {
        if (kingSequenceStarted) return;
        kingSequenceStarted = true;
        engine.setPhase('kongens-valg');
        engine.playSequence([
            { after: 700, monolog: 'venter', wait: true },
            { after: 500, do: () => { kongViktorGroup.position.set(...LAYOUT.KONGE_POS); } },
            {
                after: 0,
                cinematic: [
                    // Vidvinkel fra piazzaen: palasset bak kongen på trappa
                    { duration: 4, cameraPos: [11, 4, -12], lookAt: [-2, 2.2, -23.3], fov: 48, transition: 'fade' },
                    // Nærbilde: kongen på palasstrappa
                    { duration: 3.5, cameraPos: [1.5, 2.0, -19.5], lookAt: [-2, 2.0, -23.3], fov: 40, transition: 'cut' },
                    // Tilbake mot gata - obelisken i midten, spenning
                    { duration: 3, cameraPos: [0, 3.2, -7], lookAt: [0, 1.5, -20], fov: 55, transition: 'fade' },
                ],
                wait: true,
            },
            {
                after: 300,
                do: () => {
                    // Budbringeren rir inn over piazzaen mot kapteinen (animeres i update-loopen)
                    messengerHorse.group.position.set(...LAYOUT.MESSENGER_SPAWN);
                    messengerRiding = true;
                },
            },
            { after: 3400, monolog: 'kongen_taler', wait: true },
            {
                after: 400,
                do: () => {
                    openBarrier();
                    kongViktorGroup.position.set(100, 0, -16); // skjul kongen
                    engine.cameraShake(0.22, 1.4); // kolonnen setter seg i bevegelse
                    engine.setPhase('seieren');
                    engine.schedule(() => engine.playMonolog('seier_vandring'), 1600);
                },
            },
        ]);
    }

    function startFinale(): void {
        if (finaleStarted) return;
        finaleStarted = true;
        engine.playSequence([
            { after: 0, do: () => { void engine.fadeToBlack(800); } },
            { after: 900, do: () => { mussoliniGroup.position.set(...LAYOUT.MUSSOLINI_POS); } },
            {
                after: 100,
                cinematic: [
                    // Vidvinkel: palasset fra venstre, Mussolini på trappa
                    { duration: 3.5, cameraPos: [-11, 4, -12], lookAt: [3, 2.2, -23.3], fov: 50, transition: 'fade' },
                    // Nærbilde: Mussolini foran palassportene
                    { duration: 3, cameraPos: [-0.5, 2.0, -19.5], lookAt: [3, 2.0, -23.3], fov: 42, transition: 'cut' },
                ],
                wait: true,
            },
            { after: 300, monolog: 'tog_ankomst', wait: true },
            { after: 900, monolog: 'seier_refleksjon', wait: true },
            { after: 1200, do: () => engine.triggerEnd() },
        ]);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // FASEPROGRESJON + PER-FRAME-ANIMASJON
    // ═══════════════════════════════════════════════════════════════════════
    let elapsedTime = 0;
    let messengerTime = 0;
    const soldierTargetX = 11;
    const MESSENGER_TARGET = new THREE.Vector3(
        LAYOUT.MESSENGER_TARGET[0],
        LAYOUT.MESSENGER_TARGET[1],
        LAYOUT.MESSENGER_TARGET[2],
    );
    const MESSENGER_SPEED = 5.2;

    engine.registerUpdate((dt) => {
        elapsedTime += dt;
        const phase = engine.getPhase();

        // Atmosfære-bytte når fasen skifter
        if (phase !== atmospherePhase) {
            atmospherePhase = phase;
            applyAtmosphere(phase);
        }
        // Myk overgang av timeOfDay mot målet (cheap lerp)
        if (Math.abs(todCurrent - todTarget) > 0.001) {
            todCurrent += (todTarget - todCurrent) * Math.min(1, dt * 0.6);
            engine.setTimeOfDay(todCurrent);
        }
        // Solfarge varmes i klimaks — intensiteten drives av TimeOfDaySystem (inkl. qualityBoost)
        if (phase === 'kongens-valg' || phase === 'seieren') {
            sun.color.lerp(sunWarmColor, Math.min(1, dt * 0.8));
        } else {
            sun.color.lerp(sunBaseColor, Math.min(1, dt * 0.5));
        }

        const p = engine.getPlayerPosition();

        // Marsjen begynner når spilleren passerer byporten
        if (phase === 'samling' && p.z < LAYOUT.PHASE_MARSJEN_Z) {
            engine.setPhase('marsjen');
        }
        // Spilleren når veisperringen
        if (phase === 'marsjen' && p.z < LAYOUT.PHASE_BLOEFFEN_Z) {
            engine.setPhase('bloeffen');
        }
        // Gjenopprettings-vakter (save/load midt i klimakset): sekvenser og
        // barriere-tilstand utledes av fasen, så et lagret spill aldri soft-låser.
        if (phase === 'kongens-valg' && !kingSequenceStarted) {
            startKingSequence();
        }
        if (phase === 'seieren') {
            if (!barrierOpened) openBarrier();
            // Finalen: spilleren GÅR selv med kolonnen forbi obelisken inn i Roma
            if (!finaleStarted && p.z < LAYOUT.PHASE_FINALE_Z) startFinale();
        }

        // Animér soldatene som skrider til side
        if (soldiersAside && soldierGroup.position.x < soldierTargetX - 0.05) {
            soldierGroup.position.x += (soldierTargetX - soldierGroup.position.x) * Math.min(1, dt * 1.5);
        }

        // Fanene og klesvasken vaier i regnet/vinden
        for (let i = 0; i < bannerCloths.length; i++) {
            const cloth = bannerCloths[i];
            cloth.rotation.x = Math.sin(elapsedTime * 1.7 + i * 1.9) * 0.09;
            cloth.rotation.y = Math.sin(elapsedTime * 1.1 + i * 0.8) * 0.06;
        }
        for (let i = 0; i < washCloths.length; i++) {
            washCloths[i].rotation.x = Math.sin(elapsedTime * 1.4 + i * 1.3) * 0.12;
        }

        // Bålene og portfaklene flakker
        for (let i = 0; i < fireLights.length; i++) {
            const base = fireLights[i].distance > 14 ? 60 : 16; // fakler vs. bål
            fireLights[i].intensity = base * (1 + Math.sin(elapsedTime * 9 + i * 2.1) * 0.18);
            fireFlames[i].scale.setScalar(1 + Math.sin(elapsedTime * 11 + i * 1.4) * 0.08);
        }

        // Telegraf-markøren: synlig kun i telegrafen-fasen, bobler og roterer
        // høyt over taket så den ses over hustakene fra gata
        telegrafMarker.visible = phase === 'telegrafen';
        if (telegrafMarker.visible) {
            telegrafMarker.position.y =
                LAYOUT.TELEGRAF_MARKER_Y + Math.sin(elapsedTime * 2.5) * 0.15;
            telegrafMarker.rotation.y += dt * 1.5;
        }

        // Linse-marsjereren: subtil pust (hero-figur, står som etternøler i kolonnekanten)
        linseMarcher.position.y = 0.06 + Math.sin(elapsedTime * 1.3) * 0.03;

        // Budbringer på hest rider inn over piazzaen mot kapteinen
        if (messengerRiding && !messengerArrived) {
            messengerTime += dt;
            const pos = messengerHorse.group.position;
            const diff = MESSENGER_TARGET.clone().sub(pos);
            const dist = diff.length();
            if (dist < 0.5) {
                messengerArrived = true;
                pos.x = MESSENGER_TARGET.x;
                pos.z = MESSENGER_TARGET.z;
                // Vend mot kapteinen
                messengerHorse.group.rotation.y = Math.atan2(
                    LAYOUT.KAPTEIN_POS[0] - pos.x,
                    LAYOUT.KAPTEIN_POS[1] - pos.z,
                );
                messengerHorse.group.position.y = 0;
            } else {
                const step = Math.min(MESSENGER_SPEED * dt, dist);
                diff.normalize().multiplyScalar(step);
                pos.x += diff.x;
                pos.z += diff.z;
                messengerHorse.group.rotation.y = Math.atan2(diff.x, diff.z);
                // Galopperingsanimasjon: bobling + benvipping
                messengerHorse.group.position.y = Math.sin(messengerTime * 14) * 0.07;
                messengerHorse.group.rotation.z = Math.sin(messengerTime * 14 + Math.PI) * 0.035;
                for (let i = 0; i < messengerHorse.legs.length; i++) {
                    messengerHorse.legs[i].rotation.x = Math.sin(messengerTime * 14 + i * Math.PI) * 0.45;
                }
            }
        }
    });

    // ═══════════════════════════════════════════════════════════════════════
    // INIT
    // ═══════════════════════════════════════════════════════════════════════
    engine.setPhase('samling');
    engine.schedule(() => engine.playMonolog('ankomst'), 1200);
}

// ─── Helpers ───────────────────────────────────────────────────────────────

// Legg et notat i notatboka uten å lage duplikat (notat-items er stackable:false).
// Gir en liten pickup-blip når notatet faktisk er nytt.
function grantNote(engine: GameEngineRef, itemId: string): void {
    if (!engine.hasItem(itemId)) {
        engine.addItem(itemId);
        engine.playOneShot('proc:blip-pickup?base=660&gain=0.35');
    }
}

interface LinseOpts {
    label: string;
    monolog: string;
    note: string;
    flag?: string;
    radius?: number;
    pushIn?: CinematicShot[];
    onAfter?: () => void;
}

// Autogenerert push-in: kamera 2 meter fra målet, langs spillerens siktelinje,
// lav FOV. Brukes for linse-mål uten håndlaget shot.
function autoPushIn(engine: GameEngineRef, mesh: THREE.Mesh): CinematicShot[] {
    const wp = new THREE.Vector3();
    mesh.getWorldPosition(wp);
    const pp = engine.getPlayerPosition();
    const dx = wp.x - pp.x;
    const dz = wp.z - pp.z;
    const d = Math.hypot(dx, dz) || 1;
    return [
        {
            duration: 1.7,
            cameraPos: [wp.x - (dx / d) * 2.1, wp.y + 1.1, wp.z - (dz / d) * 2.1],
            lookAt: [wp.x, wp.y + 0.2, wp.z],
            fov: 36,
            transition: 'cut',
        },
    ];
}

// Sannhetens linse: «Se nærmere» på en mesh. Et «mentalt fotografi»: hvit flash,
// lukkerklikk og et lite kamera-rykk, push-in mot målet (autogenerert hvis ikke
// angitt), monolog med sannheten, notat i notatboka og et flagg. Engangsbruk.
function wireLinse(engine: GameEngineRef, mesh: THREE.Mesh, opts: LinseOpts): void {
    engine.registerInteract(mesh, {
        label: opts.label,
        radius: opts.radius ?? 3,
        onInteract: () => {
            engine.unregisterInteract(mesh);
            if (opts.flag) engine.setFlag(opts.flag, true);
            engine.screenFlash();
            engine.playOneShot('proc:shutter-click', { volume: 0.7 });
            engine.cameraShake(0.06, 0.3);
            grantNote(engine, opts.note);
            const pushIn = opts.pushIn ?? autoPushIn(engine, mesh);
            void engine.playCinematic(pushIn);
            engine.schedule(() => engine.playMonolog(opts.monolog), 300);
            opts.onAfter?.();
        },
    });
}

// Åpner syntese-puzzlen når spilleren har snakket med offiseren (Renzi → learned_bluff)
// OG industrieieren (Conti → learned_elite_motive). Gating KUN på disse to (de eneste
// obligatoriske NPC-ene), så finalen aldri soft-låser. Som sikkerhetsnett garanteres
// de tre svar-notatene før puzzlen åpner: notater fra valgfrie linse-/Gino-funn man har
// gjort beholdes, og det som mangler fylles inn (journalisten setter sammen bildet av alt
// han har sett). Slik er syntesen alltid løsbar uansett rekkefølge eller utforskning.
function checkClimax(engine: GameEngineRef): void {
    if (engine.getPhase() !== 'bloeffen') return;
    if (engine.getFlag<boolean>('puzzle_started')) return;
    if (!engine.getFlag<boolean>('learned_bluff')) return;
    if (!engine.getFlag<boolean>('learned_elite_motive')) return;

    // Sikkerhetsnett: garanter at de tre svar-notatene finnes (ingen duplikat).
    for (const id of REQUIRED_NOTES) {
        if (!engine.hasItem(id)) engine.addItem(id);
    }
    engine.setFlag('puzzle_started', true);
    engine.schedule(() => engine.openPuzzle(), 800);
}

function wireDialogEnd(
    dialogs: Record<string, DialogNode | DialogNode[]>,
    key: string,
    action: () => void,
): void {
    const entry = dialogs[key];
    if (!entry) return;
    const nodes = Array.isArray(entry) ? entry : [entry];
    for (const node of nodes) {
        const existing = node.onEnd;
        node.onEnd = (): void => {
            try {
                existing?.();
            } finally {
                action();
            }
        };
    }
}

// Legg en handling på ALLE valg som leder til en av `nextTargets`-nodene. Brukes til å
// sette gating-flagg i det øyeblikket spilleren engasjerer et tema - robust mot at
// node.onEnd kun fyrer på terminal-noder (se forklaring der dette kalles).
function wireChoiceAction(
    dialogs: Record<string, DialogNode | DialogNode[]>,
    nextTargets: string[],
    action: () => void,
): void {
    const targetSet = new Set(nextTargets);
    for (const entry of Object.values(dialogs)) {
        const nodes = Array.isArray(entry) ? entry : [entry];
        for (const node of nodes) {
            for (const choice of node.choices) {
                if (choice.next && targetSet.has(choice.next)) {
                    const existing = choice.action;
                    choice.action = (): void => {
                        existing?.();
                        action();
                    };
                }
            }
        }
    }
}
