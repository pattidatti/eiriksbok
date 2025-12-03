import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const UpdatePrompt: React.FC = () => {
    const {
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r: ServiceWorkerRegistration | undefined) {
            console.log('SW Registered:', r);
        },
        onRegisterError(error: any) {
            console.log('SW registration error', error);
        },
    });

    const close = () => {
        setNeedRefresh(false);
    };

    return (
        <AnimatePresence>
            {needRefresh && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white rounded-xl shadow-2xl border border-indigo-100 p-4"
                >
                    <div className="flex items-start gap-4">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                            <RefreshCw className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-800 mb-1">Ny versjon tilgjengelig</h3>
                            <p className="text-sm text-slate-600 mb-3">
                                En ny versjon av Eiriksbok er klar. Oppdater for å få med deg de siste endringene.
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => updateServiceWorker(true)}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                                >
                                    Oppdater nå
                                </button>
                                <button
                                    onClick={close}
                                    className="px-4 py-2 text-slate-500 hover:bg-slate-100 text-sm font-medium rounded-lg transition-colors"
                                >
                                    Senere
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={close}
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
