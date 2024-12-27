'use client';

import React, { useEffect, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface TeamMember {
    id: number;
    fullName: string;
    email?: string;
    userId?: number;
    aliases: string[]; // Array of aliases
    createdAt: string;
    updatedAt: string;
}

const TeamMembersPage = () => {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [newMember, setNewMember] = useState({ fullName: '', email: '' });
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
    const [newAlias, setNewAlias] = useState('');

    /** Fetch Team Members on Load */
    useEffect(() => {
        fetchTeamMembers();
    }, []);

    /** Fetch Team Members */
    const fetchTeamMembers = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/members/`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            if (!response.ok) throw new Error('Failed to fetch team members');
            const data = await response.json();
            setTeamMembers(data);
        } catch (err) {
            console.error('Error fetching team members:', err);
            alert('Failed to fetch team members');
        }
    };

    /** Add New Member */
    const handleAddMember = async () => {
        if (!newMember.fullName) return alert('Full name is required');
        try {
            const response = await fetch(`${API_BASE_URL}/members/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(newMember),
            });
            if (!response.ok) throw new Error('Failed to add team member');
            await fetchTeamMembers();
            setNewMember({ fullName: '', email: '' });
        } catch (err) {
            console.error('Error adding team member:', err);
            alert('Failed to add team member');
        }
    };

    /** Delete Member */
    const handleDeleteMember = async (id: number) => {
        if (!confirm('Are you sure you want to delete this member?')) return;
        try {
            const response = await fetch(`${API_BASE_URL}/members/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            if (!response.ok) throw new Error('Failed to delete team member');
            await fetchTeamMembers();
        } catch (err) {
            console.error('Error deleting team member:', err);
            alert('Failed to delete team member');
        }
    };

    /** Add Alias */
    const handleAddAlias = async () => {
        if (!selectedMember || !newAlias.trim()) {
            alert('Alias cannot be empty');
            return;
        }
        try {
            selectedMember.aliases = selectedMember.aliases.concat([newAlias]);
            const response = await fetch(`${API_BASE_URL}/members/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(selectedMember),
            });
            if (!response.ok) throw new Error('Failed to add alias');
            await fetchTeamMembers();
            setNewAlias('');
        } catch (err) {
            console.error('Error adding alias:', err);
            alert('Failed to add alias');
        }
    };

    /** Remove Alias */
    const handleRemoveAlias = async (alias: string) => {
        if (!selectedMember || !alias.trim()) {
            alert('Alias cannot be empty');
            return;
        }
        try {
            selectedMember.aliases = selectedMember.aliases.filter((a) => a !== alias);

            const response = await fetch(`${API_BASE_URL}/members/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(selectedMember),
            });
            if (!response.ok) throw new Error('Failed to update aliases');
            await fetchTeamMembers();
            setNewAlias('');
        } catch (err) {
            console.error('Error removing alias:', err);
            alert('Failed to remove alias');
        }
    };

    return (
        <div className="container mx-auto py-6 px-4">
            <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Team Members</h1>

            {/* Add New Member */}
            <div className="mb-8 p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                    Add New Member
                </h2>
                <div className="flex flex-col gap-2 mb-4">
                    <input
                        type="text"
                        placeholder="Full Name"
                        value={newMember.fullName}
                        onChange={(e) => setNewMember({ ...newMember, fullName: e.target.value })}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 
                       text-gray-900 dark:text-gray-100 bg-transparent 
                       placeholder-gray-400 focus:outline-none
                       focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="email"
                        placeholder="Email (optional)"
                        value={newMember.email}
                        onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 
                       text-gray-900 dark:text-gray-100 bg-transparent 
                       placeholder-gray-400 focus:outline-none
                       focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button onClick={handleAddMember} className="btn-primary">
                    Add Member
                </button>
            </div>

            {/* Team Members List */}
            {teamMembers.map((member) => (
                <div
                    key={member.id}
                    className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                     rounded-lg shadow-sm mb-4"
                >
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {member.fullName}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-1">
                        Email: {member.email || 'No email provided'}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                        Aliases: {member.aliases.length ? member.aliases.join(', ') : 'No aliases'}
                    </p>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setSelectedMember(member)} className="btn-secondary">
                            Manage Aliases
                        </button>
                        <button onClick={() => handleDeleteMember(member.id)} className="btn-danger">
                            Delete
                        </button>
                    </div>
                </div>
            ))}

            {/* Alias Modal */}
            {selectedMember && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                            Manage Aliases for {selectedMember.fullName}
                        </h3>

                        {selectedMember.aliases.map((alias) => (
                            <div
                                key={alias}
                                className="flex items-center justify-between mb-2 bg-gray-100 dark:bg-gray-700
                           rounded-md px-3 py-2"
                            >
                                <span className="text-gray-800 dark:text-gray-100">{alias}</span>
                                <button
                                    onClick={() => handleRemoveAlias(alias)}
                                    className="text-red-500 hover:underline font-medium"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}

                        <div className="mt-4">
                            <input
                                type="text"
                                value={newAlias}
                                onChange={(e) => setNewAlias(e.target.value)}
                                placeholder="Add Alias"
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 mb-2
                           text-gray-900 dark:text-gray-100 bg-transparent 
                           placeholder-gray-400 focus:outline-none
                           focus:ring-2 focus:ring-blue-500"
                            />
                            <button onClick={handleAddAlias} className="btn-primary mr-2">
                                Add Alias
                            </button>
                            <button onClick={() => setSelectedMember(null)} className="btn-secondary">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamMembersPage;
