/**
 * TeamMember model
 * @typedef {Object} TeamMember
 * @property {number} id - Unique identifier for the team member
 * @property {number} teamId - Foreign key to the team
 * @property {string} fullName - Full name of the team member
 * @property {string} [email] - Optional email for team members (if available)
 * @property {number} [userId] - Foreign key to the user
 * @property {string[]} aliases - Aliases for the team member
 * @property {Record<string, Record<string, Record<string, number>>>} metrics - Metrics for each month
 * @property {Date} createdAt - Date when the team member was created
 * @property {Date} updatedAt - Date when the team member was last updated
 * @example
 * {
 * "id": 1,
 * "teamId": 1,
 * "fullName": "John Doe",
 * "email": "
 * "userId": 1,
 * "aliases": ["johndoe"],
 * "metrics": {
 * "2021-01": {
 * "github": {
 * "merges": 10,
 * "reviews": 5,
 * "changes": 20
 * }
 * }
 * }
 * }
 */
export interface TeamMember {
    id: number;
    teamId: number;
    fullName: string;
    email?: string;
    userId?: number;
    aliases: string[];
    metrics: Record<string, { [integration: string]: { [metric: string]: number } }>; // Metrics for each month
    createdAt: Date;
    updatedAt: Date;
}
