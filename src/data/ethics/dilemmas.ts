import type { EthicalDilemma } from './types';

export const dilemmas: EthicalDilemma[] = [
    {
        id: 'trolley-standard',
        title: 'Det Klassiske Sporvognsproblemet',
        scenario: 'En sporvogn har mistet bremsene og raser mot fem banearbeidere som står på sporet. Du står ved en spak. Hvis du drar i den, vil vognen svinge inn på et annet spor der det bare står én arbeider. Hva gjør du?',
        image: '/images/etikk/trolley_standard.webp',
        choices: [
            {
                id: 'pull-lever',
                label: 'Dra i spaken',
                description: 'Vognen svinger og dreper én person, men redder fem.',
                responses: [
                    {
                        systemId: 'utilitarianism',
                        verdict: 'accept',
                        explanation: 'Dette følger Nytteprinsippet: Fem liv reddet gir en høyere sum av lykke/nytte enn ett liv tapt. Vi ser kun på det aggregerte resultatet.'
                    },
                    {
                        systemId: 'deontology',
                        verdict: 'reject',
                        explanation: 'Basert på Menneskeverdsformuleringen skal man aldri bruke et menneske som et middel. Ved å dra i spaken bruker du den ene personen som et "verktøy" for å redde de andre. Å drepe er et brudd på en universell moralsk plikt.'
                    },
                    {
                        systemId: 'christianity',
                        verdict: 'complex',
                        explanation: 'Dilemmaet utfordrer spenningen mellom barmhjertighet (å redde de fem) og budet "Du skal ikke slå ihjel". Menneskelivet er hellig, og mange vil mene at man ikke kan "ofre" noen for å oppnå et gode.'
                    },
                    {
                        systemId: 'natural-law',
                        verdict: 'reject',
                        explanation: 'Du kan ikke bruke tvang mot en uskyldig person, selv for å redde andre. Å dra i spaken er å initiere aggresjon (bryte NAP) mot arbeideren på sidesporet. Din plikt er å ikke krenke rettigheter, ikke å maksimere antall overlevende.'
                    },
                    {
                        systemId: 'virtue-ethics',
                        verdict: 'nuanced',
                        explanation: 'En person med Praktisk klokskap (Froneis) ville vurdert situasjonen nøye. Det krever mot å handle, men rettferdighet kan tale mot å ofre en uskyldig. Det finnes ingen ferdig regel; karakteren din testes.'
                    },
                    {
                        systemId: 'judaism',
                        verdict: 'accept',
                        explanation: 'Pikuach Nefesh (plikten til å redde liv) står ekstremt sterkt. Selv om man ikke skal drepe uskyldige, er dette en ekstrem nødssituasjon der valget om å redde flest mulig liv kan rettferdiggjøres for å minske det totale tapet av skaperverket.'
                    },
                    {
                        systemId: 'existentialism',
                        verdict: 'accept',
                        explanation: 'Du er dømt til frihet og ansvar. Å ikke velge er også et valg. Ved å handle aktivt for å redde fem, tar du ansvaret for å skape verdi i en ellers absurd situasjon. Du må bære byrden av den du dreper, men du har i det minste valgt bevisst.'
                    },
                    {
                        systemId: 'islam',
                        verdict: 'complex',
                        explanation: 'Islam forbyr drap på uskyldige, men tillater handlinger som gagner felleskapet (Maslaha). Dilemmaet er ekstremt vanskelig, da man må veie plikten til å redde liv mot forbudet mot å skade en individuelt uskyldig sjel.'
                    },
                    {
                        systemId: 'hinduism',
                        verdict: 'complex',
                        explanation: 'Ahimsa (ikke-vold) er et kjerneprinsipp, men Dharma (plikt) kan kreve at man handler for å bevare den kosmiske orden eller redde flest mulig i en nødssituasjon.'
                    },
                    {
                        systemId: 'buddhism',
                        verdict: 'complex',
                        explanation: 'Vektlegger medfølelse (Karuna). Å redde fem er en handling av medfølelse, men det å drepe én skaper negativ karma. Det finnes ingen enkel utvei i en slik betinget eksistens.'
                    },
                    {
                        systemId: 'sikhism',
                        verdict: 'accept',
                        explanation: 'Sikhisme lærer at man skal kjempe for rettferdighet og beskytte de svake. I en situasjon der man må velge, er plikten til å redde liv sentral.'
                    }
                ]
            },
            {
                id: 'do-nothing',
                label: 'La vognen gå',
                description: 'Vognen fortsetter rett frem og dreper fem personer.',
                responses: [
                    {
                        systemId: 'utilitarianism',
                        verdict: 'reject',
                        explanation: 'Dette er etisk uakseptabelt fordi det fører til fem ganger så mye lidelse (negativ nytte) som det alternative valget.'
                    },
                    {
                        systemId: 'deontology',
                        verdict: 'accept',
                        explanation: 'Ved å ikke dra i spaken unngår du å aktivt bryte en moralsk lov. Du er ikke årsaken til at vognen raser av sted, og du har ingen rett til å aktivt velge hvem som skal dø for å "redde" andre.'
                    },
                    {
                        systemId: 'virtue-ethics',
                        verdict: 'complex',
                        explanation: 'Det kan sees som passivitet og mangel på omsorg (dyd) å bare se fem personer dø, men det kan også sees som måtehold og respekt for skjebnen å ikke gripe inn som dommer over liv og død.'
                    },
                    {
                        systemId: 'existentialism',
                        verdict: 'reject',
                        explanation: 'Å nekte å handle er å flykte fra ditt radikale ansvar (ond tro/mauvaise foi). Du kan ikke vaske dine hender; ved å se på forholder du deg til situasjonen. Å la fem dø "av seg selv" er fremdeles et valg du har gjort.'
                    },
                    {
                        systemId: 'islam',
                        verdict: 'complex',
                        explanation: 'Islam forbyr drap på uskyldige, men vektlegger også å handle for å forhindre større skade. Å passivt la fem mennesker dø når man har mulighet til å redde dem, kan stride mot prinsippet om å fremme det gode og avverge det onde.'
                    }
                ]
            }
        ]
    },
    {
        id: 'privacy-security',
        title: 'Overvåkning for Sikkerhet',
        scenario: 'Myndighetene ønsker å installere et AI-system som overvåker all privat digital kommunikasjon for å forhindre terrorangrep. Systemet er 99% nøyaktig. Dette vil fjerne alt privatliv, men sannsynligvis redde hundrevis av liv årlig.',
        image: '/images/etikk/surveillance.webp',
        choices: [
            {
                id: 'accept-surveillance',
                label: 'Godta overvåkning',
                description: 'Sikkerheten settes først, selv om privatlivet forsvinner.',
                responses: [
                    {
                        systemId: 'utilitarianism',
                        verdict: 'accept',
                        explanation: 'Tryggheten til tusenvis av mennesker veier tyngre enn ulempen ved at privatlivet forsvinner for den enkelte.'
                    },
                    {
                        systemId: 'existentialism',
                        verdict: 'reject',
                        explanation: 'Dette reduserer mennesket til et objekt som overvåkes og kontrolleres. Det truer den radikale friheten og ansvaret individet har for sitt eget liv.'
                    },
                    {
                        systemId: 'islam',
                        verdict: 'complex',
                        explanation: 'Islam vektlegger både samfunnets sikkerhet (Maslaha) og retten til privatliv (sattar). Å beskytte liv er en prioritert verdi (Maqasid al-Sharia), men konstant mistenkeliggjøring er problematisk.'
                    },
                    {
                        systemId: 'hinduism',
                        verdict: 'complex',
                        explanation: 'Samfunnets stabilitet er viktig for at individet skal kunne utføre sin Dharma, men maktmisbruk fra staten kan forstyrre rettferdigheten.'
                    },
                    {
                        systemId: 'christianity',
                        verdict: 'nuanced',
                        explanation: 'Privatlivet er knyttet til menneskets verdighet som skapt i Guds bilde, men bibelen lærer også lydighet mot myndigheter som skal beskytte borgerne mot det onde.'
                    },
                    {
                        systemId: 'natural-law',
                        verdict: 'reject',
                        explanation: 'Privatliv er en del av eiendomsretten (selveierskap). Staten har ingen rett til å invadere uskyldige menneskers digitale "eiendom" uten mistanke. Masseovervåkning er en form for aggresjon mot fredelige borgere.'
                    }
                ]
            },
            {
                id: 'reject-surveillance',
                label: 'Avvis systemet',
                description: 'Privatlivet er en fundamental rettighet som ikke kan ofres for sikkerhet.',
                responses: [
                    {
                        systemId: 'social-contract',
                        verdict: 'accept',
                        explanation: 'Borgere inngår en samfunnskontrakt for å beskytte sine rettigheter, inkludert privatliv. Hvis staten bryter dette fundamentalt, mister den sin legitimitet.'
                    },
                    {
                        systemId: 'deontology',
                        verdict: 'accept',
                        explanation: 'Mennesket har en iboende verdighet og rett til et privat domene. Å massivt krenke dette er galt i seg selv, uavhengig av de potensielle sikkerhetsgevinstene.'
                    },
                    {
                        systemId: 'sikhism',
                        verdict: 'nuanced',
                        explanation: 'Sikhisme vektlegger rettferdighet og å kjempe mot undertrykkelse. Massiv statlig kontroll kan ses på som en form for undertrykkelse, selv om målet er "trygghet".'
                    }
                ]
            }
        ]
    },
    {
        id: 'ai-care-elderly',
        title: 'AI-roboter i Eldreomsorgen',
        scenario: 'Det er for få pleiere i eldreomsorgen. En ny generasjon roboter kan gi 24/7 omsorg, samtale og medisinsk oppfølging. Robotene virker svært empatiske, men alt er programmert simulering. Skal vi rulle ut dette i stor skala?',
        image: '/images/etikk/ai_care.webp',
        choices: [
            {
                id: 'use-robots',
                label: 'Bruk AI-pleiere',
                description: 'De eldre får mer oppfølging og blir mindre ensomme enn i dag.',
                responses: [
                    {
                        systemId: 'utilitarianism',
                        verdict: 'accept',
                        explanation: 'Dette løser et ressursproblem og øker livskvaliteten for de eldre sammenlignet med å sitte alene uten pleie.'
                    },
                    {
                        systemId: 'natural-law',
                        verdict: 'reject',
                        explanation: 'Mennesket er av naturen et sosialt vesen (zoon politikon). Å erstatte mellommenneskelig omsorg med maskiner krenker menneskets telos (formål) og verdighet. Omsorg kan ikke reduseres til en mekanisk prosess.'
                    },
                    {
                        systemId: 'hinduism',
                        verdict: 'complex',
                        explanation: 'Omsorg for eldre er en viktig Dharma. Hvis robotene faktisk lindrer lidelse, kan det ses som godt, men det mangler den sjelelige (Atman) forbindelsen mellom levende vesener.'
                    },
                    {
                        systemId: 'buddhism',
                        verdict: 'nuanced',
                        explanation: 'Målet er å lindre lidelse (Dukkha). Hvis en robot kan gi ro og verktøy for meditasjon til en ensom eldre, har den en positiv funksjon, men den kan ikke erstatte sange (fellesskap).'
                    },
                    {
                        systemId: 'islam',
                        verdict: 'nuanced',
                        explanation: 'Familien har hovedansvaret for de eldre. Roboter kan være et nyttig verktøy, men de må ikke bli en unnskyldning for å trekke seg unna plikten til personlig omsorg.'
                    }
                ]
            },
            {
                id: 'human-priority',
                label: 'Krev menneskelig pleie',
                description: 'Vi må heller bruke mer penger på å ansette folk, selv om det betyr mindre total omsorg.',
                responses: [
                    {
                        systemId: 'virtue-ethics',
                        verdict: 'accept',
                        explanation: 'Omsorg er en menneskelig dyd som krever ekte empati og karakter. En maskin kan ikke utvise dyd, og samfunnet mister en mulighet til å praktisere menneskelighet.'
                    },
                    {
                        systemId: 'judaism',
                        verdict: 'accept',
                        explanation: 'Vektlegger sterkt "Kibbud Zekenim" (å ære de eldre). Dette innebærer en ekte menneskelig relasjon og plikt som ikke kan delegeres til en maskin uten å miste den etiske kjernen.'
                    }
                ]
            }
        ]
    },
    {
        id: 'wealth-tax',
        title: 'Den Store Formueskatten',
        scenario: 'Staten vurderer å innføre en kraftig ekstraskatt på de 1% rikeste for å fullfinansiere gratis barnehage og tannhelse for alle. Motstandere mener dette er tyveri av opptjente midler, mens tilhengere mener det er nødvendig for sosial rettferdighet.',
        image: '/images/etikk/wealth_tax.webp',
        choices: [
            {
                id: 'apply-tax',
                label: 'Innføre skatten',
                description: 'Fellesskapet får bedre tjenester ved at de rikeste bidrar mer.',
                responses: [
                    {
                        systemId: 'utilitarianism',
                        verdict: 'accept',
                        explanation: 'Nytteverdien av gratis tannhelse og barnehage for hele befolkningen er langt større enn tapet av luksus for de aller rikeste.'
                    },
                    {
                        systemId: 'social-contract',
                        verdict: 'accept',
                        explanation: 'John Rawls" "uvitenhetens slør" tilsier at vi ville valgt et system som sikrer de svakeste, slik som gratis helsehjelp for alle.'
                    },
                    {
                        systemId: 'christianity',
                        verdict: 'accept',
                        explanation: 'Jesus lærte at det er vanskelig for en rik å komme inn i Guds rike, og kirken vektlegger tradisjonelt "valg for de fattige" og rettferdig fordeling.'
                    },
                    {
                        systemId: 'islam',
                        verdict: 'accept',
                        explanation: 'Prinsippet om Zakat og rettferdighet (Adl) innebærer at samfunnet har et felles ansvar for de trengende, og at dyp ulikhet bør motvirkes.'
                    },
                    {
                        systemId: 'sikhism',
                        verdict: 'accept',
                        explanation: 'Prinsippet om Vand Chakko innebærer å dele det man har med de som trenger det. Å bidra til fellesskapets velferd er en kjerneplikt.'
                    },
                    {
                        systemId: 'judaism',
                        verdict: 'accept',
                        explanation: 'Tzedakah betyr rettferdighet, ikke bare veldedighet. Samfunnet har en religiøs plikt til å sørge for at alle har det de trenger for å leve et verdig liv.'
                    }
                ]
            },
            {
                id: 'no-tax',
                label: 'Beholde dagens system',
                description: 'Eiendomsretten er fundamental, og staten bør ikke ta mer av folks opptjente formue.',
                responses: [
                    {
                        systemId: 'deontology',
                        verdict: 'accept',
                        explanation: 'Eiendomsretten kan sees på som en utvidelse av personlig frihet. Å ta midler fra noen kun for å bruke dem som et middel for andres mål bryter med rettferdighetsprinsipper.'
                    },
                    {
                        systemId: 'natural-law',
                        verdict: 'accept',
                        explanation: 'Skatt er per definisjon tvang (tyveri) av folks rettmessige eiendom. Å ta fra Peter for å gi til Paul bryter med NAP, uansett hvor edelt formålet er. Staten har ingen rettigheter som ikke individer har.'
                    }
                ]
            }
        ]
    },
    {
        id: 'friendship-secret',
        title: 'Vennskapets Hemmelighet',
        scenario: 'Din beste venn tilstår å ha stjålet en dyr klokke fra en butikk. Han er redd og ber deg om å ikke si noe. Politiet spør deg senere om du har sett noe som kan hjelpe i saken. Hva gjør du?',
        image: '/images/etikk/friendship_secret.webp',
        choices: [
            {
                id: 'keep-secret',
                label: 'Beskytt vennen',
                description: 'Lojalitet til de som står oss nærmest er viktigst.',
                responses: [
                    {
                        systemId: 'existentialism',
                        verdict: 'accept',
                        explanation: 'Du definerer din egen essens gjennom dine valg. Å velge lojalitet over lover er et radikalt valg av dine egne verdier og relasjoner.'
                    },
                    {
                        systemId: 'virtue-ethics',
                        verdict: 'complex',
                        explanation: 'Lojalitet er en dyd, men det er også rettferdighet. En person med froneis (praktisk klokskap) må vurdere om vennen fortjener beskyttelse eller korreksjon.'
                    }
                ]
            },
            {
                id: 'tell-truth',
                label: 'Fortell sannheten',
                description: 'Man skal ikke lyve for politiet, og rettferdighet må skje.',
                responses: [
                    {
                        systemId: 'natural-law',
                        verdict: 'accept',
                        explanation: 'Tyveri er et brudd på eiendomsretten og dermed naturretten. Selv om du ikke plikter å hjelpe staten, kan du ikke lyve (brudd på sannhetens natur) for å dekke over en aggresjon (tyveri).'
                    },
                    {
                        systemId: 'deontology',
                        verdict: 'accept',
                        explanation: 'Immanuel Kant mente at det er en absolutt plikt å fortelle sannheten. Å lyve for å beskytte noen kan aldri gjøres til en universell lov.'
                    },
                    {
                        systemId: 'utilitarianism',
                        verdict: 'accept',
                        explanation: 'Et samfunn der man ikke kan stole på loven eller sannheten vil på sikt føre til mye mer lidelse enn tapet av ett vennskap.'
                    },
                    {
                        systemId: 'islam',
                        verdict: 'accept',
                        explanation: 'Sannferdighet (Sidq) er en av de høyeste verdiene. Å dekke over en forbrytelse er ikke det samme som barmhjertighet.'
                    },
                    {
                        systemId: 'christianity',
                        verdict: 'accept',
                        explanation: 'Budet om å ikke tale usant er sentralt. Å handle rettferdig overfor butikkeieren er også en form for nestekjærlighet.'
                    },
                    {
                        systemId: 'buddhism',
                        verdict: 'accept',
                        explanation: 'Riktig tale og riktig handling innebærer å ikke være delaktig i løgn eller tyveri. Ærlighet renser sinnet for urenheter.'
                    }
                ]
            }
        ]
    },
    {
        id: 'climate-sacrifice',
        title: 'Klimaoppofrelsen',
        scenario: 'For å nå utslippsmålene må staten legge ned et stort smelteverk i en liten bygd. Dette vil kutte landets utslipp drastisk, men føre til at de fleste i bygda mister jobben og må flytte.',
        image: '/images/etikk/climate_sacrifice.webp',
        choices: [
            {
                id: 'close-factory',
                label: 'Legg ned verket',
                description: 'Miljøet og fremtidige generasjoner må prioriteres over dagens arbeidsplasser.',
                responses: [
                    {
                        systemId: 'utilitarianism',
                        verdict: 'accept',
                        explanation: 'Den totale nytten av å begrense global oppvarming for milliarder av mennesker i fremtiden veier tyngre enn de lokale arbeidsplassene i dag.'
                    },
                    {
                        systemId: 'deontology',
                        verdict: 'accept',
                        explanation: 'Vi har en plikt til å bevare livsbetingelsene på jorda. Å fortsette å forurense er å handle på en måte som ikke kan gjøres til en universell lov.'
                    },
                    {
                        systemId: 'natural-law',
                        verdict: 'accept',
                        explanation: 'Forurensning som skader andres helse eller eiendom er en form for fysisk aggresjon (trespass). Ingen har rett til å forgifte luften naboen puster i for å tjene penger. Verket bryter NAP.'
                    }
                ]
            },
            {
                id: 'keep-jobs',
                label: 'Behold arbeidsplassene',
                description: 'Staten har et ansvar for å sikre folks levebrød her og nå.',
                responses: [
                    {
                        systemId: 'social-contract',
                        verdict: 'accept',
                        explanation: 'Borgere inngår en kontrakt med staten for å få trygghet og levebrød. Å legge ned en hel bygd kan sees som et brudd på denne kontrakten.'
                    },
                    {
                        systemId: 'virtue-ethics',
                        verdict: 'complex',
                        explanation: 'Lederen må balansere dyden omsorg for sine ansatte mot dyden rettferdighet overfor planeten. Det finnes ingen enkel fasit.'
                    },
                    {
                        systemId: 'hinduism',
                        verdict: 'complex',
                        explanation: 'Sikre folks levebrød (Artha) er viktig, men respekt for naturen (Prakriti) er også en del av menneskets åndelige ansvar.'
                    }
                ]
            }
        ]
    },
    {
        id: 'genetic-design',
        title: 'Genetisk Design',
        scenario: 'Ny teknologi gjør det mulig å redigere genene til ufødte barn for å fjerne alvorlig sykdom, men også for å øke intelligens. Skal det være lov å "designe" barn for å gi dem et forsprang i livet?',
        image: '/images/etikk/genetic_design.webp',
        choices: [
            {
                id: 'allow-editing',
                label: 'Tillat genredigering',
                description: 'Vi bør bruke teknologi for å forbedre menneskeheten og gi barn best mulige sjanser.',
                responses: [
                    {
                        systemId: 'utilitarianism',
                        verdict: 'accept',
                        explanation: 'Hvis vi kan skape smartere og sunnere mennesker som bidrar mer til samfunnet, vil den totale lykken og nytten øke.'
                    },
                    {
                        systemId: 'existentialism',
                        verdict: 'accept',
                        explanation: 'Mennesket skaper seg selv. Hvis vi kan forme vår egen biologi, er det det ultimate uttrykket for vår frihet og makt over egen skjebne.'
                    }
                ]
            },
            {
                id: 'limit-editing',
                label: 'Begrens / Forby',
                description: 'Naturen bør gå sin gang, og vi risikerer et splittet A- og B-samfunn.',
                responses: [
                    {
                        systemId: 'natural-law',
                        verdict: 'reject',
                        explanation: 'Barnet er ikke foreldrenes eiendom, men et selvstendig vesen med rett til sin egen, umanipulerte natur. Å designe et barn gjør det til et objekt for andres vilje, ikke et subjekt i seg selv.'
                    },
                    {
                        systemId: 'deontology',
                        verdict: 'reject',
                        explanation: 'Å endre gener for å oppnå sosiale mål er å bruke det ufødte barnet som et middel for foreldrenes ambisjoner.'
                    },
                    {
                        systemId: 'virtue-ethics',
                        verdict: 'nuanced',
                        explanation: 'Hvilken karakter utviser vi hvis vi aldri aksepterer sårbarhet eller ulikhet? Måtehold og ydmykhet overfor naturen er viktige dyder.'
                    }
                ]
            }
        ]
    },
    {
        id: 'free-speech-order',
        title: 'Ytringsfrihet og Ro',
        scenario: 'En gruppe vil brenne en hellig tekst offentlig for å vise sin avsky mot religion. Politiet frykter voldelige opptøyer hvis dette skjer. Skal staten prioritere ytringsfriheten eller den offentlige roen?',
        image: '/images/etikk/free_speech.webp',
        choices: [
            {
                id: 'allow-protest',
                label: 'Tillat brenningen',
                description: 'Ytringsfriheten er absolutt, selv når den er støtende eller provoserende.',
                responses: [
                    {
                        systemId: 'utilitarianism',
                        verdict: 'complex',
                        explanation: 'John Stuart Mill mente at selv feilaktige eller støtende ytringer er viktige for samfunnets sannhetssøken. Men voldelige opptøyer reduserer den totale nytten.'
                    },
                    {
                        systemId: 'social-contract',
                        verdict: 'accept',
                        explanation: 'I et liberalt demokrati må vi tåle ytringer vi hater for å sikre vår egen rett til å snakke fritt. Staten har ikke mandat til å sensurere meninger.'
                    },
                    {
                        systemId: 'natural-law',
                        verdict: 'accept',
                        explanation: 'Så lenge brenneren eier boken selv, og brannen er forsvarlig (ikke skader andres eiendom), er dette en lovlig handling. Ytringsfrihet er en eiendomsrett – retten til å bruke sin egen eiendom/kropp til å uttrykke seg.'
                    }
                ]
            },
            {
                id: 'stop-protest',
                label: 'Stopp markeringen',
                description: 'Samfunnets stabilitet og respekt for ulike grupper er viktigere enn retten til å brenne bøker.',
                responses: [
                    {
                        systemId: 'judaism',
                        verdict: 'accept',
                        explanation: 'Brenning av hellige skrifter er en dyp fornærmelse og et brudd på respekten for det hellige. Samfunnsfred er en prioritert verdi.'
                    },
                    {
                        systemId: 'islam',
                        verdict: 'accept',
                        explanation: 'Koranen er Guds ord. Å tillate skjending av det hellige skaper dyp splid og er et angrep på verdigheten til troende.'
                    },
                    {
                        systemId: 'christianity',
                        verdict: 'nuanced',
                        explanation: 'Selv om ytringsfrihet er viktig, bør man opptre med nestekjærlighet og respekt for naboens tro. Brenning fremmer ikke dialog eller fred.'
                    }
                ]
            }
        ]
    }
];
