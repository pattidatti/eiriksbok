import type { QuoteSnippet } from '../types';

export const THINKER_QUOTES: QuoteSnippet[] = [
    // --- Østerriksk skole ---
    {
        text: 'Du kan ikke kurere problemene som kommer av billige lån ved å gi enda billigere lån. Regningen kommer uansett. Spørsmålet er bare om vi tar den nå, eller om vi venter til alt rakner.',
        author: 'Ludwig von Mises',
        source: 'Human Action (1949)',
        tags: ['lens-austrian', 'boom', 'bust', 'kreditt', 'rente-lav'],
    },
    {
        text: 'Ingen samlet plass har all kunnskap som trengs for å sette riktig rente. Kunnskapen finnes spredt hos millioner av mennesker. Det er priser som binder den sammen.',
        author: 'Friedrich Hayek',
        source: 'The Use of Knowledge in Society (1945)',
        tags: ['lens-austrian', 'rente', 'priser', 'marked'],
    },
    {
        text: 'Rente er ikke noe bankene finner på. Rente er prisen på tid.',
        author: 'Eugen von Böhm-Bawerk',
        source: 'Kapital und Kapitalzins (1889)',
        tags: ['lens-austrian', 'rente', 'tidspreferanse'],
    },
    {
        text: 'Når renten settes kunstig lavt, oppfører bedriftene seg som om vi har spart mer enn vi faktisk har. De bygger noe vi ikke kan betale for. Da må prosjektene rives ned igjen.',
        author: 'Friedrich Hayek (parafrasert)',
        source: 'Prices and Production (1931)',
        tags: ['lens-austrian', 'rente-lav', 'feilinvestering', 'boom'],
    },
    {
        text: 'Inflasjon flytter rikdom stille. Den tar fra dem som har spart og gir til dem som har lånt med fast rente. Mange merker det ikke før det er for sent.',
        author: 'Ludwig von Mises (parafrasert)',
        tags: ['lens-austrian', 'inflasjon', 'penger', 'sparing'],
    },

    // --- Keynesiansk ---
    {
        text: 'På lang sikt er vi alle døde. Hvis stormen er voldsom, hjelper det ikke at bølgene legger seg en gang i fremtiden. Vi må gjøre noe nå.',
        author: 'John Maynard Keynes',
        source: 'A Tract on Monetary Reform (1923)',
        tags: ['lens-keynesian', 'bust', 'krise', 'arbeidsledighet'],
    },
    {
        text: 'Når folk slutter å bruke penger fordi de er redde, mister bedriftene kundene. Da må noen tørre å bruke penger, og staten er ofte den eneste som kan.',
        author: 'John Maynard Keynes (parafrasert)',
        source: 'The General Theory (1936)',
        tags: ['lens-keynesian', 'bust', 'offentlig-forbruk'],
    },
    {
        text: 'I en krise hjelper det lite at renten er lav, hvis ingen tør å låne. Da må noen andre skape etterspørsel, ellers står hjulene stille.',
        author: 'Paul Krugman (parafrasert)',
        tags: ['lens-keynesian', 'bust', 'rente', 'offentlig-forbruk'],
    },
    {
        text: 'Markeder er ikke alltid kloke. De kan svinge mellom grådighet og panikk, og noen ganger trenger de en hånd som stabiliserer.',
        author: 'Joseph Stiglitz (parafrasert)',
        source: 'Freefall (2010)',
        tags: ['lens-keynesian', 'regulering', 'marked', 'krise'],
    },
    {
        text: 'Mange av de viktigste nyvinningene i moderne økonomi - internett, GPS, smarttelefoner - bygger på forskning staten betalte for. Markedet alene ville aldri tatt risikoen.',
        author: 'Mariana Mazzucato (parafrasert)',
        source: 'The Entrepreneurial State (2013)',
        tags: ['lens-keynesian', 'offentlig-forbruk', 'marked'],
    },

    // --- Monetarisme / sentralbank ---
    {
        text: 'Inflasjon er alltid og overalt et pengefenomen. Vokser pengemengden raskere enn det folk lager, stiger prisene.',
        author: 'Milton Friedman',
        source: 'The Counter-Revolution in Monetary Theory (1970)',
        tags: ['lens-monetarist', 'inflasjon', 'penger'],
    },
    {
        text: 'Den store depresjonen ble ikke verre fordi markedet sviktet. Den ble verre fordi sentralbanken lot pengemengden krympe og slik kvalt økonomien.',
        author: 'Milton Friedman (parafrasert)',
        source: 'A Monetary History of the United States (1963)',
        tags: ['lens-monetarist', 'bust', 'krise', 'sentralbank'],
    },
    {
        text: 'En sentralbank som styrer mot stabil inflasjon og lar markedet bestemme resten, gir den beste rammen vi har sett for langsiktig vekst.',
        author: 'Ben Bernanke (parafrasert)',
        tags: ['lens-monetarist', 'sentralbank', 'inflasjon', 'rente'],
    },
    {
        text: 'Regler er bedre enn skjønn. En sentralbank som følger klare regler bygger tillit. En som gjetter, mister den.',
        author: 'Milton Friedman (parafrasert)',
        tags: ['lens-monetarist', 'sentralbank', 'regulering'],
    },

    // --- Post-keynesiansk / Minsky / strukturell ---
    {
        text: 'Stabilitet skaper ustabilitet. Når alt går bra, tar folk større sjanser med lån. Når regningen kommer, kan hele systemet skjelve.',
        author: 'Hyman Minsky',
        source: 'Stabilizing an Unstable Economy (1986)',
        tags: ['lens-post-keynesian', 'boom', 'bust', 'finans', 'kreditt'],
    },
    {
        text: 'Bobler oppstår der pengene strømmer inn raskest, ofte i finans og eiendom, ikke i fabrikker. Det er der vi må følge med.',
        author: 'Hyman Minsky (parafrasert)',
        tags: ['lens-post-keynesian', 'boom', 'finans'],
    },
    {
        text: 'Når banker konkurrerer om å gi flest mulig lån, lærer alle å overse risiko. Det går bra inntil det ikke gjør det.',
        author: 'Hyman Minsky (parafrasert)',
        tags: ['lens-post-keynesian', 'kreditt', 'bust', 'finans'],
    },
    {
        text: 'En økonomi som lar ulikheten vokse for mye, mister til slutt motoren sin: folk som faktisk har råd til å kjøpe det andre lager.',
        author: 'Thomas Piketty (parafrasert)',
        source: 'Capital in the Twenty-First Century (2013)',
        tags: ['lens-post-keynesian', 'ulikhet', 'marked'],
    },

    // --- Tverrgående / klassikere som flere skoler aksepterer ---
    {
        text: 'Det er ikke fabrikkeieren som bestemmer hva som blir laget. Det er kundene som hver dag stemmer med pengene sine.',
        author: 'Ludwig von Mises',
        source: 'Bureaucracy (1944)',
        tags: ['lens-austrian', 'marked', 'priser'],
    },
    {
        text: 'Markedet er en oppfinnsom mekanisme, men det er menneskene som lager reglene. Reglene bestemmer hva markedet faktisk lærer oss.',
        author: 'Dani Rodrik (parafrasert)',
        tags: ['lens-keynesian', 'lens-post-keynesian', 'regulering', 'marked'],
    },
];

