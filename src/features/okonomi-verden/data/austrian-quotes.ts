import type { QuoteSnippet } from '../types';

export const AUSTRIAN_QUOTES: QuoteSnippet[] = [
    {
        text: 'Det er ikke mulig å kurere konsekvensene av kreditt-ekspansjon ved å fortsette den. Konsekvensene må komme. Spørsmålet er bare om de skal komme tidlig som resultat av frivillig stans, eller senere som total katastrofe.',
        author: 'Ludwig von Mises',
        source: 'Human Action (1949)',
        tags: ['boom', 'bust', 'kreditt', 'rente-lav'],
    },
    {
        text: 'Kunnskapen som trengs for å sette riktig rente, finnes ikke samlet noe sted. Den er spredt blant millioner av mennesker, og bare prissystemet kan formidle den.',
        author: 'Friedrich Hayek',
        source: 'Prices and Production (1931)',
        tags: ['rente', 'kunnskapsproblem', 'priser'],
    },
    {
        text: 'Den naturlige renten er resultatet av millioner av individuelle valg om å spare eller bruke penger. Ingen enkeltperson — og heller ingen sentralbank — kan beregne den.',
        author: 'Friedrich Hayek (parafrasert)',
        source: 'Prices and Production',
        tags: ['naturlig-rente', 'rente'],
    },
    {
        text: 'Rente er ikke noe bankene finner på. Rente er prisen på tid.',
        author: 'Eugen von Böhm-Bawerk',
        source: 'Kapital und Kapitalzins (1889)',
        tags: ['rente', 'tidspreferanse'],
    },
    {
        text: 'Inflasjon er en form for tyveri som er enda farligere fordi den er usynlig. Den stjeler stille fra spareren og gir til den som låner med fast rente.',
        author: 'Ludwig von Mises (parafrasert)',
        tags: ['inflasjon', 'penger', 'sparing'],
    },
    {
        text: 'Spontan orden vokser ikke fram fordi noen har planlagt den, men fordi millioner av mennesker følger enkle regler — å handle, spare, prøve, feile.',
        author: 'Friedrich Hayek',
        source: 'The Constitution of Liberty (1960)',
        tags: ['spontan-orden', 'marked', 'likevekt'],
    },
    {
        text: 'I et fritt marked er pristak alltid pistolen mot prisens hode. Du dreper signalet, ikke problemet.',
        author: 'Henry Hazlitt (parafrasert)',
        tags: ['pristak', 'regulering', 'priser'],
    },
    {
        text: 'Når sentralbanken senker renten kunstig, sender den en løgn ut i økonomien: at det finnes flere ressurser enn det egentlig gjør. Entreprenører bygger på en illusjon.',
        author: 'Friedrich Hayek (parafrasert)',
        tags: ['rente-lav', 'feilinvestering', 'boom', 'sentralbank'],
    },
    {
        text: 'Uten markedspriser kan ingen vite hvilken bruk av ressurser som er den minst sløsende. Det er det Mises kalte kalkulasjonsproblemet.',
        author: 'Ludwig von Mises (parafrasert)',
        source: 'Economic Calculation in the Socialist Commonwealth (1920)',
        tags: ['kalkulasjon', 'planøkonomi', 'priser'],
    },
    {
        text: 'Staten er ikke noe annet enn en bande av ranere på stor skala. Det eneste forsvaret mot dem er et samfunn som tar tilbake kontrollen over sine egne valg, sine egne penger, sin egen rente.',
        author: 'Murray Rothbard (parafrasert)',
        source: 'The Ethics of Liberty (1982)',
        tags: ['frimarked', 'stat', 'rothbard'],
    },
    {
        text: 'Det er ingen annen vei til vedvarende velstand enn frivillig samarbeid. Tvang skaper bare midlertidig illusjon av orden.',
        author: 'Murray Rothbard (parafrasert)',
        tags: ['frimarked', 'rothbard'],
    },
    {
        text: 'I et fritt marked er det ikke kapitalisten som bestemmer over forbrukeren — det er forbrukerens daglige valg som styrer hva som produseres.',
        author: 'Ludwig von Mises',
        source: 'Bureaucracy (1944)',
        tags: ['frimarked', 'marked', 'priser'],
    },
];

export interface QuoteSelectionContext {
    policyRate: number;
    naturalRate: number;
    inflation: number;
    phase: 'expansion' | 'boom' | 'bust' | 'recovery';
    activeView: string;
    freeMarket?: boolean;
}

export function selectQuote(ctx: QuoteSelectionContext, seed: number): QuoteSnippet {
    const matchTags = new Set<string>();
    if (ctx.freeMarket) {
        matchTags.add('frimarked');
        matchTags.add('rothbard');
        matchTags.add('marked');
    } else {
        if (ctx.policyRate < ctx.naturalRate - 1) matchTags.add('rente-lav');
        if (ctx.policyRate < ctx.naturalRate - 1) matchTags.add('sentralbank');
        if (ctx.inflation > 5) matchTags.add('inflasjon');
        if (ctx.phase === 'boom') matchTags.add('boom');
        if (ctx.phase === 'bust') matchTags.add('bust');
        if (ctx.activeView === 'triangle') matchTags.add('feilinvestering');
        matchTags.add('rente');
    }

    const scored = AUSTRIAN_QUOTES.map((q) => {
        const overlap = q.tags.filter((t) => matchTags.has(t)).length;
        return { q, score: overlap };
    });
    const maxScore = Math.max(...scored.map((s) => s.score));
    const top = scored.filter((s) => s.score === maxScore);
    return top[seed % top.length].q;
}
