import React from 'react';
import { NexusProvider } from './NexusContext';
import { NexusLayout } from './components/NexusLayout';
import { VesselSelector } from './components/VesselSelector';

export default function NexusPage() {
    return (
        <NexusProvider>
            <NexusLayout>
                <VesselSelector />
            </NexusLayout>
        </NexusProvider>
    );
}
