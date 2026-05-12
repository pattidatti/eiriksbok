export interface SubjectColor {
    label: string;
    dot: string;
    text: string;
    bg: string;
    bgSoft: string;
    border: string;
    ring: string;
    hex: string;
}

export const SUBJECT_COLORS: Record<string, SubjectColor> = {
    historie: {
        label: 'Historie',
        dot: 'bg-amber-500',
        text: 'text-amber-700',
        bg: 'bg-amber-500',
        bgSoft: 'bg-amber-50',
        border: 'border-amber-300',
        ring: 'ring-amber-200',
        hex: '#f59e0b',
    },
    norsk: {
        label: 'Norsk',
        dot: 'bg-rose-500',
        text: 'text-rose-700',
        bg: 'bg-rose-500',
        bgSoft: 'bg-rose-50',
        border: 'border-rose-300',
        ring: 'ring-rose-200',
        hex: '#f43f5e',
    },
    krle: {
        label: 'KRLE',
        dot: 'bg-emerald-500',
        text: 'text-emerald-700',
        bg: 'bg-emerald-500',
        bgSoft: 'bg-emerald-50',
        border: 'border-emerald-300',
        ring: 'ring-emerald-200',
        hex: '#10b981',
    },
    samfunnskunnskap: {
        label: 'Samfunnskunnskap',
        dot: 'bg-sky-500',
        text: 'text-sky-700',
        bg: 'bg-sky-500',
        bgSoft: 'bg-sky-50',
        border: 'border-sky-300',
        ring: 'ring-sky-200',
        hex: '#0ea5e9',
    },
    samfunnsfag: {
        label: 'Samfunnsfag',
        dot: 'bg-teal-500',
        text: 'text-teal-700',
        bg: 'bg-teal-500',
        bgSoft: 'bg-teal-50',
        border: 'border-teal-300',
        ring: 'ring-teal-200',
        hex: '#14b8a6',
    },
    musikk: {
        label: 'Musikk',
        dot: 'bg-violet-500',
        text: 'text-violet-700',
        bg: 'bg-violet-500',
        bgSoft: 'bg-violet-50',
        border: 'border-violet-300',
        ring: 'ring-violet-200',
        hex: '#8b5cf6',
    },
};

const FALLBACK: SubjectColor = {
    label: 'Annet',
    dot: 'bg-slate-500',
    text: 'text-slate-700',
    bg: 'bg-slate-500',
    bgSoft: 'bg-slate-50',
    border: 'border-slate-300',
    ring: 'ring-slate-200',
    hex: '#64748b',
};

export function getSubjectColor(subjectId: string | null | undefined): SubjectColor {
    if (!subjectId) return FALLBACK;
    return SUBJECT_COLORS[subjectId] ?? FALLBACK;
}

export function getSubjectLabel(subjectId: string | null | undefined): string {
    return getSubjectColor(subjectId).label;
}
