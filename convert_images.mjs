import fs from 'fs';
import sharp from 'sharp';
import path from 'path';

const jobs = [
    {
        src: '/home/irik/.gemini/antigravity-cli/brain/d56adc91-c2d9-4a28-b6ba-bf2ccb1e1f1e/greek_theater_hero_1780566466990.png',
        dest: 'public/images/antikkens-hellas/gresk-teater-hero.webp'
    },
    {
        src: '/home/irik/.gemini/antigravity-cli/brain/d56adc91-c2d9-4a28-b6ba-bf2ccb1e1f1e/greek_theater_acoustics_1780566481916.png',
        dest: 'public/images/antikkens-hellas/gresk-teater-01.webp'
    }
];

async function processImages() {
    for (const job of jobs) {
        if (!fs.existsSync(job.src)) {
            console.error(`Source file not found: ${job.src}`);
            continue;
        }
        fs.mkdirSync(path.dirname(job.dest), { recursive: true });
        await sharp(job.src)
            .resize(1600, null, { withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(job.dest);
        console.log(`Converted and saved: ${job.dest}`);
    }
}

processImages().catch(console.error);
