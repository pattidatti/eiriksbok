import React, { useState } from 'react';
import { X, Share2, Download, Trash2, Edit3, Check, Copy } from 'lucide-react';
import html2canvas from 'html2canvas';
import { motion, AnimatePresence } from 'framer-motion';

interface CompositionSettingsProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    onRename: (newTitle: string) => void;
    onDelete: () => void;
    shareUrl: string;
    isCreator: boolean;
}

export const CompositionSettings: React.FC<CompositionSettingsProps> = ({
    isOpen,
    onClose,
    title,
    onRename,
    onDelete,
    shareUrl,
    isCreator
}) => {
    const [tempTitle, setTempTitle] = useState(title);
    const [copied, setCopied] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleDownloadPng = async () => {
        const toolElement = document.getElementById('composition-tool-content');
        if (!toolElement) return;

        const canvas = await html2canvas(toolElement, {
            scale: 2,
            backgroundColor: '#FDFBF7',
            logging: false,
            useCORS: true
        });

        const link = document.createElement('a');
        link.download = `${title.replace(/\s+/g, '_')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

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
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-100">
                        <h3 className="text-xl font-serif font-black text-slate-900 tracking-tighter">Innstillinger</h3>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <X size={20} className="text-slate-500" />
                        </button>
                    </div>

                    <div className="p-6 space-y-8">
                        {/* Title Edit */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Sangtittel</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={tempTitle}
                                    onChange={(e) => setTempTitle(e.target.value)}
                                    disabled={!isCreator}
                                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-serif focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                                />
                                {isCreator && (
                                    <button
                                        onClick={() => onRename(tempTitle)}
                                        className="p-2 bg-slate-900 text-white rounded-xl hover:bg-black transition-colors"
                                    >
                                        <Check size={20} />
                                    </button>
                                )}
                            </div>
                            {!isCreator && <p className="text-[10px] text-slate-400 italic">Du kan ikke endre navn på sanger som er delt med deg.</p>}
                        </div>

                        {/* Sharing */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Del sang</label>
                            <div className="flex gap-2">
                                <div className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 truncate font-mono">
                                    {shareUrl}
                                </div>
                                <button
                                    onClick={copyToClipboard}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-black transition-colors"
                                >
                                    {copied ? <Check size={18} /> : <Copy size={18} />}
                                    <span className="text-xs font-bold uppercase tracking-tighter">{copied ? 'Kopiert' : 'Kopier'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Export */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Eksport</label>
                            <button
                                onClick={handleDownloadPng}
                                className="w-full flex items-center justify-between px-6 py-4 bg-white border border-slate-200 rounded-2xl hover:border-slate-900 hover:shadow-lg transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <Download size={20} />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-sm font-black text-slate-900 tracking-tight">Last ned som bilde (PNG)</div>
                                        <div className="text-[10px] text-slate-400">Perfekt for å lime inn i dokumenter eller dele</div>
                                    </div>
                                </div>
                            </button>
                        </div>

                        {/* Danger Zone */}
                        {isCreator && (
                            <div className="pt-4 border-t border-slate-100">
                                {!showDeleteConfirm ? (
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="w-full flex items-center gap-2 px-4 py-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors font-bold text-xs uppercase tracking-widest"
                                    >
                                        <Trash2 size={16} />
                                        Slett sang for alltid
                                    </button>
                                ) : (
                                    <div className="bg-rose-50 p-4 rounded-2xl space-y-3">
                                        <p className="text-xs font-bold text-rose-900">Er du helt sikker? Dette kan ikke angres.</p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={onDelete}
                                                className="flex-1 py-2 bg-rose-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-700"
                                            >
                                                Ja, slett sangen
                                            </button>
                                            <button
                                                onClick={() => setShowDeleteConfirm(false)}
                                                className="flex-1 py-2 bg-white text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest border border-slate-200 hover:bg-slate-50"
                                            >
                                                Avbryt
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
