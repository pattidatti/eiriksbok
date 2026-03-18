import type { LiteraryDevice } from './types';

export const devices: LiteraryDevice[] = [
    {
        id: 'metafor',
        name: 'Metafor',
        emoji: '🎭',
        shortDescription: 'Kaller noe for noe det egentlig ikke er',
        color: 'violet',
        category: 'virkemiddel',
        theory: {
            definition:
                'En metafor er når du kaller noe for noe det egentlig ikke er, for å skape et bilde i hodet til leseren. I motsetning til en sammenligning bruker du ikke "som" eller "lik".',
            howToRecognize:
                'Let etter steder der noe beskrives som om det ER noe helt annet. Det mangler sammenligningsord som "som" eller "lik".',
            examples: [
                {
                    text: 'Livet er en berg-og-dal-bane.',
                    explanation:
                        'Livet er ikke bokstavelig talt en berg-og-dal-bane, men det har oppturer og nedturer - akkurat som en.',
                },
                {
                    text: 'Han hadde et hjerte av gull.',
                    explanation:
                        'Hjertet er ikke laget av gull, men metaforen forteller oss at han er en veldig god og snill person.',
                },
                {
                    text: 'Ordene hennes var kniver.',
                    explanation:
                        'Ordene var ikke virkelige kniver, men de skar og gjorde vondt.',
                },
            ],
            commonMistakes:
                'Ikke bland med sammenligning! "Hun er som en rose" er en sammenligning. "Hun er en rose" er en metafor.',
        },
    },
    {
        id: 'sammenligning',
        name: 'Sammenligning',
        emoji: '⚖️',
        shortDescription: 'Sammenligner to ting med "som" eller "lik"',
        color: 'sky',
        category: 'virkemiddel',
        theory: {
            definition:
                'En sammenligning er når du sammenligner to ting direkte, ved hjelp av ord som "som", "lik" eller "ligner". Det gjør det lettere for leseren å se for seg det du beskriver.',
            howToRecognize:
                'Let etter ordene "som", "lik", "ligner", "minner om". Disse er ofte tegn på en sammenligning.',
            examples: [
                {
                    text: 'Hun var rask som en gepard.',
                    explanation:
                        'Jenta sammenlignes med en gepard for å vise at hun var ekstremt rask. Ordet "som" forteller oss at dette er en sammenligning.',
                },
                {
                    text: 'Himmelen var rød lik en flamme.',
                    explanation:
                        'Himmelen sammenlignes med en flamme. Ordet "lik" viser at dette er en sammenligning.',
                },
            ],
            commonMistakes:
                'Husk: En sammenligning bruker alltid et sammenligningsord (som, lik). Uten det blir det en metafor.',
        },
    },
    {
        id: 'symbol',
        name: 'Symbol',
        emoji: '🔑',
        shortDescription: 'Noe konkret som står for noe abstrakt',
        color: 'amber',
        category: 'virkemiddel',
        theory: {
            definition:
                'Et symbol er et konkret objekt, en handling eller et bilde som representerer noe mer enn seg selv - ofte en ide, en følelse eller et tema.',
            howToRecognize:
                'Let etter gjenstander eller bilder som dukker opp flere ganger i teksten, eller som virker viktigere enn de burde være. Spør deg selv: Kan dette bety noe mer?',
            examples: [
                {
                    text: 'Hun tok av seg ringen og la den på bordet.',
                    explanation:
                        'Ringen kan symbolisere forholdet eller ekteskapet. At hun tar den av kan bety at hun gir opp forholdet.',
                },
                {
                    text: 'Det siste bladet falt fra treet.',
                    explanation:
                        'Bladet som faller kan symbolisere død, tap eller slutten på noe.',
                },
            ],
            commonMistakes:
                'Ikke alt er et symbol! Et tre er bare et tre med mindre teksten gir det en dypere betydning.',
        },
    },
    {
        id: 'personifisering',
        name: 'Personifisering',
        emoji: '🗣️',
        shortDescription: 'Gir menneskelige egenskaper til noe ikke-menneskelig',
        color: 'teal',
        category: 'virkemiddel',
        theory: {
            definition:
                'Personifisering er når du gir menneskelige egenskaper, handlinger eller følelser til noe som ikke er et menneske - som dyr, natur eller gjenstander.',
            howToRecognize:
                'Let etter steder der noe ikke-menneskelig gjør noe bare mennesker kan gjøre, som å snakke, tenke, føle eller handle bevisst.',
            examples: [
                {
                    text: 'Solen smilte ned på dem.',
                    explanation:
                        'Solen kan ikke smile - det er en menneskelig handling. Personifiseringen gjør at vi føler at det er en varm, god dag.',
                },
                {
                    text: 'Vinden hvisket gjennom trærne.',
                    explanation:
                        'Vinden kan ikke hviske - det er noe mennesker gjør. Det skaper en stemning av hemmelighet.',
                },
            ],
            commonMistakes:
                'Personifisering og besjeling ligner, men personifisering gir spesifikt menneskelige trekk. "Stolen klaget" er personifisering. "Havet var sint" er besjeling.',
        },
    },
    {
        id: 'besjeling',
        name: 'Besjeling',
        emoji: '✨',
        shortDescription: 'Gir liv og følelser til noe livløst',
        color: 'emerald',
        category: 'virkemiddel',
        theory: {
            definition:
                'Besjeling er når du gir følelser, vilje eller liv til noe som egentlig er livløst. Det ligner personifisering, men fokuserer mer på følelser og stemninger enn menneskelige handlinger.',
            howToRecognize:
                'Let etter naturfenomener, gjenstander eller abstrakte ting som får følelser eller vilje. "Havet var sint", "fjellet truet".',
            examples: [
                {
                    text: 'Havet var rasende den kvelden.',
                    explanation:
                        'Havet kan ikke være rasende - det er en følelse. Besjelingen gjør at vi forstår at havet var vilt og farlig.',
                },
                {
                    text: 'De gamle husene sovnet inn i mørket.',
                    explanation:
                        'Hus kan ikke sove, men besjelingen gjør at vi ser for oss en stille, forlatt landsby.',
                },
            ],
            commonMistakes:
                'Besjeling gir følelser og liv. Personifisering gir menneskelige handlinger. "Treet gråt" (besjeling) vs. "Treet vinket til oss" (personifisering).',
        },
    },
    {
        id: 'frampek',
        name: 'Frampek',
        emoji: '🔮',
        shortDescription: 'Hint om noe som skal skje senere',
        color: 'indigo',
        category: 'virkemiddel',
        theory: {
            definition:
                'Et frampek er et hint eller en antydning om noe som skal skje senere i historien. Det skaper spenning og gjør at leseren lurer på hva som vil skje.',
            howToRecognize:
                'Let etter setninger som skaper uro, varsler, eller antyder at noe viktig kommer til å skje. Ofte brukes ord som "lite visste hun at...", "det skulle vise seg...", eller uhyggelige detaljer.',
            examples: [
                {
                    text: 'Hun lo og vinket, uten å vite at det var siste gang.',
                    explanation:
                        '"Siste gang" antyder at noe alvorlig kommer til å skje. Leseren blir spent og lurer på hva.',
                },
                {
                    text: 'Det mørke skyet krøp inn over horisonten.',
                    explanation:
                        'Det mørke skyet kan være et frampek om at noe truende er på vei - enten bokstavelig (storm) eller billedlig (problemer).',
                },
            ],
        },
    },
    {
        id: 'tilbakeblikk',
        name: 'Tilbakeblikk',
        emoji: '⏪',
        shortDescription: 'Hopper tilbake i tid for å fortelle om noe som har skjedd',
        color: 'blue',
        category: 'virkemiddel',
        theory: {
            definition:
                'Et tilbakeblikk er når historien bryter med den vanlige tidsrekkefølgen og hopper tilbake til noe som skjedde for. Det brukes for å gi leseren viktig bakgrunnsinformasjon.',
            howToRecognize:
                'Let etter plutselige tidshopp bakover. Ofte innledet med "Hun husket...", "For tre år siden...", "Den gangen..." eller skifte til fortidsform.',
            examples: [
                {
                    text: 'Hun stirret på brevet. For ti år siden hadde moren hennes skrevet de samme ordene.',
                    explanation:
                        'Historien hopper ti år tilbake for å vise en kobling mellom nåtid og fortid.',
                },
                {
                    text: 'Lukten av nybakt brod tok ham tilbake til bestemors kjøkken.',
                    explanation:
                        'Lukten utløser et tilbakeblikk til et minne fra barndommen.',
                },
            ],
        },
    },
    {
        id: 'in-medias-res',
        name: 'In medias res',
        emoji: '💥',
        shortDescription: 'Starter midt i handlingen',
        color: 'cyan',
        category: 'virkemiddel',
        theory: {
            definition:
                'In medias res er latin og betyr "midt i tingene". Det er når en fortelling starter midt i handlingen, i stedet for å begynne med bakgrunn og oppbygging.',
            howToRecognize:
                'Sjekk åpningen av teksten. Starter den med action, dialog eller en dramatisk situasjon uten forklaring? Da er det trolig in medias res.',
            examples: [
                {
                    text: '"Slipp kniven!" ropte hun og kastet seg mot dora.',
                    explanation:
                        'Vi kastes rett inn i en dramatisk scene uten å vite hvem personene er eller hva som har skjedd for.',
                },
                {
                    text: 'Blodet piplet fra pannen hans mens han løp gjennom skogen.',
                    explanation:
                        'Historien starter med en som allerede er skadet og på flukt. Vi vet ikke hvorfor ennå.',
                },
            ],
            commonMistakes:
                'In medias res er bare relevant for åpningen av teksten. Hvis det dramatiske skjer midt i, er det bare vanlig handling.',
        },
    },
    {
        id: 'ironi',
        name: 'Ironi',
        emoji: '😏',
        shortDescription: 'Sier det motsatte av det du mener',
        color: 'rose',
        category: 'virkemiddel',
        theory: {
            definition:
                'Ironi er når noen sier det motsatte av det de egentlig mener, eller når det skjer noe helt annet enn det man forventer. Det finnes verbal ironi (ord), situasjonsironi (hendelser) og dramatisk ironi (publikum vet mer enn personene).',
            howToRecognize:
                'Let etter steder der det som sies ikke stemmer med det som menes, eller der resultatet er det motsatte av det man forventet.',
            examples: [
                {
                    text: '"For en fantastisk dag," sa han mens regnet øste ned.',
                    explanation:
                        'Han sier det er en fantastisk dag, men mener det motsatte. Regnet gjør ironien tydelig.',
                },
                {
                    text: 'Brannstasjonen brant ned.',
                    explanation:
                        'Situasjonsironi: Det stedet som skal slukke branner, brenner selv ned. Det motsatte av det man forventer.',
                },
            ],
        },
    },
    {
        id: 'kontrast',
        name: 'Kontrast',
        emoji: '⚫',
        shortDescription: 'Setter motsetninger opp mot hverandre',
        color: 'orange',
        category: 'virkemiddel',
        theory: {
            definition:
                'Kontrast er når forfatteren setter to motsetninger opp mot hverandre for å fremheve forskjeller eller skape en sterkere effekt.',
            howToRecognize:
                'Let etter motsetningspar: lys/mørke, glad/trist, ung/gammel, fattig/rik. Ofte står de nær hverandre i teksten.',
            examples: [
                {
                    text: 'Utenfor var det solskinn og latter. Inne satt hun alene i mørket.',
                    explanation:
                        'Kontrasten mellom det lyse og glade utenfor og det mørke og ensomme innenfor forsterker følelsen av isolasjon.',
                },
                {
                    text: 'Han var rik på penger, men fattig på venner.',
                    explanation:
                        'Kontrasten mellom rik/fattig brukes for å vise at penger ikke gir alt.',
                },
            ],
        },
    },
    {
        id: 'gjentakelse',
        name: 'Gjentakelse',
        emoji: '🔁',
        shortDescription: 'Gjentar ord eller fraser for effekt',
        color: 'pink',
        category: 'virkemiddel',
        theory: {
            definition:
                'Gjentakelse er når forfatteren bevisst gjentar ord, fraser eller setningsstrukturer for å skape rytme, understreke en poeng, eller forsterke en stemning.',
            howToRecognize:
                'Let etter ord eller fraser som dukker opp flere ganger. Spør deg: Er dette tilfeldig, eller gjør forfatteren det med vilje?',
            examples: [
                {
                    text: 'Aldri mer. Aldri mer skulle hun gå tilbake. Aldri mer.',
                    explanation:
                        '"Aldri mer" gjentas tre ganger for å understreke at beslutningen er endelig og absolutt.',
                },
                {
                    text: 'Han gikk og gikk og gikk gjennom snoen.',
                    explanation:
                        'Gjentakelsen av "gikk" viser at turen var lang og slitsom.',
                },
            ],
        },
    },
    {
        id: 'alliterasjon',
        name: 'Alliterasjon',
        emoji: '🎵',
        shortDescription: 'Ord som begynner på samme lyd',
        color: 'lime',
        category: 'virkemiddel',
        theory: {
            definition:
                'Alliterasjon er når flere ord etter hverandre begynner med samme lyd (konsonant). Det skaper rytme og gjør teksten mer minneverdig.',
            howToRecognize:
                'Les høyt! Horer du at flere ord på rad begynner på samme lyd? Da har du trolig funnet en alliterasjon.',
            examples: [
                {
                    text: 'Peter plukket pene, plettfrie plommer.',
                    explanation:
                        'Alle ordene begynner på "p". Det skaper en leken, rytmisk effekt.',
                },
                {
                    text: 'Kalde, klare kvelder.',
                    explanation:
                        'Alle tre ordene begynner på "k"-lyd. Det gjør frasen lett å huske.',
                },
            ],
        },
    },
    {
        id: 'tema',
        name: 'Tema',
        emoji: '🧭',
        shortDescription: 'Hva handler teksten egentlig om, på et dypere plan?',
        color: 'purple',
        category: 'analyse',
        theory: {
            definition:
                'Tema er det teksten handler om på et dypere plan - ikke handlingen, men den større ideen bak. Temaet kan ofte uttrykkes med ett eller to ord: ensomhet, kjærlighet, identitet, vennskap, makt.',
            howToRecognize:
                'Spør deg selv: Hva er det forfatteren egentlig vil at jeg skal tenke over? Hva er den rode tråden gjennom hele teksten?',
            examples: [
                {
                    text: 'Gutten satt alene i friminuttet igjen. Han så de andre le sammen borte ved husken.',
                    explanation:
                        'Handlingen er at gutten sitter alene. Temaet er ensomhet og utenforskap.',
                },
                {
                    text: 'De kranglet om hvem som skulle bestemme. Begge nektet å gi seg.',
                    explanation:
                        'Handlingen er en krangel. Temaet er makt og kontroll.',
                },
            ],
            commonMistakes:
                'Tema er ikke det samme som handling! Handling er hva som skjer. Tema er hva teksten sier om livet og verden.',
        },
    },
    {
        id: 'budskap',
        name: 'Budskap',
        emoji: '💌',
        shortDescription: 'Hva vil forfatteren at du skal lære eller tenke?',
        color: 'fuchsia',
        category: 'analyse',
        theory: {
            definition:
                'Budskapet er det forfatteren vil at leseren skal ta med seg - en innsikt, en lærdom eller en holdning. Det er forfatterens "poeng" med teksten. Budskapet kan ofte uttrykkes som en hel setning.',
            howToRecognize:
                'Spør deg selv: Hva vil forfatteren at jeg skal forstå? Hva er moralen eller lærdommen? Budskapet er ofte knyttet til temaet, men er mer konkret.',
            examples: [
                {
                    text: 'Etter å ha ljuget i uker, mistet hun til slutt alle vennene sine.',
                    explanation:
                        'Temaet er ærlighet. Budskapet er: "Løgner ødelegger tillit og vennskap."',
                },
                {
                    text: 'Den minste fisken var den som til slutt fant veien ut av nettet.',
                    explanation:
                        'Temaet er styrke. Budskapet er: "Man trenger ikke være størst for å klare seg."',
                },
            ],
            commonMistakes:
                'Tema er ett ord (ensomhet). Budskap er en hel setning (Alle trenger noen å snakke med). Ikke bland dem!',
        },
    },
];

