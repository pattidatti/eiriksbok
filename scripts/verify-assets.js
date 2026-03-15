import fs from 'fs';
import path from 'path';

const scenarioPath = 'public/content/scenarios/kald-krig.json';
const imageDir = 'public/images/chronos/kald-krig/';

const scenario = JSON.parse(fs.readFileSync(scenarioPath, 'utf8'));
const imagesOnDisk = new Set(fs.readdirSync(imageDir));

const missing = [];
const referenced = new Set();

// Recursive search for backgroundImage
function findImages(obj) {
    if (typeof obj !== 'object' || obj === null) return;

    if (obj.backgroundImage) {
        const filename = path.basename(obj.backgroundImage);
        referenced.add(filename);
        if (!imagesOnDisk.has(filename)) {
            missing.push(obj.backgroundImage);
        }
    }

    for (const key in obj) {
        findImages(obj[key]);
    }
}

findImages(scenario);

console.log('--- Verification Report ---');
console.log(`Total unique images referenced: ${referenced.size}`);
console.log(`Total images on disk: ${imagesOnDisk.size}`);

if (missing.length > 0) {
    console.log('\nMissing images:');
    missing.forEach(img => console.log(`- ${img}`));
} else {
    console.log('\nAll referenced images exist on disk.');
}
