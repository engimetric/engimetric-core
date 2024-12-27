/**
 * User model
 * @typedef {Object} User
 * @property {number} id - Unique identifier for the user
 * @property {string} email - Email address of the user
 * @property {string} password - Hashed password of the user
 * @property {boolean} admin - Whether the user is an admin
 * @property {Date} createdAt - Date when the user was created
 * @property {Date} updatedAt - Date when the user was last updated
 * @example
 * {
 * id: 1,
 * email: '[email protected]',
 * password: 'hashed-password',
 * teamId: 1,
 * admin: true
 * }
 */
export interface User {
    id: number;
    email: string;
    password: string;
    admin: boolean;
    createdAt: Date;
    updatedAt: Date;
}
