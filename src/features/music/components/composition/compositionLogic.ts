import { v4 as uuidv4 } from 'uuid';
import type { RhythmNode, NoteDuration } from './types';

export const getDurationBeats = (d: NoteDuration): number => {
    switch (d) {
        case '1n': return 4;
        case '2n': return 2;
        case '4n': return 1;
        case '8n': return 0.5;
        default: return 1;
    }
};

/**
 * Calculates the new nodes for a bar when a specific node's duration is changed.
 * Implements "Smart Clamping":
 * 1. Checks if the requested duration fits in the remaining space of the bar relative to the node.
 * 2. If it fits, it consumes subsequent nodes as needed.
 * 3. If it does NOT fit, it finds the largest standard duration that DOES fit and uses that instead.
 * 4. If nothing fits (should correspond to 0 beats left, which is impossible if replacing an existing node), returns null.
 * 
 * @param currentNodes The current list of nodes in the bar
 * @param nodeIndex The index of the node being changed
 * @param requestedDuration The desired new duration
 * @param isRest Whether the new node should be a rest
 * @returns The new list of nodes, or null if the change is physically impossible even with clamping
 */
export const calculateNewNodes = (
    currentNodes: RhythmNode[],
    nodeIndex: number,
    requestedDuration: NoteDuration,
    isRest: boolean
): RhythmNode[] | null => {
    if (nodeIndex < 0 || nodeIndex >= currentNodes.length) return null;

    const nodes = [...currentNodes];
    const oldNode = nodes[nodeIndex];

    // 1. Calculate available beats starting from this node to the end of the bar
    let availableBeats = 0;
    for (let i = nodeIndex; i < nodes.length; i++) {
        availableBeats += getDurationBeats(nodes[i].duration);
    }

    // 2. Determine the actual duration to use (Clamping Logic)
    let finalDuration = requestedDuration;
    let finalBeats = getDurationBeats(finalDuration);

    if (finalBeats > availableBeats) {
        // Requested duration is too big. Find the largest one that fits.
        const standardDurations: NoteDuration[] = ['1n', '2n', '4n', '8n'];
        const bestFit = standardDurations.find(d => getDurationBeats(d) <= availableBeats);

        if (!bestFit) {
            // Should theoretically not happen if availableBeats > 0, 
            // and since we are replacing an existing node, availableBeats MUST be > 0.
            return null;
        }

        finalDuration = bestFit;
        finalBeats = getDurationBeats(finalDuration);

        // Optimization: If the clamped duration is the same as the OLD duration, 
        // and we aren't changing rest/note type, we could arguably return null or the original list.
        // But let's proceed to allow type changes (Rest <-> Note).
    }

    // 3. Logic to apply the change (Split, Consume, or Replace)
    const oldBeats = getDurationBeats(oldNode.duration);

    let resultingNodes: RhythmNode[] = [];
    let nodesToSkip = 1; // Default: we are replacing the node at nodeIndex

    if (finalBeats < oldBeats) {
        // split logic (same as before)
        // We are replacing a larger node with a smaller one -> fill the gap with rests?
        // Wait, standard behavior usually splits.
        // E.g. 1n -> 2n means [2n, 2n(rest)] usually, or just [2n] and shifts?
        // The original logic tried to split evenly: splitCount = oldBeats / newBeats.
        // If 1n (4) becomes 2n (2), splitCount = 2. Result: [2n, 2n].
        // If 1n (4) becomes 4n (1), splitCount = 4. Result: [4n, 4n, 4n, 4n].
        // This assumes perfect divisibility.

        // Let's stick to the original "fill remainder" logic which is robust.
        resultingNodes = [{
            id: uuidv4(),
            type: isRest ? 'rest' : 'note',
            duration: finalDuration
        }];

        let remainder = oldBeats - finalBeats;
        while (remainder > 0) {
            const durs: NoteDuration[] = ['2n', '4n', '8n'];
            // Find largest that fits in remainder
            const fit = durs.find(d => getDurationBeats(d) <= remainder) || '8n';
            resultingNodes.push({
                id: uuidv4(),
                type: 'rest', // Auto-fill with rests
                duration: fit
            });
            remainder -= getDurationBeats(fit);
        }

    } else if (finalBeats > oldBeats) {
        // Consume logic
        // We need to eat up subsequent nodes until we satisfy 'finalBeats'
        let accumulatedBeats = 0;
        let i = nodeIndex;

        // We verified availableBeats >= finalBeats, so this loop is safe
        while (i < nodes.length && accumulatedBeats < finalBeats) {
            accumulatedBeats += getDurationBeats(nodes[i].duration);
            i++;
        }
        nodesToSkip = i - nodeIndex;

        resultingNodes = [{
            id: uuidv4(),
            type: isRest ? 'rest' : 'note',
            duration: finalDuration
        }];

        // Handle remainder if we consumed slightly too much (e.g. needed 1.5, ate 2)
        if (accumulatedBeats > finalBeats) {
            let remainder = accumulatedBeats - finalBeats;
            while (remainder > 0) {
                const durs: NoteDuration[] = ['2n', '4n', '8n'];
                const fit = durs.find(d => getDurationBeats(d) <= remainder) || '8n';
                resultingNodes.push({
                    id: uuidv4(),
                    type: 'rest',
                    duration: fit
                });
                remainder -= getDurationBeats(fit);
            }
        }
    } else {
        // Exact replace
        resultingNodes = [{
            id: uuidv4(),
            type: isRest ? 'rest' : 'note',
            duration: finalDuration
        }];
    }

    // Apply the splice
    nodes.splice(nodeIndex, nodesToSkip, ...resultingNodes);

    return nodes;
};
