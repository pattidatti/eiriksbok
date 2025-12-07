import React, { useRef } from 'react';
import type { TextAnalysisSpan, TextAnalysisCategory } from '../../../types';

interface TextHighlighterProps {
    text: string;
    foundSpans: TextAnalysisSpan[];
    categories: TextAnalysisCategory[];
    onSelectionChange: (start: number, end: number, rect: DOMRect | null) => void;
}

export const TextHighlighter: React.FC<TextHighlighterProps> = ({
    text,
    foundSpans,
    categories,
    onSelectionChange
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseUp = () => {
        const selection = window.getSelection();

        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
            onSelectionChange(0, 0, null);
            return;
        }

        const range = selection.getRangeAt(0);

        // Ensure the selection is within our container
        if (containerRef.current && !containerRef.current.contains(range.commonAncestorContainer)) {
            onSelectionChange(0, 0, null);
            return;
        }

        // Calculate absolute start/end indices relative to the text content
        // This is tricky with DOM nodes. We need a robust way to map DOM offset to text offset.
        // For this V1, we will render the text as a sequence of spans to make it easier, 
        // OR we try to calculate offsets. 

        // Simplified approach: reliable offset calculation is hard.
        // Let's use the browser's selection to get the text, find it in the source string.
        // LIMITATION: Repeated strings are ambiguous.
        // BETTER APPROACH: We rely on the fact that we render the text as a single block (mostly).

        // Let's try to find the start relative to the container.
        const preSelectionRange = range.cloneRange();
        preSelectionRange.selectNodeContents(containerRef.current!);
        preSelectionRange.setEnd(range.startContainer, range.startOffset);
        const start = preSelectionRange.toString().length;
        const end = start + selection.toString().length;

        const rect = range.getBoundingClientRect();

        // Adjust rect for scroll if needed, but client rect is usually viewport relative which is what fixed/absolute positioning needs.

        onSelectionChange(start, end, rect);
    };

    // Helper to get category color
    const getCategoryColor = (categoryId: string) => {
        const cat = categories.find(c => c.id === categoryId);
        // Map common tailwind colors to their light background versions for highlighting
        // OR we can use inline styles if we want exact control
        const colorMap: Record<string, string> = {
            'blue-500': 'bg-blue-200 border-blue-400',
            'red-500': 'bg-red-200 border-red-400',
            'green-500': 'bg-green-200 border-green-400',
            'yellow-500': 'bg-yellow-200 border-yellow-400',
            'purple-500': 'bg-purple-200 border-purple-400',
        };
        // Default fallbacks if the user passes 'blue' instead of 'blue-500'
        if (cat?.color.includes('blue')) return 'bg-blue-200 border-blue-400';
        if (cat?.color.includes('red')) return 'bg-red-200 border-red-400';
        if (cat?.color.includes('green')) return 'bg-green-200 border-green-400';
        if (cat?.color.includes('yellow')) return 'bg-yellow-200 border-yellow-400';
        if (cat?.color.includes('amber')) return 'bg-amber-200 border-amber-400';

        return colorMap[cat?.color || ''] || 'bg-gray-200 border-gray-400';
    };

    // Render text with highlights
    // We need to split the text by the found spans and render them differently
    const renderContent = () => {
        // Sort spans by start index
        const sortedSpans = [...foundSpans].sort((a, b) => a.start - b.start);

        const elements: React.ReactNode[] = [];
        let lastIndex = 0;

        sortedSpans.forEach((span) => {
            // Push text before the span
            if (span.start > lastIndex) {
                elements.push(
                    <span key={`text-${lastIndex}`}>
                        {text.slice(lastIndex, span.start)}
                    </span>
                );
            }

            // Push the span itself
            elements.push(
                <span
                    key={`span-${span.id}`}
                    className={`border-b-2 px-1 rounded ${getCategoryColor(span.categoryId)} cursor-help transition-all duration-300`}
                    title={span.explanation}
                >
                    {text.slice(span.start, span.end)}
                </span>
            );

            lastIndex = span.end;
        });

        // Push remaining text
        if (lastIndex < text.length) {
            elements.push(
                <span key={`text-${lastIndex}`}>
                    {text.slice(lastIndex)}
                </span>
            );
        }

        return elements;
    };

    return (
        <div
            ref={containerRef}
            className="text-lg leading-relaxed font-serif p-6 bg-white rounded-lg shadow-sm border border-slate-100 select-text"
            onMouseUp={handleMouseUp}
            onTouchEnd={handleMouseUp} // Basic touch support
        >
            {renderContent()}
        </div>
    );
};
