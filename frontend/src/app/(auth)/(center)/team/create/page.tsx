'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateTeamPage() {
    const router = useRouter();

    // Basic state for team creation
    const [teamName, setTeamName] = useState('');
    const [teamDescription, setTeamDescription] = useState('');
    const [error, setError] = useState('');

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:1050/api/team', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // if you're setting auth cookies
                body: JSON.stringify({ name: teamName, description: teamDescription }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to create team');
            }

            // If creation is successful, maybe redirect to a team page or dashboard
            router.push('/team');
        } catch (err: any) {
            setError(err.message || 'Failed to create team');
        }
    };

    return (
        <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 w-full max-w-sm">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                    Create a New Team
                </h2>
                {error && <p className="mb-4 text-red-500 text-sm">{error}</p>}
                <form onSubmit={handleCreateTeam} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Team Name
                        </label>
                        <input
                            type="text"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            placeholder="My Great Team"
                            className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 
                         text-gray-900 dark:text-gray-100 bg-transparent dark:bg-gray-900 
                         placeholder-gray-400 focus:outline-none focus:ring-2 
                         focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description (optional)
                        </label>
                        <textarea
                            value={teamDescription}
                            onChange={(e) => setTeamDescription(e.target.value)}
                            placeholder="Brief description of your team..."
                            className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 
                         text-gray-900 dark:text-gray-100 bg-transparent dark:bg-gray-900 
                         placeholder-gray-400 focus:outline-none focus:ring-2 
                         focus:ring-blue-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium 
                       transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 
                       focus:ring-offset-2"
                    >
                        Create Team
                    </button>
                </form>
            </div>
        </div>
    );
}
