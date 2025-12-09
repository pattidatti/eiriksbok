import type { TextAnalysisGameData } from '../types';

const standardCategories = [
    {
        id: 'etos',
        label: 'Etos (Troverdighet)',
        color: 'blue-500',
        description: 'Avsenderen bygger tillit ved å vise til rolle, erfaring eller moral.'
    },
    {
        id: 'logos',
        label: 'Logos (Fornuft)',
        color: 'green-500',
        description: 'Avsenderen bruker fakta, tall og logiske resonnementer.'
    },
    {
        id: 'patos',
        label: 'Patos (Følelser)',
        color: 'red-500',
        description: 'Avsenderen prøver å vekke følelser som sinne, glede, frykt eller medlidenhet.'
    }
];

export const rhetoricGames: TextAnalysisGameData[] = [
    {
        id: "retorikk-skolevalg",
        title: "Nivå 1: Skolevalgkamp",
        text: "Kjære medelever! Som elevrådsleder gjennom to år har jeg sett hva som fungerer på denne skolen, og jeg vet at vi trenger forandring. Forskning fra Utdanningsdirektoratet viser at skoler med varm lunsj opplever 15% mindre bråk i timene. Tenk deg følelsen av varm suppe på en kald vinterdag, i stedet for den tørre brødskiva du har i sekken. Er det ikke på tide at vi unner oss det?",
        categories: standardCategories,
        solutions: [
            {
                id: 's1',
                start: 17, // "Som elevrådsleder gjennom to år"
                end: 48,
                categoryId: 'etos',
                explanation: "Her bruker avsender sin tittel som elevrådsleder for å bygge troverdighet (Etos)."
            },
            {
                id: 's2',
                start: 106, // "Forskning fra Utdanningsdirektoratet viser at skoler med varm lunsj opplever 15% mindre bråk i timene."
                end: 205,
                categoryId: 'logos',
                explanation: "Her brukes fakta (forskning) og tall (15%) for å overbevise med fornuft (Logos)."
            },
            {
                id: 's3',
                start: 206, // "Tenk deg følelsen av varm suppe på en kald vinterdag, i stedet for den tørre brødskiva du har i sekken."
                end: 308,
                categoryId: 'patos',
                explanation: "Her spilles det på følelser og sanser (varm suppe vs tørr brødskive) for å engasjere publikum (Patos)."
            }
        ]
    },
    {
        id: "retorikk-reklame",
        title: "Nivå 2: Reklame for EnergiMax",
        text: "Er du lei av å være trøtt? EnergiMax er utviklet av nobelprisvinnende forskere for å gi deg optimal ytelse. Studier viser at energinivået øker med 200% innen 10 minutter. Ikke la trettheten ødelegge dagen din – føl kraften bruse gjennom årene og bli den helten du er ment å være!",
        categories: standardCategories,
        solutions: [
            {
                id: 's1',
                start: 35, // "utviklet av nobelprisvinnende forskere"
                end: 71,
                categoryId: 'etos',
                explanation: "Henvisning til eksperter (nobelprisvinnere) bygger stor troverdighet om produktet."
            },
            {
                id: 's2',
                start: 96, // "Studier viser at energinivået øker med 200% innen 10 minutter."
                end: 157,
                categoryId: 'logos',
                explanation: "Bruk av 'studier' og konkrete tall som '200%' og '10 minutter' er klassisk logos."
            },
            {
                id: 's3',
                start: 194, // "føl kraften bruse gjennom årene og bli den helten du er ment å være"
                end: 257,
                categoryId: 'patos',
                explanation: "Sterke ord som 'kraften bruse' og 'helten' spiller på følelsen av styrke og selvrealisering."
            }
        ]
    },
    {
        id: "retorikk-debatt",
        title: "Nivå 3: Leksefri Skole",
        text: "Det er på tide å avskaffe leksene. Som lærer med 20 års erfaring ser jeg hvordan leksene skaper stress og stjeler tid fra familie og fritid. OECD-rapporter bekrefter at det er liten sammenheng mellom mye lekser og læringsutbytte i grunnskolen. La barna få være barn når skoledagen er over, og la oss heller bruke tiden på skolen mer effektivt!",
        categories: standardCategories,
        solutions: [
            {
                id: 's1',
                start: 37, // "Som lærer med 20 års erfaring"
                end: 65,
                categoryId: 'etos',
                explanation: "Læreren bruker sin lange erfaring for å vise at han vet hva han snakker om."
            },
            {
                id: 's2',
                start: 137, // "OECD-rapporter bekrefter at det er liten sammenheng mellom mye lekser og læringsutbytte"
                end: 221,
                categoryId: 'logos',
                explanation: "Henvisning til tunge rapporter (OECD) og forskningsfunn styrker argumentet logisk."
            },
            {
                id: 's3',
                start: 74, // "skaper stress og stjeler tid fra familie og fritid"
                end: 124,
                categoryId: 'patos',
                explanation: "Ord som 'stjeler tid' og 'familie' vekker sympati og dårlig samvittighet."
            },
            {
                id: 's4',
                start: 241, // "La barna få være barn"
                end: 262,
                categoryId: 'patos',
                explanation: "Et sterkt emosjonelt slagord som appellerer til beskytterinstinktet."
            }
        ]
    },
    {
        id: "retorikk-mlk",
        title: "Nivå 4: Martin Luther King Jr.",
        text: "Jeg har en drøm om at mine fire små barn en dag skal leve i en nasjon hvor de ikke blir dømt etter hudfargen, men etter innholdet i deres karakter. Vi holder disse sannhetene for å være selvinnlysende: at alle mennesker er født like. La oss ikke søke å slukke vår tørst etter frihet ved å drikke av bitterhetens og hatets beger.",
        categories: standardCategories,
        solutions: [
            {
                id: 's1',
                start: 22, // "mine fire små barn"
                end: 40,
                categoryId: 'patos',
                explanation: "King bruker sine egne barn for å gjøre det politiske personlig og emosjonelt."
            },
            {
                id: 's2',
                start: 147, // "Vi holder disse sannhetene for å være selvinnlysende: at alle mennesker er født like."
                end: 231,
                categoryId: 'etos',
                explanation: "Han siterer den amerikanske uavhengighetserklæringen – nasjonens grunnfjell – for å låne dens autoritet."
            },
            {
                id: 's3',
                start: 263, // "slukke vår tørst etter frihet ved å drikke av bitterhetens og hatets beger"
                end: 334,
                categoryId: 'patos', // Også metafor, men i denne konteksten patos
                explanation: "En kraftig metafor som maler et bilde av hat som gift, ment å vekke frykt for vold."
            }
        ]
    },
    {
        id: "retorikk-unnskyldning",
        title: "Nivå 5: En offentlig unnskyldning",
        text: "Jeg står her i dag med tungt hjerte for å si unnskyld. Som deres leder tar jeg fullt ansvar for feilen som har skjedd. Det var aldri min intensjon å skuffe dere, og jeg forstår sinnet deres. Når jeg ser hvordan dette har påvirket lokalsamfunnet vårt, kjenner jeg en dyp sorg. Jeg lover å gjøre alt i min makt for å rette opp i dette og gjenoppbygge tilliten dere har vist meg.",
        categories: standardCategories,
        solutions: [
            {
                id: 's1',
                start: 46, // "Som deres leder tar jeg fullt ansvar"
                end: 80,
                categoryId: 'etos',
                explanation: "Ved å ta ansvar og vise til sin rolle som leder, forsøker avsenderen å gjenoppbygge sin tapte troverdighet."
            },
            {
                id: 's2',
                start: 171, // "kjenner jeg en dyp sorg"
                end: 194,
                categoryId: 'patos',
                explanation: "Avsenderen deler sine personlige, tunge følelser for å vekke sympati og vise at angran er ekte."
            },
            {
                id: 's3',
                start: 0, // "tungt hjerte"
                end: 12,
                categoryId: 'patos', // Metaphorical emotion
                explanation: "Metaforen 'tungt hjerte' setter en alvorlig og angrende tone umiddelbart."
            }
        ]
    },
    {
        id: "retorikk-klima",
        title: "Nivå 6: Klimatoppmøtet",
        text: "Huset vårt brenner. FNs klimapanel slår fast at vi har mindre enn ti år på å halvere utslippene våre hvis vi skal unngå katastrofale konsekvenser. Isen smelter, havet stiger, og arter dør ut i et tempo vi aldri har sett før. Hvordan kan dere se deres egne barnebarn i øynene og si at dere visste, men ikke gjorde noe?",
        categories: standardCategories,
        solutions: [
            {
                id: 's1',
                start: 0, // "Huset vårt brenner"
                end: 17,
                categoryId: 'patos',
                explanation: "En kraftig metafor som skaper akutt frykt og hastverk (Patos)."
            },
            {
                id: 's2',
                start: 19, // "FNs klimapanel slår fast at vi har mindre enn ti år"
                end: 70,
                categoryId: 'logos',
                explanation: "Henvisning til vitenskapelig autoritet (FN) og tidsfrister gir argumentet logisk tyngde."
            },
            {
                id: 's3',
                start: 247, // "se deres egne barnebarn i øynene"
                end: 279,
                categoryId: 'patos',
                explanation: "Å trekke inn 'barnebarn' treffer samvittigheten og det emosjonelle ansvaret hardt."
            }
        ]
    },
    {
        id: "retorikk-salg",
        title: "Nivå 7: Fremtidens Telefon",
        text: "Møt PhoneX. Med over 10 års erfaring innen innovativ teknologi, har vårt team skapt noe unikt. Den nye prosessoren er 50% raskere enn nærmeste konkurrent, og batteriet varer i hele 48 timer. Forestill deg friheten av å aldri måtte lete etter en lader igjen. Du fortjener det beste.",
        categories: standardCategories,
        solutions: [
            {
                id: 's1',
                start: 18, // "Med over 10 års erfaring innen innovativ teknologi"
                end: 68,
                categoryId: 'etos',
                explanation: "Selskapet bygger etos ved å vise til lang erfaring og kompetanse."
            },
            {
                id: 's2',
                start: 110, // "50% raskere enn nærmeste konkurrent, og batteriet varer i hele 48 timer"
                end: 179,
                categoryId: 'logos',
                explanation: "Konkrete spesifikasjoner og sammenlignbare tall appellerer til fornuften."
            },
            {
                id: 's3',
                start: 195, // "Forestill deg friheten av å aldri måtte lete etter en lader igjen"
                end: 256,
                categoryId: 'patos',
                explanation: "Selgeren selger ikke bare en funksjon, men en 'følelse av frihet' og et problemfritt liv."
            }
        ]
    }
];
