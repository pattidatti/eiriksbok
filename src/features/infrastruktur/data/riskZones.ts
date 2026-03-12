import type { RiskZone } from '../types';

export const riskZones: RiskZone[] = [
    {
        id: 'red-sea',
        name: 'Rødehavet — Houthi-angrep',
        color: '#ef4444',
        coordinates: [
            [32.0, 30.0], [45.0, 30.0], [50.0, 20.0],
            [45.0, 10.0], [40.0, 10.0], [35.0, 15.0],
            [32.0, 20.0],
        ],
        description: 'Siden november 2023 har Houthi-militsen fra Jemen angrepet handelsskip i Rødehavet. Over 100 angrep har tvunget store rederier til å ta omveien rundt Afrika, noe som øker frakttider og kostnader for europeisk handel.',
        snlUrl: 'https://snl.no/Rødehavet',
    },
    {
        id: 'ukraine',
        name: 'Ukraina-krigen',
        color: '#f97316',
        coordinates: [
            [22.0, 52.0], [40.0, 52.0], [40.0, 44.0],
            [35.0, 43.0], [28.0, 43.0], [22.0, 46.0],
        ],
        description: 'Russlands invasjon av Ukraina i 2022 forstyrret alvorlig globale energimarkeder. Nord Stream-sabotasjen, blokade av Svartehavet og sanksjoner mot russisk olje og gass omformet Europas energisikkerhet fundamentalt.',
        snlUrl: 'https://snl.no/Krigen_i_Ukraina',
    },
    {
        id: 'strait-hormuz',
        name: 'Hormuz-spenning',
        color: '#eab308',
        coordinates: [
            [48.0, 30.0], [62.0, 30.0], [62.0, 22.0],
            [55.0, 22.0], [50.0, 24.0], [48.0, 26.0],
        ],
        description: 'Den persiske golf er et vedvarende spenningspunkt mellom Iran og vestlige makter. Iran har gjentatte ganger truet med å stenge Hormuzstredet ved konflikt, noe som ville lamme 20 % av verdens oljeforsyning.',
        snlUrl: 'https://snl.no/Den_persiske_golf',
    },
    {
        id: 'south-china-sea',
        name: 'Sørkinahavet',
        color: '#8b5cf6',
        coordinates: [
            [105.0, 22.0], [122.0, 22.0], [122.0, 5.0],
            [115.0, 3.0], [108.0, 5.0], [105.0, 10.0],
        ],
        description: 'Kina gjør krav på nesten hele Sørkinahavet, i konflikt med Vietnam, Filippinene, Malaysia og Brunei. Gjennom disse farvannene passerer ca. 3 billioner dollar i handel hvert år. Kunstige øyer med militæranlegg øker spenningen.',
        snlUrl: 'https://snl.no/Sørkinahavet',
    },
    {
        id: 'east-med',
        name: 'Østlige Middelhavet',
        color: '#06b6d4',
        coordinates: [
            [28.0, 37.0], [38.0, 37.0], [38.0, 30.0],
            [34.0, 29.0], [30.0, 31.0], [27.0, 33.0],
        ],
        description: 'Konflikten mellom Israel og Hamas, Libanon og Hizbollahs rakettkampanjer, samt maktkampen om gassfunn i Det østlige Middelhavet skaper varig ustabilitet i regionen.',
        snlUrl: 'https://snl.no/Middelhavet',
    },
];
