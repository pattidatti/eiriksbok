import type { Exercise } from '../types';

export const besjelingExercises: Exercise[] = [
    // === NIVÅ 1 ===
    {
        id: 'besj-1-1',
        deviceId: 'besjeling',
        level: 1,
        instruction: 'Hvilket virkemiddel er brukt?',
        data: {
            type: 'identify',
            text: 'Fjellet sukket tungt under snoen.',
            options: [
                { deviceId: 'besjeling', label: 'Besjeling', correct: true, feedback: 'Riktig! Fjell kan ikke sukke - det er en følelse. Besjelingen gjør fjellet levende.' },
                { deviceId: 'personifisering', label: 'Personifisering', correct: false, feedback: 'Nesten! Men å sukke handler om følelser, ikke handlinger. Det gjør det til besjeling.' },
                { deviceId: 'metafor', label: 'Metafor', correct: false, feedback: 'Nei, her får fjellet en følelse. Det er besjeling.' },
                { deviceId: 'sammenligning', label: 'Sammenligning', correct: false, feedback: 'Nei, det er ingen "som" eller "lik" her.' },
            ],
        },
    },
    {
        id: 'besj-1-2',
        deviceId: 'besjeling',
        level: 1,
        instruction: 'Hvilket virkemiddel er brukt?',
        data: {
            type: 'identify',
            text: 'Havet var sint og slo mot kaien.',
            options: [
                { deviceId: 'besjeling', label: 'Besjeling', correct: true, feedback: 'Riktig! Havet kan ikke være sint - det er en følelse. Det er besjeling!' },
                { deviceId: 'metafor', label: 'Metafor', correct: false, feedback: 'Nei, her får havet en følelse (sinne). Det er besjeling.' },
                { deviceId: 'kontrast', label: 'Kontrast', correct: false, feedback: 'Nei, det er ingen motsetninger som settes opp mot hverandre her.' },
                { deviceId: 'frampek', label: 'Frampek', correct: false, feedback: 'Nei, et frampek antyder noe som skal skje. Her beskrives havet med følelser.' },
            ],
        },
    },
    {
        id: 'besj-1-3',
        deviceId: 'besjeling',
        level: 1,
        instruction: 'Marker besjelingen i setningen.',
        data: {
            type: 'highlight',
            text: 'Den gamle bilen hostet og spyttet for den endelig startet.',
            correctRanges: [
                { words: 'hostet og spyttet', explanation: 'Bilen får menneskelige reaksjoner - hoste og spytte. Det gir bilen liv og personlighet.' },
            ],
        },
    },
    {
        id: 'besj-1-4',
        deviceId: 'besjeling',
        level: 1,
        instruction: 'Marker besjelingen.',
        data: {
            type: 'highlight',
            text: 'Solen var trist den dagen og gjemte seg bak skyene.',
            correctRanges: [
                { words: 'trist', explanation: 'Solen kan ikke være trist - det er en følelse. Besjelingen skaper en melankolsk stemning.' },
            ],
        },
    },

    // === NIVÅ 2 ===
    {
        id: 'besj-2-1',
        deviceId: 'besjeling',
        level: 2,
        instruction: 'Hva betyr besjelingen her?',
        data: {
            type: 'explain',
            text: 'Huset virket ensomt etter at familien flyttet.',
            highlightedWords: 'ensomt',
            question: 'Hva oppnår forfatteren med å si at huset er "ensomt"?',
            options: [
                { text: 'Det forsterker stemningen av tap og tomhet - huset speiler savnet etter familien', correct: true, feedback: 'Riktig! Huset får følelsen "ensom" for å forsterke at det er tomt og forlatt. Stemningen smitter over på leseren.' },
                { text: 'At huset har følelser og kan tenke', correct: false, feedback: 'Nei, vi vet at hus ikke kan føle. Poenget er stemningen det skaper, ikke bokstavelig mening.' },
                { text: 'At huset er det eneste huset i gaten', correct: false, feedback: 'Nei, "ensomt" brukes billedlig her - det handler om følelsen av tap.' },
            ],
        },
    },
    {
        id: 'besj-2-2',
        deviceId: 'besjeling',
        level: 2,
        instruction: 'Hvilket virkemiddel er mest fremtredende?',
        data: {
            type: 'identify',
            text: 'Stormen raste og skrek hele natten. Trærne skalv av frykt.',
            options: [
                { deviceId: 'besjeling', label: 'Besjeling', correct: true, feedback: 'Riktig! Stormen "raste og skrek" (følelser/lyder) og trærne "skalv av frykt" (følelse). Naturen får liv og følelser.' },
                { deviceId: 'personifisering', label: 'Personifisering', correct: false, feedback: 'Nesten! Men fokuset er på følelser (sinne, frykt), ikke handlinger. Det gjør det til besjeling.' },
                { deviceId: 'gjentakelse', label: 'Gjentakelse', correct: false, feedback: 'Nei, selv om det er to setninger med besjeling, er det ikke gjentakelse av ord.' },
                { deviceId: 'sammenligning', label: 'Sammenligning', correct: false, feedback: 'Nei, det er ingen sammenligningsord her.' },
            ],
        },
    },
    {
        id: 'besj-2-3',
        deviceId: 'besjeling',
        level: 2,
        instruction: 'Marker besjelingen i teksten.',
        data: {
            type: 'highlight',
            text: 'Blomstene jublet da regnet endelig kom etter den lange torkesommeren.',
            correctRanges: [
                { words: 'jublet', explanation: 'Blomster kan ikke juble - det er en følelse av glede. Besjelingen gjør at vi forstår at regnet var velkomment.' },
            ],
        },
    },

    // === NIVÅ 3 ===
    {
        id: 'besj-3-1',
        deviceId: 'besjeling',
        level: 3,
        instruction: 'Hva oppnår besjelingen her?',
        data: {
            type: 'explain',
            text: 'Vinteren hadde lagt hele bygda i dvale. Selv elvene hadde mistet stemmen sin.',
            highlightedWords: 'mistet stemmen sin',
            question: 'Hva er effekten av at elvene "mister stemmen"?',
            options: [
                { text: 'Det skaper et bilde av total stillhet - naturen er frosset og taus, som om alt liv har stoppet opp', correct: true, feedback: 'Riktig! Elver som "mister stemmen" betyr at de er frosset. Besjelingen gjør stillheten personlig og dramatisk - det er ikke bare kaldt, det er taust.' },
                { text: 'At elvene har tørket ut', correct: false, feedback: 'Nei, konteksten er vinter. Elvene er frosset, ikke tørre. "Stemmen" er lyden av rennende vann.' },
                { text: 'At det er mye snø', correct: false, feedback: 'Delvis riktig, men poenget er besjelingens effekt - elvene behandles som levende vesener som har blitt tause.' },
            ],
        },
    },
    {
        id: 'besj-3-2',
        deviceId: 'besjeling',
        level: 3,
        instruction: 'Koble hvert eksempel med riktig virkemiddel.',
        data: {
            type: 'match',
            pairs: [
                { example: 'Det gamle huset var trist og forlatt.', label: 'Besjeling' },
                { example: 'Dora hilste på dem med en lang knirking.', label: 'Personifisering' },
                { example: 'Huset var en festning mot omverdenen.', label: 'Metafor' },
                { example: 'Huset var like grått som himmelen over det.', label: 'Sammenligning' },
            ],
        },
    },
    {
        id: 'besj-3-3',
        deviceId: 'besjeling',
        level: 3,
        instruction: 'Marker kun besjelingen. Her finnes andre virkemidler også!',
        data: {
            type: 'highlight',
            text: 'Regnet gråt stille mot vinduet. Hun satt som en statue og stirret ut.',
            correctRanges: [
                { words: 'gråt', explanation: 'Regn kan ikke gråte - det er besjeling. (Merk: "som en statue" er en sammenligning, ikke besjeling.)' },
            ],
        },
    },

    // === NIVÅ 4 (Skribent) ===
    {
        id: 'besj-4-1',
        deviceId: 'besjeling',
        level: 4,
        instruction: 'Skriv en setning med besjeling der du gir et livløst objekt en følelse.',
        data: {
            type: 'write',
            prompt: 'Bruk besjeling for å beskrive en gammel sykkel som står forlatt. Gi sykkelen en følelse - ikke en menneskelig handling.',
            hint: 'Tenk på følelser: ensom, trist, lei seg, såret, redd, skuffet. Husk at besjeling handler om følelser, ikke handlinger.',
            exampleAnswer: 'Den gamle sykkelen sto lei seg ved gjerdet og ventet på noen som aldri kom.',
        },
    },
    {
        id: 'besj-4-2',
        deviceId: 'besjeling',
        level: 4,
        instruction: 'Fyll inn et ord som gir gjenstanden en følelse.',
        data: {
            type: 'fill-blank',
            textBefore: 'Den tomme lekeplassen virket',
            textAfter: 'etter at barna hadde gått hjem.',
            correctAnswers: ['ensom', 'trist', 'forlatt', 'melankolsk', 'lei seg', 'sørgmodig'],
            explanation: 'Her trenger vi et ord som gir lekeplassen en følelse. "Ensom" eller "trist" er typisk besjeling - lekeplassen kan ikke egentlig føle, men det skaper en stemning av tomhet og savn.',
        },
    },
    {
        id: 'besj-4-3',
        deviceId: 'besjeling',
        level: 4,
        instruction: 'Skriv en setning der du bruker besjeling for å skape stemning.',
        data: {
            type: 'write',
            prompt: 'Beskriv et forlatt hus om vinteren ved hjelp av besjeling. Gi huset eller noe rundt det en følelse som passer stemningen.',
            hint: 'Tenk på hva huset "føler" - sorg, ensomhet, kulde, lengsel? Besjeling gir følelser til ting som ikke kan føle.',
            exampleAnswer: 'Det gamle huset frøs av ensomhet, og vinduene stirret tomt ut mot den øde veien.',
        },
    },

    // === NIVÅ 5 (Detektiv) ===
    {
        id: 'besj-5-1',
        deviceId: 'besjeling',
        level: 5,
        instruction: 'En av disse setningene er ikke besjeling. Finn den!',
        data: {
            type: 'find-error',
            text: 'Hvilken setning bruker personifisering i stedet for besjeling?',
            errorDescription: 'Besjeling gir følelser til livløse ting. Personifisering gir menneskelige handlinger.',
            options: [
                { text: 'Stolen stønnet under vekten hans.', correct: false, feedback: 'Å stønne uttrykker smerte - en følelse. Det er besjeling.' },
                { text: 'Bilen hostet og spyttet da den startet.', correct: true, feedback: 'Riktig! Å hoste og spytte er fysiske handlinger, ikke følelser. Det er personifisering, ikke besjeling.' },
                { text: 'Huset virket trist i regnet.', correct: false, feedback: 'Å være trist er en følelse. Det er besjeling.' },
                { text: 'Havet var rasende den kvelden.', correct: false, feedback: 'Å være rasende er en følelse. Det er besjeling.' },
            ],
        },
    },
    {
        id: 'besj-5-2',
        deviceId: 'besjeling',
        level: 5,
        instruction: 'Er denne påstanden sann eller usann?',
        data: {
            type: 'true-false',
            statement: 'Setningen "Døren vinket henne velkommen" er et eksempel på besjeling.',
            correct: false,
            explanation: 'Usant! Å vinke er en fysisk handling, ikke en følelse. Det er personifisering. Hadde setningen vært "Døren virket innbydende" ville det vært nærmere besjeling, fordi "innbydende" beskriver en holdning eller følelse.',
        },
    },
    {
        id: 'besj-5-3',
        deviceId: 'besjeling',
        level: 5,
        instruction: 'Er denne påstanden sann eller usann?',
        data: {
            type: 'true-false',
            statement: 'Besjeling og personifisering er egentlig det samme virkemiddelet.',
            correct: false,
            explanation: 'Usant! Besjeling gir følelser og stemninger til livløse ting ("fjellet sukket tungt"). Personifisering gir menneskelige handlinger eller evner ("vinden sang"). Forskjellen er følelse mot handling.',
        },
    },

    // === NIVÅ 6 (Analytiker) ===
    {
        id: 'besj-6-1',
        deviceId: 'besjeling',
        level: 6,
        instruction: 'Marker alle besjelingene i denne lengre teksten.',
        data: {
            type: 'highlight',
            text: 'Høststormen feide gjennom byen. Lyktestolpene skalv av frykt, og den gamle broen stønnet klagende. Bladene danset nedover gaten, mens trærne strakk armene sine mot himmelen. Selv asfalten virket lei seg, med blanke vannpytter som tomme øyne.',
            correctRanges: [
                { words: 'skalv av frykt', explanation: 'Lyktestolpene føler frykt - det er en følelse gitt til livløse gjenstander. Besjeling!' },
                { words: 'stønnet klagende', explanation: 'Broen stønner og klager - det uttrykker smerte og ubehag, altså følelser. Besjeling!' },
                { words: 'lei seg', explanation: 'Asfalten er lei seg - en følelse gitt til bakken. Besjeling! (Merk: "danset" og "strakk armene" er personifisering, ikke besjeling - det er handlinger.)' },
            ],
        },
    },
    {
        id: 'besj-6-2',
        deviceId: 'besjeling',
        level: 6,
        instruction: 'Analyser besjelingen i teksten.',
        data: {
            type: 'explain',
            text: 'Klokken på veggen tikket nervøst, som om den visste at tiden var i ferd med å renne ut. Veggene i det lille rommet krympet seg av ubehag, og gulvet knirket engstelig under hvert steg.',
            highlightedWords: 'nervøst',
            question: 'Hva oppnår forfatteren ved å gi rommet og gjenstandene følelser?',
            options: [
                { text: 'Det skaper en intens stemning av angst og press - leserens egen uro forsterkes fordi alt rundt personen også virker redd', correct: true, feedback: 'Riktig! Når klokken er nervøs, veggene har ubehag, og gulvet er engstelig, smitter stemningen over på leseren. Alt i rommet reflekterer den indre uroen til personen som er der.' },
                { text: 'At klokken er ødelagt og bør repareres', correct: false, feedback: 'Nei, klokken tikker normalt. "Nervøst" er besjeling som skaper stemning, ikke en beskrivelse av feil.' },
                { text: 'At rommet er veldig lite', correct: false, feedback: 'Det stemmer at rommet er lite, men poenget er at besjelingen forsterker ubehaget og bygger spenning.' },
            ],
        },
    },
    {
        id: 'besj-6-3',
        deviceId: 'besjeling',
        level: 6,
        instruction: 'Marker kun besjelingen i denne teksten. Her finnes også personifisering og andre virkemidler.',
        data: {
            type: 'highlight',
            text: 'Båten lå fortøyd ved brygga og virket utålmodig. Sjøen kalte på henne med bølgene sine, og vinden dyttet henne mot kaikanten. Men hun ble stående. Tauet som holdt båten fast, knirket fornærmet, som om det ikke likte å holde igjen.',
            correctRanges: [
                { words: 'utålmodig', explanation: 'Båten er utålmodig - en følelse gitt til en gjenstand. Besjeling! (Merk: Sjøen som "kalte" og vinden som "dyttet" er personifisering - det er handlinger.)' },
                { words: 'fornærmet', explanation: 'Tauet føler seg fornærmet - en følelse gitt til et tau. Besjeling!' },
            ],
        },
    },

    // === NIVÅ 7 (Kritiker) ===
    {
        id: 'besj-7-1',
        deviceId: 'besjeling',
        level: 7,
        instruction: 'Koble hvert eksempel med riktig virkemiddel. Følg følelse-mot-handling-regelen!',
        data: {
            type: 'match',
            pairs: [
                { example: 'Datamaskinen var frustrert over alle feilmeldingene.', label: 'Besjeling' },
                { example: 'Datamaskinen nektet å samarbeide.', label: 'Personifisering' },
                { example: 'Datamaskinen var en tikkende bombe.', label: 'Metafor' },
                { example: 'Datamaskinen var like treg som en snegle.', label: 'Sammenligning' },
                { example: 'Den røde feilmeldingen blinket og blinket på skjermen.', label: 'Gjentakelse' },
            ],
        },
    },
    {
        id: 'besj-7-2',
        deviceId: 'besjeling',
        level: 7,
        instruction: 'Sorter setningene i riktig kategori.',
        data: {
            type: 'sort',
            categories: [
                { id: 'besjeling', label: 'Besjeling (følelse)' },
                { id: 'personifisering', label: 'Personifisering (handling)' },
                { id: 'ingen', label: 'Vanlig beskrivelse' },
            ],
            items: [
                { text: 'Regnet gråt mot ruten.', categoryId: 'besjeling' },
                { text: 'Regnet trommet på taket.', categoryId: 'personifisering' },
                { text: 'Regnet falt i tunge dråper.', categoryId: 'ingen' },
                { text: 'Vinden klynket mellom husveggene.', categoryId: 'besjeling' },
                { text: 'Vinden rev tak av husene.', categoryId: 'ingen' },
                { text: 'Vinden pekte oss i riktig retning.', categoryId: 'personifisering' },
            ],
        },
    },
    {
        id: 'besj-7-3',
        deviceId: 'besjeling',
        level: 7,
        instruction: 'Er denne påstanden sann eller usann?',
        data: {
            type: 'true-false',
            statement: 'I setningen "Skogen hvisket hemmeligheter til dem som lyttet" er det besjeling fordi skogen ikke kan hviske.',
            correct: false,
            explanation: 'Usant! Å hviske er en handling, ikke en følelse. Hadde skogen vært "engstelig" eller "trist", ville det vært besjeling. Å hviske hemmeligheter er personifisering - skogen gjør noe menneskelig.',
        },
    },

    // === NIVÅ 8 (Sorteringsekspert) ===
    {
        id: 'besj-8-1',
        deviceId: 'besjeling',
        level: 8,
        instruction: 'Sorter disse besjelingene etter hvilken stemning de skaper.',
        data: {
            type: 'sort',
            categories: [
                { id: 'glad', label: 'Glad/positiv stemning' },
                { id: 'trist', label: 'Trist/melankolsk stemning' },
                { id: 'uhyggelig', label: 'Uhyggelig/skremmende stemning' },
            ],
            items: [
                { text: 'Solen smilte varmt ned på dem.', categoryId: 'glad' },
                { text: 'Blomstene jublet i vinden.', categoryId: 'glad' },
                { text: 'Huset var trist og forlatt.', categoryId: 'trist' },
                { text: 'Regnet gråt stille mot vinduet.', categoryId: 'trist' },
                { text: 'Mørket lurte i alle hjørner.', categoryId: 'uhyggelig' },
                { text: 'Trappen stønnet truende under føttene hennes.', categoryId: 'uhyggelig' },
            ],
        },
    },
    {
        id: 'besj-8-2',
        deviceId: 'besjeling',
        level: 8,
        instruction: 'Koble besjelingen med den mest presise forklaringen av hva den oppnår.',
        data: {
            type: 'match',
            pairs: [
                { example: 'Havet var rasende og kastet bølgene mot land.', label: 'Forsterker naturens kraft - gjør stormen mer dramatisk' },
                { example: 'Det gamle pianoet sukket da noen endelig åpnet lokket.', label: 'Skaper nostalgi - pianoet har savnet å bli brukt' },
                { example: 'Veggene i rommet krøp nærmere for hver time.', label: 'Bygger klaustrofobi - rommet føles truende og innestengt' },
                { example: 'Våren smilte forsiktig gjennom de første krokusene.', label: 'Vekker håp - naturen er glad over at vinteren er over' },
            ],
        },
    },
    {
        id: 'besj-8-3',
        deviceId: 'besjeling',
        level: 8,
        instruction: 'Sorter uttrykkene etter om de er besjeling eller ikke.',
        data: {
            type: 'sort',
            categories: [
                { id: 'besjeling', label: 'Besjeling' },
                { id: 'metafor', label: 'Metafor' },
                { id: 'personifisering', label: 'Personifisering' },
            ],
            items: [
                { text: 'Stolen sukket under vekten hans.', categoryId: 'besjeling' },
                { text: 'Telefonen var en lenke til omverdenen.', categoryId: 'metafor' },
                { text: 'Klokken jaget ham gjennom dagen.', categoryId: 'personifisering' },
                { text: 'Den gamle porten var sky og ville ikke åpne seg.', categoryId: 'besjeling' },
                { text: 'Ensomheten var et svart hull.', categoryId: 'metafor' },
                { text: 'Solen kysset kinnene hennes.', categoryId: 'personifisering' },
            ],
        },
    },

    // === NIVÅ 9 (Mester) ===
    {
        id: 'besj-9-1',
        deviceId: 'besjeling',
        level: 9,
        instruction: 'Skriv en kort tekst (2-3 setninger) der du bruker besjeling for å skape en bestemt stemning.',
        data: {
            type: 'write',
            prompt: 'Beskriv en forlatt skole om natten. Bruk besjeling for å gi bygningen og gjenstandene følelser som skaper en uhyggelig stemning. Husk: følelser, ikke handlinger.',
            hint: 'Tenk på hva skolen "føler" om natten: engstelig, ensom, redd, melankolsk? Hva med pultene, tavlen, korridorene? Gi dem følelser som bygger stemningen.',
            exampleAnswer: 'Den tomme skolen holdt pusten i mørket. Pultene sto engstelige på rekke og rad, og korridoren strakte seg nervøst ut i det svarte. Bare klokken på veggen turte å lage lyd.',
        },
    },
    {
        id: 'besj-9-2',
        deviceId: 'besjeling',
        level: 9,
        instruction: 'Marker alle besjelingene i denne teksten. Vær presis - ikke marker personifisering, metaforer eller sammenligninger.',
        data: {
            type: 'highlight',
            text: 'Skipet lå fortøyd ved den gamle kaia og lengtet ut mot horisonten. Bølgene vasket dekket som flittige hender, og masten pekte stolt mot himmelen. Ankerkjettingen hang tungt og motvillig ned i vannet. Hele havnen virket vemodig i skumringen, som et gammelt maleri av en glemt tid.',
            correctRanges: [
                { words: 'lengtet', explanation: 'Skipet lengter - en dyp følelse av savn. Besjeling!' },
                { words: 'motvillig', explanation: 'Ankerkjettingen er motvillig - den har ikke lyst. En følelse gitt til en gjenstand. Besjeling!' },
                { words: 'vemodig', explanation: 'Havnen er vemodig - en melankolsk følelse gitt til et sted. Besjeling! (Merk: bølgene som "vasker" er personifisering, masten som "peker stolt" er mer personifisering/handling, og "som et gammelt maleri" er en sammenligning.)' },
            ],
        },
    },
    {
        id: 'besj-9-3',
        deviceId: 'besjeling',
        level: 9,
        instruction: 'Fyll inn et ord som skaper besjeling og passer til stemningen.',
        data: {
            type: 'fill-blank',
            textBefore: 'Da det siste lyset ble slukket, la huset seg',
            textAfter: 'til ro, som om det endelig kunne hvile etter en lang dag med støy og latter.',
            correctAnswers: ['tilfreds', 'lettet', 'takknemlig', 'fornøyd', 'rolig', 'fredelig'],
            explanation: 'Her trenger vi en følelse som passer en fredelig kveldstemning. Huset "legger seg til ro" og trenger et ord som uttrykker lettelse eller tilfredshet - som om huset har hatt en travel dag og endelig kan slappe av.',
        },
    },

    // === NIVÅ 10 (Magister) ===
    {
        id: 'besj-10-1',
        deviceId: 'besjeling',
        level: 10,
        instruction: 'Analyser bruken av besjeling i denne teksten. Hva oppnår forfatteren?',
        data: {
            type: 'explain',
            text: 'Fabrikken hadde stått tom i tjue år. Maskinene sørget stille bak de knuste vinduene, og veggene bar på en sår lengsel etter lydene som en gang fylte dem. Gulvet erindret tramp av støvler, og taket drømte om røyken som pleide å stige opp. Hele bygningen var i en slags dvale - ikke død, men heller ikke levende. Den ventet, tålmodig og håpefull, på noen som aldri kom tilbake.',
            highlightedWords: 'sørget stille',
            question: 'Forfatteren bruker besjeling gjennomgående i teksten. Hva er den samlede effekten?',
            options: [
                { text: 'Fabrikken blir et symbol på sorg og tap - besjelingen gjør at leseren føler empati med en bygning, som om den er et levende vesen som lider av å bli forlatt', correct: true, feedback: 'Riktig! Ved å gi maskiner, vegger, gulv og tak følelser som sorg, lengsel og håp, gjør forfatteren fabrikken til noe mer enn bare en bygning. Leseren føler med fabrikken, og det forsterker temaet om at ting som var viktige en gang, nå er glemt.' },
                { text: 'At fabrikken bør rives fordi den er gammel', correct: false, feedback: 'Nei, besjelingen gjør tvert imot at vi føler sympati med fabrikken. Den er ikke bare gammel - den sørger og lengter.' },
                { text: 'At det er spøkelser i fabrikken', correct: false, feedback: 'Nei, teksten handler ikke om det overnaturlige. Besjelingen er et virkemiddel for å skape stemning og empati, ikke for å antyde at bygningen er hjemsøkt.' },
            ],
        },
    },
    {
        id: 'besj-10-2',
        deviceId: 'besjeling',
        level: 10,
        instruction: 'Skriv et avsnitt (3-4 setninger) der du bruker gjennomgående besjeling. Gi en gjenstand eller et sted følelser som bygger en tydelig stemning.',
        data: {
            type: 'write',
            prompt: 'Velg en gjenstand eller et sted (for eksempel et gammelt bibliotek, en forlatt lekeplass, eller et skip) og skriv en kort tekst der du bruker besjeling gjennomgående. Alle følelsene skal peke i samme retning og bygge en tydelig stemning.',
            hint: 'Velg en stemning først (glede, sorg, frykt, nostalgi). Gi deretter gjenstanden og alt rundt den følelser som forsterker den stemningen. Tenk: hva føler veggene? Hva føler gulvet? Hva føler vinduene?',
            exampleAnswer: 'Det gamle biblioteket sukket tungt da den siste leseren forlot salen. Bøkene på hyllene krøp tettere sammen av ensomhet, og lampene dimmet seg selv i melankoli. Bare støvet beveget seg - rastløst og lengselfullt, som om det lette etter noen å lande på.',
        },
    },
    {
        id: 'besj-10-3',
        deviceId: 'besjeling',
        level: 10,
        instruction: 'Sorter disse setningene etter virkemiddel. Her kreves det at du skiller nøyaktig mellom besjeling, personifisering, metafor og sammenligning.',
        data: {
            type: 'sort',
            categories: [
                { id: 'besjeling', label: 'Besjeling' },
                { id: 'personifisering', label: 'Personifisering' },
                { id: 'metafor', label: 'Metafor' },
                { id: 'sammenligning', label: 'Sammenligning' },
            ],
            items: [
                { text: 'Fjelltoppen var stolt og ensom over skyene.', categoryId: 'besjeling' },
                { text: 'Fjelltoppen voktet over dalen som en vaktpost.', categoryId: 'personifisering' },
                { text: 'Fjelltoppen var en kriger med snø som hjelm.', categoryId: 'metafor' },
                { text: 'Fjelltoppen var hvit som sukker i morgenlyset.', categoryId: 'sammenligning' },
                { text: 'Elven klaget over steinene den måtte krysse.', categoryId: 'besjeling' },
                { text: 'Elven løp raskt nedover dalen.', categoryId: 'personifisering' },
                { text: 'Elven var et sølvbånd gjennom landskapet.', categoryId: 'metafor' },
                { text: 'Elven glitret som diamanter i solen.', categoryId: 'sammenligning' },
            ],
        },
    },
];
