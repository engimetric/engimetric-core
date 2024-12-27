import express from 'express';
import {
    getTeamMembers,
    getTeamMember,
    saveTeamMember,
    removeTeamMember,
    getTeamMemberAliases,
    getTeamMetrics,
} from '../controllers/teamMemberController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @route GET /members
 * @description Get all team members
 * @access Protected
 * @returns {Array} - Array of team members
 * @throws {500} - If an error occurs
 * @example
 * ```json
 * [
 * {
 * "id": 1,
 * "fullName": "John Doe",
 * "aliases": ["johndoe"],
 * "teamId": 1
 * },
 * {
 * "id": 2,
 * "fullName": "Jane Smith",
 * "aliases": ["janesmith"],
 * "teamId": 1
 * }
 * ]
 * ```
 * @example
 * GET /members
 * @param req - The request object
 * @param res - The response object
 * @returns The team members
 */
router.get('/', authenticate, getTeamMembers);

/**
 * @route GET /members/:id
 * @description Get a team member by ID
 * @param id - Team member ID
 * @access Protected
 * @example
 * ```json
 * {
 * "id": 1,
 * "fullName": "John Doe",
 * "aliases": ["johndoe"],
 * "teamId": 1
 * }
 * ```
 * @example
 * GET /members/member/1
 * @param req - The request object
 * @param res - The response object
 * @returns The team member
 */
router.get('/member/:id', authenticate, getTeamMember);

// Create or update a team member
/**
 * @route POST /members
 * @description Create or update a team member
 * @access Protected
 * @returns {Object} - Team member object
 * @throws {500} - If an error occurs
 * @example
 * ```json
 * {
 * "id": 1,
 * "fullName": "John Doe",
 * "aliases": ["johndoe"],
 * "teamId": 1
 * }
 * ```
 * @example
 * POST /members
 * {
 * "fullName": "John Doe",
 * "aliases": ["johndoe"]
 * }
 * @param req - The request object
 * @param res - The response object
 * @returns The created or updated team member
 */
router.post('/', authenticate, saveTeamMember);

/**
 * @route DELETE /members/:id
 * @description Delete a team member
 * @param id - Team member ID
 * @access Protected
 * @returns {Object} - Success message
 * @throws {404} - If team member not found
 * @throws {500} - If an error occurs
 * @example
 * ```json
 * {
 *  "message": "Team member deleted successfully"
 * }
 * ```
 * @example
 * ```json
 * {
 * "message": "Team member not found"
 * }
 * ```
 * @example
 * ```json
 * {
 * "message": "Failed to delete team member"
 * }
 * ```
 * @example
 * DELETE /members/1
 * @param req - The request object
 * @param res - The response object
 * @returns The success message
 */
router.delete('/:id', authenticate, removeTeamMember);

/**
 * @route GET /members/aliases
 * @description Fetch team member aliases
 * @queryParam teamId (derived from user authentication)
 * @access Protected
 * @returns {Array} - Array of team member aliases
 * @throws {500} - If an error occurs
 * @example
 * ```json
 * [
 * {
 * "id": 1,
 * "fullName": "John Doe",
 * "aliases": ["johndoe"],
 * "teamId": 1
 * },
 * {
 * "id": 2,
 * "fullName": "Jane Smith",
 * "aliases": ["janesmith"],
 * "teamId": 1
 * }
 * ]
 * ```
 * @example
 * GET /members/aliases
 * @param req - The request object
 * @param res - The response object
 * @returns The team member aliases
 */
router.get('/aliases', authenticate, getTeamMemberAliases);

/**
 * @route GET /members/metrics
 * @description Fetch aggregated team member metrics with optional filters
 * @queryParam month (optional) - Filter metrics by a specific month (e.g., 2024-06)
 * @queryParam integration (optional) - Filter metrics by a specific integration (e.g., GitHub)
 * @queryParam teamId (derived from user authentication)
 * @access Protected
 * @returns {Array} - Array of team member metrics
 * @throws {500} - If an error occurs
 * @example
 * ```json
 * [
 * {
 * "id": 1,
 * "fullName": "John Doe",
 * "metrics": {
 * "2024-06": {
 * "GitHub": {
 * "merges": 5,
 * "reviews": 10,
 * "changes": 20
 * }
 * }
 * }
 * },
 * {
 * "id": 2,
 * "fullName": "Jane Smith",
 * "metrics": {
 * "2024-06": {
 * "GitHub": {
 * "merges": 3,
 * "reviews": 8,
 * "changes": 15
 * }
 * }
 * }
 * }
 * ]
 * ```
 * @example
 * GET /members/metrics?month=2024-06&integration=GitHub
 * @example
 * GET /members/metrics?month=2024-06
 * @example
 * GET /members/metrics
 * @example
 * GET /members/metrics?integration=GitHub
 * @param req - The request object
 * @param res - The response object
 * @returns The team member metrics
 */
router.get('/metrics', authenticate, getTeamMetrics);

export default router;
