import type { MonologNode } from '../engine/types';

// ─── Stiklestad 1030 - indre monologer / fortellerstemme ─────────────────────
// Ikke-blokkerende tekst som setter stemning og binder fasene sammen. Bokmål,
// korte setninger, én tanke per linje.

export const stiklestadMonologs: Record<string, MonologNode> = {
    vaakner: {
        id: 'vaakner',
        lines: [
            'Det lukter våt jord og bålrøyk.',
            'Leiren ligger stille i den lyse julinatten.',
            'I morgen, 29. juli, møtes kongens menn og bondehæren her ved Stiklestad.',
            'Jeg er bare vannbæreren. Men i dag skal jeg se alt.',
        ],
        once: true,
    },
    til_trening: {
        id: 'til_trening',
        lines: [
            'Tormod ba meg lære å kaste før det blir alvor.',
            'Hold inne for å sikte, slipp for å kaste.',
        ],
        once: true,
    },
    trening_ferdig: {
        id: 'trening_ferdig',
        lines: [
            'Armen verker, men spydet sitter der jeg vil ha det.',
            'Nå senker kvelden seg over leiren.',
        ],
        once: true,
    },
    kvelden: {
        id: 'kvelden',
        lines: [
            'Tre bål brenner i mørket.',
            'Ved hvert av dem sitter en mann med sin egen grunn til å være her.',
            'Snakk med dem før natten er over.',
        ],
        once: true,
    },
    til_ryggen: {
        id: 'til_ryggen',
        lines: [
            'Morgenen kommer grå og kald.',
            'Kongen samler hæren oppe på ryggen.',
            'Gå nordover, opp til skjoldborgen.',
        ],
        once: true,
    },
    slaget_start: {
        id: 'slaget_start',
        lines: [
            'Bondehæren velter frem nedenfra som en grå flod.',
            'Skjoldene smeller mot hverandre.',
            'Kast mot dem som bryter gjennom. Hold linjen.',
        ],
        once: true,
    },
    skjoldborg_brister: {
        id: 'skjoldborg_brister',
        lines: [
            'Skjoldborgen rakner. Menn faller på begge sider.',
            'Det er ikke ære her. Bare stål og skrik og søle.',
        ],
        once: true,
    },
    olav_faller: {
        id: 'olav_faller',
        lines: [
            'Tre øksehugg, og kongen synker i kne.',
            'Olav Haraldsson faller ved Stiklestad.',
            'Bondehæren roper seier. Men Tormod står stille og ser.',
        ],
        once: true,
    },
    etterspill: {
        id: 'etterspill',
        lines: [
            'Et år er gått. Dalen er stille igjen.',
            'En pilegrim kneler der kongen falt. De sier syke blir friske her.',
            'Folk hvisker at Olav var hellig.',
            'I Nidaros reises en kirke over graven hans. Olav den hellige blir Norges evige konge.',
            'Han tapte slaget. Men troen han kjempet for, vant landet.',
        ],
        once: true,
    },
};
