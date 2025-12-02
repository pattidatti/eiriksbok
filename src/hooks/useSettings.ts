import { useState, useEffect } from 'react';

const SETTINGS_KEY = 'gravity_user_settings';

interface UserSettings {
    dyslexicMode: boolean;
}

const defaultSettings: UserSettings = {
    dyslexicMode: false,
};

export const useSettings = () => {
    const [settings, setSettings] = useState<UserSettings>(() => {
        try {
            const stored = localStorage.getItem(SETTINGS_KEY);
            return stored ? JSON.parse(stored) : defaultSettings;
        } catch (e) {
            console.error("Failed to parse user settings", e);
            return defaultSettings;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch (e) {
            console.error("Failed to save settings", e);
        }

        // Apply settings to body
        if (settings.dyslexicMode) {
            document.body.classList.add('dyslexia-mode');
        } else {
            document.body.classList.remove('dyslexia-mode');
        }
    }, [settings]);

    const toggleDyslexicMode = () => {
        setSettings(prev => ({ ...prev, dyslexicMode: !prev.dyslexicMode }));
    };

    return {
        settings,
        toggleDyslexicMode
    };
};
