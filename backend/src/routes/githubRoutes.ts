import express from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { fullSync, syncByMonth, getGithubContributions } from '../controllers/githubController';

const router = express.Router();

/**
 * @route POST /sync-month
 * @description Sync a month's GitHub data for a user
 * @access Protected
 * @returns {Object} - Updated user object
 * @throws {500} - If an error occurs
 * @example
 * POST /github/sync-month
 * {
 *  "month" : "2021-07"
 * }
 * @param req - The request object
 * @param res - The response object
 * @returns The updated user object
 */
router.post('/sync-month', authenticate, syncByMonth);

/**
 * @route POST /full-sync
 * @description Update GitHub data for a user
 * @access Protected
 * @returns {Object} - Updated user object
 * @throws {500} - If an error occurs
 * @param req - The request object
 * @param res - The response object
 * @returns The updated user object
 */
router.post('/full-sync', authenticate, fullSync);

/**
 * @route GET /get-contributions
 * @description Get GitHub contributions for a user
 * @access Protected
 * @returns {Object} - Contributions object
 * @throws {500} - If an error occurs
 * @example
 * GET /github/get-contributions
 * Response:
 * {
 * "1": {
 * "GitHub": {
 * "merges": 5,
 * "reviews": 10,
 * "changes": 20
 * }
 * },
 * "2": {
 * "GitHub": {
 * "merges": 3,
 * "reviews": 8,
 * "changes": 15
 * }
 * }
 * }
 * @param req - The request object
 * @param res - The response object
 * @returns The contributions for the specified month
 */
router.get('/get-contributions', authenticate, getGithubContributions);

export default router;
