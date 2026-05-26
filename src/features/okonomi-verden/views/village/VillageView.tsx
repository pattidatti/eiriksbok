import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Users, Heart, Briefcase, AlertTriangle, Sun, Moon, Sunrise, Sunset } from 'lucide-react';
import { useWorldStore } from '../../store/worldStore';
import type { Agent, ProductionStage } from '../../types';

const CANVAS_W = 1200;
const CANVAS_H = 760;
const DAY_LENGTH = 240;

type DayPhase = 'morning' | 'day' | 'evening' | 'night';

interface Building {
    id: string;
    label: string;
    type: 'home' | 'factory' | 'market' | 'bank';
    x: number;
    y: number;
    w: number;
    h: number;
    color: string;
    accent: string;
    stageId?: number;
    hasChimney?: boolean;
}

const HOMES_COUNT = 14;

function buildBuildings(): Building[] {
    const factories: Building[] = [
        {
            id: 'f0',
            label: 'Butikker',
            type: 'factory',
            stageId: 0,
            x: 510,
            y: 280,
            w: 170,
            h: 120,
            color: '#10b981',
            accent: '#047857',
            hasChimney: false,
        },
        {
            id: 'f1',
            label: 'Distribusjon',
            type: 'factory',
            stageId: 1,
            x: 780,
            y: 200,
            w: 150,
            h: 105,
            color: '#3b82f6',
            accent: '#1d4ed8',
            hasChimney: true,
        },
        {
            id: 'f2',
            label: 'Maskinverksted',
            type: 'factory',
            stageId: 2,
            x: 940,
            y: 380,
            w: 160,
            h: 115,
            color: '#f59e0b',
            accent: '#b45309',
            hasChimney: true,
        },
        {
            id: 'f3',
            label: 'Halvfabrikata',
            type: 'factory',
            stageId: 3,
            x: 780,
            y: 560,
            w: 150,
            h: 105,
            color: '#ef4444',
            accent: '#b91c1c',
            hasChimney: true,
        },
        {
            id: 'f4',
            label: 'Gruve',
            type: 'factory',
            stageId: 4,
            x: 560,
            y: 590,
            w: 170,
            h: 120,
            color: '#8b5cf6',
            accent: '#6d28d9',
            hasChimney: true,
        },
    ];

    const market: Building = {
        id: 'market',
        label: 'Markedet',
        type: 'market',
        x: 230,
        y: 310,
        w: 170,
        h: 160,
        color: '#fbbf24',
        accent: '#d97706',
    };
    const bank: Building = {
        id: 'bank',
        label: 'Banken',
        type: 'bank',
        x: 80,
        y: 520,
        w: 140,
        h: 110,
        color: '#a855f7',
        accent: '#7c3aed',
    };

    const homes: Building[] = [];
    const homeColors = ['#fde68a', '#fecaca', '#bfdbfe', '#bbf7d0', '#ddd6fe', '#fed7aa'];
    for (let i = 0; i < HOMES_COUNT; i++) {
        const angle = (i / HOMES_COUNT) * Math.PI * 2;
        const r = 320 + (i % 3) * 35;
        const cx = CANVAS_W / 2 + Math.cos(angle) * r * 1.05;
        const cy = CANVAS_H / 2 + Math.sin(angle) * r * 0.62;
        const color = homeColors[i % homeColors.length];
        homes.push({
            id: `h${i}`,
            label: '',
            type: 'home',
            x: Math.max(50, Math.min(CANVAS_W - 100, cx - 28)),
            y: Math.max(80, Math.min(CANVAS_H - 100, cy - 22)),
            w: 56,
            h: 48,
            color,
            accent: darken(color, 60),
        });
    }
    return [...homes, market, bank, ...factories];
}

interface AnimatedAgent {
    id: number;
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    color: string;
    role: Agent['role'];
    mood: Agent['mood'];
    homeIdx: number;
    bob: number;
    facing: number;
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
    size: number;
}

function buildAnimatedAgents(agents: Agent[], buildings: Building[]): AnimatedAgent[] {
    const homes = buildings.filter((b) => b.type === 'home');
    return agents.map((a, i) => {
        const home = homes[i % homes.length];
        return {
            id: a.id,
            x: home.x + home.w / 2 + (Math.random() - 0.5) * 20,
            y: home.y + home.h / 2 + (Math.random() - 0.5) * 20,
            targetX: home.x + home.w / 2,
            targetY: home.y + home.h / 2,
            color: roleColor(a.role),
            role: a.role,
            mood: a.mood,
            homeIdx: i % homes.length,
            bob: Math.random() * Math.PI * 2,
            facing: 0,
        };
    });
}

function roleColor(role: Agent['role']): string {
    switch (role) {
        case 'worker':
            return '#0ea5e9';
        case 'saver':
            return '#a855f7';
        case 'entrepreneur':
            return '#f59e0b';
        case 'consumer':
            return '#10b981';
    }
}

function moodRing(mood: Agent['mood']): string | null {
    if (mood === 'unemployed') return '#ef4444';
    if (mood === 'struggling') return '#f59e0b';
    return null;
}

export function VillageView() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const agents = useWorldStore((s) => s.sim.agents);
    const stages = useWorldStore((s) => s.sim.stages);
    const phase = useWorldStore((s) => s.sim.phase);
    const tick = useWorldStore((s) => s.sim.tick);
    const buildingsRef = useRef<Building[]>(buildBuildings());
    const animRef = useRef<AnimatedAgent[]>([]);
    const particlesRef = useRef<Particle[]>([]);
    const rafRef = useRef<number | null>(null);
    const mouseRef = useRef<{ x: number; y: number } | null>(null);
    const hoveredIdRef = useRef<number | null>(null);
    const renderTickRef = useRef(0);
    const dataRef = useRef({
        agents: [] as Agent[],
        stages: [] as ProductionStage[],
        phase: 'expansion' as string,
        tick: 0,
    });
    const [selected, setSelected] = useState<Agent | null>(null);
    const [hoveredId, setHoveredId] = useState<number | null>(null);

    // Canvas DPI setup, kjøres kun én gang
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const ratio = window.devicePixelRatio || 1;
        canvas.width = CANVAS_W * ratio;
        canvas.height = CANVAS_H * ratio;
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        animRef.current = buildAnimatedAgents(agents, buildingsRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Sync siste sim-state inn i refs, oppdater agent-mål basert på dag-skjema
    useEffect(() => {
        dataRef.current = { agents, stages, phase, tick };
        if (animRef.current.length !== agents.length) {
            animRef.current = buildAnimatedAgents(agents, buildingsRef.current);
            return;
        }
        const timeOfDay = tick % DAY_LENGTH;
        animRef.current.forEach((aa, i) => {
            const a = agents[i];
            if (!a) return;
            aa.role = a.role;
            aa.mood = a.mood;
            aa.color = roleColor(a.role);
            const dest = scheduledDestination(a, aa, buildingsRef.current, timeOfDay);
            aa.targetX = dest.x;
            aa.targetY = dest.y;
        });
    }, [agents, stages, phase, tick]);

    // Animation-loop. Kjøres kun én gang ved mount, leser alt fra refs.
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const loop = () => {
            renderTickRef.current++;
            const { phase, stages, tick, agents } = dataRef.current;
            const localTime = (tick + renderTickRef.current * 0.02) % DAY_LENGTH;
            const dayPhase = phaseOfDay(localTime);

            drawScene(
                ctx,
                buildingsRef.current,
                animRef.current,
                stages,
                phase,
                localTime,
                dayPhase,
                particlesRef.current,
                hoveredIdRef.current
            );

            for (const aa of animRef.current) {
                const dx = aa.targetX - aa.x;
                const dy = aa.targetY - aa.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const speed = dist > 4 ? 0.022 : 0.008;
                aa.x += dx * speed;
                aa.y += dy * speed;
                aa.bob += 0.18;
                if (Math.abs(dx) > 0.5) aa.facing = dx > 0 ? 1 : -1;
            }

            updateParticles(particlesRef.current);
            spawnParticles(particlesRef.current, buildingsRef.current, stages, phase);

            if (mouseRef.current) {
                let best = -1;
                let bestDist = 999;
                animRef.current.forEach((aa, i) => {
                    const dx = aa.x - mouseRef.current!.x;
                    const dy = aa.y - mouseRef.current!.y;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    if (d < 22 && d < bestDist) {
                        bestDist = d;
                        best = i;
                    }
                });
                const newHover = best >= 0 ? agents[best]?.id ?? null : null;
                if (newHover !== hoveredIdRef.current) {
                    hoveredIdRef.current = newHover;
                    setHoveredId(newHover);
                }
            }

            rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
        return () => {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = CANVAS_W / rect.width;
        const scaleY = CANVAS_H / rect.height;
        mouseRef.current = {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
        };
    }

    function handleMouseLeave() {
        mouseRef.current = null;
        hoveredIdRef.current = null;
        setHoveredId(null);
    }

    function handleClick() {
        if (hoveredIdRef.current === null) {
            setSelected(null);
            return;
        }
        const a = agents.find((ag) => ag.id === hoveredIdRef.current) ?? null;
        setSelected(a);
    }

    const employmentRate = computeEmploymentRate(agents);
    const happyShare = computeMoodShare(agents, 'happy');
    const currentDayPhase = phaseOfDay(tick % DAY_LENGTH);

    return (
        <div className="flex flex-col gap-5 p-5 lg:p-8 overflow-hidden h-full">
            <header className="flex flex-wrap items-end justify-between gap-3 flex-shrink-0">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-display font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-300/40">
                            <Home size={22} className="text-white" />
                        </span>
                        Landsbyen
                    </h1>
                    <p className="text-base lg:text-lg text-slate-600 mt-1">
                        80 innbyggere lever, jobber og handler. Klikk en innbygger for å se hvordan det går.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <DayClock phase={currentDayPhase} />
                    <Mini label="Sysselsetting" value={`${employmentRate.toFixed(0)}%`} icon={Briefcase} color="emerald" />
                    <Mini label="Glade" value={`${happyShare.toFixed(0)}%`} icon={Heart} color="rose" />
                    <Mini label="Innbyggere" value={String(agents.length)} icon={Users} color="indigo" />
                </div>
            </header>

            <div className="flex-1 flex flex-col xl:flex-row gap-5 min-h-0">
                <div className="flex-1 bg-gradient-to-b from-sky-50 to-emerald-50 border border-slate-200/70 rounded-3xl shadow-md overflow-hidden relative">
                    <canvas
                        ref={canvasRef}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        onClick={handleClick}
                        className={`w-full h-full block ${hoveredId !== null ? 'cursor-pointer' : 'cursor-default'}`}
                        style={{ aspectRatio: `${CANVAS_W} / ${CANVAS_H}` }}
                    />
                    <AnimatePresence>
                        {phase === 'bust' && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="absolute top-4 left-4 flex items-center gap-2 bg-rose-100 border border-rose-300 px-4 py-2 rounded-2xl shadow-md text-rose-900 font-bold"
                            >
                                <AlertTriangle size={16} />
                                Krisen rammer landsbyen
                            </motion.div>
                        )}
                        {phase === 'boom' && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="absolute top-4 left-4 flex items-center gap-2 bg-amber-100 border border-amber-300 px-4 py-2 rounded-2xl shadow-md text-amber-900 font-bold"
                            >
                                Kunstig boom: bygges over evne
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <aside className="xl:w-80 flex flex-col gap-4">
                    <div className="bg-white border border-slate-200/70 rounded-2xl p-4 shadow-md">
                        <h3 className="text-base font-display font-bold text-slate-900 mb-3">
                            Hva betyr fargene?
                        </h3>
                        <ul className="flex flex-col gap-2 text-sm">
                            <Legend color="#0ea5e9" label="Arbeider" />
                            <Legend color="#a855f7" label="Sparer" />
                            <Legend color="#f59e0b" label="Entreprenør" />
                            <Legend color="#10b981" label="Forbruker" />
                            <li className="border-t border-slate-100 mt-2 pt-2 text-xs text-slate-500">
                                Rød ring = arbeidsledig · gul ring = sliter
                            </li>
                        </ul>
                    </div>

                    <AnimatePresence>
                        {selected && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white border-2 rounded-2xl p-4 shadow-lg"
                                style={{ borderColor: roleColor(selected.role) }}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-base font-display font-bold text-slate-900">
                                        Innbygger #{selected.id}
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => setSelected(null)}
                                        className="text-slate-400 hover:text-slate-700 text-sm"
                                    >
                                        Lukk
                                    </button>
                                </div>
                                <dl className="text-sm space-y-1.5">
                                    <Row k="Rolle" v={roleLabel(selected.role)} />
                                    <Row k="Tidspreferanse" v={selected.timePreference.toFixed(2)} />
                                    <Row k="Lønn" v={`${selected.wage.toFixed(0)} kr`} />
                                    <Row k="Sparing" v={`${selected.savings.toFixed(0)} kr`} />
                                    <Row k="Forbruk" v={`${selected.consumption.toFixed(0)} kr`} />
                                    <Row k="Humør" v={moodLabel(selected.mood)} />
                                    {selected.stageEmployer !== null && (
                                        <Row
                                            k="Jobber i"
                                            v={stages[selected.stageEmployer]?.name ?? 'ukjent'}
                                        />
                                    )}
                                </dl>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </aside>
            </div>
        </div>
    );
}

function DayClock({ phase }: { phase: DayPhase }) {
    const info = {
        morning: { icon: Sunrise, label: 'Morgen', bg: 'bg-orange-100 text-orange-800' },
        day: { icon: Sun, label: 'Dag', bg: 'bg-amber-100 text-amber-800' },
        evening: { icon: Sunset, label: 'Kveld', bg: 'bg-rose-100 text-rose-800' },
        night: { icon: Moon, label: 'Natt', bg: 'bg-indigo-100 text-indigo-800' },
    }[phase];
    const Icon = info.icon;
    return (
        <div className="flex items-center gap-2.5 bg-white border border-slate-200/70 rounded-2xl px-4 py-2 shadow-sm">
            <span className={`flex items-center justify-center w-9 h-9 rounded-xl ${info.bg}`}>
                <Icon size={16} />
            </span>
            <div>
                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Tid</div>
                <div className="text-base font-bold text-slate-900">{info.label}</div>
            </div>
        </div>
    );
}

function Row({ k, v }: { k: string; v: string }) {
    return (
        <div className="flex justify-between border-b border-slate-100 pb-1">
            <dt className="text-slate-500">{k}</dt>
            <dd className="text-slate-900 font-semibold font-mono tabular-nums">{v}</dd>
        </div>
    );
}

function Legend({ color, label }: { color: string; label: string }) {
    return (
        <li className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: color }} />
            <span className="text-slate-700 font-medium">{label}</span>
        </li>
    );
}

