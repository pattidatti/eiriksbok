import type { GameConfig, GameEngineRef } from '../engine/types';
import { setupEksamenNorskScene } from './EksamenNorskAssets';
import { FLAGS } from './EksamenNorskFlags';

// ─── Dynamisk slutt-tekst: karakter 2-6 + konkret tilbakemelding ─────────────
// Leser flaggene som ble satt gjennom forberedelsen, presentasjonen og fagsamtalen.
function buildEndText(engine: GameEngineRef): string {
    const f = (name: string): boolean => engine.getFlag<boolean>(name) === true;

    // Sterke presentasjonsgrep (maks 4) - flere av dem krever god forberedelse
    const presScore =
        (f(FLAGS.APNET_TESE) ? 1 : 0) +
        (f(FLAGS.KOBLET_EPOKE) ? 1 : 0) +
        (f(FLAGS.KJERNE_RIKTIG) ? 1 : 0) +
        (f(FLAGS.BRUKTE_SITATER) ? 1 : 0);

    // Bevisst bruk av minst ett overbevisende grep (presise sitater = logos)
    const brukteVirkemiddel = f(FLAGS.BRUKTE_SITATER) || f(FLAGS.BRUKTE_PATOS) || f(FLAGS.BRUKTE_ETOS);

    // Riktige svar i fagsamtalen (maks 4)
    const samtaleScore =
        (f(FLAGS.Q1_RIKTIG) ? 1 : 0) +
        (f(FLAGS.Q2_RIKTIG) ? 1 : 0) +
        (f(FLAGS.Q3_RIKTIG) ? 1 : 0) +
        (f(FLAGS.Q4_RIKTIG) ? 1 : 0);

    const total = presScore + samtaleScore + (brukteVirkemiddel ? 1 : 0);

    // Karakter
    let karakter: number;
    if (total >= 8 && f(FLAGS.KJERNE_RIKTIG) && f(FLAGS.KOBLET_EPOKE)) karakter = 6;
    else if (total >= 6) karakter = 5;
    else if (total >= 4) karakter = 4;
    else if (total >= 2) karakter = 3;
    else karakter = 2;

    // Konkret tilbakemelding bygd på hva som faktisk skjedde
    const ros: string[] = [];
    const forbedring: string[] = [];

    // Forberedelsesdagen
    const prepGrep = [FLAGS.HAR_TEKSTER, FLAGS.HAR_PAASTAND, FLAGS.HAR_EPOKEKOBLING, FLAGS.HAR_BAKLOMME].filter(f).length;
    if (prepGrep === 4) ros.push('Du brukte forberedelsesdagen godt: tekster, påstand, epokekobling og baklomme-tekster var på plass.');
    else if (prepGrep === 0) forbedring.push('Du forberedte nesten ingenting på forberedelsesdagen. Den dagen avgjør hvor godt du kan svare.');

    if (f(FLAGS.APNET_TESE)) ros.push('Du åpnet med en skarp påstand i stedet for en innholdsfortegnelse.');
    else if (!f(FLAGS.HAR_PAASTAND)) forbedring.push('Forbered en skarp påstand du faktisk argumenterer for - uten den blir åpningen vag.');
    else forbedring.push('Du forberedte en påstand, men brukte den ikke i åpningen. Bruk den!');

    if (f(FLAGS.KOBLET_EPOKE)) ros.push('Du analyserte virkemiddel og koblet hver tekst til sin epoke, slik kompetansemålet om historisk kontekst krever.');
    else if (!f(FLAGS.HAR_EPOKEKOBLING)) forbedring.push('Lag tankekart og koble tekstene til epoker - uten det blir det referat, ikke analyse.');

    if (f(FLAGS.KJERNE_RIKTIG)) ros.push('Du fikk fram den røde tråden: framgang betyr ulikt i hver epoke, fra eventyrets løfte til Hamsuns indre splittelse.');
    else forbedring.push('Husk den røde tråden: bind tekstene sammen til én utvikling, ikke tre løse referat.');

    if (f(FLAGS.BRUKTE_SITATER)) ros.push('Du brukte presise sitater og navnga virkemidler (kontrast, ironi, indre monolog).');
    else if (!f(FLAGS.HAR_TEKSTER)) forbedring.push('Velg tekstene grundig på forberedelsesdagen, og finn ett presist sitat per tekst.');

    if (brukteVirkemiddel) ros.push('Du overbeviste bevisst - med sitater, etos eller patos.');
    else forbedring.push('Tenk bevisst på hvordan du overbeviser: presise sitater, etos og patos.');

    if (f(FLAGS.SIRKLET_TILBAKE)) ros.push('Du sirklet tilbake til påstanden i avslutningen - fin helhet fra start til slutt.');
    else forbedring.push('Avslutt med å sirkle tilbake til påstanden din. Det gir presentasjonen en tydelig rød tråd.');

    if (f(FLAGS.LESTE_MANUS)) forbedring.push('Du lente deg for mye på manus. Øv så du kan snakke fritt fra stikkord.');

    if (samtaleScore >= 3) ros.push('Du holdt godt stand i fagsamtalen, også på de vanskelige spørsmålene.');
    else if (samtaleScore <= 1) forbedring.push('Forbered hele temaet, ikke bare presentasjonen. Faglærer og sensor graver alltid videre.');

    if (!f(FLAGS.Q4_RIKTIG)) {
        forbedring.push('Spørsmålet om en tekst fra vår egen tid lå utenfor presentasjonen din. Forbered baklomme-tekster (som Aldri godt nok fra 2024) og koble temaet til i dag.');
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
        '- Muntlig eksamen i norsk (hele oppskriften): /norsk/eksamen/muntlig\n' +
        '- Slik ser en 6-er ut (modellsvar): /norsk/eksamen/muntlig-modell\n' +
        '- Tekstbiblioteket: /norsk/bibliotek'
    );
}

export const eksamenNorskConfig: GameConfig = {
    id: 'eksamen-norsk',
    title: 'Muntlig eksamen i norsk',
    subtitle: 'Tre dager: trekk faget, forbered deg, framfør',
    subject: 'norsk',
    description:
        'Tre dager, som på en ekte muntlig eksamen. Først trekker du faget. På forberedelsesdagen ' +
        'trekker du oppgaven og forbereder deg med tekster, påstand og epokekobling. Til slutt framfører du ' +
        'for sensor - og hvor godt det går, avhenger av hvor godt du forberedte deg.',
    thumbnail: '',

    learningGoals: [
        'Forstå gangen i en muntlig eksamen i norsk: trekke fag, forberedelsesdag, og framføring.',
        'Bygge en presentasjon rundt en skarp påstand med tekster fra ulike epoker, presise sitater og navngitte virkemidler.',
        'Møte oppfølgingsspørsmål i en fagsamtale, også et spørsmål som kobler temaet til vår egen tid.',
    ],
    curriculumTags: ['norsk', 'litteratur', 'virkemidler', 'analyse', 'litteraturhistorie', 'eksamen', 'muntlig'],

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
        subtitle: 'Norsk - tre dager',
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
            objective: 'Gå inn på forberedelsesrommet. Les oppgaven og forbered deg. Du må iallfall skrive en stikkordlapp før du kan gå inn til eksamen.',
        },
        {
            phase: 'framfore',
            objective: 'Gå inn til eksamen. Hils på faglæreren, hold presentasjonen, og svar på spørsmålene fra sensor.',
        },
    ],

    endText: buildEndText,

    setupScene: setupEksamenNorskScene,
};
