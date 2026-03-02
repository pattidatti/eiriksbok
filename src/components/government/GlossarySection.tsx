import * as React from 'react';
import {
    SparklesIcon,
    GlobeAmericasIcon,
    BanknotesIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';
import { definitions } from '../../data/governmentData';

interface GlossarySectionProps {
    searchQuery: string;
    setSearchQuery: (val: string) => void;
}

export const GlossarySection: React.FC<GlossarySectionProps> = ({ searchQuery, setSearchQuery }) => {
    return (
        <div className="space-y-16">

            {/* Søkefelt */}
            <div className="max-w-md mx-auto relative">
                <input
                    type="text"
                    placeholder="Søk etter begrep..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-3 px-5 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
                />
                <div className="absolute right-4 top-3.5 text-slate-400">
                    <SparklesIcon className="h-5 w-5" />
                </div>
            </div>

            {/* Seksjon: Styringsformer */}
            <div>
                <div className="flex items-center mb-8 gap-4 border-b border-slate-200 pb-4">
                    <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                        <GlobeAmericasIcon className="h-8 w-8" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">Styringsformer</h2>
                        <p className="text-slate-500">Hvordan makt organiseres i en stat</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {definitions
                        .filter(d => d.category === 'Styringsform')
                        .filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((gov) => (
                            <div key={gov.id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-indigo-300 hover:shadow-lg transition-all group relative overflow-hidden">
                                <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
                                    <gov.icon className={`h-32 w-32 ${gov.color}`} />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`p-2 rounded-lg bg-slate-50`}>
                                            <gov.icon className={`h-6 w-6 ${gov.color}`} />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900">{gov.title}</h3>
                                    </div>
                                    <p className="text-slate-600 text-sm leading-relaxed mb-4 min-h-[40px]">{gov.description}</p>
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        <p className="text-slate-500 text-xs italic">{gov.details}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </div>

            {/* Seksjon: Økonomi */}
            <div>
                <div className="flex items-center mb-8 gap-4 border-b border-slate-200 pb-4">
                    <div className="p-3 bg-green-50 rounded-xl text-green-600">
                        <BanknotesIcon className="h-8 w-8" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">Økonomiske Systemer</h2>
                        <p className="text-slate-500">Hvordan ressurser fordeles</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {definitions
                        .filter(d => d.category === 'Økonomi')
                        .filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((eco) => (
                            <div key={eco.id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-green-300 hover:shadow-lg transition-all">
                                <h3 className={`text-xl font-bold mb-3 ${eco.color}`}>{eco.title}</h3>
                                <p className="text-slate-900 text-sm mb-3">{eco.description}</p>
                                <p className="text-slate-500 text-xs leading-relaxed">{eco.details}</p>
                            </div>
                        ))}
                </div>
            </div>

            {/* Seksjon: Andre Begreper */}
            <div>
                <div className="flex items-center mb-8 gap-4 border-b border-slate-200 pb-4">
                    <div className="p-3 bg-slate-100 rounded-xl text-slate-600">
                        <InformationCircleIcon className="h-8 w-8" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">Viktige Begreper</h2>
                        <p className="text-slate-500">Nøkkelord for å forstå politikk</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {definitions
                        .filter(d => d.category === 'Begrep')
                        .filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((term) => (
                            <div key={term.id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:bg-slate-50 transition-colors shadow-sm">
                                <h3 className="text-lg font-bold text-slate-900 mb-2">{term.title}</h3>
                                <p className="text-slate-600 text-sm mb-2">{term.description}</p>
                                <p className="text-slate-500 text-xs">{term.details}</p>
                            </div>
                        ))}
                </div>
            </div>

        </div>
    );
};
