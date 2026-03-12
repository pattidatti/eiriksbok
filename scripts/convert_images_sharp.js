
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = "/home/irik/.gemini/antigravity/brain/520b0595-2954-437a-a37d-3228aa22fc85";
const targetDir = "/home/irik/eiriksbok/public/images/chronos/nikolaj-ii";

const mappings = {
    "hero_webp_1773323270285.png": "hero.webp",
    "sarajevo_telegram_webp_1773323285826.png": "sarajevo_telegram.webp",
    "tsarskoje_selo_study_webp_1773323304237.png": "tsarskoje_selo_study.webp",
    "tsarskoje_selo_map_webp_1773323319928.png": "tsarskoje_selo_map.webp",
    "nicky_willy_telegram_webp_1773323375955.png": "nicky_willy_telegram.webp",
    "military_map_1914_webp_1773323392139.png": "military_map_1914.webp",
    "mobilisering_webp_1773323409589.png": "mobilisering.webp",
    "krigsutbrudd_petrograd_webp_1773323425492.png": "krigsutbrudd_petrograd.webp",
    "duma_petrograd_webp_1773323450035.png": "duma_petrograd.webp",
    "tannenberg_battlefield_webp_1773323466465.png": "tannenberg_battlefield.webp",
    "ostfront_retreating_webp_1773323484229.png": "ostfront_retreating.webp"
};

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

async function convert() {
    for (const [srcName, dstName] of Object.entries(mappings)) {
        const srcPath = path.join(sourceDir, srcName);
        const dstPath = path.join(targetDir, dstName);

        if (fs.existsSync(srcPath)) {
            console.log(`Converting ${srcName} to ${dstName}...`);
            try {
                await sharp(srcPath).webp().toFile(dstPath);
                console.log(` Successfully converted to ${dstPath}`);
            } catch (err) {
                console.error(` Error converting ${srcName}:`, err.message);
            }
        }
    }
}

convert();
