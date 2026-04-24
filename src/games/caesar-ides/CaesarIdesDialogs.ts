import type { DialogNode } from '../engine/types';

// Dialog-innhold er gruppert per NPC. Hver NPC får sin egen map som sendes videre
// til addNPC(...). Nøkkel-konvensjon: ${npcId}_greeting er inngangsdialogen;
// ${npcId}_* er oppfølgingsnoder. Flagg som settes i choice.action:
//   - met_spurinna: varsel-monolog låses opp
//   - learned_dictator_motive: Cassius' anti-tyrann-argument er hørt
//   - learned_republic_motive: Brutus' republikk-argument er hørt
//   - gave_letter_to_caesar: spilleren ga brevet til Cæsar
//   - caesar_greeted: spilleren har snakket med Cæsar minst én gang

export const spurinnaDialogs: Record<string, DialogNode | DialogNode[]> = {
    spurinna_greeting: [
        {
            speaker: 'Spurinna',
            text:
                'Du kommer tilbake, unge senator. Har du tenkt på det jeg sa?',
            condition: { flagsRequired: ['met_spurinna'] },
            choices: [
                { text: 'Hva var det du varslet om?', next: 'spurinna_warning' },
                { text: 'Jeg må videre.', next: null },
            ],
        },
        {
            speaker: 'Spurinna',
            text:
                'Cotta. Du er på vei til senatet, er du ikke? Så hør på meg først. Tegnene er ' +
                'tydelige i dag. Innvollene fra offerdyret viser ingen hjerte. Himmelen er tom ' +
                'for fugler. Vokt deg for Idus Martiae.',
            choices: [
                {
                    text: 'Hva betyr det?',
                    next: 'spurinna_warning',
                    action: (): void => {
                        /* flag settes i onEnd for warning-noden */
                    },
                },
                { text: 'Jeg tror ikke på varsler.', next: 'spurinna_dismissed' },
            ],
        },
    ],
    spurinna_warning: {
        speaker: 'Spurinna',
        text:
            'Idus Martiae er navnet på den 15. mars. Jeg sa det til Cæsar selv for en måned siden: ' +
            'frykt denne dagen. Han lo av meg. Men gudene advarer ikke to ganger. Noe skjer i dag. ' +
            'Jeg vet ikke hva, men jeg vet hvor: der senatet møtes.',
        choices: [{ text: 'Takk, Spurinna. Jeg skal være forsiktig.', next: null }],
        onEnd: (): void => {
            /* settes via engine i setupScene via choice.action fallback */
        },
    },
    spurinna_dismissed: {
        speaker: 'Spurinna',
        text:
            'Vantro eller ikke, gutt. Fakta er fakta: Cæsar har fiender, og i dag står de tett ' +
            'rundt ham. Bruk øynene dine når du kommer dit.',
        choices: [{ text: 'Greit. Jeg skal se etter.', next: null }],
    },
};

export const cassiusDialogs: Record<string, DialogNode | DialogNode[]> = {
    cassius_greeting: [
        {
            speaker: 'Gaius Cassius',
            text:
                'Du er fortsatt her, Cotta. Bra. Brutus trenger å høre en stemme til. ' +
                'Men tenk selv: hva ville Romas grunnleggere sagt om de så dagens Roma?',
            condition: { flagsRequired: ['learned_dictator_motive'] },
            choices: [
                { text: 'De ville ha tatt til våpen.', next: 'cassius_agreement' },
                { text: 'De ville ha ventet på valg.', next: 'cassius_impatience' },
                { text: 'Jeg må tenke.', next: null },
            ],
        },
        {
            speaker: 'Gaius Cassius',
            text:
                'Cotta. Godt du kom. Du har ører, ikke sant? Så hør: Cæsar har fått senatet til å ' +
                'utnevne ham til dictator perpetuo. Diktator for alltid. Vet du hva det betyr?',
            choices: [
                {
                    text: 'At han styrer til han dør?',
                    next: 'cassius_dictator_motive',
                },
                {
                    text: 'At han har reddet Roma fra kaos?',
                    next: 'cassius_defence_response',
                },
                { text: 'Jeg vet hva det betyr.', next: 'cassius_dictator_motive' },
            ],
        },
    ],
    cassius_dictator_motive: {
        speaker: 'Gaius Cassius',
        text:
            'Det betyr at republikken er død. I fem hundre år har Roma vekslet konsuler hvert år, ' +
            'nettopp for at ingen skulle bli konge. Nå sitter én mann på makten uten ende. Han lar ' +
            'seg dyrke som en gud. Han lar statuer av seg selv stå blant kongens statuer. Vi kastet ' +
            'ut kongene for fem hundre år siden, Cotta. Skal vi ta dem tilbake nå?',
        choices: [
            {
                text: 'Men han har vunnet krigene. Folket elsker ham.',
                next: 'cassius_tyrant_love',
            },
            {
                text: 'Så det er derfor dere samles i dag.',
                next: 'cassius_confirm',
            },
        ],
        onEnd: (): void => {
            /* flagg settes i setupScene via choice-action-monkeypatch, se Assets.ts */
        },
    },
    cassius_tyrant_love: {
        speaker: 'Gaius Cassius',
        text:
            'En tyrann elskes av folket helt til han ikke lenger trenger dem. Cæsar deler ut korn, ' +
            'så folket juble. Han gir sine soldater land, så de følger ham. Men senatet, gutt, ' +
            'senatet er Romas rygg. Når han knekker senatet, hvem taler da for loven?',
        choices: [{ text: 'Jeg forstår.', next: null }],
    },
    cassius_defence_response: {
        speaker: 'Gaius Cassius',
        text:
            'Reddet Roma? Han kom inn med en hær, Cotta. Han krysset Rubicon med legionene sine ' +
            'og tvang senatet. Det er ikke redning. Det er erobring av sitt eget fedreland.',
        choices: [
            { text: 'Men borgerkrigen endte.', next: 'cassius_tyrant_love' },
            { text: 'Hva vil dere gjøre?', next: 'cassius_confirm' },
        ],
    },
    cassius_confirm: {
        speaker: 'Gaius Cassius',
        text:
            'Det du ikke vet, trenger du ikke å bære. Bare husk dette: når senatet møtes i dag, ' +
            'står frie menn mot én mann. Brutus er der borte. Snakk med ham. Han er i tvil, men ' +
            'tvil er ikke feighet. Tvil er samvittighet.',
        choices: [{ text: 'Jeg går til ham.', next: null }],
    },
    cassius_agreement: {
        speaker: 'Gaius Cassius',
        text:
            'Nettopp. Brutus stamfar drev ut kong Tarquinius og fødte republikken. Nå må Brutus ' +
            'selv velge: blodet eller navnet.',
        choices: [{ text: 'Sterke ord.', next: null }],
    },
    cassius_impatience: {
        speaker: 'Gaius Cassius',
        text:
            'Valg? Hvilke valg? Cæsar er diktator for alltid. Han avlyste konsulvalget i år. ' +
            'Det finnes ingen lovlig vei ut lenger. Det er hele poenget, gutt.',
        choices: [{ text: 'Jeg ser.', next: null }],
    },
};

