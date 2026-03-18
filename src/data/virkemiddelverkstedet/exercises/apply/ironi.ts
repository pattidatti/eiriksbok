import type { Exercise } from '../../types';

export const ironiApplyExercises: Exercise[] = [
    // NIVÅ 1 – Lærling
    {
        id: 'apply-ironi-1-1',
        deviceId: 'ironi',
        level: 1,
        instruction: 'Hvilken respons er mest ironisk?',
        data: {
            type: 'identify',
            text: 'Du har øvd i to uker til en prøve og får karakteren 2. Vennen din sier:',
            options: [
                {
                    deviceId: 'ironi',
                    label: '"Vel, den øvingen betalte seg virkelig."',
                    correct: true,
                    feedback:
                        'Riktig! Setningen sier det motsatte av det den mener. Du øvde mye, men resultatet var dårlig — og det er nettopp det ironien spiller på.',
                },
                {
                    deviceId: 'ironi',
                    label: '"Oi, det var dårlig. Kanskje du bør øve mer?"',
                    correct: false,
                    feedback:
                        'Ærlig og direkte, men ikke ironisk. Ironi sier det motsatte av det man mener.',
                },
                {
                    deviceId: 'ironi',
                    label: '"Ikke bry deg, prøven var sikkert vanskelig."',
                    correct: false,
                    feedback:
                        'Trøstende, men ikke ironisk. Det er ingen motsetning mellom det som sies og det som menes.',
                },
                {
                    deviceId: 'ironi',
                    label: '"Læreren er urettferdig."',
                    correct: false,
                    feedback:
                        'En mening, men ikke ironi. Ironi ville sagt noe positivt som egentlig betyr noe negativt.',
                },
            ],
        },
    },
    {
        id: 'apply-ironi-1-2',
        deviceId: 'ironi',
        level: 1,
        instruction: 'Fyll inn en ironisk kommentar.',
        data: {
            type: 'fill-blank',
            textBefore:
                'Det har regnet i fjorten dager. Du ser ut vinduet og sier: "For et',
            textAfter: '."',
            correctAnswers: [
                'herlig sommervær',
                'fantastisk vær',
                'nydelig vær',
                'strålende vær',
                'perfekt badevær',
                'flott sommervær',
            ],
            explanation:
                'Ironi fungerer ved å si det motsatte av virkeligheten. Når det regner, er det ironisk å kalle det "herlig sommervær" eller "perfekt badevær". Alle skjønner at du mener det motsatte.',
        },
    },
    {
        id: 'apply-ironi-1-3',
        deviceId: 'ironi',
        level: 1,
        instruction: 'Hvilken setning bruker ironi?',
        data: {
            type: 'explain',
            text: 'Broren din har rotet til hele kjøkkenet etter å ha laget taco. Det er saus på veggen, ost på gulvet og oppvasken er overalt.',
            highlightedWords: 'rotet til hele kjøkkenet',
            question: 'Hvilken kommentar bruker ironi best?',
            options: [
                {
                    text: '"Wow, du er jo en mesterkok. Kjøkkenet har aldri sett bedre ut."',
                    correct: true,
                    feedback:
                        'Riktig! Å kalle ham "mesterkok" og si at kjøkkenet ser bra ut er åpenbart det motsatte av sannheten. Det er ironi.',
                },
                {
                    text: '"Herregud, for et kaos du har laget!"',
                    correct: false,
                    feedback:
                        'Sant, men ikke ironisk. Du sier rett ut hva du mener. Ironi pakker budskapet inn.',
                },
                {
                    text: '"Kan du rydde etter deg?"',
                    correct: false,
                    feedback:
                        'En rett-fram forespørsel. Ironi ville heller sagt noe som "Nei da, ikke rydd — dette er jo kunst."',
                },
            ],
        },
    },

    // NIVÅ 2 – Svenn
    {
        id: 'apply-ironi-2-1',
        deviceId: 'ironi',
        level: 2,
        instruction: 'Skriv en ironisk beskrivelse.',
        data: {
            type: 'write',
            prompt: 'Situasjon: Du har nettopp stått i kø i to timer for å kjøpe billett til en konsert, og akkurat da det er din tur, blir det utsolgt.\n\nSkriv 1-2 ironiske setninger som kommenterer situasjonen. Si det motsatte av det du føler.',
            hint: 'Lat som det er positivt. "For en fantastisk opplevelse..." Eller skriv som om du er takknemlig for å ha stått i kø.',
            exampleAnswer:
                'Fantastisk. To timer i kø, og alt jeg fikk var solbrent nakke og knuste drømmer. Virkelig vel brukt tid.',
        },
    },
    {
        id: 'apply-ironi-2-2',
        deviceId: 'ironi',
        level: 2,
        instruction: 'Koble den ironiske kommentaren med situasjonen den passer til.',
        data: {
            type: 'match',
            pairs: [
                {
                    example: '"For en overraskelse!" (sagt med flatt tonefall)',
                    label: 'Noe helt forventet skjer for femte gang',
                },
                {
                    example: '"Tusen takk for hjelpen."',
                    label: 'Noen lovet å hjelpe, men møtte ikke opp',
                },
                {
                    example: '"Timingen din er upåklagelig."',
                    label: 'Noen kommer en time for sent',
                },
                {
                    example: '"Akkurat det vi trengte."',
                    label: 'Noe uønsket skjer i verst mulig øyeblikk',
                },
            ],
        },
    },
    {
        id: 'apply-ironi-2-3',
        deviceId: 'ironi',
        level: 2,
        instruction: 'Skriv en ironisk fortellerstemme.',
        data: {
            type: 'write',
            prompt: 'En karakter i en historie har bestemt seg for å lese til eksamen kvelden før. Skriv 2-3 setninger med en ironisk fortellerstemme som kommenterer denne "geniale" planen.',
            hint: 'Lat som fortelleren synes planen er briljant. Bruk ord som "selvfølgelig", "naturligvis", "den strålende planen" — men la leseren forstå at det motsatte menes.',
            exampleAnswer:
                'Kvelden før eksamen åpnet Tobias endelig boken. Han hadde naturligvis en strålende strategi: lese 300 sider på fem timer. Det hadde jo alltid fungert før. Eller, det hadde det ikke.',
        },
    },

    // NIVÅ 3 – Mester
    {
        id: 'apply-ironi-3-1',
        deviceId: 'ironi',
        level: 3,
        instruction: 'Finn det mislykkede ironiforsøket.',
        data: {
            type: 'find-error',
            text: 'Tre setninger prøver å være ironiske. En av dem feiler fordi ironien ikke er tydelig nok.',
            errorDescription:
                'God ironi krever at leseren forstår at du mener det motsatte. Hvis setningen bare er uklar, er det ikke ironi — det er forvirrende.',
            options: [
                {
                    text: '"Å stå opp klokken fem om morgenen er det absolutt beste med livet." (Sagt av en som hater morgener.)',
                    correct: false,
                    feedback:
                        'Tydelig ironi. Alle forstår at noen som hater morgener ikke mener dette.',
                },
                {
                    text: '"Hunden min er på en måte smart, men også ikke." (Sagt om en hund som spiste leksene.)',
                    correct: true,
                    feedback:
                        'Riktig! Denne setningen er bare forvirrende. Den motser seg selv uten å være ironisk. Bedre ironi: "Min hund er tydeligvis et geni — han spiste leksene for å spare meg fra å levere dem."',
                },
                {
                    text: '"Kjempefint at alarmen ikke gikk." (Sagt mens de er forsinket til skolen.)',
                    correct: false,
                    feedback:
                        'Klar ironi. Situasjonen gjør det åpenbart at "kjempefint" er det motsatte av hva personen mener.',
                },
            ],
        },
    },
    {
        id: 'apply-ironi-3-2',
        deviceId: 'ironi',
        level: 3,
        instruction: 'Skriv situasjonsironi inn i en kort scene.',
        data: {
            type: 'write',
            prompt: 'Situasjonsironi betyr at noe skjer som er det motsatte av det man forventer. Skriv en kort scene (3-4 setninger) der noe ironisk skjer. For eksempel: en brannstasjon som brenner, en svømmelærer som ikke kan svømme, en tyv som blir bestjålet.\n\nVelg din egen situasjon og vis ironien gjennom handlingen.',
            hint: 'Tenk på situasjoner der resultatet er det stikk motsatte av hva man forventer. Den ironiske effekten er sterkest når kontrasten er tydelig.',
            exampleAnswer:
                'Politiet hadde brukt hele uken på å lete etter den stjålne bilen. Fredag ettermiddag fant de den. Den sto parkert rett utenfor politistasjonen, med en lapp i vinduet: "Beklager uleiligheten."',
        },
    },
    {
        id: 'apply-ironi-3-3',
        deviceId: 'ironi',
        level: 3,
        instruction: 'Er dette god eller dårlig bruk av ironi?',
        data: {
            type: 'true-false',
            statement:
                'En karakter i en bok sier: "Livet er jo så rettferdig." Karakteren har nettopp blitt utestengt fra laget til tross for at hun var best på trening. Denne ironien fungerer godt fordi leseren kjenner konteksten og forstår at karakteren mener det stikk motsatte.',
            correct: true,
            explanation:
                'Ja, dette er effektiv ironi. Konteksten er nøkkelen: vi vet at hun ble urettferdig behandlet, så når hun sier "rettferdig", forstår vi at det er bittert og ironisk. Uten konteksten ville setningen bare vært en nøytral påstand.',
        },
    },
];
