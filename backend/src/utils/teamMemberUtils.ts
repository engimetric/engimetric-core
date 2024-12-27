import { Pool } from 'pg';
import { TeamMember } from '../models/TeamMember';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false, // Set to true if you have a valid SSL cert
    },
});

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
 * console.log(teamMembers);
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
export const fetchTeamMembers = async (teamId: number): Promise<TeamMember[]> => {
    const result = await pool.query('SELECT * FROM team_members WHERE team_id = $1', [teamId]);
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
};

/**
 * Fetch a single team member by ID. If the team member does not exist, it will return `undefined`.
 * @param id - The ID of the team member
 * @example
 * const teamMember = await fetchTeamMemberById(1);
 * console.log(teamMember);
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
export const fetchTeamMemberById = async (id: number): Promise<TeamMember | undefined> => {
    const result = await pool.query('SELECT * FROM team_members WHERE id = $1', [id]);
    if (result.rows.length === 0) return undefined;

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
};

/**
 * Create or Update a team member. If the team member already exists, it will be updated.
 * @param teamMember - The team member object to create or update
 * @example
 * await createOrUpdateTeamMember({
 *   id: 1,
 *   teamId: 1,
 *   fullName: 'Full Name',
 *   email: ' [email protected]',
 *   userId: 1,
 *   aliases: ['alias1', 'alias2'],
 *   metrics: {
 *     '2021-09': {
 *       'slack': {
 *       'messages': 100,
 *       'reactions': 50,
 *     },
 *   },
 *   createdAt: new Date(),
 *   updatedAt: new Date(),
 * });
 * console.log('Team member created or updated successfully.');
 */
export const createOrUpdateTeamMember = async (teamMember: Partial<TeamMember>): Promise<void> => {
    if (teamMember.id) {
        // Update existing Team Member
        await pool.query(
            `UPDATE team_members 
             SET team_id = $2,
                 full_name = $3,
                 email = $4,
                 user_id = $5,
                 aliases = $6::TEXT[],
                 metrics = $7::JSONB,
                 updated_at = NOW()
             WHERE id = $1`,
            [
                teamMember.id,
                teamMember.teamId,
                teamMember.fullName,
                teamMember.email || null,
                teamMember.userId || null,
                teamMember.aliases || [],
                teamMember.metrics || {},
            ],
        );
    } else {
        // Insert new Team Member
        await pool.query(
            `INSERT INTO team_members (team_id, full_name, email, user_id, aliases, metrics, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5::TEXT[], $6::JSONB, NOW(), NOW())`,
            [
                teamMember.teamId,
                teamMember.fullName,
                teamMember.email || null,
                teamMember.userId || null,
                teamMember.aliases || [],
                teamMember.metrics || {},
            ],
        );
    }
};

/**
 * Delete a team member by ID. This operation is irreversible.
 * @param id - The ID of the team member
 * @example
 * await deleteTeamMember(1);
 * console.log('Team member deleted successfully.');
 */
export const deleteTeamMember = async (id: number): Promise<void> => {
    await pool.query('DELETE FROM team_members WHERE id = $1', [id]);
};

/**
 * Fetch team members with their aliases for a given team ID.
 * This function is used to map aliases to full names.
 * @param teamId - The ID of the team
 * @returns An array of team members with aliases and full names
 * @example
 * const teamMembers = await fetchTeamMembersWithAliases(1);
 * const aliases = fetchTeamMemberAliases(1);
 * console.log(aliases);
 * // {
 * //   'alias1': 'Full Name 1',
 * //   'alias2': 'Full Name 2',
 * //   ...
 * // }
 */
export const fetchTeamMembersWithAliases = async (teamId: number): Promise<TeamMember[]> => {
    const result = await pool.query(
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
};

/**
 * Fetch team member aliases for a specific team.
 *
 * @param teamId - The ID of the team
 * @returns A record mapping aliases to full names
 * @example
 * const aliases = await fetchTeamMemberAliases(1);
 * console.log(aliases);
 * // {
 * //   'alias1': 'Full Name 1',
 * //   'alias2': 'Full Name 2',
 * //   ...
 * // }
 */
export const fetchTeamMemberAliases = async (teamId: number): Promise<Record<string, string>> => {
    const result = await pool.query(
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
 * @example
 * await saveData(1, {
 *   1: {
 *     'slack': {
 *       'messages': 100,
 *       'reactions': 50,
 *   },
 *   2: {
 *     'slack': {
 *       'messages': 200,
 *       'reactions': 100,
 *   },
 * }, '2021-09');
 * console.log('Data saved successfully.');
 * @returns A promise that resolves when the data is saved
 * @throws Will throw an error if the data is not saved
 */
export const saveData = async (
    teamId: number,
    data: Record<number, Record<string, Record<string, number>>>,
    month: string,
) => {
    const result = await pool.query(
        `SELECT id, metrics 
         FROM team_members 
         WHERE team_id = $1`,
        [teamId],
    );

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
                        console.warn(`🚨 Metric value for '${metric}' in '${integration}' is not a number.`);
                        continue;
                    }

                    if (!existingMetrics[month][integration][metric]) {
                        existingMetrics[month][integration][metric] = 0;
                    }

                    existingMetrics[month][integration][metric] += value;
                }
            }
        }

        await pool.query(
            `UPDATE team_members 
             SET metrics = $1, updated_at = NOW() 
             WHERE id = $2 AND team_id = $3`,
            [JSON.stringify(existingMetrics), memberId, teamId],
        );
    }
};
