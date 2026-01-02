import React, { useEffect, useState, useRef, useMemo } from 'react';
import type { SimulationPlayer, SimulationRoom, TradeOffer } from '../simulationTypes';
import { Gift, Handshake } from 'lucide-react';

interface SimulationNotificationLayerProps {
    player: SimulationPlayer;
    room: SimulationRoom;
    onAction: (action: any) => void;
}

interface Toast {
    id: string;
    title: string;
    message: string;
    type: 'GIFT' | 'TRADE';
    action?: { label: string, onClick: () => void };
}

export const SimulationNotificationLayer: React.FC<SimulationNotificationLayerProps> = ({ player, room, onAction: _onAction }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    // Refs to track previous state for diffing
    const prevTradesRef = useRef<Record<string, TradeOffer>>({});
    const prevActionLogRef = useRef<number>(0);

    // Normalize messages
    const normalizedMessages = useMemo(() => {
        if (!room.messages) return [];
        if (Array.isArray(room.messages)) return room.messages;
        return Object.values(room.messages).sort((a, b) => a.timestamp - b.timestamp);
    }, [room.messages]);

    // Monitor Trades
    useEffect(() => {
        const currentTrades = room.trades || {};
        const prevTrades = prevTradesRef.current;

        Object.entries(currentTrades).forEach(([id, trade]) => {
            // New active trade where I am the receiver
            if (activeTradeIsNew(id, trade, prevTrades) && trade.receiverId === player.id && trade.status === 'PENDING') {
                // It's a new trade for me!
                addToast({
                    id: `trade-${id}`,
                    title: 'Ny Handelsavtale',
                    message: 'Du har mottatt et nytt tilbud.',
                    type: 'TRADE',
                    action: {
                        label: 'SE AVTALE', onClick: () => {
                            // TODO: Trigger callback to open Trade Modal or navigate
                            // For now just log, user has to go to Profile -> Trade manually or we add a shortcut later
                            console.log("Visual notification only");
                        }
                    }
                });
            }
        });

        prevTradesRef.current = currentTrades;
    }, [room.trades, player.id]);

    // Monitor Messages for Gifts
    useEffect(() => {
        const msgs = normalizedMessages;
        if (msgs.length === 0) return;

        const lastMsg = msgs[msgs.length - 1];

        // Ensure we don't re-toast deeply old messages on refresh, only NEW ones since component load?
        // Actually, on mount prevActionLogRef is 0. So it will toast the last message if it exists.
        // We should init prevActionLogRef to lastMsg.timestamp on mount if we want to ignore history?
        // Yes, to avoid spam on reload.

        if (prevActionLogRef.current === 0 && msgs.length > 0) {
            prevActionLogRef.current = msgs[msgs.length - 1].timestamp;
            return;
        }

        if (lastMsg.timestamp > prevActionLogRef.current) {
            if (lastMsg.content.includes(player.name) && lastMsg.content.includes('Gave')) {
                // Format: "Sender sendte X til Receiver" - very loose check
                if (lastMsg.content.includes(`til ${player.name}`)) {
                    addToast({
                        id: `gift-${lastMsg.timestamp}`,
                        title: 'Gave Mottatt!',
                        message: lastMsg.content,
                        type: 'GIFT'
                    });
                }
            }
            prevActionLogRef.current = lastMsg.timestamp;
        }
    }, [normalizedMessages, player.name]);

    const activeTradeIsNew = (id: string, _trade: TradeOffer, prevTrades: Record<string, TradeOffer>) => {
        return !prevTrades[id];
    };

    const addToast = (toast: Toast) => {
        setToasts(prev => [...prev, toast]);
        setTimeout(() => removeToast(toast.id), 5000);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    if (toasts.length === 0) return null;

    return (
        <div className="absolute top-24 right-8 z-[100] flex flex-col gap-4 pointer-events-none">
            {toasts.map(toast => (
                <div key={toast.id} className="pointer-events-auto bg-slate-900/95 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-2xl flex items-start gap-4 animate-in slide-in-from-right duration-300 w-80">
                    <div className={`p-3 rounded-lg ${toast.type === 'GIFT' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                        {toast.type === 'GIFT' ? <Gift size={24} /> : <Handshake size={24} />}
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-white text-sm">{toast.title}</h4>
                        <p className="text-slate-400 text-xs mt-1 leading-relaxed">{toast.message}</p>
                        {toast.action && (
                            <button className="mt-2 text-xs font-bold text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors" onClick={toast.action.onClick}>
                                {toast.action.label}
                            </button>
                        )}
                    </div>
                    <button onClick={() => removeToast(toast.id)} className="text-slate-600 hover:text-white transition-colors">
                        ✕
                    </button>
                </div>
            ))}
        </div>
    );
};
