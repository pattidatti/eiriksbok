import React, { lazy } from 'react';

// Static imports for core/lightweight components (optional, but keep them here for now)
import { GovernmentExplorer } from './GovernmentExplorer';
import { HistoryLongLines } from './HistoryLongLines';
import { Quiz } from './Quiz';
import { EICSimulation } from './EICSimulation';
import { FactBox } from './FactBox';
import { TimelineComponent } from './TimelineComponent';
import { PlotGraph } from './PlotGraph';
import { QuoteBlock } from './QuoteBlock';
import { Comparison } from './Comparison';
import { WritingFix } from './WritingFix';
import { LineChart } from './LineChart';
import { EmperorStats } from './EmperorStats';
import { LinkButton } from './tools/LinkButton';
import { WaveMap } from './content/interactive/WaveMap';
import { Gallery } from './Gallery';
import { MapCarousel } from './MapCarousel';

// Lazy-loaded components for better performance
// Interactive Content
const InflationCalculator = lazy(() => import('./content/interactive/InflationCalculator').then(m => ({ default: m.InflationCalculator })));
const TimePreferenceModel = lazy(() => import('./content/interactive/TimePreferenceModel').then(m => ({ default: m.TimePreferenceModel })));
const BusinessCycleModel = lazy(() => import('./content/interactive/BusinessCycleModel').then(m => ({ default: m.BusinessCycleModel })));
const BusinessCycleGraph = lazy(() => import('./content/interactive/BusinessCycleGraph').then(m => ({ default: m.BusinessCycleGraph })));
const ProductionModel = lazy(() => import('./content/interactive/ProductionModel').then(m => ({ default: m.ProductionModel })));
const GrammarRuleCard = lazy(() => import('./content/interactive/GrammarRuleCard').then(m => ({ default: m.GrammarRuleCard })));
const TextHighlighter = lazy(() => import('./content/interactive/TextHighlighter').then(m => ({ default: m.TextHighlighter })));
const SentenceBuilder = lazy(() => import('./content/interactive/SentenceBuilder').then(m => ({ default: m.SentenceBuilder })));
const RomanPantheonExplorer = lazy(() => import('./content/interactive/RomanPantheonExplorer').then(m => ({ default: m.RomanPantheonExplorer })));
const RomanExpansionMap = lazy(() => import('./content/interactive/RomanExpansionMap').then(m => ({ default: m.RomanExpansionMap })));
const TrolleyProblem = lazy(() => import('./content/interactive/TrolleyProblem').then(m => ({ default: m.TrolleyProblem })));
const GoldenMeanSlider = lazy(() => import('./content/interactive/GoldenMeanSlider').then(m => ({ default: m.GoldenMeanSlider })));
const CategoricalImperativeTester = lazy(() => import('./content/interactive/CategoricalImperativeTester').then(m => ({ default: m.CategoricalImperativeTester })));
const FilterBubbleSim = lazy(() => import('./content/interactive/FilterBubbleSim').then(m => ({ default: m.FilterBubbleSim })));
const AutomationRisk = lazy(() => import('./content/interactive/AutomationRisk').then(m => ({ default: m.AutomationRisk })));
const ConformityExperiment = lazy(() => import('./content/interactive/ConformityExperiment').then(m => ({ default: m.ConformityExperiment })));
const OstracismGame = lazy(() => import('./content/interactive/OstracismGame').then(m => ({ default: m.OstracismGame })));
const VirtueBalance = lazy(() => import('./content/interactive/VirtueBalance').then(m => ({ default: m.VirtueBalance })));
const AuthorityShifter = lazy(() => import('./content/interactive/AuthorityShifter').then(m => ({ default: m.AuthorityShifter })));
const SocialContractDecider = lazy(() => import('./content/interactive/SocialContractDecider').then(m => ({ default: m.SocialContractDecider })));
const TotalitarianSandbox = lazy(() => import('./content/interactive/TotalitarianSandbox').then(m => ({ default: m.TotalitarianSandbox })));
const BanalityRoutine = lazy(() => import('./content/interactive/BanalityRoutine').then(m => ({ default: m.BanalityRoutine })));
const SpontaneousOrderSim = lazy(() => import('./content/interactive/SpontaneousOrderSim').then(m => ({ default: m.SpontaneousOrderSim })));
const PrivateLawScenario = lazy(() => import('./content/interactive/PrivateLawScenario').then(m => ({ default: m.PrivateLawScenario })));
const TheocraticCouncil = lazy(() => import('./content/interactive/TheocraticCouncil').then(m => ({ default: m.TheocraticCouncil })));
const TechnocratProblemSolver = lazy(() => import('./content/interactive/TechnocratProblemSolver').then(m => ({ default: m.TechnocratProblemSolver })));
const EliteNetworkBuilder = lazy(() => import('./content/interactive/EliteNetworkBuilder').then(m => ({ default: m.EliteNetworkBuilder })));
const MonarchyEvolution = lazy(() => import('./content/interactive/MonarchyEvolution').then(m => ({ default: m.MonarchyEvolution })));
const ColonialGovernance = lazy(() => import('./content/interactive/ColonialGovernance').then(m => ({ default: m.ColonialGovernance })));
const ResourceTradeFlows = lazy(() => import('./content/interactive/ResourceTradeFlows').then(m => ({ default: m.ResourceTradeFlows })));
const InterdisciplinaryBridge = lazy(() => import('./content/interactive/InterdisciplinaryBridge').then(m => ({ default: m.InterdisciplinaryBridge })));
const GlossaryTooltip = lazy(() => import('./content/interactive/GlossaryTooltip').then(m => ({ default: m.GlossaryTooltip })));
const ScenarioRoleplay = lazy(() => import('./content/interactive/ScenarioRoleplay').then(m => ({ default: m.ScenarioRoleplay })));
const DragDropTimeline = lazy(() => import('./content/interactive/DragDropTimeline').then(m => ({ default: m.DragDropTimeline })));
const PackTheBag = lazy(() => import('./content/interactive/PackTheBag').then(m => ({ default: m.PackTheBag })));
const DebateSimulator = lazy(() => import('./content/interactive/DebateSimulator').then(m => ({ default: m.DebateSimulator })));
const TetrarchyVisualizer = lazy(() => import('./content/interactive/TetrarchyVisualizer').then(m => ({ default: m.TetrarchyVisualizer })));
const PriceEdictExplorer = lazy(() => import('./content/interactive/PriceEdictExplorer').then(m => ({ default: m.PriceEdictExplorer })));
const RomanDefenseModel = lazy(() => import('./content/interactive/RomanDefenseModel').then(m => ({ default: m.RomanDefenseModel })));
const DetectiveEngine = lazy(() => import('./content/interactive/detective/DetectiveEngine').then(m => ({ default: m.DetectiveEngine })));
const PerspectivePrism = lazy(() => import('./content/interactive/PerspectivePrism').then(m => ({ default: m.PerspectivePrism })));
const PovertySimulation = lazy(() => import('./content/interactive/PovertySimulation').then(m => ({ default: m.PovertySimulation })));
const OkonomiVerdenLink = lazy(() => import('./content/interactive/okonomi/OkonomiVerdenLink').then(m => ({ default: m.OkonomiVerdenLink })));
const BiasLens = lazy(() => import('./learning-path/BiasLens').then(m => ({ default: m.BiasLens })));
const AllianceChain = lazy(() => import('./content/interactive/AllianceChain').then(m => ({ default: m.AllianceChain })));
const PowderKeg = lazy(() => import('./content/interactive/PowderKeg').then(m => ({ default: m.PowderKeg })));
const DreadnoughtDuel = lazy(() => import('./content/interactive/DreadnoughtDuel').then(m => ({ default: m.DreadnoughtDuel })));
const TrenchCrossSection = lazy(() => import('./content/interactive/TrenchCrossSection').then(m => ({ default: m.default })));
const AttritionWarfare = lazy(() => import('./content/interactive/AttritionWarfare').then(m => ({ default: m.default })));
const TankInterior = lazy(() => import('./content/interactive/TankInterior').then(m => ({ default: m.default })));
const GasAttackSim = lazy(() => import('./content/interactive/GasAttackSim').then(m => ({ default: m.default })));
const TsarsDilemma = lazy(() => import('./content/interactive/TsarsDilemma').then(m => ({ default: m.default })));
const HermeneuticCircle = lazy(() => import('./content/interactive/HermeneuticCircle').then(m => ({ default: m.HermeneuticCircle })));
const CyprusPeaceTalks = lazy(() => import('./content/interactive/CyprusPeaceTalks').then(m => ({ default: m.CyprusPeaceTalks })));
const DenStoreAkselerasjonen = lazy(() => import('./content/interactive/DenStoreAkselerasjonen').then(m => ({ default: m.DenStoreAkselerasjonen })));
const MaktfordelingMatch = lazy(() => import('./content/interactive/MaktfordelingMatch').then(m => ({ default: m.MaktfordelingMatch })));
const Makttredelingen = lazy(() => import('./content/interactive/Makttredelingen').then(m => ({ default: m.Makttredelingen })));
const NapoleonsArv = lazy(() => import('./content/interactive/NapoleonsArv').then(m => ({ default: m.NapoleonsArv })));
const JernbaneReisesammenligning = lazy(() => import('./content/interactive/JernbaneReisesammenligning').then(m => ({ default: m.JernbaneReisesammenligning })));
const FiksjonensKraft = lazy(() => import('./content/interactive/FiksjonensKraft').then(m => ({ default: m.FiksjonensKraft })));
const BattleTacticsSim = lazy(() => import('./content/interactive/BattleTacticsSim').then(m => ({ default: m.BattleTacticsSim })));
const MottreformasjonsVerktoy = lazy(() => import('./content/interactive/MottreformasjonsVerktoy').then(m => ({ default: m.MottreformasjonsVerktoy })));
const LovensSmutthull = lazy(() => import('./content/interactive/LovensSmutthull').then(m => ({ default: m.LovensSmutthull })));
const SprakBaneVelger = lazy(() => import('./content/interactive/SprakBaneVelger').then(m => ({ default: m.SprakBaneVelger })));
const StormaktVagskal = lazy(() => import('./content/interactive/StormaktVagskal').then(m => ({ default: m.StormaktVagskal })));
const LeonardoNotatbok = lazy(() => import('./content/interactive/LeonardoNotatbok').then(m => ({ default: m.LeonardoNotatbok })));
const GalileoTelescope = lazy(() => import('./content/interactive/GalileoTelescope').then(m => ({ default: m.GalileoTelescope })));
const MichelangeloMarmor = lazy(() => import('./content/interactive/MichelangeloMarmor').then(m => ({ default: m.MichelangeloMarmor })));

