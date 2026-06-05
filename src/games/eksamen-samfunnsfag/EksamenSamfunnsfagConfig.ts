import type { GameConfig, GameEngineRef } from '../engine/types';
import { setupEksamenSamfunnsfagScene } from './EksamenSamfunnsfagAssets';
import { FLAGS } from './EksamenSamfunnsfagFlags';

// ─── Dynamisk slutt-tekst: karakter 2-6 + konkret tilbakemelding ─────────────
// Leser flaggene som ble satt gjennom forberedelsen, presentasjonen og fagsamtalen.
function buildEndText(engine: GameEngineRef): string {
    const f = (name: string): boolean => engine.getFlag<boolean>(name) === true;

    // Sterke presentasjonsgrep (maks 4) - flere av dem krever god forberedelse
    const presScore =
        (f(FLAGS.APNET_TESE) ? 1 : 0) +
        (f(FLAGS.BRUKTE_SAMMENLIGNING) ? 1 : 0) +
        (f(FLAGS.LOVLIG_MAKT) ? 1 : 0) +
        (f(FLAGS.VISTE_KILDER) ? 1 : 0);

    // Bevisst bruk av minst ett retorisk virkemiddel
    const brukteVirkemiddel = f(FLAGS.BRUKTE_LOGOS) || f(FLAGS.BRUKTE_PATOS) || f(FLAGS.BRUKTE_ETOS);

    // Riktige svar i fagsamtalen (maks 4)
    const samtaleScore =
        (f(FLAGS.Q1_RIKTIG) ? 1 : 0) +
        (f(FLAGS.Q2_RIKTIG) ? 1 : 0) +
        (f(FLAGS.Q3_RIKTIG) ? 1 : 0) +
        (f(FLAGS.Q4_RIKTIG) ? 1 : 0);

    const total = presScore + samtaleScore + (brukteVirkemiddel ? 1 : 0);

    // Karakter
    let karakter: number;
    if (total >= 8 && f(FLAGS.LOVLIG_MAKT) && f(FLAGS.BRUKTE_SAMMENLIGNING)) karakter = 6;
    else if (total >= 6) karakter = 5;
    else if (total >= 4) karakter = 4;
    else if (total >= 2) karakter = 3;
    else karakter = 2;

    // Konkret tilbakemelding bygd på hva som faktisk skjedde
    const ros: string[] = [];
    const forbedring: string[] = [];

    // Forberedelsesdagen
    const prepGrep = [FLAGS.HAR_KILDER, FLAGS.HAR_PROBLEMSTILLING, FLAGS.HAR_SAMMENLIGNING].filter(f).length;
    if (prepGrep === 3) ros.push('Du brukte forberedelsesdagen godt: kilder, problemstilling og sammenligning var på plass.');
    else if (prepGrep === 0) forbedring.push('Du forberedte nesten ingenting på forberedelsesdagen. Den dagen avgjør hvor godt du kan svare.');

    if (f(FLAGS.APNET_TESE)) ros.push('Du åpnet med en skarp problemstilling i stedet for bare en tittel.');
    else if (!f(FLAGS.HAR_PROBLEMSTILLING)) forbedring.push('Forbered en problemstilling du faktisk undersøker - uten den blir åpningen vag.');
    else forbedring.push('Du forberedte en problemstilling, men brukte den ikke i åpningen. Bruk den!');

    if (f(FLAGS.BRUKTE_SAMMENLIGNING)) ros.push('Du sammenlignet Roma og Weimar punkt for punkt.');
    else if (!f(FLAGS.HAR_SAMMENLIGNING)) forbedring.push('Forbered sammenligningen Roma/Weimar - uten den blir det to løse fortellinger.');

    if (f(FLAGS.LOVLIG_MAKT)) ros.push('Du fikk fram kjernepoenget: makten ble tatt innenfra, med lovlige midler, i en krise.');
    else forbedring.push('Husk kjernepoenget: autokrati vokser oftest innenfra og lovlig, ikke som et angrep utenfra.');

    if (f(FLAGS.VISTE_KILDER)) ros.push('Du brukte egne kilder (som Res Gestae og Goebbels-sitatet fra 1928).');
    else if (!f(FLAGS.HAR_KILDER)) forbedring.push('Finn egne kilder på forberedelsesdagen - det er kjernen i selvstendig arbeid.');

    if (brukteVirkemiddel) ros.push('Du brukte etos, patos eller logos bevisst.');
    else forbedring.push('Tenk bevisst på etos, patos og logos når du presenterer.');

    if (f(FLAGS.LESTE_MANUS)) forbedring.push('Du lente deg for mye på manus. Øv så du kan snakke fritt.');

    if (samtaleScore >= 3) ros.push('Du holdt godt stand i fagsamtalen, også på de vanskelige spørsmålene.');
    else if (samtaleScore <= 1) forbedring.push('Forbered hele temaet, ikke bare presentasjonen. Sensor graver alltid videre.');

    if (!f(FLAGS.Q4_RIKTIG)) {
        forbedring.push('Spørsmålet om dagens norske demokrati lå utenfor presentasjonen din. Forbered deg på å koble temaet til nåtiden.');
    }

    const tilbakemelding =
        (ros.length ? 'Dette gjorde du bra:\n- ' + ros.join('\n- ') + '\n\n' : '') +
        (forbedring.length ? 'Til neste gang:\n- ' + forbedring.join('\n- ') + '\n\n' : '');

    const karakterlinje =
        karakter >= 6 ? 'Eksamen er over. Sensor og faglærer ser på hverandre og nikker. Karakteren er en soleklar 6-er.'
        : karakter === 5 ? 'Eksamen er over. Du gikk ut med en sterk 5-er.'
        : karakter === 4 ? 'Eksamen er over. Du landet på en solid 4-er.'
        : karakter === 3 ? 'Eksamen er over. Det ble en 3-er. Du besto, men det skalv litt.'
        : 'Eksamen er over. Det ble en svak 2-er. Du kom deg gjennom, men forberedelsene sviktet.';

    return (
        `${karakterlinje}\n\n` +
        tilbakemelding +
        'Les mer i Eiriksbok:\n' +
        '- Muntlig eksamen i samfunnsfag: /samfunnskunnskap/eksamen/muntlig\n' +
        '- Slik ser en 6-er ut (modellsvar): /samfunnskunnskap/eksamen/muntlig-modell\n' +
        '- Slik undersøker vi samfunnet (metode og kilder): /samfunnskunnskap/eksamen/km-1-metode'
    );
}

