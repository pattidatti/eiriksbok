import { useEffect, useRef, useState } from 'react';
import { ref, onValue, set, remove, onDisconnect, push, serverTimestamp } from 'firebase/database';
import { db } from '../../../../lib/firebase';
import type { Composition } from './types';
import { getCreatorId, generateShortId, MY_SONGS_KEY } from './utils';

export const useCompositionSync = (
    composition: Composition,
    setComposition: (c: Composition) => void,
    activeId: string | null,
    resetToDefault: () => void
) => {
    const [activeUsers, setActiveUsers] = useState(0);
    const [isLoading, setIsLoading] = useState(!!activeId);
    const [error, setError] = useState<string | null>(null);
    const isLocalChange = useRef(false);
    const isDeleting = useRef(false);

    // Sync from Firebase
    useEffect(() => {
        if (!activeId) return;

        const songRef = ref(db, `compositions/${activeId}`);
        const unsubscribe = onValue(songRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                if (!isLocalChange.current && !isDeleting.current) {
                    setComposition(data);
                }
            } else {
                console.log('Song data is null, resetting to default.');
                if (!isDeleting.current) {
                    resetToDefault();
                }
            }
            setIsLoading(false);
        }, (err) => {
            setError(err.message);
            setIsLoading(false);
        });

        // ... rest of presence logic ...
        const presenceRef = ref(db, `presence/${activeId}`);
        const userPresenceRef = push(presenceRef);

        onValue(presenceRef, (snapshot) => {
            setActiveUsers(snapshot.size || 0);
        });

        set(userPresenceRef, { active: true, joinedAt: serverTimestamp() });
        onDisconnect(userPresenceRef).remove();

        return () => {
            unsubscribe();
            onDisconnect(userPresenceRef).cancel();
            set(userPresenceRef, null);
        };
    }, [activeId]);

    // Sync to Firebase (debounced)
    useEffect(() => {
        if (!activeId || !composition) return;

        // Prevent saving if the active ID doesn't match the composition ID (during switching)
        if (activeId !== composition.id) return;

        // Prevent saving if we are in the process of deleting
        if (isDeleting.current) return;

        isLocalChange.current = true;
        const timeout = setTimeout(async () => {
            // ... existing save logic ...
            const songRef = ref(db, `compositions/${activeId}`);
            try {
                if (!isDeleting.current) {
                    await set(songRef, {
                        ...composition,
                        lastModified: Date.now()
                    });
                }
            } catch (err) {
                console.error('Failed to sync to Firebase:', err);
            } finally {
                isLocalChange.current = false;
            }
        }, 1000);

        return () => {
            clearTimeout(timeout);
            isLocalChange.current = false;
        };
    }, [composition, activeId]);

    const saveAsNew = async (comp: Composition) => {
        // ... existing saveAsNew logic ...
        const newId = generateShortId();
        const creatorId = getCreatorId();
        const newComp = {
            ...comp,
            id: newId,
            creatorId,
            createdAt: Date.now(),
            lastModified: Date.now()
        };

        await set(ref(db, `compositions/${newId}`), newComp);

        // Add to local library
        const mySongs = JSON.parse(localStorage.getItem(MY_SONGS_KEY) || '[]');
        if (!mySongs.includes(newId)) {
            localStorage.setItem(MY_SONGS_KEY, JSON.stringify([...mySongs, newId]));
        }
        localStorage.removeItem('composition_draft');

        // Optimistic update
        setComposition(newComp);
        return newId;
    };

    const deleteSong = async (id: string) => {
        console.log('[Delete] Starting delete for:', id);
        isDeleting.current = true;
        try {
            // 1. Remove from Firebase
            await remove(ref(db, `compositions/${id}`));

            // ... rest of delete logic ...

            // 2. Remove from Local Storage
            const currentListStr = localStorage.getItem(MY_SONGS_KEY);
            console.log('[Delete] Current list before:', currentListStr);

            const mySongs = JSON.parse(currentListStr || '[]');
            const newList = mySongs.filter((s: string) => s !== id);

            localStorage.setItem(MY_SONGS_KEY, JSON.stringify(newList));

            // 3. Verify Local Storage Update
            const verifyListStr = localStorage.getItem(MY_SONGS_KEY);
            console.log('[Delete] New list saved:', newList);
            console.log('[Delete] Verification read:', verifyListStr);

            if (verifyListStr && verifyListStr.includes(id)) {
                console.error('[Delete] CRITICAL: Song ID still present in localStorage after deletion!');
            }

        } catch (error) {
            console.error('Error deleting song:', error);
            throw error;
        } finally {
            // Reset deleting flag after delay to ensure no pending saves interfere
            setTimeout(() => {
                isDeleting.current = false;
            }, 2000);
        }
    };

    return { activeUsers, isLoading, error, saveAsNew, deleteSong };
};
