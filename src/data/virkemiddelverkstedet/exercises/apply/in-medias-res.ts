import type { Exercise } from '../../types';

export const inMediasResApplyExercises: Exercise[] = [
    // NIVÅ 1 – Lærling
    {
        id: 'apply-in-medias-res-1-1',
        deviceId: 'in-medias-res',
        level: 1,
        instruction: 'Hvilken åpning bruker in medias res?',
        data: {
            type: 'identify',
            text: 'Tre ulike åpninger til en spenningshistorie. Hvilken kaster leseren rett inn i handlingen?',
            options: [
                {
                    deviceId: 'in-medias-res',
                    label: '"Blodet dryppet fra fingrene hans mens han løp gjennom mørket."',
                    correct: true,
                    feedback:
                        'Riktig! Vi er midt i en dramatisk scene fra første setning. Leseren vet ikke hva som har skjedd, men er fanget med en gang.',
                },
                {
                    deviceId: 'in-medias-res',
                    label: '"Lars var en vanlig gutt som bodde i en vanlig by."',
                    correct: false,
                    feedback:
                        'Dette er en klassisk introduksjon som starter med bakgrunn. In medias res hopper over dette.',
                },
                {
                    deviceId: 'in-medias-res',
                    label: '"Denne historien handler om noe som skjedde for mange år siden."',
                    correct: false,
                    feedback:
                        'Her forteller fortelleren om historien i stedet for å vise den. In medias res kaster oss rett inn i handlingen.',
                },
                {
                    deviceId: 'in-medias-res',
                    label: '"Det var en gang en modig ridder som levde i et stort slott."',
                    correct: false,
                    feedback:
                        '"Det var en gang" er det motsatte av in medias res. Det er en rolig, tradisjonell åpning.',
                },
            ],
        },
    },
    {
        id: 'apply-in-medias-res-1-2',
        deviceId: 'in-medias-res',
        level: 1,
        instruction: 'Hvilken åpning er sterkest for en spenningshistorie?',
        data: {
            type: 'explain',
            text: 'Du skal skrive en historie om en ungdom som er fanget i en heis som har stoppet mellom to etasjer.',
            highlightedWords: 'fanget i en heis',
            question: 'Hvilken åpning griper leseren best?',
            options: [
                {
                    text: '"Lyset blinket to ganger. Så ble alt svart. Emma presset seg mot veggen og kjente heisen riste."',
                    correct: true,
                    feedback:
                        'Riktig! Vi er rett i situasjonen. Leseren føler panikken sammen med Emma. Vi trenger ikke vite hvorfor hun er i heisen.',
                },
                {
                    text: '"Emma skulle besøke tannlegen i femte etasje. Hun gikk inn i heisen og trykket på knappen."',
                    correct: false,
                    feedback:
                        'For mye oppbygging. In medias res ville hoppet over denne hverdagslige starten og rett til dramatikken.',
                },
                {
                    text: '"Heiser har eksistert siden 1800-tallet. De fleste er trygge, men noen ganger skjer det uhell."',
                    correct: false,
                    feedback:
                        'Dette er en faktatekst, ikke en dramatisk åpning. I en fortelling vil vi oppleve, ikke bli belært.',
                },
            ],
        },
    },
    {
        id: 'apply-in-medias-res-1-3',
        deviceId: 'in-medias-res',
        level: 1,
        instruction: 'Fyll inn en dramatisk åpning som kaster leseren rett inn i handlingen.',
        data: {
            type: 'fill-blank',
            textBefore: '',
            textAfter:
                ' Han visste ikke hvor lenge han hadde ligget der, men sanden var kald og bølgene krøp nærmere.',
            correctAnswers: [
                'Han åpnet øynene',
                'Alt var hvitt',
                'Hodet dundret',
                'Vannet traff ansiktet hans',
            ],
            explanation:
                'En in medias res-åpning starter midt i noe som allerede har skjedd. Vi forstår at karakteren har vært bevisstløs på en strand. Det skaper spørsmål: Hvorfor ligger han der? Hva har skjedd?',
        },
    },

    // NIVÅ 2 – Svenn
    {
        id: 'apply-in-medias-res-2-1',
        deviceId: 'in-medias-res',
        level: 2,
        instruction: 'Skriv en in medias res-åpning for dette scenarioet.',
        data: {
            type: 'write',
            prompt: 'Scenario: En ungdom har nettopp oppdaget at bestekameraten har stjålet eksamen og skyldt på henne.\n\nSkriv 2-3 setninger som starter midt i det mest dramatiske øyeblikket. Ikke begynn med bakgrunn.',
            hint: 'Start i det øyeblikket sannheten avsløres. Hva ser, hører eller føler hovedpersonen akkurat da? Bruk korte, intense setninger.',
            exampleAnswer:
                '"Det var du," sa rektoren og snudde skjermen mot henne. Der var overvåkingsbildet: Markus, med hennes nøkkelkort. Magen hennes falt.',
        },
    },
    {
        id: 'apply-in-medias-res-2-2',
        deviceId: 'in-medias-res',
        level: 2,
        instruction: 'Koble hver åpning med sjangeren den passer best til.',
        data: {
            type: 'match',
            pairs: [
                {
                    example: '"Kulen traff veggen to centimeter fra hodet hans."',
                    label: 'Action / spenning',
                },
                {
                    example: '"Hun stirret på de to rosa strekene på testen. Hva nå?"',
                    label: 'Ungdomsdrama / realistisk',
                },
                {
                    example: '"Skipet skjelvet da den tredje motoren døde."',
                    label: 'Science fiction',
                },
                {
                    example: '"Han våknet på en strand han aldri hadde sett, kledd i klær som ikke var hans."',
                    label: 'Mysterie / thriller',
                },
            ],
        },
    },
    {
        id: 'apply-in-medias-res-2-3',
        deviceId: 'in-medias-res',
        level: 2,
        instruction: 'Skriv om denne kjedelige åpningen til in medias res.',
        data: {
            type: 'write',
            prompt: 'Original åpning: "Ali var 15 år og bodde i Oslo. En dag bestemte han seg for å klatre opp på det gamle fabrikkbygget. Det var egentlig forbudt."\n\nSkriv om dette til en in medias res-åpning (2-3 setninger). Start i det mest spennende øyeblikket.',
            hint: 'Hopp over alle forklaringer. Start der Ali allerede er på taket, eller midt i klatringen, eller i det øyeblikket noe går galt.',
            exampleAnswer:
                'Gjerdet under ham knakte. Ali presset fingrene hardere inn i mursprekkene og turte ikke se ned. Fire etasjer. Ingen visste at han var her.',
        },
    },

    // NIVÅ 3 – Mester
    {
        id: 'apply-in-medias-res-3-1',
        deviceId: 'in-medias-res',
        level: 3,
        instruction: 'Finn den svakeste in medias res-åpningen og forklar hvorfor.',
        data: {
            type: 'find-error',
            text: 'Alle tre åpningene prøver å bruke in medias res, men én av dem feiler.',
            errorDescription:
                'En av åpningene later som den starter midt i handlingen, men avslører egentlig for mye bakgrunn.',
            options: [
                {
                    text: '"Flammen tok tak i gardinen, og røyken fylte rommet på sekunder."',
                    correct: false,
                    feedback:
                        'Denne fungerer godt! Vi er midt i en brann uten forvarsel. Leseren er fanget.',
                },
                {
                    text: '"Etter å ha kranglet med moren sin i tre timer, løpt hjemmefra og tatt bussen til sentrum, sto Maria endelig foran konsertlokalet."',
                    correct: true,
                    feedback:
                        'Riktig! Denne setningen ser dramatisk ut, men den pakker inn all bakgrunnen i en eneste lang oppramsing. Ekte in medias res ville startet foran konsertlokalet og latt bakgrunnen komme gradvis.',
                },
                {
                    text: '"Brevet lå på bordet. Tre ord. Ikke kom tilbake."',
                    correct: false,
                    feedback:
                        'Effektiv in medias res! Kort, dramatisk, fullt av spørsmål. Hvem har skrevet brevet? Til hvem?',
                },
            ],
        },
    },
    {
        id: 'apply-in-medias-res-3-2',
        deviceId: 'in-medias-res',
        level: 3,
        instruction:
            'Skriv en in medias res-åpning som også fungerer som et frampek.',
        data: {
            type: 'write',
            prompt: 'Skriv 3-4 setninger som starter midt i en dramatisk hendelse, men som også gir leseren et hint om hva som vil skje senere i historien. Du kombinerer altså to virkemidler: in medias res og frampek.',
            hint: 'Start med en intens scene. Legg inn en liten detalj eller setning som leseren først forstår betydningen av mye senere. For eksempel: en gjenstand som nevnes, en setning som får ny mening.',
            exampleAnswer:
                'Vannet sto til knærne da hun fant nøkkelen. Den var liten og svart, og hun stakk den i lommen uten å tenke. Bølgene steg. Hun visste ennå ikke at den nøkkelen ville forandre alt.',
        },
    },
    {
        id: 'apply-in-medias-res-3-3',
        deviceId: 'in-medias-res',
        level: 3,
        instruction: 'Fiks denne åpningen som ikke griper leseren.',
        data: {
            type: 'write',
            prompt: 'Original: "Det var en vanlig dag. Solen skinte. Ola gikk på skolen. Plutselig eksploderte noe."\n\nDenne åpningen prøver å bygge seg opp til dramatikk, men bruker tre kjedelige setninger først. Skriv om den (2-3 setninger) slik at den starter med smellet og lar bakgrunnen komme etterpå.',
            hint: 'Begynn med eksplosjonen. Hva ser, hører og føler Ola? Så kan du legge inn en kort detalj som viser at det var en vanlig dag — kontrasten gjør det enda sterkere.',
            exampleAnswer:
                'Smellet rev Ola av føttene. Asfalten var varm mot kinnet. Sekunder tidligere hadde han gått og tenkt på matteprøven — nå hang det støv i luften og en alarm hylte et sted langt borte.',
        },
    },
];
