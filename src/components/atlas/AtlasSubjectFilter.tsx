import { SUBJECT_COLOR, SUBJECT_LABEL, SUBJECT_ORDER } from './atlasSubjects';

interface Props {
    // Fag som faktisk finnes i datasettet (de andre skjules).
    available: string[];
    // Hvilke fag som er på akkurat nå.
    active: Set<string>;
    onToggle: (subjectId: string) => void;
}

// Liten rad med toggle-chips øverst-venstre på kartet. Lar eleven skru fag av/på.
// Aktiv chip = fylt fagfarge, inaktiv = utgrået. Speiler glass-stilen ellers i atlaset.
export function AtlasSubjectFilter({ available, active, onToggle }: Props) {
    const subjects = SUBJECT_ORDER.filter((id) => available.includes(id));
    if (subjects.length < 2) return null;

    return (
        <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-1.5 max-w-[60vw]">
            {subjects.map((id) => {
                const color = SUBJECT_COLOR[id] || '#64748b';
                const on = active.has(id);
                return (
                    <button
                        key={id}
                        onClick={() => onToggle(id)}
                        title={on ? `Skjul ${SUBJECT_LABEL[id]}` : `Vis ${SUBJECT_LABEL[id]}`}
                        aria-pressed={on}
                        className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-semibold shadow-sm border transition-colors"
                        style={
                            on
                                ? { background: color, borderColor: color, color: '#fff' }
                                : {
                                      background: 'rgba(255,255,255,0.9)',
                                      borderColor: '#e2e8f0',
                                      color: '#94a3b8',
                                  }
                        }
                    >
                        <span
                            className="w-2 h-2 rounded-full"
                            style={{ background: on ? '#fff' : color, opacity: on ? 0.9 : 0.5 }}
                        />
                        {SUBJECT_LABEL[id] || id}
                    </button>
                );
            })}
        </div>
    );
}
