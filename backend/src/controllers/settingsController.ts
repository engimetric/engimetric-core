import { Request, Response } from 'express';
import { IntegrationSettings, llmMetadata, integrationMetadata, IntegrationField } from '../models/Settings';
import {
    createOrUpdateIntegrationSettings,
    fetchIntegrationSettingsByTeamId,
    createOrUpdateLLMSettings,
} from '../utils/settingsUtils';
import logger from '../utils/logger';
import { fetchTeamById } from '../utils/teamUtils';
import { validateLLMSettings } from '../utils/validators';
import { encrypt, decrypt } from '../utils/encryption';

/**
 * Update or create integration settings for a team.
 *
 * @param req.body - Integration settings object
 * @param req.user - User object
 */
export const updateTeamSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        const integrationSettings: Record<string, IntegrationSettings> = req.body;
        const user = req.user;

        if (!user) {
            res.status(401).json({ message: 'Unauthorized: Please log in.' });
            return;
        }

        const { teamId } = user;

        const team = await fetchTeamById(teamId, user.id);
        if (!team) {
            res.status(404).json({ message: 'Team not found.' });
            return;
        }
        if (team.isFrozen) {
            res.status(403).json({ message: 'Team is frozen. Updates are not allowed.' });
            return;
        }

        if (!integrationSettings || typeof integrationSettings !== 'object') {
            res.status(400).json({ message: 'Invalid settings format. Must be an object.' });
            return;
        }

        const currentSettings = (await fetchIntegrationSettingsByTeamId(teamId, user.id)) || {
            integrations: {},
        };

        const updatedIntegrations = { ...currentSettings.integrations };

        for (const [integrationName, settings] of Object.entries(integrationSettings)) {
            const metadata = integrationMetadata.find((meta) => meta.integrationName === integrationName);

            if (!metadata) {
                res.status(400).json({ message: `Invalid integration: "${integrationName}".` });
                return;
            }

            const processedSettings = { ...settings };

            for (const field of metadata.fields) {
                if (field.required && processedSettings[field.key] === undefined) {
                    res.status(400).json({
                        message: `Missing required field "${field.key}" for integration "${integrationName}".`,
                    });
                    return;
                }
            }

            metadata.fields.forEach((field) => {
                if (field.encrypted && processedSettings[field.key]) {
                    processedSettings[field.key] = encrypt(String(processedSettings[field.key]));
                }
            });

            updatedIntegrations[integrationName] = {
                ...(currentSettings.integrations as Record<string, IntegrationSettings>)[integrationName],
                ...processedSettings,
            };
        }

        const updatedSettings = {
            ...currentSettings,
            integrations: updatedIntegrations,
        };

        await createOrUpdateIntegrationSettings(teamId, updatedSettings, user.id);

        res.status(200).json({
            message: `Settings for team "${teamId}" saved successfully.`,
            integrations: updatedIntegrations,
        });
    } catch (error) {
        console.error('Error updating team settings:', error);
        res.status(500).json({ message: 'Failed to save team settings.' });
    }
};

/**
 * Fetch integration settings for a team.
 *
 * @param req.user - user object
 */
export const getTeamSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = req.user;

        if (!user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { teamId } = user;

        const settings = await fetchIntegrationSettingsByTeamId(teamId, user.id);

        if (!settings) {
            res.status(404).json({ message: `Settings for team "${teamId}" not found.` });
            return;
        }

        const decryptedSettings = { ...settings };

        Object.keys(settings.integrations).forEach((integrationName: string) => {
            const metadata = integrationMetadata.find((meta) => meta.integrationName === integrationName);
            if (metadata) {
                metadata.fields.forEach((field: IntegrationField) => {
                    if (field.encrypted && settings.integrations[integrationName][field.key]) {
                        decryptedSettings.integrations[integrationName][field.key] = decrypt(
                            String(settings.integrations[integrationName][field.key]),
                        );
                    }
                });
            }
        });

        res.status(200).json(decryptedSettings);
    } catch (error) {
        logger.error(error, 'Error fetching team settings');
        res.status(500).json({ message: 'Failed to retrieve team settings.' });
    }
};

/**
 * Update LLM settings for a team.
 *
 * @param req.body.llmSettings - LLM settings object
 * @param req.user - User object
 */
