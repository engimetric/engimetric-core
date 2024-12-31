import { Octokit } from '@octokit/rest';
import { TeamMember } from '../models/TeamMember';
import { IntegrationSettings } from 'models/Settings';
import logger from './logger';
import { runWithTransaction, runWithSchedulerTransaction } from './databaseUtils';

/**
 * Fetch GitHub Pull Request data.
 */
export const fetchGithubData = async (
    integrationSettings: IntegrationSettings,
    range: { startDate: string; endDate: string },
) => {
    const { token, org } = integrationSettings;
    if (!token) {
        throw new Error('GitHub token is required for API access');
    }

    const octokit = new Octokit({ auth: token });

    try {
        logger.info(
            `🔄 Fetching GitHub Pull Requests for org: ${org}, range: ${range.startDate} to ${range.endDate}`,
        );

        // Use octokit.paginate to fetch all pages of results
        const results = await octokit.paginate(
            'GET /search/issues',
            {
                q: `org:${org} is:pr state:closed merged:${range.startDate}..${range.endDate}`,
                per_page: 100,
            },
            (response) => response.data.items, // Extract items from each page
        );

        logger.info(`✅ Fetched ${results.length} Pull Requests from GitHub`);
        return results;
    } catch (error) {
        logger.error(error, `🚨 Error fetching GitHub data: ${(error as Error).message}`);
        throw error;
    }
};

/**
 * Process pull request data using aliases.
 *
 * Matches GitHub usernames with team member aliases.
 */
export const processPullRequest = (
    pullRequest: any,
    teamMembers: TeamMember[],
): {
    [memberId: number]: { integration: string; merges: number; reviews: number };
} | null => {
    const userLogin = pullRequest.user?.login;

    // Match GitHub username with team member aliases
    const matchingMember = teamMembers.find((member) => member.aliases.includes(userLogin));

    if (!matchingMember) {
        console.warn(`No matching team member found for GitHub user: ${userLogin}`);
        return null;
    }

    logger.debug(`🔍 Matched GitHub user '${userLogin}' with team member '${matchingMember.fullName}'`);

    return {
        [matchingMember.id]: {
            integration: 'GitHub',
            merges: 1,
            reviews: 0,
        },
    };
};

/**
 * Save processed data into TeamMember metrics structure in PostgreSQL.
 */
export const saveData = async (
    teamId: number,
    data: Record<number, Record<string, Record<string, number>>>,
    month: string,
    requestingUserId?: number,
) => {
    const runTransaction = requestingUserId ? runWithTransaction : runWithSchedulerTransaction;
    return runTransaction(
        async (client) => {
            const result = await client.query(`SELECT id, metrics FROM team_members WHERE team_id = $1`, [
                teamId,
            ]);

            for (const row of result.rows) {
                const memberId = row.id;
                const existingMetrics = row.metrics || {};

                if (!existingMetrics[month]) {
                    existingMetrics[month] = {};
                }

                if (data[memberId]) {
                    for (const [integration, metrics] of Object.entries(data[memberId])) {
                        if (!existingMetrics[month][integration]) {
                            existingMetrics[month][integration] = {};
                        }

                        for (const [metric, value] of Object.entries(metrics)) {
                            if (typeof value !== 'number') {
                                console.warn(
                                    `🚨 Metric value for '${metric}' in '${integration}' is not a number.`,
                                );
                                continue;
                            }

                            existingMetrics[month][integration][metric] =
                                (existingMetrics[month][integration][metric] || 0) + value;
                        }
                    }
                }

                await client.query(
                    `UPDATE team_members 
                 SET metrics = $1, updated_at = NOW() 
                 WHERE id = $2 AND team_id = $3`,
                    [JSON.stringify(existingMetrics), memberId, teamId],
                );
            }
        },
        { transactional: true, requestingUserId },
    );
};

/**
 * Retrieve contributions from the TeamMember metrics structure in PostgreSQL.
 *
 * @param teamId - The ID of the team
 * @param startDate - Start date for filtering contributions (YYYY-MM)
 * @param endDate - End date for filtering contributions (YYYY-MM)
 */
export const getContributions = async (
    teamId: number,
    startDate: string,
    endDate: string,
    requestingUserId: number,
) => {
    return runWithTransaction(
        async (client) => {
            const result = await client.query(
                `SELECT id, full_name, metrics FROM team_members WHERE team_id = $1`,
                [teamId],
            );

            const contributions: {
                memberId: number;
                fullName: string;
                integration: string;
                merges: number;
                reviews: number;
            }[] = [];

            result.rows.forEach((member) => {
                const metrics = member.metrics || {};
                for (const [month, integrations] of Object.entries(metrics)) {
                    if (month >= startDate && month <= endDate) {
                        if (
                            typeof integrations === 'object' &&
                            integrations !== null &&
                            !Array.isArray(integrations)
                        ) {
                            for (const [integration, values] of Object.entries(
                                integrations as Record<string, any>,
                            )) {
                                if (
                                    typeof values === 'object' &&
                                    values !== null &&
                                    'merges' in values &&
                                    'reviews' in values &&
                                    'changes' in values
                                ) {
                                    contributions.push({
                                        memberId: member.id,
                                        fullName: member.full_name,
                                        integration,
                                        merges: Number(values.merges) || 0,
                                        reviews: Number(values.reviews) || 0,
                                    });
                                } else {
                                    console.warn(
                                        `🚨 Invalid metric structure for integration '${integration}' in member '${member.full_name}'. Skipping...`,
                                    );
                                }
                            }
                        } else {
                            console.warn(
                                `🚨 Invalid integration structure for month '${month}' in member '${member.full_name}'. Skipping...`,
                            );
                        }
                    }
                }
            });

            return contributions;
        },
        { transactional: false, requestingUserId },
    );
};
