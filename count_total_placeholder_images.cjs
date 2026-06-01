const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, 'public/content');
const dirs = [
    'historie/osmanske-riket',
    'historie/kinas-historie',
    'historie/midtoesten'
];

let totalPlaceholders = 0;
const details = [];

function scanFile(file) {
    try {
        const content = fs.readFileSync(file, 'utf8');
        const json = JSON.parse(content);
        const relativeFile = path.relative(process.cwd(), file);
        
        let filePlaceholders = 0;
        
        if (json.heroImage && json.heroImage.includes('placeholder')) {
            filePlaceholders++;
            details.push({ file: relativeFile, field: 'heroImage', title: json.title, alt: 'Hero image' });
        }
        if (json.image && json.image.includes('placeholder')) {
            filePlaceholders++;
            details.push({ file: relativeFile, field: 'image', title: json.title, alt: 'Topic/Lesson image' });
        }
        
        if (Array.isArray(json.content)) {
            json.content.forEach((item, index) => {
                if (item.type === 'image' && item.src && item.src.includes('placeholder')) {
                    filePlaceholders++;
                    details.push({
                        file: relativeFile,
                        field: `content[${index}]`,
                        title: json.title,
                        alt: item.alt,
                        caption: item.caption
                    });
                }
            });
        }
        
        totalPlaceholders += filePlaceholders;
    } catch (e) {
        console.error(`Error reading ${file}: ${e.message}`);
    }
}

function scanDir(dir) {
    const absDir = path.join(CONTENT_DIR, dir);
    if (!fs.existsSync(absDir)) return;
    
    const files = fs.readdirSync(absDir);
    files.forEach(file => {
        const fullPath = path.join(absDir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            scanDir(path.join(dir, file));
        } else if (file.endsWith('.json')) {
            scanFile(fullPath);
        }
    });
}

dirs.forEach(scanDir);

console.log(`Total placeholder images to generate: ${totalPlaceholders}`);
console.log(JSON.stringify(details, null, 2));
