import { Request, Response } from 'express';
import {
    fetchTeamMembers,
    fetchTeamMemberById,
    createOrUpdateTeamMember,
    deleteTeamMember,
    fetchTeamMemberAliases,
    getMetricsFromTeamMembers,
} from '../utils/teamMemberUtils';
import { TeamMember } from '../models/TeamMember';
import logger from '../utils/logger';

/**
 * Get all team members for the authenticated user's team
 */
export const getTeamMembers = async (req: Request, res: Response): Promise<void> => {
    try {
        const teamId = req.user?.teamId;

        if (!teamId) {
            res.status(401).json({ message: 'Unauthorized: No team ID available in user context.' });
            return;
        }

        const members = await fetchTeamMembers(teamId);
        res.status(200).json(members);
    } catch (error) {
        logger.error('Error fetching team members:', error);
        res.status(500).json({ message: 'Failed to fetch team members' });
    }
};

/**
 * Get a specific team member by ID
 */
export const getTeamMember = async (req: Request, res: Response): Promise<void> => {
    try {
        const memberId = parseInt(req.params.id, 10);
        const teamId = req.user?.teamId;

        if (isNaN(memberId)) {
            res.status(400).json({ message: 'Invalid member ID' });
            return;
        }

        if (!teamId) {
            res.status(401).json({ message: 'Unauthorized: No team ID available in user context.' });
            return;
        }

        const member = await fetchTeamMemberById(memberId);

        if (!member || member.teamId !== teamId) {
            res.status(404).json({ message: 'Team member not found or does not belong to your team.' });
            return;
        }

        res.status(200).json(member);
    } catch (error) {
        logger.error('Error fetching team member:', error);
        res.status(500).json({ message: 'Failed to fetch team member' });
    }
};

/**
 * Create or update a team member
 */
export const saveTeamMember = async (req: Request, res: Response): Promise<void> => {
    try {
        const teamId = req.user?.teamId;

        if (!teamId) {
            res.status(401).json({ message: 'Unauthorized: No team ID available in user context.' });
            return;
        }

        const teamMember: TeamMember = { ...req.body, teamId };

        if (!teamMember.fullName && !teamMember.id) {
            res.status(400).json({ message: 'Full Name is required' });
            return;
        }

        await createOrUpdateTeamMember(teamMember);
        res.status(200).json({ message: 'Team member saved successfully' });
    } catch (error) {
        logger.error('Error saving team member:', error);
        res.status(500).json({ message: 'Failed to save team member' });
    }
};

/**
 * Delete a team member by ID
 */
export const removeTeamMember = async (req: Request, res: Response): Promise<void> => {
    try {
        const memberId = parseInt(req.params.id, 10);
        const teamId = req.user?.teamId;

        if (isNaN(memberId)) {
            res.status(400).json({ message: 'Invalid member ID' });
            return;
        }

        if (!teamId) {
            res.status(401).json({ message: 'Unauthorized: No team ID available in user context.' });
            return;
        }

        const member = await fetchTeamMemberById(memberId);
        if (!member || member.teamId !== teamId) {
            res.status(404).json({ message: 'Team member not found or does not belong to your team.' });
            return;
        }

        await deleteTeamMember(memberId);
        res.status(200).json({ message: 'Team member deleted successfully' });
    } catch (error) {
        logger.error('Error deleting team member:', error);
        res.status(500).json({ message: 'Failed to delete team member' });
    }
};

/**
 * Get team member aliases for the authenticated user's team.
 */
export const getTeamMemberAliases = async (req: Request, res: Response): Promise<void> => {
    try {
        const teamId = req.user?.teamId;

        if (!teamId) {
            res.status(401).json({ message: 'Unauthorized: No team ID available in user context.' });
            return;
        }

        const aliases = await fetchTeamMemberAliases(teamId);

        if (Object.keys(aliases).length === 0) {
            res.status(404).json({ message: 'No aliases found for this team.' });
            return;
        }

        res.status(200).json(aliases);
    } catch (error) {
        logger.error('Error fetching team member aliases:', error);
        res.status(500).json({
            message: 'An error occurred while fetching team member aliases.',
            error: (error as Error).message,
        });
    }
};

/**
 * Fetch team member metrics with optional filters
 * @param req - The request object
 * @param res - The response object
 * @example
 * GET /members/metrics?month=2021-07&integration=GitHub
 * Response:
 * {
 * "teamId": 1,
 * "metrics": {
 * "1": {
 * "GitHub": {
 * "merges": 5,
 * "reviews": 3,
 * "changes": 10
 * }
 * }
 * }
 * }
 * @returns The aggregated team member metrics
 * @throws {401} - If user or team data is missing
 * @throws {500} - If an error occurs
 */
export const getTeamMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = req.user;
        const teamId = user?.teamId;

        if (!user || !teamId) {
            res.status(401).json({ message: 'Unauthorized: User or team data missing.' });
            return;
        }

        // Fetch team members with aliases
        const teamMembers = await fetchTeamMembers(teamId);

        // Aggregate metrics based on filters
        const metrics = getMetricsFromTeamMembers(teamMembers);

        res.status(200).json({ teamId, metrics });
    } catch (error) {
        logger.error('Error fetching team metrics:', error);
        res.status(500).json({
            message: 'Failed to fetch team metrics.',
            error: (error as Error).message,
        });
    }
};
