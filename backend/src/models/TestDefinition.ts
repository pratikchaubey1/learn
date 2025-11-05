// models/TestDefinition.ts
import { Schema, model, Document } from 'mongoose';
import { TestType } from '../types';

export interface ITestDefinition extends Document {
    id: TestType;
    name: string;
    description: string;
    category: string;
    isAdaptive: boolean;
    isMock: boolean;
}

const TestDefinitionSchema = new Schema<ITestDefinition>({
    id: { type: String, required: true, unique: true, enum: Object.values(TestType) },
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    isAdaptive: { type: Boolean, default: false },
    isMock: { type: Boolean, default: false }
});

export default model<ITestDefinition>('TestDefinition', TestDefinitionSchema);
