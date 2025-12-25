export interface DetectiveClue {
    id: string;
    text: string;
    insight: string;
}

export interface DetectiveSource {
    id: string;
    type: 'textual' | 'archaeological' | 'visual' | 'scientific';
    title: string;
    metadata: {
        origin: string;
        date?: string;
        reliability?: 'high' | 'medium' | 'low';
        type?: string;
    };
    introduction?: string;
    provenance?: string; // Where does it come from?
    uncertainty?: string; // What is debated or unknown?
    original?: string; // The "Raw" source (text, image path, etc)
    translation?: string; // For textual sources
    original_data?: string;
    interpretation?: string; // For archaeological/visual
    image?: string;
    guidance?: string; // Deep context and expert guidance for the source
    hint?: string;     // A subtle hint for students
    clues: DetectiveClue[];
}

export interface DetectiveBriefing {
    title: string;
    context: string;   // Historical background
    mystery: string;   // What are we wondering about?
    mission: string;   // What is the student's task?
    stakes: string;    // Why does it matter?
    image?: string;    // Hero image for the briefing
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
}

export interface DetectiveCase {
    id: string;
    engine: 'historical-detective';
    title: string;
    description: string;
    image?: string;               // Main hero image
    briefing?: DetectiveBriefing; // New briefing field
    status: {
        trustLevel: number;
        evidenceCollected: number;
        totalEvidence: number;
    };
    suspects: DetectiveSuspect[];
    steps: DetectiveStep[];
    conclusion_engine: {
        question: string;
        options: {
            id: string;
            text: string;
            feedback: string;
        }[];
    };
}
