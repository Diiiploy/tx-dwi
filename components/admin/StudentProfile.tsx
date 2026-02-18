import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Student, Question, PaperworkData, Course, NdpScoreInfo, RemovalRecord, TelzioRecording } from '../../types';
import { IconStudents, IconHome, IconActivity, IconChat, IconClipboardList, IconCheckCircle, IconXCircle, IconFile, IconEdit, IconExport, IconCreditCard, IconPauseCircle, IconCalendar, IconRefreshCw, IconCornerUpLeft, IconUpload, IconFileText, IconMail, IconPhone, IconBell, IconClock, IconCamera, IconGavel, IconMic, IconEye, IconRobot, IconVolume2 } from '../icons';
import EditStudentModal from './EditStudentModal';
import { fetchRecordings } from '../../services/telzioService';

interface StudentProfileProps {
    student: Student;
    onBack: () => void;
    onUpdateStudent: (studentId: number, data: { name?: string; email?: string; phoneNumber?: string }) => void;
    onToggleInactiveStatus: (studentId: number) => void;
    onRescheduleStudent: (studentId: number) => void;
    onRefundPayment: (studentId: number, paymentId: string) => void;
    onUploadCertificate: (studentId: number, fileUrl: string) => void;
    courses: Course[];
    onManualExpedite: (studentId: number) => void;
}

type ProfileTab = 'overview' | 'attendance' | 'selfies' | 'chat' | 'breakouts' | 'quizzes' | 'paperwork' | 'billing' | 'certificate' | 'notifications' | 'conduct' | 'call-history';


const StatCard = ({ label, value, colorClass = 'text-gray-900' }: { label: string, value: string, colorClass?: string }) => (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="text-sm font-medium text-gray-500">{label}</h4>
        <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
    </div>
);

