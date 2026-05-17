import fs from 'fs';
import sharp from 'sharp';
import path from 'path';

const jobs = [
    { src: '/home/irik/.gemini/antigravity/brain/8e32be90-b5bc-44a6-9f82-012080d2dd7d/folkemusikk_hero_1779046065109.png', dest: 'public/images/musikkhistorie/folkemusikk-hero.webp' },
    { src: '/home/irik/.gemini/antigravity/brain/8e32be90-b5bc-44a6-9f82-012080d2dd7d/folkemusikk_01_1779046077760.png', dest: 'public/images/musikkhistorie/folkemusikk-01.webp' },
    { src: '/home/irik/.gemini/antigravity/brain/8e32be90-b5bc-44a6-9f82-012080d2dd7d/folkemusikk_02_1779046089260.png', dest: 'public/images/musikkhistorie/folkemusikk-02.webp' },
    { src: '/home/irik/.gemini/antigravity/brain/8e32be90-b5bc-44a6-9f82-012080d2dd7d/aleksander_hero_1779046102547.png', dest: 'public/images/perserriket/aleksander-den-store-hero.webp' },
    { src: '/home/irik/.gemini/antigravity/brain/8e32be90-b5bc-44a6-9f82-012080d2dd7d/aleksander_01_1779046120440.png', dest: 'public/images/perserriket/aleksander-den-store-01.webp' },
    { src: '/home/irik/.gemini/antigravity/brain/8e32be90-b5bc-44a6-9f82-012080d2dd7d/aleksander_02_1779046147044.png', dest: 'public/images/perserriket/aleksander-den-store-02.webp' },
    { src: '/home/irik/.gemini/antigravity/brain/8e32be90-b5bc-44a6-9f82-012080d2dd7d/gobekli_tepe_hero_1779046161177.png', dest: 'public/images/menneskets-tidlige-historie/gobekli-tepe-hero.webp' },
    { src: '/home/irik/.gemini/antigravity/brain/8e32be90-b5bc-44a6-9f82-012080d2dd7d/gobekli_tepe_01_1779046175199.png', dest: 'public/images/menneskets-tidlige-historie/gobekli-tepe-01.webp' },
    { src: '/home/irik/.gemini/antigravity/brain/8e32be90-b5bc-44a6-9f82-012080d2dd7d/gobekli_tepe_02_1779046187088.png', dest: 'public/images/menneskets-tidlige-historie/gobekli-tepe-02.webp' },
    { src: '/home/irik/.gemini/antigravity/brain/8e32be90-b5bc-44a6-9f82-012080d2dd7d/norge_okkupasjon_hero_1779046202186.png', dest: 'public/images/andre-verdenskrig/norge-under-okkupasjonen-hero.webp' },
    { src: '/home/irik/.gemini/antigravity/brain/8e32be90-b5bc-44a6-9f82-012080d2dd7d/norge_okkupasjon_01_1779046228303.png', dest: 'public/images/andre-verdenskrig/norge-under-okkupasjonen-01.webp' },
    { src: '/home/irik/.gemini/antigravity/brain/8e32be90-b5bc-44a6-9f82-012080d2dd7d/norge_okkupasjon_02_1779046240583.png', dest: 'public/images/andre-verdenskrig/norge-under-okkupasjonen-02.webp' },
    { src: '/home/irik/.gemini/antigravity/brain/8e32be90-b5bc-44a6-9f82-012080d2dd7d/norge_okkupasjon_03_1779046253423.png', dest: 'public/images/andre-verdenskrig/norge-under-okkupasjonen-03.webp' }
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
