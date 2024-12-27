/**
 * UserTeam model
 * @typedef {Object} UserTeam
 * @property {number} id - Unique identifier for the user-team relationship
 * @property {number} userId - Foreign key to the user
 * @property {number} teamId - Foreign key to the team
 * @property {string} role - Role of the user in the team (e.g., 'admin', 'member')
 * @property {Date} createdAt - Date when the relationship was created
 * @property {Date} updatedAt - Date when the relationship was last updated
 * @example
 * {
 *   userId: 1,
 *   teamId: 2,
 *   role: 'admin'
 * }
 */
export interface UserTeam {
    id: number;
    userId: number;
    teamId: number;
    role: 'admin' | 'member' | string;
    createdAt: Date;
    updatedAt: Date;
}