function Mini({
    label,
    value,
    icon: Icon,
    color,
}: {
    label: string;
    value: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    color: 'emerald' | 'rose' | 'indigo';
}) {
    const cls = {
        emerald: 'bg-emerald-100 text-emerald-800',
        rose: 'bg-rose-100 text-rose-800',
        indigo: 'bg-indigo-100 text-indigo-800',
    }[color];
    return (
        <div className="flex items-center gap-2.5 bg-white border border-slate-200/70 rounded-2xl px-4 py-2 shadow-sm">
            <span className={`flex items-center justify-center w-9 h-9 rounded-xl ${cls}`}>
                <Icon size={16} />
            </span>
            <div>
                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                    {label}
                </div>
                <div className="text-lg font-bold tabular-nums text-slate-900">{value}</div>
            </div>
        </div>
    );
}

function roleLabel(r: Agent['role']): string {
    return { worker: 'Arbeider', saver: 'Sparer', entrepreneur: 'Entreprenør', consumer: 'Forbruker' }[r];
}

function moodLabel(m: Agent['mood']): string {
    return { happy: 'Fornøyd', struggling: 'Sliter', unemployed: 'Arbeidsledig' }[m];
}

function computeEmploymentRate(agents: Agent[]): number {
    const workers = agents.filter((a) => a.role === 'worker');
    if (workers.length === 0) return 0;
    const employed = workers.filter((a) => a.stageEmployer !== null).length;
    return (employed / workers.length) * 100;
}

