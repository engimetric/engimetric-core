import { TeamMember } from '../models/TeamMember';
import { runWithTransaction, runWithSchedulerTransaction } from './databaseUtils';
import logger from './logger';

/**
 * Metric Filters for aggregation. Used to filter metrics by month, integration, and metric.
 */
interface MetricFilter {
    month?: string;
    integration?: string;
    metric?: string;
}

/**
 * Fetch all team members for a given team. If no team members are found, it will return an empty array.
 * @param teamId - The ID of the team
 * @example
 * const teamMembers = await fetchTeamMembers(1);
 * logger.info(teamMembers);
 * // [
 * //   {
 * //     id: 1,
 * //     teamId: 1,
 * //     fullName: 'Full Name 1',
 * //     email: ' [email protected]',
 * //     userId: 1,
 * //     aliases: ['alias1', 'alias2'],
 * //     metrics: {
 * //       '2021-09': {
 * //         'slack': {
 * //           'messages': 100,
 * //           'reactions': 50,
 * //         },
 * //       },
 * //     },
 * //     createdAt: new Date(),
 * //     updatedAt: new Date(),
 * //   },
 * //   {
 * //     id: 2,
 * //     teamId: 1,
 * //     fullName: 'Full Name 2',
 * //     email: ' [email protected]',
 * //     userId: 2,
 * //     aliases: ['alias3', 'alias4'],
 * //     metrics: {
 * //       '2021-09': {
 * //         'slack': {
 * //           'messages': 200,
 * //           'reactions': 100,
 * //         },
 * //       },
 * //     },
 * //     createdAt: new Date(),
 * //     updatedAt: new Date(),
 * //   },
 * // ]
 * @returns An array of team members if found, otherwise an empty array
 */
export const fetchTeamMembers = async (teamId: number, requestingUserId: number): Promise<TeamMember[]> => {
    return runWithTransaction(
        async (client) => {
            const result = await client.query('SELECT * FROM team_members WHERE team_id = $1', [teamId]);
            await client.query('COMMIT');

            return result.rows.map((row) => ({
                id: row.id,
                teamId: row.team_id,
                fullName: row.full_name,
                email: row.email,
                userId: row.user_id,
                aliases: row.aliases || [],
                metrics: row.metrics || {},
                createdAt: row.created_at,
                updatedAt: row.updated_at,
            }));
        },
        { transactional: true, requestingUserId },
    );
};

/**
 * Fetch a single team member by ID. If the team member does not exist, it will return `undefined`.
 * @param id - The ID of the team member
 * @example
 * const teamMember = await fetchTeamMemberById(1);
 * logger.info(teamMember);
 * // {
 * //   id: 1,
 * //   teamId: 1,
 * //   fullName: 'Full Name',
 * //   email: ' [email protected]',
 * //   userId: 1,
 * //   aliases: ['alias1', 'alias2'],
 * //   metrics: {
 * //     '2021-09': {
 * //       'slack': {
 * //       'messages': 100,
 * //       'reactions': 50,
 * //     },
 * //   },
 * //   createdAt: new Date(),
 * //   updatedAt: new Date(),
 * // }
 * @returns A team member object if found, otherwise `undefined`
 */
export const fetchTeamMemberById = async (
    id: number,
    requestingUserId: number,
): Promise<TeamMember | undefined> => {
    return runWithTransaction(
        async (client) => {
            const result = await client.query('SELECT * FROM team_members WHERE id = $1', [id]);
            await client.query('COMMIT');

            if (result.rows.length === 0) {
                return undefined;
            }

            const row = result.rows[0];
            return {
                id: row.id,
                teamId: row.team_id,
                fullName: row.full_name,
                email: row.email,
                userId: row.user_id,
                aliases: row.aliases || [],
                metrics: row.metrics || {},
                createdAt: row.created_at,
                updatedAt: row.updated_at,
            };
        },
        { transactional: true, requestingUserId },
    );
};

