import { Request, Response } from 'express';
import { IntegrationSettings } from '../models/Settings';
import { createOrUpdateIntegrationSettings, fetchIntegrationSettingsByTeamId } from '../utils/settingsUtils';
import logger from '../utils/logger';
import { fetchTeamById } from 'utils/teamUtils';

/**
 * Update or create integration settings for a team.
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

        const team = await fetchTeamById(teamId);
        if (team?.isFrozen) {
            res.status(403).json({ message: 'Team is frozen, unable to update' });
            return;
        }

        if (!integrationSettings || typeof integrationSettings !== 'object') {
            res.status(400).json({ message: 'Invalid settings data' });
            return;
        }

        await createOrUpdateIntegrationSettings(teamId, integrationSettings);

        res.status(200).json({
            message: `Settings for team "${teamId}" saved successfully.`,
        });
    } catch (error) {
        logger.error('Error updating team settings:', error);
        res.status(500).json({ message: 'Failed to save team settings.' });
    }
};

/**
 * Fetch integration settings for a team.
 */
export const getTeamSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = req.user;

        if (!user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { teamId } = user;

        const teamSettings = await fetchIntegrationSettingsByTeamId(teamId);

        if (!teamSettings) {
            res.status(404).json({ message: `Settings for team "${teamId}" not found.` });
            return;
        }

        res.status(200).json(teamSettings);
    } catch (error) {
        logger.error('Error fetching team settings:', error);
        res.status(500).json({ message: 'Failed to retrieve team settings.' });
    }
};
