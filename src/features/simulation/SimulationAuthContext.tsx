import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { ref, onValue, set, get } from 'firebase/database';
import { simulationAuth, simulationDb } from './simulationFirebase';
import type { SimulationAccount } from './simulationTypes';

interface AuthContextType {
    user: User | null;
    account: SimulationAccount | null;
    loading: boolean;
}

const SimulationAuthContext = createContext<AuthContextType | undefined>(undefined);

export const SimulationAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [account, setAccount] = useState<SimulationAccount | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(simulationAuth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);

                // Fetch or Initialize Account
                const accountRef = ref(simulationDb, `simulation_accounts/${currentUser.uid}`);
                onValue(accountRef, async (snapshot) => {
                    if (snapshot.exists()) {
                        setAccount(snapshot.val());
                        setLoading(false);
                    } else {
                        // Initialize new account
                        const newAccount: SimulationAccount = {
                            uid: currentUser.uid,
                            displayName: currentUser.displayName || `Eventyrer_${currentUser.uid.slice(0, 4)}`,
                            globalXp: 0,
                            globalLevel: 1,
                            totalGoldEarned: 0,
                            unlockedAchievements: [],
                            characterHistory: [],
                            lastActive: Date.now()
                        };
                        await set(accountRef, newAccount);
                        setAccount(newAccount);
                        setLoading(false);
                    }
                });
            } else {
                // Anonymous sign in if no user
                try {
                    await signInAnonymously(simulationAuth);
                } catch (error) {
                    console.error("Auth failed:", error);
                    setLoading(false);
                }
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <SimulationAuthContext.Provider value={{ user, account, loading }}>
            {children}
        </SimulationAuthContext.Provider>
    );
};

export const useSimulationAuth = () => {
    const context = useContext(SimulationAuthContext);
    if (!context) {
        throw new Error('useSimulationAuth must be used within a SimulationAuthProvider');
    }
    return context;
};
