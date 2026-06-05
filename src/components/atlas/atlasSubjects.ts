// Delte fagkonstanter for hele atlaset. Holdt på ett sted så farger og navn er
// identiske i panel, tooltip og filter — atlaset skal føles som én helhet.

export const SUBJECT_COLOR: Record<string, string> = {
    historie: '#b45309',
    norsk: '#0891b2',
    krle: '#7c3aed',
    samfunnskunnskap: '#059669',
    musikk: '#db2777',
};

export const SUBJECT_LABEL: Record<string, string> = {
    historie: 'Historie',
    norsk: 'Norsk',
    krle: 'KRLE',
    samfunnskunnskap: 'Samfunn',
    musikk: 'Musikk',
};

// Fast visningsrekkefølge for fag-filteret (fag uten events skjules av komponenten).
export const SUBJECT_ORDER: string[] = ['historie', 'norsk', 'krle', 'samfunnskunnskap', 'musikk'];
