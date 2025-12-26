
export interface DialogOption {
    label: string;
    nextId: string;
    action?: string;
}

export interface DialogNode {
    text: string;
    options: DialogOption[];
}

export interface TavernNPC {
    id: string;
    name: string;
    role: string;
    description: string;
    conversation: Record<string, DialogNode>;
}

export const TAVERN_NPCS: TavernNPC[] = [
    {
        id: 'pilegrim',
        name: 'Sigurd Pilegrim',
        role: 'Vandrer',
        description: 'En sliten mann med stav og bredbremmet hatt, merket med et kamskjell.',
        conversation: {
            'start': {
                text: 'Fred være med deg. Mine føtter er såre, men sjelen er lett. Veien til Nidaros er lang.',
                options: [
                    { label: 'Hvorfor går du til Nidaros?', nextId: 'nidaros' },
                    { label: 'Hva betyr skjellet du bærer?', nextId: 'shell' },
                    { label: 'Lykke til videre. (Gå)', nextId: 'EXIT' }
                ]
            },
            'nidaros': {
                text: 'For å be ved St. Olavs skrin, selvsagt! Hellig Olavs kraft kan helbrede sykdom og gi tilgivelse. Tusenvis går denne veien hvert år.',
                options: [
                    { label: 'Hvem var Hellig Olav?', nextId: 'olav' },
                    { label: 'God tur. (Gå)', nextId: 'EXIT' }
                ]
            },
            'olav': {
                text: 'Olav den Hellige? Norges evige konge! Han falt på Stiklestad i 1030 for å kristne landet. Det sies at håret og neglene hans fortsatte å vokse etter døden.',
                options: [{ label: 'Et mirakel! (Gå)', nextId: 'EXIT' }]
            },
            'shell': {
                text: 'Dette er et Ib-skjell. Det viser at jeg også har vandret helt til Santiago de Compostela i Spania. En pilegrims tegn.',
                options: [{ label: 'Imponerende reise. (Gå)', nextId: 'EXIT' }]
            }
        }
    },
    {
        id: 'hansa',
        name: 'Gerhard fra Lübeck',
        role: 'Hansa-kjøpmann',
        description: 'En velkledd tysker som snakker med tydelig aksent og studerer et regnskap.',
        conversation: {
            'start': {
                text: 'Nein, nein! Tørrfisken må være av *prima* kvalitet! Ah, unnskyld. Jeg forventet en leveranse fra Bergen.',
                options: [
                    { label: 'Hva er Hansaen?', nextId: 'hansa_info' },
                    { label: 'Hvorfor er tørrfisk så viktig?', nextId: 'stockfish' },
                    { label: 'Farvel. (Gå)', nextId: 'EXIT' }
                ]
            },
            'hansa_info': {
                text: 'Vi er Det Hanseatiske Forbund. Et mektig nettverk av handelsbyer i Tyskland og rundt Østersjøen. Vi kontrollerer handelen i nord!',
                options: [
                    { label: 'Har dere mye makt?', nextId: 'power' },
                    { label: 'Interessant. (Gå)', nextId: 'EXIT' }
                ]
            },
            'power': {
                text: 'Jawohl! Til og med konger må låne penger av oss. Vi har egne lover og egne bydeler, som Bryggen i Bergen.',
                options: [{ label: 'Mektige venner. (Gå)', nextId: 'EXIT' }]
            },
            'stockfish': {
                text: 'Tørrfisk er gull! Den holder seg i årevis. Vi selger den til katolikker i sør som må spise fisk under fasten. Norge lever av dette!',
                options: [{ label: 'Jeg skjønner. (Gå)', nextId: 'EXIT' }]
            }
        }
    },
    {
        id: 'leilending',
        name: 'Tormod',
        role: 'Leilending (Bonde)',
        description: 'En grovbygd mann som ser bekymret ut over et krus øl.',
        conversation: {
            'start': {
                text: 'Uff... landskylden øker i år igjen. Jeg vet ikke om jeg kan betale.',
                options: [
                    { label: 'Hva er landskyld?', nextId: 'rent' },
                    { label: 'Eier du ikke gården din?', nextId: 'own' },
                    { label: 'Lykke til. (Gå)', nextId: 'EXIT' }
                ]
            },
            'rent': {
                text: 'Det er leien jeg må betale til jordeieren. Som oftest betaler vi i smør, korn eller fisk. I år krever kirken ekstra mye smør.',
                options: [{ label: 'Høres dyrt ut. (Gå)', nextId: 'EXIT' }]
            },
            'own': {
                text: 'Eie? Haha! Nei, nei. Nesten ingen bønder eier jorda selv. Vi leier av Kongen, Kirken eller adelsmenn. Vi er leilendinger.',
                options: [
                    { label: 'Kan du bli kastet ut?', nextId: 'evict' },
                    { label: 'Tungt liv. (Gå)', nextId: 'EXIT' }
                ]
            },
            'evict': {
                text: 'Hvis jeg betaler leien og følger loven, har jeg rett til å bli. Norsk lov beskytter oss bedre enn bøndene lenger sør i Europa.',
                options: [{ label: 'Godt å vite. (Gå)', nextId: 'EXIT' }]
            }
        }
    },
    {
        id: 'steinhugger',
        name: 'Master William',
        role: 'Steinhugger',
        description: 'Han har støv i håret og sterke hender, og tegner geometriske former på bordet.',
        conversation: {
            'start': {
                text: 'Ser du buen her? Spissbuen fordeler vekten bedre enn rundbuen. Slik kan vi bygge katedralene høyere mot himmelen!',
                options: [
                    { label: 'Bygger du en katedral?', nextId: 'cathedral' },
                    { label: 'Hva er gotikk?', nextId: 'gothic' },
                    { label: 'Forstår ikke. (Gå)', nextId: 'EXIT' }
                ]
            },
            'cathedral': {
                text: 'Jeg arbeider på Nidarosdomen. Det tar generasjoner å bygge. Min bestefar la fundamentet, jeg bygger veggene, og kanskje mitt barnebarn legger taket.',
                options: [{ label: 'Et evighetsprosjekt. (Gå)', nextId: 'EXIT' }]
            },
            'gothic': {
                text: 'Det er den nye stilen fra Frankrike. Store vinduer med farget glass som slipper inn Guds lys, støttet av strebepilarer på utsiden.',
                options: [{ label: 'Vakkert. (Gå)', nextId: 'EXIT' }]
            }
        }
    },
    {
        id: 'vaering',
        name: 'Halvdan',
        role: 'Tidl. Væring',
        description: 'En eldre kriger med eksotisk silke i kappen og et arr over øyet.',
        conversation: {
            'start': {
                text: 'Dette ølet smaker vann. I Miklagard hadde vi vin som smakte av sol og honning.',
                options: [
                    { label: 'Hvor er Miklagard?', nextId: 'miklagard' },
                    { label: 'Hva gjorde du der?', nextId: 'guard' },
                    { label: 'Skål. (Gå)', nextId: 'EXIT' }
                ]
            },
            'miklagard': {
                text: 'Den store byen i øst! Konstantinopel. Byen er så stor at du kan gå i dagevis uten å se enden. Og kuppelen på Hagia Sofia svever i luften!',
                options: [{ label: 'Høres utrolig ut. (Gå)', nextId: 'EXIT' }]
            },
            'guard': {
                text: 'Jeg tjente i Væringgarden. Keiserens personlige livvakt. Vi nordboere er kjent for vår styrke og lojalitet... og våre store økser.',
                options: [
                    { label: 'Møtte du Keiseren?', nextId: 'emperor' },
                    { label: 'Respekt. (Gå)', nextId: 'EXIT' }
                ]
            },
            'emperor': {
                text: 'Jeg så ham på avstand. Basiileus, kalte de ham. Han satt på en trone av gull som kunne heises opp i taket!',
                options: [{ label: 'For en luksus. (Gå)', nextId: 'EXIT' }]
            }
        }
    },
    {
        id: 'munk',
        name: 'Broder Johannes',
        role: 'Skrivermunk',
        description: 'Han har blekk på fingrene og myser mot lyset.',
        conversation: {
            'start': {
                text: 'Velsignet være du. Har du sett en gås? Jeg trenger nye fjærpenner til skriptoriet.',
                options: [
                    { label: 'Hva skriver du?', nextId: 'writing' },
                    { label: 'Er bøker dyre?', nextId: 'books' },
                    { label: 'Ingen gjess her. (Gå)', nextId: 'EXIT' }
                ]
            },
            'writing': {
                text: 'Jeg kopierer Bibelen, for hånd. Det tar et helt år å bli ferdig med én bok. Vi dekorerer sidene med bladgull og maling.',
                options: [{ label: 'Tålmodighetsarbeid. (Gå)', nextId: 'EXIT' }]
            },
            'books': {
                text: 'En boksamling kan være verdt mer enn en hel landsby! Pergamentet er laget av kalveskinn. Det går med en hel flokk kalver for én bibel.',
                options: [{ label: 'Dyrt materiale! (Gå)', nextId: 'EXIT' }]
            }
        }
    },
    {
        id: 'pestlege',
        name: 'Doktor Pestus',
        role: 'Omstreifende Lege',
        description: 'Han lukter av eddik og urter, og ser nervøst rundt seg.',
        conversation: {
            'start': {
                text: 'Hold avstand! Luften kan være forgiftet. Har du kjent noen hevelser under armene?',
                options: [
                    { label: 'Snakker du om Svartedauden?', nextId: 'plague' },
                    { label: 'Jeg føler meg frisk.', nextId: 'healthy' },
                    { label: 'Jeg går nå. (Gå)', nextId: 'EXIT' }
                ]
            },
            'plague': {
                text: 'Pesten, Den Store Døden! Den kom med skip til Bergen i 1349. Folk faller om som fluer. Det er Guds straff!',
                options: [
                    { label: 'Hvordan beskytter man seg?', nextId: 'cure' },
                    { label: 'Skremmende. (Gå)', nextId: 'EXIT' }
                ]
            },
            'cure': {
                text: 'Lukter! Pesten smitter gjennom dårlig luft (miasma). Bær en pose med velduftende urter, eller vask deg med eddik.',
                options: [{ label: 'Takk for rådet. (Gå)', nextId: 'EXIT' }]
            },
            'healthy': {
                text: 'Bra. Pris Herren. Men se opp for rotter. De bringer ulykke.',
                options: [{ label: 'Notert. (Gå)', nextId: 'EXIT' }]
            }
        }
    },
    {
        id: 'birkebeiner',
        name: 'Gunnar',
        role: 'Birkebeiner',
        description: 'En mager kriger med leggbeskyttere av never (bjørkebark).',
        conversation: {
            'start': {
                text: 'For Kong Sverre! Ned med Baglerne og biskopenes makt!',
                options: [
                    { label: 'Hvem er Birkebeinerne?', nextId: 'birkebeiner' },
                    { label: 'Hvorfor hater dere biskopene?', nextId: 'church' },
                    { label: 'Rolig nå. (Gå)', nextId: 'EXIT' }
                ]
            },
            'birkebeiner': {
                text: 'Vi er kongens menn! Mange av oss var så fattige at vi måtte binde never rundt leggene for å holde varmen. Derav navnet.',
                options: [{ label: 'En stolt tittel nå. (Gå)', nextId: 'EXIT' }]
            },
            'church': {
                text: 'Kong Sverre «talte Roma midt imot»! Paven lyste ham i bann, men han nektet å bøye seg. Kongen skal styre landet, ikke prestene.',
                options: [{ label: 'Dristig. (Gå)', nextId: 'EXIT' }]
            }
        }
    },
    {
        id: 'kone',
        name: 'Ragnhild',
        role: 'Urtekone',
        description: 'Hun har en kurv full av rare planter og ser lurt på deg.',
        conversation: {
            'start': {
                text: 'Har du vondt i magen? Eller kanskje kjærlighetssorg? Skogen har en urt for alt.',
                options: [
                    { label: 'Er dette trolldom?', nextId: 'witch' },
                    { label: 'Hva hjelper mot sår?', nextId: 'wound' },
                    { label: 'Nei takk. (Gå)', nextId: 'EXIT' }
                ]
            },
            'witch': {
                text: 'Hysj! Ikke si det ordet. Prestene liker ikke det de ikke forstår. Jeg bruker bare Guds skaperverk til å helbrede.',
                options: [{ label: 'Forståelig. (Gå)', nextId: 'EXIT' }]
            },
            'wound': {
                text: 'Groblad! Legg et blad på såret, så trekker det ut gørra. Og litt honning holder betennelsen unna.',
                options: [{ label: 'Godt råd. (Gå)', nextId: 'EXIT' }]
            }
        }
    },
    {
        id: 'skald',
        name: 'Einar Skald',
        role: 'Hoff-poet',
        description: 'Han deklamerer høyt for seg selv og prøver å finne et rim.',
        conversation: {
            'start': {
                text: 'Vrede... Sverd... Blod... Nei, det rimer ikke godt nok. Jeg skal kvede et dikt til ære for Jarlen.',
                options: [
                    { label: 'Hva er en saga?', nextId: 'saga' },
                    { label: 'Kan du kvadet om Sigurd?', nextId: 'sigurd' },
                    { label: 'Lykke til. (Gå)', nextId: 'EXIT' }
                ]
            },
            'saga': {
                text: 'Sagaene er historiene om våre forfedre. Om konger og helter, skrevet ned på Island. Uten dem glemmer vi hvem vi er.',
                options: [{ label: 'Snorre Sturlason? (Gå)', nextId: 'EXIT' }]
            },
            'sigurd': {
                text: 'Sigurd Fåvnesbane! Han som drepte dragen Fåvne og smakte på dragens hjerte så han forsto fuglenes språk. En klassiker!',
                options: [{ label: 'Fortell mer! (Gå)', nextId: 'EXIT' }]
            }
        }
    }
];
