// Dypskanner for glossary-kandidater.
// Skiller mellom PERSONER (krever flerord-mønstre eller tittel-prefiks)
// og BEGREPER (rare høyfrekvens-ord med fagord-suffiks).
// Skriver to filer: suggestions-people.json og suggestions-concepts.json

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { stopWords as baseStop } from './stopwords.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_DIR = path.join(__dirname, '../public/content');
const CONCEPTS_DIR = path.join(CONTENT_DIR, 'concepts');
const PEOPLE_DIR = path.join(CONTENT_DIR, 'people');
const OUT_PEOPLE = path.join(__dirname, '../public/data/suggestions-people.json');
const OUT_CONCEPTS = path.join(__dirname, '../public/data/suggestions-concepts.json');

const HONORIFICS = new Set([
    'kong', 'kongen', 'konge', 'dronning', 'dronningen', 'keiser', 'keiseren', 'keiserinne',
    'tsar', 'tsaren', 'pave', 'paven', 'biskop', 'biskopen', 'erkebiskop',
    'general', 'generalen', 'admiral', 'oberst', 'kaptein',
    'president', 'presidenten', 'statsminister', 'statsministeren',
    'hertug', 'hertugen', 'jarl', 'jarlen', 'fyrste', 'fyrsten',
    'sir', 'lord', 'frue', 'fru', 'herr', 'helgen', 'helgenen',
    'profet', 'profeten', 'sjeik', 'sjeiken', 'sultan', 'sultanen',
    'fører', 'føreren', 'leder', 'lederen', 'forfatter', 'forfatteren',
    'filosof', 'filosofen', 'maler', 'maleren', 'komponist', 'komponisten',
    'oppfinner', 'oppfinneren', 'forsker', 'forskeren', 'biolog', 'fysiker',
    'matematiker', 'astronom', 'historiker', 'økonom', 'reformatoren',
    'munken', 'munk', 'rabbi', 'rabbien', 'imam', 'imamen', 'guru',
    'doktor', 'professor', 'fader',
]);

// Geo / land / regioner / vanlige fellesnavn vi IKKE vil ha som personer
const NOT_PEOPLE = new Set([
    // Land
    'norge', 'sverige', 'danmark', 'tyskland', 'frankrike', 'england', 'storbritannia',
    'spania', 'italia', 'russland', 'sovjetunionen', 'østerrike', 'ungarn', 'polen',
    'finland', 'nederland', 'belgia', 'serbia', 'kroatia', 'tsjekkia', 'slovakia',
    'usa', 'amerika', 'kina', 'japan', 'india', 'korea', 'vietnam', 'iran', 'irak',
    'tyrkia', 'egypt', 'israel', 'palestina', 'syria', 'libanon', 'jordan',
    'hellas', 'roma', 'romerriket', 'bysants', 'persia', 'persiariket', 'kypros',
    'sør-afrika', 'etiopia', 'ghana', 'kongo', 'algerie', 'marokko', 'sudan',
    'australia', 'canada', 'mexico', 'brasil', 'argentina', 'chile',
    'island', 'irland', 'skottland', 'wales', 'nord-irland', 'baltikum',
    'estland', 'latvia', 'litauen', 'ukraina', 'hviterussland', 'bulgaria', 'romania',
    'jugoslavia', 'bosnia', 'kosovo', 'albania', 'makedonia', 'montenegro',
    // Byer / steder
    'oslo', 'bergen', 'trondheim', 'stavanger', 'kristiansand', 'tromsø',
    'london', 'paris', 'berlin', 'wien', 'moskva', 'sankt petersburg', 'petrograd',
    'leningrad', 'roma', 'athen', 'jerusalem', 'mekka', 'medina', 'istanbul',
    'konstantinopel', 'kairo', 'baghdad', 'damaskus', 'sarajevo', 'beograd',
    'praha', 'budapest', 'warszawa', 'amsterdam', 'brussel', 'madrid', 'lisboa',
    'stockholm', 'helsinki', 'reykjavik', 'dublin', 'edinburgh', 'manchester',
    'liverpool', 'belfast', 'gdansk', 'kiev', 'odessa', 'minsk', 'riga', 'tallinn',
    'vilnius', 'beijing', 'shanghai', 'tokyo', 'hiroshima', 'nagasaki', 'seoul',
    'pyongyang', 'hanoi', 'saigon', 'mumbai', 'delhi', 'kolkata', 'karachi',
    'new york', 'washington', 'los angeles', 'chicago', 'san francisco', 'boston',
    'philadelphia', 'detroit', 'pittsburgh', 'dallas', 'houston', 'miami',
    // Verdensdeler / havområder / regioner
    'europa', 'asia', 'afrika', 'oseania', 'antarktis', 'eurasia',
    'nord', 'sør', 'øst', 'vest', 'midtøsten', 'fjernøsten', 'nær-østen',
    'norden', 'skandinavia', 'balkan', 'kaukasus', 'sahara', 'sibir',
    'atlanterhavet', 'stillehavet', 'middelhavet', 'østersjøen', 'nordsjøen',
    'svartehavet', 'rødehavet', 'arabiske', 'persiabukta',
    // Vanlige sentens-startere og fellesnavn
    'tenk', 'jeg', 'man', 'hun', 'hans', 'hennes', 'hver', 'hvert', 'andre',
    'folk', 'folket', 'krigen', 'kongen', 'staten', 'kirken', 'byen', 'landet',
    'målet', 'svaret', 'resultatet', 'ordet', 'mennesket', 'bønder', 'soldater',
    'les', 'bruk', 'eksempel', 'steg', 'veien', 'først', 'sist', 'siden', 'mens',
    'dette', 'denne', 'disse', 'samme', 'slike', 'altså', 'derfor', 'fordi',
    'norges', 'europas', 'verdens', 'norsk', 'norske', 'tysk', 'tyske',
    'stortinget', 'grunnloven', 'bibelen', 'koranen', 'toraen', 'evangeliet',
    'guds', 'gud', 'jesus', 'kristus', 'allah', 'brahman', 'buddha', 'jesu',
    // Religioner / ismer (er begreper, ikke folk)
    'islam', 'kristendommen', 'kristendom', 'jødedom', 'jødedommen', 'hinduisme',
    'hinduismen', 'buddhisme', 'buddhismen', 'sikhisme', 'sikhismen',
    // Vanlige verb-startere i Title Case (sentence start)
    'i', 'på', 'fra', 'til', 'med', 'for', 'mot', 'etter', 'før', 'da', 'når',
    'derfor', 'samtidig', 'plutselig', 'tilslutt', 'først', 'deretter',
]);

