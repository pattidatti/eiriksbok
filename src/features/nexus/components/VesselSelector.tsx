import React, { useState } from 'react';
import { useNexus } from '../NexusContext';
import { Play, Activity, MapPin, Coins } from 'lucide-react';

const VesselCard = ({ vessel, onSelect }: { vessel: any, onSelect: () => void }) => {
    return (
        <div
            onClick={onSelect}
            className="group relative w-72 h-96 bg-black/40 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden cursor-pointer hover:border-indigo-500/50 transition-all duration-500 hover:shadow-[0_0_50px_rgba(99,102,241,0.2)] hover:-translate-y-2"
        >
            {/* Holographic Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-indigo-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Scanline Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.3)_50%)] bg-[size:100%_4px] opacity-20 pointer-events-none" />

            {/* Status Indicator Top */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${vessel.isDead ? 'bg-red-500' : 'bg-emerald-500'} animate-pulse`} />
                <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">
                    {vessel.isDead ? 'Terminert' : 'Aktiv'}
                </span>
            </div>

            {/* Content Wrapper */}
            <div className="absolute inset-0 p-6 flex flex-col justify-end">

                {/* Role Badge */}
                <div className="mb-auto mt-4 transform -translate-x-10 group-hover:translate-x-0 transition-transform duration-500 ease-out">
                    <span className="inline-block px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">
                        {vessel.role}
                    </span>
                </div>

                {/* Name & Identity */}
                <div className="mb-6 space-y-1">
                    <h3 className="text-2xl font-black text-white tracking-tight group-hover:text-indigo-200 transition-colors">
                        {vessel.name}
                    </h3>
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                        <MapPin className="w-3 h-3 text-indigo-400" />
                        {vessel.location}
                    </div>
                </div>

                {/* Grid Stats - Reveals on Hover */}
                <div className="grid grid-cols-2 gap-2 opacity-60 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0 text-xs">
                    <div className="bg-white/5 rounded-lg p-3 border border-white/5 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-slate-400">
                            <Activity className="w-3 h-3" />
                            <span className="text-[9px] uppercase tracking-wider">Helse</span>
                        </div>
                        <span className="font-mono text-emerald-400 font-bold">{vessel.health}%</span>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 border border-white/5 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-slate-400">
                            <Coins className="w-3 h-3 text-amber-400" />
                            <span className="text-[9px] uppercase tracking-wider">Gull</span>
                        </div>
                        <span className="font-mono text-amber-200 font-bold">{vessel.gold}</span>
                    </div>
                </div>

                {/* Action Button - Only visible on hover */}
                <button className="mt-4 w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-xl flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-100 active:scale-95">
                    <Play className="w-3 h-3 fill-current" />
                    Besett Karakter
                </button>
            </div>
        </div>
    );
}

export const VesselSelector = () => {
    const [isCreating, setIsCreating] = useState(false);
    const [newVesselName, setNewVesselName] = useState('');
    const [newVesselRole, setNewVesselRole] = useState('PEASANT');
    const { vessels, selectVessel, createVessel, activeVesselId } = useNexus();

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (newVesselName.trim()) {
            createVessel(newVesselName, newVesselRole);
            setIsCreating(false);
            setNewVesselName('');
        }
    };

    if (activeVesselId) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-1000">
                <div className="text-center space-y-8">
                    <div className="relative w-32 h-32 mx-auto">
                        <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-full animate-ping" />
                        <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 uppercase tracking-tighter animate-pulse">
                            Oppretter Kobling...
                        </h2>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.5em] mt-4">
                            Synkroniserer Sjelsbånd
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto h-full flex flex-col justify-center">
            <div className="text-center mb-12 space-y-2 animate-in fade-in slide-in-from-top-10 duration-700">
                <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 tracking-tighter uppercase">
                    Velg Karakter
                </h1>
                <p className="text-sm font-bold text-indigo-400 uppercase tracking-[0.4em]">
                    Velg din inkarnasjon
                </p>
            </div>

            <div className="flex flex-wrap justify-center gap-8 perspective-[1000px] animate-in fade-in zoom-in-95 duration-1000 delay-200">
                {vessels.map(vessel => (
                    <VesselCard
                        key={vessel.id}
                        vessel={vessel}
                        onSelect={() => selectVessel(vessel.id)}
                    />
                ))}

                {/* New Vessel Creator */}
                {isCreating ? (
                    <div className="relative w-72 h-96 bg-black/60 backdrop-blur-md border border-indigo-500/50 rounded-3xl p-6 flex flex-col animate-in fade-in slide-in-from-bottom-4">
                        <div className="text-center mb-6">
                            <h3 className="text-lg font-black text-white uppercase">Ny Sjel</h3>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Konfigurer Vessel</p>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-4 flex-1 flex flex-col">
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-indigo-300 uppercase tracking-wider">Navn</label>
                                <input
                                    type="text"
                                    value={newVesselName}
                                    onChange={e => setNewVesselName(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none transition-colors font-bold"
                                    placeholder="Navn..."
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-indigo-300 uppercase tracking-wider">Klasse</label>
                                <select
                                    value={newVesselRole}
                                    onChange={e => setNewVesselRole(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none transition-colors font-bold appearance-none cursor-pointer"
                                >
                                    <option value="PEASANT">Bonde (Peasant)</option>
                                    <option value="MERCHANT">Kjøpmann (Merchant)</option>
                                    <option value="SOLDIER">Soldat (Soldier)</option>
                                </select>
                            </div>

                            <div className="mt-auto flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-400 text-[10px] font-black uppercase tracking-wider rounded-xl transition-colors"
                                >
                                    Avbryt
                                </button>
                                <button
                                    type="submit"
                                    disabled={!newVesselName.trim()}
                                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-indigo-600/20"
                                >
                                    Opprett
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="group relative w-72 h-96 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center hover:border-indigo-500/30 hover:bg-white/5 transition-all duration-300"
                    >
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-white/5 group-hover:border-indigo-500/50">
                            <span className="text-4xl text-slate-600 group-hover:text-indigo-400 font-light">+</span>
                        </div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] group-hover:text-indigo-300">
                            Opprett Ny Karakter
                        </span>
                    </button>
                )}
            </div>
        </div>
    );
};
