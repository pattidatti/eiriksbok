export interface GlossaryTerm {
    term: string;
    definition: string;
    subjectId: string;
    topicId: string;
}

export const glossaryTerms: GlossaryTerm[] = [
    // --- Historie / Kolonialisering ---
    {
        term: "monopol",
        definition: "Enerett til å drive handel eller virksomhet. Ingen andre får lov til å konkurrere.",
        subjectId: "historie",
        topicId: "kolonialisering"
    },
    {
        term: "aksjeselskap",
        definition: "En selskapsform der eierne har fordelt eierskapet gjennom aksjer. Man risikerer bare å tape pengene man har betalt for aksjene.",
        subjectId: "historie",
        topicId: "kolonialisering"
    },
    {
        term: "koloni",
        definition: "Et område som ligger utenfor moderlandet, men som styres av det.",
        subjectId: "historie",
        topicId: "kolonialisering"
    },
    {
        term: "imperialisme",
        definition: "En politikk der en stat forsøker å skaffe seg politisk, kulturell, økonomisk eller militært herredømme utover sine egne grenser.",
        subjectId: "historie",
        topicId: "kolonialisering"
    },
    {
        term: "merkantilisme",
        definition: "En økonomisk politikk der målet var å samle mest mulig gull og sølv i statskassen ved å eksportere mer enn man importerte.",
        subjectId: "historie",
        topicId: "kolonialisering"
    },
    {
        term: "sepoy",
        definition: "Indisk soldat i tjeneste for en europeisk makt, spesielt Storbritannia.",
        subjectId: "historie",
        topicId: "kolonialisering"
    },
    {
        term: "tekstil",
        definition: "Stoffer og klær. Bomullstekstiler fra India var svært ettertraktet i Europa.",
        subjectId: "historie",
        topicId: "kolonialisering"
    },
    {
        term: "opium",
        definition: "Et sterkt vanedannende rusmiddel laget av valmuer. EIC solgte dette til Kina for å betale for te.",
        subjectId: "historie",
        topicId: "kolonialisering"
    },
    {
        term: "te",
        definition: "En drikk laget av blader fra tebusken. Ble ekstremt populært i Storbritannia på 1700-tallet.",
        subjectId: "historie",
        topicId: "kolonialisering"
    },
    {
        term: "dronning elizabeth i",
        definition: "Dronning av England fra 1558 til 1603. Hun ga EIC monopol på handel med Østen.",
        subjectId: "historie",
        topicId: "kolonialisering"
    },

    // --- Samfunnskunnskap / Styringsformer ---
    {
        term: "anarki",
        definition: "Ingen stat eller hersker. Et samfunn uten formell styring. Ordet betyr \"uten hersker\". Det finnes ingen stat, skatt eller voldsmonopol.",
        subjectId: "samfunnskunnskap",
        topicId: "styringsformer"
    },
    {
        term: "monarki",
        definition: "En konge, dronning, fyrste eller greve er statsoverhode. Makten går som regel i arv. I dag har vi ofte konstitusjonelt monarki hvor kongen har liten makt, men historisk var det ofte enevelde.",
        subjectId: "samfunnskunnskap",
        topicId: "styringsformer"
    },
    {
        term: "diktatur",
        definition: "All makt er samlet hos én person eller en liten gruppe. Makten er ofte tatt med vold (kupp). Befolkningen har liten eller ingen mulighet til å påvirke styret.",
        subjectId: "samfunnskunnskap",
        topicId: "styringsformer"
    },
    {
        term: "teokrati",
        definition: "Gud eller religiøse ledere styrer samfunnet basert på hellige skrifter. Lovene i landet er basert på religionen. Eksempler er Vatikanstaten eller Iran.",
        subjectId: "samfunnskunnskap",
        topicId: "styringsformer"
    },
    {
        term: "teknokrati",
        definition: "Eksperter og vitenskapsfolk styrer basert på kunnskap. Ideen er at eksperter (f.eks. ingeniører, økonomer) tar bedre beslutninger enn valgte politikere.",
        subjectId: "samfunnskunnskap",
        topicId: "styringsformer"
    },
    {
        term: "oligarki",
        definition: "En liten gruppe mennesker (fåmannsvelde) har all makten. Ofte er dette de rikeste i samfunnet, eller en militærjunta.",
        subjectId: "samfunnskunnskap",
        topicId: "styringsformer"
    },
    {
        term: "representativt demokrati",
        definition: "Folket velger representanter (politikere) som styrer for dem. Den vanligste formen for demokrati i dag. Vi holder valg med jevne mellomrom.",
        subjectId: "samfunnskunnskap",
        topicId: "styringsformer"
    },
    {
        term: "direkte demokrati",
        definition: "Folket stemmer direkte på hver enkelt sak. Alle er med å bestemme alt. Brukes sjelden for hele land, men av og til i folkeavstemninger.",
        subjectId: "samfunnskunnskap",
        topicId: "styringsformer"
    },
    {
        term: "anarko-kapitalisme",
        definition: "Et samfunn uten stat, hvor alt styres av det frie markedet. Ingen stat, bare privat eiendom. Alt, inkludert politi og veier, kjøpes og selges.",
        subjectId: "samfunnskunnskap",
        topicId: "styringsformer"
    },
    {
        term: "anarko-kommunisme",
        definition: "Et samfunn uten stat og penger, hvor alt eies i fellesskap. Ingen stat, ingen privat eiendom. Alle bidrar etter evne og får etter behov.",
        subjectId: "samfunnskunnskap",
        topicId: "styringsformer"
    },
    {
        term: "republikk",
        definition: "En stat hvor statsoverhodet ikke er en monark (konge/dronning). Lederen kalles som regel president. Kan være både demokratisk og udemokratisk.",
        subjectId: "samfunnskunnskap",
        topicId: "styringsformer"
    },
    {
        term: "president-republikk",
        definition: "Demokrati der presidenten har mye makt og velges uavhengig av parlamentet. Eksempel: USA. Presidenten leder regjeringen og kan ikke enkelt kastes av kongressen.",
        subjectId: "samfunnskunnskap",
        topicId: "styringsformer"
    },
    {
        term: "parlamentarisk republikk",
        definition: "Republikk der parlamentet har mest makt. Presidenten har ofte en seremoniell rolle. Eksempel: Island eller Tyskland. Regjeringen utgår fra parlamentet.",
        subjectId: "samfunnskunnskap",
        topicId: "styringsformer"
    },
    {
        term: "parlamentarisk stat",
        definition: "Et system der regjeringen må ha tillit fra parlamentet (Stortinget). Gjelder både monarkier (Norge) og republikker. Hvis Stortinget sier nei, må regjeringen gå.",
        subjectId: "samfunnskunnskap",
        topicId: "styringsformer"
    },
    {
        term: "autoritært diktatur",
        definition: "Folket får ikke være med å bestemme, men kan til en viss grad mene ting. Staten kontrollerer politikken, men lar folk leve livene sine relativt fritt ellers.",
        subjectId: "samfunnskunnskap",
        topicId: "styringsformer"
    },
    {
        term: "totalitært diktatur",
        definition: "Staten kontrollerer absolutt alt, inkludert hva folk tenker og mener. Ingen frihet. Ekstrem overvåkning og propaganda. Eksempel: Nord-Korea.",
        subjectId: "samfunnskunnskap",
        topicId: "styringsformer"
    },

    // --- Samfunnskunnskap / Demografi & Økonomi ---
    {
        term: "kapitalisme",
        definition: "Markedsøkonomi. Produksjon er privat eiendom. Styres av tilbud og etterspørsel (profitt og tap). Kundene \"bestemmer\" hva som lages.",
        subjectId: "samfunnskunnskap",
        topicId: "demografi-okonomi"
    },
    {
        term: "sosialisme",
        definition: "Produksjonsmidlene eies eller kontrolleres av fellesskapet (staten). Politisk bestemt hva som skal produseres (Planøkonomi). Målet er likere fordeling.",
        subjectId: "samfunnskunnskap",
        topicId: "demografi-okonomi"
    },
    {
        term: "kommunisme",
        definition: "Et klasseløst samfunn der all eiendom er felles. I teorien statsløst (som anarko-kommunisme), men i praksis ofte brukt om stater med streng planøkonomi.",
        subjectId: "samfunnskunnskap",
        topicId: "demografi-okonomi"
    }
];

// Backward compatibility for GlossaryText component
export const glossary: Record<string, string> = glossaryTerms.reduce((acc, item) => {
    acc[item.term] = item.definition;
    return acc;
}, {} as Record<string, string>);
