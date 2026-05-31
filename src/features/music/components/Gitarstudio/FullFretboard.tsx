import { useMemo } from 'react';
import {
    STANDARD_TUNING_LOW_TO_HIGH,
    mapScaleToFretboard,
    getChordPitchClasses,
    getAllFretsForPitchClass,
    type ScaleFretPosition,
} from '../../theory/fretboardMapping';
import { getScalePitchClasses, intervalToDegree, type ScaleFamily } from '../../theory/scaleEngine';
import { CHORD_QUALITIES, NOTES_SHARP } from '../../utils/musicTheory';

export type ToneLabel = 'note' | 'degree';

interface FullFretboardProps {
    rootNote: string;
    scaleFamily: ScaleFamily;
    activeChord: { root: string; quality: string } | null;
    toneLabel: ToneLabel;
    pulseTick: number;
    onNoteClick?: (pos: ScaleFretPosition) => void;
    fretCount: number;
    handedness: 'right' | 'left';
    heightStyle: string;
    highlightRoot: boolean;
    highlightChord: boolean;
}

const STRING_COUNT = STANDARD_TUNING_LOW_TO_HIGH.length;
const FRET_MARKER_SINGLE = new Set([3, 5, 7, 9, 15, 17, 19, 21]);
const FRET_MARKER_DOUBLE = new Set([12]);

const NUT_WIDTH = 10;
const FRET_LINE_WIDTH = 2;

export function FullFretboard({
    rootNote,
    scaleFamily,
    activeChord,
    toneLabel,
    pulseTick,
    onNoteClick,
    fretCount,
    handedness,
    heightStyle,
    highlightRoot,
    highlightChord,
}: FullFretboardProps) {
    const scalePitchClasses = useMemo(
        () => getScalePitchClasses(rootNote, scaleFamily),
        [rootNote, scaleFamily]
    );

    const chordPitchClasses = useMemo(() => {
        if (!activeChord) return new Set<number>();
        const quality = activeChord.quality as keyof typeof CHORD_QUALITIES;
        const intervals = CHORD_QUALITIES[quality]?.intervals ?? CHORD_QUALITIES.Major.intervals;
        return getChordPitchClasses(activeChord.root, intervals);
    }, [activeChord]);

    const activeChordRootPC = useMemo(() => {
        if (!activeChord) return null;
        const idx = NOTES_SHARP.indexOf(activeChord.root);
        return idx >= 0 ? idx : null;
    }, [activeChord]);

    const outOfScaleRootPositions = useMemo(() => {
        if (activeChordRootPC === null || !highlightRoot) return [];
        const scalePCSet = new Set(scalePitchClasses.map((p) => p.pitchClass));
        if (scalePCSet.has(activeChordRootPC)) return [];
        return getAllFretsForPitchClass(activeChordRootPC, fretCount).map((p) => ({
            ...p,
            pitchClass: activeChordRootPC,
            note: NOTES_SHARP[activeChordRootPC],
        }));
    }, [activeChordRootPC, highlightRoot, scalePitchClasses, fretCount]);

    const positions = useMemo(
        () => mapScaleToFretboard(scalePitchClasses, chordPitchClasses).filter((p) => p.fret <= fretCount),
        [scalePitchClasses, chordPitchClasses, fretCount]
    );

    const positionMap = useMemo(() => {
        const map = new Map<string, ScaleFretPosition>();
        positions.forEach((p) => map.set(`${p.stringIndex}-${p.fret}`, p));
        return map;
    }, [positions]);

    const { fretFlex, fretFlexFor0 } = useMemo(() => {
        const flexes: number[] = [];
        for (let f = 1; f <= fretCount; f++) {
            flexes.push(1 / Math.pow(2, (f - 1) / 24));
        }
        return { fretFlex: flexes, fretFlexFor0: 0.5 };
    }, [fretCount]);

    const flipClass = handedness === 'left' ? 'scale-x-[-1]' : '';
    const noteFlipClass = handedness === 'left' ? 'scale-x-[-1]' : '';

    return (
        <div className="w-full h-full flex flex-col items-stretch gap-3 max-w-[1500px] mx-auto px-2">
            <div className="flex-1 min-h-0 flex flex-col">
                <div className={flipClass}>
                    <FretNumberRow fretFlex={fretFlex} fretFlexFor0={fretFlexFor0} position="top" mirror={handedness === 'left'} />
                </div>
                <div className={flipClass} style={{ height: heightStyle }}>
                    <FretboardSurface
                        positionMap={positionMap}
                        fretFlex={fretFlex}
                        fretFlexFor0={fretFlexFor0}
                        toneLabel={toneLabel}
                        pulseTick={pulseTick}
                        onNoteClick={onNoteClick}
                        noteFlipClass={noteFlipClass}
                        highlightRoot={highlightRoot}
                        highlightChord={highlightChord}
                        activeChordRootPC={activeChordRootPC}
                        outOfScaleRootPositions={outOfScaleRootPositions}
                    />
                </div>
                <div className={flipClass}>
                    <FretNumberRow fretFlex={fretFlex} fretFlexFor0={fretFlexFor0} position="bottom" mirror={handedness === 'left'} />
                </div>
            </div>
            <Legend />
        </div>
    );
}

