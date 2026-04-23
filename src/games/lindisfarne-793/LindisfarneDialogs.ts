import type { DialogNode } from '../engine/types';

// Alle NPC-dialoger i Lindisfarne 793. Actions (setFlag, setPhase, triggerEnd) kobles
// på i LindisfarneAssets.ts siden de krever engine-referansen.
export const lindisfarneDialogs: Record<string, DialogNode> = {
    // ───── Broder Eadfrith (møtes i biblioteket) ─────
    eadfrith_intercept: {
        speaker: 'Broder Eadfrith',
        text: 'Sett deg ned, gutt. Ta det du vil ha. Men la denne boken være.',
        cameraFraming: 'speaker',
        emotion: 'worried',
        choices: [
            { text: 'Hva er det som er så viktig med den?', icon: '?', consequenceHint: 'Hør ham forklare', next: 'eadfrith_explain' },
            { text: 'Flytt deg.', icon: '⚔', consequenceHint: 'Tving avgjørelsen', next: 'eadfrith_choice' },
        ],
    },
    eadfrith_explain: {
        speaker: 'Broder Eadfrith',
        text: 'Jeg har brukt tolv år på disse sidene. Hvert kors er tegnet med hånda. Hver bokstav er en bønn. Hvis du tar den, tar du tolv år av mitt liv. Hvis du brenner den, brenner du alt jeg er.',
        cameraFraming: 'speaker',
        emotion: 'worried',
        choices: [
            { text: 'Og hva bryr jeg meg om det?', icon: '⚔', next: 'eadfrith_challenge' },
            { text: '...', icon: '·', next: 'eadfrith_plea' },
        ],
    },
    eadfrith_challenge: {
        speaker: 'Broder Eadfrith',
        text: 'Kanskje ingenting. Men en dag sitter du i et rom som dette, og noen kommer inn. Da håper du at de bryr seg.',
        cameraFraming: 'speaker',
        choices: [{ text: '...', next: 'eadfrith_plea' }],
    },
    eadfrith_plea: {
        speaker: 'Broder Eadfrith',
        text: 'Du kan drepe meg. Jeg står her. Men la boken få leve. Jeg ber deg.',
        cameraFraming: 'speaker',
        emotion: 'worried',
        choices: [
            { text: 'Behold den. Gå.', icon: '✋', consequenceHint: 'Boken blir bevart', next: 'eadfrith_response_spared' },
            { text: 'Flytt deg, gamle mann.', icon: '⚔', consequenceHint: 'Boken og munken faller', next: 'eadfrith_response_killed' },
        ],
    },
    eadfrith_choice: {
        speaker: 'Broder Eadfrith',
        text: 'Du må velge, gutt. Jeg kan ikke flytte meg. Ikke for denne boken.',
        choices: [
            { text: 'Behold den. Gå.', next: 'eadfrith_response_spared' },
            { text: 'Da er det over.', next: 'eadfrith_response_killed' },
        ],
    },

    eadfrith_response_spared: {
        speaker: 'Broder Eadfrith',
        text: 'Takk. Ta dette. Det hang rundt halsen på en fisker som døde i fjor - et enkelt kors. Ikke verdt noe. Men han var snill. Kanskje du husker ham.',
        choices: [{ text: '...', next: null }],
    },
    eadfrith_response_killed: {
        speaker: 'Broder Eadfrith',
        text: 'Så ta den da. Ta den.',
        choices: [{ text: '...', next: null }],
    },
};