const TabButton = ({ label, icon, isActive, onClick }: { label:string, icon: React.ReactNode, isActive: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            isActive
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
        role="tab"
        aria-selected={isActive}
    >
        {icon}
        {label}
    </button>
);

// A placeholder to find question details. In a real app, this would come from the course data.
const findQuestion = (questionId: string): Question | undefined => {
    // This is a simplified mock for demo purposes
    if (questionId === 'q1') return { id: 'q1', text: 'What is the legal Blood Alcohol Concentration (BAC) limit for drivers over 21 in most US states?', options: [{id: 'q1-o2', text: '0.08%'}], correctOptionId: 'q1-o2' };
    if (questionId === 'q2') return { id: 'q2', text: 'Which of the following can sober a person up the fastest?', options: [{id: 'q2-o3', text: 'Time'}], correctOptionId: 'q2-o3' };
    return undefined;
};

const PaperworkItem: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => {
    if (!value) return null;
    return (
        <div className="grid grid-cols-3 gap-4 pt-2">
            <dt className="text-sm font-medium text-gray-600">{label}</dt>
            <dd className="text-sm text-gray-900 col-span-2 capitalize">{value}</dd>
        </div>
    );
};


const StudentProfile: React.FC<StudentProfileProps> = ({ student, onBack, onUpdateStudent, onToggleInactiveStatus, onRescheduleStudent, onRefundPayment, onUploadCertificate, courses, onManualExpedite }) => {
    const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState(student.name);
    const [isEditingContact, setIsEditingContact] = useState(false);
    const certificateFileInputRef = useRef<HTMLInputElement>(null);
    
    // Call History State
    const [recordings, setRecordings] = useState<TelzioRecording[]>([]);
    const [isLoadingRecordings, setIsLoadingRecordings] = useState(false);

    useEffect(() => {
        if (activeTab === 'call-history') {
            loadCallHistory();
        }
    }, [activeTab]);

    const loadCallHistory = async () => {
        setIsLoadingRecordings(true);
        const data = await fetchRecordings();
        setRecordings(data);
        setIsLoadingRecordings(false);
    };

    const normalizePhone = (phone: string) => phone.replace(/\D/g, '').slice(-10);

    const studentCallLogs = useMemo(() => {
        if (!student.phoneNumber) return [];
        const studentNorm = normalizePhone(student.phoneNumber);
        return recordings.filter(rec => 
            normalizePhone(rec.from) === studentNorm || 
            normalizePhone(rec.to) === studentNorm
        ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [recordings, student.phoneNumber]);

    const formatDate = (dateString: string) => {
        if (dateString === 'N/A' || !dateString) return 'N/A';
        // Add a day to the date to correct for potential timezone issues with 'YYYY-MM-DD' strings
        const date = new Date(dateString);
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
             date.setDate(date.getDate() + 1);
        }
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatShortTime = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    
    const handleSaveName = () => {
        if (editedName.trim()) {
            onUpdateStudent(student.id, { name: editedName.trim() });
            setIsEditingName(false);
        }
    };

    const handleCancelEdit = () => {
        setEditedName(student.name);
        setIsEditingName(false);
    };

    const getStatusColor = (status: Student['status']) => {
        switch (status) {
            case 'In Progress':
            case 'Completed':
                return 'text-green-600';
            case 'On Watch': return 'text-yellow-600';
            case 'Withdrawn': return 'text-red-600';
            case 'Inactive': return 'text-gray-600';
            case 'Makeup Required': return 'text-orange-600';
            default: return 'text-gray-900';
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

    const getStatusForSchedule = (date: string): { text: string; color: string } => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today's date
        const [year, month, day] = date.split('-').map(Number);
        const classDate = new Date(year, month - 1, day); // Creates date in local timezone

        if (classDate.getTime() < today.getTime()) {
            return { text: 'Completed', color: 'bg-gray-100 text-gray-800' };
        }
        if (classDate.getTime() === today.getTime()) {
            return { text: 'In Progress', color: 'bg-blue-100 text-blue-800' };
        }
        return { text: 'Upcoming', color: 'bg-green-100 text-green-800' };
    };

    const formatDateForSchedule = (dateString: string) => {
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleCertificateFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // In a real app, you'd upload this file to a server and get back a URL.
            // For this demo, we'll use a local blob URL to simulate the upload.
            const fileUrl = URL.createObjectURL(file);
            onUploadCertificate(student.id, fileUrl);
        }
    };


    const renderContent = () => {
        const CertificateDetail: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => {
            if (!value) return null;
            return (
                <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-600">{label}</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{value}</dd>
                </div>
            );
        };
        
        switch (activeTab) {
            case 'overview':
                const cohortMap: { [key: string]: string } = {
                    'A': 'course-dwi-edu',
                    'B': 'course-dwi-int',
                    'C': 'course-breakout-test',
                    'D': 'course-aepm',
                };
                const courseId = cohortMap[student.cohort];
                const studentCourse = courses.find(c => c.id === courseId);

                const upcomingClasses = studentCourse ? studentCourse.modules.map((module, index) => {
                    const classDate = new Date();
                    // Start from next week's Monday
                    const dayOfWeek = classDate.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
                    const daysToAdd = (dayOfWeek === 0) ? 1 : (8 - dayOfWeek); // if Sun, add 1, if Mon add 7, if Tue add 6, etc.
                    classDate.setDate(classDate.getDate() + daysToAdd + index); // Each module/class is one day after the other starting from next Monday

                    return {
                        id: `gen-${module.id}`,
                        courseId: studentCourse.id,
                        moduleId: module.id,
                        date: classDate.toISOString().split('T')[0], // "YYYY-MM-DD"
                        time: '09:00 AM'
                    };
                }) : [];
                
                const { ndpScore } = student;
                const hasNdpScore = student.cohort === 'A' && ndpScore;
                
                return (
                    <div>
                        {student.status === 'Reschedule Required' && (
                            <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 mb-6 rounded-r-md">
                                <h3 className="font-bold">Reschedule Required</h3>
                                <div className="flex justify-between items-center">
                                    <p className="mt-1 text-sm">This student missed their session. Click to reset their status to 'In Progress', allowing them to join the next available class.</p>
                                    <button
                                        onClick={() => onRescheduleStudent(student.id)}
                                        className="px-4 py-2 bg-yellow-50 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-600 transition flex items-center gap-2 flex-shrink-0"
                                    >
                                        <IconRefreshCw className="w-4 h-4" />
                                        Reschedule Student
                                    </button>
                                </div>
                            </div>
                        )}
                        <div className={`grid grid-cols-2 md:grid-cols-3 ${hasNdpScore ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-6`}>
                            <StatCard label="Status" value={student.status} colorClass={getStatusColor(student.status)} />
                            <StatCard label="Attendance" value={student.attendance.percentage} />
                            <StatCard label="Pre-Test Score" value={student.preTestScore} />
                            <StatCard label="Post-Test Score" value={student.postTestScore} />
                            {hasNdpScore && (() => {
                                let boxStyle = '';
                                let textStyle = '';
                                switch (ndpScore.category) {
                                    case 'No Problem':
                                        boxStyle = 'bg-green-50 border-green-500';
                                        textStyle = 'text-green-800';
                                        break;
                                    case 'Potential Problem':
                                        boxStyle = 'bg-yellow-50 border-yellow-500';
                                        textStyle = 'text-yellow-800';
                                        break;
                                    case 'Evident Problem':
                                        boxStyle = 'bg-red-50 border-red-500';
                                        textStyle = 'text-red-800';
                                        break;
                                    default:
                                        boxStyle = 'bg-gray-50 border-gray-200';
                                        textStyle = 'text-gray-900';
                                }
                                return (
                                     <div className={`p-4 rounded-lg border ${boxStyle}`}>
                                        <h4 className="text-sm font-medium text-gray-500">NDP Score</h4>
                                        <p className={`text-2xl font-bold ${textStyle}`}>{ndpScore.score}</p>
                                        <p className={`text-xs font-semibold ${textStyle}`}>{ndpScore.category}</p>
                                    </div>
                                );
                            })()}
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                             <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Contact & Referral</h3>
                                    <button 
                                        onClick={() => setIsEditingContact(true)} 
                                        className="p-1 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 transition"
                                        title="Edit Contact Info"
                                    >
                                        <IconEdit className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4 h-full">
                                    <div className="flex items-start gap-3">
                                        <IconMail className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Email Address</p>
                                            <a href={`mailto:${student.email}`} className="text-sm text-blue-600 hover:underline break-all">{student.email || 'N/A'}</a>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <IconPhone className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Phone Number</p>
                                            <a href={`tel:${student.phoneNumber}`} className="text-sm text-blue-600 hover:underline">{student.phoneNumber || 'N/A'}</a>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <IconStudents className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Referral Source</p>
                                            <p className="text-sm text-gray-900">{student.referralSource}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                             <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Schedule</h3>
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 h-full">
                                    {!studentCourse ? (
                                         <div className="text-center py-8"><p className="text-gray-500 text-sm">Could not determine course assignment.</p></div>
                                    ) : upcomingClasses.length > 0 ? (
                                        <div className="space-y-3">
                                            {upcomingClasses.slice(0, 4).map(sc => { // Show up to 4 upcoming classes
                                                const module = studentCourse.modules.find(m => m.id === sc.moduleId);
                                                const originalStatus = getStatusForSchedule(sc.date);
                                                
                                                let displayStatus = originalStatus;
                                                let makeupInfo = null;

                                                if (student.makeupSession && student.makeupSession.missedModuleId === sc.moduleId) {
                                                    displayStatus = { text: 'Absent', color: 'bg-red-100 text-red-800' };
                                                    if (student.makeupSession.completed && student.makeupSession.completionDate) {
                                                         const makeupDate = new Date(student.makeupSession.completionDate).toLocaleDateString();
                                                         makeupInfo = (
                                                            <div className="flex items-center gap-1 mt-1 text-green-600">
                                                                <IconCheckCircle className="w-3 h-3" />
                                                                <span className="text-xs font-medium">Makeup Session Completed: {makeupDate}</span>
                                                            </div>
                                                         );
                                                    }
                                                }

                                                return (
                                                    <div key={sc.id} className="p-3 bg-white rounded-lg border border-gray-200 flex justify-between items-center">
                                                        <div>
                                                            <p className="font-semibold text-sm text-gray-800">{module?.name || 'Unknown Module'}</p>
                                                            <p className="text-xs text-gray-600">{studentCourse.name} &bull; {formatDateForSchedule(sc.date)} at {sc.time}</p>
                                                            {makeupInfo}
                                                        </div>
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${displayStatus.color}`}>
                                                            {displayStatus.text}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-gray-500 text-sm">No upcoming classes scheduled.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Hardware & Biometric Audit</h3>
                                    <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3 shadow-inner">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hardware Status</span>
                                            {student.audioCheckTimestamp ? (
                                                <span className="flex items-center gap-1 text-[10px] font-black text-green-400 uppercase">
                                                    <IconCheckCircle className="w-3 h-3" /> VERIFIED
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-[10px] font-black text-red-400 uppercase">
                                                    <IconXCircle className="w-3 h-3" /> PENDING
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-600 uppercase mb-1">Audit Timestamp</p>
                                            <p className="text-xs font-mono text-slate-300">
                                                {student.audioCheckTimestamp ? new Date(student.audioCheckTimestamp).toLocaleString() : 'No Record on File'}
                                            </p>
                                        </div>

                                        <div className="pt-2 border-t border-slate-800">
                                             <p className="text-[10px] font-bold text-slate-600 uppercase mb-2">Voice Print (Recorded)</p>
                                             {student.voiceVerificationUrl ? (
                                                <div className="flex items-center gap-2">
                                                    <audio controls src={student.voiceVerificationUrl} className="h-8 flex-1" />
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center py-3">
                                                    <IconMic className="w-5 h-5 text-slate-700 mb-1" />
                                                    <p className="text-[10px] text-slate-600 italic">No audio recorded</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Photo ID on File</h3>
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        {student.photoIdUrl ? (
                                            <img src={student.photoIdUrl} alt={`${student.name}'s Photo ID`} className="w-full rounded-md shadow-sm" />
                                        ) : (
                                            <div className="flex items-center justify-center text-sm text-gray-500 bg-gray-100 rounded-md min-h-[150px]">
                                                <p>No Photo ID on file.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'conduct':
                return (
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <h3 className="text-xl font-semibold text-gray-900">Conduct & Removal History</h3>
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">{student.removalHistory?.length || 0} incidents</span>
                        </div>
                        {student.removalHistory && student.removalHistory.length > 0 ? (
                            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {student.removalHistory.map((record, idx) => (
                                            <tr key={record.id || idx}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {new Date(record.date).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                                                    {record.reason}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700">
                                                    {record.details}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {record.adminName}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                                <IconGavel className="w-12 h-12 mx-auto text-gray-300 mb-4"/>
                                <p>No disciplinary actions or removals recorded.</p>
                            </div>
                        )}
                    </div>
                );
            case 'attendance':
                return (
                     <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <h4 className="text-sm font-medium text-gray-500">First Login</h4>
                            <p className="text-lg font-semibold text-gray-900">{formatDate(student.attendance.loginTime)}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <h4 className="text-sm font-medium text-gray-500">Last Recorded Activity</h4>
                            <p className="text-lg font-semibold text-gray-900">{formatDate(student.attendance.lastActivity)}</p>
                        </div>
                    </div>
                );
            case 'selfies':
                return (
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Attendance Photos</h3>
                        {student.attendanceRecords && student.attendanceRecords.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {student.attendanceRecords.map(record => (
                                    <div key={record.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                                        <div className="aspect-video bg-gray-100 flex items-center justify-center relative">
                                            {record.selfieUrl ? (
                                                <img src={record.selfieUrl} alt={`Attendance on ${record.date}`} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-center text-gray-400">
                                                    <IconCamera className="w-8 h-8 mx-auto mb-2" />
                                                    <span className="text-xs">No Photo</span>
                                                </div>
                                            )}
                                            <div className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold rounded ${
                                                record.status === 'Present' ? 'bg-green-100 text-green-800' :
                                                record.status === 'Late' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {record.status}
                                            </div>
                                        </div>
                                        <div className="p-3">
                                            <p className="text-sm font-semibold text-gray-800">
                                                {new Date(record.date).toLocaleDateString()}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(record.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                                <IconCamera className="w-12 h-12 mx-auto text-gray-400 mb-4"/>
                                <p>No attendance photos recorded for this student.</p>
                            </div>
                        )}
                    </div>
                );
            case 'notifications': {
                const timeSince = (date: string) => {
                    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
                    let interval = seconds / 31536000;
                    if (interval > 1) return `${Math.floor(interval)} years ago`;
                    interval = seconds / 2592000;
                    if (interval > 1) return `${Math.floor(interval)} months ago`;
                    interval = seconds / 86400;
                    if (interval > 1) return `${Math.floor(interval)} days ago`;
                    interval = seconds / 3600;
                    if (interval > 1) return `${Math.floor(interval)} hours ago`;
                    interval = seconds / 60;
                    if (interval > 1) return `${Math.floor(interval)} minutes ago`;
                    return "Just now";
                };

                const sortedNotifications = [...(student.notifications || [])].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

                return (
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Notification History</h3>
                        {sortedNotifications.length > 0 ? (
                            <ul className="space-y-4 max-h-[60vh] overflow-y-auto">
                                {sortedNotifications.map(notification => (
                                    <li key={notification.id} className={`p-4 rounded-lg border ${notification.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'}`}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-gray-800">{notification.title}</p>
                                                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                            </div>
                                            <div className="text-right flex-shrink-0 ml-4">
                                                <p className="text-xs text-gray-500">{timeSince(notification.timestamp)}</p>
                                                {notification.read ? (
                                                    <span className="mt-1 inline-flex items-center gap-1 text-xs text-gray-500">
                                                        <IconCheckCircle className="w-3 h-3" /> Read
                                                    </span>
                                                ) : (
                                                    <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-blue-600">
                                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div> Unread
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border">
                                <IconBell className="w-12 h-12 mx-auto text-gray-400 mb-4"/>
                                <p>This student has not received any notifications.</p>
                            </div>
                        )}
                    </div>
                );
            }
            case 'chat':
                return (
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto bg-gray-50 p-3 rounded-lg">
                        {student.chatHistory.length > 0 ? (
                            student.chatHistory.map((msg, index) => (
                                <div key={index} className="p-3 bg-white rounded-lg shadow-sm border border-gray-200">
                                    <p className="text-sm font-medium text-gray-900">{student.name}</p>
                                    <p className="text-sm text-gray-600 mt-1"><strong>Q:</strong> {msg.question}</p>
                                    <p className="text-sm text-blue-700 mt-1"><strong>A:</strong> {msg.answer}</p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8"><p className="text-gray-500">No chat history available.</p></div>
                        )}
                    </div>
                );
            case 'breakouts':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center px-1">
                            <h3 className="text-xl font-bold text-gray-900">Collaboration & Breakout Audit</h3>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-black uppercase rounded-full tracking-widest">{student.breakoutHistory.length} Sessions on File</span>
                        </div>

                        {student.breakoutHistory.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6 max-h-[70vh] overflow-y-auto pr-2">
                                {student.breakoutHistory.map(session => (
                                    <div key={session.sessionId} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:border-blue-300 transition-all group">
                                        <div className="p-5 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                                                    <IconCalendar className="w-5 h-5 text-gray-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-800 leading-none">
                                                        {new Date(session.timestamp).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                                                        {formatShortTime(session.timestamp)} - {session.endTime ? formatShortTime(session.endTime) : 'End N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex -space-x-2">
                                                {session.participants.map(p => (
                                                    <div key={p} className="w-8 h-8 rounded-full border-2 border-white bg-blue-500 text-white flex items-center justify-center text-[10px] font-black" title={p}>
                                                        {p.charAt(0)}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <div>
                                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                                        <IconStudents className="w-3.5 h-3.5" /> Group Metadata
                                                    </h4>
                                                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                        <p className="text-xs text-gray-500 font-medium mb-1.5">Participants:</p>
                                                        <p className="text-xs text-gray-800 font-bold leading-relaxed">
                                                            {session.participants.join(', ')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                                        <IconFileText className="w-3.5 h-3.5" /> Transcript Summary
                                                    </h4>
                                                    <p className="text-sm text-gray-600 leading-relaxed italic border-l-4 border-gray-100 pl-4">
                                                        "{session.summary || 'Summary data currently processing...'}"
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100 flex flex-col">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <div className="p-1.5 bg-indigo-600 text-white rounded-md shadow-lg shadow-indigo-100">
                                                        <IconRobot className="w-4 h-4" />
                                                    </div>
                                                    <h4 className="text-xs font-black text-indigo-900 uppercase tracking-widest">AI Session Intelligence</h4>
                                                </div>
                                                
                                                <div className="flex-grow">
                                                    <div className="prose prose-sm prose-indigo">
                                                        <p className="text-sm text-indigo-900 font-medium leading-relaxed bg-white/40 p-4 rounded-xl border border-white shadow-inner">
                                                            {session.aiReport || 'Analyzing collaboration metrics...'}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <div className="mt-4 pt-4 border-t border-indigo-100 flex justify-between items-center">
                                                    <span className="text-[9px] font-black text-indigo-400 uppercase">Proctor Logic V4.1</span>
                                                    <button className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                                                        <IconExport className="w-3 h-3" /> Full Logs
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                <IconStudents className="w-20 h-20 mx-auto text-gray-300 mb-4 opacity-40" />
                                <h4 className="text-lg font-bold text-gray-400">No Breakout Data Available</h4>
                                <p className="text-sm text-gray-500 max-w-xs mx-auto">This student has not yet participated in any recorded breakout sessions.</p>
                            </div>
                        )}
                    </div>
                );
            case 'quizzes':
                 return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-gray-900">Poll Answers</h3>
                            <div className="space-y-3">
                                {student.pollAnswers.length > 0 ? (
                                    student.pollAnswers.map(poll => (
                                        <div key={poll.pollId} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <p className="text-sm font-medium text-gray-800">{poll.question}</p>
                                            <p className="text-sm text-blue-600 mt-1"><strong>Answer:</strong> {poll.answer}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">No poll answers recorded.</p>
                                )}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-gray-900">Quiz Results</h3>
                             <div className="space-y-4">
                                {student.quizResults.length > 0 ? (
                                    student.quizResults.map(quiz => (
                                        <div key={quiz.quizId} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="flex justify-between items-center mb-3">
                                                <p className="text-md font-semibold text-gray-800">{quiz.title}</p>
                                                <p className="text-xl font-bold text-gray-900">{quiz.score}</p>
                                            </div>
                                            <div className="space-y-2 border-t border-gray-200 pt-3">
                                                {quiz.studentAnswers.map(answer => {
                                                    const question = findQuestion(answer.questionId);
                                                    const studentOption = question?.options.find(o => o.id === answer.selectedOptionId);
                                                    return (
                                                        <div key={answer.questionId} className="flex items-start gap-2 text-sm">
                                                            {answer.isCorrect 
                                                                ? <IconCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /> 
                                                                : <IconXCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                                            }
                                                            <div>
                                                                <p className="font-medium text-gray-700">{question?.text}</p>
                                                                <p className={`text-gray-600 ${!answer.isCorrect ? 'line-through' : ''}`}>
                                                                    Your answer: {studentOption?.text || 'N/A'}
                                                                </p>
                                                                {!answer.isCorrect && (
                                                                    <p className="text-green-700">
                                                                        Correct answer: {question?.options.find(o => o.id === question.correctOptionId)?.text}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">No quiz results recorded.</p>
                                )}
                            </div>
                        </div>
                    </div>
                 );
            case 'paperwork':
                const { paperworkData } = student;
                if (!paperworkData) {
                    return <div className="text-center py-8"><p className="text-gray-500">No pre-course paperwork has been submitted by this student.</p></div>;
                }
                const preTestAnswers = {
                    'preTestQ1': { a: 'Up to $1,000', b: 'Up to $2,000', c: 'Up to $5,000' },
                    'preTestQ2': { a: 'Judgment', b: 'Muscle control', c: 'Reaction time' },
                };

                return (
                     <div>
                        <div className="flex justify-between items-center mb-6 no-print">
                            <h3 className="text-xl font-semibold text-gray-900">Submitted Forms</h3>
                            <button
                                onClick={() => window.print()}
                                className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition flex items-center gap-2"
                            >
                                <IconExport className="w-4 h-4" />
                                Export as PDF
                            </button>
                        </div>
                        <div id="printable-paperwork">
                             <h2 style={{ fontSize: '20pt', fontWeight: 'bold', marginBottom: '2rem' }}>Student Paperwork: {student.name}</h2>
                             <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-3 text-gray-900">Personal Data</h3>
                                    <dl className="space-y-2 divide-y divide-gray-200">
                                        <PaperworkItem label="First Name" value={paperworkData.firstName} />
                                        <PaperworkItem label="Last Name" value={paperworkData.lastName} />
                                        <PaperworkItem label="Date of Birth" value={formatDate(paperworkData.dob || '')} />
                                        <PaperworkItem label="Address" value={paperworkData.address} />
                                        <PaperworkItem label="Emergency Contact" value={paperworkData.emergencyContactName} />
                                        <PaperworkItem label="Emergency Contact Phone" value={paperworkData.emergencyContactPhone} />
                                        <PaperworkItem label="BAC at time of charge" value={paperworkData.bac} />
                                    </dl>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-3 text-gray-900">Problem Drinker Screening</h3>
                                    <dl className="space-y-2 divide-y divide-gray-200">
                                        <PaperworkItem label="Is someone close to you concerned about your drinking?" value={paperworkData.isSomeoneConcerned} />
                                        <PaperworkItem label="Can you stop drinking without a struggle after one or two drinks?" value={paperworkData.canStopDrinking} />
                                    </dl>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-3 text-gray-900">Knowledge Pre-Test Responses</h3>
                                    <dl className="space-y-2 divide-y divide-gray-200">
                                        <PaperworkItem label="1. The fine for first offense DWI in Texas is:" value={paperworkData.preTestQ1 ? preTestAnswers.preTestQ1[paperworkData.preTestQ1 as keyof typeof preTestAnswers.preTestQ1] : 'Not Answered'} />
                                        <PaperworkItem label="2. The ability first affected by alcohol is:" value={paperworkData.preTestQ2 ? preTestAnswers.preTestQ2[paperworkData.preTestQ2 as keyof typeof preTestAnswers.preTestQ2] : 'Not Answered'} />
                                    </dl>
                                </div>
                                {paperworkData.signatureUrl && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3 text-gray-900">Electronic Signature</h3>
                                        <div className="mt-2 border border-gray-200 rounded p-2 inline-block bg-white">
                                            <img src={paperworkData.signatureUrl} alt="Student Signature" className="max-h-24 h-auto" />
                                        </div>
                                        <p className="text-[10pt] text-gray-500 mt-1 italic">Signed electronically on {new Date(student.registrationDate).toLocaleDateString()}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 'billing':
                const isExpedited = student.paymentHistory.some(p => p.expedited);
                return (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-gray-900">Payment History</h3>
                            <button 
                                onClick={() => onManualExpedite(student.id)} 
                                disabled={isExpedited}
                                className={`px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition flex items-center gap-2 ${
                                    isExpedited 
                                    ? 'bg-green-100 text-green-800 cursor-default' 
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            >
                                <IconClock className="w-4 h-4" />
                                {isExpedited ? 'Expedited Status Active' : 'Grant Expedited Status (Free)'}
                            </button>
                        </div>
                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Billed To</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {student.paymentHistory.map(p => (
                                        <tr key={p.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(p.date)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {p.description}
                                                {p.expedited && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">Expedited</span>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${p.amount.toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.billedToName || student.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.status === 'Paid' ? 'bg-green-100 text-green-800' : p.status === 'Refunded' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                                {p.status === 'Paid' && (
                                                    <button
                                                        onClick={() => onRefundPayment(student.id, p.id)}
                                                        className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition"
                                                        title="Refund Payment"
                                                    >
                                                        <IconCornerUpLeft className="w-4 h-4" />
                                                        Refund
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'certificate':
                 return (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-gray-900">Certificate of Completion</h3>
                             {student.status === 'Completed' && (
                                <div className="flex items-center gap-2">
                                     <input
                                        type="file"
                                        accept="application/pdf"
                                        ref={certificateFileInputRef}
                                        onChange={handleCertificateFileSelect}
                                        className="hidden"
                                    />
                                    {student.certificateInfo?.certificatePdfUrl ? (
                                        <>
                                            <a
                                                href={student.certificateInfo.certificatePdfUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition flex items-center gap-2"
                                            >
                                                <IconFileText className="w-4 h-4" />
                                                View Certificate
                                            </a>
                                            <button
                                                onClick={() => certificateFileInputRef.current?.click()}
                                                className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition flex items-center gap-2"
                                            >
                                                <IconUpload className="w-4 h-4" />
                                                Replace
                                            </button>
                                        </>
                                    ) : (
                                         <button
                                            onClick={() => certificateFileInputRef.current?.click()}
                                            className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition flex items-center gap-2"
                                        >
                                            <IconUpload className="w-4 h-4" />
                                            Upload Certificate (PDF)
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                        {student.status === 'Completed' && student.certificateInfo ? (
                            <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                                <dl className="divide-y divide-green-200">
                                    <CertificateDetail label="Certificate ID" value={student.certificateInfo.id} />
                                    <CertificateDetail label="Issuance Date" value={formatDate(student.certificateInfo.issuanceDate)} />
                                    <CertificateDetail label="Status" value={student.certificateInfo.status} />

                                    <CertificateDetail label="Last Name" value={student.certificateInfo.lastName} />
                                    <CertificateDetail label="First & Middle Name" value={student.certificateInfo.firstName} />
                                    <CertificateDetail label="Date of Birth" value={student.certificateInfo.dob ? formatDate(student.certificateInfo.dob) : ''} />
                                    <CertificateDetail label="Mailing Address" value={student.certificateInfo.address} />
                                    <CertificateDetail label="City, State, Zip" value={student.certificateInfo.cityStateZip} />
                                    
                                    <CertificateDetail label="Driver's License #" value={student.certificateInfo.driversLicense} />
                                    <CertificateDetail label="Cause or Case #" value={student.certificateInfo.caseNumber} />
                                    <CertificateDetail label="County of Conviction" value={student.certificateInfo.countyOfConviction} />
                                    <CertificateDetail label="DWI Instructor's Name" value={student.certificateInfo.instructorName} />

                                    <CertificateDetail label="Probation Officer" value={student.certificateInfo.probationOfficerName} />
                                    <CertificateDetail label="PO Email" value={student.certificateInfo.probationOfficerEmail} />
                                    <CertificateDetail label="Lawyer" value={student.certificateInfo.lawyerName} />
                                    <CertificateDetail label="Lawyer Email" value={student.certificateInfo.lawyerEmail} />
                                    <CertificateDetail label="Law Firm" value={student.certificateInfo.lawFirmName} />
                                </dl>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border">
                                <IconCheckCircle className="w-12 h-12 mx-auto text-gray-400 mb-4"/>
                                <p>
                                    {student.status === 'Completed'
                                        ? 'Certificate information is not yet available for this student.'
                                        : 'This student has not yet completed the course.'}
                                </p>
                            </div>
                        )}
                    </div>
                );
            case 'call-history':
                return (
                    <div className="animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-900">Communication Logs (Telzio)</h3>
                            <button 
                                onClick={loadCallHistory}
                                className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                title="Refresh Logs"
                            >
                                <IconRefreshCw className={`w-4 h-4 ${isLoadingRecordings ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                        
                        {isLoadingRecordings ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <IconRefreshCw className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                                <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Fetching call data...</p>
                            </div>
                        ) : studentCallLogs.length > 0 ? (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                            <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Date / Time</th>
                                            <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Info</th>
                                            <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Dur.</th>
                                            <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Notes & Tags</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {studentCallLogs.map((rec) => (
                                            <tr key={rec.id} className="hover:bg-gray-50/80 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {rec.is_missed ? (
                                                        <span className="px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter bg-red-100 text-red-700 border border-red-200">
                                                            Missed
                                                        </span>
                                                    ) : (
                                                        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${rec.direction === 'inbound' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-purple-100 text-purple-700 border border-purple-200'}`}>
                                                            {rec.direction}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-gray-800">{new Date(rec.created_at).toLocaleDateString()}</span>
                                                        <span className="text-xs text-gray-400">{new Date(rec.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-medium text-gray-600">{rec.direction === 'inbound' ? rec.from : rec.to}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-medium text-gray-500">
                                                        {rec.duration > 0 ? `${Math.floor(rec.duration / 60)}m ${rec.duration % 60}s` : '--'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1.5 max-w-xs">
                                                        <p className="text-xs text-gray-500 font-medium italic line-clamp-1">
                                                            {rec.internal_notes || "No log notes recorded..."}
                                                        </p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {rec.tags?.map(tag => (
                                                                <span key={tag} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[9px] font-black uppercase rounded border border-gray-200">
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                <IconPhone className="w-16 h-16 mx-auto text-gray-200 mb-4" />
                                <h4 className="text-lg font-bold text-gray-400">No Call Logs Found</h4>
                                <p className="text-sm text-gray-500 max-w-xs mx-auto">There are no Telzio call recordings associated with this student's phone number ({student.phoneNumber || 'N/A'}).</p>
                            </div>
                        )}
                    </div>
                );
        }
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <div>
                    <button onClick={onBack} className="text-sm text-blue-600 hover:underline mb-2 no-print">&larr; Back to All Students</button>
                    <div className="flex items-center gap-3">
                         {isEditingName ? (
                            <div className="flex items-center gap-2 mt-1 no-print">
                                <input
                                    type="text"
                                    value={editedName}
                                    onChange={(e) => setEditedName(e.target.value)}
                                    className="text-2xl font-bold text-gray-900 border-b-2 border-blue-500 focus:outline-none bg-blue-50 px-2 py-1 rounded-t-md"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveName();
                                        if (e.key === 'Escape') handleCancelEdit();
                                    }}
                                />
                                <button onClick={handleSaveName} className="px-3 py-1.5 bg-green-600 text-white text-sm font-semibold rounded-md hover:bg-green-700">Save</button>
                                <button onClick={handleCancelEdit} className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm font-semibold rounded-md hover:bg-gray-300">Cancel</button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
                                <button onClick={() => { setIsEditingName(true); setEditedName(student.name); }} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-200 rounded-md no-print" title="Edit name">
                                    <IconEdit className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>
                    <p className="text-gray-500 mt-2">
                        Cohort {student.cohort} | Company: <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getCompanyBadgeStyle(student.company)}`}>{student.company}</span> | Unique Code: <span className="font-mono bg-gray-200 px-2 py-1 rounded">{student.uniqueClassCode}</span>
                    </p>
                </div>
                 <div className="flex-shrink-0 no-print">
                    {(student.status === 'In Progress' || student.status === 'On Watch' || student.status === 'Inactive') && (
                        <button
                            onClick={() => onToggleInactiveStatus(student.id)}
                            className={`px-4 py-2 font-semibold rounded-lg shadow-md transition flex items-center gap-2 ${
                                student.status === 'Inactive'
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                            }`}
                        >
                            <IconPauseCircle className="w-5 h-5"/>
                            {student.status === 'Inactive' ? 'Reactivate Student' : 'Make Student Inactive'}
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md border border-gray-200">
                <div className="p-4 border-b border-gray-200 no-print overflow-x-auto">
                    <nav className="flex min-w-max gap-2" role="tablist" aria-label="Student Profile Tabs">
                        <TabButton label="Overview" icon={<IconHome className="w-4 h-4" />} isActive={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                        <TabButton label="Call History" icon={<IconPhone className="w-4 h-4" />} isActive={activeTab === 'call-history'} onClick={() => setActiveTab('call-history')} />
                        <TabButton label="Attendance" icon={<IconActivity className="w-4 h-4" />} isActive={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} />
                        <TabButton label="Selfies" icon={<IconCamera className="w-4 h-4" />} isActive={activeTab === 'selfies'} onClick={() => setActiveTab('selfies')} />
                        <TabButton label="Breakout History" icon={<IconStudents className="w-4 h-4" />} isActive={activeTab === 'breakouts'} onClick={() => setActiveTab('breakouts')} />
                        <TabButton label="Paperwork" icon={<IconFile className="w-4 h-4" />} isActive={activeTab === 'paperwork'} onClick={() => setActiveTab('paperwork')} />
                        <TabButton label="Billing" icon={<IconCreditCard className="w-4 h-4" />} isActive={activeTab === 'billing'} onClick={() => setActiveTab('billing')} />
                        <TabButton label="Certificate" icon={<IconCheckCircle className="w-4 h-4" />} isActive={activeTab === 'certificate'} onClick={() => setActiveTab('certificate')} />
                        <TabButton label="Conduct" icon={<IconGavel className="w-4 h-4" />} isActive={activeTab === 'conduct'} onClick={() => setActiveTab('conduct')} />
                        <TabButton label="Chat History" icon={<IconChat className="w-4 h-4" />} isActive={activeTab === 'chat'} onClick={() => setActiveTab('chat')} />
                        <TabButton label="Notifications" icon={<IconBell className="w-4 h-4" />} isActive={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} />
                        <TabButton label="Polls & Quizzes" icon={<IconClipboardList className="w-4 h-4" />} isActive={activeTab === 'quizzes'} onClick={() => setActiveTab('quizzes')} />
                    </nav>
                </div>
                <div className="p-6" role="tabpanel">
                    {renderContent()}
                </div>
            </div>
            {isEditingContact && (
                <EditStudentModal
                    student={student}
                    onClose={() => setIsEditingContact(false)}
                    onSave={(id, data) => {
                        onUpdateStudent(id, data);
                        setIsEditingContact(false);
                    }}
                />
            )}
        </div>
    );
};

export default StudentProfile;