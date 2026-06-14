#!/usr/bin/env node
// Validerer alle interne lenker i innholds-JSON (public/content/**) mot de faktiske
// rutene appen serverer (src/App.tsx) + manifestet + innholdsfilene på disk.
//
// Bygget for å gi den ukentlige kvalitetsauditen en KORREKT lenkesjekk. Den naive
// sjekken auditen brukte tidligere modellerte ikke tre rute-familier og flagget
// derfor gyldige lenker som døde:
//   - /krle/religion/:religionId            (ReligionPage)
//   - /:subject/:topic/:subTopic/:lesson    (nested lesson via subTopics)
//   - /oving/detektiv/:caseId               (DetectiveCasePage)
//
// Bruk:
//   node scripts/check-internal-links.cjs          # menneskelesbar rapport
//   node scripts/check-internal-links.cjs --json    # maskinlesbar (for auditen)
//
// Exit-kode 1 hvis det finnes minst én reelt død lenke (kan gate CI).

const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
const CONTENT = path.join(REPO, 'public', 'content');
const DATA = path.join(REPO, 'public', 'data');
const JSON_MODE = process.argv.includes('--json');

// Fagmapper der en innholdsfil tilsvarer en leksjon-URL.
const SUBJECT_DIRS = ['historie', 'norsk', 'krle', 'samfunnskunnskap', 'musikk'];

// --- Statiske ruter (literal path-er fra src/App.tsx, uten params) ---
const STATIC_ROUTES = new Set([
    '/',
    '/sok',
    '/norsk/bibliotek',
    '/tidslinje',
    '/atlas',
    '/persongalleri',
    '/colonization',
    '/infrastruktur-atlas',
    '/samfunnskunnskap/okonomi/verden',
    '/laeringsstier',
    '/norsk/virkemidler/desk',
    '/norsk/ordklasser/sortering',
    '/musikk/komposisjon',
    '/musikk/oving/rytme',
    '/musikk/oving/gehortrening',
    '/musikk/gitarstudio',
    '/oving',
    '/quiz',
    '/oving/flashcards',
    '/flashcards',
    '/oving/quiz',
    '/oving/chrono',
    '/oving/retorikk',
    '/oving/hengemann',
    '/oving/chrono-glider',
    '/oving/konsept-snake',
    '/oving/etikk',
    '/oving/tidsreise',
    '/oving/virkemidler',
    '/oving/spill',
    '/mikrospill',
    '/oving/kompetansemal',
    '/oving/detektiv',
    '/historie/vikingtiden/detektiv',
    '/krle/sammenlign',
    '/krle/filosofi/odyssey',
    '/krle/filosofi/sammenlign',
]);

// --- Friform-/registerbaserte prefikser: params er ikke billig å validere fra disk,
//     så vi godtar en kjent prefiks + ikke-tom param (unngår falske positiver). ---
const PREFIX_ROUTES = [
    '/persongalleri/', // :slug → PersonGallery (detalj ved treff, ellers galleri m/søk)
    '/krle/sammenlign/tema/', // tag (friform)
    '/krle/filosofi/', // filosof-id (TS-register)
    '/oving/spill/', // gameId (TS-register)
    '/mikrospill/', // gameId (TS-register)
    '/norsk/bibliotek/', // textId (TS-register)
    '/oving/tidsreise/', // scenarioId (validert under, men prefiks som sikkerhetsnett)
    '/quiz-battle/', // pin
];

function readJson(p) {
    try {
        return JSON.parse(fs.readFileSync(p, 'utf8'));
    } catch {
        return null;
    }
}

function walkDir(dir, cb) {
    if (!fs.existsSync(dir)) return;
    for (const name of fs.readdirSync(dir)) {
        const p = path.join(dir, name);
        const stat = fs.statSync(p);
        if (stat.isDirectory()) walkDir(p, cb);
        else cb(p);
    }
}

// ---------------------------------------------------------------------------
// 1. Bygg settet av gyldige mål
// ---------------------------------------------------------------------------
const valid = new Set();

