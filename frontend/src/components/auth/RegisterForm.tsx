'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function RegisterUserPage() {
    const router = useRouter();

    // Basic state for registration form
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // if you're setting auth cookies
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to register user');
            }

            // If registration is successful, redirect to another page (login/team, etc.)
            router.push('/login');
        } catch (err: any) {
            setError(err.message || 'Failed to register user');
        }
    };

    return (
        <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 w-full max-w-sm">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                    Register New User
                </h2>
                {error && <p className="mb-4 text-red-500 text-sm">{error}</p>}
                <form onSubmit={handleRegister} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email
                        </label>
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 
                         text-gray-900 dark:text-gray-100 bg-transparent dark:bg-gray-900 
                         placeholder-gray-400 focus:outline-none focus:ring-2 
                         focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
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
                        Create User
                    </button>
                </form>
            </div>
        </div>
    );
}
