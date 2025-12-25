export interface NetworkNode {
    id: string;
    name: string;
    period: string;
    x: number;
    y: number;
    size: number;
}

export interface NetworkLink {
    source: string;
    target: string;
}

export const PHILOSOPHY_NETWORK = {
    nodes: [
        { id: 'sokrates', name: 'Sokrates', period: 'Antikken', x: 50, y: 50, size: 24 },
        { id: 'platon', name: 'Platon', period: 'Antikken', x: 40, y: 35, size: 20 },
        { id: 'aristoteles', name: 'Aristoteles', period: 'Antikken', x: 60, y: 30, size: 22 },
        { id: 'augustin', name: 'Augustin', period: 'Middelalder', x: 30, y: 60, size: 16 },
        { id: 'aquinas', name: 'Aquinas', period: 'Middelalder', x: 70, y: 55, size: 18 },
        { id: 'descartes', name: 'Descartes', period: 'Opplysning', x: 20, y: 20, size: 18 },
        { id: 'hume', name: 'Hume', period: 'Opplysning', x: 80, y: 20, size: 18 },
        { id: 'kant', name: 'Kant', period: 'Moderne', x: 50, y: 15, size: 20 },
        { id: 'nietzsche', name: 'Nietzsche', period: 'Moderne', x: 85, y: 70, size: 18 },
        { id: 'kierkegaard', name: 'Kierkegaard', period: 'Moderne', x: 15, y: 75, size: 16 }
    ] as NetworkNode[],
    links: [
        { source: 'sokrates', target: 'platon' },
        { source: 'platon', target: 'aristoteles' },
        { source: 'platon', target: 'augustin' },
        { source: 'aristoteles', target: 'aquinas' },
        { source: 'descartes', target: 'kant' },
        { source: 'hume', target: 'kant' },
        { source: 'kant', target: 'nietzsche' },
        { source: 'kant', target: 'kierkegaard' }
    ] as NetworkLink[]
};
