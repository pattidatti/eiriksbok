import type { MonologNode } from '../engine/types';

// Indre tanker journalisten har mens han følger marsjen. Brukes til å forsterke
// pedagogiske poeng uten å låse spilleren i dialog.
//
// Linse-monologene (`linse_*`) spilles når eleven trykker «Se nærmere» (E) på et
// objekt. De er kjernen i signaturmekanikken: avstandsbildet (løgnen) vs. nærbildet
// (sannheten). Klimaks-monologene (`venter`, `kongen_taler`, `seier_refleksjon`)
// spilles manuelt via engine.schedule.

export const marsjenMotRomaMonologs: Record<string, MonologNode> = {
    ankomst: {
        id: 'ankomst',
        lines: [
            'Regnet siler ned over leiren utenfor Roma.',
            'Tusenvis av menn i sorte skjorter forsvinner inn i tåka. En hær, sier de.',
            'Men en god journalist tror ikke på det han får se. Han går nærmere. Jeg må forstå hva dette egentlig er.',
        ],
        once: true,
    },

    // ─── Sannhetens linse: de fysiske avsløringene ──────────────────────────────
    linse_marsjer: {
        id: 'linse_marsjer',
        lines: [
            'På avstand, i tåka, så de ut som en disiplinert hær. Truende. Uunngåelig.',
            'Men her, en armlengde unna: en gjennomvåt gutt. Kosteskaft i hendene. Ingen støvler.',
            'Skrekken er et kostyme. Jeg skriver det ned i notatboka.',
        ],
        once: true,
    },
    linse_vaapen: {
        id: 'linse_vaapen',
        lines: [
            'Jeg lener meg inn over «våpnene» deres.',
            'Jaktrifler. Staur. Et og annet ekte gevær, rustent av regnet.',
            'En eneste salve fra ordentlige soldater ville spredt hele flokken. Notat: dette er militært maktesløst.',
        ],
        once: true,
    },
    linse_soldat: {
        id: 'linse_soldat',
        lines: [
            'Disse soldatene er ekte. Skarpe gevær, tørr kruttlukt, ordnede rekker.',
            'DETTE er makten som kunne stoppet alt på et øyeblikk.',
            'Men de står stille og venter på en ordre fra Roma. Uten ordre er den ekte hæren bare tilskuere.',
        ],
        once: true,
    },

    trykkeriet: {
        id: 'trykkeriet',
        lines: [
            'Et utbrent hus. Lukten av sot henger fortsatt i den våte lufta.',
            'Dette var et trykkeri. Svartskjortene brant det fordi det trykte feil avis.',
            'Og politiet? De så en annen vei. For dem er ikke volden et problem - den er metoden.',
        ],
        once: true,
    },
    haeren: {
        id: 'haeren',
        lines: [
            'Soldater. Ekte soldater, med ekte gevær, sperrer veien.',
            'De kunne stoppet hele marsjen på et øyeblikk.',
            'Spørsmålet er bare: vil de få ordre om det?',
        ],
        once: true,
    },
    venter: {
        id: 'venter',
        lines: [
            'Alle venter. Svartskjortene, soldatene, jeg.',
            'I Roma sitter kongen med et papir foran seg - unntakstilstanden.',
            'Ett pennestrøk, og marsjen er over. Han trenger bare å signere.',
        ],
        once: true,
    },
    kongen_taler: {
        id: 'kongen_taler',
        lines: [
            'En budbringer kommer ridende. Kapteinen leser beskjeden og blir blek.',
            'Kongen har nektet å signere. Hæren skal IKKE stoppe marsjen.',
            'Soldatene senker geværene og trekker seg til side. Veien til Roma er åpen.',
        ],
        once: true,
    },
    seier_refleksjon: {
        id: 'seier_refleksjon',
        lines: [
            'De marsjerte aldri inn med makt. Det endte uten et eneste skudd.',
            'I morgen er han statsminister. Utnevnt, lovlig, av kongen selv.',
            'Bløffen virket. Ikke fordi den var sterk, men fordi ingen turte å stoppe den.',
        ],
        once: true,
    },

    tog_ankomst: {
        id: 'tog_ankomst',
        lines: [
            'Der er han. Benito Mussolini. Ikke på hvit hest - i sovevogn på natttoget fra Milano.',
            'Han ankommer som statsminister, ikke som erobrer. Og slik begynte tjue år med diktatur.',
        ],
        once: true,
    },

    lese_flyveblad: {
        id: 'lese_flyveblad',
        lines: [
            '«Fascistenes program, 1919.» Jeg blar gjennom det fuktige, krøllede papiret.',
            'Det lover alt på én gang: mot kapitalisme, mot sosialisme, for nasjonen, for handling.',
            'Ingen sammenhengende idé - bare en vilje til makt. Det er nok for dem som er sinte nok.',
        ],
        once: true,
    },

    plakat_svart: {
        id: 'plakat_svart',
        lines: [
            'Jeg går helt inntil plakaten. «ITALIA REISER SEG!» - Mussolinis ansikt over en oppstigende sol.',
            '«Enten med oss, eller mot oss.» En enkel verden uten nyanser.',
            'Propagandaen er ikke smart. Den trenger ikke være det - den taler til magen, ikke hodet. Notat tatt.',
        ],
        once: true,
    },

    plakat_vilje: {
        id: 'plakat_vilje',
        lines: [
            '«VILJENS SEIER» - en knyttet neve over parlamentsbygningen.',
            'Fienden er alltid den samme: de røde, de svake, forræderne. Alltid noen å peke på.',
            'Jeg skriver ned teksten ord for ord. Leserne hjemme må få se dette selv.',
        ],
        once: true,
    },

    marsj_rop: {
        id: 'marsj_rop',
        lines: [
            'Rundt meg roper de i kor: «A noi! A noi!» - «Til oss! Til oss!»',
            'Sangen stiger. Trommene banker. Tusenvis av stemmer som sier det samme.',
            'Det er noe som trekker i magen - selv om man vet hva det er, kjennes det sterkt.',
        ],
        once: true,
    },

    forside_klar: {
        id: 'forside_klar',
        lines: [
            'Forsiden står. Tre påstander, tre bevis - alt sett med egne øyne.',
            'Men en sak ingen leser, endrer ingenting. Telegrafkontoret ligger ved sidetorget.',
            'Jeg må sende den nå, før linjene stenges.',
        ],
        once: true,
    },

    sidetorg_glimt: {
        id: 'sidetorg_glimt',
        lines: [
            'Et torg åpner seg mellom husene. Og der, på hjørnet: et opplyst skilt i regnet.',
            'TELEGRAFO. Derfra går linjene ut til hele verden.',
            'Verdt å huske - en sak ingen får lest, endrer ingenting.',
        ],
        once: true,
    },

    telegraf_stengt: {
        id: 'telegraf_stengt',
        lines: [
            'Telegrafisten ser spørrende på meg over skranken.',
            'Jeg har ingenting å sende ennå. Forsidesaken må skrives ferdig først.',
        ],
        once: false,
    },

    seier_vandring: {
        id: 'seier_vandring',
        lines: [
            'Veien til Roma ligger åpen. Kolonnen setter seg i bevegelse rundt meg.',
            'Jeg går med dem. Ikke fordi jeg er en av dem - men fordi noen må se dette til slutten.',
        ],
        once: true,
    },

    mangler_bevis: {
        id: 'mangler_bevis',
        lines: [
            'Jeg har snakket med dem som teller. Men forsidesaken min mangler fortsatt bevis jeg har sett med egne øyne.',
            'Jeg burde gå tilbake og se nærmere - på hvor dårlig bevæpnet de er, på hva Gino tror på, på hvorfor de rike er her.',
        ],
        once: false,
    },

    vista: {
        id: 'vista',
        lines: [
            'Fra vogna ser jeg utover hele kolonnen.',
            'Et hav av sorte skjorter som forsvinner inn i regnet og tåka, i begge retninger.',
            'Det SER uendelig ut. Men jeg har gått blant dem nå. Jeg vet hva tåka skjuler.',
        ],
        once: true,
    },
};
