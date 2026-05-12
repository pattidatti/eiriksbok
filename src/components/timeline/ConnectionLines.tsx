import React, { useEffect, useRef, useState, useMemo } from 'react';
import type { GlobalTimelineEvent } from '../../types';

interface ConnectionLinesProps {
    events: GlobalTimelineEvent[];
    containerRef: React.RefObject<HTMLDivElement | null>;
    getEventEl: (id: string) => HTMLElement | null;
    enabled: boolean;
    yearWindow?: number;
}

interface Connection {
    a: GlobalTimelineEvent;
    b: GlobalTimelineEvent;
    sharedTag: string;
}

interface LineCoords {
    key: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    tag: string;
}

const MAX_CONNECTIONS = 60;

export const ConnectionLines: React.FC<ConnectionLinesProps> = ({
    events,
    containerRef,
    getEventEl,
    enabled,
    yearWindow = 15,
}) => {
    const [lines, setLines] = useState<LineCoords[]>([]);
    const rafRef = useRef<number | null>(null);

    const connections: Connection[] = useMemo(() => {
        if (!enabled) return [];
        const result: Connection[] = [];
        for (let i = 0; i < events.length; i++) {
            const a = events[i];
            if (!a.tags || a.tags.length === 0) continue;
            for (let j = i + 1; j < events.length; j++) {
                const b = events[j];
                if (b.subjectId === a.subjectId) continue;
                if (Math.abs(b.startDate - a.startDate) > yearWindow) {
                    if (b.startDate - a.startDate > yearWindow) break;
                    continue;
                }
                if (!b.tags || b.tags.length === 0) continue;
                const shared = a.tags.find((t) => b.tags!.includes(t));
                if (shared) {
                    result.push({ a, b, sharedTag: shared });
                    if (result.length >= MAX_CONNECTIONS) return result;
                }
            }
        }
        return result;
    }, [events, enabled, yearWindow]);

    const recompute = useMemo(
        () => () => {
            if (!enabled || !containerRef.current) {
                setLines([]);
                return;
            }
            const containerRect = containerRef.current.getBoundingClientRect();
            const next: LineCoords[] = [];
            for (const c of connections) {
                const elA = getEventEl(c.a.id);
                const elB = getEventEl(c.b.id);
                if (!elA || !elB) continue;
                const rA = elA.getBoundingClientRect();
                const rB = elB.getBoundingClientRect();
                next.push({
                    key: `${c.a.id}-${c.b.id}`,
                    x1: rA.left + rA.width / 2 - containerRect.left,
                    y1: rA.top + rA.height / 2 - containerRect.top,
                    x2: rB.left + rB.width / 2 - containerRect.left,
                    y2: rB.top + rB.height / 2 - containerRect.top,
                    tag: c.sharedTag,
                });
            }
            setLines(next);
        },
        [enabled, connections, containerRef, getEventEl]
    );

    useEffect(() => {
        if (!enabled) return;
        const schedule = () => {
            if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
            rafRef.current = requestAnimationFrame(recompute);
        };
        schedule();
        const onScroll = schedule;
        const onResize = schedule;
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onResize);
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onResize);
            if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
        };
    }, [enabled, recompute]);

    if (!enabled || lines.length === 0) return null;

    return (
        <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
            style={{ overflow: 'visible' }}
        >
            <defs>
                <linearGradient id="conn-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity="0.6" />
                </linearGradient>
            </defs>
            {lines.map((line) => (
                <line
                    key={line.key}
                    x1={line.x1}
                    y1={line.y1}
                    x2={line.x2}
                    y2={line.y2}
                    stroke="url(#conn-grad)"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                />
            ))}
        </svg>
    );
};
