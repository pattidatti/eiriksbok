import { lazy } from 'react';
import type { MicroGameEntry } from './types';

// Registry over alle mikro-spill. Hvert spill lazy-lastes — ingen tunge
// avhengigheter belaster bundle før eleven faktisk åpner et spill.
// Three.js-avhengige spill (3D) blir kun lastet når eleven åpner dem.

const GladiusDuel = lazy(() => import('./GladiusDuel'));
const Colosseum3D = lazy(() => import('./Colosseum3D'));
const TheodosianWalls3D = lazy(() => import('./TheodosianWalls3D'));
const Hamskiftet3D = lazy(() => import('./Hamskiftet3D'));
const VikingShip3D = lazy(() => import('./VikingShip3D'));
const SymbolerPaaTaket3D = lazy(() => import('./SymbolerPaaTaket3D'));
const IngenmanslandMG = lazy(() => import('./IngenmanslandMG'));
const TidensFormer3D = lazy(() => import('./TidensFormer3D'));
const DampmaskinHjerte3D = lazy(() => import('./DampmaskinHjerte3D'));
const Falanksen3D = lazy(() => import('./Falanksen3D'));
const OlympiaDiskos3D = lazy(() => import('./OlympiaDiskos3D'));
const Vannmolla3D = lazy(() => import('./Vannmolla3D'));
const Konklusjonsbroen3D = lazy(() => import('./Konklusjonsbroen3D'));
const MonumentTorget3D = lazy(() => import('./MonumentTorget3D'));
const Teknologibolgen3D = lazy(() => import('./Teknologibolgen3D'));
const Nyheitsbobla3D = lazy(() => import('./Nyheitsbobla3D'));
const Konsekvensbolgen3D = lazy(() => import('./Konsekvensbolgen3D'));
const Levekaarsgapet3D = lazy(() => import('./Levekaarsgapet3D'));
const Streikefronten3D = lazy(() => import('./Streikefronten3D'));
const Perspektivkjernen3D = lazy(() => import('./Perspektivkjernen3D'));
const Datasporet3D = lazy(() => import('./Datasporet3D'));
const AnsikteneIMengden3D = lazy(() => import('./AnsikteneIMengden3D'));
const Grenselinja3D = lazy(() => import('./Grenselinja3D'));
const Maktbalansen3D = lazy(() => import('./Maktbalansen3D'));
const TaushetsspiralenTorg3D = lazy(() => import('./TaushetsspiralenTorg3D'));
const Spillereglene3D = lazy(() => import('./Spillereglene3D'));
const Spleiselaget3D = lazy(() => import('./Spleiselaget3D'));
const Maktskiftet3D = lazy(() => import('./Maktskiftet3D'));
const Argumentbroen3D = lazy(() => import('./Argumentbroen3D'));
const GobekliTepe3D = lazy(() => import('./GobekliTepe3D'));
const GudenesVerden3D = lazy(() => import('./GudenesVerden3D'));
const GreskTeater3D = lazy(() => import('./GreskTeater3D'));
const GutenbergPresse3D = lazy(() => import('./GutenbergPresse3D'));
const DemokratiLysene3D = lazy(() => import('./DemokratiLysene3D'));
const Testudo3D = lazy(() => import('./Testudo3D'));
const Chinampabyen3D = lazy(() => import('./Chinampabyen3D'));
const Kanalbyggeren3D = lazy(() => import('./Kanalbyggeren3D'));
const SamiskGjenreising3D = lazy(() => import('./SamiskGjenreising3D'));
const ForeneUnionen3D = lazy(() => import('./ForeneUnionen3D'));
const HagiaSofia3D = lazy(() => import('./HagiaSofia3D'));
const Pompeii3D = lazy(() => import('./Pompeii3D'));
const PakkAmerikakofferten3D = lazy(() => import('./PakkAmerikakofferten3D'));
const Pyramidebyggeren3D = lazy(() => import('./Pyramidebyggeren3D'));
const KalmarKronene3D = lazy(() => import('./KalmarKronene3D'));
const Pestrute3D = lazy(() => import('./Pestrute3D'));
const KristendomSpredning3D = lazy(() => import('./KristendomSpredning3D'));
const TikkunOlam3D = lazy(() => import('./TikkunOlam3D'));
const SamsaraSyklusen3D = lazy(() => import('./SamsaraSyklusen3D'));
const MokshaVeien3D = lazy(() => import('./MokshaVeien3D'));
const MarsjenMotRoma3D = lazy(() => import('./MarsjenMotRoma3D'));
const VektenIWien3D = lazy(() => import('./VektenIWien3D'));
const Vesterleden3D = lazy(() => import('./Vesterleden3D'));
const Gangen3D = lazy(() => import('./Gangen3D'));
const EuropaBroen3D = lazy(() => import('./EuropaBroen3D'));
const SkjulteSymboler3D = lazy(() => import('./SkjulteSymboler3D'));
const FestensLys3D = lazy(() => import('./FestensLys3D'));
const MatreglerBord3D = lazy(() => import('./MatreglerBord3D'));
const Rikssamlingen3D = lazy(() => import('./Rikssamlingen3D'));
const RismarkOgMakt3D = lazy(() => import('./RismarkOgMakt3D'));

