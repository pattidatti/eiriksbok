import { useEffect, useRef } from 'react';
import { ref, onDisconnect, set, serverTimestamp } from 'firebase/database';
import { db } from '../lib/firebase';
import { useLocation } from 'react-router-dom';

const ANON_ID_KEY = 'gravity_anon_id';

// Helper to generate a UUID (v4-like)
const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

export const usePresence = () => {
    const location = useLocation();
    const mountedRef = useRef(false);

    useEffect(() => {
        // 1. Get or create persistent Anonymous ID
        let anonId = localStorage.getItem(ANON_ID_KEY);
        if (!anonId) {
            anonId = generateUUID();
            localStorage.setItem(ANON_ID_KEY, anonId);

            // Track as NEW unique user (first time seeing this ID)
            const uniqueUserRef = ref(db, `analytics/unique_users/${anonId}`);
            set(uniqueUserRef, {
                firstSeen: serverTimestamp(),
                lastSeen: serverTimestamp(),
                device: navigator.userAgent
            }).catch(err => console.error("Failed to track unique user", err));
        }

        // 2. Manage "Active Now" Presence
        const presenceRef = ref(db, `analytics/active_users/${anonId}`);

        // Write presence data
        set(presenceRef, {
            path: location.pathname,
            lastActive: serverTimestamp(),
            online: true
        }).catch(err => console.error("Failed to set presence", err));

        // Set up cleanup on disconnect (tab close/network loss)
        onDisconnect(presenceRef).remove();

        // Update heartbeat/path on location change
        // (The 'set' above handles initialization, this ensures updates)
        if (mountedRef.current) {
            set(presenceRef, {
                path: location.pathname,
                lastActive: serverTimestamp(),
                online: true
            });
        }
        mountedRef.current = true;

        // Cleanup on component unmount (manual navigation away, though App.tsx usually stays mounted)
        return () => {
            // Optional: remove immediately on unmount? 
            // Often better to let onDisconnect handle it to avoid flickering on refresh,
            // but for SPA nav it helps to keep "path" updated.
            // We won't remove here to prevent clearing "Active" status on simple re-renders,
            // but rely on onDisconnect for "offline".
        };
    }, [location.pathname]);

    // 3. Update "Last Seen" for Unique User on every session start/nav
    // We can do this throttled or just on mount/location change.
    useEffect(() => {
        const anonId = localStorage.getItem(ANON_ID_KEY);
        if (anonId) {
            const userLastSeenRef = ref(db, `analytics/unique_users/${anonId}/lastSeen`);
            set(userLastSeenRef, serverTimestamp()).catch(() => { });
        }
    }, [location.pathname]);
};
