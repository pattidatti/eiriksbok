import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface LayoutContextType {
    isFullWidth: boolean;
    setFullWidth: (value: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isFullWidth, setFullWidth] = useState(false);

    return (
        <LayoutContext.Provider value={{ isFullWidth, setFullWidth }}>
            {children}
        </LayoutContext.Provider>
    );
};

export const useLayout = () => {
    const context = useContext(LayoutContext);
    if (!context) {
        throw new Error('useLayout must be used within a LayoutProvider');
    }
    return context;
};
