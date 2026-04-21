import type { DialogNode } from '../engine/types';

// Dialog-noder for Fords Fabrikk. Dialog-valg kobles dynamisk i FordFactoryAssets.ts
// (setFlag, setPhase, animateReveal, triggerEnd).
//
// Greeting-noden (sorensen_greeting) overskrives dynamisk i Assets.ts basert på
// gjeldende fase - her definerer vi bare resten av dialog-treet.
export const fordFactoryDialogs: Record<string, DialogNode> = {
    // ───── Intro-kjede (fase: intro) ─────
    // sorensen_greeting settes til introDialog i Assets.ts. Herfra går det til problem → idea.
    sorensen_problem: {
        speaker: 'Charles Sorensen',
        text: 'Én mann bygger hele bilen. Han henter chassis. Han monterer motor. Han skrur på hjul. Han slår på karosseriet. Alt alene. Mens han henter nye deler, står de andre og venter.',
        choices: [
            { text: 'Hva om hver mann gjør bare én ting?', next: 'sorensen_idea' },
            { text: 'Kan vi ikke bare ansette flere?', next: 'sorensen_more_men' },
        ],
    },
    sorensen_more_men: {
        speaker: 'Charles Sorensen',
        text: 'Flere menn løser ingenting hvis alle gjør det samme saktelig. Nei. Vi må endre hvordan arbeidet flyter. Hva om hver mann gjør bare én ting?',
        choices: [
            { text: 'Fortell videre.', next: 'sorensen_idea' },
        ],
    },
    sorensen_idea: {
        speaker: 'Charles Sorensen',
        text: 'Et samlebånd. Chassis glir forbi. En mann monterer motoren. Neste mann skrur på hjulene. Hver mann blir ekspert på én håndvending. Skal vi prøve?',
        choices: [
            { text: 'Ja. La oss bygge det.', next: null },
        ],
    },

    // ───── Plassering (fase: placing) ─────
    // Spilleren får feilmelding hvis chassis ikke plasseres først.
    sorensen_wrong_order: {
        speaker: 'Charles Sorensen',
        text: 'Nei, herr Ford. Vi trenger chassis først. Uten ramme har vi ingenting å feste resten på.',
        choices: [
            { text: 'Du har rett. La oss starte der.', next: null },
        ],
    },

    // ───── 1914 (fase: year_1914) ─────
    sorensen_why_tired: {
        speaker: 'Charles Sorensen',
        text: 'Samme bevegelse tusen ganger om dagen. Samme bolt. Samme håndledd. De blir en del av maskinen. Noe må endres.',
        choices: [
            { text: 'Hva foreslår du?', next: 'sorensen_five_dollar' },
        ],
    },
    sorensen_five_dollar: {
        speaker: 'Charles Sorensen',
        text: 'Doble lønnen. Fem dollar dagen - dobbelt av bransjen. Da blir de. Og kanskje kan de til og med kjøpe bilene de bygger.',
        choices: [
            { text: 'Vi gjør det. Fem dollar dagen.', next: null },
        ],
    },
};
