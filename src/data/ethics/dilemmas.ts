import type { EthicalDilemma } from './types';

export const dilemmas: EthicalDilemma[] = [
    {
        id: 'trolley-standard',
        title: 'Det Klassiske Sporvognsproblemet',
        scenario: 'En sporvogn har mistet bremsene og raser mot fem banearbeidere som står på sporet. Du står ved en spak. Hvis du drar i den, vil vognen svinge inn på et annet spor der det bare står én arbeider. Hva gjør du?',
        image: '/images/etikk/trolley_standard.png',
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
                        explanation: 'Fornuften og naturens orden tilsier at man skal beskytte liv. Å aktivt gripe inn for å ta et uskyldig liv bryter med den naturlige retten til selvbevaring, selv om hensikten er å bevare andre liv.'
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
        image: '/images/etikk/surveillance.png',
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
        image: '/images/etikk/ai_care.png',
        choices: [
            {
                id: 'use-robots',
                label: 'Bruk AI-pleiere',
                description: 'De eldre får mer oppfølging og blir mindre ensomme enn i dag.',
                responses: [
                    {
                        systemId: 'utilitarianism',
                        verdict: 'accept',
                        explanation: 'Dette løser et ressurs粗problem og øker livskvaliteten for de eldre sammenlignet med å sitte alene uten pleie.'
                    },
                    {
                        systemId: 'natural-law',
                        verdict: 'reject',
                        explanation: 'Det ligger i menneskets natur å ha sosiale behov som kun kan tilfredsstilles av andre mennesker. Å erstatte menneskelig kontakt med maskiner er "unaturlig" og krenker menneskets sosiale essens.'
                    },
                    {
                        systemId: 'hinduism',
                        verdict: 'complex',
                        explanation: 'Omsorg for eldre er en viktig Dharma. Hvis robotene faktisk lindrer lidelse, kan det ses som godt, men det mangler den sjelelige (Atman) forbindelsen mellom levende vesener.'
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
    }
];
