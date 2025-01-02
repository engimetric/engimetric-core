'use client';

import React, { useEffect, useState } from 'react';
import { toLower } from 'lodash';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface LLMSettings {
    provider: 'openai' | 'local' | 'llama';
    model: string; // e.g., "gpt-4" or "llama-2"
    apiKey: string;
    enabled: boolean;
}

interface IntegrationSettings {
    enabled: boolean;
    [key: string]: string | boolean | number | Date;
}

interface Settings {
    integrations: Record<string, IntegrationSettings>;
    llm: LLMSettings;
    teamId: number | null;
    isFrozen: boolean;
}

const SettingsPage = () => {
    const router = useRouter();

    const [settings, setSettings] = useState<Settings>({
        integrations: {},
        llm: { enabled: true, provider: 'openai', model: '', apiKey: '' },
        teamId: null,
        isFrozen: false,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [teamId, setTeamId] = useState<number | null>(null);
    const [isFrozen, setIsFrozen] = useState<boolean>(false);
    const [llmMetadata, setLLMMetadata] = useState([]);
    const [integrationMetadata, setIntegrationMetadata] = useState([]);

    const fetchTeam = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/team/${teamId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            setIsFrozen(data?.isFrozen || false);
            setError(null);
        } catch (err: Error | any) {
            console.error('Error fetching team:', err);
            setError(err?.message || `Failed to fetch team. Please try again.`);
        }
    };

    // Fetch Integration & LLM Settings
    const fetchSettings = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/settings/`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();

            setSettings({
                integrations: data?.integrations || {},
                llm: data?.llm || { enabled: false, provider: 'openai', model: '', apiKey: '' },
                teamId: data?.teamId || null,
                isFrozen: data?.isFrozen || false,
            });

            setTeamId(data?.teamId || null);

            setError(null);
        } catch (err: Error | any) {
            console.error('Error fetching settings:', err);
            setError(err?.message || `Failed to fetch settings. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    const fetchLLMMetadata = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/settings/llm-metadata`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            setLLMMetadata(data);
            setError(null);
        } catch (err: Error | any) {
            console.error('Error fetching LLM metadata:', err);
            setError(err?.message || `Failed to fetch LLM metadata. Please try again.`);
        }
    };

    const fetchIntegrationMetadata = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/settings/metadata`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            setIntegrationMetadata(data);
            setError(null);
        } catch (err: Error | any) {
            console.error('Error fetching integration metadata:', err);
            setError(err?.message || `Failed to fetch integration metadata. Please try again.`);
        }
    };

    useEffect(() => {
        const fetchMetadataIntegrations = async () => {
            try {
                setLoading(true);

                // Fetch integration settings and set teamId
                await fetchIntegrationMetadata();
            } finally {
                setLoading(false);
            }
        };

        fetchMetadataIntegrations();
    }, []);

    useEffect(() => {
        const fetchMetadataLLM = async () => {
            try {
                setLoading(true);

                // Fetch integration settings and set teamId
                await fetchLLMMetadata();
            } finally {
                setLoading(false);
            }
        };

        fetchMetadataLLM();
    }, []);

    useEffect(() => {
        const fetchAllSettings = async () => {
            try {
                setLoading(true);

                // Fetch integration settings and set teamId
                await fetchSettings();
            } finally {
                setLoading(false);
            }
        };

        fetchAllSettings();
    }, []);

    useEffect(() => {
        const fetchTeamData = async () => {
            if (teamId !== null) {
                try {
                    setLoading(true);
                    await fetchTeam();
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchTeamData();
    }, [teamId]); // Run whenever teamId changes

    /**
     * Handle Input Changes
     */
    const handleInputChange = (integration: string, field: string, value: string | boolean | number) => {
        setSettings((prev) => ({
            ...prev,
            integrations: {
                ...prev.integrations,
                [integration]: {
                    ...prev.integrations[integration],
                    [field]: value,
                },
            },
        }));
    };

    const handleLLMInputChange = (field: string, value: string | boolean) => {
        setSettings((prev) => ({
            ...prev,
            llm: {
                ...prev.llm,
                [field]: value,
            },
        }));
    };

    /**
     * Save Settings
     */
    const handleSave = async () => {
        if (isFrozen) {
            setSaveError('❌ Team is frozen, unable to save settings.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/settings/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(settings),
            });

            if (!response.ok) throw new Error('Failed to save settings');
            setSaveError(null);
            setSuccessMessage('✅ Settings saved successfully!');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error) {
            console.error('Error saving settings:', error);
            setSaveError((error as Error)?.message || '❌ Failed to save settings. Please try again.');
        }
    };

    /**
     * Sync Integration
     */
    const handleSync = async (integration: string) => {
        if (isFrozen) {
            setSaveError('❌ Team is frozen, unable to sync integrations.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/${toLower(integration)}/full-sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            if (!response.ok) throw new Error('Failed to sync integration');
            setSuccessMessage(`✅ ${integration} synced successfully!`);
        } catch (error) {
            console.error(`Error syncing ${integration}:`, error);
            setSaveError(`❌ Failed to sync ${integration}.`);
        }
    };

    /**
     * Delete Team
     */
    const handleDelete = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/team/${teamId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data?.message || 'Failed to delete team.');
            }
            router.push('/');
        } catch (error) {
            console.error('Error deleting team.', error);
            setSaveError((error as Error)?.message || 'Failed to delete team. Please try again.');
        }
    };

    /**
     * Render Loading State
     */
    if (loading) return <div>Loading settings...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    /**
     * Render Settings UI
     */
    return (
        <div className="container mx-auto py-8 px-6">
            <h1 className="text-4xl font-bold mb-8">Settings</h1>

            {/* Success and Error Messages */}
            {successMessage && <div className="text-green-500">{successMessage}</div>}
            {saveError && <div className="text-red-500">{saveError}</div>}

            {/* Integration Settings */}
            <fieldset disabled={isFrozen}>
                {integrationMetadata.map(
                    ({
                        integrationName,
                        label,
                        fields,
                    }: {
                        integrationName: string;
                        label: string;
                        fields: any;
                    }) => (
                        <div key={integrationName} className="mb-6 bg-gray-800 p-4 rounded">
                            <h2 className="text-2xl pb-5">{label} Settings</h2>
                            <button
                                onClick={() => handleSync(integrationName)}
                                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md text-sm"
                            >
                                Sync
                            </button>
                            {fields.map(({ key, label, type }: { key: any; label: string; type: string }) => (
                                <div key={key} className="mb-4">
                                    <label className="text-md font-medium py-2 pr-5">{label}</label>
                                    {type === 'boolean' ? (
                                        <input
                                            type="checkbox"
                                            checked={!!settings.integrations[integrationName]?.[key]}
                                            onChange={(e) =>
                                                handleInputChange(integrationName, key, e.target.checked)
                                            }
                                            className="w-5 h-5 accent-purple-500"
                                        />
                                    ) : type === 'number' ? (
                                        <input
                                            type="number"
                                            value={Number(settings.integrations[integrationName]?.[key]) || 0}
                                            onChange={(e) =>
                                                handleInputChange(integrationName, key, e.target.value)
                                            }
                                            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white"
                                        />
                                    ) : type === 'date' ? (
                                        <input
                                            type="date"
                                            value={
                                                settings.integrations[integrationName]?.[key]
                                                    ? new Date(
                                                          settings.integrations[integrationName]?.[
                                                              key
                                                          ] as Date,
                                                      )
                                                          .toISOString()
                                                          .split('T')[0]
                                                    : ''
                                            }
                                            onChange={(e) =>
                                                handleInputChange(integrationName, key, e.target.value)
                                            }
                                            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white"
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            value={
                                                settings.integrations[integrationName]?.[key]?.toString() ||
                                                ''
                                            }
                                            onChange={(e) =>
                                                handleInputChange(integrationName, key, e.target.value)
                                            }
                                            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    ),
                )}
            </fieldset>

            {/* LLM Settings */}
            <div className="mb-6 bg-gray-800 p-4 rounded">
                <h2 className="text-2xl pb-5">LLM Settings</h2>
                <fieldset disabled={isFrozen}>
                    {llmMetadata.map(({ key, label, type, options = [] }) => (
                        <div key={key} className="mb-4">
                            <label className="text-md font-medium py-2 pr-5 block">{label}</label>
                            {type === 'boolean' ? (
                                <input
                                    type="checkbox"
                                    checked={settings.llm[key as keyof LLMSettings] as boolean}
                                    onChange={(e) => handleLLMInputChange(key, e.target.checked)}
                                    className="w-5 h-5 accent-purple-500"
                                />
                            ) : type === 'select' ? (
                                <select
                                    value={settings.llm[key as keyof LLMSettings] as string}
                                    onChange={(e) => handleLLMInputChange(key, e.target.value)}
                                    className="px-4 py-2 rounded-lg bg-gray-700 text-white"
                                >
                                    {options?.map(({ value, label }) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value={settings.llm[key as keyof LLMSettings]?.toString() || ''}
                                    onChange={(e) => handleLLMInputChange(key, e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white"
                                />
                            )}
                        </div>
                    ))}
                </fieldset>
            </div>

            <button disabled={isFrozen} onClick={handleSave} className="bg-purple-600 px-4 py-2 rounded mb-8">
                Save Settings
            </button>
            <hr />
            <div className="mt-8">
                <h2 className="text-2xl font-semibold mb-4">Danger Zone</h2>
                <button
                    disabled={isFrozen}
                    onClick={handleDelete}
                    className="bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-lg font-semibold text-lg"
                >
                    Delete Account
                </button>
            </div>
        </div>
    );
};

export default SettingsPage;
