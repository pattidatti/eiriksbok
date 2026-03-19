import type { Exercise } from '../types';

export const alliterasjonExercises: Exercise[] = [
    // === NIVÅ 1 ===
    {
        id: 'allit-1-1',
        deviceId: 'alliterasjon',
        level: 1,
        instruction: 'Hvilket virkemiddel er brukt?',
        data: {
            type: 'identify',
            text: 'Barske, brune bjørner.',
            options: [
                { deviceId: 'alliterasjon', label: 'Alliterasjon', correct: true, feedback: 'Riktig! Alle tre ordene begynner på "b"-lyd. Det er alliterasjon.' },
                { deviceId: 'gjentakelse', label: 'Gjentakelse', correct: false, feedback: 'Nei, det er ikke hele ord som gjentas, men første lyd i hvert ord. Det er alliterasjon.' },
                { deviceId: 'sammenligning', label: 'Sammenligning', correct: false, feedback: 'Nei, ingenting sammenlignes her.' },
                { deviceId: 'metafor', label: 'Metafor', correct: false, feedback: 'Nei, bjørnene beskrives bokstavelig. Virkemiddelet er lydmønsteret.' },
            ],
        },
    },
    {
        id: 'allit-1-2',
        deviceId: 'alliterasjon',
        level: 1,
        instruction: 'Hvilket virkemiddel er brukt?',
        data: {
            type: 'identify',
            text: 'Ville, vakre vinternetter.',
            options: [
                { deviceId: 'alliterasjon', label: 'Alliterasjon', correct: true, feedback: 'Riktig! "Ville, vakre vinternetter" - alle ordene begynner på "v". Alliterasjon!' },
                { deviceId: 'besjeling', label: 'Besjeling', correct: false, feedback: 'Nei, vinternetter får ikke følelser her. Det er et lydmønster.' },
                { deviceId: 'kontrast', label: 'Kontrast', correct: false, feedback: '"Ville" og "vakre" kan virke som motsetninger, men virkemiddelet er lyden.' },
                { deviceId: 'symbol', label: 'Symbol', correct: false, feedback: 'Nei, vinternetter er ikke et symbol her.' },
            ],
        },
    },
    {
        id: 'allit-1-3',
        deviceId: 'alliterasjon',
        level: 1,
        instruction: 'Marker alliterasjonen.',
        data: {
            type: 'highlight',
            text: 'Store, sterke Sverre sto stille.',
            correctRanges: [
                { words: 'Store, sterke Sverre sto stille', explanation: 'Alle ordene begynner på "s"-lyd. Det skaper en tydelig rytme og gjør frasen minneverdig.' },
            ],
        },
    },
    {
        id: 'allit-1-4',
        deviceId: 'alliterasjon',
        level: 1,
        instruction: 'Marker alliterasjonen.',
        data: {
            type: 'highlight',
            text: 'Kalde, klare kvelder kom og gikk uten at noen la merke til det.',
            correctRanges: [
                { words: 'Kalde, klare kvelder kom', explanation: 'Fire ord på rad med "k"-lyd. Det skaper en klar, hard rytme som passer til kulden.' },
            ],
        },
    },

    // === NIVÅ 2 ===
    {
        id: 'allit-2-1',
        deviceId: 'alliterasjon',
        level: 2,
        instruction: 'Hva gjør alliterasjonen her?',
        data: {
            type: 'explain',
            text: 'Fjerne, forglemte fjell.',
            highlightedWords: 'Fjerne, forglemte fjell',
            question: 'Hva er effekten av alliterasjonen?',
            options: [
                { text: 'F-lyden skaper en myk, drømmende rytme som forsterker stemningen av noe fjernt og glemt', correct: true, feedback: 'Riktig! F-lyden er myk og luftig. Den passer perfekt til temaet - noe som er langt borte og nesten glemt. Lyden forsterker meningen.' },
                { text: 'At fjellene er store', correct: false, feedback: 'Nei, det handler ikke om størrelse, men om stemningen alliterasjonen skaper.' },
                { text: 'At forfatteren liker bokstaven F', correct: false, feedback: 'Nei, alliterasjon er et bevisst valg for å skape en spesifikk effekt - ikke en personlig preferanse.' },
            ],
        },
    },
    {
        id: 'allit-2-2',
        deviceId: 'alliterasjon',
        level: 2,
        instruction: 'Hvilket virkemiddel er brukt?',
        data: {
            type: 'identify',
            text: 'Nå nærmer natten seg.',
            options: [
                { deviceId: 'alliterasjon', label: 'Alliterasjon', correct: true, feedback: 'Riktig! "Nå nærmer natten" - tre ord på "n". Det skaper en myk, uhyggelig stemning.' },
                { deviceId: 'besjeling', label: 'Besjeling', correct: false, feedback: '"Nærmer seg" kan tolkes som besjeling, men det er alliterasjonen som er mest fremtredende.' },
                { deviceId: 'frampek', label: 'Frampek', correct: false, feedback: 'Natten "nærmer seg" kan antyde noe, men virkemiddelet er lyden - alliterasjon.' },
                { deviceId: 'gjentakelse', label: 'Gjentakelse', correct: false, feedback: 'Nei, det er første lyd som gjentas, ikke hele ord. Det er alliterasjon.' },
            ],
        },
    },
    {
        id: 'allit-2-3',
        deviceId: 'alliterasjon',
        level: 2,
        instruction: 'Marker alliterasjonen i teksten.',
        data: {
            type: 'highlight',
            text: 'Mektige, mørke masser av mennesker marsjerte gjennom gatene.',
            correctRanges: [
                { words: 'Mektige, mørke masser av mennesker marsjerte', explanation: 'Fem ord med "m"-lyd! Den tunge m-lyden forsterker følelsen av masse og kraft.' },
            ],
        },
    },

    // === NIVÅ 3 ===
    {
        id: 'allit-3-1',
        deviceId: 'alliterasjon',
        level: 3,
        instruction: 'Hva oppnår alliterasjonen her?',
        data: {
            type: 'explain',
            text: 'Svarte skyer sveipet sakte over sjøen.',
            highlightedWords: 'Svarte skyer sveipet sakte over sjøen',
            question: 'Hva gjør alliterasjonen med stemningen?',
            options: [
                { text: 'S-lyden mimer lyden av vind og vann - det skaper en langsom, uhyggelig stemning som passer til mørke skyer', correct: true, feedback: 'Riktig! S-lyden er hvislende og sakte. Den gjør at vi nesten "hører" vinden og vannet. Tempoet i setningen blir saktere, akkurat som skyene.' },
                { text: 'At det er fint vær', correct: false, feedback: 'Nei, "svarte skyer" antyder dårlig vær. Alliterasjonen forsterker den mørke stemningen.' },
                { text: 'At forfatteren skriver fort', correct: false, feedback: 'Nei, alliterasjonen skaper en effekt for leseren, ikke for skriveprosessen.' },
            ],
        },
    },
    {
        id: 'allit-3-2',
        deviceId: 'alliterasjon',
        level: 3,
        instruction: 'Koble hvert eksempel med riktig virkemiddel.',
        data: {
            type: 'match',
            pairs: [
                { example: 'Lange, lyse, lette linjer.', label: 'Alliterasjon' },
                { example: 'Stille. Stille. Stille.', label: 'Gjentakelse' },
                { example: 'Han var rask som en hare.', label: 'Sammenligning' },
                { example: 'Stolen klaget høyt da han satte seg.', label: 'Personifisering' },
            ],
        },
    },
    {
        id: 'allit-3-3',
        deviceId: 'alliterasjon',
        level: 3,
        instruction: 'Marker kun alliterasjonen. Her finnes andre virkemidler!',
        data: {
            type: 'highlight',
            text: 'Mørke, mektige murer omringet dem som fangevoktere. Aldri hadde de følt seg så små.',
            correctRanges: [
                { words: 'Mørke, mektige murer', explanation: 'Tre "m"-ord på rad er alliterasjon. (Merk: "som fangevoktere" er en sammenligning.)' },
            ],
        },
    },

    // === NIVÅ 4 ===
    {
        id: 'allit-4-1',
        deviceId: 'alliterasjon',
        level: 4,
        instruction: 'Skriv en setning med alliterasjon.',
        data: {
            type: 'write',
            prompt: 'Skriv en setning der minst tre ord begynner på samme lyd. Prøv å skape en bestemt stemning.',
            hint: 'Velg en lyd og tenk på ord som begynner med den. For eksempel: s-lyd gir mykhet, k-lyd gir hardhet.',
            exampleAnswer: 'Rasende, rå regndråper ramlet fra himmelen.',
        },
    },
    {
        id: 'allit-4-2',
        deviceId: 'alliterasjon',
        level: 4,
        instruction: 'Fyll inn ordet som fullfører alliterasjonen.',
        data: {
            type: 'fill-blank',
            textBefore: 'Tunge, trøtte',
            textAfter: 'trasket gjennom mørket.',
            correctAnswers: ['troll', 'tropper', 'turister'],
            acceptKeywords: ['tanker', 'tenåringer', 'travere', 'trollmenn', 'tyver', 'titaner', 'trær'],
            hint: 'Ordet må begynne med «t» for å fortsette alliterasjonen.',
            explanation: 'Et ord som begynner på "t" fullfører alliterasjonen. T-lyden skaper en tung, slitsom rytme som passer til stemningen.',
        },
    },
    {
        id: 'allit-4-3',
        deviceId: 'alliterasjon',
        level: 4,
        instruction: 'Skriv to setninger med alliterasjon som gir ulik stemning.',
        data: {
            type: 'write',
            prompt: 'Skriv en setning med myk alliterasjon (f, l, m, s) og en med hard alliterasjon (k, p, t, r). Merk hvilken som er myk og hvilken som er hard.',
            hint: 'Myke lyder skaper ro, harde lyder skaper kraft eller uro.',
            exampleAnswer: 'Myk: Lette, lyse løv landet stille. Hard: Kraftige, kalde kuler knuste glasset.',
        },
    },

    // === NIVÅ 5 ===
    {
        id: 'allit-5-1',
        deviceId: 'alliterasjon',
        level: 5,
        instruction: 'Finn feilen i forklaringen av alliterasjon.',
        data: {
            type: 'find-error',
            text: 'Raske, røde rådyr rømte over ridgen.',
            errorDescription: 'En elev har analysert dette eksempelet. Hvilken påstand er feil?',
            options: [
                { text: 'Alliterasjon betyr at ordene rimer på hverandre', correct: true, feedback: 'Riktig feil! Alliterasjon handler om at ord begynner på samme lyd, ikke at de rimer. Rim handler om sluttlyd, alliterasjon om begynnelseslyd.' },
                { text: 'R-lyden skaper en rask, rullende rytme som passer til bevegelsen', correct: false, feedback: 'Dette er en riktig analyse. R-lyden mimer farten i teksten.' },
                { text: 'Alle ordene begynner på bokstaven R, og det er alliterasjon', correct: false, feedback: 'Dette er riktig. Fem ord på "r" er et klart eksempel på alliterasjon.' },
            ],
        },
    },
    {
        id: 'allit-5-2',
        deviceId: 'alliterasjon',
        level: 5,
        instruction: 'Er denne påstanden riktig eller feil?',
        data: {
            type: 'true-false',
            statement: 'Alliterasjon handler om bokstaven ordene begynner med, ikke lyden. Derfor er "sju sjøfolk" ikke alliterasjon fordi "s" og "sj" er forskjellige bokstaver.',
            correct: false,
            explanation: 'Feil! Alliterasjon handler om lyd, ikke bokstav. "Sju" og "sjøfolk" begynner med samme lyd (sj-lyd), så det er alliterasjon selv om det skrives med ulike bokstavkombinasjoner.',
        },
    },
    {
        id: 'allit-5-3',
        deviceId: 'alliterasjon',
        level: 5,
        instruction: 'Er denne påstanden riktig eller feil?',
        data: {
            type: 'true-false',
            statement: 'Alliterasjon gjør tekst mer minneverdig fordi gjentatt lyd skaper rytme som hjernen lettere husker.',
            correct: true,
            explanation: 'Riktig! Forskning viser at lydmønstre gjør tekst lettere å huske. Tenk på ordtak som "tid og tålmodighet" eller merkenavn som "Coca-Cola". Alliterasjon fester seg i minnet.',
        },
    },

    // === NIVÅ 6 ===
    {
        id: 'allit-6-1',
        deviceId: 'alliterasjon',
        level: 6,
        instruction: 'Marker alliterasjonen i denne lengre teksten.',
        data: {
            type: 'highlight',
            text: 'Gjennom grå gater gikk hun i stillhet. Vinduen var mørke. Bare den bleke, blålige bakgården lå badet i månelys.',
            correctRanges: [
                { words: 'Gjennom grå gater gikk', explanation: 'Fire ord med "g"-lyd skaper en tung, grå stemning som passer til settingen.' },
                { words: 'bleke, blålige bakgården lå badet', explanation: 'B-lyden i "bleke, blålige bakgården" og videre med "badet" skaper en myk, melankolsk stemning i månelyset.' },
            ],
        },
    },
    {
        id: 'allit-6-2',
        deviceId: 'alliterasjon',
        level: 6,
        instruction: 'Forklar sammenhengen mellom lyden og innholdet.',
        data: {
            type: 'explain',
            text: 'Knitrende, kald kvist knakk under den tunge støvelen. Frosten hadde festet et fast grep om skogen.',
            highlightedWords: 'Knitrende, kald kvist knakk',
            question: 'Hvordan forsterker k-lyden innholdet?',
            options: [
                { text: 'K-lyden er hard og brå, akkurat som lyden av kvist som knekker. Alliterasjonen gjør at leseren nesten hører lyden av frosne kvister som brekker.', correct: true, feedback: 'Riktig! K-lyden er plosiv (brå og hard) og mimer selve knekkelyden. Det er lydmalende alliterasjon - lyden av virkemiddelet matcher innholdet.' },
                { text: 'At det er kaldt ute', correct: false, feedback: 'Det stemmer, men spørsmålet handler om hvordan selve lyden forsterker opplevelsen.' },
                { text: 'At forfatteren bruker mange k-ord', correct: false, feedback: 'Det er bare en observasjon. Spørsmålet er hvorfor k-lyden er et godt valg her.' },
            ],
        },
    },
    {
        id: 'allit-6-3',
        deviceId: 'alliterasjon',
        level: 6,
        instruction: 'Forklar effekten av alliterasjonen.',
        data: {
            type: 'explain',
            text: 'Lyset lekte lett langs den lange linjen av lønnetrær. Løvet lyste som levende gull.',
            highlightedWords: 'Lyset lekte lett langs den lange linjen',
            question: 'Hva gjør l-lyden med stemningen?',
            options: [
                { text: 'L-lyden er myk og flytende. Den skaper en rolig, nesten drømmende stemning som passer til et vakkert høstlandskap der alt flyter sammen i gyldent lys.', correct: true, feedback: 'Riktig! L-lyden er en av de mykeste lydene. Den skaper en ubrutt, flytende bevegelse gjennom setningen, akkurat som lyset som beveger seg langs trærne.' },
                { text: 'At det er mange trær', correct: false, feedback: 'Trærne er settingen. Spørsmålet handler om hvordan lyden skaper stemning.' },
                { text: 'At forfatteren liker høsten', correct: false, feedback: 'Forfatterens preferanser er irrelevant. Fokuser på hva lyden gjør med leserens opplevelse.' },
            ],
        },
    },

    // === NIVÅ 7 ===
    {
        id: 'allit-7-1',
        deviceId: 'alliterasjon',
        level: 7,
        instruction: 'Koble lyden med stemningen den typisk skaper.',
        data: {
            type: 'match',
            pairs: [
                { example: 'S-lyd: "Sakte, stille siger solen ned"', label: 'Myk, rolig, nesten hviskende' },
                { example: 'K-lyd: "Kalde, knuste knoker knurret"', label: 'Hard, brutal, voldsom' },
                { example: 'L-lyd: "Lette, lyse linjer leker"', label: 'Lett, elegant, flytende' },
                { example: 'R-lyd: "Rasende rant regnet rått"', label: 'Rå, kraftfull, dynamisk' },
            ],
        },
    },
    {
        id: 'allit-7-2',
        deviceId: 'alliterasjon',
        level: 7,
        instruction: 'Sorter eksemplene etter om lyden passer til innholdet eller ikke.',
        data: {
            type: 'sort',
            categories: [
                { id: 'passer', label: 'Lyden forsterker innholdet' },
                { id: 'passer-ikke', label: 'Lyden passer ikke til innholdet' },
            ],
            items: [
                { text: '"Stille, sakte snek skyggen seg frem" (s-lyd + sniking)', categoryId: 'passer' },
                { text: '"Knitrende, krakilske kvister knakk" (k-lyd + brekking)', categoryId: 'passer' },
                { text: '"Lette, lystige latter lød fra slagmarken" (l-lyd + slagmark)', categoryId: 'passer-ikke' },
                { text: '"Myk, mild morgendugg la seg over gravplassen" (m-lyd + gravplass)', categoryId: 'passer-ikke' },
                { text: '"Brusende, buldrende bølger brøt mot land" (b-lyd + bølger)', categoryId: 'passer' },
                { text: '"Rolige, runde regndråper rant rasende ned" (r-lyd + rolig regn)', categoryId: 'passer-ikke' },
            ],
        },
    },
    {
        id: 'allit-7-3',
        deviceId: 'alliterasjon',
        level: 7,
        instruction: 'Er denne påstanden riktig eller feil?',
        data: {
            type: 'true-false',
            statement: 'Alliterasjon fungerer best når lyden som velges passer til innholdet. For eksempel forsterker s-lyd rolige scener og k-lyd voldsomme scener.',
            correct: true,
            explanation: 'Riktig! Når lyden mimer innholdet, kaller vi det lydmalende alliterasjon. S-lyd kan høres ut som vind eller hvisking, k-lyd som slag eller brekking. De beste forfatterne velger lyder som forsterker stemningen.',
        },
    },

    // === NIVÅ 8 ===
    {
        id: 'allit-8-1',
        deviceId: 'alliterasjon',
        level: 8,
        instruction: 'Sorter tekstene etter om de inneholder alliterasjon, assonans (gjentatt vokal) eller ingen av delene.',
        data: {
            type: 'sort',
            categories: [
                { id: 'allit', label: 'Alliterasjon (gjentatt konsonantlyd i starten)' },
                { id: 'assonans', label: 'Assonans (gjentatt vokallyd)' },
                { id: 'ingen', label: 'Ingen lydvirkemiddel' },
            ],
            items: [
                { text: '"Friske, frosne fjorder"', categoryId: 'allit' },
                { text: '"Huset var rødt og fint og lite"', categoryId: 'ingen' },
                { text: '"Blå båter lå på strålen"', categoryId: 'assonans' },
                { text: '"Grå, grove grener grep etter himmelen"', categoryId: 'allit' },
                { text: '"Sol og gull og ung og full"', categoryId: 'assonans' },
                { text: '"Hun gikk til butikken og kjøpte brød"', categoryId: 'ingen' },
            ],
        },
    },
    {
        id: 'allit-8-2',
        deviceId: 'alliterasjon',
        level: 8,
        instruction: 'Koble hvert utdrag med den riktige analysen.',
        data: {
            type: 'match',
            pairs: [
                { example: '"Dype, dunkle daler der dagslyset aldri når"', label: 'D-lyden skaper tyngde og mørke som forsterker det utilgjengelige' },
                { example: '"Flagrende, frie fugler fløy over fjellene"', label: 'F-lyden er luftig og mimer bevegelsen av vinger' },
                { example: '"Tordnende, tunge trinn tramper gjennom tunnelen"', label: 'T-lyden er brå og hard og mimer fottrinn og drønn' },
                { example: '"Hviskende, hemmelige historier hang i luften"', label: 'H-lyden er pustende og skaper en intim, hemmelighetsfull stemning' },
            ],
        },
    },
    {
        id: 'allit-8-3',
        deviceId: 'alliterasjon',
        level: 8,
        instruction: 'Sorter disse alliterasjonene etter hvilken funksjon de har.',
        data: {
            type: 'sort',
            categories: [
                { id: 'lydmalende', label: 'Lydmalende (mimer en lyd)' },
                { id: 'stemning', label: 'Stemningsskapende' },
                { id: 'rytme', label: 'Rytmeskapende (gjør teksten fengende)' },
            ],
            items: [
                { text: '"Knitrende, krakende kvister knakk" (mimer knekkelyd)', categoryId: 'lydmalende' },
                { text: '"Mørke, melankolske minner" (skaper tristesse)', categoryId: 'stemning' },
                { text: '"Peter Plansen plukket plommer" (fengende barnerim)', categoryId: 'rytme' },
                { text: '"Susende, syngende sjøsprøyt" (mimer havlyd)', categoryId: 'lydmalende' },
                { text: '"Stille, sølvskimrende stjerner" (skaper ro)', categoryId: 'stemning' },
                { text: '"Snipp, snapp, snute" (fengende avslutning)', categoryId: 'rytme' },
            ],
        },
    },

    // === NIVÅ 9 ===
    {
        id: 'allit-9-1',
        deviceId: 'alliterasjon',
        level: 9,
        instruction: 'Marker alliterasjonen og forklar hvordan den samspiller med andre virkemidler.',
        data: {
            type: 'highlight',
            text: 'Sakte, sikkert snek skyggen seg som en sulten slange gjennom det stille, sovende slottet.',
            correctRanges: [
                { words: 'Sakte, sikkert snek skyggen seg som en sulten slange gjennom det stille, sovende slottet', explanation: 'Hele setningen domineres av s-lyden (12 s-ord!). S-lyden mimer slangens hvesing og snikingen. Alliterasjonen forsterker sammenligningen ("som en sulten slange") og besjelingen av skyggen.' },
            ],
        },
    },
    {
        id: 'allit-9-2',
        deviceId: 'alliterasjon',
        level: 9,
        instruction: 'Skriv en tekst der du bevisst bruker alliterasjon for å forsterke stemningen.',
        data: {
            type: 'write',
            prompt: 'Velg en stemning (uhyggelig, fredelig, kaotisk) og skriv 2-3 setninger der du bruker alliterasjon med lyder som passer til stemningen. Forklar kort ditt lydvalg.',
            hint: 'Tenk først på stemningen, deretter på hvilken lyd som passer. S for sniking, k for kaos, l for letthet, m for melankoli.',
            exampleAnswer: 'Uhyggelig: Kalde klør klirret mot steinveggen. Knirkende korridorer førte dypere og dypere ned. (K-lyden er hard og skarp og skaper ubehag.)',
        },
    },
    {
        id: 'allit-9-3',
        deviceId: 'alliterasjon',
        level: 9,
        instruction: 'Er denne påstanden riktig eller feil?',
        data: {
            type: 'true-false',
            statement: 'I norrøn poesi var alliterasjon viktigere enn rim. Vikingtidas diktere brukte alliterasjon som hovedvirkemiddel for å binde vers sammen.',
            correct: true,
            explanation: 'Riktig! Norrøn diktning (som eddakvad og skaldedikt) brukte alliterasjon som strukturelt prinsipp. Rim var vanligere i søreuropeisk diktning. Alliterasjon var selve limet som holdt de norrøne versene sammen.',
        },
    },

    // === NIVÅ 10 ===
    {
        id: 'allit-10-1',
        deviceId: 'alliterasjon',
        level: 10,
        instruction: 'Analyser denne komplekse teksten med flere lag alliterasjon.',
        data: {
            type: 'explain',
            text: 'Gjennom grå granskog gikk den gamle gutten. Plutselig pisket plaskende, piskende pålandsvind gjennom trærne. Stillheten var slått i stykker, som et speil som splintres.',
            highlightedWords: 'Gjennom grå granskog gikk',
            question: 'Teksten har tre ulike alliterasjoner med ulike lyder. Hvordan endrer lydene stemningen gjennom teksten?',
            options: [
                { text: 'G-lyden i starten er tung og rolig (vandring). P-lyden i midten er brå og eksplosiv (vinden kommer). S-lyden på slutten er hvislende og skarp (ødeleggelse). Lydene følger handlingen fra ro til kaos til ødeleggelse.', correct: true, feedback: 'Riktig! Forfatteren bruker tre ulike alliterasjoner som speiler handlingens utvikling. G-lyden skaper rolig tyngde, p-lyden bryter roen med brå kraft, og s-lyden avslutter med knusing. Lydene er dramaturgiske.' },
                { text: 'At det er mye vær i teksten', correct: false, feedback: 'Været er handlingen, men spørsmålet handler om hvordan lydvalgene forsterker utviklingen.' },
                { text: 'At forfatteren bruker mange konsonanter', correct: false, feedback: 'Det er en riktig observasjon, men analysen krever at du forklarer sammenhengen mellom lyd og innhold.' },
            ],
        },
    },
    {
        id: 'allit-10-2',
        deviceId: 'alliterasjon',
        level: 10,
        instruction: 'Skriv en tekst med lydskifte: bruk to ulike alliterasjoner som skaper en stemningsendring.',
        data: {
            type: 'write',
            prompt: 'Skriv 3-5 setninger der du starter med en alliterasjon som skaper en stemning, og deretter skifter til en annen alliterasjon med en annen stemning. Forklar overgangen.',
            hint: 'Start for eksempel med myk l-alliterasjon (fred) og skift til hard k-alliterasjon (fare). Overgangen er det mest interessante.',
            exampleAnswer: 'Lette, lysende lykter lyste langs elven. Lampene danset. Men i mørket bak trærne knirket det. Kalde klør krafset mot barken. Kvist etter kvist knakk. (Overgang fra l-lyd (trygghet) til k-lyd (trussel) - fra idyll til fare.)',
        },
    },
    {
        id: 'allit-10-3',
        deviceId: 'alliterasjon',
        level: 10,
        instruction: 'Koble hvert utdrag med riktig avansert analyse.',
        data: {
            type: 'match',
            pairs: [
                { example: '"Svarte svaner svømte sakte over den stille sjøen" (s-alliterasjon)', label: 'Lydmalende: s-lyden mimer vannets overflate og svanenes glidende bevegelse' },
                { example: '"Trommene tordnet. Troppene trammet. Terrenget skalv." (t-alliterasjon)', label: 'Militær rytme: t-lyden mimer marsjtakt og skaper følelse av ustoppelig framrykking' },
                { example: '"Milde, myke minner av mors morgensang" (m-alliterasjon)', label: 'Nostalgisk varme: m-lyden er den varmeste konsonanten og skaper trygghet og nærhet' },
                { example: '"Vinden vred seg vilt. Vannet veltet over vollene." (v-alliterasjon)', label: 'Naturkraft: v-lyden mimer vindens bevegelse og gir teksten en virvlende energi' },
            ],
        },
    },
];