// Skapende Skriving (Creative Writing)
const StoryElementMixer = lazy(() => import('./content/interactive/StoryElementMixer').then(m => ({ default: m.StoryElementMixer })));
const ThemeDigger = lazy(() => import('./content/interactive/ThemeDigger').then(m => ({ default: m.ThemeDigger })));
const PlotDNA = lazy(() => import('./content/interactive/PlotDNA').then(m => ({ default: m.PlotDNA })));
const CharacterForge = lazy(() => import('./content/interactive/CharacterForge').then(m => ({ default: m.CharacterForge })));
const PerspectiveSwitcher = lazy(() => import('./content/interactive/PerspectiveSwitcher').then(m => ({ default: m.PerspectiveSwitcher })));
const SentenceTransformer = lazy(() => import('./content/interactive/SentenceTransformer').then(m => ({ default: m.SentenceTransformer })));
const TimelineDirector = lazy(() => import('./content/interactive/TimelineDirector').then(m => ({ default: m.TimelineDirector })));
const DialogDissector = lazy(() => import('./content/interactive/DialogDissector').then(m => ({ default: m.DialogDissector })));
const NovelleSlicer = lazy(() => import('./content/interactive/NovelleSlicer').then(m => ({ default: m.NovelleSlicer })));
const ShotTypeExplorer = lazy(() => import('./content/interactive/ShotTypeExplorer').then(m => ({ default: m.ShotTypeExplorer })));

