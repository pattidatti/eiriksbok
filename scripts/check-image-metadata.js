import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const assetsDir = 'public/content/historie/forste-verdenskrig/assets';
const images = [
    'europa-map-1900.webp',
    'domino-effect-map.webp',
    'sykes-picot-map.webp'
];

async function checkMetadata() {
    for (const image of images) {
        const filePath = path.join(assetsDir, image);
        if (fs.existsSync(filePath)) {
            const metadata = await sharp(filePath).metadata();
            const stats = fs.statSync(filePath);
            console.log(`Image: ${image}`);
            console.log(`Dimensions: ${metadata.width}x${metadata.height}`);
            console.log(`Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
            console.log('---');
        }
    }
}

checkMetadata();
