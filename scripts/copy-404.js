
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust path significantly since we are in scripts/ and dist/ is at root
const DIST_DIR = path.join(__dirname, '../dist');
const INDEX_PATH = path.join(DIST_DIR, 'index.html');
const NOT_FOUND_PATH = path.join(DIST_DIR, '404.html');

console.log('Post-build: Copying index.html to 404.html for GitHub Pages SPA support...');

if (fs.existsSync(INDEX_PATH)) {
    fs.copyFileSync(INDEX_PATH, NOT_FOUND_PATH);
    console.log('✅ Successfully created dist/404.html');
} else {
    console.warn('⚠️  Warning: dist/index.html not found. Build might have failed or input path is wrong.');
    // Don't fail the build, just warn
    process.exit(0);
}
