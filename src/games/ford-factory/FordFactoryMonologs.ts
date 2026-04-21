import type { MonologNode, MonologTrigger } from '../engine/types';

// Indre monologer fra Ford og undertekster fra arbeidere.
// Språk: 14-åring-forståelig bokmål. Ingen em-dash, ingen tankestrek - kun bindestrek.
export const fordFactoryMonologs: Record<string, MonologNode> = {
    // ───── Ford-monologer (intro) ─────
    intro_ford: {
        id: 'intro_ford',
        lines: [
            'Highland Park, Detroit. Januar 1908.',
            'Jeg har bygget biler i fem år. Hver eneste tar en hel dag.',
            'Det må finnes en bedre måte.',
        ],
        once: true,
    },

    // ───── 1913 - under produksjon ─────
    production_start: {
        id: 'production_start',
        lines: [
            'Båndet beveger seg.',
            'Biler glir forbi meg. Én stopp, én håndgrep, videre.',
            'Vi har gjort det.',
        ],
        once: true,
    },

    // ───── 1914 - Ford-monolog om 5-dollar-dagen ─────
    ford_1914: {
        id: 'ford_1914',
        lines: [
            'Det er 1914. Tre av fire arbeidere slutter hvert år.',
            'Samlebåndet er så hardt at menn bryter sammen.',
            'I dag dobler jeg lønnen. Fem dollar om dagen.',
            'La arbeiderne bli. La dem kjøpe bilene de bygger.',
        ],
        once: true,
        lineDurationMs: 4500,
    },

    // ───── Arbeider-stemmer (undertekster ved stasjoner) ─────
    worker_chassis: {
        id: 'worker_chassis',
        lines: [
            '(Arbeider ved chassis-stasjonen:)',
            '"Jeg løfter samme ramme tre hundre ganger om dagen. Ryggen min er ikke seksten år lenger."',
        ],
        once: true,
    },
    worker_motor: {
        id: 'worker_motor',
        lines: [
            '(Arbeider ved motor-stasjonen:)',
            '"Samme bolt. Samme vinkel. I åtte timer. Hjernen min har sluttet å tenke."',
        ],
        once: true,
    },
    worker_wheels: {
        id: 'worker_wheels',
        lines: [
            '(Arbeider ved hjul-stasjonen:)',
            '"Jeg tjener fem dollar uken her. Jeg kan kjøpe en Model T på tre år hvis jeg ikke spiser."',
        ],
        once: true,
    },
    worker_body: {
        id: 'worker_body',
        lines: [
            '(Arbeider ved karosseri-stasjonen:)',
            '"Min bror sluttet forrige uke. Han sa båndet aldri stopper, selv når han lukker øynene."',
        ],
        once: true,
    },

    // ───── 1914 - mørkere arbeiderstemmer ─────
    worker_1914_tired: {
        id: 'worker_1914_tired',
        lines: [
            '(En arbeider, stille:)',
            '"Jeg drømmer om båndet. Jeg drømmer om bolter. Det er aldri slutt."',
        ],
        once: true,
    },
    worker_1914_hope: {
        id: 'worker_1914_hope',
        lines: [
            '(En annen arbeider:)',
            '"Fem dollar om dagen. Jeg blir. For konas skyld. For barna."',
        ],
        once: true,
    },

    // ───── Ford - avsluttende refleksjon ─────
    ford_reflection: {
        id: 'ford_reflection',
        lines: [
            'Jeg ville gjøre biler rimelige for vanlige folk.',
            'Jeg gjorde det. Men jeg gjorde også arbeidet til noe annet.',
            'Mennene er blitt deler av maskinen. Det er prisen.',
        ],
        once: true,
        lineDurationMs: 4500,
    },
};

// Posisjonsbaserte triggere. Koordinatsystemet: båndet går fra x=-8 til x=+8, stasjoner
// på nordsiden ved z=-2. Player starter ved (0, 0, 10).
// Triggerne er romslige så spilleren ikke må stå helt nøyaktig.
export const fordFactoryTriggers: MonologTrigger[] = [
    // Ford-intro når spillet starter (spiller ved entré)
    {
        id: 't_intro_ford',
        monologId: 'intro_ford',
        area: { minX: -3, maxX: 3, minZ: 8, maxZ: 12 },
    },

    // Arbeider-stemmer ved hver stasjon (trigges under running_1913 og year_1914)
    {
        id: 't_worker_chassis',
        monologId: 'worker_chassis',
        area: { minX: -9, maxX: -5, minZ: -1, maxZ: 3 },
        requiresPhase: 'running_1913',
    },
    {
        id: 't_worker_motor',
        monologId: 'worker_motor',
        area: { minX: -3, maxX: -0.5, minZ: -1, maxZ: 3 },
        requiresPhase: 'running_1913',
    },
    {
        id: 't_worker_wheels',
        monologId: 'worker_wheels',
        area: { minX: 0.5, maxX: 3, minZ: -1, maxZ: 3 },
        requiresPhase: 'running_1913',
    },
    {
        id: 't_worker_body',
        monologId: 'worker_body',
        area: { minX: 5, maxX: 9, minZ: -1, maxZ: 3 },
        requiresPhase: 'running_1913',
    },

    // 1914-stemmer (samme områder, ny fase)
    {
        id: 't_worker_1914_tired',
        monologId: 'worker_1914_tired',
        area: { minX: -3, maxX: 3, minZ: -1, maxZ: 3 },
        requiresPhase: 'year_1914',
    },
    {
        id: 't_worker_1914_hope',
        monologId: 'worker_1914_hope',
        area: { minX: 5, maxX: 9, minZ: -1, maxZ: 3 },
        requiresPhase: 'year_1914',
    },
];
