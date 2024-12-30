import { Request, Response } from 'express';
import {
    createOrUpdateTeam,
    fetchAllTeams,
    fetchTeamById,
    deleteTeam,
    ensureTeamHasDefaults,
} from '../utils/teamUtils';
import { fetchUserTeams, addUserToTeam } from '../utils/userTeamUtils';
import logger from '../utils/logger';

/**
 * Get all teams
 */
export const getAllTeams = async (req: Request, res: Response): Promise<void> => {
    try {
        const teams = await fetchAllTeams();
        res.status(200).json(teams);
    } catch (error) {
        logger.error('Error fetching all teams:', error);
        res.status(500).json({ message: 'Failed to fetch teams' });
    }
};

/**
 * Get a team by ID
 */
export const getTeamById = async (req: Request, res: Response): Promise<void> => {
    try {
        const teamId = req?.user?.teamId || parseInt(req.params.id, 10);

        if (!teamId) {
            res.status(400).json({ message: 'Team ID is missing from request.' });
            return;
        }

        const team = await fetchTeamById(teamId);

        if (!team) {
            res.status(404).json({ message: 'Team not found' });
            return;
        }

        res.status(200).json(team);
    } catch (error) {
        logger.error('Error fetching team by ID:', error);
        res.status(500).json({ message: 'Failed to fetch team' });
    }
};

/**
 * Get all teams for a user
 */
export const getTeamsByUserId = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req?.user?.id;

        if (!userId) {
            res.status(400).json({ message: 'User ID is missing from user data.' });
            return;
        }

        const teams = await fetchUserTeams(userId);

        if (!teams) {
            res.status(404).json({ message: 'Team not found' });
            return;
        }

        res.status(200).json(teams);
    } catch (error) {
        logger.error('Error fetching team by ID:', error);
        res.status(500).json({ message: 'Failed to fetch team' });
    }
};

/**
 * Create or update a team
 */
export const saveTeam = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, description } = req.body;
        const userId = req?.user?.id;

        if (!userId) {
            res.status(400).json({ message: 'User ID is missing from user data.' });
            return;
        }
        if (!name) {
            res.status(400).json({ message: 'Name is required' });
            return;
        }

        // Prepare new or updated team object
        const newTeam = {
            name,
            slug: name.toLowerCase().replace(/\s+/g, '-'),
            description,
            ownerId: userId,
        };

        // 1. Create or update the team in the "teams" table
        const team = await createOrUpdateTeam(newTeam);

        // 2. Ensure the user is attached to the team (admin by default)
        await addUserToTeam(userId, team.id, 'admin');

        // 3. Ensure default records exist in other tables (subscriptions, settings, etc.)
        await ensureTeamHasDefaults(team.id);

        // 4. Respond
        res.status(200).json({ message: 'Team saved successfully', team });
        return;
    } catch (error) {
        logger.error('Error saving team:', error);
        res.status(500).json({ message: 'Failed to save team' });
        return;
    }
};

/**
 * Delete a team
 */
export const deleteTeamById = async (req: Request, res: Response): Promise<void> => {
    try {
        const teamId = parseInt(req.params.id, 10);
        await deleteTeam(teamId);
        res.status(200).json({ message: 'Team deleted successfully' });
    } catch (error) {
        logger.error('Error deleting team:', error);
        res.status(500).json({ message: 'Failed to delete team' });
    }
};
