import type { Exercise } from '../types';

export const personifiseringExercises: Exercise[] = [
    // === NIVÅ 1 ===
    {
        id: 'pers-1-1',
        deviceId: 'personifisering',
        level: 1,
        instruction: 'Hvilket virkemiddel er brukt?',
        data: {
            type: 'identify',
            text: 'Vinden sang gjennom trærne.',
            options: [
                { deviceId: 'personifisering', label: 'Personifisering', correct: true, feedback: 'Riktig! Vinden kan ikke synge - det er en menneskelig handling. Personifisering!' },
                { deviceId: 'metafor', label: 'Metafor', correct: false, feedback: 'Nesten! Men dette er mer spesifikt: vinden får en menneskelig evne (å synge). Det er personifisering.' },
                { deviceId: 'sammenligning', label: 'Sammenligning', correct: false, feedback: 'Nei, det mangler "som" eller "lik". Dessuten er det vinden som gjør noe menneskelig.' },
                { deviceId: 'alliterasjon', label: 'Alliterasjon', correct: false, feedback: 'Nei, alliterasjon handler om ord som starter på samme lyd.' },
            ],
        },
    },
    {
        id: 'pers-1-2',
        deviceId: 'personifisering',
        level: 1,
        instruction: 'Marker personifiseringen.',
        data: {
            type: 'highlight',
            text: 'Datamaskinen nektet å starte den morgenen.',
            correctRanges: [
                { words: 'nektet', explanation: 'Å nekte er en bevisst menneskelig handling. Datamaskiner kan ikke nekte - de er maskiner!' },
            ],
        },
    },
    {
        id: 'pers-1-3',
        deviceId: 'personifisering',
        level: 1,
        instruction: 'Hvilket virkemiddel er brukt?',
        data: {
            type: 'identify',
            text: 'Trærne vinket til oss i vinden.',
            options: [
                { deviceId: 'personifisering', label: 'Personifisering', correct: true, feedback: 'Riktig! Trær kan ikke vinke - det er en menneskelig handling.' },
                { deviceId: 'besjeling', label: 'Besjeling', correct: false, feedback: 'Nesten! Men å vinke er en fysisk handling, ikke en følelse. Det gjør det til personifisering.' },
                { deviceId: 'symbol', label: 'Symbol', correct: false, feedback: 'Nei, trærne er ikke et symbol her - de får bare en menneskelig egenskap.' },
                { deviceId: 'gjentakelse', label: 'Gjentakelse', correct: false, feedback: 'Nei, ingenting gjentas i denne setningen.' },
            ],
        },
    },
    {
        id: 'pers-1-4',
        deviceId: 'personifisering',
        level: 1,
        instruction: 'Marker personifiseringen.',
        data: {
            type: 'highlight',
            text: 'Klokken på veggen stirret ned på dem fra sin plass.',
            correctRanges: [
                { words: 'stirret ned på dem', explanation: 'En klokke har ikke øyne og kan ikke stirre. Det er en menneskelig handling.' },
            ],
        },
    },

    // === NIVÅ 2 ===
    {
        id: 'pers-2-1',
        deviceId: 'personifisering',
        level: 2,
        instruction: 'Hva er effekten av personifiseringen?',
        data: {
            type: 'explain',
            text: 'Byen sov aldri. Lysene blinket, bilene brummet, og gatene pustet mennesker ut og inn.',
            highlightedWords: 'gatene pustet mennesker ut og inn',
            question: 'Hvilken effekt har personifiseringen av gatene?',
            options: [
                { text: 'Det får byen til å virke levende, som en organisme som puster - det forsterker følelsen av konstant liv og bevegelse', correct: true, feedback: 'Riktig! Når gatene "puster", blir hele byen til en levende kropp. Mennesker som beveger seg blir til pust - inn og ut, hele tiden.' },
                { text: 'Det viser at luftkvaliteten er dårlig', correct: false, feedback: 'Nei, "pustet" er billedlig her - det handler om menneskenes bevegelse, ikke luft.' },
                { text: 'Det betyr at det var veldig vindfullt', correct: false, feedback: 'Nei, her handler det om at gatene behandles som noe levende som puster.' },
            ],
        },
    },
    {
        id: 'pers-2-2',
        deviceId: 'personifisering',
        level: 2,
        instruction: 'Marker personifiseringen i teksten.',
        data: {
            type: 'highlight',
            text: 'Alarmen skrek gjennom hele bygningen. Folk tumlet ut av kontorene sine.',
            correctRanges: [
                { words: 'Alarmen skrek', explanation: 'Alarmer kan ikke skrike - det er en menneskelig handling. Det forsterker følelsen av akutt fare og panikk.' },
            ],
        },
    },
    {
        id: 'pers-2-3',
        deviceId: 'personifisering',
        level: 2,
        instruction: 'Hvilket virkemiddel er brukt i dette avsnittet?',
        data: {
            type: 'identify',
            text: 'Den gamle stolen protesterte høyt da han satte seg. Bena knirket og setet sukket under vekten hans.',
            options: [
                { deviceId: 'personifisering', label: 'Personifisering', correct: true, feedback: 'Riktig! Stolen "protesterte" og "sukket" - begge er menneskelige handlinger gitt til en gjenstand.' },
                { deviceId: 'besjeling', label: 'Besjeling', correct: false, feedback: 'Nesten! Men å protestere og sukke er handlinger, ikke følelser. Det gjør det til personifisering.' },
                { deviceId: 'metafor', label: 'Metafor', correct: false, feedback: 'Nei, dette er mer spesifikt: stolen får menneskelige egenskaper. Det er personifisering.' },
                { deviceId: 'kontrast', label: 'Kontrast', correct: false, feedback: 'Nei, det er ingen motsetninger som settes opp mot hverandre her.' },
            ],
        },
    },

    // === NIVÅ 3 ===
    {
        id: 'pers-3-1',
        deviceId: 'personifisering',
        level: 3,
        instruction: 'Marker kun personifiseringen. Her er det flere virkemidler!',
        data: {
            type: 'highlight',
            text: 'Regnet trommet og trommet mot vinduet. Skyene lo av dem som forsokte å holde seg tørre, som mus i en felle.',
            correctRanges: [
                { words: 'Skyene lo av dem', explanation: 'Skyene kan ikke le - det er personifisering. (Merk: "trommet og trommet" er gjentakelse, "som mus i en felle" er sammenligning.)' },
            ],
        },
    },
    {
        id: 'pers-3-2',
        deviceId: 'personifisering',
        level: 3,
        instruction: 'Koble hvert eksempel med riktig virkemiddel.',
        data: {
            type: 'match',
            pairs: [
                { example: 'Dora hilste på dem med en lang knirking.', label: 'Personifisering' },
                { example: 'Det gamle huset var trist og forlatt.', label: 'Besjeling' },
                { example: 'Huset lå der som et sovende dyr.', label: 'Sammenligning' },
                { example: 'Han gikk forbi det mørke, mørke huset.', label: 'Gjentakelse' },
            ],
        },
    },
    {
        id: 'pers-3-3',
        deviceId: 'personifisering',
        level: 3,
        instruction: 'Hva er effekten av personifiseringen her?',
        data: {
            type: 'explain',
            text: 'Havet strakte armene sine mot stranden, greptak i sanden, og trakk seg deretter tilbake. Om og om igjen, som om det lengtet etter noe det aldri kunne beholde.',
            highlightedWords: 'strakte armene sine mot stranden, greptak i sanden',
            question: 'Hva oppnår forfatteren med denne personifiseringen?',
            options: [
                { text: 'Havet får menneskelig lengsel - bølgene blir til armer som rekker etter noe uoppnåelig, noe som skaper en melankolsk stemning', correct: true, feedback: 'Riktig! Personifiseringen gjør havet til en lengselsfull skikkelse. Bølgebevegelsen blir til en desperat, gjentakende handling - å strekke seg etter noe man aldri kan ha.' },
                { text: 'Det viser at det er fjære og flo', correct: false, feedback: 'Ja, fysisk beskriver det tidevann, men personifiseringen gir det følelser og hensikt - det er effekten du skal se etter.' },
                { text: 'Det betyr at havet er farlig', correct: false, feedback: 'Nei, tonen her er melankolsk og lengtende, ikke truende.' },
            ],
        },
    },

    // === NIVÅ 4 (Skribent) ===
    {
        id: 'pers-4-1',
        deviceId: 'personifisering',
        level: 4,
        instruction: 'Skriv en setning som bruker personifisering.',
        data: {
            type: 'write',
            prompt: 'Skriv en setning der du gir en gjenstand eller et naturfenomen en menneskelig handling.',
            hint: 'Tenk: Hva gjør mennesker som ting ikke kan? Snakke, danse, le, vinke...',
            exampleAnswer: 'Døren ønsket dem velkommen med en vennlig knirking.',
        },
    },
    {
        id: 'pers-4-2',
        deviceId: 'personifisering',
        level: 4,
        instruction: 'Fyll inn et ord som skaper personifisering.',
        data: {
            type: 'fill-blank',
            textBefore: 'Vinden ',
            textAfter: ' gjennom gatene som om den lette etter noen.',
            correctAnswers: ['vandret', 'løp', 'ruslet', 'hastet', 'sprang', 'gikk'],
            acceptKeywords: ['danset', 'sang', 'hvisket', 'skrek', 'jaget', 'snek', 'lekte', 'stormet'],
            hint: 'Gi vinden en menneskelig handling. Hva gjør vinden gjennom gatene?',
            explanation: 'Når vinden "vandrer" eller "løper", får den en menneskelig handling. Det er personifisering!',
        },
    },
    {
        id: 'pers-4-3',
        deviceId: 'personifisering',
        level: 4,
        instruction: 'Skriv en setning med personifisering om skolen din.',
        data: {
            type: 'write',
            prompt: 'Gi noe på skolen (tavlen, stolen, klokken, døren) en menneskelig handling.',
            hint: 'Eksempel: Tavlen kan "fortelle", døren kan "hilse", klokken kan "kommandere".',
            exampleAnswer: 'Skoleklokken kommanderte alle ut i friminuttet.',
        },
    },

    // === NIVÅ 5 (Detektiv) ===
    {
        id: 'pers-5-1',
        deviceId: 'personifisering',
        level: 5,
        instruction: 'Er denne analysen riktig?',
        data: {
            type: 'true-false',
            statement: '"Solen smilte ned på dem" er en sammenligning fordi solen sammenlignes med et menneske.',
            correct: false,
            explanation: 'Usant! Det er personifisering, ikke sammenligning. En sammenligning bruker "som" eller "lik". Her får solen en menneskelig handling (å smile) uten sammenligningsord.',
        },
    },
    {
        id: 'pers-5-2',
        deviceId: 'personifisering',
        level: 5,
        instruction: 'Finn feilen i denne analysen.',
        data: {
            type: 'find-error',
            text: 'Trærne danset i vinden.',
            errorDescription: 'En elev sier: "Dette er besjeling fordi trærne får følelser."',
            options: [
                { text: 'Å danse er en handling, ikke en følelse. Det er personifisering, ikke besjeling.', correct: true, feedback: 'Riktig! Å danse er en fysisk, menneskelig handling. Besjeling gir følelser (trist, sint). Personifisering gir handlinger (danse, vinke, snakke).' },
                { text: 'Det er riktig, dette er besjeling.', correct: false, feedback: 'Nei, eleven tar feil. Å danse er en handling, ikke en følelse. Det er personifisering.' },
                { text: 'Det er egentlig en metafor.', correct: false, feedback: 'Nei, trærne får en spesifikk menneskelig handling. Det er personifisering.' },
            ],
        },
    },
    {
        id: 'pers-5-3',
        deviceId: 'personifisering',
        level: 5,
        instruction: 'Sant eller usant?',
        data: {
            type: 'true-false',
            statement: '"Bølgene klappet mot stranden" er personifisering fordi bølgene får en menneskelig handling.',
            correct: true,
            explanation: 'Sant! Å klappe er en menneskelig handling. Bølgene behandles som om de bevisst klapper, noe bare mennesker kan gjøre.',
        },
    },

    // === NIVÅ 6 (Analytiker) ===
    {
        id: 'pers-6-1',
        deviceId: 'personifisering',
        level: 6,
        instruction: 'Marker personifiseringen i dette lengre tekstutdraget.',
        data: {
            type: 'highlight',
            text: 'Byen våknet sakte. Først begynte bussene å brumme, så åpnet kafeene øynene sine. Menneskene strømmet ut av hjemmene sine, og gatene fyltes med liv.',
            correctRanges: [
                { words: 'Byen våknet sakte', explanation: 'Byen kan ikke våkne - det er en menneskelig handling. Personifiseringen gir byen et menneskelig morgenritual.' },
                { words: 'åpnet kafeene øynene sine', explanation: 'Kafeer har ikke øyne. De "åpner øynene" som om de er levende vesener som våkner.' },
            ],
        },
    },
    {
        id: 'pers-6-2',
        deviceId: 'personifisering',
        level: 6,
        instruction: 'Hva oppnår forfatteren med personifiseringen?',
        data: {
            type: 'explain',
            text: 'Telefonen hans tigget og ba om oppmerksomhet. Den vibret, den lyste, den pep - men han snudde den med skjermen ned.',
            highlightedWords: 'tigget og ba om oppmerksomhet',
            question: 'Hva er effekten av å si at telefonen "tigger"?',
            options: [
                { text: 'Det viser at telefonen oppleves som masende og krevende, nesten som en person som ikke gir seg', correct: true, feedback: 'Riktig! Personifiseringen gjør telefonen til en desperat person som tigger. Det viser hvor påtrengende teknologien kan føles.' },
                { text: 'At telefonen er ødelagt', correct: false, feedback: 'Nei, telefonen fungerer - den vibrerer og lyser. Poenget er at den oppleves som masende.' },
                { text: 'At han ikke liker telefoner', correct: false, feedback: 'Kanskje, men personifiseringen handler om å gjøre teknologien menneskelig og krevende.' },
            ],
        },
    },
    {
        id: 'pers-6-3',
        deviceId: 'personifisering',
        level: 6,
        instruction: 'Marker all personifisering. Det er flere tilfeller!',
        data: {
            type: 'highlight',
            text: 'Datamaskinen nektet å samarbeide. Skriveren spyttet ut blanke ark i protest, og Wi-Fi-routeren blunket dovent fra hjørnet.',
            correctRanges: [
                { words: 'nektet å samarbeide', explanation: 'Datamaskiner kan ikke nekte - det er en bevisst menneskelig handling.' },
                { words: 'spyttet ut blanke ark i protest', explanation: 'Skriveren "protesterer" som et menneske - den gjør opprør.' },
                { words: 'blunket dovent', explanation: 'Routeren "blunker dovent" - den får øyne og en lat holdning.' },
            ],
        },
    },

    // === NIVÅ 7 (Kritiker) ===
    {
        id: 'pers-7-1',
        deviceId: 'personifisering',
        level: 7,
        instruction: 'Sant eller usant?',
        data: {
            type: 'true-false',
            statement: 'Personifisering og besjeling er det samme virkemiddelet - de kan brukes om hverandre.',
            correct: false,
            explanation: 'Usant! Personifisering gir menneskelige handlinger (vinke, danse, snakke). Besjeling gir følelser og stemninger (trist, sint, ensom). De overlapper, men er forskjellige.',
        },
    },
    {
        id: 'pers-7-2',
        deviceId: 'personifisering',
        level: 7,
        instruction: 'Sorter eksemplene i riktig kategori.',
        data: {
            type: 'sort',
            categories: [
                { id: 'pers', label: 'Personifisering' },
                { id: 'besj', label: 'Besjeling' },
            ],
            items: [
                { text: 'Stolen klaget høyt da han satte seg.', categoryId: 'pers' },
                { text: 'Huset var trist og forlatt.', categoryId: 'besj' },
                { text: 'Vinden hvisket hemmeligheter.', categoryId: 'pers' },
                { text: 'Havet var rasende den kvelden.', categoryId: 'besj' },
                { text: 'Døren vinket farvel.', categoryId: 'pers' },
                { text: 'Fjellet virket ensomt.', categoryId: 'besj' },
            ],
        },
    },
    {
        id: 'pers-7-3',
        deviceId: 'personifisering',
        level: 7,
        instruction: 'Koble hvert eksempel med riktig virkemiddel.',
        data: {
            type: 'match',
            pairs: [
                { example: 'Alarmen skrek gjennom gangen.', label: 'Personifisering' },
                { example: 'Alarmen var sint og høy som en brannbil.', label: 'Sammenligning' },
                { example: 'Alarmen var en eksplosjon av lyd.', label: 'Metafor' },
                { example: 'Alarmen var rasende.', label: 'Besjeling' },
            ],
        },
    },

    // === NIVÅ 8 (Sorteringsekspert) ===
    {
        id: 'pers-8-1',
        deviceId: 'personifisering',
        level: 8,
        instruction: 'Sorter alle eksemplene i riktig kategori.',
        data: {
            type: 'sort',
            categories: [
                { id: 'pers', label: 'Personifisering' },
                { id: 'metafor', label: 'Metafor' },
                { id: 'saml', label: 'Sammenligning' },
            ],
            items: [
                { text: 'Trærne vinket til oss.', categoryId: 'pers' },
                { text: 'Trærne var som gamle vakter.', categoryId: 'saml' },
                { text: 'Trærne var soldater langs veien.', categoryId: 'metafor' },
                { text: 'Klokken stirret ned på dem.', categoryId: 'pers' },
                { text: 'Klokken var en streng lærer.', categoryId: 'metafor' },
                { text: 'Klokken tikket som et hjerte.', categoryId: 'saml' },
            ],
        },
    },
    {
        id: 'pers-8-2',
        deviceId: 'personifisering',
        level: 8,
        instruction: 'Koble hvert eksempel med riktig virkemiddel.',
        data: {
            type: 'match',
            pairs: [
                { example: 'Regnet trommet på taket.', label: 'Personifisering' },
                { example: 'Regnet var kaldt og trist.', label: 'Besjeling' },
                { example: 'Regnet falt som tårer fra himmelen.', label: 'Sammenligning' },
                { example: 'Regnet var en gardin av grått.', label: 'Metafor' },
            ],
        },
    },
    {
        id: 'pers-8-3',
        deviceId: 'personifisering',
        level: 8,
        instruction: 'Sorter i riktig kategori.',
        data: {
            type: 'sort',
            categories: [
                { id: 'pers', label: 'Personifisering' },
                { id: 'besj', label: 'Besjeling' },
                { id: 'ingen', label: 'Ingen av delene' },
            ],
            items: [
                { text: 'Bilen hostet og spyttet.', categoryId: 'pers' },
                { text: 'Bilen var gammel og sliten.', categoryId: 'ingen' },
                { text: 'Bilen var lei av å kjøre.', categoryId: 'besj' },
                { text: 'Bilen bukket og nikket over fartsdumpene.', categoryId: 'pers' },
            ],
        },
    },

    // === NIVÅ 9 (Mester) ===
    {
        id: 'pers-9-1',
        deviceId: 'personifisering',
        level: 9,
        instruction: 'Skriv et kort avsnitt der du bruker minst to personifiseringer.',
        data: {
            type: 'write',
            prompt: 'Beskriv et klasserom etter skoletid. Bruk minst to personifiseringer.',
            hint: 'Gi gjenstander menneskelige handlinger: stolene kan "hviske", tavlen kan "stirre", døren kan "gjespe".',
            exampleAnswer: 'Stolene hvisket til hverandre i det tomme klasserommet. Tavlen stirret blankt ut i rommet, og døren gispet da vinden tok tak i den.',
        },
    },
    {
        id: 'pers-9-2',
        deviceId: 'personifisering',
        level: 9,
        instruction: 'Finn feilen i analysen.',
        data: {
            type: 'find-error',
            text: 'Solen kysset ansiktet hennes mens hun lå i gresset.',
            errorDescription: 'En elev skriver: "Her brukes metafor fordi solen sammenlignes med en person som kysser."',
            options: [
                { text: 'Det er personifisering, ikke metafor. Solen får en spesifikk menneskelig handling (å kysse), den kalles ikke for noe annet.', correct: true, feedback: 'Riktig! Metafor ville vært "Solen var et kyss". Her gir forfatteren solen evnen til å kysse - det er personifisering.' },
                { text: 'Eleven har rett, det er en metafor.', correct: false, feedback: 'Nei, solen kalles ikke for noe annet. Den utfører en menneskelig handling. Det er personifisering.' },
                { text: 'Det er egentlig en sammenligning.', correct: false, feedback: 'Nei, det mangler "som" eller "lik". Solen gjør noe menneskelig - det er personifisering.' },
            ],
        },
    },
    {
        id: 'pers-9-3',
        deviceId: 'personifisering',
        level: 9,
        instruction: 'Marker personifiseringen. Ikke marker andre virkemidler!',
        data: {
            type: 'highlight',
            text: 'Mobiltelefonen ropte etter henne fra nattbordet. Den lyste opp som en liten sol. Hun sukket og snudde seg bort.',
            correctRanges: [
                { words: 'ropte etter henne', explanation: 'Telefoner kan ikke rope - det er en menneskelig handling. (Merk: "som en liten sol" er sammenligning.)' },
            ],
        },
    },

    // === NIVÅ 10 (Magister) ===
    {
        id: 'pers-10-1',
        deviceId: 'personifisering',
        level: 10,
        instruction: 'Hva oppnår forfatteren med personifiseringen her?',
        data: {
            type: 'explain',
            text: 'Natten la armene sine rundt byen. Gatene tiet, vinduene lukket øynene, og bare stjernene holdt vakt. Ingen spurte om lov til å sove - natten bestemte det for alle.',
            highlightedWords: 'Natten la armene sine rundt byen',
            question: 'Hva er den samlede effekten av all personifiseringen i dette avsnittet?',
            options: [
                { text: 'Natten blir en omsorgsfull, men autoritær skikkelse som legger byen i sengen - det skaper en stemning av trygghet blandet med ufrihet', correct: true, feedback: 'Riktig! Natten "legger armene rundt" (omsorg), men "bestemmer for alle" (kontroll). Personifiseringen gjør natten til en kompleks karakter - både beskyttende og dominerende.' },
                { text: 'At det er mørkt ute', correct: false, feedback: 'Det er den bokstavelige betydningen. Personifiseringen gjør natten til en person med motiver og handlinger.' },
                { text: 'At folk er trøtte', correct: false, feedback: 'Trøtthet er en del av det, men poenget er hvordan natten beskrives som en autoritær omsorgsperso.' },
            ],
        },
    },
    {
        id: 'pers-10-2',
        deviceId: 'personifisering',
        level: 10,
        instruction: 'Sorter alle eksemplene i riktig kategori.',
        data: {
            type: 'sort',
            categories: [
                { id: 'pers', label: 'Personifisering' },
                { id: 'besj', label: 'Besjeling' },
                { id: 'metafor', label: 'Metafor' },
                { id: 'saml', label: 'Sammenligning' },
            ],
            items: [
                { text: 'Stormen skrek mot skipet.', categoryId: 'pers' },
                { text: 'Stormen var rasende.', categoryId: 'besj' },
                { text: 'Stormen var en rasende kjempe.', categoryId: 'metafor' },
                { text: 'Stormen brølte som et dyr.', categoryId: 'saml' },
                { text: 'Månen spionerte på dem gjennom skyene.', categoryId: 'pers' },
                { text: 'Månen var kald og likegyldig.', categoryId: 'besj' },
            ],
        },
    },
    {
        id: 'pers-10-3',
        deviceId: 'personifisering',
        level: 10,
        instruction: 'Fyll inn et ord som skaper personifisering.',
        data: {
            type: 'fill-blank',
            textBefore: 'De gamle bøkene i hyllen ',
            textAfter: ' tålmodig på at noen skulle åpne dem igjen.',
            correctAnswers: ['ventet', 'ba', 'håpet', 'lengtet'],
            acceptKeywords: ['drømte', 'sukket', 'savnet', 'ønsket', 'tigget', 'tryglet'],
            hint: 'Gi bøkene en menneskelig følelse - hva gjør de mens de venter på å bli lest?',
            explanation: 'Bøker kan ikke vente eller håpe - det er menneskelige handlinger. Personifiseringen gir bøkene et ønske og tålmodighet, som om de er levende vesener som savner å bli lest.',
        },
    },
];
