import fs from 'fs';
import sharp from 'sharp';
import path from 'path';

const jobs = [
    {
        src: '/home/irik/.gemini/antigravity-cli/brain/5caceb4b-cd05-4a27-b4a3-fab6af055cdf/tekstskriving_hero_1779859875418.png',
        dest: 'public/images/komposisjon/tekstskriving-hero.webp'
    },
    {
        src: '/home/irik/.gemini/antigravity-cli/brain/5caceb4b-cd05-4a27-b4a3-fab6af055cdf/tekstskriving_01_1779859899333.png',
        dest: 'public/images/komposisjon/tekstskriving-01.webp'
    },
    {
        src: '/home/irik/.gemini/antigravity-cli/brain/5caceb4b-cd05-4a27-b4a3-fab6af055cdf/tekstskriving_02_1779859915507.png',
        dest: 'public/images/komposisjon/tekstskriving-02.webp'
    },
    {
        src: '/home/irik/.gemini/antigravity-cli/brain/5caceb4b-cd05-4a27-b4a3-fab6af055cdf/tekstskriving_03_1779859934294.png',
        dest: 'public/images/komposisjon/tekstskriving-03.webp'
    },
    {
        src: '/home/irik/.gemini/antigravity-cli/brain/5caceb4b-cd05-4a27-b4a3-fab6af055cdf/gamle_toner_nye_stemmer_hero_1779859951274.png',
        dest: 'public/images/musikkhistorie/gamle-toner-nye-stemmer-hero.webp'
    },
    {
        src: '/home/irik/.gemini/antigravity-cli/brain/5caceb4b-cd05-4a27-b4a3-fab6af055cdf/gamle_toner_nye_stemmer_01_1779859968562.png',
        dest: 'public/images/musikkhistorie/gamle-toner-nye-stemmer-01.webp'
    },
    {
        src: '/home/irik/.gemini/antigravity-cli/brain/5caceb4b-cd05-4a27-b4a3-fab6af055cdf/gamle_toner_nye_stemmer_02_1779859987268.png',
        dest: 'public/images/musikkhistorie/gamle-toner-nye-stemmer-02.webp'
    },
    {
        src: '/home/irik/.gemini/antigravity-cli/brain/5caceb4b-cd05-4a27-b4a3-fab6af055cdf/gamle_toner_nye_stemmer_03_1779860004513.png',
        dest: 'public/images/musikkhistorie/gamle-toner-nye-stemmer-03.webp'
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
