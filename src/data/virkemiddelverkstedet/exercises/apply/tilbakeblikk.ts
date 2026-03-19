import type { Exercise } from '../../types';

export const tilbakeblikkApplyExercises: Exercise[] = [
    // NIVÅ 1 – Lærling
    {
        id: 'apply-tilbakeblikk-1-1',
        deviceId: 'tilbakeblikk',
        level: 1,
        instruction: 'Hvilken setning starter et tilbakeblikk best?',
        data: {
            type: 'explain',
            text: 'Mira sto foran den gamle skolen. Vinduene var knust, og gresset hadde vokst over lekeplassen.',
            highlightedWords: 'den gamle skolen',
            question:
                'Hvilken setning ville best starte et tilbakeblikk til da Mira gikk på skolen?',
            options: [
                {
                    text: '"Hun husket den første dagen. Mamma hadde holdt henne i hånden, og skolegården hadde virket enorm."',
                    correct: true,
                    feedback:
                        'Riktig! "Hun husket" er en naturlig overgang til fortiden. Vi flyttes fra nåtiden til et tydelig minne.',
                },
                {
                    text: '"Skolen ble bygget i 1985 og hadde 200 elever."',
                    correct: false,
                    feedback:
                        'Dette er bakgrunnsinformasjon, ikke et tilbakeblikk. Et tilbakeblikk tar oss inn i en scene fra fortiden.',
                },
                {
                    text: '"Mira lurer på om skolen noen gang vil bli pusset opp."',
                    correct: false,
                    feedback:
                        'Denne setningen peker fremover, ikke bakover. Et tilbakeblikk tar oss tilbake i tid.',
                },
            ],
        },
    },
    {
        id: 'apply-tilbakeblikk-1-2',
        deviceId: 'tilbakeblikk',
        level: 1,
        instruction: 'Fyll inn et uttrykk som starter et tilbakeblikk.',
        data: {
            type: 'fill-blank',
            textBefore: 'Han så på det gamle fotografiet.',
            textAfter: ', de hadde sittet rundt bordet og ledd til langt på natt.',
            correctAnswers: [
                'Han husket den kvelden',
                'Plutselig var han tilbake',
                'Det tok ham tilbake til den kvelden',
                'Minnet traff ham',
            ],
            acceptKeywords: ['husket', 'minnet', 'tilbake', 'plutselig', 'så for seg', 'tenkte', 'erindret'],
            hint: 'Lag en overgang fra nåtid til fortid. Bruk et uttrykk som tar karakteren tilbake i tid.',
            explanation:
                'For å starte et tilbakeblikk trenger vi en overgang som tar leseren fra nåtiden til fortiden. Uttrykk som "han husket" eller "plutselig var han tilbake" fungerer som en bro mellom tidene.',
        },
    },
    {
        id: 'apply-tilbakeblikk-1-3',
        deviceId: 'tilbakeblikk',
        level: 1,
        instruction: 'Hvilken av disse er den beste triggeren for et tilbakeblikk?',
        data: {
            type: 'identify',
            text: 'En karakter skal plutselig huske noe fra barndommen. Hva fungerer best som trigger?',
            options: [
                {
                    deviceId: 'tilbakeblikk',
                    label: 'Lukten av nybakt brød fra et bakeri hun går forbi',
                    correct: true,
                    feedback:
                        'Riktig! Sanseinntrykk som lukt er en av de sterkeste triggerne for minner. Det føles naturlig at en lukt plutselig tar henne tilbake.',
                },
                {
                    deviceId: 'tilbakeblikk',
                    label: 'Fortelleren skriver "Vi spoler tilbake til 2015"',
                    correct: false,
                    feedback:
                        'Det er for direkte og bryter illusjonen. Et godt tilbakeblikk glir naturlig inn i handlingen.',
                },
                {
                    deviceId: 'tilbakeblikk',
                    label: 'Karakteren bestemmer seg for å tenke på barndommen',
                    correct: false,
                    feedback:
                        'Det føles kunstig. De beste tilbakeblikkene kommer uventet, utløst av noe i omgivelsene.',
                },
                {
                    deviceId: 'tilbakeblikk',
                    label: 'En fotnote som forklarer hva som skjedde tidligere',
                    correct: false,
                    feedback:
                        'Fotnoter hører ikke hjemme i skjønnlitteratur. Et tilbakeblikk er en del av fortellingen, ikke en forklaring.',
                },
            ],
        },
    },

    // NIVÅ 2 – Svenn
    {
        id: 'apply-tilbakeblikk-2-1',
        deviceId: 'tilbakeblikk',
        level: 2,
        instruction: 'Skriv en åpning til et tilbakeblikk utløst av en gjenstand.',
        data: {
            type: 'write',
            prompt: 'Scene: Kasper rydder rommet sitt og finner en gammel fotball under sengen. Den er flat og slitt. Skriv 2-3 setninger som tar Kasper tilbake til et minne knyttet til fotballen.',
            hint: 'Start med en sansedetalj (hvordan ballen føles, lukter, ser ut) og la det utløse minnet. Bytt deretter til fortid.',
            exampleAnswer:
                'Kasper snudde ballen mellom hendene. Gressflekkene var fortsatt der. Plutselig var han tilbake på den banen, ti år gammel, med sol i øynene og pappa som ropte fra sidelinja.',
        },
    },
    {
        id: 'apply-tilbakeblikk-2-2',
        deviceId: 'tilbakeblikk',
        level: 2,
        instruction: 'Koble hver trigger med den scenen den mest naturlig ville utløst.',
        data: {
            type: 'match',
            pairs: [
                {
                    example: 'Lukten av røyk fra et bål',
                    label: 'Minne fra en sommerleir i barndommen',
                },
                {
                    example: 'En gammel sang på radioen',
                    label: 'Minne fra en skoleavslutning',
                },
                {
                    example: 'Smaken av salt sjøvann',
                    label: 'Minne fra en ferie ved havet',
                },
                {
                    example: 'Lyden av glass som knuser',
                    label: 'Minne fra en krangel hjemme',
                },
            ],
        },
    },
    {
        id: 'apply-tilbakeblikk-2-3',
        deviceId: 'tilbakeblikk',
        level: 2,
        instruction: 'Skriv overgangen tilbake til nåtiden etter et tilbakeblikk.',
        data: {
            type: 'write',
            prompt: 'Tilbakeblikket: "De hadde løpt gjennom regnet den kvelden, gjennomvåte og lattermilde. Ingenting hadde betydning bortsett fra det øyeblikket."\n\nSkriv 1-2 setninger som tar karakteren tilbake til nåtiden. Overgangen skal føles naturlig, ikke brå.',
            hint: 'Bruk en lyd, en bevegelse eller noe som "vekker" karakteren fra minnet. Vis kontrasten mellom da og nå.',
            exampleAnswer:
                'En bilhorn utenfor vinduet rev henne ut av minnet. Regnet falt fortsatt, men nå var hun alene.',
        },
    },

    // NIVÅ 3 – Mester
    {
        id: 'apply-tilbakeblikk-3-1',
        deviceId: 'tilbakeblikk',
        level: 3,
        instruction: 'Fiks dette brå tilbakeblikket som forvirrer leseren.',
        data: {
            type: 'find-error',
            text: '"Sara gikk til butikken. Hun var seks år og lekte med dukker. Sara kjøpte melk og gikk hjem." Her hopper teksten plutselig til barndommen og tilbake uten noen overgang.',
            errorDescription:
                'Tilbakeblikket mangler både trigger og overgang. Leseren skjønner ikke at vi har byttet tid.',
            options: [
                {
                    text: 'Legg til en trigger og overgang: "Sara gikk til butikken. Ved lekeavdelingen stoppet hun opp. Et øyeblikk var hun seks år igjen, med en dukke i hånden og hele verden foran seg. Hun ristet på hodet og gikk videre til melkehyllen."',
                    correct: true,
                    feedback:
                        'Riktig! Nå har tilbakeblikket en naturlig trigger (lekeavdelingen), en tydelig overgang inn i minnet, og en myk retur til nåtiden.',
                },
                {
                    text: 'Bare skriv "(tilbakeblikk)" foran setningen om barndommen.',
                    correct: false,
                    feedback:
                        'Det er en teknisk merkelapp, ikke god fortelling. Leseren skal forstå tidshoppet gjennom selve teksten.',
                },
                {
                    text: 'Fjern barndommen helt. Det trengs ikke.',
                    correct: false,
                    feedback:
                        'Tilbakeblikk kan gi dybde og følelse til en historie. Problemet er ikke at det er der, men hvordan det er gjort.',
                },
            ],
        },
    },
    {
        id: 'apply-tilbakeblikk-3-2',
        deviceId: 'tilbakeblikk',
        level: 3,
        instruction: 'Skriv et tilbakeblikk med en myk overgang inn og ut.',
        data: {
            type: 'write',
            prompt: 'Scene: Nora sitter på en buss i regnet. Hun ser et barn med en rød paraply på fortauet. Skriv et kort avsnitt (4-5 setninger) der synet av barnet trigger et tilbakeblikk til Noras egen barndom. Vis overgangen inn i minnet, selve minnet, og returen til bussen.',
            hint: 'La sansene lede: Noe Nora ser, hører eller føler tar henne tilbake. Bruk tempusbytte (fra nåtid til fortid) og en liten detalj som binder minnet til nåtiden.',
            exampleAnswer:
                'Barnet med den røde paraplyen hoppet i en sølepytt. Nora smilte. Hun hadde hatt en akkurat slik paraply. Mamma hadde kjøpt den på et marked, og Nora hadde nektet å bruke noen annen, selv når den var full av hull. Bussen rykket til, og paraplyen på fortauet forsvant bak et hushjørne.',
        },
    },
    {
        id: 'apply-tilbakeblikk-3-3',
        deviceId: 'tilbakeblikk',
        level: 3,
        instruction: 'Vurder om dette tilbakeblikket fungerer godt.',
        data: {
            type: 'true-false',
            statement:
                '"Han åpnet den gamle dagboken og leste. 15. juni. I dag fisket vi ved elven. Pappa sa at jeg kastet bedre enn ham." Denne teksten bruker dagboken som trigger, og selve dagbok-teksten er tilbakeblikket. Det fungerer fordi vi forstår tidsforskjellen gjennom formatet.',
            correct: true,
            explanation:
                'Ja, dette er et smart tilbakeblikk. Dagboken er en naturlig trigger, og ved å gjengi dagbokteksten direkte (med barnlig språk og "pappa") forstår vi at dette er fra fortiden. Formatet gjør overgangen tydelig uten at fortelleren må forklare det.',
        },
    },
];