function computeMoodShare(agents: Agent[], mood: Agent['mood']): number {
    if (agents.length === 0) return 0;
    return (agents.filter((a) => a.mood === mood).length / agents.length) * 100;
}

function phaseOfDay(t: number): DayPhase {
    if (t < 60) return 'morning';
    if (t < 130) return 'day';
    if (t < 180) return 'evening';
    return 'night';
}

function scheduledDestination(
    agent: Agent,
    aa: AnimatedAgent,
    buildings: Building[],
    timeOfDay: number
): { x: number; y: number } {
    const homes = buildings.filter((b) => b.type === 'home');
    const market = buildings.find((b) => b.type === 'market')!;
    const bank = buildings.find((b) => b.type === 'bank')!;
    const factories = buildings.filter((b) => b.type === 'factory');
    const home = homes[aa.homeIdx];

    const at = (b: Building, offX = 0, offY = 0) => ({
        x: b.x + b.w / 2 + offX,
        y: b.y + b.h / 2 + offY,
    });
    const jitter = (n: number) => ((aa.id * 7919) % n) - n / 2;

    if (timeOfDay < 30) {
        return at(home, jitter(12), jitter(12));
    }

    if (timeOfDay < 130) {
        if (agent.role === 'worker') {
            if (agent.stageEmployer !== null) {
                const fac = factories[agent.stageEmployer];
                if (fac) return at(fac, jitter(40), jitter(30));
            }
            return at(market, jitter(40), jitter(30));
        }
        if (agent.role === 'entrepreneur') {
            const cycleFactory = factories[(Math.floor(timeOfDay / 25) + aa.id) % factories.length];
            return at(cycleFactory, jitter(35), jitter(25));
        }
        if (agent.role === 'saver') {
            return timeOfDay < 80 ? at(bank, jitter(28), jitter(20)) : at(home, jitter(10), jitter(10));
        }
        return at(market, jitter(45), jitter(35));
    }

    if (timeOfDay < 180) {
        if (agent.role === 'worker' && agent.stageEmployer !== null) {
            return Math.random() > 0.7
                ? at(market, jitter(35), jitter(28))
                : at(home, jitter(12), jitter(12));
        }
        return at(market, jitter(40), jitter(30));
    }

    return at(home, jitter(8), jitter(8));
}

