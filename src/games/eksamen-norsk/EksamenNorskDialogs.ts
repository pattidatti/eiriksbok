import type { DialogNode } from '../engine/types';
import { FLAGS } from './EksamenNorskFlags';

// Dialog-innhold for eksamen-norsk. Holdes rent for data: flagg-setting,
// fase-bytte og emosjoner kobles på i EksamenNorskAssets.ts via
// wireChoice()/wireDialogEnd() (motoren kjører choice.action ved valg og
// node.onEnd kun når en next:null-valg avslutter samtalen).
//
// Prep-gating: noen presentasjonsgrep krever at eleven forberedte dem på dag 2.
// Mønster: choice.action setter execution-flagget KUN hvis prep-flagget finnes
// (wires i Assets), og resultatnoden har varianter som leser execution-flagget
// (motoren resolverer variant etter at action har kjørt). Slik "kan du ikke fake"
// en påstand, epokekobling eller et sitat du aldri forberedte.
//
// Faglig grunnlag: modellsvaret i /norsk/eksamen/muntlig-modell (temaet framgang
// og motgang, tekstene Askeladden, Karens jul og Sult over tre epoker).

// ─── DEL 1: LÆRER (trekke fag) ───────────────────────────────────────────────
export const laererDialogs: Record<string, DialogNode | DialogNode[]> = {
    laerer_greeting: [
        {
            speaker: 'Læreren',
            text: 'Du har trukket norsk, og temaet er "Framgang og motgang". Gå inn på forberedelsesrommet - du har dagen i dag på deg.',
            condition: { flagsRequired: [FLAGS.FAG_TRUKKET] },
            choices: [{ text: 'Takk.', next: null }],
        },
        {
            speaker: 'Læreren',
            text: 'God morgen. I dag er det muntlig eksamen. Først skal du trekke hvilket fag du kommer opp i. Er du klar?',
            choices: [
                { text: 'Ja, jeg trekker.', next: 'laerer_trekk' },
                { text: 'Jeg er ganske nervøs.', next: 'laerer_nerver' },
            ],
        },
    ],
    laerer_nerver: {
        speaker: 'Læreren',
        text: 'Det er helt normalt. Husk at du får en hel forberedelsesdag etter at du har trukket. Trekk lappen, så tar vi det derfra.',
        choices: [{ text: 'Greit, jeg trekker.', next: 'laerer_trekk' }],
    },
    laerer_trekk: {
        speaker: 'Læreren',
        text: 'Du trekker en lapp og bretter den ut: "Norsk". Og temaet blir: Framgang og motgang. Lykke til på forberedelsesdagen.',
        choices: [{ text: 'Da setter jeg i gang.', next: null }],
    },
};

