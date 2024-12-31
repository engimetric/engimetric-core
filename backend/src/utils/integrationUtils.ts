import moment from 'moment';
import { fetchTeamMembersWithAliases } from './teamMemberUtils';
import { saveData } from './teamMemberUtils';
import logger from './logger';
import { runWithTransaction, runWithSchedulerTransaction } from './databaseUtils';

/**
 * Sync integration data for a specific team. This function fetches data for the last 12 months and processes it.
 *
 * @param teamId - The ID of the team
 * @param integration - The name of the integration (e.g., GitHub, Jira)
 * @param startingMonth - The month to start syncing from
 * @param fetchData - A callback to fetch integration data
 * @param processData - A callback to process integration data
 * @param monthsBack - Number of months to sync (default: 12)
 * @param requestingUserId - The ID of the requesting user (optional, not required for scheduler)
 */
export const syncIntegrationData = async (
    teamId: number,
    integration: string,
    startingMonth: string,
    fetchData: (settings: any, startDate: string, endDate: string) => Promise<any[]>,
    processData: (data: any[], teamMembers: any[]) => Record<number, Record<string, number>>,
    monthsBack: number = 12,
    requestingUserId?: number,
) => {
    const runTransaction = requestingUserId ? runWithTransaction : runWithSchedulerTransaction;

    return runTransaction(
        async (client) => {
            logger.debug(`🔄 [${integration}] Syncing data for Team ID: ${teamId}`);

            // Fetch integration settings
            const result = await client.query(`SELECT integrations FROM settings WHERE team_id = $1`, [
                teamId,
            ]);

            const integrationSettings = result.rows[0]?.integrations?.[integration];

            if (!integrationSettings || !integrationSettings.enabled) {
                logger.warn(
                    `🚨 [${integration}] Integration is disabled or not configured for team ${teamId}`,
                );
                return;
            }

            // Fetch team members
            const teamMembers = await fetchTeamMembersWithAliases(teamId, requestingUserId || 0);

            for (let i = 0; i < monthsBack; i++) {
                const month = moment(startingMonth).subtract(i, 'months').format('YYYY-MM');
                const startDate = moment(month).startOf('month').format('YYYY-MM-DD');
                const endDate = moment(month).endOf('month').format('YYYY-MM-DD');

                logger.debug(`📅 [${integration}] Syncing Month: ${month}`);

                // Fetch raw data from integration
                const rawData = await fetchData(integrationSettings, startDate, endDate);

                if (!rawData || rawData.length === 0) {
                    logger.warn(`🚨 [${integration}] No data found for month: ${month}`);
                    continue;
                }

                // Process fetched data
                const processedData = processData(rawData, teamMembers);

                const formattedData: Record<number, Record<string, Record<string, number>>> = {};

                for (const [memberId, metrics] of Object.entries(processedData)) {
                    const numericMemberId = Number(memberId);
                    formattedData[numericMemberId] = formattedData[numericMemberId] || {};
                    formattedData[numericMemberId][integration] =
                        formattedData[numericMemberId][integration] || {};

                    for (const [metricKey, metricValue] of Object.entries(metrics)) {
                        if (typeof metricValue === 'number') {
                            formattedData[numericMemberId][integration][metricKey] =
                                (formattedData[numericMemberId][integration][metricKey] || 0) + metricValue;
                        } else {
                            logger.warn(
                                `🚨 [${integration}] Metric value for '${metricKey}' is not a number. Skipping...`,
                            );
                        }
                    }
                }

                // Save data into the database
                await saveData(teamId, formattedData, month, requestingUserId || 0);
            }

            logger.debug(`✅ [${integration}] Data synced successfully for Team ID: ${teamId}`);
        },
        {
            transactional: true,
            requestingUserId,
        },
    );
};
