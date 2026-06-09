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
            'De marsjerte aldri inn med makt. Mussolini tar toget til Roma - i sovevogn.',
            'I morgen er han statsminister. Utnevnt, lovlig, av kongen selv.',
            'Bløffen virket. Ikke fordi den var sterk, men fordi ingen turte å stoppe den.',
        ],
        once: true,
    },
};
