import { useState, useEffect, useCallback } from 'react';

/**
 * useVersionCheck Hook
 * Periodically checks for a new version of the site by fetching /version.json
 */
export const useVersionCheck = (intervalMs = 60000) => {
    const [needRefresh, setNeedRefresh] = useState(false);
    const [currentVersion, setCurrentVersion] = useState<string | null>(null);

    const checkVersion = useCallback(async () => {
        try {
            // Fetch with cache-busting query param to ensure we get the latest file from server
            const response = await fetch(`/version.json?v=${Date.now()}`, {
                cache: 'no-store'
            });

            if (!response.ok) return;

            const data = await response.json();
            const newVersion = data.version;

            if (currentVersion && newVersion && currentVersion !== newVersion) {
                console.log(`[VersionCheck] New version detected: ${newVersion} (Current: ${currentVersion})`);
                setNeedRefresh(true);
            } else if (!currentVersion && newVersion) {
                setCurrentVersion(newVersion);
            }
        } catch (error) {
            console.error('[VersionCheck] Failed to check version:', error);
        }
    }, [currentVersion]);

    useEffect(() => {
        // Initial check
        checkVersion();

        // Set up periodic check
        const interval = setInterval(checkVersion, intervalMs);
        return () => clearInterval(interval);
    }, [checkVersion, intervalMs]);

    const updateNow = useCallback(() => {
        window.location.reload();
    }, []);

    return {
        needRefresh,
        setNeedRefresh,
        updateNow
    };
};
