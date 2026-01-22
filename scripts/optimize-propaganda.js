import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const dir = path.join(process.cwd(), 'public/images/historie/forste-verdenskrig');

const images = [
    { input: 'propaganda_daddy.png', output: 'propaganda_daddy_web.jpg' },
    { input: 'propaganda_brute.jpg', output: 'propaganda_brute_web.jpg' },
    { input: 'propaganda_wait.jpg', output: 'propaganda_wait_web.jpg' } // Will assume this exists or I'll handle error
];

async function optimize() {
    for (const img of images) {
        const inputPath = path.join(dir, img.input);
        const outputPath = path.join(dir, img.output);

        if (fs.existsSync(inputPath)) {
            console.log(`Processing ${img.input}...`);
            try {
                await sharp(inputPath)
                    .resize(1920, null, { fit: 'inside' })
                    .jpeg({ quality: 80, mozjpeg: true })
                    .toFile(outputPath);
                console.log(`Saved ${img.output}`);
            } catch (err) {
                console.error(`Error processing ${img.input}:`, err);
            }
        } else {
            console.log(`Skipping ${img.input} (not found)`);
        }
    }
}

optimize();
