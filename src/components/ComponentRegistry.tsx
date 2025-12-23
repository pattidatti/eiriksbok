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
import { LineChart } from './LineChart';
import { EmperorStats } from './EmperorStats';

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
    LineChart,
    EmperorStats,

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

    // Viking/History
    ConflictMap,
    FeudalPyramid,
    PantheonExplorer,
    LanguageMixer,
    TradeRouteMap,
    TimelineSlider,

    // Music
    VirtualPiano,
    FretboardExplorer,
    BeatBuilder,
    ChordLibrary,
    SongStructureBuilder,
    ArrangementPlanner,
    SongwriterStudio,
};

export const getComponent = (name: string) => {
    return componentRegistry[name] || null;
};
