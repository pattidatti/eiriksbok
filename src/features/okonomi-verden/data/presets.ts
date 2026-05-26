import type { Capsule } from '../types';

export const CAPSULES: Capsule[] = [
    {
        id: 'frimarked',
        title: 'Marked uten inngrep',
        subtitle: 'Hva skjer hvis ingen styrer?',
        summary: 'Ingen sentralbank, ingen skatt, ingen regler for bedriftene. Bare frivillig handel mellom mennesker. Klarer økonomien seg selv?',
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
                text: 'Hold økonomien stabil i 300 ticks uten at en krise rammer',
                metric: 'malinvestment',
                threshold: 20,
                direction: 'below',
            },
        ],
        narrativeBeats: [
            {
                atTick: 0,
                title: 'Ingen styrer økonomien',
                body: 'Pengemengden er låst fast. Renten settes av folk som faktisk sparer og låner. Ingen sentralbank gjetter på riktig nivå. Ulike skoler er uenige om hva som vil skje - i denne modellen blir det stabilt. Prøv det og se.',
                quote: {
                    text: 'I et fritt marked formidler prisene sannheten om hvor knapt noe er, og hvor tålmodige folk er. Når noen roter med prisene, mister vi signalet.',
                    author: 'Friedrich Hayek (parafrasert)',
                },
            },
            {
                atTick: 200,
                title: 'Stabil orden - i denne modellen',
                body: 'Naturlig rente og styringsrente er like, fordi det bare finnes én rente når markedet bestemmer. Ingen feilinvestering bygger seg opp. Husk: denne modellen antar at markedet alltid finner balansen selv. En keynesianer ville pekt på 1930-tallet og vært uenig.',
            },
        ],
        linkedArticles: ['naturlig-rente', 'pengesystem-vs-naturalhandel', 'produksjon', 'okonomiske-skoler'],
    },
    {
        id: 'naturlig-likevekt',
        title: 'Balansens land',
        subtitle: 'Vanlig økonomi - prøv selv',
        summary: 'Sentralbanken setter rente nær det folk faktisk vil låne ut for. Liten skatt og lite inngrep. Klarer du å holde balansen, eller vil du eksperimentere?',
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
                body: 'Folk sparer og bruker som de selv vil. Renten gjenspeiler hvor tålmodige de er. Sentralbanken ligger tett opp mot dette nivået - foreløpig. Hva skjer hvis du senker renten, eller skrur opp pengetrykket? Prøv.',
                quote: {
                    text: 'Renten finner sitt nivå der dem som vil spare møter dem som vil låne.',
                    author: 'Eugen von Böhm-Bawerk (parafrasert)',
                },
            },
        ],
        linkedArticles: ['naturlig-rente', 'inflasjon-og-rente', 'okonomiske-skoler'],
    },
    {
        id: 'weimar-1923',
        title: 'Weimar 1923',
        subtitle: 'Når pengene mister mening',
        summary: 'Tyskland trykker penger for å betale krigsgjeld. Trykkpressen går varm. Klarer du å stoppe hyperinflasjonen før samfunnet kollapser?',
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
                body: 'Riksbanken trykker penger for å betale krigserstatninger til seierherrene. Prisene stiger raskere enn lønningene. Folk begynner å miste tilliten til pengene. Historisk: dette ble ikke løst med rentepolitikk alene - tyskerne måtte til slutt innføre en helt ny valuta.',
                quote: {
                    text: 'Inflasjon spiser opp sparingen først. Så spiser den opp tilliten.',
                    author: 'Ludwig von Mises (parafrasert)',
                },
            },
            {
                atTick: 100,
                title: 'Tilliten brister',
                body: 'Hvis ingen stanser trykkpressen, blir pengene snart verdiløse. Hva slags rentepolitikk og pengepolitikk trengs for å snu? Husk at modellen forenkler - i virkeligheten spilte også Versailles-erstatningene og Ruhr-okkupasjonen en stor rolle.',
            },
        ],
        linkedArticles: ['inflasjon-og-rente', 'naturlig-rente', 'pengesystem-vs-naturalhandel', 'okonomiske-skoler'],
    },
];

export function findCapsule(id: string | null): Capsule | undefined {
    if (!id) return undefined;
    return CAPSULES.find((c) => c.id === id);
}
