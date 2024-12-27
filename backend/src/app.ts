/// <reference path="../types/express.d.ts" />

import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import { startScheduler } from './jobs/scheduler';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
app.set('port', port);
app.use(
    cors({
        origin: 'http://localhost:3000', // Replace with your frontend URL
        credentials: true, // Allow cookies to be sent
    }),
);

// Middleware for parsing JSON and URL-encoded bodies
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

// Cache Control Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});

// Router Setup
const indexRouter = express.Router();
indexRouter.get('/', (req: Request, res: Response) => {
    res.send('Engimetric API');
});

// Importing Routes
import githubRoutes from './routes/githubRoutes';
import settingsRoutes from './routes/settingRoutes';
import authRoutes from './routes/authRoutes';
import teamMemberRoutes from './routes/teamMemberRoutes';
import teamRoutes from './routes/teamRoutes';

// Applying Routes to Routers
indexRouter.use('/auth', authRoutes);
indexRouter.use('/github', githubRoutes);
indexRouter.use('/settings', settingsRoutes);
indexRouter.use('/members', teamMemberRoutes);
indexRouter.use('/team', teamRoutes);

// Applying Routes to the App
app.use(process.env.SERVER_ROUTE || '/', indexRouter);

// Run integration workers
startScheduler();

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

export default app;
