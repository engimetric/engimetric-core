import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import _ from 'lodash';
import { fetchAllUsers, createOrUpdateUser, fetchUserById } from '../utils/userUtils';
import { createOrUpdateTeam, findTeamByNameOrSlug } from '../utils/teamUtils';
import { fetchUserTeams, addUserToTeam } from '../utils/userTeamUtils';
import { createOrUpdateIntegrationSettings } from '../utils/settingsUtils';
import logger from '../utils/logger';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

// Helper to validate input
const validateInput = (fields: Record<string, any>, res: Response): boolean => {
    for (const [key, value] of Object.entries(fields)) {
        if (!value) {
            res.status(400).json({ message: `${key} is required` });
            return false;
        }
    }
    return true;
};

// Generate JWT
const generateToken = (payload: object): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Find a user by email
const findUserByEmail = async (email: string) => {
    const users = await fetchAllUsers();
    return users.find((u) => u.email === email);
};

// Fetch teams associated with a user
const findTeamsByUserId = async (userId: number, requestingUserId: number) => {
    return await fetchUserTeams(userId, requestingUserId);
};

/**
 * Login with email and password
 * POST /auth/login
 * { "email": "user@example.com", "password": "password" }
 */
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!validateInput({ email, password }, res)) return;

        const user = await findUserByEmail(email);

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        if (!user.id) {
            res.status(401).json({ message: 'Invalid user ID' });
            return;
        }

        const teams = await findTeamsByUserId(user.id, user.id);

        if (!teams.length) {
            res.status(403).json({ message: 'User is not part of any team' });
            return;
        }

        const newToken = generateToken({ userId: user.id });

        res.cookie('authToken', newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        });

        res.status(200).json({
            message: 'Login successful. Please select a team.',
            userId: user.id,
            email: user.email,
            teams,
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to login' });
    }
};

/**
 * Select a team and issue a team-specific JWT
 * POST /auth/select-team
 * { "teamId": 2 }
 */
export const selectTeam = async (req: Request, res: Response): Promise<void> => {
    try {
        const token = req.cookies?.authToken;
        if (!token) {
            res.status(401).json({ message: 'Not authenticated: Missing token' });
            return;
        }

        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
            if (!decoded?.userId) {
                res.status(401).json({ message: 'Invalid token payload' });
                return;
            }
        } catch (err) {
            logger.error(err, 'JWT verification failed:');
            res.status(401).json({ message: 'Invalid or expired token' });
            return;
        }

        const { teamId } = req.body;

        if (!validateInput({ teamId }, res)) return;

        const teams = await fetchUserTeams(decoded.userId, decoded.userId);
        const parsedTeamId = Number(teamId);

        const team = teams.find((t) => t.id === parsedTeamId);

        if (!team) {
            res.status(403).json({ message: 'User is not part of the selected team' });
            return;
        }

        const newToken = generateToken({ userId: decoded.userId, teamId: parsedTeamId });

        res.cookie('authToken', newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        });

        res.status(200).json({
            message: 'Team selected successfully',
            teamId,
        });
    } catch (error) {
        logger.error(error, 'Team selection error');
        res.status(500).json({ message: 'Failed to select team' });
    }
};

/**
 * Get current authenticated user and team
 * GET /auth/me
 */
export const me = async (req: Request, res: Response): Promise<void> => {
    try {
        const token = req.cookies?.authToken;

        if (!token) {
            res.status(401).json({ message: 'Not authenticated' });
            return;
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; teamId: number };

        if (!decoded.userId || !decoded.teamId) {
            res.status(401).json({ message: 'Invalid token' });
            return;
        }

        const user = await fetchUserById(decoded.userId, decoded.userId);
        const teams = await fetchUserTeams(decoded.userId, decoded.userId);
        const team = teams.find((t) => t.id === Number(decoded.teamId));

        if (!user || !team) {
            res.status(403).json({ message: 'User or team not found' });
            return;
        }

        res.status(200).json({
            user,
            team,
        });
    } catch (error) {
        logger.error(error, 'Error fetching user');
        res.status(500).json({ message: 'Failed to fetch user' });
    }
};

/**
 * Register a user (Optional Team)
 * POST /auth/register
 * { "email": "user@example.com", "password": "password", "team": "TeamName" }
 */
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, team: teamNameOrSlug } = req.body;

        if (!validateInput({ email, password }, res)) return;

        // Check if user already exists
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            res.status(409).json({ message: 'User already exists with this email' });
            return;
        }

        // Create new user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            email,
            password: hashedPassword,
            admin: false,
        };

        const user = await createOrUpdateUser(newUser);

        let team = null;
        let isNewTeam = false;

        if (teamNameOrSlug) {
            // If a team name/slug is provided
            team = await findTeamByNameOrSlug(teamNameOrSlug, user.id);

            if (!team) {
                // Create a new team if it doesn't exist
                team = {
                    slug: teamNameOrSlug.toLowerCase().replace(/\s+/g, '-'),
                    name: teamNameOrSlug,
                    description: `Team for ${teamNameOrSlug}`,
                    ownerId: user.id,
                };

                team = await createOrUpdateTeam(team, user.id);
                isNewTeam = true;

                // Initialize default integration settings
                await createOrUpdateIntegrationSettings(team.id, {}, user.id);
            }

            // Add user to the team
            await addUserToTeam(user.id, team.id, isNewTeam ? 'admin' : 'member', user.id);
        }

        // Generate a token for initial login
        const token = generateToken({ id: user.id, email });

        res.cookie('authToken', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'none',
            path: '/', // Ensure it's available across the app
        });

        res.status(201).json({
            message: 'User registered successfully',
            token,
            team: team || null,
            nextStep: team ? 'dashboard' : 'select_team',
        });
    } catch (error) {
        logger.error(error, 'Registration error');
        res.status(500).json({ message: 'Failed to register user' });
    }
};
