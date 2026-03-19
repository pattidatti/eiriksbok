import type { Exercise } from '../types';

export const sammenligningExercises: Exercise[] = [
    // === NIVÅ 1 ===
    {
        id: 'saml-1-1',
        deviceId: 'sammenligning',
        level: 1,
        instruction: 'Hvilket virkemiddel er brukt?',
        data: {
            type: 'identify',
            text: 'Han var sterk som en okse.',
            options: [
                { deviceId: 'sammenligning', label: 'Sammenligning', correct: true, feedback: 'Riktig! Ordet "som" forteller oss at dette er en sammenligning.' },
                { deviceId: 'metafor', label: 'Metafor', correct: false, feedback: 'Nesten! Men her brukes "som" - det gjør det til en sammenligning, ikke en metafor.' },
                { deviceId: 'besjeling', label: 'Besjeling', correct: false, feedback: 'Nei, besjeling gir følelser til livløse ting. Her sammenlignes en person med et dyr.' },
                { deviceId: 'alliterasjon', label: 'Alliterasjon', correct: false, feedback: 'Nei, alliterasjon handler om ord som starter på samme lyd.' },
            ],
        },
    },
    {
        id: 'saml-1-2',
        deviceId: 'sammenligning',
        level: 1,
        instruction: 'Marker sammenligningen i setningen.',
        data: {
            type: 'highlight',
            text: 'Huden hennes var myk som silke.',
            correctRanges: [
                { words: 'myk som silke', explanation: 'Her sammenlignes huden med silke ved hjelp av ordet "som".' },
            ],
        },
    },
    {
        id: 'saml-1-3',
        deviceId: 'sammenligning',
        level: 1,
        instruction: 'Hvilket virkemiddel er brukt?',
        data: {
            type: 'identify',
            text: 'Barnet sov lik en engel.',
            options: [
                { deviceId: 'sammenligning', label: 'Sammenligning', correct: true, feedback: 'Riktig! "Lik" er et sammenligningsord, akkurat som "som".' },
                { deviceId: 'metafor', label: 'Metafor', correct: false, feedback: 'Nei, her brukes "lik" - det er en sammenligning.' },
                { deviceId: 'personifisering', label: 'Personifisering', correct: false, feedback: 'Nei, barnet er allerede et menneske, så det er ikke personifisering.' },
                { deviceId: 'symbol', label: 'Symbol', correct: false, feedback: 'Nei, engelen er brukt som sammenligningsbilde, ikke som symbol.' },
            ],
        },
    },
    {
        id: 'saml-1-4',
        deviceId: 'sammenligning',
        level: 1,
        instruction: 'Marker sammenligningen.',
        data: {
            type: 'highlight',
            text: 'Hele rommet var stille som graven etter at læreren hadde snakket.',
            correctRanges: [
                { words: 'stille som graven', explanation: 'Stillheten sammenlignes med graven - et sted der det er helt stille.' },
            ],
        },
    },

    // === NIVÅ 2 ===
    {
        id: 'saml-2-1',
        deviceId: 'sammenligning',
        level: 2,
        instruction: 'Hva forteller denne sammenligningen oss?',
        data: {
            type: 'explain',
            text: 'Hun skiftet venninner som andre skifter klær.',
            highlightedWords: 'som andre skifter klær',
            question: 'Hva sier sammenligningen om jenta?',
            options: [
                { text: 'Hun byttet venner veldig ofte og lett, uten å bry seg mye', correct: true, feedback: 'Riktig! Å skifte klær er noe man gjør daglig og uten å tenke - sammenligningen viser at hun var like uforpliktende med vennskap.' },
                { text: 'Hun var veldig opptatt av mote', correct: false, feedback: 'Nei, klær er bare sammenligningsbildet. Poenget handler om vennskap.' },
                { text: 'Hun hadde mange fine klær', correct: false, feedback: 'Nei, setningen handler om venner, ikke klær.' },
            ],
        },
    },
    {
        id: 'saml-2-2',
        deviceId: 'sammenligning',
        level: 2,
        instruction: 'Marker sammenligningen i teksten.',
        data: {
            type: 'highlight',
            text: 'Ordene falt fra leppene hans som tunge steiner i et stille vann. Alle i rommet merket tyngden.',
            correctRanges: [
                { words: 'som tunge steiner i et stille vann', explanation: 'Ordene sammenlignes med tunge steiner som faller i stille vann - de gjør inntrykk og skaper ringvirkninger.' },
            ],
        },
    },
    {
        id: 'saml-2-3',
        deviceId: 'sammenligning',
        level: 2,
        instruction: 'Hvilket virkemiddel er brukt?',
        data: {
            type: 'identify',
            text: 'Dagene krøp forbi som snegler i sirup. Ingenting skjedde, og ingenting ville skje.',
            options: [
                { deviceId: 'sammenligning', label: 'Sammenligning', correct: true, feedback: 'Riktig! "Som snegler i sirup" er en sammenligning som viser hvor sakte dagene gikk.' },
                { deviceId: 'metafor', label: 'Metafor', correct: false, feedback: 'Nei, det er en sammenligning fordi den bruker "som".' },
                { deviceId: 'gjentakelse', label: 'Gjentakelse', correct: false, feedback: '"Ingenting" gjentas, men hovedvirkemiddelet er sammenligningen med sneglene.' },
                { deviceId: 'ironi', label: 'Ironi', correct: false, feedback: 'Nei, dette er ikke ironisk - det menes bokstavelig at dagene var trege.' },
            ],
        },
    },

    // === NIVÅ 3 ===
    {
        id: 'saml-3-1',
        deviceId: 'sammenligning',
        level: 3,
        instruction: 'Hva gjør denne sammenligningen med teksten?',
        data: {
            type: 'explain',
            text: 'Latteren hennes rant gjennom korridoren som varmt vann gjennom islagte rør. Folk som nettopp hadde frosset fast i sine egne tanker, tinte opp.',
            highlightedWords: 'som varmt vann gjennom islagte rør',
            question: 'Hva er effekten av denne sammenligningen?',
            options: [
                { text: 'Den viser at latteren hennes varmet opp folk som var kalde og lukket, og fikk dem til å åpne seg', correct: true, feedback: 'Riktig! Sammenligningen med varmt vann og is viser at latteren hadde en oppvarende, oppløsende effekt. Den neste setningen forsterker dette med "tinte opp".' },
                { text: 'Den viser at det var kaldt i bygget', correct: false, feedback: 'Nei, isen og kulden er billedlig. Det handler om folkene, ikke temperaturen.' },
                { text: 'Den viser at hun lo veldig høyt', correct: false, feedback: 'Delvis, men sammenligningen handler mer om effekten latteren hadde på andre enn volumet.' },
            ],
        },
    },
    {
        id: 'saml-3-2',
        deviceId: 'sammenligning',
        level: 3,
        instruction: 'Koble hvert eksempel med riktig virkemiddel.',
        data: {
            type: 'match',
            pairs: [
                { example: 'Hodet hans snurret som en karusell.', label: 'Sammenligning' },
                { example: 'Hodet hans var en karusell.', label: 'Metafor' },
                { example: 'Hodet hans protesterte mot flere tall.', label: 'Personifisering' },
                { example: 'Han tenkte og tenkte og tenkte.', label: 'Gjentakelse' },
            ],
        },
    },
    {
        id: 'saml-3-3',
        deviceId: 'sammenligning',
        level: 3,
        instruction: 'Marker sammenligningen. Obs: her finnes også andre virkemidler!',
        data: {
            type: 'highlight',
            text: 'Mørket krøp innover rommet. Skyggene danset på veggen som svarte flammer. Hun frøs, men ikke av kulde.',
            correctRanges: [
                { words: 'som svarte flammer', explanation: 'Skyggene sammenlignes med svarte flammer. (Merk: "Mørket krøp" er besjeling, og "ikke av kulde" antyder at hun frøs av frykt - en kontrast.)' },
            ],
        },
    },

    // === NIVÅ 4 (Skribent) ===
    {
        id: 'saml-4-1',
        deviceId: 'sammenligning',
        level: 4,
        instruction: 'Skriv en sammenligning som beskriver hvor rask noen er.',
        data: {
            type: 'write',
            prompt: 'Skriv en setning med en sammenligning som viser at noen løper veldig fort. Bruk "som" eller "lik".',
            hint: 'Tenk på noe som er kjent for å være raskt - et dyr, et kjøretøy, lynet?',
            exampleAnswer: 'Hun løp så fort som en gepard over skolegården.',
        },
    },
    {
        id: 'saml-4-2',
        deviceId: 'sammenligning',
        level: 4,
        instruction: 'Fyll inn sammenligningen.',
        data: {
            type: 'fill-blank',
            textBefore: 'Stemmen hennes var myk som',
            textAfter: '.',
            correctAnswers: ['silke', 'fløyel', 'bomull', 'en sommerbris', 'et vindpust'],
            acceptKeywords: ['silke', 'fløyel', 'bomull', 'bris', 'vindpust', 'dun', 'honning', 'smør', 'ull'],
            hint: 'Sammenlign med noe som er mykt. Stemmen var myk som...?',
            explanation: 'Her trenger vi noe som er mykt og behagelig. Silke, fløyel eller en bris er gode sammenligningsbilder fordi de er kjent for mykhet.',
        },
    },
    {
        id: 'saml-4-3',
        deviceId: 'sammenligning',
        level: 4,
        instruction: 'Skriv en sammenligning som beskriver en følelse.',
        data: {
            type: 'write',
            prompt: 'Du er nervøs før en prøve. Skriv en setning med en sammenligning som viser hvordan det føles i magen.',
            hint: 'Hva gjør magen din når du er nervøs? Tenk på noe som snurrer, flakser eller knyter seg.',
            exampleAnswer: 'Magen min snurret som en vaskemaskin på full hastighet.',
        },
    },

    // === NIVÅ 5 (Detektiv) ===
    {
        id: 'saml-5-1',
        deviceId: 'sammenligning',
        level: 5,
        instruction: 'Finn feilen i denne sammenligningen.',
        data: {
            type: 'find-error',
            text: 'Himmelen var rød. Solen sank bak fjellene. Det var vakkert.',
            errorDescription: 'Denne teksten prøver å beskrive en solnedgang, men mangler en sammenligning. Hvilken setning burde hatt en?',
            options: [
                { text: '"Himmelen var rød" - her kunne det stått "Himmelen var rød som blod"', correct: true, feedback: 'Riktig! En sammenligning som "rød som blod" eller "rød som ild" ville gjort beskrivelsen mye mer levende og billedlig.' },
                { text: '"Solen sank" - dette er feil fordi solen ikke kan synke', correct: false, feedback: 'Nei, "solen sank" er akseptabelt språk (det er egentlig en metafor). Problemet er at teksten mangler en sammenligning.' },
                { text: 'Det er ingen feil, teksten er perfekt', correct: false, feedback: 'Teksten er grei, men den kunne vært bedre med en sammenligning. Oppgaven handler om å se hvor en sammenligning ville passet.' },
            ],
        },
    },
    {
        id: 'saml-5-2',
        deviceId: 'sammenligning',
        level: 5,
        instruction: 'Er denne påstanden riktig eller feil?',
        data: {
            type: 'true-false',
            statement: '"Hun er en engel" er en sammenligning fordi hun sammenlignes med en engel.',
            correct: false,
            explanation: 'Nei, dette er en metafor! For at det skulle vært en sammenligning, måtte det stått "Hun er som en engel" eller "Hun ligner en engel". I en sammenligning brukes sammenligningsord som "som", "lik" eller "ligner".',
        },
    },
    {
        id: 'saml-5-3',
        deviceId: 'sammenligning',
        level: 5,
        instruction: 'Finn feilen i denne teksten.',
        data: {
            type: 'find-error',
            text: 'Elevene jobbet som maur i timen. De var helt stille som en kirke. Læreren smilte fornøyd som en tiger.',
            errorDescription: 'En av sammenligningene gir ikke mening. Hvilken?',
            options: [
                { text: '"Smilte fornøyd som en tiger" - tigre er ikke kjent for å smile fornøyd', correct: true, feedback: 'Riktig! En tiger assosieres med fare og rovdyr, ikke med tilfredshet. "Smilte fornøyd som en sol" eller "som en katt som har fått fløte" ville fungert bedre.' },
                { text: '"Jobbet som maur" - maur jobber ikke', correct: false, feedback: 'Jo, maur er kjent for å være veldig arbeidsomme! Denne sammenligningen fungerer godt.' },
                { text: '"Stille som en kirke" - kirker er ikke stille', correct: false, feedback: 'Jo, en tom kirke er et klassisk bilde på stillhet. Denne sammenligningen er helt vanlig.' },
            ],
        },
    },

    // === NIVÅ 6 (Analytiker) ===
    {
        id: 'saml-6-1',
        deviceId: 'sammenligning',
        level: 6,
        instruction: 'Marker alle sammenligningene i denne lengre teksten.',
        data: {
            type: 'highlight',
            text: 'Regnet falt som nåler mot huden. Jonas trakk jakken tettere rundt seg og skyndte seg gjennom gatene. Byen lå stille som et forlatt filmkulisse. Bare lyktestolpene lyste opp mørket, ensomme som vakter uten noen å beskytte. Han tenkte på henne, og minnene slo inn som bølger.',
            correctRanges: [
                { words: 'som nåler mot huden', explanation: 'Regnet sammenlignes med nåler - det viser at regnet var skarpt og gjorde vondt.' },
                { words: 'som et forlatt filmkulisse', explanation: 'Byen sammenlignes med en filmkulisse - den ser ekte ut, men er tom og livløs.' },
                { words: 'som vakter uten noen å beskytte', explanation: 'Lyktestolpene sammenlignes med ensomme vakter - de står der, men det er ingen som trenger dem.' },
                { words: 'som bølger', explanation: 'Minnene sammenlignes med bølger - de kommer i skyller, uforutsigbart og kraftfullt.' },
            ],
        },
    },
    {
        id: 'saml-6-2',
        deviceId: 'sammenligning',
        level: 6,
        instruction: 'Analyser sammenligningens effekt i denne teksten.',
        data: {
            type: 'explain',
            text: 'Klassefesten var i full gang. Musikken dundret, og alle danset. Men Leah sto i hjørnet med et glass brus, usynlig som et møbel man bare går forbi. Hun smilte når noen tilfeldigvis så på henne, men smilet falt av som maling i regn så fort de snudde seg bort.',
            highlightedWords: 'usynlig som et møbel man bare går forbi',
            question: 'Hva forteller sammenligningen "usynlig som et møbel" om Leahs opplevelse?',
            options: [
                { text: 'Hun er til stede, men ingen legger merke til henne - akkurat som et møbel som alltid har stått der uten at noen tenker over det', correct: true, feedback: 'Riktig! Et møbel er noe vi ser hver dag uten å tenke over det. Sammenligningen viser at Leah føler seg oversett og ubetydelig, selv om hun er midt i rommet. Den andre sammenligningen - smilet som faller av som maling - forsterker at fasaden hennes er skjør.' },
                { text: 'Hun er sjenert og liker å stå i hjørnet', correct: false, feedback: 'Sammenligningen handler ikke om hva hun liker, men om hvordan hun føler seg. Et møbel velger ikke å være usynlig - det bare er det.' },
                { text: 'Hun er fysisk liten og tar lite plass', correct: false, feedback: 'Nei, "usynlig som et møbel" handler om å bli oversett, ikke om fysisk størrelse.' },
            ],
        },
    },
    {
        id: 'saml-6-3',
        deviceId: 'sammenligning',
        level: 6,
        instruction: 'Analyser effekten av sammenligningene i teksten.',
        data: {
            type: 'explain',
            text: 'Eksamen nærmet seg som en mørk sky på horisonten. For hver dag som gikk, vokste den, tung som bly. Noen elever jobbet som gale. Andre satt lammede, stivnet lik dyr i frontlyktene på en bil.',
            highlightedWords: 'som en mørk sky på horisonten',
            question: 'Hva er effekten av at eksamen sammenlignes med en mørk sky?',
            options: [
                { text: 'Det viser at eksamen oppleves som noe truende som kommer nærmere og nærmere, og som man ikke kan stoppe - en uunngåelig fare', correct: true, feedback: 'Riktig! En mørk sky beveger seg sakte og truende, og man vet at uværet kommer. Sammenligningen viser at elevene føler seg maktesløse. Alle de andre sammenligningene i teksten forsterker denne følelsen: "tung som bly", "lammede", "stivnet lik dyr i frontlyktene".' },
                { text: 'At det var dårlig vær den dagen', correct: false, feedback: 'Nei, skyen er billedlig. Eksamen sammenlignes med en sky, det regner ikke bokstavelig.' },
                { text: 'At eksamen er enkel å komme seg gjennom', correct: false, feedback: 'Tvert imot! En mørk sky varsler uvær - sammenligningen viser at eksamen oppleves som skremmende.' },
            ],
        },
    },

    // === NIVÅ 7 (Kritiker) ===
    {
        id: 'saml-7-1',
        deviceId: 'sammenligning',
        level: 7,
        instruction: 'Koble hver sammenligning med det den uttrykker.',
        data: {
            type: 'match',
            pairs: [
                { example: 'Hendene hans skalv som løv i vinden.', label: 'Nervøsitet eller frykt' },
                { example: 'Hun lyste opp rommet som en sol.', label: 'Glede og varme' },
                { example: 'Ordene hans kuttet som kniver.', label: 'Sårende tale' },
                { example: 'Tankene kvernet som et hjul som aldri stopper.', label: 'Uro og bekymring' },
                { example: 'Stillheten lå over dem som et teppe.', label: 'Trygghet eller ubehag' },
            ],
        },
    },
    {
        id: 'saml-7-2',
        deviceId: 'sammenligning',
        level: 7,
        instruction: 'Sorter setningene etter virkemiddel.',
        data: {
            type: 'sort',
            categories: [
                { id: 'sammenligning', label: 'Sammenligning' },
                { id: 'metafor', label: 'Metafor' },
                { id: 'besjeling', label: 'Besjeling' },
            ],
            items: [
                { text: 'Hjertet hans var tungt som stein.', categoryId: 'sammenligning' },
                { text: 'Hjertet hans var en stein.', categoryId: 'metafor' },
                { text: 'Hjertet hans gråt i stillhet.', categoryId: 'besjeling' },
                { text: 'Øynene hennes skinte som stjerner.', categoryId: 'sammenligning' },
                { text: 'Øynene hennes var to stjerner.', categoryId: 'metafor' },
                { text: 'Døren klaget høyt da den ble åpnet.', categoryId: 'besjeling' },
            ],
        },
    },
    {
        id: 'saml-7-3',
        deviceId: 'sammenligning',
        level: 7,
        instruction: 'Er denne påstanden riktig eller feil?',
        data: {
            type: 'true-false',
            statement: 'Setningen "Katten beveget seg lik en skygge gjennom rommet" inneholder en sammenligning fordi den bruker ordet "lik".',
            correct: true,
            explanation: 'Riktig! Ordet "lik" fungerer som et sammenligningsord, akkurat som "som". Katten sammenlignes med en skygge - stille, smidig og nesten usynlig. Sammenligningsord kan være "som", "lik", "ligner", "minner om" og lignende.',
        },
    },

    // === NIVÅ 8 (Sorteringsekspert) ===
    {
        id: 'saml-8-1',
        deviceId: 'sammenligning',
        level: 8,
        instruction: 'Sorter sammenligningene etter hva de uttrykker.',
        data: {
            type: 'sort',
            categories: [
                { id: 'fart', label: 'Fart og bevegelse' },
                { id: 'folelse', label: 'Følelser' },
                { id: 'utseende', label: 'Utseende og sanser' },
            ],
            items: [
                { text: 'Bilen skjøt fram som en rakett.', categoryId: 'fart' },
                { text: 'Gleden spredde seg som varme gjennom kroppen.', categoryId: 'folelse' },
                { text: 'Håret hennes var rødt som høstløv.', categoryId: 'utseende' },
                { text: 'Tiden fløy som en pil.', categoryId: 'fart' },
                { text: 'Skuffelsen sank gjennom ham som kaldt vann.', categoryId: 'folelse' },
                { text: 'Lukten var skarp som eddik.', categoryId: 'utseende' },
                { text: 'Nyhetene spredte seg som ild i tørt gress.', categoryId: 'fart' },
                { text: 'Angsten klemte som en knyttneve i brystet.', categoryId: 'folelse' },
            ],
        },
    },
    {
        id: 'saml-8-2',
        deviceId: 'sammenligning',
        level: 8,
        instruction: 'Koble sammenligningen med den mest presise analysen.',
        data: {
            type: 'match',
            pairs: [
                { example: 'Livet hans rant ut som sand mellom fingrene.', label: 'Noe verdifullt som forsvinner gradvis uten at man kan stoppe det' },
                { example: 'Klasseromsdebatten eksploderte som fyrverkeri.', label: 'Plutselig energi og kaos som er både farlig og fascinerende' },
                { example: 'Vennskapet deres var slitesterkt som tau.', label: 'Et bånd som tåler mye motstand uten å ryke' },
                { example: 'Løgnene la seg som lag på lag med maling.', label: 'Usannheter som bygger seg opp og dekker over sannheten' },
            ],
        },
    },
    {
        id: 'saml-8-3',
        deviceId: 'sammenligning',
        level: 8,
        instruction: 'Sorter etter kvalitet - hvilke sammenligninger fungerer godt og hvilke er klisjeer?',
        data: {
            type: 'sort',
            categories: [
                { id: 'original', label: 'Original og treffende' },
                { id: 'klisje', label: 'Klisjé (brukt for ofte)' },
            ],
            items: [
                { text: 'Kald som is.', categoryId: 'klisje' },
                { text: 'Stemmen hans skrapte som nøkler mot betong.', categoryId: 'original' },
                { text: 'Rask som lynet.', categoryId: 'klisje' },
                { text: 'Latteren hennes boblet som brus i et glass.', categoryId: 'original' },
                { text: 'Sterk som en bjørn.', categoryId: 'klisje' },
                { text: 'Stillheten hang mellom dem som fuktig luft før et tordenvær.', categoryId: 'original' },
            ],
        },
    },

    // === NIVÅ 9 (Mester) ===
    {
        id: 'saml-9-1',
        deviceId: 'sammenligning',
        level: 9,
        instruction: 'Marker alle sammenligningene og ignorer andre virkemidler.',
        data: {
            type: 'highlight',
            text: 'Mørket krøp innover byen som blekk i vann. Gatene var tomme årer i en sovende kropp. En enslig hund ulte - lyden skar gjennom natten som glass. Over dem alle hang månen, rund som et øye som aldri blunker.',
            correctRanges: [
                { words: 'som blekk i vann', explanation: 'Mørket sammenlignes med blekk som sprer seg i vann - det kommer gradvis og uunngåelig.' },
                { words: 'som glass', explanation: 'Hundeulet sammenlignes med glass - lyden er skarp og skjærende.' },
                { words: 'som et øye som aldri blunker', explanation: 'Månen sammenlignes med et øye som alltid ser. (Merk: "Gatene var tomme årer" er en metafor, ikke en sammenligning.)' },
            ],
        },
    },
    {
        id: 'saml-9-2',
        deviceId: 'sammenligning',
        level: 9,
        instruction: 'Skriv en kreativ sammenligning for denne situasjonen.',
        data: {
            type: 'write',
            prompt: 'Beskriv følelsen av å logge inn på sosiale medier og se at alle har hatt det gøy uten deg. Bruk en sammenligning som viser følelsen.',
            hint: 'Tenk på følelsen av å bli holdt utenfor. Hva føles det som? Å stå ute i regnet mens andre er inne i varmen? Å trykke nesen mot et vindu?',
            exampleAnswer: 'Å scrolle gjennom bildene deres var som å trykke nesen mot et butikkvindu og se på alt hun aldri ville ha råd til.',
        },
    },
    {
        id: 'saml-9-3',
        deviceId: 'sammenligning',
        level: 9,
        instruction: 'Koble sammenligningen med dens funksjon i teksten.',
        data: {
            type: 'match',
            pairs: [
                { example: 'Det første snøfallet la seg over byen som et hvitt pledd. (Åpning av en novelle)', label: 'Skaper stemning og setter scenen' },
                { example: 'Veggene i rommet krympet som om de trakk pusten inn. (Midt i en konfliktscene)', label: 'Bygger spenning og ubehag' },
                { example: 'De gikk fra hverandre, og avstanden mellom dem vokste som et hav. (Slutten av en novelle)', label: 'Avslutter med et sterkt bilde som sitter igjen' },
                { example: 'Han smilte, men smilet var kaldt som en januarmorgen. (Karakterbeskrivelse)', label: 'Avslører noe om karakterens personlighet' },
            ],
        },
    },

    // === NIVÅ 10 (Magister) ===
    {
        id: 'saml-10-1',
        deviceId: 'sammenligning',
        level: 10,
        instruction: 'Analyser bruken av sammenligning i dette tekstutdraget.',
        data: {
            type: 'explain',
            text: 'Hun gikk inn i den nye klassen som en astronaut som stiger ut på en ukjent planet. Luften føltes annerledes. Blikkene fra de andre elevene traff henne som små prosjektiler, noen nysgjerrige, noen likegyldige, noen fiendtlige. Hun fant en ledig pult bakerst og sank ned i den som en gjenstand som finner sin plass i en skuff - stille, uten å protestere, perfekt tilpasset formen hun var forventet å ha.',
            highlightedWords: 'som en gjenstand som finner sin plass i en skuff',
            question: 'Hva gjør den siste sammenligningen med vår forståelse av karakteren?',
            options: [
                { text: 'Den viser at hun tilpasser seg, men at tilpasningen koster henne noe - hun gjør seg selv til en ting, mister sin menneskelighet, og aksepterer en rolle andre har bestemt for henne', correct: true, feedback: 'Riktig! "Gjenstand i en skuff" er en bevisst nedgradering fra menneske til ting. Hun har gått fra å være en astronaut (aktiv, utforskende) til en gjenstand (passiv, tilpasset). Denne utviklingen gjennom teksten viser hvordan det sosiale presset gradvis bryter ned selvbildet hennes.' },
                { text: 'At hun er glad for å ha funnet en plass å sitte', correct: false, feedback: 'Nei, å bli sammenlignet med en "gjenstand" i en skuff er ikke positivt. Det handler om å miste selvstendighet, ikke om lettelse.' },
                { text: 'At klasserommet er rotete og fullt av ting', correct: false, feedback: 'Nei, sammenligningen handler om henne, ikke om rommet. Hun føler seg som en ting som bare fyller en plass.' },
            ],
        },
    },
    {
        id: 'saml-10-2',
        deviceId: 'sammenligning',
        level: 10,
        instruction: 'Sorter etter hva slags sammenligning det er.',
        data: {
            type: 'sort',
            categories: [
                { id: 'enkel', label: 'Enkel sammenligning (ett bilde)' },
                { id: 'utvidet', label: 'Utvidet sammenligning (bildet utvikles)' },
                { id: 'kjedet', label: 'Kjedet sammenligning (flere bilder etter hverandre)' },
            ],
            items: [
                { text: 'Hun var rask som vinden.', categoryId: 'enkel' },
                { text: 'Livet er som et sjakkspill - noen ganger må du ofre en brikke for å vinne partiet, og noen ganger tror du at du leder, helt til motstanderen gjør et trekk du aldri så komme.', categoryId: 'utvidet' },
                { text: 'Latteren hans var som torden, smilet som lyn, og stemningen etterpå som stille etter et uvær.', categoryId: 'kjedet' },
                { text: 'Øynene var blanke som glass.', categoryId: 'enkel' },
                { text: 'Frykten var som et frø som sakte spirte i brystet, slo røtter rundt hjertet og til slutt blomstret til full panikk.', categoryId: 'utvidet' },
                { text: 'Stemmen var myk som silke, ordene skarpe som kniver, og stillheten etterpå tung som bly.', categoryId: 'kjedet' },
            ],
        },
    },
    {
        id: 'saml-10-3',
        deviceId: 'sammenligning',
        level: 10,
        instruction: 'Skriv et kort avsnitt (2-3 setninger) som bruker en utvidet sammenligning.',
        data: {
            type: 'write',
            prompt: 'Beskriv hvordan det føles å ha en hemmelighet du ikke kan fortelle noen. Bruk en utvidet sammenligning - det vil si at du velger ett bilde og utvikler det gjennom hele avsnittet.',
            hint: 'Velg ett bilde: kanskje en bombe med lunte, et dyr i bur, en ballong som fylles med luft? Bruk det bildet gjennom hele avsnittet slik at det vokser.',
            exampleAnswer: 'Hemmeligheten lå i brystet som en fugl i et bur. For hver dag som gikk, slo den hardere med vingene, og det ble vanskeligere å holde døren igjen. Noen ganger kunne hun nesten føle fjærene kile i halsen, som om sannheten ville fly rett ut av munnen hennes.',
        },
    },
];
