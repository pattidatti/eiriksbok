import sharp from 'sharp';
import fs from 'fs';

const images = [
    { src: '/home/irik/.gemini/antigravity/brain/2e4369c7-3367-49e0-a9e0-247cfcd98028/duck_and_cover_generation_1773573066239.png', dest: 'public/images/chronos/kald-krig/duck_and_cover.webp' },
    { src: '/home/irik/.gemini/antigravity/brain/2e4369c7-3367-49e0-a9e0-247cfcd98028/berlin_culture_80s_generation_1773573080411.png', dest: 'public/images/chronos/kald-krig/berlin_culture_80s.webp' },
    { src: '/home/irik/.gemini/antigravity/brain/2e4369c7-3367-49e0-a9e0-247cfcd98028/doomsday_clock_generation_1773573094395.png', dest: 'public/images/chronos/kald-krig/doomsday_clock.webp' },
    { src: '/home/irik/.gemini/antigravity/brain/2e4369c7-3367-49e0-a9e0-247cfcd98028/moon_landing_tv_generation_1773573107720.png', dest: 'public/images/chronos/kald-krig/moon_landing_tv.webp' },
    { src: '/home/irik/.gemini/antigravity/brain/2e4369c7-3367-49e0-a9e0-247cfcd98028/propaganda_posters_generation_1773573122495.png', dest: 'public/images/chronos/kald-krig/propaganda_posters.webp' },
    { src: '/home/irik/.gemini/antigravity/brain/2e4369c7-3367-49e0-a9e0-247cfcd98028/peace_rally_1980s_generation_1773573137188.png', dest: 'public/images/chronos/kald-krig/peace_rally_1980s.webp' }
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