export const brutusDialogs: Record<string, DialogNode | DialogNode[]> = {
    brutus_greeting: [
        {
            speaker: 'Marcus Brutus',
            text:
                'Cotta. Jeg håper du forstår det vi skal gjøre. Jeg vet ikke om jeg forstår det selv.',
            condition: { flagsRequired: ['learned_republic_motive'] },
            choices: [
                { text: 'Du er ikke alene om tvilen.', next: 'brutus_thanks' },
                { text: 'Historien vil dømme deg.', next: 'brutus_history' },
                { text: 'Jeg må videre.', next: null },
            ],
        },
        {
            speaker: 'Marcus Brutus',
            text:
                'Cassius snakker stort. Jeg skjelver. Vet du hvem jeg er etterkommer av, Cotta? ' +
                'Lucius Junius Brutus. Mannen som drev ut Romas siste konge og skapte republikken. ' +
                'Nå ber de meg gjenta det han gjorde.',
            choices: [
                {
                    text: 'Men Cæsar er som en far for deg.',
                    next: 'brutus_republic_motive',
                },
                {
                    text: 'Hvorfor tvile? Cassius har forklart alt.',
                    next: 'brutus_duty',
                },
            ],
        },
    ],
    brutus_republic_motive: {
        speaker: 'Marcus Brutus',
        text:
            'Ja. Han reddet livet mitt etter slaget ved Farsalos. Han elsker meg som en sønn. Og ' +
            'jeg elsker ham. Men jeg elsker republikken mer. En venn er en venn, Cotta. En konge ' +
            'er en slutt på friheten. Roma kan ikke ha begge deler.',
        choices: [
            {
                text: 'Så vennskap må vike for prinsipp?',
                next: 'brutus_principle',
            },
            {
                text: 'Men dere var venner i går. Hva har endret seg?',
                next: 'brutus_change',
            },
        ],
        onEnd: (): void => {
            /* flagg settes i setupScene */
        },
    },
    brutus_principle: {
        speaker: 'Marcus Brutus',
        text:
            'Hvis jeg velger Cæsar, velger jeg at én mann står over lov og senat. Og etter ham? ' +
            'Hans arving. Og etter arvingen? Det finnes ingen vei tilbake fra kongemakt, Cotta. ' +
            'Derfor drev stamfaren min ut Tarquinius. Derfor må jeg.',
        choices: [{ text: 'Jeg forstår, selv om det gjør vondt.', next: null }],
    },
    brutus_change: {
        speaker: 'Marcus Brutus',
        text:
            'I forrige måned lot han seg bli utnevnt til diktator på livstid. Forrige uke satte han ' +
            'seg ned mens hele senatet reiste seg for å hedre ham. Han lar folk kalle ham far til ' +
            'fedrelandet som om Roma tilhører ham. Hver dag blir det verre. I dag er siste dag.',
        choices: [{ text: 'Jeg ser.', next: null }],
    },
    brutus_duty: {
        speaker: 'Marcus Brutus',
        text:
            'Tvil er ikke svakhet, unge senator. Den som dreper uten tvil, er en fanatiker. Den som ' +
            'dreper med tvil, er en borger som ofrer venn for fedreland. Merker du forskjellen?',
        choices: [{ text: 'Jeg tror det.', next: null }],
    },
    brutus_thanks: {
        speaker: 'Marcus Brutus',
        text: 'Takk, Cotta. Det betyr mer enn du vet.',
        choices: [{ text: 'Lykke til.', next: null }],
    },
    brutus_history: {
        speaker: 'Marcus Brutus',
        text:
            'Historien dømmer alle. Jeg håper bare den dømmer meg som mannen som reddet Romas ' +
            'frihet, og ikke som mannen som drepte en venn.',
        choices: [{ text: 'Det vet bare tiden.', next: null }],
    },
};

