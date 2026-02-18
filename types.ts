
import React from 'react';

export enum View {
    RoleSelector,
    StudentLogin,
    StudentClassroom,
    AdminDashboard,
    StudentRegistration,
    AdminLogin,
    InstructorLogin,
    Website,
}

export type Language = 'en' | 'es';

export enum StudentLoginStep {
    Code,
    Verify,
    Countdown,
    Paperwork,
    Selfie,
    VoiceVerification,
    Terms,
    Completed,
    Reschedule,
    Inactive,
    IdentityMismatch,
    Withdrawn,
    MakeupRequired, // New step
}

export enum RegistrationStep {
    CourseSelection,
    UserInfo,
    Payment,
    Confirmation,
}

export enum InstructorType {
    AI,
    Human,
}

export enum AdminView {
    Home,
    Curriculum,
    Monitor,
    Students,
    Settings,
    StudentProfile,
    AIAvatar,
    Analytics,
    Schedule,
    Instructors,
    CMS,
    LetterTrack,
    FedExTracking,
    Conversations,
    AdministerResources,
    Directory,
    CallLogs,
    Advertisements, // New Marketing Studio View
}

export enum UserRole {
    Admin = 'Admin',
    Assistant = 'Assistant',
}

export interface Coupon {
    code: string;
    discountAmount: number;
}

export interface BrandingSettings {
    backgroundColor: string;
}

export interface Review {
    id: string;
    name: string;
    rating: number;
    text: string;
    date: string;
}

export enum CommunicationChannel {
    Email = 'Email',
    SMS = 'SMS',
}

export interface Message {
    id: string;
    text: string;
    timestamp: string;
    isOutgoing: boolean;
    channel: CommunicationChannel;
}

export interface Conversation {
    id: string;
    contactName: string;
    contactDetail: string; // Email or Phone
    lastMessageText: string;
    lastMessageTimestamp: string;
    channel: CommunicationChannel;
    messages: Message[];
    unread: boolean;
    tags?: string[]; // Added tags for categorization
}

export interface WebsiteContent {
    branding: {
        primaryColor: string;
        logoUrl?: string;
    };
    home: {
        heroTitle: string;
        heroSubtitle: string;
        heroMediaType: 'image' | 'video';
        heroMediaUrl: string;
    };
    about: {
        title: string;
        content: string;
        mediaType: 'image' | 'video';
        mediaUrl: string;
    };
    contact: {
        address: string;
        phone: string;
        email: string;
        imageUrl: string;
    };
    registration: {
        title: string;
        subtitle: string;
    };
    terms: {
        title: string;
        content: string;
    };
    privacy: {
        title: string;
        content: string;
    };
    reviews: Review[];
    communication: {
        welcomeEmail: {
            subject: string;
            body: string;
        };
        completionEmail: {
            subject: string;
            body: string;
        };
        smsReminder: {
            message: string;
        };
    };
    resources: ResourcesContent;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    notifications?: Notification[];
    permissions?: string[]; 
}

export interface ChatLogEntry {
    user: string;
    question: string;
    answer: string;
    recipient?: string;
}

/* Added missing ChatMessage interface for classroom AI interactions */
export interface ChatMessage {
    user: string;
    text: string;
}

export interface LiveSession {
    id: number;
    title: string;
    studentCount: number;
    startTime: string;
    instructorType: InstructorType;
    instructorName?: string;
    instructorCode?: string;
    instructorId?: number;
}

export interface InstructorEvaluation {
    id: string;
    studentName: string;
    courseName: string;
    rating: number;
    comment: string;
    date: string;
}

export interface Instructor {
    id: number;
    name: string;
    email?: string;
    phoneNumber?: string;
    assignedCourseIds: string[];
    resources?: CourseResource[];
    evaluations?: InstructorEvaluation[];
    loginHistory?: string[]; 
}

export interface ScheduledClass {
    id: string;
    courseId: string;
    moduleId: string;
    date: string; // "YYYY-MM-DD"
    time: string; // "HH:MM" 24-hour format
    instructorType: InstructorType;
    instructorId?: number;
    instructorLoginTime?: string; 
}

export interface BreakoutSession {
    sessionId: number;
    timestamp: string; // Start time
    endTime?: string;
    participants: string[];
    summary?: string;
    aiReport?: string;
}

export interface PollAnswer {
    pollId: number;
    question: string;
    answer: string;
}

export interface StudentAnswer {
    questionId: string;
    selectedOptionId: string;
    isCorrect: boolean;
}

export interface QuizResult {
    quizId: string; 
    title: string;
    score: string;
    studentAnswers: StudentAnswer[];
    passingScore?: number;
}

export interface PaperworkData {
    dob?: string;
    address?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    lastName?: string;
    firstName?: string;
    bac?: string; 
    isSomeoneConcerned?: 'yes' | 'no' | undefined;
    canStopDrinking?: 'yes' | 'no' | undefined;
    preTestQ1?: string; 
    preTestQ2?: string; 
    signatureUrl?: string; 
    ndpScreening?: {
        q1?: number; 
        q2?: 'yes' | 'no';
        q3?: string; 
        q4?: 'yes' | 'no' | 'not sure';
        q5?: 'yes' | 'no' | 'not sure';
        mast_q6_30?: { [questionNumber: number]: 'yes' | 'no' };
    };
}

export interface PaymentRecord {
    id: string;
    date: string;
    description: string;
    amount: number;
    status: 'Paid' | 'Refunded' | 'Pending';
    expedited?: boolean;
    billedToName?: string;
    couponCode?: string;
}

