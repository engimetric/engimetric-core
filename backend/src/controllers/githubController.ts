import moment from 'moment';
import { Request, Response } from 'express';
import { fetchGithubData, processPullRequest, getContributions } from '../utils/githubUtils';
import { fetchTeamById } from '../utils/teamUtils';
import { syncIntegrationData } from '../utils/integrationUtils';
import { TeamMember } from '../models/TeamMember';
import logger from '../utils/logger';

/**
 * Generic Data Processor for GitHub Integration
 *
 * @param rawData - Raw GitHub data
 * @param teamMembers - List of team members
 * @returns Aggregated metrics by team member ID
 *
 * @example
 * ```javascript
 * const processedData = processGithubData(rawData, teamMembers);
 * ```
 */
const processGithubData = (
    rawData: any[],
    teamMembers: TeamMember[],
): Record<number, Record<string, number>> => {
    const aggregatedData: Record<number, Record<string, number>> = {};

    for (const pr of rawData) {
        const prData = processPullRequest(pr, teamMembers);
        if (!prData) continue;

        for (const [id, metrics] of Object.entries(prData)) {
            const member = teamMembers.find((m) => m.id === Number(id));
            if (!member) {
                console.warn(`🚨 No matching team member found for ${id}`);
                continue;
            }

            if (!aggregatedData[member.id]) {
                aggregatedData[member.id] = {};
            }

            // Aggregate metrics dynamically
            for (const [metricKey, metricValue] of Object.entries(metrics)) {
                if (typeof metricValue === 'number') {
                    aggregatedData[member.id][metricKey] =
                        (aggregatedData[member.id][metricKey] || 0) + metricValue;
                } else {
                    console.warn(
                        `🚨 Invalid metric value for '${metricKey}' in '${member.fullName}'. Skipping...`,
                    );
                }
            }
        }
    }

    return aggregatedData;
};

/**
 * Update GitHub data for a team in a specific month.
 * This API endpoint is used to manually trigger a data sync for GitHub.
 * The data is fetched from the GitHub API and processed to calculate contributions for each team member.
 * The contributions are then saved in the database.
 *
 * Request body should contain:
 * - month: The month for which to update the data (format: 'YYYY-MM')
 * @example
 * {
 *  "month": "2021-07"
 * }
 * @param req - The request object
 * @param res - The response object
 * @returns A message indicating the success or failure of the operation
 */
export const syncByMonth = async (req: Request, res: Response): Promise<void> => {
    try {
        const { month } = req.body;
        const user = req.user;
        const teamId = user?.teamId;

        if (!user) {
            res.status(401).json({ message: 'Unauthorized: No user data.' });
            return;
        }

        if (!teamId) {
            res.status(400).json({ message: 'Required parameters "teamId" is missing.' });
            return;
        }

        const team = await fetchTeamById(teamId);
        if (team?.isFrozen) {
            res.status(403).json({ message: 'Team is frozen, unable to sync' });
            return;
        }

        logger.info(`🔄 Updating GitHub data for Team ID: ${teamId} in month: ${month}`);

        await syncIntegrationData(
            teamId,
            'GitHub',
            month,
            async (settings, startDate, endDate) => fetchGithubData(settings, { startDate, endDate }),
            processGithubData,
            1,
        );

        res.status(200).json({ message: 'GitHub data successfully updated.' });
    } catch (error) {
        logger.error('❌ Error updating GitHub data:', error);
        res.status(500).json({
            message: 'Failed to update contributions.',
            error: (error as Error).message,
        });
    }
};

/**
 * Update GitHub data for the past 12 months.
 * This API endpoint is used to manually trigger a data sync for GitHub.
 * The data is fetched from the GitHub API and processed to calculate contributions for each team member.
 * The contributions are then saved in the database.
 *
 * Request body should contain:
 * - month: The month for which to update the data (format: 'YYYY-MM')
 * @example
 * {
 *  "month": "2021-07"
 * }
 * @param req - The request object
 * @param res - The response object
 * @returns A message indicating the success or failure of the operation
 */
export const fullSync = async (req: Request, res: Response): Promise<void> => {
    try {
        const { month } = req.body;
        const user = req.user;
        const teamId = user?.teamId;

        if (!user) {
            res.status(401).json({ message: 'Unauthorized: No user data.' });
            return;
        }

        if (!teamId) {
            res.status(400).json({ message: 'Required parameter "teamId" is missing.' });
            return;
        }

        const team = await fetchTeamById(teamId);
        if (team?.isFrozen) {
            res.status(403).json({ message: 'Team is frozen, unable to full sync' });
            return;
        }

        logger.info(`🔄 Updating GitHub data for Team ID: ${teamId} in month: ${month}`);

        await syncIntegrationData(
            teamId,
            'GitHub',
            month,
            async (settings, startDate, endDate) => fetchGithubData(settings, { startDate, endDate }),
            processGithubData,
            12,
        );

        res.status(200).json({ message: 'GitHub data successfully updated.' });
    } catch (error: Error | any) {
        logger.error('❌ Error updating GitHub data:', error);
        res.status(500).json({
            message: error?.message || 'Failed to full sync.',
            error: (error as Error).message,
        });
    }
};

/**
 * Retrieve GitHub Contributions for a Team in a Specific Month from the Database.
 * This API endpoint is used to fetch the contributions for a specific month and return them as JSON.
 * The contributions are retrieved from the database and returned as an object with team member IDs as keys.
 * The response format is:
 * {
 *    memberId: {
 *     integration: {
 *      merges: number,
 *      reviews: number,
 *    },
 * }
 * Required query parameter:
 * - month: The month for which to retrieve the contributions (format: 'YYYY-MM')
 * @example
 * GET /github/contributions?month=2021-07
 * Response:
 * {
 *   1: {
 *     GitHub: {
 *       merges: 5,
 *       reviews: 10,
 *     },
 *   },
 *   2: {
 *     GitHub: {
 *       merges: 3,
 *       reviews: 8,
 *     },
 *   },
 * }
 * @param req - The request object
 * @param res - The response object
 * @returns The contributions for the specified month
 */
export const getGithubContributions = async (req: Request, res: Response): Promise<void> => {
    try {
        const { month } = req.query;

        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized: No user data.' });
            return;
        }

        if (!month) {
            res.status(400).json({ message: 'Required query parameter "month" is missing.' });
            return;
        }

        const { startDate, endDate } = {
            startDate: moment(month as string)
                .startOf('month')
                .format('YYYY-MM-DD'),
            endDate: moment(month as string)
                .endOf('month')
                .format('YYYY-MM-DD'),
        };

        const contributions = await getContributions(req.user.teamId, startDate, endDate);

        res.status(200).json(contributions);
    } catch (error) {
        logger.error('❌ Error retrieving contributions:', error);
        res.status(500).json({
            message: 'Failed to retrieve contributions.',
            error: (error as Error).message,
        });
    }
};
