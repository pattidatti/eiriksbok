import React from 'react';
import { Outlet } from 'react-router-dom';
import { SimulationAuthProvider } from './SimulationAuthContext';
import { SimulationProvider } from './SimulationContext';
import { SimulationAudioProvider } from './SimulationAudioContext';

export const SimulationLayout: React.FC = () => {
    return (
        <SimulationAuthProvider>
            <SimulationProvider>
                <SimulationAudioProvider>
                    <Outlet />
                </SimulationAudioProvider>
            </SimulationProvider>
        </SimulationAuthProvider>
    );
};
