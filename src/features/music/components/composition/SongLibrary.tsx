import React, { useEffect, useState } from 'react';
import { db } from '../../../../lib/firebase';
import { ref, get } from 'firebase/database';
import { X, Music, Clock, ChevronRight, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SongLibraryProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (id: string) => void;
    onNew: () => void;
}

export const SongLibrary: React.FC<SongLibraryProps> = ({ isOpen, onClose, onSelect, onNew }) => {
    const [mySongs, setMySongs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isOpen) return;

        const loadSongs = async () => {
            setLoading(true);
            const savedIds = JSON.parse(localStorage.getItem('composition_my_songs') || '[]');
            const fetchedSongs = [];

            for (const id of savedIds) {
                const songRef = ref(db, `compositions/${id}`);
                const snapshot = await get(songRef);
                if (snapshot.exists()) {
                    fetchedSongs.push(snapshot.val());
                }
            }

            setMySongs(fetchedSongs.sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0)));
            setLoading(false);
        };

        loadSongs();
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
                >
                    <div className="flex items-center justify-between p-6 bg-slate-50 border-b border-slate-200">
                        <div>
                            <h3 className="text-2xl font-serif font-black text-slate-900 tracking-tighter">Mine sanger</h3>
                            <p className="text-xs text-slate-500 font-medium">Sanger du har opprettet på denne enheten</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                            <X size={20} className="text-slate-500" />
                        </button>
                    </div>

                    <div className="p-6 max-h-[60vh] overflow-y-auto">
                        <button
                            onClick={() => { onNew(); onClose(); }}
                            className="w-full mb-6 flex items-center gap-3 p-4 bg-emerald-50 border-2 border-dashed border-emerald-200 rounded-2xl text-emerald-700 hover:bg-emerald-100 transition-colors group"
                        >
                            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                                <Plus size={20} />
                            </div>
                            <span className="font-bold uppercase tracking-widest text-xs">Lag en ny sang</span>
                        </button>

                        {loading ? (
                            <div className="py-12 flex flex-col items-center justify-center gap-4 text-slate-300">
                                <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
                                <span className="text-xs font-black uppercase tracking-widest">Laster bibliotek...</span>
                            </div>
                        ) : mySongs.length > 0 ? (
                            <div className="grid gap-3">
                                {mySongs.map((song) => (
                                    <button
                                        key={song.id}
                                        onClick={() => { onSelect(song.id); onClose(); }}
                                        className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-slate-900 hover:shadow-md transition-all group"
                                    >
                                        <div className="flex items-center gap-4 text-left">
                                            <div className="p-3 bg-slate-50 text-slate-900 rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-colors">
                                                <Music size={20} />
                                            </div>
                                            <div>
                                                <div className="font-serif font-black text-slate-900 text-lg tracking-tight -mb-1">{song.title}</div>
                                                <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-tighter pt-1">
                                                    <span className="flex items-center gap-1"><Clock size={10} /> {new Date(song.lastModified || song.createdAt).toLocaleDateString()}</span>
                                                    <span>{song.sections?.length || 0} deler</span>
                                                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">{song.id}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight size={20} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 flex flex-col items-center justify-center gap-4 text-slate-300">
                                <Music size={48} strokeWidth={1} />
                                <div className="text-center">
                                    <div className="font-serif font-black text-slate-400 text-xl tracking-tighter">Tomt bibliotek</div>
                                    <div className="text-[10px] font-bold uppercase tracking-widest mt-1">Du har ikke lagret noen sanger ennå</div>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
