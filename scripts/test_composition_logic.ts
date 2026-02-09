
import { calculateNewNodes, getDurationBeats } from '../src/features/music/components/composition/compositionLogic';
import { v4 as uuidv4 } from 'uuid';

// Mock types since we are running in ts-node/tsx environment and might not have full access to types.d.ts easily without config
type NoteDuration = '1n' | '2n' | '4n' | '8n';
type RhythmNode = { id: string; type: 'note' | 'rest'; duration: NoteDuration };

const createNode = (duration: NoteDuration, type: 'note' | 'rest' = 'note'): RhythmNode => ({
    id: uuidv4(),
    type,
    duration
});

const printNodes = (nodes: RhythmNode[]) => nodes.map(n => n.duration).join(', ');

const runTest = (name: string, setup: RhythmNode[], index: number, newDur: NoteDuration, expected: string | null) => {
    console.log(`\n--- Test: ${name} ---`);
    console.log(`Initial: [${printNodes(setup)}]`);
    console.log(`Action: Change index ${index} to ${newDur}`);

    const result = calculateNewNodes(setup, index, newDur, false);

    if (result === null) {
        console.log(`Result: NULL (Rejected)`);
        if (expected === null) {
            console.log('✅ PASS');
        } else {
            console.log(`❌ FAIL - Expected [${expected}]`);
        }
    } else {
        const resStr = printNodes(result);
        console.log(`Result: [${resStr}]`);
        // Calculate total beats
        const total = result.reduce((sum, n) => sum + getDurationBeats(n.duration), 0);
        console.log(`Total Beats: ${total}`);

        if (resStr === expected || (expected === 'CLAMP_CHECK' && total === 4)) { // 4 assumed for 4/4
            console.log('✅ PASS');
        } else {
            console.log(`❌ FAIL - Expected [${expected}]`);
        }
    }
};

// --- Tests ---

// Case 1: Standard Replace (1/4 -> 1/4)
// [4n, 4n, 4n, 4n] -> index 0 to 4n (no change in dur)
runTest(
    'Identity Replace',
    [createNode('4n'), createNode('4n'), createNode('4n'), createNode('4n')],
    0, '4n',
    '4n, 4n, 4n, 4n'
);

// Case 2: Consumption (1/4 -> 1/2) - Should eat the next 1/4
// [4n, 4n, 4n, 4n] -> index 0 to 2n
runTest(
    'Simple Consume',
    [createNode('4n'), createNode('4n'), createNode('4n'), createNode('4n')],
    0, '2n',
    '2n, 4n, 4n'
);

// Case 3: Split (1/2 -> 1/4) - Should fill with rest
// [2n, 2n] -> index 0 to 4n
runTest(
    'Simple Split',
    [createNode('2n'), createNode('2n')],
    0, '4n',
    '4n, 4n, 2n' // The fill 4n is usually a rest, but for string check we just check duration
);

// Case 4: Overflow / Clamp (Last 1/4 -> 1/1) - Should stay 1/4 (because 1n doesn't fit, 2n doesn't fit, 4n fits)
// [4n, 4n, 4n, 4n] -> index 3 to 1n
runTest(
    'Overflow Clamp (Max)',
    [createNode('4n'), createNode('4n'), createNode('4n'), createNode('4n')],
    3, '1n',
    '4n, 4n, 4n, 4n'
);

// Case 5: Partial Clamp (Middle)
// [4n, 4n, 4n, 4n] -> index 2 to 1n (Whole). 
// Remaining from index 2 is 4n+4n = 2 beats (Half note).
// Request 1n (4 beats). 
// Should clamp to 2n.
// Result should be [4n, 4n, 2n]
runTest(
    'Partial Clamp',
    [createNode('4n'), createNode('4n'), createNode('4n'), createNode('4n')],
    2, '1n',
    '4n, 4n, 2n'
);