// Basis-introduksjon gjenbrukes på tvers av varianter for å unngå repetisjon.
const CAESAR_INTRO_TEXT =
    'Ung senator. Hvem er du igjen? Cotta, ja. Plebeierfamilie, riktig? Godt. Roma ' +
    'trenger nye stemmer. Hva vil du?';

export const caesarDialogs: Record<string, DialogNode | DialogNode[]> = {
    caesar_greeting: [
        {
            speaker: 'Gaius Julius Cæsar',
            text: 'Du igjen, Cotta. Senatet venter. Gå foran meg.',
            condition: { flagsRequired: ['caesar_greeted'] },
            choices: [{ text: 'Ja, Cæsar.', next: null }],
        },
        // Variant: har brev OG har møtt Spurinna - full meny
        {
            speaker: 'Gaius Julius Cæsar',
            text: CAESAR_INTRO_TEXT,
            condition: {
                itemInInventory: ['artemidoros-brev'],
                flagsRequired: ['met_spurinna'],
            },
            choices: [
                { text: 'Du bør ikke gå inn i senatet i dag.', next: 'caesar_dismiss_warning' },
                { text: 'Jeg har noe til deg.', next: 'caesar_letter_choice' },
                { text: 'Ingenting. Unnskyld.', next: null },
            ],
        },
        // Variant: har kun brev
        {
            speaker: 'Gaius Julius Cæsar',
            text: CAESAR_INTRO_TEXT,
            condition: { itemInInventory: ['artemidoros-brev'] },
            choices: [
                { text: 'Spurinna advarte meg om denne dagen.', next: 'caesar_dismiss_warning' },
                { text: 'Jeg har noe til deg.', next: 'caesar_letter_choice' },
                { text: 'Ingenting. Unnskyld.', next: null },
            ],
        },
        // Variant: har kun møtt Spurinna
        {
            speaker: 'Gaius Julius Cæsar',
            text: CAESAR_INTRO_TEXT,
            condition: { flagsRequired: ['met_spurinna'] },
            choices: [
                { text: 'Du bør ikke gå inn i senatet i dag.', next: 'caesar_dismiss_warning' },
                { text: 'Ingenting. Unnskyld.', next: null },
            ],
        },
        // Fallback: ingen av delene
        {
            speaker: 'Gaius Julius Cæsar',
            text: CAESAR_INTRO_TEXT,
            choices: [
                { text: 'Spurinna advarte meg om denne dagen.', next: 'caesar_dismiss_warning' },
                { text: 'Ingenting. Unnskyld.', next: null },
            ],
        },
    ],
    caesar_dismiss_warning: {
        speaker: 'Gaius Julius Cæsar',
        text:
            'Idus Martiae er kommet, sa Spurinna. "Ja, men den er ikke gått", svarte jeg. Varsler ' +
            'er for gamle koner og barn, unge Cotta. En romer gjør sin plikt. I dag er senatsmøte. ' +
            'Jeg skal dit. Du skal dit. Ferdig snakk.',
        choices: [{ text: 'Som du sier, Cæsar.', next: null }],
    },
    caesar_letter_choice: {
        speaker: 'Gaius Julius Cæsar',
        text:
            'Et brev? Fra hvem? Legg det i hånden min, eller behold det. Jeg har ikke tid å lese ' +
            'hver sak folk trykker på meg.',
        choices: [
            {
                text: 'Gi ham brevet.',
                next: 'caesar_letter_taken',
                action: (): void => {
                    /* håndteres i Assets via overlappende action-funksjon */
                },
            },
            { text: 'Det var ingenting. Beklager.', next: null },
        ],
    },
    caesar_letter_taken: {
        speaker: 'Gaius Julius Cæsar',
        text:
            'Greit. Jeg tar det. Jeg leser det senere, etter møtet. Følg meg nå.',
        choices: [{ text: '...', next: null }],
    },
};

// Eksporter alt samlet så Config kan sette dialogs direkte om ønsket.
export const caesarIdesDialogs: Record<string, DialogNode | DialogNode[]> = {
    ...spurinnaDialogs,
    ...cassiusDialogs,
    ...brutusDialogs,
    ...caesarDialogs,
};
