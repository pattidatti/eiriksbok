import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, HelpCircle, Clock, Sword, MessageCircle, ArrowRight, Gamepad2, Plane, History, Users, Search } from 'lucide-react';

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
            id: 'persongalleri',
            title: 'Persongalleri',
            description: 'Møt de mest sentrale historiske personene og tenkerne.',
            icon: Users,
            color: 'bg-orange-500',
            link: '/persongalleri'
        },
        {
            id: 'quiz',
            title: 'Quiz',
            description: 'Test kunnskapene dine med en universal quiz.',
            icon: HelpCircle,
            color: 'bg-purple-500',
            link: '/oving/quiz'
        },
        {
            id: 'timeline',
            title: 'Tidslinje',
            description: 'Utforsk historien på tvers av fag og tidsepoker.',
            icon: Clock,
            color: 'bg-amber-500',
            link: '/tidslinje'
        },
        {
            id: 'dungeon',
            title: 'Fangehull-spillet',
            description: 'Utforsk fangehullet og løs oppgaver for å overleve.',
            icon: Sword,
            color: 'bg-red-600',
            link: '/oving/dungeon'
        },
        {
            id: 'rhetoric',
            title: 'Retorikk-spillet',
            description: 'Mestre etos, patos og logos i dette spillet.',
            icon: MessageCircle,
            color: 'bg-blue-500',
            link: '/oving/retorikk'
        },
        {
            id: 'hangman',
            title: 'Hengemann',
            description: 'Gjett ordet før det er for sent!',
            icon: Gamepad2,
            color: 'bg-pink-500',
            link: '/oving/hengemann'
        },
        {
            id: 'chrono-glider',
            title: 'Chrono Glider',
            description: 'Fly gjennom historien og sikt på årstallene.',
            icon: Plane,
            color: 'bg-cyan-500',
            link: '/oving/chrono-glider'
        },
        {
            id: 'chrono',
            title: 'Chrono Cards',
            description: 'Plasser hendelsene i riktig rekkefølge!',
            icon: History,
            color: 'bg-emerald-500',
            link: '/oving/chrono'
        },
        {
            id: 'timeline-td',
            title: 'Tidslinje Forsvar',
            description: 'Forsvar historien mot angrep i dette Tårnforsvar-spillet!',
            icon: Sword, // Reusing Sword or could use Shield if imported
            color: 'bg-rose-500',
            link: '/oving/tidslinje-td'
        },
        {
            id: 'quiz-battle',
            title: 'Quiz Battle',
            description: 'Konkurrer mot andre i sanntid!',
            icon: Gamepad2, // Or Users/Zap if available
            color: 'bg-green-600',
            link: '/quiz-battle'
        },
        {
            id: 'concept-snake',
            title: 'Konsept Slange',
            description: 'Spis deg stor på kunnskap! Finn riktige eksempler.',
            icon: Gamepad2,
            color: 'bg-green-600',
            link: '/oving/konsept-snake'
        },
        {
            id: 'detective',
            title: 'Historisk Detektiv',
            description: 'Løs ekte gåter fra fortiden ved å undersøke kilder.',
            icon: Search,
            color: 'bg-indigo-600',
            link: '/oving/detektiv'
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
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
