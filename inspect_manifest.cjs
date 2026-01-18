const fs = require('fs');
const manifest = JSON.parse(fs.readFileSync('public/content/manifest.json', 'utf8'));
console.log("Subjects:");
manifest.subjects.forEach(s => {
    console.log(`- ${s.id} (${s.title})`);
    if (s.topics) {
        s.topics.forEach(t => console.log(`  - Topic: ${t.id} (${t.title})`));
    }
});
