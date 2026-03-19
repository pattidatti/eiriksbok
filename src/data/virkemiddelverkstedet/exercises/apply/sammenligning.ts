import type { Exercise } from '../../types';

export const sammenligningApplyExercises: Exercise[] = [
    // === NIVÅ 1 – Lærling (insert, choose, fill-blank) ===
    {
        id: 'apply-sammenligning-1-1',
        deviceId: 'sammenligning',
        level: 1,
        instruction: 'Hvilken sammenligning passer best i denne setningen?',
        data: {
            type: 'identify',
            text: 'Den nye eleven var stille og forsiktig, ___ i klasserommet.',
            options: [
                {
                    deviceId: 'sammenligning',
                    label: 'som en skygge',
                    correct: true,
                    feedback:
                        'Riktig! «Som en skygge» er en sammenligning som viser at eleven var nesten usynlig og stille, akkurat som en skygge.',
                },
                {
                    deviceId: 'sammenligning',
                    label: 'en skygge',
                    correct: false,
                    feedback:
                        'Nesten! Men uten «som» eller «lik» blir dette en metafor, ikke en sammenligning.',
                },
                {
                    deviceId: 'sammenligning',
                    label: 'ganske usynlig',
                    correct: false,
                    feedback:
                        'Det er en vanlig beskrivelse, ikke en sammenligning. Prøv å finne et bilde med «som».',
                },
                {
                    deviceId: 'sammenligning',
                    label: 'veldig sjenert og redd',
                    correct: false,
                    feedback:
                        'Det forteller det samme, men bruker ikke noe bilde. En sammenligning sammenligner med noe konkret.',
                },
            ],
        },
    },
    {
        id: 'apply-sammenligning-1-2',
        deviceId: 'sammenligning',
        level: 1,
        instruction: 'Fyll inn en sammenligning som passer i setningen.',
        data: {
            type: 'fill-blank',
            textBefore: 'Hunden hoppet over gjerdet lett som',
            textAfter: '.',
            correctAnswers: [
                'en fjær',
                'ei fjær',
                'en katt',
                'en fugl',
                'en sommerfugl',
                'vinden',
            ],
            acceptKeywords: ['fjær', 'katt', 'fugl', 'sommerfugl', 'vind', 'ballong', 'sky', 'dun', 'fjer'],
            hint: 'Sammenlign med noe som er lett. Hunden var lett som...?',
            explanation:
                'Vi trenger noe lett og elegant etter «som». «En fjær» eller «en fugl» er gode sammenligninger fordi de viser letthet og gratie.',
        },
    },
    {
        id: 'apply-sammenligning-1-3',
        deviceId: 'sammenligning',
        level: 1,
        instruction: 'Hvilken sammenligning beskriver best en veldig rask løper?',
        data: {
            type: 'identify',
            text: 'Ida sprintet over gresset ___.',
            options: [
                {
                    deviceId: 'sammenligning',
                    label: 'som en rakett',
                    correct: true,
                    feedback:
                        'Riktig! «Som en rakett» gir et klart bilde av noe som beveger seg ekstremt fort.',
                },
                {
                    deviceId: 'sammenligning',
                    label: 'veldig fort',
                    correct: false,
                    feedback:
                        'Det er sant, men det er bare et adverb. En sammenligning gir et bilde.',
                },
                {
                    deviceId: 'sammenligning',
                    label: 'som en person som løper',
                    correct: false,
                    feedback:
                        'Å sammenligne en løper med en løper gir ingen ny mening! En god sammenligning bruker noe annet enn det du beskriver.',
                },
                {
                    deviceId: 'sammenligning',
                    label: 'med raske bein',
                    correct: false,
                    feedback:
                        'Det er en bokstavelig beskrivelse. En sammenligning med «som» eller «lik» ville skapt et sterkere bilde.',
                },
            ],
        },
    },

    // === NIVÅ 2 – Svenn (write, match, explain/choose-best) ===
    {
        id: 'apply-sammenligning-2-1',
        deviceId: 'sammenligning',
        level: 2,
        instruction: 'Skriv om setningen slik at den inneholder en sammenligning.',
        data: {
            type: 'write',
            prompt: 'Originalsetning: «Stormen var veldig kraftig.»\n\nSkriv om setningen med en sammenligning. Bruk «som» eller «lik» for å sammenligne stormen med noe konkret.',
            hint: 'Hva er kraftig og voldsomt? Et rasende dyr? En maskin? En krig? Sammenlign stormen med noe du kan se for deg.',
            exampleAnswer: 'Stormen rev i trærne som et rasende udyr.',
        },
    },
    {
        id: 'apply-sammenligning-2-2',
        deviceId: 'sammenligning',
        level: 2,
        instruction: 'Koble hver ting med den sammenligningen som passer best.',
        data: {
            type: 'match',
            pairs: [
                { example: 'En veldig høy lyd', label: 'Som et tordenskrall' },
                { example: 'Silkemykt hår', label: 'Som et fossefall av gull' },
                { example: 'Et iskald blikk', label: 'Som en frostfull vinternatt' },
                { example: 'En kaotisk skolekantine', label: 'Som en jungel i regntiden' },
            ],
        },
    },
    {
        id: 'apply-sammenligning-2-3',
        deviceId: 'sammenligning',
        level: 2,
        instruction: 'Hvilken sammenligning passer best i denne teksten?',
        data: {
            type: 'explain',
            text: 'Sara stod foran hele skolen og skulle synge. Hendene hennes skalv, og stemmen var tynn og skjelvende.',
            highlightedWords: 'stemmen var tynn og skjelvende',
            question:
                'Hvilken sammenligning ville best beskrive stemmen til Sara?',
            options: [
                {
                    text: '«Stemmen hennes var som en tynn tråd som når som helst kunne ryke.»',
                    correct: true,
                    feedback:
                        'Riktig! Bildet av en tynn tråd som kan ryke viser både det skjøre og det spennende ved situasjonen.',
                },
                {
                    text: '«Stemmen var litt svak og usikker.»',
                    correct: false,
                    feedback:
                        'Det er en grei beskrivelse, men den mangler et bilde. En sammenligning ville gjort teksten mer levende.',
                },
                {
                    text: '«Hun sang dårlig og lavt.»',
                    correct: false,
                    feedback:
                        'Det er negativt og flatt. En god sammenligning viser hvordan noe føles uten å bare si at det er dårlig.',
                },
            ],
        },
    },

    // === NIVÅ 3 – Mester (find-error/fix, advanced write, match) ===
    {
        id: 'apply-sammenligning-3-1',
        deviceId: 'sammenligning',
        level: 3,
        instruction:
            'En av disse sammenligningene er en klisjé. Finn den og tenk på en bedre erstatning.',
        data: {
            type: 'find-error',
            text: 'Hvilken sammenligning er så overbrukt at den har mistet det meste av kraften sin?',
            errorDescription:
                'En klisjé-sammenligning er så vanlig at vi nesten ikke legger merke til den lenger. God skriving krever friske bilder.',
            options: [
                {
                    text: 'Hun var rask som en gepard.',
                    correct: true,
                    feedback:
                        'Riktig! «Rask som en gepard» er en av de mest brukte sammenligningene som finnes. En friskere variant kunne vært: «Hun var rask som et lynnedslag gjennom korridoren.»',
                },
                {
                    text: 'Smilet hans lyste som en nymalt sykkel.',
                    correct: false,
                    feedback:
                        'Det er en uvanlig og frisk sammenligning! Overraskende bilder gjør teksten mer interessant.',
                },
                {
                    text: 'Nervøsiteten kriblet som maur under huden.',
                    correct: false,
                    feedback:
                        'Fin sammenligning! Den er konkret og sanselig – man kan nesten føle det.',
                },
                {
                    text: 'Skogen luktet som innsiden av et gammelt skap med urter.',
                    correct: false,
                    feedback:
                        'Original og spesifikk! Slike uventede sammenligninger gjør skriving interessant.',
                },
            ],
        },
    },
    {
        id: 'apply-sammenligning-3-2',
        deviceId: 'sammenligning',
        level: 3,
        instruction: 'Skriv en kreativ sammenligning som bruker en uventet kobling.',
        data: {
            type: 'write',
            prompt: 'Beskriv stillheten etter en krangel mellom to venner. Bruk en utvidet sammenligning (2–3 setninger) der du sammenligner stillheten med noe overraskende og konkret. Unngå klisjeer som «stille som graven».',
            hint: 'Tenk utenfor boksen. Kan stillhet ligne på noe tungt? Noe som vokser? Noe som klistrer seg fast? Bruk sanser som syn, hørsel eller berøring.',
            exampleAnswer:
                'Stillheten mellom dem var som våt betong – tung, grå og umulig å bevege seg gjennom. Jo lenger de ventet, jo hardere ble den.',
        },
    },
    {
        id: 'apply-sammenligning-3-3',
        deviceId: 'sammenligning',
        level: 3,
        instruction:
            'Koble hver situasjon med den mest originale og treffende sammenligningen.',
        data: {
            type: 'match',
            pairs: [
                {
                    example: 'Den første snøen som faller stille',
                    label: 'Som hvite hemmeligheter som daler fra himmelen',
                },
                {
                    example: 'En lærer som plutselig blir sint',
                    label: 'Som en rolig innsjø som plutselig koker',
                },
                {
                    example: 'Følelsen av å bli valgt sist i gym',
                    label: 'Som å være den siste kaken ingen vil ha',
                },
                {
                    example: 'Musikk som treffer deg rett i hjertet',
                    label: 'Som en hånd som strekker seg inn og rører ved noe du hadde gjemt',
                },
            ],
        },
    },
];
