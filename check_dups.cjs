const fs = require('fs');
const path = 'c:\\Users\\Eirik\\Desktop\\Git - Eiriksbok\\Eiriksbok\\public\\content\\global-timeline.json';

try {
    const data = fs.readFileSync(path, 'utf8');
    const events = JSON.parse(data);
    const idMap = new Map();
    const dups = [];

    events.forEach(e => {
        if (idMap.has(e.id)) {
            dups.push(e.id);
        } else {
            idMap.set(e.id, true);
        }
    });

    if (dups.length > 0) {
        console.log("Duplicate IDs found:", dups);
    } else {
        console.log("No duplicate IDs found.");
    }

    // Check for identical content (title + date)
    const contentMap = new Map();
    const potentialDups = [];
    events.forEach(e => {
        const key = `${e.title}|${e.startDate}`;
        if (contentMap.has(key)) {
            potentialDups.push({ key, id1: contentMap.get(key), id2: e.id });
        } else {
            contentMap.set(key, e.id);
        }
    });

    if (potentialDups.length > 0) {
        console.log("Potential semantic duplicates (same title & date):", potentialDups);
    }

} catch (err) {
    console.error(err);
}
