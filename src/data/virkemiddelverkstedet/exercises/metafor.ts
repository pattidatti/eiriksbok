import type { Exercise } from '../types';

export const metaforExercises: Exercise[] = [
    // === NIVÅ 1 ===
    {
        id: 'metafor-1-1',
        deviceId: 'metafor',
        level: 1,
        instruction: 'Hvilket virkemiddel er brukt i denne setningen?',
        data: {
            type: 'identify',
            text: 'Livet er en reise.',
            options: [
                { deviceId: 'metafor', label: 'Metafor', correct: true, feedback: 'Riktig! Livet kalles en reise uten å bruke "som" eller "lik".' },
                { deviceId: 'sammenligning', label: 'Sammenligning', correct: false, feedback: 'Nesten! En sammenligning bruker "som" eller "lik". Her mangler det.' },
                { deviceId: 'personifisering', label: 'Personifisering', correct: false, feedback: 'Nei, personifisering gir menneskelige egenskaper til noe ikke-menneskelig.' },
                { deviceId: 'symbol', label: 'Symbol', correct: false, feedback: 'Nei, et symbol er en gjenstand som representerer noe annet.' },
            ],
        },
    },
    {
        id: 'metafor-1-2',
        deviceId: 'metafor',
        level: 1,
        instruction: 'Hvilket virkemiddel er brukt?',
        data: {
            type: 'identify',
            text: 'Tiden er penger.',
            options: [
                { deviceId: 'metafor', label: 'Metafor', correct: true, feedback: 'Riktig! Tid kalles penger - det er en metafor for at tid er verdifull.' },
                { deviceId: 'ironi', label: 'Ironi', correct: false, feedback: 'Nei, ironi er å si det motsatte av det man mener.' },
                { deviceId: 'sammenligning', label: 'Sammenligning', correct: false, feedback: 'Nei, det mangler "som" eller "lik" - dette er en metafor.' },
                { deviceId: 'kontrast', label: 'Kontrast', correct: false, feedback: 'Nei, kontrast setter motsetninger opp mot hverandre.' },
            ],
        },
    },
    {
        id: 'metafor-1-3',
        deviceId: 'metafor',
        level: 1,
        instruction: 'Marker metaforen i setningen.',
        data: {
            type: 'highlight',
            text: 'Skolen er et fengsel, sa han og sukket tungt.',
            correctRanges: [
                { words: 'Skolen er et fengsel', explanation: 'Skolen kalles et fengsel - det er metaforen. Han mener at skolen føler seg innestengt og kjedelig.' },
            ],
        },
    },
    {
        id: 'metafor-1-4',
        deviceId: 'metafor',
        level: 1,
        instruction: 'Marker metaforen.',
        data: {
            type: 'highlight',
            text: 'Hun hadde sommerfugler i magen for presentasjonen.',
            correctRanges: [
                { words: 'sommerfugler i magen', explanation: 'Det er selvfolgelig ikke ekte sommerfugler - metaforen beskriver nervositet.' },
            ],
        },
    },

    // === NIVÅ 2 ===
    {
        id: 'metafor-2-1',
        deviceId: 'metafor',
        level: 2,
        instruction: 'Hva kan denne metaforen bety?',
        data: {
            type: 'explain',
            text: 'Han bygde en mur rundt følelsene sine.',
            highlightedWords: 'bygde en mur',
            question: 'Hva betyr det at han "bygde en mur" rundt følelsene?',
            options: [
                { text: 'Han nektet å vise følelser og stengte andre ute', correct: true, feedback: 'Riktig! Muren er en metafor for emosjonell distanse og selvbeskyttelse.' },
                { text: 'Han bygde en ekte mur av stein', correct: false, feedback: 'Nei, dette er ikke bokstavelig. Muren er et bilde på noe annet.' },
                { text: 'Han var glad og ville feire', correct: false, feedback: 'Nei, en mur stenger ute - det antyder det motsatte av åpenhet.' },
            ],
        },
    },
    {
        id: 'metafor-2-2',
        deviceId: 'metafor',
        level: 2,
        instruction: 'Hvilket virkemiddel er brukt i dette avsnittet?',
        data: {
            type: 'identify',
            text: 'Læreren plantet fro av nysgjerrighet i elevene. Dag etter dag vannet hun dem med historier, og langsomt begynte de å spire.',
            options: [
                { deviceId: 'metafor', label: 'Metafor', correct: true, feedback: 'Riktig! Hele avsnittet bruker en utvidet metafor der læring sammenlignes med planting og vekst.' },
                { deviceId: 'besjeling', label: 'Besjeling', correct: false, feedback: 'Nei, besjeling gir følelser til livløse ting. Her beskrives læreren gjennom et bilde.' },
                { deviceId: 'frampek', label: 'Frampek', correct: false, feedback: 'Nei, et frampek antyder noe som skal skje senere. Her beskrives en prosess.' },
                { deviceId: 'gjentakelse', label: 'Gjentakelse', correct: false, feedback: 'Nei, selv om plante-bildet utvides, er det ikke gjentakelse - det er en metafor.' },
            ],
        },
    },
    {
        id: 'metafor-2-3',
        deviceId: 'metafor',
        level: 2,
        instruction: 'Marker metaforen i teksten.',
        data: {
            type: 'highlight',
            text: 'Etter bruddet følte hun seg som et tomt skall. Ingenting var igjen på innsiden.',
            correctRanges: [
                { words: 'et tomt skall', explanation: 'Hun sammenlignes med et tomt skall - noe som er uthulet og uten innhold. Det viser at hun føler seg tom innvendig.' },
            ],
        },
    },

    // === NIVÅ 3 ===
    {
        id: 'metafor-3-1',
        deviceId: 'metafor',
        level: 3,
        instruction: 'Hva kan denne metaforen bety? Tenk dypere!',
        data: {
            type: 'explain',
            text: 'De sto ved et veiskille. Den ene veien var opplyst, den andre forsvant inn i tåke. Hun visste at valget ville forandre alt.',
            highlightedWords: 'et veiskille',
            question: 'Hva representerer veiskillet som metafor?',
            options: [
                { text: 'Et viktig livsvalg der man må velge mellom to helt forskjellige retninger', correct: true, feedback: 'Riktig! Veiskillet er en klassisk metafor for valg. Den opplyste veien representerer det trygge, tåken det ukjente.' },
                { text: 'At de bokstavelig talt sto ved en vei som delte seg', correct: false, feedback: 'Teksten antyder noe dypere enn en fysisk vei - hun vet at "valget ville forandre alt".' },
                { text: 'At de hadde gått seg vill i naturen', correct: false, feedback: 'Nei, konteksten viser at dette handler om et livsvalg, ikke en tur i naturen.' },
            ],
        },
    },
    {
        id: 'metafor-3-2',
        deviceId: 'metafor',
        level: 3,
        instruction: 'Her brukes flere virkemidler. Marker kun metaforen.',
        data: {
            type: 'highlight',
            text: 'Vinden hvisket hemmeligheter mens hun vandret gjennom en labyrint av minner.',
            correctRanges: [
                { words: 'en labyrint av minner', explanation: 'Minnene beskrives som en labyrint - forvirrende, innviklet, lett å gå seg vill i. (Merk: "Vinden hvisket" er personifisering, ikke metafor.)' },
            ],
        },
    },
    {
        id: 'metafor-3-3',
        deviceId: 'metafor',
        level: 3,
        instruction: 'Koble hvert eksempel med riktig virkemiddel.',
        data: {
            type: 'match',
            pairs: [
                { example: 'Hun er en løvinne når hun beskytter barna sine.', label: 'Metafor' },
                { example: 'Hun er sterk som en løvinne.', label: 'Sammenligning' },
                { example: 'Havet brølte mot dem.', label: 'Personifisering' },
                { example: 'Ringen glitret i lyset for siste gang.', label: 'Symbol' },
            ],
        },
    },

    // === NIVÅ 4 (Skribent) ===
    {
        id: 'metafor-4-1',
        deviceId: 'metafor',
        level: 4,
        instruction: 'Skriv en setning der du bruker en metafor for å beskrive stress før en prøve.',
        data: {
            type: 'write',
            prompt: 'Bruk en metafor for å beskrive følelsen av stress før en viktig prøve. Husk: ikke bruk "som" eller "lik".',
            hint: 'Tenk på noe som presser, koker, eller eksploderer.',
            exampleAnswer: 'Hodet mitt var en dampkoker like før den eksploderer.',
        },
    },
    {
        id: 'metafor-4-2',
        deviceId: 'metafor',
        level: 4,
        instruction: 'Fyll inn en metafor som passer.',
        data: {
            type: 'fill-blank',
            textBefore: 'Etter at hun vant konkurransen, var hun',
            textAfter: '.',
            correctAnswers: ['på toppen av verden', 'en rakett', 'i skyene', 'en superstjerne', 'i den syvende himmel'],
            explanation: 'Her trenger vi en metafor som viser enorm glede eller triumf. For eksempel "på toppen av verden" - hun er selvfølgelig ikke bokstavelig på toppen av verden, men metaforen viser at hun føler seg uovervinnelig.',
        },
    },
    {
        id: 'metafor-4-3',
        deviceId: 'metafor',
        level: 4,
        instruction: 'Skriv en metafor som beskriver en god venn.',
        data: {
            type: 'write',
            prompt: 'Beskriv en god venn ved hjelp av en metafor. Hva er en god venn? Ikke bruk "som" eller "lik".',
            hint: 'Tenk på noe som er trygt, sterkt, eller alltid der - for eksempel et anker, en klippe, et lys.',
            exampleAnswer: 'Sara er en klippe i livet mitt - hun står støtt uansett hva som skjer.',
        },
    },

    // === NIVÅ 5 (Detektiv) ===
    {
        id: 'metafor-5-1',
        deviceId: 'metafor',
        level: 5,
        instruction: 'En av disse setningene inneholder en feil bruk av metafor. Finn den!',
        data: {
            type: 'find-error',
            text: 'Les alle setningene og finn den som ikke er en ekte metafor.',
            errorDescription: 'En av setningene bruker "som", og er derfor en sammenligning - ikke en metafor.',
            options: [
                { text: 'Hjertet hennes var is.', correct: false, feedback: 'Dette er en riktig metafor. Hjertet kalles is uten å bruke "som" eller "lik".' },
                { text: 'Han var rask som en gepard.', correct: true, feedback: 'Riktig! Denne bruker "som", og er derfor en sammenligning, ikke en metafor. Hadde det stått "Han var en gepard" ville det vært en metafor.' },
                { text: 'Klasserommet var en sauna.', correct: false, feedback: 'Dette er en riktig metafor. Klasserommet kalles en sauna for å vise at det er varmt.' },
                { text: 'Øynene hennes var diamanter.', correct: false, feedback: 'Dette er en riktig metafor. Øynene beskrives som diamanter - vakre og skinnende.' },
            ],
        },
    },
    {
        id: 'metafor-5-2',
        deviceId: 'metafor',
        level: 5,
        instruction: 'Er denne påstanden sann eller usann?',
        data: {
            type: 'true-false',
            statement: 'Setningen "Livet er som en boks med sjokolade" er en metafor.',
            correct: false,
            explanation: 'Usant! Fordi setningen bruker "som", er dette en sammenligning. Hadde det stått "Livet er en boks med sjokolade" uten "som", ville det vært en metafor.',
        },
    },
    {
        id: 'metafor-5-3',
        deviceId: 'metafor',
        level: 5,
        instruction: 'Finn feilen i denne teksten.',
        data: {
            type: 'find-error',
            text: 'En elev har skrevet at "Sinnet kokte i ham" er personifisering. Er det riktig?',
            errorDescription: 'Eleven har bestemt feil virkemiddel.',
            options: [
                { text: 'Eleven har rett - det er personifisering fordi sinne ikke kan koke', correct: false, feedback: 'Nei! Personifisering gir menneskelige egenskaper til noe som ikke er menneske. Sinne er en følelse som beskrives gjennom bildet av noe som koker - det er en metafor.' },
                { text: 'Eleven tar feil - det er en metafor fordi følelsen beskrives som kokende væske', correct: true, feedback: 'Riktig! Sinnet sammenlignes med en kokende væske uten å bruke "som". Det er en metafor.' },
                { text: 'Eleven tar feil - det er en gjentakelse', correct: false, feedback: 'Nei, det er ingen gjentakelse her. Det er en metafor der sinne beskrives som noe som koker.' },
            ],
        },
    },

    // === NIVÅ 6 (Analytiker) ===
    {
        id: 'metafor-6-1',
        deviceId: 'metafor',
        level: 6,
        instruction: 'Marker alle metaforene i denne lengre teksten.',
        data: {
            type: 'highlight',
            text: 'Eksamensperioden var et maraton. Uke etter uke tråkket elevene videre, selv om beina var bly. Noen krasjet tidlig og ga opp. Andre fant et nytt gir og spurtet mot mål. Da den siste prøven var levert, var frihetsfølelsen en eksplosjon i brystet.',
            correctRanges: [
                { words: 'et maraton', explanation: 'Eksamensperioden kalles et maraton - noe som krever utholdenhet over lang tid.' },
                { words: 'beina var bly', explanation: 'Beina kalles bly - de føles tunge og vanskelige å bevege, som tungt metall.' },
                { words: 'fant et nytt gir', explanation: 'Gir er hentet fra sykling eller bil - det betyr at de fikk ny energi og økte tempoet.' },
                { words: 'en eksplosjon i brystet', explanation: 'Frihetsfølelsen beskrives som en eksplosjon - plutselig, kraftig og overveldende.' },
            ],
        },
    },
    {
        id: 'metafor-6-2',
        deviceId: 'metafor',
        level: 6,
        instruction: 'Analyser hva denne utvidete metaforen betyr.',
        data: {
            type: 'explain',
            text: 'Ungdomsskolen var et hav. Noen elever surfet på bølgene med et smil, mens andre kjempet for å holde hodet over vannet. Lærerne var livbøyer kastet ut fra land, men ikke alle rakk å gripe tak.',
            highlightedWords: 'et hav',
            question: 'Forfatteren bruker havet som en gjennomgående metafor. Hva forteller den oss om ungdomsskolen?',
            options: [
                { text: 'At ungdomsskolen er uforutsigbar og vanskelig for mange, at noen klarer seg bedre enn andre, og at lærerne prøver å hjelpe men ikke alltid lykkes', correct: true, feedback: 'Riktig! Havet representerer noe vilt og ukontrollerbart. Bølgesurferne er de som mestrer det, de som kjemper er de som sliter, og livbøyene (lærerne) når ikke alle.' },
                { text: 'At skolen ligger nær sjøen', correct: false, feedback: 'Nei, dette er billedlig språk. Havet er en metafor for skolehverdagen.' },
                { text: 'At alle elever bør lære å svømme', correct: false, feedback: 'Nei, svømming er ikke poenget. Havet er et bilde på utfordringene i skolen.' },
            ],
        },
    },
    {
        id: 'metafor-6-3',
        deviceId: 'metafor',
        level: 6,
        instruction: 'Marker metaforene. Ikke marker andre virkemidler.',
        data: {
            type: 'highlight',
            text: 'Stillheten etter krangelen var en tung dyne som la seg over hele huset. Ingen sa et ord. Mamma var en statue ved kjøkkenbordet, og pappa gjemte seg bak avisen sin. Klokken tikket og tikket, som om den prøvde å minne dem på at tiden gikk.',
            correctRanges: [
                { words: 'en tung dyne', explanation: 'Stillheten kalles en tung dyne - noe som tynger og dekker alt. (Merk: "som la seg over" er del av bildet, men "som" her beskriver dynen, ikke sammenligningen.)' },
                { words: 'en statue', explanation: 'Mamma kalles en statue - hun sitter helt stille og uttrykksløs, som om hun er frosset.' },
            ],
        },
    },

    // === NIVÅ 7 (Kritiker) ===
    {
        id: 'metafor-7-1',
        deviceId: 'metafor',
        level: 7,
        instruction: 'Koble hver setning med den riktige typen virkemiddel.',
        data: {
            type: 'match',
            pairs: [
                { example: 'Tankene var en jungel han ikke fant veien ut av.', label: 'Metafor' },
                { example: 'Tankene fløy rundt som ville fugler.', label: 'Sammenligning' },
                { example: 'Tankene nektet å gi ham fred.', label: 'Personifisering' },
                { example: 'Tankene krøp, klatret, krabbet gjennom hodet.', label: 'Alliterasjon' },
                { example: 'Mørke tanker, mørk natt - alt var mørkt.', label: 'Gjentakelse' },
            ],
        },
    },
    {
        id: 'metafor-7-2',
        deviceId: 'metafor',
        level: 7,
        instruction: 'Sorter uttrykkene i riktig kategori.',
        data: {
            type: 'sort',
            categories: [
                { id: 'metafor', label: 'Metafor' },
                { id: 'sammenligning', label: 'Sammenligning' },
                { id: 'ingen', label: 'Bokstavelig (ingen virkemiddel)' },
            ],
            items: [
                { text: 'Han er en bjørn om morgenen.', categoryId: 'metafor' },
                { text: 'Han er gretten som en bjørn om morgenen.', categoryId: 'sammenligning' },
                { text: 'Han er gretten om morgenen.', categoryId: 'ingen' },
                { text: 'Kjærligheten er en rose.', categoryId: 'metafor' },
                { text: 'Kjærligheten er vakker lik en rose.', categoryId: 'sammenligning' },
                { text: 'Kjærligheten er vakker.', categoryId: 'ingen' },
            ],
        },
    },
    {
        id: 'metafor-7-3',
        deviceId: 'metafor',
        level: 7,
        instruction: 'Er denne påstanden sann eller usann?',
        data: {
            type: 'true-false',
            statement: 'En utvidet metafor er når det samme bildet (for eksempel havet) brukes gjennomgående i en hel tekst for å beskrive noe annet.',
            correct: true,
            explanation: 'Sant! En utvidet metafor (også kalt vedvarende metafor) holder fast ved ett bilde gjennom hele teksten. For eksempel kan en tekst bruke havet gjennomgående: "livet er et hav", "bølgene slo mot henne", "hun fant endelig land".',
        },
    },

    // === NIVÅ 8 (Sorteringsekspert) ===
    {
        id: 'metafor-8-1',
        deviceId: 'metafor',
        level: 8,
        instruction: 'Sorter disse metaforene etter hva de beskriver.',
        data: {
            type: 'sort',
            categories: [
                { id: 'folelser', label: 'Beskriver følelser' },
                { id: 'tid', label: 'Beskriver tid' },
                { id: 'mennesker', label: 'Beskriver mennesker' },
            ],
            items: [
                { text: 'Hjertet hennes var en ørken.', categoryId: 'folelser' },
                { text: 'Glede boblet opp som en vulkan i magen.', categoryId: 'folelser' },
                { text: 'Tiden er en tyv som stjeler alt.', categoryId: 'tid' },
                { text: 'Dagene var gull verd.', categoryId: 'tid' },
                { text: 'Han er en klovn i klassen.', categoryId: 'mennesker' },
                { text: 'Hun er en ensom ulv.', categoryId: 'mennesker' },
            ],
        },
    },
    {
        id: 'metafor-8-2',
        deviceId: 'metafor',
        level: 8,
        instruction: 'Koble metaforen med den mest presise forklaringen.',
        data: {
            type: 'match',
            pairs: [
                { example: 'Han var en tikkende bombe.', label: 'Noen som snart kommer til å eksplodere av sinne' },
                { example: 'Hun var en sol i rommet.', label: 'Noen som lyser opp og sprer glede' },
                { example: 'Ordene hans var gift.', label: 'Noen som sier ting som skader andre' },
                { example: 'Livet hans var en berg-og-dal-bane.', label: 'Et liv med mange opp- og nedturer' },
            ],
        },
    },
    {
        id: 'metafor-8-3',
        deviceId: 'metafor',
        level: 8,
        instruction: 'Sorter disse uttrykkene etter om de er "døde metaforer" (så vanlige at vi ikke tenker på dem) eller "levende metaforer" (kreative og uvanlige).',
        data: {
            type: 'sort',
            categories: [
                { id: 'dod', label: 'Død metafor (hverdagslig)' },
                { id: 'levende', label: 'Levende metafor (kreativ)' },
            ],
            items: [
                { text: 'Foten av fjellet', categoryId: 'dod' },
                { text: 'Bordet har bein', categoryId: 'dod' },
                { text: 'Å falle i søvn', categoryId: 'dod' },
                { text: 'Tankene hans var en karussell i storm', categoryId: 'levende' },
                { text: 'Ordene var glødende kull i halsen', categoryId: 'levende' },
                { text: 'Ensomheten var en tom konsertsal', categoryId: 'levende' },
            ],
        },
    },

    // === NIVÅ 9 (Mester) ===
    {
        id: 'metafor-9-1',
        deviceId: 'metafor',
        level: 9,
        instruction: 'Skriv en kort tekst (2-3 setninger) der du bruker en utvidet metafor. Velg ett bilde og hold deg til det gjennom hele teksten.',
        data: {
            type: 'write',
            prompt: 'Skriv en kort tekst om vennskap der du bruker en gjennomgående metafor fra naturen (for eksempel trær, hav, fjell). Bildet skal gå igjen i hele teksten.',
            hint: 'Velg ett bilde fra naturen og bygg videre på det. For eksempel: Hvis vennskap er et tre, hva er røttene? Hva er grenene? Hva skjer hvis det ikke vannes?',
            exampleAnswer: 'Vennskapet deres var et gammelt eiketre. Røttene gikk dypt etter mange år med hemmeligheter og latter. Men den siste vinteren hadde stormen blåst av de fleste bladene, og nå sto bare den nakne stammen igjen.',
        },
    },
    {
        id: 'metafor-9-2',
        deviceId: 'metafor',
        level: 9,
        instruction: 'Marker alle metaforene i denne teksten. Vær presis - det finnes også andre virkemidler som ikke skal markeres.',
        data: {
            type: 'highlight',
            text: 'Fotballkampen var krig. Spillerne var soldater som kjempet om hver centimeter av banen. Keeperen var en mur som ingenting slapp gjennom. Da dommeren blåste, la stillheten seg over stadion som et teppe. Supporterne hadde brukt opp all sin krutt.',
            correctRanges: [
                { words: 'krig', explanation: 'Kampen kalles krig - en metafor for intens kamp og rivalisering.' },
                { words: 'en mur', explanation: 'Keeperen kalles en mur - ugjennomtrengelig og solid.' },
                { words: 'krutt', explanation: 'Supporternes energi kalles krutt - det som driver eksplosjoner, her brukt om energi og entusiasme. "Brukt opp all sin krutt" betyr at de ikke hadde mer å gi.' },
            ],
        },
    },
    {
        id: 'metafor-9-3',
        deviceId: 'metafor',
        level: 9,
        instruction: 'Fyll inn en kreativ og original metafor som fullfører avsnittet.',
        data: {
            type: 'fill-blank',
            textBefore: 'Etter sommeren hadde alt forandret seg. De gamle vennene var borte, skolen var ny, og fremtiden var',
            textAfter: '. Hun visste ikke om hun gledet seg eller var redd.',
            correctAnswers: ['en blank side', 'et åpent hav', 'en lukket dør', 'et ukjent terreng', 'et uutforsket landskap', 'en tom scene', 'en uskrevet bok'],
            explanation: 'Her trenger vi en metafor som viser usikkerhet og det ukjente. Gode svar er bilder som kan tolkes både positivt og negativt - akkurat som hun selv er usikker på om hun gleder seg eller er redd.',
        },
    },

    // === NIVÅ 10 (Magister) ===
    {
        id: 'metafor-10-1',
        deviceId: 'metafor',
        level: 10,
        instruction: 'Analyser den utvidete metaforen i denne teksten. Hva representerer hvert element?',
        data: {
            type: 'explain',
            text: 'Klasserommet var et akvarium. Elevene svømte rundt i sirkel, dag etter dag, med de samme bevegelsene. Læreren kastet inn mat - formler, fakta, datoer - og de slukte det uten å tenke. Av og til presset noen ansiktet mot glasset og drømte om havet utenfor. Men de fleste hadde glemt at glasset fantes.',
            highlightedWords: 'et akvarium',
            question: 'Hva kritiserer forfatteren gjennom akvarium-metaforen?',
            options: [
                { text: 'At skolesystemet er begrenset og repetitivt - elevene er fanget i et lite rom, mate med ferdige svar, og de fleste har sluttet å ønske seg noe annet', correct: true, feedback: 'Riktig! Akvariet representerer skolesystemets begrensninger. Sirkelssvømmingen er repetisjon, maten er passiv læring, glasset er systemets grenser, og havet er fri tenkning og kreativitet. De som "glemte at glasset fantes" har akseptert systemet uten å stille spørsmål.' },
                { text: 'At klasserommet har fine vinduer', correct: false, feedback: 'Nei, akvariet er en metafor. Glasset representerer begrensningene i systemet, ikke ekte vinduer.' },
                { text: 'At elevene liker å svømme', correct: false, feedback: 'Nei, svømmingen er metaforisk. Den beskriver at elevene gjør de samme tingene om og om igjen uten å tenke.' },
            ],
        },
    },
    {
        id: 'metafor-10-2',
        deviceId: 'metafor',
        level: 10,
        instruction: 'Skriv et kort avsnitt (3-4 setninger) der du bruker en utvidet metafor for å beskrive ungdomstiden. Bruk et originalt bilde - ikke "reise", "hav" eller "vei", som er brukt for ofte.',
        data: {
            type: 'write',
            prompt: 'Beskriv ungdomstiden gjennom en utvidet metafor. Velg et bilde ingen har brukt tusen ganger før. Bygg det ut med detaljer som passer - hvert element i metaforen skal bety noe.',
            hint: 'Tenk kreativt! Ungdomstiden kan være en byggeplass (noe rives ned og noe bygges opp), et laboratorium (man eksperimenterer), et puslespill (bitene passer ikke ennå), eller noe helt annet.',
            exampleAnswer: 'Ungdomstiden er en byggeplass. Det gamle barnerommet rives ned, og støvet fyller luften. Noen dager føles det som om ingenting blir ferdig - overalt ligger halvferdige vegger og åpne hull i gulvet. Men midt i kaoset begynner et nytt bygg å ta form, en du aldri har sett før.',
        },
    },
    {
        id: 'metafor-10-3',
        deviceId: 'metafor',
        level: 10,
        instruction: 'Sorter disse setningene etter hvilken type billedlig språk de bruker.',
        data: {
            type: 'sort',
            categories: [
                { id: 'metafor', label: 'Metafor' },
                { id: 'sammenligning', label: 'Sammenligning' },
                { id: 'personifisering', label: 'Personifisering' },
                { id: 'besjeling', label: 'Besjeling' },
            ],
            items: [
                { text: 'Mobilen var en lenke som holdt henne fanget.', categoryId: 'metafor' },
                { text: 'Sjalusien var en ild som fortærte ham innenfra.', categoryId: 'metafor' },
                { text: 'Stemmen hans var myk som fløyel.', categoryId: 'sammenligning' },
                { text: 'Musikken trøstet henne gjennom natten.', categoryId: 'personifisering' },
                { text: 'Vinden hvisket advarende ord.', categoryId: 'personifisering' },
                { text: 'Stolen sukket under vekten hans.', categoryId: 'besjeling' },
                { text: 'Det gamle huset stønnet i stormen.', categoryId: 'besjeling' },
                { text: 'Nervene var stramt spente gitarstrenger.', categoryId: 'metafor' },
            ],
        },
    },
];