export const MICRO_GAMES: Record<string, MicroGameEntry & { Component: React.LazyExoticComponent<React.ComponentType<unknown>> }> = {
    'rikssamlingen-3d': {
        id: 'rikssamlingen-3d',
        title: 'Rikssamlingen: da Norge ble ett',
        description:
            'Et stilisert kystkart der hvert rike har sin egen smaakonge. Klikk rikene ett for ett og legg dem under Harald, og se kystleia Nordvegen lyse opp i gull. Et morkt gap blir staaende ved Hafrsfjord til du tar det avgjorende slaget rundt aar 872. Lyspaeren: Norge ble ett rike fordi Harald tok kontroll over kysten og vant i Hafrsfjord.',
        estimatedSeconds: 150,
        loader: () => import('./Rikssamlingen3D'),
        Component: Rikssamlingen3D as never,
    },
    'matreglerbordet-3d': {
        id: 'matreglerbordet-3d',
        title: 'Matreglerbordet',
        description:
            'Det samme bordet med svin, oksekjøtt, reker, fisk, vin og brød. Velg en religion og se hvilke matvarer som blir lov (grønne) og forbudt (røde). Lyspæren: samme mat kan være helt vanlig i én religion og forbudt i en annen.',
        estimatedSeconds: 150,
        loader: () => import('./MatreglerBord3D'),
        Component: MatreglerBord3D as never,
    },
    'festens-lys-3d': {
        id: 'festens-lys-3d',
        title: 'Festens lys',
        description:
            'Fire religioner, fire høytider - jul, hanukka, divali og id. Tenn lysene på hvert høytidsbord og se rommet lyse opp. Lyspæren: alle kulturer feirer med lys, mat og samling, selv om de tror på ulike ting.',
        estimatedSeconds: 140,
        loader: () => import('./FestensLys3D'),
        Component: FestensLys3D as never,
    },
    'symboler-paa-taket-3d': {
        id: 'symboler-paa-taket-3d',
        title: 'Symbolene på taket',
        description:
            'Tre gudshus står på rad: en kirke, en moské og en synagoge. Dra korset, halvmånen og davidsstjernen opp på riktig tak, så lyser huset opp. Lyspæren: symbolet på taket forteller deg hvilken tro huset hører til, lenge før du går inn.',
        estimatedSeconds: 120,
        loader: () => import('./SymbolerPaaTaket3D'),
        Component: SymbolerPaaTaket3D as never,
    },
    'skjulte-symboler-3d': {
        id: 'skjulte-symboler-3d',
        title: 'Skjulte symboler i populærkulturen',
        description:
            'Et helt vanlig ungdomsrom er fullt av religion. Klikk de fem tingene som gjemmer et religiøst symbol - superhelt-plakaten, filmen, Buddha-statuen, julelåten og spillet - og se rommet lyse opp. Lyspæren: religion lever videre i film, musikk og spill, ofte uten at vi tenker over det.',
        estimatedSeconds: 120,
        loader: () => import('./SkjulteSymboler3D'),
        Component: SkjulteSymboler3D as never,
    },
    'europa-broen-3d': {
        id: 'europa-broen-3d',
        title: 'Broen til Europa',
        description:
            'Dra spaken fra "Stå alene" til "Fullt EU-medlem" og se hva Norge får og gir fra seg: marked, innflytelse og selvstyre.',
        estimatedSeconds: 150,
        loader: () => import('./EuropaBroen3D'),
        Component: EuropaBroen3D as never,
    },
    'gladius-duell': {
        id: 'gladius-duell',
        title: 'Gladius-duell',
        description:
            'Turbasert sverdduell mot en romersk gladiator. Lær å lese motstanderens trekk.',
        estimatedSeconds: 180,
        loader: () => import('./GladiusDuel'),
        Component: GladiusDuel as never,
    },
    'colosseum-3d': {
        id: 'colosseum-3d',
        title: 'Roter Colosseum',
        description:
            'Bla rundt Colosseum i 3D og klikk de fire etasjene i riktig byggerekkefølge.',
        estimatedSeconds: 120,
        loader: () => import('./Colosseum3D'),
        Component: Colosseum3D as never,
    },
    'teodosianmuren': {
        id: 'teodosianmuren',
        title: 'Teodosianmuren',
        description:
            'Roter Konstantinopels trippelmur i 3D, finn de fire forsvarslagene, og se Mehmet 2.s kanon knuse muren i 1453.',
        estimatedSeconds: 120,
        loader: () => import('./TheodosianWalls3D'),
        Component: TheodosianWalls3D as never,
    },
    'hamskiftet-3d': {
        id: 'hamskiftet-3d',
        title: 'Det store hamskiftet',
        description:
            'Forvandle en norsk bygd i 3D: bygg jernbanen, kjøp slåmaskinen, og se husmennene dra til Amerika og byen.',
        estimatedSeconds: 150,
        loader: () => import('./Hamskiftet3D'),
        Component: Hamskiftet3D as never,
    },
    'vikingskip-3d': {
        id: 'vikingskip-3d',
        title: 'Bygg vikingskipet',
        description:
            'Bygg et vikingskip i 3D: dra kjølen på plass, klink bordgangene, reis masten, og form skroget til langskip eller knarr.',
        estimatedSeconds: 160,
        loader: () => import('./VikingShip3D'),
        Component: VikingShip3D as never,
    },
    'ingenmannsland-mg': {
        id: 'ingenmannsland-mg',
        title: 'Maskingevær ved Somme',
        description:
            'Forsvar en britisk skyttergrav i 3D: skyt soldater som løper over ingenmannsland og kjenn på kroppen hvorfor Vestfronten stivnet.',
        estimatedSeconds: 130,
        loader: () => import('./IngenmanslandMG'),
        Component: IngenmanslandMG as never,
    },
    'tidens-former-3d': {
        id: 'tidens-former-3d',
        title: 'Tidens to former',
        description:
            'Kjenn på eskatologiens kjerne i 3D: la en verden løpe gjennom skapelse, blomstring, forfall og undergang - og se hvordan tidshjulet (sirkulær tid) føder den på ny, mens tidspilen (lineær tid) ender i ett evig punktum.',
        estimatedSeconds: 150,
        loader: () => import('./TidensFormer3D'),
        Component: TidensFormer3D as never,
    },
    'dampmaskin-hjerte-3d': {
        id: 'dampmaskin-hjerte-3d',
        title: 'Dampmaskinens hjerte',
        description:
            'Kjoer en dampmaskin i 3D: pump gruva med spaken, sett inn Watts separate kondensator, og kjenn paa kroppen hvorfor den holdt sylinderen varm og sparte tre fjerdedeler av kullet.',
        estimatedSeconds: 150,
        loader: () => import('./DampmaskinHjerte3D'),
        Component: DampmaskinHjerte3D as never,
    },
    'falanksen-3d': {
        id: 'falanksen-3d',
        title: 'Bygg falanksen',
        description:
            'Still opp en gresk hoplitt-falanks i 3D: plasser mennene, skyv skjoldene tett sammen, og stå imot fiendens angrep. Kjenn hvorfor skjoldmuren var så sterk.',
        estimatedSeconds: 140,
        loader: () => import('./Falanksen3D'),
        Component: Falanksen3D as never,
    },
    'olympia-diskos-3d': {
        id: 'olympia-diskos-3d',
        title: 'Diskos paa Olympia',
        description:
            'Kast diskos paa Olympias hellige stadion i 3D: still inn vinkel og kraft, se kastebanen, og slaa rekorden for aa vinne olivenkransen. Oppdag at diskosen flyr lengst ved rundt 45 grader.',
        estimatedSeconds: 140,
        loader: () => import('./OlympiaDiskos3D'),
        Component: OlympiaDiskos3D as never,
    },
    'gresk-teater-3d': {
        id: 'gresk-teater-3d',
        title: 'Bygg det greske teateret',
        description:
            'Sett sammen et gresk teater i 3D: legg ned orkhestra (dansegulvet), reis tilskuerplassene i en halvsirkel og bygg skene (scenehuset). Se hvordan formen baerer lyden helt opp til oeverste rad.',
        estimatedSeconds: 150,
        loader: () => import('./GreskTeater3D'),
        Component: GreskTeater3D as never,
    },
    'vannmolla-3d': {
        id: 'vannmolla-3d',
        title: 'Mølla som aldri ble trøtt',
        description:
            'La elva male kornet i 3D: hell korn i trakta, åpne slusen så vannhjulet og tannhjulene driver kvernsteinene, koble inn stamphammeren, og vri mølla mot vinden når elva tørker inn.',
        estimatedSeconds: 150,
        loader: () => import('./Vannmolla3D'),
        Component: Vannmolla3D as never,
    },
    'konklusjonsbroen-3d': {
        id: 'konklusjonsbroen-3d',
        title: 'Bygg konklusjonsbroen',
        description:
            'Bygg broen fra spørsmålet til en gyldig konklusjon i 3D: velg solid metode eller fristende snarvei for hvert av de fem stegene, og send konklusjonen over kløfta. Én råtten planke, og hele konklusjonen faller gjennom.',
        estimatedSeconds: 150,
        loader: () => import('./Konklusjonsbroen3D'),
        Component: Konklusjonsbroen3D as never,
    },
    'monument-torget-3d': {
        id: 'monument-torget-3d',
        title: 'Hvem får stå på sokkelen?',
        description:
            'Kuratér et by-torg i 3D: velg hvem byen hedrer med statue blant konger, helter, arbeidere, en samisk leder og en forsker. Reiser du bare makt - eller bare vanlige folk - blir torget ensidig, og de glemte dukker opp som skygger i kantene. Et torg som blander flere historier lar flere kjenne seg igjen.',
        estimatedSeconds: 150,
        loader: () => import('./MonumentTorget3D'),
        Component: MonumentTorget3D as never,
    },
    'teknologibolgen-3d': {
        id: 'teknologibolgen-3d',
        title: 'Teknologibølgja',
        description:
            'Skru opp teknologien i 3D og se en bygd forvandle seg på tre arenaer samtidig: folk får verktøy men noen mister jobben, byen vokser men naturen forurenses. Oppdag at gevinst og kostnad alltid stiger sammen - og at grønn teknologi kan rydde opp.',
        estimatedSeconds: 140,
        loader: () => import('./Teknologibolgen3D'),
        Component: Teknologibolgen3D as never,
    },
    'nyheitsbobla-3d': {
        id: 'nyheitsbobla-3d',
        title: 'Nyheitsbordet',
        description:
            'Vel tre nyhende du ville lest, og sjå korleis algoritmen gøymer dei andre under bordet. Klikk "Sjå alt!" for å oppdage blindsonene dine.',
        estimatedSeconds: 120,
        loader: () => import('./Nyheitsbobla3D'),
        Component: Nyheitsbobla3D as never,
    },
    'konsekvensbolgen-3d': {
        id: 'konsekvensbolgen-3d',
        title: 'Konsekvensbølgen',
        description:
            'Sikre forutsetningene som hindrer krig - meklingsorgan, økonomisk samhandel og demokratisk fred - før du tenner gnisten i sentrum. Sikrer du alle tre, dør gnisten ut. Sikrer du for få, ruller en sjokkbølge utover og rammer matpriser, energi, flyktninger og handel langt utenfor konfliktsonen.',
        estimatedSeconds: 130,
        loader: () => import('./Konsekvensbolgen3D'),
        Component: Konsekvensbolgen3D as never,
    },
    'levekaarsgapet-3d': {
        id: 'levekaarsgapet-3d',
        title: 'Levekårsgapet',
        description:
            'To land med et hav imellom: når levekårsgapet er stort, strømmer folk over. Bygg skole, klinikk og arbeid i hjemlandet, og se gapet krympe og migrasjonen stoppe. Det er ikke avstand, men levekår, som avgjør om folk blir.',
        estimatedSeconds: 130,
        loader: () => import('./Levekaarsgapet3D'),
        Component: Levekaarsgapet3D as never,
    },
    'streikefronten-3d': {
        id: 'streikefronten-3d',
        title: 'Streikefronten',
        description:
            'Rekrutter alle fem arbeidergruppene til streiken i en 1890-talls fabrikk i Kristiania. Klikk på gruppene og se dem marsjere til streikefronten. Når alle er med, stanser fabrikken. Lyspæren: alene kan du klage - men organisert kan du endre.',
        estimatedSeconds: 90,
        loader: () => import('./Streikefronten3D'),
        Component: Streikefronten3D as never,
    },
    'perspektivkjernen-3d': {
        id: 'perspektivkjernen-3d',
        title: 'Lys opp problemet',
        description:
            'En grå problemkjerne med fire mørke sider svever i et lyst rom. Klikk perspektiv-skårene rundt: hvert NYE perspektiv lyser opp én side, men samme vinkel viser ingen ny. Først når fire ulike perspektiver er på, lyser hele kjernen. Lyspæren: ulike vinkler ser flere sider - kognitiv mangfoldighet.',
        estimatedSeconds: 140,
        loader: () => import('./Perspektivkjernen3D'),
        Component: Perspektivkjernen3D as never,
    },
    'datasporet-3d': {
        id: 'datasporet-3d',
        title: 'Datasporet',
        description:
            'Du er algoritmen. Samle fem passive digitale spor som flyter rundt en person, og se profilkonfidansen stige. Lyspæren: hvert spor er ufarlig alene - kombinasjonen gir et komplett portrett.',
        estimatedSeconds: 120,
        loader: () => import('./Datasporet3D'),
        Component: Datasporet3D as never,
    },
    'ansiktene-i-mengden-3d': {
        id: 'ansiktene-i-mengden-3d',
        title: 'Ansiktene i mengden',
        description:
            'En gruppe er gjort om til gra, ansiktslose skikkelser med et propaganda-symbol over seg - "dem". Klikk hver skikkelse og se enkeltmennesket bak: egen farge, ansikt og detalj. Etter hvert som ansiktene kommer fram, smuldrer propagandaen og muren mellom "oss" og "dem" synker. Lyspaeren: det er vanskelig a hate dem du ser som mennesker.',
        estimatedSeconds: 110,
        loader: () => import('./AnsikteneIMengden3D'),
        Component: AnsikteneIMengden3D as never,
    },
    'grenselinja-3d': {
        id: 'grenselinja-3d',
        title: 'Hold grensa di',
        description:
            'Du står i sentrum på din egen grenselinje. Fem relasjoner lener seg inn med et press som krysser en grense - og jo nærmere de står, desto hardere presser de. Klikk hver og hold grensa. De som respekterer den, blir stående hos deg. Gjengen som bare ga deg et ultimatum, forsvinner når du står for noe. Lyspæren: det er vanskeligst å si nei til dem du står nærmest.',
        estimatedSeconds: 110,
        loader: () => import('./Grenselinja3D'),
        Component: Grenselinja3D as never,
    },
    'maktbalansen-3d': {
        id: 'maktbalansen-3d',
        title: 'Balanser makta',
        description:
            'En glødende avgjørelse svever over en arena med fire maktaktør-pilarer (Politikk, Næringsliv, Media, Sivilsamfunn). Klikk en aktør og se den trekke avgjørelsen mot seg - én aktør alene drar den helt skjevt. Først når alle fire motvektene trekker samtidig, balanserer de hverandre og avgjørelsen lander i den legitime midtringen. Lyspæren: spredt makt med flere motvekter gir en balansert, legitim avgjørelse.',
        estimatedSeconds: 120,
        loader: () => import('./Maktbalansen3D'),
        Component: Maktbalansen3D as never,
    },
    'taushetsspiralen-3d': {
        id: 'taushetsspiralen-3d',
        title: 'Bryt taushetsspiralen',
        description:
            'Et digitalt forum der to høyrøstede figurer dominerer mikrofonen mens fire nyanserte stemmer tier i periferien. Klikk «Oppmuntre» ved hver stille figur – de glir inn mot plattformen og debatten blir gradvis mer mangfoldig. Lyspæren: demokratiet er sterkere når alle tør å delta, ikke bare de fem prosentene som alltid ytrer seg.',
        estimatedSeconds: 120,
        loader: () => import('./TaushetsspiralenTorg3D'),
        Component: TaushetsspiralenTorg3D as never,
    },
    'argumentbroen-3d': {
        id: 'argumentbroen-3d',
        title: 'Bygg argumentbroen',
        description:
            'Et bredt gap skiller Belegg-tårnet fra Påstand-tårnet. Tre planker svever i lufta - klikk den som virkelig forklarer hvorfor belegget støtter påstanden. Riktig planke glir på plass og broen holder. Feil planke faller i kløften. Lyspæren: uten forklaringen henger påstand og belegg på hver sin side av tomrommet.',
        estimatedSeconds: 90,
        loader: () => import('./Argumentbroen3D'),
        Component: Argumentbroen3D as never,
    },
    'spillereglene-3d': {
        id: 'spillereglene-3d',
        title: 'Spillet trenger regler',
        description:
            'Et spill uten regler er rent kaos: spillerne løper hvor de vil og ballen spretter vilt. Legg på de tre regelnivåene ett om gangen - regler gir banen rammer, loven gir en dommer som håndhever rettferdig, og normene får laget til å samarbeide av seg selv. Aha-en: samfunnet trenger alle tre nivåene sammen for at spillet skal funke.',
        estimatedSeconds: 120,
        loader: () => import('./Spillereglene3D'),
        Component: Spillereglene3D as never,
    },
    'maktskiftet-3d': {
        id: 'maktskiftet-3d',
        title: 'Fredelig maktskifte',
        description:
            'Den skarpeste prøven på et demokrati: kan stemmen din bytte ut dem som styrer? Riv de tre barrierene autoritære system bruker - sensurmur, godkjenningsport og partidommer - og avgi stemmen. Står barrierene, blokkeres stemmen og du er innbygger, ikke medborger. Er de borte, når stemmen fram, den gamle lederen trer av og en folkevalgt reiser seg.',
        estimatedSeconds: 120,
        loader: () => import('./Maktskiftet3D'),
        Component: Maktskiftet3D as never,
    },
    'gudenes-verden-3d': {
        id: 'gudenes-verden-3d',
        title: 'Vekk gudene på Olympen',
        description:
            'Olympen reiser seg i en grå, uforklart verden. Klikk hver sovende gud og vekk den - Zevs himmelen, Poseidon havet, Hades de døde, Demeter åkeren, Afrodite kjærligheten og Athene visdommen. Når alle seks er våkne, lyser hele verden. Lyspæren: hver gud eide sin del av verden, og sammen forklarte de alt grekerne så.',
        estimatedSeconds: 130,
        loader: () => import('./GudenesVerden3D'),
        Component: GudenesVerden3D as never,
    },
    'spleiselaget-3d': {
        id: 'spleiselaget-3d',
        title: 'Spleiselaget',
        description:
            'Velferdsstaten som spleiselag i 3D: koble innbyggerne på felleskassa og se pengene flyte inn etter evne (den med høyest inntekt betaler mest) og ut etter behov (gratis skole, helsehjelp, pensjon). Lyspæren: velferd bærer bare når nesten alle er med - universelt, solidarisk og obligatorisk.',
        estimatedSeconds: 110,
        loader: () => import('./Spleiselaget3D'),
        Component: Spleiselaget3D as never,
    },
    'gobekli-tepe-3d': {
        id: 'gobekli-tepe-3d',
        title: 'Reis tempelet på Magehøyden',
        description:
            'Reis de tunge T-pilarene på Göbekli Tepe i 3D: kall flokken til tauet med spaken og hal steinen opp. Jegerne hadde verken hjul, metall eller pakkdyr - bare mange hender. For hver tyngre pilar må du kalle på enda flere. Lyspæren: en så stor flokk måtte mettes igjen og igjen, og det behovet kan ha drevet fram jordbruket.',
        estimatedSeconds: 150,
        loader: () => import('./GobekliTepe3D'),
        Component: GobekliTepe3D as never,
    },
    'gutenberg-presse-3d': {
        id: 'gutenberg-presse-3d',
        title: 'Gutenbergs presse',
        description:
            'Kjenn boktrykkerkunstens kjerne i 3D: sett de loese metalbokstavene en gang, sverte dem, og dra pressen ned. Saa trykker du den samme siden om og om igjen mens munken i hjoernet fortsatt sliter med sin ene haandkopierte side.',
        estimatedSeconds: 150,
        loader: () => import('./GutenbergPresse3D'),
        Component: GutenbergPresse3D as never,
    },
    'demokrati-lysene-3d': {
        id: 'demokrati-lysene-3d',
        title: 'Demokratiets vaktmester',
        description:
            'Vern demokratiene du tror kan reddes med tre skjold, dra så året fra 1920 til 1939 og se 26 europeiske demokratier slukne. Skjoldene sprekker - der presset var størst, falt lyset uansett. I 1938 er bare 11 igjen.',
        estimatedSeconds: 120,
        loader: () => import('./DemokratiLysene3D'),
        Component: DemokratiLysene3D as never,
    },
    'testudo-3d': {
        id: 'testudo-3d',
        title: 'Bygg skilpadda (testudo)',
        description:
            'Bygg den romerske skilpadda i 3D: klikk legionaerene saa ytterringen reiser skjoldveggene og de fire i midten legger taket over hodet. Slipp saa pilregnet loes og se pilene klatre av skallet. Lyspaeren: en mann alene er saarbar, men hver manns skjold paa rett plass gjoer troppen til en bevegelig festning.',
        estimatedSeconds: 150,
        loader: () => import('./Testudo3D'),
        Component: Testudo3D as never,
    },
    'chinampabyen-3d': {
        id: 'chinampabyen-3d',
        title: 'Bygg byen på vannet',
        description:
            'Bygg aztekernes hovedstad Tenochtitlán i 3D: dra de flytende hagene (chinampas) ut på innsjøen og plant dem. For hver hage vokser matmengden, husene reiser seg på den hellige øya, og folketallet stiger mot 200 000. Lyspæren: aztekerne dyrket mat på vannet, og det smarte jordbruket gjorde det mulig å fø en av verdens største byer.',
        estimatedSeconds: 120,
        loader: () => import('./Chinampabyen3D'),
        Component: Chinampabyen3D as never,
    },
    'kanalbyggeren-3d': {
        id: 'kanalbyggeren-3d',
        title: 'Grav kanalene i Sumer',
        description:
            'Led vannet fra Eufrat og Tigris ut til de tørre åkrene i Mesopotamia: klikk over hver åker for å grave en kanal, og se jorda bli grønn og kornet spire. For hver vannet åker vokser byen i midten, lag for lag, til zigguraten står. Lyspæren: elvene flommet til feil tid, så bøndene måtte grave kanaler og samarbeide for å styre vannet. Samarbeidet og matoverskuddet er en av hovedgrunnene til at verdens første byer vokste fram her.',
        estimatedSeconds: 130,
        loader: () => import('./Kanalbyggeren3D'),
        Component: Kanalbyggeren3D as never,
    },
    'samisk-gjenreising-3d': {
        id: 'samisk-gjenreising-3d',
        title: 'Gjenreis den samiske kulturen',
        description:
            'Fornorskinga prøvde å viske ut samisk språk og kultur. Klikk de fem grå kulturuttrykkene - lávvu, rein, kofte, joik og språk - og vekk dem til live igjen. Når alt er gjenreist, synker internatskolen og det samiske flagget heises. Lyspæren: en kultur kan dempes, men den kan også reise seg igjen.',
        estimatedSeconds: 120,
        loader: () => import('./SamiskGjenreising3D'),
        Component: SamiskGjenreising3D as never,
    },
    'forene-unionen-3d': {
        id: 'forene-unionen-3d',
        title: 'Forene unionen',
        description:
            'Den amerikanske borgerkrigen i 3D: landet starter delt i to, et fritt industrielt Nord og et Sør bygd på slaveri, med en lysende sprekk imellom. Driv historien framover i tre steg - krigen bryter ut (1861), slaveriet avskaffes (1863) der lenkene faller og figurene reiser seg, og unionen samles igjen (1865) der de to halvdelene glir sammen og flagget reiser seg. Lyspæren: krig, frigjøring og samling gjorde et splittet slaveland om til én fri nasjon.',
        estimatedSeconds: 150,
        loader: () => import('./ForeneUnionen3D'),
        Component: ForeneUnionen3D as never,
    },
    'hagia-sofia-3d': {
        id: 'hagia-sofia-3d',
        title: 'Reis Hagia Sofias kuppel',
        description:
            'Bygg bysantinernes mesterverk i tre grep: spenn pendentivene som gjør firkanten om til en sirkel, reis ringen med 40 vinduer, og hev den store kuppelen på plass. Når lyset strømmer inn gjennom vindusringen, ser den tunge kuppelen ut til å sveve. Lyspæren: bysantinerne brukte ny ingeniørkunst - pendentiver og en krans av lys - til å skape en følelse av at himmelen åpnet seg over deg.',
        estimatedSeconds: 140,
        loader: () => import('./HagiaSofia3D'),
        Component: HagiaSofia3D as never,
    },
    'pompeii-3d': {
        id: 'pompeii-3d',
        title: 'Pompeii: byen som ble frosset',
        description:
            'Dra spaken og la Vesuv begrave Pompeii i aske til hele byen forsvinner. Så går 1700 år, asken synker til ruinnivå, og du graver fram tre ting asken har bevart akkurat slik de var i år 79: et fargesterkt veggmaleri, et brød som fortsatt står i ovnen, og en gipsavstøpning av et menneske i sitt siste øyeblikk. Lyspæren: det som ødela Pompeii reddet den også, for den samme asken som kvalte byen forseglet alt - derfor er Pompeii en tidskapsel.',
        estimatedSeconds: 150,
        loader: () => import('./Pompeii3D'),
        Component: Pompeii3D as never,
    },
    'pakk-amerikakofferten-3d': {
        id: 'pakk-amerikakofferten-3d',
        title: 'Pakk amerikakofferten',
        description:
            'Det er 1880-tallet, og familien din skal utvandre til Amerika. Rundt en åpen koffert i stua ligger åtte eiendeler - Bibelen, familiebildet, bestemors sølje, verktøykassa, ullteppet, matsekken, rokken og barnas treleke. Men kofferten har plass til bare fem. Klikk det du vil ta med, bytt om du ombestemmer deg, og lukk lokket. Lyspæren: du kunne bare ta med én koffert, og alt annet - og alle du var glad i - måtte bli igjen.',
        estimatedSeconds: 140,
        loader: () => import('./PakkAmerikakofferten3D'),
        Component: PakkAmerikakofferten3D as never,
    },
    'pyramidebyggeren-3d': {
        id: 'pyramidebyggeren-3d',
        title: 'Bygg Khufus pyramide',
        description:
            'Bygg den store pyramiden ved Giza i 3D, lag for lag. Dra spaken for å bygge en sandrampe høyere, og dra steinblokkene på slede bort til foten av rampen så de sklir opp og låser seg på plass. For hvert lag blir pyramiden høyere, så rampen må bygges enda lenger. Lyspæren: egypterne hadde verken kraner eller maskiner. En lang, slak rampe og tusenvis av hender løftet 2,3 millioner blokker opp.',
        estimatedSeconds: 150,
        loader: () => import('./Pyramidebyggeren3D'),
        Component: Pyramidebyggeren3D as never,
    },
    'kalmar-kronene-3d': {
        id: 'kalmar-kronene-3d',
        title: 'Samle de tre kronene',
        description:
            'Dann Kalmarunionen i 3D: klikk kronene til Danmark, Norge og Sverige og se dem samle seg over én trone i 1397. Spol så fram til 1523, da Sverige bryter ut og Norge blir igjen som den svake parten under Danmark. Lyspæren: tre riker under én konge, men makten lå i Danmark, og ubalansen sprengte til slutt unionen.',
        estimatedSeconds: 130,
        loader: () => import('./KalmarKronene3D'),
        Component: KalmarKronene3D as never,
    },
    'pestrute-3d': {
        id: 'pestrute-3d',
        title: 'Pestens reise langs handelsrutene',
        description:
            'Folg Svartedauden fra Svartehavet til Bergen i 3D: klikk neste havn langs handelsruta og se pesten gli fra by til by, husene bli graa, folk falle og dodstallet stige. Lyspaera: de samme handelsrutene som baerte rikdom, baerte ogsaa doden helt til Norge i 1349.',
        estimatedSeconds: 130,
        loader: () => import('./Pestrute3D'),
        Component: Pestrute3D as never,
    },
    'kristendom-spredning': {
        id: 'kristendom-spredning',
        title: 'Kristendommens spredning',
        description:
            'Se kristendommen spre seg pa en roterende globus i 3D: fra 12 disipler i Jerusalem (ar 30) til Romerriket (ar 300), Europa (ar 1000), alle verdensdeler (ar 1500) og 2,4 milliarder i dag. Trykk "Neste epoke" og se byene lyse opp ett steg om gangen.',
        estimatedSeconds: 130,
        loader: () => import('./KristendomSpredning3D'),
        Component: KristendomSpredning3D as never,
    },
    'tikkun-olam-3d': {
        id: 'tikkun-olam-3d',
        title: 'Tikkun Olam - Reparer verden',
        description:
            'Kjenn jødedommens kjerneforpliktelse på kroppen: reparer fire skader i en Jerusalem-by - gi mat til den sultne, fiks veien, tenn Shabbat-lyset, plant et tre. Verdenen lyser opp for hvert grep du tar. Lyspæren: Tikkun Olam er ikke et ideal, det er en daglig plikt.',
        estimatedSeconds: 120,
        loader: () => import('./TikkunOlam3D'),
        Component: TikkunOlam3D as never,
    },
    'samsara-syklusen': {
        id: 'samsara-syklusen',
        title: 'Samsaras kretsløp',
        description:
            'Kjenn buddhismens kjerneinnsikt på kroppen: tre orbiterende gifter - Grådighet, Hat og Uvitenhet - holder sjelen fanget i Samsaras kretsløp. Klikk bort én gift om gangen og se sjelen lysne. Når alle tre er sluknet, oppnår sjelen Nirvana. Lyspæren: "Nirvana" betyr bokstavelig "utblåsing" - som å blåse ut en flamme.',
        estimatedSeconds: 90,
        loader: () => import('./SamsaraSyklusen3D'),
        Component: SamsaraSyklusen3D as never,
    },
    'marsj-mot-roma-3d': {
        id: 'marsj-mot-roma-3d',
        title: 'Marsjen mot Roma',
        description:
            'Oktober 1922: fascistkolonnene nærmer seg Roma. Klikk de tre elementene og avdekk det historiske paradokset - marsjen lyktes ikke fordi fascistene var sterke, men fordi kongen ga seg.',
        estimatedSeconds: 140,
        loader: () => import('./MarsjenMotRoma3D'),
        Component: MarsjenMotRoma3D as never,
    },
    'moksha-veien-3d': {
        id: 'moksha-veien-3d',
        title: 'Atman søker Brahman',
        description:
            'Kjenn hinduismens kjerneidé på kroppen: Atman (sjelen) kretser rundt Brahman (det universelle) fanget i Samsara. Aktiver de tre yoga-veiene - Karma Yoga, Jnana Yoga og Bhakti Yoga - og se sjelen spirale innover og smelte inn i Brahman. Lyspæren: Atman og Brahman er identiske - gjenforeningen ER Moksha.',
        estimatedSeconds: 90,
        loader: () => import('./MokshaVeien3D'),
        Component: MokshaVeien3D as never,
    },
    'vekten-i-wien-3d': {
        id: 'vekten-i-wien-3d',
        title: 'Vekten i Wien',
        description:
            'Etter Napoleon var Frankrike blitt en kjempe. Dra de fire stormaktene Storbritannia, Russland, Preussen og Østerrike opp på den tomme siden av vippevekten, og se at den først blir vannrett når alle fire er på plass. Lyspæren: det krevde flere stormakter sammen å balansere én sterk stat, og denne maktbalansen holdt Europa stabilt i nesten hundre år.',
        estimatedSeconds: 90,
        loader: () => import('./VektenIWien3D'),
        Component: VektenIWien3D as never,
    },
    'vesterleden-3d': {
        id: 'vesterleden-3d',
        title: 'Vesterleden: fra øy til øy mot Amerika',
        description:
            'Dra et langskip vestover over Nord-Atlanteren, hav for hav, fra Norge til Island, Grønland og Vinland. Hver kyst du bosetter blir basen for neste sprang. Lyspæren: vikingene nådde Amerika rundt 500 år før Columbus ved å hoppe fra øy til øy, og Vinland ble oppgitt fordi det lå for langt unna til å få forsterkninger.',
        estimatedSeconds: 140,
        loader: () => import('./Vesterleden3D'),
        Component: Vesterleden3D as never,
    },
    'rismark-og-makt-3d': {
        id: 'rismark-og-makt-3d',
        title: 'Ris er makt',
        description:
            'Dyrk rismarkene i en daimyos len. For hver mark du planter fylles lageret med koku, borgen vokser en etasje, og en ny samurai stiller seg ved porten. Lyspæren: makt i føydale Japan var bygd på ris. Jo mer en daimyo kunne høste, desto flere krigere kunne han fø, og desto mektigere ble han.',
        estimatedSeconds: 140,
        loader: () => import('./RismarkOgMakt3D'),
        Component: RismarkOgMakt3D as never,
    },
    'gangen-3d': {
        id: 'gangen-3d',
        title: 'Gangen: klokkas hemmelighet',
        description:
            'Bygg et mekanisk urverk steg for steg. Heng på loddet og se hjulet rase vilt av gårde, sett så inn gangen så det tikker jevnt, og still pendelen til klokka går rett. Lyspæren: gangen gjør den ujevne kraften fra loddet om til faste, tellbare tikk, og pendelen bestemmer takten.',
        estimatedSeconds: 150,
        loader: () => import('./Gangen3D'),
        Component: Gangen3D as never,
    },
};

export function getMicroGame(id: string) {
    return MICRO_GAMES[id];
}