export type LensId = 'lens-austrian' | 'lens-keynesian' | 'lens-monetarist' | 'lens-post-keynesian';

export const LENS_LABELS: Record<LensId, string> = {
    'lens-austrian': 'Østerriksk skole',
    'lens-keynesian': 'Keynesiansk',
    'lens-monetarist': 'Monetaristisk',
    'lens-post-keynesian': 'Post-keynesiansk',
};

export interface QuoteSelectionContext {
    policyRate: number;
    naturalRate: number;
    inflation: number;
    phase: 'expansion' | 'boom' | 'bust' | 'recovery';
    activeView: string;
    freeMarket?: boolean;
}

/**
 * Velg et sitat basert på tilstand. Roterer mellom skoler slik at eleven møter
 * flere perspektiver, ikke bare ett. Seed brukes til å bla videre i listen.
 */
export function selectQuote(ctx: QuoteSelectionContext, seed: number): QuoteSnippet {
    const matchTags = new Set<string>();

    if (ctx.policyRate < ctx.naturalRate - 1) matchTags.add('rente-lav');
    if (ctx.inflation > 5) matchTags.add('inflasjon');
    if (ctx.phase === 'boom') matchTags.add('boom');
    if (ctx.phase === 'bust') {
        matchTags.add('bust');
        matchTags.add('krise');
    }
    if (ctx.activeView === 'triangle') matchTags.add('feilinvestering');
    if (ctx.activeView === 'village') matchTags.add('arbeidsledighet');

    // Alltid gi noe selv om ingenting matcher
    if (matchTags.size === 0) matchTags.add('rente');

    const scored = THINKER_QUOTES.map((q) => {
        const overlap = q.tags.filter((t) => matchTags.has(t)).length;
        return { q, score: overlap };
    });

    const maxScore = Math.max(...scored.map((s) => s.score));
    const top = scored.filter((s) => s.score === maxScore).map((s) => s.q);

    // Roter mellom linser i toppen for å sikre flerstemmighet
    if (top.length > 1) {
        const lenses = ['lens-austrian', 'lens-keynesian', 'lens-monetarist', 'lens-post-keynesian'];
        const targetLens = lenses[seed % lenses.length];
        const byLens = top.filter((q) => q.tags.includes(targetLens));
        if (byLens.length > 0) {
            return byLens[Math.floor(seed / lenses.length) % byLens.length];
        }
    }

    return top[seed % top.length];
}

export function lensOf(quote: QuoteSnippet): LensId | null {
    const lensTag = quote.tags.find((t) => t.startsWith('lens-')) as LensId | undefined;
    return lensTag ?? null;
}
