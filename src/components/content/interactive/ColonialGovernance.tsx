import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Globe,
    Users,
    Shield,
    TrendingUp,
    History,
    Map,
    type LucideIcon
} from 'lucide-react';

interface GovernanceModel {
    id: string;
    nation: string;
    nationNo: string;
    color: 'indigo' | 'blue' | 'rose';
    icon: LucideIcon;
    ideology: string;
    administration: string;
    economicGoal: string;
    legacy: string;
    description: string;
}

const models: GovernanceModel[] = [
    {
        id: 'uk',
        nation: 'Great Britain',
        nationNo: 'Storbritannia',
        color: 'indigo',
        icon: Shield,
        ideology: 'Indirekte styre (Indirect Rule). Fokus på handel og samarbeid med lokale eliter.',
        administration: 'Lokale høvdinger og konger beholdt ofte formell makt, men sto under britiske "rådgivere". Mindre kulturell assimilering enn franskmennene.',
        economicGoal: 'Åpne markeder, ressursutvinning og kontroll over strategiske handelsveier.',
        legacy: 'Common Law, parlamentariske systemer og det engelske språket som globalt lingua franca.',
        description: 'Britene foretrakk en pragmatisk tilnærming der handelen sto i sentrum, og de styrte ofte gjennom eksisterende maktstrukturer.'
    },
    {
        id: 'france',
        nation: 'France',
        nationNo: 'Frankrike',
        color: 'blue',
        icon: Globe,
        ideology: 'Direkte styre og assimilering. Målet var å gjøre kolonibefolkningen til franske borgere.',
        administration: 'Sentralisert styre fra Paris. Fransk språk, kultur og lovverk ble tvunget på befolkningen.',
        economicGoal: 'Integrere koloniene i den franske økonomien som en forlengelse av moderlandet.',
        legacy: 'Fransk administrasjonsskikk, det franske språket og sterke kulturelle bånd til Paris.',
        description: 'Franskmennene så på sine kolonier som "oversjøiske territorier" og forsøkte å skape en felles fransk identitet.'
    },
    {
        id: 'belgium-spain',
        nation: 'Belgium / Spain',
        nationNo: 'Belgia / Spania',
        color: 'rose',
        icon: TrendingUp,
        ideology: 'Ekstraktivt styre. Fokus på maksimal profitt med minimal investering i lokal infrastruktur.',
        administration: 'Ofte preget av ekstrem sentralisering og brutalitet i ressursutvinningen (f.eks. Kongo-fristaten).',
        economicGoal: 'Rask utvinning av verdifulle råvarer som gummi, gull og sølv.',
        legacy: 'Dype sår i lokalsamfunnene, ofte etterfulgt av ustabilitet og ressurstynget økonomi.',
        description: 'Disse modellene var ofte de mest brutale, der befolkningen ble sett på som ren arbeidskraft for europeisk profitt.'
    }
];

const colorMap: Record<'indigo' | 'blue' | 'rose', { border: string, ring: string, text: string, bg: string, icon: string, lightBg: string }> = {
    indigo: {
        border: 'border-indigo-200',
        ring: 'ring-indigo-100',
        text: 'text-indigo-700',
        bg: 'bg-indigo-600',
        icon: 'text-indigo-600',
        lightBg: 'bg-indigo-50'
    },
    blue: {
        border: 'border-blue-200',
        ring: 'ring-blue-100',
        text: 'text-blue-700',
        bg: 'bg-blue-600',
        icon: 'text-blue-600',
        lightBg: 'bg-blue-50'
    },
    rose: {
        border: 'border-rose-200',
        ring: 'ring-rose-100',
        text: 'text-rose-700',
        bg: 'bg-rose-600',
        icon: 'text-rose-600',
        lightBg: 'bg-rose-50'
    }
};

export const ColonialGovernance: React.FC = () => {
    const [selectedModel, setSelectedModel] = useState<GovernanceModel>(models[0]);

    return (
        <section className="my-12 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 md:p-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-50 rounded-xl">
                        <Map className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Styringsmodeller i koloniene</h2>
                        <p className="text-sm text-slate-500">Klikk på en stormakt for å se detaljer</p>
                    </div>
                </div>

                {/* Main Layout: Stacked for narrow columns, side-by-side only on wider containers */}
                <div className="grid grid-cols-1 gap-8">
                    {/* Navigation: Horizontal tabs for better space usage in narrow columns */}
                    <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-4">
                        {models.map((model) => (
                            <button
                                key={model.id}
                                onClick={() => setSelectedModel(model)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm font-semibold ${selectedModel.id === model.id
                                    ? `${colorMap[model.color].bg} text-white shadow-md`
                                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200/50'
                                    }`}
                            >
                                <model.icon className={`w-4 h-4 ${selectedModel.id === model.id ? 'text-white' : 'text-slate-400'
                                    }`} />
                                {model.nationNo}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="relative min-h-[350px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedModel.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-8"
                            >
                                <div className="max-w-2xl">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider mb-3 ${colorMap[selectedModel.color].lightBg} ${colorMap[selectedModel.color].text}`}>
                                        {selectedModel.nation}
                                    </span>
                                    <p className="text-lg text-slate-800 leading-relaxed font-medium font-display italic">
                                        "{selectedModel.description}"
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10 mt-10">
                                    <InfoCard
                                        icon={Shield}
                                        title="Ideologi"
                                        content={selectedModel.ideology}
                                        colorClass={colorMap[selectedModel.color].icon}
                                    />
                                    <InfoCard
                                        icon={Users}
                                        title="Administrasjon"
                                        content={selectedModel.administration}
                                        colorClass={colorMap[selectedModel.color].icon}
                                    />
                                    <InfoCard
                                        icon={TrendingUp}
                                        title="Økonomisk mål"
                                        content={selectedModel.economicGoal}
                                        colorClass={colorMap[selectedModel.color].icon}
                                    />
                                    <InfoCard
                                        icon={History}
                                        title="Langtidseffekt"
                                        content={selectedModel.legacy}
                                        colorClass={colorMap[selectedModel.color].icon}
                                    />
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Subtle Footer hint */}
            <div className="bg-slate-50 py-3 px-6 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Interaktiv Modell</span>
                <div className="flex gap-1">
                    {models.map(m => (
                        <div key={m.id} className={`w-1.5 h-1.5 rounded-full ${selectedModel.id === m.id ? colorMap[m.color].bg : 'bg-slate-200'}`} />
                    ))}
                </div>
            </div>
        </section>
    );
};

const InfoCard: React.FC<{ icon: LucideIcon, title: string, content: string, colorClass: string }> = ({ icon: Icon, title, content, colorClass }) => (
    <div className="group">
        <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 bg-white border border-slate-100 rounded-lg shadow-sm ${colorClass}`}>
                <Icon className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-400">{title}</span>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed pl-1 transition-colors group-hover:text-slate-900">
            {content}
        </p>
    </div>
);
