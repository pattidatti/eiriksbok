import type { ShippingLane } from '../types';

export const shippingLanes: ShippingLane[] = [
    {
        id: 'north-atlantic',
        name: 'Nord-Atlanterhavet',
        type: 'major',
        description: 'Europas forbindelseslinje til Nord-Amerika. Over 5 000 containerskip krysser rutinemessig.',
        coordinates: [
            [-5.5, 51.5], [-10.0, 50.0], [-20.0, 47.0], [-30.0, 44.0],
            [-40.0, 42.0], [-50.0, 41.0], [-60.0, 41.5], [-66.0, 41.5],
            [-71.0, 42.0], [-74.0, 40.5],
        ],
    },
    {
        id: 'mediterranean-suez',
        name: 'Middelhavet – Suez',
        type: 'major',
        description: 'En av verdens mest trafikkerte ruter. Suezkanalen spart for 7 000 km rundt Afrika.',
        coordinates: [
            [-5.5, 36.0], [5.0, 37.5], [12.5, 37.5], [20.0, 34.5],
            [28.5, 34.0], [32.5, 31.3], [32.6, 30.0],
        ],
    },
    {
        id: 'suez-indian-ocean',
        name: 'Suezkanalen – Indiahavet',
        type: 'major',
        description: 'Fra Rødehavet gjennom Adenbukta til det åpne hav.',
        coordinates: [
            [32.6, 30.0], [32.5, 27.0], [40.0, 22.0],
            [43.5, 11.5], [48.0, 9.0], [52.0, 10.5], [58.0, 12.0],
            [65.0, 15.0], [72.5, 19.0],
        ],
    },
    {
        id: 'indian-ocean-malacca',
        name: 'Indiahavet – Malakkastredet',
        type: 'major',
        description: 'Livlinjen mellom Midtøsten og Øst-Asia. Omtrent 80 000 skip per år passerer.',
        coordinates: [
            [72.5, 19.0], [72.0, 10.0], [76.0, 6.0],
            [80.0, 4.0], [90.0, 2.5], [99.0, 2.0], [103.5, 1.3],
        ],
    },
    {
        id: 'malacca-eastasia',
        name: 'Malakkastredet – Øst-Asia',
        type: 'major',
        description: 'Fra Sørøst-Asia til Japan, Sør-Korea og Kina. Et av verdens mest trafikkerte sjøveier.',
        coordinates: [
            [103.5, 1.3], [107.0, 3.5], [110.0, 5.0],
            [115.0, 12.0], [120.0, 20.0], [122.0, 25.0],
            [124.0, 28.0], [126.0, 31.0], [128.0, 34.5], [130.0, 37.0],
            [130.5, 33.6], [139.0, 35.5],
        ],
    },
    {
        id: 'trans-pacific',
        name: 'Transstillehavet (Asia – USA)',
        type: 'major',
        description: 'Den viktigste handelsruten mellom Asia og Nord-Amerika. Kina, Japan og Sør-Korea eksporterer til USA.',
        coordinates: [
            [139.0, 35.5], [150.0, 38.0], [165.0, 40.0],
            [175.0, 42.0], [-175.0, 43.0], [-165.0, 44.0],
            [-155.0, 43.0], [-140.0, 40.0], [-130.0, 38.0],
            [-122.5, 37.7],
        ],
    },
    {
        id: 'south-atlantic',
        name: 'Sør-Atlanterhavet',
        type: 'major',
        description: 'Brasil og Sør-Amerika til Europa. Viktig for råvarer som jernmalm, soyabønner og olje.',
        coordinates: [
            [-43.2, -22.9], [-40.0, -20.0], [-38.0, -10.0],
            [-28.0, 0.0], [-18.0, 8.0], [-10.0, 15.0],
            [-5.5, 35.0],
        ],
    },
    {
        id: 'cape-of-good-hope',
        name: 'Kapp Det Gode Håp',
        type: 'major',
        description: 'Alternativrute rundt Afrika når Suezkanalen er stengt eller for dyr. Brukt mye etter blokaden i 2021.',
        coordinates: [
            [32.6, 30.0], [40.0, 22.0], [40.0, 10.0],
            [40.0, 0.0], [35.0, -10.0], [25.0, -20.0],
            [18.5, -34.0], [10.0, -40.0], [-5.0, -42.0],
            [-20.0, -38.0], [-30.0, -32.0], [-43.2, -22.9],
        ],
    },
    {
        id: 'europe-west-africa',
        name: 'Europa – Vest-Afrika',
        type: 'secondary',
        description: 'Handelsrute mellom Europa og Vest-Afrika. Viktig for nigeriansk og angolansk oljeksport.',
        coordinates: [
            [-5.5, 36.0], [-10.0, 30.0], [-15.0, 20.0],
            [-17.0, 10.0], [-8.0, 4.0], [3.5, 6.5],
        ],
    },
    {
        id: 'europe-australia',
        name: 'Europa – Australia via Cape',
        type: 'secondary',
        description: 'Langdistanseruten til Oseania. Containerskip bringer europiske varer til Australia og New Zealand.',
        coordinates: [
            [-5.5, 36.0], [-5.0, 20.0], [5.0, 0.0],
            [15.0, -15.0], [20.0, -30.0], [25.0, -38.0],
            [40.0, -40.0], [65.0, -40.0], [90.0, -38.0],
            [115.0, -35.0],
        ],
    },
    {
        id: 'arctic-route',
        name: 'Nordøstpassasjen (Arktis)',
        type: 'secondary',
        description: 'Russisk arktisk rute som åpnes stadig mer pga. klimaendringer. Kutter 40 % av avstand Europa–Asia.',
        coordinates: [
            [30.0, 69.0], [45.0, 72.0], [60.0, 74.0],
            [80.0, 77.0], [100.0, 75.0], [130.0, 72.0],
            [160.0, 67.0], [180.0, 64.0],
        ],
    },
    {
        id: 'panama-route',
        name: 'Panamakanalen',
        type: 'major',
        description: 'Viktig gjennomfartsled mellom Atlanterhavet og Stillehavet. 14 000 skip per år. Knapphet på vann truer kapasiteten.',
        coordinates: [
            [-74.0, 40.5], [-77.0, 35.0], [-80.0, 25.0],
            [-82.0, 16.0], [-79.9, 9.1], [-79.5, 8.8],
            [-80.0, 7.0], [-86.0, 4.0],
        ],
    },
];
