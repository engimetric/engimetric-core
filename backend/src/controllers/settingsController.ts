import { Request, Response } from 'express';
import { IntegrationSettings, llmMetadata, integrationMetadata } from '../models/Settings';
import {
    createOrUpdateIntegrationSettings,
    fetchIntegrationSettingsByTeamId,
    createOrUpdateLLMSettings,
} from '../utils/settingsUtils';
import logger from '../utils/logger';
import { fetchTeamById } from 'utils/teamUtils';
import { validateLLMSettings } from 'utils/validators';

/**
 * Update or create integration settings for a team.
 * @param req.body - Integration settings object
 * @param req.user - user object
 */
export const updateTeamSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        const integrationSettings: Record<string, IntegrationSettings> = req.body;
        const user = req.user;

        if (!user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { teamId } = user;

        const team = await fetchTeamById(teamId, user.id);
        if (team?.isFrozen) {
            res.status(403).json({ message: 'Team is frozen, unable to update' });
            return;
        }

        if (!integrationSettings || typeof integrationSettings !== 'object') {
            res.status(400).json({ message: 'Invalid settings data' });
            return;
        }

        await createOrUpdateIntegrationSettings(teamId, integrationSettings, user.id);

        res.status(200).json({
            message: `Settings for team "${teamId}" saved successfully.`,
        });
    } catch (error) {
        logger.error(error, 'Error updating team settings');
        res.status(500).json({ message: 'Failed to save team settings.' });
    }
};

/**
 * Fetch integration settings for a team.
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

        const teamSettings = await fetchIntegrationSettingsByTeamId(teamId, user.id);

        if (!teamSettings) {
            res.status(404).json({ message: `Settings for team "${teamId}" not found.` });
            return;
        }

        res.status(200).json(teamSettings);
    } catch (error) {
        logger.error(error, 'Error fetching team settings');
        res.status(500).json({ message: 'Failed to retrieve team settings.' });
    }
};

/**
 * Update LLM settings for a team.
 * @param req.body.llmSettings - LLM settings object
 * @param req.user - user object
 */
export const updateLLMSettings = async (req: Request, res: Response): Promise<void> => {
    const user = req?.user;
    const { llmSettings } = req?.body;

    if (!user?.teamId || !user.id) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    if (!validateLLMSettings(llmSettings)) {
        res.status(400).json({ message: 'Invalid LLM settings.' });
        return;
    }

    try {
        await createOrUpdateLLMSettings(llmSettings, user.teamId, user.id);

        res.status(200).json({
            message: `LLM settings for team "${user.teamId}" saved successfully.`,
        });
    } catch (error) {
        logger.error(error, 'Error updating LLM settings');
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
