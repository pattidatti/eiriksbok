import React from 'react';

interface SimulationActivityProps {
    messages: string[] | Record<string, string>;
}

export const SimulationActivity: React.FC<SimulationActivityProps> = React.memo(({ messages }) => {
    // Handle both sharded objects (Firebase push) and legacy arrays
    const messageList = React.useMemo(() => {
        if (!messages) return [];
        if (Array.isArray(messages)) return messages;
        // If it's an object, convert to sorted array based on push ID keys
        return Object.keys(messages)
            .sort()
            .map(key => (messages as Record<string, string>)[key]);
    }, [messages]);

    return (
        <div className="space-y-6">
            <h2 className="text-4xl font-black text-white tracking-tighter border-b-2 border-white/5 pb-4 flex items-center gap-4">
                <span className="w-10 h-10 bg-rose-500/20 text-rose-500 rounded-xl flex items-center justify-center text-xl">🔔</span>
                Live Hendelser
            </h2>
            <div className="space-y-4">
                {messageList.slice().reverse().map((msg: string, idx: number) => (
                    <div key={idx} className="bg-slate-800/40 border-l-4 border-indigo-500 p-6 rounded-r-3xl animate-in slide-in-from-right-4 duration-500 backdrop-blur-md border border-white/5 shadow-xl">
                        <p className="text-lg font-medium leading-relaxed text-slate-200 antialiased font-serif italic">"{msg}"</p>
                    </div>
                ))}
                {messageList.length === 0 && (
                    <div className="py-20 text-center bg-slate-800/20 rounded-[3rem] border-2 border-dashed border-white/5">
                        <span className="text-6xl block mb-4 opacity-20">📜</span>
                        <p className="text-slate-500 font-bold uppercase tracking-widest">Riket er stille... Ingen hendelser arkivert ennå.</p>
                    </div>
                )}
            </div>
        </div>
    );
});

SimulationActivity.displayName = 'SimulationActivity';