/**
 * Create or Update a team member. If the team member already exists, it will be updated.
 *
 * @param teamMember - The team member object to create or update
 * @param requestingUserId - The ID of the requesting user (for RLS enforcement)
 * @example
 * await createOrUpdateTeamMember({
 *   id: 1,
 *   teamId: 1,
 *   fullName: 'Full Name',
 *   email: '[email@example.com]',
 *   userId: 1,
 *   aliases: ['alias1', 'alias2'],
 *   metrics: { '2024-09': { github: { commits: 100 } } },
 * });
 */
export const createOrUpdateTeamMember = async (
    teamMember: Partial<TeamMember>,
    requestingUserId: number,
): Promise<void> => {
    return runWithTransaction(
        async (client) => {
            // Use an upsert to handle both insert and update cases
            await client.query(
                `
            INSERT INTO team_members (
                id,
                team_id,
                full_name,
                email,
                user_id,
                aliases,
                metrics,
                created_at,
                updated_at
            ) VALUES (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6::TEXT[],
                $7::JSONB,
                NOW(),
                NOW()
            )
            ON CONFLICT (id) DO UPDATE SET
                team_id = EXCLUDED.team_id,
                full_name = EXCLUDED.full_name,
                email = EXCLUDED.email,
                user_id = EXCLUDED.user_id,
                aliases = EXCLUDED.aliases,
                metrics = EXCLUDED.metrics,
                updated_at = NOW();
            `,
                [
                    teamMember.id || null, // `id` is nullable in insert mode
                    teamMember.teamId,
                    teamMember.fullName,
                    teamMember.email || null,
                    teamMember.userId || null,
                    teamMember.aliases || [],
                    teamMember.metrics || {},
                ],
            );
        },
        { transactional: true, requestingUserId },
    );
};

/**
 * Delete a team member by ID. This operation is irreversible.
 * @param id - The ID of the team member
 * @example
 * await deleteTeamMember(1);
 * logger.info('Team member deleted successfully.');
 */
export const deleteTeamMember = async (id: number, requestingUserId: number): Promise<void> => {
    return runWithTransaction(
        async (client) => {
            await client.query('DELETE FROM team_members WHERE id = $1', [id]);
        },
        { transactional: true, requestingUserId },
    );
};

/**
 * Fetch team members with their aliases for a given team ID.
 * This function is used to map aliases to full names.
 * @param teamId - The ID of the team
 * @returns An array of team members with aliases and full names
 * @example
 * const teamMembers = await fetchTeamMembersWithAliases(1);
 * const aliases = fetchTeamMemberAliases(1);
 * logger.info(aliases);
 * // {
 * //   'alias1': 'Full Name 1',
 * //   'alias2': 'Full Name 2',
 * //   ...
 * // }
 */
export const fetchTeamMembersWithAliases = async (
    teamId: number,
    requestingUserId?: number,
): Promise<TeamMember[]> => {
    const runTransaction = requestingUserId ? runWithTransaction : runWithSchedulerTransaction;
    return runTransaction(
        async (client) => {
            const result = await client.query(
                `SELECT id, team_id, full_name, email, user_id, aliases, metrics, created_at, updated_at 
             FROM team_members 
             WHERE team_id = $1`,
                [teamId],
            );
            return result.rows.map((row) => ({
                id: row.id,
                teamId: row.team_id,
                fullName: row.full_name,
                email: row.email,
                userId: row.user_id,
                aliases: row.aliases || [],
                metrics: row.metrics || {},
                createdAt: row.created_at,
                updatedAt: row.updated_at,
            }));
        },
        { transactional: true, requestingUserId },
    );
};

/**
 * Fetch team member aliases for a specific team.
 *
 * @param teamId - The ID of the team
 * @returns A record mapping aliases to full names
 * @example
 * const aliases = await fetchTeamMemberAliases(1);
 * logger.info(aliases);
 * // {
 * //   'alias1': 'Full Name 1',
 * //   'alias2': 'Full Name 2',
 * //   ...
 * // }
 */
export const fetchTeamMemberAliases = async (
    teamId: number,
    requestingUserId: number,
): Promise<Record<string, string>> => {
    return runWithTransaction(
        async (client) => {
            const result = await client.query(
                `SELECT full_name, UNNEST(aliases) AS alias 
             FROM team_members 
             WHERE team_id = $1`,
                [teamId],
            );

            const aliases: Record<string, string> = {};
            result.rows.forEach((row) => {
                aliases[row.alias] = row.full_name;
            });

            return aliases;
        },
        { transactional: true, requestingUserId },
    );
};