interface OutOfScalePosition {
    stringIndex: number;
    fret: number;
    midi: number;
    pitchClass: number;
    note: string;
}

interface FretboardSurfaceProps {
    positionMap: Map<string, ScaleFretPosition>;
    fretFlex: number[];
    fretFlexFor0: number;
    toneLabel: ToneLabel;
    pulseTick: number;
    onNoteClick?: (pos: ScaleFretPosition) => void;
    noteFlipClass: string;
    highlightRoot: boolean;
    highlightChord: boolean;
    activeChordRootPC: number | null;
    outOfScaleRootPositions: OutOfScalePosition[];
}

function FretboardSurface({
    positionMap,
    fretFlex,
    fretFlexFor0,
    toneLabel,
    pulseTick,
    onNoteClick,
    noteFlipClass,
    highlightRoot,
    highlightChord,
    activeChordRootPC,
    outOfScaleRootPositions,
}: FretboardSurfaceProps) {
    const outOfScaleMap = useMemo(() => {
        const m = new Map<string, OutOfScalePosition>();
        outOfScaleRootPositions.forEach((p) => m.set(`${p.stringIndex}-${p.fret}`, p));
        return m;
    }, [outOfScaleRootPositions]);
    const totalFlex = fretFlexFor0 + fretFlex.reduce((a, b) => a + b, 0);
    const nutLeftPercent = (fretFlexFor0 / totalFlex) * 100;

    return (
        <div
            className="relative w-full h-full rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] border-2 border-amber-950 overflow-hidden"
            style={{
                background:
                    'linear-gradient(180deg, #8b5a2b 0%, #6b3f1a 50%, #5a3414 100%)',
            }}
        >
            <div
                className="absolute inset-0 pointer-events-none opacity-15 mix-blend-overlay"
                style={{
                    backgroundImage:
                        'repeating-linear-gradient(180deg, rgba(0,0,0,0.4) 0 1px, transparent 1px 5px), repeating-linear-gradient(180deg, rgba(255,255,255,0.05) 0 2px, transparent 2px 7px)',
                }}
            />

            <div className="absolute inset-0 flex flex-row">
                <div
                    className="relative h-full bg-amber-900/30 border-r-2 border-amber-950/60"
                    style={{ flex: `${fretFlexFor0} ${fretFlexFor0} 0` }}
                />
                {fretFlex.map((flex, i) => {
                    const fret = i + 1;
                    const isMarkerSingle = FRET_MARKER_SINGLE.has(fret);
                    const isMarkerDouble = FRET_MARKER_DOUBLE.has(fret);
                    return (
                        <div
                            key={fret}
                            className="relative h-full border-r border-slate-200/70"
                            style={{
                                flex: `${flex} ${flex} 0`,
                                borderRightWidth: `${FRET_LINE_WIDTH}px`,
                                boxShadow: 'inset -1px 0 0 rgba(0,0,0,0.3)',
                            }}
                        >
                            {isMarkerSingle && (
                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-amber-100/25" />
                            )}
                            {isMarkerDouble && (
                                <>
                                    <div className="absolute left-1/2 top-[27%] -translate-x-1/2 -translate-y-1/2 w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-amber-100/35" />
                                    <div className="absolute left-1/2 top-[73%] -translate-x-1/2 -translate-y-1/2 w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-amber-100/35" />
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            <div
                className="absolute top-0 bottom-0 bg-gradient-to-r from-slate-100 via-white to-slate-400 shadow-[3px_0_8px_rgba(0,0,0,0.3)] z-10"
                style={{
                    width: `${NUT_WIDTH}px`,
                    left: `${nutLeftPercent}%`,
                    transform: `translateX(-${NUT_WIDTH / 2}px)`,
                }}
            />

            <div className="absolute inset-0 flex flex-col">
                {Array.from({ length: STRING_COUNT }).map((_, displayIndex) => {
                    const stringIndex = STRING_COUNT - 1 - displayIndex;
                    const thickness = 1 + (5 - stringIndex) * 0.6;
                    return (
                        <div key={stringIndex} className="relative flex-1 flex items-center">
                            <div
                                className="absolute left-0 right-0 bg-gradient-to-b from-slate-50 via-slate-200 to-slate-500 shadow-[0_2px_3px_rgba(0,0,0,0.6)] pointer-events-none"
                                style={{ height: `${thickness}px` }}
                            />
                            <div className="relative w-full h-full flex">
                                <div
                                    className="relative h-full"
                                    style={{ flex: `${fretFlexFor0} ${fretFlexFor0} 0` }}
                                >
                                    <NoteAtFret
                                        positionMap={positionMap}
                                        stringIndex={stringIndex}
                                        fret={0}
                                        toneLabel={toneLabel}
                                        pulseTick={pulseTick}
                                        onClick={onNoteClick}
                                        noteFlipClass={noteFlipClass}
                                        highlightRoot={highlightRoot}
                                        highlightChord={highlightChord}
                                        activeChordRootPC={activeChordRootPC}
                                        outOfScale={outOfScaleMap.get(`${stringIndex}-0`) ?? null}
                                    />
                                </div>
                                {fretFlex.map((flex, i) => {
                                    const fret = i + 1;
                                    return (
                                        <div
                                            key={fret}
                                            className="relative h-full"
                                            style={{ flex: `${flex} ${flex} 0` }}
                                        >
                                            <NoteAtFret
                                                positionMap={positionMap}
                                                stringIndex={stringIndex}
                                                fret={fret}
                                                toneLabel={toneLabel}
                                                pulseTick={pulseTick}
                                                onClick={onNoteClick}
                                                noteFlipClass={noteFlipClass}
                                                highlightRoot={highlightRoot}
                                                highlightChord={highlightChord}
                                                activeChordRootPC={activeChordRootPC}
                                                outOfScale={outOfScaleMap.get(`${stringIndex}-${fret}`) ?? null}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

interface NoteAtFretProps {
    positionMap: Map<string, ScaleFretPosition>;
    stringIndex: number;
    fret: number;
    toneLabel: ToneLabel;
    pulseTick: number;
    onClick?: (pos: ScaleFretPosition) => void;
    noteFlipClass: string;
    highlightRoot: boolean;
    highlightChord: boolean;
    activeChordRootPC: number | null;
    outOfScale: OutOfScalePosition | null;
}

function NoteAtFret({
    positionMap,
    stringIndex,
    fret,
    toneLabel,
    pulseTick,
    onClick,
    noteFlipClass,
    highlightRoot,
    highlightChord,
    activeChordRootPC,
    outOfScale,
}: NoteAtFretProps) {
    const pos = positionMap.get(`${stringIndex}-${fret}`);

    if (!pos && outOfScale) {
        const fakePos: ScaleFretPosition = {
            stringIndex: outOfScale.stringIndex,
            fret: outOfScale.fret,
            pitchClass: outOfScale.pitchClass,
            note: outOfScale.note,
            midi: outOfScale.midi,
            interval: 0,
            isRoot: false,
            isChordTone: false,
        };
        return (
            <button
                type="button"
                onClick={() => onClick?.(fakePos)}
                className="absolute inset-0 flex items-center justify-center group focus:outline-none z-20"
            >
                <div className={noteFlipClass}>
                    <OutOfScaleDot label={outOfScale.note} pulseTick={pulseTick} highlight={highlightRoot} />
                </div>
            </button>
        );
    }

    if (!pos) return null;

    return (
        <button
            type="button"
            onClick={() => onClick?.(pos)}
            className="absolute inset-0 flex items-center justify-center group focus:outline-none z-20"
        >
            <div className={noteFlipClass}>
                <NoteDot
                    pos={pos}
                    toneLabel={toneLabel}
                    pulseTick={pulseTick}
                    highlightRoot={highlightRoot}
                    highlightChord={highlightChord}
                    activeChordRootPC={activeChordRootPC}
                />
            </div>
        </button>
    );
}

function OutOfScaleDot({ label, pulseTick, highlight }: { label: string; pulseTick: number; highlight: boolean }) {
    const pulseStyle = highlight
        ? {
            transform: pulseTick % 2 === 0 ? 'scale(1.15)' : 'scale(1)',
            transition: 'transform 90ms ease-out',
        }
        : undefined;
    return (
        <div
            className="w-7 h-7 lg:w-8 lg:h-8 rounded-full ring-2 ring-rose-300 bg-transparent border-2 border-dashed border-rose-400 flex items-center justify-center text-[11px] font-extrabold text-rose-500 shadow-[0_3px_6px_rgba(244,63,94,0.3)] group-hover:scale-125 transition-transform"
            style={pulseStyle}
        >
            {label}
        </div>
    );
}

interface NoteDotProps {
    pos: ScaleFretPosition;
    toneLabel: ToneLabel;
    pulseTick: number;
    highlightRoot: boolean;
    highlightChord: boolean;
    activeChordRootPC: number | null;
}

function NoteDot({ pos, toneLabel, pulseTick, highlightRoot, highlightChord, activeChordRootPC }: NoteDotProps) {
    const label = toneLabel === 'note' ? pos.note : intervalToDegree(pos.interval);

    const isActiveChordRoot = activeChordRootPC !== null && pos.pitchClass === activeChordRootPC;
    const isRootHighlighted = isActiveChordRoot && highlightRoot;
    const isChordHighlighted = pos.isChordTone && !isActiveChordRoot && highlightChord;

    let colorClass: string;
    if (isRootHighlighted) {
        colorClass = 'bg-rose-500 text-white ring-rose-200';
    } else if (isChordHighlighted) {
        colorClass = 'bg-amber-300 text-amber-950 ring-amber-100';
    } else {
        colorClass = 'bg-white text-slate-700 ring-slate-200';
    }

    const shouldPulse = isRootHighlighted || isChordHighlighted;
    const pulseStyle = shouldPulse
        ? {
            transform: pulseTick % 2 === 0 ? 'scale(1.15)' : 'scale(1)',
            transition: 'transform 90ms ease-out',
        }
        : undefined;

    return (
        <div
            className={`w-7 h-7 lg:w-8 lg:h-8 rounded-full ring-2 shadow-[0_3px_6px_rgba(0,0,0,0.45)] flex items-center justify-center text-[11px] font-extrabold ${colorClass} group-hover:scale-125 group-active:scale-95 group-focus-visible:ring-4 group-focus-visible:ring-sky-400 transition-transform`}
            style={pulseStyle}
        >
            {label}
        </div>
    );
}

interface FretNumberRowProps {
    fretFlex: number[];
    fretFlexFor0: number;
    position: 'top' | 'bottom';
    mirror: boolean;
}

function FretNumberRow({ fretFlex, fretFlexFor0, position, mirror }: FretNumberRowProps) {
    const padding = position === 'top' ? 'pb-1.5' : 'pt-1.5';
    return (
        <div className={`flex items-stretch select-none ${padding}`}>
            <div
                className={`text-center text-sm text-slate-400 font-bold ${mirror ? 'scale-x-[-1]' : ''}`}
                style={{ flex: `${fretFlexFor0} ${fretFlexFor0} 0` }}
            >
                {position === 'top' ? '' : '0'}
            </div>
            {fretFlex.map((flex, i) => {
                const fret = i + 1;
                const isMarker = FRET_MARKER_SINGLE.has(fret) || FRET_MARKER_DOUBLE.has(fret);
                return (
                    <div
                        key={fret}
                        className={`text-center font-bold tabular-nums ${mirror ? 'scale-x-[-1]' : ''} ${
                            isMarker
                                ? 'text-base lg:text-lg text-slate-800'
                                : 'text-sm text-slate-400'
                        }`}
                        style={{ flex: `${flex} ${flex} 0` }}
                    >
                        {fret}
                    </div>
                );
            })}
        </div>
    );
}

function Legend() {
    return (
        <div className="flex items-center justify-center gap-6 px-4 py-2 bg-white/85 backdrop-blur-sm border border-slate-200 rounded-xl text-sm text-slate-700 shadow-sm">
            <LegendItem color="bg-rose-500" border="ring-rose-200" label="Grunntone" />
            <LegendItem color="bg-amber-300" border="ring-amber-100" label="Akkord-toner" pulse />
            <LegendItem color="bg-white" border="ring-slate-300" label="Skala-toner" />
            <span className="text-slate-400 italic hidden md:inline ml-2">
                Klikk en tone for å høre den
            </span>
        </div>
    );
}

function LegendItem({
    color,
    border,
    label,
    pulse,
}: {
    color: string;
    border: string;
    label: string;
    pulse?: boolean;
}) {
    return (
        <div className="flex items-center gap-2">
            <span
                className={`inline-block w-4 h-4 rounded-full ring-2 ${color} ${border} ${pulse ? 'animate-pulse' : ''}`}
            />
            <span className="font-semibold">{label}</span>
        </div>
    );
}
