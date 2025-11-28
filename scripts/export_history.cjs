const fs = require('fs');
const path = require('path');

// Path to the source file
const sourcePath = path.join(__dirname, '../src/components/HistoryLongLines.tsx');
// Path to the output file
const outputPath = path.join(__dirname, '../history_export.txt');

try {
    // Read the source file
    const content = fs.readFileSync(sourcePath, 'utf8');

    // Extract the timelineData array using regex
    // This regex looks for "const timelineData: TimelineEvent[] = [" and captures everything until the closing "];"
    const match = content.match(/const timelineData: TimelineEvent\[\] = \[\s*([\s\S]*?)\s*\];/);

    if (!match || !match[1]) {
        console.error('Could not find timelineData in the source file.');
        process.exit(1);
    }

    const dataString = match[1];

    // To parse this as JSON, we need to clean it up a bit because it's TS/JS code, not valid JSON.
    // However, since we want to export it as text for AI, we can do some manual parsing/formatting 
    // to make it robust against the JSX icons and variable names.

    // Let's split by objects. This is a simple parser assuming standard formatting in the file.
    const events = [];
    const objectRegex = /{\s*id:[\s\S]*?},/g;

    // We can't easily eval() this because of the JSX icons (<Globe ... />).
    // So we will use regex to extract fields from each block.

    // Split the string into blocks that look like objects
    // A simple way is to split by "id:" since that's the first key
    const rawBlocks = dataString.split(/\s*{\s*id:/).filter(Boolean);

    let outputText = "HISTORY CONTENT EXPORT\n======================\n\n";

    rawBlocks.forEach(block => {
        // Re-add "id:" to make regex easier if needed, but we can just parse fields

        const getField = (fieldName) => {
            const regex = new RegExp(`${fieldName}:\\s*(?:"|')([\\s\\S]*?)(?:"|'),`);
            const match = block.match(regex);
            return match ? match[1] : '';
        };

        const getArrayField = (fieldName) => {
            const regex = new RegExp(`${fieldName}:\\s*\\[([\\s\\S]*?)\\],`);
            const match = block.match(regex);
            if (!match) return [];

            // Extract strings from the array content
            return match[1]
                .split(/,\s*\n/)
                .map(s => s.trim().replace(/^"|"$/g, '').replace(/^'|'$/g, ''))
                .filter(s => s.length > 0);
        };

        const id = block.match(/^\s*(?:"|')?([^"',]+)(?:"|')?,/)[1];
        const year = getField('year');
        const title = getField('title');
        const description = getField('description');
        const contentLines = getArrayField('content');
        const details = getArrayField('details');
        const url = getField('url');

        outputText += `ID: ${id}\n`;
        outputText += `TITTEL: ${title}\n`;
        outputText += `ÅR: ${year}\n`;
        outputText += `BESKRIVELSE: ${description}\n`;
        outputText += `URL: ${url}\n\n`;

        outputText += `INNHOLD:\n`;
        contentLines.forEach(line => {
            outputText += `${line}\n\n`;
        });

        outputText += `NØKKELPUNKTER:\n`;
        details.forEach(point => {
            outputText += `- ${point}\n`;
        });

        outputText += `\n--------------------------------------------------\n\n`;
    });

    fs.writeFileSync(outputPath, outputText);
    console.log(`Successfully exported content to ${outputPath}`);

} catch (error) {
    console.error('Error processing file:', error);
    process.exit(1);
}
