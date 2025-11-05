// routes/users.ts
// Fix: Consolidate express value and type imports to resolve type conflicts.
import express from 'express';
// Fix: Import types from express to ensure correct type resolution for handlers.
import asyncHandler from 'express-async-handler';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { protect, AuthRequest } from '../middleware/auth';
import User from '../models/User';
import TestResult from '../models/TestResult';
import { geminiService } from '../services/geminiService';

const router = express.Router();

const updateUserValidation = [
    body('fullName').optional().isString(),
    body('goal').optional().isObject(),
    body('plan').optional().isObject(),
    body('avatarId').optional().isNumeric(),
    body('password').optional().isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.'),
    validateRequest
];

// PUT /api/users/:id
router.put('/:id', protect, updateUserValidation, asyncHandler(async (req: AuthRequest, res: express.Response) => {
    if (req.user?._id !== req.params.id && !req.user?.isAdmin) {
        res.status(403);
        throw new Error('Not authorized to update this user');
    }

    const user = await User.findById(req.params.id).select('+password');

    if (user) {
        user.fullName = req.body.fullName || user.fullName;
        user.goal = req.body.goal !== undefined ? req.body.goal : user.goal;
        
        if (req.body.plan) {
            user.plan = req.body.plan;
            const allSteps = user.plan.weeks.flatMap(w => w.steps);
            if (allSteps.length > 0) {
                const completedSteps = allSteps.filter(s => s.completed).length;
                user.planProgress = Math.round((completedSteps / allSteps.length) * 100);
            } else {
                user.planProgress = 0;
            }
        }
        
        if (req.body.avatarId !== undefined) {
            user.avatarId = req.body.avatarId;
        }

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();
        await updatedUser.populate('testHistory'); // Ensure test history is populated before sending back
        res.json({ success: true, data: updatedUser });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
}));

// POST /api/users/:id/generate-plan
router.post('/:id/generate-plan', protect, asyncHandler(async (req: AuthRequest, res: express.Response) => {
    const userId = req.params.id;

    if (req.user?._id !== userId) {
        res.status(403);
        throw new Error('Not authorized to generate a plan for this user');
    }

    const { testResultId } = req.body;
    if (!testResultId) {
        res.status(400);
        throw new Error('Test Result ID is required');
    }

    const user = await User.findById(userId);
    const result = await TestResult.findById(testResultId);

    if (!user || !result) {
        res.status(404);
        throw new Error('User or Test Result not found');
    }
    
    if (!user.goal) {
        res.status(400);
        throw new Error('User has no goal set. Cannot generate a plan.');
    }

    const newPlan = await geminiService.generateLearningPlan(user.goal, result);
    user.plan = newPlan;
    
    await user.save();
    await user.populate('testHistory'); // Populate after saving

    res.json({ success: true, data: user.toObject() });
}));

// GET /api/users/leaderboard
router.get('/leaderboard', protect, asyncHandler(async (req: AuthRequest, res: express.Response) => {
    const users = await User.find({ isAdmin: { $ne: true } })
        .sort({ xp: -1 })
        .limit(50)
        .select('fullName username avatarId level xp');
    
    res.json({ success: true, data: users });
}));

export default router;