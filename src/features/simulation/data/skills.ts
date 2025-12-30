import type { SkillType } from '../simulationTypes';

export const SKILL_DETAILS: Record<SkillType, { label: string, description: string, xpSource: string, color: string, bonuses: Record<number, string> }> = {
    FARMING: {
        label: 'Jordbruk',
        description: 'Evnen til å dyrke jorden og høste korn.',
        xpSource: 'Høst korn på jordene eller arbeid i vindmøllen.',
        color: '#10b981',
        bonuses: {
            2: '+5% kornhøst',
            5: '+15% kornhøst, låser opp Stålhjå',
            10: '+30% kornhøst, mulighet for dobbel avling'
        }
    },
    WOODCUTTING: {
        label: 'Skogbruk',
        description: 'Felling av trær og foredling av tømmer.',
        xpSource: 'Hugg ved i skogen eller arbeid på sagbruket.',
        color: '#d97706',
        bonuses: {
            2: '+10% ved-yield',
            5: '+25% ved-yield, låser opp Jernøks',
            10: 'Sjanse for å finne sjelden tømmer'
        }
    },
    MINING: {
        label: 'Gruvedrift',
        description: 'Utvinning av malm og verdifulle mineraler.',
        xpSource: 'Arbeid i gruvene eller steinbruddet.',
        color: '#64748b',
        bonuses: {
            3: '+10% malm-utbytte',
            7: 'Redusert stamina-bruk ved graving',
            10: 'Låser opp utvinning av edle metaller'
        }
    },
    CRAFTING: {
        label: 'Håndverk',
        description: 'Smiing av våpen, rustninger og verktøy.',
        xpSource: 'Lag gjenstander i smia eller bakeriet.',
        color: '#f97316',
        bonuses: {
            2: 'Bedre sjanse for høyere kvalitet',
            5: 'Redusert materialkostnad (-10%)',
            10: 'Mesterhåndverk: Gjenstander har +20% holdbarhet'
        }
    },
    STEWARDSHIP: {
        label: 'Forvaltning',
        description: 'Ledelse, økonomi og styring av landområder.',
        xpSource: 'Samle inn skatt, passere lover eller styre regioner.',
        color: '#6366f1',
        bonuses: {
            5: '+10% skatteinntekter',
            10: 'Redusert lojalitetstap ved høy skatt',
            15: 'Låser opp avanserte lover'
        }
    },
    COMBAT: {
        label: 'Strid',
        description: 'Kampferdighet og forsvar av riket.',
        xpSource: 'Delta i raids, forsvar regionen eller tren på vaktposten.',
        color: '#e11d48',
        bonuses: {
            3: '+10% angrepsstyrke',
            7: 'Bedre forsvar med skjold',
            10: 'Låser opp spesialangrep'
        }
    },
    TRADING: {
        label: 'Handel',
        description: 'Kjøp og salg av varer på markedet.',
        xpSource: 'Kjøp og selg varer, eller send ut karavaner.',
        color: '#eab308',
        bonuses: {
            2: '5% bedre priser',
            5: '15% bedre priser, se markedstrender',
            10: 'Ingen markedsavgifter'
        }
    },
    THEOLOGY: {
        label: 'Teologi',
        description: 'Tro og forståelse av det guddommelige.',
        xpSource: 'Be i kirken eller bidra til katedralen.',
        color: '#8b5cf6',
        bonuses: {
            5: 'Økt stamina-regenerering',
            10: 'Låser opp mirakler',
            15: 'Guds gunst beskytter mot ulykker'
        }
    }
};
