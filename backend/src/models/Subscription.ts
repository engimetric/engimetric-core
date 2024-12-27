/**
 * Subscription model
 * @typedef {Object} Subscription
 * @property {number} id - Unique identifier for the subscription
 * @property {number} teamId - Associated team ID
 * @property {'free' | 'hosted' | 'enterprise'} planType - Plan type
 * @property {'active' | 'canceled' | 'expired'} status - Status of the subscription
 * @property {'monthly' | 'yearly' | null} billingCycle - Billing cycle for hosted plans
 * @property {Date} startDate - Subscription start date
 * @property {Date | null} endDate - Subscription end date
 * @property {Record<string, any>} metadata - Additional subscription details
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 * @example
 * {
 *   id: 1,
 *   teamId: 1,
 *   planType: 'hosted',
 *   status: 'active',
 *   billingCycle: 'yearly',
 *   startDate: '2024-01-01T00:00:00.000Z',
 *   endDate: '2025-01-01T00:00:00.000Z',
 *   metadata: { feature_flags: ['advanced_reporting'] }
 * }
 */
export interface Subscription {
    id: number;
    teamId: number;
    planType: 'free' | 'hosted' | 'enterprise';
    status: 'active' | 'canceled' | 'expired';
    billingCycle: 'monthly' | 'yearly' | null;
    startDate: Date;
    endDate: Date | null;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