// Norske fagord-suffikser som ofte indikerer abstrakt begrep
const CONCEPT_SUFFIXES = [
    'isme', 'ismen', 'ismer',
    'dom', 'dommen',
    'skap', 'skapet',
    'het', 'heten', 'heter',
    'tet', 'teten',
    'asjon', 'asjonen', 'asjoner',
    'ologi', 'ologien',
    'graf', 'grafen', 'grafi',
    'logi', 'logien',
    'krati', 'kratiet',
    'arki', 'arkiet',
    'sofi', 'sofien',
];

// Ekstra vanlige verb-/adjektiv-/ord-former som ikke er begreper
const COMMON_NORWEGIAN = new Set([
    'hadde', 'andre', 'verden', 'store', 'norge', 'første', 'mennesker', 'samme',
    'europa', 'nesten', 'betyr', 'moderne', 'gjorde', 'aldri', 'norske', 'krigen',
    'historien', 'finnes', 'mente', 'alltid', 'begynte', 'senere', 'bruker', 'deres',
    'verdens', 'staten', 'viktigste', 'tyskland', 'kalles', 'handler', 'kongen',
    'gjøre', 'kirken', 'samfunnet', 'livet', 'stedet', 'fortsatt', 'kommer',
    'bygge', 'frankrike', 'forstå', 'største', 'samfunn', 'landet', 'skjedde',
    'hverandre', 'gamle', 'bruke', 'skjer', 'norsk', 'penger', 'millioner',
    'viser', 'kristne', 'samtidig', 'makten', 'viktig', 'slutt', 'eksempel',
    'soldater', 'kalt', 'over', 'noen', 'mange', 'hvis', 'fikk', 'gjør', 'visste',
    'bare', 'fordi', 'derfor', 'måtte', 'kunne', 'skulle', 'ville', 'burde',
    'noen', 'noe', 'litt', 'mye', 'mer', 'mest', 'flere', 'færre', 'minst',
    'mellom', 'gjennom', 'uten', 'hver', 'hvert', 'alle', 'alt', 'andre', 'tredje',
    'fjerde', 'femte', 'siste', 'neste', 'forrige', 'godt', 'bedre', 'best', 'verre',
    'verst', 'lite', 'liten', 'små', 'store', 'stort', 'hele', 'helt', 'halv',
    'akkurat', 'ganske', 'helt', 'bare', 'sterkere', 'svakere', 'høyere', 'lavere',
    'eldre', 'yngre', 'tidlig', 'tidligere', 'sent', 'senere', 'lengre', 'kortere',
    'levde', 'levde', 'gikk', 'kom', 'sa', 'tok', 'ga', 'fant', 'satte', 'bygde',
    'lagde', 'startet', 'sluttet', 'åpnet', 'lukket', 'tapte', 'vant', 'kjempet',
    'angrep', 'forsvarte', 'erobret', 'mistet', 'fikk', 'mistet', 'reiste', 'dro',
    'kjente', 'visste', 'trodde', 'mente', 'sa', 'sier', 'svarte', 'spurte',
    'lærte', 'leste', 'skrev', 'tegnet', 'malte', 'spilte', 'sang',
    'enkelt', 'vanskelig', 'lett', 'tungt', 'rask', 'rasktt', 'sakte', 'langsom',
    'usikker', 'sikker', 'klar', 'uklart', 'tydelig', 'utydelig',
    'igjen', 'tilbake', 'fram', 'forover', 'oppover', 'nedover', 'innover', 'utover',
    'samtidig', 'plutselig', 'gradvis', 'sakte', 'umiddelbart',
    'spesielt', 'særlig', 'ofte', 'sjelden', 'aldri', 'alltid', 'iblant',
    'kalles', 'kalt', 'kaller', 'het', 'heter', 'hete',
    'gjelder', 'gjelder', 'gjaldt', 'angår', 'gjelder',
    'måten', 'måter', 'måte', 'gangen', 'ganger', 'gang',
    'tiden', 'tider', 'tid', 'året', 'årene', 'år', 'måneden', 'månedene',
    'dagen', 'dagene', 'natten', 'nettene', 'morgen', 'kveld',
    'klokken', 'minutter', 'sekunder',
    'tilfelle', 'tilfeller', 'situasjon', 'situasjoner',
    'spørsmål', 'svar', 'problem', 'problemer', 'løsning', 'løsninger',
    'grunn', 'grunner', 'årsak', 'årsaker', 'følge', 'følger',
    'forskjell', 'forskjeller', 'likhet', 'likheter',
    'enkelte', 'visse', 'bestemte', 'spesielle', 'særegne', 'unike',
    'vanlige', 'vanlig', 'normale', 'normal', 'typiske', 'typisk',
    'gjorde', 'gjøre', 'gjort', 'gjør', 'gjøre',
    'levde', 'leve', 'levd', 'lever', 'lever',
    'kommer', 'komme', 'kom', 'kommet',
    'finner', 'finne', 'fant', 'funnet',
    'mente', 'mene', 'ment', 'mener',
    'visste', 'vite', 'visst', 'vet',
    'kunne', 'kan', 'kunnet',
    'skulle', 'skal', 'skulle',
    'måtte', 'må', 'måttet',
    'ville', 'vil', 'villet',
    'fikk', 'få', 'fått', 'får',
    'satt', 'satte', 'sitter', 'sittet',
    'lå', 'ligger', 'liggende', 'lå',
    'sto', 'står', 'stå', 'stått',
    'gikk', 'gå', 'gått', 'går',
    'kjørte', 'kjøre', 'kjørt', 'kjører',
    'reiste', 'reise', 'reist', 'reiser',
    'dro', 'dra', 'dratt', 'drar',
    'tok', 'ta', 'tatt', 'tar',
    'ga', 'gi', 'gitt', 'gir',
    'sa', 'si', 'sagt', 'sier',
    'så', 'se', 'sett', 'ser',
    'gjorde', 'gjøre', 'gjort', 'gjør',
    'lagde', 'lage', 'laget', 'lager',
    'fant', 'finne', 'funnet', 'finner',
    'sendte', 'sende', 'sendt', 'sender',
    'kalte', 'kalle', 'kalt', 'kaller',
    'kjente', 'kjenne', 'kjent', 'kjenner',
    'lærte', 'lære', 'lært', 'lærer',
    'leste', 'lese', 'lest', 'leser',
    'skrev', 'skrive', 'skrevet', 'skriver',
    'måles', 'måle', 'målt', 'måler',
    'tellet', 'telle', 'tellet', 'teller',
    'starter', 'starte', 'startet', 'start',
    'slutter', 'slutte', 'sluttet', 'slutt',
    'åpner', 'åpne', 'åpnet', 'åpne',
    'lukker', 'lukke', 'lukket', 'lukke',
    'taper', 'tape', 'tapt', 'tap',
    'vinner', 'vinne', 'vunnet', 'vinner',
    'kjemper', 'kjempe', 'kjempet', 'kjemp',
    'angriper', 'angripe', 'angrepet', 'angrep',
    'forsvarer', 'forsvare', 'forsvart', 'forsvar',
    'erobrer', 'erobre', 'erobret', 'erobring',
    'mister', 'miste', 'mistet', 'mister',
    'får', 'få', 'fått', 'får',
    'høyere', 'lavere', 'eldre', 'yngre',
    'tidligere', 'senere', 'lengre', 'kortere',
    'sterkere', 'svakere', 'rikere', 'fattigere',
    'bedre', 'verre', 'best', 'verst',
    'lengst', 'lengste', 'kortest', 'korteste',
    'største', 'minste', 'tyngste', 'letteste',
    'finnes', 'fantes', 'fantes', 'finnes',
]);

