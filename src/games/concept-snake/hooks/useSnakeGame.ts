
import { useState, useEffect, useCallback, useRef } from 'react';
import type { Direction, GameStatus, SnakeSegment, FoodItem, ConceptLevel } from '../types';
import { levels } from '../data/conceptData';

const GRID_WIDTH = 20; // Reduced from 25 to make cells bigger
const GRID_HEIGHT = 12; // Reduced from 15
const INITIAL_SNAKE = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }];
const INITIAL_SPEED = 220; // Slower start (was 150)
const SPEED_INCREMENT = 5; // Faster scale up since we start slower

export const useSnakeGame = () => {
    // State
    const [level, setLevel] = useState<ConceptLevel>(levels[0]);
    const [snake, setSnake] = useState<SnakeSegment[]>(INITIAL_SNAKE);
    const [direction, setDirection] = useState<Direction>('RIGHT');
    const [status, setStatus] = useState<GameStatus>('MENU');
    const [score, setScore] = useState(0);
    const [wallsEnabled, setWallsEnabled] = useState(true);
     
    const [foodItems, setFoodItems] = useState<FoodItem[]>([]);

    // Refs
    const snakeRef = useRef(snake);
    const directionRef = useRef(direction);
    const speedRef = useRef(INITIAL_SPEED);
    const gameLoopRef = useRef<number | null>(null);
    const foodItemsRef = useRef(foodItems);
    const levelRef = useRef(level);
    const wallsEnabledRef = useRef(wallsEnabled);

    // Sync refs
    useEffect(() => { snakeRef.current = snake; }, [snake]);
    useEffect(() => { directionRef.current = direction; }, [direction]);
    useEffect(() => { foodItemsRef.current = foodItems; }, [foodItems]);
    useEffect(() => { levelRef.current = level; }, [level]);
    useEffect(() => { wallsEnabledRef.current = wallsEnabled; }, [wallsEnabled]);

    const spawnFood = useCallback(() => {
        const currentSnake = snakeRef.current;
        const currentFood = foodItemsRef.current;
        const currentLevel = levelRef.current;

        // Try X times to find a valid position
        for (let i = 0; i < 10; i++) {
            const x = Math.floor(Math.random() * GRID_WIDTH);
            const y = Math.floor(Math.random() * GRID_HEIGHT);

            // Check collision with snake
            if (currentSnake.some(s => s.x === x && s.y === y)) continue;
            // Check collision with existing food
            if (currentFood.some(f => f.position.x === x && f.position.y === y)) continue;

            // Determine type (ensure we don't have too many wrong ones? Random for now)
            // 60% Chance of Correct food if none exists, else 50/50
            const hasCorrect = currentFood.some(f => f.type === 'CORRECT');
            const isCorrect = hasCorrect ? Math.random() > 0.4 : true;

            const textList = isCorrect ? currentLevel.correctExamples : currentLevel.wrongExamples;
            const text = textList[Math.floor(Math.random() * textList.length)];
            const type = isCorrect ? 'CORRECT' : 'WRONG';

            const newFood: FoodItem = {
                id: Math.random().toString(36).substr(2, 9),
                position: { x, y },
                text,
                type
            };

            setFoodItems(prev => [...prev, newFood]);
            return;
        }
    }, []);

    const startGame = useCallback(() => {
        setSnake(INITIAL_SNAKE);
        setDirection('RIGHT');
        setScore(0);
        setStatus('PLAYING');
        setFoodItems([]);
        speedRef.current = INITIAL_SPEED;
        // Spawn initial food
        setTimeout(() => spawnFood(), 100);
        setTimeout(() => spawnFood(), 200);
    }, [spawnFood]);

    const stopGame = useCallback(() => {
        setStatus('GAME_OVER');
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }, []);

    const moveSnake = useCallback(() => {
        const currentHead = snakeRef.current[0];
        const currentDir = directionRef.current;
        const currentWalls = wallsEnabledRef.current; // New Ref needed

        const newHead = { ...currentHead };

        switch (currentDir) {
            case 'UP': newHead.y -= 1; break;
            case 'DOWN': newHead.y += 1; break;
            case 'LEFT': newHead.x -= 1; break;
            case 'RIGHT': newHead.x += 1; break;
        }

        // Check Wall Collision / Wrap Logic
        if (newHead.x < 0 || newHead.x >= GRID_WIDTH || newHead.y < 0 || newHead.y >= GRID_HEIGHT) {
            if (currentWalls) {
                stopGame();
                return;
            } else {
                // Wrap around
                if (newHead.x < 0) newHead.x = GRID_WIDTH - 1;
                if (newHead.x >= GRID_WIDTH) newHead.x = 0;
                if (newHead.y < 0) newHead.y = GRID_HEIGHT - 1;
                if (newHead.y >= GRID_HEIGHT) newHead.y = 0;
            }
        }

        // Check Self Collision
        if (snakeRef.current.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
            stopGame();
            return;
        }

        // Check Food Collision
        const eatenFoodIndex = foodItemsRef.current.findIndex(f => f.position.x === newHead.x && f.position.y === newHead.y);
        let grew = false;

        if (eatenFoodIndex !== -1) {
            const food = foodItemsRef.current[eatenFoodIndex];

            if (food.type === 'CORRECT') {
                // Good job!
                setScore(s => s + 100);
                speedRef.current = Math.max(50, speedRef.current - SPEED_INCREMENT);
                grew = true;
                // Remove food and spawn new
                setFoodItems(prev => prev.filter((_, i) => i !== eatenFoodIndex));
                spawnFood();
            } else {
                // Bad!
                setScore(s => Math.max(0, s - 50));
                // Maybe some visual feedback later?
                // For now, just remove food, don't grow
                setFoodItems(prev => prev.filter((_, i) => i !== eatenFoodIndex));
                spawnFood(); // Spawn replacement
            }
        }

        // Logic for moving
        const newSnake = [newHead, ...snakeRef.current];
        if (!grew) {
            newSnake.pop(); // Remove tail if we didn't grow
        }
        setSnake(newSnake);

        // Maintain food population (max 3 items)
        if (foodItemsRef.current.length < 3 && Math.random() < 0.05) {
            spawnFood();
        }

    }, [stopGame, spawnFood]);

    // Input handling
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (status !== 'PLAYING') return;

            const current = directionRef.current;
            switch (e.key) {
                case 'ArrowUp':
                    if (current !== 'DOWN') setDirection('UP');
                    break;
                case 'ArrowDown':
                    if (current !== 'UP') setDirection('DOWN');
                    break;
                case 'ArrowLeft':
                    if (current !== 'RIGHT') setDirection('LEFT');
                    break;
                case 'ArrowRight':
                    if (current !== 'LEFT') setDirection('RIGHT');
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [status]);

    // Game Loop
    useEffect(() => {
        if (status === 'PLAYING') {
            // Clear any existing interval before setting a new one
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
            gameLoopRef.current = window.setInterval(moveSnake, speedRef.current);
        } else {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        }

        return () => {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        };
    }, [status, moveSnake]);

    const setCategory = useCallback((levelId: string) => {
        const found = levels.find(l => l.id === levelId);
        if (found) setLevel(found);
    }, []);

    const goToMenu = useCallback(() => {
        setStatus('MENU');
        setSnake(INITIAL_SNAKE); // Optional: Reset snake visual
        setScore(0);
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }, []);

    return {
        snake,
        direction,
        status,
        score,
        foodItems,
        level,
        gridSize: { width: GRID_WIDTH, height: GRID_HEIGHT },
        startGame,
        stopGame,
        goToMenu,
        setCategory,
        wallsEnabled,
        setWallsEnabled
    };
};