// 1a. Manifest: fag, emner, underemner, leksjoner, verktøy (læringsstier)
const manifest = readJson(path.join(CONTENT, 'manifest.json')) || { subjects: [] };
for (const s of manifest.subjects || []) {
    valid.add(`/${s.id}`);
    for (const t of s.topics || []) {
        valid.add(`/${s.id}/${t.id}`);
        for (const tool of t.tools || []) {
            if (tool.link) valid.add(tool.link.split(/[?#]/)[0].replace(/\/$/, ''));
        }
        for (const l of t.lessons || []) valid.add(`/${s.id}/${t.id}/${l.id}`);
        for (const st of t.subTopics || []) {
            valid.add(`/${s.id}/${t.id}/${st.id}`);
            for (const l of st.lessons || []) valid.add(`/${s.id}/${t.id}/${st.id}/${l.id}`);
        }
    }
}

// 1b. Disk: hver innholdsfil i en fagmappe tilsvarer en leksjon-URL (LessonPage laster
//     /content/<sti>.json direkte, så en fil = en gyldig rute selv uten manifest-oppføring).
for (const sub of SUBJECT_DIRS) {
    walkDir(path.join(CONTENT, sub), (p) => {
        if (!p.endsWith('.json')) return;
        const rel = path.relative(CONTENT, p).replace(/\\/g, '/').replace(/\.json$/, '');
        valid.add('/' + rel);
    });
}

// 1c. Innholds-backede dynamiske ruter (enumererte id-er fanger REELLE døde lenker)
// Religioner: /krle/religion/:religionId
const religionIds = new Set();
walkDir(DATA + '/religion', (p) => {
    if (p.endsWith('.json')) religionIds.add(path.basename(p, '.json'));
});
// + religion-subTopics fra manifest (f.eks. samisk, som mangler data-fil)
for (const s of manifest.subjects || []) {
    if (s.id !== 'krle') continue;
    for (const t of s.topics || []) {
        if (t.id !== 'religion') continue;
        for (const st of t.subTopics || []) religionIds.add(st.id);
    }
}
for (const id of religionIds) valid.add(`/krle/religion/${id}`);

// Detektivsaker: /oving/detektiv/:caseId
walkDir(path.join(CONTENT, 'interactive', 'detective'), (p) => {
    if (!p.endsWith('.json')) return;
    const id = path.basename(p, '.json');
    if (id.startsWith('_')) return;
    valid.add(`/oving/detektiv/${id}`);
});

// Tidsreise-scenarioer: /oving/tidsreise/:scenarioId
walkDir(path.join(CONTENT, 'scenarios'), (p) => {
    if (!p.endsWith('.json')) return;
    valid.add(`/oving/tidsreise/${path.basename(p, '.json')}`);
});

// ---------------------------------------------------------------------------
// 2. Hent alle interne lenker fra innholds-JSON
// ---------------------------------------------------------------------------
const MD_LINK = /\]\((\/[^)\s]+)\)/g; // markdown ](/...)
const LINK_FIELDS = new Set(['link', 'url', 'href']);

function normalize(target) {
    return target.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
}

function isValid(target) {
    const t = normalize(target);
    if (valid.has(t)) return true;
    if (STATIC_ROUTES.has(t)) return true;
    for (const pre of PREFIX_ROUTES) {
        if (t.startsWith(pre) && t.length > pre.length) return true;
    }
    return false;
}

const dead = []; // { file, where, target }

function collectFromString(str, file, where) {
    let m;
    MD_LINK.lastIndex = 0;
    while ((m = MD_LINK.exec(str)) !== null) {
        const target = m[1];
        if (!isValid(target)) dead.push({ file, where, target });
    }
}

function walkValue(value, file, fieldKey, blockIdx) {
    if (value == null) return;
    if (typeof value === 'string') {
        // markdown-lenker i en hvilken som helst streng
        collectFromString(value, file, `blokk ${blockIdx}`);
        // rene lenkefelt (link/url/href) som starter med "/"
        if (LINK_FIELDS.has(fieldKey) && value.startsWith('/') && !isValid(value)) {
            dead.push({ file, where: `blokk ${blockIdx} (${fieldKey})`, target: value });
        }
        return;
    }
    if (Array.isArray(value)) {
        value.forEach((v) => walkValue(v, file, fieldKey, blockIdx));
        return;
    }
    if (typeof value === 'object') {
        for (const [k, v] of Object.entries(value)) walkValue(v, file, k, blockIdx);
    }
}

walkDir(CONTENT, (p) => {
    if (!p.endsWith('.json')) return;
    const data = readJson(p);
    if (!data) return;
    const rel = path.relative(REPO, p);
    const blocks = Array.isArray(data.content) ? data.content : [data];
    blocks.forEach((b, i) => walkValue(b, rel, null, i));
});

// ---------------------------------------------------------------------------
// 3. Rapport
// ---------------------------------------------------------------------------
// Dedupliser på fil+mål
const seen = new Set();
const unique = dead.filter((d) => {
    const k = d.file + '|' + d.target;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
});

if (JSON_MODE) {
    console.log(JSON.stringify({ deadLinks: unique, count: unique.length }, null, 2));
} else {
    console.log(`Gyldige rute-mål registrert: ${valid.size}`);
    if (unique.length === 0) {
        console.log('\n✅ Ingen døde interne lenker.');
    } else {
        console.log(`\n❌ ${unique.length} død(e) intern(e) lenke(r):\n`);
        for (const d of unique) {
            console.log(`  ${d.file} (${d.where}): ${d.target}`);
        }
    }
}

process.exit(unique.length > 0 ? 1 : 0);
