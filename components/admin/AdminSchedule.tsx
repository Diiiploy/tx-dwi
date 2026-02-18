import React, { useState, useMemo } from 'react';
import { Course, Student, InstructorType, ScheduledClass, Instructor } from '../../types';
import ClassDetailsModal from './ClassDetailsModal';
import { IconClose, IconArrowLeft, IconClipboardList, IconCalendar, IconCurriculum, IconCheckCircle, IconClock, IconSearch, IconExport } from '../icons';

interface AdminScheduleProps {
    courses: Course[];
    students: Student[];
    scheduledClasses: ScheduledClass[];
    instructors: Instructor[];
    onViewStudent?: (student: Student) => void;
}

const AdminSchedule: React.FC<AdminScheduleProps> = ({ courses, students, scheduledClasses, instructors, onViewStudent }) => {
    const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'series'>('list');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    
    const [filterCourseId, setFilterCourseId] = useState<string>('all');
    const [filterInstructorType, setFilterInstructorType] = useState<string>('all');
    const [filterInstructorId, setFilterInstructorId] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterDate, setFilterDate] = useState<string>('');
    const [studentSearchQuery, setStudentSearchQuery] = useState<string>('');
    const [selectedClass, setSelectedClass] = useState<ScheduledClass | null>(null);

    const getStatus = (date: string): { text: string; color: string } => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today's date
        const [year, month, day] = date.split('-').map(Number);
        const classDate = new Date(year, month - 1, day);
        classDate.setHours(0, 0, 0, 0);

        if (classDate.getTime() < today.getTime()) {
            return { text: 'Completed', color: 'bg-gray-100 text-gray-800' };
        }
        if (classDate.getTime() === today.getTime()) {
            return { text: 'In Progress', color: 'bg-blue-100 text-blue-800' };
        }
        return { text: 'Upcoming', color: 'bg-green-100 text-green-800' };
    };

    const getEnrolledStudents = (course: Course): Student[] => {
        const cohortMap: { [key: string]: string[] } = {
            'course-dwi-edu': ['A'],
            'course-dwi-int': ['B'],
            'course-aepm': ['D'],
            'course-break-test': ['E']
        };
        const relevantCohorts = cohortMap[course.id] || [];
        return students.filter(s => relevantCohorts.includes(s.cohort) && s.status !== 'Withdrawn');
    };

    const filteredClassesBase = useMemo(() => {
        return scheduledClasses.filter(sc => {
            if (filterCourseId !== 'all' && sc.courseId !== filterCourseId) {
                return false;
            }
            if (filterInstructorType !== 'all' && sc.instructorType !== parseInt(filterInstructorType)) {
                return false;
            }
            if (filterInstructorType === InstructorType.Human.toString() && filterInstructorId !== 'all') {
                if (sc.instructorId !== parseInt(filterInstructorId)) {
                    return false;
                }
            }
            if (filterStatus !== 'all') {
                if (getStatus(sc.date).text !== filterStatus) {
                    return false;
                }
            }
            if (studentSearchQuery.trim()) {
                const course = courses.find(c => c.id === sc.courseId);
                if (!course) return false;
                const enrolled = getEnrolledStudents(course);
                const hasMatchingStudent = enrolled.some(s => 
                    s.name.toLowerCase().includes(studentSearchQuery.toLowerCase())
                );
                if (!hasMatchingStudent) return false;
            }
            return true;
        });
    }, [filterCourseId, filterInstructorType, filterInstructorId, filterStatus, studentSearchQuery, scheduledClasses, courses, students]);

    const listClasses = useMemo(() => {
        return filteredClassesBase
            .filter(sc => {
                if (filterDate && sc.date !== filterDate) {
                    return false;
                }
                return true;
            })
            .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
    }, [filteredClassesBase, filterDate]);

    const groupedByCourse = useMemo(() => {
        const groups: Record<string, ScheduledClass[]> = {};
        filteredClassesBase.forEach(sc => {
            if (!groups[sc.courseId]) groups[sc.courseId] = [];
            groups[sc.courseId].push(sc);
        });
        // Sort each group by date/time
        Object.keys(groups).forEach(courseId => {
            groups[courseId].sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
        });
        return groups;
    }, [filteredClassesBase]);


    const formatDate = (dateString: string) => {
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString(undefined, {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };
    
    const formatTime = (timeString: string) => {
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    const handleExportScheduleCSV = () => {
        const headers = ['Course Name', 'Module Name', 'Date', 'Time', 'Instructor', 'Type', 'Enrolled Count', 'Status'];
        const csvRows = listClasses.map(sc => {
            const course = courses.find(c => c.id === sc.courseId);
            const module = course?.modules.find(m => m.id === sc.moduleId);
            const instructor = instructors.find(i => i.id === sc.instructorId);
            const enrolled = course ? getEnrolledStudents(course).length : 0;
            const status = getStatus(sc.date).text;
            const instructorType = sc.instructorType === InstructorType.AI ? 'AI' : 'Human';
            
            return [
                `"${course?.name || 'Unknown'}"`,
                `"${module?.name || 'Unknown'}"`,
                sc.date,
                sc.time,
                `"${sc.instructorType === InstructorType.AI ? 'AI Assistant' : (instructor?.name || 'Unassigned')}"`,
                instructorType,
                enrolled,
                status
            ].join(',');
        });

        const csvContent = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.setAttribute('href', URL.createObjectURL(blob));
        link.setAttribute('download', `class_schedule_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.click();
    };


    const handleViewDetails = (scheduledClass: ScheduledClass) => {
        setSelectedClass(scheduledClass);
    };
    
    const courseForSelectedClass = selectedClass ? courses.find(c => c.id === selectedClass.courseId) : null;
    const enrolledStudentsForSelectedClass = courseForSelectedClass ? getEnrolledStudents(courseForSelectedClass) : [];

    // Calendar Helper Functions
    const goToPreviousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const goToToday = () => {
        setCurrentMonth(new Date());
    };

    const renderCalendar = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const days = [];
        // Add empty placeholders for days before the 1st
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="h-32 bg-gray-50 border border-gray-100"></div>);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dateClasses = filteredClassesBase.filter(sc => sc.date === dateString)
                .sort((a, b) => a.time.localeCompare(b.time));
            const isToday = new Date().toDateString() === date.toDateString();

            days.push(
                <div key={day} className={`h-32 border border-gray-200 p-2 overflow-y-auto ${isToday ? 'bg-blue-50' : 'bg-white'}`}>
                    <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                        {day}
                    </div>
                    <div className="space-y-1">
                        {dateClasses.map(sc => {
                            const course = courses.find(c => c.id === sc.courseId);
                            const status = getStatus(sc.date);
                            let bgClass = 'bg-gray-100 text-gray-800';
                            if (status.text === 'In Progress') bgClass = 'bg-blue-100 text-blue-800 border-blue-200';
                            else if (status.text === 'Upcoming') bgClass = 'bg-green-100 text-green-800 border-green-200';
                            
                            return (
                                <button
                                    key={sc.id}
                                    onClick={() => handleViewDetails(sc)}
                                    className={`w-full text-left text-xs p-1.5 rounded border truncate transition-colors hover:opacity-80 ${bgClass}`}
                                    title={`${course?.name} - ${formatTime(sc.time)}`}
                                >
                                    <div className="font-bold">{formatTime(sc.time)}</div>
                                    <div className="truncate">{course?.name}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            );
        }

        return (
            <div className="bg-white rounded-lg shadow border border-gray-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-bold text-gray-800">
                            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h2>
                        <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                            <button onClick={goToPreviousMonth} className="p-1 hover:bg-white rounded shadow-sm text-gray-600">
                                <IconArrowLeft className="w-4 h-4" />
                            </button>
                            <button onClick={goToToday} className="px-3 py-1 text-xs font-medium text-gray-700 hover:bg-white rounded shadow-sm">
                                Today
                            </button>
                            <button onClick={goToNextMonth} className="p-1 hover:bg-white rounded shadow-sm text-gray-600">
                                <IconArrowLeft className="w-4 h-4 rotate-180" />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-7 text-center bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 py-2">
                    <div>SUN</div>
                    <div>MON</div>
                    <div>TUE</div>
                    <div>WED</div>
                    <div>THU</div>
                    <div>FRI</div>
                    <div>SAT</div>
                </div>
                <div className="grid grid-cols-7">
                    {days}
                </div>
            </div>
        );
    };

    const renderSeriesView = () => {
        const sortedCourseIds = Object.keys(groupedByCourse).sort((a, b) => {
            const courseA = courses.find(c => c.id === a);
            const courseB = courses.find(c => c.id === b);
            return (courseA?.name || '').localeCompare(courseB?.name || '');
        });

        if (sortedCourseIds.length === 0) {
            return (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200 text-gray-500">
                    No classes found matching the current filters.
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedCourseIds.map(courseId => {
                    const course = courses.find(c => c.id === courseId);
                    const sessions = groupedByCourse[courseId];
                    if (!course) return null;

                    const enrolledCount = getEnrolledStudents(course).length;
                    const completedCount = sessions.filter(s => getStatus(s.date).text === 'Completed').length;
                    const progress = (completedCount / sessions.length) * 100;

                    return (
                        <div key={courseId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                                <div className="flex justify-between items-start gap-2 mb-1">
                                    <h3 className="font-bold text-gray-900 leading-tight">{course.name}</h3>
                                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                                        {sessions.length} Sessions
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <IconClipboardList className="w-3 h-3" /> {enrolledCount} Students Enrolled
                                </p>
                            </div>
                            
                            <div className="p-4 flex-grow space-y-4">
                                <div className="space-y-3 relative">
                                    {/* Timeline connector line */}
                                    <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-100"></div>
                                    
                                    {sessions.map((sc, idx) => {
                                        const module = course.modules.find(m => m.id === sc.moduleId);
                                        const status = getStatus(sc.date);
                                        const isCompleted = status.text === 'Completed';
                                        const isInProgress = status.text === 'In Progress';
                                        const isFinal = sc.moduleId === course.modules[course.modules.length - 1].id;

                                        return (
                                            <div 
                                                key={sc.id} 
                                                className="relative pl-8 cursor-pointer group"
                                                onClick={() => handleViewDetails(sc)}
                                            >
                                                {/* Timeline dot */}
                                                <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 transition-colors ${
                                                    isCompleted ? 'bg-green-500 border-green-500 text-white' :
                                                    isInProgress ? 'bg-blue-500 border-blue-500 text-white' :
                                                    isFinal ? 'bg-white border-orange-500 text-orange-500' :
                                                    'bg-white border-gray-300 text-gray-300'
                                                }`}>
                                                    {isCompleted ? <IconCheckCircle className="w-4 h-4" /> : <span className="text-[10px] font-bold">{idx + 1}</span>}
                                                </div>
                                                
                                                <div>
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex items-center gap-2">
                                                            <p className={`text-sm font-semibold leading-none group-hover:text-blue-600 transition-colors ${isCompleted ? 'text-gray-500' : 'text-gray-800'}`}>
                                                                {module?.name || `Session ${idx + 1}`}
                                                            </p>
                                                            {isFinal && (
                                                                <span className="bg-orange-100 text-orange-700 text-[9px] font-black px-1.5 py-0.5 rounded border border-orange-200">FINAL</span>
                                                            )}
                                                        </div>
                                                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                                                            status.text === 'Completed' ? 'bg-gray-100 text-gray-600' :
                                                            status.text === 'In Progress' ? 'bg-blue-100 text-blue-600' :
                                                            'bg-green-100 text-green-600'
                                                        }`}>
                                                            {status.text}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                                        <IconCalendar className="w-3 h-3" /> {formatDate(sc.date)}
                                                        <span className="text-gray-300">|</span>
                                                        <IconClock className="w-3 h-3" /> {formatTime(sc.time)}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-xs font-medium text-gray-500">Program Completion</span>
                                    <span className="text-xs font-bold text-gray-900">{Math.round(progress)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div 
                                        className="bg-green-500 h-1.5 rounded-full transition-all duration-500" 
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                 <h1 className="text-3xl font-bold text-gray-900">Class Schedule</h1>
                 <div className="flex items-center gap-3">
                    <button 
                        onClick={handleExportScheduleCSV} 
                        className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition flex items-center gap-2"
                    >
                        <IconExport className="w-4 h-4" />
                        Export Schedule
                    </button>
                    <div className="flex bg-gray-200 p-1 rounded-lg">
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            <IconClipboardList className="w-4 h-4" /> List
                        </button>
                        <button 
                            onClick={() => setViewMode('series')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'series' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            <IconCurriculum className="w-4 h-4" /> Series
                        </button>
                        <button 
                            onClick={() => setViewMode('calendar')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'calendar' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            <IconCalendar className="w-4 h-4" /> Calendar
                        </button>
                    </div>
                 </div>
            </div>
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
                    <div className="lg:col-span-1">
                        <label htmlFor="student-search" className="block text-sm font-medium text-gray-700">Search student</label>
                        <div className="relative mt-1">
                            <input
                                type="text"
                                id="student-search"
                                placeholder="Student Name..."
                                value={studentSearchQuery}
                                onChange={(e) => setStudentSearchQuery(e.target.value)}
                                className="block w-full pl-8 pr-3 py-2 border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                            />
                            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                                <IconSearch className="h-3.5 w-3.5 text-gray-400" />
                            </div>
                            {studentSearchQuery && (
                                <button
                                    onClick={() => setStudentSearchQuery('')}
                                    className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    <IconClose className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="course-filter" className="block text-sm font-medium text-gray-700">Filter by course</label>
                        <select
                            id="course-filter"
                            value={filterCourseId}
                            onChange={(e) => setFilterCourseId(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-8 py-2 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                        >
                            <option value="all">All Courses</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>{course.name}</option>
                            ))}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="instructor-type-filter" className="block text-sm font-medium text-gray-700">Instructor Type</label>
                        <select
                            id="instructor-type-filter"
                            value={filterInstructorType}
                            onChange={(e) => {
                                setFilterInstructorType(e.target.value);
                                setFilterInstructorId('all');
                            }}
                            className="mt-1 block w-full pl-3 pr-8 py-2 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                        >
                            <option value="all">All Types</option>
                            <option value={InstructorType.AI.toString()}>AI Instructor</option>
                            <option value={InstructorType.Human.toString()}>Human Instructor</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="instructor-filter" className="block text-sm font-medium text-gray-700">Instructor</label>
                        <select
                            id="instructor-filter"
                            value={filterInstructorId}
                            onChange={(e) => setFilterInstructorId(e.target.value)}
                            disabled={filterInstructorType !== InstructorType.Human.toString()}
                            className="mt-1 block w-full pl-3 pr-8 py-2 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm disabled:bg-gray-200 disabled:cursor-not-allowed"
                        >
                            <option value="all">All Instructors</option>
                            {instructors.map(instructor => (
                                <option key={instructor.id} value={instructor.id}>{instructor.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                            id="status-filter"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-8 py-2 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                        >
                            <option value="all">All Statuses</option>
                            <option value="Upcoming">Upcoming</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700">Filter by date</label>
                        <div className="relative mt-1">
                            <input
                                type="date"
                                id="date-filter"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                disabled={viewMode === 'calendar'}
                                className="block w-full pl-3 pr-8 py-2 border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm disabled:bg-gray-100 disabled:text-gray-400"
                            />
                            {filterDate && viewMode !== 'calendar' && (
                                <button
                                    onClick={() => setFilterDate('')}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    aria-label="Clear date filter"
                                >
                                    <IconClose className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {viewMode === 'list' ? (
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructor</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrolled</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {listClasses.map(scheduledClass => {
                                const course = courses.find(c => c.id === scheduledClass.courseId);
                                if (!course) return null;

                                const enrolledStudents = getEnrolledStudents(course);
                                const status = getStatus(scheduledClass.date);
                                const instructor = instructors.find(i => i.id === scheduledClass.instructorId);

                                return (
                                    <tr key={scheduledClass.id} onClick={() => handleViewDetails(scheduledClass)} className="cursor-pointer hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{course.name}</div>
                                            <div className="text-sm text-gray-500">{course.modules.find(m => m.id === scheduledClass.moduleId)?.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{formatDate(scheduledClass.date)}</div>
                                            <div className="text-sm text-gray-500">{formatTime(scheduledClass.time)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div>
                                                {scheduledClass.instructorType === InstructorType.Human 
                                                    ? instructor?.name || 'Unassigned'
                                                    : 'AI Instructor'
                                                }
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{enrolledStudents.length} Students</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                                                {status.text}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {listClasses.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No classes found for the selected filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : viewMode === 'calendar' ? (
                renderCalendar()
            ) : (
                renderSeriesView()
            )}

            {selectedClass && courseForSelectedClass && (
                 <ClassDetailsModal
                    scheduledClass={selectedClass}
                    course={courseForSelectedClass}
                    enrolledStudents={enrolledStudentsForSelectedClass}
                    onClose={() => setSelectedClass(null)}
                    onViewStudent={onViewStudent}
                />
            )}
        </div>
    );
};

export default AdminSchedule;