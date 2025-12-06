import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Zap } from 'lucide-react';

// Constants
const GRAVITY = 0.8;
const JUMP_FORCE = -20;
const GROUND_Y = 620;
const HERO_SPEED = 6;
// SCROLL_SPEED unused for now, removed
// const SCROLL_SPEED = 5;

const HERO_SIZE = 128;

interface DungeonRunProps {
    subjectId: string;
    topicId: string;
    onExit: () => void;
}

export const DungeonRun: React.FC<DungeonRunProps> = ({ subjectId, topicId, onExit }) => {
    // Suppress unused warning for now by logging or ignored
    useEffect(() => {
        console.log("Loading Dungeon:", subjectId, topicId);
    }, [subjectId, topicId]);

    // Game Loop Ref - Initialize with null
    const requestRef = useRef<number | null>(null);
    const previousTimeRef = useRef<number | null>(null);

    // Input Ref
    const keys = useRef<{ [key: string]: boolean }>({});

    // Hero Ref
    const heroRef = useRef({
        x: 100,
        y: GROUND_Y - HERO_SIZE,
        vx: 0,
        vy: 0,
        facingRight: true,
        state: 'IDLE' as 'IDLE' | 'RUN' | 'ATTACK' | 'JUMP',
        frame: 0,
        frameTimer: 0,
        health: 100,
        maxHealth: 100,
        mana: 50,
        level: 1
    });

    // Background Ref
    const bgRef = useRef({ x: 0 });

    // React State for UI - unused setUiState removed
    const [uiState] = useState({
        hp: 100, maxHp: 100, mana: 50, level: 1
    });

    // Effect: Input Listeners
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Prevent scrolling for game keys
            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
                e.preventDefault();
            }
            keys.current[e.code] = true;
        };
        const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.code] = false; };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    // Game Loop
    const animate = (time: number) => {
        if (previousTimeRef.current !== null) {
            const deltaTime = time - previousTimeRef.current;
            update(deltaTime);
        }
        previousTimeRef.current = time;
        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);


    // --- UPDATE LOGIC ---
    const update = (dt: number) => {
        const hero = heroRef.current;
        const input = keys.current;

        // 1. Movement
        hero.vx = 0;
        if (input['ArrowRight'] || input['KeyD']) {
            hero.vx = HERO_SPEED;
            hero.facingRight = true;
            hero.state = 'RUN';
        } else if (input['ArrowLeft'] || input['KeyA']) {
            hero.vx = -HERO_SPEED;
            hero.facingRight = false;
            hero.state = 'RUN';
        } else {
            hero.state = 'IDLE';
        }

        // Jump Logic
        // Check if on ground (with small tolerance)
        const onGround = hero.y + HERO_SIZE >= GROUND_Y - 1;

        if (input['Space'] && onGround) {
            hero.vy = JUMP_FORCE;
            hero.state = 'JUMP';
        }

        // Apply Physics
        hero.vy += GRAVITY;
        hero.x += hero.vx;
        hero.y += hero.vy;

        // Ground Collision
        if (hero.y + HERO_SIZE > GROUND_Y) {
            hero.y = GROUND_Y - HERO_SIZE; // Snap feet to ground
            hero.vy = 0;
            if (hero.state === 'JUMP') hero.state = 'IDLE';
        }

        // Screen Boundaries & Scrolling
        // Lock hero at center of screen (400px) when moving right
        if (hero.x > 600 && hero.vx > 0) {
            bgRef.current.x -= hero.vx;
            hero.x = 600;
        }
        // Wall Left
        if (hero.x < 50) hero.x = 50;

        // Animation Frame Logic
        hero.frameTimer += dt;
        if (hero.frameTimer > 100) { // 10fps animation speed
            hero.frame++; // Modulo handled in render
            hero.frameTimer = 0;
        }
    };

    // --- RENDER ---
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const heroSpriteRef = useRef<HTMLCanvasElement | null>(null);
    const bgImageRef = useRef<HTMLImageElement>(new Image());

    useEffect(() => {
        // Load BG
        bgImageRef.current.src = '/assets/dungeon/bg.png';

        // Load Hero & Chroma Key
        const rawHero = new Image();
        rawHero.src = '/assets/dungeon/hero.png';
        rawHero.onload = () => {
            const c = document.createElement('canvas');
            c.width = rawHero.width;
            c.height = rawHero.height;
            const ctx = c.getContext('2d');
            if (ctx) {
                ctx.drawImage(rawHero, 0, 0);
                const imageData = ctx.getImageData(0, 0, c.width, c.height);
                const data = imageData.data;
                for (let i = 0; i < data.length; i += 4) {
                    // Chroma Key Magenta #FF00FF
                    if (data[i] > 200 && data[i + 1] < 50 && data[i + 2] > 200) {
                        data[i + 3] = 0; // Alpha 0
                    }
                }
                ctx.putImageData(imageData, 0, 0);
                heroSpriteRef.current = c;
            }
        };
    }, []);

    // Canvas Render Loop
    useEffect(() => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;

        ctx.imageSmoothingEnabled = false;

        const render = () => {
            const h = heroRef.current;

            // Clear
            ctx.clearRect(0, 0, 1280, 720);

            // Draw Background (Parallax)
            const bgX = bgRef.current.x % 1280;
            if (bgImageRef.current.complete) {
                ctx.drawImage(bgImageRef.current, bgX - 1280, 0, 1280, 720);
                ctx.drawImage(bgImageRef.current, bgX, 0, 1280, 720);
                ctx.drawImage(bgImageRef.current, bgX + 1280, 0, 1280, 720);
            } else {
                ctx.fillStyle = '#1e1b4b';
                ctx.fillRect(0, 0, 1280, 720);
            }

            // --- DEBUG VISUALS ---
            // Ground Line (Visual Guide)
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, GROUND_Y);
            ctx.lineTo(1280, GROUND_Y);
            ctx.stroke();

            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.beginPath();
            // Shadow under feet
            ctx.ellipse(h.x + HERO_SIZE / 2, Math.min(h.y + HERO_SIZE, GROUND_Y), 30, 8, 0, 0, Math.PI * 2);
            ctx.fill();

            // Draw Hero Structure
            let row = 0; // IDLE default
            if (h.state === 'RUN') row = 1;

            ctx.save();
            const centerX = h.x + HERO_SIZE / 2;

            // Flip
            if (!h.facingRight) {
                ctx.translate(centerX, h.y);
                ctx.scale(-1, 1);
                ctx.translate(-(centerX), -h.y);
            }

            if (heroSpriteRef.current) {
                // Determine Source Frame dimensions dynamically
                const imgW = heroSpriteRef.current.width;
                const imgH = heroSpriteRef.current.height;

                // Assume 4 frames horizontal
                const numFrames = 4;
                const frameW = imgW / numFrames;

                // If the sprite sheet is just a strip (height approx frameW), ignore "row" calculations
                // If sprite sheet is a grid (height >> frameW), use row
                // For safety, let's assume if height < 96 (so mostly 64px), it's a strip.
                const isStrip = imgH < 96;

                const frameH = isStrip ? imgH : frameW;
                const sy = isStrip ? 0 : row * frameH;
                const sx = (h.frame % numFrames) * frameW;

                ctx.drawImage(
                    heroSpriteRef.current,
                    sx, sy,             // Source X, Y
                    frameW, frameH,     // Source W, H
                    h.x,                // Dest X
                    h.y,                // Dest Y (Top-left)
                    HERO_SIZE, HERO_SIZE // Dest W, H (128x128)
                );

                // Debug Box (Matches Sprite Rect)
                ctx.strokeStyle = 'lime';
                ctx.lineWidth = 1;
                ctx.strokeRect(h.x, h.y, HERO_SIZE, HERO_SIZE);

            } else {
                // Fallback Box
                ctx.fillStyle = h.facingRight ? '#4f46e5' : '#818cf8';
                ctx.fillRect(h.x, h.y, HERO_SIZE, HERO_SIZE);
            }

            ctx.restore();

            // Debug Text
            ctx.fillStyle = 'white';
            ctx.font = '16px monospace';
            ctx.fillText(`GROUND_Y: ${GROUND_Y}`, 20, 30);
            ctx.fillText(`HERO: ${Math.round(h.x)}, ${Math.round(h.y)}`, 20, 50);

            requestAnimationFrame(render);
        };
        render();
    }, []);

    return (
        <div className="relative w-full h-[calc(100vh-64px)] bg-slate-900 flex items-center justify-center overflow-hidden">
            {/* Game Canvas */}
            <canvas
                ref={canvasRef}
                width={1280}
                height={720}
                className="w-full h-full object-contain bg-black shadow-2xl image-pixelated"
            />

            {/* CSS for pixel art scaling */}
            <style>{`
                .image-pixelated {
                    image-rendering: pixelated; 
                }
            `}</style>

            {/* UI Overlay */}
            <div className="absolute top-4 left-4 flex gap-4 pointer-events-none">
                <div className="bg-slate-800/90 p-4 rounded-xl border-2 border-slate-600 text-white w-64 shadow-lg">
                    <div className="flex justify-between items-center mb-1">
                        <span className="font-black text-sm text-slate-300 uppercase tracking-widest">Health</span>
                        <span className="font-mono text-sm">{uiState.hp}/{uiState.maxHp}</span>
                    </div>
                    <div className="h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                        <div className="h-full bg-gradient-to-r from-red-600 to-red-500 w-full" />
                    </div>
                </div>

                <div className="bg-slate-800/90 p-4 rounded-xl border-2 border-slate-600 text-white w-48 shadow-lg">
                    <div className="flex justify-between items-center mb-1">
                        <span className="font-black text-sm text-slate-300 flex items-center gap-2 uppercase tracking-widest"><Zap className="w-4 h-4 text-sky-400 fill-sky-400" /> Mana</span>
                        <span className="font-mono text-sm">{uiState.mana}</span>
                    </div>
                    <div className="h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                        <div className="h-full bg-gradient-to-r from-sky-600 to-sky-400 w-1/2" />
                    </div>
                </div>
            </div>

            {/* Controls Helper */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/50 text-sm font-mono font-bold tracking-widest uppercase bg-black/50 px-6 py-2 rounded-full backdrop-blur-sm pointer-events-none">
                WASD / Arrows to Move • Space to Jump
            </div>

            <button onClick={onExit} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors bg-black/20 hover:bg-black/50 p-3 rounded-full pointer-events-auto">
                <ArrowLeft className="w-8 h-8" />
            </button>
        </div>
    );
};
