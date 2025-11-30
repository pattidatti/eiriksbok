import React, { useState, useEffect } from 'react';
import { PlaceholderImage } from './PlaceholderImage';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src?: string;
    alt: string;
    seed?: string; // For placeholder generation if src fails or is missing
    className?: string;
}

export const Image: React.FC<ImageProps> = ({
    src,
    alt,
    seed,
    className = '',
    ...props
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(false);
    const [currentSrc, setCurrentSrc] = useState<string | undefined>(src);

    useEffect(() => {
        // Reset state when src changes
        setIsLoaded(false);
        setError(false);
        setCurrentSrc(src);
    }, [src]);

    const handleLoad = () => {
        setIsLoaded(true);
    };

    const handleError = () => {
        setError(true);
        setIsLoaded(true); // Stop loading state even if error
    };

    // If no src or error, show placeholder
    if (!currentSrc || error) {
        return (
            <div className={`relative overflow-hidden bg-surface-card ${className}`}>
                <PlaceholderImage seed={seed || alt} className="w-full h-full object-cover" />
            </div>
        );
    }

    return (
        <div className={`relative overflow-hidden bg-surface-card ${className}`}>
            {/* Blur placeholder (could be a tiny version of image, or just a color/skeleton) */}
            {!isLoaded && (
                <div className="absolute inset-0 bg-white/5 animate-pulse" />
            )}

            <img
                src={currentSrc}
                alt={alt}
                loading="lazy"
                onLoad={handleLoad}
                onError={handleError}
                className={`w-full h-full object-cover transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                {...props}
            />
        </div>
    );
};
