import * as React from 'react';

export const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-3 flex items-center gap-2">
        <div className="h-px bg-slate-200 flex-grow"></div>
        {children}
        <div className="h-px bg-slate-200 flex-grow"></div>
    </h3>
);