// Tekstanalyse (Text Analysis)
const QuoteWeaver = lazy(() => import('./content/interactive/QuoteWeaver').then(m => ({ default: m.QuoteWeaver })));
const ParagraphBuilder = lazy(() => import('./content/interactive/ParagraphBuilder').then(m => ({ default: m.ParagraphBuilder })));
const ArgumentScaffold = lazy(() => import('./content/interactive/ArgumentScaffold').then(m => ({ default: m.ArgumentScaffold })));
const OppgaveTolker = lazy(() => import('./content/interactive/OppgaveTolker').then(m => ({ default: m.OppgaveTolker })));

// Demography
const DTMSimulator = lazy(() => import('./content/interactive/demography/DTMSimulator').then(m => ({ default: m.DTMSimulator })));
const MalthusBoserupModel = lazy(() => import('./content/interactive/demography/MalthusBoserupModel').then(m => ({ default: m.MalthusBoserupModel })));
const MigrationJourney = lazy(() => import('./content/interactive/demography/MigrationJourney').then(m => ({ default: m.MigrationJourney })));
const LifeExpectancyModel = lazy(() => import('./content/interactive/demography/LifeExpectancyModel').then(m => ({ default: m.LifeExpectancyModel })));
const UrbanizationTimeline = lazy(() => import('./content/interactive/demography/UrbanizationTimeline').then(m => ({ default: m.UrbanizationTimeline })));
const PopulationPyramidBuilder = lazy(() => import('../components/tools/PopulationPyramidBuilder').then(m => ({ default: m.PopulationPyramidBuilder })));
const UrbanSprawlSim = lazy(() => import('./content/interactive/demography/UrbanSprawlSim').then(m => ({ default: m.UrbanSprawlSim })));

