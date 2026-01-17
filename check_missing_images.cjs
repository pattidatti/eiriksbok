const fs = require('fs');
const path = require('path');

const contentDir = path.join(__dirname, 'public/content');
const publicDir = path.join(__dirname, 'public');

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith('.json')) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });

    return arrayOfFiles;
}

const allContentFiles = getAllFiles(contentDir);
const missingImages = [];

console.log(`Scanning ${allContentFiles.length} files...`);

allContentFiles.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        const json = JSON.parse(content);

        let imagePath = null;

        // Check common image fields
        if (json.image) imagePath = json.image;
        else if (json.coverImage) imagePath = json.coverImage;
        else if (json.briefing && json.briefing.image) imagePath = json.briefing.image;

        if (imagePath) {
            // Resolve absolute path from public dir
            // Image paths usually start with /
            const relativePath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
            const absPath = path.join(publicDir, relativePath);

            if (!fs.existsSync(absPath)) {
                missingImages.push({
                    file: path.relative(process.cwd(), file),
                    missingImage: imagePath
                });
            }
        } else {
            // File has no image reference at all
            // Focus on detective and specific history files mentioned
            if (file.includes('detective') || file.includes('norge-for-vikingene')) {
                missingImages.push({
                    file: path.relative(process.cwd(), file),
                    missingImage: "NO_IMAGE_FIELD_FOUND"
                });
            }
        }
    } catch (e) {
        console.error(`Error reading ${file}: ${e.message}`);
    }
});

console.log("--- Missing Images Report ---");
missingImages.forEach(item => {
    console.log(`File: ${item.file}`);
    console.log(`Missing Ref: ${item.missingImage}`);
    console.log("-----------------------------");
});
