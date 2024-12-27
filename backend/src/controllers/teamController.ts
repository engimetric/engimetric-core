import { Request, Response } from 'express';
import { createOrUpdateTeam, fetchAllTeams, fetchTeamById, deleteTeam } from '../utils/teamUtils';
import { fetchUserTeams } from '../utils/userTeamUtils';

/**
 * Get all teams
 */
export const getAllTeams = async (req: Request, res: Response): Promise<void> => {
    try {
        const teams = await fetchAllTeams();
        res.status(200).json(teams);
    } catch (error) {
        console.error('Error fetching all teams:', error);
        res.status(500).json({ message: 'Failed to fetch teams' });
    }
};

/**
 * Get a team by ID
 */
export const getTeamById = async (req: Request, res: Response): Promise<void> => {
    try {
        const teamId = req?.user?.teamId;

        if (!teamId) {
            res.status(400).json({ message: 'Team ID is missing from user data.' });
            return;
        }

        const team = await fetchTeamById(teamId);

        if (!team) {
            res.status(404).json({ message: 'Team not found' });
            return;
        }

        res.status(200).json(team);
    } catch (error) {
        console.error('Error fetching team by ID:', error);
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
        console.error('Error fetching team by ID:', error);
        res.status(500).json({ message: 'Failed to fetch team' });
    }
};

/**
 * Create or update a team
 */
export const saveTeam = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id, name, slug, description, ownerId, members } = req.body;
        if (!id || !name || !slug) {
            res.status(400).json({ message: 'ID, name, and slug are required' });
            return;
        }

        const team = {
            id,
            name,
            slug,
            description,
            ownerId,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await createOrUpdateTeam(team);
        res.status(200).json({ message: 'Team saved successfully' });
    } catch (error) {
        console.error('Error saving team:', error);
        res.status(500).json({ message: 'Failed to save team' });
    }
};

/**
 * Delete a team
 */
export const deleteTeamById = async (req: Request, res: Response): Promise<void> => {
    try {
        const teamId = parseInt(req.params.id);
        await deleteTeam(teamId);
        res.status(200).json({ message: 'Team deleted successfully' });
    } catch (error) {
        console.error('Error deleting team:', error);
        res.status(500).json({ message: 'Failed to delete team' });
    }
};
