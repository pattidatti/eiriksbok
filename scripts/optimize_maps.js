import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '../public');
const MAP_PATTERNS = [
    'map_*.png', // Matches all our maps
];

// Helper to find files recursively (though maps are mostly top level or in specific folders)
// For now, we scan the root specific public/ dir where maps are stored
const scanDirectory = (dir) => {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(scanDirectory(file));
        } else {
            // Check if matches pattern
            const basename = path.basename(file);
            if (basename.startsWith('map_') && basename.endsWith('.png')) {
                results.push(file);
            }
        }
    });
    return results;
};

async function optimizeImages() {
    console.log("🔍 Scanning for map images in public/...");
    const files = scanDirectory(PUBLIC_DIR);

    console.log(`Found ${files.length} map images to optimize.`);

    let processedCount = 0;
    let savingsBytes = 0;

    for (const file of files) {
        const dir = path.dirname(file);
        const ext = path.extname(file);
        const name = path.basename(file, ext);

        const webpPath = path.join(dir, `${name}.webp`);
        const tinyPath = path.join(dir, `${name}_tiny.webp`);

        // Skip if already optimized (unless forced, but simple check for now)
        // FORCE REGEN: Commented out check to ensure 100% quality update works
        /* 
        if (fs.existsSync(webpPath) && fs.existsSync(tinyPath)) {
            // Optional: check timestamps to re-gen if png is newer
            const pngStats = fs.statSync(file);
            const webpStats = fs.statSync(webpPath);
            if (webpStats.mtime > pngStats.mtime) {
                // console.log(`Skipping ${name} (already optimized)`);
                continue;
            }
        } 
        */

        const originalSize = fs.statSync(file).size;
        console.log(`⚙️ Optimizing ${name}...`);

        try {
            // 1. Generate High-Quality WebP (100% quality for maps to retain maximum detail)
            await sharp(file)
                .webp({ quality: 100, effort: 6 }) // Max quality, max compression effort
                .toFile(webpPath);

            const newSize = fs.statSync(webpPath).size;
            savingsBytes += (originalSize - newSize);

            // 2. Generate Tiny Placeholder (20px width, extremely blurry)
            await sharp(file)
                .resize(20) // Tiny width
                .blur(2) // Extra blur baked in
                .webp({ quality: 20 })
                .toFile(tinyPath);

            processedCount++;
            console.log(`✅ ${name}: ${(originalSize / 1024 / 1024).toFixed(2)}MB -> ${(newSize / 1024 / 1024).toFixed(2)}MB`);

        } catch (err) {
            console.error(`❌ Failed to optimize ${name}:`, err);
        }
    }

    console.log("--------------------------------------------------");
    console.log(`🎉 Optimization Complete!`);
    console.log(`Processed: ${processedCount} images`);
    console.log(`Total Space Saved: ${(savingsBytes / 1024 / 1024).toFixed(2)} MB`);
    console.log("--------------------------------------------------");
}

optimizeImages();
