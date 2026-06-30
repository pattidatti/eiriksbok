import fs from 'fs';
import sharp from 'sharp';
import path from 'path';

const jobs = [
    {
        src: '/home/irik/.gemini/antigravity-cli/brain/7384a369-1882-4ac2-9ca1-74c1f9b26605/hundreaarskrigen_hero_1782711078205.jpg',
        dest: 'public/images/middelalderen/hundreaarskrigen-hero.webp'
    },
    {
        src: '/home/irik/.gemini/antigravity-cli/brain/7384a369-1882-4ac2-9ca1-74c1f9b26605/hundreaarskrigen_01_1782711089044.jpg',
        dest: 'public/images/middelalderen/hundreaarskrigen-01.webp'
    },
    {
        src: '/home/irik/.gemini/antigravity-cli/brain/7384a369-1882-4ac2-9ca1-74c1f9b26605/hundreaarskrigen_02_1782711101783.jpg',
        dest: 'public/images/middelalderen/hundreaarskrigen-02.webp'
    },
    {
        src: '/home/irik/.gemini/antigravity-cli/brain/7384a369-1882-4ac2-9ca1-74c1f9b26605/hundreaarskrigen_03_1782711115280.jpg',
        dest: 'public/images/middelalderen/hundreaarskrigen-03.webp'
    },
    {
        src: '/home/irik/.gemini/antigravity-cli/brain/7384a369-1882-4ac2-9ca1-74c1f9b26605/helleristninger_hero_1782711128472.jpg',
        dest: 'public/images/norgeshistorie/helleristninger-hero.webp'
    },
    {
        src: '/home/irik/.gemini/antigravity-cli/brain/7384a369-1882-4ac2-9ca1-74c1f9b26605/helleristninger_01_1782711141079.jpg',
        dest: 'public/images/norgeshistorie/helleristninger-01.webp'
    },
    {
        src: '/home/irik/.gemini/antigravity-cli/brain/7384a369-1882-4ac2-9ca1-74c1f9b26605/helleristninger_02_1782711164979.jpg',
        dest: 'public/images/norgeshistorie/helleristninger-02.webp'
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

