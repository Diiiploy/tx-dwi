import React, { useState } from 'react';
import { Course, Student, TimelineItem } from '../../types';
import { IconClose, IconCalendar, IconClock, IconStudents, IconCurriculum, IconHuman, IconCamera, IconFile, IconFilm, IconExport, IconFileText, IconForm, IconCheckCircle, IconRobot, IconZap, IconRefreshCw } from '../icons';
import { generateClassSummary } from '../../services/geminiService';

interface ScheduledClass {
  id: string;
  courseId: string;
  moduleId: string;
  date: string;
  time: string;
}

interface ClassDetailsModalProps {
    scheduledClass: ScheduledClass;
    course: Course;
    enrolledStudents: Student[];
    onClose: () => void;
    onViewStudent?: (student: Student) => void;
}

const blockTypes: { [key in TimelineItem['type']]: { icon: React.ReactNode; label: string; color: string } } = {
    'ai-script': { icon: <IconCamera className="w-4 h-4" />, label: "AI Avatar Script", color: "text-blue-600" },
    'content': { icon: <IconCurriculum className="w-4 h-4" />, label: "Content", color: "text-purple-600" },
    'quiz': { icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>, label: "Quiz", color: "text-green-600" },
    'poll': { icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 15h4v-4H3v4z"></path><path d="M7 15h4v-4H7v4z"></path><path d="M11 15h4v-4h-4v4z"></path><path d="M15 15h4v-4h-4v4z"></path></svg>, label: "Poll", color: "text-yellow-600" },
    'breakout': { icon: <IconStudents className="w-4 h-4" />, label: "Breakout Rooms", color: "text-indigo-600" },
    'break': { icon: <IconClock className="w-4 h-4" />, label: "Automated Break", color: "text-red-600" },
    'google-form': { icon: <IconForm className="w-4 h-4" />, label: "Google Form", color: "text-orange-600" },
};

const LessonPlanItem: React.FC<{ item: TimelineItem }> = ({ item }) => {
    const meta = blockTypes[item.type];
    const hasMedia = item.type === 'content' && (item.fileName || item.videoFileName);
    const hasForm = item.type === 'google-form' && item.googleFormUrl;

    return (
        <div className="flex items-start gap-3">
            <div className={`flex-shrink-0 mt-1 ${meta.color}`}>{meta.icon}</div>
            <div className="flex-grow">
                <p className="font-bold text-sm text-gray-800 leading-tight">{item.title}</p>
                 {hasMedia ? (
                    <div className="mt-1 flex items-center gap-2 p-1.5 bg-gray-100 border border-gray-200 rounded-md">
                        {item.fileName && <IconFile className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />}
                        {item.videoFileName && <IconFilm className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />}
                        <span className="text-xs text-gray-600 font-medium truncate">{item.fileName || item.videoFileName}</span>
                    </div>
                ) : hasForm ? (
                    <div className="mt-1 flex items-center gap-2 p-1.5 bg-orange-50 border border-orange-200 rounded-md">
                        <IconForm className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
                        <span className="text-xs text-orange-800 font-medium truncate">{item.googleFormUrl}</span>
                    </div>
                ) : <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
            </div>
             {item.duration && (
                <p className="text-xs text-gray-400 font-bold flex-shrink-0 ml-4">{item.duration} min</p>
            )}
        </div>
    );
};

const ClassDetailsModal: React.FC<ClassDetailsModalProps> = ({ scheduledClass, course, enrolledStudents, onClose, onViewStudent }) => {
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [aiSummary, setAiSummary] = useState<string | null>(null);

    const module = course.modules.find(m => m.id === scheduledClass.moduleId);
    const isFinal = module?.id === course.modules[course.modules.length - 1].id;

    // Check if class is past to allow summary generation
    const isPastClass = new Date(`${scheduledClass.date}T${scheduledClass.time}`).getTime() < new Date().getTime();

    const handleGenerateSummary = async () => {
        setIsGeneratingSummary(true);
        try {
            const summary = await generateClassSummary(course.name, enrolledStudents.length, course.instructorName || 'AI Instructor');
            setAiSummary(summary);
        } catch (error) {
            console.error("Summary error:", error);
        } finally {
            setIsGeneratingSummary(false);
        }
    };

    const formatDate = (dateString: string) => {
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getStatusBadgeStyle = (status: Student['status']) => {
        switch (status) {
            case 'In Progress': return 'bg-green-100 text-green-800';
            case 'On Watch': return 'bg-yellow-100 text-yellow-800';
            case 'Completed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-red-100 text-red-800';
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

    const handleDownloadAttendance = () => {
        if (enrolledStudents.length === 0) {
            alert("No students are enrolled in this class to generate an attendance sheet.");
            return;
        }
        const headers = ['Student ID', 'Name', 'Status', 'Company', 'Login Time', 'Attendance %'];
        const csvRows = [headers.join(','), ...enrolledStudents.map(student => [student.id, `"${student.name}"`, student.status, student.company, `"${student.attendance.loginTime}"`, student.attendance.percentage].join(','))];
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.setAttribute('href', URL.createObjectURL(blob));
        link.setAttribute('download', `attendance_${course.name.replace(/ /g, '_')}_${scheduledClass.date}.csv`);
        link.click();
    };

    const handleDownloadCertificateReport = () => {
        const completedStudents = enrolledStudents.filter(s => s.status === 'Completed' && s.certificateInfo);
        if (completedStudents.length === 0) {
            alert("No students in this class have completed the course and have certificate data available.");
            return;
        }
        const headers = ["Company Name", "Last Name", "First & Middle Name", "Mailing Address", "City, State and Zipcode", "Drivers License #", "Cause or Case Number", "Date of Birth", "County of Conviction", "DWI Instructor's Name", "PO Name", "PO Email", "Lawyer Name", "Lawyer Email", "Law Firm Name"];
        const csvRows = [headers.join(','), ...completedStudents.map(student => {
            const cert = student.certificateInfo!;
            return [student.company, cert.lastName, cert.firstName, cert.address, cert.cityStateZip, cert.driversLicense, cert.caseNumber, cert.dob, cert.countyOfConviction, cert.instructorName, cert.probationOfficerName, cert.probationOfficerEmail, cert.lawyerName, cert.lawyerEmail, cert.lawFirmName].join(',');
        })];
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.setAttribute('href', URL.createObjectURL(blob));
        link.setAttribute('download', `certificates_${course.name.replace(/ /g, '_')}_${scheduledClass.date}.csv`);
        link.click();
    };
    
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl m-4 border border-gray-200 flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-white">
                    <h2 className="text-xl font-bold text-gray-800">
                        Class Details & Analytics
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close modal">
                        <IconClose className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto space-y-8">
                    <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start gap-4">
                        {isFinal && (
                            <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-black px-4 py-1 rotate-45 translate-x-3 translate-y-2 shadow-sm">
                                FINAL SESSION
                            </div>
                        )}
                        <div className="flex-grow">
                            <h3 className="font-bold text-xl text-blue-900 flex items-center gap-3">
                                <IconCurriculum className="w-6 h-6 text-blue-700"/> {course.name}: {module?.name || 'Session'}
                            </h3>
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
                                <div className="flex items-center gap-2.5 text-blue-800">
                                    <IconCalendar className="w-4 h-4 text-blue-600"/> 
                                    <span><strong>Date:</strong> {formatDate(scheduledClass.date)}</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-blue-800">
                                    <IconClock className="w-4 h-4 text-blue-600"/> 
                                    <span><strong>Time:</strong> {scheduledClass.time}</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-blue-800">
                                    <IconHuman className="w-4 h-4 text-blue-600"/> 
                                    <span><strong>Instructor:</strong> {course.instructorName || 'AI Instructor'}</span>
                                </div>
                            </div>
                        </div>
                        {isPastClass && (
                            <button
                                onClick={handleGenerateSummary}
                                disabled={isGeneratingSummary}
                                className={`flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 transition flex-shrink-0 transform active:scale-95 disabled:bg-indigo-300`}
                            >
                                {isGeneratingSummary ? (
                                    <IconRefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <IconRobot className="w-4 h-4" />
                                )}
                                {isGeneratingSummary ? 'Analyzing Session...' : aiSummary ? 'Regenerate AI Report' : 'Generate AI Summary Report'}
                            </button>
                        )}
                    </div>

                    {/* AI Summary Report Section */}
                    {aiSummary && (
                        <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-2xl animate-fade-in">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-lg shadow-indigo-100">
                                    <IconRobot className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-indigo-900 leading-tight">AI Session Intelligence Report</h3>
                                    <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">Grounded in class transcripts and proctor logs</p>
                                </div>
                            </div>
                            <div className="prose prose-sm prose-indigo max-w-none prose-p:text-indigo-800 prose-headings:text-indigo-900 prose-strong:text-indigo-950 bg-white/60 p-6 rounded-xl border border-white/50 shadow-inner overflow-x-auto">
                                <div className="whitespace-pre-wrap font-medium">
                                    {aiSummary}
                                </div>
                            </div>
                            <div className="mt-4 flex justify-end">
                                <button className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition">
                                    <IconExport className="w-3.5 h-3.5" /> Export Intelligence Report (PDF)
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div className="flex flex-col">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">
                                Enrolled Students ({enrolledStudents.length})
                            </h3>
                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Name</th>
                                            <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                            <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Company</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {enrolledStudents.length > 0 ? enrolledStudents.map(student => (
                                            <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-700">
                                                    <button 
                                                        onClick={() => onViewStudent?.(student)} 
                                                        className="text-blue-600 hover:text-blue-800 hover:underline text-left font-bold"
                                                    >
                                                        {student.name}
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                    <span className={`px-2 py-0.5 inline-flex text-[10px] font-bold rounded-full ${getStatusBadgeStyle(student.status)}`}>
                                                        {student.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                    <span className={`px-2 py-0.5 inline-flex text-[10px] font-bold rounded-full ${getCompanyBadgeStyle(student.company)}`}>
                                                        {student.company}
                                                    </span>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={3} className="px-4 py-10 text-sm text-center text-gray-400 italic">No students enrolled.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">
                                Lesson Plan
                            </h3>
                            <div className="space-y-5 bg-white p-5 border border-gray-200 rounded-lg shadow-sm">
                                {module && module.items.length > 0 ? (
                                    module.items.map(item => <LessonPlanItem key={item.id} item={item} />)
                                ) : (
                                    <p className="text-sm text-center text-gray-400 italic py-10">No lesson plan available for this module.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-5 border-t border-gray-100 bg-white flex justify-end gap-3 flex-wrap">
                    <button
                        onClick={handleDownloadCertificateReport}
                        className="px-6 py-2.5 bg-purple-600 text-white text-sm font-bold rounded-lg shadow hover:bg-purple-700 transition flex items-center gap-2"
                    >
                        <IconFileText className="w-4 h-4" />
                        Certificate Report
                    </button>
                    <button
                        onClick={handleDownloadAttendance}
                        className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg shadow hover:bg-blue-700 transition flex items-center gap-2"
                    >
                        <IconExport className="w-4 h-4" />
                        Download Attendance
                    </button>
                    <button onClick={onClose} className="px-6 py-2.5 bg-slate-700 text-white text-sm font-bold rounded-lg shadow hover:bg-slate-800 transition">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClassDetailsModal;