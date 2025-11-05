// routes/admin.ts
// Fix: Consolidate express value and type imports to resolve type conflicts.
import express from 'express';
// Fix: Import types from express to ensure correct type resolution for handlers.
import asyncHandler from 'express-async-handler';
import { protect, admin, AuthRequest } from '../middleware/auth';
import User from '../models/User';
import TestResult from '../models/TestResult';
import { geminiService } from '../services/geminiService';
import { ITestResult } from '../types';
import { Transform } from 'json2csv';


const router = express.Router();

// GET /api/admin/users/all - FOR CLIENT-SIDE FILTERING & CHARTS (still fetches all, but not for export)
router.get('/users/all', protect, admin, asyncHandler(async (req: AuthRequest, res: express.Response) => {
    const users = await User.find({ isAdmin: { $ne: true } }).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
}));

// GET /api/admin/users/download-csv - Scalable CSV Streaming
router.get('/users/download-csv', protect, admin, asyncHandler(async (req: AuthRequest, res: express.Response) => {
    const fields = ['_id', 'fullName', 'username', 'email', 'level', 'xp', 'testsTaken', 'averageScore', 'lastTestTaken', 'goal.exam', 'goal.targetScore', 'planProgress'];
    const transformOpts = { fields };
    const transform = new Transform(transformOpts);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="all_user_data.csv"');

    const cursor = User.find({ isAdmin: { $ne: true } }).cursor();
    
    cursor.on('error', (err) => {
        console.error("CSV stream error:", err);
        res.status(500).send("Error generating CSV file.");
    });
    
    cursor.pipe(transform).pipe(res);
}));


// GET /api/admin/users - PAGINATED
router.get('/users', protect, admin, asyncHandler(async (req: AuthRequest, res: express.Response) => {
    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;

    const count = await User.countDocuments({});
    const users = await User.find({})
        .select('-password')
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    res.json({
        success: true,
        data: {
            users,
            page,
            totalPages: Math.ceil(count / pageSize),
            totalUsers: count
        }
    });
}));

// GET /api/admin/stats
router.get('/stats', protect, admin, asyncHandler(async (req: AuthRequest, res: express.Response) => {
    const totalUsers = await User.countDocuments({});
    const totalTestsTaken = await TestResult.countDocuments({});

    const avgScoreAggregation = await TestResult.aggregate([
        {
            $group: {
                _id: null,
                averageScore: { $avg: "$overallScore" }
            }
        }
    ]);

    const averageScore = avgScoreAggregation[0]?.averageScore.toFixed(0) || 0;

    res.json({
        success: true,
        data: {
            totalUsers,
            totalTestsTaken,
            averageScore
        }
    });
}));


// POST /api/admin/insights - Scalable Insights using Aggregation
router.post('/insights', protect, admin, asyncHandler(async (req: AuthRequest, res: express.Response) => {
    // This endpoint no longer accepts user data in the body for security and performance.
    // It runs its own aggregations.
    const userStats = await User.aggregate([
        { $match: { isAdmin: { $ne: true } } },
        {
            $project: {
                _id: 0,
                level: 1,
                xp: 1,
                testsTaken: 1,
                averageScore: 1,
                goal: "$goal.exam",
                planProgress: 1
            }
        },
        { $limit: 100 } // Send a sample of 100 users to the AI
    ]);

    const weakestTopics = await TestResult.aggregate([
        { $unwind: "$topicPerformance" },
        {
            $group: {
                _id: "$topicPerformance.topic",
                totalCorrect: { $sum: "$topicPerformance.correct" },
                totalQuestions: { $sum: "$topicPerformance.total" }
            }
        },
        {
            $project: {
                topic: "$_id",
                _id: 0,
                accuracy: {
                    $cond: [{ $eq: ["$totalQuestions", 0] }, 0, { $multiply: [{ $divide: ["$totalCorrect", "$totalQuestions"] }, 100] }]
                }
            }
        },
        { $sort: { accuracy: 1 } },
        { $limit: 5 }
    ]);

    const totalUsers = await User.countDocuments({ isAdmin: { $ne: true }});
    
    const insights = await geminiService.getAdminInsights({
        totalUsers,
        userStats,
        weakestTopics
    });
    res.json({ success: true, data: insights });
}));

export default router;