// Mikrospill-interaksjons-toolkit. Gjenbrukbare R3F-byggeklosser for rike,
// direkte-interaktive 3D-mikrospill i artikler. Se .agent/workflows/build_microgame.md.

export { damp, dampV3 } from './damp';
export { useStage } from './useStage';
export { MicroCanvas, type MicroCanvasProps } from './MicroCanvas';
export { MicroGameScaffold } from './MicroGameScaffold';

// Direkte 3D-interaksjon
export { Interactive, type InteractiveState } from './Interactive';
export { Hotspot } from './Hotspot';
export { Draggable } from './Draggable';

// Signaturlook: temaer + toon-materiale + kant
export { THEMES, DEFAULT_THEME, type KitTheme } from './themes';
export { ToonMaterial, KitOutline } from './materials';
export { toonGradientMap } from './toonGradient';

// Prosedyrale scene-deler
export {
    GroundPlane,
    WaterPlane,
    Building,
    Tree,
    Figure,
    Smoke,
    Rock,
    Fire,
    Banner,
    Gear,
} from './scene-parts';
export { InstancedField } from './InstancedField';

// Game-feel / juice
export { useShake, usePop, ease } from './juice';
export { Burst } from './Burst';
export { useScore } from './useScore';

// Lyd & kamera (immersjon)
export { useAmbience, type AmbiencePreset } from './useAmbience';
export { CameraRig } from './CameraRig';
export { useIdleMotion } from './useIdleMotion';

// 2D-overlegg (output)
export {
    SceneBanner,
    SceneBadge,
    DragHint,
    SceneFact,
    WinScreen,
    ScoreHUD,
    DataReadout,
} from './overlays';

// Pedagogisk kraft
export { useHintEscalation } from './useHintEscalation';

// Input-widgets under vinduet
export {
    ChoiceRow,
    StepTracker,
    SceneSlider,
    ToolPalette,
    SceneQuiz,
    CompareToggle,
    type ChoiceItem,
    type ChoiceStatus,
    type Tool,
} from './controls';
