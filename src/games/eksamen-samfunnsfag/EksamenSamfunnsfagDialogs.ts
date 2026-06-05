import type { DialogNode } from '../engine/types';
import { FLAGS } from './EksamenSamfunnsfagFlags';

// Dialog-innhold for eksamen-samfunnsfag. Holdes rent for data: flagg-setting,
// fase-bytte og emosjoner kobles på i EksamenSamfunnsfagAssets.ts via
// wireChoice()/wireDialogEnd() (motoren kjører choice.action ved valg og
// node.onEnd kun når en next:null-valg avslutter samtalen).
//
// Prep-gating: noen presentasjonsgrep krever at eleven forberedte dem på dag 2.
// Mønster: choice.action setter execution-flagget KUN hvis prep-flagget finnes
// (wires i Assets), og resultatnoden har varianter som leser execution-flagget
// (motoren resolverer variant etter at action har kjørt). Slik "kan du ikke fake"
// en problemstilling/sammenligning/kilde du aldri forberedte.

// ─── DEL 1: LÆRER (trekke fag) ───────────────────────────────────────────────
export const laererDialogs: Record<string, DialogNode | DialogNode[]> = {
    laerer_greeting: [
        {
            speaker: 'Læreren',
            text: 'Du har trukket samfunnsfag, og temaet er "Makt og styringsformer". Gå inn på forberedelsesrommet - du har dagen i dag på deg.',
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
        text: 'Du trekker en lapp og bretter den ut: "Samfunnsfag". Og temaet blir: Makt og styringsformer - hvordan et folkestyre kan bli ettmannsstyre. Lykke til på forberedelsesdagen.',
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
                'Velkommen inn. Du trakk "Makt og styringsformer" og har hatt forberedelsesdagen. ' +
                'Ta den tiden du trenger - så er det din tur. Vil du begynne?',
            choices: [
                { text: 'Ja, jeg begynner.', next: 'pres_apning' },
                { text: 'Jeg er litt nervøs.', next: 'faglarer_nerver' },
            ],
        },
    ],
    faglarer_nerver: {
        speaker: 'Faglærer Berg',
        text: 'Det er helt normalt - alle er det. Husk at du kan dette. Start med problemstillingen din, så løsner resten av seg selv.',
        choices: [{ text: 'Greit. Jeg begynner.', next: 'pres_apning' }],
    },

    // ── Presentasjonen ──
    pres_apning: {
        speaker: 'Du',
        text: 'Du står ved kateteret. Sensor og faglæreren ser på deg. Hvordan åpner du presentasjonen?',
        choices: [
            { text: '"Jeg skal snakke om makt og styringsformer." (les rett fra manus)', next: 'pres_apning_manus' },
            { text: '"Hvordan kan et folkestyre ende som ettmannsstyre?"', next: 'pres_apning_tese' },
            { text: 'Mal et bilde: Augustus som "folkets førstemann".', next: 'pres_apning_anekdote' },
        ],
    },
    pres_apning_manus: {
        speaker: 'Sensor',
        text: 'Sensor noterer uten å se opp. Faglæreren ser litt bekymret ut - du leser ordrett fra arket, og stemmen blir flat.',
        choices: [{ text: 'Fortsett.', next: 'pres_innhold' }],
    },
    pres_apning_tese: [
        {
            speaker: 'Faglærer Berg',
            text: 'Sensor løfter blikket med en gang. En skarp problemstilling du faktisk har jobbet med - ikke bare en tittel. Sterk åpning.',
            condition: { flagsRequired: [FLAGS.APNET_TESE] },
            choices: [{ text: 'Fortsett.', next: 'pres_innhold' }],
        },
        {
            speaker: 'Sensor',
            text: 'Du prøver å stille et stort spørsmål, men siden du ikke forberedte en problemstilling, blir det famlende og vagt. Sensor venter på noe mer.',
            choices: [{ text: 'Fortsett.', next: 'pres_innhold' }],
        },
    ],
    pres_apning_anekdote: {
        speaker: 'Sensor',
        text: 'Du tegner et bilde av Augustus som lar seg hylle som folkets mann. Rommet lytter. Nå må du knytte bildet til et poeng.',
        choices: [{ text: 'Fortsett.', next: 'pres_innhold' }],
    },

    pres_innhold: {
        speaker: 'Du',
        text: 'Du skal vise sammenhengen mellom Roma og Weimar. Hvordan legger du det fram?',
        choices: [
            { text: 'Fortell hele historien om Roma først, deretter hele Tyskland.', next: 'pres_innhold_serie' },
            { text: 'Sammenlign Roma og Weimar punkt for punkt.', next: 'pres_innhold_sammen' },
        ],
    },
    pres_innhold_serie: {
        speaker: 'Sensor',
        text: 'Det blir to fortellinger ved siden av hverandre. Sensor venter tålmodig på at du skal knytte dem sammen - men sammenligningen uteblir litt.',
        choices: [{ text: 'Fortsett.', next: 'pres_kjerne' }],
    },
    pres_innhold_sammen: [
        {
            speaker: 'Faglærer Berg',
            text: 'Du setter dem opp mot hverandre, akkurat slik du forberedte: begge var republikker, begge havnet i krise, begge fikk én mann på toppen. Sensor nikker - dette er selvstendig arbeid.',
            condition: { flagsRequired: [FLAGS.BRUKTE_SAMMENLIGNING] },
            choices: [{ text: 'Fortsett.', next: 'pres_kjerne' }],
        },
        {
            speaker: 'Sensor',
            text: 'Du forsøker å sammenligne, men uten en forberedt sammenligning blir det rotete, og du hopper fram og tilbake. Poenget drukner litt.',
            choices: [{ text: 'Fortsett.', next: 'pres_kjerne' }],
        },
    ],

    pres_kjerne: {
        speaker: 'Du',
        text: 'Hva er kjernepoenget ditt om HVORDAN makten ble tatt?',
        choices: [
            { text: 'Diktaturet kom som et angrep utenfra, med vold og kupp.', next: 'pres_kjerne_feil' },
            { text: 'Makten ble tatt innenfra - lovlig, i en krise, med folkets samtykke.', next: 'pres_kjerne_riktig' },
        ],
    },
    pres_kjerne_feil: {
        speaker: 'Sensor',
        text: 'Sensor rynker pannen og noterer. Var det egentlig et angrep utenfra? Både Augustus og Hitler fikk jo makten gjennom lovlige institusjoner.',
        choices: [{ text: 'Fortsett.', next: 'pres_virkemiddel' }],
    },
    pres_kjerne_riktig: {
        speaker: 'Faglærer Berg',
        text: 'Sensor ser tydelig interessert ut. Nettopp dette er kjernen: autokrati vokser som regel innenfra, ikke utenfra.',
        choices: [{ text: 'Fortsett.', next: 'pres_virkemiddel' }],
    },

    pres_virkemiddel: {
        speaker: 'Du',
        text: 'Hvordan vil du overbevise dem? Velg hovedgrepet ditt.',
        choices: [
            { text: 'Vis til kildene mine: Res Gestae og Goebbels-sitatet fra 1928.', next: 'pres_vm_logos' },
            { text: 'Appeller til følelsen av en frihet som forsvinner.', next: 'pres_vm_patos' },
            { text: 'Vis at jeg har lest meg grundig opp og kan stoffet.', next: 'pres_vm_etos' },
        ],
    },
    pres_vm_logos: [
        {
            speaker: 'Faglærer Berg',
            text: 'Det er logos - du bygger på fakta og egne kilder. I samfunnsfag er nettopp egne kilder det sterkeste kortet du har.',
            condition: { flagsRequired: [FLAGS.VISTE_KILDER] },
            choices: [{ text: 'Rund av.', next: 'pres_avslutning' }],
        },
        {
            speaker: 'Sensor',
            text: 'Du vil vise til kilder - men du fant aldri noen egne på forberedelsesdagen. Det blir bare en påstand om at "kilder finnes". Tomt.',
            choices: [{ text: 'Rund av.', next: 'pres_avslutning' }],
        },
    ],
    pres_vm_patos: {
        speaker: 'Faglærer Berg',
        text: 'Det er patos - du treffer følelsene. Det engasjerer, men husk å sikre det med fakta også, så det ikke blir synsing.',
        choices: [{ text: 'Rund av.', next: 'pres_avslutning' }],
    },
    pres_vm_etos: {
        speaker: 'Faglærer Berg',
        text: 'Det er etos - du bygger din egen troverdighet. Det teller, så lenge du faktisk viser kunnskapen og ikke bare påstår den.',
        choices: [{ text: 'Rund av.', next: 'pres_avslutning' }],
    },
    pres_avslutning: {
        speaker: 'Faglærer Berg',
        text: 'Du runder av presentasjonen. "Takk for det," sier faglæreren og smiler. Sensor blar rolig i notatene sine og gjør seg klar til å spørre.',
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

    // Q1 - fakta
    sensor_q1: {
        speaker: 'Sensor',
        text: 'La oss starte enkelt. Hva var den viktigste likheten i HVORDAN Augustus og Hitler fikk makten?',
        choices: [
            { text: 'Begge tok makten med lovlige midler, midt i en dyp krise.', next: 'sensor_q1_riktig' },
            { text: 'Begge vant en krig mot et annet land og marsjerte inn.', next: 'sensor_q1_feil' },
        ],
    },
    sensor_q1_riktig: {
        speaker: 'Sensor',
        text: 'Helt riktig. Verken Augustus eller Hitler trengte å bryte loven for å få makten. Den ble gitt dem.',
        choices: [{ text: 'Neste spørsmål.', next: 'sensor_q2' }],
    },
    sensor_q1_feil: {
        speaker: 'Sensor',
        text: 'Ikke helt. Poenget er nettopp at de IKKE trengte vold utenfra - de fikk makten gjennom lovlige institusjoner, i en krise.',
        choices: [{ text: 'Neste spørsmål.', next: 'sensor_q2' }],
    },

    // Q2 - forståelse
    sensor_q2: {
        speaker: 'Sensor',
        text: 'Hvorfor tror du folket og institusjonene lot det skje?',
        choices: [
            { text: 'Krise og frykt gjorde at folk byttet frihet mot trygghet og en sterk leder.', next: 'sensor_q2_riktig' },
            { text: 'Folk flest brydde seg ikke om politikk.', next: 'sensor_q2_feil' },
        ],
    },
    sensor_q2_riktig: {
        speaker: 'Sensor',
        text: 'Godt svar. I en krise virker en sterk leder trygg, og friheten føles mindre viktig akkurat da.',
        choices: [{ text: 'Neste spørsmål.', next: 'sensor_q3' }],
    },
    sensor_q2_feil: {
        speaker: 'Sensor',
        text: 'Det er en del av det, men ikke kjernen. Det avgjørende var krisen: arbeidsløshet, kaos og frykt fikk folk til å bytte frihet mot trygghet.',
        choices: [{ text: 'Neste spørsmål.', next: 'sensor_q3' }],
    },

    // Q3 - drøfting
    sensor_q3: {
        speaker: 'Sensor',
        text: 'Kunne det vært unngått? Drøft kort.',
        choices: [
            { text: 'Ja - sterke institusjoner, frie domstoler og fri presse kunne ha bremset det.', next: 'sensor_q3_riktig' },
            { text: 'Nei, det var helt uunngåelig - sånn går det alltid.', next: 'sensor_q3_feil' },
        ],
    },
    sensor_q3_riktig: {
        speaker: 'Sensor',
        text: 'Bra drøftet. Du peker på de demokratiske bremsene, og du tar et standpunkt og begrunner det.',
        choices: [{ text: 'Neste spørsmål.', next: 'sensor_q4' }],
    },
    sensor_q3_feil: {
        speaker: 'Sensor',
        text: 'Pass på "uunngåelig". En god drøfting ser på hva som kunne stoppet det - sterke domstoler, fri presse, en grunnlov som holder.',
        choices: [{ text: 'Neste spørsmål.', next: 'sensor_q4' }],
    },

    // Q4 - bredde, UTENFOR presentasjonen
    sensor_q4: {
        speaker: 'Sensor',
        text: 'Et siste spørsmål, litt utenfor det du har snakket om: Hvordan beskytter det norske demokratiet seg mot at én person får for mye makt i dag?',
        choices: [
            { text: 'Maktfordeling, frie valg, uavhengige domstoler og fri presse holder makten i sjakk.', next: 'sensor_q4_riktig' },
            { text: 'Det vet jeg ikke - det sto ikke i presentasjonen min.', next: 'sensor_q4_feil' },
        ],
    },
    sensor_q4_riktig: {
        speaker: 'Sensor',
        text: 'Veldig bra at du kobler historien til i dag. Nettopp maktfordelingen, valgene, domstolene og en fri presse er bremsene Roma og Weimar manglet.',
        choices: [{ text: 'Avslutt.', next: 'sensor_avslutning' }],
    },
    sensor_q4_feil: {
        speaker: 'Sensor',
        text: 'Det er nettopp poenget med en fagsamtale: jeg spør også utenfor manuset ditt. Til neste gang - forbered hele temaet. Svaret er maktfordeling, frie valg, domstoler og fri presse.',
        choices: [{ text: 'Avslutt.', next: 'sensor_avslutning' }],
    },
    sensor_avslutning: {
        speaker: 'Sensor',
        text: 'Takk. Det var alt fra meg. Du kan gå ut, så kaller vi deg inn igjen om litt.',
        choices: [{ text: 'Takk.', next: null }],
    },
};

export const eksamenSamfunnsfagDialogs: Record<string, DialogNode | DialogNode[]> = {
    ...laererDialogs,
    ...faglarerDialogs,
    ...sensorDialogs,
};
