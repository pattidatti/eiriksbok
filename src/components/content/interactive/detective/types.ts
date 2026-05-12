export type HistoricalMethod =
    | 'proveniens'
    | 'datering'
    | 'samtidighet'
    | 'bias-deteksjon'
    | 'kontekstualisering'
    | 'korroborering'
    | 'motkilde';

export const METHOD_LABEL: Record<HistoricalMethod, string> = {
    proveniens: 'Proveniensvurdering',
    datering: 'Datering',
    samtidighet: 'Samtidighetsvurdering',
    'bias-deteksjon': 'Bias-deteksjon',
    kontekstualisering: 'Kontekstualisering',
    korroborering: 'Korroborering',
    motkilde: 'Motkildeanalyse',
};

export const METHOD_EXPLANATION: Record<HistoricalMethod, string> = {
    proveniens: 'Du vurderte hvor kilden kommer fra og hvem som lagde den.',
    datering: 'Du tok stilling til når kilden ble laget.',
    samtidighet: 'Du vurderte om kilden er skrevet samtidig med hendelsen.',
    'bias-deteksjon': 'Du så hvilken vinkling eller skjult agenda kilden har.',
    kontekstualisering: 'Du satte kilden inn i sin historiske sammenheng.',
    korroborering: 'Du sammenlignet flere kilder for å finne fellestrekk.',
    motkilde: 'Du fant en kilde som motsier en annen.',
};

export interface DetectiveClue {
    id: string;
    text: string;
    insight: string;
    /** Suspect-IDer denne styrker. Tom = nøytralt bevis. */
    supports?: string[];
    /** 1 = svakt, 2 = moderat, 3 = sterkt. Standard 1. */
    weight?: number;
    /** Hvilken historisk metode trenes ved å finne dette beviset. */
    method?: HistoricalMethod;
}

export interface DetectiveSourceMetadata {
    origin: string;
    date?: string;
    reliability?: 'high' | 'medium' | 'low';
    type?: string;
    link?: string;
}

export interface DetectiveSource {
    id: string;
    type: 'textual' | 'archaeological' | 'visual' | 'scientific';
    title: string;
    metadata: DetectiveSourceMetadata;
    introduction?: string;
    provenance?: string;
    uncertainty?: string;
    original?: string;
    translation?: string;
    original_data?: string;
    interpretation?: string;
    image?: string;
    guidance?: string;
    hint?: string;
    clues: DetectiveClue[];
}

export interface DetectiveBriefing {
    title: string;
    context: string;
    mystery: string;
    mission: string;
    stakes: string;
    image?: string;
}

export interface DetectiveStep {
    id: string;
    title: string;
    content: string;
    sources: DetectiveSource[];
}

export interface DetectiveSuspect {
    id: string;
    name: string;
    description: string;
    icon: string;
    /** Hex eller CSS color. Brukes i TheoryBalance. */
    color?: string;
}

export interface ConclusionOption {
    id: string;
    text: string;
    feedback: string;
    /** Markerer historikerkonsensus. Flere alternativer kan være korrekte. */
    correct?: boolean;
    /** Clue-IDer som styrker dette svaret. Brukes til bevis-evaluering. */
    supportedBy?: string[];
}

export interface DetectiveConclusion {
    question: string;
    /** Antall bevis som må dras inn i argumentboksen før innsending. Standard 2. */
    minimumEvidence?: number;
    options: ConclusionOption[];
}

export interface RelatedArticle {
    title: string;
    path: string;
}

export type DetectiveThemeId =
    | 'medieval-cold'
    | 'viking-sea'
    | 'enlightenment'
    | 'cold-war'
    | 'modern-investigation'
    | 'antiquity';

export interface DetectiveCase {
    id: string;
    engine: 'historical-detective';
    title: string;
    description: string;
    image?: string;
    briefing?: DetectiveBriefing;
    status: {
        trustLevel: number;
        evidenceCollected: number;
        totalEvidence: number;
    };
    suspects: DetectiveSuspect[];
    steps: DetectiveStep[];
    conclusion_engine: DetectiveConclusion;
    /** v2 = ny pedagogisk flyt aktivert. Mangler dette feltet brukes legacy-flyt. */
    schemaVersion?: 2;
    /** Visuell identitet. Standard medieval-cold for legacy. */
    theme?: DetectiveThemeId;
    /** Lenker til relaterte artikler vist på sluttskjerm. */
    relatedArticles?: RelatedArticle[];
    /** Kompetansemål-IDer som trenes. */
    kompetansemaal?: string[];
    /** Anbefalt vanskelighet vist i hub. */
    difficulty?: 'Lett' | 'Middels' | 'Høy';
    /** Tidsangivelse vist i hub. */
    period?: string;
    /** Geografisk plassering vist i hub. */
    location?: string;
    /** Estimert spilletid vist i hub. */
    estimatedTime?: string;
    /** Epoke for filtrering. */
    epoch?: 'oldtid' | 'middelalder' | 'tidlig-moderne' | 'moderne' | 'samtid';
}
