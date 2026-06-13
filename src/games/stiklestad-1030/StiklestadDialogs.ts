import type { DialogNode } from '../engine/types';

// ─── Stiklestad 1030 - dialoger ──────────────────────────────────────────────
// Ren data. Flagg/handlinger wires i StiklestadAssets (choice.action/onEnd settes
// der, så denne fila slipper å kjenne motoren). Bokmål, korte setninger, hver
// replikk for seg. Læringsmål: hvorfor slaget sto, Olav blir helgen, hva kristningen
// endret.

// Tormod Kolbrunarskald - skald og mentor. Forteller og rammeforteller.
// tormod_greeting er en variant-liste: motoren velger første variant der condition
// stemmer (mest spesifikk først, fallback uten condition SIST). Slik bytter Tormods
// E-samtale med fasen. De tre reflekterende valgene i kveld-varianten wires i Assets
// (setter elevens-syn). Bruk indeks-kommentarene under hvis du endrer rekkefølgen.
export const tormodDialogs: Record<string, DialogNode | DialogNode[]> = {
    tormod_greeting: [
        // [0] Slaget: på ryggen, like før kampen.
        {
            condition: { flagsRequired: ['phase-slaget'] },
            speaker: 'Tormod',
            text: 'Der kommer de. Bli bak skjoldene og kast når de bryter gjennom. Og pass på kongen.',
            cameraFraming: 'speaker',
            choices: [{ text: 'Jeg er klar.', next: null }],
        },
        // [1] Kvelden: den reflekterende bål-samtalen. Valget farger slutt-teksten.
        {
            condition: { flagsRequired: ['phase-kvelden'] },
            speaker: 'Tormod',
            text: 'Sett deg ved ilden, gutt. I morgen blir mange ord til løgn og noen få til sannhet. Når alt er over - hva vil du selv bære med deg herfra?',
            cameraFraming: 'speaker',
            choices: [
                // [0] tro, [1] tvil, [2] ettermæle - action settes i Assets.
                { text: 'Troen Olav kjempet for.', next: 'tormod_ettermaele_slutt' },
                { text: 'Tvilen til dem som ikke ville ha den.', next: 'tormod_ettermaele_slutt' },
                { text: 'Selve ettermælet - hvordan vi husker det.', next: 'tormod_ettermaele_slutt' },
            ],
        },
        // [2] Default (leiren): fallback uten condition, MÅ være sist.
        {
            speaker: 'Tormod',
            text: 'Du er ung til å bære bud i en hær, vannbærer. Men i morgen trenger kongen alle. Hva vil du vite før det blir alvor?',
            cameraFraming: 'speaker',
            choices: [
                { text: 'Hvorfor skal vi slåss?', next: 'tormod_hvorfor' },
                { text: 'Hvem er kong Olav?', next: 'tormod_olav' },
                { text: 'Hva skjer hvis vi taper?', next: 'tormod_tap' },
                { text: 'Jeg er klar.', next: null },
            ],
        },
    ],
    tormod_hvorfor: {
        speaker: 'Tormod',
        text: 'Olav vil samle Norge under én konge og én tro. Da må de små høvdingene gi fra seg makt. Mange bønder liker det ikke. Knut den mektige, kongen i England og Danmark, har lovet dem gull for å jage Olav bort.',
        choices: [
            { text: 'Så bøndene slåss mot sin egen konge?', next: 'tormod_bonder' },
            { text: 'Jeg forstår.', next: 'tormod_greeting' },
        ],
    },
    tormod_bonder: {
        speaker: 'Tormod',
        text: 'Ja. En bondehær venter bak ryggen der nord. De vil ha de gamle gudene og de gamle høvdingene tilbake. I morgen møtes to syn på hva Norge skal være.',
        choices: [{ text: 'Takk, Tormod.', next: 'tormod_greeting' }],
    },
    tormod_olav: {
        speaker: 'Tormod',
        text: 'Olav Haraldsson. Han har vært viking og kriget i fremmede land. Nå vil han være konge over hele Norge og gjøre landet kristent. Han gir seg ikke, selv om han står alene.',
        choices: [{ text: 'Hva tror du om ham?', next: 'tormod_olav2' }],
    },
    tormod_olav2: {
        speaker: 'Tormod',
        text: 'Jeg er hans skald. Min jobb er å huske ham riktig. Det et menneske gjør, dør med kroppen. Det en skald kveder, lever videre.',
        choices: [{ text: 'Jeg forstår.', next: 'tormod_greeting' }],
    },
    tormod_tap: {
        speaker: 'Tormod',
        text: 'Taper vi, faller kongen, og bøndene tror de har vunnet. Men husk ordene mine: et nederlag kan bli til noe større enn en seier. Du får se hva jeg mener.',
        choices: [{ text: 'Det høres dystert ut.', next: 'tormod_greeting' }],
    },

    tormod_ettermaele_slutt: {
        speaker: 'Tormod',
        text: 'Godt svar. Hold fast på det i morgen. Nå må du sove litt. Når sola står opp, går vi mot ryggen.',
        choices: [{ text: 'God natt, Tormod.', next: null }],
    },
};

