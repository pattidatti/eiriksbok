import type { Exercise } from '../types';

export const kontrastExercises: Exercise[] = [
    // === NIVÅ 1 ===
    {
        id: 'kont-1-1',
        deviceId: 'kontrast',
        level: 1,
        instruction: 'Hvilket virkemiddel er brukt?',
        data: {
            type: 'identify',
            text: 'Utenfor var det vår og fuglesang. Innenfor var det vinter i hjertet hans.',
            options: [
                { deviceId: 'kontrast', label: 'Kontrast', correct: true, feedback: 'Riktig! Vår/vinter, utenfor/innenfor - motsetningene forsterker hverandre.' },
                { deviceId: 'metafor', label: 'Metafor', correct: false, feedback: '"Vinter i hjertet" er en metafor, men hovedvirkemiddelet er kontrasten mellom ute og inne.' },
                { deviceId: 'besjeling', label: 'Besjeling', correct: false, feedback: 'Nei, det er ingen livløse ting som får følelser her.' },
                { deviceId: 'ironi', label: 'Ironi', correct: false, feedback: 'Nei, det er ikke ironisk - det er en bevisst motsetning.' },
            ],
        },
    },
    {
        id: 'kont-1-2',
        deviceId: 'kontrast',
        level: 1,
        instruction: 'Hvilket virkemiddel er brukt?',
        data: {
            type: 'identify',
            text: 'Den rike mannen var ulykkelig. Den fattige kvinnen smilte.',
            options: [
                { deviceId: 'kontrast', label: 'Kontrast', correct: true, feedback: 'Riktig! Rik/fattig og ulykkelig/glad er motsetningspar som forsterker budskapet.' },
                { deviceId: 'ironi', label: 'Ironi', correct: false, feedback: 'Det kan virke ironisk, men det er kontrasten mellom de to personene som er virkemiddelet.' },
                { deviceId: 'symbol', label: 'Symbol', correct: false, feedback: 'Nei, personene er ikke symboler - de brukes for å skape kontrast.' },
                { deviceId: 'gjentakelse', label: 'Gjentakelse', correct: false, feedback: 'Nei, setningsstrukturen ligner, men innholdet er motsetninger - det er kontrast.' },
            ],
        },
    },
    {
        id: 'kont-1-3',
        deviceId: 'kontrast',
        level: 1,
        instruction: 'Marker kontrasten i teksten.',
        data: {
            type: 'highlight',
            text: 'Om dagen var hun modig og sterk. Om natten gråt hun inn i puten.',
            correctRanges: [
                { words: 'Om dagen var hun modig og sterk. Om natten gråt hun inn i puten.', explanation: 'Dag/natt, modig/gråtende - motsetningene viser at hun skjuler sin sårbarhet.' },
            ],
        },
    },
    {
        id: 'kont-1-4',
        deviceId: 'kontrast',
        level: 1,
        instruction: 'Marker kontrasten.',
        data: {
            type: 'highlight',
            text: 'Han var stor og sterk, men stemmen hans var liten og forsiktig.',
            correctRanges: [
                { words: 'stor og sterk, men stemmen hans var liten og forsiktig', explanation: 'Stor/liten, sterk/forsiktig - kroppen og stemmen står i kontrast. Det gjør karakteren interessant.' },
            ],
        },
    },

    // === NIVÅ 2 ===
    {
        id: 'kont-2-1',
        deviceId: 'kontrast',
        level: 2,
        instruction: 'Hva gjør kontrasten her?',
        data: {
            type: 'explain',
            text: 'Barna lekte og lo på plenen. Bak det hvite gjerdet satt den gamle mannen og ventet på døden.',
            highlightedWords: 'Barna lekte og lo',
            question: 'Hva er effekten av kontrasten mellom barna og den gamle mannen?',
            options: [
                { text: 'Den setter livets begynnelse mot slutten - barnas lek og glede forsterker ensomheten og alvoret hos den gamle', correct: true, feedback: 'Riktig! Kontrasten mellom ung/gammel, lek/død, glede/venting gjør begge sidene sterkere. Barnas liv understreker mannens ensomhet.' },
                { text: 'At den gamle mannen er sur på barna', correct: false, feedback: 'Nei, teksten sier ikke at han er sur. Kontrasten handler om livets syklus.' },
                { text: 'At gjerdet er fint', correct: false, feedback: 'Gjerdet er en fysisk grense som også symboliserer skillet mellom to livsfaser.' },
            ],
        },
    },
    {
        id: 'kont-2-2',
        deviceId: 'kontrast',
        level: 2,
        instruction: 'Hvilket virkemiddel er mest fremtredende?',
        data: {
            type: 'identify',
            text: 'Musikken var høy og glad, men tekstene handlet om sorg og tap.',
            options: [
                { deviceId: 'kontrast', label: 'Kontrast', correct: true, feedback: 'Riktig! Glad musikk vs. trist tekst - motsetningen skaper en interessant spenning.' },
                { deviceId: 'ironi', label: 'Ironi', correct: false, feedback: 'Det kan virke ironisk, men det er en bevisst kunstnerisk kontrast, ikke ironi.' },
                { deviceId: 'metafor', label: 'Metafor', correct: false, feedback: 'Nei, alt er bokstavelig beskrevet. Virkemiddelet er kontrasten mellom form og innhold.' },
                { deviceId: 'gjentakelse', label: 'Gjentakelse', correct: false, feedback: 'Nei, ingenting gjentas. Det er motsetninger som brukes.' },
            ],
        },
    },
    {
        id: 'kont-2-3',
        deviceId: 'kontrast',
        level: 2,
        instruction: 'Marker kontrasten i teksten.',
        data: {
            type: 'highlight',
            text: 'Foran kamera smilte hun perfekt. Bak scenen satt hun alene og scrollet gjennom hatkommentarene.',
            correctRanges: [
                { words: 'Foran kamera smilte hun perfekt. Bak scenen satt hun alene', explanation: 'Foran/bak, smil/ensomhet - kontrasten viser forskjellen mellom fasaden og virkeligheten.' },
            ],
        },
    },

    // === NIVÅ 3 ===
    {
        id: 'kont-3-1',
        deviceId: 'kontrast',
        level: 3,
        instruction: 'Hva oppnår kontrasten her?',
        data: {
            type: 'explain',
            text: 'Kirken lå ved siden av fengselet. De som ba om tilgivelse og de som betalte for sine synder - alle var under samme himmel.',
            highlightedWords: 'Kirken lå ved siden av fengselet',
            question: 'Hva er den dypere effekten av denne kontrasten?',
            options: [
                { text: 'Den setter frihet mot fangenskap, tilgivelse mot straff, og viser at begge sider av menneskelivet eksisterer side om side', correct: true, feedback: 'Riktig! Kirken (tilgivelse, frihet, håp) og fengselet (straff, fangenskap) representerer motpoler i menneskelivet. At de er under "samme himmel" minner om at alle er mennesker.' },
                { text: 'At byplanleggingen er dårlig', correct: false, feedback: 'Nei, plasseringen er symbolsk, ikke praktisk. Det handler om motsetninger i menneskelivet.' },
                { text: 'At fangene burde gå i kirken', correct: false, feedback: 'Det er en for bokstavelig tolkning. Kontrasten handler om bredere temaer.' },
            ],
        },
    },
    {
        id: 'kont-3-2',
        deviceId: 'kontrast',
        level: 3,
        instruction: 'Koble hvert eksempel med riktig virkemiddel.',
        data: {
            type: 'match',
            pairs: [
                { example: 'Sommeren var varm og levende. Vinteren var kald og død.', label: 'Kontrast' },
                { example: '"Så fint at du kunne komme," sa hun til stolen der han pleide å sitte.', label: 'Ironi' },
                { example: 'Den enslige lykten sto og brant i mørket.', label: 'Symbol' },
                { example: 'Huset stønnet i vinden.', label: 'Besjeling' },
            ],
        },
    },
    {
        id: 'kont-3-3',
        deviceId: 'kontrast',
        level: 3,
        instruction: 'Marker kun kontrasten. Her er det andre virkemidler også!',
        data: {
            type: 'highlight',
            text: 'Hun lo høyt mens tårene rant nedover kinnene. Himmelen var mørk som blekk.',
            correctRanges: [
                { words: 'lo høyt mens tårene rant', explanation: 'Latter og tårer på samme tid er en sterk kontrast. (Merk: "mørk som blekk" er en sammenligning, ikke kontrast.)' },
            ],
        },
    },

    // === NIVÅ 4 ===
    {
        id: 'kont-4-1',
        deviceId: 'kontrast',
        level: 4,
        instruction: 'Skriv en setning som bruker kontrast.',
        data: {
            type: 'write',
            prompt: 'Skriv en setning der du setter to motsetninger opp mot hverandre for å forsterke begge. Bruk gjerne motsetningspar som lys/mørke, gammel/ung, rik/fattig eller lignende.',
            hint: 'Beskriv en person eller situasjon der to sider står i kontrast. For eksempel noe utvendig versus noe innvendig.',
            exampleAnswer: 'Huset var stort og vakkert, men inne var det tomt og kaldt som en grav.',
        },
    },
    {
        id: 'kont-4-2',
        deviceId: 'kontrast',
        level: 4,
        instruction: 'Fyll inn det som skaper kontrast.',
        data: {
            type: 'fill-blank',
            textBefore: 'Han lo høyt og fortalte vitser til alle rundt seg. Men da han kom hjem og lukket døren, ',
            textAfter: '',
            correctAnswers: ['gråt han', 'gråt han stille', 'sank han sammen', 'falt tårene', 'var han helt alene', 'satt han alene i mørket'],
            acceptKeywords: ['gråt', 'tåre', 'alene', 'mørk', 'stille', 'sank', 'trist', 'ensom'],
            hint: 'Hva er det motsatte av å le og fortelle vitser? Hva skjer bak den lukka døra?',
            explanation: 'Kontrasten mellom den sosiale fasaden (latter, vitser) og det som skjer hjemme (gråt, ensomhet) gjør begge sidene sterkere og viser at han skjuler noe.',
        },
    },
    {
        id: 'kont-4-3',
        deviceId: 'kontrast',
        level: 4,
        instruction: 'Skriv en kontrast mellom to personer.',
        data: {
            type: 'write',
            prompt: 'Beskriv to personer som er motsetninger av hverandre. Bruk minst to motsetningspar i beskrivelsen. Vis hvordan kontrasten gjør begge personene tydeligere.',
            hint: 'Tenk på to personer som er forskjellige i utseende, oppførsel eller livssituasjon.',
            exampleAnswer: 'Søsteren var høy og stille, alltid med nesen i en bok. Broren var liten og høylytt, alltid i bevegelse. Sammen fylte de rommet perfekt.',
        },
    },

    // === NIVÅ 5 ===
    {
        id: 'kont-5-1',
        deviceId: 'kontrast',
        level: 5,
        instruction: 'Finn feilen i denne analysen av kontrast.',
        data: {
            type: 'find-error',
            text: 'Solen skinte på den ene siden av gaten. Den andre siden lå i dyp skygge.',
            errorDescription: 'En elev har skrevet tre analyser av denne teksten. Hvilken er feil?',
            options: [
                { text: 'Det er kontrast fordi lys og mørke settes opp mot hverandre', correct: false, feedback: 'Riktig analyse! Sol/skygge er et klassisk kontrastpar.' },
                { text: 'Det er ironi fordi solen bare skinner på den ene siden', correct: true, feedback: 'Riktig, dette er feil! Det er ikke ironisk at solen skinner på en side - det er helt normalt. Virkemiddelet er kontrast mellom lys og skygge.' },
                { text: 'Kontrasten kan brukes symbolsk, der lys og mørke representerer ulike livssituasjoner', correct: false, feedback: 'Riktig analyse! Lys og mørke er klassiske symboler som kan gi kontrasten dypere mening.' },
            ],
        },
    },
    {
        id: 'kont-5-2',
        deviceId: 'kontrast',
        level: 5,
        instruction: 'Sant eller usant?',
        data: {
            type: 'true-false',
            statement: 'Kontrast handler alltid om farger, som svart og hvitt.',
            correct: false,
            explanation: 'Usant! Kontrast kan handle om mye mer enn farger. Man kan kontrastere følelser (glad/trist), livssituasjoner (rik/fattig), alder (ung/gammel), lyd (stille/bråk), tid (da/nå) og mye annet. Alt som er motsetninger kan brukes i kontrast.',
        },
    },
    {
        id: 'kont-5-3',
        deviceId: 'kontrast',
        level: 5,
        instruction: 'Finn feilen i analysen.',
        data: {
            type: 'find-error',
            text: 'I det rike nabolaget sto husene lyse og velholdte. Bare en mur unna lå husene falleferdige og grå.',
            errorDescription: 'En elev har analysert teksten. Hvilken påstand er feil?',
            options: [
                { text: 'Rik/fattig og lys/mørk er motsetningspar som skaper kontrast', correct: false, feedback: 'Riktig analyse! Teksten bruker flere motsetningspar for å forsterke budskapet.' },
                { text: 'Muren er en metafor for at de rike beskytter seg mot de fattige', correct: false, feedback: 'Det er en god analyse! Muren kan leses som et symbol for klasseskillet.' },
                { text: 'Det er gjentakelse fordi begge setningene handler om hus', correct: true, feedback: 'Riktig, dette er feil! Selv om begge setningene nevner hus, er poenget at husene er motsatte. Det er kontrast, ikke gjentakelse.' },
            ],
        },
    },

    // === NIVÅ 6 ===
    {
        id: 'kont-6-1',
        deviceId: 'kontrast',
        level: 6,
        instruction: 'Marker alle kontrastene i denne lengre teksten.',
        data: {
            type: 'highlight',
            text: 'Bryllupet var i full gang. Musikken spilte, gjestene danset, og brudeparet strålte av lykke. I rommet ved siden av satt bestemoren alene. Hendene hennes var foldet, og øynene var lukket. Livet feiret seg selv i den ene salen. Døden ventet tålmodig i den andre.',
            correctRanges: [
                { words: 'Musikken spilte, gjestene danset, og brudeparet strålte av lykke. I rommet ved siden av satt bestemoren alene', explanation: 'Kontrast mellom fest og ensomhet, fellesskap og isolasjon - alt bare en vegg fra hverandre.' },
                { words: 'Livet feiret seg selv i den ene salen. Døden ventet tålmodig i den andre', explanation: 'Den sterkeste kontrasten: liv mot død. Setningene er bygd likt, noe som gjør motsetningen enda tydeligere.' },
            ],
        },
    },
    {
        id: 'kont-6-2',
        deviceId: 'kontrast',
        level: 6,
        instruction: 'Forklar effekten av kontrasten i denne teksten.',
        data: {
            type: 'explain',
            text: 'Reklameplakaten viste en jente med perfekt hud, hvite tenner og strålende hår. Under plakaten satt en virkelig jente med kviser, tannregulering og fett hår. Hun stirret opp på plakaten og sukket.',
            highlightedWords: 'perfekt hud, hvite tenner og strålende hår',
            question: 'Hva oppnår forfatteren med denne kontrasten?',
            options: [
                { text: 'Kontrasten mellom det "perfekte" reklamebildet og den virkelige jenta viser presset unge føler for å se ut som noe som ikke finnes. Sukket hennes forsterker følelsen av utilstrekkelighet.', correct: true, feedback: 'Riktig! Kontrasten avslører gapet mellom reklamevirkeligheten og den ekte virkeligheten, og viser hvordan dette påvirker selvbildet til unge mennesker.' },
                { text: 'At jenta bør kjøpe produktet på plakaten', correct: false, feedback: 'Nei, det er ikke reklamens budskap som er poenget. Forfatteren bruker kontrasten for å kritisere skjønnhetspress.' },
                { text: 'At jenta er stygg', correct: false, feedback: 'Nei, teksten kaller henne ikke stygg. Kontrasten viser at "perfekt" i reklame er urealistisk, ikke at jenta er feil.' },
            ],
        },
    },
    {
        id: 'kont-6-3',
        deviceId: 'kontrast',
        level: 6,
        instruction: 'Marker kontrasten i denne teksten. Vær presis!',
        data: {
            type: 'highlight',
            text: 'Sommeren hun var femten, var den beste og verste i livet hennes. Hun forelsket seg for første gang, lo til hun gråt, og levde som om ingenting kunne stoppe henne. Men i august forsvant moren. Høsten kom med bladfall og taushet. Alt som hadde vært gull ble grått.',
            correctRanges: [
                { words: 'den beste og verste i livet hennes', explanation: 'Direkte kontrast: Beste og verste på samme tid. To motpoler i ett uttrykk.' },
                { words: 'forelsket seg for første gang, lo til hun gråt, og levde som om ingenting kunne stoppe henne. Men i august forsvant moren', explanation: 'Kontrasten mellom den lykkelige sommeren og tapet av moren. Lykken gjør sorgen desto sterkere.' },
                { words: 'Alt som hadde vært gull ble grått', explanation: 'Gull/grått-kontrasten oppsummerer hele skiftet fra lykke til sorg.' },
            ],
        },
    },

    // === NIVÅ 7 ===
    {
        id: 'kont-7-1',
        deviceId: 'kontrast',
        level: 7,
        instruction: 'Koble hvert eksempel med den typen kontrast det representerer.',
        data: {
            type: 'match',
            pairs: [
                { example: 'Huset var stort, men hjertet var lite.', label: 'Indre mot ytre kontrast' },
                { example: 'Sommeren var varm og levende. Vinteren var kald og død.', label: 'Naturkontrast' },
                { example: 'Kongen gikk i silke. Bonden gikk i filler.', label: 'Sosial kontrast' },
                { example: 'Da lo hun. Nå gråter hun.', label: 'Tidskontrast (før/nå)' },
                { example: 'Musikken var høy, men ordene var stille.', label: 'Sanselig kontrast' },
                { example: '"Elsker deg," skrev han. "Hater deg," tenkte han.', label: 'Ord mot tanke-kontrast' },
            ],
        },
    },
    {
        id: 'kont-7-2',
        deviceId: 'kontrast',
        level: 7,
        instruction: 'Sorter eksemplene i riktig kategori.',
        data: {
            type: 'sort',
            categories: [
                { id: 'kontrast', label: 'Kontrast' },
                { id: 'sammenligning', label: 'Sammenligning' },
            ],
            items: [
                { text: 'Livet var som en dans. Døden var som en lang søvn.', categoryId: 'sammenligning' },
                { text: 'Lyset flommet inn i stuen. Kjelleren var svart som natten.', categoryId: 'kontrast' },
                { text: 'Hun var modig som en løve.', categoryId: 'sammenligning' },
                { text: 'Han snakket om fred, men handlingene hans skapte krig.', categoryId: 'kontrast' },
                { text: 'Stillheten skrek like høyt som ropene.', categoryId: 'sammenligning' },
                { text: 'Barnas latter fylte rommet. De voksnes taushet fylte alt annet.', categoryId: 'kontrast' },
            ],
        },
    },
    {
        id: 'kont-7-3',
        deviceId: 'kontrast',
        level: 7,
        instruction: 'Sant eller usant?',
        data: {
            type: 'true-false',
            statement: 'Kontrast og sammenligning er det samme virkemiddelet, bare med ulike ord.',
            correct: false,
            explanation: 'Usant! Sammenligning viser likhet mellom to ting (bruker ofte "som" eller "lik"), mens kontrast viser forskjeller og motsetninger. De er motsatte virkemidler: sammenligning binder sammen, kontrast splitter fra hverandre.',
        },
    },

    // === NIVÅ 8 ===
    {
        id: 'kont-8-1',
        deviceId: 'kontrast',
        level: 8,
        instruction: 'Sorter eksemplene etter hvilken funksjon kontrasten har.',
        data: {
            type: 'sort',
            categories: [
                { id: 'karakter', label: 'Viser noe om en karakter' },
                { id: 'samfunn', label: 'Kritiserer samfunnet' },
                { id: 'stemning', label: 'Skaper stemning' },
            ],
            items: [
                { text: 'Han smilte til alle på jobben, men hjemme satt han i mørket.', categoryId: 'karakter' },
                { text: 'Millionærens villa hadde utsikt over slummen.', categoryId: 'samfunn' },
                { text: 'Solen forsvant bak skyene. Skyggene krøp inn mellom trærne.', categoryId: 'stemning' },
                { text: 'Barna fikk gratis frukt. De voksne kjøpte øl for hundrelapper.', categoryId: 'samfunn' },
                { text: 'Utenpå var hun hard som stein. Inni seg var hun myk som ull.', categoryId: 'karakter' },
                { text: 'Stearinlyset flakket i vinden mens stormen ulte utenfor.', categoryId: 'stemning' },
            ],
        },
    },
    {
        id: 'kont-8-2',
        deviceId: 'kontrast',
        level: 8,
        instruction: 'Koble kontrasten med den dypere effekten.',
        data: {
            type: 'match',
            pairs: [
                { example: 'Soldaten drømte om fred mens kulene fløy over hodet hans.', label: 'Kontrasten mellom drøm og virkelighet viser krigens grusomhet' },
                { example: 'De unge stormet inn. De gamle satt stille igjen.', label: 'Kontrasten mellom generasjonene viser livets faser' },
                { example: 'Taleren snakket om rettferdighet fra sin gullstol.', label: 'Kontrasten mellom ord og handling avslører hykleri' },
                { example: 'Byen sov. Han var den eneste som var våken.', label: 'Kontrasten mellom mange og en skaper ensomhet' },
            ],
        },
    },
    {
        id: 'kont-8-3',
        deviceId: 'kontrast',
        level: 8,
        instruction: 'Sorter kontrastene etter styrke.',
        data: {
            type: 'sort',
            categories: [
                { id: 'subtil', label: 'Subtil kontrast' },
                { id: 'sterk', label: 'Sterk kontrast' },
            ],
            items: [
                { text: 'Livet og døden møttes i korridoren.', categoryId: 'sterk' },
                { text: 'Stemmen hans var litt lavere enn vanlig.', categoryId: 'subtil' },
                { text: 'Solen skinte, men det var litt kjølig i skyggen.', categoryId: 'subtil' },
                { text: 'Barnets latter gjallet gjennom gravplassen.', categoryId: 'sterk' },
                { text: 'Han smilte, men øynene var triste.', categoryId: 'subtil' },
                { text: 'Festen raste videre mens ambulansen kjørte bort.', categoryId: 'sterk' },
            ],
        },
    },

    // === NIVÅ 9 ===
    {
        id: 'kont-9-1',
        deviceId: 'kontrast',
        level: 9,
        instruction: 'Skriv en tekst der kontrast brukes bevisst for å forsterke et budskap.',
        data: {
            type: 'write',
            prompt: 'Skriv en tekst på 3-5 setninger der du bruker minst to typer kontrast (for eksempel indre/ytre, før/nå, rik/fattig). Forklar kort etter teksten hva kontrasten gjør med budskapet.',
            hint: 'Tenk på en situasjon der motsetninger eksisterer side om side. Hva vil du si med å sette dem opp mot hverandre?',
            exampleAnswer: 'På den ene siden av gaten sto barna i kø for gratis skolefrokost. På den andre siden kastet restauranten mat i søpla. (Kontrasten mellom sult og sløsing, fattig og rik, viser urettferdigheten i hvordan ressurser er fordelt.)',
        },
    },
    {
        id: 'kont-9-2',
        deviceId: 'kontrast',
        level: 9,
        instruction: 'Marker alle kontrastene og forklar hva de gjør.',
        data: {
            type: 'highlight',
            text: 'Den første skoledag var full av forventning og nye penner. Den siste skoledagen var full av tårer og minner. Klasserommet som en gang føltes enormt, var nå altfor lite. Læreren som en gang virket streng, viste seg å være den varmeste av dem alle.',
            correctRanges: [
                { words: 'Den første skoledag var full av forventning og nye penner. Den siste skoledagen var full av tårer og minner', explanation: 'Tidskontrast: Første mot siste, forventning mot tårer, nye ting mot minner. Viser hvordan alt har forandret seg.' },
                { words: 'Klasserommet som en gang føltes enormt, var nå altfor lite', explanation: 'Størrelses- og tidskontrast: Rommet har ikke endret seg, men personens opplevelse har. Viser indre vekst.' },
                { words: 'Læreren som en gang virket streng, viste seg å være den varmeste av dem alle', explanation: 'Kontrast mellom førsteinntrykk og virkelighet. Streng/varm viser at man kan ta feil av folk.' },
            ],
        },
    },
    {
        id: 'kont-9-3',
        deviceId: 'kontrast',
        level: 9,
        instruction: 'Forklar den sammensatte bruken av kontrast.',
        data: {
            type: 'explain',
            text: 'Bildene på veggen viste en lykkelig familie. Smilende ansikter, ferieturer, bursdager. Under bildene satt de nå i hver sin stol. Ingen sa et ord. Advokaten fordelte tingene deres med en penn og et skjema.',
            highlightedWords: 'Bildene på veggen viste en lykkelig familie',
            question: 'Hvordan bruker forfatteren kontrast for å fortelle om skilsmissen uten å nevne ordet?',
            options: [
                { text: 'Kontrasten mellom bildene (lykke, samhold, feiringer) og nåtiden (taushet, avstand, juridisk fordeling) forteller hele historien uten å si ordet "skilsmisse". Bildene blir smertefulle påminnelser om det som var.', correct: true, feedback: 'Riktig! Forfatteren lar kontrasten mellom da og nå gjøre alt arbeidet. Bildene på veggen er en stum kontrast til den kalde virkeligheten under dem.' },
                { text: 'At advokaten er en dårlig person', correct: false, feedback: 'Advokaten er nøytral. Det er kontrasten mellom fortid og nåtid som bærer budskapet.' },
                { text: 'At de ikke liker bildene', correct: false, feedback: 'Tvert imot - bildene viser hva de har mistet. Det er kontrasten mellom hva de hadde og hva de har nå som er effektfull.' },
            ],
        },
    },

    // === NIVÅ 10 ===
    {
        id: 'kont-10-1',
        deviceId: 'kontrast',
        level: 10,
        instruction: 'Skriv en tekst der kontrast brukes på flere nivåer samtidig.',
        data: {
            type: 'write',
            prompt: 'Skriv en kort tekst (4-6 setninger) der du bruker kontrast på minst tre nivåer: 1) mellom to personer eller situasjoner, 2) mellom det som sies og det som menes/gjøres, 3) mellom fortid og nåtid. Forklar kort etter teksten hvilke kontraster du har brukt og hva de oppnår sammen.',
            hint: 'Tenk på en situasjon der flere motsetninger virker samtidig. Lag for lag med kontrast gjør teksten rikere.',
            exampleAnswer: 'En gang delte de alt - hemmeligheter, drømmer, en framtid. Nå delte advokaten boligen i to. Han sa "alt vel" i telefonen til moren. Hun sa "helt fint" til venninna si. Begge løy. Sannheten bodde i stillheten mellom dem. (Tre lag: 1) Før/nå-kontrast mellom fellesskap og splittelse. 2) Ord/handling-kontrast: Begge later som alt er bra. 3) To parallelle løgner som speiler hverandre. Sammen viser kontrastene at skilsmissen er verre enn noen innrømmer.)',
        },
    },
    {
        id: 'kont-10-2',
        deviceId: 'kontrast',
        level: 10,
        instruction: 'Marker alle kontrastene og analyser hvordan de virker sammen.',
        data: {
            type: 'highlight',
            text: 'Nyttårsaften feiret de på taket av den dyreste bygningen i byen. Champagnen boblet i glassene deres. Fyrverkeriet lyste opp himmelen. Langt under dem, i kjelleren i samme bygning, sov en mann som ikke hadde råd til verken tak eller bobler. Han drømte om å fly. Over ham danset de som aldri hadde trengt å drømme.',
            correctRanges: [
                { words: 'på taket av den dyreste bygningen i byen', explanation: 'Fysisk kontrast: Taket mot kjelleren. De rike er bokstavelig talt over de fattige.' },
                { words: 'Champagnen boblet i glassene deres', explanation: 'Kontrasten forsterkes: Luksus (champagne, bobler) mot fattigdom (ikke råd til tak). "Bobler" kobles til begge verdener.' },
                { words: 'sov en mann som ikke hadde råd til verken tak eller bobler', explanation: 'Sosial kontrast: Hjemløshet finnes i samme bygning som rikdom. Ordspillet "tak" (over hodet / taket der festen er) binder kontrastene sammen.' },
                { words: 'Han drømte om å fly. Over ham danset de som aldri hadde trengt å drømme', explanation: 'Dypeste kontrast: Å drømme versus å aldri trenge å drømme. Den fattige drømmer om frihet, mens de rike allerede har den uten å verdsette den.' },
            ],
        },
    },
    {
        id: 'kont-10-3',
        deviceId: 'kontrast',
        level: 10,
        instruction: 'Analyser denne komplekse bruken av kontrast.',
        data: {
            type: 'explain',
            text: 'Bestemor hadde to hender. Den høyre hånden strikket gensere til barnebarna, bakte boller, og klappet de på kinnet. Den venstre hånden skrev brev til sønnen i fengsel, tørket tårer i hemmelighet, og holdt fast i sengehesten om natten når smertene kom. Alle kjente den høyre hånden. Ingen kjente den venstre.',
            highlightedWords: 'Bestemor hadde to hender',
            question: 'Forklar hvordan kontrasten mellom de to hendene fungerer som fortellerteknikk.',
            options: [
                { text: 'Hendene er ikke bare kroppsdeler, men symboler for to sider av livet: den synlige (omsorg, glede, trygghet) og den skjulte (sorg, smerte, ensomhet). Kontrasten mellom høyre og venstre avslører at bestemor bærer en tung byrde ingen ser. Den siste setningen forsterker alt ved å kontrastere "alle" mot "ingen".', correct: true, feedback: 'Riktig! Forfatteren bruker hendene som en elegant ramme for å vise to virkeligheter i ett liv. Kontrasten er både fysisk (høyre/venstre), tematisk (glede/sorg) og sosial (det synlige/det skjulte). Det er en mesterlig bruk av kontrast.' },
                { text: 'At bestemor er venstrehendt', correct: false, feedback: 'Det handler ikke om hvilken hånd som er dominant. Hendene er symboler for to sider av livet hennes.' },
                { text: 'At bestemor er gammel og syk', correct: false, feedback: 'Sykdom er bare ett element. Poenget er kontrasten mellom det alle ser og det ingen ser - hele den skjulte virkeligheten.' },
            ],
        },
    },
];
