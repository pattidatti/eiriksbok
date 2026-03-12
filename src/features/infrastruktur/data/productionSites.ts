import type { ProductionSite } from '../types';

export const productionSites: ProductionSite[] = [
    // Middle East
    { id: 'ghawar', name: 'Ghawar', country: 'Saudi-Arabia', type: 'oil', mbpd: 3.8, coordinates: [49.3, 25.1], description: 'Verdens største oljefelt. Anslagsvis 70 mrd. fat påviste reserver.' },
    { id: 'safaniya', name: 'Safaniya', country: 'Saudi-Arabia', type: 'oil', mbpd: 1.3, coordinates: [48.7, 28.0], description: 'Verdens største offshore oljefelt.' },
    { id: 'rumaila', name: 'Rumaila', country: 'Irak', type: 'oil', mbpd: 1.4, coordinates: [47.5, 30.3], description: 'Iraks største og det nest største i Midtøsten.' },
    { id: 'burgan', name: 'Burgan', country: 'Kuwait', type: 'oil', mbpd: 1.7, coordinates: [48.0, 29.1], description: 'Verdens nest største oljefelt. Storskala produksjon siden 1940-tallet.' },
    { id: 'ahvaz', name: 'Ahvaz', country: 'Iran', type: 'oil', mbpd: 0.7, coordinates: [48.7, 31.3], description: 'Irans største oljefelt, oppdaget i 1958.' },
    { id: 'south-pars', name: 'South Pars / North Dome', country: 'Iran/Qatar', type: 'gas', mbpd: 9.0, coordinates: [52.0, 26.5], description: 'Verdens største naturgassfelt. Deles mellom Iran (South Pars) og Qatar (North Dome).' },
    { id: 'shaybah', name: 'Shaybah', country: 'Saudi-Arabia', type: 'oil', mbpd: 1.0, coordinates: [54.5, 22.5], description: 'Stor oljeproduksjon midt i Rub al-Khali ("Empty Quarter")-ørkenen.' },
    { id: 'abu-dhabi-onshore', name: 'ADNOC Onshore', country: 'UAE', type: 'oil', mbpd: 1.6, coordinates: [54.4, 24.2], description: 'Abu Dhabis onshore-produksjonskompleks. ADNOC er en av verdens største energiselskaper.' },
    { id: 'kirkuk', name: 'Kirkuk', country: 'Irak', type: 'oil', mbpd: 0.5, coordinates: [44.4, 35.5], description: 'Historisk viktig oljefelt, gjenstand for territorial konflikt mellom Irak og Kurdistan.' },

    // Russia / CIS
    { id: 'samotlor', name: 'Samotlor', country: 'Russland', type: 'oil', mbpd: 0.5, coordinates: [76.5, 61.0], description: 'Russlands nest største og historisk sett det som holdt Sovjet-unionen i gang.' },
    { id: 'priobskoye', name: 'Priobskoye', country: 'Russland', type: 'oil', mbpd: 0.8, coordinates: [67.0, 61.5], description: 'Et av Russlands mest produktive oljefelt i Vest-Sibir.' },
    { id: 'vankor', name: 'Vankor', country: 'Russland', type: 'oil', mbpd: 0.5, coordinates: [83.5, 67.0], description: 'Rosneft-operert felt i nordlige Krasnoyarsk-regionen.' },
    { id: 'tengiz', name: 'Tengiz', country: 'Kasakhstan', type: 'oil', mbpd: 0.7, coordinates: [53.1, 45.4], description: 'Gigantfelt i Kasakhstan, operert av Chevron. Nøkkelen til Kasakhstans oljeprosperitiet.' },
    { id: 'kashagan', name: 'Kashagan', country: 'Kasakhstan', type: 'oil', mbpd: 0.5, coordinates: [51.5, 45.5], description: 'Verdens største oppdagelse på 30 år da det ble funnet i 2000. Ekstremt komplisert å utvinne.' },
    { id: 'shtokman', name: 'Shtokman', country: 'Russland', type: 'gas', mbpd: 0.0, coordinates: [44.5, 73.0], description: 'Gigantisk gassfelt i Barentshavet. Ennå ikke utbygd pga høye kostnader.' },

    // Americas
    { id: 'permian', name: 'Permiabasseng', country: 'USA', type: 'both', mbpd: 6.2, coordinates: [-102.5, 32.0], description: 'USAs motor i oljeboomet. Skiferolje har gjort USA til verdens største oljeprodusent.' },
    { id: 'eagle-ford', name: 'Eagle Ford Shale', country: 'USA', type: 'both', mbpd: 1.1, coordinates: [-98.5, 28.5], description: 'Viktig skiferbassin i Texas. Særlig kjent for kondensatproduksjon.' },
    { id: 'bakken', name: 'Bakken Shale', country: 'USA', type: 'oil', mbpd: 1.2, coordinates: [-103.0, 47.5], description: 'North Dakotas skiferoljefelt. Sentrum for USAs oljeboom fra 2010-tallet.' },
    { id: 'prudhoe-bay', name: 'Prudhoe Bay', country: 'USA', type: 'oil', mbpd: 0.4, coordinates: [-148.5, 70.3], description: 'Nordamerikas største oljefelt, oppdaget i 1968. Startpunktet for Trans-Alaska Pipeline.' },
    { id: 'athabasca', name: 'Athabasca oljesander', country: 'Canada', type: 'oil', mbpd: 3.3, coordinates: [-111.0, 57.2], description: 'Verdens største reservoar av oljesander. Svært energikrevende og omdiskutert utvinning.' },
    { id: 'frade', name: 'Pre-salt Brasil', country: 'Brasil', type: 'oil', mbpd: 1.8, coordinates: [-38.0, -22.5], description: 'Brasilias "blå Amazonia". Pre-saltfeltene under Atlanterhavet er Sør-Amerikas fremtid.' },
    { id: 'orinoco', name: 'Orinoco-beltet', country: 'Venezuela', type: 'oil', mbpd: 0.8, coordinates: [-63.0, 8.0], description: 'Verdens største reserver av tungolje. Krevende å utvinne, men Venezuela sitter på mer olje enn noe annet land.' },
    { id: 'lula', name: 'Lula (Tupi)', country: 'Brasil', type: 'oil', mbpd: 1.1, coordinates: [-42.5, -24.5], description: 'Brasilias største offshore-felt, oppdaget i 2006. Startskudd for pre-salt-epoken.' },

    // Africa
    { id: 'jubilee', name: 'Jubilee', country: 'Ghana', type: 'oil', mbpd: 0.1, coordinates: [-2.5, 4.5], description: 'Ghanas første store offshore-funn, i produksjon siden 2010.' },
    { id: 'agbami', name: 'Agbami', country: 'Nigeria', type: 'oil', mbpd: 0.2, coordinates: [2.5, 3.0], description: 'Dypvanns-felt i Nigerdeltaet. Nigeria er Afrikas største oljeprodusent.' },
    { id: 'hassi-messaoud', name: 'Hassi Messaoud', country: 'Algerie', type: 'oil', mbpd: 0.3, coordinates: [6.1, 31.7], description: 'Algerias viktigste oljefelt, i produksjon siden 1958. Grunnlaget for algerisk økonomi.' },
    { id: 'hassi-rmel', name: 'Hassi R\'Mel', country: 'Algerie', type: 'gas', mbpd: 0.5, coordinates: [3.3, 32.9], description: 'Afrikas største gassfelt. Forsyner Europa via rørledninger gjennom Tunisia og Marokko.' },
    { id: 'libyan-fields', name: 'Sirte-basseng', country: 'Libya', type: 'oil', mbpd: 1.2, coordinates: [17.0, 29.0], description: 'Libya sitter på Afrikas største oljereserver, men politisk ustabilitet hindrer full produksjon.' },
    { id: 'angola-deepwater', name: 'Deepwater Angola (Block 15/17)', country: 'Angola', type: 'oil', mbpd: 1.1, coordinates: [8.0, -9.5], description: 'Angolas offshore-blokker er noen av Afrikas mest produktive dypvannsfelt.' },
    { id: 'rovuma', name: 'Rovuma LNG', country: 'Mosambik', type: 'gas', mbpd: 0.0, coordinates: [40.8, -10.7], description: 'Potensielt gigantisk LNG-felt under utbygging. Sikkerhetssituasjonen er kritisk.' },
    { id: 'turkana', name: 'Lokichar Basin', country: 'Kenya', type: 'oil', mbpd: 0.0, coordinates: [35.9, 2.6], description: 'Nylig oppdaget. Østafrikas potensielle kommende olje-"suksess-story" — avhenger av rørledning.' },

    // Asia-Pacific
    { id: 'daqing', name: 'Daqing', country: 'Kina', type: 'oil', mbpd: 0.8, coordinates: [125.0, 46.6], description: 'Kinas viktigste oljefelt i over 60 år. Et symbol på kinesisk industriell mobilisering under Mao.' },
    { id: 'tarim', name: 'Tarim-basseng', country: 'Kina', type: 'gas', mbpd: 0.3, coordinates: [85.0, 39.5], description: 'Kinas største gassbasseng i Xinjiang. Kjernen i Vest-Øst-gassledningen.' },
    { id: 'minas', name: 'Minas', country: 'Indonesia', type: 'oil', mbpd: 0.1, coordinates: [101.5, 1.2], description: 'Sumatras eldste og historisk viktigste oljefelt. Indonesias produksjon faller.' },
    { id: 'maui', name: 'Maui', country: 'New Zealand', type: 'gas', mbpd: 0.0, coordinates: [173.0, -39.5], description: 'New Zealands viktigste gassfelt, nesten utpint etter 50 år i produksjon.' },
    { id: 'karachaganak', name: 'Karachaganak', country: 'Kasakhstan', type: 'both', mbpd: 0.23, coordinates: [58.9, 50.5], description: 'Kombinert olje- og gassfelt i nordvestre Kasakhstan.' },
    { id: 'north-west-shelf', name: 'North West Shelf LNG', country: 'Australia', type: 'gas', mbpd: 0.5, coordinates: [114.5, -21.5], description: 'Australias viktigste LNG-eksportanlegg, og en av verdens største LNG-produsenter.' },
    { id: 'ichthys', name: 'Ichthys LNG', country: 'Australia', type: 'gas', mbpd: 0.3, coordinates: [124.0, -12.5], description: 'Japanske INPEX sin Australsk gassgigant. Exporteres primært til Japan.' },

    // Norway / North Sea
    { id: 'ekofisk', name: 'Ekofisk', country: 'Norge', type: 'both', mbpd: 0.22, coordinates: [3.2, 56.5], description: 'Norges første store oljefunn (1969). Starten på den norske oljeeventyret.' },
    { id: 'troll', name: 'Troll', country: 'Norge', type: 'both', mbpd: 0.35, coordinates: [3.7, 60.6], description: 'Verdens største offshore-naturgassfelt og Norges viktigste enkeltfelt.' },
    { id: 'statfjord', name: 'Statfjord', country: 'Norge', type: 'oil', mbpd: 0.15, coordinates: [1.9, 61.2], description: 'Historisk svært viktig norsk felt. Drevet av Equinor med britiske interesser.' },
    { id: 'oseberg', name: 'Oseberg', country: 'Norge', type: 'both', mbpd: 0.12, coordinates: [2.8, 60.5], description: 'En av Norges viktigste oljefelt, delvis modent men fremdeles i produksjon.' },
    { id: 'johan-sverdrup', name: 'Johan Sverdrup', country: 'Norge', type: 'oil', mbpd: 0.75, coordinates: [2.6, 58.8], description: 'Norges nye store. Oppdaget 2010, produksjon fra 2019. Lavest CO₂-intensitet blant store felt.' },
];
