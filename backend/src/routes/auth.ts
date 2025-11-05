// routes/auth.ts
// Fix: Consolidate express value and type imports to resolve type conflicts.
import express from 'express';
// Fix: Import types from express to ensure correct type resolution for handlers.
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import User from '../models/User';
import { protect, AuthRequest } from '../middleware/auth';
import sendEmail from '../utils/sendEmail';
import { IUser, BadgeId, Badge } from '../types';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// --- Security: Rate Limiting ---
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 login/signup requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many authentication attempts from this IP, please try again after 15 minutes.' }
});

const resetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 reset requests per hour
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many password reset requests from this IP, please try again after an hour.' }
});


const generateToken = (id: string, isAdmin?: boolean) => {
    return jwt.sign({ id, isAdmin: !!isAdmin }, process.env.JWT_SECRET!, {
        expiresIn: '30d',
    });
};

const allBadges: Record<BadgeId, Omit<Badge, 'unlockedOn'>> = {
    first_test: { _id: 'first_test', name: 'First Step', description: 'You completed your first test!', icon: '🎉' },
    daily_login: { _id: 'daily_login', name: 'Daily Dedication', description: 'Logged in for the first time today.', icon: '☀️' },
    streak_3: { _id: 'streak_3', name: 'On a Roll', description: 'Logged in 3 days in a row.', icon: '🔥' },
    streak_7: { _id: 'streak_7', name: 'Week Warrior', description: 'Logged in 7 days in a row.', icon: '🏆' },
    perfect_score: { _id: 'perfect_score', name: 'Perfectionist', description: 'Achieved a perfect score on a test.', icon: '🎯' },
    topic_master_algebra: { _id: 'topic_master_algebra', name: 'Algebra Ace', description: 'Mastered the Algebra topic.', icon: '🧮' },
    level_5: { _id: 'level_5', name: 'Level 5 Reached', description: 'You reached level 5!', icon: '🚀' },
};

const awardBadge = (user: IUser, badgeId: BadgeId) => {
    if (!user.badges.find(b => b._id === badgeId)) {
        const newBadge: Badge = { ...allBadges[badgeId], unlockedOn: new Date().toISOString() };
        user.badges.push(newBadge);
    }
};

const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};


const signupValidation = [
    body('fullName').notEmpty().withMessage('Full name is required.'),
    body('username').notEmpty().withMessage('Username is required.'),
    body('email').isEmail().withMessage('Please provide a valid email.'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
        .withMessage('Password must include an uppercase letter, a lowercase letter, and a number.'),
    validateRequest
];

const loginValidation = [
    body('identifier').notEmpty().withMessage('Email or username is required.'),
    body('password').notEmpty().withMessage('Password is required.'),
    validateRequest
];

// POST /api/auth/signup
router.post('/signup', authLimiter, signupValidation, asyncHandler(async (req: express.Request, res: express.Response) => {
    let { fullName, username, email, password } = req.body;
    
    email = email.toLowerCase();
    username = username.toLowerCase();

    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        fullName,
        username,
        email,
        password,
        avatarId: Math.floor(Math.random() * 30),
    });

    const token = generateToken(user._id.toString(), user.isAdmin);
    const userResponse = user.toObject();

    res.status(201).json({ success: true, data: { ...userResponse, token } });
}));

// POST /api/auth/login
router.post('/login', authLimiter, loginValidation, asyncHandler(async (req: express.Request, res: express.Response) => {
    let { identifier, password } = req.body;
    identifier = identifier.toLowerCase();

    const user = await User.findOne({ 
        $or: [{ email: identifier }, { username: identifier }] 
    }).select('+password');

    if (user && (await user.matchPassword(password))) {
        const today = new Date();
        const lastLogin = user.lastLogin ? new Date(user.lastLogin) : null;

        let needsSave = false;
        if (!lastLogin || !isSameDay(today, lastLogin)) {
             awardBadge(user, 'daily_login');
            if (lastLogin) {
                const yesterday = new Date(today);
                yesterday.setDate(today.getDate() - 1);
                if (isSameDay(lastLogin, yesterday)) {
                    user.loginStreak = (user.loginStreak || 0) + 1;
                } else {
                    user.loginStreak = 1;
                }
            } else {
                user.loginStreak = 1;
            }
            user.lastLogin = today.toISOString();

            if (user.loginStreak >= 3) awardBadge(user, 'streak_3');
            if (user.loginStreak >= 7) awardBadge(user, 'streak_7');
            
            needsSave = true;
        }

        if (needsSave) {
            await user.save();
        }

        // Always populate test history before sending response
        await user.populate('testHistory');

        const token = generateToken(user._id.toString(), !!user.isAdmin);
        const userResponse = user.toObject();
        res.json({ success: true, data: { ...userResponse, token } });
    } else {
        res.status(401);
        throw new Error('Invalid credentials');
    }
}));

// GET /api/auth/me (Get current user data from token)
router.get('/me', protect, asyncHandler(async (req: AuthRequest, res: express.Response) => {
    const user = await User.findById(req.user?._id).select('-password').populate('testHistory');
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }
    res.json({ success: true, data: user });
}));


// POST /api/auth/request-reset
router.post('/request-reset', resetLimiter, [body('identifier').notEmpty().withMessage('Email or username is required.'), validateRequest], asyncHandler(async (req: express.Request, res: express.Response) => {
    const { identifier } = req.body;
    const user = await User.findOne({ 
        $or: [{ email: identifier.toLowerCase() }, { username: identifier.toLowerCase() }] 
    });

    if (!user) {
        res.json({ success: true, message: 'If an account with that email or username exists, a password reset link has been sent.' });
        return;
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `http://localhost:3001/reset-password/${resetToken}`;

    const message = `<h1>You have requested a password reset</h1><p>Please go to this link to reset your password:</p><a href="${resetUrl}" clicktracking=off>${resetUrl}</a><p>This link will expire in 10 minutes.</p>`;

    try {
        await sendEmail({
            to: user.email,
            subject: 'Password Reset Request',
            text: `Please go to this link to reset your password: ${resetUrl}`,
            html: message
        });
        res.json({ success: true, message: 'If an account with that email or username exists, a password reset link has been sent.' });
    } catch (error) {
        console.error("Password reset email error:", error);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        throw new Error('Email could not be sent');
    }
}));

// POST /api/auth/reset-password/:token
router.post('/reset-password/:token', [body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.'), validateRequest], asyncHandler(async (req: express.Request, res: express.Response) => {
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: resetPasswordToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
        res.status(400);
        throw new Error('Invalid or expired token');
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successful' });
}));

export default router;