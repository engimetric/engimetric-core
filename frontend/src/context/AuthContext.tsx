'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextProps {
    user: unknown;
    teams: { id: number; name: string }[];
    login: (credentials: { email: string; password: string }) => Promise<void>;
    selectTeam: (teamId: number) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextProps | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState(null);
    const [teams, setTeams] = useState([]);
    const [, setSelectedTeam] = useState<number | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchUser();
    }, []);

    /**
     * Fetch authenticated user from backend via cookie
     */
    const fetchUser = async () => {
        try {
            const response = await fetch('http://localhost:1050/api/auth/me', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Ensure cookies are included
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
                setSelectedTeam(data.team?.id || null);
            } else {
                setUser(null);
                setSelectedTeam(null);
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
        }
    };

    /**
     * Login the user and retrieve teams
     */
    const login = async (credentials: { email: string; password: string }) => {
        const response = await fetch('http://localhost:1050/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // Ensure cookies are included
            body: JSON.stringify(credentials),
        });

        const data = await response.json();

        if (response.ok) {
            setUser({ email: data?.email });
            setTeams(data.teams);
        } else {
            throw new Error(data.message || 'Failed to login');
        }
    };

    /**
     * Select a team and store it in the session via cookie
     */
    const selectTeam = async (teamId: number) => {
        const response = await fetch('http://localhost:1050/api/auth/select-team', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // Ensure cookies are included
            body: JSON.stringify({ teamId }),
        });

        const data = await response.json();

        if (response.ok) {
            setSelectedTeam(teamId);
            console.log('Redirecting to dashboard');
            router.push(`/dashboard`);
        } else {
            console.log();
            throw new Error(data.message || 'Failed to select team');
        }
    };

    /**
     * Logout and clear cookies
     */
    const logout = async () => {
        await fetch('http://localhost:1050/api/auth/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // Ensure cookies are included
        });

        setUser(null);
        setTeams([]);
        setSelectedTeam(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, teams, login, selectTeam, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
