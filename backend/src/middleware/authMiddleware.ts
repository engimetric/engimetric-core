import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

/**
 * Middleware to authenticate a user using JWT from cookies.
 *
 * @param req - The request object
 * @param res - The response object
 * @param next - The next middleware function
 * @returns void
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.cookies?.authToken; // Extract token from cookies

    if (!token) {
        res.status(401).json({ message: 'Unauthorized: No token provided' });
        return;
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET) as { userId: number; email: string; teamId: number };

        if (!payload.userId) {
            res.status(401).json({ message: 'Invalid token payload' });
            return;
        }

        req.user = {
            id: payload.userId,
            email: payload.email,
            teamId: payload.teamId,
        };

        next();
    } catch (err) {
        console.error('Authentication error:', err);
        res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};
