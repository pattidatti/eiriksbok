import type { DialogNode } from '../engine/types';

// Alle NPC-dialoger i Lindisfarne 793. Actions (setFlag, setPhase, triggerEnd) kobles
// på i LindisfarneAssets.ts siden de krever engine-referansen.
export const lindisfarneDialogs: Record<string, DialogNode> = {
    // ───── Høvding Sigurd (sittende bakerst i båten) ─────
    sigurd_greeting: {
        speaker: 'Høvding Sigurd',
        text: 'Du har ikke sovet i natt, Torstein. Første gang på tokt?',
        choices: [
            { text: 'Ja. Jeg har ventet lenge på dette.', next: 'chief_first' },
            { text: 'Jeg får ikke ro. For mye i hodet.', next: 'chief_restless' },
        ],
    },
    chief_first: {
        speaker: 'Høvding Sigurd',
        text: 'Du skal få noe å fortelle om. Øya vi nærmer oss heter Lindisfarne. De har et kloster der. Gull i veggene, sølv i krusene. Og ingen vakter.',
        choices: [
            { text: 'Ingen vakter?', next: 'chief_guards' },
            { text: 'Hvordan vet vi alt dette?', next: 'chief_intel' },
        ],
    },
    chief_restless: {
        speaker: 'Høvding Sigurd',
        text: 'Godt. Roligheten er farlig. De som sover best på første tokt, er dem jeg helst ikke har med neste gang. Hold deg nær Ulv når vi er i land. Han er grei.',
        choices: [{ text: 'Jeg skal det.', next: null }],
    },
    chief_guards: {
        speaker: 'Høvding Sigurd',
        text: 'De har bare munker. De ber til en mann som døde på et kors. De tror han passer på dem. Vi skal se hvor godt han gjør jobben sin.',
        choices: [{ text: 'Jeg forstår.', next: null }],
    },
    chief_intel: {
        speaker: 'Høvding Sigurd',
        text: 'En handelsmann fra York har fortalt. Stedet er rikt, øya er lav, og sjøen går helt opp på stranda ved flo. Vi lander, tar det vi kan, og er tilbake på havet før solnedgang.',
        choices: [{ text: 'Ok.', next: null }],
    },

    // Sigurd - landgangs-trigger (vises når alle er snakket med)
    chief_land: {
        speaker: 'Høvding Sigurd',
        text: 'Se. Øya ligger rett fremfor oss. Rull opp seilet. Vi er fremme. Gå i land.',
        choices: [{ text: 'Jeg går.', next: null }],
    },

    // ───── Eldre kriger (veteran) - sitter midt i båten ─────
    veteran_greeting: {
        speaker: 'Den eldre',
        text: 'Se på deg. Grønne øyne, rene hender. Ikke noe arr ennå.',
        choices: [
            { text: 'Hvorfor er du med på dette?', next: 'veteran_why' },
            { text: 'Du har vært med før?', next: 'veteran_before' },
        ],
    },
    veteran_why: {
        speaker: 'Den eldre',
        text: 'Jeg var med i Friesland. Jeg var med i Irland. Jeg er med nå fordi jeg ikke kan annet. Noen av oss blir holdt fast av det vi har gjort før.',
        choices: [{ text: '...', next: 'veteran_warning' }],
    },
    veteran_before: {
        speaker: 'Den eldre',
        text: 'For mange ganger. Og det blir ikke lettere, gutt. Folk tror det blir lettere. Det blir bare vanligere.',
        choices: [{ text: '...', next: 'veteran_warning' }],
    },
    veteran_warning: {
        speaker: 'Den eldre',
        text: 'Jeg skal si deg noe. Det du gjør der inne i dag - det er ditt. Ikke Sigurds. Ikke mitt. Husk det.',
        choices: [{ text: 'Jeg husker det.', next: null }],
    },

    // ───── Ulv (jevnaldrende) - sitter fremme i båten ─────
    ulv_greeting: {
        speaker: 'Ulv',
        text: 'Torstein! Hørte du? Sigurd sier de har gullbeger. Ekte gull. Har du noen gang sett ekte gull?',
        choices: [
            { text: 'Aldri. Har du?', next: 'peer_never' },
            { text: 'Rolig nå, Ulv.', next: 'peer_calm' },
        ],
    },
    peer_never: {
        speaker: 'Ulv',
        text: 'Nei! Men nå får vi det. Tenk deg hva de der hjemme kommer til å si. Ryktet reiser raskere enn oss tilbake.',
        choices: [{ text: 'Ja, kanskje.', next: 'peer_plan' }],
    },
    peer_calm: {
        speaker: 'Ulv',
        text: 'Rolig? Vi har seilt i to dager for dette! Du er vel ikke redd nå?',
        choices: [
            { text: 'Ikke redd. Bare - forsiktig.', next: 'peer_plan' },
            { text: 'Litt, ja.', next: 'peer_plan' },
        ],
    },
    peer_plan: {
        speaker: 'Ulv',
        text: 'Vi holder sammen. Hører du meg? Du og jeg. Inn først, ut sist, mest gull. Lov det.',
        choices: [
            { text: 'Jeg lover.', next: null },
            { text: 'Vi får se.', next: null },
        ],
    },

    // ───── Broder Eadfrith (møtes i biblioteket) ─────
    eadfrith_intercept: {
        speaker: 'Broder Eadfrith',
        text: 'Sett deg ned, gutt. Ta det du vil ha. Men la denne boken være.',
        choices: [
            { text: 'Hva er det som er så viktig med den?', next: 'eadfrith_explain' },
            { text: 'Flytt deg.', next: 'eadfrith_choice' },
        ],
    },
    eadfrith_explain: {
        speaker: 'Broder Eadfrith',
        text: 'Jeg har brukt tolv år på disse sidene. Hvert kors er tegnet med hånda. Hver bokstav er en bønn. Hvis du tar den, tar du tolv år av mitt liv. Hvis du brenner den, brenner du alt jeg er.',
        choices: [
            { text: 'Og hva bryr jeg meg om det?', next: 'eadfrith_challenge' },
            { text: '...', next: 'eadfrith_plea' },
        ],
    },
    eadfrith_challenge: {
        speaker: 'Broder Eadfrith',
        text: 'Kanskje ingenting. Men en dag sitter du i et rom som dette, og noen kommer inn. Da håper du at de bryr seg.',
        choices: [{ text: '...', next: 'eadfrith_plea' }],
    },
    eadfrith_plea: {
        speaker: 'Broder Eadfrith',
        text: 'Du kan drepe meg. Jeg står her. Men la boken få leve. Jeg ber deg.',
        choices: [
            { text: 'Behold den. Gå.', next: 'eadfrith_response_spared' },
            { text: 'Flytt deg, gamle mann.', next: 'eadfrith_response_killed' },
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