function findJsonFiles(dir, list = []) {
    if (!fs.existsSync(dir)) return list;
    for (const f of fs.readdirSync(dir)) {
        const p = path.join(dir, f);
        const st = fs.statSync(p);
        if (st.isDirectory()) findJsonFiles(p, list);
        else if (f.endsWith('.json') && f !== 'manifest.json' && f !== 'global-timeline.json'
            && f !== 'content-index.json' && f !== 'concepts.json' && f !== 'glossary.json') {
            list.push(p);
        }
    }
    return list;
}

function loadKnown() {
    const known = new Map(); // lowercase term -> kind
    for (const dir of [[CONCEPTS_DIR, 'concept'], [PEOPLE_DIR, 'person']]) {
        const files = findJsonFiles(dir[0]);
        for (const file of files) {
            try {
                const c = JSON.parse(fs.readFileSync(file, 'utf-8'));
                const term = c.term || c.name;
                if (term) {
                    known.set(term.toLowerCase(), dir[1]);
                    // Også registrer enkeltdeler av personnavn (etternavn)
                    if (dir[1] === 'person') {
                        const parts = term.split(/\s+/);
                        for (const p of parts) {
                            if (p.length > 3 && /^[A-ZÆØÅ]/.test(p)) {
                                known.set(p.toLowerCase(), 'person');
                            }
                        }
                    }
                }
            } catch (e) { /* skip */ }
        }
    }
    return known;
}

