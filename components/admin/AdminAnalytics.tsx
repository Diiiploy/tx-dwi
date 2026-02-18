import React, { useState, useMemo } from 'react';
import { Student, Course } from '../../types';
import { IconStudents, IconCheckCircle, IconWarning, IconCreditCard, IconActivity, IconZap, IconCalendar, IconFilter } from '../icons';

// Helper to format date as 'Month Year'
const formatMonthYear = (date: Date) => {
  return date.toLocaleString('default', { month: 'short', year: 'numeric' });
};

// Simple Bar Chart Component
const BarChart = ({ data, title, color = 'bg-blue-500' }: { data: { label: string; value: number }[]; title: string; color?: string }) => {
    const maxValue = Math.max(...data.map(d => d.value), 0);
    return (
        <div className="h-full flex flex-col">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">{title}</h4>
            <div className="flex-grow flex items-end bg-gray-50 p-4 rounded-lg border border-gray-100 space-x-2">
                {data.map(({ label, value }) => (
                    <div key={label} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                        <div 
                            className={`w-full ${color} hover:brightness-110 transition-all rounded-t-sm`}
                            style={{ height: `${maxValue > 0 ? (value / maxValue) * 100 : 0}%` }}
                        >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                                {value}
                            </div>
                        </div>
                        <span className="text-[10px] text-gray-400 mt-2 rotate-45 origin-left whitespace-nowrap">{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Simple Pie Chart Component
const PieChart = ({ data, title }: { data: { label: string; value: number; color: string }[]; title: string }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercentage = 0;
    const gradients = data.map(item => {
        const percentage = total > 0 ? (item.value / total) * 100 : 0;
        const start = cumulativePercentage;
        cumulativePercentage += percentage;
        const end = cumulativePercentage;
        return `${item.color} ${start}% ${end}%`;
    });

    return (
        <div className="h-full flex flex-col">
            <h4 className="text-sm font-semibold text-gray-700 mb-6">{title}</h4>
            <div className="flex-grow flex flex-col md:flex-row items-center justify-around gap-6">
                <div 
                    className="w-32 h-32 rounded-full shadow-inner border-4 border-white" 
                    style={{ background: total > 0 ? `conic-gradient(${gradients.join(', ')})` : '#f3f4f6' }}
                    role="img"
                    aria-label={title}
                ></div>
                <div className="space-y-2">
                    {data.map(item => (
                        <div key={item.label} className="flex items-center gap-2 text-xs">
                            <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }}></span>
                            <span className="text-gray-600 truncate max-w-[120px]">{item.label}:</span>
                            <span className="font-bold text-gray-900">{item.value}</span>
                            <span className="text-gray-400">({total > 0 ? ((item.value/total)*100).toFixed(0) : 0}%)</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

interface LineChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        color: string;
    }[];
}

const LineChart = ({ data, title }: { data: LineChartData, title: string }) => {
    const width = 800;
    const height = 300;
    const padding = 50;
    const usableWidth = width - padding * 2;
    const usableHeight = height - padding * 2;

    const allValues = data.datasets.flatMap(ds => ds.data);
    const maxValue = Math.max(...allValues, 1);
    const yAxisLabels = [0, Math.ceil(maxValue / 2), maxValue];

    const xPos = (index: number) => padding + (index / (data.labels.length - 1 || 1)) * usableWidth;
    const yPos = (value: number) => height - padding - (value / maxValue) * usableHeight;
    
    return (
        <div className="h-full flex flex-col">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">{title}</h4>
            <div className="relative flex-grow">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                    {/* Y-axis labels and grid lines */}
                    {yAxisLabels.map(label => (
                        <g key={`y-axis-${label}`}>
                            <text x={padding - 10} y={yPos(label)} textAnchor="end" alignmentBaseline="middle" className="text-[10px] fill-current text-gray-400">{label}</text>
                            <line x1={padding} y1={yPos(label)} x2={width - padding} y2={yPos(label)} className="stroke-current text-gray-100" strokeDasharray="4" />
                        </g>
                    ))}
                    {/* X-axis labels */}
                    {data.labels.map((label, index) => (
                         <text key={`x-axis-${label}`} x={xPos(index)} y={height - padding + 20} textAnchor="middle" className="text-[10px] fill-current text-gray-400">{label}</text>
                    ))}

                    {/* Data lines */}
                    {data.datasets.map(dataset => (
                        <path
                            key={dataset.label}
                            d={`M ${dataset.data.map((value, index) => `${xPos(index)} ${yPos(value)}`).join(' L ')}`}
                            fill="none"
                            stroke={dataset.color}
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    ))}
                    {/* Data points */}
                    {data.datasets.map(dataset => (
                        <g key={`points-${dataset.label}`}>
                            {dataset.data.map((value, index) => (
                                <circle
                                    key={`${dataset.label}-${index}`}
                                    cx={xPos(index)}
                                    cy={yPos(value)}
                                    r="4"
                                    fill="white"
                                    stroke={dataset.color}
                                    strokeWidth="2"
                                />
                            ))}
                        </g>
                    ))}
                </svg>
                 <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2">
                    {data.datasets.map(dataset => (
                        <div key={dataset.label} className="flex items-center gap-2 text-xs">
                            <span className="w-3 h-0.5 rounded-full" style={{ backgroundColor: dataset.color }}></span>
                            <span className="text-gray-500 font-medium">{dataset.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ label, value, subtext, icon: Icon, colorClass, trend }: { label: string, value: string | number, subtext?: string, icon: any, colorClass: string, trend?: { label: string, isUp: boolean } }) => (
    <div className="p-5 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                <p className="text-2xl font-black text-gray-900">{value}</p>
            </div>
            <div className={`p-2.5 rounded-lg ${colorClass}`}>
                <Icon className="w-5 h-5" />
            </div>
        </div>
        {(subtext || trend) && (
            <div className="mt-4 flex items-center gap-2">
                {trend && (
                    <span className={`text-xs font-bold flex items-center gap-0.5 ${trend.isUp ? 'text-green-600' : 'text-red-600'}`}>
                        {trend.isUp ? '↑' : '↓'} {trend.label}
                    </span>
                )}
                {subtext && <span className="text-xs text-gray-500">{subtext}</span>}
            </div>
        )}
    </div>
);


const AdminAnalytics: React.FC<{ students: Student[], courses: Course[] }> = ({ students, courses }) => {
    const [timeRange, setTimeRange] = useState<'30' | '180' | '365'>('365');
    const [filterCourseId, setFilterCourseId] = useState<string>('all');
    const [trendView, setTrendView] = useState<'course' | 'company'>('course');

    // Filtered data based on selection
    const filteredStudents = useMemo(() => {
        const now = new Date();
        const cutoff = new Date();
        cutoff.setDate(now.getDate() - parseInt(timeRange));

        return students.filter(s => {
            const regDate = new Date(s.registrationDate);
            const matchesTime = regDate >= cutoff;
            const matchesCourse = filterCourseId === 'all' || s.cohort === courses.find(c => c.id === filterCourseId)?.name[0];
            return matchesTime && matchesCourse;
        });
    }, [students, timeRange, filterCourseId, courses]);

    // Metric Calculations
    const metrics = useMemo(() => {
        const total = filteredStudents.length;
        const completed = filteredStudents.filter(s => s.status === 'Completed').length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        const totalRevenue = filteredStudents.reduce((sum, s) => {
            return sum + s.paymentHistory.reduce((pSum, p) => p.status === 'Paid' ? pSum + p.amount : pSum, 0);
        }, 0);

        const expeditedCount = filteredStudents.filter(s => s.paymentHistory.some(p => p.expedited)).length;
        
        const passScores = filteredStudents.flatMap(s => s.quizResults.map(r => parseInt(r.score)));
        const passRate = passScores.length > 0 ? Math.round((passScores.filter(score => score >= 70).length / passScores.length) * 100) : 0;
        
        const onWatch = filteredStudents.filter(s => s.status === 'On Watch').length;

        return { total, completionRate, totalRevenue, expeditedCount, passRate, onWatch };
    }, [filteredStudents]);

    // Data for Trends
    const monthKeys = useMemo(() => {
        const months = parseInt(timeRange) === 30 ? 1 : parseInt(timeRange) / 30;
        const keys: string[] = [];
        const labels: string[] = [];
        for (let i = months - 1; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            keys.push(formatMonthYear(d));
            labels.push(d.toLocaleString('default', { month: 'short' }));
        }
        return { keys, labels };
    }, [timeRange]);

    const trendData = useMemo(() => {
        const { keys, labels } = monthKeys;
        const byCourse: Record<string, number[]> = {};
        const byCompany: Record<string, number[]> = {};

        courses.forEach(c => byCourse[c.name] = Array(keys.length).fill(0));
        ['North', 'South', 'West', 'Southeast'].forEach(c => byCompany[c] = Array(keys.length).fill(0));
        
        const cohortToCourseMap = courses.reduce((acc, course) => {
             const cohort = course.name[0];
             acc[cohort] = course.name;
             return acc;
        }, {} as Record<string, string>);

        filteredStudents.forEach(student => {
            const regDate = new Date(student.registrationDate);
            const monthKey = formatMonthYear(regDate);
            const monthIndex = keys.indexOf(monthKey);
            if (monthIndex > -1) {
                const courseName = cohortToCourseMap[student.cohort];
                if (courseName && byCourse[courseName]) byCourse[courseName][monthIndex]++;
                if (byCompany[student.company]) byCompany[student.company][monthIndex]++;
            }
        });

        const palette = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];
        
        return {
            course: {
                labels,
                datasets: Object.entries(byCourse).map(([label, data], index) => ({ label, data, color: palette[index % palette.length] }))
            },
            company: {
                labels,
                datasets: Object.entries(byCompany).map(([label, data], index) => ({ label, data, color: palette[index % palette.length] }))
            }
        };
    }, [filteredStudents, courses, monthKeys]);

    // Status Breakdown
    const statusPieData = useMemo(() => {
        const counts = filteredStudents.reduce((acc, s) => {
            acc[s.status] = (acc[s.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return [
            { label: 'Completed', value: counts['Completed'] || 0, color: '#10B981' },
            { label: 'In Progress', value: counts['In Progress'] || 0, color: '#3B82F6' },
            { label: 'On Watch', value: counts['On Watch'] || 0, color: '#F59E0B' },
            { label: 'Withdrawn', value: counts['Withdrawn'] || 0, color: '#EF4444' },
        ];
    }, [filteredStudents]);

    // Pass Rate Bar Chart (By Course)
    const passRateData = useMemo(() => {
        return courses.map(course => {
            const courseStudents = filteredStudents.filter(s => s.cohort === course.name[0]);
            const scores = courseStudents.flatMap(s => s.quizResults.map(r => parseInt(r.score)));
            const rate = scores.length > 0 ? Math.round((scores.filter(sc => sc >= 70).length / scores.length) * 100) : 0;
            return { label: course.name.split(' ')[0], value: rate };
        });
    }, [filteredStudents, courses]);

    return (
        <div className="space-y-6">
            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                        <IconFilter className="w-5 h-5" />
                    </div>
                    <h2 className="text-sm font-bold text-gray-700 uppercase tracking-tight">Dashboard Filters</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                    <select 
                        value={timeRange} 
                        onChange={(e) => setTimeRange(e.target.value as any)}
                        className="text-xs font-semibold bg-gray-50 border-gray-200 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="30">Last 30 Days</option>
                        <option value="180">Last 6 Months</option>
                        <option value="365">Last 12 Months</option>
                    </select>
                    <select 
                        value={filterCourseId} 
                        onChange={(e) => setFilterCourseId(e.target.value)}
                        className="text-xs font-semibold bg-gray-50 border-gray-200 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">All Courses</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard 
                    label="Total Revenue" 
                    value={`$${metrics.totalRevenue.toLocaleString()}`} 
                    subtext="from paid fees"
                    icon={IconCreditCard} 
                    colorClass="bg-green-50 text-green-600"
                    trend={{ label: '8% vs last period', isUp: true }}
                />
                <MetricCard 
                    label="Enrolled Students" 
                    value={metrics.total} 
                    subtext="active within range"
                    icon={IconStudents} 
                    colorClass="bg-blue-50 text-blue-600"
                />
                <MetricCard 
                    label="Passing Grade Rate" 
                    value={`${metrics.passRate}%`} 
                    subtext="scores >= 70%"
                    icon={IconCheckCircle} 
                    colorClass="bg-purple-50 text-purple-600"
                    trend={{ label: '2% improvement', isUp: true }}
                />
                <MetricCard 
                    label="Compliance Alerts" 
                    value={metrics.onWatch} 
                    subtext="students currently on watch"
                    icon={IconWarning} 
                    colorClass="bg-red-50 text-red-600"
                    trend={{ label: '15% decrease', isUp: false }}
                />
            </div>

            {/* Trends Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <IconActivity className="w-5 h-5 text-blue-500" />
                            <h3 className="font-bold text-gray-900">Registration Trends</h3>
                        </div>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button 
                                onClick={() => setTrendView('course')} 
                                className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${trendView === 'course' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
                            >By Course</button>
                            <button 
                                onClick={() => setTrendView('company')} 
                                className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${trendView === 'company' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
                            >By Company</button>
                        </div>
                    </div>
                    <LineChart data={trendView === 'course' ? trendData.course : trendData.company} title="" />
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <IconZap className="w-5 h-5 text-yellow-500" />
                        <h3 className="font-bold text-gray-900">Quick Stats</h3>
                    </div>
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-gray-500">Expedited Certificates</span>
                            <span className="text-lg font-black text-gray-900">{metrics.expeditedCount}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-gray-500">Program Pass Rate</span>
                            <span className="text-lg font-black text-gray-900">{metrics.passRate}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-gray-500">Average Attendance</span>
                            <span className="text-lg font-black text-gray-900">96.4%</span>
                        </div>
                        <hr className="border-gray-100" />
                        <div>
                             <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Goal Progress</h4>
                             <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-[10px] font-bold text-gray-600 mb-1">
                                        <span>MONTHLY REVENUE TARGET</span>
                                        <span>82%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '82%' }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-[10px] font-bold text-gray-600 mb-1">
                                        <span>ENROLLMENT GOAL</span>
                                        <span>64%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-purple-500 rounded-full" style={{ width: '64%' }}></div>
                                    </div>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Distribution Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-[320px]">
                    <PieChart data={statusPieData} title="Student Status Distribution" />
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-[320px]">
                    <BarChart 
                        data={passRateData} 
                        title="Passing Grade % by Course" 
                        color="bg-purple-500"
                    />
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <IconCalendar className="w-5 h-5 text-gray-400" />
                            <h3 className="font-bold text-gray-900">Historical Benchmarks</h3>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Comparing performance and registration data against previous fiscal year benchmarks to ensure program compliance and growth targets.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-700">FY2023 Avg</span>
                            <span className="text-xs font-medium text-gray-500">$12,400/mo</span>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                            <span className="text-xs font-bold text-blue-700">FY2024 Current</span>
                            <span className="text-xs font-black text-blue-900">${(metrics.totalRevenue / (parseInt(timeRange)/30)).toFixed(0).toLocaleString()}/mo</span>
                        </div>
                    </div>
                    <button className="w-full py-2.5 text-xs font-bold text-blue-600 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                        View Detailed Audit Logs
                    </button>
                </div>
            </div>
            
        </div>
    );
};

export default AdminAnalytics;