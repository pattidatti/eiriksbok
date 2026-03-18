import type { Exercise } from '../../types';

export const alliterasjonApplyExercises: Exercise[] = [
    // NIVÅ 1 – Lærling
    {
        id: 'apply-alliterasjon-1-1',
        deviceId: 'alliterasjon',
        level: 1,
        instruction: 'Hvilken setning har best alliterasjon?',
        data: {
            type: 'identify',
            text: 'Du skal beskrive en stille skog. Hvilken setning bruker alliterasjon mest effektivt?',
            options: [
                {
                    deviceId: 'alliterasjon',
                    label: '"Stille sto skogen i solnedgangen."',
                    correct: true,
                    feedback:
                        'Riktig! «St»-lyden i stille, sto og skogen, pluss «s» i solnedgangen, skaper en myk og rolig klang som passer stemningen.',
                },
                {
                    deviceId: 'alliterasjon',
                    label: '"Skogen var rolig og fin."',
                    correct: false,
                    feedback:
                        'Her er det ingen gjentakelse av bokstavlyder. Alliterasjon krever at flere ord starter med samme lyd.',
                },
                {
                    deviceId: 'alliterasjon',
                    label: '"Trærne beveget seg sakte i vinden."',
                    correct: false,
                    feedback:
                        'En fin setning, men ingen alliterasjon. Prøv å finne setningen der flere ord begynner med samme lyd.',
                },
                {
                    deviceId: 'alliterasjon',
                    label: '"Det var pent og fredelig der."',
                    correct: false,
                    feedback:
                        'Vanlig beskrivelse uten alliterasjon. Alliterasjon gir setninger en spesiell klang.',
                },
            ],
        },
    },
    {
        id: 'apply-alliterasjon-1-2',
        deviceId: 'alliterasjon',
        level: 1,
        instruction: 'Fyll inn et ord som skaper alliterasjon.',
        data: {
            type: 'fill-blank',
            textBefore: 'Brisen blåste over',
            textAfter: '.',
            correctAnswers: ['bølgene', 'bakken', 'berget', 'broen', 'blomstene', 'byen'],
            explanation:
                'Vi trenger et ord som starter med «b» for å fortsette alliterasjonen med «brisen» og «blåste». Ord som «bølgene», «berget» eller «blomstene» gir en fin klang.',
        },
    },
    {
        id: 'apply-alliterasjon-1-3',
        deviceId: 'alliterasjon',
        level: 1,
        instruction: 'Hvilken frase har sterkest alliterasjon?',
        data: {
            type: 'identify',
            text: 'Du vil beskrive en morgen. Hvilken frase bruker alliterasjon best?',
            options: [
                {
                    deviceId: 'alliterasjon',
                    label: '"Morgensolen malte markene med myk glød."',
                    correct: true,
                    feedback:
                        'Riktig! Fire ord med «m»-lyd skaper en myk og behagelig klang som passer til en fredelig morgen.',
                },
                {
                    deviceId: 'alliterasjon',
                    label: '"Solen stod opp over markene."',
                    correct: false,
                    feedback:
                        'Bare «solen» og «stod» deler lyd, men det er for lite til å skape tydelig alliterasjon.',
                },
                {
                    deviceId: 'alliterasjon',
                    label: '"Det var en vakker morgen."',
                    correct: false,
                    feedback:
                        'Ingen gjentakelse av bokstavlyder her. Alliterasjon krever bevisst lydlikhet.',
                },
                {
                    deviceId: 'alliterasjon',
                    label: '"Morgenen var kald og lys."',
                    correct: false,
                    feedback:
                        'Ingen alliterasjon. Her begynner alle ordene med forskjellige lyder.',
                },
            ],
        },
    },

    // NIVÅ 2 – Svenn
    {
        id: 'apply-alliterasjon-2-1',
        deviceId: 'alliterasjon',
        level: 2,
        instruction: 'Skriv en setning med alliterasjon som beskriver en storm.',
        data: {
            type: 'write',
            prompt: 'Skriv en setning der minst tre ord begynner med samme lyd. Setningen skal beskrive en kraftig storm. Prøv å la lyden passe til stemningen.',
            hint: 'Harde lyder som «k», «t» og «d» passer til noe kraftig. Prøv f.eks. «Kraftige kast av...» eller «Torden trommende over...».',
            exampleAnswer:
                'Torden trommet tungt over taket mens trærne ristet.',
        },
    },
    {
        id: 'apply-alliterasjon-2-2',
        deviceId: 'alliterasjon',
        level: 2,
        instruction: 'Koble den alliterative frasen til stemningen den passer best til.',
        data: {
            type: 'match',
            pairs: [
                {
                    example: '"Silkemyke skyggene sank sakte"',
                    label: 'Rolig og fredelig stemning',
                },
                {
                    example: '"Kald klo klemte kvelende"',
                    label: 'Skummel og truende stemning',
                },
                {
                    example: '"Glad glede glitret i gatene"',
                    label: 'Lett og lykkelig stemning',
                },
                {
                    example: '"Dype drønn dundret dunkelt"',
                    label: 'Dramatisk og kraftfull stemning',
                },
            ],
        },
    },
    {
        id: 'apply-alliterasjon-2-3',
        deviceId: 'alliterasjon',
        level: 2,
        instruction:
            'Skriv to setninger med alliterasjon som skaper helt forskjellige stemninger.',
        data: {
            type: 'write',
            prompt: 'Skriv to korte setninger med alliterasjon:\n1. En setning som føles myk og rolig (bruk bløte lyder som «s», «m», «l»)\n2. En setning som føles hard og dramatisk (bruk harde lyder som «k», «t», «d»)',
            hint: 'Myke lyder: s, m, l, v, f. Harde lyder: k, t, d, g, p. Lyden påvirker stemningen!',
            exampleAnswer:
                '1. Lyset lo lavt langs den lange landsbyen.\n2. Kvasse klør krasjet mot kald klippe.',
        },
    },

    // NIVÅ 3 – Mester
    {
        id: 'apply-alliterasjon-3-1',
        deviceId: 'alliterasjon',
        level: 3,
        instruction:
            'Denne alliterasjonen høres tvungen og unaturlig ut. Finn problemet.',
        data: {
            type: 'find-error',
            text: '"Fem flotte friske frodige fuktige fisker fløt forbi fjorden fredag formiddag."',
            errorDescription:
                'Alliterasjonen er overdrevet. Når hvert eneste ord starter med «f», høres det ut som en tungebryter, ikke som god tekst. God alliterasjon er naturlig og støtter innholdet.',
            options: [
                {
                    text: 'Kutt ned til 3-4 «f»-ord og la resten være vanlige ord: "Friske fisker fløt forbi i fjorden en fredelig formiddag."',
                    correct: true,
                    feedback:
                        'Riktig! Med færre alliterative ord høres setningen naturlig ut, men den har fortsatt en fin klang. Mindre er mer!',
                },
                {
                    text: 'Legg til enda flere «f»-ord for å gjøre det morsommere.',
                    correct: false,
                    feedback:
                        'Da blir det en tungebryter, ikke litteratur. Alliterasjon skal forsterke teksten, ikke overstyre den.',
                },
                {
                    text: 'Fjern all alliterasjon og skriv helt vanlig.',
                    correct: false,
                    feedback:
                        'Det er for drastisk. Alliterasjon er fint – bare ikke overdrevet. Poenget er å finne balansen.',
                },
            ],
        },
    },
    {
        id: 'apply-alliterasjon-3-2',
        deviceId: 'alliterasjon',
        level: 3,
        instruction: 'Lag en naturlig beskrivelse med innvevd alliterasjon.',
        data: {
            type: 'write',
            prompt: 'Skriv 2-3 setninger som beskriver en person som går langs stranden ved solnedgang. Bruk alliterasjon, men la det høres naturlig ut. Leseren skal føle stemningen, ikke legge merke til teknikken.',
            hint: 'Bland alliterative ord med vanlige ord. Ikke tving hvert eneste ord til å starte med samme bokstav. La det flyte naturlig.',
            exampleAnswer:
                'Sand strøk stille mot sandalene hennes der hun gikk langs vannkanten. Solen sank sakte bak horisonten, og bølgene vasket bort fotavtrykkene like fort som hun laget dem.',
        },
    },
    {
        id: 'apply-alliterasjon-3-3',
        deviceId: 'alliterasjon',
        level: 3,
        instruction: 'Vurder om denne alliterasjonen fungerer godt.',
        data: {
            type: 'true-false',
            statement:
                '"Vinteren visket vekk varmere minner." – Denne alliterasjonen er effektiv fordi «v»-lyden skaper en myk, vemodsfull stemning som passer innholdet.',
            correct: true,
            explanation:
                'Ja, dette er god alliterasjon. «V»-lyden er myk og passer til vemod og minner som forsvinner. Alliterasjonen føles naturlig og forsterker stemningen uten å virke tvungen.',
        },
    },
];
