import React from 'react';
import { useParams } from 'react-router-dom';
import { TimeTravelEngine } from '../components/chronos/TimeTravelEngine';
import { TimeTravelProfileProvider } from '../components/chronos/context/TimeTravelProfileContext';

export const TimeTravelGamePage: React.FC = () => {
    const { scenarioId } = useParams<{ scenarioId: string }>();

    if (!scenarioId) return <div>Scenario ID missing</div>;

    return (
        <TimeTravelProfileProvider>
            <TimeTravelEngine scenarioId={scenarioId} />
        </TimeTravelProfileProvider>
    );
};
