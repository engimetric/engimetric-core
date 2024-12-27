import cron from 'node-cron';
import { fetchAllTeams } from '../utils/teamUtils';
import { fetchIntegrationSettingsByTeamId } from '../utils/settingsUtils';
import {
    getSyncState,
    markSyncStart,
    markSyncComplete,
    markSyncFailed,
    updateHeartbeat,
    detectStaleSyncs,
} from '../utils/syncStateUtils';
import * as GitHubIntegration from '../integrations/github';

const INTEGRATION_HANDLERS: Record<string, (teamId: number) => Promise<void>> = {
    GitHub: GitHubIntegration.syncIntegration,
};

/**
 * @description This function schedules a sync job for a team at a specific time slot.
 * The time slot is calculated based on the team ID and the total number of slots.
 * The sync job is scheduled using a cron expression.
 * The cron expression is calculated based on the slot number.
 * The sync job fetches integration settings for the team and syncs data for each enabled integration.
 * The sync job marks the start and end of the sync process and handles any errors that occur during the sync.
 * The function is used to schedule sync jobs for each team in the application.
 * The sync jobs are staggered across a time window to prevent load spikes.
 * The function is called by the scheduler to schedule team sync jobs.
 * The scheduler is responsible for managing the sync jobs for each team and monitoring stale sync states.
 * @param teamId - The ID of the team
 * @param slot - The time slot for the team sync job
 * @example
 * ```javascript
 * scheduleTeamSync(1, 0);
 * ```
 * @returns void
 * @throws Error if the team sync job could not be scheduled
 * @see startScheduler
 */
const scheduleTeamSync = (teamId: number, slot: number) => {
    const hour = Math.floor(slot / 60);
    const minute = slot % 60;

    const cronExpression = `${minute} ${hour} * * *`;

    cron.schedule(cronExpression, async () => {
        console.log(`⏳ Syncing Team ID: ${teamId} at ${hour}:${minute}`);
        const settings = await fetchIntegrationSettingsByTeamId(teamId);

        for (const [integration, config] of Object.entries(settings?.integrations || {})) {
            if (!config.enabled || !INTEGRATION_HANDLERS[integration]) {
                console.warn(`⚠️ Skipping disabled or unsupported integration: ${integration}`);
                continue;
            }

            const syncState = await getSyncState(teamId, integration);

            if (syncState?.is_syncing) {
                console.warn(`🚧 Integration '${integration}' is already syncing for Team ID: ${teamId}`);
                continue;
            }

            try {
                await markSyncStart(teamId, integration);
                console.log(`🚀 Syncing integration '${integration}' for Team ID: ${teamId}`);

                // Heartbeat loop to ensure active status
                const heartbeatInterval = setInterval(
                    async () => {
                        console.log(`💓 Heartbeat for Team ID: ${teamId}, Integration: ${integration}`);
                        await updateHeartbeat(teamId, integration);
                    },
                    2 * 60 * 1000,
                ); // Every 2 minutes

                await INTEGRATION_HANDLERS[integration](teamId);

                clearInterval(heartbeatInterval);
                await markSyncComplete(teamId, integration);
            } catch (error) {
                console.error(`❌ Sync failed for '${integration}' on Team ID: ${teamId}`, error);
                await markSyncFailed(teamId, integration);
            }
        }
    });

    console.log(`✅ Scheduled Team ID: ${teamId} at ${hour}:${minute}`);
};

/**
 * @description This function detects and resets syncs that have been stale for more than 10 minutes.
 * It marks the sync as failed and logs a warning.
 * The function is used to reset stale sync states.
 * The stale sync states are monitored and reset every 10 minutes.
 * The function is called by the scheduler to handle stale sync states.
 * @example
 * ```javascript
 * handleStaleSyncs();
 * ```
 * @returns void
 * @throws Error if the stale sync states could not be handled
 */
const handleStaleSyncs = async () => {
    console.log('🔍 Checking for stale sync states...');
    const staleSyncs = await detectStaleSyncs();

    for (const { team_id, integration } of staleSyncs) {
        console.warn(
            `🚨 Detected stale sync: Team ID ${team_id}, Integration: ${integration}. Marking as failed.`,
        );
        await markSyncFailed(team_id, integration);
    }

    console.log('✅ Stale sync states handled.');
};

/**
 * @description This function initializes the scheduler with sync jobs and stale sync monitoring.
 * It staggers team sync jobs across a time window to prevent load spikes.
 * It resets stale sync states every 10 minutes.
 * It resets stale sync states at 11:45 PM daily.
 * It starts a heartbeat loop to ensure active sync status.
 * It logs the scheduler initialization status.
 * The function is used to start the scheduler for the application.
 * The scheduler is responsible for managing the sync jobs for each team and monitoring stale sync states.
 * The sync jobs are staggered across a time window to prevent load spikes.
 * The stale sync states are monitored and reset every 10 minutes.
 * The scheduler is started by calling the `startScheduler` function.
 * @example
 * ```javascript
 * startScheduler();
 * ```
 * @returns void
 * @throws Error if the scheduler fails to start
 */
export const startScheduler = async () => {
    console.log('⏰ Initializing Scheduler...');

    // Handle stale sync states every 10 minutes
    cron.schedule('*/10 * * * *', async () => {
        await handleStaleSyncs();
    });

    const teams = await fetchAllTeams();
    const totalSlots = 60 * 6; // Sync over 6 hours (12:00 AM – 6:00 AM)

    teams.forEach((team, index) => {
        const slot = index % totalSlots; // Wrap around slots if more teams than slots
        scheduleTeamSync(team.id, slot);
    });

    // Daily reset stale syncs at 11:45 PM
    cron.schedule('45 23 * * *', async () => {
        console.log('🔄 Resetting stale sync states...');
        await handleStaleSyncs();
    });

    console.log('✅ Scheduler started: Team sync staggered, stale syncs monitored, heartbeat active.');
};
