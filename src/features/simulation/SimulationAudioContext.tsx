import React, { createContext, useContext, useState } from 'react';
import { audioManager } from './logic/AudioManager';

interface AudioContextType {
    playSfx: (key: string) => void;
    playMusic: (key: string) => void;
    startPlaylist: () => void;
    stopMusic: () => void;

    sfxVolume: number;
    setSfxVolume: (vol: number) => void;
    musicVolume: number;
    setMusicVolume: (vol: number) => void;
    isMuffled: boolean;
    setMuffled: (muffled: boolean) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const SimulationAudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [sfxVolume, setSfxVolumeState] = useState(audioManager.getSfxVolume());
    const [musicVolume, setMusicVolumeState] = useState(audioManager.getMusicVolume());
    const [isMuffled, setIsMuffledState] = useState(audioManager.isMuffled());

    const setSfxVolume = (vol: number) => {
        audioManager.setSfxVolume(vol);
        setSfxVolumeState(vol);
    };

    const setMusicVolume = (vol: number) => {
        audioManager.setMusicVolume(vol);
        setMusicVolumeState(vol);
    };

    const setMuffled = (muffled: boolean) => {
        audioManager.setMuffled(muffled);
        setIsMuffledState(muffled);
    };

    const playSfx = (key: string) => {
        audioManager.playSfx(key);
    };

    const playMusic = (key: string) => {
        audioManager.playMusic(key);
    };

    const stopMusic = () => {
        audioManager.stopMusic();
    };

    const startPlaylist = () => {
        audioManager.startPlaylist();
    };

    return (
        <AudioContext.Provider value={{
            playSfx,
            playMusic,
            startPlaylist,
            stopMusic,
            sfxVolume,
            setSfxVolume,
            musicVolume,
            setMusicVolume,
            isMuffled,
            setMuffled
        }}>
            {children}
        </AudioContext.Provider>
    );
};

export const useAudio = () => {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error('useAudio must be used within a SimulationAudioProvider');
    }
    return context;
};
