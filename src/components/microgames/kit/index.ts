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

// Prosedyrale scene-deler
export { GroundPlane, WaterPlane, Building, Tree, Figure, Smoke } from './scene-parts';

// 2D-overlegg (output)
export { SceneBanner, SceneBadge, DragHint, SceneFact, WinScreen } from './overlays';

// Input-widgets under vinduet
export {
    ChoiceRow,
    StepTracker,
    SceneSlider,
    ToolPalette,
    type ChoiceItem,
    type ChoiceStatus,
    type Tool,
} from './controls';
