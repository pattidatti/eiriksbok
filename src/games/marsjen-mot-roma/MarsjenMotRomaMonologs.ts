import type { MonologNode } from '../engine/types';

// Indre tanker journalisten har mens han følger marsjen. Brukes til å forsterke
// pedagogiske poeng uten å låse spilleren i dialog. Klimaks-monologene
// (`venter`, `kongen_taler`, `seier_refleksjon`) spilles manuelt via engine.schedule.

export const marsjenMotRomaMonologs: Record<string, MonologNode> = {
    ankomst: {
        id: 'ankomst',
        lines: [
            'Regnet siler ned over leiren utenfor Roma.',
            'Tusenvis av menn i sorte skjorter. Noen har gevær, mange har bare køller.',
            'De roper om nasjonen og om en sterk leder. Jeg må forstå hva dette egentlig er.',
        ],
        once: true,
    },
    trykkeriet: {
        id: 'trykkeriet',
        lines: [
            'Et utbrent hus. Lukten av sot henger fortsatt i den våte lufta.',
            'Dette var et trykkeri. Svartskjortene brant det fordi de trykte feil avis.',
            'Og politiet? De så en annen vei.',
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
            '"Fascistenes program, 1919." Jeg blar gjennom det fuktige, krøllede papiret.',
            'Det lover alt på én gang: mot kapitalisme, mot sosialisme, for nasjonen, for handling.',
            'Ingen sammenhengende idé - bare en vilje til makt. Det er nok for dem som er sinte nok.',
        ],
        once: true,
    },

    plakat_svart: {
        id: 'plakat_svart',
        lines: [
            '"ITALIA REISER SEG!" - Mussolinis ansikt i store trekk over en oppstigende sol.',
            '"Enten med oss, eller mot oss." En enkel verden uten nyanser.',
            'Propagandaen er ikke sofistikert. Den trenger ikke være det - den taler til magen, ikke hodet.',
        ],
        once: true,
    },

    plakat_vilje: {
        id: 'plakat_vilje',
        lines: [
            '"VILJENS SEIER" - en knyttet neve over parlamentsbygningen.',
            'Fienden er alltid den samme: de røde, de svake, forræderne. Alltid noen å peke på.',
            'Jeg skriver ned teksten ord for ord. Leserne hjemme må få se dette selv.',
        ],
        once: true,
    },

    marsj_rop: {
        id: 'marsj_rop',
        lines: [
            'Rundt meg roper de i kor: "A noi! A noi!" - "Til oss! Til oss!"',
            'Sangen stiger. Trommene banker. Tusenvis av stemmer som sier det samme.',
            'Det er noe som trekker i magen - selv om man vet hva det er, kjennes det sterkt.',
        ],
        once: true,
    },
};
