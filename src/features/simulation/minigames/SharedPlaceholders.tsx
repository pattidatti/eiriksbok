import React, { useState } from 'react';

export const MillingGame: React.FC<{ onComplete: (score: number) => void, speedMultiplier?: number }> = ({ onComplete, speedMultiplier: _speedMultiplier = 1.0 }) => {
    return <div onClick={() => onComplete(1.0)} className="text-white p-10 cursor-pointer">Kverning Placeholder (Klikk)</div>;
};

export const SawingGame: React.FC<{ onComplete: (score: number) => void, speedMultiplier?: number }> = ({ onComplete, speedMultiplier: _speedMultiplier = 1.0 }) => {
    const [_pos, _setPos] = useState(50);
    const [_isFinished, setIsFinished] = useState(false);
    return <div onClick={() => { setIsFinished(true); onComplete(1.0); }} className="p-12 text-center text-white">Sawing Placeholder</div>;
};
