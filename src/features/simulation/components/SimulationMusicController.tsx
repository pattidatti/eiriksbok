import React, { useEffect } from 'react';
import { useAudio } from '../SimulationAudioContext';

export const SimulationMusicController: React.FC = () => {
    const { startPlaylist } = useAudio();

    useEffect(() => {
        // Start the background music playlist when the simulation environment is loaded
        startPlaylist();
    }, [startPlaylist]);

    return null;
};
