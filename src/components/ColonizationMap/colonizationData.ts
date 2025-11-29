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
    { year: 1492, event: "Columbus reaches the Americas", location: [25.0, -71.0] },
    { year: 1494, event: "Treaty of Tordesillas", location: [40.0, -4.0] },
    { year: 1519, event: "Cortés arrives in Mexico", location: [19.0, -96.0] },
    { year: 1607, event: "Jamestown founded", location: [37.2, -76.7] },
    { year: 1776, event: "US Declaration of Independence", location: [39.9, -75.1] },
];

export const territoryHistory: Record<string, TerritoryHistory[]> = {
    "USA": [
        { start: 1607, end: 1776, owner: "GBR" },
        { start: 1776, end: 2025, owner: "USA" },
    ],
    "BRA": [
        { start: 1500, end: 1822, owner: "PRT" },
        { start: 1822, end: 2025, owner: "BRA" },
    ],
    "MEX": [
        { start: 1521, end: 1821, owner: "ESP" },
        { start: 1821, end: 2025, owner: "MEX" },
    ],
    // Add more countries and history as needed
};

export const countryColors: Record<string, string> = {
    "GBR": "#E63946", // British Red
    "ESP": "#F4A261", // Spanish Gold/Orange
    "PRT": "#2A9D8F", // Portuguese Green
    "FRA": "#457B9D", // French Blue
    "NLD": "#E76F51", // Dutch Orange
    "USA": "#1D3557", // US Blue
    "BRA": "#264653", // Brazil Green/Dark
    "MEX": "#2A9D8F", // Mexico Green
    "default": "#D6D6DA" // Unclaimed/Native
};
