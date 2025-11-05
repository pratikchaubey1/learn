// backend/src/services/geminiService.ts
import { GoogleGenAI, Type } from "@google/genai";
import { ITestResult, ExamGoal, IPlan, TestType, PlanWeek, Question, ChatMessage, QuestionAnalysis, TopicPerformance } from '../types';
import { v4 as uuidv4 } from 'uuid';


const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY is not defined in the environment variables.");
}

const ai = new GoogleGenAI({ apiKey: geminiApiKey });

const parseJsonResponse = <T>(rawText: string | undefined): T => {
    if (!rawText || !rawText.trim()) {
        throw new Error("The AI response was empty.");
    }
    try {
        const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanedText) as T;
    } catch (e) {
        console.error("Failed to parse JSON:", rawText);
        throw new Error(`The AI returned malformed JSON. Parser error: ${(e as Error).message}`);
    }
};

// Recursively search for and extract string content from potentially nested objects.
const sanitizeContent = (content: any): any => {
    if (typeof content === 'string') {
        return content;
    }
    if (content === null || content === undefined) {
        return '';
    }
    if (typeof content === 'object') {
        if ('content' in content && typeof content.content === 'string') {
            return content.content;
        }
        // If it's an array, sanitize each item.
        if (Array.isArray(content)) {
            return content.map(sanitizeContent);
        }
        // If it's another type of object, try to find a string value.
        for (const key in content) {
            if (typeof content[key] === 'string') {
                return content[key];
            }
        }
    }
    return JSON.stringify(content); // Fallback for unexpected formats
};


interface AdminInsightStats {
    totalUsers: number;
    userStats: any[];
    weakestTopics: any[];
}

interface AnalysisResponse {
    summary: string;
    questionAnalysis: QuestionAnalysis[];
    topicPerformance: TopicPerformance[];
}

