import type { Position } from '../store/gameStore';

// Simple cubic bezier point calculation
function getCubicBezierPoint(t: number, p0: Position, p1: Position, p2: Position, p3: Position): Position {
    const cx = 3 * (p1.x - p0.x);
    const bx = 3 * (p2.x - p1.x) - cx;
    const ax = p3.x - p0.x - cx - bx;

    const cy = 3 * (p1.y - p0.y);
    const by = 3 * (p2.y - p1.y) - cy;
    const ay = p3.y - p0.y - cy - by;

    const x = (ax * Math.pow(t, 3)) + (bx * Math.pow(t, 2)) + (cx * t) + p0.x;
    const y = (ay * Math.pow(t, 3)) + (by * Math.pow(t, 2)) + (cy * t) + p0.y;

    return { x, y };
}

export const generatePathPoints = (): Position[] => {
    const points: Position[] = [];
    const segments = 100; // Total resolution

    // Curve 1: (0, 300) -> (400, 100) with controls (200, 300) and (200, 100)
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        points.push(getCubicBezierPoint(t,
            { x: 0, y: 300 },
            { x: 200, y: 300 },
            { x: 200, y: 100 },
            { x: 400, y: 100 }
        ));
    }

    // Curve 2: (400, 100) -> (800, 500) with controls (600, 100) and (600, 500)
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        points.push(getCubicBezierPoint(t,
            { x: 400, y: 100 },
            { x: 600, y: 100 },
            { x: 600, y: 500 },
            { x: 800, y: 500 }
        ));
    }

    return points;
};

export const GAME_PATH = generatePathPoints();
