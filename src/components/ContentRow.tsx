import React, { useRef } from 'react';
import { Link } from 'react-router-dom';


interface ContentRowProps {
    title: string;
    titleLink?: string;
    children: React.ReactNode;
}

export const ContentRow: React.FC<ContentRowProps> = ({ title, titleLink, children }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [startX, setStartX] = React.useState(0);
    const [scrollLeft, setScrollLeft] = React.useState(0);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 2; // Scroll-fast
        scrollRef.current.scrollLeft = scrollLeft - walk;
    };

    return (
        <div className="content-row mb-12">
            <h2 className="text-2xl font-bold mb-4 text-text-main font-outfit px-4 md:px-0 flex items-center">
                {titleLink ? (
                    <Link to={titleLink} className="hover:text-neon-accent transition-colors flex items-center group">
                        {title}
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-sm">→</span>
                    </Link>
                ) : (
                    title
                )}
            </h2>
            <div
                ref={scrollRef}
                className={`flex overflow-x-auto gap-6 pb-8 px-4 md:px-0 snap-x ${isDragging ? 'cursor-grabbing snap-none' : 'cursor-grab'}`}
                style={{ scrollBehavior: isDragging ? 'auto' : 'smooth' }}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
            >
                {children}
            </div>
        </div>
    );
};
