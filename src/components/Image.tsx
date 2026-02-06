import React, { useState, useEffect } from 'react';
import { PlaceholderImage } from './PlaceholderImage';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src?: string;
    alt: string;
    seed?: string; // For placeholder generation if src fails or is missing
    className?: string;
    priority?: boolean;
}

export const Image: React.FC<ImageProps> = ({
    src,
    alt,
    seed,
    className = '',
    priority = false,
    ...props
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(false);
    const [currentSrc, setCurrentSrc] = useState<string | undefined>(src);
    const imgRef = React.useRef<HTMLImageElement>(null);

    useEffect(() => {
        // Reset state when src changes
        setIsLoaded(false);
        setError(false);
        setCurrentSrc(src);
    }, [src]);

    useEffect(() => {
        // Check if image is already loaded (e.g. from cache)
        if (imgRef.current && imgRef.current.complete) {
            if (imgRef.current.naturalWidth > 0) {
                setIsLoaded(true);
            }
        }
    }, [currentSrc]);

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
        <div className={`relative flex items-center justify-center overflow-hidden ${className}`}>
            {/* Blur placeholder (could be a tiny version of image, or just a color/skeleton) */}
            {!isLoaded && (
                <div className="absolute inset-0 bg-white/5 animate-pulse" />
            )}

            <img
                ref={imgRef}
                src={currentSrc}
                alt={alt}
                loading={priority ? 'eager' : 'lazy'}
                {...(priority ? { fetchpriority: 'high' } : {})}
                onLoad={handleLoad}
                onError={handleError}
                className={`max-w-full max-h-full transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className.includes('object-') ? '' : 'object-cover'}`}
                {...props}
            />
        </div>
    );
};
