import type { Exercise } from '../types';

export const temaExercises: Exercise[] = [
    // === NIVÅ 1 ===
    {
        id: 'tema-1-1',
        deviceId: 'tema',
        level: 1,
        instruction: 'Hva er temaet i denne teksten?',
        data: {
            type: 'identify',
            text: 'Jenta flyttet til en ny by. Hun kjente ingen. Ingen sa hei i gangen.',
            options: [
                { deviceId: 'tema', label: 'Ensomhet', correct: true, feedback: 'Riktig! Temaet er ensomhet og utenforskap. Handlingen viser en jente som er alene og ikke blir sett.' },
                { deviceId: 'tema', label: 'Reising', correct: false, feedback: 'Flytting er handlingen, ikke temaet. Spør deg: Hva føler hun? Ensomhet.' },
                { deviceId: 'tema', label: 'Skole', correct: false, feedback: 'Skolen kan være settingen, men temaet handler om følelsen av å være utenfor.' },
                { deviceId: 'tema', label: 'Vennskap', correct: false, feedback: 'Nesten! Men teksten handler om mangelen på vennskap - altså ensomhet.' },
            ],
        },
    },
    {
        id: 'tema-1-2',
        deviceId: 'tema',
        level: 1,
        instruction: 'Hva er temaet?',
        data: {
            type: 'identify',
            text: 'Gutten nektet å dele lekene sine, og til slutt ville ingen leke med ham.',
            options: [
                { deviceId: 'tema', label: 'Egoisme og konsekvenser', correct: true, feedback: 'Riktig! Temaet er at egoisme får konsekvenser. Den som ikke deler, ender opp alene.' },
                { deviceId: 'tema', label: 'Leker', correct: false, feedback: 'Leker er gjenstander i handlingen. Temaet er dypere - det handler om egoisme.' },
                { deviceId: 'tema', label: 'Mobbing', correct: false, feedback: 'Nei, ingen mobber ham - de velger bare å ikke leke med ham fordi han ikke deler.' },
                { deviceId: 'tema', label: 'Skole', correct: false, feedback: 'Skolen er settingen. Temaet handler om hva som skjer når man er egoistisk.' },
            ],
        },
    },
    {
        id: 'tema-1-3',
        deviceId: 'tema',
        level: 1,
        instruction: 'Hva er temaet i denne teksten?',
        data: {
            type: 'identify',
            text: 'De to venninnene kranglet om den samme gutten. Til slutt mistet de hverandre.',
            options: [
                { deviceId: 'tema', label: 'Sjalusi og vennskap', correct: true, feedback: 'Riktig! Temaet er sjalusi som ødelegger vennskap. Forholdet til gutten kostet dem vennskapet.' },
                { deviceId: 'tema', label: 'Kjærlighet', correct: false, feedback: 'Kjærlighet er en del av handlingen, men temaet handler om at sjalusi ødelegger vennskap.' },
                { deviceId: 'tema', label: 'Krangling', correct: false, feedback: 'Krangling er handlingen, ikke temaet. Temaet er det dypere - sjalusi.' },
                { deviceId: 'tema', label: 'Gutter', correct: false, feedback: 'Gutten er bare utløseren. Temaet handler om vennskapet som gikk tapt.' },
            ],
        },
    },
    {
        id: 'tema-1-4',
        deviceId: 'tema',
        level: 1,
        instruction: 'Hva er temaet?',
        data: {
            type: 'identify',
            text: 'Han øvde og øvde til fingrene verket. Til slutt mestret han sangen.',
            options: [
                { deviceId: 'tema', label: 'Utholdenhet', correct: true, feedback: 'Riktig! Temaet er at utholdenhet og innsats lønner seg.' },
                { deviceId: 'tema', label: 'Musikk', correct: false, feedback: 'Musikk er settingen. Temaet handler om å ikke gi opp.' },
                { deviceId: 'tema', label: 'Smerte', correct: false, feedback: 'Smerten (verkende fingre) er en detalj. Temaet er utholdenhet som gir resultat.' },
                { deviceId: 'tema', label: 'Talent', correct: false, feedback: 'Teksten handler om øving, ikke talent. Temaet er at hardt arbeid fungerer.' },
            ],
        },
    },

    // === NIVÅ 2 ===
    {
        id: 'tema-2-1',
        deviceId: 'tema',
        level: 2,
        instruction: 'Hva er det dypere temaet?',
        data: {
            type: 'explain',
            text: 'Alle sa at hun var rar fordi hun kledde seg annerledes. En dag sluttet hun å kle seg slik. Men hun følte seg enda mer feil.',
            highlightedWords: 'hun følte seg enda mer feil',
            question: 'Hva er temaet i denne teksten?',
            options: [
                { text: 'Identitet og presset til å passe inn - man mister seg selv ved å tilpasse seg andre', correct: true, feedback: 'Riktig! Temaet er identitet. Hun prøver å passe inn, men føler seg enda verre fordi hun har gitt opp den hun egentlig er.' },
                { text: 'At klær er viktige', correct: false, feedback: 'Klær er det synlige, men temaet handler om noe dypere - hvem man er vs. hvem andre vil at man skal være.' },
                { text: 'At hun ble mobbet', correct: false, feedback: 'Mobbing kan være konteksten, men temaet handler om identitet og tilpasning.' },
            ],
        },
    },
    {
        id: 'tema-2-2',
        deviceId: 'tema',
        level: 2,
        instruction: 'Hva er temaet?',
        data: {
            type: 'identify',
            text: 'Faren jobbet dobbeltskift hver dag. Han sa det var for familien. Men familien savnet ham.',
            options: [
                { deviceId: 'tema', label: 'Prioriteringer', correct: true, feedback: 'Riktig! Temaet er prioriteringer og balanse mellom arbeid og familie. Intensjonen er god, men resultatet er det motsatte.' },
                { deviceId: 'tema', label: 'Penger', correct: false, feedback: 'Penger kan være motivasjonen for arbeidet, men temaet handler om hva man velger å prioritere.' },
                { deviceId: 'tema', label: 'Slit', correct: false, feedback: 'Hardt arbeid er handlingen. Temaet handler om konsekvensen - at familien mister ham.' },
                { deviceId: 'tema', label: 'Kjærlighet', correct: false, feedback: 'Kjærlighet er motivasjonen, men temaet er konflikten mellom arbeid og familietid.' },
            ],
        },
    },
    {
        id: 'tema-2-3',
        deviceId: 'tema',
        level: 2,
        instruction: 'Hva er temaet?',
        data: {
            type: 'identify',
            text: 'Han fant en lommebok full av penger. Ingen så ham. Han sto ved valget mellom riktig og galt.',
            options: [
                { deviceId: 'tema', label: 'Moral og ærlighet', correct: true, feedback: 'Riktig! Temaet er moral - hva gjør man når ingen ser? Det handler om indre ærlighet.' },
                { deviceId: 'tema', label: 'Penger', correct: false, feedback: 'Pengene er objektet, men temaet handler om valget mellom rett og galt.' },
                { deviceId: 'tema', label: 'Kriminalitet', correct: false, feedback: 'Det er et mulig utfall, men temaet handler om det moralske valget i seg selv.' },
                { deviceId: 'tema', label: 'Flaks', correct: false, feedback: 'Det kan være flaks å finne penger, men temaet handler om hva man gjør med dem.' },
            ],
        },
    },

    // === NIVÅ 3 ===
    {
        id: 'tema-3-1',
        deviceId: 'tema',
        level: 3,
        instruction: 'Hva er det dypere temaet? Tenk nøye!',
        data: {
            type: 'explain',
            text: 'Hun vant konkurransen og sto øverst på pallen. Alle klappet. Men i det hun så ned, tenkte hun på alle treningsøktene alene. Var det verdt det?',
            highlightedWords: 'Var det verdt det',
            question: 'Hva er det dypere temaet?',
            options: [
                { text: 'Kostnaden av suksess - seieren er bittersøt fordi den krevde ensomhet og ofre som kanskje ikke var verdt det', correct: true, feedback: 'Riktig! Temaet er at suksess har en pris. Seieren føler tom fordi den kostet så mye. Spørsmålet "Var det verdt det?" viser tvilen.' },
                { text: 'At hun er flink til sport', correct: false, feedback: 'Det er handlingen. Temaet handler om følelsen etter seieren - tomheten bak suksessen.' },
                { text: 'At hun er utakknemlig', correct: false, feedback: 'Nei, hun reflekterer over kostnaden. Det er selvinnsikt, ikke utakknemlighet.' },
            ],
        },
    },
    {
        id: 'tema-3-2',
        deviceId: 'tema',
        level: 3,
        instruction: 'Koble hver tekst med riktig tema.',
        data: {
            type: 'match',
            pairs: [
                { example: 'Han satt alene i kantina hver dag og lot som om han leste.', label: 'Ensomhet' },
                { example: 'Lederen bestemte alt. Ingen turte å si imot.', label: 'Makt' },
                { example: 'Hun farget håret, byttet stil, men følte seg aldri som seg selv.', label: 'Identitet' },
                { example: 'Han kunne ikke tåle at bestevennen fikk bedre karakter.', label: 'Sjalusi' },
            ],
        },
    },
    {
        id: 'tema-3-3',
        deviceId: 'tema',
        level: 3,
        instruction: 'Hva kan temaet være? Tenk dypere enn handlingen!',
        data: {
            type: 'explain',
            text: 'To naboer delte et gjerde. Den ene malte sin side hvit, den andre malte sin rød. De snakket aldri sammen om fargen.',
            highlightedWords: 'De snakket aldri sammen om fargen',
            question: 'Hva er det mulige temaet?',
            options: [
                { text: 'Mangel på kommunikasjon og grenser mellom mennesker - folk lever side om side uten å snakke sammen', correct: true, feedback: 'Riktig! Gjerdet symboliserer grensen mellom dem. At de aldri snakker om fargen viser at de lever i sine egne verdener uten dialog.' },
                { text: 'At de har forskjellig smak i farger', correct: false, feedback: 'Det er den bokstavelige tolkningen. Temaet handler om noe dypere - isolasjon og manglende kommunikasjon.' },
                { text: 'At gjerdet trenger vedlikehold', correct: false, feedback: 'Nei, gjerdet er et bilde på noe større - forholdet mellom mennesker som bor nær hverandre men ikke kjenner hverandre.' },
            ],
        },
    },

    // === NIVÅ 4 ===
    {
        id: 'tema-4-1',
        deviceId: 'tema',
        level: 4,
        instruction: 'Skriv hva du tror temaet er.',
        data: {
            type: 'write',
            prompt: 'Les teksten: "Han hadde alt - penger, bil, stort hus. Men om kvelden satt han alltid alene ved vinduet og så på familiene i nabolaget." Hva er temaet? Svar med ett eller to ord.',
            hint: 'Temaet er ikke "rikdom". Hva mangler han egentlig?',
            exampleAnswer: 'Ensomhet (eller: tomhet, mangel på tilhørighet)',
        },
    },
    {
        id: 'tema-4-2',
        deviceId: 'tema',
        level: 4,
        instruction: 'Fyll inn temaet som passer.',
        data: {
            type: 'fill-blank',
            textBefore: 'Teksten handler om en gutt som alltid gjør det de andre vil, til han en dag ikke vet hva han selv liker. Temaet er',
            textAfter: '.',
            correctAnswers: ['identitet', 'selvbilde', 'tilpasning'],
            explanation: 'Temaet er identitet. Gutten har mistet seg selv ved å alltid tilpasse seg andre. Han vet ikke lenger hvem han er.',
        },
    },
    {
        id: 'tema-4-3',
        deviceId: 'tema',
        level: 4,
        instruction: 'Skriv hva du tror temaet er, og forklar kort.',
        data: {
            type: 'write',
            prompt: 'Les teksten: "Bestemor fortalte de samme historiene hver kveld. De hadde hørt dem hundre ganger. Men da stolen hennes ble tom, savnet de hver eneste historie." Hva er temaet?',
            hint: 'Tenk på hva de tok for gitt og hva de mistet.',
            exampleAnswer: 'Tap og å sette pris på det man har. Vi forstår verdien av noe først når det er borte.',
        },
    },

    // === NIVÅ 5 ===
    {
        id: 'tema-5-1',
        deviceId: 'tema',
        level: 5,
        instruction: 'Finn den feil tolkningen av temaet.',
        data: {
            type: 'find-error',
            text: 'Han sto foran hele klassen og sang. Stemmen skalv, men han fortsatte. Da han var ferdig, var det stille. Så begynte noen å klappe.',
            errorDescription: 'Hvilken tolkning av temaet er feil?',
            options: [
                { text: 'Temaet er musikk, fordi han synger for klassen', correct: true, feedback: 'Riktig feil! Musikk er settingen, ikke temaet. Temaet handler om mot - å gjøre noe skremmende og oppleve at det går bra.' },
                { text: 'Temaet er mot - å tørre å vise seg sårbar', correct: false, feedback: 'Dette er en god tolkning. Han risikerer å bli dømt, men gjør det likevel.' },
                { text: 'Temaet er å overvinne frykt', correct: false, feedback: 'Dette er en riktig tolkning. Stemmen skalv, men han ga ikke opp.' },
            ],
        },
    },
    {
        id: 'tema-5-2',
        deviceId: 'tema',
        level: 5,
        instruction: 'Er denne påstanden riktig eller feil?',
        data: {
            type: 'true-false',
            statement: 'Temaet i en tekst er alltid det samme som handlingen. Hvis teksten handler om en krig, er temaet "krig".',
            correct: false,
            explanation: 'Feil! Temaet er den dypere ideen bak handlingen. En tekst om krig kan ha temaer som tap, lojalitet, makt, frykt eller meningsløshet. Handlingen er hva som skjer, temaet er hva teksten egentlig handler om på et dypere plan.',
        },
    },
    {
        id: 'tema-5-3',
        deviceId: 'tema',
        level: 5,
        instruction: 'Er denne påstanden riktig eller feil?',
        data: {
            type: 'true-false',
            statement: 'En tekst kan ha flere temaer samtidig. For eksempel kan en historie handle om både kjærlighet og svik på samme tid.',
            correct: true,
            explanation: 'Riktig! De fleste gode tekster har flere temaer som veves sammen. En kjærlighetshistorie kan samtidig utforske sjalusi, tillit, identitet og offer. Hovedtemaet er gjerne det mest fremtredende, men bitemaene gjør teksten rikere.',
        },
    },

    // === NIVÅ 6 ===
    {
        id: 'tema-6-1',
        deviceId: 'tema',
        level: 6,
        instruction: 'Marker ordene som avslører temaet i denne lengre teksten.',
        data: {
            type: 'highlight',
            text: 'Alle beundret lederen. Han bestemte hvem som fikk snakke og hvem som måtte tie. Ingen stilte spørsmål. De som prøvde, forsvant fra gruppen. Sakte ble det bare hans stemme som hørtes.',
            correctRanges: [
                { words: 'bestemte hvem som fikk snakke og hvem som måtte tie', explanation: 'Kontrollen over hvem som får ytre seg viser temaet makt og undertrykkelse.' },
                { words: 'De som prøvde, forsvant fra gruppen', explanation: 'At motstand straffes med utstøting forsterker temaet maktmisbruk.' },
                { words: 'bare hans stemme som hørtes', explanation: 'At bare lederens stemme gjenstår, oppsummerer temaet: makt som kveler alle andre.' },
            ],
        },
    },
    {
        id: 'tema-6-2',
        deviceId: 'tema',
        level: 6,
        instruction: 'Hva er det dypere temaet? Tenk forbi overflaten.',
        data: {
            type: 'explain',
            text: 'Roboten gjorde alt for familien. Den lagde mat, ryddet og hjalp med lekser. En dag sa datteren: "Jeg savner da mamma lagde pannekaker. De var litt brent, men de smakte av kjærlighet."',
            highlightedWords: 'de smakte av kjærlighet',
            question: 'Hva er temaet i denne teksten?',
            options: [
                { text: 'Teknologi kan erstatte oppgaver, men ikke følelser og menneskelig kontakt. Ufullkommenhet kan være verdifullt fordi det er ekte.', correct: true, feedback: 'Riktig! Temaet er at menneskelig kontakt og autentisitet er uerstattelig. De brente pannekakene representerer noe ufullkomment men ekte - i motsetning til robotens perfeksjon.' },
                { text: 'At roboter ikke kan lage mat', correct: false, feedback: 'Roboten kan lage mat. Poenget er at datterens savner noe dypere enn selve maten.' },
                { text: 'At teknologi er farlig', correct: false, feedback: 'Teksten sier ikke at teknologi er farlig, men at den mangler noe vesentlig - den menneskelige dimensjonen.' },
            ],
        },
    },
    {
        id: 'tema-6-3',
        deviceId: 'tema',
        level: 6,
        instruction: 'Forklar hvordan temaet utvikler seg gjennom teksten.',
        data: {
            type: 'explain',
            text: 'Som barn var han redd for mørket. Som tenåring var han redd for å skille seg ut. Som voksen var han redd for å mislykkes. Som gammel var han redd for at han aldri hadde levd.',
            highlightedWords: 'redd for at han aldri hadde levd',
            question: 'Hvordan utvikler temaet seg?',
            options: [
                { text: 'Temaet er frykt, men den endrer seg: fra konkret barneangst til eksistensiell frykt. Mønsteret viser at frykt styrer hele livet hans, og den verste frykten er å innse at man lot frykten vinne.', correct: true, feedback: 'Riktig! Frykten utvikler seg fra det konkrete (mørket) til det abstrakte (å ikke ha levd). Teksten viser at frykt kan bli en livslang fengsel hvis man ikke konfronterer den.' },
                { text: 'At alle er redde', correct: false, feedback: 'Teksten handler om en spesifikk persons utvikling, og poenget er dypere enn at "alle er redde".' },
                { text: 'At man bør være modig', correct: false, feedback: 'Det nærmer seg budskapet, men temaet er frykt og dens utvikling gjennom et helt liv.' },
            ],
        },
    },

    // === NIVÅ 7 ===
    {
        id: 'tema-7-1',
        deviceId: 'tema',
        level: 7,
        instruction: 'Koble hver tekst med det riktige temaet.',
        data: {
            type: 'match',
            pairs: [
                { example: 'Soldaten fulgte ordre selv om han visste det var galt. Etterpå sa han: "Jeg hadde ikke noe valg."', label: 'Ansvar og lydighet' },
                { example: 'Hun vant gullmedaljen, men da hun kom hjem var rommet tomt. Alle vennene hadde gitt opp å vente.', label: 'Kostnaden av ambisjon' },
                { example: 'De to brødrene valgte hver sin side i konflikten. Ved middagsbordet snakket de om været.', label: 'Splittelse og uuttalt konflikt' },
                { example: 'Byen bygde en statue av helten. Ingen husket lenger hva han hadde gjort.', label: 'Glemsel og tom heltedyrking' },
            ],
        },
    },
    {
        id: 'tema-7-2',
        deviceId: 'tema',
        level: 7,
        instruction: 'Sorter tekstene etter hovedtema.',
        data: {
            type: 'sort',
            categories: [
                { id: 'identitet', label: 'Identitet' },
                { id: 'makt', label: 'Makt' },
                { id: 'tap', label: 'Tap og sorg' },
            ],
            items: [
                { text: 'Hun byttet vennekrets, musikk og klesstil hvert halvår. Hvem var hun egentlig?', categoryId: 'identitet' },
                { text: 'Kongen bestemte alt, til og med hva folk fikk tenke.', categoryId: 'makt' },
                { text: 'Huset sto tomt. Luktene var de samme, men stemmene var borte.', categoryId: 'tap' },
                { text: 'Han visste ikke om han var norsk, pakistansk eller begge deler.', categoryId: 'identitet' },
                { text: 'Den som kontrollerte vannet, kontrollerte hele landsbyen.', categoryId: 'makt' },
                { text: 'Hver vår blomstret treet de hadde plantet sammen. Nå sto han der alene.', categoryId: 'tap' },
            ],
        },
    },
    {
        id: 'tema-7-3',
        deviceId: 'tema',
        level: 7,
        instruction: 'Er denne påstanden riktig eller feil?',
        data: {
            type: 'true-false',
            statement: 'Tema og budskap er det samme. Hvis temaet er "ensomhet", er budskapet også "ensomhet".',
            correct: false,
            explanation: 'Feil! Tema og budskap er ulike ting. Temaet er ideen teksten utforsker (f.eks. ensomhet). Budskapet er hva forfatteren vil si om temaet (f.eks. "ensomhet kan gjøre oss sterkere" eller "ensomhet ødelegger mennesker"). Temaet er ett ord, budskapet er en hel setning.',
        },
    },

    // === NIVÅ 8 ===
    {
        id: 'tema-8-1',
        deviceId: 'tema',
        level: 8,
        instruction: 'Sorter tekstene etter om de utforsker temaet eksplisitt eller implisitt.',
        data: {
            type: 'sort',
            categories: [
                { id: 'eksplisitt', label: 'Eksplisitt tema (temaet sies rett ut)' },
                { id: 'implisitt', label: 'Implisitt tema (temaet antydes)' },
            ],
            items: [
                { text: '"Denne historien handler om hva sjalusi gjør med et menneske."', categoryId: 'eksplisitt' },
                { text: 'Han sjekket telefonen hennes hver kveld. Hun visste, men sa ingenting.', categoryId: 'implisitt' },
                { text: '"Frihet," tenkte hun mens hun så på den åpne døren. "Hva er egentlig frihet?"', categoryId: 'eksplisitt' },
                { text: 'Fuglen satt i buret med åpen dør, men fløy aldri ut.', categoryId: 'implisitt' },
                { text: 'Dagboken var full av ord som "ensom", "usynlig" og "ingen ser meg".', categoryId: 'eksplisitt' },
                { text: 'Hun smilte til alle, men låste døren bak seg og slapp masken.', categoryId: 'implisitt' },
            ],
        },
    },
    {
        id: 'tema-8-2',
        deviceId: 'tema',
        level: 8,
        instruction: 'Koble hvert symbol med temaet det typisk representerer.',
        data: {
            type: 'match',
            pairs: [
                { example: 'Et lite lys i mørket som nesten blåses ut', label: 'Håp (skjørt og truet)' },
                { example: 'En fugl i bur som synger', label: 'Frihet (lengsel etter det man ikke har)' },
                { example: 'Et knust speil', label: 'Identitet (et ødelagt selvbilde)' },
                { example: 'En elv som deler en by i to', label: 'Splittelse (usynlige grenser mellom mennesker)' },
            ],
        },
    },
    {
        id: 'tema-8-3',
        deviceId: 'tema',
        level: 8,
        instruction: 'Sorter disse parene etter om tema og handling passer sammen.',
        data: {
            type: 'sort',
            categories: [
                { id: 'riktig', label: 'Riktig kobling mellom handling og tema' },
                { id: 'feil', label: 'Feil kobling (handlingen støtter ikke temaet)' },
            ],
            items: [
                { text: 'Handling: En gutt nekter å følge regler. Tema: Opprør.', categoryId: 'riktig' },
                { text: 'Handling: En jente spiser frokost. Tema: Revolusjon.', categoryId: 'feil' },
                { text: 'Handling: To venner blir fiender etter et svik. Tema: Tillit.', categoryId: 'riktig' },
                { text: 'Handling: En mann kjøper nye sko. Tema: Døden.', categoryId: 'feil' },
                { text: 'Handling: En mor slipper taket på barnevognen. Tema: Å slippe kontrollen.', categoryId: 'riktig' },
                { text: 'Handling: En hund bjeffer. Tema: Klimaendringer.', categoryId: 'feil' },
            ],
        },
    },

    // === NIVÅ 9 ===
    {
        id: 'tema-9-1',
        deviceId: 'tema',
        level: 9,
        instruction: 'Analyser temaets mange lag i denne teksten.',
        data: {
            type: 'explain',
            text: 'Fiskeren kastet garnet ut hver morgen i tjue år. Havet ga ham fisk, men tok sønnen hans. Likevel kastet han garnet ut igjen neste morgen.',
            highlightedWords: 'Likevel kastet han garnet ut igjen',
            question: 'Denne teksten har flere temaer som virker sammen. Hva er de?',
            options: [
                { text: 'Hovedtemaene er tap, utholdenhet og menneskets forhold til naturen. Havet er både livgiver og dødsbringer. At han fortsetter viser at mennesket velger å leve videre tross tapet - rutinen er både hans redning og hans fengsel.', correct: true, feedback: 'Riktig! Teksten vever sammen tap, utholdenhet og naturens doble ansikt. Garnet er et symbol: det gir ham levebrød, men havet tok det viktigste. At han fortsetter er både styrke og smerte.' },
                { text: 'At fiske er farlig', correct: false, feedback: 'Det er en bokstavelig observasjon. Teksten bruker fiskerlivet som ramme for dypere temaer om tap og utholdenhet.' },
                { text: 'At han bør slutte å fiske', correct: false, feedback: 'Det er et forslag, ikke en analyse. Temaet handler om hvorfor han fortsetter tross alt.' },
            ],
        },
    },
    {
        id: 'tema-9-2',
        deviceId: 'tema',
        level: 9,
        instruction: 'Skriv en kort tekst (3-4 setninger) med et skjult tema.',
        data: {
            type: 'write',
            prompt: 'Skriv en tekst der temaet aldri nevnes direkte, men der leseren forstår det gjennom handlingen og detaljene. Skriv temaet i parentes på slutten.',
            hint: 'Vis temaet gjennom hva karakterene gjør og føler, ikke ved å si det rett ut. For eksempel: vis ensomhet uten å skrive ordet "ensom".',
            exampleAnswer: 'Hun satte alltid to kopper på bordet. Den andre ble aldri rørt. Noen ganger snakket hun til den tomme stolen som om noen satt der. (Tema: sorg og tap)',
        },
    },
    {
        id: 'tema-9-3',
        deviceId: 'tema',
        level: 9,
        instruction: 'Finn den feil analysen av temaet.',
        data: {
            type: 'find-error',
            text: 'Han bygde en mur rundt hagen for å holde dyrene ute. Muren ble høyere og høyere. Til slutt kom ikke sollyset inn, og blomstene døde.',
            errorDescription: 'Hvilken analyse av temaet er feil?',
            options: [
                { text: 'Temaet er hagearbeid, fordi teksten handler om en hage med blomster', correct: true, feedback: 'Riktig feil! Hagen er settingen, ikke temaet. Temaet handler om overbeskyttelse - at forsøket på å beskytte noe kan ende opp med å ødelegge det.' },
                { text: 'Temaet er at overbeskyttelse kan ødelegge det man prøver å beskytte', correct: false, feedback: 'Dette er en korrekt analyse. Muren som dreper blomstene er et bilde på skadelig overbeskyttelse.' },
                { text: 'Temaet er frykt og kontroll - frykten for trusler fører til isolasjon', correct: false, feedback: 'Dette er en god analyse. Frykten for dyrene driver ham til å bygge en mur som til slutt gjør mer skade enn dyrene ville gjort.' },
            ],
        },
    },

    // === NIVÅ 10 ===
    {
        id: 'tema-10-1',
        deviceId: 'tema',
        level: 10,
        instruction: 'Analyser det komplekse temaet og dets utvikling.',
        data: {
            type: 'explain',
            text: 'Da hun var liten, ville hun bli stor. Da hun var ung, ville hun bli fri. Da hun var fri, ville hun bli trygg. Da hun var trygg, ville hun bli liten igjen.',
            highlightedWords: 'ville hun bli liten igjen',
            question: 'Teksten danner en sirkel. Hva sier dette om temaet?',
            options: [
                { text: 'Temaet er menneskets evige misnøye og nostalgi. Teksten viser at vi alltid lengter etter noe annet enn det vi har. Sirkelen antyder at tilfredshet er umulig - eller at vi idealiserer det vi har forlatt. Det dypeste temaet er kanskje at trygghet og frihet er uforenlige lengter.', correct: true, feedback: 'Riktig! Sirkelstrukturen er nøkkelen. Hvert livsstadium bringer en ny lengsel, og den siste lengselen bringer oss tilbake til start. Temaet utforsker paradokset i menneskelig lengsel - vi vil alltid ha det vi ikke har.' },
                { text: 'At hun angrer på valgene sine', correct: false, feedback: 'Anger er for enkelt. Teksten handler om noe universelt - at mennesker alltid lengter etter noe annet.' },
                { text: 'At livet går fort', correct: false, feedback: 'Livets hastighet er en bieffekt, men temaet handler om lengselen som aldri blir tilfredsstilt.' },
            ],
        },
    },
    {
        id: 'tema-10-2',
        deviceId: 'tema',
        level: 10,
        instruction: 'Skriv to korte tekster med samme handling men ulikt tema.',
        data: {
            type: 'write',
            prompt: 'Skriv to versjoner av en tekst der en person går gjennom en skog. I den ene versjonen er temaet frihet, i den andre er temaet fare. Bruk detaljene og ordvalgene til å styre temaet.',
            hint: 'Samme setting kan ha helt ulikt tema. Frihetsskogen: lys, åpen, fuglesang. Fareskogen: mørk, tett, uvanlige lyder.',
            exampleAnswer: 'Frihet: Hun gikk mellom trærne uten retning. Solen falt gjennom løvet, og stien forsvant bak henne. For første gang var hun helt fri. / Fare: Hun gikk mellom trærne uten retning. Grenene slo mot henne, og stien forsvant bak henne. For første gang var hun helt alene.',
        },
    },
    {
        id: 'tema-10-3',
        deviceId: 'tema',
        level: 10,
        instruction: 'Koble hver tekst med den mest presise temaanalysen.',
        data: {
            type: 'match',
            pairs: [
                { example: 'Hun arvet morens ring, morens smil og morens frykt for å være alene. Noen arv kan man ikke selge.', label: 'Arv og determinisme - vi arver mer enn gjenstander, også mønstre vi ikke ønsker' },
                { example: 'Alle i landsbyen visste hva som skjedde bak den røde døren. Ingen sa noe. Å snakke hadde gjort dem medskyldige.', label: 'Kollektiv taushet - å vite og tie gjør fellesskapet delaktig' },
                { example: 'Han samlet på ting han aldri brukte. Hvert objekt var et minne han ikke klarte å slippe. Huset ble fullt. Livet ble tomt.', label: 'Materiell erstatning for følelsesmessig tomhet - ting fyller rommet men ikke mennesket' },
                { example: 'Tvillingene var identiske utenpå. Den ene ble lege. Den andre ble tyv. Begge sa: "Jeg hadde ikke noe valg."', label: 'Fri vilje vs. skjebne - identisk utgangspunkt, ulikt utfall, samme unnskyldning' },
            ],
        },
    },
];
