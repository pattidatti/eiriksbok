import sharp from 'sharp';
import fs from 'fs';

const images = [
    { src: '/home/irik/.gemini/antigravity/brain/2e4369c7-3367-49e0-a9e0-247cfcd98028/kgb_spy_cafe_generation_1773524049916.png', dest: 'public/images/chronos/kald-krig/kgb_spy_cafe.webp' }
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
