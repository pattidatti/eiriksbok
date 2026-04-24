import type { MonologNode, MonologTrigger } from '../engine/types';

// Monologer er indre tanker som Cotta (spilleren) har mens han beveger seg.
// Brukes til å forsterke pedagogiske poenger uten å låse spilleren i dialog.

export const caesarIdesMonologs: Record<string, MonologNode> = {
    arrival_thought: {
        id: 'arrival_thought',
        lines: [
            'Idus Martiae. Gata er stille på en måte jeg ikke liker.',
            'Alle kjente gikk forbi meg uten å hilse. Noe er i gjære.',
            'Senatet møtes i Pompey-teateret i dag, siden Curia brant.',
        ],
        once: true,
    },
    calpurnia_window: {
        id: 'calpurnia_window',
        lines: [
            'Et vindu står åpent. Det må være huset til Cæsar.',
            'Calpurnia, hans kone, drømte at hun holdt ham blodig i fanget i natt.',
            'Hun ba ham bli hjemme. Han kommer likevel.',
        ],
        once: true,
    },
    senate_approach: {
        id: 'senate_approach',
        lines: [
            'Senatet ligger foran meg. Søyler i marmor, benker i halvsirkel.',
            'Bak alt troner Pompeys statue. Mannen Cæsar beseiret.',
            'En gudenes vits, tenkte jeg engang. Nå føles det som et varsel.',
        ],
        once: true,
    },
    letter_kept_reflection: {
        id: 'letter_kept_reflection',
        lines: [
            'Jeg beholdt brevet. Kanskje visste jeg alt.',
            'Kanskje var det ikke mitt å stoppe det som måtte skje.',
        ],
        once: true,
    },
    letter_given_reflection: {
        id: 'letter_given_reflection',
        lines: [
            'Jeg la brevet i hans hånd. Han leste det aldri.',
            'Du kunne ha ropt høyere, men historien hadde sin egen vekt.',
        ],
        once: true,
    },
    assassination_witness: {
        id: 'assassination_witness',
        lines: [
            'Først Casca, bak ham. Så alle.',
            'Cæsar kjemper imot. Til han ser Brutus med kniv i hånden.',
            'Da slutter han å kjempe. "Et tu, Brute?" hvisker han.',
            'Han faller ved Pompeys fot. Marmoren suger blodet.',
        ],
        once: true,
    },
    aftermath_thought: {
        id: 'aftermath_thought',
        lines: [
            'Brutus hever kniven og roper: "Sic semper tyrannis." Slik alltid mot tyranner.',
            'Men senatorene rømmer. Folk flykter ut på gata.',
            'Jeg vet ikke om vi har reddet republikken eller drept den.',
        ],
        once: true,
    },
};

// Proximity-triggers plasseres i Assets.ts via addMonolog (deklarativ API).
// Her eksporterer vi kun manuelle triggere og fase-triggere som motoren leser direkte.
export const caesarIdesMonologTriggers: MonologTrigger[] = [];
