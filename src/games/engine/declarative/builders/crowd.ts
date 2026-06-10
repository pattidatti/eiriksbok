import type { GameEngineRef } from '../../types';
import type { AddCrowdConfig } from '../types';

/**
 * Legg til en instansiert folkemengde (CrowdSystem). Hundrevis av lavpoly-figurer
 * i én draw call per sti-segment - bruk denne for hærer, marsjer og folkemengder
 * i stedet for individuelle meshes.
 *
 * 'march'-modus krever `path` (polylinje); kolonnen flyter langs den med
 * conveyor-wrap, så sørg for at stien strekker seg godt inn i tåka i begge
 * ender. 'static'-modus krever `area`.
 *
 * Styr i runtime via engine.setCrowdSpeed(id, fart) og engine.setCrowdVisible(id, synlig).
 */
export function addCrowd(engine: GameEngineRef, config: AddCrowdConfig): void {
    const opts = {
        count: config.count,
        mode: config.mode,
        speed: config.speed,
        palette: config.palette,
        scaleJitter: config.scaleJitter,
        spacing: config.spacing,
    };
    if (config.mode === 'march') {
        if (!config.path || config.path.length < 2) {
            throw new Error(`[addCrowd] Crowd '${config.id}': mode 'march' krever 'path' med minst 2 punkter.`);
        }
        engine.addCrowd(config.id, { path: config.path, width: config.width ?? 4 }, opts);
    } else {
        if (!config.area) {
            throw new Error(`[addCrowd] Crowd '${config.id}': mode 'static' krever 'area'.`);
        }
        engine.addCrowd(config.id, { area: config.area, y: config.y }, opts);
    }
}