function extractText(node) {
    let out = '';
    if (typeof node === 'string') return node + ' ';
    if (Array.isArray(node)) return node.map(extractText).join('');
    if (node && typeof node === 'object') {
        for (const k of ['text', 'content', 'items', 'caption', 'value', 'label',
            'question', 'questions', 'options', 'before', 'after', 'source',
            'props', 'title', 'description']) {
            if (node[k] !== undefined) out += extractText(node[k]);
        }
    }
    return out;
}

const known = loadKnown();
const articleFiles = findJsonFiles(CONTENT_DIR)
    .filter(f => !f.includes(`${path.sep}concepts${path.sep}`)
              && !f.includes(`${path.sep}people${path.sep}`)
              && !f.includes(`${path.sep}config${path.sep}`)
              && !f.includes(`${path.sep}kompetansemal${path.sep}`));

console.log(`Known: ${known.size} terms. Articles: ${articleFiles.length}`);

const peopleCandidates = new Map(); // name -> {count, sources:Set}
const conceptCandidates = new Map();

function addCand(map, key, source) {
    let v = map.get(key);
    if (!v) { v = { count: 0, sources: new Set() }; map.set(key, v); }
    v.count++;
    v.sources.add(source);
}

// Mønster for et "navn-element" (Title-case ord, evt. romertall)
const NAME_WORD = "[A-ZÆØÅ][a-zæøåéèüöäçñ'\\-]+";
const ROMAN = "(?:I{1,3}|IV|VI{0,3}|IX|XI{0,3}|XIV|XV|XVI{0,3}|XIX|XX)";
const CONNECTOR = "(?:av|av\\sdet|den|de|von|de|di|van|der|del|af|al|el|ibn|bin|ben)";

// Flerord-navn: minst to Title-case ord, evt. med en connector
const MULTI_NAME_RE = new RegExp(
    `\\b${NAME_WORD}(?:\\s+(?:${CONNECTOR}\\s+)?${NAME_WORD}){1,3}(?:\\s+${ROMAN})?\\b`, 'g'
);
// Tittel + ett ord: "kong Olav", "general Eisenhower"
const TITLE_NAME_RE = new RegExp(
    `\\b(${[...HONORIFICS].join('|')})\\s+(${NAME_WORD}(?:\\s+${NAME_WORD})?(?:\\s+${ROMAN})?)\\b`, 'gi'
);
// Romertall etter ett navn: "Olav II", "Henrik VIII"
const ROMAN_NAME_RE = new RegExp(`\\b(${NAME_WORD})\\s+(${ROMAN})\\b`, 'g');

