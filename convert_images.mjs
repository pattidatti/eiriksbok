import fs from 'fs';
import sharp from 'sharp';
import path from 'path';

const jobs = [
    {
        src: '/home/irik/.gemini/antigravity-cli/brain/0e76c8c7-fbfb-40fc-a855-58a2ba1b15c2/union_1905_hero_1779946291028.png',
        dest: 'public/images/norgeshistorie/unionsopplosningen-1905-hero.webp'
    },
    {
        src: '/home/irik/.gemini/antigravity-cli/brain/0e76c8c7-fbfb-40fc-a855-58a2ba1b15c2/union_1905_storting_1779946306322.png',
        dest: 'public/images/norgeshistorie/unionsopplosningen-1905-01.webp'
    },
    {
        src: '/home/irik/.gemini/antigravity-cli/brain/0e76c8c7-fbfb-40fc-a855-58a2ba1b15c2/union_1905_avstemning_1779946324228.png',
        dest: 'public/images/norgeshistorie/unionsopplosningen-1905-02.webp'
    },
    {
        src: '/home/irik/.gemini/antigravity-cli/brain/0e76c8c7-fbfb-40fc-a855-58a2ba1b15c2/union_1905_kongen_1779946340772.png',
        dest: 'public/images/norgeshistorie/unionsopplosningen-1905-03.webp'
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