/**
 * Fetch team members with their metrics for a given team ID.
 */
export const getMetricsFromTeamMembers = (
    teamMembers: TeamMember[],
    filters: MetricFilter = {},
): { summaryMetrics: Record<string, Record<string, number>>; detailedMetrics: Record<string, any> } => {
    const { month, integration, metric } = filters;

    const summaryMetrics: Record<string, Record<string, number>> = {};
    const detailedMetrics: Record<string, any> = {};

    teamMembers.forEach((member) => {
        if (!member.metrics) return;

        if (!summaryMetrics[member.fullName]) summaryMetrics[member.fullName] = {};
        if (!detailedMetrics[member.fullName]) detailedMetrics[member.fullName] = {};

        for (const [metricMonth, integrations] of Object.entries(member.metrics)) {
            if (month && metricMonth !== month) {
                continue; // Skip if month doesn't match
            }

            if (!summaryMetrics[member.fullName][metricMonth]) {
                summaryMetrics[member.fullName][metricMonth] = 0;
            }

            if (!detailedMetrics[member.fullName][metricMonth]) {
                detailedMetrics[member.fullName][metricMonth] = {};
            }

            for (const [integrationKey, metrics] of Object.entries(integrations)) {
                if (integration && integrationKey !== integration) {
                    continue; // Skip if integration doesn't match
                }

                if (!detailedMetrics[member.fullName][metricMonth][integrationKey]) {
                    detailedMetrics[member.fullName][metricMonth][integrationKey] = {};
                }

                for (const [metricKey, value] of Object.entries(metrics)) {
                    if (metric && metricKey !== metric) {
                        continue; // Skip if metric doesn't match
                    }

                    if (!detailedMetrics[member.fullName][metricMonth][integrationKey][metricKey]) {
                        detailedMetrics[member.fullName][metricMonth][integrationKey][metricKey] = 0;
                    }

                    // Aggregate detailed metrics
                    detailedMetrics[member.fullName][metricMonth][integrationKey][metricKey] += value;

                    // Aggregate into summary metrics (exclude 'changes')
                    if (metricKey !== 'changes') {
                        summaryMetrics[member.fullName][metricMonth] += value;
                    }
                }
            }
        }
    });

    return { summaryMetrics, detailedMetrics };
};

/**
 * Save processed integration data into TeamMember metrics structure.
 *
 * @param teamId - The ID of the team
 * @param data - A record mapping team member IDs to their integration data
 * @param month - The month in 'YYYY-MM' format for storing metrics
 * @param requestingUserId - The ID of the requesting user for RLS
 * @example
 * await saveData(1, {
 *   1: { slack: { messages: 100, reactions: 50 } },
 *   2: { slack: { messages: 200, reactions: 100 } },
 * }, '2024-06', 42);
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
            // Fetch all team members' metrics for the given team
            const result = await client.query(
                `SELECT id, metrics 
             FROM team_members 
             WHERE team_id = $1`,
                [teamId],
            );

            const updates: { memberId: number; metrics: any }[] = [];

            for (const row of result.rows) {
                const memberId = row.id;
                const existingMetrics = row.metrics || {};

                // Initialize month if not exists
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
                                logger.warn(
                                    `🚨 Metric value for '${metric}' in '${integration}' is not a number.`,
                                );
                                continue;
                            }

                            existingMetrics[month][integration][metric] =
                                (existingMetrics[month][integration][metric] || 0) + value;
                        }
                    }
                }

                updates.push({ memberId, metrics: existingMetrics });
            }

            // Bulk update team members' metrics
            for (const update of updates) {
                await client.query(
                    `UPDATE team_members 
                 SET metrics = $1, updated_at = NOW() 
                 WHERE id = $2 AND team_id = $3`,
                    [JSON.stringify(update.metrics), update.memberId, teamId],
                );
            }
        },
        { transactional: true, requestingUserId },
    );
};
