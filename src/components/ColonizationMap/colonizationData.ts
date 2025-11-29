export interface TerritoryHistory {
    start: number;
    end: number;
    owner: string; // ISO 3166-1 alpha-3 code or custom code
}

export interface HistoricalEvent {
    year: number;
    event: string;
    location: [number, number]; // [latitude, longitude]
}

export const colonizationEvents: HistoricalEvent[] = [
    // 15th Century
    { year: 1492, event: "Columbus reaches the Americas", location: [25.0, -71.0] },
    { year: 1494, event: "Treaty of Tordesillas", location: [40.0, -4.0] },
    { year: 1498, event: "Vasco da Gama reaches India", location: [11.2, 75.8] },

    // 16th Century
    { year: 1500, event: "Cabral discovers Brazil", location: [-16.0, -39.0] },
    { year: 1519, event: "Cortés arrives in Mexico", location: [19.0, -96.0] },
    { year: 1521, event: "Fall of Tenochtitlan", location: [19.4, -99.1] },
    { year: 1532, event: "Pizarro conquers Peru", location: [-12.0, -77.0] },
    { year: 1565, event: "St. Augustine founded (Florida)", location: [29.9, -81.3] },

    // 17th Century
    { year: 1602, event: "VOC founded", location: [52.3, 4.9] },
    { year: 1607, event: "Jamestown founded", location: [37.2, -76.7] },
    { year: 1608, event: "Quebec City founded", location: [46.8, -71.2] },
    { year: 1620, event: "Mayflower lands", location: [41.9, -70.6] },
    { year: 1652, event: "Cape Town founded", location: [-33.9, 18.4] },

    // 18th Century
    { year: 1757, event: "Battle of Plassey (India)", location: [23.8, 88.2] },
    { year: 1770, event: "Cook claims Australia", location: [-34.0, 151.0] },
    { year: 1776, event: "US Declaration of Independence", location: [39.9, -75.1] },
    { year: 1788, event: "First Fleet arrives in Australia", location: [-33.8, 151.2] },

    // 19th Century
    { year: 1884, event: "Berlin Conference", location: [52.5, 13.4] },
    { year: 1858, event: "British Raj established", location: [28.6, 77.2] },
];