function looksLikeSentenceStart(text, idx) {
    if (idx === 0) return true;
    const before = text.slice(Math.max(0, idx - 3), idx);
    return /[.!?]\s+$/.test(before) || /\n\s*$/.test(before);
}

function recordPerson(name, source) {
    name = name.trim().replace(/\s+/g, ' ');
    if (name.length < 4) return;
    const lower = name.toLowerCase();
    if (known.has(lower)) return;
    if (NOT_PEOPLE.has(lower)) return;
    // Skip hvis et delord er på blokk-listen alene (Nord-Norge etc)
    const parts = lower.split(/\s+/);
    if (parts.every(p => NOT_PEOPLE.has(p))) return;
    addCand(peopleCandidates, name, source);
}

for (const file of articleFiles) {
    let data;
    try { data = JSON.parse(fs.readFileSync(file, 'utf-8')); } catch { continue; }
    if (!data) continue;
    const title = data.title || path.basename(file, '.json');
    const text = extractText(data.content) + ' ' + extractText(data.details || []) + ' ' + extractText(data.heroSummary || '');

    // --- PERSONER ---
    // 1) Tittel + navn
    for (const m of text.matchAll(TITLE_NAME_RE)) {
        recordPerson(m[2], title);
    }
    // 2) Navn + romertall
    for (const m of text.matchAll(ROMAN_NAME_RE)) {
        recordPerson(`${m[1]} ${m[2]}`, title);
    }
    // 3) Flerord-navn (minst to ord)
    for (const m of text.matchAll(MULTI_NAME_RE)) {
        // Krev at det er minst ett mellomrom (filtrer ut enkeltord)
        if (!m[0].includes(' ')) continue;
        recordPerson(m[0], title);
    }

    // --- BEGREPER ---
    // 1) Bold (kvar igjen, men strengere): minst 4 tegn, ikke i known
    for (const m of text.matchAll(/\*\*([^*]+)\*\*/g)) {
        const t = m[1].trim().replace(/[:.,!?]$/, '');
        if (t.length < 4 || t.length > 40) continue;
        if (/^\d+$/.test(t)) continue;
        if (known.has(t.toLowerCase())) continue;
        if (COMMON_NORWEGIAN.has(t.toLowerCase())) continue;
        addCand(conceptCandidates, t, title);
    }
    // 2) Suffiks-heuristikk: rare ord med fagord-endelser
    const words = text.toLowerCase()
        .replace(/[*_#\[\]()«»"".,:;?!]/g, ' ')
        .split(/\s+/);
    const seen = new Set();
    for (const w of words) {
        if (w.length < 6 || w.length > 30) continue;
        if (seen.has(w)) continue;
        if (baseStop.has(w) || COMMON_NORWEGIAN.has(w)) continue;
        if (known.has(w)) continue;
        if (NOT_PEOPLE.has(w)) continue;
        if (/^\d/.test(w)) continue;
        if (!/^[a-zæøå\-]+$/.test(w)) continue;
        if (CONCEPT_SUFFIXES.some(s => w.endsWith(s))) {
            seen.add(w);
            addCand(conceptCandidates, w, title);
        }
    }
}

function serialize(map, minCount = 1) {
    return [...map.entries()]
        .map(([k, v]) => ({ term: k, count: v.count, sources: [...v.sources] }))
        .filter(x => x.count >= minCount)
        .sort((a, b) => b.count - a.count);
}

const peopleOut = serialize(peopleCandidates, 2);
const conceptsOut = serialize(conceptCandidates, 2);

fs.writeFileSync(OUT_PEOPLE, JSON.stringify(peopleOut, null, 2));
fs.writeFileSync(OUT_CONCEPTS, JSON.stringify(conceptsOut, null, 2));

console.log(`Personer (>=2 forekomster): ${peopleOut.length}`);
peopleOut.slice(0, 40).forEach(p => console.log(`  ${String(p.count).padStart(4)}  ${p.term}`));

console.log(`\nBegreper (>=2 forekomster): ${conceptsOut.length}`);
conceptsOut.slice(0, 40).forEach(p => console.log(`  ${String(p.count).padStart(4)}  ${p.term}`));

console.log(`\nLagret: ${OUT_PEOPLE}`);
console.log(`Lagret: ${OUT_CONCEPTS}`);
