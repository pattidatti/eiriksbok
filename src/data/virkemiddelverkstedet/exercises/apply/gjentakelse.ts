import type { Exercise } from '../../types';

export const gjentakelseApplyExercises: Exercise[] = [
    // NIVÅ 1 – Lærling
    {
        id: 'apply-gjentakelse-1-1',
        deviceId: 'gjentakelse',
        level: 1,
        instruction: 'Hvilken setning bruker gjentakelse best for å skape effekt?',
        data: {
            type: 'identify',
            text: 'En karakter vil uttrykke desperasjon. Hvilken setning bruker gjentakelse mest effektivt?',
            options: [
                {
                    deviceId: 'gjentakelse',
                    label: '"Ikke gå. Ikke gå. Vær så snill, ikke gå."',
                    correct: true,
                    feedback:
                        'Riktig! Gjentakelsen av "ikke gå" bygger opp desperasjonen. Hver gang det gjentas, føler vi det sterkere.',
                },
                {
                    deviceId: 'gjentakelse',
                    label: '"Jeg vil ikke at du skal gå herfra nå."',
                    correct: false,
                    feedback:
                        'Denne setningen er tydelig, men den bruker ikke gjentakelse. Den har ikke den samme følelsesmessige kraften.',
                },
                {
                    deviceId: 'gjentakelse',
                    label: '"Gå ikke, bli her, forsvinn ikke."',
                    correct: false,
                    feedback:
                        'Her brukes synonymer, ikke gjentakelse. Ekte gjentakelse bruker de samme ordene om igjen.',
                },
                {
                    deviceId: 'gjentakelse',
                    label: '"Jeg ber deg innstendig om å bli værende."',
                    correct: false,
                    feedback:
                        'Formelt og fint, men ingen gjentakelse. Gjentakelse ville gitt setningen mer følelse.',
                },
            ],
        },
    },
    {
        id: 'apply-gjentakelse-1-2',
        deviceId: 'gjentakelse',
        level: 1,
        instruction: 'Fyll inn det gjentatte ordet for å skape effekt.',
        data: {
            type: 'fill-blank',
            textBefore: 'Han løp og løp og',
            textAfter: ', men kom aldri fram.',
            correctAnswers: ['løp'],
            explanation:
                'Ved å gjenta "løp" tre ganger skaper vi en følelse av utholdenhet og frustrasjon. Leseren føler hvor lenge han har holdt på.',
        },
    },
    {
        id: 'apply-gjentakelse-1-3',
        deviceId: 'gjentakelse',
        level: 1,
        instruction: 'Hvilket ord bør gjentas for å forsterke følelsen av kulde?',
        data: {
            type: 'fill-blank',
            textBefore: 'Det var',
            textAfter: '. Så kaldt at fingrene ikke ville lystre.',
            correctAnswers: ['kaldt, kaldt', 'kaldt kaldt', 'kaldt, så kaldt'],
            explanation:
                'Å gjenta "kaldt" gjør at leseren nesten føler kulden selv. Gjentakelse forsterker sanseinntrykk.',
        },
    },
    // NIVÅ 2 – Svenn
    {
        id: 'apply-gjentakelse-2-1',
        deviceId: 'gjentakelse',
        level: 2,
        instruction:
            'Skriv en setning der du gjentar et ord minst tre ganger for å uttrykke sinne.',
        data: {
            type: 'write',
            prompt: 'En karakter er rasende. Skriv en setning der du bruker gjentakelse for å vise sinnet. Gjenta minst ett ord tre ganger.',
            hint: 'Tenk på hva en sint person ville gjentatt. Kanskje "nei", "slutt", "aldri" eller lignende.',
            exampleAnswer:
                'Nei, nei, NEI! Jeg har sagt det hundre ganger, og jeg sier det igjen: NEI!',
        },
    },
    {
        id: 'apply-gjentakelse-2-2',
        deviceId: 'gjentakelse',
        level: 2,
        instruction: 'Koble gjentakelsestypen til effekten den skaper.',
        data: {
            type: 'match',
            pairs: [
                {
                    example: '"Stille. Stille. Stille." (samme ord, tre ganger)',
                    label: 'Bygger stemning og atmosfære',
                },
                {
                    example: '"Vi skal kjempe på strendene, vi skal kjempe i gatene, vi skal kjempe på åsene."',
                    label: 'Skaper slagkraft og besluttsomhet (anafor)',
                },
                {
                    example: '"Han ventet og ventet og ventet og ventet."',
                    label: 'Viser at noe varer lenge',
                },
                {
                    example: '"Hjelp meg! Hjelp meg! Er det noen som kan hjelpe meg?"',
                    label: 'Uttrykker desperasjon og nød',
                },
            ],
        },
    },
    {
        id: 'apply-gjentakelse-2-3',
        deviceId: 'gjentakelse',
        level: 2,
        instruction:
            'Skriv et kort avsnitt (2–3 setninger) der du bruker gjentakelse for å vise at en karakter savner noen.',
        data: {
            type: 'write',
            prompt: 'En karakter savner noen som har reist bort. Skriv 2–3 setninger der gjentakelse viser savnet. Bruk gjerne gjentakelse i starten av setningene (anafor).',
            hint: 'Prøv å starte flere setninger med det samme ordet eller uttrykket, for eksempel "Jeg husker..."',
            exampleAnswer:
                'Jeg husker latteren din. Jeg husker hvordan du alltid hadde svar på alt. Jeg husker, og det er det som gjør vondt.',
        },
    },
    // NIVÅ 3 – Mester
    {
        id: 'apply-gjentakelse-3-1',
        deviceId: 'gjentakelse',
        level: 3,
        instruction:
            'Denne teksten overbruker gjentakelse slik at den blir slitsom. Finn feilen og forklar hvordan du ville fikset den.',
        data: {
            type: 'find-error',
            text: 'Havet var stort. Havet var blått. Havet var vilt. Havet var kaldt. Havet var dypt. Havet var farlig. Havet var mystisk.',
            errorDescription:
                'Gjentakelsen er for mekanisk. Syv like setninger etter hverandre blir kjedelig i stedet for effektfullt. God gjentakelse har variasjon og bygger mot noe.',
            options: [
                {
                    text: 'Kutt ned til tre gjentakelser og la den siste bryte mønsteret, for eksempel: "Havet var stort. Havet var vilt. Havet var alt hun hadde igjen."',
                    correct: true,
                    feedback:
                        'Riktig! Tre gjentakelser er nok til å skape rytme, og et brudd på mønsteret gir slagkraft til den siste setningen.',
                },
                {
                    text: 'Legg til enda flere setninger for å virkelig hamre inn poenget.',
                    correct: false,
                    feedback:
                        'Nei, mer gjentakelse ville gjort problemet verre. Effektiv gjentakelse handler om presisjon, ikke mengde.',
                },
                {
                    text: 'Fjern all gjentakelse og skriv én lang setning i stedet.',
                    correct: false,
                    feedback:
                        'Det ville fjernet effekten helt. Gjentakelse er et godt virkemiddel – det bare trenger å brukes med måte.',
                },
            ],
        },
    },
    {
        id: 'apply-gjentakelse-3-2',
        deviceId: 'gjentakelse',
        level: 3,
        instruction:
            'Skriv en kort tale (3–5 setninger) der du bruker anafor (gjentakelse i starten av setninger) for å overbevise klassen om noe du brenner for.',
        data: {
            type: 'write',
            prompt: 'Velg et tema du bryr deg om (miljøet, rettferdighet, vennskap, e.l.). Skriv 3–5 setninger der du starter minst tre av dem med det samme ordet eller uttrykket. Bygge opp mot en sterk avslutning.',
            hint: 'Tenk på berømte taler. Martin Luther King sa "I have a dream..." mange ganger. Gjentakelsen bygde energi. Prøv det samme!',
            exampleAnswer:
                'Vi fortjener en skole der alle blir hørt. Vi fortjener en skole der ingen sitter alene. Vi fortjener en skole der lærerne har tid. Og vi er de som kan skape den.',
        },
    },
    {
        id: 'apply-gjentakelse-3-3',
        deviceId: 'gjentakelse',
        level: 3,
        instruction:
            'Er dette en god eller dårlig bruk av gjentakelse? Vurder effekten.',
        data: {
            type: 'true-false',
            statement:
                '"Regnet falt. Det falt og falt og falt." – Denne gjentakelsen er effektiv fordi den får leseren til å føle at regnet aldri slutter.',
            correct: true,
            explanation:
                'Ja, dette er effektiv gjentakelse. "Falt" gjentas i et mønster som speiler selve regnet – det bare fortsetter og fortsetter. Formen passer innholdet.',
        },
    },
];