export const territoryHistory: Record<string, TerritoryHistory[]> = {
    // Colonizers (Always colored)
    "GBR": [{ start: 1000, end: 2025, owner: "GBR" }],
    "ESP": [{ start: 1400, end: 2025, owner: "ESP" }],
    "PRT": [{ start: 1100, end: 2025, owner: "PRT" }],
    "FRA": [{ start: 1000, end: 2025, owner: "FRA" }],
    "NLD": [{ start: 1500, end: 2025, owner: "NLD" }],

    // North America
    "USA": [
        { start: 1607, end: 1776, owner: "GBR" },
        { start: 1776, end: 2025, owner: "USA" },
    ],
    "CAN": [
        { start: 1534, end: 1763, owner: "FRA" },
        { start: 1763, end: 1867, owner: "GBR" },
        { start: 1867, end: 2025, owner: "CAN" }, // Dominion
    ],

    // Latin America
    "MEX": [
        { start: 1521, end: 1821, owner: "ESP" },
        { start: 1821, end: 2025, owner: "MEX" },
    ],
    "BRA": [
        { start: 1500, end: 1822, owner: "PRT" },
        { start: 1822, end: 2025, owner: "BRA" },
    ],
    "ARG": [
        { start: 1536, end: 1816, owner: "ESP" },
        { start: 1816, end: 2025, owner: "ARG" }, // Simplified
    ],
    "PER": [
        { start: 1532, end: 1821, owner: "ESP" },
        { start: 1821, end: 2025, owner: "PER" },
    ],
    "COL": [
        { start: 1525, end: 1810, owner: "ESP" },
        { start: 1810, end: 2025, owner: "COL" },
    ],

    // Asia/Oceania
    "IND": [
        { start: 1757, end: 1858, owner: "EIC" }, // East India Company
        { start: 1858, end: 1947, owner: "GBR" },
        { start: 1947, end: 2025, owner: "IND" },
    ],
    "AUS": [
        { start: 1788, end: 1901, owner: "GBR" },
        { start: 1901, end: 2025, owner: "AUS" },
    ],
    "IDN": [
        { start: 1602, end: 1799, owner: "VOC" }, // Dutch East India Company
        { start: 1799, end: 1949, owner: "NLD" }, // Dutch East Indies
        { start: 1949, end: 2025, owner: "IDN" },
    ],

    // Africa (Scramble for Africa)
    // North Africa
    "EGY": [ // Egypt
        { start: 1517, end: 1882, owner: "TUR" }, // Ottoman
        { start: 1882, end: 1922, owner: "GBR" },
        { start: 1922, end: 2025, owner: "EGY" },
    ],
    "DZA": [ // Algeria
        { start: 1830, end: 1962, owner: "FRA" },
        { start: 1962, end: 2025, owner: "DZA" },
    ],
    "MAR": [ // Morocco
        { start: 1912, end: 1956, owner: "FRA" }, // Protectorate
        { start: 1956, end: 2025, owner: "MAR" },
    ],
    "LBY": [ // Libya
        { start: 1911, end: 1943, owner: "ITA" },
        { start: 1943, end: 1951, owner: "GBR" }, // Admin
        { start: 1951, end: 2025, owner: "LBY" },
    ],
    "TUN": [ // Tunisia
        { start: 1881, end: 1956, owner: "FRA" },
        { start: 1956, end: 2025, owner: "TUN" },
    ],

    // West Africa
    "NGA": [ // Nigeria
        { start: 1885, end: 1960, owner: "GBR" },
        { start: 1960, end: 2025, owner: "NGA" },
    ],
    "GHA": [ // Ghana (Gold Coast)
        { start: 1821, end: 1957, owner: "GBR" },
        { start: 1957, end: 2025, owner: "GHA" },
    ],
    "CIV": [ // Ivory Coast
        { start: 1893, end: 1960, owner: "FRA" },
        { start: 1960, end: 2025, owner: "CIV" },
    ],
    "SEN": [ // Senegal
        { start: 1850, end: 1960, owner: "FRA" },
        { start: 1960, end: 2025, owner: "SEN" },
    ],
    "MLI": [ // Mali (French Sudan)
        { start: 1892, end: 1960, owner: "FRA" },
        { start: 1960, end: 2025, owner: "MLI" },
    ],

    // Central Africa
    "COD": [ // DR Congo
        { start: 1885, end: 1908, owner: "BEL" }, // Congo Free State (Leopold II) - treating as BEL for simplicity or custom
        { start: 1908, end: 1960, owner: "BEL" },
        { start: 1960, end: 2025, owner: "COD" },
    ],
    "COG": [ // Republic of the Congo
        { start: 1880, end: 1960, owner: "FRA" },
        { start: 1960, end: 2025, owner: "COG" },
    ],
    "CMR": [ // Cameroon
        { start: 1884, end: 1916, owner: "DEU" },
        { start: 1916, end: 1960, owner: "FRA" }, // Split FRA/GBR, simplified to FRA
        { start: 1960, end: 2025, owner: "CMR" },
    ],

    // East Africa
    "KEN": [ // Kenya
        { start: 1895, end: 1963, owner: "GBR" },
        { start: 1963, end: 2025, owner: "KEN" },
    ],
    "TZA": [ // Tanzania
        { start: 1885, end: 1919, owner: "DEU" }, // German East Africa
        { start: 1919, end: 1961, owner: "GBR" },
        { start: 1961, end: 2025, owner: "TZA" },
    ],
    "UGA": [ // Uganda
        { start: 1894, end: 1962, owner: "GBR" },
        { start: 1962, end: 2025, owner: "UGA" },
    ],
    "ETH": [ // Ethiopia
        { start: 1000, end: 1936, owner: "ETH" },
        { start: 1936, end: 1941, owner: "ITA" }, // Brief occupation
        { start: 1941, end: 2025, owner: "ETH" },
    ],
    "SOM": [ // Somalia
        { start: 1889, end: 1960, owner: "ITA" }, // Italian Somaliland
        { start: 1960, end: 2025, owner: "SOM" },
    ],

    // Southern Africa
    "ZAF": [ // South Africa
        { start: 1652, end: 1795, owner: "VOC" }, // Dutch East India Company
        { start: 1795, end: 1803, owner: "GBR" },
        { start: 1803, end: 1806, owner: "NLD" }, // Batavian Republic
        { start: 1806, end: 1910, owner: "GBR" },
        { start: 1910, end: 2025, owner: "ZAF" },
    ],
    "ZWE": [ // Zimbabwe (Rhodesia)
        { start: 1890, end: 1980, owner: "GBR" },
        { start: 1980, end: 2025, owner: "ZWE" },
    ],
    "AGO": [ // Angola
        { start: 1575, end: 1975, owner: "PRT" },
        { start: 1975, end: 2025, owner: "AGO" },
    ],
    "MOZ": [ // Mozambique
        { start: 1498, end: 1975, owner: "PRT" },
        { start: 1975, end: 2025, owner: "MOZ" },
    ],
    "NAM": [ // Namibia
        { start: 1884, end: 1915, owner: "DEU" },
        { start: 1915, end: 1990, owner: "ZAF" }, // South African mandate
        { start: 1990, end: 2025, owner: "NAM" },
    ],
};

