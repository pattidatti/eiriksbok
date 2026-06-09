import type { DialogNode } from '../engine/types';

// Dialog-innhold gruppert per NPC. Nøkkel-konvensjon: ${npcId}_greeting er
// inngangsdialogen. Flagg settes IKKE her - de wires i Assets via wireDialogEnd,
// slik at denne fila holder seg som ren data. Flagg som brukes:
//   - learned_mussolini_background : Carlo har fortalt om Mussolinis bakgrunn
//   - learned_fascism_traits       : Gino har forklart fascismens kjennetegn
//   - saw_squadristi_violence       : eleven har sett/hørt om svartskjortenes vold
//   - learned_bluff                 : Renzi har avslørt at marsjen er en bløff
//   - learned_elite_motive          : Conti har forklart elitens kalkyle
//   - compared_communism            : Conti har sammenlignet fascisme og kommunisme

// ─── Carlo: svartskjorte-veteran (Mussolinis bakgrunn) ──────────────────────────
export const carloDialogs: Record<string, DialogNode | DialogNode[]> = {
    carlo_greeting: {
        speaker: 'Carlo',
        text:
            'En journalist, midt i regnet med oss? Modig. Eller dum. Hva vil du vite, penneknekt?',
        choices: [
            { text: 'Hvem er denne Mussolini?', next: 'carlo_mussolini' },
            { text: 'Hvorfor marsjerer dere mot Roma?', next: 'carlo_why' },
            { text: 'Jeg går videre.', next: null },
        ],
    },
    carlo_mussolini: {
        speaker: 'Carlo',
        text:
            'Il Duce? Han er en av oss - en smedsønn. Men hør på dette: han begynte som ' +
            'sosialist! Redaktør i partiavisa Avanti!, en brannfakkel i klassekampen. Så kom ' +
            'krigen. Han brøt med sosialistene, meldte seg frivillig, ble såret. Da han kom ' +
            'hjem var han en annen mann - en som bare ville ha makt, uansett farge på fanen.',
        choices: [
            { text: 'Så han byttet side helt?', next: 'carlo_why' },
            { text: 'Takk. Det forklarer mye.', next: 'carlo_quiz_sosialist' },
        ],
    },
    carlo_quiz_sosialist: {
        speaker: 'Carlo',
        text: 'Et spørsmål tilbake, journalist: hva fikk egentlig Mussolini til å forlate sosialismen?',
        choices: [
            {
                text: 'Han så at nasjonalisme ga mer makt enn klassekamp',
                next: 'carlo_quiz_riktig',
            },
            {
                text: 'Han ble overbevist av fascismens filosofi',
                next: 'carlo_quiz_sosialist',
                consequenceHint:
                    'Fascismen var ikke en ferdig filosofi da Mussolini snudde - han skapte den etterpå.',
            },
            {
                text: 'Krigen endret ham religiøst',
                next: 'carlo_quiz_sosialist',
                consequenceHint: 'Ikke riktig. Det var en politisk kalkyle, ikke religiøs overbevisning.',
            },
        ],
    },
    carlo_quiz_riktig: {
        speaker: 'Carlo',
        text: 'Nøyaktig. Makt var alltid målet - ideologien var bare et middel.',
        choices: [{ text: 'Det er en skremmende tanke.', next: null }],
    },
    carlo_why: {
        speaker: 'Carlo',
        text:
            'Italia vant krigen og fikk ingenting! 600 000 døde, og så ble vi snytt for landet ' +
            'vi var lovet. Arbeidsledighet. Streik. De røde okkuperer fabrikkene. Regjeringene ' +
            'skifter hver måned og gjør ingenting. Vi gir Italia stolthet og orden tilbake. Med ' +
            'makt, om vi må.',
        choices: [{ text: 'Jeg forstår.', next: null }],
    },
};

