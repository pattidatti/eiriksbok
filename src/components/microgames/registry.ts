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

export const MICRO_GAMES: Record<string, MicroGameEntry & { Component: React.LazyExoticComponent<React.ComponentType<unknown>> }> = {
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
};

export function getMicroGame(id: string) {
    return MICRO_GAMES[id];
}
