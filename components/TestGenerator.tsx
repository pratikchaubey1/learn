import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Exam, ExamGoal, TestType } from '../types';
import { useAuth } from '../context/AuthContext';

const examConfigs: Record<Exam, { min: number, max: number, step: number, default: number }> = {
    [Exam.SAT]: { min: 400, max: 1600, step: 10, default: 1600 },
    [Exam.ACT]: { min: 1, max: 36, step: 1, default: 35 },
    [Exam.AP]: { min: 1, max: 5, step: 1, default: 4 }
};

const SatIcon = () => (
  <svg className="w-12 h-12 text-brand-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6A2.25 2.25 0 016 3.75h1.5m9 0h-9" />
  </svg>
);

const ActIcon = () => (
    <svg className="w-12 h-12 text-brand-orange" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ApIcon = () => (
   <svg className="w-12 h-12 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0l-3.076 9.227c-.429 1.282.607 2.57 1.878 2.57h16.348c1.27 0 2.307-1.288 1.878-2.57l-3.076-9.227m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5z" />
  </svg>
);

const ExamCard: React.FC<{ icon: React.ReactNode, title: string, onClick: () => void }> = ({ icon, title, onClick }) => (
    <button
        onClick={onClick}
        className="group bg-white p-6 rounded-2xl text-center font-semibold transition-all duration-300 transform hover:-translate-y-2 border border-slate-200 shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 focus:outline-none focus:ring-4 focus:ring-brand-blue/30"
    >
        <div className="flex items-center justify-center h-16 w-16 mx-auto mb-4 transition-transform duration-300 group-hover:scale-110">{icon}</div>
        <span className="text-2xl font-bold text-slate-800">{title}</span>
    </button>
);


const Onboarding: React.FC = () => {
  const [step, setStep] = useState(1);
  const [examType, setExamType] = useState<Exam>(Exam.SAT);
  const [goalScore, setGoalScore] = useState<number>(examConfigs.SAT.default);
  const [examDate, setExamDate] = useState<string>('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [dateInputType, setDateInputType] = useState('text');
  const [loading, setLoading] = useState(false);

  const { updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setGoalScore(examConfigs[examType].default);
  }, [examType]);

  const handleExamSelect = (selectedExam: Exam) => {
    setExamType(selectedExam);
    setStep(2);
  };
  
  const handleSubmit = async () => {
    setLoading(true);
    setIsConfirmModalOpen(false);
    
    const finalExamDate = examDate || (() => {
      const date = new Date();
      date.setMonth(date.getMonth() + 3);
      return date.toISOString().split('T')[0];
    })();
    
    const goal: ExamGoal = { exam: examType, targetScore: goalScore, examDate: finalExamDate };

    await updateUser({ goal });
    
    let testType: TestType;
    switch (examType) {
        case Exam.SAT:
            testType = TestType.SAT_DIAGNOSTIC;
            break;
        case Exam.ACT:
            testType = TestType.ACT_DIAGNOSTIC;
            break;
        case Exam.AP:
            testType = TestType.AP_DIAGNOSTIC;
            break;
        default:
            testType = TestType.SAT_DIAGNOSTIC;
    }
    
    navigate('/test', { state: { testType, numQuestions: 25, isDiagnostic: true } });
  };

  const currentConfig = examConfigs[examType];

  const renderStep1 = () => (
    <div className="w-full max-w-4xl text-center animate-fade-in">
        <h2 className="text-3xl font-bold text-slate-800 mb-2 flex items-center justify-center gap-3">
            <span className="bg-brand-blue text-white rounded-full w-10 h-10 inline-flex items-center justify-center font-bold text-xl">1</span>
            Select Your Exam
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-10">
            <ExamCard icon={<SatIcon />} title="SAT" onClick={() => handleExamSelect(Exam.SAT)} />
            <ExamCard icon={<ActIcon />} title="ACT" onClick={() => handleExamSelect(Exam.ACT)} />
            <ExamCard icon={<ApIcon />} title="AP" onClick={() => handleExamSelect(Exam.AP)} />
        </div>
    </div>
  );

  const renderStep2 = () => (
     <div className="w-full max-w-lg text-center animate-fade-in">
        <h2 className="text-3xl font-bold text-slate-800 mb-2 flex items-center justify-center gap-3">
            <span className="bg-brand-blue text-white rounded-full w-10 h-10 inline-flex items-center justify-center font-bold text-xl">2</span>
            Set Your Goal
        </h2>
        <div className="bg-white p-10 mt-10 rounded-2xl shadow-xl border border-slate-200">
            <form onSubmit={(e) => { e.preventDefault(); setIsConfirmModalOpen(true); }} className="space-y-8">
                <div>
                    <label htmlFor="goalScore" className="block text-sm font-medium text-slate-600 mb-2 text-left">Target Score ({currentConfig.min}-{currentConfig.max})</label>
                    <input
                      type="number"
                      id="goalScore"
                      value={goalScore}
                      min={currentConfig.min}
                      max={currentConfig.max}
                      step={currentConfig.step}
                      onChange={(e) => setGoalScore(parseInt(e.target.value, 10))}
                      className="w-full bg-white text-base py-3 px-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue-light focus:border-brand-blue-light transition placeholder-slate-400"
                    />
                </div>
                <div>
                    <label htmlFor="examDate" className="block text-sm font-medium text-slate-600 mb-2 text-left">Exam Date</label>
                    <input
                      type={dateInputType}
                      onFocus={() => setDateInputType('date')}
                      onBlur={() => { if(!examDate) setDateInputType('text')}}
                      id="examDate"
                      value={examDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="w-full bg-white text-base py-3 px-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue-light focus:border-brand-blue-light transition placeholder-slate-400"
                      placeholder="DD/MM/YYYY"
                    />
                    <p className="text-left text-xs text-slate-500 mt-2">Leave blank for a default 3-month plan.</p>
                </div>
                 <div className="flex items-center gap-4 pt-4">
                    <button type="button" onClick={() => setStep(1)} className="text-slate-600 font-bold py-3 px-5 rounded-lg transition-colors hover:bg-slate-100">
                        &larr; Back
                    </button>
                    <button type="submit" className="flex-1 bg-brand-blue text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                        Set Goal & Continue
                    </button>
                 </div>
            </form>
        </div>
     </div>
  );

  const renderConfirmModal = () => (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md m-4 text-slate-800">
            <div className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Confirm Your Goal</h3>
                <p className="text-slate-500 mb-8">Please review your selections before we generate your personalized plan.</p>
                <div className="space-y-4 text-left bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="flex justify-between items-center"><span className="font-medium text-slate-500">Exam:</span><span className="font-bold text-brand-blue">{examType}</span></div>
                    <div className="flex justify-between items-center"><span className="font-medium text-slate-500">Target Score:</span><span className="font-bold">{goalScore}</span></div>
                    <div className="flex justify-between items-center"><span className="font-medium text-slate-500">Exam Date:</span><span className="font-bold">{examDate ? new Date(examDate + 'T00:00:00').toLocaleDateString() : '3-Month Plan (Default)'}</span></div>
                </div>
                 <div className="flex items-center gap-4 mt-8">
                     <button onClick={() => setIsConfirmModalOpen(false)} className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 px-6 rounded-lg transition-colors">Go Back</button>
                     <button onClick={handleSubmit} disabled={loading} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50">
                        {loading ? 'Generating...' : 'Accept & Continue' }
                     </button>
                 </div>
            </div>
        </div>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-white">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white via-blue-50 to-orange-50 z-0"></div>
        </div>
        
        <header className="absolute top-0 left-0 w-full p-6 z-10">
            <span className="font-bold text-xl text-brand-blue">Refresh Kid Learning</span>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-4 z-10">
            <div className="text-center w-full max-w-4xl mb-12">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-800">Let's Create Your Study Plan</h1>
                <p className="text-slate-500 mt-3 max-w-xl mx-auto">Follow these simple steps to get a personalized plan.</p>
            </div>
            
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
        </main>

        {isConfirmModalOpen && renderConfirmModal()}
    </div>
  );
};

export default Onboarding;