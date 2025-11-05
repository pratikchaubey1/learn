import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { IUser, ITestResult, Badge } from '../types';
import { PlanSchema } from './Plan';

const BadgeSchema = new Schema<Badge>({
    _id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    unlockedOn: { type: String, required: true },
}, { _id: false });

const UserSchema = new Schema<IUser>({
    fullName: { type: String, required: true },
    username: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true, select: false },
    avatarId: { type: Number, required: true },
    isAdmin: { type: Boolean, default: false },
    goal: {
        exam: String,
        targetScore: Number,
        examDate: String
    },
    plan: PlanSchema,
    testHistory: [{ type: Schema.Types.ObjectId, ref: 'TestResult' }],
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 0 },
    badges: [BadgeSchema],
    testsTaken: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    lastTestTaken: { type: String },
    planProgress: { type: Number, default: 0 },
    passwordResetToken: String,
    passwordResetExpires: Date,
    lastLogin: { type: String },
    loginStreak: { type: Number, default: 0 }
}, {
    timestamps: true,
    toJSON: { 
        virtuals: true,
        transform: function(doc, ret) {
            delete ret.password;
            return ret;
        }
    },
    toObject: { virtuals: true }
});

UserSchema.pre('save', async function (this: IUser, next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

UserSchema.methods.matchPassword = async function(this: IUser, enteredPassword: string) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.getResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(20).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

    return resetToken;
};


export default model<IUser>('User', UserSchema);