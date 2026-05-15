const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const srcDir = '/home/irik/.gemini/antigravity/brain/939590db-6ce6-4cfe-b51c-0602cf8d9033';
const destDir = '/home/irik/eiriksbok/public/images/jordbruk-og-sivilisasjoner';

const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.png'));

async function processImages() {
  for (const file of files) {
    let name = '';
    if (file.startsWith('egypt_hero')) name = 'egypt-hero.webp';
    else if (file.startsWith('egypt_01')) name = 'egypt-01.webp';
    else if (file.startsWith('indusdalen_hero')) name = 'indusdalen-hero.webp';
    else if (file.startsWith('indusdalen_01')) name = 'indusdalen-01.webp';
    else if (file.startsWith('indusdalen_02')) name = 'indusdalen-02.webp';
    else if (file.startsWith('kina_hero')) name = 'kina-hero.webp';
    else if (file.startsWith('kina_01')) name = 'kina-01.webp';
    else if (file.startsWith('kina_02')) name = 'kina-02.webp';

    if (name) {
      console.log(`Converting ${file} to ${name}`);
      await sharp(path.join(srcDir, file))
        .resize({ width: 1600, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(path.join(destDir, name));
    }
  }
}
processImages().catch(console.error);
