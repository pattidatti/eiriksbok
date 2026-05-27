import type { EpochTheme } from '../../../types';

// Innebygde epoke-tema. Stier kan referere disse via `epochThemeId`
// eller overstyre med eget `epochTheme`-objekt.
export const EPOCH_THEMES: Record<string, EpochTheme> = {
    roman: {
        id: 'roman',
        primary: '#7b2d3a',      // dyp aubergine-rød (rik patrisiertoga)
        accent: '#c9882e',       // ravgul (keisermosaikk-gull)
        paper: '#f6efe2',        // bleket marmor
        ink: '#1f1a17',          // svart blekk
        bannerLabel: 'SPQR',
    },
    viking: {
        id: 'viking',
        primary: '#1f4a5c',      // jernblå
        accent: '#a1672a',       // bronse
        paper: '#eee7d8',        // ubehandlet tre
        ink: '#1a1a1a',
        bannerLabel: 'Vikingtiden',
    },
    enlightenment: {
        id: 'enlightenment',
        primary: '#7a4a25',      // kobber
        accent: '#1c1c1c',       // svart blekk
        paper: '#f3ead9',        // krem-pergament
        ink: '#241809',
        bannerLabel: 'Opplysningstiden',
    },
};

// Resolve tema basert på data — tar `epochTheme`-objekt direkte hvis satt,
// ellers prøver å matche subject/topic til en kjent epoke.
export function resolveEpochTheme(
    explicit?: EpochTheme,
    subjectId?: string,
    topicId?: string
): EpochTheme | undefined {
    if (explicit) return explicit;
    if (subjectId === 'historie' && topicId === 'romerriket') return EPOCH_THEMES.roman;
    if (subjectId === 'historie' && topicId === 'vikingtiden') return EPOCH_THEMES.viking;
    if (subjectId === 'historie' && topicId === 'opplysningstiden') return EPOCH_THEMES.enlightenment;
    return undefined;
}

// Konverter EpochTheme til CSS-variabler som settes på en wrapper-div.
// Brukes via `style={epochThemeCssVars(theme)}` på root-elementet.
export function epochThemeCssVars(theme?: EpochTheme): React.CSSProperties {
    if (!theme) return {};
    return {
        ['--epoch-primary' as never]: theme.primary,
        ['--epoch-accent' as never]: theme.accent,
        ['--epoch-paper' as never]: theme.paper,
        ['--epoch-ink' as never]: theme.ink,
    };
}
