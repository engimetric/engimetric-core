/**
 * Integration settings model
 * @typedef {Object} IntegrationSettings
 * @property {boolean} enabled - Whether the integration is active
 * @property {string | boolean | number | Date} [key] - Integration-specific configurations
 * @example
 * {
 * enabled: true,
 * token: 'abc123'
 * }
 */
export interface IntegrationSettings {
    enabled: boolean;
    [key: string]: string | boolean | number | Date;
}

/**
 * Settings model
 * @typedef {Object} Settings
 * @property {number} teamId - Reference to the team
 * @property {Date} createdAt - When the settings were created
 * @property {Date} updatedAt - Last update timestamp
 * @property {Record<string, IntegrationSettings>} integrations - Explicit integrations object
 * @example
 * {
 * teamId: 1,
 * createdAt: '2021-08-01T00:00:00.000Z',
 * updatedAt: '2021-08-01T00:00:00.000Z',
 * integrations: {
 * github: {
 * enabled: true,
 * token: 'abc123',
 * org: 'my-org'
 * }
 * }
 * }
 */
export interface Settings {
    teamId: number;
    createdAt: Date;
    updatedAt: Date;
    integrations: Record<string, IntegrationSettings>;
}
