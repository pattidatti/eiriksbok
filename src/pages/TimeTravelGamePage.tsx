import React from 'react';
import { useParams } from 'react-router-dom';
import { TimeTravelEngine } from '../components/chronos/TimeTravelEngine';

export const TimeTravelGamePage: React.FC = () => {
    const { scenarioId } = useParams<{ scenarioId: string }>();

    if (!scenarioId) {
        return <div>Ugyldig scenario ID</div>;
    }

    return (
        <div className="min-h-screen pt-20 pb-12 bg-slate-100">
            <TimeTravelEngine scenarioId={scenarioId} />
        </div>
    );
};