export const eksamenSamfunnsfagConfig: GameConfig = {
    id: 'eksamen-samfunnsfag',
    title: 'Muntlig eksamen i samfunnsfag',
    subtitle: 'Tre dager: trekk faget, forbered deg, framfør',
    subject: 'samfunnsfag',
    description:
        'Tre dager, som på en ekte muntlig eksamen. Først trekker du faget. På forberedelsesdagen ' +
        'trekker du oppgaven og forbereder deg. Til slutt framfører du for sensor - og hvor godt det ' +
        'går, avhenger av hvor godt du forberedte deg.',
    thumbnail: '',

    learningGoals: [
        'Forstå gangen i en muntlig eksamen: trekke fag, forberedelsesdag, og framføring.',
        'Bygge en presentasjon rundt en skarp problemstilling med egne kilder og etos/patos/logos.',
        'Møte oppfølgingsspørsmål i en fagsamtale, også spørsmål utenfor det man forberedte.',
    ],
    curriculumTags: ['samfunnsfag', 'demokrati', 'makt', 'styringsformer', 'kildebruk', 'eksamen'],

    world: {
        preset: 'open',
        backgroundColor: '#e6ddcd',
        fogDensity: 0.002,
    },

    visual: {
        sky: 'none',
        timeOfDay: 0.5,
        colorGrading: 'warm',
    },

    physics: {
        enabled: true,
        playerJump: true,
    },

    intro: {
        type: 'title',
        title: 'Muntlig eksamen',
        subtitle: 'Samfunnsfag - tre dager',
        durationMs: 3200,
        fadeMs: 900,
        skippable: true,
    },

    player: {
        startPosition: [0, 0, 5.5],
        colors: {
            body: 0x3a6ea5,
            head: 0xe8c9a0,
            legs: 0x2a3a4a,
        },
    },

    // NPCer legges til deklarativt i setupScene via addNPC.
    characters: [],
    dialogs: {},

    // Mykt taklys per sone (preset 'open' gir ingen baselys; hemi/dagslys legges i setupScene).
    lights: [
        { id: 'lys-sone-a', position: [0, 3.4, 5.5], color: 0xfff4e2, intensity: 16, distance: 16 },
        { id: 'lys-sone-b1', position: [0, 3.4, -3], color: 0xfff4e2, intensity: 16, distance: 16 },
        { id: 'lys-sone-c1', position: [0, 3.4, -14], color: 0xfff4e2, intensity: 16, distance: 16 },
        { id: 'lys-sone-c2', position: [0, 3.4, -19], color: 0xfff4e2, intensity: 16, distance: 16 },
    ],

    // Ingen items/inventar - spillet er rent dialog- og interaksjons-drevet.

    quests: [
        {
            phase: 'trekke-fag',
            objective: 'Gå fram til læreren og trekk hvilket fag du skal opp i.',
        },
        {
            phase: 'trekke-oppgave',
            objective: 'Gå inn på forberedelsesrommet. Les oppgaven og forbered deg. Du må iallfall skrive et manus før du kan gå inn til eksamen.',
        },
        {
            phase: 'framfore',
            objective: 'Gå inn til eksamen. Hils på faglæreren, hold presentasjonen, og svar på spørsmålene fra sensor.',
        },
    ],

    endText: buildEndText,

    setupScene: setupEksamenSamfunnsfagScene,
};
