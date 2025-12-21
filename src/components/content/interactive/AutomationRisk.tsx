import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Search, Briefcase, Zap, Heart, Brain, AlertCircle } from 'lucide-react';

interface Job {
    title: string;
    risk: number; // 0 to 100
    humanValue: string;
    description: string;
    category: 'Fysisk' | 'Kreativ' | 'Analytisk' | 'Omsorg';
}

const jobs: Job[] = [
    {
        title: "Lagerarbeider",
        risk: 95,
        humanValue: "Lav",
        category: 'Fysisk',
        description: "Repeterende fysiske oppgaver overtas raskt av roboter som ikke blir slitne."
    },
    {
        title: "Sykepleier",
        risk: 15,
        humanValue: "Ekstremt høy",
        category: 'Omsorg',
        description: "Kombinerer empati, kompleks problemløsning og manuell fingerferdighet."
    },
    {
        title: "Regnskapsfører",
        risk: 85,
        humanValue: "Middels",
        category: 'Analytisk',
        description: "Tallknusing og rutinebasert datahåndtering er perfekt for AI."
    },
    {
        title: "Psykolog",
        risk: 5,
        humanValue: "Høy",
        category: 'Omsorg',
        description: "Dyp menneskelig forståelse og emosjonell støtte kan ikke enkelt kodes."
    },
    {
        title: "Programmerer",
        risk: 45,
        humanValue: "Høy",
        category: 'Kreativ',
        description: "AI skriver enkel kode, men arkitektur og kreativ problemløsning krever mennesker."
    },
    {
        title: "Grafisk Designer",
        risk: 35,
        humanValue: "Høy",
        category: 'Kreativ',
        description: "AI-verktøy hjelper, men konseptuell tenkning og smak er fremdeles menneskelig."
    },
    {
        title: "Rørlegger",
        risk: 10,
        humanValue: "Høy",
        category: 'Fysisk',
        description: "Store utfordringer med å lage roboter som kan navigere i uforutsigbare rør og hus."
    }
];

export const AutomationRisk: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xl my-10 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-red-100 rounded-xl text-red-600">
                    <Bot className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-800">Robot-indeksen: Er jobben din trygg?</h3>
                    <p className="text-sm text-slate-500">Se hvordan teknologien påvirker fremtidens arbeidsmarked</p>
                </div>
            </div>

            <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Søk på et yrke..."
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredJobs.map((job) => (
                        <button
                            key={job.title}
                            onClick={() => setSelectedJob(job)}
                            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${selectedJob?.title === job.title ? 'bg-red-50 border-red-200 shadow-md' : 'bg-white border-slate-100 hover:border-slate-300'}`}
                        >
                            <div className="flex items-center gap-3 text-left">
                                {job.category === 'Omsorg' && <Heart className="w-4 h-4 text-pink-500" />}
                                {job.category === 'Kreativ' && <Brain className="w-4 h-4 text-purple-500" />}
                                {job.category === 'Fysisk' && <Briefcase className="w-4 h-4 text-orange-500" />}
                                {job.category === 'Analytisk' && <Zap className="w-4 h-4 text-blue-500" />}
                                <span className="font-bold text-slate-700">{job.title}</span>
                            </div>
                            <div className="text-xs font-bold px-2 py-1 rounded bg-slate-100 text-slate-500">
                                {job.risk}% risk
                            </div>
                        </button>
                    ))}
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col items-center justify-center text-center">
                    <AnimatePresence mode="wait">
                        {selectedJob ? (
                            <motion.div
                                key={selectedJob.title}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="w-full"
                            >
                                <div className="text-4xl font-bold text-slate-800 mb-2">{selectedJob.risk}%</div>
                                <div className="text-sm font-bold text-red-600 uppercase tracking-widest mb-4">Automatiseringsrisiko</div>

                                <div className="h-4 w-full bg-slate-200 rounded-full mb-6 overflow-hidden">
                                    <motion.div
                                        className={`h-full ${selectedJob.risk > 70 ? 'bg-red-500' : selectedJob.risk > 40 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${selectedJob.risk}%` }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                    />
                                </div>

                                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-left mb-4">
                                    <div className="flex items-center gap-2 font-bold text-slate-700 mb-1">
                                        <AlertCircle className="w-4 h-4 text-blue-500" /> Hvorfor?
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed italic">
                                        {selectedJob.description}
                                    </p>
                                </div>

                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-medium">Menneskelig verdi:</span>
                                    <span className="font-bold text-slate-800">{selectedJob.humanValue}</span>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="text-slate-400">
                                <Bot className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p>Velg et yrke for å se detaljert analyse</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