// Ung hirdmann - troen. Kjemper for Olav og den nye troen.
export const hirdDialogs: Record<string, DialogNode> = {
    hird_greeting: {
        speaker: 'Sigurd',
        text: 'Jeg fryser, men jeg er ikke redd. Kongen døpte meg selv i fjor. Den hvite Krist er sterkere enn Tor, det vet jeg nå.',
        cameraFraming: 'speaker',
        choices: [
            { text: 'Hvorfor tror du på det?', next: 'hird_hvorfor' },
            { text: 'Lykke til i morgen.', next: null },
        ],
    },
    hird_hvorfor: {
        speaker: 'Sigurd',
        text: 'Den nye troen sier at alle er like for Gud, trell som høvding. Det gir meg noe å slåss for. Olav bygger kirker der det før sto blothus. Norge blir et annet land.',
        choices: [{ text: 'Det er sterke ord.', next: null }],
    },
};

// Gammel bonde-soldat - tvilen. Savner det gamle, men står likevel i hæren.
export const bondeDialogs: Record<string, DialogNode> = {
    bonde_greeting: {
        speaker: 'Bård',
        text: 'Jeg fulgte far min til blot ved disse vannene. Nå skal alt det være synd. Kongen tar både gudene våre og skattene våre.',
        cameraFraming: 'speaker',
        choices: [
            { text: 'Hvorfor slåss du da for ham?', next: 'bonde_hvorfor' },
            { text: 'Mange føler nok som deg.', next: null },
        ],
    },
    bonde_hvorfor: {
        speaker: 'Bård',
        text: 'Jeg sverget ham troskap. En mann holder eden sin. Men der nord står naboene mine med øks i hånd, og de mener de slåss for friheten. Sånn river en ny tro et land i to.',
        choices: [{ text: 'Det er tungt.', next: null }],
    },
};

// Kong Olav Haraldsson. Verdig, urokkelig.
export const olavDialogs: Record<string, DialogNode> = {
    olav_greeting: {
        speaker: 'Kong Olav',
        text: 'En vannbærer som ser meg i øynene. Bra. I morgen trenger jeg menn som ikke ser ned. Bær bud raskt, og hold deg i live.',
        cameraFraming: 'speaker',
        emotion: 'triumphant',
        choices: [
            { text: 'Frykter du ikke bondehæren?', next: 'olav_frykt' },
            { text: 'Ja, herre.', next: null },
        ],
    },
    olav_frykt: {
        speaker: 'Kong Olav',
        text: 'Jeg snur ikke. Det jeg begynte, må fullføres, om det så koster meg livet. Et rike. Én tro. Det er verdt alt.',
        choices: [{ text: 'Jeg forstår, herre.', next: null }],
    },
};
