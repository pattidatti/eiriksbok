import type { MonologNode, MonologTrigger, MonologUIState } from '../types';

// Auto-varighet per linje basert på tegn. Holder korte replikker korte, lange replikker lesbare.
function defaultLineDuration(line: string): number {
    const raw = line.length * 50;
    return Math.max(2500, Math.min(6000, raw));
}

interface ActiveMonolog {
    nodeId: string;
    lines: string[];
    lineIndex: number;
    timer: number; // ms siden linjen ble vist
    currentDuration: number;
}

type PushState = (state: MonologUIState | null) => void;

export class MonologSystem {
    private nodes: Record<string, MonologNode>;
    private triggers: MonologTrigger[];
    private seen = new Set<string>();
    private active: ActiveMonolog | null = null;
    private pushState: PushState;

    constructor(nodes: Record<string, MonologNode>, triggers: MonologTrigger[], pushState: PushState) {
        this.nodes = nodes;
        this.triggers = triggers;
        this.pushState = pushState;
    }

    // Trigges programmatisk (fra dialog.action eller custom logikk).
    play(id: string): void {
        const node = this.nodes[id];
        if (!node) return;
        if ((node.once ?? true) && this.seen.has(id)) return;
        this.startNode(node);
    }

    // Kalles hvert frame av GameEngine med spillerens posisjon og gjeldende fase.
    update(dtSeconds: number, player: { x: number; z: number }, phase: string): void {
        // Progresjon av aktiv monolog
        if (this.active) {
            this.active.timer += dtSeconds * 1000;
            if (this.active.timer >= this.active.currentDuration) {
                this.advanceLine();
            }
            return;
        }

        // Sjekk triggere - AABB2D-test mot spillerposisjon
        for (const t of this.triggers) {
            if (t.requiresPhase && t.requiresPhase !== phase) continue;
            if (this.seen.has(t.monologId)) continue;
            const a = t.area;
            if (
                player.x >= a.minX &&
                player.x <= a.maxX &&
                player.z >= a.minZ &&
                player.z <= a.maxZ
            ) {
                const node = this.nodes[t.monologId];
                if (!node) continue;
                this.startNode(node);
                return;
            }
        }
    }

    private startNode(node: MonologNode): void {
        if (!node.lines || node.lines.length === 0) return;
        if (node.once ?? true) this.seen.add(node.id);
        this.active = {
            nodeId: node.id,
            lines: node.lines,
            lineIndex: 0,
            timer: 0,
            currentDuration: node.lineDurationMs ?? defaultLineDuration(node.lines[0]),
        };
        this.pushUI();
    }

    private advanceLine(): void {
        if (!this.active) return;
        const next = this.active.lineIndex + 1;
        if (next >= this.active.lines.length) {
            this.active = null;
            this.pushState(null);
            return;
        }
        const node = this.nodes[this.active.nodeId];
        this.active.lineIndex = next;
        this.active.timer = 0;
        this.active.currentDuration =
            node?.lineDurationMs ?? defaultLineDuration(this.active.lines[next]);
        this.pushUI();
    }

    private pushUI(): void {
        if (!this.active) {
            this.pushState(null);
            return;
        }
        this.pushState({
            id: this.active.nodeId,
            lines: this.active.lines,
            currentLine: this.active.lineIndex,
        });
    }

    // Sjekk om en monolog har blitt vist for spilleren
    hasSeen(id: string): boolean {
        return this.seen.has(id);
    }

    // For debug / reset
    clear(): void {
        this.active = null;
        this.pushState(null);
    }
}
