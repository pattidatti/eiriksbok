import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
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
    Calendar,
    Tag,
    AlignLeft,
    Info
} from 'lucide-react';
import { InteractiveArticle } from './InteractiveArticle';
import { ErrorBoundary } from './ErrorBoundary';

// --- Types & Data ---

type TimelineEvent = {
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

type QuizQuestion = {
    id: number;
    question: string;
    options: string[];
    correct: number;
    explanation: string;
};

// Data oppdatert nøyaktig etter innholdet i "Historien og Norge.pdf"
const timelineData: TimelineEvent[] = [
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

const quizData: QuizQuestion[] = [
    {
        id: 1,
        question: "Hva var en viktig årsak til at vikingene begynte å reise ut?",
        options: [
            "De ble kastet ut av kongen",
            "Befolkningsvekst og mangel på jord (plassmangel)",
            "En stor flodbølge ødela avlingene",
            "De ville spre kristendommen"
        ],
        correct: 1,
        explanation: "Jernredskaper gjorde at de kunne dyrke mer mat, som førte til at folketallet økte. Det ble trangt om plassen på Vestlandet."
    },
    {
        id: 2,
        question: "Hva kalles samfunnssystemet vikingene levde under?",
        options: [
            "Demokrati",
            "Ættesamfunn med høvdinger og ting",
            "Keiserdømme",
            "Føydalisme"
        ],
        correct: 1,
        explanation: "Samfunnet var bygget opp rundt ætten (storfamilien). Høvdingen var leder, og viktige saker ble avgjort på tinget."
    },
    {
        id: 3,
        question: "Hva måtte til for at den industrielle revolusjon kunne starte?",
        options: [
            "At man fant olje",
            "At alle sluttet å være bønder",
            "Overskudd av mat og penger til maskiner",
            "At kongen bestemte det"
        ],
        correct: 2,
        explanation: "For å frigjøre folk til å jobbe i fabrikker, måtte bøndene produsere mer mat enn de selv spiste (overskudd)."
    },
    {
        id: 4,
        question: "Hvor startet jordbruket først?",
        options: [
            "I Norge",
            "I 'Den fruktbare halvmåne' i Midtøsten",
            "I Romerriket",
            "I Amerika"
        ],
        correct: 1,
        explanation: "Jordbruket oppstod i Midtøsten ca. 8000-12 000 fvt., lenge før det kom til Norge."
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
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (initialLessonId) {
            // Try to match by ID (number)
            let event = timelineData.find(e => e.id.toString() === initialLessonId);

            // If not found by ID, try to match by title (slugified)
            if (!event) {
                event = timelineData.find(e =>
                    e.title.toLowerCase().replace(/\s+/g, '-') === initialLessonId.toLowerCase() ||
                    e.title.toLowerCase() === initialLessonId.toLowerCase()
                );
            }

            if (event) {
                setSelectedEvent(event);
            }
        } else {
            // If no initialLessonId, ensure we are in list view
            setSelectedEvent(null);
        }
    }, [initialLessonId]);

    const handleArticleClick = (event: TimelineEvent) => {
        const slug = event.title.toLowerCase().replace(/\s+/g, '-');
        // Navigate to the article URL. 
        // If we are at /lange-linjer, we want /lange-linjer/slug
        // We can use relative navigation.
        navigate(slug);
    };

    const handleCloseArticle = () => {
        setSelectedEvent(null);
        // Navigate back to the parent route (e.g. /lange-linjer)
        navigate('..');
    };

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
                        {selectedEvent ? (
                            <motion.div
                                key="article-view"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <ErrorBoundary>
                                    <InteractiveArticle event={selectedEvent} onClose={handleCloseArticle} />
                                </ErrorBoundary>
                            </motion.div>
                        ) : activeTab === 'artikler' ? (
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
                                    <ArticleCard key={event.id} event={event} onClick={() => handleArticleClick(event)} />
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
            </div>
        </div>
    );
}
