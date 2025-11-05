import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, Sector } from 'recharts';
import { User, Exam } from '../../types';

interface UserDistributionChartProps {
    users: User[];
}

const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload } = props;
    return (
        <g>
            <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill="#333" className="dark:fill-white font-bold text-lg">{payload.name}</text>
            <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill="#666" className="dark:fill-slate-300 text-sm">{`${payload.value} users`}</text>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 6}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
            />
        </g>
    );
};


const UserDistributionChart: React.FC<UserDistributionChartProps> = ({ users }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    const data = useMemo(() => {
        const counts = {
            [Exam.SAT]: 0,
            [Exam.ACT]: 0,
            [Exam.AP]: 0,
            'Other': 0,
        };

        users.forEach(user => {
            if (user.goal?.exam) {
                counts[user.goal.exam]++;
            } else {
                counts['Other']++;
            }
        });

        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .filter(entry => entry.value > 0);

    }, [users]);

    const COLORS = {
        [Exam.SAT]: '#2563eb', // brand-blue
        [Exam.ACT]: '#f97316', // brand-orange
        [Exam.AP]: '#4f46e5',   // indigo-600
        'Other': '#64748b',  // slate-500
    };

    if (data.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">User Goal Distribution</h3>
                <p className="text-slate-500 dark:text-slate-400">No user data available to display chart.</p>
            </div>
        );
    }
    

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">User Goal Distribution</h3>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            activeIndex={activeIndex}
                            activeShape={renderActiveShape}
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            onMouseEnter={(_, index) => setActiveIndex(index)}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(2px)', borderRadius: '0.5rem' }} formatter={(value) => `${value} users`} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default UserDistributionChart;