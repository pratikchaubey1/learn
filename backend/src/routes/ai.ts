// routes/ai.ts
// Fix: Consolidate express value and type imports to resolve type conflicts.
import express from 'express';
// Fix: Import types from express to ensure correct type resolution for handlers.
import asyncHandler from 'express-async-handler';
import { protect, AuthRequest } from '../middleware/auth';
import { geminiService } from '../services/geminiService';

const router = express.Router();

// Fix: Explicitly type `req` as AuthRequest and `res` as Response to access correct properties and methods.
router.post('/generate-test', protect, asyncHandler(async (req: AuthRequest, res: express.Response) => {
    const { testType, numQuestions, topic } = req.body;
    const data = await geminiService.generateTestQuestions(testType, numQuestions, topic);
    res.json({ success: true, data });
}));

// Fix: Explicitly type `req` as AuthRequest and `res` as Response to access correct properties and methods.
router.post('/analyze-results', protect, asyncHandler(async (req: AuthRequest, res: express.Response) => {
    const { testResult } = req.body;
    const data = await geminiService.analyzeTestResults(testResult);
    res.json({ success: true, data });
}));

// Fix: Explicitly type `req` as AuthRequest and `res` as Response to access correct properties and methods.
router.post('/generate-plan', protect, asyncHandler(async (req: AuthRequest, res: express.Response) => {
    const { goal, result } = req.body;
    const data = await geminiService.generateLearningPlan(goal, result);
    res.json({ success: true, data });
}));

// Fix: Explicitly type `req` as AuthRequest and `res` as Response to access correct properties and methods.
router.post('/chat', protect, asyncHandler(async (req: AuthRequest, res: express.Response) => {
    // Set headers for Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // Important to send headers immediately

    try {
        const { history, context } = req.body; // <-- Added context
        const stream = await geminiService.getAiceyResponseStream(history, context);

        for await (const chunk of stream) {
            const text = chunk.text;
            if (text) {
                // SSE format: data: { ...JSON... }\n\n
                res.write(`data: ${JSON.stringify({ textChunk: text })}\n\n`);
            }
        }
    } catch (error) {
        console.error('Error streaming AI response:', error);
        // Optionally send an error event to the client
        res.write(`data: ${JSON.stringify({ error: 'An error occurred while streaming.' })}\n\n`);
    } finally {
        res.end(); // Close the connection
    }
}));


export default router;