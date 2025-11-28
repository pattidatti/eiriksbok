import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen,
    Skull,
    Anchor,
    Sword,
    Globe,
    Hammer,
    ChevronRight,
    CheckCircle,
    XCircle,
    RefreshCw,
    Clock,
    Map,
    X,
    Info,
    ExternalLink,
    Calendar,
    Tag,
    AlignLeft,
    FileText
} from 'lucide-react';

// --- Types & Data ---

type TimelineEvent = {
    id: string; // Changed to string to match lessonId
    year: string;
    title: string;
    description: string; // Ingress/Kort beskrivelse
    content: string[]; // Hvert element er et avsnitt
    details: string[]; // Nøkkelpunkter (Bullets)
    icon: React.ReactNode;
    category: 'Verden' | 'Norge';
    url: string; // URL til SNL
    readTime: string;
};

type QuizQuestion = {
    id: number;
    question: string;
    options: string[];
    correct: number;
    explanation: string;
};

// Data med utvidede artikler
const timelineData: TimelineEvent[] = [
    {
        id: "menneskets-opprinnelse",
        year: "ca. 300 000 år siden",
        title: "Menneskets Opprinnelse",
        description: "Homo sapiens oppstår i Afrika og begynner den lange vandringen som til slutt skal dekke hele kloden.",
        content: [
            "Historien om oss starter i Afrika. Det er her, for omtrent 300 000 år siden, at arten Homo sapiens først utviklet seg. I hundretusener av år levde menneskene som nomader. Dette betyr at de ikke hadde faste bosteder, men flyttet seg i takt med årstidene og dyrene de jaktet på.",
            "Livet var preget av en tilværelse som jegere og samlere. Mennene jaktet ofte på større dyr, mens kvinnene samlet røtter, frukt og bær. Dette samspillet var avgjørende for overlevelse. Det som virkelig skilte mennesket fra andre arter, var evnen til å samarbeide i store grupper, utvikle avanserte redskaper av stein og bein, og – viktigst av alt – evnen til å kommunisere gjennom språk.",
            "For omtrent 70 000 år siden skjedde det noe avgjørende: Mennesket begynte å vandre ut av Afrika. Denne utvandringen førte oss først til Midtøsten, så til Asia og Europa, og til slutt, for rundt 15 000 år siden, over landbroen til Amerika. Da isen trakk seg tilbake fra Norden for ca. 10 000 år siden, fulgte de første menneskene etter reinsdyrene opp til norskekysten."
        ],
        details: [
            "Utviklet seg i Afrika for ca. 300 000 år siden.",
            "Vandret ut til resten av verden for ca. 70 000 år siden.",
            "Levde som nomader (jegere og samlere) uten faste hus.",
            "Brukte redskaper av stein, tre og bein."
        ],
        icon: <Globe className="w-8 h-8 text-blue-400" />,
        category: 'Verden',
        url: "https://snl.no/menneskets_opprinnelse_og_utvikling",
        readTime: "3 min lesning"
    },
    {
        id: "jordbruksrevolusjonen",
        year: "ca. 10 000 fvt.",
        title: "Jordbruksrevolusjonen",
        description: "Kanskje den største endringen i menneskets historie: Overgangen fra å finne mat til å lage den selv.",
        content: [
            "For omtrent 12 000 år siden, i et område i Midtøsten kalt 'Den fruktbare halvmåne', begynte mennesker med noe helt nytt: De begynte å så frø og temme dyr. Dette markerte slutten på millioner av år som nomader og starten på det vi kaller jordbrukssamfunnet.",
            "Konsekvensene var enorme. Når man kunne dyrke sin egen mat, kunne man bo på samme sted år etter år. Dette førte til de første faste bosetningene, som etter hvert vokste til landsbyer og byer. Fordi jordbruk ga mer mat enn jakt, kunne befolkningen vokse raskt. Det ble også mulig for noen å jobbe med andre ting enn å skaffe mat – som å være håndverkere, prester eller soldater.",
            "De første store sivilisasjonene, elvedalssivilisasjonene, vokste frem der jorden var fruktbar, som langs Nilen i Egypt og Eufrat og Tigris i Mesopotamia (dagens Irak). I Norge kom jordbruket mye senere, først rundt 4000 fvt., da folk på Østlandet begynte å rydde skog for å dyrke korn."
        ],
        details: [
            "Startet i 'Den fruktbare halvmåne' i Midtøsten.",
            "Førte til faste bosetninger og befolkningsvekst.",
            "Gjorde det mulig å bygge byer og utvikle sivilisasjoner.",
            "Nådde Norge ca. 4000 fvt. (yngre steinalder)."
        ],
        icon: <Map className="w-8 h-8 text-green-400" />,
        category: 'Verden',
        url: "https://snl.no/jordbrukets_historie",
        readTime: "4 min lesning"
    },
    {
        id: "romerriket",
        year: "ca. 500 fvt. – 400 evt.",
        title: "Romerriket",
        description: "Et verdensrike styrt fra Roma som la grunnlaget for moderne europeisk lov og kultur.",
        content: [
            "Romerriket startet som en liten bystat i Italia rundt 500 fvt., men vokste til å bli antikkens mektigste imperium. På sitt største kontrollerte Roma hele området rundt Middelhavet, fra England i nord til Egypt i sør, og fra Spania i vest til Syria i øst.",
            "Romerne var mestere i organisering. De bygget tusenvis av kilometer med rette veier som bandt riket sammen – mange av dem brukes fortsatt i dag. De bygget akvedukter for å frakte vann til byene, og enorme amfiteatre som Colosseum for underholdning. Romersk rett (lovgivning) er fortsatt grunnlaget for lovene i mange europeiske land.",
            "Riket gikk gjennom flere faser, fra republikk til keiserdømme med Augustus som den første keiseren. Rundt år 300 ble kristendommen statsreligion, noe som forandret Europas historie for alltid. Men riket ble for stort til å styres fra ett sted, og i 395 ble det delt i to: Vestromerriket og Østromerriket. Vestriket falt sammen rundt år 476, mens Østromerriket bestod i nesten tusen år til."
        ],
        details: [
            "Startet som republikk, ble keiserdømme under Augustus.",
            "Erobret store deler av Europa, Nord-Afrika og Midtøsten.",
            "Innført kristendommen som statsreligion på 300-tallet.",
            "Delt i Vest- og Østromerriket før det vestlige fallet."
        ],
        icon: <Sword className="w-8 h-8 text-red-400" />,
        category: 'Verden',
        url: "https://snl.no/Romerrikets_historie",
        readTime: "5 min lesning"
    },
    {
        id: "vikingtiden",
        year: "ca. 800 – 1050 evt.",
        title: "Vikingtiden",
        description: "Da nordboerne satte seil og satte sitt preg på verdenskartet gjennom handel, krig og oppdagelser.",
        content: [
            "Vikingtiden innledes tradisjonelt med angrepet på klosteret Lindisfarne i England i 793. Dette markerte starten på en periode hvor folk fra Norge, Sverige og Danmark dominerte havene i Nord-Europa. Årsakene til at de dro ut var mange: befolkningsvekst hjemme, jakt på rikdom, og politiske konflikter.",
            "Teknologien som gjorde dette mulig, var langskipet. Disse skipene var raske, kunne krysse åpent hav, men var også grunnne nok til å seile langt oppover elver for å angripe byer langt inne i landet. Vikingene var ikke bare krigere; de var også dyktige handelsmenn som grunnla byer som Dublin og Kyiv, og handlet så langt øst som Bagdad.",
            "De var også oppdagere. Norske vikinger koloniserte Island og Grønland. Leiv Eiriksson seilte helt til Nord-Amerika (Vinland) rundt år 1000, 500 år før Columbus. Slutten på vikingtiden knyttes ofte til slaget ved Stamford Bridge i 1066, men også til at kristendommen ble innført i Norden, noe som knyttet landene tettere til europeisk kultur og avsluttet den gamle norrøne levemåten."
        ],
        details: [
            "Startet med Lindisfarne-angrepet i 793.",
            "Muliggjort av avanserte langskip.",
            "Oppdaget Island, Grønland og Amerika (Vinland).",
            "Varte til ca. 1066 (Stamford Bridge) og kristendommens innføring."
        ],
        icon: <Anchor className="w-8 h-8 text-indigo-400" />,
        category: 'Norge',
        url: "https://snl.no/vikingtiden",
        readTime: "6 min lesning"
    },
    {
        id: "rikssamlingen",
        year: "ca. 872 evt.",
        title: "Rikssamlingen",
        description: "Historien om hvordan Norge gikk fra mange småhøvdinger til ett kongerike.",
        content: [
            "Før vikingtiden var ikke 'Norge' ett land, men bestod av mange små kongedømmer og høvdingdømmer. Prosessen med å samle disse startet for alvor med Harald Hårfagre. Ifølge sagaen forelsket han seg i kongsdattern Gyda, men hun ville ikke ha ham før han hadde lagt under seg hele Norge.",
            "Harald sverget da at han ikke skulle klippe eller gre håret før han var enekonge over landet. Han reiste rundt og kjempet mot lokale høvdinger, og det hele kulminerte i det store slaget i Hafrsfjord (tradisjonelt datert til 872, men sannsynligvis litt senere). Her vant Harald over en allianse av motstandere, og regnes dermed som Norges første rikskonge.",
            "Selv om Harald samlet mye av landet, var riket fortsatt løst sammensatt. Han styrte gjennom allianser med mektige bønder og jarler, særlig Ladejarlene i Trøndelag. Etter hans død gikk riket delvis i oppløsning gjennom maktkamper mellom sønnene hans (som Eirik Blodøks og Håkon den Gode), og det tok mange hundre år før Norge ble en fasttømret stat."
        ],
        details: [
            "Harald Hårfagre samlet Norge etter slaget i Hafrsfjord.",
            "Motivert av løftet til Gyda (ifølge sagaen).",
            "Styrte gjennom allianser, særlig i Trøndelag og på Vestlandet.",
            "Starten på det norske kongedømmet."
        ],
        icon: <Sword className="w-8 h-8 text-yellow-400" />,
        category: 'Norge',
        url: "https://snl.no/Harald_H%C3%A5rfagre",
        readTime: "4 min lesning"
    },
    {
        id: "svartedauden",
        year: "1349 evt.",
        title: "Svartedauden",
        description: "Pesten som ankom Bergen og forandret Norges historie dramatisk.",
        content: [
            "Sensommeren 1349 la et skip til kai i Bergen. Om bord var det varer fra England, men også noe mye farligere: byllepest. Svartedauden spredte seg som en ild gjennom Norge. Sykdommen var nådeløs, med store byller, feber og død i løpet av få dager.",
            "Konsekvensene var katastrofale. Det anslås at over halvparten av Norges befolkning døde i løpet av kort tid. Hele bygder ble lagt øde, og tusenvis av gårder (ødegårder) ble stående tomme og gro igjen. Dette knekte den norske staten og adelen fullstendig.",
            "Fordi så mange døde, mistet kongen og kirken store inntekter (skatter og leieinntekter). Det fantes ikke lenger nok folk til å drive landet som en selvstendig statsmakt. Dette er hovedårsaken til at Norge etter hvert mistet sin selvstendighet og gikk inn i en union med Danmark som skulle vare i over 400 år (400-årsnatten). På den annen side fikk de fattige bøndene som overlevde det bedre, fordi det ble rikelig med jord til alle."
        ],
        details: [
            "Kom til Bergen i 1349 med et handelsskip.",
            "Drepte ca. 50-60% av befolkningen.",
            "Førte til tusenvis av ødegårder og økonomisk kollaps.",
            "Innledet nedgangstiden og unionen med Danmark."
        ],
        icon: <Skull className="w-8 h-8 text-slate-400" />,
        category: 'Norge',
        url: "https://snl.no/svartedauden",
        readTime: "5 min lesning"
    },
    {
        id: "boktrykkerkunsten",
        year: "ca. 1450 evt.",
        title: "Boktrykkerkunsten",
        description: "Teknologien som demokratiserte kunnskap og startet en informasjonsrevolusjon.",
        content: [
            "På midten av 1400-tallet, i byen Mainz i Tyskland, gjorde gullsmeden Johann Gutenberg en oppfinnelse som skulle endre verden. Han fant opp en metode for å støpe løse bokstavtyper i metall, som kunne settes sammen til ord, svertes med blekk og trykkes mot papir.",
            "Før dette måtte alle bøker skrives for hånd av munker, en prosess som kunne ta år for én enkelt bok. Bøker var derfor ekstremt dyre og kun for de aller rikeste. Med Gutenbergs presse kunne man plutselig trykke tusenvis av sider om dagen. I år 1500 var det allerede trykket 20 millioner bøker i Europa.",
            "Effekten var eksplosiv. Kunnskap, nyheter og nye ideer kunne spre seg raskt. Dette var avgjørende for Reformasjonen, da Martin Luther kunne spre sine ideer mot paven til hele Europa via trykte pamfletter. Det la også grunnlaget for den vitenskapelige revolusjon, fordi forskere kunne dele oppdagelsene sine med hverandre."
        ],
        details: [
            "Oppfunnet av Johann Gutenberg i Tyskland.",
            "Erstattet håndskrevne bøker med masseproduksjon.",
            "Gjorde bøker billigere og tilgjengelig for flere.",
            "Avgjørende for Reformasjonen og vitenskapens fremmarsj."
        ],
        icon: <BookOpen className="w-8 h-8 text-purple-400" />,
        category: 'Verden',
        url: "https://snl.no/Johann_Gutenberg",
        readTime: "3 min lesning"
    },
    {
        id: "industriell-revolusjon",
        year: "ca. 1840 evt.",
        title: "Industriell Revolusjon i Norge",
        description: "Da maskinene kom til Norge og forvandlet bondesamfunnet til et industriland.",
        content: [
            "Den industrielle revolusjon startet i England på 1700-tallet, men kom sent til Norge. Startskuddet regnes ofte til 1840-tallet, da gründere begynte å bygge tekstilfabrikker langs Akerselva i Oslo (daværende Christiania). De brukte vannkraften fra elva til å drive spinnemaskiner og vevstoler.",
            "Dette skapte et enormt skifte i samfunnet. Før dette hadde nesten alle nordmenn bodd på landsbygda og jobbet som bønder eller fiskere. Nå strømmet tusenvis av mennesker – særlig unge kvinner – til byene for å få jobb i fabrikkene. Oslo vokste i rekordfart.",
            "Forutsetningene for denne veksten var overskudd av arbeidskraft (befolkningsvekst på bygdene) og kapital (penger) til å kjøpe maskiner fra utlandet. Etter hvert utviklet Norge også annen industri, som mekaniske verksteder og treforedling. Dette var starten på det moderne velstandsnorge vi kjenner i dag, selv om arbeidsforholdene i starten var svært harde."
        ],
        details: [
            "Startet ca. 1840 med tekstilindustri langs Akerselva.",
            "Drevet av vannkraft og importerte maskiner.",
            "Førte til urbanisering (folk flyttet til byene).",
            "Endret Norge fra bondesamfunn til industrisamfunn."
        ],
        icon: <Hammer className="w-8 h-8 text-orange-400" />,
        category: 'Norge',
        url: "https://snl.no/den_industrielle_revolusjon_i_Norge",
        readTime: "6 min lesning"
    }
];

