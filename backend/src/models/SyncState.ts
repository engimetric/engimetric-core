/**
 * SyncState Interface
 *
 * Tracks the synchronization state for integrations.
 * @typedef {Object} SyncState
 * @property {number} teamId - Foreign key to the team
 * @property {string} integration - Integration name (e.g., 'GitHub', 'Jira')
 * @property {boolean} isSyncing - Indicates if the sync is currently active
 * @property {Date | null} lastStartedAt - Timestamp when the sync started
 * @property {Date | null} lastHeartbeatAt - Last updated timestamp for heartbeat
 * @property {Date | null} lastSyncedAt - Timestamp when the sync was last successfully completed
 * @property {Date | null} lastFailedAt - Timestamp when the sync last failed
 * @example
 * {
 * teamId: 1,
 * integration: 'GitHub',
 * isSyncing: true,
 * lastStartedAt: '2021-08-01T00:00:00.000Z',
 * lastHeartbeatAt: '2021-08-01T00:00:00.000Z',
 * lastSyncedAt: '2021-08-01T00:00:00.000Z',
 * lastFailedAt: '2021-08-01T00:00:00.000Z'
 * }
 */
export interface SyncState {
    teamId: number; // Foreign key to the team
    integration: string; // Integration name (e.g., 'GitHub', 'Jira')
    isSyncing: boolean; // Indicates if the sync is currently active
    lastStartedAt: Date | null; // Timestamp when the sync started
    lastHeartbeatAt: Date | null; // Last updated timestamp for heartbeat
    lastSyncedAt: Date | null; // Timestamp when the sync was last successfully completed
    lastFailedAt: Date | null; // Timestamp when the sync last failed
}
