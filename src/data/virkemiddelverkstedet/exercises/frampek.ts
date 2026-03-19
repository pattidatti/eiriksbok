import type { Exercise } from '../types';

export const frampekExercises: Exercise[] = [
    // === NIVÅ 1 ===
    {
        id: 'fram-1-1',
        deviceId: 'frampek',
        level: 1,
        instruction: 'Hvilket virkemiddel er brukt?',
        data: {
            type: 'identify',
            text: 'Det var den siste rolige dagen de skulle ha på lenge.',
            options: [
                { deviceId: 'frampek', label: 'Frampek', correct: true, feedback: 'Riktig! "Den siste rolige dagen" antyder at noe urolig er på vei. Det er et frampek.' },
                { deviceId: 'tilbakeblikk', label: 'Tilbakeblikk', correct: false, feedback: 'Nei, et tilbakeblikk ser bakover i tid. Her pekes det fremover.' },
                { deviceId: 'kontrast', label: 'Kontrast', correct: false, feedback: 'Nei, kontrast setter motsetninger mot hverandre. Her varsles noe som kommer.' },
                { deviceId: 'ironi', label: 'Ironi', correct: false, feedback: 'Nei, dette er ikke ironisk - det er et varsel om noe som skal skje.' },
            ],
        },
    },
    {
        id: 'fram-1-2',
        deviceId: 'frampek',
        level: 1,
        instruction: 'Hvilket virkemiddel er brukt?',
        data: {
            type: 'identify',
            text: 'Hvis han bare hadde visst hva som ventet ham.',
            options: [
                { deviceId: 'frampek', label: 'Frampek', correct: true, feedback: 'Riktig! Setningen antyder at noe overraskende eller dramatisk venter. Leseren blir nysgjerrig.' },
                { deviceId: 'besjeling', label: 'Besjeling', correct: false, feedback: 'Nei, besjeling gir følelser til livløse ting. Her varsles noe.' },
                { deviceId: 'gjentakelse', label: 'Gjentakelse', correct: false, feedback: 'Nei, ingenting gjentas her.' },
                { deviceId: 'symbol', label: 'Symbol', correct: false, feedback: 'Nei, det er ingen symbolsk gjenstand her.' },
            ],
        },
    },
    {
        id: 'fram-1-3',
        deviceId: 'frampek',
        level: 1,
        instruction: 'Marker frampeket i teksten.',
        data: {
            type: 'highlight',
            text: 'Hun smilte og sa at alt kom til å gå bra. Det kom det ikke.',
            correctRanges: [
                { words: 'Det kom det ikke', explanation: 'Denne korte setningen avslorer at ting ikke gikk bra - et tydelig frampek som skaper spenning.' },
            ],
        },
    },
    {
        id: 'fram-1-4',
        deviceId: 'frampek',
        level: 1,
        instruction: 'Marker frampeket.',
        data: {
            type: 'highlight',
            text: 'Skyene samlet seg i horisonten. Noe var på vei.',
            correctRanges: [
                { words: 'Noe var på vei', explanation: '"Noe var på vei" er et frampek - det varsler at noe skal skje, uten å si hva.' },
            ],
        },
    },

    // === NIVÅ 2 ===
    {
        id: 'fram-2-1',
        deviceId: 'frampek',
        level: 2,
        instruction: 'Hva skaper frampeket her?',
        data: {
            type: 'explain',
            text: 'Hun la nøklene på bordet og gikk ut dora uten å se seg tilbake. For siste gang.',
            highlightedWords: 'For siste gang',
            question: 'Hva er effekten av "For siste gang"?',
            options: [
                { text: 'Det skaper spenning og uro - vi forstår at noe drastisk har skjedd eller skal skje, uten å vite hva', correct: true, feedback: 'Riktig! "For siste gang" er et sterkt frampek. Det kan bety at hun dør, forsvinner eller aldri kommer tilbake. Leseren vil vite mer.' },
                { text: 'At hun var sur og ville straffe noen', correct: false, feedback: 'Det kan være en tolkning, men frampeket sier ikke hvorfor det er siste gang - det er nettopp det som skaper spenning.' },
                { text: 'At hun glemte nøklene', correct: false, feedback: 'Nei, hun la nøklene bevisst fra seg. "For siste gang" antyder noe mye større.' },
            ],
        },
    },
    {
        id: 'fram-2-2',
        deviceId: 'frampek',
        level: 2,
        instruction: 'Hvilket virkemiddel er brukt?',
        data: {
            type: 'identify',
            text: 'De lo og hadde det gøy. Ingen av dem tenkte på at sommeren snart var over for alltid.',
            options: [
                { deviceId: 'frampek', label: 'Frampek', correct: true, feedback: 'Riktig! "Over for alltid" antyder at noe endrer seg permanent. Det skaper en underliggende tristhet.' },
                { deviceId: 'kontrast', label: 'Kontrast', correct: false, feedback: 'Det er en kontrast mellom gleden og varselet, men hovedvirkemiddelet er frampeket.' },
                { deviceId: 'ironi', label: 'Ironi', correct: false, feedback: 'Nei, dette er ikke ironisk - det er et alvorlig varsel.' },
                { deviceId: 'tilbakeblikk', label: 'Tilbakeblikk', correct: false, feedback: 'Nei, det pekes fremover, ikke bakover.' },
            ],
        },
    },
    {
        id: 'fram-2-3',
        deviceId: 'frampek',
        level: 2,
        instruction: 'Marker frampeket i teksten.',
        data: {
            type: 'highlight',
            text: 'Alt var perfekt. For perfekt, tenkte han plutselig.',
            correctRanges: [
                { words: 'For perfekt, tenkte han plutselig', explanation: '"For perfekt" antyder at noe er galt under overflaten. Frampeket skaper uro og forventning om at noe vil gå galt.' },
            ],
        },
    },

    // === NIVÅ 3 ===
    {
        id: 'fram-3-1',
        deviceId: 'frampek',
        level: 3,
        instruction: 'Hva er funksjonen til frampeket her?',
        data: {
            type: 'explain',
            text: 'Fuglen satt på gjerdet og sang. Det var et vakkert syn, men katten lå allerede og ventet i gresset.',
            highlightedWords: 'katten lå allerede og ventet i gresset',
            question: 'Hvorfor er dette et effektivt frampek?',
            options: [
                { text: 'Det skaper spenning fordi leseren forstår faren for fuglen, mens fuglen selv er uvitende - vi aner at noe vondt kan skje', correct: true, feedback: 'Riktig! Frampeket skaper dramatisk ironi - leseren ser faren som fuglen ikke ser. Ordet "allerede" forsterker at faren har vært der hele tiden.' },
                { text: 'Det viser at katten er sulten', correct: false, feedback: 'Det er for bokstavelig. Poenget er spenningen mellom det vakre (fuglesang) og trusselen (katten).' },
                { text: 'Det er en beskrivelse av et natursceneri', correct: false, feedback: 'Nei, det er mer enn en beskrivelse - det er bevisst oppbygging av spenning.' },
            ],
        },
    },
    {
        id: 'fram-3-2',
        deviceId: 'frampek',
        level: 3,
        instruction: 'Koble hvert eksempel med riktig virkemiddel.',
        data: {
            type: 'match',
            pairs: [
                { example: 'Lite visste de at dette var siste gangen de alle var samlet.', label: 'Frampek' },
                { example: 'Hun husket den sommeren de tilbrakte ved sjøen.', label: 'Tilbakeblikk' },
                { example: 'Glasskårene knaste under fotsålene hans. Blodet dryppet.', label: 'In medias res' },
                { example: 'Utenfor var det fest. Innenfor var det stille.', label: 'Kontrast' },
            ],
        },
    },
    {
        id: 'fram-3-3',
        deviceId: 'frampek',
        level: 3,
        instruction: 'Marker kun frampeket. Her er det flere virkemidler!',
        data: {
            type: 'highlight',
            text: 'Den mørke skogen hvisket rundt dem som et levende vesen. Ingen av dem ante at de aldri ville finne veien tilbake.',
            correctRanges: [
                { words: 'Ingen av dem ante at de aldri ville finne veien tilbake', explanation: 'Dette er frampeket - det varsler at de vil gå seg vill. (Merk: "hvisket" er personifisering, "som et levende vesen" er sammenligning.)' },
            ],
        },
    },

    // === NIVÅ 4 ===
    {
        id: 'fram-4-1',
        deviceId: 'frampek',
        level: 4,
        instruction: 'Skriv en setning som inneholder et frampek.',
        data: {
            type: 'write',
            prompt: 'Skriv en kort tekst (2-3 setninger) der du bruker frampek for å antyde at noe farlig skal skje med hovedpersonen.',
            hint: 'Bruk ord som "siste", "aldri igjen", "lite visste han" eller lignende.',
            exampleAnswer: 'Morten vinket til vennene sine og gikk inn i skogen. Han ante ikke at det var siste gangen de så ham smile.',
        },
    },
    {
        id: 'fram-4-2',
        deviceId: 'frampek',
        level: 4,
        instruction: 'Fyll inn ordet som gjør dette til et frampek.',
        data: {
            type: 'fill-blank',
            textBefore: 'De pakket bilen og kjørte mot hytta. Alt var rolig og fint.',
            textAfter: '.',
            correctAnswers: ['Foreløpig', 'Ennå', 'Så langt'],
            acceptKeywords: ['inntil', 'hittil', 'for nå', 'tilsynelatende'],
            hint: 'Legg til et ord som antyder at det gode ikke vil vare.',
            explanation: 'Ord som "foreløpig", "ennå" eller "så langt" skaper frampek fordi de antyder at roen ikke vil vare. Leseren skjønner at noe kommer til å endre seg.',
        },
    },
    {
        id: 'fram-4-3',
        deviceId: 'frampek',
        level: 4,
        instruction: 'Skriv et frampek som varsler noe positivt.',
        data: {
            type: 'write',
            prompt: 'De fleste frampek varsler noe negativt. Skriv 2-3 setninger der frampeket antyder at noe bra skal skje med hovedpersonen.',
            hint: 'Tenk på at personen kanskje ikke vet det ennå, men leseren forstår det.',
            exampleAnswer: 'Sara gikk nedslått hjem fra skolen etter nok en dårlig dag. Hun visste ikke at brevet som lå i postkassen, ville forandre alt til det bedre.',
        },
    },

    // === NIVÅ 5 ===
    {
        id: 'fram-5-1',
        deviceId: 'frampek',
        level: 5,
        instruction: 'Finn feilen i denne analysen av frampek.',
        data: {
            type: 'find-error',
            text: 'I setningen "De lo og spiste kake. Ingen av dem visste at dette var siste bursdagen de feiret sammen" er frampeket "De lo og spiste kake". Dette varsler at noe trist skal skje.',
            errorDescription: 'Hvilken del av analysen er feil?',
            options: [
                { text: '"De lo og spiste kake" er ikke frampeket - det er en vanlig beskrivelse. Frampeket er "siste bursdagen de feiret sammen".', correct: true, feedback: 'Riktig! "De lo og spiste kake" er bare en handlingsbeskrivelse. Det er ordene "siste bursdagen de feiret sammen" som peker fremover og varsler at noe kommer til å endre seg.' },
                { text: 'Det er ikke et frampek i det hele tatt, det er et tilbakeblikk.', correct: false, feedback: 'Nei, det er definitivt et frampek her - "siste bursdagen" peker fremover mot noe som skal skje.' },
                { text: 'Feilen er at frampeket varsler noe positivt, ikke noe trist.', correct: false, feedback: 'Nei, "siste bursdagen de feiret sammen" varsler noe trist. Feilen er at analysen peker ut feil del av teksten som frampek.' },
            ],
        },
    },
    {
        id: 'fram-5-2',
        deviceId: 'frampek',
        level: 5,
        instruction: 'Er denne påstanden riktig eller gal?',
        data: {
            type: 'true-false',
            statement: 'Et frampek må alltid si direkte hva som kommer til å skje, for eksempel "Senere den kvelden ble han skutt."',
            correct: false,
            explanation: 'Nei! Frampek er ofte subtile hint som skaper spenning uten å avsløre hva som skjer. "Det var den siste rolige dagen" er et frampek selv om det ikke sier hva som skjedde. Faktisk er de mest effektive frampekene vage - de skaper nysgjerrighet uten å gi svaret.',
        },
    },
    {
        id: 'fram-5-3',
        deviceId: 'frampek',
        level: 5,
        instruction: 'Er denne påstanden riktig eller gal?',
        data: {
            type: 'true-false',
            statement: 'Været i en historie kan fungere som frampek. For eksempel kan mørke skyer og torden varsle at noe dramatisk er på vei.',
            correct: true,
            explanation: 'Riktig! Naturen brukes ofte som frampek i litteraturen. Uvær kan varsle konflikt, solnedgang kan varsle slutten på noe, og tåke kan varsle usikkerhet. Dette kalles noen ganger "pathetic fallacy" - at naturen speiler handlingen.',
        },
    },

    // === NIVÅ 6 ===
    {
        id: 'fram-6-1',
        deviceId: 'frampek',
        level: 6,
        instruction: 'Marker frampeket i denne lengre teksten.',
        data: {
            type: 'highlight',
            text: 'Klassen var på tur til fjells. Solen skinte, og alle lo og tullet. Læreren sa at de måtte følge stien og holde seg sammen. Jonas og Emilie bestemte seg for å ta en snarvei gjennom skogen. "Vi finner tilbake," sa Jonas selvsikkert. Kartet hadde han glemt i sekken som sto igjen ved rasteplassen. Det ville han angre på.',
            correctRanges: [
                { words: 'Det ville han angre på', explanation: 'Denne setningen er et tydelig frampek. Den forteller leseren at noe vil gå galt med snarveien - kanskje de går seg vill. Alt det andre er handlingsbeskrivelse som bygger opp situasjonen.' },
            ],
        },
    },
    {
        id: 'fram-6-2',
        deviceId: 'frampek',
        level: 6,
        instruction: 'Forklar hvordan frampeket virker i denne teksten.',
        data: {
            type: 'explain',
            text: 'Bestefar satt i stolen sin og fortalte historier om krigen, slik han alltid gjorde på søndager. Barnebarnet lyttet med store øyne. Bestefar stoppet midt i en setning og så ut av vinduet. "Du må huske disse historiene for meg," sa han stille. "Snart er det bare du som kan fortelle dem."',
            highlightedWords: 'Snart er det bare du som kan fortelle dem',
            question: 'Hva varsler dette frampeket, og hvorfor er det effektfullt?',
            options: [
                { text: 'Det varsler at bestefar snart skal dø, uten å si det direkte. Det er effektfullt fordi det lar leseren forstå alvoret selv, og det viser at bestefar vet det', correct: true, feedback: 'Riktig! Frampeket er subtilt og vondt. Bestefar sier ikke "jeg skal dø", men leseren forstår det. At han stopper midt i en setning og ser ut av vinduet forsterker alvoret. Frampeket gjør scenen fra koselig til sår.' },
                { text: 'Det varsler at barnebarnet skal bli forfatter', correct: false, feedback: 'Nei, det handler ikke om yrke. "Snart er det bare du" antyder at bestefar ikke vil være der lenger.' },
                { text: 'Det betyr at bestefar er lei av å fortelle historier', correct: false, feedback: 'Tvert imot - han vil at historiene skal leve videre. Frampeket handler om at han snart ikke kan fortelle dem selv.' },
            ],
        },
    },
    {
        id: 'fram-6-3',
        deviceId: 'frampek',
        level: 6,
        instruction: 'Marker alle frampekene i denne teksten. Det kan være flere!',
        data: {
            type: 'highlight',
            text: 'Broen så gammel og slitt ut. Noen av plankene var råtne. "Er du sikker på at den holder?" spurte Lise. "Den har holdt i hundre år," svarte Erik og tok det første steget. Broen knirket. Det var en lyd ingen av dem burde ha ignorert.',
            correctRanges: [
                { words: 'Noen av plankene var råtne', explanation: 'Dette er et subtilt frampek - de råtne plankene varsler at broen kan svikte.' },
                { words: 'Det var en lyd ingen av dem burde ha ignorert', explanation: 'Dette er et tydelig frampek - fortelleren sier direkte at de burde ha lyttet til advarselen. Noe galt skal skje.' },
            ],
        },
    },

    // === NIVÅ 7 ===
    {
        id: 'fram-7-1',
        deviceId: 'frampek',
        level: 7,
        instruction: 'Koble hvert eksempel med riktig type frampek.',
        data: {
            type: 'match',
            pairs: [
                { example: '"Hadde hun bare visst hva som ventet henne."', label: 'Direkte frampek (fortelleren avslører)' },
                { example: 'Mørke skyer samlet seg over byen.', label: 'Symbolsk frampek (naturen varsler)' },
                { example: 'Han la merke til at dørlåsen var ødelagt, men tenkte ikke mer over det.', label: 'Subtilt frampek (detalj som blir viktig)' },
                { example: '"Pass på deg selv i kveld," sa hun med en stemme som skalv.', label: 'Dialogbasert frampek (en person varsler)' },
            ],
        },
    },
    {
        id: 'fram-7-2',
        deviceId: 'frampek',
        level: 7,
        instruction: 'Sorter disse eksemplene etter om de er frampek eller ikke.',
        data: {
            type: 'sort',
            categories: [
                { id: 'frampek', label: 'Frampek' },
                { id: 'ikke-frampek', label: 'Ikke frampek' },
            ],
            items: [
                { text: 'Det var den siste sommeren i det gamle huset.', categoryId: 'frampek' },
                { text: 'Hun husket den gangen de hadde badet i elven.', categoryId: 'ikke-frampek' },
                { text: 'Solen gikk ned. Mørket krøp innover dalen.', categoryId: 'ikke-frampek' },
                { text: 'Lite visste de at huset allerede var solgt.', categoryId: 'frampek' },
                { text: 'Hunden begynte å gjø mot noe ingen andre kunne se.', categoryId: 'frampek' },
                { text: 'Bestemor hadde alltid sagt at lykke ikke varer evig.', categoryId: 'frampek' },
            ],
        },
    },
    {
        id: 'fram-7-3',
        deviceId: 'frampek',
        level: 7,
        instruction: 'Er denne påstanden riktig eller gal?',
        data: {
            type: 'true-false',
            statement: 'Et frampek fungerer bare hvis leseren legger merke til det ved første gjennomlesing. Hvis du først forstår frampeket etter å ha lest ferdig boken, er det ikke et ekte frampek.',
            correct: false,
            explanation: 'Feil! Mange av de beste frampekene er så subtile at du ikke legger merke til dem før du har lest ferdig. Når du leser boken på nytt, tenker du: "Aha, det sto jo der hele tiden!" Slike skjulte frampek belønner oppmerksomme lesere og gjør boken rikere ved andre gangs lesing.',
        },
    },

    // === NIVÅ 8 ===
    {
        id: 'fram-8-1',
        deviceId: 'frampek',
        level: 8,
        instruction: 'Sorter disse teknikkene etter hvor subtilt frampeket er.',
        data: {
            type: 'sort',
            categories: [
                { id: 'tydelig', label: 'Tydelig frampek' },
                { id: 'middels', label: 'Middels subtilt' },
                { id: 'subtilt', label: 'Svært subtilt' },
            ],
            items: [
                { text: '"Ingen av dem visste at dette var siste kvelden."', categoryId: 'tydelig' },
                { text: 'Fortelleren avbryter: "Men mer om det senere."', categoryId: 'tydelig' },
                { text: 'En karakter sier "Vær forsiktig" før en reise.', categoryId: 'middels' },
                { text: 'Hovedpersonen drømmer om å falle.', categoryId: 'middels' },
                { text: 'Et glass faller og knuser på gulvet under en festscene.', categoryId: 'subtilt' },
                { text: 'Forfatteren beskriver et tre som mister bladene sine.', categoryId: 'subtilt' },
            ],
        },
    },
    {
        id: 'fram-8-2',
        deviceId: 'frampek',
        level: 8,
        instruction: 'Koble hvert frampek med hva det mest sannsynlig varsler.',
        data: {
            type: 'match',
            pairs: [
                { example: 'Han la revolveren i skuffen. "Den trenger jeg nok ikke," tenkte han.', label: 'Revolveren vil bli brukt senere (Tsjekovs gevær)' },
                { example: 'Isen på innsjøen var tynnere enn vanlig denne vinteren.', label: 'Noen vil falle gjennom isen' },
                { example: '"Vi ses i morgen," sa hun. Han svarte ikke.', label: 'De vil ikke ses igjen' },
                { example: 'Barnet plukket blomster ved kanten av stupet uten å se ned.', label: 'Et fall eller en ulykke' },
            ],
        },
    },
    {
        id: 'fram-8-3',
        deviceId: 'frampek',
        level: 8,
        instruction: 'Sorter disse tekstutdragene etter virkemiddel.',
        data: {
            type: 'sort',
            categories: [
                { id: 'frampek', label: 'Frampek' },
                { id: 'tilbakeblikk', label: 'Tilbakeblikk' },
                { id: 'ironi', label: 'Ironi' },
            ],
            items: [
                { text: 'Han skulle snart få vite hva frykt egentlig var.', categoryId: 'frampek' },
                { text: 'Hun tenkte tilbake på den dagen hun først møtte ham.', categoryId: 'tilbakeblikk' },
                { text: '"For en fin dag å være i live," sa han og hosteted blod.', categoryId: 'ironi' },
                { text: 'Klokken tikket. Snart ville alarmen gå.', categoryId: 'frampek' },
                { text: 'For ti år siden hadde dette vært en levende by.', categoryId: 'tilbakeblikk' },
                { text: 'Brannmannen tente en sigarett ved bensinstasjonen.', categoryId: 'ironi' },
            ],
        },
    },

    // === NIVÅ 9 ===
    {
        id: 'fram-9-1',
        deviceId: 'frampek',
        level: 9,
        instruction: 'Analyser frampekene i denne teksten.',
        data: {
            type: 'explain',
            text: 'Familien satt rundt middagsbordet som vanlig. Far fortalte om jobben, mor lo av en vits, og lillesøster sølte melk på duken. Alt var akkurat som alltid. Men den kvelden la Mia merke til at fars latter ikke nådde øynene hans. At han holdt telefonen under bordet og skrev meldinger han skjulte. At han sa "god natt, jenta mi" som om han mente det mer enn vanlig. Først mange år senere forsto Mia at den kvelden var begynnelsen på slutten.',
            highlightedWords: 'den kvelden var begynnelsen på slutten',
            question: 'Teksten inneholder flere lag med frampek. Hva gjør den siste setningen spesiell sammenlignet med de andre hintene?',
            options: [
                { text: 'De tidlige hintene (skjult telefon, falsk latter) er subtile frampek som leseren kan tolke selv, mens den siste setningen er et direkte frampek fra en eldre forteller som bekrefter at noe gikk galt', correct: true, feedback: 'Riktig! Teksten bruker to nivåer av frampek. Først subtile detaljer (telefonen, latteren, "god natt") som skaper uro. Så avslutter den med et direkte frampek fra Mias voksne perspektiv. Sammen skaper de en sterk effekt: leseren aner uråd hele veien, og den siste setningen bekrefter det.' },
                { text: 'Den siste setningen er et tilbakeblikk, ikke et frampek', correct: false, feedback: 'Det er et godt poeng at Mia ser tilbake, men "begynnelsen på slutten" peker fremover mot det som skjedde etter den kvelden. Det er et frampek pakket inn i et tilbakeblikk.' },
                { text: 'De andre hintene er viktigere enn den siste setningen', correct: false, feedback: 'Alle elementene jobber sammen, men den siste setningen gir de subtile hintene mening og gjør dem til bevisste frampek i stedet for tilfeldige detaljer.' },
            ],
        },
    },
    {
        id: 'fram-9-2',
        deviceId: 'frampek',
        level: 9,
        instruction: 'Skriv en tekst med et subtilt frampek.',
        data: {
            type: 'write',
            prompt: 'Skriv et avsnitt (4-6 setninger) der du bruker et subtilt frampek. Frampeket skal ikke være åpenbart - leseren skal helst først forstå det etterpå. Bruk gjerne en detalj, en gjenstand eller noe i naturen som varsel.',
            hint: 'Tenk på Tsjekovs gevær: Hvis du nevner en gjenstand i første akt, bør den brukes i tredje akt. Beskriv gjenstanden naturlig, uten å gjøre det opplagt at den blir viktig.',
            exampleAnswer: 'Ida satt på verandaen og så utover fjorden. Vannet var rolig, og de nye seilskoene sto ved døren, fortsatt ubrukte. Mamma hadde kjøpt dem til henne i går, men Ida hadde ikke prøvd dem ennå. Hun bestemte seg for å ta dem med ned til brygga i morgen. Fjorden var jo alltid like stille.',
        },
    },
    {
        id: 'fram-9-3',
        deviceId: 'frampek',
        level: 9,
        instruction: 'Finn feilen i denne analysen.',
        data: {
            type: 'find-error',
            text: 'Analysert tekst: "Lampen blinket tre ganger før den sluknet. I mørket hørte han noe puste." Elevanalyse: "Her er det to frampek: lampen som blinker er et frampek fordi den varsler at strømmen går. Pustingen er et frampek fordi den varsler at noe farlig er i rommet."',
            errorDescription: 'Hva er feil med denne analysen?',
            options: [
                { text: 'Pustingen er ikke et frampek - den er noe som skjer akkurat nå i handlingen. Et frampek varsler noe som skal skje senere, men pustingen er allerede til stede i scenen.', correct: true, feedback: 'Riktig! Et frampek peker fremover i tid. Pustingen er en del av nåtidshandlingen - det er spenningsskapende, men det er ikke et frampek. Lampen som blinker kan derimot være et frampek for at strømmen vil gå, noe som skjer rett etterpå.' },
                { text: 'Lampen er ikke et frampek fordi lamper bare er gjenstander.', correct: false, feedback: 'Gjenstander kan absolutt være frampek. En blinkende lampe kan varsle at strømmen vil gå, som er nettopp det som skjer her.' },
                { text: 'Begge er frampek, analysen er helt riktig.', correct: false, feedback: 'Nei, pustingen er ikke et frampek. Den er noe som skjer i øyeblikket, ikke et varsel om noe som skal skje.' },
            ],
        },
    },

    // === NIVÅ 10 ===
    {
        id: 'fram-10-1',
        deviceId: 'frampek',
        level: 10,
        instruction: 'Marker alle frampekene i denne teksten. Noen er svært subtile.',
        data: {
            type: 'highlight',
            text: 'Kapteinen studerte kartet og ristet på hodet. Været var for godt, sa han. Ikke en sky på himmelen. Det uvanlige stillehavet skapte et speilbilde av båten under dem, som om det fantes en annen verden der nede. Styrmannen lo og sa at de hadde flaks. Kapteinen svarte ikke. Han stod bare og holdt i rekkverket med hvite knoker.',
            correctRanges: [
                { words: 'Været var for godt', explanation: '"For godt" antyder at det er unaturlig - at stormen kommer. Kapteinen vet av erfaring at slik ro varsler uvær.' },
                { words: 'som om det fantes en annen verden der nede', explanation: 'Speilbildet i havet kan varsle at noen vil havne "der nede" - et subtilt frampek om en mulig drukningsulykke.' },
                { words: 'Han stod bare og holdt i rekkverket med hvite knoker', explanation: 'Kapteinens kroppsspråk viser frykt han ikke sier høyt. Han klamrer seg fast fordi han aner hva som kommer. Dette er et frampek gjennom handling i stedet for ord.' },
            ],
        },
    },
    {
        id: 'fram-10-2',
        deviceId: 'frampek',
        level: 10,
        instruction: 'Skriv en tekst med frampek på flere nivåer.',
        data: {
            type: 'write',
            prompt: 'Skriv et avsnitt (5-7 setninger) som inneholder minst to frampek: ett subtilt (en detalj eller stemning) og ett mer åpenbart (noe fortelleren eller en karakter sier). Scenen skal handle om en skoleavslutning der vennegjengen er samlet for siste gang.',
            hint: 'La det subtile frampeket ligge i en beskrivelse eller handling, og det åpenbare i dialog eller fortellerkommentar. Begge skal peke mot at noe vil endre seg.',
            exampleAnswer: 'Ballongene danset i vinden utenfor gymsalen, men noen av dem hadde allerede løsnet og fløy bort over hustakene. Inne lo og danset alle. "Vi holder kontakten for alltid," sa Nora og holdt hånden til Sofie. Sofie klemte tilbake, men sa ingenting. Fotografen tok et gruppebilde, og alle smilte sitt bredeste smil. Mange år senere ville Nora se på bildet og prøve å huske navnene på alle som sto der. Hun husket ikke alle.',
        },
    },
    {
        id: 'fram-10-3',
        deviceId: 'frampek',
        level: 10,
        instruction: 'Koble hvert tekstutdrag med den litterære funksjonen frampeket har.',
        data: {
            type: 'match',
            pairs: [
                { example: '"Ingen visste at denne kvelden ville forandre alt." I en roman som åpner med en rolig familiesamling.', label: 'Skape spenning og driv (leseren vil bla videre)' },
                { example: 'Et barn plukker mørke bær i skogen, og fortelleren beskriver fargen som "blodrød".', label: 'Bygge symbolsk stemning og uro' },
                { example: 'En karakter ser et gammelt brev i en skuff, men velger å ikke åpne det. Brevet dukker opp igjen i siste kapittel.', label: 'Plante en detalj som betaler seg senere (setup/payoff)' },
                { example: 'Etter en lykkelig bryllupsscene skriver fortelleren: "Det var den siste gode dagen."', label: 'Skape dramatisk ironi (leseren vet mer enn karakterene)' },
            ],
        },
    },
];
