
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const suggestionsPath = path.join(__dirname, '../public/data/suggestions.json');
const outputPath = path.join(__dirname, '../public/data/filtered_suggestions.json');

try {
    const suggestions = JSON.parse(fs.readFileSync(suggestionsPath, 'utf8'));

    const commonWords = new Set([
        'hadde', 'verden', 'store', 'andre', 'første', 'hvordan', 'mennesker', 'europa', 'krigen', 'norge',
        'mente', 'gjorde', 'kanskje', 'nesten', 'tyskland', 'begynte', 'moderne', 'senere', 'historien', 'aldri',
        'finnes', 'skulle', 'veldig', 'mannen', 'gjennom', 'viktig', 'mange', 'komme', 'derfor', 'uansett',
        'helt', 'mye', 'selv', 'skal', 'kan', 'litt', 'ofte', 'alltid', 'fordi', 'disse', 'dette', 'denne',
        'etter', 'over', 'eller', 'bare', 'også', 'være', 'slik', 'noen', 'hvor', 'alle', 'like', 'siden'
    ]);

    const noise = new Set(['Eksempler:', 'Se også:', 'Kilde:', 'Kilder:', 'Oppgave:', 'Oppgaver:', 'Hierarkiet i helvete:']);

    const filteredBold = suggestions.boldCandidates.filter(([term, data]) => {
        if (term.length < 3) return false;
        if (commonWords.has(term.toLowerCase())) return false;
        if (noise.has(term)) return false;
        if (term.match(/^\d/)) return false;
        return true;
    });

    const filteredFrequent = suggestions.frequentTerms.filter(([term, data]) => {
        if (term.length < 3) return false;
        if (commonWords.has(term.toLowerCase())) return false;
        if (term.length > 25) return false;
        return data.count > 5;
    });

    const result = {
        boldCandidates: filteredBold,
        frequentTerms: filteredFrequent
    };

    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log('Filtered suggestions saved.');
} catch (error) {
    console.error('Error processing suggestions:', error);
    process.exit(1);
}
