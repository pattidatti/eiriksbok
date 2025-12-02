import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, HelpCircle, ArrowRight } from 'lucide-react';


export const PracticePage: React.FC = () => {
    const modules = [
        {
            id: 'flashcards',
            title: 'Flashcards',
            description: 'Øv på viktige fagbegreper med interaktive kort.',
            icon: Brain,
            color: 'bg-indigo-500',
            link: '/oving/flashcards'
        },
        {
            id: 'quiz',
            title: 'Quiz',
            description: 'Test kunnskapene dine med en universal quiz.',
            icon: HelpCircle,
            color: 'bg-purple-500',
            link: '/oving/quiz'
        }
    ];

    return (
        <div className="min-h-screen pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-slate-900">
                        Øving
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Velg en modul for å øve og teste kunnskapene dine.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {modules.map((module) => (
                        <Link
                            key={module.id}
                            to={module.link}
                            className="group relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 overflow-hidden"
                        >
                            <div className={`absolute top-0 right-0 w-32 h-32 ${module.color} opacity-5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110`} />

                            <div className="relative z-10">
                                <div className={`w-14 h-14 ${module.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300`}>
                                    <module.icon className="w-7 h-7" />
                                </div>

                                <h3 className="text-2xl font-display font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                                    {module.title}
                                </h3>

                                <p className="text-slate-600 mb-8 leading-relaxed">
                                    {module.description}
                                </p>

                                <div className="flex items-center text-indigo-600 font-semibold group-hover:translate-x-2 transition-transform">
                                    <span>Start nå</span>
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};
