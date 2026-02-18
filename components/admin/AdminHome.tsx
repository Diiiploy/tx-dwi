
import React, { useState, useMemo } from 'react';
import { AdminView, LiveSession, InstructorType, Student } from '../../types';
import { IconCameraOff, IconCamera, IconHuman, IconCheckCircle, IconClock, IconFileText, IconZap, IconFilter } from '../icons';

interface AdminHomeProps {
    setAdminView: (view: AdminView) => void;
    liveSessions: LiveSession[];
    enterInstructorMode: (session: LiveSession) => void;
    enterAdminMode: (session: LiveSession) => void;
    onMonitorSession: (session: LiveSession) => void;
    students: Student[];
}

interface FeedItem {
    id: string;
    type: 'alert' | 'activity';
    category: 'compliance' | 'login' | 'milestone' | 'paperwork';
    studentName: string;
    message: string;
    timestamp: string;
    cohort: string;
}

type CategoryFilter = 'all' | 'compliance' | 'login' | 'milestone' | 'paperwork';

const AdminHome: React.FC<AdminHomeProps> = ({ setAdminView, liveSessions, enterInstructorMode, enterAdminMode, onMonitorSession, students }) => {
    const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
    
    // Generate a combined feed of alerts and activities
    const feedItems = useMemo(() => {
        let items: FeedItem[] = [];

        students.forEach(student => {
            // 1. Compliance Alerts (Highest Priority)
            if (student.status === 'On Watch') {
                items.push({
                    id: `alert-${student.id}`,
                    type: 'alert',
                    category: 'compliance',
                    studentName: student.name,
                    message: 'Camera is currently turned off',
                    timestamp: new Date().toISOString(), // Simulating live
                    cohort: student.cohort
                });
            }

            // 2. Recent Logins
            if (student.attendance.loginTime !== 'N/A' && student.attendance.loginTime) {
                items.push({
                    id: `login-${student.id}`,
                    type: 'activity',
                    category: 'login',
                    studentName: student.name,
                    message: 'Logged into the classroom',
                    timestamp: student.attendance.loginTime,
                    cohort: student.cohort
                });
            }

            // 3. Quiz Completions
            student.quizResults.forEach((quiz, idx) => {
                items.push({
                    id: `quiz-${student.id}-${idx}`,
                    type: 'activity',
                    category: 'milestone',
                    studentName: student.name,
                    message: `Completed "${quiz.title}" with ${quiz.score}`,
                    timestamp: new Date(Date.now() - (idx + 1) * 3600000).toISOString(), // Mock time
                    cohort: student.cohort
                });
            });

            // 4. Paperwork Submissions
            if (student.paperworkData?.dob) {
                items.push({
                    id: `paperwork-${student.id}`,
                    type: 'activity',
                    category: 'paperwork',
                    studentName: student.name,
                    message: 'Submitted pre-course paperwork',
                    timestamp: student.registrationDate,
                    cohort: student.cohort
                });
            }
        });

        // Filter by selected category
        if (selectedCategory !== 'all') {
            items = items.filter(item => item.category === selectedCategory);
        }

        // Sort by timestamp descending
        return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 15);
    }, [students, selectedCategory]);

    const getTimeAgo = (timestamp: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(timestamp).getTime()) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return new Date(timestamp).toLocaleDateString();
    };

    const getFeedIcon = (category: FeedItem['category']) => {
        switch (category) {
            case 'compliance': return <IconCameraOff className="text-red-600 w-4 h-4" />;
            case 'login': return <IconClock className="text-blue-600 w-4 h-4" />;
            case 'milestone': return <IconCheckCircle className="text-green-600 w-4 h-4" />;
            case 'paperwork': return <IconFileText className="text-orange-600 w-4 h-4" />;
        }
    };

    const getFeedBg = (category: FeedItem['category']) => {
        switch (category) {
            case 'compliance': return 'bg-red-50 border-red-100';
            case 'login': return 'bg-blue-50 border-blue-100';
            case 'milestone': return 'bg-green-50 border-green-100';
            case 'paperwork': return 'bg-orange-50 border-orange-100';
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Live Classes</h4>
                    <div className="flex items-end gap-2 mt-1">
                        <p className="text-4xl font-black text-blue-600">{liveSessions.length}</p>
                        <span className="text-xs font-medium text-gray-500 pb-1.5">active now</span>
                    </div>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Enrollment</h4>
                    <div className="flex items-end gap-2 mt-1">
                        <p className="text-4xl font-black text-gray-900">{students.length}</p>
                        <span className="text-xs font-medium text-gray-500 pb-1.5">students total</span>
                    </div>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Alerts</h4>
                    <div className="flex items-end gap-2 mt-1">
                        <p className="text-4xl font-black text-red-600">{students.filter(s => s.status === 'On Watch').length}</p>
                        <span className="text-xs font-medium text-red-500 pb-1.5">require attention</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Live Sessions List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center px-2">
                        <h3 className="text-xl font-bold text-gray-900">Active Classroom Hub</h3>
                        <button onClick={() => setAdminView(AdminView.Schedule)} className="text-sm font-semibold text-blue-600 hover:underline">View All Schedule</button>
                    </div>
                    <div className="grid gap-4">
                        {liveSessions.length > 0 ? liveSessions.map(session => (
                            <div key={session.id} className="group relative flex flex-col sm:flex-row items-center justify-between p-5 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-blue-300 transition-all overflow-hidden">
                                {/* Fixed Indicator Bar (Non-blinking) */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
                                
                                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                                    <div className={`p-3 rounded-xl ${session.instructorType === InstructorType.AI ? 'bg-blue-100' : 'bg-purple-100'}`}>
                                        {session.instructorType === InstructorType.AI ? (
                                            <IconCamera className="w-6 h-6 text-blue-600" />
                                        ) : (
                                            <IconHuman className="w-6 h-6 text-purple-600" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <div className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 shadow-sm">
                                                <span className="w-1 h-1 bg-white rounded-full"></span>
                                                LIVE CLASS
                                            </div>
                                            <p className="font-bold text-gray-900 leading-none">{session.title}</p>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1.5">
                                            <span className="font-semibold text-gray-700">{session.studentCount} Students</span>
                                            <span className="mx-2 text-gray-300">|</span>
                                            Started {session.startTime}
                                            {session.instructorName && (
                                                <span className="ml-1 text-gray-400">&bull; {session.instructorName}</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <button
                                        onClick={() => onMonitorSession(session)}
                                        className="flex-1 sm:flex-none px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg text-sm hover:bg-gray-200 transition"
                                    >
                                        Monitor
                                    </button>
                                    <button
                                        onClick={() => enterAdminMode(session)}
                                        className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white font-bold rounded-lg text-sm hover:bg-blue-700 shadow-md shadow-blue-100 transition"
                                    >
                                        Join Session
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="py-12 bg-white rounded-xl border border-gray-200 border-dashed text-center">
                                <p className="text-gray-500">No classes are currently live.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Enhanced Activity & Alerts Stream with Sorting/Filtering */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[600px]">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 rounded-t-xl flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <IconZap className="w-5 h-5 text-orange-500" />
                                <h3 className="font-bold text-gray-900">Activity & Alerts</h3>
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-red-100 rounded-full">
                                <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse"></span>
                                <span className="text-[10px] font-black text-red-700 uppercase tracking-tighter">Live</span>
                            </div>
                        </div>
                        
                        {/* Category Filter Dropdown */}
                        <div className="flex items-center gap-2">
                            <IconFilter className="w-3.5 h-3.5 text-gray-400" />
                            <select 
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value as CategoryFilter)}
                                className="bg-white border border-gray-200 rounded-md px-2 py-1 text-xs font-semibold text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                            >
                                <option value="all">Sort By: All Activity</option>
                                <option value="compliance">Compliance Alerts</option>
                                <option value="login">Student Logins</option>
                                <option value="milestone">Quiz Milestones</option>
                                <option value="paperwork">Paperwork Updates</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="flex-grow overflow-y-auto p-4 space-y-4">
                        {feedItems.length > 0 ? (
                            feedItems.map(item => (
                                <div key={item.id} className={`p-3 rounded-lg border flex gap-3 transition-colors ${getFeedBg(item.category)}`}>
                                    <div className="flex-shrink-0 mt-0.5">
                                        <div className="p-1.5 bg-white rounded-md shadow-sm border border-gray-100">
                                            {getFeedIcon(item.category)}
                                        </div>
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <div className="flex justify-between items-start gap-2">
                                            <p className="text-xs font-black text-gray-900 truncate">{item.studentName}</p>
                                            <span className="text-[10px] font-medium text-gray-400 whitespace-nowrap">{getTimeAgo(item.timestamp)}</span>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{item.message}</p>
                                        <div className="mt-1.5 flex items-center gap-1.5">
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest bg-white/50 px-1.5 py-0.5 rounded border border-gray-100">
                                                Cohort {item.cohort}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center p-6">
                                <IconClock className="w-12 h-12 text-gray-200 mb-2" />
                                <p className="text-sm text-gray-400">No {selectedCategory !== 'all' ? selectedCategory : ''} activity found...</p>
                                {selectedCategory !== 'all' && (
                                    <button 
                                        onClick={() => setSelectedCategory('all')}
                                        className="mt-2 text-xs font-bold text-blue-600 hover:underline"
                                    >
                                        Clear Filter
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="p-3 bg-gray-50 border-t border-gray-100 rounded-b-xl text-center">
                        <button 
                            onClick={() => setAdminView(AdminView.Analytics)}
                            className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline"
                        >
                            View Full History Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHome;