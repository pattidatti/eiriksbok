import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { GlossaryText } from './GlossaryText';

interface FactBoxProps {
    title?: string;
    content: string;
}

export const FactBox: React.FC<FactBoxProps> = ({ title = 'Visste du at?', content }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Split content by newlines to handle multiple paragraphs/examples
    const lines = content ? content.split('\n') : [];

    return (
        <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl my-8 overflow-hidden transition-all duration-300">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-6 flex items-center justify-between text-left focus:outline-none hover:bg-indigo-100 transition-colors"
                aria-expanded={isOpen}
            >
                <h4 className="text-indigo-700 font-bold text-sm uppercase flex items-center tracking-wider">
                    {title}
                </h4>
                {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-indigo-500" />
                ) : (
                    <ChevronDown className="h-5 w-5 text-indigo-500" />
                )}
            </button>

            {isOpen && (
                <div className="px-6 pb-6 pt-0 animate-fadeIn">
                    <div className="text-slate-700 text-base leading-relaxed italic space-y-2">
                        {lines.map((line, index) => (
                            <p key={index}>
                                {line.split(/(\*\*.*?\*\*|\*[^*]+?\*)/g).map((part, i) => {
                                    if (part.startsWith('**') && part.endsWith('**')) {
                                        return <strong key={i}><GlossaryText content={part.slice(2, -2)} /></strong>;
                                    }
                                    if (part.startsWith('*') && part.endsWith('*')) {
                                        return <em key={i}><GlossaryText content={part.slice(1, -1)} /></em>;
                                    }
                                    return <GlossaryText key={i} content={part} />;
                                })}
                            </p>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
