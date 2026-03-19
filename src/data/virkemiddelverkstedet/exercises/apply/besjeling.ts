import type { Exercise } from '../../types';

export const besjelingApplyExercises: Exercise[] = [
    // === NIVÅ 1 – Lærling (insert, choose, fill-blank) ===
    {
        id: 'apply-besjeling-1-1',
        deviceId: 'besjeling',
        level: 1,
        instruction: 'Hvilken setning bruker besjeling best?',
        data: {
            type: 'identify',
            text: 'Du vil beskrive at solen endelig kommer fram etter en lang vinter. Hvilken setning gir solen følelser (besjeling)?',
            options: [
                {
                    deviceId: 'besjeling',
                    label: 'Solen smilte varmt ned på den frosne jorden.',
                    correct: true,
                    feedback:
                        'Riktig! «Smilte varmt» gir solen en følelse (glede). Det er besjeling – å gi noe livløst sjel og følelser.',
                },
                {
                    deviceId: 'besjeling',
                    label: 'Solen skinte på bakken.',
                    correct: false,
                    feedback:
                        'Det er en vanlig beskrivelse. Besjeling krever at du gir solen følelser eller sjel.',
                },
                {
                    deviceId: 'besjeling',
                    label: 'Solen var som et varmt teppe.',
                    correct: false,
                    feedback:
                        'Det er en sammenligning (med «som»), ikke besjeling. Besjeling gir følelser direkte.',
                },
                {
                    deviceId: 'besjeling',
                    label: 'Solen gikk opp klokken sju.',
                    correct: false,
                    feedback:
                        'Det er en nøytral faktaopplysning. Besjeling handler om å gi noe sjel og følelser.',
                },
            ],
        },
    },
    {
        id: 'apply-besjeling-1-2',
        deviceId: 'besjeling',
        level: 1,
        instruction: 'Fyll inn en følelse eller sinnstilstand som passer for fjellene.',
        data: {
            type: 'fill-blank',
            textBefore: 'De gamle fjellene stod der og',
            textAfter: 'over den lille landsbyen.',
            correctAnswers: [
                'våket',
                'drømte',
                'grublet',
                'mediterte',
                'smilte',
                'voktet',
                'sørget',
            ],
            acceptKeywords: ['passet på', 'holdt vakt', 'skuet', 'betraktet', 'fulgte', 'så ned', 'vernet', 'tittet', 'kikket', 'stirret', 'sukket', 'tenkte'],
            hint: 'Gi fjellene en menneskelig handling - noe mennesker gjør, men fjell egentlig ikke kan.',
            explanation:
                'Fjell kan ikke egentlig våke, drømme eller gruble – de er ikke levende. Men når vi gir dem slike følelser, kaller vi det besjeling. Det gjør naturen mer levende og stemningsfull.',
        },
    },
    {
        id: 'apply-besjeling-1-3',
        deviceId: 'besjeling',
        level: 1,
        instruction: 'Hvilken besjeling passer best for å beskrive et trist høstvær?',
        data: {
            type: 'identify',
            text: 'Forfatteren vil at leseren skal føle at selve naturen er trist om høsten. Hvilken setning bruker besjeling?',
            options: [
                {
                    deviceId: 'besjeling',
                    label: 'Trærne stod nakne og sørget over de tapte bladene.',
                    correct: true,
                    feedback:
                        'Riktig! «Sørget» gir trærne en menneskelig følelse (sorg). Det er besjeling som gjør høsten mer stemningsfull.',
                },
                {
                    deviceId: 'besjeling',
                    label: 'Bladene falt fra trærne.',
                    correct: false,
                    feedback:
                        'Det er sant, men det er bare en observasjon. Besjeling gir naturen følelser.',
                },
                {
                    deviceId: 'besjeling',
                    label: 'Høsten var kald og mørk.',
                    correct: false,
                    feedback:
                        'Vanlig beskrivelse. For at det skal bli besjeling, må du gi naturen sjel og følelser.',
                },
                {
                    deviceId: 'besjeling',
                    label: 'Trærne var som gamle skjeletter.',
                    correct: false,
                    feedback:
                        'Det er en sammenligning (med «som»). Besjeling gir følelser direkte, uten å sammenligne.',
                },
            ],
        },
    },

    // === NIVÅ 2 – Svenn (write, match, explain/choose-best) ===
    {
        id: 'apply-besjeling-2-1',
        deviceId: 'besjeling',
        level: 2,
        instruction:
            'Skriv om setningen slik at den bruker besjeling.',
        data: {
            type: 'write',
            prompt: 'Originalsetning: «Det blåste mye den dagen.»\n\nSkriv om setningen med besjeling. Gi vinden følelser – er den sint, leken, trist, engstelig? La naturen ha sjel.',
            hint: 'Tenk: Hvis vinden var en person med følelser, hvordan ville den oppført seg akkurat denne dagen? Er den rasende? Leende? Fortvilet?',
            exampleAnswer:
                'Vinden var rasende den dagen. Den raste av sinne mellom husene og ville ikke gi seg.',
        },
    },
    {
        id: 'apply-besjeling-2-2',
        deviceId: 'besjeling',
        level: 2,
        instruction:
            'Koble hvert naturfenomen med den besjelingen som passer best.',
        data: {
            type: 'match',
            pairs: [
                { example: 'Stille hav ved solnedgang', label: 'Havet hvilte fredelig og drømte om fjerne kyster' },
                { example: 'Kraftig tordenvær', label: 'Himmelen var rasende og brølte av sinne' },
                { example: 'Første vårdag med solskinn', label: 'Solen lo glad og vekket de sovende blomstene' },
                { example: 'Tåke som legger seg over landskapet', label: 'Tåken la seg forsiktig ned, sky og tilbakeholden' },
            ],
        },
    },
    {
        id: 'apply-besjeling-2-3',
        deviceId: 'besjeling',
        level: 2,
        instruction: 'Hvilken besjeling ville styrket denne scenen?',
        data: {
            type: 'explain',
            text: 'Lina gikk hjem fra skolen. Det var mørkt og stille. Månen var oppe, og gatene var tomme.',
            highlightedWords: 'Månen var oppe',
            question:
                'Hvilken besjeling ville gjort månen til en stemningsskapende del av scenen?',
            options: [
                {
                    text: '«Månen fulgte henne engstelig med blikket gjennom de tomme gatene.»',
                    correct: true,
                    feedback:
                        'Riktig! «Fulgte engstelig med blikket» gir månen en følelse (engstelse) og gjør den til en nervøs tilskuer. Det øker spenningen i scenen.',
                },
                {
                    text: '«Månen lyste opp veien.»',
                    correct: false,
                    feedback:
                        'Det er en nøytral beskrivelse. Besjeling krever at du gir månen følelser eller sjel.',
                },
                {
                    text: '«Månen var stor og rund den kvelden.»',
                    correct: false,
                    feedback:
                        'Det beskriver utseendet, men gir ikke månen noen følelser. Besjeling handler om sjel, ikke form.',
                },
            ],
        },
    },

    // === NIVÅ 3 – Mester (find-error/fix, advanced write, match) ===
    {
        id: 'apply-besjeling-3-1',
        deviceId: 'besjeling',
        level: 3,
        instruction:
            'En av disse setningene blander sammen besjeling og personifisering. Finn feilen.',
        data: {
            type: 'find-error',
            text: 'Besjeling gir følelser og sjel til noe livløst. Personifisering gir menneskelige handlinger. Hvilken setning prøver å være besjeling, men er egentlig personifisering?',
            errorDescription:
                'Besjeling handler om følelser og indre liv (glede, sorg, frykt). Personifisering handler om handlinger (gå, snakke, slå). De overlapper, men er ikke det samme.',
            options: [
                {
                    text: 'Fjorden tok på seg frakken og gikk en tur langs stranden.',
                    correct: true,
                    feedback:
                        'Riktig! Å «ta på seg frakk» og «gå tur» er konkrete menneskelige handlinger – det er personifisering, ikke besjeling. Besjeling ville vært: «Fjorden lå trist og lengtet etter sommeren.»',
                },
                {
                    text: 'Havet sørget stille i den kalde vinteren.',
                    correct: false,
                    feedback:
                        'Dette er ekte besjeling! «Sørget» er en følelse, og havet får sjel uten å gjøre menneskelige handlinger.',
                },
                {
                    text: 'Fjellet drømte om de gamle dagene da isen dekket dalen.',
                    correct: false,
                    feedback:
                        'God besjeling! «Drømte» gir fjellet et indre liv og følelser, ikke en fysisk menneskelig handling.',
                },
                {
                    text: 'Skyene var melankolske og tunge av ting de aldri fikk sagt.',
                    correct: false,
                    feedback:
                        'Flott besjeling! «Melankolske» og «tunge av ting de aldri fikk sagt» gir skyene et rikt følelsesliv.',
                },
            ],
        },
    },
    {
        id: 'apply-besjeling-3-2',
        deviceId: 'besjeling',
        level: 3,
        instruction:
            'Skriv et stemningsfullt avsnitt der naturen speiler en karakters følelser.',
        data: {
            type: 'write',
            prompt: 'En karakter har nettopp fått vite at familien skal flytte. Hun står ute og ser på landskapet. Skriv 3–4 setninger der du bruker besjeling for å la naturen speile hennes følelser (tristhet, frykt, kanskje et lite håp). Gi minst to naturfenomener følelser.',
            hint: 'Teknikken kalles «pathetic fallacy» – naturen føler det samme som karakteren. Hvis hun er trist, er naturen trist. Kanskje trærne sørger, kanskje vinden er engstelig? Men la også et lite håp skinne gjennom – kanskje en stjerne?',
            exampleAnswer:
                'Trærne bøyde seg tungt, som om de bar den samme sorgen. Vinden sukket gjennom gresset med en fortvilet klagesang. Bare en ensom stjerne lyste trofast gjennom skydekket, som om den nektet å gi opp håpet.',
        },
    },
    {
        id: 'apply-besjeling-3-3',
        deviceId: 'besjeling',
        level: 3,
        instruction:
            'Koble hver følelse med den naturbeskrivelsen som best bruker besjeling.',
        data: {
            type: 'match',
            pairs: [
                {
                    example: 'Ensomhet',
                    label: 'Den siste løvetannen stod forlatt på marken og lengtet etter selskap',
                },
                {
                    example: 'Glede og feiring',
                    label: 'Elvene lo og sprutet mot steinene i ren begeistring',
                },
                {
                    example: 'Angst og uro',
                    label: 'Skyggene krøp engstelig nærmere mens mørket fortvilte over dagslyset',
                },
                {
                    example: 'Fred og tilfredshet',
                    label: 'Innsjøen hvilte fornøyd i armkroken til de grønne åsene',
                },
            ],
        },
    },
];
