import type { Exercise } from '../types';

export const inMediasResExercises: Exercise[] = [
    // === NIVÅ 1 ===
    {
        id: 'imr-1-1',
        deviceId: 'in-medias-res',
        level: 1,
        instruction: 'Hvilket virkemiddel er brukt?',
        data: {
            type: 'identify',
            text: '"Løp!" skrek han og kastet seg ned bak muren.',
            options: [
                { deviceId: 'in-medias-res', label: 'In medias res', correct: true, feedback: 'Riktig! Vi kastes rett inn i en dramatisk handling uten forklaring. Det er in medias res.' },
                { deviceId: 'frampek', label: 'Frampek', correct: false, feedback: 'Nei, et frampek antyder noe som skal skje. Her er vi allerede midt i handlingen.' },
                { deviceId: 'personifisering', label: 'Personifisering', correct: false, feedback: 'Nei, det er mennesker som handler her, ikke gjenstander.' },
                { deviceId: 'kontrast', label: 'Kontrast', correct: false, feedback: 'Nei, det er ingen motsetninger her - bare ren action.' },
            ],
        },
    },
    {
        id: 'imr-1-2',
        deviceId: 'in-medias-res',
        level: 1,
        instruction: 'Hvilket virkemiddel er brukt?',
        data: {
            type: 'identify',
            text: 'Blodet rant nedover armen hennes. Hun visste ikke hvor lenge hun hadde løpt.',
            options: [
                { deviceId: 'in-medias-res', label: 'In medias res', correct: true, feedback: 'Riktig! Vi starter midt i en dramatisk situasjon uten å vite hva som har skjedd for.' },
                { deviceId: 'tilbakeblikk', label: 'Tilbakeblikk', correct: false, feedback: 'Nei, vi starter i nåtiden - det er ingen hopp tilbake.' },
                { deviceId: 'besjeling', label: 'Besjeling', correct: false, feedback: 'Nei, det er mennesker og virkelige hendelser her.' },
                { deviceId: 'symbol', label: 'Symbol', correct: false, feedback: 'Nei, blodet er bokstavelig her, ikke symbolsk.' },
            ],
        },
    },
    {
        id: 'imr-1-3',
        deviceId: 'in-medias-res',
        level: 1,
        instruction: 'Marker åpningen som bruker in medias res.',
        data: {
            type: 'highlight',
            text: '"Gi meg pengene!" hvisket stemmen bak henne. Hun frøs.',
            correctRanges: [
                { words: '"Gi meg pengene!" hvisket stemmen bak henne. Hun frøs.', explanation: 'Hele åpningen er in medias res - vi er midt i et ran uten å vite konteksten.' },
            ],
        },
    },
    {
        id: 'imr-1-4',
        deviceId: 'in-medias-res',
        level: 1,
        instruction: 'Hvilken åpning bruker in medias res?',
        data: {
            type: 'identify',
            text: 'A: "Det var en gang en jente som het Nora." B: "Vannet steg forbi knærne hennes. Hun ropte, men ingen hørte."',
            options: [
                { deviceId: 'in-medias-res', label: 'Åpning B', correct: true, feedback: 'Riktig! Åpning B kaster oss rett inn i en faresituasjon. Åpning A begynner kronologisk med bakgrunn.' },
                { deviceId: 'in-medias-res', label: 'Åpning A', correct: false, feedback: 'Nei, "Det var en gang" er en klassisk kronologisk start. Åpning B starter midt i handlingen.' },
                { deviceId: 'in-medias-res', label: 'Begge to', correct: false, feedback: 'Nei, bare B starter midt i handlingen. A begynner med bakgrunn.' },
                { deviceId: 'in-medias-res', label: 'Ingen av dem', correct: false, feedback: 'Nei, åpning B er et tydelig eksempel på in medias res.' },
            ],
        },
    },

    // === NIVÅ 2 ===
    {
        id: 'imr-2-1',
        deviceId: 'in-medias-res',
        level: 2,
        instruction: 'Hva er effekten av in medias res her?',
        data: {
            type: 'explain',
            text: '"Du kan ikke gjøre dette!" ropte hun og slo neven i bordet. Glasset veltet. Alle i rommet ble stille.',
            highlightedWords: 'Du kan ikke gjøre dette',
            question: 'Hva oppnår forfatteren med å starte slik?',
            options: [
                { text: 'Vi kastes inn i en konflikt og får lyst til å lese videre for å forstå hva som skjer og hvorfor', correct: true, feedback: 'Riktig! In medias res skaper umiddelbar spenning. Vi lurer: Hvem er hun? Hva kan "du" ikke gjøre? Hvorfor er hun så sint?' },
                { text: 'At hun er en sint person', correct: false, feedback: 'Vi vet ikke nok til å si det. Poenget er at vi kastes inn i en situasjon og vil vite mer.' },
                { text: 'At glasset gikk i stykker', correct: false, feedback: 'Glasset er en detalj. Den større effekten er at vi starter midt i en dramatisk scene.' },
            ],
        },
    },
    {
        id: 'imr-2-2',
        deviceId: 'in-medias-res',
        level: 2,
        instruction: 'Hvilket virkemiddel er brukt?',
        data: {
            type: 'identify',
            text: 'Bilen lå på taket midt i veien. Damp steg opp fra motoren. Et barn gråt i baksetet.',
            options: [
                { deviceId: 'in-medias-res', label: 'In medias res', correct: true, feedback: 'Riktig! Vi starter etter ulykken har skjedd. Vi vet ikke hva som forårsaket den - vi er midt i resultatet.' },
                { deviceId: 'frampek', label: 'Frampek', correct: false, feedback: 'Nei, et frampek antyder noe som skal skje. Her har det allerede skjedd.' },
                { deviceId: 'kontrast', label: 'Kontrast', correct: false, feedback: 'Nei, det er ingen motsetninger som settes opp mot hverandre.' },
                { deviceId: 'besjeling', label: 'Besjeling', correct: false, feedback: 'Nei, alt her er bokstavelig beskrevet.' },
            ],
        },
    },
    {
        id: 'imr-2-3',
        deviceId: 'in-medias-res',
        level: 2,
        instruction: 'Hvilket virkemiddel er brukt?',
        data: {
            type: 'identify',
            text: 'Forst bodde de i Oslo, så flyttet de til Bergen, og til slutt havnet de i Tromso.',
            options: [
                { deviceId: 'in-medias-res', label: 'Ingen spesielt virkemiddel', correct: true, feedback: 'Riktig! Dette er en kronologisk fortelling (først, så, til slutt). Det er IKKE in medias res - det starter fra begynnelsen.' },
                { deviceId: 'in-medias-res', label: 'In medias res', correct: false, feedback: 'Nei! In medias res starter midt i handlingen. Her fortelles historien kronologisk fra start.' },
                { deviceId: 'gjentakelse', label: 'Gjentakelse', correct: false, feedback: 'Nei, selv om de flytter flere ganger, er det ikke gjentakelse som virkemiddel.' },
                { deviceId: 'frampek', label: 'Frampek', correct: false, feedback: 'Nei, det er ingen hint om noe som skal skje.' },
            ],
        },
    },

    // === NIVÅ 3 ===
    {
        id: 'imr-3-1',
        deviceId: 'in-medias-res',
        level: 3,
        instruction: 'Hva er den fulle effekten av in medias res her?',
        data: {
            type: 'explain',
            text: 'Hun våknet med sand i munnen og salt i øynene. Bølgene slo inn over bena hennes. Noe hardt og kaldt lå i hånden hennes - en nøkkel.',
            highlightedWords: 'Hun våknet med sand i munnen',
            question: 'Hvilken effekt har in medias res her?',
            options: [
                { text: 'Det skaper umiddelbar mystikk - leseren vil vite: Hvorfor ligger hun på stranden? Hva er nøkkelen til? Hva har skjedd?', correct: true, feedback: 'Riktig! In medias res gir oss tre mysterier på en gang: plasseringen, tilstanden og nøkkelen. Leseren er fanget.' },
                { text: 'At hun liker å svømme', correct: false, feedback: 'Nei, hun har tydelig ikke valgt å være der. Sand i munnen og salt i øynene antyder noe dramatisk.' },
                { text: 'At det er sommer', correct: false, feedback: 'Årstiden er irrelevant. Poenget er at vi starter midt i en mystisk situasjon.' },
            ],
        },
    },
    {
        id: 'imr-3-2',
        deviceId: 'in-medias-res',
        level: 3,
        instruction: 'Koble hvert eksempel med riktig virkemiddel.',
        data: {
            type: 'match',
            pairs: [
                { example: 'Kniven falt i gulvet med et klirr. Han så ned på hendene sine.', label: 'In medias res' },
                { example: 'Han visste ikke at dette var den siste kvelden.', label: 'Frampek' },
                { example: 'Hun tenkte tilbake på barndommen i den lille bygda.', label: 'Tilbakeblikk' },
                { example: 'Nei. Nei. Nei, det var ikke sant.', label: 'Gjentakelse' },
            ],
        },
    },
    {
        id: 'imr-3-3',
        deviceId: 'in-medias-res',
        level: 3,
        instruction: 'Marker in medias res-åpningen. Andre virkemidler finnes også!',
        data: {
            type: 'highlight',
            text: 'Glasskårene knaste under skoene hans som knust is. Rommet luktet av royk. Han ropte navnet hennes igjen og igjen.',
            correctRanges: [
                { words: 'Glasskårene knaste under skoene hans', explanation: 'In medias res - vi starter midt i en dramatisk scene uten forklaring. (Merk: "som knust is" er sammenligning, "igjen og igjen" er gjentakelse.)' },
            ],
        },
    },

    // === NIVÅ 4 ===
    {
        id: 'imr-4-1',
        deviceId: 'in-medias-res',
        level: 4,
        instruction: 'Skriv en åpning med in medias res.',
        data: {
            type: 'write',
            prompt: 'Skriv en åpning på 1-3 setninger som kaster leseren rett inn i handlingen. Leseren skal ikke vite hvem personene er, hvor de er, eller hva som har skjedd - bare at noe dramatisk pågår.',
            hint: 'Start med en handling, en lyd, eller en følelse. Ikke forklar noe. La leseren lure.',
            exampleAnswer: 'Døren smalt igjen bak ham. Hjertet hamret. Nøklene - hvor var nøklene?',
        },
    },
    {
        id: 'imr-4-2',
        deviceId: 'in-medias-res',
        level: 4,
        instruction: 'Fyll inn en åpning som bruker in medias res.',
        data: {
            type: 'fill-blank',
            textBefore: '',
            textAfter: ' Hun visste ikke hvor lenge hun hadde løpt, men bena begynte å svikte.',
            correctAnswers: ['Pusten brant i halsen.', 'Grenene slo mot ansiktet hennes.', 'Skrittene bak henne kom nærmere.', 'Hjertet hamret i brystet.'],
            acceptKeywords: ['pust', 'hjerte', 'løp', 'skritt', 'bena', 'svette', 'skrek', 'mørk', 'smerte', 'blod', 'falt'],
            hint: 'Start midt i handlingen med en fysisk, sanselig beskrivelse. Hva føler kroppen akkurat nå?',
            explanation: 'En god in medias res-åpning starter med noe fysisk og umiddelbart - pust, smerte, bevegelse. Vi er midt i handlingen uten forklaring.',
        },
    },
    {
        id: 'imr-4-3',
        deviceId: 'in-medias-res',
        level: 4,
        instruction: 'Skriv om denne vanlige åpningen til in medias res.',
        data: {
            type: 'write',
            prompt: 'Denne åpningen er kronologisk og kjedelig: "Erik var en gutt på 14 år som bodde i Oslo. En dag bestemte han seg for å utforske den gamle fabrikken." Skriv den om slik at den starter midt i handlingen (in medias res).',
            hint: 'Hopp over all bakgrunnsinfo. Start med det mest spennende øyeblikket - hva skjer inne i fabrikken?',
            exampleAnswer: 'Gulvet knakte under føttene hans. Et sted i mørket foran ham klirret noe i metall. Erik holdt pusten og lyste med telefonen inn i det svarte rommet.',
        },
    },

    // === NIVÅ 5 ===
    {
        id: 'imr-5-1',
        deviceId: 'in-medias-res',
        level: 5,
        instruction: 'Finn feilen i denne analysen av in medias res.',
        data: {
            type: 'find-error',
            text: '"Det var en gang en gutt som het Ola. Ola bodde på en gård langt nord i landet."',
            errorDescription: 'En elev har analysert denne teksten. Hvilken påstand er feil?',
            options: [
                { text: 'Denne åpningen bruker in medias res fordi vi ikke vet hva som skal skje med Ola', correct: true, feedback: 'Riktig, dette er feil! In medias res betyr å starte midt i handlingen. "Det var en gang" er det stikk motsatte - en kronologisk start med bakgrunnsinformasjon.' },
                { text: 'Åpningen gir oss bakgrunnsinformasjon om Ola før handlingen starter', correct: false, feedback: 'Riktig analyse! "Det var en gang" og beskrivelsen av hvor han bor er eksposisjon, ikke handling.' },
                { text: 'En in medias res-versjon ville startet med noe som skjer, for eksempel en dramatisk hendelse på gården', correct: false, feedback: 'Riktig analyse! In medias res ville hoppet over bakgrunnen og startet med action.' },
            ],
        },
    },
    {
        id: 'imr-5-2',
        deviceId: 'in-medias-res',
        level: 5,
        instruction: 'Sant eller usant?',
        data: {
            type: 'true-false',
            statement: 'In medias res betyr at forfatteren aldri forklarer bakgrunnen til historien.',
            correct: false,
            explanation: 'Usant! In medias res betyr at historien starter midt i handlingen, men bakgrunnen kan forklares etterpå gjennom tilbakeblikk, dialog eller tanker. Poenget er bare at man ikke begynner med bakgrunnen.',
        },
    },
    {
        id: 'imr-5-3',
        deviceId: 'in-medias-res',
        level: 5,
        instruction: 'Finn feilen i analysen.',
        data: {
            type: 'find-error',
            text: 'Skoene hans var gjennomvåte. Jakka var revet i stykker. Han banket på døren med blodige knoker.',
            errorDescription: 'En elev har skrevet tre påstander. Hvilken er feil?',
            options: [
                { text: 'Det er in medias res fordi vi starter midt i en situasjon uten å vite hva som har skjedd', correct: false, feedback: 'Riktig analyse! Vi vet ingenting om bakgrunnen - vi er midt i noe dramatisk.' },
                { text: 'In medias res skaper spenning fordi leseren vil vite: Hvem er han? Hva har skjedd? Hvem bor bak døren?', correct: false, feedback: 'Riktig analyse! De ubesvarte spørsmålene er nettopp det som driver leseren videre.' },
                { text: 'Det er frampek fordi vi skjønner at noe kommer til å skje når døren åpner seg', correct: true, feedback: 'Riktig, dette er feil! Vi er midt i noe som allerede har skjedd. At vi lurer på hva som skjer videre er spenning, ikke frampek. Et frampek ville vært en bevisst hint fra forfatteren.' },
            ],
        },
    },

    // === NIVÅ 6 ===
    {
        id: 'imr-6-1',
        deviceId: 'in-medias-res',
        level: 6,
        instruction: 'Marker in medias res-elementene i denne lengre teksten.',
        data: {
            type: 'highlight',
            text: 'Røyken brant i lungene hennes. Noe krasjet i etasjen under, og gulvet skalv. "Er det noen her?" ropte hun inn i mørket. Ingen svarte. Hun husket at moren hadde sagt "bare en vanlig dag på jobben" da hun gikk hjemmefra den morgenen. Vanlig dag. Hun klatret over den velten pulten og prøvde å finne vinduet.',
            correctRanges: [
                { words: 'Røyken brant i lungene hennes. Noe krasjet i etasjen under, og gulvet skalv.', explanation: 'In medias res: Vi kastes rett inn i en brann eller eksplosjon. Ingen forklaring, bare kaos.' },
                { words: '"Er det noen her?" ropte hun inn i mørket. Ingen svarte.', explanation: 'Fortsatt in medias res: Vi opplever situasjonen i sanntid, uten å vite hva som har skjedd eller hvor hun er.' },
            ],
        },
    },
    {
        id: 'imr-6-2',
        deviceId: 'in-medias-res',
        level: 6,
        instruction: 'Forklar effekten av in medias res i denne åpningen.',
        data: {
            type: 'explain',
            text: 'Stolen veltet. Tallerkenen knuste mot gulvet. "Du lovte!" skrek hun. Han sa ingenting. Han bare tok jakka og gikk. Døren smalt. Det ble stille. Maten ble kald på bordet mellom dem - eller der han hadde sittet, i hvert fall.',
            highlightedWords: 'Stolen veltet. Tallerkenen knuste mot gulvet.',
            question: 'Hvorfor er denne in medias res-åpningen så effektiv?',
            options: [
                { text: 'Vi kastes inn i et krangel uten å vite hva løftet var, hvem personene er, eller hva forholdet deres er. De raske, korte setningene gjør at vi føler kaoset. Når han går, sitter vi igjen med henne og alle de ubesvarte spørsmålene.', correct: true, feedback: 'Riktig! In medias res gjør at leseren opplever krangelen like plutselig som den som er igjen. De korte setningene forsterker tempoet, og alle spørsmålene (hvem, hva, hvorfor) driver leseren videre.' },
                { text: 'Fordi det er spennende med mat', correct: false, feedback: 'Maten er en detalj som forsterker tomheten etter at han gikk. Poenget er at vi kastes inn i en dramatisk scene.' },
                { text: 'Fordi vi liker krangel', correct: false, feedback: 'Det handler ikke om å like krangel, men om at in medias res gjør at vi føler scenen intenst og vil vite mer.' },
            ],
        },
    },
    {
        id: 'imr-6-3',
        deviceId: 'in-medias-res',
        level: 6,
        instruction: 'Marker in medias res. Pass på - det er andre virkemidler også!',
        data: {
            type: 'highlight',
            text: 'Hendene hennes skalv som løv i vind. Passet lå åpent på gulvet mellom dem. "Hvem er du egentlig?" hvisket han. Hun hadde ikke noe svar. Klokken på veggen tikket videre som om ingenting hadde skjedd. Tjue år med løgner lå strødd utover stuegulvet som gamle aviser.',
            correctRanges: [
                { words: 'Hendene hennes skalv', explanation: 'In medias res: Vi starter midt i en intens scene. Hendene skalver - noe dramatisk skjer.' },
                { words: 'Passet lå åpent på gulvet mellom dem. "Hvem er du egentlig?" hvisket han.', explanation: 'In medias res fortsetter: Vi vet ikke hvem de er, hvorfor passet er viktig, eller hva som er avslørt. Alt er midt i handlingen. (Merk: "som løv i vind" er sammenligning, "som gamle aviser" er sammenligning, klokken som tikker er besjeling/kontrast.)' },
            ],
        },
    },

    // === NIVÅ 7 ===
    {
        id: 'imr-7-1',
        deviceId: 'in-medias-res',
        level: 7,
        instruction: 'Koble hver åpning med riktig virkemiddel.',
        data: {
            type: 'match',
            pairs: [
                { example: 'Kulen traff veggen like over hodet hans. Han kastet seg til siden.', label: 'In medias res' },
                { example: 'Det var en mørk og stormfull natt i november 1942.', label: 'Kronologisk åpning' },
                { example: 'Han visste ikke at dette var den siste gangen han så henne.', label: 'Frampek' },
                { example: 'For å forstå denne historien må vi tilbake til sommeren 1985.', label: 'Tilbakeblikk' },
                { example: 'Ambulansen svingte inn på parkeringsplassen. To paramedisinere løp mot inngangen.', label: 'In medias res' },
                { example: 'Denne historien handler om en jente som heter Sara.', label: 'Kronologisk åpning' },
            ],
        },
    },
    {
        id: 'imr-7-2',
        deviceId: 'in-medias-res',
        level: 7,
        instruction: 'Sorter åpningene i riktig kategori.',
        data: {
            type: 'sort',
            categories: [
                { id: 'imr', label: 'In medias res' },
                { id: 'ikke-imr', label: 'Ikke in medias res' },
            ],
            items: [
                { text: 'Bremsen hylte. Bilen snurret rundt. Alt ble svart.', categoryId: 'imr' },
                { text: 'Maria var 15 år og bodde i Tromsø med familien sin.', categoryId: 'ikke-imr' },
                { text: '"Slipp meg!" Han sparket seg løs og løp.', categoryId: 'imr' },
                { text: 'Denne historien finner sted i en liten by ved kysten.', categoryId: 'ikke-imr' },
                { text: 'Vannet nådde henne til livet. Døren var låst.', categoryId: 'imr' },
                { text: 'For lenge, lenge siden levde det en trollmann i fjellet.', categoryId: 'ikke-imr' },
            ],
        },
    },
    {
        id: 'imr-7-3',
        deviceId: 'in-medias-res',
        level: 7,
        instruction: 'Sant eller usant?',
        data: {
            type: 'true-false',
            statement: 'In medias res kan bare brukes i begynnelsen av en tekst.',
            correct: false,
            explanation: 'Usant! Selv om in medias res vanligvis brukes i begynnelsen av en fortelling, kan teknikken også brukes i starten av nye kapitler eller scener. Forfatteren kan "kaste oss inn" i en ny situasjon flere ganger i løpet av en tekst.',
        },
    },

    // === NIVÅ 8 ===
    {
        id: 'imr-8-1',
        deviceId: 'in-medias-res',
        level: 8,
        instruction: 'Sorter eksemplene etter hva slags effekt in medias res skaper.',
        data: {
            type: 'sort',
            categories: [
                { id: 'action', label: 'Fysisk spenning (action)' },
                { id: 'mystikk', label: 'Mystikk og undring' },
                { id: 'emosjonelt', label: 'Emosjonell intensitet' },
            ],
            items: [
                { text: 'Eksplosjonen kastet ham gjennom vinduet. Glass regnet over asfalten.', categoryId: 'action' },
                { text: 'Han våknet i et rom han aldri hadde sett før. På bordet lå et bilde av ham selv som barn.', categoryId: 'mystikk' },
                { text: '"Jeg elsker deg," sa hun. "Men jeg kan ikke bli."', categoryId: 'emosjonelt' },
                { text: 'Kniven stakk ut av dekket. Han hadde fire minutter.', categoryId: 'action' },
                { text: 'Brevet var skrevet med hennes håndskrift. Men hun hadde vært død i tre år.', categoryId: 'mystikk' },
                { text: 'Hun holdt det nyfødte barnet og visste at hun aldri ville se det igjen.', categoryId: 'emosjonelt' },
            ],
        },
    },
    {
        id: 'imr-8-2',
        deviceId: 'in-medias-res',
        level: 8,
        instruction: 'Koble åpningen med den beste forklaringen på hvorfor den fungerer.',
        data: {
            type: 'match',
            pairs: [
                { example: 'Alarmen gikk. Røde lys blinket. Alle løp mot utgangen.', label: 'Korte setninger og kaos gjør at leseren føler panikken' },
                { example: 'Han satt i vitneboksen. Hendene skalv. "Fortell oss hva du så," sa dommeren.', label: 'Vi vet ikke hva han har sett, men vi skjønner at det er alvorlig' },
                { example: 'Ryggsekken var tung. Stien var borte. Solen gikk ned.', label: 'Tre korte fakta maler et bilde av fare uten å forklare noe' },
                { example: 'Hun la blomstene på graven og sa "Beklager at det tok så lang tid."', label: 'Den emosjonelle tyngden skaper spørsmål: Hvem er begravet? Hva skjedde? Hvorfor tok det lang tid?' },
            ],
        },
    },
    {
        id: 'imr-8-3',
        deviceId: 'in-medias-res',
        level: 8,
        instruction: 'Sorter teknikkene etter hva som forsterker in medias res best.',
        data: {
            type: 'sort',
            categories: [
                { id: 'forsterker', label: 'Forsterker in medias res' },
                { id: 'svekker', label: 'Svekker in medias res' },
            ],
            items: [
                { text: 'Korte, raske setninger uten forklaring', categoryId: 'forsterker' },
                { text: 'En lang innledning som forklarer bakgrunnen', categoryId: 'svekker' },
                { text: 'Sansedetaljer: lyder, lukter, følelser', categoryId: 'forsterker' },
                { text: '"La meg fortelle deg hvordan dette startet..."', categoryId: 'svekker' },
                { text: 'Dialog midt i en konflikt', categoryId: 'forsterker' },
                { text: 'En beskrivelse av hovedpersonens utseende og alder', categoryId: 'svekker' },
            ],
        },
    },

    // === NIVÅ 9 ===
    {
        id: 'imr-9-1',
        deviceId: 'in-medias-res',
        level: 9,
        instruction: 'Skriv en in medias res-åpning som kombinerer handling med et dypere mysterium.',
        data: {
            type: 'write',
            prompt: 'Skriv en åpning på 3-5 setninger som starter midt i handlingen. Den skal ikke bare ha fysisk spenning, men også et mysterium som gjør at leseren vil forstå hva som egentlig foregår. Forklar kort etter teksten hva mysteriet er og hvilke spørsmål leseren sitter igjen med.',
            hint: 'Kombiner noe konkret og dramatisk med noe som ikke gir mening ennå. La leseren føle først, forstå etterpå.',
            exampleAnswer: 'Hun stoppet midt på broen og kastet ringen i elven. Bak henne ropte noen navnet hennes. Ikke det gamle navnet - det nye. Det hun hadde gitt seg selv den natten alt brant. (Mysterium: Hvorfor har hun byttet navn? Hva brant? Hvem roper? Hvorfor kaster hun ringen?)',
        },
    },
    {
        id: 'imr-9-2',
        deviceId: 'in-medias-res',
        level: 9,
        instruction: 'Marker in medias res og forklar hvordan det samvirker med andre virkemidler.',
        data: {
            type: 'highlight',
            text: 'Stolen var tom. Mikrofonen sto på fortsatt. Hele salen ventet. For fem minutter siden hadde han stått der og sagt: "Sannheten er-" Så hadde lyset gått. Da det kom tilbake, var han borte. Bare en lapp lå igjen på talerstolen: "Beklager. Noen ting bør forbli usagt."',
            correctRanges: [
                { words: 'Stolen var tom. Mikrofonen sto på fortsatt. Hele salen ventet.', explanation: 'In medias res: Vi starter etter at noe dramatisk har skjedd. Stolen er tom - men hvorfor? De tre korte setningene bygger spenning uten å forklare noe.' },
                { words: '"Sannheten er-" Så hadde lyset gått.', explanation: 'In medias res forsterket av avbrudd: Vi får aldri høre sannheten. Avbruddet midt i setningen er et grep som gjør in medias res-effekten enda sterkere.' },
            ],
        },
    },
    {
        id: 'imr-9-3',
        deviceId: 'in-medias-res',
        level: 9,
        instruction: 'Forklar hvordan in medias res brukes her for å skape noe mer enn bare spenning.',
        data: {
            type: 'explain',
            text: 'Hun la den siste esken i bilen og så opp på huset en siste gang. Gardinen i andre etasje beveget seg. Et lite ansikt dukket opp i vinduet og vinket. Hun løftet hånden, men klarte ikke å vinke tilbake. Motoren startet. Speilet viste huset bli mindre og mindre.',
            highlightedWords: 'Hun la den siste esken i bilen',
            question: 'Hvordan brukes in medias res her for å fortelle en emosjonell historie?',
            options: [
                { text: 'Vi kastes inn i et avskjedsøyeblikk uten å vite hvem som drar, hvem barnet er, eller hvorfor. In medias res gjør at vi føler sorgen før vi forstår den. Detaljene (esken, gardinen, det lille ansiktet, speilet) forteller historien uten at noen sier et ord. Det er en stille tragedie.', correct: true, feedback: 'Riktig! In medias res brukes ikke bare for action her, men for emosjonell intensitet. Ved å starte midt i avskjeden slipper vi alt det forklarende og føler smerten direkte. Barnet som vinker og hun som ikke klarer å vinke tilbake sier mer enn noen forklaring kunne gjort.' },
                { text: 'Fordi hun liker å flytte', correct: false, feedback: 'Alt i teksten tyder på det motsatte - hun klarer ikke engang å vinke. Dette er en smertefull avskjed.' },
                { text: 'Fordi bilen er viktig for historien', correct: false, feedback: 'Bilen er bare et middel. In medias res-effekten ligger i at vi kastes inn i en emosjonell scene uten forklaring.' },
            ],
        },
    },

    // === NIVÅ 10 ===
    {
        id: 'imr-10-1',
        deviceId: 'in-medias-res',
        level: 10,
        instruction: 'Skriv to åpninger av samme historie - en kronologisk og en in medias res - og analyser forskjellen.',
        data: {
            type: 'write',
            prompt: 'Velg en hendelse (for eksempel en ulykke, en avsløring, et gjensyn). Skriv den først som en kronologisk åpning (2-3 setninger), deretter som in medias res (2-3 setninger). Forklar kort hva som er forskjellen i effekt.',
            hint: 'Den kronologiske versjonen bør starte med bakgrunn ("det var", "hun het", "en dag"). In medias res-versjonen starter midt i det mest intense øyeblikket.',
            exampleAnswer: 'Kronologisk: "Sara var 16 år og gikk på Bergeland videregående. En dag ble hun innkalt til rektors kontor. Der fikk hun vite at faren hadde hatt en ulykke." In medias res: "Beina ga etter under henne. Rektors stemme var et sted langt borte. \'Sara, hører du meg?\' Alt hun hørte var ordet \'ulykke\' som gjentok seg i hodet." (In medias res gjør at vi føler sjokket i kroppen, ikke bare leser om det. Den kronologiske versjonen forteller, in medias res viser.)',
        },
    },
    {
        id: 'imr-10-2',
        deviceId: 'in-medias-res',
        level: 10,
        instruction: 'Marker alle lag av in medias res i denne teksten.',
        data: {
            type: 'highlight',
            text: 'Tallene på skjermen blinket rødt. 00:47. 00:46. Hun så på ledningene - blå, rød, hvit. "Klipp den blå," sa stemmen i øret. Hun tok saksen. Hendene var rolige nå, merkelig nok. Roligere enn de hadde vært da hun åpnet brevet i morges. Roligere enn da hun innså at det ikke var en trussel, men en invitasjon. 00:31. "Den blå," gjentok stemmen. Men hun husket noe bestefaren hadde sagt: "Aldri stol på den som gir deg enkle svar." Hun la ned saksen.',
            correctRanges: [
                { words: 'Tallene på skjermen blinket rødt. 00:47. 00:46.', explanation: 'In medias res: Vi starter med en nedtelling uten kontekst. Umiddelbar spenning - hva telles det ned til?' },
                { words: 'Hun så på ledningene - blå, rød, hvit. "Klipp den blå," sa stemmen i øret.', explanation: 'In medias res fortsetter: Vi vet ikke hvem stemmen er, hvorfor hun skal klippe en ledning, eller hva som skjer når tiden er ute.' },
                { words: 'da hun åpnet brevet i morges', explanation: 'Et kort glimt av bakgrunn (tilbakeblikk) som faktisk skaper flere spørsmål enn svar - typisk for avansert in medias res-bruk.' },
                { words: 'Hun la ned saksen', explanation: 'Vendepunktet: Midt i kaoset tar hun et uventet valg. In medias res gjør at vi ikke vet om dette er riktig eller katastrofalt.' },
            ],
        },
    },
    {
        id: 'imr-10-3',
        deviceId: 'in-medias-res',
        level: 10,
        instruction: 'Analyser hvordan in medias res brukes som et bevisst fortellegrep.',
        data: {
            type: 'explain',
            text: 'Det andre kapitlet i romanen begynner slik: "Begravelsen var på en tirsdag." Leseren har nettopp lest kapittel 1, der hovedpersonen spiser frokost med sin kone og planlegger ferie. Vi vet ikke hvem som er død. Vi vet ikke engang at noen var syk. Neste setning er: "Han sto ved kisten og tenkte at frokostegget hadde vært perfekt kokt den morgenen."',
            highlightedWords: 'Begravelsen var på en tirsdag',
            question: 'Analyser hvordan in medias res brukes her, og hvorfor forfatteren nevner frokostegget.',
            options: [
                { text: 'In medias res i kapittel 2 skaper sjokk fordi vi hoppet fra frokost til begravelse uten forvarsel - akkurat slik døden kan komme i virkeligheten. Frokostegget kobler de to kapitlene og viser at han sitter fast i det siste normale øyeblikket. Kontrasten mellom det hverdagslige (frokost) og det enorme (død) gjør sorgen fysisk.', correct: true, feedback: 'Riktig! Forfatteren bruker in medias res mellom kapitlene for å gjenskape følelsen av plutselig tap. Leseren opplever det samme sjokket som karakteren. Frokostegget er et genialt grep - det viser at sinnet klamrer seg til normalitet midt i sorg, og binder de to kapitlene sammen med en detalj som går fra uskyldig til hjerteskjærende.' },
                { text: 'Fordi frokost er viktig for handlingen', correct: false, feedback: 'Frokosten er ikke viktig i seg selv - den representerer det siste normale øyeblikket. Poenget er kontrasten mellom frokost og begravelse.' },
                { text: 'Fordi forfatteren har glemt å skrive hva som skjedde mellom kapitlene', correct: false, feedback: 'Det er et bevisst valg! Ved å utelate hva som skjedde, gjenskaper forfatteren sjokket for leseren. Det er avansert bruk av in medias res.' },
            ],
        },
    },
];
