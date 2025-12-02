import React, { useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { Slider } from '../ui/Slider';

interface TimelineSliderProps {
    year: number;
    setYear: React.Dispatch<React.SetStateAction<number>>;
    minYear: number;
    maxYear: number;
}

const TimelineSlider: React.FC<TimelineSliderProps> = ({ year, setYear, minYear, maxYear }) => {
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isPlaying) {
            interval = setInterval(() => {
                setYear((prevYear) => {
                    if (prevYear >= maxYear) {
                        setIsPlaying(false);
                        return maxYear;
                    }
                    return prevYear + 1;
                });
            }, 200); // Adjust speed as needed
        }
        return () => clearInterval(interval);
    }, [isPlaying, maxYear, setYear]);

    return (
        <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-md w-full max-w-3xl mx-auto mt-4">
            <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>

            <div className="flex-1 flex flex-col">
                <div className="flex justify-between text-sm font-medium text-gray-600 mb-1">
                    <span>{minYear}</span>
                    <span className="text-xl font-bold text-blue-800">{year}</span>
                    <span>{maxYear}</span>
                </div>
                <Slider
                    min={minYear}
                    max={maxYear}
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    color="blue"
                />
            </div>
        </div>
    );
};

export default TimelineSlider;
