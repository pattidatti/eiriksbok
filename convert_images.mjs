import fs from 'fs';
import sharp from 'sharp';
import path from 'path';

const jobs = [
    { src: '/home/irik/.gemini/antigravity/brain/eca33caa-b15b-44e9-8b74-dce9e6572e62/leonardo_hero_1779087643370.png', dest: 'public/images/renessansen/leonardo-da-vinci-hero.webp' },
    { src: '/home/irik/.gemini/antigravity/brain/eca33caa-b15b-44e9-8b74-dce9e6572e62/leonardo_01_1779087655823.png', dest: 'public/images/renessansen/leonardo-da-vinci-01.webp' },
    { src: '/home/irik/.gemini/antigravity/brain/eca33caa-b15b-44e9-8b74-dce9e6572e62/leonardo_02_1779087668639.png', dest: 'public/images/renessansen/leonardo-da-vinci-02.webp' },
    { src: '/home/irik/.gemini/antigravity/brain/eca33caa-b15b-44e9-8b74-dce9e6572e62/leonardo_03_1779087685346.png', dest: 'public/images/renessansen/leonardo-da-vinci-03.webp' }
];

async function processImages() {
    for (const job of jobs) {
        fs.mkdirSync(path.dirname(job.dest), { recursive: true });
        await sharp(job.src)
            .resize(1600, null, { withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(job.dest);
        console.log(`Converted ${job.dest}`);
    }
}

processImages().catch(console.error);
