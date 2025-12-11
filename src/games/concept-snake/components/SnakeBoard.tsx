import React, { useMemo } from 'react';
import type { SnakeSegment, FoodItem } from '../types';
import clsx from 'clsx'; // Assuming clsx is available or use template literals

interface SnakeBoardProps {
    width: number;
    height: number;
    snake: SnakeSegment[];
    foodItems: FoodItem[];
}

export const SnakeBoard: React.FC<SnakeBoardProps> = ({ width, height, snake, foodItems }) => {

    // Create a 1D array of cells for easier rendering in a CSS grid
    const cells = useMemo(() => {
        const grid = [];
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                grid.push({ x, y });
            }
        }
        return grid;
    }, [width, height]);

    return (
        <div
            className="grid gap-1 bg-gray-900 p-2 rounded-xl shadow-2xl border-4 border-gray-700 relative"
            style={{
                gridTemplateColumns: `repeat(${width}, 1fr)`,
                // Fit within viewport constraints while maintaining aspect ratio
                width: '100%',
                height: 'auto',
                maxWidth: '95vw',
                maxHeight: '75vh', // Ensure it doesn't overflow vertically
                aspectRatio: `${width}/${height}`,
                margin: '0 auto' // Center if width shrinks
            }}
        >
            {cells.map((cell) => {
                const isSnakeHead = snake[0].x === cell.x && snake[0].y === cell.y;
                const isSnakeBody = snake.some((s, i) => i !== 0 && s.x === cell.x && s.y === cell.y);
                const food = foodItems.find(f => f.position.x === cell.x && f.position.y === cell.y);

                return (
                    <div
                        key={`${cell.x}-${cell.y}`}
                        className={clsx(
                            "rounded-sm relative flex items-center justify-center transition-all duration-100",
                            {
                                'bg-green-500 z-10 rounded-md': isSnakeHead,
                                'bg-green-700/80': isSnakeBody,
                                'bg-gray-800/30': !isSnakeHead && !isSnakeBody && !food,
                                // Food styles handled below to allow overflow
                            }
                        )}
                    >
                        {food && (
                            <div className={clsx(
                                "absolute z-20 px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap shadow-xl border-2 animate-bounce",
                                {
                                    'bg-blue-600 border-blue-400 text-white': food.type === 'CORRECT',
                                    'bg-red-600 border-red-400 text-white': food.type === 'WRONG'
                                }
                            )}
                                style={{
                                    left: '50%',
                                    top: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    minWidth: 'max-content' // Ensure text fits
                                }}
                            >
                                {food.text}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
