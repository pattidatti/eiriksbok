import type { ContentBlock } from '../types';

export const cleanMarkdown = (text: string): string => {
    if (!text) return '';
    let cleaned = text;
    cleaned = cleaned.replace(/#{1,6}\s?/g, ''); // Headers
    cleaned = cleaned.replace(/(\*\*|__)(.*?)\1/g, '$2'); // Bold
    cleaned = cleaned.replace(/(\*|_)(.*?)\1/g, '$2'); // Italic
    cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Links
    return cleaned;
};

export const cleanTextForSpeech = (blocks: ContentBlock[]): string => {
    return blocks
        .filter(b => b.type === 'text' && b.content)
        .map(b => cleanMarkdown((b as any).content || ''))
        .join('. ');
};
