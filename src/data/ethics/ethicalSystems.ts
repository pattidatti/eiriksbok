import type { EthicalSystem } from './types';

export const ethicalSystems: EthicalSystem[] = [
    // --- SECULAR THEORIES ---
    {
        id: 'utilitarianism',
        name: 'Utilititarisme',
        category: 'secular',
        description: 'En konsekvensetisk teori utviklet for å skape et vitenskapelig nøytralt grunnlag for moral. Den sier at en handling er god hvis den øker den totale lykken i verden. Det spiller ingen rolle hvem du er eller hva du mente; det er resultatet som teller.',
        keyPrinciples: [
            'Nytteprinsippet: Maksimer lyst og lykke (hedonisme), minimer smerte.',
            'Upartiskhet: Din egen eller din families lykke teller ikke mer enn en fremmeds.',
            'Aggregering: Vi legger sammen all lykke og trekker fra lidelse for å finne "netto nytte".'
        ],
        motto: 'Størst mulig lykke for flest mulig.',
        strategy: 'Regn ut hvilken handling som redder flest liv eller skaper mest glede totalt sett.',
        origin: 'Jeremy Bentham og John Stuart Mill (1700/1800-tallet)',
        articleLink: '/krle/etikk/utilitarisme'
    },
    {
        id: 'deontology',
        name: 'Pliktetikk',
        category: 'secular',
        description: 'Moral handler om å følge faste prinsipper uansett situasjon. Du har en plikt til å handle rett, selv om konsekvensene blir dårlige. Dette er en fornuftsbasert etikk som krever at regler skal gjelde likt for alle mennesker.',
        keyPrinciples: [
            'Det kategoriske imperativ: Handle bare etter regler du vil skal bli en allmenn lov.',
            'Menneskeverdsformuleringen: Aldri behandle et menneske bare som et middel, men som et mål i seg selv.',
            'Autonomi: Du er din egen lovgiver gjennom din egen fornuft.'
        ],
        motto: 'Gjør din plikt, følg din fornuft.',
        strategy: 'Velg det alternativet som respekterer universelle regler (som sannhet eller liv), selv om det koster mer.',
        origin: 'Immanuel Kant (1724–1804)',
        articleLink: '/krle/etikk/pliktetikk'
    },
    {
        id: 'virtue-ethics',
        name: 'Dydsetikk',
        category: 'secular',
        description: 'I stedet for å fokusere på regler eller konsekvenser, ser vi på personens karakter. En god handling er det en person med gode dyder ville gjort. Målet er å oppnå "det gode liv" gjennom å trene opp fornuften og handlingene våre.',
        keyPrinciples: [
            'Den gylne middelvei: En dyd er midtpunktet mellom to laster (f.eks. mot mellom feighet og dumdristighet).',
            'Froneis (Praktisk klokskap): Evnen til å vurdere hva som er rett i den konkrete situasjonen.',
            'Teleologi: Alt har et formål, og menneskets formål er å utvikle sine unike evner.'
        ],
        motto: 'Bli hva du er: et fornuftig og dydig vesen.',
        strategy: 'Spør deg selv: Hvilket valg krever mest mod, rettferdighet eller visdom i denne situasjonen?',
        origin: 'Aristoteles (384–322 f.Kr.)',
        articleLink: '/krle/etikk/dygdsetikk'
    },
    {
        id: 'existentialism',
        name: 'Eksistensialisme',
        category: 'secular',
        description: 'Det finnes ingen gudgitt plan eller natur som bestemmer hvem du er. Du skaper din egen verdi gjennom de valgene du tar. Å nekte for dette ansvaret er å leve "uautentisk". Frihet er menneskets kjerne.',
        keyPrinciples: [
            'Eksistens forutgår essens: Du må først eksistere, så definere hvem du er.',
            'Radikal frihet: Du er alltid fri til å velge annerledes, men du må bære ansvaret alene.',
            'Engasjement: Når du velger for deg selv, velger du på vegne av hele menneskeheten.'
        ],
        motto: 'Mennesket er dømt til å være fritt.',
        strategy: 'Finn valget som bevarer din integritet og frihet, og som du kan stå inne for med hele ditt vesen.',
        origin: 'Jean-Paul Sartre og Simone de Beauvoir (1900-tallet)',
        articleLink: '/krle/filosofi/beauvoir'
    },
    {
        id: 'natural-law',
        name: 'Naturalrett',
        category: 'secular',
        description: 'Det finnes en objektiv moralsk lov innebygget i naturen som mennesket kan finne ved hjelp av sin fornuft. Visse verdier, som retten til liv og familie, er biologisk og rasjonelt naturlige for alle mennesker.',
        keyPrinciples: [
            'Selvbevaring: Livet er et grunnleggende gode som må beskyttes.',
            'Fornuftens orden: Naturen har en struktur som fornuften kan avkode for å finne rett og galt.',
            'Menneskerettigheter: Alle mennesker har krav på respekt fordi de har den samme naturen.'
        ],
        motto: 'Gjør det gode, unngå det onde (etter naturens orden).',
        strategy: 'Velg det som beskytter livets naturlige gang, helse og menneskelig verdighet.',
        origin: 'Stoikerne og senere Thomas Aquinas (1225–1274)',
        articleLink: '/krle/etikk/naturrett'
    },
    {
        id: 'social-contract',
        name: 'Kontraktsteori',
        category: 'secular',
        description: 'Moral er ikke noe mystisk, men en praktisk avtale mellom mennesker for å unngå kaos og vold. Vi blir enige om regler som alle tjener på å følge, og vi gir opp noe frihet for å få beskyttelse fra staten og loven.',
        keyPrinciples: [
            'Naturtilstanden: Uten lover ville livet vært "ensomt, fattig, stygt, dyrisk og kort".',
            'Gjensidig samtykke: Lover er bare rettferdige hvis vi rasjonelt ville blitt enige om dem.',
            'Lojalitet: Når vi bor i et samfunn, har vi sagt ja til å følge reglene.'
        ],
        motto: 'Lover skaper fred og samarbeid.',
        strategy: 'Prioriter lover, samfunnsorden og avtaler som sikrer trygghet for alle.',
        origin: 'Thomas Hobbes og John Locke (1600-tallet)',
        articleLink: '/krle/filosofi/intro'
    },
    // --- RELIGIOUS SYSTEMS ---
    {
        id: 'christianity',
        name: 'Kristendom',
        category: 'religious',
        description: 'Etikken hviler på at mennesket er skapt i Guds bilde med en unik verdi. Kjernen er Guds bud og Jesu lære om barmhjertighet, der man skal se Kristus i "disse minste". Man handler ut fra takknemlighet for Guds nåde.',
        keyPrinciples: [
            'De ti bud: Inkluderer forbud mot drap, tyveri og falskt vitnesbyrd (2. Mosebok).',
            'Kjærlighetsbudet: Du skal elske din neste som deg selv (Bergprekenen).',
            'Menneskeverd: Hvert liv er hellig fra unnfangelse til død fordi Gud har gitt det.'
        ],
        motto: 'Alt dere gjorde mot én av disse mine minste brødre, gjorde dere mot meg.',
        strategy: 'Søk løsningen som viser mest barmhjertighet overfor den svake og respekterer de ti bud.',
        origin: 'Bibelen og Jesu lære (ca. år 30 e.Kr.)',
        articleLink: '/krle/religion/kristendom/sentrale-trekk'
    },
    {
        id: 'islam',
        name: 'Islam',
        category: 'religious',
        description: 'Moral er å overgi seg til Guds (Allahs) vilje gjennom Sharia – den rette vei. Etikken er helhetlig og dekker både forholdet til Gud og forholdet til samfunnet. Rettferdighet og balanse er de viktigste idealene.',
        keyPrinciples: [
            'Haqq (Rettferdighet/Sannhet): Å gi alle det de har krav på etter Guds lov.',
            'Ihsan (Gjøre det smukke): Å handle som om man ser Gud, for Han ser deg.',
            'Maqasid al-Sharia: Formålet med loven er å beskytte tro, liv, fornuft, etterslekt og eiendom.'
        ],
        motto: 'Handle rettferdig, for Gud elsker de rettferdige.',
        strategy: 'Velg det som beskytter felleskapets interesser og følger Guds åpenbarte lover.',
        origin: 'Koranen og profeten Muhammeds Sunna (600-tallet)',
        articleLink: '/krle/religion/islam/sentrale-trekk'
    },
    {
        id: 'judaism',
        name: 'Jødedom',
        category: 'religious',
        description: 'Etikken er fokusert på handlinger her og nå gjennom 613 bud (Mitzvot). Det er en "pakt-etikk" der mennesket er Guds partner i å fullføre skaperverket. Livet er den høyeste verdien og må alltid prioriteres.',
        keyPrinciples: [
            'Halakha: Den jødiske loven som veileder alle livets valg.',
            'Pikuach Nefesh: Plikten til å redde liv går foran alle andre bud (unntatt tre).',
            'Tzedakah: Rettferdighet gjennom å dele ressurser og ta vare på de fattige.'
        ],
        motto: 'Rettferdighet, rettferdighet skal du jage etter.',
        strategy: 'Finn løsningen som beskytter menneskeliv (Pikuach Nefesh) og oppfyller lovens krav til rettferdighet.',
        origin: 'Torahen og den muntlige læren (Tanakh/Talmud)',
        articleLink: '/krle/religion/jodedom/sentrale-trekk'
    },
    {
        id: 'hinduism',
        name: 'Hinduisme',
        category: 'religious',
        description: 'Moral handler om å leve i samsvar med Dharma – den universelle sosiale og kosmiske orden. Alle handlinger (Karma) får konsekvenser i dette eller neste liv. Målet er å handle uselvisk for å opprettholde verdens balanse.',
        keyPrinciples: [
            'Ahimsa: Ikke-vold mot alt levende (fordi Gud finnes i alt).',
            'Dharma: Din spesifikke plikt basert på din alder, kjønn og plass i samfunnet.',
            'Satya (Sannhet): Å leve og tale i samsvar med den åndelige virkeligheten.'
        ],
        motto: 'Dharma beskytter dem som beskytter Dharma.',
        strategy: 'Velg ikke-vold (Ahimsa) og handlinger som opprettholder din personlige og sosiale plikt.',
        origin: 'Vedaene, Upanishadene og Bhagavadgita',
        articleLink: '/krle/religion/hinduisme/sentrale-trekk'
    },
    {
        id: 'buddhism',
        name: 'Buddisme',
        category: 'religious',
        description: 'Etikken er et verktøy for å frigjøre seg selv og andre fra lidelse (Dukkha). Alt henger sammen, og derfor er skade på andre også skade på seg selv. Man fokuserer på intensjon (det du har i hjertet) og medfølelse.',
        keyPrinciples: [
            'De fem levereglene: Avstå fra å drepe, stjele, lyve, seksuell umoral og rus.',
            'Karuna (Medfølelse): Ønsket om at alle vesener skal slippe lidelse.',
            'Upaya (Dugelige midler): Å tilpasse handlingen slik at den gjør mest mulig nytte for mottakeren.'
        ],
        motto: 'Unngå det onde, gjør det gode, og rens ditt eget sinn.',
        strategy: 'Finn alternativet som gir minst lidelse og mest medfølelse for alle involverte parter.',
        origin: 'Siddhartha Gautama (Buddha) (ca. 500 f.Kr.)',
        articleLink: '/krle/religion/buddisme/sentrale-trekk'
    },
    {
        id: 'sikhisme',
        name: 'Sikhisme',
        category: 'religious',
        description: 'Sikh-etikk er en aktivistisk moral. Man skal tjene Gud ved å tjene menneskeheten. Likestilling, hardt arbeid og forsvar for undertrykte er fundamentet. Man skal kjempe mot de "fem indre fiender" som grådighet og hovmod.',
        keyPrinciples: [
            'Seva: Uselvisk tjeneste for alle, uavhengig av religion eller kaste.',
            'Sarbat da Bhala: Å be om og arbeide for velferd for hele menneskeheten.',
            'Dharam Yudh: Plikten til å kjempe for rettferdig og mot tyranni når alt annet feiler.'
        ],
        motto: 'Sannheten er høyere enn alt, men høyere enn sannheten er sannferdig liv.',
        strategy: 'Se etter valg som fremmer likestilling, uselvisk hjelp eller kamp mot urettferdighet.',
        origin: 'Guru Nanak og de ti sikh-guruene (1469–1708)',
        articleLink: '/krle/religion/sikhisme/sentrale-trekk'
    }
];
