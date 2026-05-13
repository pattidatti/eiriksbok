// Read-only audit: sammenligner dagens global-timeline.json mot hva
// generate-timeline.js ville produsert. Skriver ingen filer.
//
// Bruk: node scripts/audit-timeline.js [--json]

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
    CONTENT_DIR,
    MANIFEST_PATH,
    OUTPUT_PATH,
    traverseManifest,
    extractTextLibraryData,
} from './generate-timeline.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MANUAL_PATH = path.join(CONTENT_DIR, 'global-timeline.manual.json');

const args = new Set(process.argv.slice(2));
const jsonOut = args.has('--json');

function loadCurrent() {
    const raw = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf-8'));
    if (Array.isArray(raw)) return raw;
    if (raw && Array.isArray(raw.events)) return raw.events;
    throw new Error(`Unrecognized shape in ${OUTPUT_PATH}`);
}

function loadManual() {
    if (!fs.existsSync(MANUAL_PATH)) return [];
    const raw = JSON.parse(fs.readFileSync(MANUAL_PATH, 'utf-8'));
    if (Array.isArray(raw)) return raw;
    if (raw && Array.isArray(raw.events)) return raw.events;
    return [];
}

function buildProposed() {
    const eventMap = new Map();
    const addEvent = (event) => {
        if (eventMap.has(event.id)) {
            const existing = eventMap.get(event.id);
            if (event.tags && event.tags.length > 0) {
                const combined = new Set([...(existing.tags || []), ...event.tags]);
                existing.tags = Array.from(combined);
            }
            if (!existing.description && event.description) existing.description = event.description;
        } else {
            eventMap.set(event.id, event);
        }
    };

    // 1. Manifest + per-lesson timeline[] sub-events
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
    const lessonEvents = traverseManifest(manifest);
    lessonEvents.forEach(addEvent);

    // 2. Text library
    const textEvents = extractTextLibraryData();
    textEvents.forEach(addEvent);

    // 3. Manual override (vinner ved id-kollisjon)
    const manualEvents = loadManual();
    for (const ev of manualEvents) {
        eventMap.set(ev.id, ev);
    }

    return { events: Array.from(eventMap.values()), manualCount: manualEvents.length };
}

function diffEvent(a, b) {
    const fields = ['title', 'description', 'startDate', 'endDate', 'displayDate', 'type', 'subjectId', 'topicId', 'link'];
    const changes = [];
    for (const f of fields) {
        const av = a[f] ?? null;
        const bv = b[f] ?? null;
        if (av !== bv) changes.push(`${f}: ${JSON.stringify(av)} → ${JSON.stringify(bv)}`);
    }
    const aTags = new Set(a.tags || []);
    const bTags = new Set(b.tags || []);
    const lostTags = [...aTags].filter((t) => !bTags.has(t));
    const newTags = [...bTags].filter((t) => !aTags.has(t));
    if (lostTags.length) changes.push(`tags lost: ${lostTags.join(', ')}`);
    if (newTags.length) changes.push(`tags new: ${newTags.join(', ')}`);
    return changes;
}

function main() {
    const current = loadCurrent();
    const { events: proposed, manualCount } = buildProposed();

    const currentMap = new Map(current.map((e) => [e.id, e]));
    const proposedMap = new Map(proposed.map((e) => [e.id, e]));

    const manualOnly = [];
    const wouldAdd = [];
    const conflicts = [];

    for (const [id, ev] of currentMap) {
        if (!proposedMap.has(id)) {
            manualOnly.push(ev);
        } else {
            const changes = diffEvent(ev, proposedMap.get(id));
            if (changes.length) conflicts.push({ id, title: ev.title, changes });
        }
    }
    for (const [id, ev] of proposedMap) {
        if (!currentMap.has(id)) wouldAdd.push(ev);
    }

    if (jsonOut) {
        console.log(JSON.stringify({ manualOnly, wouldAdd, conflicts, counts: { current: current.length, proposed: proposed.length, manualFile: manualCount } }, null, 2));
        return;
    }

    console.log('===== Timeline Audit =====');
    console.log(`Current file:        ${current.length} events`);
    console.log(`Proposed (script):   ${proposed.length} events  (incl ${manualCount} from manual file)`);
    console.log('');

    console.log(`-- MANUAL ONLY (in current, NOT producible) : ${manualOnly.length}`);
    for (const ev of manualOnly) {
        console.log(`  ${ev.id}  [${ev.type}]  ${ev.title}  (${ev.displayDate})  link=${ev.link}`);
    }
    console.log('');

    console.log(`-- WOULD ADD (in proposed, NOT in current)  : ${wouldAdd.length}`);
    for (const ev of wouldAdd) {
        console.log(`  ${ev.id}  [${ev.type}]  ${ev.title}  (${ev.displayDate})  link=${ev.link}`);
    }
    console.log('');

    console.log(`-- CONFLICTS (same id, different data)      : ${conflicts.length}`);
    for (const c of conflicts) {
        console.log(`  ${c.id}  (${c.title})`);
        for (const ch of c.changes) console.log(`     - ${ch}`);
    }
    console.log('');

    if (manualOnly.length > 0) {
        console.log('ADVARSEL: ' + manualOnly.length + ' events vil forsvinne hvis generate-timeline.js kjøres uten at de flyttes til public/content/global-timeline.manual.json.');
    } else {
        console.log('OK: ingen manual-only events — generering er trygg.');
    }
}

main();
