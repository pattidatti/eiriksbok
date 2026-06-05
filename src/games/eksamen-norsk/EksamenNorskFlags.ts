// Typesikre flagg-navn for eksamen-norsk-spillet.
// Se BUILD_GAME_GUIDE.md §5.2. Hvert flagg har unik streng-verdi (defineFlags throw-er ved duplikat).

import { defineFlags, type FlagValue } from '../engine/dsl';

export const FLAGS = defineFlags({
    // ── Del 1: Trekke fag ──
    FAG_TRUKKET: 'eksn-fag-trukket', // eleven har trukket faget (norsk) - åpner dør til forberedelse

    // ── Del 2: Trekke oppgave + forberede ──
    OPPGAVE_TRUKKET: 'eksn-oppgave-trukket',     // eleven har lest oppgavearket
    HAR_TEKSTER: 'eksn-har-tekster',             // valgt tekster fra biblioteket (Askeladden, Karens jul, Sult)
    HAR_PAASTAND: 'eksn-har-paastand',           // forberedt en skarp påstand (tese)
    HAR_EPOKEKOBLING: 'eksn-har-epokekobling',   // laget tankekart og koblet tekstene til epoker
    HAR_BAKLOMME: 'eksn-har-baklomme',           // forberedt baklomme-tekster til samtalen (Aldri godt nok m.fl.)
    HAR_MANUS: 'eksn-har-manus',                 // skrevet stikkordlapp og øvd - åpner dør til eksamen

    // ── Del 3: Framføre - presentasjonen ──
    APNET_TESE: 'eksn-apnet-tese',               // åpnet med en skarp påstand (krever forberedelse)
    LESTE_MANUS: 'eksn-leste-manus',             // leste rett fra manus (svakt)
    KOBLET_EPOKE: 'eksn-koblet-epoke',           // analyserte og koblet tekstene til epoker punkt for punkt (krever forberedelse)
    KJERNE_RIKTIG: 'eksn-kjerne-riktig',         // den røde tråden: framgang betyr ulikt i hver epoke
    BRUKTE_SITATER: 'eksn-brukte-sitater',       // presise sitater + navngitt litterært virkemiddel (krever forberedelse)
    BRUKTE_PATOS: 'eksn-brukte-patos',           // appellerte til følelser
    BRUKTE_ETOS: 'eksn-brukte-etos',             // bygde egen troverdighet
    SIRKLET_TILBAKE: 'eksn-sirklet-tilbake',     // sirklet tilbake til påstanden i avslutningen (krever forberedt påstand)

    // ── Del 3: Framføre - fagsamtalen ──
    Q1_RIKTIG: 'eksn-q1-riktig',  // forståelse: hvor motgangen ligger hos Skram vs Hamsun
    Q2_RIKTIG: 'eksn-q2-riktig',  // virkemiddel i dybden: hvordan ironien i Karens jul virker
    Q3_RIKTIG: 'eksn-q3-riktig',  // drøfting/nyanse: fortjener Askeladden framgangen?
    Q4_RIKTIG: 'eksn-q4-riktig',  // bredde: koble temaet til vår egen tid (utenfor presentasjonen)

    // ── Flyt/gating ──
    PRESENTASJON_FERDIG: 'eksn-presentasjon-ferdig',
    FAGSAMTALE_FERDIG: 'eksn-fagsamtale-ferdig',
});

export type EksamenNorskFlag = FlagValue<typeof FLAGS>;
