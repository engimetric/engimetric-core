'use client';

import React, { useEffect, useState } from 'react';
import { startCase } from 'lodash';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface IntegrationSettings {
    enabled: boolean;
    [key: string]: string | boolean;
}

interface Settings {
    [integration: string]: IntegrationSettings;
}

const SettingsPage = () => {
    const [settings, setSettings] = useState<Settings>({
        GitHub: { enabled: true, token: '', org: '' },
        GoogleCalendar: { enabled: true, clientId: '', clientSecret: '' },
        Jira: { enabled: false, domain: '', token: '' },
        Zoom: { enabled: false, apiKey: '', apiSecret: '' },
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetch Settings from API
     */
    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);

            try {
                const response = await fetch(`${API_BASE_URL}/settings/`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                });
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const data = await response.json();
                console.log('Settings:', data);
                setSettings(data?.integrations);
                setError(null);
            } catch (err) {
                console.error('Error fetching settings:', err);
                setError(`Failed to fetch settings. Please try again. ${JSON.stringify(err)}`);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    /**
     * Handle Integration Toggle
     */
    const handleToggle = (integration: string) => {
        setSettings((prev) => ({
            ...prev,
            [integration]: {
                ...prev[integration],
                enabled: !prev[integration].enabled,
            },
        }));
    };

    /**
     * Handle Input Changes
     */
    const handleInputChange = (integration: string, field: string, value: string) => {
        setSettings((prev) => ({
            ...prev,
            [integration]: {
                ...prev[integration],
                [field]: value,
            },
        }));
    };

    /**
     * Save Settings
     */
    const handleSave = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/settings/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(settings),
            });

            if (!response.ok) throw new Error('Failed to save settings');
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    };

    /**
     * Render Loading State
     */
    if (loading) {
        return <div>Loading settings...</div>;
    }

    /**
     * Render Error State
     */
    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    /**
     * Render Settings UI
     */
    return (
        <div className="container mx-auto py-6">
            <h1 className="text-3xl font-bold mb-6">Settings</h1>

            {Object.entries(settings).map(([integration, data]) => (
                <div key={integration} className="bg-[var(--card-color)] p-6 rounded-lg shadow-md mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">{integration} Settings</h2>
                        <label className="flex items-center">
                            <span className="mr-2">Enable</span>
                            <input
                                type="checkbox"
                                checked={data?.enabled}
                                onChange={() => handleToggle(integration)}
                                className="w-5 h-5 text-[var(--primary-color)]"
                            />
                        </label>
                    </div>

                    {/* Render Fields Dynamically */}
                    <div className={`${data?.enabled ? '' : 'opacity-50 pointer-events-none'}`}>
                        {Object.entries(data).map(([key, value]) => {
                            if (key === 'enabled') return null;

                            return (
                                <div className="mb-4" key={key}>
                                    <label className="block text-sm font-medium mb-2">{startCase(key)}</label>
                                    <input
                                        type="text"
                                        value={value as string}
                                        onChange={(e) => handleInputChange(integration, key, e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none"
                                        placeholder={`Enter ${startCase(key)}`}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            <button onClick={handleSave} className="btn-primary w-full">
                Save Settings
            </button>
        </div>
    );
};

export default SettingsPage;