const quizData: QuizQuestion[] = [
    {
        id: 1,
        question: "Hva var en viktig årsak til at vikingtiden tok slutt?",
        options: [
            "Vikingene gikk tom for trevirke til skip",
            "Innføringen av kristendommen og sterkere kongemakt",
            "En stor flodbølge ødela alle kystbyene",
            "Romerriket erobret Skandinavia"
        ],
        correct: 1,
        explanation: "Kristendommen knyttet Norden til resten av Europa, og kongene ønsket ro og orden for å styre rikene sine."
    },
    {
        id: 2,
        question: "Når kom Svartedauden til Norge?",
        options: [
            "1066",
            "1814",
            "1349",
            "1537"
        ],
        correct: 2,
        explanation: "Pesten kom til Bergen med et skip sommeren 1349 og spredte seg raskt over hele landet."
    },
    {
        id: 3,
        question: "Hva er Harald Hårfagre mest kjent for?",
        options: [
            "Han oppdaget Amerika",
            "Han samlet Norge til ett rike",
            "Han startet den industrielle revolusjon",
            "Han skrev Norges første lovbok"
        ],
        correct: 1,
        explanation: "Etter slaget i Hafrsfjord (ca. 872) regnes han som den som samlet Norge til ett kongerike."
    },
    {
        id: 4,
        question: "Hvor oppstod de første sivilisasjonene?",
        options: [
            "I Norge og Sverige",
            "Langs store elver i Midtøsten, Egypt og Asia",
            "På slettene i Nord-Amerika",
            "I regnskogen i Amazonas"
        ],
        correct: 1,
        explanation: "De første sivilisasjonene (som Mesopotamia og Egypt) oppstod der det var lett å dyrke mat, ofte langs store elver."
    }
];