// ─── Gino: ung fanatiker (fascismens kjennetegn + volden) ───────────────────────
export const ginoDialogs: Record<string, DialogNode | DialogNode[]> = {
    gino_greeting: {
        speaker: 'Gino',
        text:
            'Skriv dette i avisa di: nasjonen først! Én leder, ett folk, én vilje! Vi er ' +
            'framtida, gamlingen!',
        choices: [
            { text: 'Hva tror dere egentlig på?', next: 'gino_creed' },
            { text: 'Hva har dere gjort med dem som er uenige?', next: 'gino_violence' },
            { text: 'Jeg har hørt nok.', next: null },
        ],
    },
    gino_creed: {
        speaker: 'Gino',
        text:
            'Hva vi tror på? Nasjonen over alt - du er ingenting uten staten. En sterk leder som ' +
            'bestemmer, ikke et prateparlament. Handling, ikke kompromiss! Frihet og rettigheter ' +
            'er svakhet de liberale gjemmer seg bak. Vi marsjerer, vi adlyder, vi vinner.',
        choices: [
            { text: 'Og de som ikke vil adlyde?', next: 'gino_violence' },
            { text: 'Det er skremmende tanker.', next: null },
        ],
    },
    gino_violence: {
        speaker: 'Gino',
        text:
            'De røde? Vi banket dem. Tvang dem til å drikke ricinusolje til de krøp. Brente ' +
            'partikontorene og fagforeningshusene deres. Og vet du hva? Politiet løftet ikke en ' +
            'finger. Volden er ikke et problem, journalist. Volden ER politikken vår.',
        choices: [{ text: 'Det skriver jeg ned. Hvert ord.', next: null }],
    },
};

// ─── Pietro: typograf med utbrent trykkeri (volden fra offerets side) ────────────
export const pietroDialogs: Record<string, DialogNode | DialogNode[]> = {
    pietro_greeting: {
        speaker: 'Pietro',
        text:
            'Se hva de gjorde. Trykkeriet mitt - alt jeg eide. De kom i natt, tente på, og lo ' +
            'mens det brant. Min forbrytelse? Vi trykte en sosialistavis.',
        choices: [
            { text: 'Anmeldte du det til politiet?', next: 'pietro_state' },
            { text: 'Jeg er lei for det, Pietro.', next: null },
        ],
    },
    pietro_state: {
        speaker: 'Pietro',
        text:
            'Politiet? De sto og så på. For mange i staten - dommerne, offiserene, de rike - ' +
            'synes svartskjortene er nyttige. De knuser de røde for dem. De tror de kan bruke ' +
            'Mussolini som et redskap, og så legge ham bort etterpå. De tar grusomt feil.',
        choices: [{ text: 'Hvorfor tror du det?', next: 'pietro_warning' }],
    },
    pietro_warning: {
        speaker: 'Pietro',
        text:
            'Fordi en mann som lever av vold og frykt, gir aldri makten tilbake frivillig. De ' +
            'åpner døra for ham i dag. I morgen er det hans hus.',
        choices: [{ text: 'Jeg håper du tar feil.', next: null }],
    },
};

