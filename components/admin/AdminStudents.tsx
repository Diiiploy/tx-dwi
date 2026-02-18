import React, { useState, useMemo } from 'react';
import { Student, Course, ScheduledClass } from '../../types';
// FIX: Added missing IconActivity and IconStudents to solve "Cannot find name" errors.
import { IconExport, IconPauseCircle, IconClipboardList, IconMail, IconCheckCircle, IconRefreshCw, IconTrash, IconUserX, IconPlay, IconEye, IconClose, IconCalendar, IconClock, IconCurriculum, IconActivity, IconStudents } from '../icons';
import AddStudentModal from './AddStudentModal';

interface AdminStudentsProps {
    onViewStudent: (student: Student) => void;
    courses: Course[];
    students: Student[];
    onAddStudent: (name: string, courseId: string, referralSource: Student['referralSource'], company: Student['company']) => void;
    onToggleInactiveStatus: (studentId: number) => void;
    onUpdateStudent: (studentId: number, data: { name?: string; email?: string; phoneNumber?: string }) => void;
    scheduledClasses: ScheduledClass[];
}

const StudentPreviewModal: React.FC<{ 
    student: Student; 
    courses: Course[]; 
    scheduledClasses: ScheduledClass[]; 
    onClose: () => void;
    onViewFullProfile: (student: Student) => void;
}> = ({ student, courses, scheduledClasses, onClose, onViewFullProfile }) => {
    
    const studentCourse = useMemo(() => {
        const cohortMap: Record<string, string> = {
            'A': 'course-dwi-edu',
            'B': 'course-dwi-int',
            'C': 'course-breakout-test',
            'D': 'course-aepm',
            'E': 'course-break-test'
        };
        const courseId = cohortMap[student.cohort];
        return courses.find(c => c.id === courseId);
    }, [student.cohort, courses]);

    const upcomingClasses = useMemo(() => {
        if (!studentCourse) return [];
        return scheduledClasses
            .filter(sc => sc.courseId === studentCourse.id)
            .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
            .filter(sc => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const classDate = new Date(sc.date);
                classDate.setHours(0, 0, 0, 0);
                return classDate >= today;
            });
    }, [studentCourse, scheduledClasses]);

    const formatDate = (dateString: string) => {
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (timeString: string) => {
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4" role="dialog" aria-modal="true">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 animate-fade-in">
                {/* Header */}
                <div className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white relative">
                    <button 
                        onClick={onClose} 
                        className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition"
                    >
                        <IconClose className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
                            {student.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold">{student.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border border-white/30 ${
                                    student.status === 'In Progress' ? 'bg-green-500' :
                                    student.status === 'On Watch' ? 'bg-yellow-500' :
                                    student.status === 'Completed' ? 'bg-blue-400' : 'bg-red-500'
                                }`}>
                                    {student.status}
                                </span>
                                <span className="text-xs opacity-80">Cohort {student.cohort} &bull; {student.company}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    <div>
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <IconCalendar className="w-3.5 h-3.5" />
                            Upcoming Course Schedule
                        </h4>
                        <div className="space-y-2">
                            {studentCourse ? (
                                upcomingClasses.length > 0 ? (
                                    upcomingClasses.slice(0, 3).map((sc, idx) => (
                                        <div key={sc.id} className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex justify-between items-center group hover:border-blue-200 transition-all">
                                            <div>
                                                <p className="text-xs font-bold text-gray-800">
                                                    {studentCourse.modules.find(m => m.id === sc.moduleId)?.name || `Session ${idx+1}`}
                                                </p>
                                                <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                                                    <IconClock className="w-3 h-3" /> {formatDate(sc.date)} at {formatTime(sc.time)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600">
                                                {idx === 0 && <span className="px-1.5 py-0.5 bg-blue-100 rounded-md">NEXT</span>}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <IconCheckCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                        <p className="text-xs text-gray-500 font-medium">All scheduled sessions are complete.</p>
                                    </div>
                                )
                            ) : (
                                <p className="text-xs text-red-500 font-medium">Course assignment not found for this cohort.</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <IconActivity className="w-3.5 h-3.5" />
                            Student Summary
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                                <p className="text-[9px] font-bold text-blue-400 uppercase">Attendance</p>
                                <p className="text-lg font-black text-blue-700">{student.attendance.percentage}</p>
                            </div>
                            <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                                <p className="text-[9px] font-bold text-purple-400 uppercase">Class Code</p>
                                <p className="text-sm font-black text-purple-700 font-mono tracking-tighter mt-0.5">{student.uniqueClassCode}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                    <button 
                        onClick={onClose}
                        className="flex-1 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        Close Preview
                    </button>
                    <button 
                        onClick={() => {
                            onViewFullProfile(student);
                            onClose();
                        }}
                        className="flex-1 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-100 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                    >
                        <IconStudents className="w-4 h-4" />
                        Full Profile
                    </button>
                </div>
            </div>
        </div>
    );
};

const AdminStudents: React.FC<AdminStudentsProps> = ({ onViewStudent, courses, students, onAddStudent, onToggleInactiveStatus, onUpdateStudent, scheduledClasses }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
    const [sentCertificates, setSentCertificates] = useState<Set<number>>(new Set());
    const [sendingCertId, setSendingCertId] = useState<number | null>(null);
    const [selectedStudentIds, setSelectedStudentIds] = useState<Set<number>>(new Set());
    const [previewStudent, setPreviewStudent] = useState<Student | null>(null);

    // Filter state
    const [filterCompany, setFilterCompany] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterCourse, setFilterCourse] = useState<string>('all');

    // Get unique values for filters
    const uniqueStatuses = useMemo(() => [...new Set(students.map(s => s.status))], [students]);
    const companyOptions: Student['company'][] = ['West', 'North', 'South', 'Southeast'];

    const courseIdToCohortMap = useMemo(() => courses.reduce((acc, course, index) => {
        const cohortLetter = String.fromCharCode('A'.charCodeAt(0) + index);
        acc[course.id] = cohortLetter;
        return acc;
    }, {} as Record<string, string>), [courses]);

    const filteredStudents = useMemo(() => {
        return students
            .filter(student => {
                const query = searchQuery.toLowerCase();
                return (
                    student.name.toLowerCase().includes(query) ||
                    (student.email && student.email.toLowerCase().includes(query)) ||
                    (student.phoneNumber && student.phoneNumber.includes(query))
                );
            })
            .filter(student => filterCompany === 'all' || student.company === filterCompany)
            .filter(student => filterStatus === 'all' || student.status === filterStatus)
            .filter(student => {
                if (filterCourse === 'all') return true;
                const expectedCohort = courseIdToCohortMap[filterCourse];
                return student.cohort === expectedCohort;
            });
    }, [students, searchQuery, filterCompany, filterStatus, filterCourse, courseIdToCohortMap]);

    // Bulk Action Logic
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const allIds = new Set(filteredStudents.map(s => s.id));
            setSelectedStudentIds(allIds);
        } else {
            setSelectedStudentIds(new Set());
        }
    };

    const handleSelectStudent = (id: number) => {
        const newSelected = new Set(selectedStudentIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedStudentIds(newSelected);
    };

    const handleBulkMarkInactive = () => {
        if (!window.confirm(`Are you sure you want to mark ${selectedStudentIds.size} students as Inactive?`)) return;
        selectedStudentIds.forEach(id => {
            const student = students.find(s => s.id === id);
            if (student && student.status !== 'Inactive') {
                onToggleInactiveStatus(id);
            }
        });
        setSelectedStudentIds(new Set());
    };

    const handleBulkReactivate = () => {
        if (!window.confirm(`Are you sure you want to reactivate ${selectedStudentIds.size} students?`)) return;
        selectedStudentIds.forEach(id => {
            const student = students.find(s => s.id === id);
            if (student && student.status === 'Inactive') {
                onToggleInactiveStatus(id);
            }
        });
        setSelectedStudentIds(new Set());
    };

    const handleBulkResendCode = () => {
        if (!window.confirm(`Resend unique class codes to ${selectedStudentIds.size} students?`)) return;
        alert(`Successfully queued emails/SMS with class codes for ${selectedStudentIds.size} students.`);
        setSelectedStudentIds(new Set());
    };

    const handleExportCSV = () => {
        const headers = ['Company', 'Cohort', 'Name', 'Enrollment Date', 'Unique Class Code', 'Attendance', 'Status', 'Student ID'];
        const studentsToExport = selectedStudentIds.size > 0 
            ? students.filter(s => selectedStudentIds.has(s.id))
            : filteredStudents;
        const csvRows = studentsToExport.map(student => [student.company, student.cohort, `"${student.name}"`, student.registrationDate, student.uniqueClassCode, student.attendance.percentage, student.status, student.id].join(','));
        const csvContent = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.setAttribute('href', URL.createObjectURL(blob));
        link.setAttribute('download', 'student_data.csv');
        link.click();
    };

    const handleExportAuditReport = () => {
        const headers = ['Company Name', 'Student Name', 'Phone Number', 'Email Address', 'Unique Code', 'Photo ID Link', 'Next Course Date/Time', 'Amount Paid', 'Expedited Services'];
        const studentsToExport = selectedStudentIds.size > 0 ? students.filter(s => selectedStudentIds.has(s.id)) : filteredStudents;
        const csvRows = studentsToExport.map(student => {
            const studentCourse = courses.find(c => c.name[0] === student.cohort);
            const nextClass = scheduledClasses.filter(sc => sc.courseId === studentCourse?.id && new Date(sc.date) >= new Date()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
            const nextCourseDateTime = nextClass ? `${new Date(nextClass.date).toLocaleDateString()} ${nextClass.time}` : 'N/A';
            const totalPaid = student.paymentHistory.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);
            const expeditedServices = student.paymentHistory.some(p => p.expedited) ? 'Yes' : 'No';
            return [student.company, `"${student.name}"`, student.phoneNumber || '', student.email || '', student.uniqueClassCode, student.photoIdUrl || '', nextCourseDateTime, totalPaid.toFixed(2), expeditedServices].join(',');
        });
        const csvContent = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.setAttribute('href', URL.createObjectURL(blob));
        link.setAttribute('download', 'audit_report.csv');
        link.click();
    };

    const handleSendCertificate = (student: Student) => {
        if (sentCertificates.has(student.id) || sendingCertId === student.id) return;
        const recipients = [student.certificateInfo?.probationOfficerEmail, student.certificateInfo?.lawyerEmail].filter(Boolean);
        if (recipients.length === 0) { alert(`No PO or Lawyer email found for ${student.name}.`); return; }
        if(window.confirm(`Send certificate for ${student.name} to:\n\n${recipients.join('\n')}`)) {
             setSendingCertId(student.id);
             setTimeout(() => {
                 setSentCertificates(prev => new Set(prev).add(student.id));
                 setSendingCertId(null);
             }, 1500);
        }
    };
    
    const getCompanyBadgeStyle = (company: Student['company']) => {
        switch (company) {
            case 'North': return 'bg-blue-100 text-blue-800';
            case 'South': return 'bg-green-100 text-green-800';
            case 'West': return 'bg-purple-100 text-purple-800';
            case 'Southeast': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    const getCourseAbbreviation = (courseName: string): string => {
        if (courseName.includes('DWI Education')) return 'DWI-EDU';
        if (courseName.includes('DWI Intervention')) return 'DWI-INT';
        if (courseName === 'AEPM') return 'AEPM';
        const words = courseName.split(' ');
        if (words.length > 1) return words.map(word => word[0]).join('').toUpperCase();
        return courseName.toUpperCase();
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <div/>
                <div className="flex gap-2">
                    <button onClick={handleExportAuditReport} className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition flex-shrink-0 flex items-center gap-2"><IconClipboardList className="w-4 h-4" /> Audit Report</button>
                    <button onClick={handleExportCSV} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition flex-shrink-0 flex items-center gap-2"><IconExport className="w-4 h-4" /> Export CSV</button>
                    <button onClick={() => setIsAddStudentModalOpen(true)} className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition flex-shrink-0">Add Student</button>
                </div>
            </div>
            
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div className="lg:col-span-1">
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search</label>
                        <input type="text" id="search" placeholder="Name, Email, or Phone..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="mt-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
                    </div>
                    <div>
                        <label htmlFor="filter-company" className="block text-sm font-medium text-gray-700">Company</label>
                        <select id="filter-company" value={filterCompany} onChange={e => setFilterCompany(e.target.value)} className="mt-1 block w-full pl-3 pr-8 py-2 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm">
                            <option value="all">All Companies</option>
                            {companyOptions.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="filter-status" className="block text-sm font-medium text-gray-700">Status</label>
                        <select id="filter-status" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="mt-1 block w-full pl-3 pr-8 py-2 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm">
                            <option value="all">All Statuses</option>
                            {uniqueStatuses.sort().map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="filter-course" className="block text-sm font-medium text-gray-700">Course</label>
                        <select id="filter-course" value={filterCourse} onChange={e => setFilterCourse(e.target.value)} className="mt-1 block w-full pl-3 pr-8 py-2 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm">
                            <option value="all">All Courses</option>
                            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {selectedStudentIds.size > 0 && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between animate-fade-in">
                    <span className="font-semibold text-blue-800">{selectedStudentIds.size} Selected</span>
                    <div className="flex gap-2">
                        <button onClick={handleBulkResendCode} className="px-3 py-1.5 bg-white text-blue-700 border border-blue-300 rounded-md text-sm font-medium hover:bg-blue-50 transition flex items-center gap-1"><IconMail className="w-4 h-4" /> Resend Codes</button>
                        <button onClick={handleBulkReactivate} className="px-3 py-1.5 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition flex items-center gap-1"><IconPlay className="w-4 h-4" /> Reactivate</button>
                        <button onClick={handleBulkMarkInactive} className="px-3 py-1.5 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition flex items-center gap-1"><IconUserX className="w-4 h-4" /> Mark Inactive</button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left">
                                <input type="checkbox" checked={filteredStudents.length > 0 && selectedStudentIds.size === filteredStudents.length} onChange={handleSelectAll} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cohort</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrollment Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unique Class Code</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map(student => {
                                const cohortIndex = student.cohort.charCodeAt(0) - 'A'.charCodeAt(0);
                                const course = courses[cohortIndex];
                                const courseAbbreviation = course ? getCourseAbbreviation(course.name) : 'UNK';
                                const registrationDateTime = new Date(student.registrationDate).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

                                return (
                                <tr key={student.id} className={`hover:bg-gray-50 ${selectedStudentIds.has(student.id) ? 'bg-blue-50' : ''}`}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input type="checkbox" checked={selectedStudentIds.has(student.id)} onChange={() => handleSelectStudent(student.id)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCompanyBadgeStyle(student.company)}`}>{student.company}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900" title={course?.name}>{courseAbbreviation} (Cohort {student.cohort})</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button onClick={() => onViewStudent(student)} className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline">{student.name}</button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{registrationDateTime}</td>
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900 font-mono">{student.uniqueClassCode}</div></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.attendance.percentage}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            student.status === 'In Progress' || student.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                            student.status === 'On Watch' ? 'bg-yellow-100 text-yellow-800' :
                                            student.status === 'Reschedule Required' ? 'bg-purple-100 text-purple-800' :
                                            student.status === 'Inactive' ? 'bg-gray-100 text-gray-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>{student.status}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                onClick={() => setPreviewStudent(student)}
                                                className="p-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                                title="Quick Preview"
                                            >
                                                <IconEye className="w-5 h-5" />
                                            </button>
                                            {student.status === 'Completed' && (
                                                <button onClick={() => handleSendCertificate(student)} className={`p-1.5 rounded-lg transition ${sentCertificates.has(student.id) ? 'text-green-600 bg-green-100' : sendingCertId === student.id ? 'text-gray-400 bg-gray-100' : 'text-blue-600 bg-blue-50 hover:bg-blue-100'}`} title="Send Certificate" disabled={sentCertificates.has(student.id) || sendingCertId === student.id}>
                                                    {sentCertificates.has(student.id) ? <IconCheckCircle className="w-5 h-5" /> : sendingCertId === student.id ? <IconRefreshCw className="w-5 h-5 animate-spin" /> : <IconMail className="w-5 h-5" />}
                                                </button>
                                            )}
                                            {(student.status === 'In Progress' || student.status === 'On Watch' || student.status === 'Inactive') && (
                                                <button onClick={() => onToggleInactiveStatus(student.id)} className={`p-1.5 rounded-lg transition ${student.status === 'Inactive' ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-gray-500 bg-gray-50 hover:text-orange-600 hover:bg-orange-50'}`} title={student.status === 'Inactive' ? 'Reactivate Student' : 'Make Inactive'}>
                                                    <IconPauseCircle className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                                );
                            })
                        ) : (
                            <tr><td colSpan={9} className="px-6 py-8 text-center text-gray-500">No students found for the selected filters.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isAddStudentModalOpen && <AddStudentModal courses={courses} onClose={() => setIsAddStudentModalOpen(false)} onSave={(data) => { onAddStudent(data.name, data.courseId, data.referralSource, data.company); setIsAddStudentModalOpen(false); }} />}
            
            {previewStudent && (
                <StudentPreviewModal 
                    student={previewStudent} 
                    courses={courses} 
                    scheduledClasses={scheduledClasses}
                    onClose={() => setPreviewStudent(null)} 
                    onViewFullProfile={onViewStudent}
                />
            )}
        </div>
    );
};

export default AdminStudents;