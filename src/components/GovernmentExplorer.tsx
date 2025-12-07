import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UserGroupIcon,
    UserIcon,
    ScaleIcon,
    BookOpenIcon,
    AcademicCapIcon,
    GlobeAmericasIcon,
    ShieldExclamationIcon,
    SparklesIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowPathIcon,
    InformationCircleIcon,
    BuildingLibraryIcon,
    BanknotesIcon,
    BuildingOfficeIcon,
    HandRaisedIcon,
    ArrowsRightLeftIcon
} from '@heroicons/react/24/outline';

// --- Typer og Data ---

type Category = 'Styringsform' | 'Økonomi' | 'Begrep';

interface Definition {
    id: string;
    title: string;
    category: Category;
    description: string;
    details?: string;
    icon: React.ComponentType<any>;
    color: string;
}

const definitions: Definition[] = [
    // --- Styringsformer (Hovedtyper) ---
    {
        id: 'anarki',
        title: 'Anarki',
        category: 'Styringsform',
        description: 'Ingen stat eller hersker. Et samfunn uten formell styring.',
        details: 'Ordet betyr "uten hersker". Det finnes ingen stat, skatt eller voldsmonopol.',
        icon: SparklesIcon,
        color: 'text-pink-600'
    },
    {
        id: 'monarki',
        title: 'Monarki',
        category: 'Styringsform',
        description: 'En konge, dronning, fyrste eller greve er statsoverhode.',
        details: 'Makten går som regel i arv. I dag har vi ofte konstitusjonelt monarki hvor kongen har liten makt, men historisk var det ofte enevelde.',
        icon: UserIcon,
        color: 'text-yellow-600'
    },
    {
        id: 'diktatur',
        title: 'Diktatur',
        category: 'Styringsform',
        description: 'All makt er samlet hos én person eller en liten gruppe.',
        details: 'Makten er ofte tatt med vold (kupp). Befolkningen har liten eller ingen mulighet til å påvirke styret.',
        icon: ShieldExclamationIcon,
        color: 'text-red-600'
    },
    {
        id: 'teokrati',
        title: 'Teokrati',
        category: 'Styringsform',
        description: 'Gud eller religiøse ledere styrer samfunnet basert på hellige skrifter.',
        details: 'Lovene i landet er basert på religionen. Eksempler er Vatikanstaten eller Iran.',
        icon: BookOpenIcon,
        color: 'text-purple-600'
    },
    {
        id: 'teknokrati',
        title: 'Teknokrati',
        category: 'Styringsform',
        description: 'Eksperter og vitenskapsfolk styrer basert på kunnskap.',
        details: 'Ideen er at eksperter (f.eks. ingeniører, økonomer) tar bedre beslutninger enn valgte politikere.',
        icon: AcademicCapIcon,
        color: 'text-cyan-600'
    },
    {
        id: 'oligarki',
        title: 'Oligarki',
        category: 'Styringsform',
        description: 'En liten gruppe mennesker (fåmannsvelde) har all makten.',
        details: 'Ofte er dette de rikeste i samfunnet, eller en militærjunta.',
        icon: UserGroupIcon,
        color: 'text-orange-600'
    },
    {
        id: 'demokrati_rep',
        title: 'Representativt demokrati',
        category: 'Styringsform',
        description: 'Folket velger representanter (politikere) som styrer for dem.',
        details: 'Dette er den vanligste formen for demokrati i dag. Vi holder valg med jevne mellomrom.',
        icon: GlobeAmericasIcon,
        color: 'text-green-600'
    },
    {
        id: 'demokrati_dir',
        title: 'Direkte demokrati',
        category: 'Styringsform',
        description: 'Folket stemmer direkte på hver enkelt sak.',
        details: 'Alle er med å bestemme alt. Brukes sjelden for hele land, men av og til i folkeavstemninger.',
        icon: ScaleIcon,
        color: 'text-blue-600'
    },

    // --- Spesifikke Varianter (Subtyper) ---
    {
        id: 'anarko_kap',
        title: 'Anarko-kapitalisme',
        category: 'Styringsform',
        description: 'Et samfunn uten stat, hvor alt styres av det frie markedet.',
        details: 'Ingen stat, bare privat eiendom. Alt, inkludert politi og veier, kjøpes og selges.',
        icon: BanknotesIcon,
        color: 'text-emerald-600'
    },
    {
        id: 'anarko_kom',
        title: 'Anarko-kommunisme',
        category: 'Styringsform',
        description: 'Et samfunn uten stat og penger, hvor alt eies i fellesskap.',
        details: 'Ingen stat, ingen privat eiendom. Alle bidrar etter evne og får etter behov.',
        icon: UserGroupIcon,
        color: 'text-rose-600'
    },
    {
        id: 'republikk',
        title: 'Republikk',
        category: 'Styringsform',
        description: 'En stat hvor statsoverhodet ikke er en monark (konge/dronning).',
        details: 'Lederen kalles som regel president. Kan være både demokratisk og udemokratisk.',
        icon: BuildingOfficeIcon,
        color: 'text-indigo-600'
    },
    {
        id: 'pres_republikk',
        title: 'President-republikk',
        category: 'Styringsform',
        description: 'Demokrati der presidenten har mye makt og velges uavhengig av parlamentet.',
        details: 'Eksempel: USA. Presidenten leder regjeringen og kan ikke enkelt kastes av kongressen.',
        icon: BuildingOfficeIcon,
        color: 'text-indigo-700'
    },
    {
        id: 'parl_republikk',
        title: 'Parlamentarisk republikk',
        category: 'Styringsform',
        description: 'Republikk der parlamentet har mest makt. Presidenten har ofte en seremoniell rolle.',
        details: 'Eksempel: Island eller Tyskland. Regjeringen utgår fra parlamentet.',
        icon: GlobeAmericasIcon,
        color: 'text-indigo-600'
    },
    {
        id: 'parl_stat',
        title: 'Parlamentarisk stat',
        category: 'Styringsform',
        description: 'Et system der regjeringen må ha tillit fra parlamentet (Stortinget).',
        details: 'Gjelder både monarkier (Norge) og republikker. Hvis Stortinget sier nei, må regjeringen gå.',
        icon: HandRaisedIcon,
        color: 'text-slate-600'
    },
    {
        id: 'diktatur_aut',
        title: 'Autoritært diktatur',
        category: 'Styringsform',
        description: 'Folket får ikke være med å bestemme, men kan til en viss grad mene ting.',
        details: 'Staten kontrollerer politikken, men lar folk leve livene sine relativt fritt ellers.',
        icon: ShieldExclamationIcon,
        color: 'text-red-600'
    },
    {
        id: 'diktatur_tot',
        title: 'Totalitært diktatur',
        category: 'Styringsform',
        description: 'Staten kontrollerer absolutt alt, inkludert hva folk tenker og mener.',
        details: 'Ingen frihet. Ekstrem overvåkning og propaganda. Eksempel: Nord-Korea.',
        icon: ShieldExclamationIcon,
        color: 'text-red-700'
    },

    // --- Økonomiske Systemer ---
    {
        id: 'kapitalisme',
        title: 'Kapitalisme',
        category: 'Økonomi',
        description: 'Markedsøkonomi. Produksjon er privat eiendom.',
        details: 'Styres av tilbud og etterspørsel (profitt og tap). Kundene "bestemmer" hva som lages.',
        icon: BanknotesIcon,
        color: 'text-green-600'
    },
    {
        id: 'sosialisme',
        title: 'Sosialisme',
        category: 'Økonomi',
        description: 'Produksjonsmidlene eies eller kontrolleres av fellesskapet (staten).',
        details: 'Politisk bestemt hva som skal produseres (Planøkonomi). Målet er likere fordeling.',
        icon: UserGroupIcon,
        color: 'text-red-600'
    },
    {
        id: 'kommunisme',
        title: 'Kommunisme',
        category: 'Økonomi',
        description: 'Et klasseløst samfunn der all eiendom er felles.',
        details: 'I teorien statsløst (som anarko-kommunisme), men i praksis ofte brukt om stater med streng planøkonomi.',
        icon: UserGroupIcon,
        color: 'text-red-700'
    }
];

