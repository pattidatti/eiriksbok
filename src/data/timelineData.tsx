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

export type TimelineEvent = {
    id: number;
    year: string;
    title: string;
    description: string;
    content: string[];
    details: string[];
    icon: React.ReactNode;
    category: 'Verden' | 'Norge';
    url: string;
    readTime: string;
};

export const timelineData: TimelineEvent[] = [
    {
        id: 1,
        year: "200 000 fvt.",
        title: "Menneskets tidlige historie",
        description: "Fra nomader i Afrika til spredning over hele kloden.",
        content: [
            "Ifølge kartleggingen av menneskets vandringer, oppstod Homo sapiens i Afrika for rundt 200 000 år siden. I titusenvis av år levde menneskene som nomader. En nomade er en som ikke har fast boplass, men flytter rundt som jeger og samler for å finne mat.",
            "For omtrent 70 000 år siden begynte en stor utvandring fra Afrika mot Asia. Menneskene nådde Europa for ca. 40 000 år siden, og krysset til slutt over til Amerika for rundt 15 000 år siden. Samtidig fantes det andre mennesketyper, som Homo neanderthalensis i Europa og Homo erectus i Asia, men det var Homo sapiens som spredte seg til hele verden.",
            "I Norges historie starter fortellingen mye senere. De første nomadene kom til Finnmark rundt 9300 fvt., etter at isen trakk seg tilbake."
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
        readTime: "2 min lesning"
    },
    {
        id: 2,
        year: "12 000 – 4000 fvt.",
        title: "Jordbruk og Sivilisasjoner",
        description: "Mennesket slår seg til ro: Fra nomade til fastboende med husdyr.",
        content: [
            "Det store skiftet i menneskets historie skjedde da vi gikk fra å være nomader til å bli fastboende bønder. Tidlig jordbruk startet i Midtøsten mellom 8000 og 12 000 fvt. Her begynte folk å bo fast og holde husdyr.",
            "Dette la grunnlaget for 'Elvedalssivilisasjoner' (4000–10 000 fvt.) i områder som Irak (Mesopotamia), Egypt og Midtøsten. Fordi de dyrket jorden ved store elver, kunne de produsere nok mat til å bygge større byer og samfunn.",
            "I Norge skjedde denne endringen senere. Jordbruket begynte på Østlandet rundt 4000 fvt. Senere, rundt 2500 fvt., kom 'Stridsøksfolket' fra Germania, og nye folkegrupper (Horder, Ryger) ankom rundt år 400 evt."
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
        readTime: "3 min lesning"
    },
    {
        id: 3,
        year: "500 fvt. – 400 evt.",
        title: "Romerriket",
        description: "Et av historiens første store imperier som spredte kristendom og veier.",
        content: [
            "Romerriket startet i Roma ca. år 500 fvt. og vokste til å bli et enormt imperium. De erobret Sør-Europa, Nord-Afrika og Vest-Asia. Romerriket var en av de første store kolonimaktene, og de bandt riket sammen med et imponerende veinett.",
            "Det var på disse veiene kristendommen etter hvert ble spredt. Rundt år 300 ble kristendommen offisiell religion i riket. Romerriket eksisterte samtidig med andre imperier, som Persia (Achaemenid) og Makedonia (under Alexander den Store).",
            "Rundt år 400 evt. ble Romerriket delt i to: et vestlig og et østlig rike. Mens vestriket falt, levde østriket (Bysants) videre. I denne perioden ser vi også starten på 'Justinians pest' (541–549), som var den første bølgen av svartedauden."
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
        readTime: "4 min lesning"
    },
    {
        id: 4,
        year: "793 – 1066 evt.",
        title: "Vikingtiden",
        description: "Hvorfor dro bønder fra nord ut for å plyndre og handle?",
        content: [
            "Vikingtiden regnes fra angrepet på Lindisfarne i 793 til slaget ved Stamford Bridge i 1066. Vikingene kom fra hele Skandinavia og var både bønder, handelsfolk, sjømenn og krigere. Men hvorfor reiste de? Før år 700 ble jernredskaper vanligere, noe som gjorde det lettere å rydde gårder. Dette førte til at folketallet økte, og det ble plassmangel på Vestlandet. Mange søkte derfor rikdom i utlandet.",
            "Samfunnet var organisert i ætter (storfamilier) og stammer ledet av en høvding. Høvdingen hadde sin egen hær, kalt hirden. Viktige avgjørelser ble tatt på Tinget, en hellig plass for diskusjon og dom. De rike bøndene (frie menn) eide jorden, mens treller (slaver) var ufrie arbeidsfolk.",
            "Vikingene reiste med langskip som kunne seile både på åpent hav og grunt vann (elver). De grunnla riker i øst (Rus-riket/Kiev) og vest (Danelagen i England), og oppdaget Island, Grønland og Vinland (Amerika). De fikk ulike navn der de dro: 'Væringer' i Bysants, 'Rus' blant slaverne, og 'Normanner' i Frankrike."
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
        readTime: "5 min lesning"
    },
    {
        id: 5,
        year: "872 evt.",
        title: "Rikssamlingen",
        description: "Harald Hårfagre samler Norge – for kjærlighet eller makt?",
        content: [
            "Harald Hårfagre (konge ca. 865–933) regnes som Norges første rikskonge. Han kom sannsynligvis fra Vestfold og arvet riket etter faren Halvdan Svarte. Historien forteller at han lovet kongsdattern Gyda å samle hele Norge til ett rike før han ville klippe håret.",
            "Det avgjørende slaget stod i Hafrsfjord (tradisjonelt år 872). Her allierte Harald seg med jarler fra Trøndelag for å slå sjøkongene på Sør-Vestlandet. Han etablerte et viktig maktsenter på Karmøy.",
            "Selv om Harald samlet landet, var makten sårbar. Han fikk mange sønner som ble sendt til ulike allierte ætter for oppfostring. Etter Haralds død gikk riket delvis i oppløsning gjennom maktkamper mellom sønnene, som Eirik Blodøks og Håkon den Gode. Harald Hårfagre ga senere konger 'historisk legitimitet' – retten til å styre fordi de stammet fra ham."
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
        readTime: "4 min lesning"
    },
    {
        id: 6,
        year: "1349 evt.",
        title: "Svartedauden",
        description: "Pesten som drepte halvparten av befolkningen og endret samfunnet.",
        content: [
            "Svartedauden kom til Norge (Bergen) i 1349, men pesten hadde herjet i Europa siden 1346. Den spredte seg via handelsruter fra det Mongolske riket i øst. På verdensbasis døde mellom 70 og 200 millioner mennesker.",
            "I Norge døde ca. 50% av befolkningen. Dette førte til at mange gårder ble stående tomme (ødegårder). For staten var dette en katastrofe, da skatteinntektene forsvant. Men for de fattige bøndene som overlevde, ble livet faktisk bedre: Det var nå rikelig med jord tilgjengelig, og de kunne kreve bedre vilkår.",
            "Svartedauden markerer slutten på Norges storhetstid i middelalderen og starten på unionstiden med Danmark. Pesten kom tilbake i bølger i over 200 år etterpå."
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
        readTime: "3 min lesning"
    },
    {
        id: 7,
        year: "1440 evt.",
        title: "Boktrykkerkunsten",
        description: "En informasjonsrevolusjon startet av Gutenberg (og kineserne).",
        content: [
            "I 1440 'oppfant' gullsmeden Johannes Gutenberg boktrykkerkunsten i Tyskland. Han utviklet en metode med løse typer som gjorde det mulig å masseprodusere bøker. Men det er verdt å merke seg at kineserne hadde utviklet lignende teknologi allerede rundt år 700.",
            "Før trykkpressen måtte bøker skrives for hånd, noe som var dyrt og tidkrevende. Med den nye teknologien eksploderte antall bøker: Rundt år 1500 fantes det over 20 millioner bøker i Europa.",
            "Dette førte til en enorm spredning av kunnskap, ideer og kritikk mot makthaverne (som kirken). Det ble vanskeligere å holde informasjon hemmelig, og flere lærte å lese."
        ],
        details: [
            "Gutenberg utviklet trykkpressen ca. 1440.",
            "Kineserne hadde teknologien mye tidligere (år 700).",
            "Førte til 20 millioner bøker innen år 1500.",
            "Gjorde kunnskap tilgjengelig for massene."
        ],
        icon: <BookOpen className="w-8 h-8 text-purple-400" />,
        category: 'Verden',
        url: "https://snl.no/Johann_Gutenberg",
        readTime: "2 min lesning"
    },
    {
        id: 8,
        year: "ca. 1840 evt.",
        title: "Industriell Revolusjon i Norge",
        description: "Fra overskudd av mat til fabrikker og maskiner.",
        content: [
            "Før 1800-tallet var det svært lite industri i Norge, kanskje bare noen vindmøller og gruver. Nesten alle jobbet som bønder. Den industrielle revolusjon skjøt først fart i Norge rundt 1840-tallet.",
            "Hva måtte til for å starte en fabrikk? Ifølge historien kreves det to ting: For det første et overskudd av mat. En bonde eller fisker må produsere mer mat enn han selv trenger, slik at andre kan jobbe i fabrikk i stedet for på jordet. For det andre må man ha kapital – man må spare penger for å kunne kjøpe dyre maskiner.",
            "I Norge startet industrien ofte med tekstilfabrikker som utnyttet vannkraften i elvene. Fabrikkene omdannet råvarer (som ull) til ferdige produkter (som klær/tepper). Dette endret samfunnet totalt og skapte de moderne byene."
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
        readTime: "4 min lesning"
    }
];
