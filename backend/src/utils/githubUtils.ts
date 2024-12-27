import { Octokit } from '@octokit/rest';
import { TeamMember } from '../models/TeamMember';
import { Pool } from 'pg';
import { IntegrationSettings } from 'models/Settings';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false, // Set to true if you have a valid SSL cert
    },
});

/**
 * Fetch real GitHub Pull Request data.
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
        console.log(
            `🔄 Fetching GitHub Pull Requests for org: ${org}, range: ${range.startDate} to ${range.endDate}`,
        );

        const { data } = await octokit.search.issuesAndPullRequests({
            q: `org:${org} is:pr state:closed merged:${range.startDate}..${range.endDate}`,
            per_page: 100,
        });

        console.log(`✅ Fetched ${data.items.length} Pull Requests from GitHub`);
        return data.items;
    } catch (error) {
        console.error(`🚨 Error fetching GitHub data: ${(error as Error).message}`);
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
    [memberId: number]: { integration: string; merges: number; reviews: number; changes: number };
} | null => {
    const userLogin = pullRequest.user?.login;

    // Match GitHub username with team member aliases
    const matchingMember = teamMembers.find((member) => member.aliases.includes(userLogin));

    if (!matchingMember) {
        console.warn(`No matching team member found for GitHub user: ${userLogin}`);
        return null;
    }

    console.log(`🔍 Matched GitHub user '${userLogin}' with team member '${matchingMember.fullName}'`);

    return {
        [matchingMember.id]: {
            integration: 'GitHub',
            merges: 1,
            reviews: 0,
            changes: pullRequest.additions || 0 + pullRequest.deletions || 0,
        },
    };
};

/**
 * Save processed data into TeamMember metrics structure in PostgreSQL.
 */
export const saveData = async (
    teamId: number,
    data: Record<number, { integration: string; merges: number; reviews: number; changes: number }>,
    month: string,
) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        for (const [memberId, metrics] of Object.entries(data)) {
            // Fetch existing metrics from the database
            const result = await client.query(
                `SELECT metrics FROM team_members WHERE id = $1 AND team_id = $2`,
                [memberId, teamId],
            );

            let existingMetrics = result.rows[0]?.metrics || {};

            if (!existingMetrics[month]) {
                existingMetrics[month] = {};
            }

            if (!existingMetrics[month][metrics.integration]) {
                existingMetrics[month][metrics.integration] = {
                    merges: 0,
                    reviews: 0,
                    changes: 0,
                };
            }

            // Update the metrics dynamically
            existingMetrics[month][metrics.integration].merges += metrics.merges;
            existingMetrics[month][metrics.integration].reviews += metrics.reviews;
            existingMetrics[month][metrics.integration].changes += metrics.changes;

            // Update the database with the new metrics
            await client.query(
                `UPDATE team_members SET metrics = $1, updated_at = NOW() WHERE id = $2 AND team_id = $3`,
                [JSON.stringify(existingMetrics), memberId, teamId],
            );
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(`Error saving metrics to database: ${error}`);
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Retrieve contributions from the TeamMember metrics structure in PostgreSQL.
 *
 * @param teamId - The ID of the team
 * @param startDate - Start date for filtering contributions (YYYY-MM)
 * @param endDate - End date for filtering contributions (YYYY-MM)
 */
export const getContributions = async (teamId: number, startDate: string, endDate: string) => {
    const client = await pool.connect();
    try {
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
            changes: number;
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
                                    changes: Number(values.changes) || 0,
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
    } catch (error) {
        console.error(`Error retrieving contributions from database: ${error}`);
        throw error;
    } finally {
        client.release();
    }
};
