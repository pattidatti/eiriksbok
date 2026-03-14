import sharp from 'sharp';
import fs from 'fs';

const images = [
    { src: '/home/irik/.gemini/antigravity/brain/2e4369c7-3367-49e0-a9e0-247cfcd98028/world_map_1962_generation_1773505025337.png', dest: 'public/images/chronos/kald-krig/world_map_1962.webp' },
    { src: '/home/irik/.gemini/antigravity/brain/2e4369c7-3367-49e0-a9e0-247cfcd98028/world_map_1975_generation_1773505039682.png', dest: 'public/images/chronos/kald-krig/world_map_1975.webp' },
    { src: '/home/irik/.gemini/antigravity/brain/2e4369c7-3367-49e0-a9e0-247cfcd98028/world_map_1985_generation_1773505059413.png', dest: 'public/images/chronos/kald-krig/world_map_1985.webp' },
    { src: '/home/irik/.gemini/antigravity/brain/2e4369c7-3367-49e0-a9e0-247cfcd98028/nuclear_mushroom_generation_1773505071268.png', dest: 'public/images/chronos/kald-krig/nuclear_mushroom.webp' }
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
