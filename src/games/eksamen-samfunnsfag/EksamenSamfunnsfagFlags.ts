// Typesikre flagg-navn for eksamen-samfunnsfag-spillet.
// Se BUILD_GAME_GUIDE.md §5.2. Hvert flagg har unik streng-verdi (defineFlags throw-er ved duplikat).

import { defineFlags, type FlagValue } from '../engine/dsl';

export const FLAGS = defineFlags({
    // ── Del 1: Trekke fag ──
    FAG_TRUKKET: 'eks-fag-trukket', // eleven har trukket faget (samfunnsfag) - åpner dør til forberedelse

    // ── Del 2: Trekke oppgave + forberede ──
    OPPGAVE_TRUKKET: 'eks-oppgave-trukket',         // eleven har lest oppgavearket
    HAR_KILDER: 'eks-har-kilder',                   // forberedt egne kilder (Res Gestae, Goebbels 1928)
    HAR_PROBLEMSTILLING: 'eks-har-problemstilling',  // forberedt en skarp problemstilling
    HAR_SAMMENLIGNING: 'eks-har-sammenligning',      // forberedt sammenligningen Roma/Weimar
    HAR_MANUS: 'eks-har-manus',                      // skrevet og øvd på manus - åpner dør til eksamen

    // ── Del 3: Framføre - presentasjonen ──
    APNET_TESE: 'eks-apnet-tese',                     // åpnet med en skarp problemstilling (krever forberedelse)
    LESTE_MANUS: 'eks-leste-manus',                   // leste rett fra manus (svakt)
    BRUKTE_SAMMENLIGNING: 'eks-brukte-sammenligning', // klarte å sammenligne punkt for punkt (krever forberedelse)
    LOVLIG_MAKT: 'eks-lovlig-makt',                   // kjernetesen: makt tatt innenfra, lovlig, i krise
    BRUKTE_LOGOS: 'eks-brukte-logos',                 // appellerte med fakta/logikk
    BRUKTE_PATOS: 'eks-brukte-patos',                 // appellerte til følelser
    BRUKTE_ETOS: 'eks-brukte-etos',                   // bygde egen troverdighet
    VISTE_KILDER: 'eks-viste-kilder',                 // viste til egne kilder (krever forberedelse)

    // ── Del 3: Framføre - fagsamtalen ──
    Q1_RIKTIG: 'eks-q1-riktig',  // fakta: likheten mellom Augustus og Hitler
    Q2_RIKTIG: 'eks-q2-riktig',  // forståelse: hvorfor folket lot det skje
    Q3_RIKTIG: 'eks-q3-riktig',  // drøfting: kunne det vært unngått
    Q4_RIKTIG: 'eks-q4-riktig',  // bredde: dagens norske demokrati (utenfor presentasjonen)

    // ── Flyt/gating ──
    PRESENTASJON_FERDIG: 'eks-presentasjon-ferdig',
    FAGSAMTALE_FERDIG: 'eks-fagsamtale-ferdig',
});

export type EksamenFlag = FlagValue<typeof FLAGS>;
