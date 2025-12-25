export interface QuestConfig {
    id: string;
    philosopherId: string;
    title: string;
    path: string;
}

export const QUEST_REGISTRY: Record<string, QuestConfig> = {
    'sokrates': {
        id: 'socratic-method',
        philosopherId: 'sokrates',
        title: 'Den Uutforskede Hulen',
        path: '/content/krle/filosofi/quests/socratic_dialogue.json'
    },
    'platon': {
        id: 'cave-allegory',
        philosopherId: 'platon',
        title: 'Skygger på Veggen',
        path: '/content/krle/filosofi/quests/platon.json'
    },
    // Placeholders for future implementation - visible in registry but file checks need to handle 404s gracefully
    'aristoteles': {
        id: 'golden-mean',
        philosopherId: 'aristoteles',
        title: 'Den Gylne Middelvei',
        path: '/content/krle/filosofi/quests/aristoteles.json'
    },
    'augustin': {
        id: 'time-mystery',
        philosopherId: 'augustin',
        title: 'Tidens Mysterium',
        path: '/content/krle/filosofi/quests/augustin.json'
    },
    'aquinas': {
        id: 'faith-reason',
        philosopherId: 'aquinas',
        title: 'Fornuftens Stige',
        path: '/content/krle/filosofi/quests/aquinas.json'
    },
    'descartes': {
        id: 'radical-doubt',
        philosopherId: 'descartes',
        title: 'Drøm eller Virkelighet?',
        path: '/content/krle/filosofi/quests/descartes.json'
    },
    'locke': {
        id: 'property-rights',
        philosopherId: 'locke',
        title: 'Hvem Eier Deg?',
        path: '/content/krle/filosofi/quests/locke.json'
    },
    'hume': {
        id: 'cause-effect',
        philosopherId: 'hume',
        title: 'Solen Går Ned',
        path: '/content/krle/filosofi/quests/hume.json'
    },
    'kant': {
        id: 'categorical-imperative',
        philosopherId: 'kant',
        title: 'Pliktens Kall',
        path: '/content/krle/filosofi/quests/kant.json'
    },
    'kierkegaard': {
        id: 'leap-faith',
        philosopherId: 'kierkegaard',
        title: 'Spranget',
        path: '/content/krle/filosofi/quests/kierkegaard.json'
    },
    'nietzsche': {
        id: 'uber-mensch',
        philosopherId: 'nietzsche',
        title: 'Gud er Død',
        path: '/content/krle/filosofi/quests/nietzsche.json'
    },
    'heidegger': {
        id: 'dasein',
        philosopherId: 'heidegger',
        title: 'Væren og Tiden',
        path: '/content/krle/filosofi/quests/heidegger.json'
    },
    'arendt': {
        id: 'banality-evil',
        philosopherId: 'arendt',
        title: 'Ondskapens Banalitet',
        path: '/content/krle/filosofi/quests/arendt.json'
    },
    'beauvoir': {
        id: 'second-sex',
        philosopherId: 'beauvoir',
        title: 'Det Annet Kjønn',
        path: '/content/krle/filosofi/quests/beauvoir.json'
    },
    'mises': {
        id: 'human-action',
        philosopherId: 'mises',
        title: 'Det Handlende Menneske',
        path: '/content/krle/filosofi/quests/mises.json'
    },
    'rothbard': {
        id: 'anatomy-state',
        philosopherId: 'rothbard',
        title: 'Statens Anatomi',
        path: '/content/krle/filosofi/quests/rothbard.json'
    }
};
