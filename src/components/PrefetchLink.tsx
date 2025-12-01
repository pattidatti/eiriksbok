import React from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { routeFactories } from '../routes';

interface PrefetchLinkProps extends LinkProps {
    prefetchTarget?: keyof typeof routeFactories;
}

export const PrefetchLink: React.FC<PrefetchLinkProps> = ({
    prefetchTarget,
    onMouseEnter,
    onMouseLeave,
    ...props
}) => {
    const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
        // Debounce prefetching to avoid stuttering on quick hovers
        timeoutRef.current = setTimeout(() => {
            if (prefetchTarget && routeFactories[prefetchTarget]) {
                routeFactories[prefetchTarget]();
            }
        }, 200); // 200ms delay

        if (onMouseEnter) {
            onMouseEnter(e);
        }
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (onMouseLeave) {
            onMouseLeave(e);
        }
    };

    return (
        <Link
            {...props}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        />
    );
};
