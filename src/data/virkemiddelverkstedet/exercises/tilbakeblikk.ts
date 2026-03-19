import type { Exercise } from '../types';

export const tilbakeblikkExercises: Exercise[] = [
    // === NIVÅ 1 ===
    {
        id: 'tilb-1-1',
        deviceId: 'tilbakeblikk',
        level: 1,
        instruction: 'Hvilket virkemiddel er brukt?',
        data: {
            type: 'identify',
            text: 'Han husket den dagen moren forsvant. Det var regn da også.',
            options: [
                { deviceId: 'tilbakeblikk', label: 'Tilbakeblikk', correct: true, feedback: 'Riktig! "Han husket" tar oss tilbake til et minne. Det er et tilbakeblikk.' },
                { deviceId: 'frampek', label: 'Frampek', correct: false, feedback: 'Nei, et frampek peker fremover. Her ser vi tilbake i tid.' },
                { deviceId: 'kontrast', label: 'Kontrast', correct: false, feedback: 'Det er en kobling mellom nåtid og fortid, men hovedvirkemiddelet er tilbakeblikk.' },
                { deviceId: 'symbol', label: 'Symbol', correct: false, feedback: 'Regnet kan tolkes symbolsk, men hovedvirkemiddelet er tilbakeblikket.' },
            ],
        },
    },
    {
        id: 'tilb-1-2',
        deviceId: 'tilbakeblikk',
        level: 1,
        instruction: 'Hvilket virkemiddel er brukt?',
        data: {
            type: 'identify',
            text: 'For fem år siden hadde de vært bestevenner. Nå hilste de knapt.',
            options: [
                { deviceId: 'tilbakeblikk', label: 'Tilbakeblikk', correct: true, feedback: 'Riktig! "For fem år siden" tar oss tilbake i tid for å vise kontrasten til nåtiden.' },
                { deviceId: 'ironi', label: 'Ironi', correct: false, feedback: 'Nei, det er trist, men ikke ironisk. Det er et tilbakeblikk som viser forandring.' },
                { deviceId: 'gjentakelse', label: 'Gjentakelse', correct: false, feedback: 'Nei, ingenting gjentas her.' },
                { deviceId: 'metafor', label: 'Metafor', correct: false, feedback: 'Nei, alt her er bokstavelig. Virkemiddelet er tidshoppet.' },
            ],
        },
    },
    {
        id: 'tilb-1-3',
        deviceId: 'tilbakeblikk',
        level: 1,
        instruction: 'Marker tilbakeblikket i teksten.',
        data: {
            type: 'highlight',
            text: 'Lukten av kaffe tok henne tilbake til kafeen der de hadde sitt første stevnemøte.',
            correctRanges: [
                { words: 'tok henne tilbake til kafeen der de hadde sitt første stevnemøte', explanation: 'Lukten trigger et minne - vi hopper tilbake i tid til det første stevnemøtet.' },
            ],
        },
    },
    {
        id: 'tilb-1-4',
        deviceId: 'tilbakeblikk',
        level: 1,
        instruction: 'Marker tilbakeblikket.',
        data: {
            type: 'highlight',
            text: 'Hun så på det gamle huset. Som barn hadde hun lekt i hagen og drømt om å bli prinsesse.',
            correctRanges: [
                { words: 'Som barn hadde hun lekt i hagen og drømt om å bli prinsesse', explanation: 'Vi hopper tilbake til barndommen hennes - et typisk tilbakeblikk utlost av et sted.' },
            ],
        },
    },

    // === NIVÅ 2 ===
    {
        id: 'tilb-2-1',
        deviceId: 'tilbakeblikk',
        level: 2,
        instruction: 'Hva utløser tilbakeblikket her?',
        data: {
            type: 'explain',
            text: 'Sangen på radioen fikk alt til å komme tilbake. Dansen i gymsalen. Latteren. Kjoler og slips.',
            highlightedWords: 'fikk alt til å komme tilbake',
            question: 'Hva er det som setter i gang tilbakeblikket?',
            options: [
                { text: 'Musikken trigger minner fra et skoleball - sangen fungerer som en tidsmaskin til fortiden', correct: true, feedback: 'Riktig! Sanger og lukter er klassiske triggere for tilbakeblikk. De korte setningene "Dansen. Latteren." gjør at minnene føler som glimt.' },
                { text: 'At hun likte å danse', correct: false, feedback: 'Det er for enkelt. Poenget er at sangen trigger en hel rekke minner fra fortiden.' },
                { text: 'At radioen sto på for høyt', correct: false, feedback: 'Nei, det handler om minnene som sangen vekker, ikke volumet.' },
            ],
        },
    },
    {
        id: 'tilb-2-2',
        deviceId: 'tilbakeblikk',
        level: 2,
        instruction: 'Hvilket virkemiddel er mest fremtredende?',
        data: {
            type: 'identify',
            text: 'Det var mørkt ute. Han la seg i sengen. Plutselig tenkte han på den gangen de hadde ligget under stjernene og planlagt fremtiden.',
            options: [
                { deviceId: 'tilbakeblikk', label: 'Tilbakeblikk', correct: true, feedback: 'Riktig! "Den gangen de hadde..." tar oss tilbake i tid til et spesifikt minne.' },
                { deviceId: 'frampek', label: 'Frampek', correct: false, feedback: 'Nei, de "planla fremtiden" i fortiden - det er et minne, altså et tilbakeblikk.' },
                { deviceId: 'kontrast', label: 'Kontrast', correct: false, feedback: 'Det er en kontrast mellom nå (alene, mørkt) og da (sammen, stjerner), men virkemiddelet er tilbakeblikk.' },
                { deviceId: 'besjeling', label: 'Besjeling', correct: false, feedback: 'Nei, ingenting livløst får følelser her.' },
            ],
        },
    },
    {
        id: 'tilb-2-3',
        deviceId: 'tilbakeblikk',
        level: 2,
        instruction: 'Marker tilbakeblikket i teksten.',
        data: {
            type: 'highlight',
            text: '"Jeg savner deg," sa hun til det tomme rommet. De hadde alltid sittet her sammen med tekopper og kryssord.',
            correctRanges: [
                { words: 'De hadde alltid sittet her sammen med tekopper og kryssord', explanation: 'Tilbakeblikket viser et minne om den rutinen de hadde - tekopper og kryssord. Det forsterker savnet.' },
            ],
        },
    },

    // === NIVÅ 3 ===
    {
        id: 'tilb-3-1',
        deviceId: 'tilbakeblikk',
        level: 3,
        instruction: 'Hva oppnår tilbakeblikket her?',
        data: {
            type: 'explain',
            text: 'Han åpnet den gamle dagboken. "I dag var den verste dagen i mitt liv," sto det med barnslig håndskrift. Han smilte. Det hadde bare handlet om en tapt fotballkamp.',
            highlightedWords: 'I dag var den verste dagen i mitt liv',
            question: 'Hva er effekten av tilbakeblikket?',
            options: [
                { text: 'Det skaper kontrast mellom barnets dramatikk og den voksnes perspektiv - det som føltes enormt for, er lite nå', correct: true, feedback: 'Riktig! Tilbakeblikket viser hvordan perspektiv endrer seg med alderen. At han smiler viser at det som var "verst" for et barn, er morsomt for en voksen.' },
                { text: 'At han har dårlig hukommelse', correct: false, feedback: 'Nei, han husker det godt nok til å smile av det. Poenget er perspektivendringen.' },
                { text: 'At fotball er viktig', correct: false, feedback: 'Tvert imot - poenget er at fotballkampen viste seg å være uviktig i det store bildet.' },
            ],
        },
    },
    {
        id: 'tilb-3-2',
        deviceId: 'tilbakeblikk',
        level: 3,
        instruction: 'Koble hvert eksempel med riktig virkemiddel.',
        data: {
            type: 'match',
            pairs: [
                { example: 'Hun husket lukten av bestemors kjøkken den julen.', label: 'Tilbakeblikk' },
                { example: 'Det skulle vise seg å bli en skjebnesvanger kveld.', label: 'Frampek' },
                { example: '"Stopp!" ropte hun og kastet seg over bordet.', label: 'In medias res' },
                { example: 'Den gamle klokken hadde stått stille i ti år.', label: 'Symbol' },
            ],
        },
    },
    {
        id: 'tilb-3-3',
        deviceId: 'tilbakeblikk',
        level: 3,
        instruction: 'Marker kun tilbakeblikket. Her er det flere virkemidler!',
        data: {
            type: 'highlight',
            text: 'Han husket da de bygde hytta sammen. Far hadde aldri vært en mur. Han var alltid åpen og varm som en ovn.',
            correctRanges: [
                { words: 'Han husket da de bygde hytta sammen', explanation: 'Dette er tilbakeblikket - vi hopper tilbake til et minne. (Merk: "en mur" er metafor, "som en ovn" er sammenligning.)' },
            ],
        },
    },

    // === NIVÅ 4 ===
    {
        id: 'tilb-4-1',
        deviceId: 'tilbakeblikk',
        level: 4,
        instruction: 'Skriv en tekst som inneholder et tilbakeblikk.',
        data: {
            type: 'write',
            prompt: 'Skriv en kort tekst (2-3 setninger) der en karakter opplever noe i nåtiden som trigger et minne fra fortiden. Vis tydelig tidshoppet.',
            hint: 'Bruk en sanselig trigger - en lukt, en lyd eller et syn som setter i gang minnet.',
            exampleAnswer: 'Lukten av nybakt brød slo mot henne da hun åpnet døren. Med ett var hun åtte år igjen, stående på tærne ved kjøkkenbenken mens bestemor formet bollene.',
        },
    },
    {
        id: 'tilb-4-2',
        deviceId: 'tilbakeblikk',
        level: 4,
        instruction: 'Fyll inn ordet som gjør dette til et tilbakeblikk.',
        data: {
            type: 'fill-blank',
            textBefore: 'Han så på det gamle fotballkortet.',
            textAfter: 'hadde han og pappa stått i kø i tre timer for å få det signert.',
            correctAnswers: ['Den sommeren', 'Den gangen', 'For ti år siden'],
            acceptKeywords: ['sommer', 'gang', 'år siden', 'husket', 'minnet', 'tilbake'],
            hint: 'Bruk en tidsmarkør som tar oss tilbake i tid. Når skjedde dette minnet?',
            explanation: 'Tidsmarkører som "den sommeren", "den gangen" eller "for ti år siden" signaliserer et tidshopp bakover. De forteller leseren at vi nå befinner oss i et minne.',
        },
    },
    {
        id: 'tilb-4-3',
        deviceId: 'tilbakeblikk',
        level: 4,
        instruction: 'Skriv et tilbakeblikk som forklarer en karakters oppførsel.',
        data: {
            type: 'write',
            prompt: 'En karakter nekter å svømme. Skriv 2-3 setninger med et tilbakeblikk som forklarer hvorfor.',
            hint: 'La minnet vise en hendelse fra fortiden som gjør at karakteren er redd for vann.',
            exampleAnswer: 'De andre løp mot vannet, men Ali ble stående på stranden. Han klarte ikke å se på bølgene uten å tenke på den gangen han var seks og strømmen dro ham under. Pappa hadde funnet ham helt blå.',
        },
    },

    // === NIVÅ 5 ===
    {
        id: 'tilb-5-1',
        deviceId: 'tilbakeblikk',
        level: 5,
        instruction: 'Finn feilen i denne analysen av tilbakeblikk.',
        data: {
            type: 'find-error',
            text: 'I setningen "Hun visste at morgendagen ville bli vanskelig. Hun hadde aldri vært god på eksamener" er tilbakeblikket "morgendagen ville bli vanskelig". Det tar oss tilbake til en tidligere eksamen.',
            errorDescription: 'Hvilken del av analysen er feil?',
            options: [
                { text: '"Morgendagen ville bli vanskelig" peker fremover, ikke bakover - det er et frampek. Tilbakeblikket er "Hun hadde aldri vært god på eksamener", som refererer til tidligere erfaringer.', correct: true, feedback: 'Riktig! "Morgendagen" peker fremover i tid (frampek), mens "hadde aldri vært god" refererer til fortidige erfaringer (tilbakeblikk). Analysen blander de to virkemidlene.' },
                { text: 'Det er ikke noe tilbakeblikk her i det hele tatt.', correct: false, feedback: 'Jo, "hadde aldri vært god på eksamener" er et tilbakeblikk til tidligere erfaringer - men analysen peker på feil del.' },
                { text: 'Hele teksten er et tilbakeblikk fordi den handler om noe som har skjedd.', correct: false, feedback: 'Nei, teksten handler om nåtid og fremtid. Bare delen om tidligere eksamener er et tilbakeblikk.' },
            ],
        },
    },
    {
        id: 'tilb-5-2',
        deviceId: 'tilbakeblikk',
        level: 5,
        instruction: 'Er denne påstanden riktig eller gal?',
        data: {
            type: 'true-false',
            statement: 'Et tilbakeblikk må alltid starte med ord som "husket" eller "tenkte tilbake". Uten slike ord er det ikke et ekte tilbakeblikk.',
            correct: false,
            explanation: 'Feil! Tilbakeblikk kan starte på mange måter. En forfatter kan hoppe rett inn i fortiden med et tempusbytte (fra presens til preteritum), med en sanseopplevelse ("Lukten av røyk fylte rommet. Det var 1995..."), eller bare med en ny scene i fortiden. Signalord som "husket" er vanlige, men ikke nødvendige.',
        },
    },
    {
        id: 'tilb-5-3',
        deviceId: 'tilbakeblikk',
        level: 5,
        instruction: 'Er denne påstanden riktig eller gal?',
        data: {
            type: 'true-false',
            statement: 'Et tilbakeblikk kan brukes til å gi leseren viktig informasjon som forklarer hvorfor en karakter handler som den gjør i nåtiden.',
            correct: true,
            explanation: 'Riktig! Dette er en av de viktigste funksjonene til tilbakeblikk. Hvis en karakter plutselig reagerer sterkt på noe, kan et tilbakeblikk vise en hendelse fra fortiden som forklarer reaksjonen. Det gir dybde til karakteren og hjelper leseren å forstå motivasjonen.',
        },
    },

    // === NIVÅ 6 ===
    {
        id: 'tilb-6-1',
        deviceId: 'tilbakeblikk',
        level: 6,
        instruction: 'Marker tilbakeblikket i denne lengre teksten.',
        data: {
            type: 'highlight',
            text: 'Emma sto foran den nedlagte fabrikken. Vinduene var knuste, og ugresset vokste gjennom asfalten. Det var vanskelig å tro at dette en gang hadde vært et levende sted. Mamma hadde jobbet her i tjue år. Hver morgen hadde hun tatt med matpakke i den blå sekken og kommet hjem med hendene fulle av maling. Nå var det bare støv igjen.',
            correctRanges: [
                { words: 'Mamma hadde jobbet her i tjue år. Hver morgen hadde hun tatt med matpakke i den blå sekken og kommet hjem med hendene fulle av maling', explanation: 'Dette er tilbakeblikket - vi hopper tilbake til tiden da fabrikken var i drift og mammas arbeidshverdag. De konkrete detaljene (blå sekk, maling på hendene) gjør minnet levende.' },
            ],
        },
    },
    {
        id: 'tilb-6-2',
        deviceId: 'tilbakeblikk',
        level: 6,
        instruction: 'Forklar hva tilbakeblikket gjør i denne teksten.',
        data: {
            type: 'explain',
            text: 'Læreren delte ut prøvene. "Bra jobbet, alle sammen," sa hun. Kristian snudde arket og så en stor rød sekser øverst. Hendene skalv. Da han var liten, hadde faren slått i bordet hver gang han kom hjem med dårlige karakterer. "Du er verdiløs," hadde han sagt. Kristian visste at faren tok feil. Men hendene skalv likevel.',
            highlightedWords: 'Da han var liten, hadde faren slått i bordet',
            question: 'Hva er funksjonen til tilbakeblikket her?',
            options: [
                { text: 'Det forklarer Kristians fysiske reaksjon - hendene skalv fordi kroppen husker farens sinne, selv om han nå vet bedre med hodet. Tilbakeblikket gir dybde til karakteren', correct: true, feedback: 'Riktig! Tilbakeblikket forklarer et gap mellom tanke og kropp: Kristian vet at faren tok feil, men kroppen reagerer fortsatt på traumer fra barndommen. Uten tilbakeblikket ville skjelvingen vært uforklarlig for leseren.' },
                { text: 'Det viser at Kristian er en dårlig elev', correct: false, feedback: 'Tvert imot - han fikk sekser! Tilbakeblikket handler om farens reaksjon, ikke Kristians skoleprestasjoner.' },
                { text: 'Det er for å vise at faren var streng', correct: false, feedback: 'Det er delvis riktig, men funksjonen er dypere: tilbakeblikket forklarer hvorfor Kristian reagerer med frykt selv på en god karakter.' },
            ],
        },
    },
    {
        id: 'tilb-6-3',
        deviceId: 'tilbakeblikk',
        level: 6,
        instruction: 'Marker alle tilbakeblikkene i denne teksten. Det kan være flere!',
        data: {
            type: 'highlight',
            text: 'Maria åpnet den gamle kofferten. Inni lå en tøyelefant og et falmet bilde. Elefanten hadde hun fått av onkel Per den julen hun fylte fire. Han hadde ledd og sagt at den het Snansen, etter oppdageren. Bildet var fra sommerferien i Hellas, da hele familien fortsatt holdt sammen. Nå var onkel Per borte og familien spredt for alle vinder.',
            correctRanges: [
                { words: 'Elefanten hadde hun fått av onkel Per den julen hun fylte fire. Han hadde ledd og sagt at den het Snansen, etter oppdageren', explanation: 'Første tilbakeblikk: vi hopper tilbake til julen da Maria var fire, med et levende minne om onkelen.' },
                { words: 'Bildet var fra sommerferien i Hellas, da hele familien fortsatt holdt sammen', explanation: 'Andre tilbakeblikk: vi hopper tilbake til en sommerferie - og ordene "fortsatt holdt sammen" gir minnet en sår undertone.' },
            ],
        },
    },

    // === NIVÅ 7 ===
    {
        id: 'tilb-7-1',
        deviceId: 'tilbakeblikk',
        level: 7,
        instruction: 'Koble hvert eksempel med riktig type tilbakeblikk.',
        data: {
            type: 'match',
            pairs: [
                { example: 'Lukten av sjøvann tok ham tilbake til somrene på hytta.', label: 'Sansetriggert tilbakeblikk' },
                { example: 'Kapittel 5 starter: "Ti år tidligere." Vi følger karakteren som barn.', label: 'Strukturelt tilbakeblikk (eget kapittel)' },
                { example: 'Hun husket samtalen ordrett: "Du må velge," hadde moren sagt.', label: 'Dialogbasert tilbakeblikk' },
                { example: 'Han drømte at han var tilbake i det gamle huset. Faren satt i stolen sin.', label: 'Drømmetilbakeblikk' },
            ],
        },
    },
    {
        id: 'tilb-7-2',
        deviceId: 'tilbakeblikk',
        level: 7,
        instruction: 'Sorter disse eksemplene etter om de er tilbakeblikk eller ikke.',
        data: {
            type: 'sort',
            categories: [
                { id: 'tilbakeblikk', label: 'Tilbakeblikk' },
                { id: 'ikke-tilbakeblikk', label: 'Ikke tilbakeblikk' },
            ],
            items: [
                { text: 'Da han var ti, hadde familien bodd i en liten leilighet.', categoryId: 'tilbakeblikk' },
                { text: 'Han ville aldri glemme den dagen.', categoryId: 'tilbakeblikk' },
                { text: 'I morgen skal vi reise til Bergen.', categoryId: 'ikke-tilbakeblikk' },
                { text: 'Solen gikk ned bak fjellene.', categoryId: 'ikke-tilbakeblikk' },
                { text: 'Stemmen hennes fikk ham til å tenke på moren som døde da han var tolv.', categoryId: 'tilbakeblikk' },
                { text: 'Snart ville alt forandre seg.', categoryId: 'ikke-tilbakeblikk' },
            ],
        },
    },
    {
        id: 'tilb-7-3',
        deviceId: 'tilbakeblikk',
        level: 7,
        instruction: 'Er denne påstanden riktig eller gal?',
        data: {
            type: 'true-false',
            statement: 'Hvis en hel roman er fortalt i fortid (preteritum), er hele romanen et eneste langt tilbakeblikk.',
            correct: false,
            explanation: 'Feil! Preteritum er den vanligste fortellertiden i romaner, men det gjør ikke teksten til et tilbakeblikk. Et tilbakeblikk er et tidshopp fra fortellingens nåtid til en tidligere hendelse. Hvis hele romanen fortelles i preteritum, er det bare fortellerkonvensjonen. Tilbakeblikk oppstår når teksten hopper enda lenger tilbake fra det tidspunktet handlingen foregår på.',
        },
    },

    // === NIVÅ 8 ===
    {
        id: 'tilb-8-1',
        deviceId: 'tilbakeblikk',
        level: 8,
        instruction: 'Sorter disse tilbakeblikkene etter funksjon.',
        data: {
            type: 'sort',
            categories: [
                { id: 'forklare', label: 'Forklarer nåtiden' },
                { id: 'kontrast', label: 'Skaper kontrast' },
                { id: 'tema', label: 'Bygger tema' },
            ],
            items: [
                { text: 'Han var redd for hunder. Da han var fem, hadde en schæfer bitt ham i armen.', categoryId: 'forklare' },
                { text: 'Gatene var tomme nå. For tyve år siden hadde dette vært en travel markedsplass full av liv.', categoryId: 'kontrast' },
                { text: 'Hver generasjon hadde flyttet lenger bort fra hjembygda. Bestefaren bodde ved sjøen, faren i byen, og hun i utlandet.', categoryId: 'tema' },
                { text: 'Hun stolte ikke på noen. Den siste hun stolte på, hadde stjålet sparepengene hennes.', categoryId: 'forklare' },
                { text: 'Barndomshagen var nå en parkeringsplass. Der eplene falt, sto det biler.', categoryId: 'kontrast' },
                { text: 'I hvert slektsledd hadde noen måttet velge mellom plikt og kjærlighet. Nå var det hennes tur.', categoryId: 'tema' },
            ],
        },
    },
    {
        id: 'tilb-8-2',
        deviceId: 'tilbakeblikk',
        level: 8,
        instruction: 'Koble hvert tilbakeblikk med triggeren som setter det i gang.',
        data: {
            type: 'match',
            pairs: [
                { example: 'Parfymen i heisen fikk henne til å tenke på mormor.', label: 'Lukt (olfaktorisk trigger)' },
                { example: 'Da hun hørte pianomusikken, var hun plutselig tilbake i øvingsrommet.', label: 'Lyd (auditiv trigger)' },
                { example: 'Han tok i det kalde metallet og husket gjerdet rundt barneskolen.', label: 'Berøring (taktil trigger)' },
                { example: 'Da han så den røde sykkelen, sto lillebroren plutselig foran ham igjen.', label: 'Syn (visuell trigger)' },
            ],
        },
    },
    {
        id: 'tilb-8-3',
        deviceId: 'tilbakeblikk',
        level: 8,
        instruction: 'Sorter disse tekstutdragene etter virkemiddel.',
        data: {
            type: 'sort',
            categories: [
                { id: 'tilbakeblikk', label: 'Tilbakeblikk' },
                { id: 'frampek', label: 'Frampek' },
                { id: 'in-medias-res', label: 'In medias res' },
            ],
            items: [
                { text: 'Da han var barn, hadde bestefaren fortalt ham om trollene i fjellet.', categoryId: 'tilbakeblikk' },
                { text: 'Ingen av dem visste at dette var siste gangen.', categoryId: 'frampek' },
                { text: 'Blodet rant nedover pannen hans. Smellet ringte fortsatt i ørene.', categoryId: 'in-medias-res' },
                { text: 'For tre år siden hadde de lovet hverandre å aldri gi opp.', categoryId: 'tilbakeblikk' },
                { text: 'Snart ville sannheten komme fram.', categoryId: 'frampek' },
                { text: '"Løp!" skrek hun og grep barnet.', categoryId: 'in-medias-res' },
            ],
        },
    },

    // === NIVÅ 9 ===
    {
        id: 'tilb-9-1',
        deviceId: 'tilbakeblikk',
        level: 9,
        instruction: 'Analyser tilbakeblikkene i denne teksten.',
        data: {
            type: 'explain',
            text: 'Hanne sto i døråpningen til det gamle rommet sitt. Veggene var bare nå, men hun kunne fortsatt se sporene etter plakatene - rektangler av mørkere farge der solen ikke hadde bleket tapetet. Der hadde Nirvana-plakaten hengt. Der hadde hun skrevet "H + M" med tusj og dekket det med et bilde da mamma oppdaget det. Hun lo stille. Martin. Herregud. Hun hadde ikke tenkt på ham på årevis. Han var den første hun hadde elsket og den første som hadde knust hjertet hennes. Nå var han tannlege i Tromsø.',
            highlightedWords: 'Han var den første hun hadde elsket',
            question: 'Teksten inneholder flere lag med tilbakeblikk. Hvordan jobber de sammen?',
            options: [
                { text: 'Tilbakeblikkene bygger seg opp i lag: først rommet, så plakatene, så tusjen, så Martin, så det første hjertesorget. Hvert minne trigger det neste, og det blir mer personlig og sårbart for hvert lag', correct: true, feedback: 'Riktig! Tilbakeblikkene fungerer som en spiral innover: fra det fysiske (rommet, veggene) til det personlige (Martin, hjertesorgen). Den siste setningen ("tannlege i Tromsø") bringer oss brått tilbake til nåtiden med en hverdagslig detalj som skaper kontrast til ungdomsromantikken.' },
                { text: 'Det er egentlig bare ett tilbakeblikk som handler om rommet', correct: false, feedback: 'Nei, det er flere tilbakeblikk som går stadig dypere: rommet trigger plakatene, som trigger Martin, som trigger det første hjertesorget. Hvert minne åpner et nytt.' },
                { text: 'Tilbakeblikkene er tilfeldige minner uten sammenheng', correct: false, feedback: 'De er ikke tilfeldige - hvert minne trigger det neste i en logisk kjede som går fra det ytre (rommet) til det indre (følelsene).' },
            ],
        },
    },
    {
        id: 'tilb-9-2',
        deviceId: 'tilbakeblikk',
        level: 9,
        instruction: 'Skriv en tekst med et tilbakeblikk som har en tydelig funksjon.',
        data: {
            type: 'write',
            prompt: 'Skriv et avsnitt (4-6 setninger) der et tilbakeblikk forklarer hvorfor en karakter handler uventet i nåtiden. Start i nåtid, hopp til fortiden, og kom tilbake til nåtiden. La leseren forstå sammenhengen.',
            hint: 'Tenk på en uventet reaksjon (noen som plutselig blir redd, sint eller trist) og la tilbakeblikket avsløre grunnen.',
            exampleAnswer: 'Da servitøren satte tallerkenen foran ham, reiste Jonas seg brått og gikk. De andre ved bordet stirret forvirret etter ham. De visste ikke at den hvite sausen på tallerkenen var den samme sausen moren alltid lagde den vinteren hun var syk. Lukten tok ham rett tilbake til sykehuskafeen der de spiste den siste middagen sammen. Jonas sto ute på fortauet og pustet. Noen minner kommer uten å spørre om lov.',
        },
    },
    {
        id: 'tilb-9-3',
        deviceId: 'tilbakeblikk',
        level: 9,
        instruction: 'Finn feilen i denne analysen.',
        data: {
            type: 'find-error',
            text: 'Analysert tekst: "Bestefaren hadde alltid sagt at havet var levende. Nå sto gutten på stranden og forsto hva han mente." Elevanalyse: "Tilbakeblikket er i andre setning: \'Nå sto gutten på stranden.\' Her husker gutten noe bestefaren sa."',
            errorDescription: 'Hva er feil med denne analysen?',
            options: [
                { text: 'Andre setning er nåtiden, ikke tilbakeblikket. Tilbakeblikket er i første setning: "Bestefaren hadde alltid sagt" - det er her vi hopper tilbake til noe bestefaren sa i fortiden.', correct: true, feedback: 'Riktig! "Nå sto gutten" er fortellingens nåtid - det er her og nå. "Bestefaren hadde alltid sagt" er tilbakeblikket som refererer til noe som ble sagt i fortiden. Eleven har forvekslet nåtid og fortid.' },
                { text: 'Det er ikke noe tilbakeblikk i teksten i det hele tatt.', correct: false, feedback: 'Jo, "hadde alltid sagt" refererer til fortiden - noe bestefaren sa da gutten var yngre. Det er et tilbakeblikk.' },
                { text: 'Begge setningene er tilbakeblikk.', correct: false, feedback: 'Nei, andre setning ("Nå sto gutten") er tydelig markert som nåtid med ordet "nå". Bare første setning hopper bakover.' },
            ],
        },
    },

    // === NIVÅ 10 ===
    {
        id: 'tilb-10-1',
        deviceId: 'tilbakeblikk',
        level: 10,
        instruction: 'Marker alle tilbakeblikkene i denne teksten. Noen er svært subtile.',
        data: {
            type: 'highlight',
            text: 'Advokaten åpnet mappen og begynte å lese testamentet. "Til min sønn Erik etterlater jeg hytta ved Mjøsa." Erik svelget. Hytta. Pappa hadde bygget den med egne hender sommeren 1987. Erik husket lyden av hammerslagene tidlig om morgenen, og hvordan mamma sang mens hun malte veggene gule. De hadde vært lykkelige den sommeren. Senere, da foreldrene skilte seg, hadde hytta blitt stående tom. Ingen ville ha den. Ingen ville bli minnet på det de hadde mistet. Nå var den hans.',
            correctRanges: [
                { words: 'Pappa hadde bygget den med egne hender sommeren 1987. Erik husket lyden av hammerslagene tidlig om morgenen, og hvordan mamma sang mens hun malte veggene gule. De hadde vært lykkelige den sommeren', explanation: 'Første tilbakeblikk: et varmt, detaljert minne fra sommeren 1987. Hammerslagene og mammas sang gjør minnet sanselig og levende. "De hadde vært lykkelige" antyder at lykken tok slutt.' },
                { words: 'Senere, da foreldrene skilte seg, hadde hytta blitt stående tom. Ingen ville ha den. Ingen ville bli minnet på det de hadde mistet', explanation: 'Andre tilbakeblikk: hopper til et annet tidspunkt i fortiden - skilsmissen. De korte setningene ("Ingen ville ha den. Ingen ville bli minnet.") forsterker smerten og tomheten.' },
            ],
        },
    },
    {
        id: 'tilb-10-2',
        deviceId: 'tilbakeblikk',
        level: 10,
        instruction: 'Skriv en tekst med tilbakeblikk som skaper flere stemninger.',
        data: {
            type: 'write',
            prompt: 'Skriv et avsnitt (5-7 setninger) der en karakter opplever minst to tilbakeblikk som skaper forskjellige stemninger (for eksempel ett varmt og ett smertefullt). La tilbakeblikkene stå i kontrast til hverandre og til nåtiden.',
            hint: 'Bruk en gjenstand eller et sted som trigger begge minnene. La det første minnet være godt og det andre vondt, slik at leseren forstår kompleksiteten i karakterens følelser.',
            exampleAnswer: 'Lise fant den gamle gitaren på loftet. Strengene var rustne, men hun husket fortsatt den første akkorden faren lærte henne, en G-dur som fylte hele stuen med lyd. De hadde spilt sammen hver kveld den høsten. Men hun husket også den siste kvelden, da han smelte gitaren i gulvet etter en krangel med mamma. Strengene spratt, og lyden var som et skrik. Lise strøk forsiktig over treverket. Noen sprekker kan repareres. Andre kan det ikke.',
        },
    },
    {
        id: 'tilb-10-3',
        deviceId: 'tilbakeblikk',
        level: 10,
        instruction: 'Koble hvert tekstutdrag med den litterære funksjonen tilbakeblikket har.',
        data: {
            type: 'match',
            pairs: [
                { example: 'Midt i en rettssak husker den tiltalte barndommen sin i fattigdom. Vi forstår hvorfor hun stjal.', label: 'Skape sympati og forklare motivasjon' },
                { example: 'Etter et helt kapittel i nåtiden hopper forfatteren til 20 år tilbake og viser en hemmelighet karakteren aldri har fortalt noen.', label: 'Avsløre skjult informasjon (plot twist)' },
                { example: 'En soldat i krig tenker tilbake på kona og barna hjemme. Så sitter han i skyttergraven igjen.', label: 'Skape kontrast mellom nåtid og fortid' },
                { example: 'Romanen veksler mellom 1940 og 2020, og viser hvordan bestemors valg under krigen preger barnebarnet i dag.', label: 'Vise sammenheng mellom generasjoner (tematisk dybde)' },
            ],
        },
    },
];
