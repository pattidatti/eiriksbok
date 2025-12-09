const fs = require('fs');
const path = 'c:\\Users\\Eirik\\Desktop\\Git - Eiriksbok\\Eiriksbok\\public\\content\\global-timeline.json';

try {
    const data = fs.readFileSync(path, 'utf8');
    let events = JSON.parse(data);

    console.log(`Initial count: ${events.length}`);

    const contentMap = new Map(); // Key: title|date -> event
    const seenIds = new Set();
    const finalEvents = [];

    // Prioritize keeping the "best" version.
    // Heuristic: IDs that match the topicId are better than generic ones.
    const isBetter = (newEvT, oldEvT) => {
        const badPrefixes = ['artikkel-', 'bakgrunn-', 'tidlig-historie-'];
        const newIsBad = badPrefixes.some(p => newEvT.id.startsWith(p));
        const oldIsBad = badPrefixes.some(p => oldEvT.id.startsWith(p));

        if (newIsBad && !oldIsBad) return false;
        if (!newIsBad && oldIsBad) return true;

        // If both bad or both good, prefer longer ID (specificity) or just keep existing
        return newEvT.id.length > oldEvT.id.length;
    };

    events.forEach(e => {
        // 1. Strict ID check
        if (seenIds.has(e.id)) {
            // It's a strict duplicate of an ID we've ALREADY decided to keep/process.
            // But wait, what if this instance is "better" content-wise? 
            // Usually strict duplicates are identical content. 
            // We'll skip strict duplicates assuming the file is processed in order or it doesn't matter.
            // BUT, if we have duplicate semantic content with DIFFERENT IDs, we handle that below.
            // If we have duplicate IDs, we just drop the second one.
            return;
        }

        const key = `${e.title}|${e.startDate}`;

        if (contentMap.has(key)) {
            const existing = contentMap.get(key);
            // Compare quality
            if (isBetter(e, existing)) {
                // Remove existing ID from seen (so we technically don't track it, 
                // but we rely on finalEvents reconstruction from map values? No, map values aren't ordered.)
                // Better approach: filter duplicate entries.
                contentMap.set(key, e);
                // We need to manage `seenIds` if we swap. 
                seenIds.delete(existing.id);
                seenIds.add(e.id);
            } else {
                // Keep existing, ignore new
            }
        } else {
            contentMap.set(key, e);
            seenIds.add(e.id);
        }
    });

    const cleanedEvents = Array.from(contentMap.values());

    // Sort by date (descending) as typically required, or keep original order?
    // The original file seemed loosely ordered. Let's sort by date desc to be clean.
    cleanedEvents.sort((a, b) => b.startDate - a.startDate);

    console.log(`Final count: ${cleanedEvents.length}`);
    console.log(`Removed: ${events.length - cleanedEvents.length}`);

    fs.writeFileSync(path, JSON.stringify(cleanedEvents, null, 2));

} catch (err) {
    console.error(err);
}