// --- Hjelpekomponenter ---

const ChoiceButton = ({
    selected,
    onClick,
    label,
    icon: Icon,
    subtext
}: {
    selected: boolean;
    onClick: () => void;
    label: string;
    icon?: React.ComponentType<any>;
    subtext?: string;
}) => (
    <button
        onClick={onClick}
        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 group ${selected
            ? 'bg-indigo-600 border-indigo-500 text-white shadow-md ring-1 ring-indigo-400'
            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 shadow-sm'
            }`}
    >
        <div className="flex items-center justify-between">
            <span className={`font-bold text-lg ${selected ? 'text-white' : 'text-slate-900'}`}>{label}</span>
            {Icon && <Icon className={`h-6 w-6 ${selected ? 'text-white' : 'text-slate-400 group-hover:text-indigo-500'}`} />}
        </div>
        {subtext && <p className={`text-xs mt-1 ${selected ? 'text-indigo-100' : 'text-slate-500'}`}>{subtext}</p>}
    </button>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-3 flex items-center gap-2">
        <div className="h-px bg-slate-200 flex-grow"></div>
        {children}
        <div className="h-px bg-slate-200 flex-grow"></div>
    </h3>
);

// --- Hovedkomponent ---

export const GovernmentExplorer: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'utforsk' | 'quiz' | 'fagbegreper' | 'maktbalanse'>('utforsk');
    const [searchQuery, setSearchQuery] = useState('');

    // --- Explorer State ---
    const [whoRules, setWhoRules] = useState<'ingen' | 'en' | 'få' | 'alle' | null>(null);
    const [anarchyType, setAnarchyType] = useState<'kapital' | 'felles' | null>(null);
    const [oneRulerSource, setOneRulerSource] = useState<'arv' | 'makt' | null>(null);
    const [dictatorScope, setDictatorScope] = useState<'politikk' | 'alt' | null>(null);
    const [fewRulerType, setFewRulerType] = useState<'rike' | 'religion' | 'eksperter' | null>(null);
    const [demoMethod, setDemoMethod] = useState<'direkte' | 'representanter' | null>(null);
    const [headOfState, setHeadOfState] = useState<'konge' | 'president' | null>(null);
    const [powerRelation, setPowerRelation] = useState<'parlamentarisk' | 'separat' | null>(null);

    // --- Maktbalanse State ---
    const [balanceSystem, setBalanceSystem] = useState<'parlamentarisk' | 'maktfordeling'>('parlamentarisk');
    const [govStatus, setGovStatus] = useState<'sitter' | 'felt'>('sitter');
    const [triggerAction, setTriggerAction] = useState(false);

    // Resultat-utregning Explorer
    const getResult = (): Definition | null => {
        if (!whoRules) return null;
        if (whoRules === 'ingen') {
            if (anarchyType === 'kapital') return definitions.find(d => d.id === 'anarko_kap') || null;
            if (anarchyType === 'felles') return definitions.find(d => d.id === 'anarko_kom') || null;
            return definitions.find(d => d.id === 'anarki') || null;
        }
        if (whoRules === 'en') {
            if (oneRulerSource === 'arv') return definitions.find(d => d.id === 'monarki') || null;
            if (oneRulerSource === 'makt') {
                if (dictatorScope === 'alt') return definitions.find(d => d.id === 'diktatur_tot') || null;
                if (dictatorScope === 'politikk') return definitions.find(d => d.id === 'diktatur_aut') || null;
                return definitions.find(d => d.id === 'diktatur') || null;
            }
        }
        if (whoRules === 'få') {
            if (fewRulerType === 'religion') return definitions.find(d => d.id === 'teokrati') || null;
            if (fewRulerType === 'eksperter') return definitions.find(d => d.id === 'teknokrati') || null;
            if (fewRulerType === 'rike') return definitions.find(d => d.id === 'oligarki') || null;
            return definitions.find(d => d.id === 'oligarki') || null;
        }
        if (whoRules === 'alle') {
            if (demoMethod === 'direkte') return definitions.find(d => d.id === 'demokrati_dir') || null;
            if (demoMethod === 'representanter') {
                if (headOfState === 'konge') return definitions.find(d => d.id === 'monarki') || null;
                if (headOfState === 'president') {
                    if (powerRelation === 'separat') return definitions.find(d => d.id === 'pres_republikk') || null;
                    if (powerRelation === 'parlamentarisk') return definitions.find(d => d.id === 'parl_republikk') || null;
                    return definitions.find(d => d.id === 'republikk') || null;
                }
                return definitions.find(d => d.id === 'demokrati_rep') || null;
            }
        }
        return null;
    };
    const result = getResult();

    const resetBranch = () => {
        setAnarchyType(null);
        setOneRulerSource(null);
        setDictatorScope(null);
        setFewRulerType(null);
        setDemoMethod(null);
        setHeadOfState(null);
        setPowerRelation(null);
    };

    // --- Quiz State ---
    const [quizIndex, setQuizIndex] = useState(0);
    const [quizScore, setQuizScore] = useState(0);
    const [quizAnswered, setQuizAnswered] = useState(false);
    const [quizCorrect, setQuizCorrect] = useState(false);
    const [shuffledQuiz, setShuffledQuiz] = useState<Definition[]>([]);
    const [currentOptions, setCurrentOptions] = useState<Definition[]>([]);

    useEffect(() => {
        if (activeTab === 'quiz') {
            const quizItems = definitions.filter(d => d.category !== 'Begrep');
            setShuffledQuiz([...quizItems].sort(() => Math.random() - 0.5));
            setQuizIndex(0);
            setQuizScore(0);
            setQuizAnswered(false);
        }
        // Reset maktbalanse når man bytter tab
        if (activeTab === 'maktbalanse') {
            setGovStatus('sitter');
            setTriggerAction(false);
        }
    }, [activeTab]);

    useEffect(() => {
        if (shuffledQuiz.length > 0 && shuffledQuiz[quizIndex]) {
            const currentQ = shuffledQuiz[quizIndex];
            // Get 3 wrong answers excluding the current one
            const wrongAnswers = definitions
                .filter(d => d.id !== currentQ.id && d.category === currentQ.category)
                .sort(() => Math.random() - 0.5)
                .slice(0, 3);

            // Combine and shuffle
            const options = [...wrongAnswers, currentQ].sort(() => Math.random() - 0.5);
            setCurrentOptions(options);
        }
    }, [quizIndex, shuffledQuiz]);

    const handleQuizAnswer = (answerId: string) => {
        if (quizAnswered) return;
        const isCorrect = answerId === shuffledQuiz[quizIndex].id;
        setQuizCorrect(isCorrect);
        if (isCorrect) setQuizScore(s => s + 1);
        setQuizAnswered(true);
    };

    const nextQuestion = () => {
        if (quizIndex < shuffledQuiz.length - 1) {
            setQuizIndex(i => i + 1);
            setQuizAnswered(false);
            setQuizCorrect(false);
        } else {
            setActiveTab('utforsk');
        }
    };

    // --- Maktbalanse Actions ---
    const handleMistillit = () => {
        setTriggerAction(true);
        if (balanceSystem === 'parlamentarisk') {
            setTimeout(() => setGovStatus('felt'), 600);
        } else {
            setTimeout(() => setTriggerAction(false), 2000);
        }
    };

    const resetMistillit = () => {
        setGovStatus('sitter');
        setTriggerAction(false);
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-8">

            {/* Header & Navigation */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Samfunnsbyggeren</h1>
                    <p className="text-slate-500">Utforsk styringsformer, makt og økonomi</p>
                </div>
                <div className="flex flex-wrap gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                    {[
                        { id: 'utforsk', label: 'Utforsker', icon: SparklesIcon },
                        { id: 'maktbalanse', label: 'Maktbalanse', icon: ScaleIcon },
                        { id: 'quiz', label: 'Quiz', icon: AcademicCapIcon },
                        { id: 'fagbegreper', label: 'Fagbegreper', icon: BuildingLibraryIcon }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === tab.id
                                ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200'
                                : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                                }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">

                {/* === MODUS: UTFORSK === */}
                {activeTab === 'utforsk' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left Column: Controls */}
                        <div className="lg:col-span-5 space-y-6">

                            {/* Steg 1: Hvem bestemmer? */}
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <SectionTitle>1. Hvem bestemmer i samfunnet?</SectionTitle>
                                <div className="grid grid-cols-1 gap-3">
                                    <ChoiceButton
                                        label="Ingen"
                                        subtext="Alle passer på seg selv"
                                        selected={whoRules === 'ingen'}
                                        onClick={() => { setWhoRules('ingen'); resetBranch(); }}
                                        icon={SparklesIcon}
                                    />
                                    <ChoiceButton
                                        label="Én person"
                                        subtext="All makt hos en leder"
                                        selected={whoRules === 'en'}
                                        onClick={() => { setWhoRules('en'); resetBranch(); }}
                                        icon={UserIcon}
                                    />
                                    <ChoiceButton
                                        label="En liten gruppe"
                                        subtext="En elite styrer"
                                        selected={whoRules === 'få'}
                                        onClick={() => { setWhoRules('få'); resetBranch(); }}
                                        icon={UserGroupIcon}
                                    />
                                    <ChoiceButton
                                        label="Hele folket"
                                        subtext="Demokrati"
                                        selected={whoRules === 'alle'}
                                        onClick={() => { setWhoRules('alle'); resetBranch(); }}
                                        icon={GlobeAmericasIcon}
                                    />
                                </div>
                            </div>

                            {/* Steg 2: Forgreninger */}
                            <AnimatePresence mode="wait">

                                {/* Branch: INGEN (Anarki) */}
                                {whoRules === 'ingen' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                        className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm"
                                    >
                                        <SectionTitle>2. Hvordan fungerer økonomien?</SectionTitle>
                                        <div className="space-y-3">
                                            <ChoiceButton
                                                label="Privat eiendom (Marked)"
                                                subtext="Anarko-kapitalisme"
                                                selected={anarchyType === 'kapital'}
                                                onClick={() => setAnarchyType('kapital')}
                                                icon={BanknotesIcon}
                                            />
                                            <ChoiceButton
                                                label="Felles eiendom (Ingen penger)"
                                                subtext="Anarko-kommunisme"
                                                selected={anarchyType === 'felles'}
                                                onClick={() => setAnarchyType('felles')}
                                                icon={UserGroupIcon}
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                {/* Branch: EN (Monarki/Diktatur) */}
                                {whoRules === 'en' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                        className="space-y-6"
                                    >
                                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
                                            <SectionTitle>2. Hvor kommer makten fra?</SectionTitle>
                                            <div className="space-y-3">
                                                <ChoiceButton
                                                    label="Arv (Blodsbånd)"
                                                    subtext="Kongefamilie"
                                                    selected={oneRulerSource === 'arv'}
                                                    onClick={() => { setOneRulerSource('arv'); setDictatorScope(null); }}
                                                    icon={UserIcon}
                                                />
                                                <ChoiceButton
                                                    label="Makt (Kupp/Militær)"
                                                    subtext="Diktatur"
                                                    selected={oneRulerSource === 'makt'}
                                                    onClick={() => setOneRulerSource('makt')}
                                                    icon={ShieldExclamationIcon}
                                                />
                                            </div>
                                        </div>

                                        {oneRulerSource === 'makt' && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                                className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-red-500"
                                            >
                                                <SectionTitle>3. Hvor mye kontrollerer staten?</SectionTitle>
                                                <div className="space-y-3">
                                                    <ChoiceButton
                                                        label="Kun politikken (Autoritær)"
                                                        subtext="Folk lever ellers fritt"
                                                        selected={dictatorScope === 'politikk'}
                                                        onClick={() => setDictatorScope('politikk')}
                                                        icon={ShieldExclamationIcon}
                                                    />
                                                    <ChoiceButton
                                                        label="Alt! (Totalitær)"
                                                        subtext="Tankekontroll og overvåkning"
                                                        selected={dictatorScope === 'alt'}
                                                        onClick={() => setDictatorScope('alt')}
                                                        icon={ShieldExclamationIcon}
                                                    />
                                                </div>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                )}

                                {/* Branch: FÅ (Oligarki etc) */}
                                {whoRules === 'få' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                        className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm"
                                    >
                                        <SectionTitle>2. Hvem er i denne gruppen?</SectionTitle>
                                        <div className="space-y-3">
                                            <ChoiceButton
                                                label="De rike og mektige"
                                                subtext="Oligarki"
                                                selected={fewRulerType === 'rike'}
                                                onClick={() => setFewRulerType('rike')}
                                                icon={BanknotesIcon}
                                            />
                                            <ChoiceButton
                                                label="Religiøse ledere"
                                                subtext="Teokrati"
                                                selected={fewRulerType === 'religion'}
                                                onClick={() => setFewRulerType('religion')}
                                                icon={BookOpenIcon}
                                            />
                                            <ChoiceButton
                                                label="Eksperter / Vitenskapsfolk"
                                                subtext="Teknokrati"
                                                selected={fewRulerType === 'eksperter'}
                                                onClick={() => setFewRulerType('eksperter')}
                                                icon={AcademicCapIcon}
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                {/* Branch: ALLE (Demokrati) */}
                                {whoRules === 'alle' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                        className="space-y-6"
                                    >
                                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
                                            <SectionTitle>2. Hvordan tas beslutninger?</SectionTitle>
                                            <div className="space-y-3">
                                                <ChoiceButton
                                                    label="Velger representanter"
                                                    subtext="Vi stemmer på politikere"
                                                    selected={demoMethod === 'representanter'}
                                                    onClick={() => { setDemoMethod('representanter'); setHeadOfState(null); setPowerRelation(null); }}
                                                    icon={UserGroupIcon}
                                                />
                                                <ChoiceButton
                                                    label="Direkte avstemning"
                                                    subtext="Vi stemmer på hver sak"
                                                    selected={demoMethod === 'direkte'}
                                                    onClick={() => { setDemoMethod('direkte'); setHeadOfState(null); }}
                                                    icon={ScaleIcon}
                                                />
                                            </div>
                                        </div>

                                        {demoMethod === 'representanter' && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                                className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm"
                                            >
                                                <SectionTitle>3. Hvem er statsoverhode?</SectionTitle>
                                                <div className="space-y-3">
                                                    <ChoiceButton
                                                        label="Konge / Dronning"
                                                        subtext="Monarki"
                                                        selected={headOfState === 'konge'}
                                                        onClick={() => { setHeadOfState('konge'); setPowerRelation(null); }}
                                                        icon={UserIcon}
                                                    />
                                                    <ChoiceButton
                                                        label="President (Ingen konge)"
                                                        subtext="Republikk"
                                                        selected={headOfState === 'president'}
                                                        onClick={() => setHeadOfState('president')}
                                                        icon={BuildingOfficeIcon}
                                                    />
                                                </div>
                                            </motion.div>
                                        )}

                                        {headOfState === 'president' && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                                className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-indigo-500"
                                            >
                                                <SectionTitle>4. Forholdet til parlamentet?</SectionTitle>
                                                <div className="space-y-3">
                                                    <ChoiceButton
                                                        label="Regjeringen utgår fra parlamentet"
                                                        subtext="Parlamentarisk republikk (f.eks. Island)"
                                                        selected={powerRelation === 'parlamentarisk'}
                                                        onClick={() => setPowerRelation('parlamentarisk')}
                                                        icon={GlobeAmericasIcon}
                                                    />
                                                    <ChoiceButton
                                                        label="Separat valg av president"
                                                        subtext="President-republikk (f.eks. USA)"
                                                        selected={powerRelation === 'separat'}
                                                        onClick={() => setPowerRelation('separat')}
                                                        icon={ShieldExclamationIcon}
                                                    />
                                                </div>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Right Column: Result Card */}
                        <div className="lg:col-span-7 flex flex-col justify-start">
                            <div className="sticky top-8">
                                <AnimatePresence mode="wait">
                                    {result ? (
                                        <motion.div
                                            key={result.id}
                                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                            className="w-full bg-white rounded-3xl border border-slate-200 p-8 md:p-12 text-center flex flex-col items-center shadow-2xl relative overflow-hidden group min-h-[500px]"
                                        >
                                            {/* Bakgrunns-effekt */}
                                            <div className={`absolute inset-0 opacity-10 blur-3xl bg-gradient-to-t from-transparent via-${result.color.replace('text-', '')} to-transparent`} />
                                            <div className="absolute top-0 right-0 p-4 opacity-20">
                                                <result.icon className={`h-64 w-64 ${result.color} opacity-10 rotate-12`} />
                                            </div>

                                            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                                                <motion.div
                                                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                                    className={`p-6 rounded-full bg-slate-50 border border-slate-100 mb-8`}
                                                >
                                                    <result.icon className={`h-24 w-24 ${result.color}`} />
                                                </motion.div>

                                                <span className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">{result.category}</span>
                                                <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
                                                    {result.title}
                                                </h2>

                                                <div className="max-w-xl space-y-6">
                                                    <p className="text-slate-600 text-xl md:text-2xl leading-relaxed font-light">
                                                        {result.description}
                                                    </p>
                                                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-left">
                                                        <h4 className="text-slate-500 font-bold text-sm uppercase mb-2 flex items-center gap-2">
                                                            <InformationCircleIcon className="h-4 w-4" />
                                                            Visste du at?
                                                        </h4>
                                                        <p className="text-slate-600 italic">
                                                            {result.details}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="w-full h-full min-h-[500px] bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 text-center"
                                        >
                                            <SparklesIcon className="h-20 w-20 text-slate-300 mb-6 animate-pulse" />
                                            <h3 className="text-2xl font-bold text-slate-400 mb-2">Din stat venter...</h3>
                                            <p className="text-slate-500 max-w-sm">
                                                Bruk kontrollpanelet til venstre for å bygge samfunnet. Resultatet vil dukke opp her.
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                )}

                {/* === MODUS: MAKTBALANSE (NY) === */}
                {activeTab === 'maktbalanse' && (
                    <div className="max-w-6xl mx-auto space-y-8">

                        {/* Introduksjon */}
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Tre deler av makten</h2>
                            <p className="text-slate-600">
                                Se hvordan forholdet mellom Lovgivende, Utøvende og Dømmende makt endrer seg basert på styringsform.
                                <br />
                                <span className="text-sm italic">Merk: Legg merke til hvordan regjeringen og parlamentet er "sammensveiset" i parlamentarismen.</span>
                            </p>
                        </div>

                        {/* System Velger */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={() => { setBalanceSystem('parlamentarisk'); setGovStatus('sitter'); setTriggerAction(false); }}
                                className={`p-6 rounded-2xl border text-left transition-all relative overflow-hidden ${balanceSystem === 'parlamentarisk'
                                    ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500'
                                    : 'bg-white border-slate-200 hover:bg-slate-50'
                                    }`}
                            >
                                <div className="flex items-center gap-3 mb-2 relative z-10">
                                    <HandRaisedIcon className="h-6 w-6 text-indigo-500" />
                                    <span className="text-xl font-bold text-slate-900">Parlamentarisme</span>
                                </div>
                                <p className="text-sm text-slate-500 relative z-10">Modell: Norge</p>
                                <p className="text-xs text-slate-500 mt-2 relative z-10">Lovgivende og Utøvende er tett knyttet sammen.</p>
                                {balanceSystem === 'parlamentarisk' && <div className="absolute inset-0 bg-indigo-500/5 z-0" />}
                            </button>

                            <button
                                onClick={() => { setBalanceSystem('maktfordeling'); setGovStatus('sitter'); setTriggerAction(false); }}
                                className={`p-6 rounded-2xl border text-left transition-all relative overflow-hidden ${balanceSystem === 'maktfordeling'
                                    ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                                    : 'bg-white border-slate-200 hover:bg-slate-50'
                                    }`}
                            >
                                <div className="flex items-center gap-3 mb-2 relative z-10">
                                    <ScaleIcon className="h-6 w-6 text-blue-500" />
                                    <span className="text-xl font-bold text-slate-900">Ren Maktfordeling</span>
                                </div>
                                <p className="text-sm text-slate-500 relative z-10">Modell: USA</p>
                                <p className="text-xs text-slate-500 mt-2 relative z-10">Alle tre organer er separerte og uavhengige.</p>
                                {balanceSystem === 'maktfordeling' && <div className="absolute inset-0 bg-blue-500/5 z-0" />}
                            </button>
                        </div>

                        {/* Visualisering */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-8 h-[600px] relative overflow-hidden shadow-lg">

                            {/* Bakgrunnslinjer for tilkobling */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                                <defs>
                                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                                        <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                                    </marker>
                                </defs>
                                {/* Linjer tegnes basert på posisjonene til boksene (ca koordinater) */}
                                {/* Top Center: 50% 15% | Bottom Left: 25% 75% | Bottom Right: 75% 75% */}

                                {balanceSystem === 'parlamentarisk' ? (
                                    <>
                                        {/* Tykk kobling mellom Lovgivende og Utøvende for å vise "Sammensveist" */}
                                        <path d="M 500 150 Q 350 300 250 450" stroke="#818cf8" strokeWidth="12" fill="none" strokeDasharray="10,5" className="animate-pulse" opacity="0.4" />
                                        <text x="320" y="300" fill="#6366f1" fontSize="14" fontWeight="bold" transform="rotate(30 320,300)">Utgår fra</text>

                                        {/* Tynn linje til Dømmende */}
                                        <line x1="500" y1="150" x2="750" y2="450" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="5,5" />
                                    </>
                                ) : (
                                    <>
                                        {/* Trekant med sperrer for maktfordeling */}
                                        <line x1="500" y1="150" x2="250" y2="450" stroke="#cbd5e1" strokeWidth="4" />
                                        <circle cx="375" cy="300" r="15" fill="#f1f5f9" stroke="#ef4444" strokeWidth="2" /> {/* Sperre */}

                                        <line x1="500" y1="150" x2="750" y2="450" stroke="#cbd5e1" strokeWidth="4" />
                                        <circle cx="625" cy="300" r="15" fill="#f1f5f9" stroke="#ef4444" strokeWidth="2" /> {/* Sperre */}

                                        <line x1="250" y1="450" x2="750" y2="450" stroke="#cbd5e1" strokeWidth="4" />
                                        <circle cx="500" cy="450" r="15" fill="#f1f5f9" stroke="#ef4444" strokeWidth="2" /> {/* Sperre */}
                                    </>
                                )}
                            </svg>

                            {/* === LOVGIVENDE (TOP) === */}
                            <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-64 z-20">
                                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-center shadow-md relative group hover:scale-105 transition-transform">
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-200 px-3 py-1 rounded-full text-xs font-bold text-slate-600 uppercase tracking-wider">Lovgivende</div>
                                    <BuildingLibraryIcon className="h-10 w-10 text-indigo-500 mx-auto mb-2" />
                                    <h3 className="text-slate-900 font-bold text-lg">
                                        {balanceSystem === 'parlamentarisk' ? 'Stortinget' : 'Kongressen'}
                                    </h3>

                                    {/* Mistillit Knapp */}
                                    <button
                                        disabled={govStatus === 'felt'}
                                        onClick={handleMistillit}
                                        className={`mt-4 w-full py-2 rounded-lg font-bold text-xs transition-all shadow-sm ${govStatus === 'felt'
                                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                            : 'bg-red-50 text-red-500 border border-red-200 hover:bg-red-500 hover:text-white'
                                            }`}
                                    >
                                        {govStatus === 'felt' ? 'Regjeringen har gått av' : '⚠️ Fremme Mistillit'}
                                    </button>
                                </div>
                            </div>

                            {/* === UTØVENDE (BOTTOM LEFT) === */}
                            <AnimatePresence>
                                <motion.div
                                    className="absolute bottom-[10%] left-[15%] w-64 z-20"
                                    animate={govStatus === 'felt' ? { y: 100, opacity: 0.5, rotate: -10 } : { y: 0, opacity: 1, rotate: 0 }}
                                >
                                    <div className={`bg-slate-50 rounded-xl border p-4 text-center shadow-md relative transition-all ${balanceSystem === 'parlamentarisk' ? 'border-indigo-300 shadow-indigo-200' : 'border-slate-200'}`}>
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-200 px-3 py-1 rounded-full text-xs font-bold text-slate-600 uppercase tracking-wider">Utøvende</div>
                                        <BuildingOfficeIcon className="h-10 w-10 text-green-500 mx-auto mb-2" />
                                        <h3 className="text-slate-900 font-bold text-lg">
                                            {balanceSystem === 'parlamentarisk' ? 'Regjeringen' : 'Presidenten'}
                                        </h3>
                                        {/* Feedback Bubble for Maktfordeling Mistillit */}
                                        {triggerAction && balanceSystem === 'maktfordeling' && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute -top-24 left-0 bg-blue-600 text-white text-xs font-bold p-3 rounded-lg shadow-xl w-48 z-50 pointer-events-none"
                                            >
                                                "Jeg sitter trygt! Vi er separate makter, husk?" 🇺🇸
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            {/* === DØMMENDE (BOTTOM RIGHT) === */}
                            <div className="absolute bottom-[10%] right-[15%] w-64 z-20">
                                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-center shadow-md relative group hover:scale-105 transition-transform">
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-200 px-3 py-1 rounded-full text-xs font-bold text-slate-600 uppercase tracking-wider">Dømmende</div>
                                    <ScaleIcon className="h-10 w-10 text-red-500 mx-auto mb-2" />
                                    <h3 className="text-slate-900 font-bold text-lg">
                                        {balanceSystem === 'parlamentarisk' ? 'Domstolene' : 'Høyesterett'}
                                    </h3>
                                    <div className="mt-2 text-xs text-slate-500 border-t border-slate-200 pt-2">
                                        Kontrollerer at lover følges
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Reset Button (only if fallen) */}
                        {govStatus === 'felt' && (
                            <div className="flex justify-center animate-bounce">
                                <button
                                    onClick={resetMistillit}
                                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg"
                                >
                                    <ArrowPathIcon className="h-5 w-5" />
                                    Dann ny regjering
                                </button>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                                <h4 className="text-indigo-600 font-bold mb-2 flex items-center gap-2">
                                    <ArrowsRightLeftIcon className="h-5 w-5" />
                                    Forholdet mellom maktene
                                </h4>
                                <p className="text-slate-600 text-sm">
                                    {balanceSystem === 'parlamentarisk'
                                        ? "I parlamentarismen er det 'ekteskap' mellom Storting og Regjering. De er avhengige av hverandre. Domstolen står på sidelinjen som uavhengig kontrollør."
                                        : "I maktfordelingsprinsippet er de tre 'skilt ved fødselen'. De lever separate liv og passer på hverandre (checks and balances) for at ingen skal bli for sterke."}
                                </p>
                            </div>
                            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                                <h4 className="text-red-500 font-bold mb-2 flex items-center gap-2">
                                    <ShieldExclamationIcon className="h-5 w-5" />
                                    Mistillit?
                                </h4>
                                <p className="text-slate-600 text-sm">
                                    {balanceSystem === 'parlamentarisk'
                                        ? "Våpenet er skarpt! Stortinget kan når som helst kaste regjeringen hvis de er misfornøyde."
                                        : "Våpenet er sløvt. Presidenten sitter trygt ut perioden sin (4 år) med mindre han bryter loven (Riksrett)."}
                                </p>
                            </div>
                        </div>

                    </div>
                )}

                {/* === MODUS: QUIZ === */}
                {activeTab === 'quiz' && shuffledQuiz.length > 0 && (
                    <div className="max-w-3xl mx-auto w-full">
                        <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-xl relative overflow-hidden">

                            {/* Quiz Header */}
                            <div className="flex justify-between items-center mb-10 border-b border-slate-200 pb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">Gjett styringsformen</h2>
                                    <p className="text-slate-500 text-sm">Spørsmål {quizIndex + 1} av {shuffledQuiz.length}</p>
                                </div>
                                <div className="bg-slate-100 px-4 py-2 rounded-lg border border-slate-200">
                                    <span className="text-indigo-600 font-bold text-lg">Poeng: {quizScore}</span>
                                </div>
                            </div>

                            {/* Question */}
                            <div className="mb-12 text-center">
                                <p className="text-slate-500 text-sm uppercase font-bold tracking-widest mb-4">Hva beskrives her?</p>
                                <h3 className="text-slate-900 text-2xl md:text-3xl font-light leading-relaxed">
                                    "{shuffledQuiz[quizIndex].description}"
                                </h3>
                            </div>

                            {/* Options */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {currentOptions.map((option) => {
                                    const currentQ = shuffledQuiz[quizIndex];
                                    let btnClass = "bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300";
                                    let icon = null;

                                    if (quizAnswered) {
                                        if (option.id === currentQ.id) {
                                            btnClass = "bg-green-50 border-green-500 text-green-700 shadow-md";
                                            icon = <CheckCircleIcon className="h-6 w-6 text-green-500" />;
                                        } else if (option.id !== currentQ.id && !quizCorrect) {
                                            btnClass = "bg-slate-50 border-slate-200 opacity-40";
                                        } else if (!quizCorrect) { // This handles if user clicked wrong
                                            // We don't need explicit wrong style on unclicked wrong answers, just fade them
                                        }
                                    }

                                    return (
                                        <button
                                            key={option.id}
                                            disabled={quizAnswered}
                                            onClick={() => handleQuizAnswer(option.id)}
                                            className={`p-5 rounded-2xl border text-left font-bold transition-all duration-300 flex items-center justify-between group ${btnClass} ${!quizAnswered && 'hover:scale-[1.02] active:scale-98'}`}
                                        >
                                            <span className={quizAnswered && option.id === currentQ.id ? 'text-green-700' : 'text-slate-700'}>
                                                {option.title}
                                            </span>
                                            {icon}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Feedback & Next Button */}
                            <AnimatePresence>
                                {quizAnswered && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-10 flex flex-col items-center"
                                    >
                                        <div className={`mb-6 px-6 py-3 rounded-full flex items-center gap-3 ${quizCorrect ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                                            {quizCorrect ? <CheckCircleIcon className="h-6 w-6" /> : <XCircleIcon className="h-6 w-6" />}
                                            <span className="font-bold text-lg">{quizCorrect ? 'Riktig svar!' : 'Oops, det var feil.'}</span>
                                        </div>

                                        <button
                                            onClick={nextQuestion}
                                            className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-indigo-600 rounded-xl hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-1"
                                        >
                                            <span>{quizIndex < shuffledQuiz.length - 1 ? 'Neste spørsmål' : 'Fullfør Quiz'}</span>
                                            <ArrowPathIcon className="ml-2 h-5 w-5 group-hover:rotate-180 transition-transform" />
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}

                {/* === MODUS: FAGBEGREPER === */}
                {activeTab === 'fagbegreper' && (
                    <div className="space-y-16">

                        {/* Søkefelt */}
                        <div className="max-w-md mx-auto relative">
                            <input
                                type="text"
                                placeholder="Søk etter begrep..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl py-3 px-5 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
                            />
                            <div className="absolute right-4 top-3.5 text-slate-400">
                                <SparklesIcon className="h-5 w-5" />
                            </div>
                        </div>

                        {/* Seksjon: Styringsformer */}
                        <div>
                            <div className="flex items-center mb-8 gap-4 border-b border-slate-200 pb-4">
                                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                                    <GlobeAmericasIcon className="h-8 w-8" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900">Styringsformer</h2>
                                    <p className="text-slate-500">Hvordan makt organiseres i en stat</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {definitions
                                    .filter(d => d.category === 'Styringsform')
                                    .filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase()))
                                    .map((gov) => (
                                        <div key={gov.id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-indigo-300 hover:shadow-lg transition-all group relative overflow-hidden">
                                            <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
                                                <gov.icon className={`h-32 w-32 ${gov.color}`} />
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className={`p-2 rounded-lg bg-slate-50`}>
                                                        <gov.icon className={`h-6 w-6 ${gov.color}`} />
                                                    </div>
                                                    <h3 className="text-xl font-bold text-slate-900">{gov.title}</h3>
                                                </div>
                                                <p className="text-slate-600 text-sm leading-relaxed mb-4 min-h-[40px]">{gov.description}</p>
                                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                    <p className="text-slate-500 text-xs italic">{gov.details}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {/* Seksjon: Økonomi */}
                        <div>
                            <div className="flex items-center mb-8 gap-4 border-b border-slate-200 pb-4">
                                <div className="p-3 bg-green-50 rounded-xl text-green-600">
                                    <BanknotesIcon className="h-8 w-8" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900">Økonomiske Systemer</h2>
                                    <p className="text-slate-500">Hvordan ressurser fordeles</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {definitions
                                    .filter(d => d.category === 'Økonomi')
                                    .filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase()))
                                    .map((eco) => (
                                        <div key={eco.id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-green-300 hover:shadow-lg transition-all">
                                            <h3 className={`text-xl font-bold mb-3 ${eco.color}`}>{eco.title}</h3>
                                            <p className="text-slate-900 text-sm mb-3">{eco.description}</p>
                                            <p className="text-slate-500 text-xs leading-relaxed">{eco.details}</p>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {/* Seksjon: Andre Begreper */}
                        <div>
                            <div className="flex items-center mb-8 gap-4 border-b border-slate-200 pb-4">
                                <div className="p-3 bg-slate-100 rounded-xl text-slate-600">
                                    <InformationCircleIcon className="h-8 w-8" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900">Viktige Begreper</h2>
                                    <p className="text-slate-500">Nøkkelord for å forstå politikk</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {definitions
                                    .filter(d => d.category === 'Begrep')
                                    .filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase()))
                                    .map((term) => (
                                        <div key={term.id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:bg-slate-50 transition-colors shadow-sm">
                                            <h3 className="text-lg font-bold text-slate-900 mb-2">{term.title}</h3>
                                            <p className="text-slate-600 text-sm mb-2">{term.description}</p>
                                            <p className="text-slate-500 text-xs">{term.details}</p>
                                        </div>
                                    ))}
                            </div>
                        </div>

                    </div>
                )}

            </div>
        </div>
    );
};

export default GovernmentExplorer;

// Safelist for dynamic classes to ensure Tailwind generates them
export const safelist = [
    'via-pink-600', 'via-yellow-600', 'via-red-600', 'via-purple-600', 'via-cyan-600',
    'via-orange-600', 'via-green-600', 'via-blue-600', 'via-emerald-600', 'via-rose-600',
    'via-indigo-600', 'via-indigo-700', 'via-slate-600', 'via-red-700'
];
