import type { Pipeline } from '../types';

export const pipelines: Pipeline[] = [
    {
        id: 'nordstream1',
        name: 'Nord Stream 1',
        type: 'gas',
        countries: 'Russland → Tyskland',
        coordinates: [
            [28.5, 59.5], [22.0, 58.5], [15.5, 56.8], [13.6, 54.5],
        ],
        capacity: '55 mrd. m³/år',
        yearCompleted: 2011,
        description:
            'Undersjøisk gassrørledning fra Vyborg i Russland til Lubmin i Tyskland gjennom Østersjøen. Skadet i sabotasjeaksjon i 2022.',
    },
    {
        id: 'nordstream2',
        name: 'Nord Stream 2',
        type: 'gas',
        countries: 'Russland → Tyskland',
        coordinates: [
            [28.5, 59.2], [22.0, 58.2], [15.5, 56.5], [13.6, 54.2],
        ],
        capacity: '55 mrd. m³/år',
        yearCompleted: 2021,
        description:
            'Parallell rørledning til Nord Stream 1. Aldri operert kommersielt. Skadet i sabotasjeaksjon september 2022.',
    },
    {
        id: 'yamal-europe',
        name: 'Yamal–Europe',
        type: 'gas',
        countries: 'Russland → Polen → Tyskland',
        coordinates: [
            [68.5, 67.5], [55.0, 62.0], [42.0, 56.0], [30.0, 53.5],
            [20.0, 52.2], [14.5, 52.4], [11.5, 52.3],
        ],
        capacity: '33 mrd. m³/år',
        yearCompleted: 1999,
        description: 'Rørledning fra det russiske Yamal-halvøyet gjennom Hviterussland og Polen til Vest-Europa.',
    },
    {
        id: 'turkstream',
        name: 'TurkStream',
        type: 'gas',
        countries: 'Russland → Tyrkia → Sørøst-Europa',
        coordinates: [
            [28.5, 43.8], [32.0, 41.8], [36.5, 41.3],
        ],
        capacity: '31,5 mrd. m³/år',
        yearCompleted: 2020,
        description: 'Russisk gassrørledning gjennom Svartehavet til Tyrkia, med videre til Sørøst-Europa.',
    },
    {
        id: 'tap',
        name: 'Trans Adriatisk rørledning (TAP)',
        type: 'gas',
        countries: 'Aserbajdsjan → Hellas → Italia',
        coordinates: [
            [49.5, 40.5], [43.0, 41.0], [36.5, 41.0], [25.5, 41.3],
            [20.5, 41.0], [15.5, 41.0],
        ],
        capacity: '10 mrd. m³/år',
        yearCompleted: 2020,
        description:
            'Del av Sørlig gaskorridor. Frakter kaspisk gass fra Aserbajdsjan gjennom Georgia, Tyrkia, Hellas og Albania til Italia.',
    },
    {
        id: 'east-siberia-pacific',
        name: 'Øst-Siberia–Stillehavet (ESPO)',
        type: 'oil',
        countries: 'Russland → Kina/Japan',
        coordinates: [
            [57.0, 58.0], [80.0, 56.0], [103.0, 53.0], [118.0, 50.0],
            [128.5, 48.5], [132.0, 46.8],
        ],
        capacity: '1,6 mill. fat/dag',
        yearCompleted: 2012,
        description:
            'Verdens lengste oljepipelineprosjekt. Frakter russisk råolje fra Vest-Sibir til Russlands stillehavskyst og Kina.',
    },
    {
        id: 'baku-tbilisi-ceyhan',
        name: 'Baku–Tbilisi–Ceyhan (BTC)',
        type: 'oil',
        countries: 'Aserbajdsjan → Georgia → Tyrkia',
        coordinates: [
            [49.5, 40.5], [45.0, 41.7], [41.5, 41.7], [36.5, 36.8],
        ],
        capacity: '1,2 mill. fat/dag',
        yearCompleted: 2006,
        description:
            'Rørledning som frakter kaspisk olje utenom Russland og Iran. Politisk strategisk viktig for vestlige interesser.',
    },
    {
        id: 'keystone-xl',
        name: 'Keystone XL (kansellert)',
        type: 'oil',
        countries: 'Canada → USA',
        coordinates: [
            [-111.0, 49.5], [-104.0, 45.0], [-96.0, 40.5],
        ],
        capacity: '830 000 fat/dag',
        description:
            'Planlagt rørledning fra Albertas oljesander til USA. Kansellert av president Biden i 2021 etter langvarig politisk strid.',
    },
    {
        id: 'colonial-pipeline',
        name: 'Colonial Pipeline',
        type: 'oil',
        countries: 'USA (sørøst)',
        coordinates: [
            [-95.0, 29.7], [-87.5, 33.5], [-84.0, 33.8], [-80.0, 35.5],
            [-77.0, 38.8], [-74.5, 40.5],
        ],
        capacity: '2,5 mill. fat/dag',
        yearCompleted: 1963,
        description:
            'USAs største drivstoffledning. Hacket av løsepengevirus i mai 2021, noe som førte til drivstoffmangel i sørøststatene.',
    },
    {
        id: 'trans-alaska',
        name: 'Trans-Alaska Pipeline (TAPS)',
        type: 'oil',
        countries: 'USA (Alaska)',
        coordinates: [
            [-148.5, 70.2], [-148.5, 66.5], [-147.0, 64.8], [-145.0, 62.0],
            [-147.0, 61.2], [-147.4, 61.0],
        ],
        capacity: '500 000 fat/dag (nå)',
        yearCompleted: 1977,
        description:
            'Strekker seg 1300 km fra Prudhoe Bay i nord til Valdez i sør. Bygd for å frakte alaskaolje til varmere farvann.',
    },
    {
        id: 'druzhba',
        name: 'Druzhba-rørledningen',
        type: 'oil',
        countries: 'Russland → Øst-Europa',
        coordinates: [
            [52.0, 53.0], [40.0, 53.0], [28.0, 51.5], [22.0, 51.0],
            [18.5, 52.0], [14.5, 51.0], [12.5, 51.0],
        ],
        capacity: '1,3 mill. fat/dag',
        yearCompleted: 1964,
        description:
            'Verdens lengste oljepipeline. "Druzhba" betyr "vennskap" på russisk. Forsyner Polen, Tsjekkia, Slovakia, Ungarn og Tyskland.',
    },
    {
        id: 'gas-nigeria-morocco',
        name: 'Nigeria–Marokko-rørledningen',
        type: 'gas',
        countries: 'Nigeria → Vest-Afrika → Marokko',
        coordinates: [
            [3.5, 6.5], [-0.2, 7.0], [-5.5, 10.0], [-13.5, 12.0],
            [-15.0, 16.0], [-16.5, 20.0], [-14.0, 24.0], [-13.0, 29.0],
            [-8.0, 33.0], [-5.5, 35.5],
        ],
        capacity: '30 mrd. m³/år (planlagt)',
        description:
            'Ambisiøst planlagt rørledningsprosjekt langs Afrikas vestkyst. Skal frakte nigeriansk gass til Europa via 13 land.',
    },
    {
        id: 'gas-iran-pakistan',
        name: 'Iran–Pakistan-rørledning ("Fred-rørledningen")',
        type: 'gas',
        countries: 'Iran → Pakistan',
        coordinates: [
            [56.0, 27.0], [60.5, 27.5], [64.5, 26.5],
        ],
        description: 'Delvis bygget. Hindret av amerikanske sanksjoner mot Iran. Kalt "fredsrørledningen" for sitt potensial til regional samarbeid.',
    },
    {
        id: 'power-of-siberia',
        name: 'Siberiakraften (Power of Siberia)',
        type: 'gas',
        countries: 'Russland → Kina',
        coordinates: [
            [128.0, 53.0], [122.0, 50.5], [115.0, 48.0], [110.0, 45.0],
            [107.0, 44.5],
        ],
        capacity: '38 mrd. m³/år',
        yearCompleted: 2019,
        description: 'Russlands nye gassvei til Asia. En strategisk omlegging av eksport fra Europa til Kina etter 2022-sanksjonene.',
    },
];
