import type { Exercise } from '../../types';

export const budskapApplyExercises: Exercise[] = [
    // NIVÅ 1 – Lærling
    {
        id: 'apply-budskap-1-1',
        deviceId: 'budskap',
        level: 1,
        instruction: 'Hvilken avslutning gir budskapet «vennskap krever mot»?',
        data: {
            type: 'identify',
            text: 'En fortelling handler om Nora som ser at venninnen hennes blir mobbet. Hun er redd for å si ifra. Hvilken avslutning gir best budskapet «vennskap krever mot»?',
            options: [
                {
                    deviceId: 'budskap',
                    label: '"Nora kjente hjertet hamre, men hun gikk bort og stilte seg ved siden av venninnen. Det var det eneste riktige å gjøre."',
                    correct: true,
                    feedback:
                        'Riktig! Nora er redd (hjertet hamrer), men handler likevel. Det viser at ekte vennskap krever mot – du gjør det rette selv om det er skummelt.',
                },
                {
                    deviceId: 'budskap',
                    label: '"Nora gikk hjem og tenkte at hun kanskje burde gjøre noe neste gang."',
                    correct: false,
                    feedback:
                        'Her viser Nora verken mot eller vennskap. Budskapet blir heller «det er greit å utsette vanskelige ting».',
                },
                {
                    deviceId: 'budskap',
                    label: '"Nora fortalte læreren, og læreren ordnet opp i alt."',
                    correct: false,
                    feedback:
                        'Det er en grei løsning, men budskapet handler om at vennskap krever personlig mot. Her overlater hun ansvaret til en voksen.',
                },
                {
                    deviceId: 'budskap',
                    label: '"Vennskap krever mot, tenkte Nora."',
                    correct: false,
                    feedback:
                        'Her sier du budskapet rett ut som en tanke. Det er mye sterkere å vise budskapet gjennom en handling.',
                },
            ],
        },
    },
    {
        id: 'apply-budskap-1-2',
        deviceId: 'budskap',
        level: 1,
        instruction: 'Fyll inn en moral som passer til historien.',
        data: {
            type: 'fill-blank',
            textBefore:
                'Leo løy for å slippe trøbbel, men løgnen vokste og vokste til den ødela tilliten mellom ham og bestekompisen. Til slutt innså Leo at',
            textAfter: '.',
            correctAnswers: [
                'ærlighet er viktigere enn å unngå problemer',
                'sannheten alltid kommer fram',
                'en løgn skaper mer skade enn sannheten',
                'det er bedre å være ærlig fra starten',
            ],
            explanation:
                'Historien viser at en løgn kan vokse og gjøre mer skade enn sannheten. Moralen bør handle om ærlighet og tillit – det er det historiens handlinger peker mot.',
        },
    },
    {
        id: 'apply-budskap-1-3',
        deviceId: 'budskap',
        level: 1,
        instruction: 'Hvilken avslutning formidler budskapet «alle fortjener en ny sjanse»?',
        data: {
            type: 'identify',
            text: 'En fortelling handler om Amir som har gjort en feil og blitt utstøtt av klassen. Hvilken avslutning formidler budskapet «alle fortjener en ny sjanse» best?',
            options: [
                {
                    deviceId: 'budskap',
                    label: '"Da Amir møtte opp med kaken han hadde bakt til klassefesten, nølte alle. Men så tok Isak et stykke. Og etter ham, en til."',
                    correct: true,
                    feedback:
                        'Riktig! Handlingen viser at folk gradvis gir Amir en ny sjanse. Budskapet kommer gjennom det de gjør, ikke gjennom hva noen sier.',
                },
                {
                    deviceId: 'budskap',
                    label: '"Læreren sa til klassen at alle fortjener en ny sjanse."',
                    correct: false,
                    feedback:
                        'Her blir budskapet «fortalt» av en lærer i stedet for «vist» gjennom handlinger. Det føles belærende.',
                },
                {
                    deviceId: 'budskap',
                    label: '"Amir sluttet på skolen fordi ingen ville snakke med ham."',
                    correct: false,
                    feedback:
                        'Denne avslutningen gir det motsatte budskapet. Her får ingen ny sjanse.',
                },
                {
                    deviceId: 'budskap',
                    label: '"Amir tenkte at han aldri ville gjøre noe galt igjen."',
                    correct: false,
                    feedback:
                        'Dette handler om Amirs egne tanker om å forbedre seg, ikke om at andre gir ham en sjanse.',
                },
            ],
        },
    },

    // NIVÅ 2 – Svenn
    {
        id: 'apply-budskap-2-1',
        deviceId: 'budskap',
        level: 2,
        instruction: 'Skriv en avslutning som formidler et bestemt budskap.',
        data: {
            type: 'write',
            prompt: 'Historien: Jonas og Fatima har kranglet hele uken. Ingen vil si unnskyld først.\n\nSkriv en avslutning (2-3 setninger) som formidler budskapet «stolthet kan ødelegge gode ting». Vis budskapet gjennom handling – ikke skriv det direkte.',
            hint: 'Tenk på konsekvensene: Hva mister de fordi ingen vil gi seg? Vis det gjennom en scene, ikke en forklaring.',
            exampleAnswer:
                'Fredag var det klassefest. Jonas så Fatima stå alene i det andre hjørnet. Begge gikk hjem tidlig, og ingen av dem hadde det gøy.',
        },
    },
    {
        id: 'apply-budskap-2-2',
        deviceId: 'budskap',
        level: 2,
        instruction: 'Koble hver fortelling med budskapet den best formidler.',
        data: {
            type: 'match',
            pairs: [
                {
                    example: 'En jente gir fra seg premien sin til lillebroren som aldri vinner.',
                    label: 'Å gi gjør deg rikere enn å ta',
                },
                {
                    example: 'En gutt kopierer stilen til alle han ser opp til, men mister vennene sine.',
                    label: 'Vær deg selv – kopiering fører til ensomhet',
                },
                {
                    example: 'En elev som aldri gir opp, klarer matten til slutt – men først etter mange feil.',
                    label: 'Feil er en del av veien til suksess',
                },
                {
                    example: 'En gruppe som ignorerer den stille eleven, går glipp av den beste ideen.',
                    label: 'De stille stemmene er ofte verdt å lytte til',
                },
            ],
        },
    },
    {
        id: 'apply-budskap-2-3',
        deviceId: 'budskap',
        level: 2,
        instruction: 'Skriv en kort fortelling med et tydelig budskap.',
        data: {
            type: 'write',
            prompt: 'Budskap: «Du trenger ikke være perfekt for å bety noe for andre.»\n\nSkriv 3-4 setninger som formidler dette budskapet gjennom en scene med en karakter som tror de ikke er gode nok. Vis at de tar feil – uten å si budskapet direkte.',
            hint: 'La karakteren tro de er mislykket, men la en annen karakter vise at de betyr noe likevel – kanskje gjennom en gest, et ord, eller en liten handling.',
            exampleAnswer:
                'Ella følte at tegningen hennes var den dårligste i hele klassen. Hun ville rive den i stykker. Men da hun snudde seg, så hun at lillesøsteren hadde hengt den opp på veggen hjemme. Under sto det: "Ellas kunst" med et hjerte ved siden av.',
        },
    },

    // NIVÅ 3 – Mester
    {
        id: 'apply-budskap-3-1',
        deviceId: 'budskap',
        level: 3,
        instruction: 'Budskapet i denne teksten er for overtydelig. Finn problemet.',
        data: {
            type: 'find-error',
            text: '"Ida delte godteriet med alle. «Det er viktig å dele med andre», sa hun. «Hvis alle deler, blir verden et bedre sted. Man bør alltid tenke på andre.» Alle nikket og var enige."',
            errorDescription:
                'Budskapet blir hamret inn med direkte tale og forklaringer. Det føles belærende, som en reklame for snillhet. Godt budskap vises – det forklares ikke.',
            options: [
                {
                    text: 'La handlingene bære budskapet: "Ida delte godteriet med alle, selv de hun ikke kjente så godt. Det rarte var at hun fikk noe tilbake – et smil fra den stille gutten i hjørnet som aldri ble inkludert."',
                    correct: true,
                    feedback:
                        'Riktig! Nå viser handlingene og konsekvensene budskapet. Leseren trekker selv konklusjonen, og det er mye sterkere enn å bli fortalt hva man bør mene.',
                },
                {
                    text: 'Legg til flere forklaringer slik at budskapet blir enda tydeligere.',
                    correct: false,
                    feedback:
                        'Mer forklaring gjør det verre. Teksten er allerede for belærende. Leseren vil tenke selv.',
                },
                {
                    text: 'Det er ikke noe galt. Det er bra at budskapet er tydelig.',
                    correct: false,
                    feedback:
                        'Tydelig er bra, men overtydelig er dårlig. Når forfatteren forteller leseren hva de skal mene, mister teksten kraften sin.',
                },
            ],
        },
    },
    {
        id: 'apply-budskap-3-2',
        deviceId: 'budskap',
        level: 3,
        instruction: 'Skriv en tekst med et subtilt budskap som leseren må tenke seg fram til.',
        data: {
            type: 'write',
            prompt: 'Budskap: «Teknologi kan gjøre oss mer ensomme selv om den kobler oss sammen.»\n\nSkriv 3-5 setninger som viser dette budskapet. Ikke bruk ordene «ensom», «ensomhet» eller «teknologi skaper avstand». La leseren selv forstå budskapet gjennom det som skjer i scenen.',
            hint: 'Vis en situasjon der folk er fysisk nær hverandre, men mentalt langt unna. Mobiler, skjermer og meldinger kan vise fraværet.',
            exampleAnswer:
                'Sofie sendte en melding til Ingrid: «Savner deg!» med tre hjerter. Ingrid svarte med et hjerte tilbake. De satt i samme rom. Ingen av dem så opp fra skjermen.',
        },
    },
    {
        id: 'apply-budskap-3-3',
        deviceId: 'budskap',
        level: 3,
        instruction: 'Vurder: Blir budskapet i denne teksten formidlet godt?',
        data: {
            type: 'true-false',
            statement:
                '"Bestefar hadde aldri fortalt noen om medaljen i skuffen. Da barnebarna fant den etter begravelsen, forsto de at han hadde reddet tre mennesker den natten i 1944. Han hadde aldri trengt å skryte av det." – Budskapet «ekte helter trenger ikke oppmerksomhet» formidles effektivt.',
            correct: true,
            explanation:
                'Ja, dette er svært effektivt. Budskapet kommer gjennom kontrasten mellom den store handlingen (reddet tre liv) og bestefars beskjedenhet (fortalte aldri noen). Leseren trekker selv konklusjonen om hva ekte heltemot er.',
        },
    },
];
