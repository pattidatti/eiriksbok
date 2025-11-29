import React, { useState, useEffect } from 'react';
import { PlaceholderImage } from './PlaceholderImage';

interface ImageWithFallbackProps {
    src?: string;
    alt: string;
    seed: string;
    className?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ src, alt, seed, className = '' }) => {
    const [error, setError] = useState(false);

    // Reset error state when src changes
    useEffect(() => {
        setError(false);
    }, [src]);

    if (!src || error) {
        return <PlaceholderImage seed={seed} className={className} />;
    }

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            onError={() => setError(true)}
        />
    );
};
