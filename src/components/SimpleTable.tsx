import React from 'react';

interface SimpleTableProps {
    columns: string[];
    rows: string[][];
    title?: string;
}

export const SimpleTable: React.FC<SimpleTableProps> = ({ columns, rows, title }) => {
    return (
        <div className="my-8 overflow-hidden rounded-xl border border-slate-200 shadow-sm">
            {title && (
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                    <h4 className="font-bold text-slate-800">{title}</h4>
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-200">
                            {columns.map((col, i) => (
                                <th key={i} className="px-6 py-4 font-bold text-slate-700 uppercase tracking-wider text-xs">
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {rows.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-slate-50/30 transition-colors">
                                {row.map((cell, cellIndex) => (
                                    <td key={cellIndex} className="px-6 py-4 text-slate-600 leading-relaxed font-medium">
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
