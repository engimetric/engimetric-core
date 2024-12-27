import express from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { updateTeamSettings, getTeamSettings } from '../controllers/settingsController';

const router = express.Router();

/**
 * @route POST /settings
 * @description Create or update settings for a team
 * @access Protected
 * @returns {Object} - Created or updated settings object
 * @throws {500} - If an error occurs
 * @example
 * POST /settings
 * {
 * "teamId": 1,
 * "settings": {
 * "key": "value"
 * }
 * }
 * @param req - The request object
 * @param res - The response object
 * @returns The created or updated settings object
 */
router.post('/', authenticate, updateTeamSettings);

/**
 * @route GET /settings
 * @description Get settings for a team
 * @access Protected
 * @returns {Object} - Settings object
 * @throws {500} - If an error occurs
 * @example
 * GET /settings
 * Response:
 * {
 * "key": "value"
 * }
 * @param req - The request object
 * @param res - The response object
 * @returns The settings object
 */
router.get('/', authenticate, getTeamSettings);

export default router;
