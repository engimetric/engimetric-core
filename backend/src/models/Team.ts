/**
 * Team model
 * @typedef {Object} Team
 * @property {number} id - Unique identifier for the team
 * @property {string} slug - URL-friendly identifier for the team
 * @property {string} name - Display name of the team
 * @property {string} description - Team description
 * @property {number | null} ownerId - Owner user ID
 * @property {number | null} subscriptionId - Associated subscription ID
 * @property {boolean} isFrozen - Whether the team is frozen (e.g., demo mode, billing issue)
 * @property {string | null} frozenReason - Reason why the team is frozen
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 * @example
 * {
 *   id: 1,
 *   slug: 'engimetric-demo',
 *   name: 'Engimetric Demo Team',
 *   description: 'This is a read-only demo team.',
 *   ownerId: null,
 *   subscriptionId: null,
 *   isFrozen: true,
 *   frozenReason: 'Demo team - Read-only access',
 *   createdAt: '2024-01-01T00:00:00.000Z',
 *   updatedAt: '2024-01-10T00:00:00.000Z'
 * }
 */
export interface Team {
    id: number;
    slug: string;
    name: string;
    description: string;
    ownerId: number | null;
    subscriptionId: number | null;
    isFrozen: boolean;
    frozenReason: string | null;
    createdAt: Date;
    updatedAt: Date;
}
