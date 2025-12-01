import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, User, Tag } from 'lucide-react';
import { textLibraryData } from '../data/textLibraryData';
import { usePageTitle } from '../hooks/usePageTitle';
import { Tooltip } from '../components/Tooltip';

export const TextReaderPage: React.FC = () => {
    const { textId } = useParams<{ textId: string }>();
    const navigate = useNavigate();

    const textEntry = useMemo(() =>
        textLibraryData.find(t => t.id === textId),
        [textId]);

    usePageTitle(textEntry?.title || 'Les tekst');

    const renderParagraph = (text: string) => {
        if (!textEntry?.definitions) return text;

        let parts: (string | React.ReactNode)[] = [text];

        textEntry.definitions.forEach((def, index) => {
            const newParts: (string | React.ReactNode)[] = [];
            parts.forEach(part => {
                if (typeof part === 'string') {
                    // Create a regex that matches the term case-insensitively and ensures word boundaries
                    // We escape special regex characters in the term just in case
                    const escapedTerm = def.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const regex = new RegExp(`\\b(${escapedTerm})\\b`, 'gi');

                    const split = part.split(regex);

                    for (let i = 0; i < split.length; i++) {
                        if (i % 2 === 1) { // This is a match
                            newParts.push(
                                <Tooltip key={`${index}-${i}`} text={def.definition}>
                                    {split[i]}
                                </Tooltip>
                            );
                        } else {
                            newParts.push(split[i]);
                        }
                    }
                } else {
                    newParts.push(part);
                }
            });
            parts = newParts;
        });

        return parts;
    };

    if (!textEntry) {
        return (
            <div className="max-w-3xl mx-auto px-6 py-12 text-center">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Teksten ble ikke funnet</h2>
                <button
                    onClick={() => navigate('/norsk/bibliotek')}
                    className="text-indigo-600 hover:underline"
                >
                    Tilbake til biblioteket
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            <button
                onClick={() => navigate('/norsk/bibliotek')}
                className="flex items-center text-slate-500 hover:text-slate-900 transition-colors mb-8 group"
            >
                <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                Tilbake til biblioteket
            </button>

            <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-100"
            >
                <header className="mb-12 text-center border-b border-slate-100 pb-12">
                    <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full uppercase tracking-wider mb-4">
                        {textEntry.genre}
                    </span>
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-6">
                        {textEntry.title}
                    </h1>
                    <div className="flex items-center justify-center gap-6 text-slate-600">
                        <button
                            onClick={() => navigate(`/norsk/bibliotek?search=${textEntry.author}`)}
                            className="flex items-center gap-2 hover:text-indigo-600 transition-colors"
                        >
                            <User size={18} />
                            <span className="font-medium">{textEntry.author}</span>
                        </button>
                        {textEntry.publishedYear && (
                            <button
                                onClick={() => {
                                    // Logic to find the correct period label based on the year
                                    let periodLabel = '';
                                    if (textEntry.publishedYear! < 1900) periodLabel = 'Før 1900';
                                    else if (textEntry.publishedYear! <= 1950) periodLabel = '1900 - 1950';
                                    else if (textEntry.publishedYear! <= 2000) periodLabel = '1950 - 2000';
                                    else periodLabel = 'Etter 2000';

                                    navigate(`/norsk/bibliotek?period=${periodLabel}`);
                                }}
                                className="text-sm font-mono bg-slate-100 px-2 py-1 rounded hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
                            >
                                {textEntry.publishedYear}
                            </button>
                        )}
                        {textEntry.language && (
                            <span className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">
                                {textEntry.language}
                            </span>
                        )}
                    </div>
                </header>

                <div className="prose prose-lg prose-slate mx-auto font-serif">
                    {textEntry.content ? (
                        textEntry.content.map((paragraph, index) => (
                            <p key={index} className={`mb-6 leading-relaxed text-slate-800 ${textEntry.genre === 'Dikt' ? 'whitespace-pre-line' : ''}`}>
                                {renderParagraph(paragraph)}
                            </p>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-100 border-dashed">
                            <BookOpen className="mx-auto text-slate-300 mb-4" size={48} />
                            <p className="text-slate-500">Teksten er ikke tilgjengelig digitalt enda.</p>
                            {textEntry.url && (
                                <a
                                    href={textEntry.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    Les teksten eksternt
                                </a>
                            )}
                        </div>
                    )}
                </div>

                {textEntry.reflectionTasks && (
                    <div className="max-w-3xl mx-auto mt-12 mb-8">
                        <details className="group bg-indigo-50/50 rounded-xl border border-indigo-100 overflow-hidden">
                            <summary className="flex items-center justify-between p-6 cursor-pointer list-none text-indigo-900 font-semibold hover:bg-indigo-50 transition-colors">
                                <span className="flex items-center gap-2">
                                    <BookOpen size={20} className="text-indigo-600" />
                                    Refleksjonsoppgaver
                                </span>
                                <span className="transform group-open:rotate-180 transition-transform duration-200">
                                    ▼
                                </span>
                            </summary>
                            <div className="px-6 pb-6 pt-2 text-slate-700">
                                <ol className="list-decimal list-outside ml-5 space-y-4">
                                    {textEntry.reflectionTasks.map((task, index) => (
                                        <li key={index} className="pl-2">
                                            {task}
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </details>
                    </div>
                )}

                {textEntry.theme && (
                    <footer className="mt-16 pt-8 border-t border-slate-100">
                        <div className="flex flex-wrap gap-2 text-slate-500 text-sm">
                            <Tag size={16} />
                            <span className="font-medium">Tema:</span>
                            {textEntry.theme.map(t => (
                                <button
                                    key={t}
                                    onClick={() => navigate(`/norsk/bibliotek?theme=${t}`)}
                                    className="bg-slate-100 px-2 py-1 rounded text-slate-700 hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </footer>
                )}
            </motion.article>
        </div>
    );
};
