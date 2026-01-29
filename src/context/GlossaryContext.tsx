import React, { createContext, useContext, useEffect, useState } from 'react';

export interface GlossaryEntry {
    term: string;
    definition: string;
    type: 'concept' | 'person';
    subject?: string;
    topic?: string;
    tags?: string[];
    image?: string;
    link?: string;
    lifespan?: string;
    aliases?: string[];
}

interface GlossaryContextType {
    entries: GlossaryEntry[];
    isLoading: boolean;
    getEntry: (term: string) => GlossaryEntry | undefined;
}

const GlossaryContext = createContext<GlossaryContextType | undefined>(undefined);

export const GlossaryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [entries, setEntries] = useState<GlossaryEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchGlossary = async () => {
            try {
                const response = await fetch(`${import.meta.env.BASE_URL}data/glossary.json`);
                if (!response.ok) throw new Error('Failed to fetch glossary');
                const data = await response.json();
                const sortedData = data.sort((a: GlossaryEntry, b: GlossaryEntry) =>
                    a.term.localeCompare(b.term, 'nb')
                );
                setEntries(sortedData);
            } catch (error) {
                console.error('Error loading glossary:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGlossary();
    }, []);

    const getEntry = (term: string) => {
        const lowerTerm = term.toLowerCase();
        return entries.find(e => e.term.toLowerCase() === lowerTerm);
    };

    return (
        <GlossaryContext.Provider value={{ entries, isLoading, getEntry }}>
            {children}
        </GlossaryContext.Provider>
    );
};

export const useGlossary = () => {
    const context = useContext(GlossaryContext);
    if (context === undefined) {
        throw new Error('useGlossary must be used within a GlossaryProvider');
    }
    return context;
};
