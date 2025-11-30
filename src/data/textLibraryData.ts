export interface TextEntry {
    id: string;
    title: string;
    author: string;
    genre: string;
    theme?: string[];
    language?: 'bm.' | 'nn.';
    url?: string;
    content?: string[];
    publishedYear?: number;
    createdDate?: string;
    definitions?: { term: string; definition: string }[];
}

export const textLibraryData: TextEntry[] = [
    {
        id: 'faderen',
        title: 'Faderen',
        author: 'Bjørnstjerne Bjørnson',
        genre: 'Novelle',
        language: 'bm.',
        theme: ['Farsrolle', 'Makt', 'Status'],
        publishedYear: 1860,
        createdDate: '2023-11-29',
        definitions: [
            { term: "fader", definition: "far" },
            { term: "prestegjeld", definition: "område knyttet til en kirke" },
            { term: "velsignelse", definition: "glede eller lykke (gitt av Gud)" },
            { term: "tidde", definition: "var stille" },
            { term: "ærend", definition: "gjøremål" },
            { term: "nummer på kirkegulvet", definition: "rekkefølge konfirmantene ble hørt i. De flinkeste (eller de med mest penger og status) fikk nummer 1." },
            { term: "daler", definition: "eldre norsk sølvmynt" },
            { term: "atter", definition: "igjen" },
            { term: "hen", definition: "av sted, bort" },
            { term: "mannsterk", definition: "i følge med mange (menn)" },
            { term: "begjære lysning", definition: "be om at noe blir offentlig kjent" },
            { term: "intet", definition: "ingenting" },
            { term: "tegnebok", definition: "lommebok" },
            { term: "tofte", definition: "sete i båt" },
            { term: "tilje", definition: "gulv eller brett til å stå på i bunnen av en båt" },
            { term: "pletten", definition: "flekken, området" },
            { term: "Soknet", definition: "søkte, lette" },
            { term: "Legat", definition: "en pengegave til bestemte formål" }
        ],
        content: [
            "Den mann som det her skal fortelles om, var den mektigste i sitt prestegjeld; han het Tord Øverås. Han stod en dag i prestens kontor, høy og alvorlig. «Jeg har fått en sønn,» sa han, «og vil ha ham over dåpen.» — «Hva skal han hete?» — «Finn, etter far min.» — «Og fadderne?» — De ble nevnt, og det var da bygdens beste menn og kvinner av mannens slekt. «Er det ellers noe?» spurte presten, han så opp. Bonden stod litt, «jeg ville gjerne ha ham døpt for seg selv,» sa han. — «Det vil si på en hverdag?» — «På lørdag førstkommende, 12 middag.» — «Er det ellers noe?» spurte presten. «Ellers er det ingen ting,» sa bonden, dreide luen som ville han gå. Da reiste presten seg; «jo, også dette,» sa han og gikk like bort til Tord, tok hans hånd og så ham inn i øynene: «Måtte Gud gjøre at barnet blir deg til velsignelse!»",
            "Seksten år etter den dag stod Tord i prestens stue. «Du holder deg godt, du Tord,» sa presten, han så ingen forandring på ham. «Jeg har heller ingen sorger,» svarte Tord. Til dette tidde presten, men en stund etter spurte han: «Hva er ditt ærend i kveld?» — «I kveld kommer jeg for å snakke om sønnen min som skal konfirmeres i morgen.» — «Han er en flink gutt.» — «Jeg ville ikke betale presten før jeg hørte hvilket nummer han fikk på kirkegulvet.» — «Han skal stå nummer 1.» — «Jeg hører dette, — og her er 10 daler til presten.» — «Er det ellers noe?» spurte presten, han så på Tord.» — «Ellers er det ingen ting.» Tord gikk.",
            "Atter løp åtte år hen, og så hørtes det støy en dag foran prestens kontor, for mange menn kom, og Tord først. Presten så opp og kjente ham. «Du kommer mannsterk i kveld.» — «Jeg ville begjære lysning for sønnen min, han skal giftes med Karen Storlien, datter av Gudmund som her står.» — «Dette er jo bygdens rikeste jente.» — «De sier så,» svarte bonden, han strøk håret opp med den ene hånden. Presten satt en stund og som i tanker, han sa intet, men førte navnene opp i sine bøker, og mennene skrev under. Tord la tre daler på bordet. «Jeg skal bare ha en,» sa presten. — «Vet det nok, men han er mitt eneste barn, ville gjerne gjøre det vel.» — Presten tok imot pengene. «Det er tredje gang du på sønnens vegne står her nå, Tord.» — «Men nå er jeg også ferdig med ham,» sa Tord, la sin tegnebok sammen, sa farvel og gikk — mennene langsomt etter.",
            "Fjorten dager etter den dag rodde far og sønn i stille vær over vannet til Storlien for å samtale om bryllupet. «Den toften ligger ikke sikkert under meg,» sa sønnen og reiste seg for å legge den til rette. I det samme glir den tiljen han står på, han slår ut med armene, gir et skrik og faller i vannet. — «Ta i åren!» ropte faren, han reiste seg opp og stakk den ut. Men da sønnen hadde gjort et par tak, stivner han. «Vent litt!» ropte faren, han rodde til. Da velter sønnen bakover, ser langt på faren – og synker.",
            "Tord ville ikke rett tro, han holdt båten stille og stirret på den pletten hvor sønnen var sunket ned som skulle han komme opp igjen. Der steg noen bobler opp, enda noen, så bare en stor som brast —og speilblank lå atter sjøen.",
            "I tre dager og tre netter så folk faren ro rundt om denne pletten uten å ta mat eller søvn til seg, han soknet etter sin sønn. Og på den tredje dag om morgenen fant han ham og kom bærende oppover bakkene med ham til sin gård.",
            "Det kunne vel være gått et år siden den dag. Da hører presten sent en høstkveld noen rusle ved døren ute i forstuen og famle varsomt etter låsen. Presten åpnet døren, og inn trådte en høy, foroverbøyd mann, mager og hvit i håret. Presten så lenge på ham før han kjente ham, det var Tord. «Kommer du så sent?» sa presten og stod stille foran ham. «Å ja, jeg kommer sent,» sa Tord, han satte seg ned. Presten satte seg også, som han ventet, det var lenge stilt. Da sa Tord: «Jeg har noe med som jeg gjerne ville gi til de fattige, det skulle gjøres et legat og bære min sønns navn,» — han reiste seg, la penger på bordet og satte seg atter. Presten talte dem opp; «det var mange penger,» sa han. — «Det er halvparten av min gård, jeg solgte den i dag.» Presten ble sittende i lang stillhet, så spurte han endelig, men mildt: «Hva vil du ta deg for?» — «Noe bedre.» – De satt der en stund, Tord med øynene mot gulvet, presten med øynene på ham. Da sa presten sakte og langt: «Nå tenker jeg at sønnen din endelig er blitt deg til velsignelse.» — «ja, nå tenker jeg det også selv,» sa Tord, han så opp, og to tårer rant tunge nedover hans ansikt."
        ]
    },
    {
        id: 'twitter-noveller',
        title: 'Twitter-noveller',
        author: 'Frode Grytten',
        genre: 'Novelle',
        language: 'nn.',
        theme: ['Moderne kommunikasjon'],
        createdDate: '2023-11-28'
    },
    {
        id: 'sma-nokler-store-rom',
        title: 'Små nøkler, store rom',
        author: 'Bjørg Vik',
        genre: 'Romanutdrag',
        language: 'bm.',
        theme: ['Oppvekst'],
        createdDate: '2023-11-27'
    },
    {
        id: 'barsakh',
        title: 'Barsakh',
        author: 'Simon Stranger',
        genre: 'Romanutdrag',
        language: 'bm.',
        theme: ['Flukt'],
        createdDate: '2023-11-26'
    },
    {
        id: 'hjorten-i-skogbrynet',
        title: 'Hjorten i skogbrynet',
        author: 'Gunnhild Øyehaug',
        genre: 'Novelle',
        language: 'nn.',
        theme: ['Natur'],
        createdDate: '2023-11-25'
    },
    {
        id: 'mennesker-pa-kafe',
        title: 'Mennesker på kafé',
        author: 'Kjell Askildsen',
        genre: 'Novelle',
        language: 'bm.',
        theme: ['Ensomhet'],
        createdDate: '2023-11-24'
    },
    {
        id: 'alt-blir-som-for',
        title: 'Alt blir som før',
        author: 'Ari Behn',
        genre: 'Novelle',
        language: 'bm.',
        theme: ['Relasjoner'],
        createdDate: '2023-11-23'
    },
    {
        id: 'ung-gutt-i-sno',
        title: 'Ung gutt i snø',
        author: 'Bjarte Breiteig',
        genre: 'Novelle',
        language: 'bm.',
        theme: ['Ungdom'],
        createdDate: '2023-11-22'
    },
    {
        id: 'a-drepe-et-barn',
        title: 'Å drepe et barn',
        author: 'Stig Dagermann',
        genre: 'Novelle',
        language: 'bm.',
        theme: ['Skjebne'],
        createdDate: '2023-11-21'
    },
    {
        id: 'dypfryst',
        title: 'Dypfryst',
        author: 'Roald Dahl',
        genre: 'Novelle',
        language: 'bm.',
        theme: ['Krim', 'Spenning'],
        createdDate: '2023-11-20'
    },
    {
        id: 'karens-jul',
        title: 'Karens jul',
        author: 'Amalie Skram',
        genre: 'Novelle',
        language: 'bm.',
        theme: ['Fattigdom', 'Jul', 'Tragedie', 'Samfunnskritikk'],
        publishedYear: 1885,
        createdDate: '2025-11-30',
        content: [
            "På en av dampskipskaiene i Kristiania lå der for en del år siden et gråmalt trehus med flatt tak, uten skorsten, omtrent 4 alen langt og litt kortere på den annen lid. I begge tverrveggene var der et lite vindu, det ene like overfor det andre. Døren vendte mod sjøsiden og kunne lukkes både innvendig og utvendig med jernkroker, der ble hektet fast i kramper av samme metall.",
            "Hytten var opprinnelig blitt oppført til fergemennene, for at de skulle ha tak over hodet i regnvær og i vinterkulden når de satt og drev og ventet på at noen skulle komme og forlange båt. Senere, da smådamperne mer og mer slukte trafikken, var fergemennene trukket annet steds hen. Så ble huset kun benyttet leilighetsvis av hvem det kunne falle seg. De siste som hadde gjort bruk av det, var noen stenarbeidere, når de holdt sine måltider to av gangen, da de en sommer reparerte på kaistykket i nærheten.",
            "Siden var der ingen som tok notis av den gamle, lille rønne. Den ble stående hvor den stod, fordi havnevesenet ikke fikk det innfall å ta den bort, og fordi ingen inngikk med klage over at den stod i veien for noen eller noe.",
            "Så var det en vinternatt i desember måned hen under jul. Det drev så smått med sne, men den smeltet mens den falt, og gjorde den klebrige mølje på kaiens brosten alt våtere og fetere. På gasslyktene og dampkranene lå sneen som et grålighvitt, fintfrynset overtrekk, og kom man tett ned til skipene, kunne man skimte gjennom mørket at den hang i riggen som girlander mellom mastene. I den mørkegrå, disige luft fikk gassflammene i lyktene en skitten, branngul glans, mens skipslanternene lyste med et grumset-rødt skinn. Av og til skar den knallende lyd fra skipsklokkene med et brutalt gnelder gjennom den fuktige atmosfære, når vakten om bord slo glass til avløsning.",
            "Politikonstabelen som patruljerte på kaien, stanset ved gasslykten utenfor det forhenværende fergemannshus. Han trakk sitt ur frem for å se hvor langt natten var leden, men idet han holdt det opp mot lyset, hørte han noe som lignet barnegråt. Han lot hånden synke, så seg om og lyttet. Nei, det var ikke så. Opp igjen med uret. Lyden var der atter, denne gang blandet sammen med en sakte tyssen. Igjen lot han hånden synke, og igjen ble det stille. Hva djevelen var dette for narreri? Han gav seg til å snuse om i nærheten, men kunne ingen ting oppdage. For tredje gang kom uret opp mot gasskinnet, og denne gang fikk han fred til å se at klokken straks var 4.",
            "Han drev oppover, forbi huset, undret seg litt, men tenkte sluttelig at det vel måtte ha vært innbilning, eller hvordan det nu kunne henge sammen.",
            "Da han en stund etter kom samme vei tilbake og nærmet seg huset, skottet han til det. Hva var det? Så han ikke noe røre seg der inne? Gasslyktene utenfor kastet fra begge sider skinnet inn gjennom vinduene, så det tok seg ut som var der tent lys der inne.",
            "Han gikk hen og kikket inn. Ganske riktig. Der satt et vesen på benken tett under vinduet, en liten sammenkrøket skikkelse, som bøyde seg forover og puslet med noe han ikke kunne se. Et skritt omkring hjørnet, og han stod ved døren og ville inn. Den var stengt.",
            "«Lukk opp» – ropte han, og banket på med sin knoke.",
            "Han hørte det fare opp med et sett, der kom som et svakt, forskrekket utrop, og så ble det ganske stille.",
            "Han banket igjen med sin knyttede neve og gjentok:",
            "«Lukk opp, Dere der inne! Lukk opp på øyeblikket.»",
            "«Hva er det? Herregud, her er ingen her» – kom det forskremt fra tett ved døren.",
            "«Lukk opp. Det er politiet!»",
            "«Jøsses, er det polletie! – Å kjære vene, det er bare meg, jæ gjør ingen ting, bare blottenes sitter her, skjønner dere.»",
            "«Kan Dem ikke se til å få opp med døren med Dem, eller Dem ska få an’t å vite. Vil Dem ...»",
            "Han kom ikke lenger, for i det samme gikk døren opp, og i neste nu lutet han seg gjennom åpningen inn i det lave rom, hvor han akkurat kunne stå oppreist.",
            "«Er Dem galen! Inte lukke opp for politiet! Hva tenker Dem på?»",
            "«Om forlatelse, hr. polleti, – jæ lukker jo opp, ser dere.»",
            "«Det er nok også beste rå’en» – brummet han.",
            "«Hva er du for en, og hvem har gitt deg lov til å ta lossement her?»",
            "«Det er bare meg, Karen» – hvisket hun. «Jæ sitter her med ungen min.»",
            "Politikonstabelen tok den talende nærmere i øyesyn. Det var et tynt, lite fruentimmer, med et smalt, blekt ansikt og et dypt kjertelarr på det ene kinn, rett opp og ned som en stake, og øyensynlig neppe ganske voksen. Hun var iført et lysebrunt overstykke, en slags kofte eller jakke, hvis snitt røpet at den hadde kjent bedre dager, og et mørkere kjoleskjørt, der hang i laser forneden og nådde henne til anklene. Føttene stakk i et par hullete soldatstøvler, hvis åpninger foran var uten snørebånd.",
            "I den ene arm holdt hun en bylt filler, der lå tvers på hennes liv. Ut av byltens øverste ende stakk noe hvitt. Det var et barnehode, som diet hennes magre bryst. Om hodet hadde hun en tjafs av et tørkle, der var knyttet under haken, bak i nakken stakk hårflisene frem. Hun rystet av kulde fra øverst til nederst, og når hun flyttet seg, klisset og knirket det i støvlene, som stod hun og stampet i en grøtagtig substans.",
            "«Jæ trudde inte det ku sjenere nå’en» – ble hun ved i en pipende tone – «det står jo her, dette kotte’».",
            "Politikonstabelen fikk en beklemmende fornemmelse. I det første øyeblikk hadde han tenkt å drive henne ut med fyndige ord og la henne slippe med en advarsel. Men da han så på dette elendige barn, som stod der med det lille kryp i armen og trykket seg opp mot benken og ikke torde sette seg av frykt og ydmykhet, gikk der en slags rørelse gjennom ham.",
            "«Men i Jessu navn da, – hva bestiller du her, pika mi?»",
            "Hun oppfanget den mildere klang i hans stemme. Angsten fortok seg, og hun begynte å gråte.",
            "«Sett deg ned litt» – sa han – «ungen er sakta tung å stå og holde på».",
            "Hun gled stille ned på benken.",
            "«Nådda» – sa konstabelen oppmuntrende og satte seg på den motsatte tverrbenk.",
            "«Å herregud, hr. polleti – la meg få være her», lespet hun gjennom gråten. «Jæ skal inte gjøre ugagn, inte det verdige gran – holle rent etter meg – Dere ser selv – her er ingen urenslighet – der der er brødskorper». – Hun pekte på et filleknytte nede på gulvet. «Jæ går og ber om dagene. – I flasken er der en skvett vann. – La meg få være her om nettene, tedess jæ får plassa mi tilbake – bare madammen kommer» – hun holdt inne og snøt seg i fingrene, som hun avtørket på sitt skjørt.",
            "«Madammen, hvem er nå det da?» spurte konstabelen.",
            "«Det var henne jæ tjente hos. – Jæ hadde slik pen kondisjon med 4 kroner månen og frukost, men så kom jæ i uløkka, og så måtte jæ jo vekk, forstås. Madam Olsen gikk sjøl og fikk meg på stiftelsen, hu er så snill, madam Olsen, og jæ var i tjenesten like til dess jæ gikk på Stiftelsen og la meg, for hu er alene, madam Olsen, og hu sa hu sku beholde meg, tedess jæ inte ku’ orke mer. Men så kom dette på, at madam Olsen sku’ reise, for hu er jordmor, madam Olsen, og så ble hu syk liggenes der oppe på landet, og nu sier dem hu kommer inte før til jula.»",
            "«Men gudbevare meg vel, å gå slik og slepe omkring med ungen mens du venter på madammen. Kan der være mening i slikt no’e?» konstabelen rystet på hodet.",
            "«Jæ har ingenstans å være» – sutret hun. «Nu siden far min døde, er der ingen til å ta meg i forsvar når min stemor kaster meg ut.»",
            "«Men barnefaren da?»",
            "«Han da,» sa hun og gjorde et lite kast med nakken. «Der er nok inte nå’en skikk å få på ham lell.»",
            "«Men du vet da vel det at du kan få’n dømt til å betale for barnet?»",
            "«Ja, dem sier så» – svarte hun. «Men hosdan ska en bære seg at, når han inte fins?»",
            "«Oppgi du bare navnet hans til meg, du» – mente konstabelen – «så skal han nok bli fremskaffet.»",
            "«Ja, den som visste det» – sa hun stillferdig.",
            "«Hå for nå’e! Kjenner du inte navnet på ditt eget barns far?»",
            "Karen stakk fingeren i munnen og suget på den. Hodet gled forover. Der kom et hjelpeløst, fjollet smil på ansiktet. «N-e-i,» hvisket hun med en langtrukken betoning på hver bokstav og uten å ta fingeren bort.",
            "«Nå har jeg aldri i mine dager hørt så galt» – satte konstabelen i. «I Jessu navn da, hosdan gikk det til at du kom isammens med ham?»",
            "«Jæ traff ham på gata om kveldene, når det var mørkt,» sa hun, «men det varte inte lenge før han ble borte, og siden har jæ aldri sett ham.»",
            "«Har du inte spurt deg for da?»",
            "«Det har jæ nok allties, men der er ingen som vet hvor han er avblitt. Han har tatt seg en plass på landet, ventelig, for han hadde enten med hester eller kyr å gjøre, det ku jæ kjenne på lokta som følgte ham.»",
            "«Gud bevare meg vel for et slags stell,» mumlet konstabelen. «Du må gå og melde deg til fattigvesenet,» sa han høyere, «så der kan bli en greie på detteneherre.»",
            "«Nei, det gjør jæ inte,» svarte hun plutselig stedig.",
            "«Det er da vel bedre å komme på Mangelsgården og få mat og husly, fremfor det du går på nå,» sa konstabelen.",
            "«Ja, men når bare madam Olsen kommer – hu er så snill, madam Olsen – hu tar meg til månespike, jæ vet det så visst, for hu lovte det – så kjenner jæ en kone som vil ta oss i lossji for 3 kroner månen. Hu vil passe ungen mens jæ er hos madam Olsen, og så ska jæ gjøre henneses arbei, når jæ kommer fra madammen. Det blir så vel alt sammen, når bare madam Olsen kommer, og hu kommer til jula, sier dem.»",
            "«Ja, ja, jenta mi, hver som er voksen, rå’er seg sjøl, men her har du ingen rettighet til å oppholde deg.»",
            "«Om jæ sitter her om natten – kan nå det gjøre nå’e? Å herregud la meg få lov til det, ungen ska inte få skrike. Bare til madammen kommer – å go’e hr. polleti, bare til madammen kommer.»",
            "«Men du fryser jo fordervet, både du og barnet.» Han så på hennes usle klær.",
            "«Her er da allties likere her enn ute på åpne gata, ser Dere. Å, hr. polleti – bare til madammen kommer.»",
            "«Egentlig så sku’ du nu på stassjonen, ser du» – sa konstabelen i en overveiende tone og klødde seg bak øret.",
            "Hun for opp og flyttet seg hen til ham. «Inte gjør det, inte gjør det,» klynket hun, idet hun med sine frosne fingre grep fatt i hans ærme. «Jæ ber så vakkert – i Guds navn – bare til madammen kommer.»",
            "Konstabelen betenkte seg. Tre dager til julen, regnet han ut.",
            "«Ja ja, la gå,» sa han høyt, idet han reiste seg. «Du kan være her til julen, men ikke en dag lenger. Og legg merke til det: Der er ingen som må vite det.»",
            "«Gud signe dere, Gud signe dere, og takk skal Dere ha,» brøt hun ut.",
            "«Men pass på å være vekk kl. 6 presis om morgenen, før de begynner trafikken her ute,» la han til da han var halvt ute av døren.",
            "Neste natt, da han kom forbi hytten, stanset han og så inn. Hun satt i en skrå stilling, tilbakelent mot vinduskarmen. Hennes profil med knyttetørkleet om hodet tegnet seg svakt mot rutene. Barnet lå ved brystet og diet. Hun rørte seg ikke og syntes å sove.",
            "Ut på morgenen slo det om til frost. I løpet av den neste dag gikk termometeret ned til 12 grader. Det ble gneldrende kulde med klar og stille luft. På vinduene i det lille fergemannshus kom der et tykt lag av hvitt rim, som gjorde rutene aldeles ugjennomsiktige.",
            "Julaften ble der igjen værforandring. Det tødde og dryppet allestedsfra. Man var nesten nødt til å gå med paraply, enskjønt det ikke regnet.",
            "Nede på kaien var alle pakkhusvinduene atter blitt isfrie, og føret var verre enn noensinne.",
            "Om ettermiddagen ved totiden kom konstabelen der ned. Han hadde hatt orlov de siste par netter på grunn av en forkjølelsesfeber som legen hadde gitt ham attest for. Nu skulle han ut og snakke med en fyr på ett av dampskipene.",
            "Hans vei falt forbi huset. Enskjønt det allerede var begynt å skumre, så han det dog i flere skritts avstand, det der brakte ham til å stanse og bli så underlig ille ved. Der satt hun i nøyaktig den samme stilling som hin natt for to dager siden. Det selvsamme stykke profil på ruten. Han anstillet egentlig ikke noen refleksjon derover, bare følte seg grepet av gru over dette forstenede selvsamme. Der gikk en uvilkårlig gysen gjennom ham. Skulle der være hendt noe?",
            "Han skyndte seg hen til døren; den var stengt. Så slo han i stykker en rute, fikk fatt på en jernstang, som han strakte inn gjennom åpningen og hektet med den kroken av krampen. Trådte så inn, sakte og forsiktig.",
            "De var stendøde begge to. Barnet lå opp til moren og holdt ennu i døden brystet i munnen. Nedover dets kinn var der fra brystvorten silt noen dråper blod, som lå størknet på haken. Hun var forferdelig uttæret, men på ansiktet lå der som et stille smil.",
            "«Stakkars jente, for en jul hun fikk,» mumlet konstabelen, mens han visket seg i øyet.",
            "«Men kanskje det er best som det er for dem begge to. Vårherre, han har nå vel en mening med det.»"
        ]
    },
    {
        id: 'det-usynlige-barnet',
        title: 'Det usynlige barnet',
        author: 'Tove Jansson',
        genre: 'Novelle',
        language: 'bm.',
        theme: ['Identitet'],
        createdDate: '2023-11-19'
    }
];
