import type { Exercise } from '../types';

export const budskapExercises: Exercise[] = [
    // === NIVÅ 1 ===
    {
        id: 'buds-1-1',
        deviceId: 'budskap',
        level: 1,
        instruction: 'Hva er budskapet i denne teksten?',
        data: {
            type: 'identify',
            text: 'Reven lurte alle dyrene gang etter gang. Til slutt stolte ingen på ham.',
            options: [
                { deviceId: 'budskap', label: 'Logn ødelegger tillit', correct: true, feedback: 'Riktig! Budskapet er at hvis du lyver for ofte, mister du andres tillit.' },
                { deviceId: 'budskap', label: 'Rever er smarte', correct: false, feedback: 'Det er handlingen, ikke budskapet. Spørsmålet er: Hva vil forfatteren at vi skal lære?' },
                { deviceId: 'budskap', label: 'Dyr kan snakke', correct: false, feedback: 'Nei, dette er en fabel. Budskapet handler om menneskelig oppførsel.' },
                { deviceId: 'budskap', label: 'Man bør være forsiktig', correct: false, feedback: 'Nesten, men budskapet er mer spesifikt: løgn ødelegger tillit.' },
            ],
        },
    },
    {
        id: 'buds-1-2',
        deviceId: 'budskap',
        level: 1,
        instruction: 'Hva er budskapet?',
        data: {
            type: 'identify',
            text: 'Det minste froet vokste til det største treet i skogen.',
            options: [
                { deviceId: 'budskap', label: 'Man trenger ikke være stor for å oppnå store ting', correct: true, feedback: 'Riktig! Budskapet er at størrelse ikke avgjør potensialet. Små begynnelser kan gi store resultater.' },
                { deviceId: 'budskap', label: 'Trær vokser sakte', correct: false, feedback: 'Det er en biologisk observasjon, ikke et budskap. Tenk dypere - hva sier dette om livet?' },
                { deviceId: 'budskap', label: 'Naturen er fin', correct: false, feedback: 'Det er for generelt. Budskapet handler spesifikt om størrelse og potensial.' },
                { deviceId: 'budskap', label: 'Man bør plante trær', correct: false, feedback: 'Det er for bokstavelig. Budskapet er billedlig - det handler om potensial.' },
            ],
        },
    },
    {
        id: 'buds-1-3',
        deviceId: 'budskap',
        level: 1,
        instruction: 'Hva er budskapet?',
        data: {
            type: 'identify',
            text: 'Jenta delte matpakken sin med den nye eleven. Neste dag hadde hun en ny venn.',
            options: [
                { deviceId: 'budskap', label: 'Vennlighet åpner dorer til nye vennskap', correct: true, feedback: 'Riktig! Budskapet er at små handlinger av vennlighet kan skape store forbindelser.' },
                { deviceId: 'budskap', label: 'Man bør ha med nok mat', correct: false, feedback: 'Det er for bokstavelig. Budskapet handler om vennlighet, ikke matpakker.' },
                { deviceId: 'budskap', label: 'Nye elever er ensomme', correct: false, feedback: 'Det kan stemme, men budskapet handler om hva vennlighet kan oppnå.' },
                { deviceId: 'budskap', label: 'Venner er viktig', correct: false, feedback: 'For generelt. Budskapet er mer spesifikt: vennlighet skaper vennskap.' },
            ],
        },
    },
    {
        id: 'buds-1-4',
        deviceId: 'budskap',
        level: 1,
        instruction: 'Hva er budskapet?',
        data: {
            type: 'identify',
            text: 'Han sa aldri unnskyld. En etter en forsvant vennene hans.',
            options: [
                { deviceId: 'budskap', label: 'Å innrømme feil er viktig for å beholde relasjoner', correct: true, feedback: 'Riktig! Budskapet er at stolthet og manglende vilje til å si unnskyld ødelegger vennskap.' },
                { deviceId: 'budskap', label: 'Han hadde dårlige venner', correct: false, feedback: 'Nei, vennene hadde god grunn til å gå. Budskapet handler om hans manglende evne til å be om tilgivelse.' },
                { deviceId: 'budskap', label: 'Venner kommer og går', correct: false, feedback: 'For passivt. Budskapet er at hans oppførsel (aldri si unnskyld) forårsaket tapet.' },
                { deviceId: 'budskap', label: 'Man bør ha mange venner', correct: false, feedback: 'Antallet er irrelevant. Budskapet handler om å ta vare på vennskap gjennom ydmykhet.' },
            ],
        },
    },

    // === NIVÅ 2 ===
    {
        id: 'buds-2-1',
        deviceId: 'budskap',
        level: 2,
        instruction: 'Hva er budskapet her?',
        data: {
            type: 'explain',
            text: 'Alle lo av ideen hennes. Men hun ga ikke opp. Ti år senere var det hun som lo - hele veien til banken.',
            highlightedWords: 'hun ga ikke opp',
            question: 'Hva er budskapet forfatteren vil formidle?',
            options: [
                { text: 'Tro på deg selv selv når andre tviler - utholdenhet og selvtillit lønner seg til slutt', correct: true, feedback: 'Riktig! Budskapet er at man ikke bør la andres tvil stoppe deg. Utholdenhet og tro på egne ideer kan føre til suksess.' },
                { text: 'At man bør le av andre', correct: false, feedback: 'Nei, budskapet er ikke om å le av andre, men om å ikke gi opp når andre ler av deg.' },
                { text: 'At penger er viktig', correct: false, feedback: '"Hele veien til banken" er et uttrykk for suksess, ikke et budskap om penger.' },
            ],
        },
    },
    {
        id: 'buds-2-2',
        deviceId: 'budskap',
        level: 2,
        instruction: 'Hva er budskapet? Skille det fra temaet!',
        data: {
            type: 'explain',
            text: 'En gammel mann plantet et tre han aldri ville se bli stort.',
            highlightedWords: 'aldri ville se bli stort',
            question: 'Tema er generositet. Hva er budskapet?',
            options: [
                { text: 'Det finnes verdi i å gjøre ting for andre, selv om man aldri får nyte fruktene selv', correct: true, feedback: 'Riktig! Budskapet er at uselviskhet og langsiktig tenkning er verdifullt. Mannen handler for fremtidige generasjoner.' },
                { text: 'At man bør plante trær', correct: false, feedback: 'For bokstavelig! Treet er et bilde. Budskapet handler om å gjøre gode ting uten å forvente noe tilbake.' },
                { text: 'At livet er kort', correct: false, feedback: 'Det er en observasjon, ikke budskapet. Budskapet handler om hva man velger å gjøre med den tiden man har.' },
            ],
        },
    },
    {
        id: 'buds-2-3',
        deviceId: 'budskap',
        level: 2,
        instruction: 'Hva er budskapet?',
        data: {
            type: 'explain',
            text: 'Etter at de hadde kranglet hele sommeren, innså de at de kranglet om akkurat det samme. De ville begge være alene.',
            highlightedWords: 'de kranglet om akkurat det samme',
            question: 'Hva vil forfatteren formidle?',
            options: [
                { text: 'Konflikter oppstår ofte fordi vi ikke kommuniserer - vi kan ville det samme uten å vite det', correct: true, feedback: 'Riktig! Budskapet er at mangel på kommunikasjon skaper unødvendige konflikter. Hadde de snakket sammen, hadde de sett at de var enige.' },
                { text: 'At krangling er dumt', correct: false, feedback: 'For enkelt. Budskapet er mer spesifikt: krangling oppstår av dårlig kommunikasjon.' },
                { text: 'At sommeren er lang', correct: false, feedback: 'Sommeren er tidsrammen, ikke budskapet.' },
            ],
        },
    },

    // === NIVÅ 3 ===
    {
        id: 'buds-3-1',
        deviceId: 'budskap',
        level: 3,
        instruction: 'Hva er det dypere budskapet? Tenk nøye!',
        data: {
            type: 'explain',
            text: 'Barnet tegnet en soloppgang med svart fargestift. "Hvorfor svart?" spurte læreren. "Fordi solen min ser annerledes ut," sa barnet.',
            highlightedWords: 'solen min ser annerledes ut',
            question: 'Hva er budskapet?',
            options: [
                { text: 'Alle ser verden forskjellig, og det er greit - vi bør ikke tvinge andres perspektiv til å passe vår mal', correct: true, feedback: 'Riktig! Budskapet er at kreativitet og individuelle perspektiver har verdi. Lærerens spørsmål antyder at hun forventet "riktig" farge, men barnets svar viser at det ikke finnes én riktig måte å se verden på.' },
                { text: 'At barnet trenger nye fargestifter', correct: false, feedback: 'For bokstavelig! Barnet valgte svart bevisst. Budskapet handler om å akseptere forskjeller.' },
                { text: 'At læreren er streng', correct: false, feedback: 'Læreren spurte bare. Budskapet handler om barnets svar - at alle har sitt eget perspektiv.' },
            ],
        },
    },
    {
        id: 'buds-3-2',
        deviceId: 'budskap',
        level: 3,
        instruction: 'Koble hver tekst med riktig budskap.',
        data: {
            type: 'match',
            pairs: [
                { example: 'Skilpadden gikk sakte, men kom først til mål.', label: 'Utholdenhet slår fart' },
                { example: 'Han hadde tusen følgere, men ingen å ringe til.', label: 'Online popularitet erstatter ikke ekte vennskap' },
                { example: 'Jenta lot alle bestemme for henne. En dag visste hun ikke lenger hva hun selv ville.', label: 'Man må ta egne valg for å kjenne seg selv' },
                { example: 'De bygde den høyeste muren, men glemte å lage en dør.', label: 'Overbeskyttelse isolerer' },
            ],
        },
    },
    {
        id: 'buds-3-3',
        deviceId: 'budskap',
        level: 3,
        instruction: 'Hva er budskapet? Tenk dypere enn overflaten!',
        data: {
            type: 'explain',
            text: 'De bygde den høyeste muren for å beskytte seg. Men inne bak muren glemte de hvordan resten av verden så ut.',
            highlightedWords: 'glemte de hvordan resten av verden så ut',
            question: 'Hva er budskapet?',
            options: [
                { text: 'Overbeskyttelse isolerer oss - trygghet kan bli et fengsel hvis vi stenger alt ute', correct: true, feedback: 'Riktig! Budskapet er at beskyttelse kan bli sin egen fiende. Når man stenger alt farlig ute, stenger man også alt godt ute. Trygghet uten åpenhet fører til isolasjon.' },
                { text: 'At murer er dyre å bygge', correct: false, feedback: 'For bokstavelig! Muren er et bilde. Budskapet handler om balansen mellom beskyttelse og åpenhet.' },
                { text: 'At de burde bygge vinduer i muren', correct: false, feedback: 'Det er en praktisk løsning, men budskapet handler om noe større - at isolasjon fra verden er skadelig.' },
            ],
        },
    },

    // === NIVÅ 4 ===
    {
        id: 'buds-4-1',
        deviceId: 'budskap',
        level: 4,
        instruction: 'Skriv budskapet i denne teksten.',
        data: {
            type: 'write',
            prompt: 'Les teksten: "Gutten kastet søppel i elven hver dag. En dag kunne han ikke bade der lenger. Vannet var ødelagt." Skriv budskapet som en hel setning.',
            hint: 'Hva vil forfatteren at vi skal lære? Tenk på konsekvenser.',
            exampleAnswer: 'Hvis vi ikke tar vare på naturen, ødelegger vi den for oss selv.',
        },
    },
    {
        id: 'buds-4-2',
        deviceId: 'budskap',
        level: 4,
        instruction: 'Fyll inn ordet som fullfører budskapet.',
        data: {
            type: 'fill-blank',
            textBefore: 'Fabelen om haren og skilpadden lærer oss at utholdenhet er viktigere enn',
            textAfter: '.',
            correctAnswers: ['fart', 'hastighet', 'talent', 'medfødt talent'],
            explanation: 'Budskapet er at utholdenhet slår fart. Haren var raskest, men skilpadden vant fordi den aldri ga opp. Jevn innsats trumfer naturlig talent.',
        },
    },
    {
        id: 'buds-4-3',
        deviceId: 'budskap',
        level: 4,
        instruction: 'Skriv budskapet som en hel setning.',
        data: {
            type: 'write',
            prompt: 'Les teksten: "Alle fortalte henne at hun ikke kunne. Læreren. Foreldrene. Vennene. Hun bestemte seg for å bevise dem feil." Hva er budskapet?',
            hint: 'Hva sier teksten om å la andre bestemme hva du kan klare?',
            exampleAnswer: 'Ikke la andres tvil stoppe deg - du kan klare mer enn andre tror.',
        },
    },

    // === NIVÅ 5 ===
    {
        id: 'buds-5-1',
        deviceId: 'budskap',
        level: 5,
        instruction: 'Finn den feil tolkningen av budskapet.',
        data: {
            type: 'find-error',
            text: 'Den rike mannen ga bort hele formuen. Folk kalte ham gal. Men han smilte bredere enn noen gang.',
            errorDescription: 'Hvilken tolkning av budskapet er feil?',
            options: [
                { text: 'Budskapet er at rike folk er gale', correct: true, feedback: 'Riktig feil! Teksten sier at folk kalte ham gal, men smilet hans viser at han fant noe viktigere enn penger. Budskapet handler om at lykke ikke kommer fra rikdom.' },
                { text: 'Budskapet er at penger ikke gir lykke - å gi til andre kan gi mer glede enn å eie', correct: false, feedback: 'Dette er en god tolkning. Smilet hans viser at å gi bort alt ga ham mer enn å ha det.' },
                { text: 'Budskapet er at ekte rikdom handler om indre tilfredshet, ikke materielle ting', correct: false, feedback: 'Dette er en korrekt tolkning av budskapet.' },
            ],
        },
    },
    {
        id: 'buds-5-2',
        deviceId: 'budskap',
        level: 5,
        instruction: 'Er denne påstanden riktig eller feil?',
        data: {
            type: 'true-false',
            statement: 'Budskapet i en tekst er alltid tydelig uttalt. Forfatteren skriver alltid hva vi skal lære.',
            correct: false,
            explanation: 'Feil! Mange tekster har et implisitt (skjult) budskap. Forfatteren viser det gjennom handlingen og konsekvensene, men skriver det aldri rett ut. Leseren må selv tolke hva forfatteren vil formidle.',
        },
    },
    {
        id: 'buds-5-3',
        deviceId: 'budskap',
        level: 5,
        instruction: 'Er denne påstanden riktig eller feil?',
        data: {
            type: 'true-false',
            statement: 'Budskapet er hva forfatteren vil at vi skal tenke eller lære, mens temaet er det overordnede emnet teksten handler om. Temaet er ett ord, budskapet er en hel setning.',
            correct: true,
            explanation: 'Riktig! Tema = det overordnede emnet (f.eks. "vennskap"). Budskap = hva forfatteren sier om temaet (f.eks. "ekte vennskap krever at man tør å være ærlig"). Temaet er en kategori, budskapet er en påstand.',
        },
    },

    // === NIVÅ 6 ===
    {
        id: 'buds-6-1',
        deviceId: 'budskap',
        level: 6,
        instruction: 'Marker ordene som sterkest avslører budskapet.',
        data: {
            type: 'highlight',
            text: 'De bygde broer mellom byene, men glemte å bygge broer mellom menneskene. Veiene var perfekte. Samtalene var stumme.',
            correctRanges: [
                { words: 'glemte å bygge broer mellom menneskene', explanation: '"Broer mellom menneskene" er en metafor for menneskelig kontakt. At de "glemte" viser budskapet: vi prioriterer det fysiske over det mellommenneskelige.' },
                { words: 'Veiene var perfekte. Samtalene var stumme', explanation: 'Kontrasten mellom perfekte veier og stumme samtaler forsterker budskapet: teknisk framgang uten menneskelig kontakt er tomt.' },
            ],
        },
    },
    {
        id: 'buds-6-2',
        deviceId: 'budskap',
        level: 6,
        instruction: 'Hva er det dypere budskapet?',
        data: {
            type: 'explain',
            text: 'Hver morgen fôret hun fuglene i parken. En dag ble parken bygd om til parkeringsplass. Fuglene forsvant. Men det var først da benken hennes ble fjernet at hun gråt.',
            highlightedWords: 'da benken hennes ble fjernet at hun gråt',
            question: 'Budskapet handler om mer enn fugler. Hva vil forfatteren egentlig si?',
            options: [
                { text: 'Når samfunnet prioriterer effektivitet over fellesrom, mister vi stedene som gir mennesker mening og tilhørighet. Hennes sorg handler om å miste sin plass i verden.', correct: true, feedback: 'Riktig! Budskapet er at parker, benker og fellesrom er mer enn praktiske fasiliteter - de er steder der mennesker finner mening. Når de fjernes, mister folk en del av seg selv.' },
                { text: 'At vi trenger flere parker', correct: false, feedback: 'Det er en praktisk konsekvens, ikke det dypere budskapet. Teksten handler om hva fellesrom betyr for mennesker.' },
                { text: 'At fugler er viktige', correct: false, feedback: 'Fuglene er en del av bildet, men budskapet handler om noe større - menneskers behov for tilhørighet.' },
            ],
        },
    },
    {
        id: 'buds-6-3',
        deviceId: 'budskap',
        level: 6,
        instruction: 'Forklar budskapet i denne lengre teksten.',
        data: {
            type: 'explain',
            text: 'Læreren spurte: "Hva vil du bli?" Alle svarte lege, advokat, ingeniør. Jenta bakerst sa: "Lykkelig." Det ble stille. Ingen hadde tenkt på det svaret.',
            highlightedWords: 'Lykkelig',
            question: 'Hva er budskapet?',
            options: [
                { text: 'Vi lærer barn å strebe etter yrker og status, men glemmer å lære dem det viktigste: at lykke er et mål i seg selv. Jentas svar avslører at hele spørsmålet er stilt feil.', correct: true, feedback: 'Riktig! Budskapet er at samfunnet definerer suksess gjennom yrker og titler, mens det viktigste - å være lykkelig - overses. Stillheten viser at svaret treffer noe ingen hadde tenkt på.' },
                { text: 'At jenta er lat og ikke vil jobbe', correct: false, feedback: 'Nei! Svaret hennes er dypere enn de andres. Hun tenker på livskvalitet, ikke karriere.' },
                { text: 'At skolen burde lære om følelser', correct: false, feedback: 'Det er en mulig konsekvens, men budskapet handler om hvordan vi definerer suksess.' },
            ],
        },
    },

    // === NIVÅ 7 ===
    {
        id: 'buds-7-1',
        deviceId: 'budskap',
        level: 7,
        instruction: 'Koble hver tekst med riktig budskap.',
        data: {
            type: 'match',
            pairs: [
                { example: 'Sjefen fikk all æren. Teamet som gjorde jobben, ble aldri nevnt.', label: 'Ekte ledere løfter andre - å ta æren for andres arbeid er urettferdig' },
                { example: 'Hun rettet alle feilene i essayet. Det ble perfekt. Men det var ikke lenger hennes.', label: 'Perfeksjon kan ødelegge autentisitet - noen ganger er feil en del av stemmen' },
                { example: 'De hadde samme drøm. Han ga opp etter ett forsøk. Hun prøvde hundre ganger.', label: 'Forskjellen mellom å drømme og å oppnå er viljen til å prøve igjen' },
                { example: 'Naboen klaget over bråk, men sa aldri hei.', label: 'Det er lettere å kritisere enn å bygge kontakt' },
            ],
        },
    },
    {
        id: 'buds-7-2',
        deviceId: 'budskap',
        level: 7,
        instruction: 'Sorter budskapene: Hvilke er tydelige og hvilke er tvetydige?',
        data: {
            type: 'sort',
            categories: [
                { id: 'tydelig', label: 'Tydelig budskap (en klar lærdom)' },
                { id: 'tvetydig', label: 'Tvetydig budskap (åpent for tolkning)' },
            ],
            items: [
                { text: 'Den som lyver, mister andres tillit.', categoryId: 'tydelig' },
                { text: 'Han valgte trygghet over drømmen. Noen kaller det klokt. Andre kaller det feigt.', categoryId: 'tvetydig' },
                { text: 'Vennlighet koster ingenting, men er verdt alt.', categoryId: 'tydelig' },
                { text: 'Hun brøt loven for å redde barnet. Domstolen dømte henne. Folket frikjente henne.', categoryId: 'tvetydig' },
                { text: 'Hardt arbeid lønner seg alltid.', categoryId: 'tydelig' },
                { text: 'Var det modig å gå, eller modig å bli? Ingen kunne si det sikkert.', categoryId: 'tvetydig' },
            ],
        },
    },
    {
        id: 'buds-7-3',
        deviceId: 'budskap',
        level: 7,
        instruction: 'Er denne påstanden riktig eller feil?',
        data: {
            type: 'true-false',
            statement: 'Et budskap må alltid være positivt og oppmuntrende. Forfattere skriver aldri tekster med negative eller triste budskap.',
            correct: false,
            explanation: 'Feil! Budskap kan være tunge og utfordrende. En tekst kan formidle at "makt korrumperer", "krig er meningsløs" eller "ensomhet kan ødelegge et menneske". Gode tekster skjønnmaler ikke virkeligheten - de viser den, også når den er vanskelig.',
        },
    },

    // === NIVÅ 8 ===
    {
        id: 'buds-8-1',
        deviceId: 'budskap',
        level: 8,
        instruction: 'Sorter tekstene etter om budskapet er universelt eller kulturspesifikt.',
        data: {
            type: 'sort',
            categories: [
                { id: 'universelt', label: 'Universelt budskap (gjelder alle mennesker)' },
                { id: 'kulturspesifikt', label: 'Kulturspesifikt budskap (knyttet til en bestemt kontekst)' },
            ],
            items: [
                { text: 'Kjærlighet overvinner alle hindringer.', categoryId: 'universelt' },
                { text: 'Man bør alltid vise respekt for de eldre i familien.', categoryId: 'kulturspesifikt' },
                { text: 'Ærlighet lønner seg til slutt.', categoryId: 'universelt' },
                { text: 'Jante lov holder folk nede - vi bør tørre å skille oss ut.', categoryId: 'kulturspesifikt' },
                { text: 'Makt korrumperer den som har den.', categoryId: 'universelt' },
                { text: 'Dugnad viser det beste i det norske samfunnet.', categoryId: 'kulturspesifikt' },
            ],
        },
    },
    {
        id: 'buds-8-2',
        deviceId: 'budskap',
        level: 8,
        instruction: 'Koble samme tekst med ulikt budskap avhengig av tolkning.',
        data: {
            type: 'match',
            pairs: [
                { example: 'Optimistisk tolkning av "Han ga bort alt han eide"', label: 'Generøsitet gjør oss rikere enn penger noensinne kan' },
                { example: 'Kritisk tolkning av "Han ga bort alt han eide"', label: 'Å ofre alt for andre kan være selvdestruktivt' },
                { example: 'Optimistisk tolkning av "Hun forlot alt for å følge drømmen"', label: 'Man må tørre å ta risiko for å oppnå det man virkelig vil' },
                { example: 'Kritisk tolkning av "Hun forlot alt for å følge drømmen"', label: 'Drømmer kan gjøre oss blinde for det vi allerede har' },
            ],
        },
    },
    {
        id: 'buds-8-3',
        deviceId: 'budskap',
        level: 8,
        instruction: 'Sorter budskapene etter om de er eksplisitte (direkte uttalt) eller implisitte (skjulte).',
        data: {
            type: 'sort',
            categories: [
                { id: 'eksplisitt', label: 'Eksplisitt (budskapet sies rett ut)' },
                { id: 'implisitt', label: 'Implisitt (leseren må tolke)' },
            ],
            items: [
                { text: '"Moralen er: den som graver en grav for andre, faller selv i den."', categoryId: 'eksplisitt' },
                { text: 'Treet som overlevde stormen hadde de dypeste røttene. De andre, med grunne røtter, lå knekt på bakken.', categoryId: 'implisitt' },
                { text: '"Husk: det er bedre å tenne et lys enn å forbanne mørket."', categoryId: 'eksplisitt' },
                { text: 'Han vinket fra toppen. Alle beundret klatringen. Ingen så sårene på hendene.', categoryId: 'implisitt' },
                { text: '"Denne historien viser oss at sannheten alltid kommer fram."', categoryId: 'eksplisitt' },
                { text: 'Det siste bladet falt. Treet sto nakent. Men røttene arbeidet usynlig under bakken.', categoryId: 'implisitt' },
            ],
        },
    },

    // === NIVÅ 9 ===
    {
        id: 'buds-9-1',
        deviceId: 'budskap',
        level: 9,
        instruction: 'Analyser det komplekse budskapet.',
        data: {
            type: 'explain',
            text: 'De rev den gamle skolen for å bygge en ny. Den nye var moderne, lys og effektiv. Men de gamle elevene sto utenfor og gråt. Ikke over bygningen. Over alt som hadde skjedd innenfor veggene.',
            highlightedWords: 'alt som hadde skjedd innenfor veggene',
            question: 'Budskapet handler om mer enn en skolebygning. Hva vil forfatteren formidle?',
            options: [
                { text: 'Fremskritt har en usynlig kostnad: vi mister steder som bærer minner og identitet. Effektivitet kan ikke måle verdien av det som forsvinner. Budskapet er at noen ting er verdifulle ikke for hva de er, men for hva de representerer.', correct: true, feedback: 'Riktig! Budskapet er sammensatt: framskritt er nødvendig, men det har en kostnad vi ikke alltid ser. Bygningen er bare murstein, men minnene den rommet er uerstattelige. Forfatteren ber oss stoppe opp og verdsette det som forsvinner.' },
                { text: 'At man ikke bør rive gamle skoler', correct: false, feedback: 'For bokstavelig. Budskapet handler om verdien av minner og steder, ikke bare om skolepolitikk.' },
                { text: 'At folk er for sentimentale', correct: false, feedback: 'Teksten viser tvert imot at sentimentaliteten er berettiget. Tårene er ikke for bygningen, men for minnene.' },
            ],
        },
    },
    {
        id: 'buds-9-2',
        deviceId: 'budskap',
        level: 9,
        instruction: 'Skriv en kort tekst med et motsetningsfylt budskap.',
        data: {
            type: 'write',
            prompt: 'Skriv en tekst (3-5 setninger) der budskapet er tvetydig - der leseren kan tolke det på to ulike måter. Skriv begge tolkningene i parentes etterpå.',
            hint: 'La handlingen være åpen for tolkning. For eksempel: er det modig eller dumt å ta en stor risiko?',
            exampleAnswer: 'Hun solgte huset, sa opp jobben og reiste til et land hun aldri hadde besøkt. Familien sa hun var gal. Hun sa hun endelig var fri. (Tolkning 1: Man må tørre å bryte ut for å finne seg selv. Tolkning 2: Man bør ikke kaste bort alt for en impuls.)',
        },
    },
    {
        id: 'buds-9-3',
        deviceId: 'budskap',
        level: 9,
        instruction: 'Finn feilen i denne budskapsanalysen.',
        data: {
            type: 'find-error',
            text: 'Han tilga den som hadde sviktet ham. Ikke fordi den andre fortjente det, men fordi han selv fortjente fred.',
            errorDescription: 'Hvilken analyse av budskapet er feil?',
            options: [
                { text: 'Budskapet er at man alltid bør tilgi, fordi det er det riktige å gjøre', correct: true, feedback: 'Riktig feil! Teksten sier ikke at man "bør" tilgi av plikt. Budskapet er at tilgivelse handler om deg selv, ikke om den andre. Det er en selvisk handling i positiv forstand - for din egen fred.' },
                { text: 'Budskapet er at tilgivelse handler om din egen frihet, ikke om den andres fortjeneste', correct: false, feedback: 'Dette er en riktig analyse. Nøkkelordet er "han selv fortjente fred".' },
                { text: 'Budskapet er at å bære nag skader deg selv mer enn den som svek deg', correct: false, feedback: 'Dette er en god tolkning. Tilgivelsen frigjør ham fra byrden.' },
            ],
        },
    },

    // === NIVÅ 10 ===
    {
        id: 'buds-10-1',
        deviceId: 'budskap',
        level: 10,
        instruction: 'Analyser det flerlaga budskapet i denne teksten.',
        data: {
            type: 'explain',
            text: 'Dommeren slo med hammeren og erklærte mannen uskyldig. Mannen gikk ut av rettssalen som en fri mann. Men han krysset aldri den gaten igjen. Han unngikk blikkene. Han sov aldri uten lys. Loven hadde frikjent ham. Noe annet hadde ikke det.',
            highlightedWords: 'Loven hadde frikjent ham. Noe annet hadde ikke det.',
            question: 'Teksten har flere lag. Hva er det dypeste budskapet?',
            options: [
                { text: 'Juridisk uskyld og moralsk uskyld er to forskjellige ting. Loven kan frikjenne deg, men samvittigheten følger sine egne regler. Budskapet er at den indre dommen er strengere enn den ytre, og at ekte frihet krever mer enn et vedtak.', correct: true, feedback: 'Riktig! Budskapet opererer på flere nivåer: lov vs. moral, ytre frihet vs. indre fengsel, samfunnets dom vs. samvittighetens dom. "Noe annet" er bevisst vagt - det kan være samvittigheten, sannheten, eller skyldfølelsen. Forfatteren lar det stå åpent.' },
                { text: 'At rettssystemet ikke fungerer', correct: false, feedback: 'Teksten kritiserer ikke rettssystemet. Budskapet handler om gapet mellom lov og samvittighet.' },
                { text: 'At han var skyldig', correct: false, feedback: 'Det er en mulig tolkning av handlingen, men budskapet er dypere - det handler om samvittighetens makt.' },
            ],
        },
    },
    {
        id: 'buds-10-2',
        deviceId: 'budskap',
        level: 10,
        instruction: 'Skriv en tekst der budskapet endrer seg med leserens perspektiv.',
        data: {
            type: 'write',
            prompt: 'Skriv en tekst (4-6 setninger) der budskapet avhenger av leserens egne erfaringer og verdier. En person kan tolke det som positivt, en annen som negativt. Forklar de ulike tolkningene.',
            hint: 'Lag en situasjon med et moralsk dilemma der begge sider har gode argumenter.',
            exampleAnswer: 'Legen sa at behandlingen ville gi bestemor seks måneder til. Seks måneder med smerte, senger og slanger. Familien sa ja. Bestemor sa ingenting. Hun hadde sluttet å si noe for lenge siden. (Noen leser dette som kjærlighet - familien kjemper for hvert minutt. Andre leser det som egoisme - de tvinger henne til å lide for sin egen skyld.)',
        },
    },
    {
        id: 'buds-10-3',
        deviceId: 'budskap',
        level: 10,
        instruction: 'Koble teksten med den mest presise budskapsanalysen.',
        data: {
            type: 'match',
            pairs: [
                { example: 'Kunstneren malte et mesterverk i hemmelighet. Da han døde, fant de det i kjelleren. Det ble verdt millioner. Han hadde levd i fattigdom.', label: 'Samfunnet verdsetter kunst for sent - verdien vi gir ting etter noens død avslører vår manglende evne til å se verdi i nåtiden' },
                { example: 'De stemte for fred, men sendte våpen. De snakket om likhet, men bygde gjerder. Ordene var vakre. Handlingene var stumme.', label: 'Hykleri i maktposisjoner - ord uten handlinger er meningsløse, og den største løgnen er den som kler seg i sannhetens drakt' },
                { example: 'Barnet som aldri fikk ros, ble den voksne som aldri ga ros. Sirkelen fortsatte.', label: 'Traumemønstre arves mellom generasjoner - vi gjør mot andre det som ble gjort mot oss, med mindre vi bevisst bryter sirkelen' },
                { example: 'De bygde en algoritme som visste hva alle ville ha. Folk fikk nøyaktig det de ønsket. Og sluttet å ønske noe nytt.', label: 'Perfekt tilpasning dreper nysgjerrighet - når vi aldri utfordres, slutter vi å vokse' },
            ],
        },
    },
];
