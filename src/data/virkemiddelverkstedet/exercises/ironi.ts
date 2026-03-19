import type { Exercise } from '../types';

export const ironiExercises: Exercise[] = [
    // === NIVÅ 1 ===
    {
        id: 'iron-1-1',
        deviceId: 'ironi',
        level: 1,
        instruction: 'Hvilket virkemiddel er brukt?',
        data: {
            type: 'identify',
            text: '"For et nydelig vær," sa han mens haglene slo mot vinduet.',
            options: [
                { deviceId: 'ironi', label: 'Ironi', correct: true, feedback: 'Riktig! Han sier det motsatte av det han mener. Hagl er ikke "nydelig vær".' },
                { deviceId: 'kontrast', label: 'Kontrast', correct: false, feedback: 'Det er en kontrast mellom ord og virkelighet, men det spesifikke virkemiddelet er ironi.' },
                { deviceId: 'metafor', label: 'Metafor', correct: false, feedback: 'Nei, han kaller ikke noe for noe annet. Han sier det motsatte av det han mener.' },
                { deviceId: 'besjeling', label: 'Besjeling', correct: false, feedback: 'Nei, ingen livløse ting får følelser her.' },
            ],
        },
    },
    {
        id: 'iron-1-2',
        deviceId: 'ironi',
        level: 1,
        instruction: 'Hvilket virkemiddel er brukt?',
        data: {
            type: 'identify',
            text: 'Svommelæreren druknet.',
            options: [
                { deviceId: 'ironi', label: 'Ironi', correct: true, feedback: 'Riktig! Situasjonsironi: Den som skal være best til å svømme, drukner. Det motsatte av det man forventer.' },
                { deviceId: 'frampek', label: 'Frampek', correct: false, feedback: 'Nei, det pekes ikke fremover. Det ironiske er at resultatet er det motsatte av forventningen.' },
                { deviceId: 'symbol', label: 'Symbol', correct: false, feedback: 'Nei, dette er bokstavelig - det er ironien i situasjonen som er virkemiddelet.' },
                { deviceId: 'gjentakelse', label: 'Gjentakelse', correct: false, feedback: 'Nei, ingenting gjentas her.' },
            ],
        },
    },
    {
        id: 'iron-1-3',
        deviceId: 'ironi',
        level: 1,
        instruction: 'Marker det ironiske utsagnet.',
        data: {
            type: 'highlight',
            text: '"Så hyggelig å treffe deg," sa hun med iskaldt blikk og snudde seg vekk.',
            correctRanges: [
                { words: 'Så hyggelig å treffe deg', explanation: 'Hun sier det er hyggelig, men blikket og handlingen viser det motsatte. Verbal ironi!' },
            ],
        },
    },
    {
        id: 'iron-1-4',
        deviceId: 'ironi',
        level: 1,
        instruction: 'Marker ironien.',
        data: {
            type: 'highlight',
            text: '"Å, dette var jo lett," stønnet han over den umulige matteoppgaven.',
            correctRanges: [
                { words: 'dette var jo lett', explanation: 'Han sier det var lett mens han stønner over at det er umulig. Han mener det motsatte.' },
            ],
        },
    },

    // === NIVÅ 2 ===
    {
        id: 'iron-2-1',
        deviceId: 'ironi',
        level: 2,
        instruction: 'Hva gjør dette ironisk?',
        data: {
            type: 'explain',
            text: 'Politistasjonen ble ranet.',
            highlightedWords: 'Politistasjonen ble ranet',
            question: 'Hvorfor er dette situasjonsironi?',
            options: [
                { text: 'Det stedet som skal beskytte mot ran, blir selv ranet - det motsatte av det man forventer', correct: true, feedback: 'Riktig! Politiet skal forhindre ran, men her er de offeret. Det er klassisk situasjonsironi.' },
                { text: 'Fordi politiet er dumme', correct: false, feedback: 'Nei, ironi handler ikke om intelligens, men om at resultatet er det motsatte av forventningen.' },
                { text: 'Fordi det er ulovlig', correct: false, feedback: 'Ran er alltid ulovlig. Ironien ligger i at det skjer akkurat der det ikke burde skje.' },
            ],
        },
    },
    {
        id: 'iron-2-2',
        deviceId: 'ironi',
        level: 2,
        instruction: 'Hvilket virkemiddel er mest fremtredende?',
        data: {
            type: 'identify',
            text: 'Han brukte hele livet på å spare penger til pensjonisttilværelsen. Han døde dagen før han ble pensjonist.',
            options: [
                { deviceId: 'ironi', label: 'Ironi', correct: true, feedback: 'Riktig! Situasjonsironi: Han sparte hele livet for noe han aldri fikk oppleve. Tragisk og ironisk.' },
                { deviceId: 'kontrast', label: 'Kontrast', correct: false, feedback: 'Det er en kontrast, men det spesifikke virkemiddelet er ironi - resultatet er det motsatte av planen.' },
                { deviceId: 'frampek', label: 'Frampek', correct: false, feedback: 'Nei, vi får vite utfallet direkte. Det er ikke et hint, men en ironisk vri.' },
                { deviceId: 'tilbakeblikk', label: 'Tilbakeblikk', correct: false, feedback: 'Hele livet oppsummeres, men det er ikke et tilbakeblikk som virkemiddel - det er ironi.' },
            ],
        },
    },
    {
        id: 'iron-2-3',
        deviceId: 'ironi',
        level: 2,
        instruction: 'Marker det ironiske i teksten.',
        data: {
            type: 'highlight',
            text: 'Hele klassen hadde øvd i ukevis. "Vi er jo så godt forberedt," sa læreren. De tapte 12-0.',
            correctRanges: [
                { words: 'Vi er jo så godt forberedt', explanation: '"Godt forberedt" blir ironisk når vi får vite at de tapte 12-0. Ordene betyr det motsatte i lys av resultatet.' },
            ],
        },
    },

    // === NIVÅ 3 ===
    {
        id: 'iron-3-1',
        deviceId: 'ironi',
        level: 3,
        instruction: 'Hvorfor er dette ironisk? Tenk dypere!',
        data: {
            type: 'explain',
            text: 'Han ga henne en bok om hvordan man lytter til andre. "Takk, men jeg trenger ikke den," sa hun uten å høre hva han sa.',
            highlightedWords: 'jeg trenger ikke den',
            question: 'Hva gjør denne situasjonen dobbelt ironisk?',
            options: [
                { text: 'Hun avviser en bok om lytting nettopp fordi hun ikke lytter - hun beviser bokens poeng ved å avvise den', correct: true, feedback: 'Riktig! Dobbel ironi: 1) Hun sier hun ikke trenger boken. 2) Hun beviser at hun trenger den ved å ikke lytte. Handlingen motbeviser ordene.' },
                { text: 'At boken var dyr', correct: false, feedback: 'Prisen er irrelevant. Ironien ligger i at hun demonstrerer behovet for boken ved å avvise den.' },
                { text: 'At hun ikke liker å lese', correct: false, feedback: 'Det handler ikke om lesing, men om lytting - hun hører ikke engang hva han sier.' },
            ],
        },
    },
    {
        id: 'iron-3-2',
        deviceId: 'ironi',
        level: 3,
        instruction: 'Koble hvert eksempel med riktig virkemiddel.',
        data: {
            type: 'match',
            pairs: [
                { example: '"For en fantastisk konsert," sa hun mens hun holdt seg for orene.', label: 'Ironi' },
                { example: 'Utenfor var det sommer. Innenfor var det vinter i sjelen hans.', label: 'Kontrast' },
                { example: 'Hjertet hans var en stein.', label: 'Metafor' },
                { example: 'Lite visste hun at brevet ville forandre alt.', label: 'Frampek' },
            ],
        },
    },
    {
        id: 'iron-3-3',
        deviceId: 'ironi',
        level: 3,
        instruction: 'Marker kun ironien. Her er det andre virkemidler også!',
        data: {
            type: 'highlight',
            text: '"Hvilken fantastisk dag," sa han i det regnet øste ned og vinden rev paraplyen fra hånden hans. Himmelen gråt over dem.',
            correctRanges: [
                { words: 'Hvilken fantastisk dag', explanation: 'Han sier "fantastisk" mens alt er forferdelig. Det er verbal ironi. (Merk: "Himmelen gråt" er besjeling, ikke ironi.)' },
            ],
        },
    },

    // === NIVÅ 4 ===
    {
        id: 'iron-4-1',
        deviceId: 'ironi',
        level: 4,
        instruction: 'Skriv en ironisk setning.',
        data: {
            type: 'write',
            prompt: 'Skriv en setning der en person sier det motsatte av det han eller hun mener. Situasjonen skal gjøre det tydelig at personen er ironisk.',
            hint: 'Tenk på en situasjon der noe går galt, og personen kommenterer det motsatte.',
            exampleAnswer: '"For en fantastisk parkering," sa han til bilen som sto på tvers over to plasser.',
        },
    },
    {
        id: 'iron-4-2',
        deviceId: 'ironi',
        level: 4,
        instruction: 'Fyll inn det ironiske ordet.',
        data: {
            type: 'fill-blank',
            textBefore: '"For en ',
            textAfter: ' dag," sukket hun mens regnet øste ned og bussen kjørte forbi henne.',
            correctAnswers: ['strålende', 'nydelig', 'fantastisk', 'herlig', 'flott', 'vidunderlig'],
            acceptKeywords: ['herlig', 'fantast', 'nydelig', 'strålende', 'perfekt', 'flott', 'deilig', 'super', 'utmerket'],
            hint: 'Si det motsatte av det du mener - det er ironi! Det regner og alt er elendig, men du sier at det er en...?',
            explanation: 'Et positivt ord som "strålende" eller "nydelig" skaper ironi fordi situasjonen er det stikk motsatte - regn og en buss som ikke stopper.',
        },
    },
    {
        id: 'iron-4-3',
        deviceId: 'ironi',
        level: 4,
        instruction: 'Skriv et eksempel på situasjonsironi.',
        data: {
            type: 'write',
            prompt: 'Skriv en kort situasjon der resultatet er det stikk motsatte av det man forventer. Du skal IKKE bruke dialog - bare beskriv hva som skjer.',
            hint: 'Tenk på en person som er ekspert på noe, men som feiler akkurat på det området.',
            exampleAnswer: 'Brannstasjonen brant ned mens alle brannbilene var ute på et falskt varsel.',
        },
    },

    // === NIVÅ 5 ===
    {
        id: 'iron-5-1',
        deviceId: 'ironi',
        level: 5,
        instruction: 'Finn feilen i denne analysen av ironi.',
        data: {
            type: 'find-error',
            text: '"Tusen takk for hjelpen," sa hun sarkastisk etter at han hadde veltet kaffen over oppgaven hennes.',
            errorDescription: 'En elev har analysert denne setningen. Finn feilen i analysen.',
            options: [
                { text: 'Det er ironi fordi hun sier det motsatte av det hun mener - hun er ikke takknemlig i det hele tatt', correct: false, feedback: 'Dette er faktisk en riktig analyse! Hun mener det motsatte av "tusen takk".' },
                { text: 'Det er en metafor fordi hun sammenligner hjelp med det å søle kaffe', correct: true, feedback: 'Riktig, dette er feil! Det er ingen metafor her. Hun bruker ironi ved å si "tusen takk" mens hun mener det stikk motsatte.' },
                { text: 'Det er verbal ironi fordi ordene hennes ikke stemmer med situasjonen', correct: false, feedback: 'Dette er riktig analyse. Verbal ironi er når man sier det motsatte av det man mener.' },
            ],
        },
    },
    {
        id: 'iron-5-2',
        deviceId: 'ironi',
        level: 5,
        instruction: 'Sant eller usant?',
        data: {
            type: 'true-false',
            statement: 'Situasjonsironi krever at noen sier det motsatte av det de mener.',
            correct: false,
            explanation: 'Usant! Situasjonsironi handler om at det som skjer er det motsatte av det man forventer. Ingen trenger å si noe - det er selve situasjonen som er ironisk. Det er verbal ironi som handler om å si det motsatte.',
        },
    },
    {
        id: 'iron-5-3',
        deviceId: 'ironi',
        level: 5,
        instruction: 'Finn feilen i analysen.',
        data: {
            type: 'find-error',
            text: 'Tannlegen hadde selv dårlige tenner.',
            errorDescription: 'En elev har skrevet tre påstander om denne setningen. Hvilken er feil?',
            options: [
                { text: 'Det er situasjonsironi fordi en tannlege burde ha perfekte tenner', correct: false, feedback: 'Riktig analyse! Man forventer at en tannlege tar vare på tennene sine.' },
                { text: 'Det er verbal ironi fordi forfatteren sier det motsatte av det han mener', correct: true, feedback: 'Riktig, dette er feil! Ingen sier noe ironisk her. Det er situasjonsironi - det uventede er at tannlegen har dårlige tenner.' },
                { text: 'Ironien ligger i at resultatet er det motsatte av forventningen', correct: false, feedback: 'Riktig analyse! Vi forventer gode tenner hos en tannlege.' },
            ],
        },
    },

    // === NIVÅ 6 ===
    {
        id: 'iron-6-1',
        deviceId: 'ironi',
        level: 6,
        instruction: 'Marker all ironi i denne lengre teksten.',
        data: {
            type: 'highlight',
            text: 'Skolen arrangerte en "Anti-mobbedag". Alle fikk gratis t-skjorter med teksten "Vi inkluderer alle". I lunsjen nektet den populære gjengen å la noen sitte ved bordet deres. "Vi har ikke plass," sa de og lo. Rektor holdt tale om respekt mens han ignorerte eleven som gråt i gangen.',
            correctRanges: [
                { words: 'Vi har ikke plass', explanation: 'Verbal ironi: De sier "ikke plass" på en dag som handler om å inkludere alle. Handlingen motsier hele poenget med dagen.' },
                { words: 'Rektor holdt tale om respekt mens han ignorerte eleven som gråt i gangen', explanation: 'Situasjonsironi: Rektor snakker om respekt, men viser ingen respekt selv. Handlingen er det motsatte av ordene.' },
            ],
        },
    },
    {
        id: 'iron-6-2',
        deviceId: 'ironi',
        level: 6,
        instruction: 'Forklar ironien i denne teksten.',
        data: {
            type: 'explain',
            text: 'Kommunen brukte 50 millioner kroner på et nytt "miljøhus" bygget av regnskog-tre. Åpningstalen handlet om hvor viktig det er å redde naturen. Parkeringsplassen utenfor hadde 200 plasser, men ingen sykkelstativ.',
            highlightedWords: 'miljøhus bygget av regnskog-tre',
            question: 'Identifiser alle lagene av ironi i denne teksten.',
            options: [
                { text: 'Tre lag: 1) Miljøhus av regnskog-tre ødelegger miljøet, 2) de snakker om å redde naturen mens de har ødelagt den, 3) 200 bilplasser men ingen sykkelstativ viser at de prioriterer biler over miljø', correct: true, feedback: 'Riktig! Alle tre elementene er ironiske fordi de er det motsatte av hva et miljøhus burde stå for. Handlingene motbeviser ordene fullstendig.' },
                { text: 'Det er ironisk at huset kostet 50 millioner', correct: false, feedback: 'Prisen er ikke ironisk i seg selv. Ironien ligger i motsetningen mellom det de sier og det de faktisk gjør.' },
                { text: 'Det er ironi fordi folk ikke liker å sykle', correct: false, feedback: 'Det handler ikke om hva folk liker. Ironien er at et "miljøhus" gjør det motsatte av å hjelpe miljøet.' },
            ],
        },
    },
    {
        id: 'iron-6-3',
        deviceId: 'ironi',
        level: 6,
        instruction: 'Marker ironien i denne lengre teksten. Vær presis!',
        data: {
            type: 'highlight',
            text: 'Helseministeren sto foran kameraene og fortalte om den nye kampanjen mot røyking. "Vi må beskytte folkets helse," sa han alvorlig. Etter pressekonferansen gikk han bak bygningen og tente en sigarett. Journalisten som filmet ham, la ikke merke til det - han var opptatt med sin egen sigarett.',
            correctRanges: [
                { words: 'Vi må beskytte folkets helse', explanation: 'Verbal ironi sett i lys av handlingene hans etterpå - han røyker selv rett etter å ha snakket mot røyking.' },
                { words: 'gikk han bak bygningen og tente en sigarett', explanation: 'Situasjonsironi: Mannen som kjemper mot røyking, røyker selv. Handlingen er det stikk motsatte av budskapet.' },
                { words: 'Journalisten som filmet ham, la ikke merke til det - han var opptatt med sin egen sigarett', explanation: 'Dobbel ironi: Journalisten som burde avsløre hykleriet, gjør det samme selv.' },
            ],
        },
    },

    // === NIVÅ 7 ===
    {
        id: 'iron-7-1',
        deviceId: 'ironi',
        level: 7,
        instruction: 'Koble hvert eksempel med riktig type ironi.',
        data: {
            type: 'match',
            pairs: [
                { example: '"Å, så morsomt," sa hun med et uttrykksløst ansikt.', label: 'Verbal ironi' },
                { example: 'Svømmeinstruktøren var redd for vann.', label: 'Situasjonsironi' },
                { example: 'Leseren vet at brevet er fra moren, men karakteren tror det er fra en fremmed.', label: 'Dramatisk ironi' },
                { example: '"Fantastisk innsats," sa treneren til laget som tapte 15-0.', label: 'Verbal ironi' },
                { example: 'Tyven installerte alarm i huset sitt.', label: 'Situasjonsironi' },
                { example: 'Publikum vet at morderen gjemmer seg i skapet, men hovedpersonen åpner det likevel.', label: 'Dramatisk ironi' },
            ],
        },
    },
    {
        id: 'iron-7-2',
        deviceId: 'ironi',
        level: 7,
        instruction: 'Sorter eksemplene i riktig kategori.',
        data: {
            type: 'sort',
            categories: [
                { id: 'ironi', label: 'Ironi' },
                { id: 'ikke-ironi', label: 'Ikke ironi' },
            ],
            items: [
                { text: '"For et vakkert maleri," sa hun om den hvite veggen.', categoryId: 'ironi' },
                { text: 'Brannmannen var redd for ild.', categoryId: 'ironi' },
                { text: 'Det regnet hele sommerferien.', categoryId: 'ikke-ironi' },
                { text: 'Legen ble syk.', categoryId: 'ironi' },
                { text: 'Han gikk til butikken og kjøpte melk.', categoryId: 'ikke-ironi' },
                { text: 'Sikkerhetsvakten ble ranet på jobb.', categoryId: 'ironi' },
            ],
        },
    },
    {
        id: 'iron-7-3',
        deviceId: 'ironi',
        level: 7,
        instruction: 'Sant eller usant?',
        data: {
            type: 'true-false',
            statement: 'Dramatisk ironi oppstår når leseren eller publikum vet noe som karakteren i historien ikke vet.',
            correct: true,
            explanation: 'Sant! Dramatisk ironi er når publikum har informasjon som karakterene mangler. For eksempel: Vi vet at morderen er bak døren, men karakteren åpner den likevel. Det skaper spenning og engasjement.',
        },
    },

    // === NIVÅ 8 ===
    {
        id: 'iron-8-1',
        deviceId: 'ironi',
        level: 8,
        instruction: 'Sorter eksemplene etter type ironi.',
        data: {
            type: 'sort',
            categories: [
                { id: 'verbal', label: 'Verbal ironi' },
                { id: 'situasjon', label: 'Situasjonsironi' },
                { id: 'dramatisk', label: 'Dramatisk ironi' },
            ],
            items: [
                { text: '"Herlig stemning," sa han om den stille, tomme festen.', categoryId: 'verbal' },
                { text: 'Sjakkmesteren tapte mot en nybegynner.', categoryId: 'situasjon' },
                { text: 'Vi vet at gaven er fra bestevenninna, men hun tror den er fra en hemmelig beundrer.', categoryId: 'dramatisk' },
                { text: 'Forfatteren av boken "Slik unngår du skrivefeil" hadde tre skrivefeil på forsiden.', categoryId: 'situasjon' },
                { text: '"Takk for den nyttige tilbakemeldingen," sa hun om kommentaren "bra".', categoryId: 'verbal' },
                { text: 'Publikum vet at helten drikker gift, men helten tror det er medisin.', categoryId: 'dramatisk' },
            ],
        },
    },
    {
        id: 'iron-8-2',
        deviceId: 'ironi',
        level: 8,
        instruction: 'Koble ironien med riktig forklaring.',
        data: {
            type: 'match',
            pairs: [
                { example: 'En bokhandel som aldri selger bøker, vinner prisen "Årets butikk".', label: 'Resultatet er det motsatte av det man forventer av en dårlig butikk' },
                { example: '"Så hyggelig av deg å komme," sa hun til gjesten som kom tre timer for sent.', label: 'Ordene uttrykker det motsatte av den faktiske frustrasjonen' },
                { example: 'Leseren vet at brevet inneholder sannheten, men karakteren kaster det uten å lese det.', label: 'Publikum vet noe karakteren ikke vet, noe som skaper frustrasjon' },
                { example: 'Trafikklæreren fikk førerkortet inndratt.', label: 'Eksperten feiler på sitt eget fagfelt' },
            ],
        },
    },
    {
        id: 'iron-8-3',
        deviceId: 'ironi',
        level: 8,
        instruction: 'Sorter påstandene om ironi.',
        data: {
            type: 'sort',
            categories: [
                { id: 'sant', label: 'Sant om ironi' },
                { id: 'usant', label: 'Usant om ironi' },
            ],
            items: [
                { text: 'Ironi handler alltid om å være slem.', categoryId: 'usant' },
                { text: 'Verbal ironi er når man sier det motsatte av det man mener.', categoryId: 'sant' },
                { text: 'Ironi og sarkasme er akkurat det samme.', categoryId: 'usant' },
                { text: 'Situasjonsironi kan være tragisk.', categoryId: 'sant' },
                { text: 'Dramatisk ironi skaper spenning fordi publikum vet mer enn karakterene.', categoryId: 'sant' },
                { text: 'Ironi fungerer bare i morsomme tekster.', categoryId: 'usant' },
            ],
        },
    },

    // === NIVÅ 9 ===
    {
        id: 'iron-9-1',
        deviceId: 'ironi',
        level: 9,
        instruction: 'Skriv en kort tekst som inneholder minst to typer ironi.',
        data: {
            type: 'write',
            prompt: 'Skriv en tekst på 3-5 setninger som inneholder både verbal ironi (noen sier det motsatte av det de mener) og situasjonsironi (noe uventet skjer). Marker gjerne med parentes hvilken type det er.',
            hint: 'Kombiner en ironisk kommentar med en situasjon der resultatet er overraskende.',
            exampleAnswer: '"For en perfekt dag for en piknik," sa han mens haglene trommet på bilpanseret. (Verbal ironi.) Ironisk nok var han meteorologen som hadde meldt strålende sol. (Situasjonsironi.)',
        },
    },
    {
        id: 'iron-9-2',
        deviceId: 'ironi',
        level: 9,
        instruction: 'Marker all ironi i denne teksten og forklar hvilken type det er.',
        data: {
            type: 'highlight',
            text: 'Forfatteren av selvhjelpsboken "Slik mestrer du livet" satt på kontoret og gråt. Boken hadde solgt ti millioner eksemplarer. "Jeg har aldri vært lykkeligere," sa han til terapeuten sin. Terapeuten nikket forstående - hun hadde selv akkurat bestilt boken hans på nett.',
            correctRanges: [
                { words: 'Forfatteren av selvhjelpsboken "Slik mestrer du livet" satt på kontoret og gråt', explanation: 'Situasjonsironi: Han som lærer andre å mestre livet, mestrer ikke sitt eget.' },
                { words: 'Jeg har aldri vært lykkeligere', explanation: 'Verbal ironi: Han sier han er lykkelig mens han gråter hos terapeuten.' },
                { words: 'hun hadde selv akkurat bestilt boken hans på nett', explanation: 'Situasjonsironi: Terapeuten som hjelper ham, tror boken hans kan hjelpe henne. Ingen ser hykleriet.' },
            ],
        },
    },
    {
        id: 'iron-9-3',
        deviceId: 'ironi',
        level: 9,
        instruction: 'Forklar den dype ironien i denne teksten.',
        data: {
            type: 'explain',
            text: 'Skolen forbød mobilbruk for å "fremme kommunikasjon". Elevene sluttet å snakke med hverandre og satt bare og stirret i veggen. Lærerne, som hadde innført forbudet, satt i pauserommet og scrollet på sine egne telefoner.',
            highlightedWords: 'forbød mobilbruk for å "fremme kommunikasjon"',
            question: 'Identifiser og forklar de ulike lagene av ironi.',
            options: [
                { text: 'Tre lag: 1) Forbudet som skulle fremme kommunikasjon førte til mindre kommunikasjon, 2) lærerne som innførte forbudet bryter det selv, 3) "fremme kommunikasjon" i anførselstegn antyder at selv forfatteren tviler på motivet', correct: true, feedback: 'Riktig! Situasjonsironi i at forbudet virker mot sin hensikt, situasjonsironi i at lærerne gjør det de forbyr, og verbal ironi i anførselstegnene som signaliserer tvil.' },
                { text: 'Det er ironisk fordi elevene ikke liker skolen', correct: false, feedback: 'Teksten handler ikke om å like skolen. Ironien ligger i motsetningen mellom intensjon og resultat, og i lærernes hykleri.' },
                { text: 'Det er ironi fordi mobiler er dyre', correct: false, feedback: 'Prisen på mobiler er irrelevant. Ironien handler om at forbudet oppnår det motsatte av målet.' },
            ],
        },
    },

    // === NIVÅ 10 ===
    {
        id: 'iron-10-1',
        deviceId: 'ironi',
        level: 10,
        instruction: 'Skriv en tekst der ironi brukes som samfunnskritikk.',
        data: {
            type: 'write',
            prompt: 'Skriv en kort tekst (4-6 setninger) der du bruker ironi for å kritisere noe i samfunnet. Teksten skal inneholde minst ett eksempel på verbal ironi og ett på situasjonsironi. Forklar kort etter teksten hva du kritiserer og hvordan ironien forsterker budskapet.',
            hint: 'Tenk på noe du synes er urettferdig eller dumt i samfunnet. Bruk ironi for å vise motsetningen mellom hva folk sier og hva de faktisk gjør.',
            exampleAnswer: 'Oljeselskapet lanserte sin nye "grønne strategi" med en fest for 500 gjester. Alle fløy inn med privatfly. "Vi bryr oss virkelig om klimaet," sa direktøren fra scenen mens konfettien drysset ned. Konfettien var forresten laget av plast. (Kritikk av grønnvasking: Selskaper snakker om miljø mens de gjør det motsatte. Verbal ironi i direktørens ord, situasjonsironi i alt fra privatflyene til plastkonfettien.)',
        },
    },
    {
        id: 'iron-10-2',
        deviceId: 'ironi',
        level: 10,
        instruction: 'Marker all ironi og forklar hvordan den virker på flere nivåer.',
        data: {
            type: 'highlight',
            text: 'Juryen kåret boken "Ærlighet varer lengst" til årets beste roman. Forfatteren takket i talen og sa at "hvert eneste ord i boken er fra hjertet mitt." Etter seremonien kom det fram at boken var skrevet av en ghostwriter. Ghostwriteren hadde fått ideen fra en annen bok hun hadde plagiert. Da journalistene konfronterte forfatteren, sa han: "Jeg står for alt jeg har skrevet."',
            correctRanges: [
                { words: 'boken "Ærlighet varer lengst"', explanation: 'Situasjonsironi: En bok om ærlighet vinner en pris, men er basert på løgn og tyveri. Tittelen blir ironisk i lys av sannheten.' },
                { words: 'hvert eneste ord i boken er fra hjertet mitt', explanation: 'Verbal ironi (ufrivillig): Han snakker om ærlighet mens han lyver. Ordene hans er det stikk motsatte av sannheten.' },
                { words: 'Ghostwriteren hadde fått ideen fra en annen bok hun hadde plagiert', explanation: 'Dobbel situasjonsironi: Ikke bare er boken falsk - selv det falske er stjålet. Løgn på løgn.' },
                { words: 'Jeg står for alt jeg har skrevet', explanation: 'Flertydig ironi: Han har teknisk sett ikke skrevet noe, så han "står for" ingenting. Setningen er sann og usann samtidig.' },
            ],
        },
    },
    {
        id: 'iron-10-3',
        deviceId: 'ironi',
        level: 10,
        instruction: 'Analyser denne komplekse ironien.',
        data: {
            type: 'explain',
            text: 'Det er en gammel historie om en mann som bygde et usynkelig skip. Han kalte det "Den usårbare". På jomfruturen seilte han ut i perfekt vær på et rolig hav. Skipet sank fordi han hadde glemt å sette inn bunnpluggen. Mannen overlevde - han ble reddet av en gammel robåt som hadde seilt i femti år uten problemer.',
            highlightedWords: 'Den usårbare',
            question: 'Forklar hvordan ironien i denne teksten fungerer på flere nivåer.',
            options: [
                { text: 'Fire nivåer: 1) Navnet "Den usårbare" blir ironisk når skipet synker, 2) det synker i perfekt vær - ikke i storm, 3) årsaken er en enkel bunnplugg - ikke en dramatisk katastrofe, 4) en gammel, enkel robåt overlever der det avanserte skipet feiler. Hver ironi forsterker den neste.', correct: true, feedback: 'Riktig! Ironien bygger seg opp lag for lag: navnet, omstendighetene, årsaken og redningen. Til sammen viser de at overmodig selvtillit kan slå tilbake, og at det enkle noen ganger er best.' },
                { text: 'Det er ironisk fordi båter kan synke', correct: false, feedback: 'At båter kan synke er ikke ironisk i seg selv. Det ironiske er alle lagene av motsetninger mellom forventning og resultat.' },
                { text: 'Det er ironisk fordi mannen overlevde', correct: false, feedback: 'At han overlevde er bare ett element. Den fulle ironien krever at du ser alle fire nivåene sammen.' },
            ],
        },
    },
];
