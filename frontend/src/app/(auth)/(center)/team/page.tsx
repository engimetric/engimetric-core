'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

type Team = {
    id: number;
    name: string;
    slug: string;
    role: string;
};

export default function TeamPage() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user, selectTeam } = useAuth();
    const router = useRouter();

    // If user is null, we assume they're not logged in -> redirect to /login
    useEffect(() => {
        if (user === null && !loading) {
            router.push('/login');
        }
    }, [user, loading, router]);

    // Fetch the list of teams from the backend
    useEffect(() => {
        const loadTeams = async () => {
            try {
                const response = await fetch('http://localhost:1050/api/team/', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include', // Ensure cookies are included
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'Failed to load teams');
                }

                // The server returns an array of team objects
                setTeams(data);
            } catch (err: any) {
                setError(err.message || 'Failed to load teams');
            } finally {
                setLoading(false);
            }
        };

        // Only load teams if we have a logged-in user
        if (user) {
            loadTeams();
        }
    }, [user]);

    // When a team is selected, call selectTeam so our backend updates the cookie
    // then redirect to dashboard
    const handleTeamSelect = async (teamId: number) => {
        try {
            await selectTeam(teamId);
            router.push(`/dashboard?teamId=${teamId}`);
        } catch (err: any) {
            setError(err.message || 'Failed to select team');
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-gray-500 dark:text-gray-300">Loading teams...</p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    // Main UI
    return (
        <div className="">
            <div className="w-full max-w-screen-lg p-6">
                <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Select a Team</h1>

                {teams.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-300">
                        No teams available. Please contact support.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {teams.map((team) => (
                            <div
                                key={team.id}
                                onClick={() => handleTeamSelect(team.id)}
                                className="cursor-pointer bg-white dark:bg-gray-800 shadow-md
                           rounded-md p-4 hover:shadow-lg transition-shadow
                           flex flex-col justify-between"
                            >
                                <div>
                                    <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                                        {team.name}
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Team ID: {team.id}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Role: {team.role}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
