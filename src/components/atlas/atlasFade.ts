import { yearToX } from '../../utils/timelineLayout';

// "Akkumuler + fade": alt som har skjedd fram til valgt år blir liggende, men eldre
// hendelser dempes mens nåtid lyser opp. Vi måler alder i PIKSLER langs tidslinje-
// layouten (yearToX), ikke i år — slik føles "nylig" like langt i forhistorien (der
// 1000 år er et blunk) som i vår tid (der 10 år er mye). FADE_PX er hvor langt unna
// i den layouten en hendelse fortsatt regnes som "fersk".
export const FADE_PX = 360;

// Akkumulerte hendelser forsvinner aldri helt — de synker til dette gulvet.
export const FLOOR_OPACITY = 0.14;

// Hvor langt FORAN nåtidssveipen (i piksler) en hendelse vises svakt som "på vei".
// Gir eleven kontekst om hva som nærmer seg uten å avsløre alt på en gang.
export const LOOKAHEAD_PX = 140;

export interface Recency {
    visible: boolean; // har hendelsen skjedd innen valgt år?
    recency: number; // 1 = akkurat nå, 0 = falmet til gulvet
    opacity: number; // FLOOR_OPACITY..1
}

// recency for en hendelse gitt nåværende år. evX/curX er forhåndsberegnet av kalleren
// for ytelse (yearToX er ikke gratis å kalle per hendelse per frame).
export function recencyAt(evX: number, curX: number): Recency {
    if (evX > curX + 1) return { visible: false, recency: 0, opacity: 0 };
    const r = Math.max(0, 1 - (curX - evX) / FADE_PX);
    return { visible: true, recency: r, opacity: FLOOR_OPACITY + (1 - FLOOR_OPACITY) * r };
}

export interface Upcoming {
    upcoming: boolean; // er hendelsen rett foran sveipen (innen LOOKAHEAD_PX)?
    nearness: number; // 1 = nesten her, 0 = ytterkant av lookahead-vinduet
}

// Hendelser som ennå ikke har skjedd, men er nær i tid, vises svakt. evX/curX er
// forhåndsberegnet av kalleren (jf. recencyAt).
export function upcomingAt(evX: number, curX: number): Upcoming {
    if (evX <= curX || evX > curX + LOOKAHEAD_PX) return { upcoming: false, nearness: 0 };
    return { upcoming: true, nearness: 1 - (evX - curX) / LOOKAHEAD_PX };
}

export const xForYear = yearToX;
