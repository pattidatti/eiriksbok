import type { Era } from './types';

export interface NetworkNode {
    id: string;
    name: string;
    period: string;
    era: Era;
    x: number;
    y: number;
    size: number;
    description: string;
    keyIdea: string;
    color: string;
}

export interface NetworkLink {
    source: string;
    target: string;
}

const ERA_COLORS: Record<Era, string> = {
    antikken: '#d97706',
    middelalder: '#059669',
    opplysning: '#2563eb',
    moderne: '#7c3aed',
};

export const PHILOSOPHY_NETWORK = {
    nodes: [
        {
            id: 'sokrates',
            name: 'Sokrates',
            period: 'Antikken',
            era: 'antikken' as Era,
            x: 50, y: 50, size: 24,
            description: 'Filosofiens far. Stilte sporsmal i stedet for a gi svar, og tvang folk til a tenke selv.',
            keyIdea: 'Dialogmetoden, "Kjenn deg selv"',
            color: ERA_COLORS.antikken,
        },
        {
            id: 'platon',
            name: 'Platon',
            period: 'Antikken',
            era: 'antikken' as Era,
            x: 40, y: 35, size: 20,
            description: 'Grunnla Akademiet i Aten. Mente at den sanne virkeligheten er en verden av perfekte ideer.',
            keyIdea: 'Ideleren, Huleliknelsen',
            color: ERA_COLORS.antikken,
        },
        {
            id: 'aristoteles',
            name: 'Aristoteles',
            period: 'Antikken',
            era: 'antikken' as Era,
            x: 60, y: 30, size: 22,
            description: 'Systematiserte all kunnskap. Mente lykke kommer fra a leve balansert og bruke fornuften.',
            keyIdea: 'Den gylne middelvei, Dydsetikk',
            color: ERA_COLORS.antikken,
        },
        {
            id: 'augustin',
            name: 'Augustin',
            period: 'Middelalder',
            era: 'middelalder' as Era,
            x: 30, y: 60, size: 16,
            description: 'Koblet kristen tro med gresk filosofi. Grubblet over tid, fri vilje og menneskets natur.',
            keyIdea: 'Guds stat, Bekjennelser',
            color: ERA_COLORS.middelalder,
        },
        {
            id: 'aquinas',
            name: 'Aquinas',
            period: 'Middelalder',
            era: 'middelalder' as Era,
            x: 70, y: 55, size: 18,
            description: 'Bygde bro mellom tro og fornuft. Mente at vi kan bevise Guds eksistens gjennom logikk.',
            keyIdea: 'Naturlig lov, Fem gudsbevis',
            color: ERA_COLORS.middelalder,
        },
        {
            id: 'descartes',
            name: 'Descartes',
            period: 'Opplysning',
            era: 'opplysning' as Era,
            x: 20, y: 20, size: 18,
            description: 'Tvilte pa alt for a finne noe sikkert. Konkluderte: "Jeg tenker, derfor er jeg."',
            keyIdea: 'Metodisk tvil, Cogito ergo sum',
            color: ERA_COLORS.opplysning,
        },
        {
            id: 'locke',
            name: 'John Locke',
            period: 'Opplysning',
            era: 'opplysning' as Era,
            x: 70, y: 25, size: 18,
            description: 'Mente vi fodsles som blanke ark. Forsvarte individets naturlige rettigheter.',
            keyIdea: 'Tabula rasa, Naturlige rettigheter',
            color: ERA_COLORS.opplysning,
        },
        {
            id: 'hume',
            name: 'Hume',
            period: 'Opplysning',
            era: 'opplysning' as Era,
            x: 80, y: 20, size: 18,
            description: 'Den ultimate skeptikeren. Viste at vi ikke kan bevise arsak og virkning logisk.',
            keyIdea: 'Induksjonsproblemet, Empirisme',
            color: ERA_COLORS.opplysning,
        },
        {
            id: 'kant',
            name: 'Kant',
            period: 'Opplysning',
            era: 'opplysning' as Era,
            x: 50, y: 15, size: 20,
            description: 'Forente fornuft og erfaring. Skapte universelle moralregler alle ma kunne folge.',
            keyIdea: 'Kategorisk imperativ, Kritikk av den rene fornuft',
            color: ERA_COLORS.opplysning,
        },
        {
            id: 'nietzsche',
            name: 'Nietzsche',
            period: 'Moderne',
            era: 'moderne' as Era,
            x: 85, y: 70, size: 18,
            description: 'Erklerte at "Gud er dod" og utfordret all tradisjonell moral. Bad oss skape egne verdier.',
            keyIdea: 'Vilje til makt, Overmennesket',
            color: ERA_COLORS.moderne,
        },
        {
            id: 'kierkegaard',
            name: 'Kierkegaard',
            period: 'Moderne',
            era: 'moderne' as Era,
            x: 15, y: 75, size: 16,
            description: 'Eksistensialismens far. Mente at livets viktigste valg ikke kan loses med logikk.',
            keyIdea: 'Troens sprang, Angst',
            color: ERA_COLORS.moderne,
        },
        {
            id: 'heidegger',
            name: 'Heidegger',
            period: 'Moderne',
            era: 'moderne' as Era,
            x: 25, y: 80, size: 18,
            description: 'Spurte hva det betyr a "vere". Mente at vi lever for mye pa overflaten.',
            keyIdea: 'Dasein, Veren og tid',
            color: ERA_COLORS.moderne,
        },
        {
            id: 'arendt',
            name: 'Hannah Arendt',
            period: 'Moderne',
            era: 'moderne' as Era,
            x: 35, y: 85, size: 16,
            description: 'Studerte ondskap og makt. Viste at selv vanlige folk kan gjore forferdelige ting.',
            keyIdea: 'Ondskapens banalitet, Politisk handling',
            color: ERA_COLORS.moderne,
        },
        {
            id: 'beauvoir',
            name: 'de Beauvoir',
            period: 'Moderne',
            era: 'moderne' as Era,
            x: 10, y: 85, size: 16,
            description: 'Viste at "kvinne" er en sosialt skapt rolle. Kjempet for likestilling gjennom filosofi.',
            keyIdea: '"Man fodsles ikke som kvinne", Frihet',
            color: ERA_COLORS.moderne,
        },
        {
            id: 'mises',
            name: 'Mises',
            period: 'Moderne',
            era: 'moderne' as Era,
            x: 75, y: 5, size: 16,
            description: 'Forsvarte frie markeder med filosofisk dybde. Mente okonomisk frihet er grunnleggende.',
            keyIdea: 'Prakseologi, Menneskelig handling',
            color: ERA_COLORS.moderne,
        },
        {
            id: 'rothbard',
            name: 'Rothbard',
            period: 'Moderne',
            era: 'moderne' as Era,
            x: 85, y: 5, size: 16,
            description: 'Tok Mises videre og utfordret statens rett til a styre. Radikal frihetstanke.',
            keyIdea: 'Naturrett, Frivillig samfunn',
            color: ERA_COLORS.moderne,
        }
    ] as NetworkNode[],
    links: [
        { source: 'sokrates', target: 'platon' },
        { source: 'platon', target: 'aristoteles' },
        { source: 'platon', target: 'augustin' },
        { source: 'aristoteles', target: 'aquinas' },
        { source: 'descartes', target: 'kant' },
        { source: 'locke', target: 'hume' },
        { source: 'hume', target: 'kant' },
        { source: 'kant', target: 'nietzsche' },
        { source: 'kant', target: 'kierkegaard' },
        { source: 'kant', target: 'mises' },
        { source: 'kierkegaard', target: 'heidegger' },
        { source: 'kierkegaard', target: 'beauvoir' },
        { source: 'heidegger', target: 'arendt' },
        { source: 'mises', target: 'rothbard' }
    ] as NetworkLink[]
};
