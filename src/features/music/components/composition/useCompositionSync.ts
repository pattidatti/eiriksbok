import { useEffect, useRef, useState } from 'react';
import { ref, onValue, set, onDisconnect, push, serverTimestamp } from 'firebase/database';
import { db } from '../../../../lib/firebase';
import type { Composition } from './types';

const CREATOR_ID_KEY = 'composition_creator_id';
const MY_SONGS_KEY = 'composition_my_songs';

export const getCreatorId = () => {
    let id = localStorage.getItem(CREATOR_ID_KEY);
    if (!id) {
        id = Math.random().toString(36).substring(2, 15);
        localStorage.setItem(CREATOR_ID_KEY, id);
    }
    return id;
};

export const generateShortId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const useCompositionSync = (
    composition: Composition,
    setComposition: (c: Composition) => void,
    activeId: string | null
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
            if (data && !isLocalChange.current) {
                setComposition(data);
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

        return () => clearTimeout(timeout);
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

        return newId;
    };

    const deleteSong = async (id: string) => {
        await set(ref(db, `compositions/${id}`), null);
        const mySongs = JSON.parse(localStorage.getItem(MY_SONGS_KEY) || '[]');
        localStorage.setItem(MY_SONGS_KEY, JSON.stringify(mySongs.filter((s: string) => s !== id)));
    };

    return { activeUsers, isLoading, error, saveAsNew, deleteSong };
};