// --- Components ---

const ArticleCard = ({ event, onClick }: { event: TimelineEvent; onClick: () => void }) => {
    return (
        <motion.article
            layoutId={`article-${event.id}`}
            onClick={onClick}
            className="group relative cursor-pointer mb-8 w-full max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-blue-500/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100" />

            <div className="relative bg-slate-900/80 border border-white/10 backdrop-blur-md rounded-2xl overflow-hidden hover:border-indigo-400/30 transition-all shadow-xl">
                <div className="flex flex-col md:flex-row">
                    {/* Left: Visual/Date Section */}
                    <div className="md:w-1/3 bg-slate-800/50 p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/5 relative overflow-hidden">
                        {/* Background Pattern */}
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
                        </div>

                        <div className="relative z-10">
                            <div className="inline-flex items-center space-x-2 text-indigo-400 font-mono text-xs uppercase tracking-wider mb-4">
                                <Calendar className="w-3 h-3" />
                                <span>{event.year}</span>
                            </div>
                            <div className="p-4 bg-slate-800/80 rounded-2xl border border-white/10 inline-block shadow-lg mb-6 group-hover:scale-110 transition-transform duration-500">
                                {event.icon}
                            </div>
                        </div>

                        <div className="relative z-10 mt-auto">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${event.category === 'Norge'
                                    ? 'bg-red-500/10 text-red-300 border-red-500/20'
                                    : 'bg-blue-500/10 text-blue-300 border-blue-500/20'
                                }`}>
                                <Tag className="w-3 h-3 mr-1.5" />
                                {event.category}
                            </span>
                        </div>
                    </div>

                    {/* Right: Content Section */}
                    <div className="md:w-2/3 p-8 flex flex-col">
                        <div className="mb-4">
                            <h3 className="text-2xl md:text-3xl font-display font-bold text-slate-100 group-hover:text-white mb-3 leading-tight">
                                {event.title}
                            </h3>
                            <p className="text-slate-400 text-base leading-relaxed line-clamp-3">
                                {event.description}
                            </p>
                        </div>

                        <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/5">
                            <div className="flex items-center text-xs text-slate-500 font-mono">
                                <Clock className="w-3 h-3 mr-2" />
                                {event.readTime}
                            </div>

                            <div className="flex items-center text-sm font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors group-hover:translate-x-1 duration-300">
                                Les hele artikkelen
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.article>
    );
};

const ArticleReader = ({ event, onClose }: { event: TimelineEvent; onClose: () => void }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 overflow-hidden">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
                layoutId={`article-${event.id}`}
                className="relative w-full max-w-4xl h-full md:h-[90vh] bg-[#0f0f11] md:rounded-3xl shadow-2xl z-10 flex flex-col overflow-hidden border border-white/10"
            >
                {/* Article Header */}
                <div className="relative shrink-0 h-64 md:h-80 bg-slate-900 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0f0f11]" />
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.3),transparent_70%)]" />

                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 bg-black/40 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors backdrop-blur-md border border-white/5 z-20"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 z-10">
                        <div className="flex items-center space-x-3 mb-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${event.category === 'Norge'
                                    ? 'bg-red-500/20 text-red-200 border-red-500/30'
                                    : 'bg-blue-500/20 text-blue-200 border-blue-500/30'
                                }`}>
                                {event.category}
                            </span>
                            <span className="text-indigo-300 font-mono text-sm border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 rounded">
                                {event.year}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-2 leading-tight">
                            {event.title}
                        </h1>
                    </div>
                </div>

                {/* Article Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0f0f11]">
                    <div className="max-w-3xl mx-auto p-8 md:p-12">

                        {/* Intro Lead */}
                        <p className="text-xl md:text-2xl text-slate-200 font-light leading-relaxed mb-12 border-b border-white/5 pb-8">
                            {event.description}
                        </p>

                        <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-12">

                            {/* Main Text Column */}
                            <div className="flex-1 order-2 lg:order-1">
                                <div className="prose prose-invert prose-lg max-w-none">
                                    {event.content.map((paragraph, index) => (
                                        <p key={index} className="text-slate-300 mb-6 leading-relaxed">
                                            {paragraph}
                                        </p>
                                    ))}
                                </div>

                                {/* Sources Box */}
                                <div className="mt-16 bg-slate-900/50 rounded-2xl p-6 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="text-slate-400 text-sm">
                                        <p className="font-bold text-slate-300 mb-1">Kvalitetssikret innhold</p>
                                        <p>Les mer om dette emnet hos Store Norske Leksikon.</p>
                                    </div>
                                    <a
                                        href={event.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-900/20 whitespace-nowrap"
                                    >
                                        Gå til SNL.no
                                        <ExternalLink className="w-4 h-4 ml-2" />
                                    </a>
                                </div>
                            </div>

                            {/* Sidebar / Key Points */}
                            <div className="w-full lg:w-72 shrink-0 mb-12 lg:mb-0 order-1 lg:order-2">
                                <div className="bg-slate-900/50 rounded-2xl p-6 border border-white/5 sticky top-6">
                                    <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-4 flex items-center">
                                        <FileText className="w-4 h-4 mr-2" />
                                        Nøkkelpunkter
                                    </h3>
                                    <ul className="space-y-4">
                                        {event.details.map((detail, idx) => (
                                            <li key={idx} className="flex text-sm text-slate-300">
                                                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 mr-3" />
                                                <span className="leading-relaxed">{detail}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const QuizModule = () => {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [answered, setAnswered] = useState<number | null>(null);

    const question = quizData[currentIdx];

    const handleAnswer = (optionIdx: number) => {
        if (answered !== null) return;
        setAnswered(optionIdx);
        if (optionIdx === question.correct) {
            setScore(s => s + 1);
        }
    };

    const nextQuestion = () => {
        setAnswered(null);
        if (currentIdx < quizData.length - 1) {
            setCurrentIdx(c => c + 1);
        } else {
            setShowResult(true);
        }
    };

    const restart = () => {
        setCurrentIdx(0);
        setScore(0);
        setShowResult(false);
        setAnswered(null);
    };

    if (showResult) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="p-6 bg-slate-800/50 rounded-full border border-white/10 shadow-[0_0_30px_rgba(74,222,128,0.2)]">
                    <CheckCircle className="w-16 h-16 text-green-400" />
                </div>
                <h2 className="text-3xl font-display font-bold text-white">Quiz Fullført!</h2>
                <p className="text-slate-400 text-lg">
                    Du fikk <span className="text-indigo-400 font-bold">{score}</span> av <span className="text-indigo-400 font-bold">{quizData.length}</span> riktige.
                </p>
                <button
                    onClick={restart}
                    className="flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-500/25"
                >
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Prøv igjen
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8 flex justify-between items-center text-sm text-slate-500 font-mono bg-slate-900/50 p-4 rounded-xl border border-white/5">
                <span>SPØRSMÅL {currentIdx + 1}/{quizData.length}</span>
                <span>POENG: {score}</span>
            </div>

            <div className="bg-slate-900/60 border border-white/10 backdrop-blur-md p-8 md:p-12 rounded-3xl shadow-xl mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

                <h3 className="text-2xl font-bold text-white mb-8 leading-relaxed relative z-10">
                    {question.question}
                </h3>

                <div className="space-y-4 relative z-10">
                    {question.options.map((option, idx) => {
                        const isSelected = answered === idx;
                        const isCorrect = idx === question.correct;
                        let btnClass = "w-full text-left p-5 rounded-xl border-2 transition-all duration-200 flex justify-between items-center group ";

                        if (answered === null) {
                            btnClass += "bg-slate-800/50 border-white/5 hover:bg-indigo-500/10 hover:border-indigo-500/30 text-slate-300 hover:pl-6";
                        } else if (isCorrect) {
                            btnClass += "bg-green-500/10 border-green-500/50 text-green-200 shadow-[0_0_20px_rgba(74,222,128,0.1)]";
                        } else if (isSelected && !isCorrect) {
                            btnClass += "bg-red-500/10 border-red-500/50 text-red-200";
                        } else {
                            btnClass += "bg-slate-800/30 border-white/5 text-slate-600 opacity-50";
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(idx)}
                                disabled={answered !== null}
                                className={btnClass}
                            >
                                <span className="font-medium text-lg">{option}</span>
                                {answered !== null && isCorrect && <CheckCircle className="w-6 h-6 text-green-400" />}
                                {answered !== null && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-red-400" />}
                                {answered === null && <div className="w-5 h-5 rounded-full border-2 border-slate-600 group-hover:border-indigo-400 transition-colors" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            <AnimatePresence>
                {answered !== null && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-indigo-900/20 border-l-4 border-indigo-500 p-6 rounded-r-xl mb-6 backdrop-blur-sm"
                    >
                        <h4 className="text-indigo-400 font-bold text-sm uppercase mb-2 flex items-center tracking-wider">
                            <Info className="w-4 h-4 mr-2" /> Forklaring
                        </h4>
                        <p className="text-slate-300 text-base leading-relaxed">
                            {question.explanation}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex justify-end pt-4">
                <button
                    onClick={nextQuestion}
                    disabled={answered === null}
                    className={`flex items-center px-8 py-4 rounded-xl font-bold transition-all ${answered === null
                            ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-white/5'
                            : 'bg-white text-indigo-900 hover:bg-indigo-50 shadow-xl hover:scale-105 active:scale-95'
                        }`}
                >
                    {currentIdx === quizData.length - 1 ? 'Se Resultat' : 'Neste Spørsmål'}
                    <ChevronRight className="w-5 h-5 ml-2" />
                </button>
            </div>
        </div>
    );
};

// --- Main App Component ---

interface HistoryLongLinesProps {
    initialLessonId?: string;
}

export const HistoryLongLines: React.FC<HistoryLongLinesProps> = ({ initialLessonId }) => {
    const [activeTab, setActiveTab] = useState<'artikler' | 'quiz'>('artikler');
    const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

    useEffect(() => {
        if (initialLessonId) {
            const event = timelineData.find(e => e.id === initialLessonId);
            if (event) {
                setSelectedEvent(event);
            }
        }
    }, [initialLessonId]);

    return (
        <div className="min-h-screen bg-[#0f0f11] text-slate-400 font-sans selection:bg-indigo-500/30 overflow-x-hidden">

            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/5 rounded-[100%] blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-900/5 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10">
                {/* Hero Section */}
                <div className="relative border-b border-white/5 bg-slate-900/30 backdrop-blur-sm">
                    <div className="max-w-5xl mx-auto px-6 py-20 md:py-28 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-full mb-8 border border-indigo-500/20"
                        >
                            <Clock className="w-5 h-5 text-indigo-400 mr-2" />
                            <span className="text-indigo-300 font-bold tracking-wider text-xs uppercase">Lærestoff - Historie</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-5xl md:text-7xl font-display font-bold text-white mb-8 tracking-tight"
                        >
                            Historien og Norge
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-light"
                        >
                            En kuratert samling av de viktigste øyeblikkene som formet oss. Fra de første menneskene til det moderne industrisamfunnet.
                        </motion.p>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="absolute bottom-0 left-0 w-full flex justify-center translate-y-1/2 z-20">
                        <div className="bg-[#0f0f11] p-2 rounded-2xl border border-white/10 shadow-2xl inline-flex space-x-2">
                            <button
                                onClick={() => setActiveTab('artikler')}
                                className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 flex items-center ${activeTab === 'artikler'
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    }`}
                            >
                                <BookOpen className="w-4 h-4 mr-2" />
                                Utforsk Artikler
                            </button>
                            <button
                                onClick={() => setActiveTab('quiz')}
                                className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 flex items-center ${activeTab === 'quiz'
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    }`}
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Ta Quizen
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <main className="max-w-5xl mx-auto px-6 py-24 min-h-[800px]">
                    <AnimatePresence mode="wait">
                        {activeTab === 'artikler' ? (
                            <motion.div
                                key="artikler"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center justify-between mb-12 border-b border-white/5 pb-4">
                                    <h2 className="text-2xl font-bold text-white flex items-center">
                                        <AlignLeft className="w-6 h-6 mr-3 text-indigo-400" />
                                        Siste Læringsartikler
                                    </h2>
                                    <span className="text-sm font-mono text-slate-500">
                                        {timelineData.length} ARTIKLER TILGJENGELIG
                                    </span>
                                </div>

                                {timelineData.map((event) => (
                                    <ArticleCard key={event.id} event={event} onClick={() => setSelectedEvent(event)} />
                                ))}

                                <div className="text-center pt-16 pb-8">
                                    <p className="text-slate-500 text-sm font-mono">
                                        — SLUTT PÅ LISTEN —
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="quiz"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                                className="pt-8"
                            >
                                <QuizModule />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>

                {/* Reading Overlay */}
                <AnimatePresence>
                    {selectedEvent && (
                        <ArticleReader event={selectedEvent} onClose={() => setSelectedEvent(null)} />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