function updateParticles(particles: Particle[]) {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;
        p.vy -= 0.04;
        p.size *= 0.985;
        if (p.life <= 0 || p.size < 0.5) particles.splice(i, 1);
    }
}

function spawnParticles(
    particles: Particle[],
    buildings: Building[],
    stages: ProductionStage[],
    phase: string
) {
    if (particles.length > 220) return;
    if (Math.random() > 0.5) return;
    const factories = buildings.filter((b) => b.type === 'factory' && b.hasChimney);
    for (const f of factories) {
        const stage = stages[f.stageId ?? 0];
        const activity = (stage?.laborers ?? 0) / 12;
        if (Math.random() > activity * 0.7) continue;
        const distorted = phase === 'boom';
        particles.push({
            x: f.x + f.w * 0.78 + (Math.random() - 0.5) * 4,
            y: f.y + 4,
            vx: (Math.random() - 0.5) * 0.4,
            vy: -0.6 - Math.random() * 0.4,
            life: 50 + Math.random() * 30,
            color: distorted ? 'rgba(180, 100, 50, 0.55)' : 'rgba(120, 120, 120, 0.55)',
            size: 4 + Math.random() * 3,
        });
    }
}

function drawScene(
    ctx: CanvasRenderingContext2D,
    buildings: Building[],
    agents: AnimatedAgent[],
    stages: ProductionStage[],
    phase: string,
    timeOfDay: number,
    dayPhase: DayPhase,
    particles: Particle[],
    hoveredId: number | null
) {
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    drawGround(ctx, dayPhase);
    drawRoads(ctx, buildings);

    if (phase === 'bust') {
        ctx.fillStyle = 'rgba(244, 63, 94, 0.07)';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    } else if (phase === 'boom') {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.05)';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }

    drawDecorations(ctx);

    const sorted = [...buildings].sort((a, b) => a.y + a.h - (b.y + b.h));
    for (const b of sorted) {
        drawBuilding(ctx, b, phase, stages, dayPhase);
    }

    drawParticles(ctx, particles);

    for (const aa of agents) {
        drawAgent(ctx, aa, aa.id === hoveredId, dayPhase);
    }

    drawDayOverlay(ctx, dayPhase, timeOfDay);
}

