#!/usr/bin/env node
/**
 * Quick test: sends one sentence to ElevenLabs and saves to test-output.mp3
 *
 * Usage:
 *   ELEVENLABS_API_KEY=xxx node scripts/test-elevenlabs.js
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env manually
const envPath = join(__dirname, '..', '.env');
if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, 'utf8');
    for (const line of envContent.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIndex = trimmed.indexOf('=');
        if (eqIndex === -1) continue;
        const key = trimmed.slice(0, eqIndex).trim();
        const value = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) process.env[key] = value;
    }
}

const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB';
const TEST_TEXT = 'Dette er en test av stemmen for Tidsreise-spillene.';
const OUTPUT_PATH = join(__dirname, '..', 'test-output.mp3');

async function main() {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
        console.error('ELEVENLABS_API_KEY is not set.');
        process.exit(1);
    }

    console.log(`Testing ElevenLabs TTS...`);
    console.log(`Voice ID: ${VOICE_ID}`);
    console.log(`Text: "${TEST_TEXT}"`);

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
        method: 'POST',
        headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            text: TEST_TEXT,
            model_id: 'eleven_turbo_v2_5',
            output_format: 'mp3_44100_128',
            language_code: 'no',
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed: HTTP ${response.status}: ${errorText}`);
        process.exit(1);
    }

    const buffer = await response.arrayBuffer();
    writeFileSync(OUTPUT_PATH, Buffer.from(buffer));
    console.log(`\nSuccess! Audio saved to: ${OUTPUT_PATH}`);
    console.log(`File size: ${buffer.byteLength} bytes`);
}

main().catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
});
