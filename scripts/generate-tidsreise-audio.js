#!/usr/bin/env node
/**
 * Generates ElevenLabs TTS audio for all Tidsreise scenario nodes.
 *
 * Usage:
 *   ELEVENLABS_API_KEY=xxx node scripts/generate-tidsreise-audio.js [scenarioId]
 *
 * Optional scenario argument limits generation to one scenario.
 * Files are saved to: public/audio/tidsreise/{scenarioId}/{nodeId}.mp3
 * Existing files are skipped (idempotent).
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env manually (dotenv ESM support)
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

// Replace with your chosen Norwegian voice ID from ElevenLabs Voice Library
// Recommended: search "Norwegian" at https://elevenlabs.io/voice-library
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB'; // placeholder – change this

const MODEL_ID = 'eleven_turbo_v2_5';
const OUTPUT_FORMAT = 'mp3_44100_128';
const RATE_LIMIT_DELAY_MS = 300;

// ── Paths ─────────────────────────────────────────────────────────────────────

const SCENARIOS_DIR = join(__dirname, '..', 'public', 'content', 'scenarios');
const AUDIO_BASE_DIR = join(__dirname, '..', 'public', 'audio', 'tidsreise');

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateAudio(text, outputPath, apiKey) {
    const body = JSON.stringify({
        text,
        model_id: MODEL_ID,
        output_format: OUTPUT_FORMAT,
        language_code: 'no',
    });

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
        method: 'POST',
        headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
        },
        body,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const buffer = await response.arrayBuffer();
    writeFileSync(outputPath, Buffer.from(buffer));
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
        console.error('Error: ELEVENLABS_API_KEY environment variable is not set.');
        console.error('Usage: ELEVENLABS_API_KEY=xxx node scripts/generate-tidsreise-audio.js [scenarioId]');
        process.exit(1);
    }

    const filterScenario = process.argv[2] || null;

    // Discover scenario files
    const scenarioFiles = readdirSync(SCENARIOS_DIR)
        .filter(f => f.endsWith('.json'))
        .filter(f => !filterScenario || f === `${filterScenario}.json`);

    if (scenarioFiles.length === 0) {
        console.error(filterScenario
            ? `No scenario file found for: ${filterScenario}`
            : 'No scenario JSON files found in ' + SCENARIOS_DIR);
        process.exit(1);
    }

    let totalGenerated = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    for (const file of scenarioFiles) {
        const scenarioPath = join(SCENARIOS_DIR, file);
        const scenario = JSON.parse(readFileSync(scenarioPath, 'utf8'));
        const scenarioId = scenario.id;

        console.log(`\n--- Scenario: ${scenarioId} (${file}) ---`);

        const audioDir = join(AUDIO_BASE_DIR, scenarioId);
        mkdirSync(audioDir, { recursive: true });

        const nodes = scenario.nodes;
        if (!nodes) {
            console.log('  No nodes found, skipping.');
            continue;
        }

        const nodeIds = Object.keys(nodes);
        console.log(`  Found ${nodeIds.length} nodes.`);

        for (const nodeId of nodeIds) {
            const node = nodes[nodeId];

            // Node narration
            if (node.text && node.text.trim() !== '') {
                const outputPath = join(audioDir, `${nodeId}.mp3`);
                if (existsSync(outputPath)) {
                    totalSkipped++;
                } else {
                    process.stdout.write(`  Generating ${nodeId}.mp3 ... `);
                    try {
                        await generateAudio(node.text, outputPath, apiKey);
                        process.stdout.write('OK\n');
                        totalGenerated++;
                    } catch (err) {
                        process.stdout.write(`FAILED: ${err.message}\n`);
                        totalErrors++;
                    }
                    await sleep(RATE_LIMIT_DELAY_MS);
                }
            }

            // Discovery popup narration
            if (node.discoveryEvent) {
                const discoveryText = `${node.discoveryEvent.title}. ${node.discoveryEvent.fact}`;
                const outputPath = join(audioDir, `discovery_${nodeId}.mp3`);
                if (existsSync(outputPath)) {
                    totalSkipped++;
                } else {
                    process.stdout.write(`  Generating discovery_${nodeId}.mp3 ... `);
                    try {
                        await generateAudio(discoveryText, outputPath, apiKey);
                        process.stdout.write('OK\n');
                        totalGenerated++;
                    } catch (err) {
                        process.stdout.write(`FAILED: ${err.message}\n`);
                        totalErrors++;
                    }
                    await sleep(RATE_LIMIT_DELAY_MS);
                }
            }
        }
    }

    console.log('\n=== Summary ===');
    console.log(`  Generated: ${totalGenerated}`);
    console.log(`  Skipped (already exists): ${totalSkipped}`);
    console.log(`  Errors: ${totalErrors}`);
}

main().catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
});
