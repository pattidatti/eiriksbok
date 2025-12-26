
export interface DialogOption {
    label: string;
    nextId: string; // 'EXIT' closes the dialog
    action?: string; // Optional action handling like 'GIVE_TIP'
}

export interface DialogNode {
    text: string;
    options: DialogOption[];
}

export interface TavernNPC {
    id: string;
    name: string;
    role: string;
    description: string; // Visual description
    conversation: Record<string, DialogNode>;
}

export const TAVERN_NPCS: TavernNPC[] = [
    {
        id: 'olav',
        name: 'Olav "Den Gamle"',
        role: 'Bonde',
        description: 'En værbitt gammel mann med hender som bark.',
        conversation: {
            'start': {
                text: 'Hmph. En fremmed? Sjelden vare her omkring nå for tiden. Hva vil du?',
                options: [
                    { label: 'Hvordan står det til med avlingene?', nextId: 'crops' },
                    { label: 'Hvem styrer dette stedet?', nextId: 'baron' },
                    { label: 'Bare ser meg rundt. (Gå)', nextId: 'EXIT' }
                ]
            },
            'crops': {
                text: 'Dårlig. Frosten kom tidlig i år. Hvis ikke baronen åpner skattekisten, blir det en hard vinter for oss småfolk.',
                options: [
                    { label: 'Trist å høre.', nextId: 'start' },
                    { label: 'Kanskje jeg kan hjelpe?', nextId: 'help' }
                ]
            },
            'baron': {
                text: 'Baronen? Han sitter vel i tårnet sitt og teller gull. Vi ser ham sjelden, bortsett fra når skatteinnkreverne kommer.',
                options: [
                    { label: 'Er han en rettferdig mann?', nextId: 'fair' },
                    { label: 'Jeg forstår. (Gå tilbake)', nextId: 'start' }
                ]
            },
            'fair': {
                text: 'Rettferdighet er et ord for de rike. Vi andre må bare overleve.',
                options: [
                    { label: 'Kloke ord.', nextId: 'start' }
                ]
            },
            'help': {
                text: 'Med mindre du kan trylle frem solskinn eller gull, tviler jeg på det. Men takk for tanken.',
                options: [
                    { label: 'Vi får se. (Gå)', nextId: 'EXIT' }
                ]
            }
        }
    },
    {
        id: 'ingrid',
        name: 'Ingrid',
        role: 'Vertshuspike',
        description: 'En travel kvinne med et skarpt blikk og et fargerikt forkle.',
        conversation: {
            'start': {
                text: 'Skal du ha noe å drikke, eller står du bare der og skygger for lyset?',
                options: [
                    { label: 'Hva er dagens rykte?', nextId: 'rumors' },
                    { label: 'Du virker travel.', nextId: 'busy' },
                    { label: 'Ingenting takk. (Gå)', nextId: 'EXIT' }
                ]
            },
            'rumors': {
                text: 'Folk prater om alt mulig. Noen sier det er ulver i skogen. Andre hvisker om krig i sør. Jeg hører bare klirring av mynter.',
                options: [
                    { label: 'Ingenting spesifikt?', nextId: 'specific' },
                    { label: 'Greit å vite.', nextId: 'start' }
                ]
            },
            'specific': {
                text: 'Vel... en handelsmann sa at prisene på jern vil skyte i været. Kanskje verdt å hamstre?',
                options: [
                    { label: 'Takk for tipset!', nextId: 'EXIT' }
                ]
            },
            'busy': {
                text: 'Travel? Det er underdrivelsen av året. Disse bøndene drikker som om det er verdens undergang.',
                options: [
                    { label: 'Stå på!', nextId: 'EXIT' }
                ]
            }
        }
    },
    {
        id: 'bjorn',
        name: 'Bjørn',
        role: 'Smed',
        description: 'En gigant av en mann, dekket av sot og svette.',
        conversation: {
            'start': {
                text: 'Trenger du et sverd? Eller kanskje å få rettet ut ryggraden?',
                options: [
                    { label: 'Jeg ser bare etter en prat.', nextId: 'chat' },
                    { label: 'Lager du gode våpen?', nextId: 'weapons' },
                    { label: 'Nei takk. (Gå)', nextId: 'EXIT' }
                ]
            },
            'chat': {
                text: 'Prat er billig. Jern koster. Men la gå, jeg har en pause.',
                options: [
                    { label: 'Hvordan er livet i gruvene?', nextId: 'mines' },
                    { label: 'Aldri mind. (Gå)', nextId: 'EXIT' }
                ]
            },
            'weapons': {
                text: 'De beste i riket! Hvis du har råd. Skarpe nok til å barbere en drage.',
                options: [
                    { label: 'Imponerende.', nextId: 'start' }
                ]
            },
            'mines': {
                text: 'Gruvene er dype og mørke. Det sies at de har gravd for dypt i vest-sjaktet. Rare lyder.',
                options: [
                    { label: 'Skummelt.', nextId: 'start' }
                ]
            }
        }
    },
    {
        id: 'elias',
        name: 'Broder Elias',
        role: 'Munk',
        description: 'En lavmælt mann i brune kapper som nipper forsiktig til en mjød.',
        conversation: {
            'start': {
                text: 'Fred være med deg, vandrer.',
                options: [
                    { label: 'Og med deg, broder.', nextId: 'peace' },
                    { label: 'Hva gjør en munk her?', nextId: 'sinner' },
                    { label: 'Farvel. (Gå)', nextId: 'EXIT' }
                ]
            },
            'peace': {
                text: 'Måtte Herren lyse opp din sti i disse mørke tider.',
                options: [{ label: 'Takk.', nextId: 'EXIT' }]
            },
            'sinner': {
                text: 'Selv Guds tjenere blir tørste. Og det er her synderne er, er det ikke? Noen må jo redde dem.',
                options: [
                    { label: 'Godt poeng.', nextId: 'start' }
                ]
            }
        }
    },
    {
        id: 'kare',
        name: 'Kåre',
        role: 'Spillemann',
        description: 'En fargerik figur med en lutt på ryggen og et lurt smil.',
        conversation: {
            'start': {
                text: 'En mynt for en sang? Eller kanskje en historie om helter og monstre?',
                options: [
                    { label: 'Fortell en historie.', nextId: 'story' },
                    { label: 'Kan du spille noe glad?', nextId: 'song' },
                    { label: 'Ikke i dag. (Gå)', nextId: 'EXIT' }
                ]
            },
            'story': {
                text: 'Det var en gang en ridder som red ut for å fri til prinsessen. Men han glemte buksene sine!',
                options: [{ label: 'Haha!', nextId: 'start' }]
            },
            'song': {
                text: '*Klimprer ivrig på lutten* "Øl og flesk og mjød og sang..."',
                options: [{ label: 'Bravo!', nextId: 'EXIT' }]
            }
        }
    },
    {
        id: 'sigrid',
        name: 'Sigrid',
        role: 'Vaskekone',
        description: 'En eldre dame som ser ut til å vite alt om alle.',
        conversation: {
            'start': {
                text: 'Du ser ikke ut som du er herfra. Jeg ser alt, vet du.',
                options: [
                    { label: 'Hva vet du om meg?', nextId: 'me' },
                    { label: 'Er det noen hemmeligheter i landsbyen?', nextId: 'secrets' },
                    { label: 'Må gå. (Gå)', nextId: 'EXIT' }
                ]
            },
            'me': {
                text: 'At du stiller mange spørsmål. Det kan være farlig.',
                options: [{ label: 'Skal huske det.', nextId: 'start' }]
            },
            'secrets': {
                text: 'Mølleren blander sagflis i melet sitt. Og presten... vel, han liker vinen sin litt for godt.',
                options: [{ label: 'Skandaløst!', nextId: 'EXIT' }]
            }
        }
    },
    {
        id: 'tor',
        name: 'Tor',
        role: 'Vakt',
        description: 'En stor mann i rustning som tar en pause fra vaktrunden.',
        conversation: {
            'start': {
                text: 'Hold deg unna trøbbel, så kommer vi godt overens.',
                options: [
                    { label: 'Er det mye bråk her?', nextId: 'trouble' },
                    { label: 'Jeg er lovlydig.', nextId: 'law' },
                    { label: 'Greit. (Gå)', nextId: 'EXIT' }
                ]
            },
            'trouble': {
                text: 'Bare fulle bønder. Men noen ganger kommer det røvere fra skogen. Da får sverdet mitt smake blod.',
                options: [{ label: 'Trygt å vite.', nextId: 'start' }]
            },
            'law': {
                text: 'Det sier de alle. Helt til de har fått et par krus for mye.',
                options: [{ label: 'Vi får se.', nextId: 'EXIT' }]
            }
        }
    },
    {
        id: 'elin',
        name: 'Elin',
        role: 'Blomsterpike',
        description: 'En ung jente med en kurv fulle av markblomster.',
        conversation: {
            'start': {
                text: 'Vil du kjøpe en blomst til din kjære?',
                options: [
                    { label: 'Jeg har ingen kjær.', nextId: 'none' },
                    { label: 'Ja, gjerne.', nextId: 'buy' },
                    { label: 'Nei takk. (Gå)', nextId: 'EXIT' }
                ]
            },
            'none': {
                text: 'Å, så trist. Da kan du kanskje kjøpe en til deg selv? For å lyse opp dagen!',
                options: [{ label: 'Kanskje det.', nextId: 'start' }]
            },
            'buy': {
                text: 'Tusen takk! Den blå er for trofasthet.',
                options: [{ label: 'Takk skal du ha.', nextId: 'EXIT' }]
            }
        }
    },
    {
        id: 'hakon',
        name: 'Håkon',
        role: 'Handelsreisende',
        description: 'En mann i fine klær som ser litt malplassert ut.',
        conversation: {
            'start': {
                text: 'Dette stedet er... sjarmerende. På en rustikk måte.',
                options: [
                    { label: 'Du er ikke herfra?', nextId: 'travel' },
                    { label: 'Vi liker det sånn.', nextId: 'local' },
                    { label: 'Ha det bra. (Gå)', nextId: 'EXIT' }
                ]
            },
            'travel': {
                text: 'Nei, jeg kommer fra hovedstaden. Der er gatene brolagt med gull... nesten. Her er det mest gjørme.',
                options: [{ label: 'Gjørme bygger karakter.', nextId: 'start' }]
            },
            'local': {
                text: 'Det ser jeg. En enkel smak for enkle folk.',
                options: [{ label: 'Pass deg nå.', nextId: 'EXIT' }]
            }
        }
    },
    {
        id: 'astrid',
        name: 'Astrid',
        role: 'Kloke Kone',
        description: 'En gammel kvinne med rare amuletter rundt halsen.',
        conversation: {
            'start': {
                text: 'Stjernene hvisker i natt. Skjebnen er i bevegelse.',
                options: [
                    { label: 'Hva ser du?', nextId: 'see' },
                    { label: 'Jeg tror ikke på sånt.', nextId: 'doubt' },
                    { label: 'Unnskyld meg. (Gå)', nextId: 'EXIT' }
                ]
            },
            'see': {
                text: 'En storm kommer. Ikke av vær og vind, men av stål og blod. Vær beredt.',
                options: [{ label: 'Jeg skal huske det.', nextId: 'EXIT' }]
            },
            'doubt': {
                text: 'Troen er ikke nødvendig. Skjebnen bryr seg ikke om du tror.',
                options: [{ label: 'Vi får se.', nextId: 'start' }]
            }
        }
    }
];
