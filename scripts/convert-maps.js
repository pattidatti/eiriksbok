import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const assetsDir = 'public/content/historie/forste-verdenskrig/assets';
const filesToConvert = [
    'europa-map-1900.png',
    'domino-effect-map.jpg',
    'sykes-picot-map.jpg'
];

async function convert() {
    for (const file of filesToConvert) {
        const inputPath = path.join(assetsDir, file);
        if (!fs.existsSync(inputPath)) {
            console.log(`Skipping ${file}, not found.`);
            continue;
        }

        const outName = path.parse(file).name + '.webp';
        const outputPath = path.join(assetsDir, outName);

        console.log(`Converting ${file} to ${outName}...`);
        await sharp(inputPath)
            .webp({ quality: 80 })
            .toFile(outputPath);

        const stats = fs.statSync(outputPath);
        console.log(`Converted ${file}. New size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    }
}

convert().catch(console.error);
