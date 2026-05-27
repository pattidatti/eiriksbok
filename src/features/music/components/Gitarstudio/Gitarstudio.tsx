import { useCallback, useEffect, useRef, useState } from 'react';
import { StudioCommandBar } from './StudioHeader';
import { ProgressionPanel } from './ProgressionBuilder';
import { Transport } from './Transport';
import { FullFretboard } from './FullFretboard';
import { SettingsPanel } from './SettingsPanel';
import { SCALES } from '../../theory/scaleEngine';
import { GENRES, type Genre } from '../../audio/genrePresets';
import { useBackingTrack } from '../../hooks/useBackingTrack';
import { previewNote, setStemMute } from '../../audio/backingTrackEngine';
import {
    useGitarstudioSettings,
    FRETBOARD_SIZE_HEIGHTS,
} from '../../hooks/useGitarstudioSettings';
import {
    PROGRESSION_PATTERNS,
    transposePattern,
    type PresetChord,
} from '../../theory/progressionPresets';

const INITIAL_CHORDS: PresetChord[] = [
    { root: 'A', quality: 'Minor' },
    { root: 'F', quality: 'Major' },
    { root: 'C', quality: 'Major' },
    { root: 'G', quality: 'Major' },
];

function deriveKeyMode(chord: PresetChord | undefined): 'Major' | 'Minor' {
    if (!chord) return 'Minor';
    const isMinor = chord.quality === 'Minor' || chord.quality === 'Min7' || chord.quality === 'Dim';
    return isMinor ? 'Minor' : 'Major';
}

