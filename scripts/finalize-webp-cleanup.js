import fs from 'fs';
import path from 'path';

const RASTER_EXTS = ['.png', '.jpg', '.jpeg'];
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');

function walk(dir) {
    const out = [];
    if (!fs.existsSync(dir)) return out;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) out.push(...walk(p));
        else out.push(p);
    }
    return out;
}

const rasters = walk('public/images').filter((f) =>
    RASTER_EXTS.includes(path.extname(f).toLowerCase())
);

const targetExts = new Set(['.json', '.ts', '.tsx', '.css', '.html', '.md']);
const sourceFiles = [...walk('public/content'), ...walk('src')].filter((f) =>
    targetExts.has(path.extname(f))
);

const pathMap = new Map();
for (const r of rasters) {
    const ext = path.extname(r);
    const webpEquivalent = r.slice(0, -ext.length) + '.webp';
    if (!fs.existsSync(webpEquivalent)) continue;
    const oldPub = '/' + r.replace(/^public\//, '');
    const newPub = '/' + webpEquivalent.replace(/^public\//, '');
    pathMap.set(oldPub, newPub);
}

console.log(`${pathMap.size} raster paths have webp twins to redirect to.`);
if (DRY_RUN) console.log('(dry-run mode)\n');

let filesChanged = 0;
let totalReplacements = 0;
for (const file of sourceFiles) {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    let count = 0;
    for (const [oldP, newP] of pathMap) {
        if (content.includes(oldP)) {
            const occurrences = content.split(oldP).length - 1;
            content = content.split(oldP).join(newP);
            count += occurrences;
            changed = true;
        }
    }
    if (changed) {
        if (!DRY_RUN) fs.writeFileSync(file, content);
        filesChanged++;
        totalReplacements += count;
        console.log(`✏ ${path.relative('.', file)} (${count} ref${count === 1 ? '' : 's'})`);
    }
}

console.log(`\n--- Reference update ---`);
console.log(`Files changed: ${filesChanged}`);
console.log(`References updated: ${totalReplacements}`);

let deleted = 0;
let skippedDelete = 0;
for (const r of rasters) {
    const ext = path.extname(r);
    const webpEquivalent = r.slice(0, -ext.length) + '.webp';
    if (fs.existsSync(webpEquivalent)) {
        if (!DRY_RUN) fs.unlinkSync(r);
        deleted++;
    } else {
        skippedDelete++;
        console.log(`⚠ no webp twin, leaving raster: ${r}`);
    }
}

console.log(`\n--- Raster cleanup ---`);
console.log(`Deleted (had webp twin): ${deleted}`);
console.log(`Kept (no webp twin): ${skippedDelete}`);