// ─── Kaptein Renzi: hærens offiser (bløffen) ────────────────────────────────────
export const kapteinDialogs: Record<string, DialogNode | DialogNode[]> = {
    kaptein_greeting: {
        speaker: 'Kaptein Renzi',
        text:
            'Hold deg unna veien, journalist. Mine menn har stengt den. Vi venter på ordre fra ' +
            'Roma.',
        choices: [
            { text: 'Kan dere virkelig stoppe en så stor marsj?', next: 'kaptein_bluff' },
            { text: 'Hvorfor bare venter dere?', next: 'kaptein_orders' },
            { text: 'Jeg holder meg unna.', next: null },
        ],
    },
    kaptein_bluff: {
        speaker: 'Kaptein Renzi',
        text:
            'Stoppe dem? Se på dem! Våte, sultne, dårlig bevæpnet - mange har bare staur og ' +
            'jaktrifler. Én skikkelig salve, og hele flokken ville spredt seg som høns. Hele ' +
            'denne «marsjen» er en bløff. Vi kunne knust den før lunsj.',
        choices: [
            { text: 'Så hvorfor gjør dere det ikke?', next: 'kaptein_orders' },
            { text: 'En bløff... det endrer alt.', next: 'kaptein_quiz_ordre' },
        ],
    },
    kaptein_orders: {
        speaker: 'Kaptein Renzi',
        text:
            'Fordi en soldat trenger en ordre. Statsminister Facta har bedt kongen om å erklære ' +
            'unntakstilstand. Signerer kongen, mobiliserer vi, og dette er over på en time. Men ' +
            'ordren har ikke kommet. Og uten den... står vi bare her og venter.',
        choices: [{ text: 'Så alt avhenger av kongen.', next: null }],
    },
    kaptein_quiz_ordre: {
        speaker: 'Kaptein Renzi',
        text: 'Et spørsmål, journalist: hva skjer uten kongens ordre?',
        choices: [
            {
                text: 'Vi venter. Soldater er tilskuere uten ordre',
                next: 'kaptein_quiz_riktig',
            },
            {
                text: 'Hæren rykker inn uansett og knuser marsjen',
                next: 'kaptein_quiz_ordre',
                consequenceHint: 'Feil. En lojal hær gjør ingenting uten ordre - det er hele problemet.',
            },
            {
                text: 'Marsjen avsløres og styrer seg selv',
                next: 'kaptein_quiz_ordre',
                consequenceHint:
                    'Kanskje - men ingen tar den risikoen. Uten ordre er hæren låst.',
            },
        ],
    },
    kaptein_quiz_riktig: {
        speaker: 'Kaptein Renzi',
        text: 'Nøyaktig. Demokratiet kollapset ikke i kamp - det sto og så på fra sidelinjen.',
        choices: [{ text: 'Det er en dyster lærdom.', next: null }],
    },
};

// ─── Signor Conti: industrieier (elitens motiv + fascisme vs. kommunisme) ────────
export const contiDialogs: Record<string, DialogNode | DialogNode[]> = {
    conti_greeting: {
        speaker: 'Signor Conti',
        text:
            'Ah, pressen. Du lurer sikkert på hvorfor en mann som meg - fabrikkeier, formuende - ' +
            'står her og heier på en flokk pøbler i sorte skjorter.',
        choices: [
            { text: 'Ja. Hvorfor støtter dere Mussolini?', next: 'conti_motive' },
            { text: 'Er ikke fascismen like ille som kommunismen?', next: 'conti_compare' },
            { text: 'Jeg lar deg være.', next: null },
        ],
    },
    conti_motive: {
        speaker: 'Signor Conti',
        text:
            'Enkelt: bedre Mussolini enn bolsjevikene. De siste årene har arbeiderne streiket og ' +
            'okkupert fabrikkene mine. Mussolinis menn knuser streikene og jager de røde. Han er ' +
            'en nyttig mann. Og når roen er gjenopprettet, legger vi ham pent tilbake i skuffen. ' +
            'Vi kan styre ham. Det er vi helt sikre på.',
        choices: [
            { text: 'Er dere virkelig sikre på det?', next: 'conti_compare' },
            { text: 'Mange har trodd det samme...', next: null },
        ],
    },
    conti_compare: {
        speaker: 'Signor Conti',
        text:
            'Begge er voldelige, og begge forakter friheten - der har du rett. Men forskjellen er ' +
            'avgjørende for en mann som meg: kommunisten vil ta fabrikken min og gi den til ' +
            'arbeiderne. Fascisten lar meg beholde den - så lenge jeg adlyder staten. Den ene tar ' +
            'eiendommen min, den andre ikke. Da er valget enkelt.',
        choices: [{ text: 'Et farlig regnestykke.', next: null }],
    },
};
