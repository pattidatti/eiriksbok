const fs = require('fs');
const path = require('path');

// CONFIGURATION
const DB_URL = "https://eiriksbok-default-rtdb.europe-west1.firebasedatabase.app";
const OUTPUT_FILE = path.join(__dirname, '..', 'feedback_data.json');

// NOTE: For security, we ask for the secret as an argument or environment variable
// Usage: node scripts/fetch_feedback.cjs <YOUR_DATABASE_SECRET>
const SECRET = process.argv[2] || process.env.FIREBASE_DB_SECRET;

if (!SECRET) {
    console.error(`
❌ Mangler Database Secret!

For å hente data fra en privat database, trenger du en 'Database Secret'.
1. Gå til Firebase Console -> Project Settings -> Service Accounts -> Database Secrets.
2. Kopier hemmeligheten.
3. Kjør scriptet slik: 
   node scripts/fetch_feedback.cjs DIN_HEMMELIGHET_HER
    `);
    process.exit(1);
}

async function fetchFeedback() {
    console.log("🔄 Henter feedback fra Firebase...");

    try {
        const response = await fetch(`${DB_URL}/feedback.json?auth=${SECRET}`);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!data) {
            console.log("ℹ️ Ingen feedback funnet (databasen returnerte null).");
            return;
        }

        // Convert object to array for easier reading
        const feedbackArray = Object.entries(data).map(([id, entry]) => ({
            id,
            ...entry,
            date: new Date(entry.timestamp).toLocaleString('no-NO')
        })).sort((a, b) => b.timestamp - a.timestamp); // Newest first

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(feedbackArray, null, 2));

        console.log(`✅ Suksess! ${feedbackArray.length} tilbakemeldinger lagret til:`);
        console.log(OUTPUT_FILE);

    } catch (error) {
        console.error("❌ Feil ved henting av data:", error.message);
    }
}

fetchFeedback();