// Economics
const TradeLoopComponent = lazy(() => import('./content/interactive/okonomi/TradeLoopComponent').then(m => ({ default: m.TradeLoopComponent })));
const SpecializationSlider = lazy(() => import('./content/interactive/okonomi/SpecializationSlider').then(m => ({ default: m.SpecializationSlider })));
const LoanableFundsMarket = lazy(() => import('./content/interactive/okonomi/LoanableFundsMarket').then(m => ({ default: m.LoanableFundsMarket })));
const HayekTriangle = lazy(() => import('./content/interactive/okonomi/HayekTriangle').then(m => ({ default: m.HayekTriangle })));
const EconomicSchoolsDiagnosis = lazy(() => import('./content/interactive/okonomi/EconomicSchoolsDiagnosis').then(m => ({ default: m.EconomicSchoolsDiagnosis })));

// Arbeidsliv
const WageNegotiationSim = lazy(() => import('./content/interactive/arbeidsliv/WageNegotiationSim').then(m => ({ default: m.WageNegotiationSim })));

// Viking/Historie
const ConflictMap = lazy(() => import('./viking/ConflictMap').then(m => ({ default: m.ConflictMap })));
const FeudalPyramid = lazy(() => import('./viking/FeudalPyramid').then(m => ({ default: m.FeudalPyramid })));
const PantheonExplorer = lazy(() => import('./viking/PantheonExplorer').then(m => ({ default: m.PantheonExplorer })));
const LanguageMixer = lazy(() => import('./viking/LanguageMixer').then(m => ({ default: m.LanguageMixer })));
const TradeRouteMap = lazy(() => import('./viking/TradeRouteMap').then(m => ({ default: m.TradeRouteMap })));
const TimelineSlider = lazy(() => import('./viking/TimelineSlider').then(m => ({ default: m.TimelineSlider })));

