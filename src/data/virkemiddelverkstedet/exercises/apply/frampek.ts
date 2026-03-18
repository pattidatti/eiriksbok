import type { Exercise } from '../../types';

export const frampekApplyExercises: Exercise[] = [
    // NIVÅ 1 – Lærling
    {
        id: 'apply-frampek-1-1',
        deviceId: 'frampek',
        level: 1,
        instruction: 'Hvilken setning legger best inn et frampek i denne scenen?',
        data: {
            type: 'explain',
            text: 'Familien pakket bilen og kjørte mot hytta. Barna sang i baksetet. Solen skinte.',
            highlightedWords: 'Solen skinte',
            question:
                'Hvilken setning ville du lagt til for å skape et frampek om at noe farlig skal skje?',
            options: [
                {
                    text: '"Det var den siste turen de skulle ta sammen."',
                    correct: true,
                    feedback:
                        'Riktig! Denne setningen antyder at noe vil endre seg uten å si hva. Leseren blir nysgjerrig og litt urolig.',
                },
                {
                    text: '"Bilen var rød og ganske ny."',
                    correct: false,
                    feedback:
                        'Denne setningen er bare en beskrivelse. Den peker ikke fremover mot noe som skal skje.',
                },
                {
                    text: '"De hadde kjørt denne veien mange ganger før."',
                    correct: false,
                    feedback:
                        'Denne setningen gir bakgrunnsinformasjon, men varsler ikke om noe som kommer.',
                },
            ],
        },
    },
    {
        id: 'apply-frampek-1-2',
        deviceId: 'frampek',
        level: 1,
        instruction: 'Fyll inn et ord som gjør setningen til et frampek.',
        data: {
            type: 'fill-blank',
            textBefore: 'De lo og spiste is i solen. Alt var perfekt.',
            textAfter: '.',
            correctAnswers: ['Foreløpig', 'Ennå', 'Så langt', 'Tilsynelatende'],
            explanation:
                'Ord som "foreløpig" eller "ennå" forandrer hele stemningen. De antyder at det gode ikke vil vare, og det skaper spenning hos leseren.',
        },
    },
    {
        id: 'apply-frampek-1-3',
        deviceId: 'frampek',
        level: 1,
        instruction: 'Hvilken setning er det beste frampeket?',
        data: {
            type: 'identify',
            text: 'Jonas gikk til skolen som vanlig den morgenen. Hvilken setning passer best som frampek?',
            options: [
                {
                    deviceId: 'frampek',
                    label: '"Han ante ikke at han aldri ville komme hjem igjen."',
                    correct: true,
                    feedback:
                        'Riktig! Denne setningen peker tydelig fremover og skaper spenning. Leseren lurer på hva som skal skje med Jonas.',
                },
                {
                    deviceId: 'frampek',
                    label: '"Sekken var tung og full av bøker."',
                    correct: false,
                    feedback:
                        'Dette er en vanlig beskrivelse som ikke varsler om noe som skal skje.',
                },
                {
                    deviceId: 'frampek',
                    label: '"Han likte mandager best av alle dager."',
                    correct: false,
                    feedback:
                        'Denne setningen forteller om Jonas sine preferanser, men peker ikke fremover mot noe dramatisk.',
                },
                {
                    deviceId: 'frampek',
                    label: '"Klokken var halv åtte."',
                    correct: false,
                    feedback: 'Bare et tidsanslag. Et frampek må antyde at noe kommer til å skje.',
                },
            ],
        },
    },

    // NIVÅ 2 – Svenn
    {
        id: 'apply-frampek-2-1',
        deviceId: 'frampek',
        level: 2,
        instruction: 'Skriv en setning som antyder at noe farlig vil skje.',
        data: {
            type: 'write',
            prompt: 'Scene: Emma går alene gjennom skogen på vei hjem fra skolen. Det er stille og fredelig. Skriv en setning som du kan legge til for å antyde at noe farlig er i ferd med å skje, uten å si direkte hva.',
            hint: 'Bruk naturen, en følelse eller en liten detalj som varsel. Ikke skriv "noe farlig skjedde".',
            exampleAnswer:
                'Fuglene hadde blitt stille. Det pleide de aldri å være på denne tiden av dagen.',
        },
    },
    {
        id: 'apply-frampek-2-2',
        deviceId: 'frampek',
        level: 2,
        instruction: 'Koble hvert hint med det det mest sannsynlig varsler.',
        data: {
            type: 'match',
            pairs: [
                {
                    example: '"Han la merke til at isen knakte under føttene."',
                    label: 'Noen vil falle gjennom isen',
                },
                {
                    example: '"Hun smilte og sa ha det. For siste gang."',
                    label: 'Hun kommer ikke tilbake',
                },
                {
                    example: '"Hunden nektet å gå inn i huset."',
                    label: 'Noe farlig er inne i huset',
                },
                {
                    example: '"Skyene i vest var mørkere enn han noen gang hadde sett."',
                    label: 'En kraftig storm er på vei',
                },
            ],
        },
    },
    {
        id: 'apply-frampek-2-3',
        deviceId: 'frampek',
        level: 2,
        instruction: 'Fyll inn en setning som skaper frampek.',
        data: {
            type: 'fill-blank',
            textBefore: 'Liam tok med seg kniven på turen. "Trenger du virkelig den?" spurte moren.',
            textAfter: '',
            correctAnswers: [
                'Det skulle han bli glad for',
                'Han skulle snart trenge den',
                'Det visste han ikke da, men ja',
            ],
            explanation:
                'Ved å legge til en setning som forteller at kniven faktisk ble viktig, skaper du et frampek. Leseren forstår at noe vil skje der kniven trengs.',
        },
    },

    // NIVÅ 3 – Mester
    {
        id: 'apply-frampek-3-1',
        deviceId: 'frampek',
        level: 3,
        instruction: 'Fiks dette klossete frampeket som avslører for mye.',
        data: {
            type: 'find-error',
            text: '"Neste dag kom det en bjørn som angrep teltet og skadet Lars i armen." Denne setningen står midt i en rolig scene der familien setter opp teltet i skogen.',
            errorDescription:
                'Hva er problemet med dette frampeket, og hvilken løsning er best?',
            options: [
                {
                    text: 'Det avslører for mye. Bedre: "Lars hørte noe rusle i buskene, men tenkte ikke mer over det." Det lar leseren ane faren uten å ødelegge spenningen.',
                    correct: true,
                    feedback:
                        'Riktig! Et godt frampek antyder uten å røpe. Den opprinnelige setningen ødelegger all spenning ved å si nøyaktig hva som skjer.',
                },
                {
                    text: 'Det er for kort. Frampeket bør være lenger og mer detaljert.',
                    correct: false,
                    feedback:
                        'Lengde er ikke problemet. Problemet er at frampeket avslører hele hendelsen på forhånd.',
                },
                {
                    text: 'Det er ikke noe galt med frampeket. Det er tydelig og informativt.',
                    correct: false,
                    feedback:
                        'Et frampek som avslører alt, ødelegger spenningen. Leseren har ingen grunn til å lese videre hvis de allerede vet hva som skjer.',
                },
            ],
        },
    },
    {
        id: 'apply-frampek-3-2',
        deviceId: 'frampek',
        level: 3,
        instruction: 'Skriv et subtilt frampek ved hjelp av en gjenstand.',
        data: {
            type: 'write',
            prompt: 'Skriv 2-3 setninger der du bruker en gjenstand (for eksempel en nøkkel, et tau, en lommelykt) som et subtilt frampek. Gjenstanden skal nevnes naturlig i scenen, men leseren skal etterpå forstå at den var et varsel. Ikke gjør det for åpenbart!',
            hint: 'Tenk på Tsjekovs gevær: Nevn gjenstanden som en liten detalj, ikke som noe viktig. Det er først senere den får betydning.',
            exampleAnswer:
                'Sara ryddet i garasjen og fant det gamle tauet. Det var slitt, men hun kastet det tilbake i hylla. "Det kan sikkert brukes til noe," tenkte hun.',
        },
    },
    {
        id: 'apply-frampek-3-3',
        deviceId: 'frampek',
        level: 3,
        instruction: 'Skriv om dette svake frampeket slik at det blir bedre.',
        data: {
            type: 'write',
            prompt: 'Originaltekst: "De gikk om bord i båten. Senere ville båten synke." Denne teksten har et frampek, men det er for direkte og kjedelig. Skriv om teksten (3-4 setninger) slik at frampeket er mer subtilt og stemningsskapende.',
            hint: 'Bruk detaljer som vær, lyder, følelser eller en liten observasjon for å antyde at noe galt vil skje med båten. Ikke si at den synker!',
            exampleAnswer:
                'De gikk om bord i båten og lo av bølgene som slo mot skroget. Kapteinen la merke til at pumpen ikke fungerte som den skulle, men det hadde den aldri gjort. Han valgte å ikke si noe. Været var jo fint, og hva kunne gå galt?',
        },
    },
];
