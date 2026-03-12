import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const BRAIN_DIR = '/home/irik/.gemini/antigravity/brain/2650fca1-74ab-4a4b-8773-c635f97a2ee0';
const TOPIC_DIR = '/home/irik/eiriksbok/public/images/topics';
const LESSON_DIR = '/home/irik/eiriksbok/public/images/lessons/handel';

const images = [
    { src: 'handel_infrastruktur_topic_hero', dest: path.join(TOPIC_DIR, 'handel-og-infrastruktur.webp') },
    { src: 'global_handel_hero', dest: path.join(LESSON_DIR, 'global-handel-hero.webp') },
    { src: 'energi_rorledninger_hero', dest: path.join(LESSON_DIR, 'energi-rorledninger-hero.webp') },
    { src: 'internett_kabler_hero', dest: path.join(LESSON_DIR, 'internett-kabler-hero.webp') },
    { src: 'mat_skipsfart_hero', dest: path.join(LESSON_DIR, 'mat-skipsfart-hero.webp') },
    { src: 'saarbare_nettverk_hero', dest: path.join(LESSON_DIR, 'saarbare-nettverk-hero.webp') }
];

async function processImages() {
    const files = fs.readdirSync(BRAIN_DIR);

    for (const img of images) {
        const matchingFile = files.find(f => f.startsWith(img.src) && f.endsWith('.png'));
        if (matchingFile) {
            console.log(`Processing ${matchingFile} -> ${img.dest}`);
            await sharp(path.join(BRAIN_DIR, matchingFile))
                .resize({ width: 1600, withoutEnlargement: true })
                .webp({ quality: 80 })
                .toFile(img.dest);
            console.log(`✅ Success: ${img.dest}`);
        } else {
            console.warn(`⚠️ Could not find source for ${img.src}`);
        }
    }
}

processImages().catch(console.error);
