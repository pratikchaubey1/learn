import React, { useState, useMemo } from 'react';
import type { User } from '../../types';
import { Exam } from '../../types';
import { avatars } from '../avatars';
import Avatar from '../Avatar';

interface UserTableProps {
    users: User[];
    onDownloadCSV: () => void;
    examFilter: Exam | 'all';
    setExamFilter: (filter: Exam | 'all') => void;
}

type SortKey = 'fullName' | 'exam' | 'targetScore' | 'examDate' | 'planProgress' | 'testsTaken' | 'avgScore' | 'lastActiveDate';
type SortDirection = 'ascending' | 'descending';

const UserTable: React.FC<UserTableProps> = React.memo(({ users, onDownloadCSV, examFilter, setExamFilter }) => {
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>({ key: 'fullName', direction: 'ascending'});

    const sortedUsers = useMemo(() => {
        let sortableUsers = [...users];

        if (sortConfig !== null) {
            sortableUsers.sort((a, b) => {
                let aValue: string | number | Date | null = null;
                let bValue: string | number | Date | null = null;

                switch (sortConfig.key) {
                    case 'fullName':
                        aValue = a.fullName;
                        bValue = b.fullName;
                        break;
                    case 'exam':
                        aValue = a.goal?.exam || '';
                        bValue = b.goal?.exam || '';
                        break;
                    case 'targetScore':
                        aValue = a.goal?.targetScore ?? -1;
                        bValue = b.goal?.targetScore ?? -1;
                        break;
                    case 'examDate':
                        aValue = a.goal?.examDate ? new Date(a.goal.examDate).getTime() : null;
                        bValue = b.goal?.examDate ? new Date(b.goal.examDate).getTime() : null;
                        break;
                    case 'planProgress':
                        aValue = a.planProgress ?? -1;
                        bValue = b.planProgress ?? -1;
                        break;
                    case 'testsTaken':
                        aValue = a.testsTaken ?? 0;
                        bValue = b.testsTaken ?? 0;
                        break;
                    case 'avgScore':
                        aValue = a.averageScore ?? -1;
                        bValue = b.averageScore ?? -1;
                        break;
                    case 'lastActiveDate':
                        aValue = a.lastTestTaken ? new Date(a.lastTestTaken).getTime() : null;
                        bValue = b.lastTestTaken ? new Date(b.lastTestTaken).getTime() : null;
                        break;
                }
                
                if (aValue === null || aValue === -1 || aValue === '') aValue = sortConfig.direction === 'ascending' ? Infinity : -Infinity;
                if (bValue === null || bValue === -1 || bValue === '') bValue = sortConfig.direction === 'ascending' ? Infinity : -Infinity;

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableUsers;
    }, [users, sortConfig]);

    const requestSort = (key: SortKey) => {
        let direction: SortDirection = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };
    
    const SortableHeader: React.FC<{ sortKey: SortKey, children: React.ReactNode }> = ({ sortKey, children }) => {
        const isSorted = sortConfig?.key === sortKey;
        const icon = isSorted ? (sortConfig?.direction === 'ascending' ? '▲' : '▼') : '↕';
        return (
            <th scope="col" className="px-4 py-3 whitespace-nowrap">
                <button onClick={() => requestSort(sortKey)} className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors">
                    {children}
                    <span className={`text-slate-400 dark:text-slate-500 ${isSorted && 'text-slate-800 dark:text-white'}`}>{icon}</span>
                </button>
            </th>
        );
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">User Monitoring</h3>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                        <label htmlFor="exam-filter" className="text-sm font-medium text-slate-600 dark:text-slate-300 flex-shrink-0">Filter:</label>
                        <select
                            id="exam-filter"
                            value={examFilter}
                            onChange={(e) => setExamFilter(e.target.value as Exam | 'all')}
                            className="bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-brand-blue-light focus:border-brand-blue-light block w-full p-2"
                        >
                            <option value="all">All Exams</option>
                            <option value={Exam.SAT}>SAT</option>
                            <option value={Exam.ACT}>ACT</option>
                            <option value={Exam.AP}>AP</option>
                        </select>
                    </div>
                     <button 
                        onClick={onDownloadCSV}
                        className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg font-semibold border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors shadow-sm text-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Download
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                        <tr>
                            <SortableHeader sortKey="fullName">User</SortableHeader>
                            <SortableHeader sortKey="exam">Exam Goal</SortableHeader>
                            <SortableHeader sortKey="targetScore">Target Score</SortableHeader>
                            <SortableHeader sortKey="examDate">Exam Date</SortableHeader>
                            <SortableHeader sortKey="planProgress">Plan Progress</SortableHeader>
                            <SortableHeader sortKey="testsTaken">Tests Taken</SortableHeader>
                            <SortableHeader sortKey="avgScore">Avg. Score</SortableHeader>
                            <SortableHeader sortKey="lastActiveDate">Last Active</SortableHeader>
                            <th scope="col" className="px-4 py-3 text-center">Contact</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedUsers.length > 0 ? sortedUsers.map(user => {
                            const testsTaken = user.testsTaken ?? 0;
                            const avgScore = user.averageScore ?? 'N/A';
                            const lastActiveDate = user.lastTestTaken ? new Date(user.lastTestTaken) : null;
                            const planProgress = user.planProgress ?? 'N/A';

                            return (
                                <tr key={user.username} className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/20">
                                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white flex items-center min-w-[200px]">
                                        <Avatar svg={avatars[user.avatarId]} className="w-10 h-10 rounded-full overflow-hidden mr-3 flex-shrink-0" />
                                        <div className="min-w-0">
                                            <div className="font-bold truncate">{user.fullName}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">@{user.username}</div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-semibold">{user.goal?.exam || 'N/A'}</td>
                                    <td className="px-4 py-3 font-bold text-slate-800 dark:text-white text-center">{user.goal?.targetScore || 'N/A'}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">{user.goal?.examDate ? new Date(user.goal.examDate).toLocaleDateString() : 'N/A'}</td>
                                    <td className="px-4 py-3 min-w-[120px]">
                                        {planProgress !== 'N/A' ? (
                                             <div className="flex items-center">
                                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mr-2">
                                                    <div className="bg-brand-blue h-2.5 rounded-full" style={{width: `${planProgress}%`}}></div>
                                                </div>
                                                <span className="font-semibold text-slate-700 dark:text-slate-200 text-xs">{planProgress}%</span>
                                            </div>
                                        ) : 'N/A'}
                                    </td>
                                    <td className="px-4 py-3 text-center font-semibold">{testsTaken}</td>
                                    <td className="px-4 py-3 text-center font-bold text-slate-800 dark:text-white">{avgScore}{avgScore !== 'N/A' ? '%' : ''}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">{lastActiveDate ? lastActiveDate.toLocaleDateString() : 'N/A'}</td>
                                    <td className="px-4 py-3 text-center">
                                        <a 
                                            href={`mailto:${user.email}`}
                                            title={`Contact ${user.fullName}`}
                                            className="inline-block p-2 text-slate-500 rounded-full hover:bg-blue-100 dark:hover:bg-slate-700 hover:text-brand-blue dark:text-slate-400 dark:hover:text-white transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                            </svg>
                                        </a>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={9} className="text-center py-8 text-slate-500 dark:text-slate-400">
                                    No users found for the selected filter.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
});

export default UserTable;
