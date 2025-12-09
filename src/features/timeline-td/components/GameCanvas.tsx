import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { GAME_PATH } from '../utils/pathUtils';

interface GameCanvasProps {
    onPlaceTower?: (x: number, y: number) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ onPlaceTower }) => {
    const { enemies, towers, projectiles, particles } = useGameStore();
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
            // Color code based on type
            switch (tower.type) {
                case 'GUTENBERG': ctx.fillStyle = '#3b82f6'; break; // Blue
                case 'DA_VINCI': ctx.fillStyle = '#eab308'; break; // Yellow/Gold
                case 'TESLA': ctx.fillStyle = '#6366f1'; break; // Indigo
                case 'NEWTON': ctx.fillStyle = '#22c55e'; break; // Green
                default: ctx.fillStyle = 'blue';
            }

            // Draw Range Circle if recently placed or hovered (skipped for now for perf/simplicity)
            // Just draw square base
            ctx.fillRect(tower.position.x - 15, tower.position.y - 15, 30, 30);

            // Label (First letter)
            ctx.fillStyle = 'white';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(tower.type[0], tower.position.x, tower.position.y + 4);
        });

        // Draw Enemies
        enemies.forEach(enemy => {
            // Flash white if hit recently (within last 100ms)
            const isHit = enemy.lastHit && (Date.now() - enemy.lastHit < 100);

            ctx.beginPath();

            // Visuals based on Type
            if (enemy.type === 'BLACK_DEATH') {
                ctx.fillStyle = isHit ? '#ffffff' : '#22c55e'; // Green
                ctx.moveTo(enemy.position.x, enemy.position.y - 12);
                ctx.lineTo(enemy.position.x + 10, enemy.position.y + 6);
                ctx.lineTo(enemy.position.x - 10, enemy.position.y + 6);
            } else if (enemy.type === 'WAR') {
                ctx.fillStyle = isHit ? '#ffffff' : '#b91c1c'; // Dark Red
                ctx.rect(enemy.position.x - 12, enemy.position.y - 12, 24, 24);
            } else if (enemy.type === 'INFLATION') {
                ctx.fillStyle = isHit ? '#ffffff' : '#a855f7'; // Purple
                ctx.arc(enemy.position.x, enemy.position.y, 16, 0, Math.PI * 2);
            } else {
                // IGNORANCE (Default)
                ctx.fillStyle = isHit ? '#ffffff' : '#64748b'; // Slate 500
                ctx.arc(enemy.position.x, enemy.position.y, 10, 0, Math.PI * 2);
            }
            ctx.fill();

            // Status Effects (Blue Glow for Slow)
            const isSlowed = enemy.activeEffects.some(e => e.type === 'SLOW');
            if (isSlowed) {
                ctx.strokeStyle = '#3b82f6'; // Blue
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            // Health Bar (Simple)
            if (enemy.health < enemy.maxHealth) {
                const healthPct = enemy.health / enemy.maxHealth;
                ctx.fillStyle = 'red';
                ctx.fillRect(enemy.position.x - 10, enemy.position.y - 20, 20, 4);
                ctx.fillStyle = '#22c55e';
                ctx.fillRect(enemy.position.x - 10, enemy.position.y - 20, 20 * healthPct, 4);
            }
        });

        // Draw Projectiles
        projectiles.forEach(proj => {
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(proj.position.x, proj.position.y, 3, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw Particles (Money/Effects)
        particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.font = 'bold 16px Arial';
            ctx.fillText(p.text, p.position.x, p.position.y);
            // Reset Alpha
            ctx.globalAlpha = 1.0;
        });

    }, [enemies, towers, projectiles, particles]);

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
