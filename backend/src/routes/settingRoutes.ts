import express from 'express';
import { authenticate } from '../middleware/authMiddleware';
import {
    updateTeamSettings,
    getTeamSettings,
    updateLLMSettings,
    getLLMMetadata,
    getMetadata,
    updateIntegrationSettings,
} from '../controllers/settingsController';

const router = express.Router();

/**
 * @route POST /settings
 * @description Create or update settings for a team
 * @access Protected
 * @throws {500} - If an error occurs
 * @example
 * POST /settings
 * {
 *   "teamId": 1,
 *   "settings": {
 *     "key": "value"
 *   }
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
 * @throws {500} - If an error occurs
 * @example
 * GET /settings
 * Response:
 * {
 *   "teamId": 1,
 *   "settings": {
 *     "key": "value"
 *   }
 * }
 * @param req - The request object
 * @param res - The response object
 * @returns The settings object
 */
router.get('/', authenticate, getTeamSettings);

/**
 * @route GET /settings/metadata
 * @description Get metadata for all integrations
 * @access Protected
 * @throws {500} - If an error occurs
 * @example
 * GET /settings/metadata
 * Response:
 * [
 *   {
 *     "integrationName": "github",
 *     "label": "GitHub",
 *     "fields": [
 *       {
 *         "key": "enabled",
 *         "type": "boolean",
 *         "label": "Enable Integration",
 *         "required": true,
 *         "defaultValue": true
 *       },
 *     ]
 *   }
 * ]
 */
router.get('/metadata', authenticate, getMetadata);

/**
 * @route POST /settings/llm
 * @description Create or update LLM settings for a team
 * @access Protected
 * @throws {500} - If an error occurs
 * @example
 * POST /settings/llm
 * {
 *   "teamId": 1,
 *   "llmSettings": {
 *   "provider": "openai",
 *   "model": "gpt-3.5-turbo",
 *   "apiKey": "abc123",
 *   "enabled": true
 * }
 * @param req - The request object
 * @param res - The response object
 * @returns The created or updated LLM settings object
 */
router.post('/llm', authenticate, updateLLMSettings);

/**
 * @route GET /settings/llm-metadata
 * @description Get metadata for LLM settings
 * @access Protected
 * @throws {500} - If an error occurs
 * @example
 * GET /settings/llm-metadata
 * Response:
 * {
 *   "provider": "openai",
 *   "models": ["gpt-3.5-turbo", "gpt-4"],
 *   "apiKey": "abc123",
 *   "enabled": true
 * }
 * @param req - The request object
 * @param res - The response object
 * @returns The LLM metadata object
 */
router.get('/llm-metadata', authenticate, getLLMMetadata);

/**
 * @route POST /settings/integration/:integrationName
 * @description Update integration settings for a team
 * @access Protected
 * @throws {500} - If an error occurs
 * @example
 * POST /settings/integration/github
 * {
 *   "settings": {
 *     "enabled": true
 *   }
 * }
 * Response:
 * {
 *   "message": "Settings for integration \"github\" updated successfully.",
 *   "integrationName": "github",
 *   "settings": {
 *     "enabled": true
 *   }
 * }
 * @param req - The request object
 * @param res - The response object
 * @returns The updated integration settings object
 */
router.post('integration/:integrationName', authenticate, updateIntegrationSettings);

export default router;