export function Gitarstudio() {
    const { settings, update, reset } = useGitarstudioSettings();
    const [chords, setChords] = useState<PresetChord[]>(INITIAL_CHORDS);
    const [keyMode, setKeyMode] = useState<'Major' | 'Minor'>(() => deriveKeyMode(INITIAL_CHORDS[0]));
    const [saveOpen, setSaveOpen] = useState(false);
    const [loadOpen, setLoadOpen] = useState(false);
    const [stemMutes, setStemMutes] = useState({ drums: false, bass: false, comp: false });

    const { isPlaying, activeChordIndex, pulseTick, play, stop, restart } = useBackingTrack({
        chords,
        bpm: settings.bpm,
        genre: settings.genre,
    });

    const activeChord = activeChordIndex >= 0 ? chords[activeChordIndex] : chords[0] ?? null;

    const isPlayingRef = useRef(isPlaying);
    const restartRef = useRef(restart);
    const playRef = useRef(play);
    const stopRef = useRef(stop);

    useEffect(() => {
        isPlayingRef.current = isPlaying;
        restartRef.current = restart;
        playRef.current = play;
        stopRef.current = stop;
    });

    useEffect(() => {
        if (isPlayingRef.current) {
            restartRef.current();
        }
    }, [chords, settings.genre]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            const isFormElement =
                target.tagName === 'INPUT' ||
                target.tagName === 'SELECT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable;
            if (isFormElement) return;

            if (e.code === 'Space') {
                e.preventDefault();
                if (isPlayingRef.current) stopRef.current();
                else playRef.current();
            } else if (e.code === 'ArrowLeft' && e.shiftKey) {
                e.preventDefault();
                update('bpm', Math.max(40, settings.bpm - 5));
            } else if (e.code === 'ArrowRight' && e.shiftKey) {
                e.preventDefault();
                update('bpm', Math.min(240, settings.bpm + 5));
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [settings.bpm, update]);

    const handleAddChord = (chord: PresetChord) => {
        setChords((prev) => [...prev, chord]);
    };

    const handleRemove = (index: number) => {
        setChords((prev) => prev.filter((_, i) => i !== index));
    };

    const handleClear = () => setChords([]);

    const handleLoadProgression = (
        loaded: PresetChord[],
        suggestedRoot?: string,
        suggestedMode?: 'Major' | 'Minor'
    ) => {
        setChords(loaded);
        if (suggestedRoot) {
            update('rootNote', suggestedRoot);
        } else if (loaded.length > 0) {
            update('rootNote', loaded[0].root);
        }
        if (suggestedMode) {
            setKeyMode(suggestedMode);
            update('scaleFamily', suggestedMode === 'Minor' ? 'pentatonic-minor' : 'pentatonic-major');
        }
    };

    const handleGenreChange = (g: Genre) => {
        update('genre', g);
        if (!isPlaying) {
            update('bpm', GENRES[g].defaultBpm);
        }
    };

    const handleToggleStem = useCallback((stem: 'drums' | 'bass' | 'comp') => {
        setStemMutes((prev) => {
            const next = { ...prev, [stem]: !prev[stem] };
            setStemMute(stem, next[stem]);
            return next;
        });
    }, []);

    const handleRandomProgression = () => {
        const pool = PROGRESSION_PATTERNS.filter(
            (p) =>
                p.keyType === 'any' ||
                (keyMode === 'Major' ? p.keyType === 'major' : p.keyType === 'minor')
        );
        const pick = pool[Math.floor(Math.random() * pool.length)];
        handleLoadProgression(transposePattern(pick.pattern, settings.rootNote), settings.rootNote, keyMode);
    };

    return (
        <div className="h-[calc(100vh-64px)] w-full bg-gradient-to-br from-slate-100 via-slate-50 to-rose-50/30 flex flex-col overflow-hidden p-3 gap-2">
            <StudioCommandBar
                rootNote={settings.rootNote}
                scaleFamily={settings.scaleFamily}
                genre={settings.genre}
                isPlaying={isPlaying}
                toneLabel={settings.toneLabel}
                onRootChange={(v) => update('rootNote', v)}
                onScaleChange={(v) => update('scaleFamily', v)}
                onGenreChange={handleGenreChange}
                onToneLabelChange={(v) => update('toneLabel', v)}
                rightSlot={
                    <SettingsPanel
                        fretboardSize={settings.fretboardSize}
                        fretCount={settings.fretCount}
                        handedness={settings.handedness}
                        highlightRoot={settings.highlightRoot}
                        highlightChord={settings.highlightChord}
                        onFretboardSizeChange={(s) => update('fretboardSize', s)}
                        onFretCountChange={(c) => update('fretCount', c)}
                        onHandednessChange={(h) => update('handedness', h)}
                        onHighlightRootChange={(v) => update('highlightRoot', v)}
                        onHighlightChordChange={(v) => update('highlightChord', v)}
                        onReset={reset}
                    />
                }
            />

            <ProgressionPanel
                chords={chords}
                activeIndex={isPlaying ? activeChordIndex : -1}
                onRemove={handleRemove}
                onClear={handleClear}
                rootNote={settings.rootNote}
                keyMode={keyMode}
                onKeyModeChange={setKeyMode}
                onAddChord={handleAddChord}
                onLoadProgression={handleLoadProgression}
                onRandomProgression={handleRandomProgression}
                saveDialogOpen={saveOpen}
                loadDialogOpen={loadOpen}
                onOpenSave={() => setSaveOpen(true)}
                onOpenLoad={() => setLoadOpen(true)}
                currentChords={chords}
                currentGenre={settings.genre}
                onCloseSave={() => setSaveOpen(false)}
                onCloseLoad={() => setLoadOpen(false)}
            />

            <div className="flex-1 min-h-0 relative">
                <FullFretboard
                    rootNote={settings.rootNote}
                    scaleFamily={settings.scaleFamily}
                    activeChord={activeChord}
                    toneLabel={settings.toneLabel}
                    pulseTick={pulseTick}
                    onNoteClick={(pos) => previewNote(pos.midi)}
                    fretCount={settings.fretCount}
                    handedness={settings.handedness}
                    heightStyle={FRETBOARD_SIZE_HEIGHTS[settings.fretboardSize]}
                    highlightRoot={settings.highlightRoot}
                    highlightChord={settings.highlightChord}
                />
                <div className="absolute top-2 right-3 text-[11px] text-slate-500 italic pointer-events-none">
                    {SCALES[settings.scaleFamily].description}
                </div>
            </div>

            <Transport
                isPlaying={isPlaying}
                bpm={settings.bpm}
                onPlay={play}
                onStop={stop}
                onBpmChange={(v) => update('bpm', v)}
                canPlay={chords.length > 0}
                stemMutes={stemMutes}
                onToggleStem={handleToggleStem}
            />
        </div>
    );
}
