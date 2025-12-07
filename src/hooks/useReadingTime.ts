import { useEffect, useRef } from 'react';
import { ref, push, serverTimestamp } from 'firebase/database';
import { db } from '../lib/firebase';
import { useLocation } from 'react-router-dom';

export const useReadingTime = () => {
    const location = useLocation();
    const startTimeRef = useRef<number>(Date.now());

    useEffect(() => {
        // Reset start time on path change
        startTimeRef.current = Date.now();
        const currentPath = location.pathname;

        return () => {
            const duration = Date.now() - startTimeRef.current;

            // Only log if duration is meaningful (> 5 seconds) and not unreasonably long (< 4 hours)
            // This filters out accidental clicks and "left tab open overnight"
            if (duration > 5000 && duration < 14400000) {
                // Sanitize path for Firebase key (replace / with _)
                const safePath = currentPath.replace(/[^a-zA-Z0-9-_]/g, '_');

                // We use import() here inside the effect cleanup to avoid potential issues? 
                // Actually standard import is fine, but ensuring db is available.
                // We'll trust the direct import from outside.

                const readingTimeRef = ref(db, `analytics/reading_time/${safePath}`);
                push(readingTimeRef, {
                    duration: duration,
                    timestamp: serverTimestamp(),
                    path: currentPath
                }).catch(err => console.error("Failed to log reading time", err));
            }
        };
    }, [location.pathname]);
};
