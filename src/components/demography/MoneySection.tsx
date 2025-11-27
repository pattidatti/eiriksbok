import React, { useState, useEffect, useRef } from 'react';
import { ImmersiveCard } from '../ImmersiveCard';

export const MoneySection: React.FC = () => {
    const [tradeMode, setTradeMode] = useState<'barter' | 'money'>('barter');
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const nodes = [
            { id: 'egg', label: 'Egg', color: '#FEF3C7' },
            { id: 'hvete', label: 'Hvete', color: '#DCFCE7' },
            { id: 'melk', label: 'Melk', color: '#DBEAFE' },
            { id: 'ost', label: 'Ost', color: '#FFEDD5' },
            { id: 'sko', label: 'Sko', color: '#F3E8FF' }
        ];

        let animationFrameId: number;

        const resizeCanvas = () => {
            if (canvas.parentElement) {
                canvas.width = canvas.parentElement.clientWidth;
                canvas.height = canvas.parentElement.clientHeight || 400;
            }
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const draw = () => {
            if (!canvas || !ctx) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            const r = Math.min(cx, cy) - 60;

            // Calculate positions
            const positionedNodes = nodes.map((n, i) => {
                const a = (i * 2 * Math.PI / nodes.length) - Math.PI / 2;
                return {
                    ...n,
                    x: cx + Math.cos(a) * r,
                    y: cy + Math.sin(a) * r
                };
            });

            if (tradeMode === 'barter') {
                ctx.beginPath();
                for (let i = 0; i < positionedNodes.length; i++) {
                    let next = positionedNodes[(i + 1) % positionedNodes.length];
                    ctx.moveTo(positionedNodes[i].x, positionedNodes[i].y);
                    ctx.lineTo(next.x, next.y);
                }
                ctx.strokeStyle = '#cbd5e1';
                ctx.lineWidth = 3;
                ctx.stroke();
            } else {
                positionedNodes.forEach(n => {
                    ctx.beginPath();
                    ctx.moveTo(n.x, n.y);
                    ctx.lineTo(cx, cy);
                    ctx.strokeStyle = '#22c55e';
                    ctx.lineWidth = 4;
                    ctx.stroke();
                });
                ctx.beginPath();
                ctx.arc(cx, cy, 35, 0, 2 * Math.PI);
                ctx.fillStyle = '#f59e0b';
                ctx.fill();
                ctx.fillStyle = 'white';
                ctx.font = '30px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('$', cx, cy);
            }

            positionedNodes.forEach(n => {
                ctx.beginPath();
                ctx.arc(n.x, n.y, 30, 0, 2 * Math.PI);
                ctx.fillStyle = n.color;
                ctx.fill();
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 4;
                ctx.stroke();
                ctx.fillStyle = '#1e293b';
                ctx.font = 'bold 12px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(n.label, n.x, n.y);
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, [tradeMode]);

    return (
        <ImmersiveCard className="mb-16 border-t-4 border-t-blue-500">
            <div className="p-4 md:p-8">
                <h2 className="text-3xl font-display text-text-main mb-2">3. Hvorfor bruker vi penger?</h2>
                <p className="text-text-muted text-lg mb-8">Penger løser problemet med "Sammenfallende behov" (Coincidence of Wants).</p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="bg-gray-900 rounded-2xl p-1 shadow-inner h-[400px] relative">
                            <canvas ref={canvasRef} className="rounded-xl w-full h-full bg-white/5"></canvas>
                        </div>
                    </div>

                    <div className="flex flex-col justify-center space-y-6">
                        <div className="text-text-muted">
                            <p className="mb-3">
                                <strong className="text-text-main">Naturalhandel (Byttehandel):</strong> Hvis du har egg og vil ha sko, må du finne en skomaker som tilfeldigvis vil ha egg akkurat nå. Dette er ineffektivt og kalles problemet med "sammenfallende behov".
                            </p>
                            <p>
                                <strong className="text-text-main">Penger:</strong> Fungerer som et universelt byttemiddel. Skomakeren tar imot penger for skoene, fordi han vet at han kan bruke pengene til å kjøpe hva som helst (også egg) senere. Penger muliggjør spesialisering og sivilisasjon.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <button
                                onClick={() => setTradeMode('barter')}
                                className={`w-full text-left px-6 py-4 rounded-xl border-2 font-bold transition-all ${tradeMode === 'barter' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-glass-bg border-glass-border text-text-muted hover:bg-glass-highlight'}`}
                            >
                                1. Naturalhandel (Ineffektivt)
                            </button>
                            <button
                                onClick={() => setTradeMode('money')}
                                className={`w-full text-left px-6 py-4 rounded-xl border-2 font-bold transition-all ${tradeMode === 'money' ? 'bg-green-600 border-green-400 text-white' : 'bg-glass-bg border-glass-border text-text-muted hover:bg-glass-highlight'}`}
                            >
                                2. Pengesystem (Effektivt)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </ImmersiveCard>
    );
};
