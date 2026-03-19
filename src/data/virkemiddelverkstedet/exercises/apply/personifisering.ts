import type { Exercise } from '../../types';

export const personifiseringApplyExercises: Exercise[] = [
    // === NIVÅ 1 – Lærling (insert, choose, fill-blank) ===
    {
        id: 'apply-personifisering-1-1',
        deviceId: 'personifisering',
        level: 1,
        instruction: 'Hvilken setning bruker personifisering best?',
        data: {
            type: 'identify',
            text: 'Du vil beskrive at datamaskinen er treg. Hvilken setning bruker personifisering?',
            options: [
                {
                    deviceId: 'personifisering',
                    label: 'Datamaskinen nektet å samarbeide.',
                    correct: true,
                    feedback:
                        'Riktig! «Nektet å samarbeide» er en menneskelig handling. Datamaskiner kan ikke nekte – men det føles slik! Det er personifisering.',
                },
                {
                    deviceId: 'personifisering',
                    label: 'Datamaskinen var veldig treg.',
                    correct: false,
                    feedback:
                        'Det er en vanlig beskrivelse. Personifisering gir menneskelige egenskaper til noe som ikke er menneske.',
                },
                {
                    deviceId: 'personifisering',
                    label: 'Datamaskinen var som en snegle.',
                    correct: false,
                    feedback:
                        'Godt bilde! Men dette er en sammenligning (med «som»), ikke personifisering.',
                },
                {
                    deviceId: 'personifisering',
                    label: 'Datamaskinen fungerte ikke.',
                    correct: false,
                    feedback:
                        'Det er en nøytral beskrivelse. Personifisering ville gitt datamaskinen menneskelige trekk.',
                },
            ],
        },
    },
    {
        id: 'apply-personifisering-1-2',
        deviceId: 'personifisering',
        level: 1,
        instruction: 'Fyll inn en menneskelig handling som passer for vinden.',
        data: {
            type: 'fill-blank',
            textBefore: 'Vinden',
            textAfter: 'gjennom gatene den kvelden.',
            correctAnswers: [
                'hvisket',
                'skrek',
                'løp',
                'danset',
                'sang',
                'ropte',
                'klaget',
                'stønnet',
                'jaget',
            ],
            explanation:
                'Vinden kan ikke egentlig hviske, skrike eller danse – det er menneskelige handlinger. Når vi gir vinden slike handlinger, er det personifisering. Det gjør teksten mer levende.',
        },
    },
    {
        id: 'apply-personifisering-1-3',
        deviceId: 'personifisering',
        level: 1,
        instruction:
            'Hvilken personifisering passer best for å beskrive en gammel bil?',
        data: {
            type: 'identify',
            text: 'Bestefars gamle bil stod i garasjen. Forfatteren vil bruke personifisering for å gjøre bilen levende. Hvilken setning passer?',
            options: [
                {
                    deviceId: 'personifisering',
                    label: 'Bilen hostet og stønnet da bestefar prøvde å starte den.',
                    correct: true,
                    feedback:
                        'Riktig! «Hostet og stønnet» er menneskelige ting. Det gjør at vi føler bilens alder og slitasje.',
                },
                {
                    deviceId: 'personifisering',
                    label: 'Bilen var rusten og gammel.',
                    correct: false,
                    feedback:
                        'Sant, men det er bare en beskrivelse. Personifisering gjør bilen til noe menneskelig.',
                },
                {
                    deviceId: 'personifisering',
                    label: 'Bilen lignet en gammel gubbe.',
                    correct: false,
                    feedback:
                        'Nesten! Men «lignet» gjør det til en sammenligning, ikke personifisering.',
                },
                {
                    deviceId: 'personifisering',
                    label: 'Bilen startet ikke på første forsøk.',
                    correct: false,
                    feedback:
                        'Det er en nøytral beskrivelse. Prøv å gi bilen menneskelige egenskaper.',
                },
            ],
        },
    },

    // === NIVÅ 2 – Svenn (write, match, explain/choose-best) ===
    {
        id: 'apply-personifisering-2-1',
        deviceId: 'personifisering',
        level: 2,
        instruction: 'Skriv om setningen slik at den bruker personifisering.',
        data: {
            type: 'write',
            prompt: 'Originalsetning: «Det regnet veldig mye.»\n\nSkriv om setningen med personifisering. Gi regnet eller skyene menneskelige egenskaper – kanskje de gråter, er sinte, eller danser?',
            hint: 'Tenk: Hva gjør mennesker som minner om regn? Gråter? Tromler? Slår? La himmelen oppføre seg som en person.',
            exampleAnswer:
                'Himmelen gråt ustoppelig, og tårene hennes trommelt mot vinduene.',
        },
    },
    {
        id: 'apply-personifisering-2-2',
        deviceId: 'personifisering',
        level: 2,
        instruction: 'Koble hvert objekt med den personifiseringen som passer best.',
        data: {
            type: 'match',
            pairs: [
                { example: 'En klokke som tikker', label: 'Klokken telte nervøst ned sekundene' },
                {
                    example: 'Bølger som slår mot land',
                    label: 'Havet strakte armene sine mot stranden',
                },
                {
                    example: 'En dør som knirker',
                    label: 'Døren klaget høylytt da noen åpnet den',
                },
                {
                    example: 'Solen som skinner etter regn',
                    label: 'Solen tittet forsiktig fram bak skyene',
                },
            ],
        },
    },
    {
        id: 'apply-personifisering-2-3',
        deviceId: 'personifisering',
        level: 2,
        instruction: 'Hvilken personifisering passer best i denne teksten?',
        data: {
            type: 'explain',
            text: 'Det var den siste skoleeksamen. Alle var nervøse. Klokken på veggen viste at det bare var fem minutter igjen.',
            highlightedWords: 'Klokken på veggen',
            question:
                'Hvordan ville du personifisert klokken for å øke spenningen?',
            options: [
                {
                    text: '«Klokken på veggen lo av dem og telte ubarmhjertig ned.»',
                    correct: true,
                    feedback:
                        'Riktig! Å la klokken «le» og «telle ubarmhjertig» gjør den til en nesten ond figur som øker stresset.',
                },
                {
                    text: '«Klokken viste at tiden gikk fort.»',
                    correct: false,
                    feedback:
                        'Det er bare en vanlig beskrivelse. Personifisering gir klokken en personlighet.',
                },
                {
                    text: '«Klokken var rund og hvit med svarte tall.»',
                    correct: false,
                    feedback:
                        'Det beskriver hvordan klokken ser ut, men gir den ingen menneskelige trekk.',
                },
            ],
        },
    },

    // === NIVÅ 3 – Mester (find-error/fix, advanced write, match) ===
    {
        id: 'apply-personifisering-3-1',
        deviceId: 'personifisering',
        level: 3,
        instruction: 'En av disse setningene har svak personifisering. Finn den og tenk på hvorfor.',
        data: {
            type: 'find-error',
            text: 'Hvilken setning har den svakeste personifiseringen?',
            errorDescription:
                'God personifisering gir en tydelig menneskelig egenskap til noe ikke-menneskelig. Svak personifisering er vag og tilfører lite.',
            options: [
                {
                    text: 'Trærne vinket farvel da vi kjørte bort fra hytta.',
                    correct: false,
                    feedback:
                        'Fin personifisering! «Vinket farvel» er en tydelig menneskelig handling som skaper en varm avskjedsscene.',
                },
                {
                    text: 'Datamaskinen ville ikke fungere.',
                    correct: true,
                    feedback:
                        'Riktig! «Ville ikke» er så vanlig at vi nesten ikke tenker på det som personifisering. Det er for svakt til å skape et bilde. Sterkere variant: «Datamaskinen satte seg på bakbeina og nektet å starte.»',
                },
                {
                    text: 'Havet svelget båten i ett jafs.',
                    correct: false,
                    feedback:
                        'Kraftig personifisering! «Svelget i ett jafs» gjør havet til et glupsk rovdyr.',
                },
                {
                    text: 'Den gamle stolen sukket tungt da bestefar satte seg.',
                    correct: false,
                    feedback:
                        'Flott! «Sukket tungt» gir stolen et trøtt, menneskelig uttrykk som passer perfekt.',
                },
            ],
        },
    },
    {
        id: 'apply-personifisering-3-2',
        deviceId: 'personifisering',
        level: 3,
        instruction:
            'Skriv et stemningsfullt avsnitt der du bruker personifisering til å skape atmosfære.',
        data: {
            type: 'write',
            prompt: 'Skriv 3–4 setninger som beskriver en forlatt skole om natten. Bruk personifisering for å gjøre bygningen og tingene i den levende. Gi minst to forskjellige objekter menneskelige egenskaper.',
            hint: 'Tenk: Hva ville pulten, korridoren, lysene eller vinduene gjort hvis de var mennesker alene om natten? Ville de vært redde? Ensomme? Sinte?',
            exampleAnswer:
                'Korridorene sukket under vekten av stillheten. Et vindu på gløtt hvisket til seg selv, og de tomme pultene ventet tålmodig på at noen skulle komme tilbake. Bare klokken holdt stand – den tikket uforstyrret videre, som om ingen hadde dratt.',
        },
    },
    {
        id: 'apply-personifisering-3-3',
        deviceId: 'personifisering',
        level: 3,
        instruction:
            'Koble hver stemning med den personifiseringen som skaper den best.',
        data: {
            type: 'match',
            pairs: [
                {
                    example: 'Uhyggelig og skummel stemning',
                    label: 'Skyggene krøp langs veggene og strakte seg mot henne',
                },
                {
                    example: 'Varm og nostalgisk stemning',
                    label: 'Det gamle huset tok imot dem med åpne armer og varme vegger',
                },
                {
                    example: 'Kaotisk og stressende stemning',
                    label: 'Alarmklokken skrek hysterisk mens papirene kastet seg ut av mappen',
                },
                {
                    example: 'Fredelig og rolig stemning',
                    label: 'Elven nynnet stille for seg selv på vei gjennom dalen',
                },
            ],
        },
    },
];
