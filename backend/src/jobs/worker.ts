import moment from 'moment';
import { fetchTeamMembersWithAliases } from '../utils/teamMemberUtils';
import { fetchGithubData, processPullRequest, saveData } from '../utils/githubUtils';
import { fetchIntegrationSettingByName } from '../utils/settingsUtils';

/**
 * Refresh Integration Data
 *
 * @description This function fetches data for the last 12 months and processes it.
 * It then saves the aggregated data to the database.
 * The data is fetched from the respective API and processed to calculate contributions for each team member.
 * The contributions are then saved in the database.
 * The function is used to manually trigger a data sync for a specific integration.
 * @param teamId - The ID of the team
 * @param integration - The name of the integration (e.g., GitHub, Jira)
 * @example
 * ```javascript
 * refreshIntegrationData(1, 'GitHub');
 * ```
 * @throws Error if the data could not be refreshed
 * @returns A promise that resolves when the data has been refreshed
 */
export const refreshIntegrationData = async (teamId: number, integration: string) => {
    // Generate an array of the past 12 months in 'YYYY-MM' format
    const past12Months: { month: string; startDate: string; endDate: string }[] = Array.from(
        { length: 12 },
        (_, i) => {
            const month = moment().subtract(i, 'months');
            return {
                month: month.format('YYYY-MM'),
                startDate: month.startOf('month').format('YYYY-MM-DD'),
                endDate: month.endOf('month').format('YYYY-MM-DD'),
            };
        },
    );

    try {
        console.log(`🛠️ Refreshing data for Team ID: ${teamId}, Integration: ${integration}`);

        // Fetch Integration Settings
        const integrationSettings = await fetchIntegrationSettingByName(teamId, integration);

        if (!integrationSettings || !integrationSettings.enabled) {
            console.warn(`⚠️ Integration '${integration}' is not enabled for Team ID: ${teamId}`);
            return;
        }

        for (const { month, startDate, endDate } of past12Months) {
            console.log(`📅 [${integration}] Syncing Month: ${month}`);

            let integrationData;

            switch (integration) {
                case 'GitHub':
                    integrationData = await fetchGithubData(integrationSettings, { startDate, endDate });
                    break;
                default:
                    console.warn(`⚠️ Integration '${integration}' is not supported.`);
                    continue;
            }

            if (!integrationData || integrationData.length === 0) {
                console.warn(
                    `⚠️ No data found for Team ID: ${teamId}, Integration: ${integration}, Month: ${month}`,
                );
                continue;
            }

            const teamMembers = await fetchTeamMembersWithAliases(teamId);
            const allData: Record<
                number,
                { integration: string; merges: number; reviews: number; changes: number }
            > = {};

            // Process integration data
            for (const item of integrationData) {
                const processedData = processPullRequest(item, teamMembers);
                if (processedData) {
                    for (const [memberId, value] of Object.entries(processedData)) {
                        if (!allData[Number(memberId)]) {
                            allData[Number(memberId)] = {
                                integration,
                                merges: 0,
                                reviews: 0,
                                changes: 0,
                            };
                        }
                        allData[Number(memberId)].merges += value.merges;
                        allData[Number(memberId)].reviews += value.reviews;
                        allData[Number(memberId)].changes += value.changes;
                    }
                }
            }

            // Save data for the specific month
            await saveData(teamId, allData, month);

            console.log(
                `✅ Data refreshed successfully for Team ID: ${teamId}, Integration: ${integration}, Month: ${month}`,
            );
        }

        console.log(`✅ All data refreshed successfully for Team ID: ${teamId}, Integration: ${integration}`);
    } catch (error) {
        console.error(
            `❌ Failed to refresh integration data for Team ID: ${teamId}, Integration: ${integration}`,
            error,
        );
    }
};
