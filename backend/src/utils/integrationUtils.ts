import moment from 'moment';
import { fetchTeamMembersWithAliases } from './teamMemberUtils';
import { saveData } from './teamMemberUtils';
import { Pool } from 'pg';
import dotenv from 'dotenv';

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false,
    },
});

/**
 * Sync integration data for a specific team. This function fetches data for the last 12 months and processes it.
 *
 * @param teamId - The ID of the team
 * @param integration - The name of the integration (e.g., GitHub, Jira)
 * @param fetchData - A callback to fetch integration data
 * @param processData - A callback to process integration data
 * @param monthsBack - Number of months to sync (default: 12)
 * @example
 * ```javascript
 * syncIntegrationData(1, 'github', fetchGithubData, processGithubData, 12);
 * ```
 */
export const syncIntegrationData = async (
    teamId: number,
    integration: string,
    startingMonth: string,
    fetchData: (settings: any, startDate: string, endDate: string) => Promise<any[]>,
    processData: (data: any[], teamMembers: any[]) => Record<number, Record<string, number>>,
    monthsBack: number = 12,
) => {
    console.log(`🔄 [${integration}] Syncing data for Team ID: ${teamId}`);

    const client = await pool.connect();
    try {
        // Fetch integration settings from the database
        const result = await client.query(`SELECT integrations FROM settings WHERE team_id = $1`, [teamId]);

        const integrationSettings = result.rows[0]?.integrations?.[integration];

        if (!integrationSettings || !integrationSettings.enabled) {
            console.warn(`🚨 [${integration}] Integration is disabled or not configured for team ${teamId}`);
            return;
        }

        const teamMembers = await fetchTeamMembersWithAliases(teamId);

        for (let i = 0; i < monthsBack; i++) {
            const month = moment(startingMonth).subtract(i, 'months').format('YYYY-MM');
            const startDate = moment(month).startOf('month').format('YYYY-MM-DD');
            const endDate = moment(month).endOf('month').format('YYYY-MM-DD');

            console.log(`📅 [${integration}] Syncing Month: ${month}`);

            const rawData = await fetchData(integrationSettings, startDate, endDate);

            if (!rawData || rawData.length === 0) {
                console.warn(`🚨 [${integration}] No data found for month: ${month}`);
                continue;
            }

            const processedData = processData(rawData, teamMembers);

            const formattedData: Record<number, Record<string, Record<string, number>>> = {};

            for (const [memberId, metrics] of Object.entries(processedData)) {
                if (!formattedData[Number(memberId)]) {
                    formattedData[Number(memberId)] = {};
                }

                if (!formattedData[Number(memberId)][integration]) {
                    formattedData[Number(memberId)][integration] = {};
                }

                for (const [metricKey, metricValue] of Object.entries(metrics)) {
                    if (typeof metricValue === 'number') {
                        formattedData[Number(memberId)][integration][metricKey] =
                            (formattedData[Number(memberId)][integration][metricKey] || 0) + metricValue;
                    } else {
                        console.warn(
                            `🚨 [${integration}] Metric value for '${metricKey}' is not a number. Skipping...`,
                        );
                    }
                }
            }

            saveData(teamId, formattedData, month);
        }

        console.log(`✅ [${integration}] Data synced successfully for Team ID: ${teamId}`);
    } catch (error) {
        console.error(`🚨 Error syncing [${integration}] data:`, error);
        throw error;
    } finally {
        client.release();
    }
};
