import type { DetectiveThemeId } from './types';

export interface DetectiveTheme {
    /** Bakgrunnsfarge på case-skall (mørk). */
    bg: string;
    /** Sekundær overflate (kortbakgrunn). */
    surface: string;
    /** Aksentfarge for highlights, knapper, focus. */
    accent: string;
    /** Farge brukt på samlede bevis. */
    evidence: string;
    /** Farge brukt på advarsel / kildekritikk-tab. */
    warning: string;
    /** Tekstfarge på "Originalfragment" når tema vil signalisere alder. */
    paperBg: string;
    paperText: string;
    paperBorder: string;
    /** Klassen brukt på Original-tekst (font-family + style). */
    paperFontClass: string;
    /** Et lite navn vist diskret i header. */
    eraLabel: string;
}

export const DETECTIVE_THEMES: Record<DetectiveThemeId, DetectiveTheme> = {
    'medieval-cold': {
        bg: '#0c1219',
        surface: '#141c28',
        accent: '#7dd3fc',
        evidence: '#a7f3d0',
        warning: '#fcd34d',
        paperBg: '#ede4cf',
        paperText: '#3d2f1f',
        paperBorder: '#a08864',
        paperFontClass: 'font-serif italic',
        eraLabel: 'Middelalder · kald arkivsone',
    },
    'viking-sea': {
        bg: '#0a1820',
        surface: '#13242e',
        accent: '#fbbf24',
        evidence: '#86efac',
        warning: '#fb7185',
        paperBg: '#e8dcc0',
        paperText: '#2d1f0f',
        paperBorder: '#8b6b3a',
        paperFontClass: 'font-serif',
        eraLabel: 'Vikingtid · seilende arkiv',
    },
    enlightenment: {
        bg: '#1a1410',
        surface: '#2a2018',
        accent: '#f59e0b',
        evidence: '#bef264',
        warning: '#f87171',
        paperBg: '#f5ecd6',
        paperText: '#2d1810',
        paperBorder: '#8b6b3a',
        paperFontClass: 'font-serif',
        eraLabel: 'Tidlig moderne · opplysningens skygge',
    },
    'cold-war': {
        bg: '#0a0e12',
        surface: '#15191f',
        accent: '#22d3ee',
        evidence: '#34d399',
        warning: '#fb7185',
        paperBg: '#1f2937',
        paperText: '#e5e7eb',
        paperBorder: '#dc2626',
        paperFontClass: 'font-mono',
        eraLabel: 'Kalde krigen · deklassifisert',
    },
    'modern-investigation': {
        bg: '#0a0c10',
        surface: '#161a22',
        accent: '#a78bfa',
        evidence: '#86efac',
        warning: '#fbbf24',
        paperBg: '#f3f4f6',
        paperText: '#111827',
        paperBorder: '#6b7280',
        paperFontClass: 'font-mono',
        eraLabel: 'Moderne tid · åpen sak',
    },
    antiquity: {
        bg: '#180f0a',
        surface: '#241712',
        accent: '#fbbf24',
        evidence: '#a3e635',
        warning: '#f87171',
        paperBg: '#ede0c5',
        paperText: '#3d2818',
        paperBorder: '#a08550',
        paperFontClass: 'font-serif',
        eraLabel: 'Oldtid · papyrus-arkiv',
    },
};

export const DEFAULT_THEME: DetectiveThemeId = 'modern-investigation';

export function getTheme(id?: DetectiveThemeId): DetectiveTheme {
    return DETECTIVE_THEMES[id ?? DEFAULT_THEME] ?? DETECTIVE_THEMES[DEFAULT_THEME];
}

/** Produserer inline CSS-variabler en root-div kan bruke. */
export function themeStyleVars(theme: DetectiveTheme): React.CSSProperties {
    return {
        ['--det-bg' as string]: theme.bg,
        ['--det-surface' as string]: theme.surface,
        ['--det-accent' as string]: theme.accent,
        ['--det-evidence' as string]: theme.evidence,
        ['--det-warning' as string]: theme.warning,
        ['--det-paper-bg' as string]: theme.paperBg,
        ['--det-paper-text' as string]: theme.paperText,
        ['--det-paper-border' as string]: theme.paperBorder,
    };
}
