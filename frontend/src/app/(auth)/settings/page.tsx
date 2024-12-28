'use client';

import React, { useEffect, useState } from 'react';
import { toLower, startCase } from 'lodash';

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
        Jira: { enabled: false, domain: '', token: '' },
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
                setSettings(data?.integrations || {});
                setError(null);
            } catch (err) {
                console.error('Error fetching settings:', err);
                setError(`Failed to fetch settings. Please try again.`);
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
     * Display Success Message with Timeout
     */
    const displaySuccess = (message: string) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(null), 3000); // Clear after 3 seconds
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
            setSaveError(null);
            displaySuccess('✅ Settings saved successfully!');
        } catch (error) {
            console.error('Error saving settings:', error);
            setSaveError('❌ Failed to save settings. Please try again.');
        }
    };

    /**
     * Sync Integration
     */
    const handleSync = async (integration: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${toLower(integration)}/full-sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });

            if (!response.ok) throw new Error('Failed to sync integration');
            displaySuccess(`✅ ${integration} synced successfully!`);
        } catch (error) {
            console.error(`Error syncing ${integration}:`, error);
            setSaveError(`❌ Failed to sync ${integration}. Please try again.`);
        }
    };

    /**
     * Render Loading State
     */
    if (loading) {
        return <div className="flex items-center justify-center h-screen text-lg">Loading settings...</div>;
    }

    /**
     * Render Error State
     */
    if (error) {
        return <div className="text-red-500 text-center mt-4">{error}</div>;
    }

    /**
     * Render Settings UI
     */
    return (
        <div className="container mx-auto py-8 px-6">
            <h1 className="text-4xl font-bold mb-8 text-center">Integration Settings</h1>

            {/* Success and Error Messages */}
            {successMessage && (
                <div className="mb-4 text-green-500 text-center bg-green-800 py-2 px-4 rounded-md">
                    {successMessage}
                </div>
            )}
            {saveError && (
                <div className="mb-4 text-red-500 text-center bg-red-800 py-2 px-4 rounded-md">
                    {saveError}
                </div>
            )}

            {Object.entries(settings).map(([integration, data]) => (
                <div key={integration} className="bg-gray-800 text-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold">{integration} Settings</h2>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center cursor-pointer">
                                <span className="mr-2">Enable</span>
                                <input
                                    type="checkbox"
                                    checked={data?.enabled}
                                    onChange={() => handleToggle(integration)}
                                    className="w-5 h-5 accent-purple-500"
                                />
                            </label>
                            <button
                                onClick={() => handleSync(integration)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
                            >
                                Sync
                            </button>
                        </div>
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

            <button
                onClick={handleSave}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold text-lg"
            >
                Save Settings
            </button>
        </div>
    );
};

export default SettingsPage;
