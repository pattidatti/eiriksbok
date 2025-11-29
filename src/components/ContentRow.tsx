import React, { useRef } from 'react';


interface ContentRowProps {
    title: string;
    children: React.ReactNode;
}

export const ContentRow: React.FC<ContentRowProps> = ({ title, children }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    return (
        <div className="content-row mb-12">
            <h2 className="text-2xl font-bold mb-4 text-text-main font-outfit px-4 md:px-0">
                {title}
            </h2>
            <div
                ref={scrollRef}
                className="flex overflow-x-auto gap-6 pb-8 px-4 md:px-0 snap-x scrollbar-hide"
                style={{ scrollBehavior: 'smooth' }}
            >
                {children}
            </div>
        </div>
    );
};