// ─── DEL 3: FAGLÆRER (leder framføringen) ────────────────────────────────────
export const faglarerDialogs: Record<string, DialogNode | DialogNode[]> = {
    faglarer_greeting: [
        {
            speaker: 'Faglærer Berg',
            text: 'Det der gjorde du fint. Nå tar sensor over - bare pust rolig og svar så godt du kan.',
            condition: { flagsRequired: [FLAGS.PRESENTASJON_FERDIG] },
            choices: [{ text: 'Takk.', next: null }],
        },
        {
            speaker: 'Faglærer Berg',
            text:
                'Velkommen inn. Du trakk "Framgang og motgang" og har hatt forberedelsesdagen. ' +
                'Ta den tiden du trenger - så er det din tur. Vil du begynne?',
            choices: [
                { text: 'Ja, jeg begynner.', next: 'pres_apning' },
                { text: 'Jeg er litt nervøs.', next: 'faglarer_nerver' },
            ],
        },
    ],
    faglarer_nerver: {
        speaker: 'Faglærer Berg',
        text: 'Det er helt normalt - alle er det. Husk at du kan dette. Start med påstanden din, så løsner resten av seg selv.',
        choices: [{ text: 'Greit. Jeg begynner.', next: 'pres_apning' }],
    },

    // ── Presentasjonen ──
    pres_apning: {
        speaker: 'Du',
        text: 'Du står ved kateteret. Sensor og faglæreren ser på deg. Hvordan åpner du presentasjonen?',
        choices: [
            { text: '"Jeg skal snakke om framgang og motgang i tre tekster." (les rett fra manus)', next: 'pres_apning_manus' },
            { text: '"Framgang er ikke alltid noe du kan jobbe deg til..." (skarp påstand)', next: 'pres_apning_tese' },
            { text: 'Mal et bilde: den minste broren i eventyret som likevel vinner.', next: 'pres_apning_anekdote' },
        ],
    },
    pres_apning_manus: {
        speaker: 'Sensor',
        text: 'Sensor noterer uten å se opp. Faglæreren ser litt bekymret ut - du leser ordrett fra arket, og det blir en innholdsfortegnelse, ikke en påstand.',
        choices: [{ text: 'Fortsett.', next: 'pres_innhold' }],
    },
    pres_apning_tese: [
        {
            speaker: 'Faglærer Berg',
            text: 'Sensor løfter blikket med en gang. En skarp, omstridt påstand du faktisk har jobbet med: at framgang flytter seg gjennom litteraturhistorien. Sterk åpning - nå har presentasjonen en retning.',
            condition: { flagsRequired: [FLAGS.APNET_TESE] },
            choices: [{ text: 'Fortsett.', next: 'pres_innhold' }],
        },
        {
            speaker: 'Sensor',
            text: 'Du prøver å åpne med en påstand, men siden du aldri forberedte en, blir den famlende og vag. Sensor venter på noe du faktisk kan argumentere for.',
            choices: [{ text: 'Fortsett.', next: 'pres_innhold' }],
        },
    ],
    pres_apning_anekdote: {
        speaker: 'Sensor',
        text: 'Du tegner et bilde av den minste broren ingen tror på, som likevel vinner til slutt. Rommet lytter. Nå må du knytte bildet til et poeng.',
        choices: [{ text: 'Fortsett.', next: 'pres_innhold' }],
    },

    pres_innhold: {
        speaker: 'Du',
        text: 'Du har tre tekster: Askeladden (1843), Karens jul (1885) og Sult (1890). Hvordan legger du dem fram?',
        choices: [
            { text: 'Gjenfortell handlingen i hver tekst etter tur.', next: 'pres_innhold_serie' },
            { text: 'Analyser virkemiddel og epoke i hver, og bygg en utvikling.', next: 'pres_innhold_analyse' },
        ],
    },
    pres_innhold_serie: {
        speaker: 'Sensor',
        text: 'Det blir tre referat ved siden av hverandre. Sensor venter på analysen - hva tekstene gjør, ikke bare hva de handler om. Sammenhengen uteblir litt.',
        choices: [{ text: 'Fortsett.', next: 'pres_kjerne' }],
    },
    pres_innhold_analyse: [
        {
            speaker: 'Faglærer Berg',
            text: 'Akkurat slik du forberedte: Askeladden i folkediktningen, Karens jul i naturalismen, Sult i nyromantikken. Du navngir virkemiddel og plasserer hver tekst i sin tid. Sensor nikker - dette er å sammenligne ut fra historisk kontekst.',
            condition: { flagsRequired: [FLAGS.KOBLET_EPOKE] },
            choices: [{ text: 'Fortsett.', next: 'pres_kjerne' }],
        },
        {
            speaker: 'Sensor',
            text: 'Du forsøker å analysere, men uten et forberedt tankekart blander du epokene og hopper fram og tilbake. Virkemidlene blir nevnt, men ikke forklart.',
            choices: [{ text: 'Fortsett.', next: 'pres_kjerne' }],
        },
    ],

    pres_kjerne: {
        speaker: 'Du',
        text: 'Hva er den røde tråden din - poenget som binder de tre tekstene sammen?',
        choices: [
            { text: 'Alle tre handler egentlig om at livet er vanskelig.', next: 'pres_kjerne_feil' },
            { text: 'Framgang betyr ulikt i hver epoke: fra eventyrets løfte, til samfunnet som nekter deg, til kampen inni eget hode.', next: 'pres_kjerne_riktig' },
        ],
    },
    pres_kjerne_feil: {
        speaker: 'Sensor',
        text: 'Sensor rynker pannen og noterer. "Livet er vanskelig" er for vagt - det binder ikke tekstene sammen til en utvikling. Hva er det egentlig som forandrer seg fra Askeladden til Hamsun?',
        choices: [{ text: 'Fortsett.', next: 'pres_virkemiddel' }],
    },
    pres_kjerne_riktig: {
        speaker: 'Faglærer Berg',
        text: 'Sensor ser tydelig interessert ut. Nettopp dette er den røde tråden: tre epoker gir tre svar på det samme spørsmålet om hvem som fortjener å lykkes.',
        choices: [{ text: 'Fortsett.', next: 'pres_virkemiddel' }],
    },

    pres_virkemiddel: {
        speaker: 'Du',
        text: 'Hvordan vil du vise at du virkelig kan tekstene? Velg hovedgrepet ditt.',
        choices: [
            { text: 'Bruk presise sitater og navngi virkemiddel: kontrast, ironi, indre monolog.', next: 'pres_vm_sitater' },
            { text: 'Appeller til følelsen av urettferdigheten Karen møter.', next: 'pres_vm_patos' },
            { text: 'Vis at jeg har lest tekstene grundig og kan litteraturhistorien.', next: 'pres_vm_etos' },
        ],
    },
    pres_vm_sitater: [
        {
            speaker: 'Faglærer Berg',
            text: 'Du siterer presist - "som jeg klemmer vannet av denne hvite steinen" - og forklarer kontrasten hos Askeladden, ironien hos Skram og den indre monologen hos Hamsun. Å navngi virkemiddel, sitere og forklare effekten er selve kjernen i en god analyse.',
            condition: { flagsRequired: [FLAGS.BRUKTE_SITATER] },
            choices: [{ text: 'Rund av.', next: 'pres_avslutning' }],
        },
        {
            speaker: 'Sensor',
            text: 'Du vil vise til sitater, men du valgte aldri tekstene grundig på forberedelsesdagen. Det blir til "forfatteren bruker fint språk" - en tom påstand uten sitat eller navngitt virkemiddel.',
            choices: [{ text: 'Rund av.', next: 'pres_avslutning' }],
        },
    ],
    pres_vm_patos: {
        speaker: 'Faglærer Berg',
        text: 'Det er patos - du treffer følelsene, og Karens jul tåler det godt. Husk å feste det til et konkret virkemiddel også, så det ikke blir ren synsing.',
        choices: [{ text: 'Rund av.', next: 'pres_avslutning' }],
    },
    pres_vm_etos: {
        speaker: 'Faglærer Berg',
        text: 'Det er etos - du bygger din egen troverdighet. Det teller, så lenge du faktisk viser kunnskapen gjennom sitater og analyse, og ikke bare påstår at du kan den.',
        choices: [{ text: 'Rund av.', next: 'pres_avslutning' }],
    },
    pres_avslutning: {
        speaker: 'Du',
        text: 'Du nærmer deg slutten. Hvordan runder du av?',
        choices: [
            { text: 'Sirkle tilbake til påstanden: framgang er et spørsmål hver epoke stiller på nytt.', next: 'pres_avslutning_tilbake' },
            { text: '"Det var det jeg hadde. Takk."', next: 'pres_avslutning_takk' },
        ],
    },
    pres_avslutning_tilbake: [
        {
            speaker: 'Faglærer Berg',
            text: 'Du binder slutten til åpningen: Askeladden vinner, Karen knuses, Hamsuns helt beholder seg selv midt i sulten. Rommet kjenner helheten - en tydelig rød tråd fra første til siste setning. "Takk for det," sier faglæreren og smiler.',
            condition: { flagsRequired: [FLAGS.SIRKLET_TILBAKE] },
            choices: [{ text: 'Sett deg og vent på spørsmålene.', next: null }],
        },
        {
            speaker: 'Sensor',
            text: 'Du prøver å sirkle tilbake, men uten en tydelig påstand å vende tilbake til blir avslutningen litt løs. Sensor blar i notatene og gjør seg klar til å spørre.',
            choices: [{ text: 'Sett deg og vent på spørsmålene.', next: null }],
        },
    ],
    pres_avslutning_takk: {
        speaker: 'Faglærer Berg',
        text: 'Du runder av. "Takk for det," sier faglæreren. Det ble litt brått - presentasjonen savnet en avslutning som samler trådene. Sensor blar rolig i notatene og gjør seg klar til å spørre.',
        choices: [{ text: 'Sett deg og vent på spørsmålene.', next: null }],
    },
};

