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

    // Sync from Firebase
    useEffect(() => {
        if (!activeId) return;

        const songRef = ref(db, `compositions/${activeId}`);
        const unsubscribe = onValue(songRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                if (!isLocalChange.current) {
                    setComposition(data);
                }
            } else {
                console.warn('Song data is null, resetting to default.');
                resetToDefault();
            }
            setIsLoading(false);
        }, (err) => {
            setError(err.message);
            setIsLoading(false);
        });

        // Presence logic
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

        isLocalChange.current = true;
        const timeout = setTimeout(async () => {
            const songRef = ref(db, `compositions/${activeId}`);
            try {
                await set(songRef, {
                    ...composition,
                    lastModified: Date.now()
                });
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
        try {
            await remove(ref(db, `compositions/${id}`));
            const currentList = localStorage.getItem(MY_SONGS_KEY);
            console.log('[Delete] Current list before:', currentList);

            const mySongs = JSON.parse(currentList || '[]');
            const newList = mySongs.filter((s: string) => s !== id);
            localStorage.setItem(MY_SONGS_KEY, JSON.stringify(newList));

            console.log('[Delete] New list saved:', newList);
        } catch (error) {
            console.error('Error deleting song:', error);
            throw error;
        }
    };

    return { activeUsers, isLoading, error, saveAsNew, deleteSong };
};
