// models/Plan.ts
import { Schema } from 'mongoose';
import { IPlan, PlanStep } from '../types';

const PlanStepSchema = new Schema<PlanStep>({
    _id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['test', 'review', 'concept'], required: true },
    relatedTestType: { type: String },
    topic: { type: String },
    completed: { type: Boolean, default: false },
    estimatedTime: { type: String }
}, { _id: false });


const PlanWeekSchema = new Schema({
    week: { type: Number, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    summary: { type: String, required: true },
    steps: [PlanStepSchema]
});


export const PlanSchema = new Schema<IPlan>({
    generatedOn: { type: String, required: true },
    goal: {
        exam: { type: String, enum: ['SAT', 'ACT', 'AP'], required: true },
        targetScore: { type: Number, required: true },
        examDate: { type: String, required: true }
    },
    weeks: [PlanWeekSchema]
});