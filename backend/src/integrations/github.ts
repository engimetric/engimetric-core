import moment from 'moment';
import { fetchGithubData, processPullRequest } from '../utils/githubUtils';
import { syncIntegrationData } from '../utils/integrationUtils';
import { TeamMember } from '../models/TeamMember';

/**
 * Process Raw GitHub Pull Request Data
 *
 * @param rawData - The raw pull request data fetched from GitHub
 * @param teamMembers - The list of team members to match with PR data
 * @returns Aggregated metrics by team member ID
 */
const processGithubData = (
    rawData: any[],
    teamMembers: TeamMember[],
): Record<number, Record<string, number>> => {
    const aggregatedData: Record<number, Record<string, number>> = {};

    for (const pr of rawData) {
        const prData = processPullRequest(pr, teamMembers);
        if (!prData) continue;

        for (const [fullName, metrics] of Object.entries(prData)) {
            const member = teamMembers.find((m) => m.fullName === fullName);
            if (!member) {
                console.warn(`🚨 No matching member found for ${fullName}`);
                continue;
            }

            if (!aggregatedData[member.id]) {
                aggregatedData[member.id] = {};
            }

            // Aggregate metrics
            for (const [metricKey, metricValue] of Object.entries(metrics)) {
                if (typeof metricValue === 'number') {
                    aggregatedData[member.id][metricKey] =
                        (aggregatedData[member.id][metricKey] || 0) + metricValue;
                } else {
                    console.warn(
                        `🚨 Metric value for '${metricKey}' in '${member.fullName}' is not a number. Skipping...`,
                    );
                }
            }
        }
    }

    return aggregatedData;
};

/**
 * Sync GitHub Integration Data for a Team
 *
 * @param teamId - The ID of the team to sync data for
 */
export const syncIntegration = async (teamId: number) => {
    await syncIntegrationData(
        teamId,
        'GitHub',
        moment().format('YYYY-MM'),
        async (settings, startDate, endDate) => {
            // Fetch GitHub data using provided settings
            return fetchGithubData(settings, { startDate, endDate });
        },
        processGithubData,
        12,
    );
};
