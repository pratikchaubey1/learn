// backend/src/middleware/errorHandler.ts
// Fix: Change type-only import to a regular import to resolve type conflicts.
import express from 'express';

export const errorHandler: express.ErrorRequestHandler = (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    res.status(statusCode).json({
        success: false,
        message: err.message,
        // Include stack trace in development only
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    });
};