export interface CertificateInfo {
    id: string;
    issuanceDate: string;
    status: 'Issued' | 'Pending';
    certificatePdfUrl?: string;
    lastName?: string;
    firstName?: string;
    address?: string;
    cityStateZip?: string;
    driversLicense?: string;
    caseNumber?: string;
    dob?: string;
    countyOfConviction?: string;
    instructorName?: string;
    probationOfficerName?: string;
    probationOfficerEmail?: string;
    lawyerName?: string;
    lawyerEmail?: string;
    lawFirmName?: string;
}

export interface NdpScoreInfo {
    score: number;
    category: string;
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    timestamp: string; 
    read: boolean;
}

export interface AttendanceRecord {
    id: string;
    date: string; 
    status: 'Present' | 'Late' | 'Absent';
    selfieUrl?: string;
}

export interface RemovalRecord {
    id: string;
    date: string;
    reason: string;
    details: string;
    adminName: string;
}

export interface MakeupSessionInfo {
    required: boolean;
    missedModuleId?: string; 
    fee?: number;
    scheduledDate?: string;
    scheduledTime?: string;
    completed: boolean;
    completionDate?: string;
}

export interface Student {
    id: number;
    name: string;
    email?: string;
    phoneNumber?: string;
    uniqueClassCode: string;
    cohort: string;
    company: 'West' | 'North' | 'South' | 'Southeast';
    status: 'In Progress' | 'On Watch' | 'Withdrawn' | 'Completed' | 'Reschedule Required' | 'Inactive' | 'Makeup Required';
    preferredLanguage: Language; 
    registrationDate: string;
    referralSource: 'Travis County Court' | 'Williamson County Probation' | 'Self-Registered' | 'Other';
    photoIdUrl?: string;
    voiceVerificationUrl?: string; 
    audioCheckTimestamp?: string; 
    attendance: {
        percentage: string;
        loginTime: string;
        lastActivity: string;
    };
    absences: number; 
    makeupSession?: MakeupSessionInfo; 
    attendanceRecords?: AttendanceRecord[];
    preTestScore: string;
    postTestScore: string;
    ndpScore?: NdpScoreInfo;
    notifications?: Notification[];
    breakoutHistory: BreakoutSession[];
    chatHistory: ChatLogEntry[];
    pollAnswers: PollAnswer[];
    quizResults: QuizResult[];
    paperworkData?: PaperworkData;
    paymentHistory: PaymentRecord[];
    certificateInfo?: CertificateInfo;
    removalHistory?: RemovalRecord[];
}

export interface AnswerOption {
    id: string;
    text: string;
}

export interface Question {
    id: string;
    text: string;
    options: AnswerOption[];
    correctOptionId: string;
    explanation?: string;
}

export interface TimelineItem {
    id: string;
    type: 'ai-script' | 'content' | 'quiz' | 'poll' | 'breakout' | 'break' | 'google-form';
    title: string;
    description: string;
    duration?: number;
    questions?: Question[];
    passingScore?: number;
    timeLimit?: number; 
    fileName?: string;
    videoFileName?: string;
    googleFormUrl?: string;
}

export interface Module {
    id: string;
    name: string;
    items: TimelineItem[];
}

export interface PreTestQuestionOption {
    id: 'a' | 'b' | 'c';
    text: string;
}

export interface PreTestQuestion {
    id: 'preTestQ1' | 'preTestQ2';
    text: string;
    options: PreTestQuestionOption[];
}

export interface ScreeningQuestion {
    id: 'isSomeoneConcerned' | 'canStopDrinking';
    text: string;
}

export interface FormConfiguration {
    personalData: {
        bacLabel: string;
    };
    screeningQuestions: ScreeningQuestion[];
    preTestQuestions: PreTestQuestion[];
}

export interface RagQuestion {
    question: string;
    context: string;
}

export interface CourseResource {
    id: string;
    title: string;
    type: 'video' | 'presentation' | 'document' | 'link';
    url: string;
}

export interface ResourceLink {
    label: string;
    url?: string;
    phone?: string;
    address?: string;
}

export interface ResourceCard {
    id: string;
    icon: 'check' | 'list' | 'phone' | 'shield' | 'gavel' | 'activity' | 'globe';
    title: string;
    description: string;
    links: ResourceLink[];
}

export interface ResourcesContent {
    title: string;
    subtitle: string;
    cards: ResourceCard[];
}

export interface DeactivationPolicy {
    maxMinutesLate: number;
    maxWarnings: number;
    maxAbsences: number;
    makeupSessionFee?: number;
    duplicateCertificateFee?: number;
}

export interface AddOn {
    id: string;
    name: string;
    description: string;
    price: number;
    isActive: boolean;
}

export interface Course {
    id: string;
    name: string;
    description: string;
    price: number;
    instructorType: InstructorType;
    instructorName?: string;
    modules: Module[];
    formConfiguration: FormConfiguration;
    ragQuestions?: RagQuestion[];
    resources?: CourseResource[];
    deactivationPolicy?: DeactivationPolicy;
    workbookUrl?: string; 
    workbookFileName?: string; 
}

export interface TelzioRecording {
    id: string;
    call_id: string;
    direction: 'inbound' | 'outbound';
    from: string;
    to: string;
    duration: number; 
    created_at: string;
    uri: string; 
    status: string;
    internal_notes?: string;
    tags?: string[];
    is_missed?: boolean;
    reconciled?: boolean;
}
