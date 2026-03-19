import type { Exercise } from '../../types';

export const temaApplyExercises: Exercise[] = [
    // NIVÅ 1 – Lærling
    {
        id: 'apply-tema-1-1',
        deviceId: 'tema',
        level: 1,
        instruction: 'Hvilken setning får best fram temaet ensomhet?',
        data: {
            type: 'identify',
            text: 'Du skriver en tekst om ensomhet. Hvilken setning formidler dette temaet best?',
            options: [
                {
                    deviceId: 'tema',
                    label: '"Hun satt ved kantinebordet med tom plass på begge sider."',
                    correct: true,
                    feedback:
                        'Riktig! Denne setningen viser ensomhet gjennom en konkret scene. Vi ser for oss de tomme plassene og forstår følelsen uten at noen trenger å si «hun var ensom».',
                },
                {
                    deviceId: 'tema',
                    label: '"Hun var veldig ensom på skolen."',
                    correct: false,
                    feedback:
                        'Her forteller du rett ut at hun er ensom. Det er bedre å vise det gjennom handlinger og detaljer. «Vis, ikke fortell!»',
                },
                {
                    deviceId: 'tema',
                    label: '"Skolen hadde mange elever."',
                    correct: false,
                    feedback:
                        'Denne setningen handler om skolen, ikke om ensomhet. Den sier ingenting om følelsene til karakteren.',
                },
                {
                    deviceId: 'tema',
                    label: '"Ensomhet er et stort problem blant ungdom i dag."',
                    correct: false,
                    feedback:
                        'Dette høres ut som en artikkel, ikke en fortelling. Et tema skal vises gjennom handlingen, ikke forklares direkte.',
                },
            ],
        },
    },
    {
        id: 'apply-tema-1-2',
        deviceId: 'tema',
        level: 1,
        instruction: 'Fyll inn en detalj som forsterker temaet vennskap.',
        data: {
            type: 'fill-blank',
            textBefore: 'Da Mia snublet og alle lo, var det bare Sara som',
            textAfter: '.',
            correctAnswers: [
                'hjalp henne opp',
                'rakte henne hånden',
                'kom bort til henne',
                'satte seg ned ved siden av henne',
                'stoppet å le',
            ],
            explanation:
                'Temaet vennskap vises best gjennom handlinger. Når Sara gjør noe konkret for å hjelpe Mia, forstår leseren at dette er ekte vennskap – uten at vi trenger å skrive det direkte.',
        },
    },
    {
        id: 'apply-tema-1-3',
        deviceId: 'tema',
        level: 1,
        instruction: 'Hvilken scene formidler temaet mot (å være modig)?',
        data: {
            type: 'identify',
            text: 'Hvilken scene viser temaet mot best?',
            options: [
                {
                    deviceId: 'tema',
                    label: '"Hendene skalv, men hun rakte dem opp likevel."',
                    correct: true,
                    feedback:
                        'Riktig! Mot handler ikke om å ikke være redd – det handler om å gjøre noe selv om du er redd. Skjelvende hender viser frykten, men hun rekker opp hånden likevel.',
                },
                {
                    deviceId: 'tema',
                    label: '"Hun var modig og aldri redd for noe."',
                    correct: false,
                    feedback:
                        'Å si rett ut at noen er modig er «fortelling», ikke «visning». Dessuten er det urealistisk å aldri være redd.',
                },
                {
                    deviceId: 'tema',
                    label: '"Klassen hadde presentasjoner den dagen."',
                    correct: false,
                    feedback:
                        'Dette gir bakgrunnsinformasjon, men sier ingenting om mot. Vi trenger å se en handling.',
                },
                {
                    deviceId: 'tema',
                    label: '"Alle i klassen var nervøse."',
                    correct: false,
                    feedback:
                        'Her beskrives nervøsitet, men ingen viser mot. Mot krever at noen faktisk handler til tross for frykten.',
                },
            ],
        },
    },

    // NIVÅ 2 – Svenn
    {
        id: 'apply-tema-2-1',
        deviceId: 'tema',
        level: 2,
        instruction: 'Skriv et kort avsnitt som formidler temaet sjalusi.',
        data: {
            type: 'write',
            prompt: 'Skriv 2-3 setninger som handler om sjalusi. Du skal IKKE bruke ordet «sjalusi» eller «sjalu». Vis følelsen gjennom hva karakteren gjør, tenker eller ser.',
            hint: 'Tenk på hva en sjalu person gjør: Stirrer de på noe? Klemmer de hendene? Sammenligner de seg med noen? Vis det!',
            exampleAnswer:
                'Liam så at Emma og Oliver lo sammen igjen. Han merket at han klemte mobiltelefonen hardere for hvert minutt. Da de inviterte ham bort, ristet han bare på hodet og gikk.',
        },
    },
    {
        id: 'apply-tema-2-2',
        deviceId: 'tema',
        level: 2,
        instruction: 'Koble hver scene med temaet den best formidler.',
        data: {
            type: 'match',
            pairs: [
                {
                    example: 'En gutt gir matpakken sin til en som ikke har.',
                    label: 'Omsorg og medfølelse',
                },
                {
                    example: 'En jente river opp brevet uten å lese det.',
                    label: 'Svik og tillit som er brutt',
                },
                {
                    example: 'En elev øver på talen sin ti ganger før fremføringen.',
                    label: 'Usikkerhet og prestasjonsangst',
                },
                {
                    example: 'To søsken krangler om fjernkontrollen, men deler teppet.',
                    label: 'Søskenkjærlighet trass i konflikter',
                },
            ],
        },
    },
    {
        id: 'apply-tema-2-3',
        deviceId: 'tema',
        level: 2,
        instruction: 'Skriv en kort scene som formidler temaet utenforskap.',
        data: {
            type: 'write',
            prompt: 'Skriv 3-4 setninger om en elev på en ny skole som føler seg utenfor. Vis temaet utenforskap gjennom konkrete detaljer og handlinger. Ikke skriv «han følte seg utenfor».',
            hint: 'Bruk sanser og detaljer: Hva ser han? Hva hører han? Hva gjør de andre? Hva gjør han? Små detaljer viser store følelser.',
            exampleAnswer:
                'De andre pratet og lo rundt ham i garderoben. Noah tok ekstra lang tid med skoene, slik at han ikke trengte å stå der alene mens de gikk. Da han endelig kom ut, var gangen tom. Han gikk mot klasserommet og lot som om han foretrakk det slik.',
        },
    },

    // NIVÅ 3 – Mester
    {
        id: 'apply-tema-3-1',
        deviceId: 'tema',
        level: 3,
        instruction: 'Temaet i denne teksten er uklart. Finn problemet.',
        data: {
            type: 'find-error',
            text: '"Maria gikk til butikken. Hun kjøpte melk. Så gikk hun hjem. Hunden logret. Hun laget middag og spiste." Denne teksten skal handle om frihet, men temaet kommer ikke fram.',
            errorDescription:
                'Teksten er bare en liste med handlinger. Ingen detaljer, tanker eller bilder viser temaet frihet. Handlingene kunne handlet om hva som helst.',
            options: [
                {
                    text: 'Legg til detaljer som viser frihet: "Maria gikk uten å sjekke klokken. Hun valgte den lange veien, bare fordi hun kunne. For første gang på lenge var det ingen som ventet."',
                    correct: true,
                    feedback:
                        'Riktig! Nå viser detaljene – å gå uten tidspress, velge selv, ingen som venter – at temaet er frihet. Leseren føler det uten at vi sier det.',
                },
                {
                    text: 'Legg til setningen "Maria følte seg fri" på slutten.',
                    correct: false,
                    feedback:
                        'Det er «fortelling», ikke «visning». En enkelt forklarende setning gjør ikke en hel tekst tematisk.',
                },
                {
                    text: 'Teksten er fin som den er. Temaet er tydelig nok.',
                    correct: false,
                    feedback:
                        'Nei, teksten er bare handlinger uten noen tematisk retning. Leseren ville ikke gjettet at temaet er frihet.',
                },
            ],
        },
    },
    {
        id: 'apply-tema-3-2',
        deviceId: 'tema',
        level: 3,
        instruction: 'Skriv en tekst der det samme temaet formidles gjennom motsetninger.',
        data: {
            type: 'write',
            prompt: 'Temaet er «å vokse opp». Skriv 3-5 setninger der du viser dette temaet ved å sette noe barnlig opp mot noe voksent. La kontrasten mellom barndom og voksenverden vise at karakteren er i ferd med å vokse opp.',
            hint: 'Tenk på hva som forandres når man vokser opp: leker vs. ansvar, fantasiverden vs. virkelighet, trygghet vs. usikkerhet. Sett disse mot hverandre.',
            exampleAnswer:
                'Bamsen lå fortsatt på sengen, men hun hadde ikke holdt den på lenge. I går kveld googlet hun «hva trenger man for å flytte hjemmefra» i stedet for å se på tegnefilm. Rommet så ut som før, men hun som bodde der var i ferd med å bli en annen.',
        },
    },
    {
        id: 'apply-tema-3-3',
        deviceId: 'tema',
        level: 3,
        instruction: 'Vurder: Formidler denne teksten temaet identitet effektivt?',
        data: {
            type: 'true-false',
            statement:
                '"Foran speilet prøvde hun tre forskjellige jakker. Med den første var hun den flinke eleven. Med den andre var hun opprøreren. Med den tredje var hun seg selv – men hun visste ikke helt hvem det var ennå." – Denne teksten formidler temaet identitet effektivt.',
            correct: true,
            explanation:
                'Ja, dette er effektiv temaformidling. Jakkene blir et symbol for ulike roller, og den siste setningen viser usikkerheten rundt identitet. Temaet vises gjennom en konkret handling (å prøve klær) uten å forklares direkte.',
        },
    },
];
