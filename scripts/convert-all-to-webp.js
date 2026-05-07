import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const IMAGES_DIR = 'public/images';
const CONTENT_DIR = 'public/content';
const SRC_DIR = 'src';
const QUALITY = 78;
const MAX_WIDTH = 1600;
const MAX_MAP_WIDTH = 2560;
const RASTER_EXTS = ['.png', '.jpg', '.jpeg'];

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const SKIP_REFS = args.includes('--skip-refs');

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

async function convertImages() {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Phase 1: Convert raster images to WebP`);
    console.log(`${'='.repeat(60)}`);
    if (DRY_RUN) console.log('🔍 DRY RUN — no files will be written or deleted.\n');

    const files = walk(IMAGES_DIR).filter((f) =>
        RASTER_EXTS.includes(path.extname(f).toLowerCase())
    );
    console.log(`Found ${files.length} raster files in ${IMAGES_DIR}.\n`);

    const results = { converted: [], skippedExisting: [], failed: [] };
    let savedBytes = 0;

    for (const filePath of files) {
        const ext = path.extname(filePath);
        const webpPath = filePath.slice(0, -ext.length) + '.webp';
        const isMap = /map|kart/i.test(filePath);
        const targetWidth = isMap ? MAX_MAP_WIDTH : MAX_WIDTH;

        if (fs.existsSync(webpPath)) {
            results.skippedExisting.push({ raster: filePath, webp: webpPath });
            continue;
        }

        try {
            const origSize = fs.statSync(filePath).size;

            if (!DRY_RUN) {
                const image = sharp(filePath);
                const meta = await image.metadata();
                let pipeline = image;
                if (meta.width && meta.width > targetWidth) {
                    pipeline = pipeline.resize({
                        width: targetWidth,
                        withoutEnlargement: true,
                    });
                }
                await pipeline.webp({ quality: QUALITY, effort: 6 }).toFile(webpPath);
                const newSize = fs.statSync(webpPath).size;
                savedBytes += origSize - newSize;
                fs.unlinkSync(filePath);
                results.converted.push({
                    from: filePath,
                    to: webpPath,
                    origSize,
                    newSize,
                });
                process.stdout.write(
                    `✅ ${path.relative('.', filePath)} → ${(newSize / 1024).toFixed(0)}KB (saved ${((origSize - newSize) / 1024).toFixed(0)}KB)\n`
                );
            } else {
                results.converted.push({ from: filePath, to: webpPath, origSize });
                process.stdout.write(`[dry] ${path.relative('.', filePath)}\n`);
            }
        } catch (err) {
            results.failed.push({ path: filePath, error: err.message });
            console.error(`❌ ${filePath}: ${err.message}`);
        }
    }

    console.log(`\n--- Phase 1 summary ---`);
    console.log(`Converted: ${results.converted.length}`);
    console.log(`Skipped (webp already exists): ${results.skippedExisting.length}`);
    console.log(`Failed: ${results.failed.length}`);
    if (!DRY_RUN) {
        console.log(`Disk saved: ${(savedBytes / 1024 / 1024).toFixed(1)} MB`);
    }

    if (results.skippedExisting.length > 0) {
        console.log(`\n⚠ ${results.skippedExisting.length} raster files have a WebP-twin and were not deleted.`);
        console.log('   Review these manually — likely safe to delete the raster, but not automatic.');
        const list = results.skippedExisting
            .slice(0, 10)
            .map((s) => `   - ${path.relative('.', s.raster)}`)
            .join('\n');
        console.log(list);
        if (results.skippedExisting.length > 10) {
            console.log(`   ... and ${results.skippedExisting.length - 10} more`);
        }
    }

    return results;
}

function buildPublicPathMap(converted) {
    const map = new Map();
    for (const c of converted) {
        const rel = '/' + path.relative('public', c.from).replace(/\\/g, '/');
        const newRel = '/' + path.relative('public', c.to).replace(/\\/g, '/');
        map.set(rel, newRel);
    }
    return map;
}

function updateReferences(pathMap) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Phase 2: Update file references`);
    console.log(`${'='.repeat(60)}`);

    if (pathMap.size === 0) {
        console.log('No conversions to apply — skipping.');
        return;
    }

    const targetDirs = [CONTENT_DIR, SRC_DIR];
    const targetExts = new Set(['.json', '.ts', '.tsx', '.css', '.html', '.md']);

    let filesScanned = 0;
    let filesChanged = 0;
    let totalReplacements = 0;

    for (const dir of targetDirs) {
        const files = walk(dir).filter((f) => targetExts.has(path.extname(f)));
        for (const file of files) {
            filesScanned++;
            let content = fs.readFileSync(file, 'utf8');
            let changed = false;
            let fileReplacements = 0;
            for (const [oldPath, newPath] of pathMap) {
                if (content.includes(oldPath)) {
                    const before = content;
                    content = content.split(oldPath).join(newPath);
                    const count = (before.length - content.length) / (oldPath.length - newPath.length);
                    if (Number.isFinite(count) && count > 0) {
                        fileReplacements += count;
                        changed = true;
                    } else {
                        changed = true;
                        fileReplacements++;
                    }
                }
            }
            if (changed) {
                if (!DRY_RUN) fs.writeFileSync(file, content);
                filesChanged++;
                totalReplacements += fileReplacements;
                console.log(
                    `${DRY_RUN ? '[dry] ' : ''}✏ ${path.relative('.', file)} (${fileReplacements} ref${fileReplacements === 1 ? '' : 's'})`
                );
            }
        }
    }

    console.log(`\n--- Phase 2 summary ---`);
    console.log(`Files scanned: ${filesScanned}`);
    console.log(`Files changed: ${filesChanged}`);
    console.log(`References updated: ${totalReplacements}`);
}

async function main() {
    const t0 = Date.now();
    const phase1 = await convertImages();
    if (!SKIP_REFS && phase1.converted.length > 0) {
        const map = buildPublicPathMap(phase1.converted);
        updateReferences(map);
    }
    console.log(`\nDone in ${((Date.now() - t0) / 1000).toFixed(1)}s.`);
}

main().catch((err) => {
    console.error('Fatal:', err);
    process.exit(1);
});
