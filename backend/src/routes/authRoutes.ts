import express from 'express';
import { login, register, me, selectTeam } from '../controllers/authController';

const router = express.Router();

/**
 * @route POST /auth/login
 * @description Login a user
 * @returns {Object} - User object
 * @throws {500} - If an error occurs
 * @example
 * POST /auth/login
 * {
 * "team": "teamName",
 * "email": "[email protected]",
 * "password": "password"
 * }
 * @param req - The request object
 * @param res - The response object
 * @returns The user object
 */
router.post('/login', login);

/**
 * @route POST /auth/register
 * @description Register a user
 * @returns {Object} - User object
 * @throws {500} - If an error occurs
 * @example
 * POST /auth/register
 * {
 * "team": "teamName",
 * "email": "[email protected]",
 * "password": "password"
 * }
 * @param req - The request object
 * @param res - The response object
 * @returns The user object
 */
router.post('/register', register);

router.get('/me', me);

router.post('/select-team', selectTeam);

export default router;
