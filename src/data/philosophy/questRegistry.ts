import type { Era } from './types';

export interface QuestConfig {
    id: string;
    philosopherId: string;
    title: string;
    description: string;
    path: string;
    era: Era;
    isSecondary?: boolean;
    prerequisites: string[];
}

export const QUEST_REGISTRY: Record<string, QuestConfig> = {
    // --- ANTIKKEN ---
    'sokrates': {
        id: 'socratic-method',
        philosopherId: 'sokrates',
        title: 'Den Uutforskede Hulen',
        description: 'Utforsk hva rettferdighet egentlig betyr med Sokrates pa agoraen.',
        path: '/content/krle/filosofi/quests/socratic_dialogue.json',
        era: 'antikken',
        prerequisites: []
    },
    'platon': {
        id: 'cave-allegory',
        philosopherId: 'platon',
        title: 'Skygger pa Veggen',
        description: 'Hva er virkelighet, og hva er bare skygger? Platon viser deg hulen.',
        path: '/content/krle/filosofi/quests/platon.json',
        era: 'antikken',
        prerequisites: ['socratic-method']
    },
    'aristoteles': {
        id: 'golden-mean',
        philosopherId: 'aristoteles',
        title: 'Den Gylne Middelvei',
        description: 'Utforsk Aristoteles sin lere om balanse og lykke.',
        path: '/content/krle/filosofi/quests/aristoteles.json',
        era: 'antikken',
        prerequisites: ['socratic-method']
    },

    // --- MIDDELALDER ---
    'augustin': {
        id: 'time-mystery',
        philosopherId: 'augustin',
        title: 'Tidens Mysterium',
        description: 'Augustin utfordrer deg til a tenke over hva tid egentlig er.',
        path: '/content/krle/filosofi/quests/augustin.json',
        era: 'middelalder',
        prerequisites: ['socratic-method']
    },
    'aquinas': {
        id: 'faith-reason',
        philosopherId: 'aquinas',
        title: 'Fornuftens Stige',
        description: 'Kan tro og fornuft samarbeide? Aquinas mener det.',
        path: '/content/krle/filosofi/quests/aquinas.json',
        era: 'middelalder',
        prerequisites: ['socratic-method']
    },

    // --- OPPLYSNINGSTIDEN ---
    'descartes': {
        id: 'radical-doubt',
        philosopherId: 'descartes',
        title: 'Drom eller Virkelighet?',
        description: 'Descartes tviler pa alt. Kan du bevise at du eksisterer?',
        path: '/content/krle/filosofi/quests/descartes.json',
        era: 'opplysning',
        prerequisites: ['socratic-method']
    },
    'locke': {
        id: 'property-rights',
        philosopherId: 'locke',
        title: 'Hvem Eier Deg?',
        description: 'Locke graver i sporsmalet om naturlige rettigheter og eiendom.',
        path: '/content/krle/filosofi/quests/locke.json',
        era: 'opplysning',
        prerequisites: ['socratic-method']
    },
    'hume': {
        id: 'cause-effect',
        philosopherId: 'hume',
        title: 'Solen Gar Ned',
        description: 'Hume utfordrer alt du tror om arsak og virkning.',
        path: '/content/krle/filosofi/quests/hume.json',
        era: 'opplysning',
        prerequisites: ['socratic-method']
    },
    'kant': {
        id: 'categorical-imperative',
        philosopherId: 'kant',
        title: 'Pliktens Kall',
        description: 'Kants kategoriske imperativ: Kan du finne en universell morallov?',
        path: '/content/krle/filosofi/quests/kant.json',
        era: 'opplysning',
        prerequisites: ['socratic-method']
    },

    // --- MODERNE ---
    'kierkegaard': {
        id: 'leap-faith',
        philosopherId: 'kierkegaard',
        title: 'Spranget',
        description: 'Kierkegaard stiller deg overfor eksistensens avgjorende valg.',
        path: '/content/krle/filosofi/quests/kierkegaard.json',
        era: 'moderne',
        prerequisites: ['socratic-method']
    },
    'nietzsche': {
        id: 'uber-mensch',
        philosopherId: 'nietzsche',
        title: 'Gud er Dod',
        description: 'Nietzsche ber deg skape nye verdier i en verden uten guder.',
        path: '/content/krle/filosofi/quests/nietzsche.json',
        era: 'moderne',
        prerequisites: ['socratic-method']
    },
    'heidegger': {
        id: 'dasein',
        philosopherId: 'heidegger',
        title: 'Veren og Tiden',
        description: 'Heidegger inviterer deg til a utforske hva det vil si a vere.',
        path: '/content/krle/filosofi/quests/heidegger.json',
        era: 'moderne',
        prerequisites: ['socratic-method']
    },
    'arendt': {
        id: 'banality-evil',
        philosopherId: 'arendt',
        title: 'Ondskapens Banalitet',
        description: 'Arendt viser at ondskap kan vere overraskende hverdagslig.',
        path: '/content/krle/filosofi/quests/arendt.json',
        era: 'moderne',
        prerequisites: ['socratic-method']
    },
    'beauvoir': {
        id: 'second-sex',
        philosopherId: 'beauvoir',
        title: 'Det Annet Kjonn',
        description: 'Beauvoir utforsker frihet, identitet og hva det vil si a vere menneske.',
        path: '/content/krle/filosofi/quests/beauvoir.json',
        era: 'moderne',
        prerequisites: ['socratic-method']
    },
    'mises': {
        id: 'human-action',
        philosopherId: 'mises',
        title: 'Det Handlende Menneske',
        description: 'Mises forklarer hvordan menneskelig handling former samfunnet.',
        path: '/content/krle/filosofi/quests/mises.json',
        era: 'moderne',
        prerequisites: ['socratic-method']
    },
    'rothbard': {
        id: 'anatomy-state',
        philosopherId: 'rothbard',
        title: 'Statens Anatomi',
        description: 'Rothbard stiller radikale sporsmal om statens rolle.',
        path: '/content/krle/filosofi/quests/rothbard.json',
        era: 'moderne',
        prerequisites: ['socratic-method']
    },

    // --- SEKUNDERE DIALOGER ---
    'sokrates_gadfly': {
        id: 'socratic-gadfly',
        philosopherId: 'sokrates',
        title: 'Kleggen i Aten',
        description: 'Sokrates som byens kritiske stemme. Nar er det rett a utfordre makten?',
        path: '/content/krle/filosofi/quests/sokrates_gadfly.json',
        era: 'antikken',
        isSecondary: true,
        prerequisites: ['socratic-method']
    },
    'platon_ring': {
        id: 'ring-of-gyges',
        philosopherId: 'platon',
        title: 'Gyges Ring',
        description: 'Hvis du var usynlig, ville du fortsatt handle rettferdig?',
        path: '/content/krle/filosofi/quests/platon_ring.json',
        era: 'antikken',
        isSecondary: true,
        prerequisites: ['cave-allegory']
    },
    'nietzsche_abyss': {
        id: 'nietzsche-abyss',
        philosopherId: 'nietzsche',
        title: 'Avgrunnen',
        description: 'Nietzsche utfordrer deg til a stirre inn i avgrunnen uten a blunke.',
        path: '/content/krle/filosofi/quests/nietzsche_abyss.json',
        era: 'moderne',
        isSecondary: true,
        prerequisites: ['uber-mensch']
    },
    'aristoteles_friendship': {
        id: 'aristoteles-friendship',
        philosopherId: 'aristoteles',
        title: 'Ekte Vennskap',
        description: 'Aristoteles utforsker hva som skiller ekte vennskap fra nytte og nytelse.',
        path: '/content/krle/filosofi/quests/aristoteles_friendship.json',
        era: 'antikken',
        isSecondary: true,
        prerequisites: ['golden-mean']
    },
    'descartes_dualism': {
        id: 'descartes-dualism',
        philosopherId: 'descartes',
        title: 'Spokelset i Maskinen',
        description: 'Er kropp og sjel to ulike ting? Descartes dualisme utfordrer deg.',
        path: '/content/krle/filosofi/quests/descartes_dualism.json',
        era: 'opplysning',
        isSecondary: true,
        prerequisites: ['radical-doubt']
    },
    'kant_enlightenment': {
        id: 'kant-enlightenment',
        philosopherId: 'kant',
        title: 'Vag a Vite!',
        description: 'Kant om opplysning: tor du tenke selv?',
        path: '/content/krle/filosofi/quests/kant_enlightenment.json',
        era: 'opplysning',
        isSecondary: true,
        prerequisites: ['categorical-imperative']
    }
};

export const LEVEL_TITLES: Record<number, string> = {
    1: 'Nysgjerrig',
    2: 'Utforsker',
    3: 'Tenker',
    4: 'Filosof',
    5: 'Vismann',
    6: 'Akademiker',
    7: 'Mester',
};

export function getLevelTitle(level: number): string {
    return LEVEL_TITLES[Math.min(level, 7)] || 'Mester';
}

export function getQuestsForPhilosopher(philosopherId: string): QuestConfig[] {
    return Object.values(QUEST_REGISTRY).filter(q => q.philosopherId === philosopherId);
}

export function findQuestConfig(idOrPhilosopherId: string): QuestConfig | undefined {
    return Object.values(QUEST_REGISTRY).find(
        (q) => q.id === idOrPhilosopherId || q.philosopherId === idOrPhilosopherId
    ) ?? QUEST_REGISTRY[idOrPhilosopherId];
}