function drawGround(ctx: CanvasRenderingContext2D, dayPhase: DayPhase) {
    const grass = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    if (dayPhase === 'night') {
        grass.addColorStop(0, '#1e3a5f');
        grass.addColorStop(1, '#1a2f4d');
    } else if (dayPhase === 'evening') {
        grass.addColorStop(0, '#fbcfa6');
        grass.addColorStop(1, '#a3b988');
    } else if (dayPhase === 'morning') {
        grass.addColorStop(0, '#ffe8c8');
        grass.addColorStop(1, '#bbf0c2');
    } else {
        grass.addColorStop(0, '#dcfce7');
        grass.addColorStop(1, '#bbf7d0');
    }
    ctx.fillStyle = grass;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    ctx.fillStyle = dayPhase === 'night' ? 'rgba(255,255,255,0.04)' : 'rgba(34,89,49,0.06)';
    for (let i = 0; i < 60; i++) {
        const x = ((i * 137.5) % CANVAS_W) + ((i * 31) % 7);
        const y = ((i * 91.3) % CANVAS_H) + ((i * 17) % 11);
        ctx.beginPath();
        ctx.arc(x, y, 2 + (i % 3), 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawRoads(ctx: CanvasRenderingContext2D, buildings: Building[]) {
    const market = buildings.find((b) => b.type === 'market');
    const bank = buildings.find((b) => b.type === 'bank');
    const factories = buildings.filter((b) => b.type === 'factory');
    const homes = buildings.filter((b) => b.type === 'home');
    if (!market) return;

    ctx.strokeStyle = '#e7d8b8';
    ctx.lineWidth = 28;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (const f of factories) {
        ctx.moveTo(market.x + market.w / 2, market.y + market.h / 2);
        ctx.lineTo(f.x + f.w / 2, f.y + f.h / 2);
    }
    if (bank) {
        ctx.moveTo(market.x + market.w / 2, market.y + market.h / 2);
        ctx.lineTo(bank.x + bank.w / 2, bank.y + bank.h / 2);
    }
    for (const h of homes) {
        ctx.moveTo(market.x + market.w / 2, market.y + market.h / 2);
        ctx.lineTo(h.x + h.w / 2, h.y + h.h / 2);
    }
    ctx.stroke();

    ctx.strokeStyle = '#c9b78d';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 8]);
    ctx.beginPath();
    for (const f of factories) {
        ctx.moveTo(market.x + market.w / 2, market.y + market.h / 2);
        ctx.lineTo(f.x + f.w / 2, f.y + f.h / 2);
    }
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawDecorations(ctx: CanvasRenderingContext2D) {
    const trees = [
        [40, 80], [120, 200], [40, 360], [60, 690],
        [400, 160], [380, 700], [700, 70], [1140, 290],
        [1130, 580], [950, 700], [320, 220], [880, 130],
    ];
    for (const [x, y] of trees) {
        ctx.save();
        ctx.fillStyle = '#1f5a3a';
        ctx.shadowColor = 'rgba(0,0,0,0.18)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 3;
        ctx.beginPath();
        ctx.arc(x, y, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#2d7a4e';
        ctx.beginPath();
        ctx.arc(x - 5, y - 3, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function drawBuilding(
    ctx: CanvasRenderingContext2D,
    b: Building,
    phase: string,
    stages: ProductionStage[],
    dayPhase: DayPhase
) {
    let scale = 1;
    if (b.type === 'factory' && b.stageId !== undefined) {
        const laborers = stages[b.stageId]?.laborers ?? 0;
        scale = 0.7 + Math.min(0.55, laborers / 22);
        if (phase === 'bust' && b.stageId >= 3) scale *= 0.78;
    } else if (b.type === 'market') {
        const totalOutput = stages.reduce((s, st) => s + st.output, 0);
        scale = 0.85 + Math.min(0.35, totalOutput / 1800);
    } else if (b.type === 'bank') {
        scale = 0.9 + Math.min(0.3, stages[0]?.price ? (stages[0].price - 1) * 0.4 : 0);
    }

    const w = b.w * scale;
    const h = b.h * scale;
    const x = b.x + (b.w - w) / 2;
    const y = b.y + (b.h - h) / 2;

    ctx.save();
    ctx.shadowColor = 'rgba(15,23,42,0.22)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 5;
    ctx.fillStyle = 'rgba(15,23,42,0.18)';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h + 3, w / 2 + 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    const wallTop = y + h * 0.32;
    ctx.fillStyle = b.color;
    roundRect(ctx, x, wallTop, w, h * 0.68, 6);
    ctx.fill();

    ctx.fillStyle = b.accent;
    ctx.beginPath();
    ctx.moveTo(x - 6, wallTop + 2);
    ctx.lineTo(x + w / 2, y);
    ctx.lineTo(x + w + 6, wallTop + 2);
    ctx.closePath();
    ctx.fill();

    if (b.type === 'home') {
        const windowSize = w * 0.18;
        const wy = wallTop + h * 0.18;
        const litLevel = windowLit(dayPhase);
        ctx.fillStyle = litLevel > 0 ? `rgba(253, 224, 71, ${litLevel})` : 'rgba(15,23,42,0.45)';
        roundRect(ctx, x + w * 0.22, wy, windowSize, windowSize, 2);
        ctx.fill();
        roundRect(ctx, x + w * 0.6, wy, windowSize, windowSize, 2);
        ctx.fill();
        ctx.fillStyle = b.accent;
        roundRect(ctx, x + w * 0.42, wallTop + h * 0.4, w * 0.18, h * 0.28, 2);
        ctx.fill();
    } else if (b.type === 'factory') {
        const rows = scale > 1.1 ? 3 : 2;
        const cols = 3;
        const winW = (w - 16) / cols / 2;
        const winH = h * 0.13;
        const litLevel = windowLit(dayPhase);
        const litColor = litLevel > 0 ? `rgba(253, 224, 71, ${litLevel * 0.85})` : 'rgba(20,30,50,0.6)';
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const wx = x + 10 + c * ((w - 20) / cols) + winW * 0.25;
                const wy = wallTop + 10 + r * (winH + 6);
                if (wy + winH > y + h - 4) continue;
                ctx.fillStyle = litColor;
                roundRect(ctx, wx, wy, winW, winH, 1.5);
                ctx.fill();
            }
        }
        if (b.hasChimney) {
            ctx.fillStyle = b.accent;
            ctx.fillRect(x + w * 0.74, y - 14, 10, 18);
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(x + w * 0.74 - 1, y - 16, 12, 4);
        }
    } else if (b.type === 'market') {
        ctx.fillStyle = '#fde68a';
        ctx.beginPath();
        ctx.arc(x + w / 2, wallTop - 6, w * 0.42, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#a16207';
        ctx.fillRect(x + w * 0.42, wallTop + h * 0.34, w * 0.16, h * 0.34);
        const litLevel = windowLit(dayPhase) * 0.8;
        ctx.fillStyle = litLevel > 0 ? `rgba(253, 224, 71, ${litLevel})` : 'rgba(15,23,42,0.45)';
        for (let i = 0; i < 3; i++) {
            roundRect(ctx, x + w * (0.16 + i * 0.27), wallTop + h * 0.18, w * 0.12, w * 0.12, 2);
            ctx.fill();
        }
    } else if (b.type === 'bank') {
        const litLevel = windowLit(dayPhase);
        ctx.fillStyle = '#e9d5ff';
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(x + 10 + i * (w / 4 - 4), wallTop + 4, 6, h * 0.6);
        }
        ctx.fillStyle = litLevel > 0 ? `rgba(253, 224, 71, ${litLevel * 0.7})` : 'rgba(15,23,42,0.45)';
        roundRect(ctx, x + w * 0.42, wallTop + h * 0.36, w * 0.16, h * 0.3, 2);
        ctx.fill();
    }
    ctx.restore();

    if (b.label) {
        ctx.fillStyle = dayPhase === 'night' ? '#f1f5f9' : '#0f172a';
        ctx.strokeStyle = dayPhase === 'night' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)';
        ctx.lineWidth = 3;
        ctx.font = 'bold 13px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.strokeText(b.label, b.x + b.w / 2, b.y + b.h + 18);
        ctx.fillText(b.label, b.x + b.w / 2, b.y + b.h + 18);
    }
}

function windowLit(dayPhase: DayPhase): number {
    if (dayPhase === 'night') return 0.95;
    if (dayPhase === 'evening') return 0.6;
    if (dayPhase === 'morning') return 0.2;
    return 0;
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
    for (const p of particles) {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawAgent(
    ctx: CanvasRenderingContext2D,
    a: AnimatedAgent,
    hovered: boolean,
    dayPhase: DayPhase
) {
    const bobOffset = Math.sin(a.bob) * 1.3;
    const ax = a.x;
    const ay = a.y + bobOffset;
    const r = hovered ? 11 : 8;

    ctx.save();
    ctx.fillStyle = 'rgba(15,23,42,0.28)';
    ctx.beginPath();
    ctx.ellipse(ax, a.y + 8, r * 0.9, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = a.color;
    ctx.shadowColor = 'rgba(15,23,42,0.35)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;
    ctx.beginPath();
    ctx.arc(ax, ay, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.arc(ax - r * 0.35, ay - r * 0.35, r * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const ring = moodRing(a.mood);
    if (ring) {
        ctx.strokeStyle = ring;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(ax, ay, r + 3, 0, Math.PI * 2);
        ctx.stroke();
    }
    if (hovered) {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(ax, ay, r + 5, 0, Math.PI * 2);
        ctx.stroke();
    }

    if (dayPhase === 'night') {
        ctx.fillStyle = 'rgba(253, 224, 71, 0.25)';
        ctx.beginPath();
        ctx.arc(ax, ay, r + 8, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawDayOverlay(ctx: CanvasRenderingContext2D, dayPhase: DayPhase, timeOfDay: number) {
    if (dayPhase === 'night') {
        ctx.fillStyle = 'rgba(15, 32, 55, 0.35)';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    } else if (dayPhase === 'evening') {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.08)';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }

    const barW = 80;
    const barH = 6;
    const barX = CANVAS_W - barW - 16;
    const barY = 16;
    ctx.fillStyle = 'rgba(15,23,42,0.15)';
    roundRect(ctx, barX, barY, barW, barH, 3);
    ctx.fill();
    ctx.fillStyle = '#6366f1';
    const progress = timeOfDay / DAY_LENGTH;
    roundRect(ctx, barX, barY, barW * progress, barH, 3);
    ctx.fill();
}

function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function darken(hex: string, amount: number): string {
    const n = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, ((n >> 16) & 0xff) - amount);
    const g = Math.max(0, ((n >> 8) & 0xff) - amount);
    const b = Math.max(0, (n & 0xff) - amount);
    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}
