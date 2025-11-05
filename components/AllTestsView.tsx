import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { TestType } from '../types';
import { getIconForTest } from '../assets/testIcons';
import { testService } from '../services/testService';
import Spinner from './Spinner';

interface AllTestsViewProps {
    onSelectTest: (testType: TestType, isDiagnostic: boolean, isAdaptive: boolean) => void;
    onSelectMockTest: (testType: TestType) => void;
}

interface TestItem {
    id: TestType;
    name: string;
    description: string;
    category: string;
    isAdaptive?: boolean;
    isMock?: boolean;
}

const TestCard: React.FC<{ test: TestItem; onSelect: () => void }> = ({ test, onSelect }) => {
    const icon = getIconForTest(test.name);
    
    const categoryColors: Record<string, string> = {
        'Advanced': 'from-indigo-500 to-purple-600',
        'Diagnostic': 'from-slate-600 to-slate-800',
        'SAT': 'from-brand-blue to-blue-700',
        'ACT': 'from-brand-orange to-orange-600',
        'AP': 'from-red-600 to-red-800',
        'Mock': 'from-teal-500 to-cyan-600',
        'Default': 'from-slate-500 to-slate-700',
    };

    const gradient = categoryColors[test.category] || categoryColors.Default;

    return (
        <div 
            className={`group relative rounded-2xl shadow-lg flex flex-col justify-between p-5 text-white overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl h-48 bg-gradient-to-br ${gradient}`}
        >
            <div className="absolute -right-4 -bottom-4 text-white/10" dangerouslySetInnerHTML={{ __html: icon.replace('w-8 h-8', 'w-28 h-28') }} />
            
            <div className="relative z-10">
                 <div className="mb-2" dangerouslySetInnerHTML={{ __html: icon }} />
                <h3 className="font-bold text-lg leading-tight">{test.name}</h3>
            </div>
            
            <div className="relative z-10">
                 <button
                    onClick={onSelect}
                    aria-label={`Take ${test.name} test`}
                    className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/20 focus:ring-white"
                >
                    Take Test
                </button>
            </div>
        </div>
    );
};


const AllTestsView: React.FC<AllTestsViewProps> = ({ onSelectTest, onSelectMockTest }) => {
    const { data: allTests = [], isLoading, isError, error } = useQuery<TestItem[]>({
        queryKey: ['allTests'],
        queryFn: testService.getAllTests,
    });

    const { practiceAndDiagnosticTests, mockTests } = React.useMemo(() => {
        const practiceAndDiagnostic = allTests.filter(test => !test.isMock);
        const mocks = allTests.filter(test => test.isMock);
        return { practiceAndDiagnosticTests: practiceAndDiagnostic, mockTests: mocks };
    }, [allTests]);
    
    const groupedPracticeTests = React.useMemo(() => {
        return practiceAndDiagnosticTests.reduce((acc, test) => {
            if (!acc[test.category]) acc[test.category] = [];
            acc[test.category].push(test);
            return acc;
        }, {} as Record<string, TestItem[]>);
    }, [practiceAndDiagnosticTests]);

    const categoryOrder = ['Advanced', 'Diagnostic', 'SAT', 'ACT', 'AP'];
    const sortedCategories = Object.keys(groupedPracticeTests).sort((a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b));

    if (isLoading) {
        return <div className="p-8 flex justify-center items-center"><Spinner message="Loading Tests..." /></div>
    }

    if (isError) {
        return <div className="p-8 text-center text-red-500 font-semibold">{error.message}</div>
    }

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <h1 className="text-3xl font-bold text-brand-dark dark:text-slate-100 mb-8">All Practice Tests</h1>

             {sortedCategories.map(category => (
                <div key={category} className="mb-10">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">{category} Tests</h2>
                    <div className="h-px bg-gradient-to-r from-transparent via-brand-orange/30 to-transparent mb-4"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {groupedPracticeTests[category].map(test => (
                           <TestCard key={test.id} test={test} onSelect={() => onSelectTest(test.id, test.category === 'Diagnostic', test.isAdaptive || false)} />
                        ))}
                    </div>
                </div>
            ))}

            {mockTests.length > 0 && (
                 <div key="Mock" className="mb-10">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">Mock Quizzes (10 Questions)</h2>
                    <div className="h-px bg-gradient-to-r from-transparent via-brand-orange/30 to-transparent mb-4"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {mockTests.map(test => (
                           <TestCard 
                                key={test.id} 
                                test={test} 
                                onSelect={() => onSelectMockTest(test.id)}
                           />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllTestsView;