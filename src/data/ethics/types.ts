export type EthicalSystemCategory = 'secular' | 'religious';
export type Verdict = 'accept' | 'reject' | 'complex' | 'nuanced';

export interface EthicalSystem {
    id: string;
    name: string;
    category: EthicalSystemCategory;
    description: string;
    keyPrinciples: string[];
    motto: string;
    strategy: string;
    origin: string;
    articleLink: string;
    icon?: string;
}

export interface SystemResponse {
    systemId: string;
    verdict: Verdict;
    explanation: string;
}

export interface DilemmaChoice {
    id: string;
    label: string;
    description?: string;
    responses: SystemResponse[];
}

export interface EthicalDilemma {
    id: string;
    title: string;
    scenario: string;
    image: string;
    choices: DilemmaChoice[];
}
