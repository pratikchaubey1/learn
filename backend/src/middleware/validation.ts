// backend/src/middleware/validation.ts
// Fix: Change type-only import to a regular import to resolve type conflicts.
import express from 'express';
import { validationResult } from 'express-validator';

export const validateRequest = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false, 
            message: "Validation failed", 
            errors: errors.array() 
        });
    }
    next();
};