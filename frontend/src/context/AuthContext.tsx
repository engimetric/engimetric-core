'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface AuthContextProps {
    user: unknown;
    teams: { id: number; name: string }[];
    login: (credentials: { email: string; password: string }) => Promise<void>;
    selectTeam: (teamId: number) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextProps | null>(null);

interface User {
    email: string;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
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
            const response = await fetch(`${API_BASE_URL}/auth/me/`, {
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
        const response = await fetch(`${API_BASE_URL}/auth/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // Ensure cookies are included
            body: JSON.stringify(credentials),
        });

        const data = await response.json();

        if (response.ok) {
            if (!data?.email) {
                throw new Error('Invalid response from server');
            }
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
        const response = await fetch(`${API_BASE_URL}/auth/select-team`, {
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
        await fetch(`${API_BASE_URL}/auth/logout`, {
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
