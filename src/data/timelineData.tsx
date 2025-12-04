import React from 'react';
import {
    Globe,
    Map,
    Sword,
    Anchor,
    Skull,
    BookOpen,
    Hammer
} from 'lucide-react';
import type { ContentBlock } from '../types';

export type TimelineEvent = {
    id: string | number;
    year: string;
    title: string;
    description: string;
    content: ContentBlock[];
    details: string[];
    icon: React.ReactNode;
    category: 'Verden' | 'Norge';
    url: string;
    timeline?: { year: string; title: string; description: string; link?: string }[];
    readTime: string;
    tags?: string[];
};

export const timelineData: TimelineEvent[] = [
    {
        id: "verdenshandel-for-oppdagelsesreisene",
        year: "1400–1500",
        title: "Verdenshandel før oppdagelsesreisene",
        description: "Handel med krydder og luksusvarer før 1500.",
        content: [
            { type: 'text', content: "I middelalderen (før 1400-tallet) foregikk handel mellom Europa og Asia via lange handelsruter. Krydder og kostbare luksusvarer kom fra fjerne land i Asia og ble transportert gjennom Midtøsten til Europa. Varer som pepper, kanel, muskatnøtt, nellik og andre krydder var blant de dyreste og mest ettertraktede produktene i Europa på denne tiden. Slik brukte man krydder både for å gi smak til maten og som medisin, og de var så verdifulle at de ble veid opp mot gull. Også luksusvarer som silke-stoffer fra Kina, edelstener, parfyme og porselen var del av handelen mellom Østen og Europa." },
            { type: 'text', content: "Disse handelsrutene gikk over enorme avstander. En kjent rute var Silkeveien, et nettverk av karavaneveier over land fra Kina gjennom Sentral-Asia og Persia til Midtøsten. Langs disse rutene solgte kinesiske kjøpmenn varer til sentralasiatiske karavaner, som igjen solgte dem videre til arabiske handelsmenn i Midtøsten. Det fantes også sjøveier: krydder fra India og ”Krydderøyene” (Indonesias øyer) ble fraktet med skip over Indiahavet til havner i Egypt (via Rødehavet) eller Persiabukta. Derfra ble varene tatt med karavaner eller skip videre til Middelhavet." },
            { type: 'text', content: "I Middelhavet var det spesielt de norditalienske handelsbyene Venezia og Genova som dominerte handelen. Disse bystatene fungerte som mellommenn: de kjøpte krydder og silke i havnene i Midtøsten og solgte dem dyrt videre til resten av Europa. Fra 1100- til 1400-tallet hadde de italienske maritime republikkene (som Venezia og Genova) praktisk talt monopol på handelen mellom Europa og Asia. Krydder fra Asia ble fraktet via Midtøsten til disse italienske byene, som gjorde dem svært rike." },
            { type: 'text', content: "Handelen var altså kontrollert av en kjede av aktører: Asiatiske produsenter og kjøpmenn solgte varene østfra, arabiske og persiske handelsfolk brakte dem til Midtøsten, og italienske kjøpmenn tok dem det siste stykket til Europa. Dette mønsteret hadde eksistert i lang tid, og allerede på 1200-tallet reiste den venetianske handelsmannen Marco Polo langs disse rutene helt til Kina. Marco Polos berømte reiser (1271–1295) skjedde nettopp fordi slike handelsruter fantes, og historiene hans gjorde europeerne mer nysgjerrige på Asia." },
            { type: 'text', content: "På 1400-tallet begynte situasjonen å endre seg litt. I 1453 erobret det osmanske riket Konstantinopel (Istanbul), som var en viktig handelsby mellom Asia og Europa. Dermed ble en av de sentrale landrutene for krydder inn i Europa forstyrret eller stengt. Samtidig hadde Venezia allerede lenge tjent enormt på denne handelen, noe som gjorde andre europeiske stater misunnelige. Andre land ønsket å bryte Venezias grep om krydderhandelen og finne egne veier til rikdommen fra Østen. Nye sjøfartsnasjoner så dagens lys i utkanten av Europa – særlig Portugal og Spania, som lå ved Atlanterhavet og ikke hadde del i det gamle middelhavshandelsmonopolet." },
            { type: 'text', content: "På slutten av 1400-tallet sto Portugal og Spania frem som sterke riker med ambisjoner. Italienerne i Venezia og Genova hadde kontrollert handelen i øst, men disse nye aktørene ønsket å utforske egne ruter over havet. Her er noen viktige grunner til at de gav seg ut på oppdagelsesreisene:" },
            { type: 'text', title: "Økonomi og rikdom", content: "Den fremste motivasjonen var å finne en direkte vei til kildene for krydder og verdifulle varer i Asia, for å slippe mellommenn og få varene billigere. Krydderhandelen var ekstremt lukrativ (innbringende) – etterspørselen var enorm og prisene høye i Europa. Portugal så muligheten til å få monopol på en sjøvei til India og tjene stort på pepper, kanel og andre varer. Spania ønsket ikke å bli stående utenfor denne rikdommen og finansierte derfor sine egne ekspedisjoner. Kort sagt jaktet de på gull og handelsvarer – “rikdom” var et nøkkelord." },
            { type: 'text', title: "Makt og ære", content: "Konger og dronninger ville øke sin makt ved å skaffe seg kolonier, nye landområder og kontroll over handelsruter. For nasjonene handlet det om ære og konkurranse: å vinne kappløpet om å oppdage nye ruter før rivalene. For eksempel hadde Venezia blitt en stormakt takket være krydderhandelen. Portugisere og spanjoler ønsket tilsvarende suksess for sine land. Samtidig drev personlig eventyrlyst og æresøken mange oppdagere – berømmelse ventet den som fant “Sjøveien til India” eller nye land. Historikere oppsummerer ofte motivene med “gull, ære og Gud” – altså rikdom, berømmelse og religiøs iver." },
            { type: 'text', title: "Religion (kristendom)", content: "Tro og religiøs iver spilte også en stor rolle. Både Portugal og Spania var katolske riker som nettopp hadde kjempet mot muslimske kongedømmer (Spania fullførte Reconquista i 1492 da de tok tilbake hele Iberia). De ønsket å spre kristendommen til nye folk og fortsette kampene mot islamske riker i andre verdensdeler. Oppdagelsesreisene ble sett på som en forlengelse av korstogene – man håpet å finne kristne allierte (for eksempel den legendariske Prestekongen Johannes i Afrika) og å omvende nye sjeler til kristendommen. Å utbre Guds ord var derfor en erklært motivasjon for mange ekspedisjoner. Den portugisiske prinsen Henrik (kalt “Sjøfareren”) støttet tidlig ferder langs Afrikas kyst, delvis med tanke på å bekjempe muslimske stater og utvide kristenheten." },
            { type: 'text', title: "Nysgjerrighet og oppdagelseslyst", content: "Renessansens tidsalder brakte med seg en ny nysgjerrighet på verden. Europeerne fikk bedre kart, nye oppfinnelser (som kompass og karavellskip) og kunnskap fra reisende som Marco Polo. Mange var rett og slett eventyrlystne og ønsket å utforske det ukjente. Som det norske leksikon sier, spilte ønsket om å utforske fremmede områder en rolle allerede i middelalderen. Historier om eksotiske land og rikdommer tente fantasien. Oppdagere som Kristoffer Columbus drømte om å gjøre store funn. (Columbus selv var for øvrig fra Genova i Italia, men da de italienske bystatene ikke finansierte slike ekspedisjoner, fikk han støtte fra Spanias monarker.) Slik ble et ønske om eventyr og kunnskap en del av drivkraften for oppdagelsesreisene." },
            { type: 'text', content: "Før de europeiske oppdagelsesreisene rundt 1500 var det altså de gamle handelsrutene via Midtøsten som dominerte verdenshandelen. Krydder og luksusvarer gikk fra Asia til Europa gjennom arabiske, persiske og italienske hender, og denne handelen gjorde særlig byer som Venezia rike. Da situasjonen endret seg på 1400-tallet – med nye makter og nye hindringer på de gamle rutene – Portugal og Spania ledet an i jakten på egne sjøveier til Asia. Jakten var motivert av penger, makt, tro og nysgjerrighet: de ville finne gull og krydder, vinne ære og imperier, spre Guds ord, og oppdage den ukjente verden. Disse sterke drivkreftene førte til de store oppdagelsesreisene som for alltid forandret verdenshandelen og kontakten mellom kontinentene." }
        ],
        details: [
            "Handelsruter: Silkeveien og sjøveier via Midtøsten.",
            "Kontroll: Italienske bystater (Venezia, Genova) hadde monopol.",
            "Endring: Osmanene tok Konstantinopel i 1453.",
            "Motivasjon for nye ruter: Økonomi, makt, religion og nysgjerrighet."
        ],
        icon: <Anchor className="w-8 h-8 text-teal-400" />,
        category: 'Verden',
        url: "https://snl.no/oppdagelsesreisene",
        readTime: "5 min lesning",
        tags: ["Historie", "Verden", "Handel"],
        timeline: [
            {
                year: "1271–1295",
                title: "Marco Polos reiser",
                description: "Marco Polo reiser til Kina og øker interessen for Asia.",
                link: "https://snl.no/Marco_Polo"
            },
            {
                year: "1453",
                title: "Konstantinopels fall",
                description: "Det osmanske riket erobrer Konstantinopel, noe som forstyrrer handelsrutene.",
                link: "https://snl.no/Konstantinopels_fall"
            },
            {
                year: "1492",
                title: "Reconquista fullføres",
                description: "Spania tar tilbake hele Iberia og Columbus reiser til Amerika.",
                link: "https://snl.no/Reconquista"
            },
            {
                year: "1602",
                title: "VOC Opprettes",
                description: "Det nederlandske ostindiske kompani (VOC) blir grunnlagt og får monopol på handel i Asia.",
                link: "https://snl.no/Det_nederlandske_ostindiske_kompani"
            },
            {
                year: "1799",
                title: "VOC Konkurs",
                description: "Etter nesten 200 år med dominans går selskapet konkurs og oppløses.",
            },
            {
                year: "1600-tallet",
                title: "Gullalderen",
                description: "Nederland opplever en enorm økonomisk vekst basert på internasjonal handel.",
            }
        ]
    },
    {
        id: 1,
        year: "200 000 fvt.",
        title: "Menneskets tidlige historie",
        description: "Fra nomader i Afrika til spredning over hele kloden.",
        content: [
            { type: 'text', content: "Ifølge kartleggingen av menneskets vandringer, oppstod Homo sapiens i Afrika for rundt 200 000 år siden. I titusenvis av år levde menneskene som nomader. En nomade er en som ikke har fast boplass, men flytter rundt som jeger og samler for å finne mat." },
            { type: 'text', content: "For omtrent 70 000 år siden begynte en stor utvandring fra Afrika mot Asia. Menneskene nådde Europa for ca. 40 000 år siden, og krysset til slutt over til Amerika for rundt 15 000 år siden. Samtidig fantes det andre mennesketyper, som Homo neanderthalensis i Europa og Homo erectus i Asia, men det var Homo sapiens som spredte seg til hele verden." },
            { type: 'text', content: "I Norges historie starter fortellingen mye senere. De første nomadene kom til Finnmark rundt 9300 fvt., etter at isen trakk seg tilbake." }
        ],
        details: [
            "Homo sapiens oppstod i Afrika (200 000 år siden).",
            "Nomader: Jegere og samlere uten fast boplass.",
            "Utvandring fra Afrika startet for alvor for 70 000 år siden.",
            "Norge: Første nomader i Finnmark 9300 fvt."
        ],
        icon: <Globe className="w-8 h-8 text-blue-400" />,
        category: 'Verden',
        url: "https://snl.no/menneskets_opprinnelse_og_utvikling",
        readTime: "2 min lesning",
        tags: ["Historie", "Verden", "Mennesket"],
        timeline: [
            { year: "200 000 fvt.", title: "Homo sapiens i Afrika", description: "Menneskearten oppstår." },
            { year: "70 000 fvt.", title: "Utvandring fra Afrika", description: "Mennesker begynner å spre seg til Asia." },
            { year: "40 000 fvt.", title: "Mennesker i Europa", description: "Homo sapiens ankommer Europa." },
            { year: "15 000 fvt.", title: "Mennesker i Amerika", description: "Mennesker krysser til Amerika." },
            { year: "9300 fvt.", title: "Nomader i Finnmark", description: "De første menneskene bosetter seg i Norge." }
        ]
    },
    {
        id: 2,
        year: "12 000 – 4000 fvt.",
        title: "Jordbruk og Sivilisasjoner",
        description: "Mennesket slår seg til ro: Fra nomade til fastboende med husdyr.",
        content: [
            { type: 'text', content: "Det store skiftet i menneskets historie skjedde da vi gikk fra å være nomader til å bli fastboende bønder. Tidlig jordbruk startet i Midtøsten mellom 8000 og 12 000 fvt. Her begynte folk å bo fast og holde husdyr." },
            { type: 'text', content: "Dette la grunnlaget for 'Elvedalssivilisasjoner' (4000–10 000 fvt.) i områder som Irak (Mesopotamia), Egypt og Midtøsten. Fordi de dyrket jorden ved store elver, kunne de produsere nok mat til å bygge større byer og samfunn." },
            { type: 'text', content: "I Norge skjedde denne endringen senere. Jordbruket begynte på Østlandet rundt 4000 fvt. Senere, rundt 2500 fvt., kom 'Stridsøksfolket' fra Germania, og nye folkegrupper (Horder, Ryger) ankom rundt år 400 evt." }
        ],
        details: [
            "Nomader sluttet å vandre og fikk fast boplass.",
            "Tidlig jordbruk i Midtøsten (8000–12 000 fvt.).",
            "Elvedalssivilisasjoner oppstod ved Nilen, Eufrat og Tigris.",
            "Jordbruk i Norge startet ca. 4000 fvt."
        ],
        icon: <Map className="w-8 h-8 text-green-400" />,
        category: 'Verden',
        url: "https://snl.no/jordbrukets_historie",
        readTime: "3 min lesning",
        tags: ["Historie", "Verden", "Jordbruk"],
        timeline: [
            { year: "8000-12000 fvt.", title: "Tidlig jordbruk", description: "Jordbruk starter i Midtøsten." },
            { year: "4000 fvt.", title: "Jordbruk i Norge", description: "Jordbruket når Østlandet." },
            { year: "2500 fvt.", title: "Stridsøksfolket", description: "Innvandring fra Germania." },
            { year: "400 evt.", title: "Horder og Ryger", description: "Nye folkegrupper ankommer Norge." }
        ]
    },
    {
        id: 3,
        year: "500 fvt. – 400 evt.",
        title: "Romerriket",
        description: "Et av historiens første store imperier som spredte kristendom og veier.",
        content: [
            { type: 'text', content: "Romerriket startet i Roma ca. år 500 fvt. og vokste til å bli et enormt imperium. De erobret Sør-Europa, Nord-Afrika og Vest-Asia. Romerriket var en av de første store kolonimaktene, og de bandt riket sammen med et imponerende veinett." },
            { type: 'text', content: "Det var på disse veiene kristendommen etter hvert ble spredt. Rundt år 300 ble kristendommen offisiell religion i riket. Romerriket eksisterte samtidig med andre imperier, som Persia (Achaemenid) og Makedonia (under Alexander den Store)." },
            { type: 'text', content: "Rundt år 400 evt. ble Romerriket delt i to: et vestlig og et østlig rike. Mens vestriket falt, levde østriket (Bysants) videre. I denne perioden ser vi også starten på 'Justinians pest' (541–549), som var den første bølgen av svartedauden." }
        ],
        details: [
            "Startet i Roma ca. 500 fvt.",
            "Erobret store deler av Europa, Afrika og Asia.",
            "Kristendommen ble offisiell religion ca. år 300.",
            "Riket ble delt i øst og vest ca. år 400."
        ],
        icon: <Sword className="w-8 h-8 text-red-400" />,
        category: 'Verden',
        url: "https://snl.no/Romerrikets_historie",
        readTime: "4 min lesning",
        tags: ["Historie", "Verden", "Antikken", "Imperier"],
        timeline: [
            { year: "500 fvt.", title: "Romerriket grunnlegges", description: "Starten på den romerske republikken." },
            { year: "300 evt.", title: "Kristendommens seier", description: "Kristendommen blir offisiell religion." },
            { year: "400 evt.", title: "Riket deles", description: "Romerriket deles i øst og vest." },
            { year: "541-549", title: "Justinians pest", description: "Første bølge av svartedauden." }
        ]
    },
    {
        id: 4,
        year: "793 – 1066 evt.",
        title: "Vikingtiden",
        description: "Hvorfor dro bønder fra nord ut for å plyndre og handle?",
        content: [
            { type: 'text', content: "Vikingtiden regnes fra angrepet på Lindisfarne i 793 til slaget ved Stamford Bridge i 1066. Vikingene kom fra hele Skandinavia og var både bønder, handelsfolk, sjømenn og krigere. Men hvorfor reiste de? Før år 700 ble jernredskaper vanligere, noe som gjorde det lettere å rydde gårder. Dette førte til at folketallet økte, og det ble plassmangel på Vestlandet. Mange søkte derfor rikdom i utlandet." },
            { type: 'text', content: "Samfunnet var organisert i ætter (storfamilier) og stammer ledet av en høvding. Høvdingen hadde sin egen hær, kalt hirden. Viktige avgjørelser ble tatt på Tinget, en hellig plass for diskusjon og dom. De rike bøndene (frie menn) eide jorden, mens treller (slaver) var ufrie arbeidsfolk." },
            { type: 'text', content: "Vikingene reiste med langskip som kunne seile både på åpent hav og grunt vann (elver). De grunnla riker i øst (Rus-riket/Kiev) og vest (Danelagen i England), og oppdaget Island, Grønland og Vinland (Amerika). De fikk ulike navn der de dro: 'Væringer' i Bysants, 'Rus' blant slaverne, og 'Normanner' i Frankrike." }
        ],
        details: [
            "Årsaker: Jernredskaper, befolkningsvekst og plassmangel.",
            "Samfunn: Styrt av høvdinger og tinget. Treller var slaver.",
            "Teknologi: Langskipet muliggjorde reiser til Russland og Amerika.",
            "Slutt: Tapet ved Stamford Bridge i 1066."
        ],
        icon: <Anchor className="w-8 h-8 text-indigo-400" />,
        category: 'Norge',
        url: "https://snl.no/vikingtiden",
        readTime: "5 min lesning",
        tags: ["Historie", "Norge", "Vikingtiden"],
        timeline: [
            { year: "700", title: "Jernredskaper", description: "Jern blir vanligere, befolkningen øker." },
            { year: "793", title: "Lindisfarne", description: "Vikingangrep på klosteret Lindisfarne." },
            { year: "1066", title: "Stamford Bridge", description: "Slaget som markerer slutten på vikingtiden." }
        ]
    },
    {
        id: 5,
        year: "872 evt.",
        title: "Rikssamlingen",
        description: "Harald Hårfagre samler Norge – for kjærlighet eller makt?",
        content: [
            { type: 'text', content: "Harald Hårfagre (konge ca. 865–933) regnes som Norges første rikskonge. Han kom sannsynligvis fra Vestfold og arvet riket etter faren Halvdan Svarte. Historien forteller at han lovet kongsdattern Gyda å samle hele Norge til ett rike før han ville klippe håret." },
            { type: 'text', content: "Det avgjørende slaget stod i Hafrsfjord (tradisjonelt år 872). Her allierte Harald seg med jarler fra Trøndelag for å slå sjøkongene på Sør-Vestlandet. Han etablerte et viktig maktsenter på Karmøy." },
            { type: 'text', content: "Selv om Harald samlet landet, var makten sårbar. Han fikk mange sønner som ble sendt til ulike allierte ætter for oppfostring. Etter Haralds død gikk riket delvis i oppløsning gjennom maktkamper mellom sønnene, som Eirik Blodøks og Håkon den Gode. Harald Hårfagre ga senere konger 'historisk legitimitet' – retten til å styre fordi de stammet fra ham." }
        ],
        details: [
            "Slaget i Hafrsfjord (872) samlet Norge.",
            "Harald allierte seg med Trøndelag mot Sør-Vestlandet.",
            "Maktsenteret lå på Avaldsnes (Karmøy).",
            "Riket ble splittet mellom sønnene etter hans død."
        ],
        icon: <Sword className="w-8 h-8 text-yellow-400" />,
        category: 'Norge',
        url: "https://snl.no/Harald_H%C3%A5rfagre",
        readTime: "4 min lesning",
        tags: ["Historie", "Norge", "Middelalderen"],
        timeline: [
            { year: "865-933", title: "Harald Hårfagre", description: "Norges første rikskonge." },
            { year: "872", title: "Slaget i Hafrsfjord", description: "Norge samles til ett rike." }
        ]
    },
    {
        id: 6,
        year: "1349 evt.",
        title: "Svartedauden",
        description: "Pesten som drepte halvparten av befolkningen og endret samfunnet.",
        content: [
            { type: 'text', content: "Svartedauden kom til Norge (Bergen) i 1349, men pesten hadde herjet i Europa siden 1346. Den spredte seg via handelsruter fra det Mongolske riket i øst. På verdensbasis døde mellom 70 og 200 millioner mennesker." },
            { type: 'text', content: "I Norge døde ca. 50% av befolkningen. Dette førte til at mange gårder ble stående tomme (ødegårder). For staten var dette en katastrofe, da skatteinntektene forsvant. Men for de fattige bøndene som overlevde, ble livet faktisk bedre: Det var nå rikelig med jord tilgjengelig, og de kunne kreve bedre vilkår." },
            { type: 'text', content: "Svartedauden markerer slutten på Norges storhetstid i middelalderen og starten på unionstiden med Danmark. Pesten kom tilbake i bølger i over 200 år etterpå." }
        ],
        details: [
            "Kom til Bergen i 1349.",
            "Ca. 50% av Norges befolkning døde.",
            "Førte til ødegårder og økonomisk kollaps for staten.",
            "Overlevende bønder fikk mer jord og bedre kår."
        ],
        icon: <Skull className="w-8 h-8 text-slate-400" />,
        category: 'Norge',
        url: "https://snl.no/svartedauden",
        readTime: "3 min lesning",
        tags: ["Historie", "Norge", "Pest"],
        timeline: [
            { year: "1346", title: "Pesten i Europa", description: "Svartedauden bryter ut i Europa." },
            { year: "1349", title: "Pesten i Norge", description: "Svartedauden kommer til Bergen." }
        ]
    },

    {
        id: 8,
        year: "ca. 1840 evt.",
        title: "Industriell Revolusjon i Norge",
        description: "Fra overskudd av mat til fabrikker og maskiner.",
        content: [
            { type: 'text', content: "Før 1800-tallet var det svært lite industri i Norge, kanskje bare noen vindmøller og gruver. Nesten alle jobbet som bønder. Den industrielle revolusjon skjøt først fart i Norge rundt 1840-tallet." },
            { type: 'text', content: "Hva måtte til for å starte en fabrikk? Ifølge historien kreves det to ting: For det første et overskudd av mat. En bonde eller fisker må produsere mer mat enn han selv trenger, slik at andre kan jobbe i fabrikk i stedet for på jordet. For det andre må man ha kapital – man må spare penger for å kunne kjøpe dyre maskiner." },
            { type: 'text', content: "I Norge startet industrien ofte med tekstilfabrikker som utnyttet vannkraften i elvene. Fabrikkene omdannet råvarer (som ull) til ferdige produkter (som klær/tepper). Dette endret samfunnet totalt og skapte de moderne byene." }
        ],
        details: [
            "Startet for alvor i Norge på 1840-tallet.",
            "Forutsetning 1: Overskudd av mat.",
            "Forutsetning 2: Penger til å kjøpe maskiner.",
            "Endret Norge fra bondesamfunn til industrisamfunn."
        ],
        icon: <Hammer className="w-8 h-8 text-orange-400" />,
        category: 'Norge',
        url: "https://snl.no/den_industrielle_revolusjon_i_Norge",
        readTime: "4 min lesning",
        tags: ["Historie", "Norge", "Industri"],
        timeline: [
            { year: "1840", title: "Industriell start", description: "Den industrielle revolusjon skyter fart i Norge." }
        ]
    },
    {
        id: "voc",
        year: "1602–1799",
        title: "Det nederlandske ostindiske kompani (VOC)",
        description: "Verdens første aksjeselskap og et globalt handelsimperium.",
        content: [
            { type: 'text', content: "Det nederlandske ostindiske kompani (Vereenigde Oostindische Compagnie, VOC) ble grunnlagt i 1602. Det regnes ofte som verdens første multinasjonale selskap og det første selskapet som utstedte aksjer. VOC fikk monopol av den nederlandske staten på all handel i Asia." },
            { type: 'text', content: "Selskapet ble en enorm suksess og drev handel med krydder (som pepper, muskat, nellik), silke, porselen og tekstiler. De etablerte hovedkvarteret sitt i Batavia (dagens Jakarta i Indonesia). På 1600-tallet, under den nederlandske gullalderen, var VOC verdens rikeste selskap." },
            { type: 'text', content: "Men VOC var ikke bare et handelsselskap; det hadde også rett til å føre krig, inngå traktater, slå sin egen mynt og etablere kolonier. De brukte ofte brutal makt for å sikre seg monopol på krydderhandelen, for eksempel på Banda-øyene." },
            { type: 'text', content: "Mot slutten av 1700-tallet gikk det dårligere. Korrupsjon, høy gjeld og konkurranse fra det britiske ostindiske kompani førte til at VOC ble oppløst og gikk konkurs i 1799. Eiendommene ble overtatt av den nederlandske staten." }
        ],
        details: [
            "Grunnlagt: 1602.",
            "Oppløst: 1799.",
            "Hovedkvarter: Batavia (Jakarta).",
            "Kjent for: Krydderhandel, aksjer, og monopol."
        ],
        icon: <Anchor className="w-8 h-8 text-orange-400" />,
        category: 'Verden',
        url: "https://snl.no/Det_nederlandske_ostindiske_kompani",
        readTime: "4 min lesning",
        tags: ["Historie", "Verden", "Handel", "Kolonialisering"],
        timeline: [
            {
                year: "1602",
                title: "VOC Opprettes",
                description: "Det nederlandske ostindiske kompani (VOC) blir grunnlagt.",
                link: "https://snl.no/Det_nederlandske_ostindiske_kompani"
            },
            {
                year: "1619",
                title: "Batavia grunnlegges",
                description: "VOC etablerer sitt hovedkvarter i Batavia (Jakarta).",
                link: "https://snl.no/Jakarta"
            },
            {
                year: "1600-tallet",
                title: "Gullalderen",
                description: "Nederland og VOC dominerer verdenshandelen.",
            },
            {
                year: "1799",
                title: "VOC Konkurs",
                description: "Selskapet oppløses etter nesten 200 år.",
            }
        ]
    }
];
