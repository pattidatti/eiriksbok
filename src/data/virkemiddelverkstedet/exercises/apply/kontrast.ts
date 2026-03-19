import type { Exercise } from '../../types';

export const kontrastApplyExercises: Exercise[] = [
    // NIVÅ 1 – Lærling
    {
        id: 'apply-kontrast-1-1',
        deviceId: 'kontrast',
        level: 1,
        instruction: 'Hvilken setning skaper den beste kontrasten?',
        data: {
            type: 'identify',
            text: 'En scene beskriver en festlig bryllupsfeiring. Hvilken setning legger til en effektfull kontrast?',
            options: [
                {
                    deviceId: 'kontrast',
                    label: '"Alle lo og danset — bortsett fra bruden, som gråt på badet."',
                    correct: true,
                    feedback:
                        'Riktig! Kontrasten mellom feiringen og brudens gråt er slående. Det skaper umiddelbart nysgjerrighet og følelse.',
                },
                {
                    deviceId: 'kontrast',
                    label: '"Maten var god og musikken var fin."',
                    correct: false,
                    feedback:
                        'Alt er positivt her. Det er ingen kontrast — bare en beskrivelse av en hyggelig fest.',
                },
                {
                    deviceId: 'kontrast',
                    label: '"Det var mange gjester i bryllupet."',
                    correct: false,
                    feedback: 'En nøytral opplysning uten noen kontrast.',
                },
                {
                    deviceId: 'kontrast',
                    label: '"Bryllupslokalene var pent pyntet med blomster."',
                    correct: false,
                    feedback:
                        'Fin beskrivelse, men den forsterker bare den positive stemningen. Kontrast krever en motsetning.',
                },
            ],
        },
    },
    {
        id: 'apply-kontrast-1-2',
        deviceId: 'kontrast',
        level: 1,
        instruction: 'Fyll inn det kontrasterende elementet.',
        data: {
            type: 'fill-blank',
            textBefore: 'Utenfor skinte solen og barna lekte. Inne i huset var alt',
            textAfter: '.',
            correctAnswers: [
                'stille og mørkt',
                'mørkt og stille',
                'kaldt og tomt',
                'taust og grått',
                'stille',
                'mørkt',
            ],
            acceptKeywords: ['stille', 'mørk', 'kald', 'tom', 'taus', 'grå', 'ensom', 'trist', 'øde', 'dyster'],
            hint: 'Hva er det motsatte av sol, lek og latter? Beskriv det som er inne i huset.',
            explanation:
                'Kontrasten mellom den lyse, livlige utsiden og det mørke, stille innsiden skaper en umiddelbar stemning. Leseren forstår at noe er galt inne i huset uten at det trengs å forklares.',
        },
    },
    {
        id: 'apply-kontrast-1-3',
        deviceId: 'kontrast',
        level: 1,
        instruction: 'Hvilken kontrast gir den sterkeste effekten?',
        data: {
            type: 'explain',
            text: 'Du vil beskrive en rik og en fattig nabo som bor ved siden av hverandre.',
            highlightedWords: 'rik og en fattig',
            question: 'Hvilken beskrivelse bruker kontrast mest effektivt?',
            options: [
                {
                    text: '"På den ene siden av gjerdet kastet familien mat som var til overs. På den andre siden drømte et barn om et varmt måltid."',
                    correct: true,
                    feedback:
                        'Riktig! Kontrasten mellom å kaste mat og å drømme om mat er konkret og slående. Gjerdet understreker at forskjellen finnes rett ved siden av hverandre.',
                },
                {
                    text: '"Den ene familien var rik og den andre var fattig."',
                    correct: false,
                    feedback:
                        'Sant, men for enkelt. Kontrast blir sterkere når du viser forskjellen gjennom detaljer i stedet for å bare fortelle den.',
                },
                {
                    text: '"Begge familiene bodde i det samme nabolaget og hadde barn på samme alder."',
                    correct: false,
                    feedback:
                        'Her viser du likheter, ikke kontrast. For å skape kontrast må du fremheve forskjellene.',
                },
            ],
        },
    },

    // NIVÅ 2 – Svenn
    {
        id: 'apply-kontrast-2-1',
        deviceId: 'kontrast',
        level: 2,
        instruction: 'Skriv en setning som bruker kontrast for å vise ensomhet.',
        data: {
            type: 'write',
            prompt: 'Skriv 1-2 setninger der du bruker kontrast for å vise at en karakter føler seg ensom. Still noe sosialt og livlig opp mot karakterens ensomhet.',
            hint: 'Tenk på en situasjon der alle andre har det gøy. Vis gleden rundt karakteren og ensomheten inni. Kontrasten gjør ensomheten sterkere.',
            exampleAnswer:
                'Kantinen var full av latter og prat. Maja satt ved vinduet med en tom stol på hver side.',
        },
    },
    {
        id: 'apply-kontrast-2-2',
        deviceId: 'kontrast',
        level: 2,
        instruction: 'Koble hver kontrast med effekten den skaper.',
        data: {
            type: 'match',
            pairs: [
                {
                    example: 'Lys vs. mørke i en scene',
                    label: 'Bygger spenning og uro',
                },
                {
                    example: 'Et barn som ler midt i en krig',
                    label: 'Viser uskyld mot brutalitet',
                },
                {
                    example: 'Rike klær på en sulten person',
                    label: 'Avslører skjult nød bak fasaden',
                },
                {
                    example: 'Stille natur etter en eksplosjon',
                    label: 'Forsterker sjokket og tomheten',
                },
            ],
        },
    },
    {
        id: 'apply-kontrast-2-3',
        deviceId: 'kontrast',
        level: 2,
        instruction: 'Skriv en kontrast mellom før og nå.',
        data: {
            type: 'write',
            prompt: 'Skriv 2-3 setninger der du beskriver det samme stedet på to ulike tidspunkt. Vis kontrasten mellom hvordan stedet var og hvordan det er nå. Stedet er en lekeplass.',
            hint: 'Bruk sansene: lyder, farger, stemning. "Før" bør være livlig og fargerikt, "nå" bør være det motsatte — eller omvendt!',
            exampleAnswer:
                'Før var lekeplassen full av skrik og latter. Huskene gikk aldri i ro, og sanden var full av fotavtrykk. Nå sto husken stille, og gresset hadde begynt å vokse over sandkassen.',
        },
    },

    // NIVÅ 3 – Mester
    {
        id: 'apply-kontrast-3-1',
        deviceId: 'kontrast',
        level: 3,
        instruction: 'Finn den svake kontrasten og forklar hvordan du ville styrket den.',
        data: {
            type: 'find-error',
            text: 'Tre setninger prøver å bruke kontrast. En av dem er for svak til å ha noen effekt.',
            errorDescription:
                'God kontrast krever at motsetningene er tydelige og konkrete. Vage kontraster gir liten effekt.',
            options: [
                {
                    text: '"Han smilte mens tårene rant." — Smilet og tårene står i direkte motsetning.',
                    correct: false,
                    feedback:
                        'Sterk kontrast! To motstridende følelser i én setning skaper et komplekst bilde.',
                },
                {
                    text: '"Været var litt fint, men også litt dårlig." — Kontrast mellom fint og dårlig vær.',
                    correct: true,
                    feedback:
                        'Riktig! "Litt fint" og "litt dårlig" er for vage til å skape en ekte kontrast. Bedre: "Solen brente fra skyfri himmel, men vinden var iskald." Da er motsetningen konkret og sanselig.',
                },
                {
                    text: '"Bygningen var splitter ny, men inni luktet det av forfall og glemt tid." — Nytt ytre, gammelt indre.',
                    correct: false,
                    feedback:
                        'Effektiv kontrast mellom det nye og det forfalne. Lukten gjør det sanselig og sterkt.',
                },
            ],
        },
    },
    {
        id: 'apply-kontrast-3-2',
        deviceId: 'kontrast',
        level: 3,
        instruction: 'Skriv et avsnitt med kontrast på flere nivåer.',
        data: {
            type: 'write',
            prompt: 'Skriv 3-4 setninger der du bruker kontrast på minst to nivåer. For eksempel:\n- Ytre kontrast (omgivelser vs. karakter)\n- Indre kontrast (følelser vs. oppførsel)\n\nScene: En elev får vite at hun har kommet inn på drømmeskolen, men det betyr at hun må flytte fra bestevennene.',
            hint: 'Vis gleden og sorgen samtidig. La det ytre (feiring, gratulasjoner) stå i kontrast til det indre (tvil, sorg). Eller la ordene si én ting mens kroppen viser noe annet.',
            exampleAnswer:
                'Meldingen lyste opp skjermen: "Gratulerer, du er tatt opp!" Mamma hoppet og klappet. Sara smilte og sa takk. Men på rommet sitt etterpå stirret hun på veggen der alle bildene av henne og Noor hang, og smilet forsvant.',
        },
    },
    {
        id: 'apply-kontrast-3-3',
        deviceId: 'kontrast',
        level: 3,
        instruction: 'Vurder denne bruken av kontrast.',
        data: {
            type: 'true-false',
            statement:
                '"Generalen spiste en syv-retters middag mens soldatene delte på en brødskive." Denne kontrasten er effektiv fordi den bruker en konkret, sanselig detalj (mat) for å vise en abstrakt forskjell (urettferdighet og maktforskjell).',
            correct: true,
            explanation:
                'Ja, dette er en sterk kontrast. I stedet for å si "generalen var privilegert og soldatene led," viser forfatteren det gjennom mat — noe alle forstår. Syv retter mot én brødskive. Kontrasten er konkret, enkel og slagkraftig.',
        },
    },
];
