import type { Capsule } from '../types';

export const CAPSULES: Capsule[] = [
    {
        id: 'frimarked',
        title: 'Det frie markedet',
        subtitle: 'Rothbards og Hayeks drøm',
        summary: 'Ingen sentralbank. Ingen skatt. Ingen regulering. Bare frivillige bytter mellom mennesker. Hva slags samfunn vokser fram?',
        icon: 'wind',
        initialControls: {
            policyRate: 5,
            moneyGrowth: 0,
            taxRate: 0,
            publicSpend: 0,
            regulation: 0,
            priceCeiling: { enabled: false, level: 1.0 },
            wageFloor: { enabled: false, level: 80 },
            freeMarket: true,
        },
        initialState: {
            avgTimePreference: 0.5,
            M: 10000,
        },
        objectives: [
            {
                id: 'no-bust',
                text: 'Bevar fri likevekt uten å trigge bust i 300 ticks',
                metric: 'malinvestment',
                threshold: 20,
                direction: 'below',
            },
        ],
        narrativeBeats: [
            {
                atTick: 0,
                title: 'Markedet er fritt',
                body: 'Pengemengden er fast. Renten settes av de som faktisk sparer og låner. Ingen sentral planlegger gjetter på riktig nivå — millioner av enkeltvalg gjør jobben sammen.',
                quote: {
                    text: 'I et fritt marked formidler prisene sannheten om knapphet og tålmodighet. Når staten roter med dem, blir hele systemet blind.',
                    author: 'Murray Rothbard (parafrasert)',
                },
            },
            {
                atTick: 200,
                title: 'Stabil orden',
                body: 'Legg merke til at naturlig rente og styringsrente er identiske — for det er bare én rente når markedet får bestemme. Ingen feilinvestering hoper seg opp. Ingen kunstig boom. Bare reell vekst basert på reell sparing.',
            },
        ],
        linkedArticles: ['naturlig-rente', 'pengesystem-vs-naturalhandel', 'produksjon'],
    },
    {
        id: 'naturlig-likevekt',
        title: 'Naturlig likevekt',
        subtitle: 'Sandkasse-baseline',
        summary: 'Et fritt marked der sentralbanken setter rente nær den naturlige. Prøv å holde balansen, eller eksperimenter med å vri.',
        icon: 'scale',
        initialControls: {
            policyRate: 5,
            moneyGrowth: 0.02,
            taxRate: 0.2,
            publicSpend: 0.2,
            regulation: 1,
            priceCeiling: { enabled: false, level: 1.0 },
            wageFloor: { enabled: false, level: 80 },
        },
        initialState: {
            avgTimePreference: 0.5,
            M: 10000,
        },
        objectives: [
            {
                id: 'keep-stable',
                text: 'Hold inflasjon under 3 % i 200 ticks',
                metric: 'inflation',
                threshold: 3,
                direction: 'below',
            },
        ],
        narrativeBeats: [
            {
                atTick: 0,
                title: 'Velkommen til balansens land',
                body: 'Folk sparer og bruker som de selv vil. Renten gjenspeiler tålmodigheten deres. Sentralbanken har lagt seg tett opp mot den naturlige renten — for nå.',
                quote: {
                    text: 'Den naturlige renten oppstår der spareres tålmodighet møter investorers behov for kapital.',
                    author: 'Eugen von Böhm-Bawerk',
                },
            },
        ],
        linkedArticles: ['naturlig-rente', 'inflasjon-og-rente'],
    },
    {
        id: 'weimar-1923',
        title: 'Weimar 1923',
        subtitle: 'Når pengene mister mening',
        summary: 'Tyskland trykker penger for å betale krigsgjeld. Trykkpressen går varm. Klarer du å bremse hyperinflasjonen før samfunnet kollapser?',
        icon: 'flame',
        initialControls: {
            policyRate: 4,
            moneyGrowth: 0.5,
            taxRate: 0.35,
            publicSpend: 0.5,
            regulation: 3,
            priceCeiling: { enabled: false, level: 1.0 },
            wageFloor: { enabled: false, level: 80 },
        },
        initialState: {
            avgTimePreference: 0.6,
            M: 25000,
        },
        objectives: [
            {
                id: 'stop-inflation',
                text: 'Få årlig inflasjon under 5 %',
                metric: 'inflation',
                threshold: 5,
                direction: 'below',
            },
        ],
        narrativeBeats: [
            {
                atTick: 0,
                title: 'Trykkpressen ruller',
                body: 'Riksbanken har skrudd opp pengetrykket for å betale krigserstatninger. Priser stiger raskere enn lønninger. Folk begynner å miste tilliten til pengene.',
                quote: {
                    text: 'Den første konsekvensen av inflasjon er at den ødelegger sparingen. Den andre er at den ødelegger tilliten.',
                    author: 'Ludwig von Mises',
                },
            },
            {
                atTick: 100,
                title: 'Tilliten brister',
                body: 'Hvis ingen stanser trykkpressen nå, blir pengene snart verdiløse. Spør deg selv: hva slags rentepolitikk og pengepolitikk trengs for å gjenopprette stabilitet?',
            },
        ],
        linkedArticles: ['inflasjon-og-rente', 'naturlig-rente', 'pengesystem-vs-naturalhandel'],
    },
];

export function findCapsule(id: string | null): Capsule | undefined {
    if (!id) return undefined;
    return CAPSULES.find((c) => c.id === id);
}
