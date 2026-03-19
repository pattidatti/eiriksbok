import type { Exercise } from '../../types';

export const symbolApplyExercises: Exercise[] = [
    // === NIVÅ 1 – Lærling (insert, choose, fill-blank) ===
    {
        id: 'apply-symbol-1-1',
        deviceId: 'symbol',
        level: 1,
        instruction: 'Hvilket symbol passer best i denne historien?',
        data: {
            type: 'identify',
            text: 'I en historie om en elev som endelig tør å stå opp mot mobberne, vil forfatteren legge inn et symbol for mot og ny start. Hvilket objekt bør forfatteren bruke?',
            options: [
                {
                    deviceId: 'symbol',
                    label: 'En blomst som sprenger seg gjennom asfalten',
                    correct: true,
                    feedback:
                        'Riktig! En blomst som bryter gjennom asfalt symboliserer styrke, mot og ny start til tross for motstand.',
                },
                {
                    deviceId: 'symbol',
                    label: 'En regnjakke',
                    correct: false,
                    feedback:
                        'En regnjakke beskytter, men symboliserer ikke mot eller ny start på en tydelig måte.',
                },
                {
                    deviceId: 'symbol',
                    label: 'En mobiltelefon',
                    correct: false,
                    feedback:
                        'En mobil er et hverdagsobjekt uten tydelig symbolsk verdi i denne sammenhengen.',
                },
                {
                    deviceId: 'symbol',
                    label: 'En blyant',
                    correct: false,
                    feedback:
                        'En blyant kan symbolisere kreativitet, men passer ikke like godt for mot og ny start.',
                },
            ],
        },
    },
    {
        id: 'apply-symbol-1-2',
        deviceId: 'symbol',
        level: 1,
        instruction: 'Fyll inn et symbolsk objekt som passer i denne setningen.',
        data: {
            type: 'fill-blank',
            textBefore:
                'Da hun endelig bestemte seg for å tilgi venninnen, åpnet hun vinduet og slapp ut',
            textAfter: '.',
            correctAnswers: [
                'en fugl',
                'fuglen',
                'sommerfuglen',
                'en sommerfugl',
                'en hvit due',
                'duen',
            ],
            acceptKeywords: ['fugl', 'sommerfugl', 'due', 'ballong', 'drage', 'falk', 'spurv'],
            hint: 'Tenk på noe som kan fly fritt - et symbol for tilgivelse og frihet.',
            explanation:
                'En fugl som slippes fri er et klassisk symbol for tilgivelse og det å slippe noe negativt. Fuglen representerer friheten som kommer når du lar noe vondt gå.',
        },
    },
    {
        id: 'apply-symbol-1-3',
        deviceId: 'symbol',
        level: 1,
        instruction: 'Hvilket symbol passer best for å vise ensomhet i en tekst?',
        data: {
            type: 'identify',
            text: 'En forfatter skriver om en gutt som føler seg ensom etter at familien flyttet til en ny by. Hvilket symbol bør gå igjen i teksten?',
            options: [
                {
                    deviceId: 'symbol',
                    label: 'Et tomt hus med mørke vinduer',
                    correct: true,
                    feedback:
                        'Riktig! Et tomt, mørkt hus er et kraftig symbol for ensomhet og tomhet. Det speiler guttens indre følelse.',
                },
                {
                    deviceId: 'symbol',
                    label: 'En ny skolesekk',
                    correct: false,
                    feedback:
                        'En skolesekk kan symbolisere ny start, men ikke ensomhet direkte.',
                },
                {
                    deviceId: 'symbol',
                    label: 'En fotball',
                    correct: false,
                    feedback:
                        'En fotball symboliserer gjerne fellesskap og lek, ikke ensomhet.',
                },
                {
                    deviceId: 'symbol',
                    label: 'En stor middag',
                    correct: false,
                    feedback:
                        'Mat og middager forbindes ofte med fellesskap, det motsatte av ensomhet.',
                },
            ],
        },
    },

    // === NIVÅ 2 – Svenn (write, match, explain/choose-best) ===
    {
        id: 'apply-symbol-2-1',
        deviceId: 'symbol',
        level: 2,
        instruction:
            'Skriv en kort scene der du bruker et symbol for å vise en følelse uten å si den direkte.',
        data: {
            type: 'write',
            prompt: 'Skriv 2–3 setninger om en karakter som føler håp. Ikke skriv ordet «håp» – bruk i stedet et symbol (et objekt, et naturfenomen) som viser følelsen. Vis, ikke fortell!',
            hint: 'Hva forbinder du med håp? Lys i mørket? En frø som spirer? En solstråle? La symbolet gjøre jobben.',
            exampleAnswer:
                'Hun stirret ut av vinduet. Midt i den grå hagen hadde en ensom krokus presset seg opp gjennom den frosne jorden.',
        },
    },
    {
        id: 'apply-symbol-2-2',
        deviceId: 'symbol',
        level: 2,
        instruction: 'Koble hvert symbol med den følelsen eller ideen det vanligvis representerer.',
        data: {
            type: 'match',
            pairs: [
                { example: 'En lukket dør', label: 'Avvisning eller hemmelighet' },
                { example: 'En storm som nærmer seg', label: 'Kommende konflikt eller fare' },
                { example: 'Et lys i vinduet', label: 'Håp eller trygghet' },
                { example: 'Et knust speil', label: 'Ødelagt selvbilde eller brutt identitet' },
            ],
        },
    },
    {
        id: 'apply-symbol-2-3',
        deviceId: 'symbol',
        level: 2,
        instruction: 'Hvilket symbol ville styrket denne teksten?',
        data: {
            type: 'explain',
            text: 'Emil satt alene på benken etter at bestekameraten hadde sagt at han ikke ville være venner lenger. Alt føltes tomt.',
            highlightedWords: 'Alt føltes tomt',
            question:
                'Hvilken symbolsk detalj ville best erstatte «Alt føltes tomt» og vist følelsen i stedet?',
            options: [
                {
                    text: '«På bakken ved føttene hans lå en fotball med hull i – luften hadde gått ut for lenge siden.»',
                    correct: true,
                    feedback:
                        'Riktig! Den tomme fotballen symboliserer vennskapet som har «gått tomt». Det er et sterkt bilde som viser følelsen uten å fortelle den.',
                },
                {
                    text: '«Han var veldig trist og lei seg.»',
                    correct: false,
                    feedback:
                        'Det forteller følelsen direkte i stedet for å vise den med et symbol. Husk: vis, ikke fortell!',
                },
                {
                    text: '«Solen skinte, men Emil merket det ikke.»',
                    correct: false,
                    feedback:
                        'Det er et kontrastbilde, men ikke et symbol. Et symbol er et konkret objekt som bærer en dypere mening.',
                },
            ],
        },
    },

    // === NIVÅ 3 – Mester (find-error/fix, advanced write, match) ===
    {
        id: 'apply-symbol-3-1',
        deviceId: 'symbol',
        level: 3,
        instruction:
            'En av disse tekstene bruker symbolikk på en klønete og overtydelig måte. Finn den.',
        data: {
            type: 'find-error',
            text: 'Hvilken tekst tvinger symbolet på leseren i stedet for å la det virke naturlig?',
            errorDescription:
                'God symbolikk er subtil – leseren skal oppdage meningen selv. Hvis forfatteren forklarer symbolet, mister det kraften sin.',
            options: [
                {
                    text: '«Hun la den døde rosen på bordet. Rosen symboliserte at kjærligheten var over, tenkte hun.»',
                    correct: true,
                    feedback:
                        'Riktig! Forfatteren ødelegger symbolet ved å forklare det. «Rosen symboliserte» er som å forklare en vits – det dreper effekten. La leseren tolke selv!',
                },
                {
                    text: '«Klokken på veggen hadde stoppet. Viserne pekte stivt på halv tre, som om tiden nektet å gå videre.»',
                    correct: false,
                    feedback:
                        'Dette er godt! Klokken som har stoppet antyder at noe har stagnert, men forfatteren forklarer det ikke direkte.',
                },
                {
                    text: '«Hver morgen gikk han forbi den tomme lekeplassen. Huskene hang stille.»',
                    correct: false,
                    feedback:
                        'Flott symbolbruk! Den tomme lekeplassen antyder tap av barndom eller ensomhet, men leseren får oppdage det selv.',
                },
                {
                    text: '«Brevet lå uåpnet på bordet i tre uker. Støvet la seg tynt over konvolutten.»',
                    correct: false,
                    feedback:
                        'Subtilt og effektivt! Støvet viser at tiden går og brevet unngås, uten at forfatteren trenger å si det.',
                },
            ],
        },
    },
    {
        id: 'apply-symbol-3-2',
        deviceId: 'symbol',
        level: 3,
        instruction:
            'Skriv en scene der et symbol utvikler seg gjennom teksten.',
        data: {
            type: 'write',
            prompt: 'Skriv 3–4 setninger der et symbol (f.eks. et tre, en ild, en vei) dukker opp og forandrer seg for å vise en karakters utvikling. Symbolet skal bety noe annet i slutten enn i starten. Ikke forklar symbolet – la leseren tolke.',
            hint: 'Eksempel: En karakter begynner med å stirre på en lukket dør. I slutten åpner hun den. Døren symboliserer først frykt, deretter mot. Finn ditt eget symbol!',
            exampleAnswer:
                'I starten av semesteret tegnet han bare med svart blyant. Strekene var harde og kantete. Men den siste dagen brukte han farger for første gang. Tegningen forestilte et vindu, vidåpent mot himmelen.',
        },
    },
    {
        id: 'apply-symbol-3-3',
        deviceId: 'symbol',
        level: 3,
        instruction:
            'Koble hver type symbol med den konteksten der det ville fungert best.',
        data: {
            type: 'match',
            pairs: [
                {
                    example: 'En historie om å vokse opp og forlate barndommen',
                    label: 'Et gammelt kosedyr som blir lagt i en eske',
                },
                {
                    example: 'En historie om en hemmelighet som truer med å komme ut',
                    label: 'En sprekk i veggen som blir større og større',
                },
                {
                    example: 'En historie om å finne seg selv etter en vanskelig tid',
                    label: 'Et puslespill der den siste brikken faller på plass',
                },
                {
                    example: 'En historie om en familie som vokser fra hverandre',
                    label: 'Et familiefoto som gradvis blekner i sollyset',
                },
            ],
        },
    },
];