// Music Features
const VirtualPiano = lazy(() => import('../features/music/components/VirtualPiano').then(m => ({ default: m.VirtualPiano })));
const FretboardExplorer = lazy(() => import('../features/music/components/FretboardExplorer').then(m => ({ default: m.FretboardExplorer })));
const BeatBuilder = lazy(() => import('../features/music/components/BeatBuilder').then(m => ({ default: m.BeatBuilder })));
const ChordLibrary = lazy(() => import('../features/music/components/ChordLibrary').then(m => ({ default: m.ChordLibrary })));
const SongStructureBuilder = lazy(() => import('../features/music/components/SongStructureBuilder').then(m => ({ default: m.SongStructureBuilder })));
const ArrangementPlanner = lazy(() => import('../features/music/components/ArrangementPlanner').then(m => ({ default: m.ArrangementPlanner })));
const SongwriterStudio = lazy(() => import('../features/music/components/SongwriterStudio').then(m => ({ default: m.SongwriterStudio })));
const CAGEDExplorer = lazy(() => import('./content/interactive/CAGEDExplorer').then(m => ({ default: m.CAGEDExplorer })));
const ProtestsangAnalyse = lazy(() => import('./content/interactive/ProtestsangAnalyse').then(m => ({ default: m.ProtestsangAnalyse })));
const BluesNoteVerksted = lazy(() => import('./content/interactive/BluesNoteVerksted').then(m => ({ default: m.BluesNoteVerksted })));
const HookOppdageren = lazy(() => import('./content/interactive/HookOppdageren').then(m => ({ default: m.HookOppdageren })));
const ProgresjonAnalysator = lazy(() => import('./content/interactive/ProgresjonAnalysator').then(m => ({ default: m.ProgresjonAnalysator })));
const SoloSammenligner = lazy(() => import('./content/interactive/SoloSammenligner').then(m => ({ default: m.SoloSammenligner })));
const AkkordskiftePraksis = lazy(() => import('./content/interactive/AkkordskiftePraksis').then(m => ({ default: m.AkkordskiftePraksis })));
const NilenFlomSyklus = lazy(() => import('./content/interactive/NilenFlomSyklus').then(m => ({ default: m.NilenFlomSyklus })));
const IndusMysteryBoard = lazy(() => import('./content/interactive/IndusMysteryBoard').then(m => ({ default: m.IndusMysteryBoard })));
const HimmelensMandat = lazy(() => import('./content/interactive/HimmelensMandat').then(m => ({ default: m.HimmelensMandat })));
const ThoughtsWordsDeeds = lazy(() => import('./content/interactive/ThoughtsWordsDeeds').then(m => ({ default: m.ThoughtsWordsDeeds })));
const KyrosValget = lazy(() => import('./content/interactive/KyrosValget').then(m => ({ default: m.KyrosValget })));
const AleksandersValg = lazy(() => import('./content/interactive/AleksandersValg').then(m => ({ default: m.AleksandersValg })));
const FarmerVsForager = lazy(() => import('./content/interactive/FarmerVsForager').then(m => ({ default: m.FarmerVsForager })));
const VasaMaktSpaker = lazy(() => import('./content/interactive/VasaMaktSpaker').then(m => ({ default: m.VasaMaktSpaker })));
const Radikaliseringstrappa = lazy(() => import('./content/interactive/Radikaliseringstrappa').then(m => ({ default: m.Radikaliseringstrappa })));
const KausalitetsVri = lazy(() => import('./content/interactive/KausalitetsVri').then(m => ({ default: m.KausalitetsVri })));
const TradisjonFornyelseVever = lazy(() => import('./content/interactive/TradisjonFornyelseVever').then(m => ({ default: m.TradisjonFornyelseVever })));
const OkkupasjonensValg = lazy(() => import('./content/interactive/OkkupasjonensValg').then(m => ({ default: m.OkkupasjonensValg })));
const MerverdiSlider = lazy(() => import('./content/interactive/MerverdiSlider').then(m => ({ default: m.MerverdiSlider })));
const RenessansePerspektiv = lazy(() => import('./content/interactive/RenessansePerspektiv').then(m => ({ default: m.RenessansePerspektiv })));
const NorrontOrdmatch = lazy(() => import('./content/interactive/NorrontOrdmatch').then(m => ({ default: m.NorrontOrdmatch })));
const SkalaSammenligner = lazy(() => import('./content/interactive/SkalaSammenligner').then(m => ({ default: m.SkalaSammenligner })));
const KorstogMotiver = lazy(() => import('./content/interactive/KorstogMotiver').then(m => ({ default: m.KorstogMotiver })));
const KalvinParadokset = lazy(() => import('./content/interactive/KalvinParadokset').then(m => ({ default: m.KalvinParadokset })));
const KommaRedder = lazy(() => import('./content/interactive/KommaRedder').then(m => ({ default: m.KommaRedder })));
const DynamicsPlayground = lazy(() => import('./content/interactive/DynamicsPlayground').then(m => ({ default: m.DynamicsPlayground })));
const SamplingLab = lazy(() => import('./content/interactive/SamplingLab').then(m => ({ default: m.SamplingLab })));
const BaptismComparator = lazy(() => import('./content/interactive/BaptismComparator').then(m => ({ default: m.BaptismComparator })));
const PinseNasjoner = lazy(() => import('./content/interactive/PinseNasjoner').then(m => ({ default: m.PinseNasjoner })));
const TradisjonEllerNytt = lazy(() => import('./content/interactive/TradisjonEllerNytt').then(m => ({ default: m.TradisjonEllerNytt })));
const TekstVerksted = lazy(() => import('./content/interactive/TekstVerksted').then(m => ({ default: m.TekstVerksted })));
const IranContraSpor = lazy(() => import('./content/interactive/IranContraSpor').then(m => ({ default: m.IranContraSpor })));
const HygieneTidsreise = lazy(() => import('./content/interactive/HygieneTidsreise').then(m => ({ default: m.HygieneTidsreise })));

