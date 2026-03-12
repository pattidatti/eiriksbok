
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const sourceDir = "/home/irik/.gemini/antigravity/brain/520b0595-2954-437a-a37d-3228aa22fc85";
const targetDir = "/home/irik/eiriksbok/public/images/chronos/nikolaj-ii";

const mappings = {
    // Batch 1
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
    "ostfront_retreating_webp_1773323484229.png": "ostfront_retreating.webp",

    // Batch 2
    "ostfront_map_1915_webp_1773339203433.png": "ostfront_map_1915.webp",
    "stavka_headquarters_webp_1773339220474.png": "stavka_headquarters.webp",
    "diplomatic_meeting_webp_1773339235997.png": "diplomatic_meeting.webp",
    "rasputin_portrait_webp_1773339251789.png": "rasputin_portrait.webp",
    "petrograd_1916_webp_1773339278650.png": "petrograd_1916.webp",
    "petrograd_map_1916_webp_1773339296936.png": "petrograd_map_1916.webp",
    "brusilov_map_table_webp_1773339313110.png": "brusilov_map_table.webp",
    "brusilov_victory_webp_1773339328671.png": "brusilov_victory.webp",
    "pskov_train_webp_1773339356107.png": "pskov_train.webp",
    "abdikasjon_beslutning_webp_1773339372890.png": "abdikasjon_beslutning.webp",
    "abdikasjon_scene_webp_1773339393243.png": "abdikasjon_scene.webp",
    "tsarskoje_hus_arrest_webp_1773339411671.png": "tsarskoje_hus_arrest.webp",
    "aurora_skuddet_webp_1773339425498.png": "aurora_skuddet.webp",
    "ipatiev_house_webp_1773339453446.png": "ipatiev_house.webp",
    "reform_track_victory_webp_1773339468838.png": "reform_track_victory.webp",
    "exile_england_webp_1773339483860.png": "exile_england.webp",
    "brest_litovsk_webp_1773339498361.png": "brest_litovsk.webp"
};

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

async function convert() {
    console.log(`🚀 Starting conversion in ${targetDir}...`);
    for (const [srcName, dstName] of Object.entries(mappings)) {
        const srcPath = path.join(sourceDir, srcName);
        const dstPath = path.join(targetDir, dstName);

        if (fs.existsSync(srcPath)) {
            // Only convert if it doesn't already exist or we want to overwrite
            if (!fs.existsSync(dstPath)) {
                console.log(`🔄 Converting ${srcName} to ${dstName}...`);
                try {
                    await sharp(srcPath).webp({ quality: 80 }).toFile(dstPath);
                    console.log(` ✅ Success: ${dstName}`);
                } catch (err) {
                    console.error(` ❌ Error converting ${srcName}:`, err.message);
                }
            } else {
                console.log(` ⏩ Skipping ${dstName} (already exists)`);
            }
        } else {
            console.log(` ⚠️ Source not found: ${srcName}`);
        }
    }
    console.log(`✨ All done!`);
}

convert();
