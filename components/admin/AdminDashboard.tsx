import React, { useState } from 'react';
import { View, AdminView, ChatLogEntry, LiveSession, Student, Course, User, UserRole, Instructor, ScheduledClass, Coupon, WebsiteContent } from '../types';
import AdminHome from './admin/AdminHome';
import AdminCurriculum from './admin/AdminCurriculum';
import AdminMonitor from './admin/AdminMonitor';
import AdminStudents from './admin/AdminStudents';
import StudentProfile from './admin/StudentProfile';
import { IconHome, IconCurriculum, IconMonitor, IconStudents, IconSettings, IconLogout, IconChevronsLeft, IconRobot, IconActivity, IconCalendar, IconHuman, IconFileText } from '../icons';
import AdminAIAvatar from './admin/AdminAIAvatar';
import AdminAnalytics from './admin/AdminAnalytics';
import AdminSchedule from './admin/AdminSchedule';
import AdminSettings from './admin/AdminSettings';
import AdminInstructors from './admin/AdminInstructors';
import AdminCMS from './admin/AdminCMS';
import NotificationBell from './student/NotificationBell';

interface AdminDashboardProps {
    setView: (view: View) => void;
    chatLog: ChatLogEntry[];
    studentPhotos: Record<string, string>;
    liveSessions: LiveSession[];
    enterInstructorMode: (session: LiveSession) => void;
    enterAdminMode: (session: LiveSession) => void;
    courses: Course[];
    setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
    students: Student[];
    instructors: Instructor[];
    scheduledClasses: ScheduledClass[];
    onAddStudent: (name: string, courseId: string, referralSource: Student['referralSource'], company: Student['company']) => void;
    onUpdateStudent: (studentId: number, data: { name?: string; email?: string; phoneNumber?: string }) => void;
    onToggleInactiveStatus: (studentId: number) => void;
    onRescheduleStudent: (studentId: number) => void;
    onRefundPayment: (studentId: number, paymentId: string) => void;
    onUploadCertificate: (studentId: number, fileUrl: string) => void;
    currentUser: User;
    users: User[];
    onAddUser: (name: string, email: string) => void;
    onRemoveUser: (userId: number) => void;
    onAddScheduledClass: (newClass: Omit<ScheduledClass, 'id'>) => void;
    onUpdateScheduledClass: (updatedClass: ScheduledClass) => void;
    onDeleteScheduledClass: (classId: string) => void;
    onAddInstructor: (name: string, assignedCourseIds: string[]) => void;
    onUpdateInstructor: (instructorId: number, updatedData: Partial<Instructor>) => void;
    onDeleteInstructor: (instructorId: number) => void;
    onMarkAdminNotificationRead: (notificationId: string) => void;
    onMarkAllAdminNotificationsRead: () => void;
    onSendChatMessage: (message: string, recipient?: string) => void;
    onRemoveStudent: (studentId: number, reason: string, details: string) => void;
    onManualExpedite: (studentId: number) => void;
    coupons: Coupon[];
    onAddCoupon: (code: string, discountAmount: number) => void;
    onDeleteCoupon: (code: string) => void;
    websiteContent: WebsiteContent;
    onUpdateWebsiteContent: (newContent: Partial<WebsiteContent>) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ setView, chatLog, studentPhotos, liveSessions, enterInstructorMode, enterAdminMode, courses, setCourses, students, instructors, scheduledClasses, onAddStudent, onUpdateStudent, onToggleInactiveStatus, onRescheduleStudent, onRefundPayment, onUploadCertificate, currentUser, users, onAddUser, onRemoveUser, onAddScheduledClass, onUpdateScheduledClass, onDeleteScheduledClass, onAddInstructor, onUpdateInstructor, onDeleteInstructor, onMarkAdminNotificationRead, onMarkAllAdminNotificationsRead, onSendChatMessage, onRemoveStudent, onManualExpedite, coupons, onAddCoupon, onDeleteCoupon, websiteContent, onUpdateWebsiteContent }) => {
    const [adminView, setAdminView] = useState<AdminView>(AdminView.Home);
    const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [monitoredSession, setMonitoredSession] = useState<LiveSession | null>(null);


    const handleViewStudentProfile = (student: Student) => {
        setSelectedStudent(student);
        setAdminView(AdminView.StudentProfile);
    };

    const handleMonitorSession = (session: LiveSession) => {
        setMonitoredSession(session);
        setAdminView(AdminView.Monitor);
    };
    
    const getAdminViewTitle = (view: AdminView): string => {
        switch (view) {
            case AdminView.Home: return "Dashboard Home";
            case AdminView.Curriculum: return "Curriculum Builder";
            case AdminView.Schedule: return "Class Schedule";
            case AdminView.Monitor: return `Live Monitor${monitoredSession ? `: ${monitoredSession.title}` : ''}`;
            case AdminView.Students: return "Student Management";
            case AdminView.Instructors: return "Instructor Management";
            case AdminView.AIAvatar: return "AI Avatar Tools";
            case AdminView.Analytics: return "Analytics Dashboard";
            case AdminView.CMS: return "Website CMS";
            case AdminView.Settings: return "Settings";
            case AdminView.StudentProfile: return `Student Profile`;
            default: return "Admin Portal";
        }
    };

    const renderAdminView = () => {
        switch (adminView) {
            case AdminView.Home:
                return <AdminHome setAdminView={setAdminView} liveSessions={liveSessions} enterInstructorMode={enterInstructorMode} enterAdminMode={enterAdminMode} onMonitorSession={handleMonitorSession} students={students} />;
            case AdminView.Curriculum:
                return <AdminCurriculum courses={courses} setCourses={setCourses} scheduledClasses={scheduledClasses} onAddScheduledClass={onAddScheduledClass} onUpdateScheduledClass={updatedClass => onUpdateScheduledClass(updatedClass)} onDeleteScheduledClass={onDeleteScheduledClass} instructors={instructors} />;
            case AdminView.Monitor:
                return <AdminMonitor session={monitoredSession} chatLog={chatLog} studentPhotos={studentPhotos} onSendMessage={onSendChatMessage} students={students} onRemoveStudent={onRemoveStudent} />;
            case AdminView.Students:
                return <AdminStudents onViewStudent={handleViewStudentProfile} courses={courses} students={students} onAddStudent={onAddStudent} onToggleInactiveStatus={onToggleInactiveStatus} onUpdateStudent={onUpdateStudent} />;
            case AdminView.Instructors:
                return <AdminInstructors instructors={instructors} courses={courses} liveSessions={liveSessions} onAddInstructor={onAddInstructor} onUpdateInstructor={onUpdateInstructor} onDeleteInstructor={onDeleteInstructor} />;
            case AdminView.Schedule:
                return <AdminSchedule courses={courses} students={students} scheduledClasses={scheduledClasses} instructors={instructors} onViewStudent={handleViewStudentProfile} />;
            case AdminView.Analytics:
                return <AdminAnalytics students={students} courses={courses} />;
            case AdminView.AIAvatar:
                return <AdminAIAvatar />;
            case AdminView.CMS:
                return <AdminCMS websiteContent={websiteContent} onUpdateWebsiteContent={onUpdateWebsiteContent} />;
            case AdminView.Settings:
                return <AdminSettings 
                            users={users} 
                            onAddUser={onAddUser} 
                            onRemoveUser={onRemoveUser} 
                            coupons={coupons}
                            onAddCoupon={onAddCoupon}
                            onDeleteCoupon={onDeleteCoupon}
                        />;
            case AdminView.StudentProfile:
                const updatedSelectedStudent = students.find(s => s.id === selectedStudent?.id) || selectedStudent;
                return updatedSelectedStudent ? <StudentProfile student={updatedSelectedStudent} onBack={() => { setSelectedStudent(null); setAdminView(AdminView.Schedule); }} onUpdateStudent={onUpdateStudent} onToggleInactiveStatus={onToggleInactiveStatus} onRescheduleStudent={onRescheduleStudent} courses={courses} onRefundPayment={onRefundPayment} onUploadCertificate={onUploadCertificate} onManualExpedite={onManualExpedite} /> : <p>No student selected. Please return to the student list.</p>;
            default:
                return <AdminHome setAdminView={setAdminView} liveSessions={liveSessions} enterInstructorMode={enterInstructorMode} enterAdminMode={enterAdminMode} onMonitorSession={handleMonitorSession} students={students} />;
        }
    };

    const NavLink = ({ icon, label, view, activeView, onClick }: { icon: React.ReactNode; label: string; view: AdminView; activeView: AdminView; onClick: (view: AdminView) => void; }) => (
        <button
            onClick={() => onClick(view)}
            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full ${
                activeView === view
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            } ${isSidebarMinimized ? 'justify-center' : 'gap-3 text-left'}`}
            title={isSidebarMinimized ? label : undefined}
        >
            {icon}
            {!isSidebarMinimized && <span>{label}</span>}
        </button>
    );

    return (
        <div className="bg-gray-100 min-h-screen">
            <aside className={`fixed top-0 left-0 h-full z-10 transition-all duration-300 bg-white border-r border-gray-200 p-4 flex flex-col ${isSidebarMinimized ? 'w-20' : 'w-64'}`}>
                <div className="mb-8 h-[36px] flex items-center justify-center">
                    <h2 className="text-2xl font-bold text-gray-900">{isSidebarMinimized ? 'DWI' : 'Admin Portal'}</h2>
                </div>
                <nav className="flex-1 space-y-2">
                    <NavLink icon={<IconHome />} label="Home" view={AdminView.Home} activeView={adminView} onClick={setAdminView} />
                    {currentUser.role === UserRole.Admin && (
                        <NavLink icon={<IconCurriculum />} label="Curriculum" view={AdminView.Curriculum} activeView={adminView} onClick={setAdminView} />
                    )}
                    <NavLink icon={<IconCalendar />} label="Class Schedule" view={AdminView.Schedule} activeView={adminView} onClick={setAdminView} />
                    <NavLink icon={<IconMonitor />} label="Live Monitor" view={AdminView.Monitor} activeView={adminView} onClick={setAdminView} />
                    <NavLink icon={<IconStudents />} label="Students" view={AdminView.Students} activeView={adminView} onClick={setAdminView} />
                    <NavLink icon={<IconHuman />} label="Instructors" view={AdminView.Instructors} activeView={adminView} onClick={setAdminView} />
                    {currentUser.role === UserRole.Admin && (
                        <NavLink icon={<IconRobot />} label="AI Avatar" view={AdminView.AIAvatar} activeView={adminView} onClick={setAdminView} />
                    )}
                    <NavLink icon={<IconActivity />} label="Analytics" view={AdminView.Analytics} activeView={adminView} onClick={setAdminView} />
                    {currentUser.role === UserRole.Admin && (
                        <>
                            <NavLink icon={<IconFileText />} label="Website CMS" view={AdminView.CMS} activeView={adminView} onClick={setAdminView} />
                            <NavLink icon={<IconSettings />} label="Settings" view={AdminView.Settings} activeView={adminView} onClick={setAdminView} />
                        </>
                    )}
                </nav>
                <div className="mt-auto pt-4 border-t border-gray-200 space-y-2">
                     <button
                        onClick={() => setView(View.RoleSelector)}
                        className={`flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 ${isSidebarMinimized ? 'justify-center' : 'gap-3'}`}
                        title={isSidebarMinimized ? "Log Out" : undefined}
                    >
                        <IconLogout />
                        {!isSidebarMinimized && <span>Log Out</span>}
                    </button>
                    <button
                        onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
                        className="flex items-center justify-center w-full p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                        aria-label={isSidebarMinimized ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        <IconChevronsLeft className={`h-5 w-5 transition-transform duration-300 ${isSidebarMinimized ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </aside>
            <main className={`p-8 transition-all duration-300 ${isSidebarMinimized ? 'ml-20' : 'ml-64'}`}>
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">{getAdminViewTitle(adminView)}</h1>
                    <div className="flex items-center gap-4">
                        <NotificationBell
                            notifications={currentUser.notifications || []}
                            onMarkAsRead={onMarkAdminNotificationRead}
                            onMarkAllAsRead={onMarkAllAdminNotificationsRead}
                        />
                        <div className="text-right">
                            <p className="font-semibold text-gray-800">{currentUser.name}</p>
                            <p className="text-sm text-gray-500">{currentUser.role}</p>
                        </div>
                    </div>
                </header>
                {renderAdminView()}
            </main>
        </div>
    );
};

export default AdminDashboard;