export const componentRegistry: Record<string, React.ComponentType<any>> = {
    // Core
    GovernmentExplorer,
    HistoryLongLines,
    Quiz,
    EICSimulation,
    FactBox,
    TimelineComponent,
    PlotGraph,
    QuoteBlock,
    Comparison,
    WritingFix,
    LineChart,
    EmperorStats,
    LinkButton,
    WaveMap,

    // Interactive Content
    InflationCalculator,
    TimePreferenceModel,
    BusinessCycleModel,
    BusinessCycleGraph,
    ProductionModel,
    GrammarRuleCard,
    TextHighlighter,
    SentenceBuilder,
    RomanPantheonExplorer,
    RomanExpansionMap,
    TrolleyProblem,
    GoldenMeanSlider,
    CategoricalImperativeTester,
    FilterBubbleSim,
    AutomationRisk,
    ConformityExperiment,
    OstracismGame,
    VirtueBalance,
    AuthorityShifter,
    SocialContractDecider,
    TotalitarianSandbox,
    BanalityRoutine,
    SpontaneousOrderSim,
    PrivateLawScenario,
    TheocraticCouncil,
    TechnocratProblemSolver,
    EliteNetworkBuilder,
    MonarchyEvolution,
    ColonialGovernance,
    ResourceTradeFlows,
    InterdisciplinaryBridge,
    GlossaryTooltip,
    ScenarioRoleplay,
    DragDropTimeline,
    PackTheBag,
    DebateSimulator,
    TetrarchyVisualizer,
    PriceEdictExplorer,
    RomanDefenseModel,
    DetectiveEngine,
    PerspectivePrism,
    PovertySimulation,
    OkonomiVerdenLink,
    BiasLens,
    AllianceChain,
    PowderKeg,
    DreadnoughtDuel,
    TrenchCrossSection,
    AttritionWarfare,
    TankInterior,
    GasAttackSim,
    TsarsDilemma,
    HermeneuticCircle,
    CyprusPeaceTalks,
    DenStoreAkselerasjonen,
    MaktfordelingMatch,
    Makttredelingen,
    NapoleonsArv,
    JernbaneReisesammenligning,
    FiksjonensKraft,
    BattleTacticsSim,
    MottreformasjonsVerktoy,
    LovensSmutthull,
    SprakBaneVelger,
    StormaktVagskal,
    LeonardoNotatbok,
    GalileoTelescope,
    MichelangeloMarmor,
    StoryElementMixer,
    ThemeDigger,
    PlotDNA,
    CharacterForge,
    PerspectiveSwitcher,
    SentenceTransformer,
    TimelineDirector,
    DialogDissector,
    NovelleSlicer,
    ShotTypeExplorer,
    QuoteWeaver,
    ParagraphBuilder,
    ArgumentScaffold,
    OppgaveTolker,
    TriangularTradeMap: lazy(() => import('./content/interactive/TriangularTradeMap').then(m => ({ default: m.TriangularTradeMap }))),
    CensorTask: lazy(() => import('./historie/CensorTask').then(m => ({ default: m.CensorTask }))),
    PropagandaDecoder: lazy(() => import('./historie/PropagandaDecoder').then(m => ({ default: m.PropagandaDecoder }))),
    TrumansDilemma: lazy(() => import('./historie/TrumansDilemma').then(m => ({ default: m.TrumansDilemma }))),
    NuclearSimulator: lazy(() => import('./content/interactive/NuclearSimulator').then(m => ({ default: m.NuclearSimulator }))),

    // Demography
    DTMSimulator,
    MalthusBoserupModel,
    MigrationJourney,
    LifeExpectancyModel,
    UrbanizationTimeline,
    PopulationPyramidBuilder,
    UrbanSprawlSim,

    // Economics
    TradeLoopComponent,
    SpecializationSlider,
    LoanableFundsMarket,
    HayekTriangle,
    EconomicSchoolsDiagnosis,

    // Arbeidsliv
    WageNegotiationSim,

    // Viking/History
    ConflictMap,
    FeudalPyramid,
    PantheonExplorer,
    LanguageMixer,
    TradeRouteMap,
    TimelineSlider,

    // Music
    CAGEDExplorer,
    VirtualPiano,
    FretboardExplorer,
    BeatBuilder,
    ChordLibrary,
    SongStructureBuilder,
    ArrangementPlanner,
    SongwriterStudio,
    ProtestsangAnalyse,
    BluesNoteVerksted,
    HookOppdageren,
    ProgresjonAnalysator,
    SoloSammenligner,
    AkkordskiftePraksis,
    NilenFlomSyklus,
    IndusMysteryBoard,
    HimmelensMandat,
    ThoughtsWordsDeeds,
    KyrosValget,
    AleksandersValg,
    FarmerVsForager,
    VasaMaktSpaker,
    Radikaliseringstrappa,
    KausalitetsVri,
    TradisjonFornyelseVever,
    OkkupasjonensValg,
    MerverdiSlider,
    RenessansePerspektiv,
    NorrontOrdmatch,
    SkalaSammenligner,
    KorstogMotiver,
    KalvinParadokset,
    KommaRedder,
    DynamicsPlayground,
    SamplingLab,
    BaptismComparator,
    PinseNasjoner,
    TradisjonEllerNytt,
    TekstVerksted,
    IranContraSpor,
    HygieneTidsreise,
    Gallery,
    gallery: Gallery,
    comparison: Comparison,
    SimpleTable: lazy(() => import('./SimpleTable').then(m => ({ default: m.SimpleTable }))),
    Hierarchy: lazy(() => import('./Hierarchy').then(m => ({ default: m.Hierarchy }))),
    triangularTradeMap: lazy(() => import('./content/interactive/TriangularTradeMap').then(m => ({ default: m.TriangularTradeMap }))),
    HanseaticLedger: lazy(() => import('./content/interactive/hanseatene/HanseaticLedger').then(m => ({ default: m.HanseaticLedger }))),
    HanseaticTradeMap: lazy(() => import('./content/interactive/hanseatene/HanseaticTradeMap').then(m => ({ default: m.HanseaticTradeMap }))),
    SpiceRoutePrice: lazy(() => import('./content/interactive/SpiceRoutePrice').then(m => ({ default: m.SpiceRoutePrice }))),
    MythVsEvidence: lazy(() => import('./content/interactive/MythVsEvidence').then(m => ({ default: m.MythVsEvidence }))),

    // Handel og infrastruktur
    GlobalProductionDots: lazy(() => import('./content/interactive/infrastruktur/GlobalProductionDots').then(m => ({ default: m.GlobalProductionDots }))),
    PipelineScenario: lazy(() => import('./content/interactive/infrastruktur/PipelineScenario').then(m => ({ default: m.PipelineScenario }))),
    CableBreakSim: lazy(() => import('./content/interactive/infrastruktur/CableBreakSim').then(m => ({ default: m.CableBreakSim }))),
    ShipmentTracker: lazy(() => import('./content/interactive/infrastruktur/ShipmentTracker').then(m => ({ default: m.ShipmentTracker }))),
    CascadeFailureSim: lazy(() => import('./content/interactive/infrastruktur/CascadeFailureSim').then(m => ({ default: m.CascadeFailureSim }))),
    MapCarousel,
};

export const getComponent = (name: string) => {
    return componentRegistry[name] || null;
};
