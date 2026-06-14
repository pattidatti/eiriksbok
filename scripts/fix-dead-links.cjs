#!/usr/bin/env node
// Replaces dead internal links inside markdown link URLs `](URL)` across all JSON
// files under public/content/. Only touches the URL portion of markdown links —
// never any other text.
//
// Usage:
//   node scripts/fix-dead-links.cjs            # dry-run
//   node scripts/fix-dead-links.cjs --apply    # write changes

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'public', 'content');
const APPLY = process.argv.includes('--apply');

const MAPPING = {
    '/historie/kolonialisering/oversikt': '/historie/kolonialisering',
    '/historie/andre-verdenskrig/intro': '/historie/andre-verdenskrig/oversikt',
    '/filosofi/historisk-filosofi/sokrates': '/krle/filosofi/sokrates',
    '/historie/industriell-revolusjon/intro':
        '/historie/industriell-revolusjon/industriell-revolusjon',
    '/historie/svartedauden/artikkel': '/historie/middelalderen/svartedauden',
    '/historie/middelalderen/reformasjonen': '/historie/reformasjonen/martin-luther',
    '/historie/den-kalde-krigen/intro': '/historie/den-kalde-krigen/oversikt',
    '/historie/den-kalde-krigen/oppstart': '/historie/den-kalde-krigen/oversikt',
    '/historie/forste-verdenskrig/intro': '/historie/forste-verdenskrig/oversikt',
    '/historie/den-industrielle-revolusjon/start':
        '/historie/industriell-revolusjon/industriell-revolusjon',
};

function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const REPLACERS = Object.entries(MAPPING).map(([from, to]) => ({
    from,
    to,
    // Match `](URL)` where URL is exactly the dead link
    pattern: new RegExp('\\]\\(' + escapeRegex(from) + '\\)', 'g'),
    replacement: '](' + to + ')',
}));

function transformString(s) {
    let out = s;
    const hits = [];
    for (const r of REPLACERS) {
        if (r.pattern.test(out)) {
            const before = out;
            r.pattern.lastIndex = 0;
            out = out.replace(r.pattern, r.replacement);
            if (out !== before) hits.push({ from: r.from, to: r.to });
        }
    }
    return { out, hits };
}

function walk(obj, hitsAcc) {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'string') {
        const { out, hits } = transformString(obj);
        hits.forEach((h) => hitsAcc.push(h));
        return out;
    }
    if (Array.isArray(obj)) return obj.map((v) => walk(v, hitsAcc));
    if (typeof obj === 'object') {
        const out = {};
        for (const [k, v] of Object.entries(obj)) out[k] = walk(v, hitsAcc);
        return out;
    }
    return obj;
}

function walkDir(dir, cb) {
    for (const name of fs.readdirSync(dir)) {
        const p = path.join(dir, name);
        const stat = fs.statSync(p);
        if (stat.isDirectory()) walkDir(p, cb);
        else if (p.endsWith('.json')) cb(p);
    }
}

let filesChanged = 0;
const summary = {};

walkDir(ROOT, (filePath) => {
    const raw = fs.readFileSync(filePath, 'utf8');
    let data;
    try {
        data = JSON.parse(raw);
    } catch {
        return;
    }
    const hitsAcc = [];
    const transformed = walk(data, hitsAcc);
    if (hitsAcc.length === 0) return;

    filesChanged++;
    const rel = path.relative(path.join(__dirname, '..'), filePath);
    console.log(`\n${rel}`);
    for (const h of hitsAcc) {
        console.log(`  ${h.from} -> ${h.to}`);
        summary[h.from] = (summary[h.from] || 0) + 1;
    }

    if (APPLY) {
        // Preserve trailing newline if the original had one
        const trailingNL = raw.endsWith('\n') ? '\n' : '';
        fs.writeFileSync(filePath, JSON.stringify(transformed, null, 4) + trailingNL, 'utf8');
    }
});

console.log(`\n${'-'.repeat(40)}`);
console.log(`Files ${APPLY ? 'changed' : 'that would change'}: ${filesChanged}`);
console.log('Replacements by mapping:');
for (const [from, n] of Object.entries(summary)) {
    console.log(`  ${from}: ${n}`);
}
if (!APPLY) console.log('\nDry run. Re-run with --apply to write changes.');
