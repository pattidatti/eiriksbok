import type { Exercise } from '../types';

export const gjentakelseExercises: Exercise[] = [
    // === NIVÅ 1 ===
    {
        id: 'gjent-1-1',
        deviceId: 'gjentakelse',
        level: 1,
        instruction: 'Hvilket virkemiddel er brukt?',
        data: {
            type: 'identify',
            text: 'Aldri. Aldri. Aldri mer.',
            options: [
                { deviceId: 'gjentakelse', label: 'Gjentakelse', correct: true, feedback: 'Riktig! "Aldri" gjentas tre ganger for å understreke det endelige.' },
                { deviceId: 'alliterasjon', label: 'Alliterasjon', correct: false, feedback: 'Alliterasjon handler om ord som begynner på samme lyd. Her gjentas hele ord.' },
                { deviceId: 'kontrast', label: 'Kontrast', correct: false, feedback: 'Nei, det er ingen motsetninger her - bare gjentakelse for effekt.' },
                { deviceId: 'ironi', label: 'Ironi', correct: false, feedback: 'Nei, dette er oppriktig ment og gjentatt for å forsterke budskapet.' },
            ],
        },
    },
    {
        id: 'gjent-1-2',
        deviceId: 'gjentakelse',
        level: 1,
        instruction: 'Hvilket virkemiddel er brukt?',
        data: {
            type: 'identify',
            text: 'Hun ventet og ventet og ventet.',
            options: [
                { deviceId: 'gjentakelse', label: 'Gjentakelse', correct: true, feedback: 'Riktig! "Ventet" gjentas tre ganger for å vise at ventingen var lang.' },
                { deviceId: 'besjeling', label: 'Besjeling', correct: false, feedback: 'Nei, det er en person som venter - ikke noe livløst.' },
                { deviceId: 'frampek', label: 'Frampek', correct: false, feedback: 'Nei, gjentakelsen viser varighet, ikke et varsel om fremtiden.' },
                { deviceId: 'metafor', label: 'Metafor', correct: false, feedback: 'Nei, alt er bokstavelig. Virkemiddelet er gjentakelsen.' },
            ],
        },
    },
    {
        id: 'gjent-1-3',
        deviceId: 'gjentakelse',
        level: 1,
        instruction: 'Marker gjentakelsen.',
        data: {
            type: 'highlight',
            text: 'Det var stille. Så stille. Altfor stille.',
            correctRanges: [
                { words: 'stille. Så stille. Altfor stille', explanation: '"Stille" gjentas tre ganger med stigende intensitet. Det bygger spenning - stillheten føler unaturlig.' },
            ],
        },
    },
    {
        id: 'gjent-1-4',
        deviceId: 'gjentakelse',
        level: 1,
        instruction: 'Marker gjentakelsen.',
        data: {
            type: 'highlight',
            text: 'Han løp og løp og løp til bena ikke bar ham lenger.',
            correctRanges: [
                { words: 'løp og løp og løp', explanation: '"Lop" gjentas for å vise at han sprang lenge og uten stopp. Gjentakelsen skaper følelsen av utmattelse.' },
            ],
        },
    },

    // === NIVÅ 2 ===
    {
        id: 'gjent-2-1',
        deviceId: 'gjentakelse',
        level: 2,
        instruction: 'Hva gjør gjentakelsen her?',
        data: {
            type: 'explain',
            text: 'Kom hjem. Kom hjem. Kom hjem til meg.',
            highlightedWords: 'Kom hjem',
            question: 'Hva er effekten av å gjenta "Kom hjem"?',
            options: [
                { text: 'Det forsterker desperasjonen og lengselen - det hopper seg opp som en bønn eller et rop', correct: true, feedback: 'Riktig! Gjentakelsen gjør teksten til en desperat bønn. Hver repetisjon øker intensiteten, og "til meg" på slutten gjør det personlig.' },
                { text: 'At personen har dårlig hukommelse', correct: false, feedback: 'Nei, gjentakelsen er bevisst for effekt - det handler om følelser, ikke hukommelse.' },
                { text: 'At huset er langt unna', correct: false, feedback: 'Nei, det handler om lengselen etter noen, ikke den fysiske avstanden.' },
            ],
        },
    },
    {
        id: 'gjent-2-2',
        deviceId: 'gjentakelse',
        level: 2,
        instruction: 'Hvilket virkemiddel er mest fremtredende?',
        data: {
            type: 'identify',
            text: 'Hver dag var lik. Stå opp. Gå på skolen. Komme hjem. Stå opp. Gå på skolen. Komme hjem.',
            options: [
                { deviceId: 'gjentakelse', label: 'Gjentakelse', correct: true, feedback: 'Riktig! Hele rutinen gjentas for å vise monotoni og kjedsomhet. Vi føler hvor repetitivt livet er.' },
                { deviceId: 'kontrast', label: 'Kontrast', correct: false, feedback: 'Nei, det er ingen motsetninger. Tvert imot - alt er likt.' },
                { deviceId: 'in-medias-res', label: 'In medias res', correct: false, feedback: 'Nei, vi starter ikke midt i en handling. Vi ser en rutine som gjentas.' },
                { deviceId: 'ironi', label: 'Ironi', correct: false, feedback: 'Nei, dette er ikke ironisk - det er en oppriktig beskrivelse av kjedsomhet.' },
            ],
        },
    },
    {
        id: 'gjent-2-3',
        deviceId: 'gjentakelse',
        level: 2,
        instruction: 'Marker gjentakelsen i teksten.',
        data: {
            type: 'highlight',
            text: 'De marsjerte fremover. Fremover. Alltid fremover. Ingen så seg tilbake.',
            correctRanges: [
                { words: 'fremover. Fremover. Alltid fremover', explanation: '"Fremover" gjentas tre ganger med variasjon. Det skaper en følelse av ustoppelig bevegelse og besluttsomhet.' },
            ],
        },
    },

    // === NIVÅ 3 ===
    {
        id: 'gjent-3-1',
        deviceId: 'gjentakelse',
        level: 3,
        instruction: 'Hva er den fulle effekten av gjentakelsen?',
        data: {
            type: 'explain',
            text: 'Jeg husker. Jeg husker solen over åkeren. Jeg husker lukten av jord. Jeg husker hendene dine.',
            highlightedWords: 'Jeg husker',
            question: 'Hva oppnår gjentakelsen av "Jeg husker"?',
            options: [
                { text: 'Den bygger rytme og intensitet - hvert minne legges til som et lag, og gjentakelsen gjør teksten poetisk og følelsesladd', correct: true, feedback: 'Riktig! "Jeg husker" fungerer som et refreng. Hvert minne blir mer personlig (sol → lukt → hender). Gjentakelsen skaper en sterk følelsesmessig oppbygging.' },
                { text: 'At personen har mange minner', correct: false, feedback: 'Det stemmer, men effekten er mye mer enn en liste. Gjentakelsen skaper rytme og følelse.' },
                { text: 'At personen er gammel', correct: false, feedback: 'Vi vet ikke alderen. Poenget er den poetiske effekten av gjentakelsen.' },
            ],
        },
    },
    {
        id: 'gjent-3-2',
        deviceId: 'gjentakelse',
        level: 3,
        instruction: 'Koble hvert eksempel med riktig virkemiddel.',
        data: {
            type: 'match',
            pairs: [
                { example: 'Igjen og igjen og igjen.', label: 'Gjentakelse' },
                { example: 'Sakte, stille snegler seg siste solstråle.', label: 'Alliterasjon' },
                { example: 'Hun lo i regnet, men gråt i solskinnet.', label: 'Kontrast' },
                { example: '"Så heldig vi er," sa han mens huset brant.', label: 'Ironi' },
            ],
        },
    },
    {
        id: 'gjent-3-3',
        deviceId: 'gjentakelse',
        level: 3,
        instruction: 'Marker kun gjentakelsen. Her er det andre virkemidler!',
        data: {
            type: 'highlight',
            text: 'Igjen og igjen slo bølgene mot den mørke stranden. Havet var rasende.',
            correctRanges: [
                { words: 'Igjen og igjen', explanation: '"Igjen og igjen" er gjentakelse som viser den uopphørlige bevegelsen. (Merk: "Havet var rasende" er besjeling.)' },
            ],
        },
    },

    // === NIVÅ 4 ===
    {
        id: 'gjent-4-1',
        deviceId: 'gjentakelse',
        level: 4,
        instruction: 'Skriv en setning som bruker gjentakelse for å vise frykt.',
        data: {
            type: 'write',
            prompt: 'Skriv en setning der du gjentar et ord eller uttrykk for å forsterke følelsen av frykt.',
            hint: 'Tenk på hva en redd person ville sagt eller tenkt - og gjenta det.',
            exampleAnswer: 'Ikke se deg tilbake. Ikke se deg tilbake. Ikke se deg tilbake.',
        },
    },
    {
        id: 'gjent-4-2',
        deviceId: 'gjentakelse',
        level: 4,
        instruction: 'Fyll inn det gjentatte ordet.',
        data: {
            type: 'fill-blank',
            textBefore: 'Han gikk og gikk og',
            textAfter: 'gjennom den endeløse skogen.',
            correctAnswers: ['gikk'],
            hint: 'Gjentakelse betyr å bruke samme ord igjen. Hvilket ord gjentas allerede?',
            explanation: 'Ordet "gikk" gjentas tre ganger for å vise at vandringen var lang og utmattende.',
        },
    },
    {
        id: 'gjent-4-3',
        deviceId: 'gjentakelse',
        level: 4,
        instruction: 'Skriv en kort tekst med gjentakelse som viser lengsel.',
        data: {
            type: 'write',
            prompt: 'Bruk gjentakelse til å uttrykke at noen savner et sted eller en person.',
            hint: 'Gjenta et nøkkelord som viser hva personen savner.',
            exampleAnswer: 'Hjem. Jeg ville hjem. Alt jeg tenkte på var hjem.',
        },
    },

    // === NIVÅ 5 ===
    {
        id: 'gjent-5-1',
        deviceId: 'gjentakelse',
        level: 5,
        instruction: 'Finn feilen i forklaringen av gjentakelse.',
        data: {
            type: 'find-error',
            text: '"Spring fortere! Spring fortere!" ropte treneren.',
            errorDescription: 'En elev har forklart denne teksten. Finn den feil forklaringen.',
            options: [
                { text: 'Gjentakelsen viser at treneren gjentar seg fordi han har glemt hva han sa', correct: true, feedback: 'Riktig feil! Treneren gjentar seg bevisst for å forsterke presset og motivere - ikke fordi han glemmer.' },
                { text: 'Gjentakelsen forsterker trenernes intensitet og hastverk', correct: false, feedback: 'Dette er en riktig forklaring. Gjentakelsen viser intensiteten i situasjonen.' },
                { text: '"Spring fortere" gjentas for å skape følelse av press', correct: false, feedback: 'Dette er riktig. Gjentakelsen bygger opp presset utøveren føler.' },
            ],
        },
    },
    {
        id: 'gjent-5-2',
        deviceId: 'gjentakelse',
        level: 5,
        instruction: 'Er denne påstanden riktig eller feil?',
        data: {
            type: 'true-false',
            statement: 'Gjentakelse brukes bare for å vise at noe skjer mange ganger.',
            correct: false,
            explanation: 'Feil! Gjentakelse kan brukes til mye mer: å skape rytme, bygge spenning, forsterke følelser, vise desperasjon, eller gjøre teksten poetisk. Det handler ikke bare om antall.',
        },
    },
    {
        id: 'gjent-5-3',
        deviceId: 'gjentakelse',
        level: 5,
        instruction: 'Er denne påstanden riktig eller feil?',
        data: {
            type: 'true-false',
            statement: 'I setningen "Månen lyste. Månen viste vei. Månen var alt de hadde" brukes gjentakelse for å vise at månen er viktig og livsviktig for personene.',
            correct: true,
            explanation: 'Riktig! "Månen" gjentas i begynnelsen av hver setning for å understreke hvor avhengige de er av den. Gjentakelsen gir månen en nesten hellig betydning.',
        },
    },

    // === NIVÅ 6 ===
    {
        id: 'gjent-6-1',
        deviceId: 'gjentakelse',
        level: 6,
        instruction: 'Marker alle gjentakelsene i denne lengre teksten.',
        data: {
            type: 'highlight',
            text: 'De ventet ved porten. De ventet i regnet. De ventet selv da alle andre hadde gått. For de visste at han ville komme. De visste det i hjertet.',
            correctRanges: [
                { words: 'De ventet ved porten. De ventet i regnet. De ventet selv da alle andre hadde gått', explanation: '"De ventet" gjentas tre ganger med variasjon. Hver gjentakelse legger til et nytt lag: sted, vær, utholdenhet.' },
                { words: 'De visste at han ville komme. De visste det i hjertet', explanation: '"De visste" gjentas for å vise at troen deres er urokkelig - fra ytre overbevisning til indre følelse.' },
            ],
        },
    },
    {
        id: 'gjent-6-2',
        deviceId: 'gjentakelse',
        level: 6,
        instruction: 'Forklar effekten av gjentakelsen i denne teksten.',
        data: {
            type: 'explain',
            text: 'Krigen tok broren. Krigen tok huset. Krigen tok drømmene. Men krigen tok aldri håpet.',
            highlightedWords: 'Krigen tok',
            question: 'Hva oppnår gjentakelsen av "Krigen tok", og hvorfor er siste setning spesiell?',
            options: [
                { text: 'Gjentakelsen bygger en liste av tap som blir stadig mer personlig. Det siste "tok aldri" bryter mønsteret og viser at håpet overlevde alt - det blir ekstra sterkt fordi vi forventet enda et tap.', correct: true, feedback: 'Riktig! Gjentakelsen bygger en rytme av tap. Når mønsteret brytes med "tok aldri", overraskes leseren. Kontrasten mellom det gjentatte tapet og det ene som overlever gjør håpet mektig.' },
                { text: 'At krigen var langvarig', correct: false, feedback: 'Krigen var kanskje lang, men gjentakelsens effekt er mye dypere enn bare tidsaspektet.' },
                { text: 'At personen var optimistisk', correct: false, feedback: 'Det er for enkelt. Poenget er hvordan gjentakelsen bygger opp og bruddet forsterker håpet.' },
            ],
        },
    },
    {
        id: 'gjent-6-3',
        deviceId: 'gjentakelse',
        level: 6,
        instruction: 'Forklar hvordan gjentakelsen virker her.',
        data: {
            type: 'explain',
            text: 'Steg for steg. Pust for pust. Meter for meter. Han klatret videre selv om kroppen skrek etter hvile.',
            highlightedWords: 'Steg for steg. Pust for pust. Meter for meter',
            question: 'Hvilken effekt har denne typen gjentakelse?',
            options: [
                { text: 'Strukturen "X for X" gjentas tre ganger og skaper en rytme som mimer den sakte, møysommelige klatringen. Leseren føler anstrengelsen i selve rytmen.', correct: true, feedback: 'Riktig! Gjentakelsen av mønsteret skaper en langsom, tung rytme. Vi opplever utmattelsen gjennom måten teksten er bygd opp - det er som å telle skritt.' },
                { text: 'At han klatrer et fjell', correct: false, feedback: 'Det er handlingen, ikke effekten av gjentakelsen. Tenk på hvordan rytmen påvirker leseren.' },
                { text: 'At han er i dårlig form', correct: false, feedback: 'Teksten viser utholdenhet, men spørsmålet handler om hva gjentakelsen gjør med teksten.' },
            ],
        },
    },

    // === NIVÅ 7 ===
    {
        id: 'gjent-7-1',
        deviceId: 'gjentakelse',
        level: 7,
        instruction: 'Koble hver type gjentakelse med riktig effekt.',
        data: {
            type: 'match',
            pairs: [
                { example: '"Aldri mer. Aldri mer." (samme frase gjentas uendret)', label: 'Forsterker det endelige - det finnes ingen vei tilbake' },
                { example: '"Hun sang i regnet. Hun sang i solen. Hun sang i stormen." (gjentakelse med variasjon)', label: 'Viser at noe er konstant uansett omstendigheter' },
                { example: '"Stå opp. Gå. Sov. Stå opp. Gå. Sov." (hel sekvens gjentas)', label: 'Skaper følelse av monotoni og rutine' },
                { example: '"Mer. Mer! MER!" (gjentakelse med økning)', label: 'Bygger intensitet og grådighet' },
            ],
        },
    },
    {
        id: 'gjent-7-2',
        deviceId: 'gjentakelse',
        level: 7,
        instruction: 'Sorter eksemplene: Hvilke bruker gjentakelse og hvilke bruker et annet virkemiddel?',
        data: {
            type: 'sort',
            categories: [
                { id: 'gjentakelse', label: 'Gjentakelse' },
                { id: 'annet', label: 'Annet virkemiddel' },
            ],
            items: [
                { text: 'Fly, fly, lille fugl, fly!', categoryId: 'gjentakelse' },
                { text: 'Huset sto som en gammel vokter.', categoryId: 'annet' },
                { text: 'Dagen kom og gikk. Kom og gikk. Kom og gikk.', categoryId: 'gjentakelse' },
                { text: 'Sakte, sikkert, stille gled båten fremover.', categoryId: 'annet' },
                { text: 'Hun ropte navnet hans. Igjen og igjen og igjen.', categoryId: 'gjentakelse' },
                { text: 'Skogen hvisket hemmeligheter til den som lyttet.', categoryId: 'annet' },
            ],
        },
    },
    {
        id: 'gjent-7-3',
        deviceId: 'gjentakelse',
        level: 7,
        instruction: 'Er denne påstanden riktig eller feil?',
        data: {
            type: 'true-false',
            statement: 'Gjentakelse med variasjon (som "Jeg husker solen. Jeg husker lukten. Jeg husker deg.") er sterkere enn ren gjentakelse fordi hvert ledd legger til noe nytt mens rytmen holdes.',
            correct: true,
            explanation: 'Riktig! Gjentakelse med variasjon kombinerer det beste av to verdener: den faste rytmen gir struktur, mens variasjonen gir utvikling. Hvert ledd bygger videre, og det siste leddet blir ofte det sterkeste.',
        },
    },

    // === NIVÅ 8 ===
    {
        id: 'gjent-8-1',
        deviceId: 'gjentakelse',
        level: 8,
        instruction: 'Sorter eksemplene etter hvilken type gjentakelse som brukes.',
        data: {
            type: 'sort',
            categories: [
                { id: 'anafor', label: 'Anafor (gjentakelse i begynnelsen)' },
                { id: 'epifor', label: 'Epifor (gjentakelse i slutten)' },
                { id: 'fullgjentakelse', label: 'Full gjentakelse (hele setningen)' },
            ],
            items: [
                { text: 'Jeg vil kjempe. Jeg vil vinne. Jeg vil overleve.', categoryId: 'anafor' },
                { text: 'Det var nok. Nok. Nok.', categoryId: 'fullgjentakelse' },
                { text: 'De kom for frihet. De kjempet for frihet. De døde for frihet.', categoryId: 'epifor' },
                { text: 'Aldri igjen. Aldri igjen. Aldri igjen.', categoryId: 'fullgjentakelse' },
                { text: 'Hun drømte om havet. Han drømte om havet. Alle drømte om havet.', categoryId: 'epifor' },
                { text: 'Hver dag sto hun opp. Hver dag gikk hun til skolen. Hver dag kom hun hjem alene.', categoryId: 'anafor' },
            ],
        },
    },
    {
        id: 'gjent-8-2',
        deviceId: 'gjentakelse',
        level: 8,
        instruction: 'Koble gjentakelsen med den følelsen den skaper.',
        data: {
            type: 'match',
            pairs: [
                { example: '"Vent. Vent. Vent bare litt til."', label: 'Desperasjon og bønn' },
                { example: '"Han slo. Hun slo. Alle slo."', label: 'Eskalering og kaos' },
                { example: '"Sakte gikk klokken. Sakte rant timene. Sakte døde håpet."', label: 'Langsom oppgivelse' },
                { example: '"Og de danset. Og de lo. Og de glemte alt."', label: 'Frihet og oppslukthet' },
            ],
        },
    },
    {
        id: 'gjent-8-3',
        deviceId: 'gjentakelse',
        level: 8,
        instruction: 'Sorter: Hvilke gjentakelser forsterker positive følelser og hvilke forsterker negative?',
        data: {
            type: 'sort',
            categories: [
                { id: 'positiv', label: 'Forsterker positive følelser' },
                { id: 'negativ', label: 'Forsterker negative følelser' },
            ],
            items: [
                { text: '"Vi klarte det! Vi klarte det! Vi klarte det!"', categoryId: 'positiv' },
                { text: '"Borte. Alt var borte. For alltid borte."', categoryId: 'negativ' },
                { text: '"Mer kjærlighet. Mer latter. Mer liv."', categoryId: 'positiv' },
                { text: '"Tomme gater. Tomme hus. Tomme blikk."', categoryId: 'negativ' },
                { text: '"Sammen igjen. Endelig sammen igjen."', categoryId: 'positiv' },
                { text: '"Han løy. Og løy. Og løy."', categoryId: 'negativ' },
            ],
        },
    },

    // === NIVÅ 9 ===
    {
        id: 'gjent-9-1',
        deviceId: 'gjentakelse',
        level: 9,
        instruction: 'Analyser gjentakelsen i denne teksten og forklar effekten.',
        data: {
            type: 'explain',
            text: 'De sa at hun var for ung. De sa at hun var for svak. De sa at hun aldri ville klare det. Men hun klarte det. Hun klarte det. Hun klarte det.',
            highlightedWords: 'De sa',
            question: 'Teksten har to ulike gjentakelser. Hvordan virker de sammen?',
            options: [
                { text: '"De sa" gjentas for å bygge opp motstand og tvil, mens "Hun klarte det" gjentas for å vise triumf. Skiftet fra andres stemmer til hennes egen handling skaper en kraftig kontrast.', correct: true, feedback: 'Riktig! De to gjentakelsene speiler hverandre. "De sa" representerer tvilen, "hun klarte det" representerer seieren. Kontrasten mellom dem gjør triumfen ekstra sterk.' },
                { text: 'At mange folk snakket om henne', correct: false, feedback: 'Det er for bokstavelig. Gjentakelsene har en strukturell funksjon - de bygger kontrast mellom tvil og triumf.' },
                { text: 'At hun gjentok det for å overbevise seg selv', correct: false, feedback: 'En interessant tolkning, men den overser samspillet mellom de to gjentakelsene og kontrasten mellom dem.' },
            ],
        },
    },
    {
        id: 'gjent-9-2',
        deviceId: 'gjentakelse',
        level: 9,
        instruction: 'Skriv en tekst der du bruker gjentakelse med et brudd for å overraske leseren.',
        data: {
            type: 'write',
            prompt: 'Skriv 3-4 setninger der du gjentar et mønster, og så bryter det i siste setning for å skape en overraskelse eller vending.',
            hint: 'Bygg en forventning med gjentakelse, og bryt den deretter. For eksempel: tre like setninger fulgt av en som er annerledes.',
            exampleAnswer: 'Han smilte til alle. Han smilte i regnet. Han smilte når ting gikk galt. Men den dagen smilte han ikke.',
        },
    },
    {
        id: 'gjent-9-3',
        deviceId: 'gjentakelse',
        level: 9,
        instruction: 'Finn feilen i elevens analyse av gjentakelse.',
        data: {
            type: 'find-error',
            text: '"Vi må videre. Vi må videre. Vi må videre nå." Elev skriver: Gjentakelsen brukes fordi forfatteren ikke finner andre ord.',
            errorDescription: 'Hvilken forklaring er feil?',
            options: [
                { text: 'Gjentakelsen brukes fordi forfatteren ikke finner andre ord å bruke', correct: true, feedback: 'Riktig feil! Gjentakelsen er et bevisst valg for å forsterke hastverk og besluttsomhet - det er et virkemiddel, ikke mangel på ordforråd.' },
                { text: 'Gjentakelsen viser at det haster og at personen er bestemt', correct: false, feedback: 'Dette er en korrekt analyse av effekten.' },
                { text: 'Tillegget av "nå" i siste setning øker intensiteten', correct: false, feedback: 'Dette er riktig. Variasjonen i siste ledd tilfører hastverk.' },
            ],
        },
    },

    // === NIVÅ 10 ===
    {
        id: 'gjent-10-1',
        deviceId: 'gjentakelse',
        level: 10,
        instruction: 'Analyser den komplekse bruken av gjentakelse i denne teksten.',
        data: {
            type: 'explain',
            text: 'Hvert år kom våren. Hvert år smeltet snøen. Hvert år sprang barna ut. Men hvert år var det en stol mindre rundt bordet.',
            highlightedWords: 'Hvert år',
            question: 'Hva gjør gjentakelsen med kontrasten mellom naturens syklus og familiens tap?',
            options: [
                { text: '"Hvert år" kobler naturens forutsigbare gjentakelse til familiens tap. Naturen gjentar seg uendret, men familien krymper. Gjentakelsen gjør kontrasten smertefull - alt annet fortsetter som normalt, men tapet er uopprettelig.', correct: true, feedback: 'Riktig! Gjentakelsen skaper en dobbel effekt: naturens trøstende syklus settes opp mot det irreversible tapet. "En stol mindre" bryter det positive mønsteret og gjør sorgen ekstra gripende.' },
                { text: 'At familien ikke liker vinteren', correct: false, feedback: 'Årstidene er et bakteppe. Analyser hva gjentakelsen gjør med motsetningen mellom natur og tap.' },
                { text: 'At tiden går fort', correct: false, feedback: 'Tiden er viktig, men spørsmålet handler om hvordan gjentakelsen forsterker kontrasten mellom det som fornyes og det som går tapt.' },
            ],
        },
    },
    {
        id: 'gjent-10-2',
        deviceId: 'gjentakelse',
        level: 10,
        instruction: 'Skriv en tekst der du kombinerer gjentakelse med et annet virkemiddel.',
        data: {
            type: 'write',
            prompt: 'Skriv 3-5 setninger der du bruker gjentakelse sammen med enten kontrast, besjeling eller metafor. Forklar kort hvilke virkemidler du brukte.',
            hint: 'Du kan for eksempel gjenta en frase mens du bruker besjeling ("Havet ropte") eller kontrast (positivt vs. negativt).',
            exampleAnswer: 'Byen sov. Byen drømte. Byen ventet på en ny dag. Men natten ville ikke slippe taket. (Gjentakelse av "Byen" + besjeling av byen og natten)',
        },
    },
    {
        id: 'gjent-10-3',
        deviceId: 'gjentakelse',
        level: 10,
        instruction: 'Sorter disse avanserte eksemplene etter hvilken funksjon gjentakelsen har.',
        data: {
            type: 'sort',
            categories: [
                { id: 'struktur', label: 'Strukturell gjentakelse (binder teksten sammen)' },
                { id: 'emosjonell', label: 'Emosjonell gjentakelse (forsterker følelser)' },
                { id: 'retorisk', label: 'Retorisk gjentakelse (overbeviser eller argumenterer)' },
            ],
            items: [
                { text: '"I begynnelsen var det mørkt. (...) I begynnelsen var det stille. (...) I begynnelsen var det håp."', categoryId: 'struktur' },
                { text: '"Aldri, aldri, aldri glem hva de gjorde mot oss."', categoryId: 'emosjonell' },
                { text: '"Vi fortjener bedre. Vi fortjener rettferdighet. Vi fortjener en stemme."', categoryId: 'retorisk' },
                { text: '"Først kapittel: Han våknet. (...) Siste kapittel: Han våknet." (Rammefortelling)', categoryId: 'struktur' },
                { text: '"Jeg elsket deg. Jeg elsket deg. Jeg elsket deg."', categoryId: 'emosjonell' },
                { text: '"Hver krone teller. Hver stemme teller. Hver handling teller."', categoryId: 'retorisk' },
            ],
        },
    },
];
