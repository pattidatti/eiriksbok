import React from 'react';

interface GalleryItem {
    image: string;
    caption?: string;
    alt?: string;
}

interface GalleryProps {
    title?: string;
    items: GalleryItem[];
}

export const Gallery: React.FC<GalleryProps> = ({ title, items }) => {
    if (!items || items.length === 0) return null;

    return (
        <div className="my-12">
            {title && (
                <h3 className="text-2xl font-bold text-slate-900 mb-6 tracking-tight relative inline-block">
                    {title}
                    <span className="absolute -bottom-2 left-0 w-1/3 h-1 bg-amber-400 rounded-full" />
                </h3>
            )}

            <div className={`grid grid-cols-1 ${items.length > 1 ? 'md:grid-cols-2' : ''} gap-6`}>
                {items.map((item, index) => (
                    <figure key={index} className="group relative overflow-hidden rounded-xl shadow-md border border-slate-100 bg-white">
                        <div className="w-full overflow-hidden bg-slate-50">
                            <img
                                src={item.image}
                                alt={item.alt || item.caption || 'Gallery image'}
                                className="w-full h-auto block transition-transform duration-700 group-hover:scale-105"
                            />
                        </div>
                        {item.caption && (
                            <figcaption className="p-4 bg-white border-t border-slate-50">
                                <p className="text-slate-600 text-sm leading-relaxed italic">
                                    {item.caption}
                                </p>
                            </figcaption>
                        )}
                    </figure>
                ))}
            </div>
        </div>
    );
};