export const updateLLMSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = req?.user;
        const { llmSettings } = req?.body;

        if (!user?.teamId || !user.id) {
            res.status(401).json({ message: 'Unauthorized: Please log in.' });
            return;
        }

        const { teamId } = user;

        const team = await fetchTeamById(teamId, user.id);
        if (!team) {
            res.status(404).json({ message: 'Team not found.' });
            return;
        }
        if (team.isFrozen) {
            res.status(403).json({ message: 'Team is frozen. Updates are not allowed.' });
            return;
        }

        if (!llmSettings || typeof llmSettings !== 'object') {
            res.status(400).json({ message: 'Invalid LLM settings format. Must be an object.' });
            return;
        }

        for (const field of llmMetadata) {
            if (field.required && llmSettings[field.key] === undefined) {
                res.status(400).json({
                    message: `Missing required field: "${field.key}" in LLM settings.`,
                });
                return;
            }
        }

        const processedLLMSettings = { ...llmSettings };

        llmMetadata.forEach((field) => {
            if (field.encrypted && processedLLMSettings[field.key]) {
                processedLLMSettings[field.key] = encrypt(String(processedLLMSettings[field.key]));
            }
        });

        await createOrUpdateLLMSettings(processedLLMSettings, teamId, user.id);

        res.status(200).json({
            message: `LLM settings for team "${teamId}" saved successfully.`,
            llmSettings: processedLLMSettings,
        });
    } catch (error) {
        console.error('Error updating LLM settings:', error);
        res.status(500).json({ message: 'Failed to update LLM settings.' });
    }
};

/**
 * Fetch integration metadata.
 */
export const getMetadata = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json(integrationMetadata);
    return;
};

/**
 * Fetch LLM metadata.
 */
export const getLLMMetadata = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json(llmMetadata);
    return;
};

/**
 * Update integration settings for a team.
 * @param req.params.integrationName - Integration name
 * @param req.body - Integration settings object
 * @param req.user - User object
 */
export const updateIntegrationSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        const { integrationName } = req.params;
        const integrationSettings: IntegrationSettings = req.body;
        const user = req.user;

        if (!user) {
            res.status(401).json({ message: 'Unauthorized: Please log in.' });
            return;
        }

        const { teamId } = user;

        if (!integrationName) {
            res.status(400).json({ message: 'Integration name is required in the URL parameter.' });
            return;
        }

        const team = await fetchTeamById(teamId, user.id);
        if (!team) {
            res.status(404).json({ message: 'Team not found.' });
            return;
        }
        if (team.isFrozen) {
            res.status(403).json({ message: 'Team is frozen. Updates are not allowed.' });
            return;
        }

        const metadata = integrationMetadata.find((meta) => meta.integrationName === integrationName);
        if (!metadata) {
            res.status(400).json({ message: 'Invalid integration name.' });
            return;
        }

        if (!integrationSettings || typeof integrationSettings !== 'object') {
            res.status(400).json({ message: 'Invalid integration settings format.' });
            return;
        }

        // Validate required fields
        for (const field of metadata.fields) {
            if (field.required && integrationSettings[field.key] === undefined) {
                res.status(400).json({ message: `Missing required field: ${field.key}` });
                return;
            }
        }

        // Fetch current settings
        const currentSettings = await fetchIntegrationSettingsByTeamId(teamId, user.id);
        if (!currentSettings) {
            res.status(404).json({ message: 'Integration settings not found for this team.' });
            return;
        }

        // Encrypt sensitive fields
        const processedSettings = { ...integrationSettings };

        metadata.fields.forEach((field: IntegrationField) => {
            if (field.encrypted && integrationSettings[field.key]) {
                processedSettings[field.key] = encrypt(String(integrationSettings[field.key]));
            }
        });

        // Merge new settings with current settings
        const updatedSettings = {
            ...currentSettings,
            integrations: {
                ...currentSettings.integrations,
                [integrationName]: {
                    ...currentSettings.integrations[integrationName],
                    ...processedSettings,
                },
            },
        };

        await createOrUpdateIntegrationSettings(teamId, updatedSettings, user.id);

        res.status(200).json({
            message: `Settings for integration "${integrationName}" updated successfully.`,
            integrationName,
            settings: processedSettings,
        });
    } catch (error) {
        console.error('Error updating integration settings:', error);
        res.status(500).json({ message: 'An error occurred while updating integration settings.' });
    }
};
