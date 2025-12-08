import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { GAME_PATH } from '../utils/pathUtils';

interface GameCanvasProps {
    onPlaceTower?: (x: number, y: number) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ onPlaceTower }) => {
    const { enemies, towers, projectiles } = useGameStore();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!onPlaceTower || !canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Simple scale adjustment if canvas resolution differs from CSS size
        // For now they are the same (800x600 in logical pixels)
        const scaleX = canvasRef.current.width / rect.width;
        const scaleY = canvasRef.current.height / rect.height;

        onPlaceTower(x * scaleX, y * scaleY);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Map (Placeholder)
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Path from Waypoints
        if (GAME_PATH.length > 0) {
            ctx.beginPath();
            ctx.moveTo(GAME_PATH[0].x, GAME_PATH[0].y);
            for (let i = 1; i < GAME_PATH.length; i++) {
                ctx.lineTo(GAME_PATH[i].x, GAME_PATH[i].y);
            }
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 40;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();

            // Draw center line
            ctx.beginPath();
            ctx.moveTo(GAME_PATH[0].x, GAME_PATH[0].y);
            for (let i = 1; i < GAME_PATH.length; i++) {
                ctx.lineTo(GAME_PATH[i].x, GAME_PATH[i].y);
            }
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Draw Towers
        towers.forEach(tower => {
            ctx.fillStyle = 'blue';
            ctx.fillRect(tower.position.x - 15, tower.position.y - 15, 30, 30);
        });

        // Draw Enemies
        enemies.forEach(enemy => {
            ctx.fillStyle = 'red';
            ctx.beginPath();
            ctx.arc(enemy.position.x, enemy.position.y, 10, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw Projectiles
        projectiles.forEach(proj => {
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(proj.position.x, proj.position.y, 3, 0, Math.PI * 2);
            ctx.fill();
        });

    }, [enemies, towers, projectiles]); // Re-draw on state change (might need optimization later)

    return (
        <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="w-full h-full bg-slate-100 rounded-xl shadow-inner border border-slate-300 cursor-crosshair"
            onClick={handleClick}
        />
    );
};
