import sharp from 'sharp';
import fs from 'fs';

const images = [
    { src: '/home/irik/.gemini/antigravity/brain/2e4369c7-3367-49e0-a9e0-247cfcd98028/iran_cia_1953_generation_1773481550395.png', dest: 'public/images/chronos/kald-krig/iran_cia_1953.webp' }
];

async function convert() {
    for (const img of images) {
        try {
            await sharp(img.src)
                .webp({ quality: 75 })
                .toFile(img.dest);
            console.log(`Converted ${img.src} to ${img.dest}`);
        } catch (err) {
            console.error(`Error converting ${img.src}:`, err.message);
        }
    }
}

convert();
