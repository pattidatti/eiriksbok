import { useEffect, useRef } from 'react';
import { Renderer, Stave, StaveNote, Voice, Formatter, Beam, Dot, Barline } from 'vexflow';
import type { RhythmEvent, RhythmPattern } from '../../lib/rhythmTypes';

const NOTE_DURATION_MAP: Record<string, string> = {
    '2n': 'h',
    '4n': 'q',
    '4n.': 'qd',
    '8n': '8',
    '8n.': '8d',
    '16n': '16',
    '2r': 'hr',
    '4r': 'qr',
    '8r': '8r',
};

interface Props {
    pattern: RhythmPattern;
    width?: number;
    height?: number;
}

function eventToVexNote(event: RhythmEvent): StaveNote {
    const baseDur = NOTE_DURATION_MAP[event.value] ?? 'q';
    const isDotted = baseDur.endsWith('d');
    const isRest = event.kind === 'rest' || baseDur.endsWith('r');
    const cleaned = baseDur.replace('d', '');
    const finalDur = isRest && !cleaned.endsWith('r') ? `${cleaned}r` : cleaned;

    const note = new StaveNote({
        keys: isRest ? ['b/4'] : ['b/4'],
        duration: finalDur,
    });
    if (isDotted) Dot.buildAndAttach([note], { all: true });
    return note;
}

function buildBars(pattern: RhythmPattern): RhythmEvent[][] {
    const beatsPerBar = pattern.timeSignature[0];
    const bars: RhythmEvent[][] = Array.from({ length: pattern.bars }, () => []);
    pattern.events.forEach((e) => {
        const barIndex = Math.min(Math.floor(e.beat / beatsPerBar), pattern.bars - 1);
        bars[barIndex].push(e);
    });
    return bars;
}

export function VexFlowRenderer({ pattern, width = 800, height = 160 }: Props) {
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        container.innerHTML = '';

        const renderer = new Renderer(container, Renderer.Backends.SVG);
        renderer.resize(width, height);
        const context = renderer.getContext();
        context.setFont('Arial', 12);

        const beatsPerBar = pattern.timeSignature[0];
        const beatValue = pattern.timeSignature[1];
        const bars = buildBars(pattern);
        const barWidth = (width - 60) / pattern.bars;

        bars.forEach((barEvents, idx) => {
            const x = 20 + idx * barWidth;
            const stave = new Stave(x, 30, barWidth);
            stave.setNumLines(1);
            if (idx === 0) {
                stave.addTimeSignature(`${beatsPerBar}/${beatValue}`);
            }
            if (idx === pattern.bars - 1) {
                stave.setEndBarType(Barline.type.END);
            }
            stave.setContext(context).draw();

            if (barEvents.length === 0) return;

            const notes = barEvents.map(eventToVexNote);

            const beamableNotes = notes.filter((n) => {
                const dur = n.getDuration();
                return dur === '8' || dur === '16';
            });
            const beams = beamableNotes.length >= 2 ? Beam.generateBeams(notes) : [];

            const voice = new Voice({
                numBeats: beatsPerBar,
                beatValue,
            }).setStrict(false);
            voice.addTickables(notes);

            new Formatter().joinVoices([voice]).format([voice], barWidth - 30);
            voice.draw(context, stave);
            beams.forEach((beam) => beam.setContext(context).draw());
        });
    }, [pattern, width, height]);

    return (
        <div
            ref={containerRef}
            className="rhythm-notation flex justify-center w-full overflow-x-auto"
            aria-label="Rytmenotasjon"
        />
    );
}
