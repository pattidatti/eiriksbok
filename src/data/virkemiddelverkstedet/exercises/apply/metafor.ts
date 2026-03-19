import type { Exercise } from '../../types';

export const metaforApplyExercises: Exercise[] = [
    // === NIVÅ 1 – Lærling (insert, choose, fill-blank) ===
    {
        id: 'apply-metafor-1-1',
        deviceId: 'metafor',
        level: 1,
        instruction: 'Hvilken metafor passer best i denne setningen?',
        data: {
            type: 'identify',
            text: 'Etter den lange vinteren var våren endelig ___.',
            options: [
                {
                    deviceId: 'metafor',
                    label: 'et friskt pust',
                    correct: true,
                    feedback:
                        'Riktig! «Et friskt pust» er en metafor som beskriver våren som noe forfriskende og nytt.',
                },
                {
                    deviceId: 'metafor',
                    label: 'veldig fin',
                    correct: false,
                    feedback:
                        'Dette er bare en vanlig beskrivelse, ikke en metafor. Prøv å finne et bilde.',
                },
                {
                    deviceId: 'metafor',
                    label: 'som en blomst',
                    correct: false,
                    feedback:
                        'Nesten! Men «som» gjør det til en sammenligning, ikke en metafor.',
                },
                {
                    deviceId: 'metafor',
                    label: 'kald og våt',
                    correct: false,
                    feedback: 'Det er en bokstavelig beskrivelse, ikke en metafor.',
                },
            ],
        },
    },
    {
        id: 'apply-metafor-1-2',
        deviceId: 'metafor',
        level: 1,
        instruction: 'Fyll inn en metafor som passer i setningen.',
        data: {
            type: 'fill-blank',
            textBefore: 'Matteprøven var',
            textAfter: 'for de fleste elevene.',
            correctAnswers: [
                'et mareritt',
                'en mur',
                'et fjell',
                'et monster',
                'en kamp',
                'et helvete',
            ],
            acceptKeywords: ['mareritt', 'mur', 'fjell', 'monster', 'kamp', 'helvete', 'katastrofe', 'tortur', 'hinder', 'straff', 'felle'],
            hint: 'Bruk en metafor - sammenlign matteprøven med noe vanskelig uten å bruke «som».',
            explanation:
                'Vi trenger en metafor som viser at prøven var veldig vanskelig. «Et mareritt», «en mur» eller «et fjell» er alle gode metaforer fordi de beskriver noe overveldende uten å bruke «som» eller «lik».',
        },
    },
    {
        id: 'apply-metafor-1-3',
        deviceId: 'metafor',
        level: 1,
        instruction: 'Hvilken metafor passer best for å beskrive en travel morgen?',
        data: {
            type: 'identify',
            text: 'Hver morgen er huset vårt ___.',
            options: [
                {
                    deviceId: 'metafor',
                    label: 'en maurtue',
                    correct: true,
                    feedback:
                        'Riktig! «En maurtue» er en metafor som viser at alle myldrer rundt og er travle, akkurat som maur.',
                },
                {
                    deviceId: 'metafor',
                    label: 'ganske rotete',
                    correct: false,
                    feedback: 'Det er en vanlig beskrivelse. En metafor bruker et bilde.',
                },
                {
                    deviceId: 'metafor',
                    label: 'fullt av folk som likner maur',
                    correct: false,
                    feedback:
                        'Du er på rett spor med maur-bildet, men dette er for langt og forklarende. En metafor er kort og direkte.',
                },
                {
                    deviceId: 'metafor',
                    label: 'veldig travel om morgenen',
                    correct: false,
                    feedback:
                        'Det er sant, men det er ikke en metafor. En metafor kaller noe for noe annet.',
                },
            ],
        },
    },

    // === NIVÅ 2 – Svenn (write, match, explain/choose-best) ===
    {
        id: 'apply-metafor-2-1',
        deviceId: 'metafor',
        level: 2,
        instruction: 'Skriv om setningen slik at den inneholder en metafor.',
        data: {
            type: 'write',
            prompt: 'Originalsetning: «Hun var veldig sint.»\n\nSkriv om setningen slik at sinnet beskrives med en metafor. Husk: ikke bruk «som» eller «lik».',
            hint: 'Tenk på noe som er varmt, eksplosivt eller farlig. Hva kan sinne kalles?',
            exampleAnswer: 'Hun var en vulkan like før utbruddet.',
        },
    },
    {
        id: 'apply-metafor-2-2',
        deviceId: 'metafor',
        level: 2,
        instruction: 'Koble hver følelse med den metaforen som passer best.',
        data: {
            type: 'match',
            pairs: [
                { example: 'Stor glede', label: 'Hjertet var en fyrverkeri-rakett' },
                { example: 'Dyp sorg', label: 'Brystet var et svart hull' },
                { example: 'Nervøsitet', label: 'Magen var en vaskemaskin' },
                { example: 'Sinne', label: 'Blodet var lava i årene' },
            ],
        },
    },
    {
        id: 'apply-metafor-2-3',
        deviceId: 'metafor',
        level: 2,
        instruction: 'Hvilken metafor beskriver situasjonen best?',
        data: {
            type: 'explain',
            text: 'Jonas fikk endelig vennegruppen han hadde drømt om. Han følte at han hørte til.',
            highlightedWords: 'hørte til',
            question:
                'Hvilken metafor ville best beskrive Jonas sin følelse av å endelig høre til?',
            options: [
                {
                    text: '«Han hadde endelig funnet sin havn.»',
                    correct: true,
                    feedback:
                        'Riktig! En havn er et trygt sted der man kan ankre opp. Det passer perfekt for følelsen av å finne sin plass.',
                },
                {
                    text: '«Han var veldig glad for å ha venner.»',
                    correct: false,
                    feedback:
                        'Det er en fin setning, men den inneholder ingen metafor. Prøv å finne et bilde.',
                },
                {
                    text: '«Han likte vennene sine som om de var familie.»',
                    correct: false,
                    feedback:
                        'Her bruker du «som om», og da blir det en sammenligning, ikke en metafor.',
                },
            ],
        },
    },

    // === NIVÅ 3 – Mester (find-error/fix, advanced write, match) ===
    {
        id: 'apply-metafor-3-1',
        deviceId: 'metafor',
        level: 3,
        instruction: 'En av disse metaforene er svak og klisjéfylt. Finn den og tenk på hvorfor.',
        data: {
            type: 'find-error',
            text: 'Hvilken metafor er så overbrukt at den nesten har mistet kraften sin?',
            errorDescription:
                'En av metaforene er en «død metafor» - den er brukt så ofte at vi nesten ikke merker den lenger.',
            options: [
                {
                    text: 'Tankene hennes var et nøste av ull som raknet.',
                    correct: false,
                    feedback:
                        'Dette er en frisk og original metafor! Et nøste som rakner gir et tydelig bilde av forvirring.',
                },
                {
                    text: 'Tiden fløy den sommeren.',
                    correct: true,
                    feedback:
                        'Riktig! «Tiden fløy» er så overbrukt at vi nesten ikke tenker over at det er en metafor. En sterkere variant kunne vært: «Sommerdagene var fugler som forsvant over horisonten.»',
                },
                {
                    text: 'Frykten var en kald hånd som klemte rundt hjertet.',
                    correct: false,
                    feedback:
                        'Dette er en levende og kreativ metafor med et sterkt bilde.',
                },
                {
                    text: 'Ensomheten var et tomt konsertlokale etter siste forestilling.',
                    correct: false,
                    feedback:
                        'Flott metafor! Den er spesifikk og skaper en tydelig stemning.',
                },
            ],
        },
    },
    {
        id: 'apply-metafor-3-2',
        deviceId: 'metafor',
        level: 3,
        instruction:
            'Skriv en kreativ metafor for en kompleks følelse.',
        data: {
            type: 'write',
            prompt: 'Beskriv følelsen du får når du plutselig innser at en nær venn har løyet for deg. Bruk en utvidet metafor (2-3 setninger) der du holder fast ved ett bilde.',
            hint: 'Tenk på noe som knuser, smelter, sprekker, eller faller sammen. Bygg videre på bildet: Hva skjer først? Hva skjer etterpå?',
            exampleAnswer:
                'Tilliten var et glassgulv hun hadde gått på i årevis. Da sannheten kom, spratt det en sprekk fra kant til kant. Og plutselig turte hun ikke ta et eneste steg.',
        },
    },
    {
        id: 'apply-metafor-3-3',
        deviceId: 'metafor',
        level: 3,
        instruction: 'Koble hver situasjon med den mest treffende og originale metaforen.',
        data: {
            type: 'match',
            pairs: [
                {
                    example: 'En elev som gruer seg til muntlig fremføring',
                    label: 'Scenen var en guillotine som ventet',
                },
                {
                    example: 'En venn som alltid støtter deg',
                    label: 'Hun var et fyrtårn i enhver storm',
                },
                {
                    example: 'Et klassemiljø fullt av konflikter',
                    label: 'Klasserommet var en kruttønne',
                },
                {
                    example: 'Å endelig forstå et vanskelig mattetema',
                    label: 'Lyspæren i hodet begynte å gløde',
                },
            ],
        },
    },
];
