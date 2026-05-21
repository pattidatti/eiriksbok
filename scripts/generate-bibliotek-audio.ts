#!/usr/bin/env tsx
/**
 * Generates ElevenLabs TTS audio for tekstbibliotek entries.
 *
 * Usage:
 *   npm run gen:bibliotek-audio [textId]
 *
 * Files are saved to: public/audio/bibliotek/{textId}/p{index}.mp3
 * Existing files are skipped (idempotent).
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { textLibraryData } from '../src/data/texts/index';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env
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

// ── Configuration ─────────────────────────────────────────────────────────────

const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB';
const MODEL_ID = 'eleven_turbo_v2_5';
const OUTPUT_FORMAT = 'mp3_44100_128';
const RATE_LIMIT_DELAY_MS = 300;

// ── Paths ─────────────────────────────────────────────────────────────────────

const AUDIO_BASE_DIR = join(__dirname, '..', 'public', 'audio', 'bibliotek');

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function cleanMarkdown(text: string): string {
    if (!text) return '';
    let cleaned = text;
    cleaned = cleaned.replace(/#{1,6}\s?/g, '');
    cleaned = cleaned.replace(/(\*\*|__)(.*?)\1/g, '$2');
    cleaned = cleaned.replace(/(\*|_)(.*?)\1/g, '$2');
    cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    cleaned = cleaned.replace(/<[^>]+>/g, '');
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    return cleaned;
}

async function generateAudio(text: string, outputPath: string, apiKey: string): Promise<void> {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
        method: 'POST',
        headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            text,
            model_id: MODEL_ID,
            output_format: OUTPUT_FORMAT,
            language_code: 'no',
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const buffer = await response.arrayBuffer();
    writeFileSync(outputPath, Buffer.from(buffer));
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
        console.error('Error: ELEVENLABS_API_KEY is not set.');
        process.exit(1);
    }

    const filterTextId = process.argv[2] || null;

    const entries = filterTextId
        ? textLibraryData.filter((t) => t.id === filterTextId)
        : textLibraryData;

    if (entries.length === 0) {
        console.error(filterTextId ? `No text found with id: ${filterTextId}` : 'No texts found.');
        process.exit(1);
    }

    let totalGenerated = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    for (const entry of entries) {
        console.log(`\n--- ${entry.title} (${entry.id}) ---`);

        const audioDir = join(AUDIO_BASE_DIR, entry.id);
        mkdirSync(audioDir, { recursive: true });

        if (!entry.content || entry.content.length === 0) {
            console.log('  No content, skipping.');
            continue;
        }

        // Build speech blocks: [title, ...non-empty paragraphs]
        const blocks: string[] = [entry.title];
        for (const paragraph of entry.content) {
            const cleaned = cleanMarkdown(paragraph);
            if (cleaned) blocks.push(cleaned);
        }

        console.log(`  ${blocks.length} blokker (tittel + avsnitt).`);

        for (let i = 0; i < blocks.length; i++) {
            const outputPath = join(audioDir, `p${i}.mp3`);
            if (existsSync(outputPath)) {
                totalSkipped++;
                continue;
            }

            process.stdout.write(`  Genererer p${i}.mp3 (${blocks[i].slice(0, 40)}...) ... `);
            try {
                await generateAudio(blocks[i], outputPath, apiKey);
                process.stdout.write('OK\n');
                totalGenerated++;
            } catch (err) {
                process.stdout.write(`FEIL: ${(err as Error).message}\n`);
                totalErrors++;
            }
            await sleep(RATE_LIMIT_DELAY_MS);
        }

        // Write manifest
        const manifestPath = join(audioDir, 'manifest.json');
        const manifest = { blockCount: blocks.length, generatedAt: new Date().toISOString() };
        writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
        console.log(`  manifest.json skrevet (${blocks.length} blokker).`);
    }

    console.log('\n=== Ferdig ===');
    console.log(`  Generert:  ${totalGenerated}`);
    console.log(`  Hoppet over (fantes): ${totalSkipped}`);
    console.log(`  Feil:      ${totalErrors}`);
}

main().catch((err) => {
    console.error('Uventet feil:', err);
    process.exit(1);
});
