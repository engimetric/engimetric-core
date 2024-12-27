import { Request, Response } from 'express';
import { IntegrationSettings } from '../models/Settings';
import { createOrUpdateIntegrationSettings, fetchIntegrationSettingsByTeamId } from '../utils/settingsUtils';

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

        if (!integrationSettings || typeof integrationSettings !== 'object') {
            res.status(400).json({ message: 'Invalid settings data' });
            return;
        }

        await createOrUpdateIntegrationSettings(teamId, integrationSettings);

        res.status(200).json({
            message: `Settings for team "${teamId}" saved successfully.`,
        });
    } catch (error) {
        console.error('Error updating team settings:', error);
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
        console.error('Error fetching team settings:', error);
        res.status(500).json({ message: 'Failed to retrieve team settings.' });
    }
};
