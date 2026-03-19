import type { Exercise } from '../types';

export const symbolExercises: Exercise[] = [
    // === NIVÅ 1 ===
    {
        id: 'symbol-1-1',
        deviceId: 'symbol',
        level: 1,
        instruction: 'Hvilket virkemiddel er brukt?',
        data: {
            type: 'identify',
            text: 'Hun klemte det gamle fotografiet og la det forsiktig tilbake i skuffen.',
            options: [
                { deviceId: 'symbol', label: 'Symbol', correct: true, feedback: 'Riktig! Fotografiet er et symbol for minner og det som har vært.' },
                { deviceId: 'metafor', label: 'Metafor', correct: false, feedback: 'Nei, fotografiet er en virkelig gjenstand som representerer noe mer.' },
                { deviceId: 'frampek', label: 'Frampek', correct: false, feedback: 'Nei, dette handler om fortiden, ikke om noe som skal skje.' },
                { deviceId: 'kontrast', label: 'Kontrast', correct: false, feedback: 'Nei, her er det ingen tydelige motsetninger.' },
            ],
        },
    },
    {
        id: 'symbol-1-2',
        deviceId: 'symbol',
        level: 1,
        instruction: 'Marker symbolet i setningen.',
        data: {
            type: 'highlight',
            text: 'Den tomme stolen ved bordet minnet dem alle om bestefar.',
            correctRanges: [
                { words: 'Den tomme stolen', explanation: 'Den tomme stolen er et symbol for tapet av bestefar. Stolen er tom fordi han ikke lenger er der.' },
            ],
        },
    },
    {
        id: 'symbol-1-3',
        deviceId: 'symbol',
        level: 1,
        instruction: 'Hvilket virkemiddel er mest fremtredende?',
        data: {
            type: 'identify',
            text: 'Han ga henne en nøkkelen til huset. Det var mer enn bare metall.',
            options: [
                { deviceId: 'symbol', label: 'Symbol', correct: true, feedback: 'Riktig! Nøkkelen er et symbol for tillit og tilhørighet. "Mer enn bare metall" bekrefter den symbolske betydningen.' },
                { deviceId: 'sammenligning', label: 'Sammenligning', correct: false, feedback: 'Nei, det er ingen sammenligning med "som" eller "lik" her.' },
                { deviceId: 'ironi', label: 'Ironi', correct: false, feedback: 'Nei, dette er oppriktig ment, ikke ironisk.' },
                { deviceId: 'besjeling', label: 'Besjeling', correct: false, feedback: 'Nei, nøkkelen får ikke følelser eller liv her.' },
            ],
        },
    },

    // === NIVÅ 2 ===
    {
        id: 'symbol-2-1',
        deviceId: 'symbol',
        level: 2,
        instruction: 'Hva kan dette symbolet bety?',
        data: {
            type: 'explain',
            text: 'Fuglen satt i buret og sang. Hver morgen åpnet hun vinduet, men lot aldri dora til buret stå åpen.',
            highlightedWords: 'Fuglen satt i buret',
            question: 'Hva kan fuglen i buret symbolisere?',
            options: [
                { text: 'Noen som er fanget i en situasjon og lengter etter frihet', correct: true, feedback: 'Riktig! Fuglen i buret er et klassisk symbol for ufrihet. At hun åpner vinduet men ikke buret viser at friheten er nær, men utilgjengelig.' },
                { text: 'At hun liker fugler som kjæledyr', correct: false, feedback: 'Teksten antyder noe dypere enn bare et kjæledyr. Detaljen om vinduet er viktig.' },
                { text: 'At det er vår og fuglene synger', correct: false, feedback: 'Nei, at fuglen sitter i bur er det sentrale - det er et bilde på ufrihet.' },
            ],
        },
    },
    {
        id: 'symbol-2-2',
        deviceId: 'symbol',
        level: 2,
        instruction: 'Marker symbolet i teksten.',
        data: {
            type: 'highlight',
            text: 'Etter begravelsen plantet de et lite tre i hagen. Hvert år ble det litt høyere, og hun følte at noe av ham fortsatt vokste.',
            correctRanges: [
                { words: 'et lite tre', explanation: 'Treet er et symbol for liv, vekst og minne. At det vokser hvert år symboliserer at minnet lever videre.' },
            ],
        },
    },
    {
        id: 'symbol-2-3',
        deviceId: 'symbol',
        level: 2,
        instruction: 'Hva kan dette symbolet bety?',
        data: {
            type: 'explain',
            text: 'De hadde bygd en bro over elven mellom de to landsbyene. Nå var den rast sammen.',
            highlightedWords: 'broen',
            question: 'Hva kan den sammenraste broen symbolisere?',
            options: [
                { text: 'Et oDelagt forhold eller forbindelse mellom to grupper', correct: true, feedback: 'Riktig! Broen symboliserer forbindelse. At den har rast sammen viser at forbindelsen er brutt.' },
                { text: 'At de trenger å bygge en ny bro av bedre materialer', correct: false, feedback: 'Det er den bokstavelige tolkningen. Tenk dypere - hva kan en bro mellom to steder bety billedlig?' },
                { text: 'At det har vært en naturkatastrofe', correct: false, feedback: 'Teksten fokuserer på symbolikken, ikke på årsaken til sammenbruddet.' },
            ],
        },
    },

    // === NIVÅ 3 ===
    {
        id: 'symbol-3-1',
        deviceId: 'symbol',
        level: 3,
        instruction: 'Marker symbolet. Her er det flere virkemidler - finn bare symbolet!',
        data: {
            type: 'highlight',
            text: 'Klokken på veggen tikket og tikket. Viserne krøp fremover som trette bein. Hun stirret på den og visste at tiden holdt på å renne ut.',
            correctRanges: [
                { words: 'Klokken', explanation: 'Klokken er symbolet - den representerer tiden som renner ut, kanskje et liv som nærmer seg slutten. (Merk: "tikket og tikket" er gjentakelse, "som trette bein" er sammenligning.)' },
            ],
        },
    },
    {
        id: 'symbol-3-2',
        deviceId: 'symbol',
        level: 3,
        instruction: 'Koble hvert eksempel med riktig virkemiddel.',
        data: {
            type: 'match',
            pairs: [
                { example: 'Den rode rosen lå på graven.', label: 'Symbol' },
                { example: 'Rosen gråt i morgenduggen.', label: 'Besjeling' },
                { example: 'Kinnet hennes var rodt som en rose.', label: 'Sammenligning' },
                { example: 'Kinnet hennes var en rose.', label: 'Metafor' },
            ],
        },
    },
    {
        id: 'symbol-3-3',
        deviceId: 'symbol',
        level: 3,
        instruction: 'Hva symboliserer dette? Tenk nøye!',
        data: {
            type: 'explain',
            text: 'Det gamle fyrtårnet hadde ikke lyst på årevis. Stormer hadde slått mot det, men det sto fortsatt. En kveld tente noen lyset igjen.',
            highlightedWords: 'fyrtårnet',
            question: 'Hva kan fyrtårnet symbolisere i denne teksten?',
            options: [
                { text: 'Håp som gjenoppstår etter en lang mørk periode - noe som har tålt motgang og endelig får ny mening', correct: true, feedback: 'Riktig! Fyrtårnet symboliserer håp og veiledning. At det har overlevd stormer viser utholdenhet. At lyset tennes igjen symboliserer at håpet vender tilbake.' },
                { text: 'At noen endelig fikset det elektriske anlegget', correct: false, feedback: 'Det er den bokstavelige tolkningen. Et fyrtårn som lyser i mørket er et sterkt symbol - hva representerer lys i mørke?' },
                { text: 'At det snart blir storm igjen', correct: false, feedback: 'Nei, fokuset er på at lyset tennes igjen - det er et positivt vendepunkt.' },
            ],
        },
    },

    // === NIVÅ 4 (Skribent) ===
    {
        id: 'symbol-4-1',
        deviceId: 'symbol',
        level: 4,
        instruction: 'Skriv en kort tekst der du bruker et symbol.',
        data: {
            type: 'write',
            prompt: 'Skriv 2-3 setninger der du bruker en gjenstand som symbol for ensomhet. Gjenstanden skal være konkret og hverdagslig.',
            hint: 'Tenk på noe som kan stå alene, noe tomt, eller noe som mangler noen.',
            exampleAnswer: 'Den ene hanskene lå igjen på bussen. Ingen kom tilbake for å hente den. Dag etter dag ble den liggende der, mer og mer skitten, mens alle gikk forbi uten å se den.',
        },
    },
    {
        id: 'symbol-4-2',
        deviceId: 'symbol',
        level: 4,
        instruction: 'Fyll inn det manglende symbolet.',
        data: {
            type: 'fill-blank',
            textBefore: 'Etter at hun flyttet ut, ble ',
            textAfter: ' stående urørt på nattbordet. Støvet la seg tykt over det, men han klarte aldri å flytte det.',
            correctAnswers: ['fotografiet', 'bildet', 'ringen', 'boken', 'koppen'],
            acceptKeywords: ['foto', 'bilde', 'ring', 'bok', 'kopp', 'brev', 'klokke', 'smykke', 'armbånd', 'halskjede'],
            hint: 'Tenk på en gjenstand som kan bære minner om henne. Hva ble stående på nattbordet?',
            explanation: 'Her trengs en konkret gjenstand som kan symbolisere henne og forholdet de hadde. Fotografiet, ringen eller lignende gjenstander bærer minner og tilknytning.',
        },
    },
    {
        id: 'symbol-4-3',
        deviceId: 'symbol',
        level: 4,
        instruction: 'Skriv en tekst med et symbol for håp.',
        data: {
            type: 'write',
            prompt: 'Lag en liten scene (2-4 setninger) der en karakter opplever noe vanskelig, men der et symbol for håp dukker opp. Symbolet skal være noe fra naturen.',
            hint: 'Lys, spirer, fugler, regnbue - naturen er full av ting som kan symbolisere håp.',
            exampleAnswer: 'Regnet hadde øst ned i dagevis. Hagen var bare gjørme og knekte greiner. Men da hun åpnet døren den morgenen, stakk en liten grønn spire opp gjennom asfalten i innkjørselen.',
        },
    },

    // === NIVÅ 5 (Detektiv) ===
    {
        id: 'symbol-5-1',
        deviceId: 'symbol',
        level: 5,
        instruction: 'Finn feilen i forklaringen av symbolet.',
        data: {
            type: 'find-error',
            text: 'Han knuste speilet med knyttneven. Glassbitene lå utover gulvet som et puslespill ingen kunne legge igjen.',
            errorDescription: 'En elev har skrevet en analyse av dette symbolet. Hvilken forklaring er feil?',
            options: [
                { text: 'Speilet symboliserer selvbildet hans som er knust', correct: false, feedback: 'Denne er riktig! Et knust speil er et klassisk symbol for et ødelagt selvbilde.' },
                { text: 'Glassbitene som et puslespill viser at han prøver å sette seg selv sammen igjen', correct: false, feedback: 'Denne er riktig! Puslespill-sammenligningen forsterker symbolikken om noe som er i biter.' },
                { text: 'Speilet symboliserer at han er forfengelig og bryr seg for mye om utseendet sitt', correct: true, feedback: 'Riktig funnet! Denne tolkningen er feil. At han knuser speilet viser frustrasjon og smerte, ikke forfengelighet. Konteksten peker mot et knust selvbilde, ikke overdreven interesse for utseende.' },
            ],
        },
    },
    {
        id: 'symbol-5-2',
        deviceId: 'symbol',
        level: 5,
        instruction: 'Er dette sant eller usant om symboler?',
        data: {
            type: 'true-false',
            statement: 'Et symbol har alltid bare én fast betydning, uansett hvilken tekst det brukes i.',
            correct: false,
            explanation: 'Usant! Symboler kan ha forskjellige betydninger i ulike tekster. En rose kan symbolisere kjærlighet i en tekst, men skjønnhet som visner i en annen. Konteksten avgjør hva symbolet betyr.',
        },
    },
    {
        id: 'symbol-5-3',
        deviceId: 'symbol',
        level: 5,
        instruction: 'Finn feilen i analysen.',
        data: {
            type: 'find-error',
            text: 'Muren mellom de to hagene hadde stått der i femti år. Ingen hadde noen gang prøvd å klatre over den. En dag la noen en stige inntil den.',
            errorDescription: 'Hvilken tolkning av muren som symbol er feil?',
            options: [
                { text: 'Muren symboliserer en grense eller avstand mellom to mennesker eller grupper', correct: false, feedback: 'Denne er riktig! Murer representerer ofte skiller mellom folk.' },
                { text: 'Stigen symboliserer at noen endelig forsøker å overvinne avstanden', correct: false, feedback: 'Denne er riktig! Stigen gjør det mulig å komme over muren - noen tar initiativ til kontakt.' },
                { text: 'Muren symboliserer trygghet og beskyttelse for begge sider', correct: true, feedback: 'Riktig funnet! Teksten viser muren som noe negativt - et hinder ingen tør å forsere. Konteksten handler om avstand, ikke beskyttelse. Stigen bekrefter at muren er noe som bør overvinnes.' },
            ],
        },
    },

    // === NIVÅ 6 (Analytiker) ===
    {
        id: 'symbol-6-1',
        deviceId: 'symbol',
        level: 6,
        instruction: 'Marker alle symbolene i denne lengre teksten.',
        data: {
            type: 'highlight',
            text: 'Det gamle treet i skolegården hadde sett generasjoner av elever komme og gå. Nå var det bestemt at det skulle hugges. Elevene hadde hengt opp lapper med ønsker på greinene, som om treet kunne oppfylle dem. Den siste dagen gikk rektor ut og bandt et rødt bånd rundt stammen. Dagen etter sto bare stubben igjen.',
            correctRanges: [
                { words: 'Det gamle treet', explanation: 'Treet er hovedsymbolet - det representerer kontinuitet, tradisjoner og fellesskap. At det hugges symboliserer at noe verdifullt og varig forsvinner.' },
                { words: 'lapper med ønsker', explanation: 'Lappene symboliserer elevenes håp og drømmer. At de henger dem på treet viser at de knytter sine håp til noe større enn seg selv.' },
                { words: 'et rødt bånd', explanation: 'Det røde båndet symboliserer respekt og avskjed - en siste hyllest til noe man mister.' },
                { words: 'stubben', explanation: 'Stubben er symbolet for det som er igjen etter tapet - et sår i landskapet som minner om det som var.' },
            ],
        },
    },
    {
        id: 'symbol-6-2',
        deviceId: 'symbol',
        level: 6,
        instruction: 'Analyser dette symbolets betydning i teksten.',
        data: {
            type: 'explain',
            text: 'Kompasset hadde tilhørt oldefaren hans, mannen som krysset havet fra Irland til Norge med ingenting annet enn en koffert og et løfte. Nå lå det i skuffen hjemme hos Emil. Nålen svingte fortsatt, men han visste ikke hvilken retning han selv ville gå. Kvelden før han skulle velge studieretning, tok han det opp og holdt det i hånden lenge.',
            highlightedWords: 'Kompasset',
            question: 'Hva symboliserer kompasset på flere nivåer i denne teksten?',
            options: [
                { text: 'Familiehistorie og arv, men også Emils søken etter retning i livet - kompasset peker bokstavelig en retning, mens Emil trenger å finne sin egen vei', correct: true, feedback: 'Riktig! Kompasset fungerer på flere nivåer: det er arv fra oldefaren (familietilhørighet), et mål for å finne retning (veiledning), og at han tar det opp før valget viser at han søker svar i røttene sine.' },
                { text: 'At Emil liker gamle gjenstander og vil bli antikvitetshandler', correct: false, feedback: 'Det er en svært bokstavelig tolkning. Kompasset betyr noe langt dypere for Emil - les om oldefaren og valget han står foran.' },
                { text: 'At oldefaren var en eventyrer og at Emil drømmer om å reise til Irland', correct: false, feedback: 'Teksten handler ikke om reiselyst, men om å finne retning i livet. Kompasset er et symbol, ikke et praktisk redskap.' },
            ],
        },
    },
    {
        id: 'symbol-6-3',
        deviceId: 'symbol',
        level: 6,
        instruction: 'Marker symbolene i denne teksten. Ikke la deg lure av andre virkemidler!',
        data: {
            type: 'highlight',
            text: 'Fyret blinket gjennom tåken som en puls. Rundt det knuste bølgene mot klippene, igjen og igjen, uten å gi seg. Inne i fyrtårnet tente vokteren den samme flammen hver kveld, selv om ingen skip hadde seilt forbi på årevis. Han sa det var hans plikt. Andre sa det var galskap.',
            correctRanges: [
                { words: 'Fyret', explanation: 'Fyret symboliserer veiledning, håp og trofasthet. Det lyser selv når det virker meningsløst.' },
                { words: 'flammen', explanation: 'Flammen symboliserer utholdenhet og pliktfølelse - den holdes i live mot alle odds.' },
            ],
        },
    },

    // === NIVÅ 7 (Kritiker) ===
    {
        id: 'symbol-7-1',
        deviceId: 'symbol',
        level: 7,
        instruction: 'Koble hvert symbol med den dypeste tolkningen.',
        data: {
            type: 'match',
            pairs: [
                { example: 'Den lukkede døren i enden av gangen', label: 'Ukjente muligheter eller stengte sjanser' },
                { example: 'Klokken som hadde stoppet klokken 15:42', label: 'Et bestemt øyeblikk som forandret alt' },
                { example: 'Det vissne blomsterbedet foran huset', label: 'Noe som en gang var vakkert, men som ingen tar vare på lenger' },
                { example: 'Ankeret som lå i hagen som pynt', label: 'Tilhørighet og forankring til et sted' },
            ],
        },
    },
    {
        id: 'symbol-7-2',
        deviceId: 'symbol',
        level: 7,
        instruction: 'Sorter eksemplene etter om de er symboler eller andre virkemidler.',
        data: {
            type: 'sort',
            categories: [
                { id: 'symbol', label: 'Symbol' },
                { id: 'annet', label: 'Andre virkemidler' },
            ],
            items: [
                { text: 'Den enslige lykten brant i mørket.', categoryId: 'symbol' },
                { text: 'Natten la seg som et teppe over byen.', categoryId: 'annet' },
                { text: 'Han tok av seg ringen og la den på bordet mellom dem.', categoryId: 'symbol' },
                { text: 'Trærne danset i vinden.', categoryId: 'annet' },
                { text: 'Ruinene av barndomshjemmet sto der fortsatt.', categoryId: 'symbol' },
                { text: 'Han var sterk som en okse.', categoryId: 'annet' },
            ],
        },
    },
    {
        id: 'symbol-7-3',
        deviceId: 'symbol',
        level: 7,
        instruction: 'Er denne påstanden om symbolbruk riktig?',
        data: {
            type: 'true-false',
            statement: 'For at noe skal fungere som et symbol i en tekst, må forfatteren alltid forklare hva symbolet betyr direkte i teksten.',
            correct: false,
            explanation: 'Usant! Gode symboler forklares sjelden direkte. Styrken til et symbol er at leseren selv forstår den dypere betydningen gjennom konteksten. Hvis forfatteren skriver "stolen var tom, som et symbol på ensomhet", ødelegger det den litterære effekten. Leseren skal oppdage symbolikken selv.',
        },
    },

    // === NIVÅ 8 (Sorteringsekspert) ===
    {
        id: 'symbol-8-1',
        deviceId: 'symbol',
        level: 8,
        instruction: 'Sorter symbolene etter hva de vanligvis representerer.',
        data: {
            type: 'sort',
            categories: [
                { id: 'frihet', label: 'Frihet og lengsel' },
                { id: 'tid', label: 'Tid og forgjengelighet' },
                { id: 'makt', label: 'Makt og kontroll' },
            ],
            items: [
                { text: 'En fugl som flyr ut av et åpent vindu', categoryId: 'frihet' },
                { text: 'Et vissent blad som faller fra treet', categoryId: 'tid' },
                { text: 'En trone av stein i et tomt rom', categoryId: 'makt' },
                { text: 'Et skip som seiler mot horisonten', categoryId: 'frihet' },
                { text: 'Et timeglass der sanden nesten har rent ut', categoryId: 'tid' },
                { text: 'En nøkkel som henger i en lenke rundt halsen', categoryId: 'makt' },
                { text: 'En vei som forsvinner bak horisonten', categoryId: 'frihet' },
                { text: 'Et fotografi som falmer i sollyset', categoryId: 'tid' },
                { text: 'Et gjerde med piggtråd rundt en hage', categoryId: 'makt' },
            ],
        },
    },
    {
        id: 'symbol-8-2',
        deviceId: 'symbol',
        level: 8,
        instruction: 'Koble symbolet med den riktige funksjonen det har i teksten.',
        data: {
            type: 'match',
            pairs: [
                { example: 'I begynnelsen av romanen planter hovedpersonen et tre. På siste side hugger hun det ned.', label: 'Symbolet viser en indre forandring hos karakteren' },
                { example: 'Det røde lyset ved døren blinker gjennom hele kapittelet.', label: 'Symbolet skaper stemning og uro' },
                { example: 'Broen mellom de to bydelene dukker opp i hver eneste novelle av denne forfatteren.', label: 'Symbolet er et gjennomgående motiv i forfatterens verk' },
                { example: 'Hun gir ham kompasset i det han drar. Han gir det tilbake når han kommer hjem.', label: 'Symbolet knytter to scener sammen og viser utvikling' },
            ],
        },
    },
    {
        id: 'symbol-8-3',
        deviceId: 'symbol',
        level: 8,
        instruction: 'Sorter etter hvor tydelig symbolikken er.',
        data: {
            type: 'sort',
            categories: [
                { id: 'tydelig', label: 'Tydelig symbolikk' },
                { id: 'subtil', label: 'Subtil symbolikk' },
            ],
            items: [
                { text: 'Duen fløy opp fra slagmarken med en olivengren i nebbet.', categoryId: 'tydelig' },
                { text: 'Han la alltid igjen den ene stolen tom ved middagsbordet.', categoryId: 'subtil' },
                { text: 'Lenkene falt av henne i det hun gikk ut porten.', categoryId: 'tydelig' },
                { text: 'Kranen i kjøkkenet dryppet hele natten.', categoryId: 'subtil' },
                { text: 'En hvit due landet på vinduskarmen akkurat da hun fikk beskjeden.', categoryId: 'tydelig' },
                { text: 'Gardinene var trukket for, som alltid.', categoryId: 'subtil' },
            ],
        },
    },

    // === NIVÅ 9 (Mester) ===
    {
        id: 'symbol-9-1',
        deviceId: 'symbol',
        level: 9,
        instruction: 'Skriv en tekst der den samme gjenstanden brukes som symbol to ganger, men med ulik betydning.',
        data: {
            type: 'write',
            prompt: 'Skriv en kort tekst (3-5 setninger) der en nøkkel dukker opp to ganger. Første gang skal nøkkelen symbolisere noe positivt (for eksempel tillit eller muligheter), og andre gang noe negativt (for eksempel fangenskap eller hemmeligheter). Vis at det samme symbolet kan skifte betydning.',
            hint: 'Tenk på en nøkkel som åpner i den ene scenen, men låser i den andre.',
            exampleAnswer: 'Da hun var liten, ga bestemoren henne nøkkelen til det hemmelige rommet i kjelleren. Det var der eventyrene bodde, mellom gamle bøker og støvete skatter. Tjue år senere holdt hun en annen nøkkel - til kontoret der hun jobbet tolv timer om dagen. Denne nøkkelen åpnet ingenting. Den bare låste henne inne.',
        },
    },
    {
        id: 'symbol-9-2',
        deviceId: 'symbol',
        level: 9,
        instruction: 'Analyser dette symbolets rolle i teksten.',
        data: {
            type: 'explain',
            text: 'Veggklokken i stuen hadde sluttet å tikke den dagen bestefar døde. Ingen fikset den. Mamma sa det var fordi ingen fant batterier, men alle visste det ikke handlet om batterier. Arene gikk. En dag kom lillebror hjem fra skolen med et prosjekt om tid. Han tok ned klokken, satte inn nye batterier, og den begynte å tikke igjen. Mamma gråt. Men det var den gode graten.',
            highlightedWords: 'Veggklokken',
            question: 'Analyser hvordan klokken fungerer som symbol gjennom hele denne teksten.',
            options: [
                { text: 'Klokken symboliserer familiens sorgprosess: den stopper når bestefar dør (livet stopper opp av sorg), ingen fikser den (de tør ikke slippe taket), og når lillebror starter den igjen representerer det at familien er klar til å gå videre uten å glemme', correct: true, feedback: 'Utmerket analyse! Du ser hvordan symbolet utvikler seg gjennom teksten. Mammas unnskyldning om batterier viser fornektelse. At det er lillebror - den yngste, mest uskyldige - som starter klokken, er også meningsfullt: nye generasjoner hjelper oss videre.' },
                { text: 'Klokken symboliserer bare at bestefar er død, og at de savner ham', correct: false, feedback: 'Det er en start, men symbolet har flere lag. Hva betyr det at den starter igjen? Og hvorfor gråter mamma den "gode gråten"? Symbolet utvikler seg gjennom teksten.' },
                { text: 'Klokken symboliserer at tiden har stoppet i huset og at de lever i fortiden', correct: false, feedback: 'Delvis riktig, men du overser den viktigste delen: klokken starter igjen. Hva symboliserer det? Symbolet har en utvikling du må følge helt til slutten.' },
            ],
        },
    },
    {
        id: 'symbol-9-3',
        deviceId: 'symbol',
        level: 9,
        instruction: 'Er denne påstanden riktig? Tenk kritisk!',
        data: {
            type: 'true-false',
            statement: 'Hvis en gjenstand dukker opp i en tekst, men forfatteren ikke bruker den til å si noe dypere enn det bokstavelige, er gjenstanden likevel et symbol bare fordi den er nevnt.',
            correct: false,
            explanation: 'Usant! Ikke alle gjenstander i en tekst er symboler. En stol er bare en stol hvis den bare brukes til å sitte på. Den blir et symbol først når konteksten gir den en dypere mening - for eksempel en tom stol der noen pleide å sitte. Det er forfatterens bruk av gjenstanden i sammenhengen som skaper symbolikken.',
        },
    },

    // === NIVÅ 10 (Magister) ===
    {
        id: 'symbol-10-1',
        deviceId: 'symbol',
        level: 10,
        instruction: 'Marker alle symbolene i denne sammensatte teksten og vurder hva de betyr.',
        data: {
            type: 'highlight',
            text: 'Huset ved havet hadde en gang vært hvitt. Nå var malingen flasset av som gammel hud. I vinduet hang fortsatt gardinene bestemor hadde sydd, gulnet av sol og tid. Ute på bryggekanten lå det en gammel robåt med bunnen full av regnvann. Fortøyningen var råtten, men den holdt ennå. Innerst i huset, på det minste rommet, hadde noen tent et stearinlys. Flammen flakket i trekken, men sluknet ikke.',
            correctRanges: [
                { words: 'Huset', explanation: 'Huset symboliserer familien eller slekten - en gang stolt og velholdt, nå preget av tidens tann. Det forfaller, men står ennå.' },
                { words: 'gardinene bestemor hadde sydd', explanation: 'Gardinene symboliserer arv og tradisjoner som henger igjen selv om de er falmet - verdier som overlever, men endres over tid.' },
                { words: 'en gammel robåt', explanation: 'Robåten symboliserer muligheten til å reise, komme seg videre - men den er full av regnvann og ikke i bruk. Mulighetene er der, men ingen griper dem.' },
                { words: 'Fortøyningen', explanation: 'Den råtne fortøyningen symboliserer de svake båndene som holder ting på plass - snart ryker de, og da driver alt fra hverandre.' },
                { words: 'et stearinlys', explanation: 'Stearinlyset symboliserer håp eller vilje til å holde noe i live. At flammen flakker men ikke slukner viser at noe kjemper for å overleve.' },
            ],
        },
    },
    {
        id: 'symbol-10-2',
        deviceId: 'symbol',
        level: 10,
        instruction: 'Skriv en tekst der gjenstander forteller en hel historie uten at du forklarer følelsene direkte.',
        data: {
            type: 'write',
            prompt: 'Skriv en kort tekst (4-6 setninger) om et rom der noen nettopp har flyttet ut. Bruk minst tre ulike symbolske gjenstander til å vise hva som har skjedd og hva personene føler. Du skal aldri skrive følelsesord som "trist", "lei seg" eller "ensom" - la gjenstandene fortelle alt.',
            hint: 'Hva ligger igjen? Hva er borte? Hva har endret seg i rommet? Hver gjenstand du nevner bør si noe om forholdet eller personen som har dratt.',
            exampleAnswer: 'Hylla var halvtom. Hennes bøker var borte, hans sto igjen med skjeve rygger som lente seg mot tomrommet. På veggen var det et lyst rektangel der bildet av dem to hadde hengt. Plantene på vinduskarmen hadde ikke fått vann på en uke. Ved døren lå en nøkkel på gulvet, rett under brevsprekken.',
        },
    },
    {
        id: 'symbol-10-3',
        deviceId: 'symbol',
        level: 10,
        instruction: 'Koble teksten med den mest presise analysen av symbolbruken.',
        data: {
            type: 'match',
            pairs: [
                { example: 'Broen var bygd av tre, ikke stein. Den ville ikke vare evig, og det visste de begge. Men de gikk over den likevel, hånd i hånd.', label: 'Symbolet viser noe skjørt og midlertidig som likevel er verdt å satse på' },
                { example: 'Speilet i gangen var dekket med et klede. Hun hadde gjort det den dagen hun sluttet å kjenne seg selv igjen.', label: 'Symbolet viser en karakter som unngår å konfrontere sin egen identitet' },
                { example: 'Skipet lå på tørt land, langt fra vannet. Rundt det hadde det vokst opp trær og busker. Det ville aldri seile igjen, men fuglene hadde bygd reir i masten.', label: 'Symbolet viser at noe kan få ny mening selv når den opprinnelige funksjonen er borte' },
                { example: 'Hvert år malte han stakittgjerdet hvitt igjen. Det var det eneste han kunne kontrollere.', label: 'Symbolet viser et behov for orden og kontroll i et kaotisk liv' },
            ],
        },
    },
];
