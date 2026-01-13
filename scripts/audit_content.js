
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Scan the entire public directory
const PUBLIC_DIR = path.join(__dirname, '../public');
const OUTPUT_FILE = path.join(__dirname, '../content_audit_results.json');

const results = {
    plaintextInternalLinks: [],
    suspiciousMarkdownLinks: [],
    emptyOrPlaceholderComparisons: []
};

// Regex to find paths that look like internal content references but aren't links
// Matches /content/..., .../artikkel.json, etc. 
const INTERNAL_PATH_REGEX = /(\/?content\/[a-zA-Z0-9\-\/]+\.json)|(\/[a-zA-Z0-9\-]+\/[a-zA-Z0-9\-]+\/[a-zA-Z0-9\-]+)/g;
const MARKDOWN_LINK_REGEX = /\[([^\]]+)\]\(([^)]*)\)/g;

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else {
            if (path.extname(f) === '.json') {
                callback(dirPath);
            }
        }
    });
}

function analyzeFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const json = JSON.parse(content);
        const relativePath = path.relative(PUBLIC_DIR, filePath);
        traverse(json, relativePath, '');
    } catch (e) {
        // console.error(`Error parsing ${filePath}: ${e.message}`);
    }
}

function traverse(obj, filePath, keyPath) {
    if (obj === null || obj === undefined) return;

    if (typeof obj === 'string') {
        checkString(obj, filePath, keyPath);
    } else if (Array.isArray(obj)) {
        if (keyPath.toLowerCase().includes('comparison') || keyPath.toLowerCase().includes('table')) {
            checkComparisonStructure(obj, filePath, keyPath);
        }
        obj.forEach((item, index) => traverse(item, filePath, `${keyPath}[${index}]`));
    } else if (typeof obj === 'object') {
        if (keyPath.toLowerCase().includes('comparison') || keyPath.toLowerCase().includes('table')) {
            checkComparisonStructure(obj, filePath, keyPath);
        }
        Object.keys(obj).forEach(key => {
            traverse(obj[key], filePath, keyPath ? `${keyPath}.${key}` : key);
        });
    }
}

function checkString(str, filePath, keyPath) {
    // 1. Check for Plaintext Internal Links
    // We look for patterns like "content/..." that are NOT inside a markdown link structure
    let match;
    while ((match = INTERNAL_PATH_REGEX.exec(str)) !== null) {
        const pathStr = match[0];
        const index = match.index;

        // Context check: is it inside (...)?
        const preceding = str.substring(Math.max(0, index - 2), index);
        const isMarkdown = preceding.includes('](') || preceding.includes('src="') || preceding.includes('href="');

        // Field check
        const isLinkField = /url|link|src|href|image/i.test(keyPath.split('.').pop());

        // Exception for "content/..." if it is just a short relative path usage that is valid in some contexts (like heroImage)
        // But the user complained about "klartekst" so we flag it if it's in a 'text' field.
        const isTextField = keyPath.toLowerCase().endsWith('content') || keyPath.toLowerCase().endsWith('text');

        if (!isMarkdown && !isLinkField && isTextField) {
            results.plaintextInternalLinks.push({
                file: filePath,
                key: keyPath,
                match: pathStr,
                snippet: str.substring(Math.max(0, index - 20), Math.min(str.length, index + pathStr.length + 20))
            });
        }
    }

    // 2. Check for suspicious markdown links
    // Reset regex index
    MARKDOWN_LINK_REGEX.lastIndex = 0;
    while ((match = MARKDOWN_LINK_REGEX.exec(str)) !== null) {
        const url = match[2];
        if (!url || url === 'TODO' || url === '#' || url.trim() === '') {
            results.suspiciousMarkdownLinks.push({
                file: filePath,
                key: keyPath,
                match: match[0],
                reason: "Empty or placeholder URL"
            });
        }
    }
}

function checkComparisonStructure(obj, filePath, keyPath) {
    if (Array.isArray(obj) && obj.length === 0) {
        results.emptyOrPlaceholderComparisons.push({ file: filePath, key: keyPath, issue: "Empty Array" });
        return;
    }
    if (typeof obj === 'object' && Object.keys(obj).length === 0) {
        results.emptyOrPlaceholderComparisons.push({ file: filePath, key: keyPath, issue: "Empty Object" });
        return;
    }

    // Flatten values to check content
    const values = [];
    JSON.stringify(obj, (key, value) => {
        if (typeof value === 'string') values.push(value);
        return value;
    });

    // Check if it's "effectively empty" (only empty strings, headers, or todos)
    // We filter out keys, only strictly looking at values collected.
    const nonPlaceholders = values.filter(v =>
        v.trim().length > 0 &&
        v !== "TODO" &&
        v !== "Kommer snart" &&
        !v.startsWith("http") // images/links are content, but if ONLY images/links maybe it's valid?
    );

    if (nonPlaceholders.length === 0 && values.length > 0) {
        results.emptyOrPlaceholderComparisons.push({
            file: filePath,
            key: keyPath,
            issue: "Contains only empty strings or placeholders",
            sample: values.slice(0, 3)
        });
    }
}

console.log(`Scanning ${PUBLIC_DIR}...`);
walkDir(PUBLIC_DIR, analyzeFile);

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
console.log(`Scan complete. 
Plaintext Internal Paths: ${results.plaintextInternalLinks.length}
Suspicious Markdown Links: ${results.suspiciousMarkdownLinks.length}
Empty/Placeholder Comparisons: ${results.emptyOrPlaceholderComparisons.length}
Written to ${OUTPUT_FILE}`);