export const countryColors: Record<string, string> = {
    // Colonizers
    "GBR": "#E63946", // British Red
    "ESP": "#F4A261", // Spanish Gold
    "PRT": "#2A9D8F", // Portuguese Green
    "FRA": "#457B9D", // French Blue
    "NLD": "#E76F51", // Dutch Orange
    "BEL": "#E9C46A", // Belgian Yellow
    "ITA": "#2A9D8F", // Italian Green (using same as PRT/MEX for now, or distinct)
    "DEU": "#264653", // German Dark/Grey
    "TUR": "#2A9D8F", // Ottoman Green

    // Companies
    "EIC": "#D62828", // Slightly darker red for EIC
    "VOC": "#D35400", // Darker Orange for VOC

    // Independent Nations (Post-colonial)
    "USA": "#1D3557", // US Blue
    "CAN": "#A8DADC", // Light Blue
    "BRA": "#264653", // Dark Green
    "MEX": "#2A9D8F", // Mexico Green
    "IND": "#F4A261", // Saffron-ish
    "AUS": "#1D3557",
    "ZAF": "#E9C46A",
    "ETH": "#E76F51", // Ethiopia

    "default": "#D6D6DA" // Unclaimed/Native
};

export interface WarEvent {
    name: string;
    startYear: number;
    endYear: number;
    description: string;
    participants: string[]; // List of country codes or names
    location: [number, number]; // Lat/Long for the popup
}

export const majorWars: WarEvent[] = [
    {
        name: "Seven Years' War",
        startYear: 1756,
        endYear: 1763,
        description: "Global conflict involving most great powers, affecting colonies in Americas, Africa, and India.",
        participants: ["GBR", "FRA", "ESP"],
        location: [40.0, -40.0] // Atlantic/Mid-point
    },
    {
        name: "American Revolutionary War",
        startYear: 1775,
        endYear: 1783,
        description: "Thirteen Colonies rebellion against British rule, leading to US independence.",
        participants: ["GBR", "USA", "FRA"],
        location: [38.0, -75.0] // East Coast USA
    },
    {
        name: "Napoleonic Wars",
        startYear: 1803,
        endYear: 1815,
        description: "Series of major conflicts pitting the French Empire against European coalitions.",
        participants: ["FRA", "GBR", "ESP", "PRT", "RUS"],
        location: [48.0, 15.0] // Central Europe
    },
    {
        name: "Opium Wars",
        startYear: 1839,
        endYear: 1860,
        description: "Conflicts between China and Western powers (UK/France) over trade and sovereignty.",
        participants: ["GBR", "CHN", "FRA"],
        location: [25.0, 115.0] // South China Sea
    },
    {
        name: "Scramble for Africa",
        startYear: 1881,
        endYear: 1914,
        description: "Rapid colonization of African territory by European powers.",
        participants: ["GBR", "FRA", "DEU", "PRT", "ITA", "BEL"],
        location: [0.0, 20.0] // Central Africa
    },
    {
        name: "Boer Wars",
        startYear: 1880,
        endYear: 1902,
        description: "Conflicts between the British Empire and the Boer Republics in South Africa.",
        participants: ["GBR", "ZAF", "NLD"],
        location: [-29.0, 26.0] // South Africa
    }
];