export const getDevice = (id: string) => devices.find((d) => d.id === id);

export const deviceColorMap: Record<string, { bg: string; border: string; text: string; light: string; badge: string }> = {
    violet: { bg: 'bg-violet-500', border: 'border-violet-400', text: 'text-violet-700', light: 'bg-violet-100', badge: 'bg-violet-100 text-violet-700' },
    sky: { bg: 'bg-sky-500', border: 'border-sky-400', text: 'text-sky-700', light: 'bg-sky-100', badge: 'bg-sky-100 text-sky-700' },
    amber: { bg: 'bg-amber-500', border: 'border-amber-400', text: 'text-amber-700', light: 'bg-amber-100', badge: 'bg-amber-100 text-amber-700' },
    teal: { bg: 'bg-teal-500', border: 'border-teal-400', text: 'text-teal-700', light: 'bg-teal-100', badge: 'bg-teal-100 text-teal-700' },
    emerald: { bg: 'bg-emerald-500', border: 'border-emerald-400', text: 'text-emerald-700', light: 'bg-emerald-100', badge: 'bg-emerald-100 text-emerald-700' },
    indigo: { bg: 'bg-indigo-500', border: 'border-indigo-400', text: 'text-indigo-700', light: 'bg-indigo-100', badge: 'bg-indigo-100 text-indigo-700' },
    blue: { bg: 'bg-blue-500', border: 'border-blue-400', text: 'text-blue-700', light: 'bg-blue-100', badge: 'bg-blue-100 text-blue-700' },
    cyan: { bg: 'bg-cyan-500', border: 'border-cyan-400', text: 'text-cyan-700', light: 'bg-cyan-100', badge: 'bg-cyan-100 text-cyan-700' },
    rose: { bg: 'bg-rose-500', border: 'border-rose-400', text: 'text-rose-700', light: 'bg-rose-100', badge: 'bg-rose-100 text-rose-700' },
    orange: { bg: 'bg-orange-500', border: 'border-orange-400', text: 'text-orange-700', light: 'bg-orange-100', badge: 'bg-orange-100 text-orange-700' },
    pink: { bg: 'bg-pink-500', border: 'border-pink-400', text: 'text-pink-700', light: 'bg-pink-100', badge: 'bg-pink-100 text-pink-700' },
    lime: { bg: 'bg-lime-500', border: 'border-lime-400', text: 'text-lime-700', light: 'bg-lime-100', badge: 'bg-lime-100 text-lime-700' },
    purple: { bg: 'bg-purple-500', border: 'border-purple-400', text: 'text-purple-700', light: 'bg-purple-100', badge: 'bg-purple-100 text-purple-700' },
    fuchsia: { bg: 'bg-fuchsia-500', border: 'border-fuchsia-400', text: 'text-fuchsia-700', light: 'bg-fuchsia-100', badge: 'bg-fuchsia-100 text-fuchsia-700' },
};
