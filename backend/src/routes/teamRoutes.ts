import express from 'express';
import { getTeamsByUserId, saveTeam, deleteTeamById, getTeamById } from '../controllers/teamController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @route GET /teams
 * @description Get all teams
 * @access Protected
 * @returns {Array} - Array of team objects
 * @throws {500} - If an error occurs
 * @example
 * GET /teams
 * [
 * {
 * "id": 1,
 * "name": "Team Name",
 * "description": "Team Description"
 * },
 * {
 * "id": 2,
 * "name": "Team Name",
 * "description": "Team Description"
 * }
 * ]
 * @param req - The request object
 * @param res - The response object
 */
router.get('/', authenticate, getTeamsByUserId);

/**
 * @route GET /teams/:id
 * @description Get a team by ID
 * @access Protected
 * @returns {Object} - Team object
 * @throws {500} - If an error occurs
 * @example
 * GET /teams/1
 * {
 * "id": 1,
 * "name": "Team Name",
 * "description": "Team Description"
 * }
 * @param req - The request object
 * @param res - The response object
 */
router.get('/:id', authenticate, getTeamById);

/**
 * @route POST /teams
 * @description Create or update a team
 * @access Protected
 * @returns {Object} - Created or updated team object
 * @throws {500} - If an error occurs
 * @example
 * POST /teams
 * {
 *  "name": "Team Name",
 * "description": "Team Description"
 * }
 * @param req - The request object
 * @param res - The response object
 */
router.post('/', authenticate, saveTeam);

/**
 * @route DELETE /teams/:id
 * @description Delete a team by ID
 * @access Protected
 * @returns {Object} - Deleted team object
 * @throws {500} - If an error occurs
 * @example
 * DELETE /teams/1
 * @param req - The request object
 * @param res - The response object
 */
router.delete('/:id', authenticate, deleteTeamById);

export default router;