export const geminiService = {
    async generateTestQuestions(testType: TestType, numQuestions: number, topic?: string, difficulty?: 'easy' | 'medium' | 'hard', avoidTopics?: string[]): Promise<Question[]> {
        
        const systemInstruction = `You are an expert exam creator for high school standardized tests (SAT, ACT, AP). Your response MUST be ONLY a valid JSON array of question objects that conforms to the provided schema. The 'options' array must contain only strings. ABSOLUTELY NO other text or markdown. Each question must have a unique "_id" string. All math MUST use valid, standard LaTeX (e.g., \\frac{a}{b}, not \\rac) and be wrapped in '$...$' for inline or '$$...$$' for display. The 'questionText' and 'options' fields must be simple strings, not nested objects. Each 'questionText' MUST be concise, under 25 words.`;
        
        let promptModifier = "";
        if (testType.toLowerCase().includes('diagnostic')) {
            promptModifier += " This is a diagnostic test, so questions must cover a broad range of fundamental topics and difficulties to accurately assess baseline knowledge. ";
        }
        if (topic) {
            promptModifier += ` This is a concept check quiz focusing specifically on the topic of: "${topic}". `;
        }
        if (difficulty) {
            promptModifier += ` The question difficulty should be '${difficulty}'. `;
        }
        if (avoidTopics && avoidTopics.length > 0) {
            promptModifier += ` Do not generate questions on these topics: ${avoidTopics.join(', ')}. `;
        }

        const userPrompt = `Generate ${numQuestions} high-quality, authentic-style question(s) for a "${testType}" exam.${promptModifier}`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            _id: { type: Type.STRING },
                            questionText: { type: Type.STRING },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            correctAnswerIndex: { type: Type.NUMBER },
                            explanation: { type: Type.STRING },
                            topic: { type: Type.STRING },
                            difficulty: { type: Type.STRING, enum: ['easy', 'medium', 'hard'] },
                            passage: { type: Type.STRING },
                        },
                        required: ["_id", "questionText", "options", "correctAnswerIndex", "explanation", "topic"]
                    }
                },
                systemInstruction: systemInstruction,
            },
        });

        const result = parseJsonResponse<any[]>(response.text);

        if (!result || !Array.isArray(result) || result.length === 0) throw new Error("AI returned an empty or invalid list of questions.");
        
        const sanitizedResult: Question[] = result.map((q: any, index: number): Question => {
             if (!q || typeof q.questionText === 'undefined' || !Array.isArray(q.options) || typeof q.correctAnswerIndex !== 'number' || q.options.length < 2) {
                throw new Error(`AI returned malformed question object at index ${index}.`);
            }

            const sanitizedOptions: string[] = q.options.map(sanitizeContent);
            
            if(q.correctAnswerIndex < 0 || q.correctAnswerIndex >= sanitizedOptions.length) {
                console.warn(`AI returned an invalid correctAnswerIndex (${q.correctAnswerIndex}) for question ${index}. Defaulting to 0.`);
                q.correctAnswerIndex = 0;
            }

            return {
                _id: q._id || uuidv4(),
                questionText: sanitizeContent(q.questionText),
                options: sanitizedOptions,
                correctAnswerIndex: q.correctAnswerIndex,
                explanation: sanitizeContent(q.explanation) || "No explanation provided.",
                topic: sanitizeContent(q.topic) || "General",
                difficulty: q.difficulty,
                passage: sanitizeContent(q.passage),
            };
        });
        
        return sanitizedResult;
    },

    async analyzeTestResults(testResult: Partial<ITestResult>): Promise<AnalysisResponse> {
        if (!testResult.questions || !testResult.answers) {
            throw new Error("Questions and answers are required for analysis.");
        }
        const analysisPayload = testResult.questions.map(q => {
            const userAnswer = testResult.answers!.find(ua => ua.questionId === q._id);
            return { 
                question: q.questionText, 
                correctAnswer: q.options[q.correctAnswerIndex], 
                userAnswer: userAnswer !== undefined ? q.options[userAnswer.answerIndex] : "Not answered", 
                topic: q.topic 
            };
        });

        const userPrompt = `Analyze this JSON data from a student's "${testResult.testType}" test. Provide a detailed analysis. \n\n${JSON.stringify(analysisPayload)}`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        questionAnalysis: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    questionText: { type: Type.STRING },
                                    userAnswer: { type: Type.STRING },
                                    correctAnswer: { type: Type.STRING },
                                    isCorrect: { type: Type.BOOLEAN },
                                    explanation: { type: Type.STRING },
                                    topic: { type: Type.STRING },
                                    questionType: { type: Type.STRING }
                                }
                            }
                        },
                        topicPerformance: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    topic: { type: Type.STRING },
                                    correct: { type: Type.NUMBER },
                                    total: { type: Type.NUMBER }
                                }
                            }
                        }
                    }
                },
                systemInstruction: `You are an academic analysis AI. Your function is to analyze student test results. Your entire response must be ONLY a valid JSON object matching the provided schema. Do not add any text or markdown outside the JSON structure. For the 'summary', provide a brief, encouraging, and actionable 1-2 sentence overview. For 'explanation', offer a clear, concise sentence that helps the student learn. For 'topic', use 1-2 words. For 'questionType', identify a specific skill (e.g., "Main Idea", "Linear Equations").`,
            },
        });

        const result = parseJsonResponse<any>(response.text);
        if (!result) throw new Error("AI returned empty analysis data.");
        
        // FIX: Sanitize and validate the results to prevent crashes from malformed AI responses.
        const validatedAnalysis: AnalysisResponse = {
            summary: sanitizeContent(result.summary) || "Your results have been analyzed. Review the breakdown below to see your strengths and areas for improvement.",
            questionAnalysis: (result.questionAnalysis || []).map((qa: any) => ({
                questionText: sanitizeContent(qa.questionText) || "Unknown Question",
                userAnswer: sanitizeContent(qa.userAnswer) || "Not Answered",
                correctAnswer: sanitizeContent(qa.correctAnswer) || "Unknown",
                isCorrect: typeof qa.isCorrect === 'boolean' ? qa.isCorrect : false,
                explanation: sanitizeContent(qa.explanation) || "No explanation provided.",
                topic: sanitizeContent(qa.topic) || "General",
                questionType: sanitizeContent(qa.questionType) || "General",
            })),
            topicPerformance: (result.topicPerformance || []).map((tp: any) => ({
                topic: sanitizeContent(tp.topic) || "Unknown Topic",
                correct: typeof tp.correct === 'number' ? tp.correct : 0,

                total: typeof tp.total === 'number' && tp.total > 0 ? tp.total : 1,
            })),
        };

        return validatedAnalysis;
    },
    
    async generateLearningPlan(goal: ExamGoal, result: ITestResult): Promise<IPlan> {
        const prompt = `You are an academic planner AI. Generate a study plan as a valid JSON object. Your response must be ONLY the JSON object. Do not add markdown. User Data: - Goal: ${goal.exam} score of ${goal.targetScore}. - Exam Date: ${goal.examDate}. - Diagnostic Score: ${result.overallScore}%. - Weakest Topics: ${result.topicPerformance.filter(t => t.total > 0 && (t.correct / t.total) < 0.6).map(t => t.topic).join(', ') || 'None'}. Requirements: 1. Prioritize weakest topics. 2. Weekly 'summary' under 20 words. 3. Each step 'title' under 8 words, 'description' under 25 words. 4. Each step must have an 'estimatedTime' string (e.g., "~25 mins"). 5. Step 'type' must be 'test', 'review', or 'concept'. 6. 'test' steps need 'relatedTestType'. 'review'/'concept' steps need 'topic'. Use a unique string for each step's _id.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                 responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        weeks: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    week: { type: Type.NUMBER },
                                    startDate: { type: Type.STRING },
                                    endDate: { type: Type.STRING },
                                    summary: { type: Type.STRING },
                                    steps: {
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                _id: { type: Type.STRING },
                                                title: { type: Type.STRING },
                                                description: { type: Type.STRING },
                                                type: { type: Type.STRING },
                                                relatedTestType: { type: Type.STRING },
                                                topic: { type: Type.STRING },
                                                completed: { type: Type.BOOLEAN },
                                                estimatedTime: { type: Type.STRING }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
        });

        const partialPlan = parseJsonResponse<{ weeks: PlanWeek[] }>(response.text);
        if (!partialPlan || !partialPlan.weeks || partialPlan.weeks.length === 0) throw new Error("AI returned an empty or invalid learning plan.");

        const fullPlan: Partial<IPlan> = {
            generatedOn: new Date().toISOString(),
            goal: goal,
            weeks: partialPlan.weeks
        };
        return fullPlan as IPlan;
    },

    async getAiceyResponseStream(chatHistory: ChatMessage[], context?: string) {
        const model = "gemini-2.5-flash";
        const contents = chatHistory.map(message => ({
            role: message.role,
            parts: [{ text: message.content }]
        }));

        const systemInstruction = `You are Aicey, a friendly, encouraging AI study assistant for high school students. You are an expert in SAT, ACT, and AP subjects. Your personality is positive and helpful. Keep answers brief. Use emojis. 😊 Format with short paragraphs and lists. ${context ? `\n\nIMPORTANT CONTEXT ABOUT THE USER: ${context}` : ''}`;

        const response = await ai.models.generateContentStream({
            model: model,
            contents: contents,
            config: {
                systemInstruction,
            },
        });

        return response;
    },

    async getAdminInsights(stats: AdminInsightStats) {
        const prompt = `Analyze this aggregated performance data for an online learning platform. Provide a brief, high-level summary as a single block of text. Focus on:
        1. **Overall Performance:** Comment on general trends based on the provided user statistics.
        2. **Top Struggling Areas:** Identify the top struggling topics from the accuracy data.
        3. **Actionable Advice:** Give one concrete, platform-wide suggestion for improvement.
        Keep the entire response under 150 words. Format with markdown for clarity (e.g., using **bold** headers).

        **Data Snapshot:**
        - **Total Active Users:** ${stats.totalUsers}
        - **Sample User Stats (first 100 users):** ${JSON.stringify(stats.userStats)}
        - **Weakest Topics (by accuracy):** ${JSON.stringify(stats.weakestTopics)}
        `;

        const response = await ai.models.generateContent({ 
            model: 'gemini-2.5-flash', 
            contents: prompt 
        });
        return response.text;
    },
};