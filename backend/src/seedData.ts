// backend/src/seedData.ts
import { TestType } from './types';

export const allTestDefinitions = [
    // Advanced / Adaptive
    { id: TestType.ADAPTIVE_SAT_MATH, name: "Adaptive SAT Math", description: "A test that adjusts difficulty based on your answers, focusing on algebra, data analysis, and advanced math.", category: 'Advanced', isAdaptive: true, isMock: false },
    { id: TestType.ADAPTIVE_ACT_MATH, name: "Adaptive ACT Math", description: "An adaptive test covering pre-algebra, geometry, and trigonometry that adjusts to your skill level.", category: 'Advanced', isAdaptive: true, isMock: false },

    // Diagnostics
    { id: TestType.SAT_DIAGNOSTIC, name: "SAT Diagnostic", description: "A comprehensive 25-question test to assess your baseline skills in both Math and Reading & Writing.", category: 'Diagnostic', isAdaptive: false, isMock: false },
    { id: TestType.ACT_DIAGNOSTIC, name: "ACT Diagnostic", description: "A comprehensive 25-question test to evaluate your initial skills across English, Math, Reading, and Science.", category: 'Diagnostic', isAdaptive: false, isMock: false },
    { id: TestType.AP_DIAGNOSTIC, name: "AP Diagnostic", description: "A 25-question diagnostic covering a mix of popular AP subjects to gauge general knowledge and reasoning.", category: 'Diagnostic', isAdaptive: false, isMock: false },
    
    // SAT Practice
    { id: TestType.SAT_MATH, name: "SAT Math Practice", description: "Focuses on algebra, problem-solving, data analysis, and advanced mathematical concepts.", category: 'SAT', isAdaptive: false, isMock: false },
    { id: TestType.SAT_RW, name: "SAT Reading & Writing", description: "Assesses comprehension, vocabulary in context, and command of evidence from literary and informational texts.", category: 'SAT', isAdaptive: false, isMock: false },
    { id: TestType.SAT_ALGEBRA, name: "SAT Algebra", description: "Practice core algebra concepts, including linear equations, systems, and functions.", category: 'SAT', isAdaptive: false, isMock: false },
    { id: TestType.SAT_GEOMETRY, name: "SAT Geometry & Trig", description: "Hone your skills in geometry, trigonometry, and complex numbers.", category: 'SAT', isAdaptive: false, isMock: false },

    // ACT Practice
    { id: TestType.ACT_MATH, name: "ACT Math Practice", description: "Covers a broad range of math topics, including algebra, geometry, and trigonometry.", category: 'ACT', isAdaptive: false, isMock: false },
    { id: TestType.ACT_SCIENCE, name: "ACT Science", description: "Measures your ability to interpret, analyze, and evaluate scientific data and hypotheses.", category: 'ACT', isAdaptive: false, isMock: false },
    { id: TestType.ACT_READING, name: "ACT Reading", description: "Tests your comprehension of prose passages in social studies, natural sciences, humanities, and literary fiction.", category: 'ACT', isAdaptive: false, isMock: false },
    { id: TestType.ACT_ENGLISH, name: "ACT English", description: "Evaluates your understanding of grammar, punctuation, sentence structure, and rhetorical skills.", category: 'ACT', isAdaptive: false, isMock: false },
    { id: TestType.ACT_WRITING, name: "ACT Writing", description: "Practice for the optional ACT Writing test by analyzing perspectives and composing a persuasive essay.", category: 'ACT', isAdaptive: false, isMock: false },

    // AP Practice
    { id: TestType.AP_CALC_AB, name: "AP Calculus AB", description: "Covers limits, derivatives, and integrals, equivalent to a first-semester college calculus course.", category: 'AP', isAdaptive: false, isMock: false },
    { id: TestType.AP_USH, name: "AP US History", description: "Assesses knowledge of major events, themes, and historical thinking skills in U.S. history.", category: 'AP', isAdaptive: false, isMock: false },
    { id: TestType.AP_BIOLOGY, name: "AP Biology", description: "Tests your grasp of core biological principles and scientific practices.", category: 'AP', isAdaptive: false, isMock: false },
    { id: TestType.AP_LIT, name: "AP English Literature", description: "Focuses on the critical analysis of imaginative literature, including fiction, poetry, and drama.", category: 'AP', isAdaptive: false, isMock: false },
    { id: TestType.AP_PHYSICS_1, name: "AP Physics 1", description: "An algebra-based course covering Newtonian mechanics, work, energy, and power.", category: 'AP', isAdaptive: false, isMock: false },
    { id: TestType.AP_WORLD_HISTORY, name: "AP World History: Modern", description: "Explores global history from c. 1200 to the present, focusing on themes and interactions.", category: 'AP', isAdaptive: false, isMock: false },
    { id: TestType.AP_CHEMISTRY, name: "AP Chemistry", description: "Covers concepts typically included in a first-year college general chemistry course.", category: 'AP', isAdaptive: false, isMock: false },
    { id: TestType.AP_PSYCHOLOGY, name: "AP Psychology", description: "Introduces the systematic and scientific study of behavior and mental processes.", category: 'AP', isAdaptive: false, isMock: false },

    // Mock Quizzes
    { id: TestType.SAT_MATH_MOCK, name: "SAT Math Mock", description: "A 10-question quiz on core SAT Math topics like Heart of Algebra and Problem Solving.", category: 'Mock', isMock: true, isAdaptive: false },
    { id: TestType.SAT_RW_MOCK, name: "SAT R&W Mock", description: "A 10-question quiz to test your command of evidence and standard English conventions.", category: 'Mock', isMock: true, isAdaptive: false },
    { id: TestType.SAT_ALGEBRA_MOCK, name: "SAT Algebra Mock", description: "A 10-question quiz on linear equations, inequalities, and functions.", category: 'Mock', isMock: true, isAdaptive: false },
    { id: TestType.SAT_GEOMETRY_MOCK, name: "SAT Geometry Mock", description: "A 10-question quiz on triangles, circles, and other geometric concepts.", category: 'Mock', isMock: true, isAdaptive: false },
    { id: TestType.ACT_MATH_MOCK, name: "ACT Math Mock", description: "A 10-question quiz covering key ACT Math areas from pre-algebra to trigonometry.", category: 'Mock', isMock: true, isAdaptive: false },
    { id: TestType.ACT_SCIENCE_MOCK, name: "ACT Science Mock", description: "A 10-question quiz to practice interpreting data, charts, and conflicting viewpoints.", category: 'Mock', isMock: true, isAdaptive: false },
    { id: TestType.ACT_READING_MOCK, name: "ACT Reading Mock", description: "A 10-question quiz to sharpen your reading comprehension and passage analysis skills.", category: 'Mock', isMock: true, isAdaptive: false },
    { id: TestType.ACT_ENGLISH_MOCK, name: "ACT English Mock", description: "A 10-question quiz focused on grammar, punctuation, and rhetorical skills.", category: 'Mock', isMock: true, isAdaptive: false },
    { id: TestType.AP_CALC_AB_MOCK, name: "AP Calc AB Mock", description: "A 10-question quiz on fundamental calculus concepts like derivatives and integrals.", category: 'Mock', isMock: true, isAdaptive: false },
    { id: TestType.AP_USH_MOCK, name: "AP US History Mock", description: "A 10-question quiz covering key periods and themes in American history.", category: 'Mock', isMock: true, isAdaptive: false },
    { id: TestType.AP_BIOLOGY_MOCK, name: "AP Biology Mock", description: "A 10-question quiz on topics from cellular processes to ecology.", category: 'Mock', isMock: true, isAdaptive: false }
];