// ─── DEL 3: SENSOR (leder fagsamtalen) ───────────────────────────────────────
export const sensorDialogs: Record<string, DialogNode | DialogNode[]> = {
    sensor_greeting: [
        {
            speaker: 'Sensor',
            text: 'Da er vi ferdige. Takk for i dag - det var en fin samtale.',
            condition: { flagsRequired: [FLAGS.FAGSAMTALE_FERDIG] },
            choices: [{ text: 'Takk.', next: null }],
        },
        {
            speaker: 'Sensor',
            text: 'Takk for presentasjonen. Nå har jeg noen spørsmål til deg. Ta den tiden du trenger. Er du klar?',
            condition: { flagsRequired: [FLAGS.PRESENTASJON_FERDIG] },
            choices: [{ text: 'Ja, jeg er klar.', next: 'sensor_q1' }],
        },
        {
            speaker: 'Sensor',
            text: 'Vi tar samtalen etter at du har holdt presentasjonen din. Hils på faglæreren og begynn når du er klar.',
            choices: [{ text: 'Greit.', next: null }],
        },
    ],

    // Q1 - forståelse: hvor ligger motgangen?
    sensor_q1: {
        speaker: 'Sensor',
        text: 'Du sa motgangen flytter seg fra Skram til Hamsun. Hva er forskjellen på HVOR motgangen ligger hos de to?',
        choices: [
            { text: 'Hos Skram ligger den i samfunnet utenfor mennesket. Hos Hamsun har den flyttet inn i hodet og selvbildet.', next: 'sensor_q1_riktig' },
            { text: 'Begge handler om fattigdom, så det er egentlig det samme.', next: 'sensor_q1_feil' },
        ],
    },
    sensor_q1_riktig: {
        speaker: 'Sensor',
        text: 'Helt riktig. Hos naturalisten Skram bestemmer miljøet utenfra. Hos Hamsun er kampen indre og psykologisk - det han kalte det ubevisste sjeleliv.',
        choices: [{ text: 'Neste spørsmål.', next: 'sensor_q2' }],
    },
    sensor_q1_feil: {
        speaker: 'Sensor',
        text: 'Ikke helt. Begge skildrer fattigdom, men poenget ditt var nettopp at motgangen flytter seg: fra samfunnet utenfor hos Skram, og inn i hodet hos Hamsun.',
        choices: [{ text: 'Neste spørsmål.', next: 'sensor_q2' }],
    },

    // Q2 - virkemiddel i dybden: ironien i Karens jul
    sensor_q2: {
        speaker: 'Sensor',
        text: 'Du nevnte ironi i Karens jul. Forklar nøyaktig hvordan den virker - ikke hva ironi er, men hva den gjør i nettopp denne teksten.',
        choices: [
            { text: 'Ironien ligger i kontrasten: julen handler om et nyfødt barn og lys, men Karens barn dør i kulde. Kollisjonen er selve samfunnskritikken.', next: 'sensor_q2_riktig' },
            { text: 'Ironi er når man sier det motsatte av det man mener.', next: 'sensor_q2_feil' },
        ],
    },
    sensor_q2_riktig: {
        speaker: 'Sensor',
        text: 'Nettopp. Du forklarer effekten og knytter den til Skrams kritikk, ikke bare ordbokdefinisjonen. Kontrasten mellom julens løfte og Karens virkelighet er anklagen mot samfunnet.',
        choices: [{ text: 'Neste spørsmål.', next: 'sensor_q3' }],
    },
    sensor_q2_feil: {
        speaker: 'Sensor',
        text: 'Det er en korrekt definisjon, men jeg spurte hvordan ironien virker her: kontrasten mellom julen, som skal bety lys og et nyfødt barn, og Karens barn som dør i kulde.',
        choices: [{ text: 'Neste spørsmål.', next: 'sensor_q3' }],
    },

    // Q3 - drøfting/nyanse: fortjener Askeladden framgangen?
    sensor_q3: {
        speaker: 'Sensor',
        text: 'Askeladden jukser jo - han lurer trollet med osten. Fortjener han egentlig framgangen sin?',
        choices: [
            { text: 'I vår målestokk jukser han, men i eventyrets logikk er list en dyd. Trollet symboliserer de mektige, og kløkt er den vanlige mannens våpen.', next: 'sensor_q3_riktig' },
            { text: 'Nei, han jukser, så egentlig fortjener han det ikke.', next: 'sensor_q3_feil' },
        ],
    },
    sensor_q3_riktig: {
        speaker: 'Sensor',
        text: 'Bra nyansert. Du tenker som en litteraturviter: du leser sjangerens egne regler i stedet for å felle en moralsk dom. Det er nettopp slik en sterk samtale ser ut.',
        choices: [{ text: 'Neste spørsmål.', next: 'sensor_q4' }],
    },
    sensor_q3_feil: {
        speaker: 'Sensor',
        text: 'Pass på den moralske dommen. I eventyrets verden er list en dyd, ikke et fusk. Sjangeren belønner den smarte, og trollet symboliserer de mektige som den lille må overliste.',
        choices: [{ text: 'Neste spørsmål.', next: 'sensor_q4' }],
    },

    // Q4 - bredde, UTENFOR presentasjonen: koble til vår egen tid
    sensor_q4: {
        speaker: 'Sensor',
        text: 'Et siste spørsmål, litt utenfor det du forberedte: Kan du koble temaet framgang og motgang til en tekst fra vår egen tid?',
        choices: [
            { text: 'Ja - i Aldri godt nok fra 2024 har motgangen flyttet enda lenger inn, til speilet og følelsen av å ikke være god nok. Det er naturalismens tanke i moderne språk.', next: 'sensor_q4_riktig' },
            { text: 'Nei, det vet jeg ikke - det sto ikke i presentasjonen min.', next: 'sensor_q4_feil' },
        ],
    },
    sensor_q4_riktig: [
        {
            speaker: 'Sensor',
            text: 'Veldig bra at du har en tekst klar i baklomma. Du kobler 1885 til 2024 og viser en utvikling: samme tanke, nytt språk. Det er akkurat slik man løfter en samtale til toppnivå.',
            condition: { flagsRequired: [FLAGS.HAR_BAKLOMME] },
            choices: [{ text: 'Avslutt.', next: 'sensor_avslutning' }],
        },
        {
            speaker: 'Sensor',
            text: 'Godt koblet på sparket. Du ser at naturalismens tanke lever videre i dag, bare flyttet inn i selvbildet. Hadde du forberedt en baklomme-tekst, hadde svaret sittet enda tryggere.',
            choices: [{ text: 'Avslutt.', next: 'sensor_avslutning' }],
        },
    ],
    sensor_q4_feil: {
        speaker: 'Sensor',
        text: 'Det er nettopp poenget med en fagsamtale - jeg spør også utenfor manuset ditt. Aldri godt nok fra 2024 viser temaet i dag: motgangen flyttet inn i selvbildet. Forbered baklomme-tekster til neste gang.',
        choices: [{ text: 'Avslutt.', next: 'sensor_avslutning' }],
    },
    sensor_avslutning: {
        speaker: 'Sensor',
        text: 'Takk. Det var alt fra oss. Du kan gå ut, så kaller vi deg inn igjen om litt.',
        choices: [{ text: 'Takk.', next: null }],
    },
};

export const eksamenNorskDialogs: Record<string, DialogNode | DialogNode[]> = {
    ...laererDialogs,
    ...faglarerDialogs,
    ...sensorDialogs,
};
