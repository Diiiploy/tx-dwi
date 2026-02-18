import React, { useState, useCallback, useEffect } from 'react';
import { View, ChatLogEntry, LiveSession, InstructorType, Course, Module, Student, QuizResult, PaperworkData, FormConfiguration, RagQuestion, User, UserRole, ScheduledClass, Instructor, NdpScoreInfo, Notification, Language, CourseResource, PaymentRecord, Coupon, RemovalRecord, WebsiteContent, TimelineItem } from './types';
import RoleSelector from './components/RoleSelector';
import StudentLogin from './components/StudentLogin';
import StudentClassroom from './components/StudentClassroom';
import AdminDashboard from './components/AdminDashboard';
import StudentRegistration from './components/StudentRegistration';
import AdminLogin from './components/AdminLogin';
import InstructorLogin from './components/InstructorLogin';
import { calculateNdpScore } from './utils/ndpScoring';
import Website from './components/website/Website';

const initialUsers: User[] = [
    { 
        id: 1, 
        name: 'Main Admin', 
        email: 'admin@example.com', 
        role: UserRole.Admin,
        permissions: ['curriculum', 'schedule', 'monitor', 'students', 'instructors', 'inbox'],
        notifications: [
            { id: 'admin-notif-1', title: 'New Registration', message: 'Jane Doe has registered for the DWI Intervention Program.', timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), read: false },
            { id: 'admin-notif-2', title: 'Student Alert', message: 'David Lee (Cohort A) has been flagged as "On Watch".', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), read: false },
            { id: 'admin-notif-3', title: 'Course Completed', message: 'Maria Garcia has successfully completed the Texas DWI Education Program.', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), read: true },
        ] 
    },
    {
        id: 2,
        name: 'Sarah Jones',
        email: 'sarah.j@school.com',
        role: UserRole.Assistant,
        permissions: ['schedule', 'monitor', 'students', 'inbox']
    }
];

const initialInstructors: Instructor[] = [
    { 
        id: 1, 
        name: 'John Davis', 
        email: 'john.davis@dwiedu.com',
        phoneNumber: '(512) 555-9001',
        assignedCourseIds: ['course-dwi-edu'],
        evaluations: [
            { id: 'eval-1', studentName: 'Alex Johnson', courseName: 'Texas DWI Education Program', rating: 5, comment: 'John was very professional and made the laws easy to understand.', date: '2024-07-20T14:00:00Z' },
            { id: 'eval-2', studentName: 'David Lee', courseName: 'Texas DWI Education Program', rating: 4, comment: 'Great instructor, very knowledgeable.', date: '2024-07-15T10:00:00Z' }
        ]
    },
    { 
        id: 2, 
        name: 'Maria Rodriguez', 
        email: 'm.rodriguez@aepm-texas.org',
        phoneNumber: '(512) 555-9002',
        assignedCourseIds: ['course-aepm'],
        evaluations: [
            { id: 'eval-3', studentName: 'April May', courseName: 'AEPM', rating: 5, comment: 'Excellent presentation skills. Maria kept everyone engaged.', date: '2024-07-22T16:00:00Z' }
        ]
    },
    { 
        id: 3, 
        name: 'Robert Smith', 
        email: 'robert.smith@dwicentral.com',
        phoneNumber: '(512) 555-9003',
        assignedCourseIds: ['course-dwi-int'],
        evaluations: [
            { id: 'eval-4', studentName: 'Jada Smith', courseName: 'DWI Intervention Program', rating: 3, comment: 'The material was a bit dry but Robert did his best.', date: '2024-07-10T12:00:00Z' }
        ]
    },
];

const initialScheduledClasses: ScheduledClass[] = [
  { id: 'sc-past-1', courseId: 'course-dwi-edu', moduleId: 'dwi-mod-1', date: '2024-07-29', time: '09:00', instructorType: InstructorType.Human, instructorId: 1 },
  { id: 'sc-today-1', courseId: 'course-dwi-edu', moduleId: 'dwi-mod-2', date: new Date().toISOString().split('T')[0], time: '09:00', instructorType: InstructorType.Human, instructorId: 1 },
  { id: 'sc-aepm-ai-today', courseId: 'course-aepm', moduleId: 'aepm-mod-1', date: new Date().toISOString().split('T')[0], time: '11:00', instructorType: InstructorType.AI },
  { id: 'sc-dwi-int-final-today', courseId: 'course-dwi-int', moduleId: 'dwi-int-mod-15', date: new Date().toISOString().split('T')[0], time: '14:00', instructorType: InstructorType.Human, instructorId: 3 },
  { id: 'sc-dwi-edu-final-mock', courseId: 'course-dwi-edu', moduleId: 'dwi-mod-3', date: '2024-08-30', time: '09:00', instructorType: InstructorType.Human, instructorId: 1 },
  { id: 'sc-dwi-edu-1', courseId: 'course-dwi-edu', moduleId: 'dwi-mod-1', date: '2024-08-05', time: '09:00', instructorType: InstructorType.Human, instructorId: 1 },
  { id: 'sc-dwi-edu-2', courseId: 'course-dwi-edu', moduleId: 'dwi-mod-2', date: '2024-08-06', time: '09:00', instructorType: InstructorType.Human, instructorId: 1 },
  { id: 'sc-dwi-edu-3', courseId: 'course-dwi-edu', moduleId: 'dwi-mod-3', date: '2024-08-07', time: '09:00', instructorType: InstructorType.Human, instructorId: 1 },
  { id: 'sc-ai-1', courseId: 'course-dwi-edu', moduleId: 'dwi-mod-3', date: '2024-08-10', time: '14:00', instructorType: InstructorType.AI },
  { id: 'sc-aepm-1', courseId: 'course-aepm', moduleId: 'aepm-mod-1', date: '2024-08-12', time: '13:00', instructorType: InstructorType.Human, instructorId: 2 },
  { id: 'sc-aepm-2', courseId: 'course-aepm', moduleId: 'aepm-mod-2', date: '2024-08-13', time: '13:00', instructorType: InstructorType.Human, instructorId: 2 },
  { id: 'sc-dwi-int-1', courseId: 'course-dwi-int', moduleId: 'dwi-int-mod-1', date: '2024-08-19', time: '18:00', instructorType: InstructorType.Human, instructorId: 3 },
  { id: 'sc-dwi-int-2', courseId: 'course-dwi-int', moduleId: 'dwi-int-mod-2', date: '2024-08-20', time: '18:00', instructorType: InstructorType.Human, instructorId: 3 },
];

const initialCoupons: Coupon[] = [
    { code: 'SAVE10', discountAmount: 10 },
    { code: 'WELCOME20', discountAmount: 20 },
    { code: 'FIFTYOFF', discountAmount: 50 },
];

const defaultWebsiteContent: WebsiteContent = {
    branding: {
        primaryColor: '#1d4ed8', // Default blue-700
        logoUrl: 'https://lh3.googleusercontent.com/d/1bRJC1lQAOJDUeCA5XB6FnlgSPCzA5km3'
    },
    home: {
        heroTitle: 'State-Certified DWI Education Programs',
        heroSubtitle: 'Fulfilling court-mandated requirements with professional, accessible, and effective online courses.',
        heroMediaType: 'image',
        heroMediaUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=2070'
    },
    about: {
        title: 'About DWI Education of Central Texas',
        content: 'At DWI Education of Central Texas, we understand that facing a DWI charge can be a stressful and confusing experience. Our mission is to provide accessible, high-quality, and state-certified educational programs that not only meet legal requirements but also empower individuals to make safer choices in the future.',
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=2070'
    },
    contact: {
        address: '123 Main Street, Austin, TX 78701',
        phone: '(512) 555-1234',
        email: 'contact@dwicentraltx.com',
        imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2069'
    },
    registration: {
        title: 'Select a Course',
        subtitle: 'Choose the program you wish to enroll in.'
    },
    terms: {
        title: 'Terms and Conditions',
        content: 'Welcome to DWI Education of Central Texas. By accessing our website and enrolling in our courses, you agree to comply with and be bound by the following terms and conditions of use.\n\n1. Registration and Enrollment: You agree to provide accurate and complete information during registration.\n\n2. Attendance: Full attendance is required for all sessions to receive a certificate of completion.\n\n3. Refunds: Refunds are available up to 24 hours before the first scheduled class session.\n\n4. Conduct: Respectful behavior is required at all times. Disruptive behavior may result in removal from the course.',
    },
    privacy: {
        title: 'Privacy Policy',
        content: 'Your privacy is important to us. It is DWI Education of Central Texas policy to respect your privacy regarding any information we may collect from you across our website.\n\nWe only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent.\n\nWe do not share any personally identifying information publicly or with third-parties, except when required to by law.',
    },
    reviews: [
        {
            id: '1',
            name: 'Sarah M.',
            rating: 5,
            text: 'The course was incredibly easy to navigate. I was able to complete my requirements from home without any issues. Highly recommended!',
            date: '2 weeks ago'
        },
        {
            id: '2',
            name: 'James D.',
            rating: 5,
            text: 'I was worried about the online format, but the instructor was engaging and the material was actually interesting. A great experience given the circumstances.',
            date: '1 month ago'
        },
        {
            id: '3',
            name: 'Emily R.',
            rating: 4,
            text: 'Very professional and discreet. The support team helped me get my certificate to my probation officer immediately after finishing.',
            date: '2 months ago'
        }
    ],
    communication: {
        welcomeEmail: {
            subject: 'Welcome to your course at DWI Education of Central Texas',
            body: 'Dear {name},\n\nWelcome to the {courseName}. Your unique class code is: {classCode}.\n\nPlease login at our student portal to begin your pre-course paperwork.\n\nBest,\nDWI Education Team'
        },
        completionEmail: {
            subject: 'Course Completion Certificate - Action Required',
            body: 'Dear {name},\n\nCongratulations on completing the {courseName}. Your certificate is now available in your student portal.\n\nPlease log in to download it.\n\nBest,\nDWI Education Team'
        },
        smsReminder: {
            message: 'Reminder: Your class for {courseName} is scheduled to start in 15 minutes. Please log in promptly.'
        }
    },
    // FIX: Added default resources data to WebsiteContent to resolve type errors.
    resources: {
        title: 'Texas DWI Resources',
        subtitle: 'Essential links and contacts to assist with your court-mandated requirements and personal recovery journey.',
        cards: [
            {
                id: 'legal',
                icon: 'gavel',
                title: 'Legal & Court Information',
                description: 'Official resources for court appearances, probation requirements, and legal assistance in Central Texas.',
                links: [
                    { label: 'Travis County Court Records', url: 'https://www.traviscountytx.gov/courts/records' },
                    { label: 'Williamson County Probation', url: 'https://www.wilco.org/probation' },
                    { label: 'Texas Department of Public Safety (DPS)', url: 'https://www.dps.texas.gov/' }
                ]
            },
            {
                id: 'recovery',
                icon: 'activity',
                title: 'Recovery & Support Groups',
                description: 'Community-based support systems providing peer encouragement and tools for maintaining a sober lifestyle.',
                links: [
                    { label: 'Alcoholics Anonymous (AA) Austin', url: 'https://austinaa.org/' },
                    { label: 'Narcotics Anonymous (NA) Hill Country', url: 'https://hillcountryna.org/' },
                    { label: 'SAMHSA National Helpline', phone: '1-800-662-HELP (4357)' }
                ]
            },
            {
                id: 'compliance',
                icon: 'shield',
                title: 'State Compliance',
                description: 'Regulatory information regarding DWI education standards and certificate requirements in Texas.',
                links: [
                    { label: 'Mothers Against Drunk Driving (MADD)', url: 'https://www.madd.org/' },
                    { label: 'Texas Department of Licensing and Regulation (TDLR)', url: 'https://www.tdlr.texas.gov/' }
                ]
            }
        ]
    }
};


const initialStudents: Student[] = [
    {
        id: 1, name: 'Alex Johnson', uniqueClassCode: 'A83K-9B1P', cohort: 'A', company: 'North', status: 'In Progress',
        email: 'alex.j@example.com', phoneNumber: '555-123-4567', preferredLanguage: 'en',
        registrationDate: '2024-07-15T10:00:00Z', referralSource: 'Travis County Court',
        photoIdUrl: 'https://lh3.googleusercontent.com/d/18nwbHEibQ2lYPKljldEjyA06pRUyWVAi',
        // Adding a mock voice verification URL for demonstration
        voiceVerificationUrl: 'https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav', 
        audioCheckTimestamp: '2024-07-29T08:55:12Z',
        attendance: { percentage: '98%', loginTime: '2024-07-29T09:01:12Z', lastActivity: '2024-07-29T11:45:30Z' },
        absences: 0,
        attendanceRecords: [
            { id: 'att-1', date: '2024-07-29T09:01:12Z', status: 'Present', selfieUrl: 'https://placehold.co/300x200/22c55e/ffffff?text=Alex+Selfie+Jul29' },
            { id: 'att-2', date: '2024-07-22T09:05:00Z', status: 'Late', selfieUrl: 'https://placehold.co/300x200/eab308/ffffff?text=Alex+Selfie+Jul22' },
            { id: 'att-3', date: '2024-07-15T08:58:30Z', status: 'Present', selfieUrl: 'https://placehold.co/300x200/22c55e/ffffff?text=Alex+Selfie+Jul15' },
        ],
        preTestScore: '88%', postTestScore: '94%',
        notifications: [
            { id: 'notif-1', title: 'Welcome!', message: 'Your registration is complete. Your first class is scheduled soon.', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), read: true },
            { id: 'notif-2', title: 'New Announcement', message: 'Please remember to complete your pre-course paperwork before your first session.', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), read: false },
        ],
        breakoutHistory: [
            { 
                sessionId: 101, 
                timestamp: '2024-07-26T10:15:00Z', 
                endTime: '2024-07-26T10:45:00Z',
                participants: ['Jane Doe', 'David Lee'],
                summary: 'The group discussed the physiological effects of alcohol on long-term health. Alex contributed significant insight regarding liver metabolism.',
                aiReport: 'Session Analysis: HIGH ENGAGEMENT. Student demonstrated strong grasp of Module 2 concepts. Collaboration with peers was constructive and task-oriented.'
            },
            { 
                sessionId: 105, 
                timestamp: '2024-07-27T11:00:00Z', 
                endTime: '2024-07-27T11:30:00Z',
                participants: ['Jane Doe', 'Sarah Miller'],
                summary: 'Discussion centered around Texas Intoxication definitions and Blood Alcohol Content legal limits.',
                aiReport: 'Session Analysis: ON TRACK. Student successfully identified key legal thresholds for first-offense DWI in Texas.'
            },
            { 
                sessionId: 106, 
                timestamp: '2024-07-28T09:45:00Z', 
                endTime: '2024-07-28T10:15:00Z',
                participants: ['Jane Doe'],
                summary: 'Peer review of Module 3 case studies regarding judicial discretion.',
                aiReport: 'Session Analysis: SATISFACTORY. Alex identified correctly the administrative license revocation process.'
            }
        ],
        chatHistory: [
            { user: 'Alex Johnson', question: 'Can you re-explain that last concept?', answer: 'Certainly. The concept is "variable scope", which means where a variable can be accessed or modified in your code.'},
            { user: 'Alex Johnson', question: 'When is our next break?', answer: 'Our next automated break is scheduled in 22 minutes, at 10:30 AM.'},
        ],
        pollAnswers: [
            { pollId: 1, question: 'What is your confidence level with Python functions?', answer: 'Moderately Confident' }
        ],
        quizResults: [],
        paperworkData: {
            lastName: 'Johnson',
            firstName: 'Alex',
            dob: '1990-05-15',
            bac: '0.12',
            isSomeoneConcerned: 'yes',
            canStopDrinking: 'no',
            preTestQ1: 'b',
            preTestQ2: 'a',
            address: '456 Oak Avenue, Springfield, IL 62704',
            emergencyContactName: 'Sarah Johnson',
            emergencyContactPhone: '555-987-6543',
            ndpScreening: { // Evident Problem example
                q1: 3,
                q5: 'yes',
                mast_q6_30: { 7: 'yes', 8: 'yes', 10: 'yes', 12: 'yes', 14: 'yes', 15: 'yes', 16: 'yes' }
            }
        },
        paymentHistory: [
            { id: 'pay_1', date: '2024-07-15T10:05:00Z', description: 'Texas DWI Education Program - Course Fee', amount: 100.00, status: 'Paid', expedited: true, billedToName: 'Alex Johnson' }
        ],
        removalHistory: [],
    },
    {
        id: 2, name: 'Jada Smith', uniqueClassCode: '7GCA-XR6L', cohort: 'B', company: 'West', status: 'In Progress',
        email: 'jada.smith@example.com', phoneNumber: '555-234-5678', preferredLanguage: 'en',
        registrationDate: '2024-06-02T11:30:00Z', referralSource: 'Self-Registered',
        attendance: { percentage: '100%', loginTime: '2024-07-29T09:00:15Z', lastActivity: '2024-07-29T11:55:00Z' },
        absences: 0,
        attendanceRecords: [
            { id: 'att-jada-1', date: '2024-07-29T09:00:15Z', status: 'Present', selfieUrl: 'https://placehold.co/300x200/22c55e/ffffff?text=Jada+Selfie+Jul29' },
        ],
        preTestScore: '91%', postTestScore: '97%',
        breakoutHistory: [], chatHistory: [], pollAnswers: [], quizResults: [],
        paymentHistory: [
            { id: 'pay_2', date: '2024-06-02T11:35:00Z', description: 'DWI Intervention Program - Course Fee', amount: 450.00, status: 'Paid', expedited: false, billedToName: 'Jada Smith' }
        ],
        removalHistory: [],
    },
    {
        id: 3, name: 'David Lee', uniqueClassCode: 'L9S2-P4QW', cohort: 'A', company: 'North', status: 'On Watch',
        email: 'david.lee@example.com', phoneNumber: '555-345-6789', preferredLanguage: 'en',
        registrationDate: '2024-07-05T09:00:00Z', referralSource: 'Williamson County Probation',
        attendance: { percentage: '92%', loginTime: '2024-07-29T09:05:01Z', lastActivity: '2024-07-29T11:20:00Z' },
        absences: 0,
        attendanceRecords: [
            { id: 'att-david-1', date: '2024-07-29T09:05:01Z', status: 'Late', selfieUrl: 'https://placehold.co/300x200/22c55e/ffffff?text=David+Selfie+Jul29' },
            { id: 'att-david-2', date: '2024-07-22T09:00:00Z', status: 'Present', selfieUrl: 'https://placehold.co/300x200/22c55e/ffffff?text=David+Selfie+Jul22' },
        ],
        preTestScore: '78%', postTestScore: '85%',
        breakoutHistory: [], chatHistory: [], pollAnswers: [], quizResults: [],
        paperworkData: {
             ndpScreening: { // Potential Problem example
                q1: 1,
                q2: 'yes',
                q3: 'ALONE',
                q4: 'not sure',
                mast_q6_30: { 7: 'yes', 8: 'yes', 10: 'yes', 12: 'yes' }
            }
        },
        paymentHistory: [
            { id: 'pay_3', date: '2024-07-05T09:05:00Z', description: 'Texas DWI Education Program - Course Fee', amount: 75.00, status: 'Paid', billedToName: 'David Lee' }
        ],
        removalHistory: [],
    },
     {
        id: 4, name: 'Jane Doe', uniqueClassCode: 'M3N4-B5V6', cohort: 'B', company: 'South', status: 'Withdrawn',
        email: 'jane.d@example.com', phoneNumber: '555-456-7890', preferredLanguage: 'en',
        registrationDate: '2024-05-20T14:00:00Z', referralSource: 'Other',
        attendance: { percentage: '35%', loginTime: '2024-07-29T09:02:30Z', lastActivity: '2024-07-29T11:48:00Z' },
        absences: 0,
        preTestScore: '85%', postTestScore: 'N/A',
        breakoutHistory: [], chatHistory: [], pollAnswers: [], quizResults: [],
        paymentHistory: [
             { id: 'pay_4', date: '2024-05-20T14:05:00Z', description: 'DWI Intervention Program - Course Fee', amount: 450.00, status: 'Paid', billedToName: 'Jane Doe' }
        ],
        removalHistory: [],
    },
    {
        id: 5,
        name: 'Maria Garcia',
        uniqueClassCode: 'C0MP-L3T3',
        cohort: 'A',
        company: 'Southeast',
        status: 'Completed',
        email: 'maria.g@example.com', phoneNumber: '555-567-8901', preferredLanguage: 'es',
        registrationDate: '2024-05-01T09:00:00Z',
        referralSource: 'Self-Registered',
        attendance: { percentage: '100%', loginTime: '2024-06-01T09:00:00Z', lastActivity: '2024-06-15T11:59:00Z' },
        absences: 0,
        attendanceRecords: [
            { id: 'att-maria-1', date: '2024-06-01T09:00:00Z', status: 'Present', selfieUrl: 'https://placehold.co/300x200/22c55e/ffffff?text=Maria+Selfie+1' },
            { id: 'att-maria-2', date: '2024-06-08T09:00:00Z', status: 'Present', selfieUrl: 'https://placehold.co/300x200/22c55e/ffffff?text=Maria+Selfie+2' },
            { id: 'att-maria-3', date: '2024-06-15T09:00:00Z', status: 'Present', selfieUrl: 'https://placehold.co/300x200/22c55e/ffffff?text=Maria+Selfie+3' },
        ],
        preTestScore: '90%',
        postTestScore: '98%',
        breakoutHistory: [],
        chatHistory: [],
        pollAnswers: [],
        quizResults: [
             {
                quizId: 'item-1627882800000',
                title: 'Module 1: DWI Knowledge Check',
                score: '100%',
                studentAnswers: [
                    { questionId: 'q1', selectedOptionId: 'q1-o2', isCorrect: true },
                    { questionId: 'q2', selectedOptionId: 'q2-o3', isCorrect: true },
                ],
            }
        ],
        paperworkData: {
            lastName: 'Garcia',
            firstName: 'Maria',
            dob: '1988-11-20',
            bac: '0.09',
            isSomeoneConcerned: 'no',
            canStopDrinking: 'yes',
            preTestQ1: 'b',
            preTestQ2: 'a',
            address: '789 Pine Street, Austin, TX 78701',
            emergencyContactName: 'Carlos Garcia',
            emergencyContactPhone: '555-111-2222',
            ndpScreening: { // No Problem example
                q1: 0,
                q2: 'no',
                mast_q6_30: { 7: 'yes', 8: 'yes' }
            }
        },
        paymentHistory: [
            { id: 'pay_5', date: '2024-05-01T09:05:00Z', description: 'Texas DWI Education Program - Course Fee', amount: 100.00, status: 'Paid', expedited: true, billedToName: 'Maria Garcia' }
        ],
        certificateInfo: {
            id: 'CERT-2024-06-15-MG',
            issuanceDate: '2024-06-15T12:00:00Z',
            status: 'Issued',
            certificatePdfUrl: 'data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50 IDE+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2UvTWVkaWFCb3hbMCAwIDU5NSA4NDJdL1Jlc291cmNlczw8L0ZvbnQ8PC9GMSA0IDAgUj4+Pj4vQ29udGVudHMgNSAwIFIvUGFyZW50IDIgMCBSPj4KZW5kb2JqCjQgMCBvYmoKPDwvVHlwZS9Gb250L1N1YnR5cGUvVHlwZTEvQmFzZUZvbnQvSGVsdmV0aWNhPj4KZW5kb2JqCjUgMCBvYmoKPDwvTGVuZ3RoIDc2Pj4Kc3RyZWFtCkJUCi9GMSAyNCBUZgoyMDAgNzAwIFRkCihNb2MockIENlcnRpZmljYXRlIFBERikgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTUgMDAwMDAgbiAKMDAwMDAwMDA2MyAwMDAwMCBuIAowMDAwMDAwMTEzIDAwMDAwIG4gCjAwMDAwMDAyMzAgMDAwMDAgbiAKMDAwMDAwMDI4MyAwMDAwMCBuIAp0cmFpbGVyCjw8L1NpemUgNi9Sb290IDEgMCBSPj4Kc3RhcnR4cmVmCjM4NAolJUVPRgo=',
            lastName: 'Garcia',
            firstName: 'Maria',
            address: '789 Pine Street, Apt 2B',
            cityStateZip: 'Austin, TX 78701',
            driversLicense: 'TX-123456789',
            caseNumber: 'C-01-CR-23-123456',
            dob: '1988-11-20',
            countyOfConviction: 'Travis County',
            instructorName: 'John Davis',
            probationOfficerName: 'Emily White',
            probationOfficerEmail: 'ewhite@traviscounty.gov',
            lawyerName: 'Robert Vance',
            lawyerEmail: 'rvance@vancelaw.com',
            lawFirmName: 'Vance & Associates Law Firm',
        },
        removalHistory: [],
    },
    {
        id: 6,
        name: 'Carlos Ray',
        uniqueClassCode: 'L8TE-NTRY',
        cohort: 'B',
        company: 'West',
        status: 'Reschedule Required',
        preferredLanguage: 'en',
        registrationDate: '2024-07-10T12:00:00Z',
        referralSource: 'Travis County Court',
        photoIdUrl: 'https://placehold.co/300x180/EFEFEF/333333?text=Photo+ID',
        attendance: {
            percentage: '0%',
            loginTime: '2024-07-29T09:45:10Z', // Logged in 45 mins late
            lastActivity: '2024-07-29T09:45:10Z'
        },
        absences: 0,
        preTestScore: 'N/A',
        postTestScore: 'N/A',
        breakoutHistory: [],
        chatHistory: [],
        pollAnswers: [],
        quizResults: [],
        paperworkData: {
            lastName: 'Ray',
            firstName: 'Carlos',
            dob: '1995-02-22',
            bac: '0.10',
        },
        paymentHistory: [
            { id: 'pay_6', date: '2024-07-10T12:05:00Z', description: 'DWI Intervention Program - Course Fee', amount: 450.00, status: 'Paid', billedToName: 'Carlos Ray' }
        ],
        removalHistory: [],
    },
    {
        id: 7,
        name: 'Leo Rivera',
        uniqueClassCode: '1N4C-T1V3',
        cohort: 'A',
        company: 'South',
        status: 'Inactive',
        preferredLanguage: 'en',
        registrationDate: '2024-07-01T14:00:00Z',
        referralSource: 'Self-Registered',
        attendance: { percentage: '50%', loginTime: '2024-07-15T09:03:00Z', lastActivity: '2024-07-22T10:30:00Z' },
        absences: 0,
        preTestScore: '85%',
        postTestScore: 'N/A',
        breakoutHistory: [],
        chatHistory: [],
        pollAnswers: [],
        quizResults: [],
        paymentHistory: [
            { id: 'pay_7', date: '2024-07-01T14:05:00Z', description: 'Texas DWI Education Program - Course Fee', amount: 75.00, status: 'Pending', billedToName: 'Leo Rivera' }
        ],
        removalHistory: [],
    },
    {
        id: 8,
        name: 'Olivia Chen',
        uniqueClassCode: 'BRK0-UTRM',
        cohort: 'A',
        company: 'Southeast',
        status: 'In Progress',
        preferredLanguage: 'en',
        registrationDate: '2024-07-18T11:00:00Z',
        referralSource: 'Self-Registered',
        attendance: { percentage: '100%', loginTime: '2024-07-29T08:59:50Z', lastActivity: '2024-07-29T11:58:00Z' },
        absences: 0,
        attendanceRecords: [
            { id: 'att-olivia-1', date: '2024-07-29T08:59:50Z', status: 'Present', selfieUrl: 'https://placehold.co/300x200/22c55e/ffffff?text=Olivia+Selfie' },
        ],
        preTestScore: '92%',
        postTestScore: 'N/A',
        breakoutHistory: [
             { sessionId: 101, timestamp: '2024-07-26T10:15:00Z', participants: ['Alex Johnson'] }
        ],
        chatHistory: [],
        pollAnswers: [],
        quizResults: [],
        paymentHistory: [
            { id: 'pay_8', date: '2024-07-18T11:05:00Z', description: 'Texas DWI Education Program - Course Fee', amount: 75.00, status: 'Paid', billedToName: 'Olivia Chen' }
        ],
        removalHistory: [],
    },
    {
        id: 9,
        name: 'Ben Carter',
        uniqueClassCode: 'BRK1-R0OM',
        cohort: 'A',
        company: 'West',
        status: 'In Progress',
        preferredLanguage: 'en',
        registrationDate: '2024-07-19T10:00:00Z',
        referralSource: 'Self-Registered',
        attendance: { percentage: '100%', loginTime: '2024-07-29T08:59:00Z', lastActivity: '2024-07-29T11:59:00Z' },
        absences: 0,
        preTestScore: '89%',
        postTestScore: 'N/A',
        breakoutHistory: [],
        chatHistory: [],
        pollAnswers: [],
        quizResults: [],
        paymentHistory: [
            { id: 'pay_9', date: '2024-07-19T10:05:00Z', description: 'Texas DWI Education Program - Course Fee', amount: 75.00, status: 'Paid', billedToName: 'Ben Carter' }
        ],
        removalHistory: [],
    },
    {
        id: 10,
        name: 'Chloe Davis',
        uniqueClassCode: 'BRK2-R0OM',
        cohort: 'A',
        company: 'South',
        status: 'In Progress',
        preferredLanguage: 'en',
        registrationDate: '2024-07-20T13:00:00Z',
        referralSource: 'Travis County Court',
        attendance: { percentage: '100%', loginTime: '2024-07-29T09:00:30Z', lastActivity: '2024-07-29T11:57:00Z' },
        absences: 0,
        preTestScore: '94%',
        postTestScore: 'N/A',
        breakoutHistory: [],
        chatHistory: [],
        pollAnswers: [],
        quizResults: [],
        paymentHistory: [
            { id: 'pay_10', date: '2024-07-20T13:05:00Z', description: 'Texas DWI Education Program - Course Fee', amount: 75.00, status: 'Paid', billedToName: 'Chloe Davis' }
        ],
        removalHistory: [],
    },
    {
        id: 11,
        name: 'Sophia Miller',
        uniqueClassCode: 'R3FU-NDT3',
        cohort: 'A',
        company: 'North',
        status: 'In Progress',
        preferredLanguage: 'en',
        registrationDate: '2024-07-21T09:00:00Z',
        referralSource: 'Self-Registered',
        attendance: { percentage: '100%', loginTime: '2024-07-29T09:01:00Z', lastActivity: '2024-07-29T11:50:00Z' },
        absences: 0,
        preTestScore: '95%',
        postTestScore: 'N/A',
        breakoutHistory: [],
        chatHistory: [],
        pollAnswers: [],
        quizResults: [],
        paymentHistory: [
            { id: 'pay_11', date: '2024-07-21T09:05:00Z', description: 'Texas DWI Education Program - Course Fee', amount: 75.00, status: 'Paid', billedToName: 'Sophia Miller' }
        ],
        removalHistory: [],
    },
    {
        id: 12,
        name: 'Samantha Jones',
        uniqueClassCode: 'MULTI-CRSE1',
        cohort: 'A', // Texas DWI Education Program
        company: 'Southeast',
        status: 'In Progress',
        email: 'samantha.j@example.com',
        phoneNumber: '555-987-1234', preferredLanguage: 'en',
        registrationDate: '2024-07-22T10:00:00Z',
        referralSource: 'Self-Registered',
        attendance: { percentage: '100%', loginTime: '2024-07-29T09:00:00Z', lastActivity: '2024-07-29T11:59:00Z' },
        absences: 0,
        preTestScore: '91%',
        postTestScore: 'N/A',
        breakoutHistory: [],
        chatHistory: [],
        pollAnswers: [],
        quizResults: [],
        paymentHistory: [
            { id: 'pay_12', date: '2024-07-22T10:05:00Z', description: 'Texas DWI Education Program - Course Fee', amount: 75.00, status: 'Paid', billedToName: 'Samantha Jones' }
        ],
        removalHistory: [],
    },
    {
        id: 13,
        name: 'Samantha Jones',
        uniqueClassCode: 'MULTI-CRSE2',
        cohort: 'B', // DWI Intervention Program
        company: 'Southeast',
        status: 'In Progress',
        email: 'samantha.j@example.com',
        phoneNumber: '555-987-1234', preferredLanguage: 'en',
        registrationDate: '2024-07-23T11:00:00Z',
        referralSource: 'Self-Registered',
        attendance: { percentage: '0%', loginTime: 'N/A', lastActivity: 'N/A' },
        absences: 0,
        preTestScore: 'N/A',
        postTestScore: 'N/A',
        breakoutHistory: [],
        chatHistory: [],
        pollAnswers: [],
        quizResults: [],
        paymentHistory: [
            { id: 'pay_13', date: '2024-07-23T11:05:00Z', description: 'DWI Intervention Program - Course Fee', amount: 450.00, status: 'Paid', billedToName: 'Samantha Jones' }
        ],
        removalHistory: [],
    },
    {
        id: 14,
        name: 'Breakout Student A',
        uniqueClassCode: 'BRK-TEST-A',
        cohort: 'C',
        company: 'West',
        status: 'In Progress',
        preferredLanguage: 'en',
        registrationDate: new Date().toISOString(),
        referralSource: 'Self-Registered',
        attendance: { percentage: '0%', loginTime: 'N/A', lastActivity: 'N/A' },
        absences: 0,
        preTestScore: 'N/A',
        postTestScore: 'N/A',
        breakoutHistory: [], chatHistory: [], pollAnswers: [], quizResults: [], paymentHistory: [], removalHistory: [],
    },
    {
        id: 15,
        name: 'Breakout Student B',
        uniqueClassCode: 'BRK-TEST-B',
        cohort: 'C',
        company: 'North',
        status: 'In Progress',
        preferredLanguage: 'en',
        registrationDate: new Date().toISOString(),
        referralSource: 'Self-Registered',
        attendance: { percentage: '0%', loginTime: 'N/A', lastActivity: 'N/A' },
        absences: 0,
        preTestScore: 'N/A',
        postTestScore: 'N/A',
        breakoutHistory: [], chatHistory: [], pollAnswers: [], quizResults: [], paymentHistory: [], removalHistory: [],
    },
    {
        id: 16,
        name: 'Breakout Student C',
        uniqueClassCode: 'BRK-TEST-C',
        cohort: 'C',
        company: 'South',
        status: 'In Progress',
        preferredLanguage: 'en',
        registrationDate: new Date().toISOString(),
        referralSource: 'Self-Registered',
        attendance: { percentage: '0%', loginTime: 'N/A', lastActivity: 'N/A' },
        absences: 0,
        preTestScore: 'N/A',
        postTestScore: 'N/A',
        breakoutHistory: [], chatHistory: [], pollAnswers: [], quizResults: [], paymentHistory: [], removalHistory: [],
    },
    {
        id: 17,
        name: 'April May',
        uniqueClassCode: 'AEPM-TEST',
        cohort: 'D',
        company: 'Southeast',
        status: 'In Progress',
        preferredLanguage: 'en',
        registrationDate: new Date().toISOString(),
        referralSource: 'Self-Registered',
        attendance: { percentage: '0%', loginTime: 'N/A', lastActivity: 'N/A' },
        absences: 0,
        preTestScore: 'N/A',
        postTestScore: 'N/A',
        breakoutHistory: [], chatHistory: [], pollAnswers: [], quizResults: [], paymentHistory: [], removalHistory: [],
    },
    {
        id: 18,
        name: 'Brian Smith',
        uniqueClassCode: 'AEPM-BRK2',
        cohort: 'D',
        company: 'West',
        status: 'In Progress',
        preferredLanguage: 'en',
        registrationDate: new Date().toISOString(),
        referralSource: 'Self-Registered',
        attendance: { percentage: '0%', loginTime: 'N/A', lastActivity: 'N/A' },
        absences: 0,
        preTestScore: 'N/A',
        postTestScore: 'N/A',
        breakoutHistory: [], chatHistory: [], pollAnswers: [], quizResults: [], paymentHistory: [], removalHistory: [],
    },
    {
        id: 19,
        name: 'Sara Complete',
        uniqueClassCode: 'P4PR-WRKD',
        cohort: 'A', // Texas DWI Education Program
        company: 'North',
        status: 'In Progress',
        email: 'sara.c@example.com',
        phoneNumber: '555-111-3333', preferredLanguage: 'en',
        registrationDate: '2024-07-25T10:00:00Z',
        referralSource: 'Self-Registered',
        photoIdUrl: 'https://placehold.co/300x180/EFEFEF/333333?text=Photo+ID',
        attendance: { percentage: '0%', loginTime: 'N/A', lastActivity: 'N/A' },
        absences: 0,
        preTestScore: 'N/A',
        postTestScore: 'N/A',
        breakoutHistory: [],
        chatHistory: [],
        pollAnswers: [],
        quizResults: [],
        paymentHistory: [
            { id: 'pay_19', date: '2024-07-25T10:05:00Z', description: 'Texas DWI Education Program - Course Fee', amount: 75.00, status: 'Paid', billedToName: 'Sara Complete' }
        ],
        paperworkData: { // Pre-filled paperwork
            lastName: 'Complete',
            firstName: 'Sara',
            dob: '1992-08-20',
            bac: '0.11',
            isSomeoneConcerned: 'yes',
            canStopDrinking: 'yes',
            preTestQ1: 'b',
            preTestQ2: 'a',
            address: '789 Completed St, Austin, TX',
            emergencyContactName: 'John Complete',
            emergencyContactPhone: '555-555-5555',
            ndpScreening: {
                q1: 1,
                q2: 'no',
                q3: 'FRIEND',
                q4: 'no',
                q5: 'yes',
                mast_q6_30: { 7: 'yes' }
            }
        },
        removalHistory: [],
    },
    {
        id: 20,
        name: 'Casey Fail',
        uniqueClassCode: 'FAIL-TEST',
        cohort: 'A',
        company: 'West',
        status: 'In Progress',
        preferredLanguage: 'en',
        registrationDate: '2024-07-29T10:00:00Z',
        referralSource: 'Self-Registered',
        attendance: { percentage: '0%', loginTime: 'N/A', lastActivity: 'N/A' },
        absences: 0,
        preTestScore: 'N/A',
        postTestScore: 'N/A',
        breakoutHistory: [], chatHistory: [], pollAnswers: [], quizResults: [], paymentHistory: [], removalHistory: [],
    },
    {
        id: 21,
        name: 'Tim Break',
        uniqueClassCode: 'BREAK-TEST',
        cohort: 'E',
        company: 'North',
        status: 'In Progress',
        preferredLanguage: 'en',
        registrationDate: new Date().toISOString(),
        referralSource: 'Self-Registered',
        attendance: { percentage: '0%', loginTime: 'N/A', lastActivity: 'N/A' },
        absences: 0,
        preTestScore: 'N/A',
        postTestScore: 'N/A',
        breakoutHistory: [], chatHistory: [], pollAnswers: [], quizResults: [], paymentHistory: [], removalHistory: [],
    },
    {
        id: 22,
        name: 'Makeup Mike',
        uniqueClassCode: 'MKUP-REQD',
        cohort: 'B', // DWI Intervention Program
        company: 'Southeast',
        status: 'Makeup Required',
        email: 'mike.m@example.com',
        phoneNumber: '555-333-4444', preferredLanguage: 'en',
        registrationDate: '2024-07-01T10:00:00Z', referralSource: 'Williamson County Probation',
        photoIdUrl: 'https://placehold.co/300x180/EFEFEF/333333?text=Photo+ID',
        attendance: { percentage: '80%', loginTime: 'N/A', lastActivity: 'N/A' },
        absences: 1, // Has missed one class
        makeupSession: {
            required: true,
            missedModuleId: 'dwi-int-mod-2',
            fee: 50.00,
            completed: true,
            completionDate: '2024-07-30T10:00:00Z'
        },
        preTestScore: 'N/A',
        postTestScore: 'N/A',
        breakoutHistory: [], chatHistory: [], pollAnswers: [], quizResults: [],
        paymentHistory: [
             { id: 'pay_22', date: '2024-07-01T10:05:00Z', description: 'DWI Intervention Program - Course Fee', amount: 450.00, status: 'Paid', billedToName: 'Makeup Mike' }
        ],
        removalHistory: [],
    },
    {
        id: 23,
        name: 'John Finished',
        uniqueClassCode: 'CERT-COPY',
        cohort: 'A',
        company: 'North',
        status: 'Completed',
        email: 'john.f@example.com', phoneNumber: '555-999-8888', preferredLanguage: 'en',
        registrationDate: '2024-04-01T09:00:00Z',
        referralSource: 'Self-Registered',
        attendance: { percentage: '100%', loginTime: '2024-05-01T09:00:00Z', lastActivity: '2024-05-15T12:00:00Z' },
        absences: 0,
        preTestScore: '92%',
        postTestScore: '96%',
        breakoutHistory: [],
        chatHistory: [],
        pollAnswers: [],
        quizResults: [],
        paperworkData: {
            lastName: 'Finished',
            firstName: 'John',
            dob: '1985-03-10',
            bac: '0.15',
            isSomeoneConcerned: 'no',
            canStopDrinking: 'yes',
            preTestQ1: 'a',
            preTestQ2: 'b',
            address: '123 Done Dr, Austin, TX 78701',
            emergencyContactName: 'Jane Finished',
            emergencyContactPhone: '555-999-7777',
            ndpScreening: {
                q1: 0,
                q2: 'no',
                mast_q6_30: { 7: 'yes' }
            }
        },
        paymentHistory: [
            { id: 'pay_23', date: '2024-04-01T09:05:00Z', description: 'Texas DWI Education Program - Course Fee', amount: 75.00, status: 'Paid', billedToName: 'John Finished' }
        ],
        certificateInfo: {
            id: 'CERT-2024-05-15-JF',
            issuanceDate: '2024-05-15T12:00:00Z',
            status: 'Issued',
            certificatePdfUrl: 'mock_url',
            lastName: 'Finished',
            firstName: 'John',
            address: '123 Done Dr',
            cityStateZip: 'Austin, TX 78701',
            driversLicense: 'TX-987654321',
            caseNumber: 'C-02-CR-23-654321',
            dob: '1985-03-10',
            countyOfConviction: 'Travis County',
            instructorName: 'John Davis',
        },
        removalHistory: [],
    },
];

// FIX: Added course definitions to resolve "Cannot find name" errors.
const dwiEducationCourse: Course = {
    id: 'course-dwi-edu',
    name: 'Texas DWI Education Program',
    description: 'A 12-hour program designed to help students understand the effects of alcohol and drugs on driving ability.',
    price: 100,
    instructorType: InstructorType.Human,
    instructorName: 'John Davis',
    modules: [
        {
            id: 'dwi-mod-1',
            name: 'Module 1: Introduction',
            items: [
                { id: 'i1', type: 'content', title: 'Welcome', description: 'Welcome to the course.' },
                { id: 'i2', type: 'ai-script', title: 'Course Overview', description: 'The AI will explain the course structure.' }
            ]
        },
        {
            id: 'dwi-mod-2',
            name: 'Module 2: Effects of Alcohol',
            items: [
                { id: 'i3', type: 'content', title: 'Alcohol & The Body', description: 'Physiological effects of alcohol.' }
            ]
        },
        {
            id: 'dwi-mod-3',
            name: 'Module 3: Legal Consequences',
            items: [
                { id: 'i4', type: 'quiz', title: 'Final Knowledge Check', description: 'Confirm your understanding of the course material.' }
            ]
        }
    ],
    formConfiguration: {
        personalData: { bacLabel: 'BAC at time of arrest' },
        screeningQuestions: [
            { id: 'isSomeoneConcerned', text: 'Is someone close to you concerned about your drinking?' },
            { id: 'canStopDrinking', text: 'Can you stop drinking without a struggle after one or two drinks?' }
        ],
        preTestQuestions: [
            {
                id: 'preTestQ1',
                text: 'The fine for first offense DWI in Texas is:',
                options: [{ id: 'a', text: 'Up to $1,000' }, { id: 'b', text: 'Up to $2,000' }, { id: 'c', text: 'Up to $5,000' }]
            },
            {
                id: 'preTestQ2',
                text: 'The ability first affected by alcohol is:',
                options: [{ id: 'a', text: 'Judgment' }, { id: 'b', text: 'Muscle control' }, { id: 'c', text: 'Reaction time' }]
            }
        ]
    },
    ragQuestions: [
        { question: "What are the penalties?", context: "Fines up to $2,000 and license suspension." }
    ]
};

const dwiInterventionCourse: Course = {
    id: 'course-dwi-int',
    name: 'DWI Intervention Program',
    description: 'A more intensive 32-hour program for repeat offenders.',
    price: 450,
    instructorType: InstructorType.Human,
    instructorName: 'Robert Smith',
    modules: [
        {
            id: 'dwi-int-mod-1',
            name: 'Session 1: Orientation & Introductions',
            items: [
                { id: 'di1-1', type: 'ai-script', title: 'Program Welcome', description: 'Hello. You are here because of a repeat DWI offense. This program is 32 hours over 15 sessions. Attendance is mandatory.' },
                { id: 'di1-2', type: 'content', title: 'Course Objectives', description: 'Overview of behavioral change and legal requirements.' },
                { id: 'di1-3', type: 'breakout', title: 'Initial Motivation', description: 'Group discussion on why you are here and what you hope to change.' }
            ]
        },
        {
            id: 'dwi-int-mod-2',
            name: 'Session 2: Physical Effects of Alcohol',
            items: [
                { id: 'di2-1', type: 'content', title: 'Biological Impact', description: 'Deep dive into liver function, brain chemistry, and central nervous system effects.' },
                { id: 'di2-2', type: 'ai-script', title: 'Tolerance Explained', description: 'The AI will explain why repeat offenders often have higher tolerance levels and the dangers of this condition.' }
            ]
        },
        {
            id: 'dwi-int-mod-3',
            name: 'Session 3: Psychological Dependency',
            items: [
                { id: 'di3-1', type: 'ai-script', title: 'The Cycle of Use', description: 'How psychological triggers lead to a repetitive cycle of drinking and driving.' },
                { id: 'di3-2', type: 'breakout', title: 'Identifying Cues', description: 'Small groups will identify individual psychological triggers.' }
            ]
        },
        {
            id: 'dwi-int-mod-4',
            name: 'Session 4: Social & Economic Impacts',
            items: [
                { id: 'di4-1', type: 'content', title: 'Cost Analysis', description: 'The financial burden of multiple DWIs: legal fees, insurance, and lost productivity.' },
                { id: 'di4-2', type: 'breakout', title: 'Social Network Mapping', description: 'Analyzing how your social circle influences your substance use.' }
            ]
        },
        {
            id: 'dwi-int-mod-5',
            name: 'Session 5: Legal Consequences (Part 2)',
            items: [
                { id: 'di5-1', type: 'ai-script', title: 'Texas Penal Code', description: 'Detailed review of felony DWI consequences and administrative penalties.' },
                { id: 'di5-2', type: 'quiz', title: 'Legal Knowledge Check', description: 'Test your understanding of repeat offender laws.', questions: [
                    { id: 'l1', text: 'A third DWI in Texas is typically charged as what level of offense?', options: [{id: 'l1a', text: 'Class A Misdemeanor'}, {id: 'l1b', text: '3rd Degree Felony'}], correctOptionId: 'l1b' }
                ]}
            ]
        },
        {
            id: 'dwi-int-mod-6',
            name: 'Session 6: Family Dynamics',
            items: [
                { id: 'di6-1', type: 'content', title: 'The Ripple Effect', description: 'How your choices affect family stability and children.' },
                { id: 'di6-2', type: 'breakout', title: 'Communication Skills', description: 'Role-playing healthy communication with family members about recovery.' }
            ]
        },
        {
            id: 'dwi-int-mod-7',
            name: 'Session 7: Identification of Patterns',
            items: [
                { id: 'di7-1', type: 'ai-script', title: 'Pattern Recognition', description: 'The AI assists in analyzing your specific historical patterns of use to identify high-risk situations.' },
                { id: 'di7-2', type: 'content', title: 'Historical Self-Audit', description: 'Guided worksheet on previous offenses.' }
            ]
        },
        {
            id: 'dwi-int-mod-8',
            name: 'Session 8: Process of Change',
            items: [
                { id: 'di8-1', type: 'content', title: 'Stages of Change', description: 'Pre-contemplation to Maintenance: Where are you now?' },
                { id: 'di8-2', type: 'breakout', title: 'Moving Forward', description: 'Discussing the barriers to moving into the "Action" stage.' }
            ]
        },
        {
            id: 'dwi-int-mod-9',
            name: 'Session 9: Motivation & Values',
            items: [
                { id: 'di9-1', type: 'ai-script', title: 'Values Clarification', description: 'Does your current behavior align with your true core values?' },
                { id: 'di9-2', type: 'content', title: 'Value Mapping Activity', description: 'Individual exercise to rank life priorities.' }
            ]
        },
        {
            id: 'dwi-int-mod-10',
            name: 'Session 10: Problem Solving',
            items: [
                { id: 'di10-1', type: 'content', title: 'Decision-Making Framework', description: 'Step-by-step logic for avoiding driving after drinking.' },
                { id: 'di10-2', type: 'breakout', title: 'Crisis Management', description: 'What to do when your plan falls through.' }
            ]
        },
        {
            id: 'dwi-int-mod-11',
            name: 'Session 11: Relapse Prevention (Part 1)',
            items: [
                { id: 'di11-1', type: 'ai-script', title: 'Defining Relapse', description: 'Relapse is a process, not just an event. Understanding the warning signs.' },
                { id: 'di11-2', type: 'content', title: 'Environmental Triggers', description: 'How to modify your surroundings to support sobriety.' }
            ]
        },
        {
            id: 'dwi-int-mod-12',
            name: 'Session 12: Stress Management',
            items: [
                { id: 'di12-1', type: 'ai-script', title: 'Coping Mechanisms', description: 'Learning healthy ways to deal with stress without alcohol.' },
                { id: 'di12-2', type: 'breakout', title: 'Stress Share', description: 'Sharing healthy coping techniques used by peers.' }
            ]
        },
        {
            id: 'dwi-int-mod-13',
            name: 'Session 13: Goal Setting',
            items: [
                { id: 'di13-1', type: 'content', title: 'SMART Goals', description: 'Setting Specific, Measurable, Achievable, Relevant, and Time-bound goals for the next 6 months.' },
                { id: 'di13-2', type: 'ai-script', title: 'The 90-Day Plan', description: 'Structuring your first three months after program completion.' }
            ]
        },
        {
            id: 'dwi-int-mod-14',
            name: 'Session 14: Community Support',
            items: [
                { id: 'di14-1', type: 'content', title: 'Recovery Resources', description: 'Introduction to AA, SMART Recovery, and local counseling options.' },
                { id: 'di14-2', type: 'breakout', title: 'Support Network Build', description: 'Drafting a list of people and groups to call in times of need.' }
            ]
        },
        {
            id: 'dwi-int-mod-15',
            name: 'Session 15: Final Review & Evaluation',
            items: [
                { id: 'di15-1', type: 'ai-script', title: 'Final Reflection', description: 'Looking back at the 32 hours. What have you gained?' },
                { id: 'di15-2', type: 'quiz', title: 'Final Program Assessment', description: 'Mandatory final exam for certificate eligibility.', passingScore: 80 },
                { id: 'di15-3', type: 'content', title: 'Certification Process', description: 'Final steps for receiving your certificate and reporting to the court.' }
            ]
        }
    ],
    formConfiguration: {
        personalData: { bacLabel: 'BAC Level' },
        screeningQuestions: [],
        preTestQuestions: []
    }
};

const breakoutTestCourse: Course = {
    id: 'course-breakout-test',
    name: 'Breakout Test Course',
    description: 'Internal testing for breakout rooms.',
    price: 0,
    instructorType: InstructorType.AI,
    modules: [{
        id: 'brk-mod-1',
        name: 'Breakout Session',
        items: [{ id: 'brk-item-1', type: 'breakout', title: 'Discuss Case Study', description: 'Students will be split into groups.' }]
    }],
    formConfiguration: {
        personalData: { bacLabel: 'N/A' },
        screeningQuestions: [],
        preTestQuestions: []
    }
};

const aepmCourse: Course = {
    id: 'course-aepm',
    name: 'AEPM',
    description: 'Alcohol Education Program for Minors.',
    price: 100,
    instructorType: InstructorType.Human,
    instructorName: 'Maria Rodriguez',
    modules: [
        { id: 'aepm-mod-1', name: 'AEPM Session 1', items: [] },
        { id: 'aepm-mod-2', name: 'AEPM Session 2', items: [] }
    ],
    formConfiguration: {
        personalData: { bacLabel: 'N/A' },
        screeningQuestions: [],
        preTestQuestions: []
    }
};

const breakTestCourse: Course = {
    id: 'course-break-test',
    name: 'Break Test Course',
    description: 'Internal testing for automated breaks.',
    price: 0,
    instructorType: InstructorType.AI,
    modules: [{
        id: 'break-mod-1',
        name: 'Module with Break',
        items: [{ id: 'break-item-1', type: 'break', title: 'Rest Break', description: 'Take a short break.' }]
    }],
    formConfiguration: {
        personalData: { bacLabel: 'N/A' },
        screeningQuestions: [],
        preTestQuestions: []
    }
};

// FIX: Added sampleQuiz definition to resolve "Cannot find name 'sampleQuiz'" error.
const sampleQuiz: TimelineItem = {
    id: 'sample-quiz',
    type: 'quiz',
    title: 'Sample Quiz',
    description: 'A quick quiz to test the system.',
    questions: [
        {
            id: 'sq1',
            text: 'Is this a test?',
            options: [{ id: 'sq1-o1', text: 'Yes' }, { id: 'sq1-o2', text: 'No' }],
            correctOptionId: 'sq1-o1'
        }
    ]
};

const App: React.FC = () => {
    const [view, setView] = useState<View>(View.RoleSelector);
    const [currentUser, setCurrentUser] = useState<User>(initialUsers[0]);
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [chatLog, setChatLog] = useState<ChatLogEntry[]>([]);
    const [studentPhotos, setStudentPhotos] = useState<Record<string, string>>({});
    const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [activeStudent, setActiveStudent] = useState<Student | null>(null);
    const [prefilledCode, setPrefilledCode] = useState<string | null>(null);
    const [language, setLanguage] = useState<Language>('en');
    
    // Website Content State
    const [websiteContent, setWebsiteContent] = useState<WebsiteContent>(defaultWebsiteContent);

    const handleUpdateWebsiteContent = (newContent: Partial<WebsiteContent>) => {
        setWebsiteContent(prev => ({ ...prev, ...newContent }));
    };
    
    // Classroom state
    const [isInstructor, setIsInstructor] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [instructorName, setInstructorName] = useState<string | undefined>(undefined);
    const [instructorType, setInstructorType] = useState<InstructorType>(InstructorType.AI);
    const [activeCourse, setActiveCourse] = useState<Course>(dwiEducationCourse); // Default to one course
    
    const [courses, setCourses] = useState<Course[]>([dwiEducationCourse, dwiInterventionCourse, breakoutTestCourse, aepmCourse, breakTestCourse]);
    const [students, setStudents] = useState<Student[]>(() => {
        // Calculate NDP score on initial load for students who have the data
        return initialStudents.map(student => {
            if (student.paperworkData?.ndpScreening) {
                const result = calculateNdpScore(student.paperworkData);
                if (result) {
                    return { ...student, ndpScore: { score: result.ndpScore, category: result.category } };
                }
            }
            return student;
        });
    });
    const [instructors, setInstructors] = useState<Instructor[]>(initialInstructors);
    const [scheduledClasses, setScheduledClasses] = useState<ScheduledClass[]>(initialScheduledClasses);
    const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);


    const [breakoutAssignments, setBreakoutAssignments] = useState<Record<string, string[]> | null>(null);

    // --- Media Stream Management ---
    const startCamera = useCallback(async () => {
        if (mediaStream) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            setMediaStream(stream);
            setCameraError(null);
        } catch (err) {
            console.error("Camera access denied:", err);
            let message = "Could not access the camera.";
            if (err instanceof DOMException) {
                if (err.name === "NotAllowedError") {
                    message = "Camera permission was denied. Please allow camera access in your browser settings.";
                } else if (err.name === "NotFoundError") {
                    message = "No camera was found on your device.";
                }
            }
            setCameraError(message);
        }
    }, [mediaStream]);

    const stopCamera = useCallback(() => {
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            setMediaStream(null);
        }
    }, [mediaStream]);
    
     useEffect(() => {
        // Automatically create a live session for today's human-led classes for demo purposes
        const today = new Date().toISOString().split('T')[0];
        const todaysHumanClasses = scheduledClasses.filter(sc => sc.date === today && sc.instructorType === InstructorType.Human && sc.instructorId);
        
        const newSessions: LiveSession[] = todaysHumanClasses.map(sc => {
            const course = courses.find(c => c.id === sc.courseId);
            const instructor = instructors.find(i => i.id === sc.instructorId);
            const studentsInClass = students.filter(s => s.status === 'In Progress' && s.uniqueClassCode.startsWith(course?.name[0] || '')); // Simplified logic

            return {
                id: Date.now() + Math.random(),
                title: course?.name || 'Unknown Class',
                studentCount: studentsInClass.length,
                startTime: sc.time,
                instructorType: InstructorType.Human,
                instructorName: instructor?.name,
                instructorCode: `INST-${new Date().getFullYear()}`, // Simplified code
                instructorId: sc.instructorId,
            };
        });
        
        // Add a mock AI session
        const todaysAiClasses = scheduledClasses.filter(sc => sc.date === today && sc.instructorType === InstructorType.AI);
        todaysAiClasses.forEach(sc => {
             const course = courses.find(c => c.id === sc.courseId);
             const studentsInClass = students.filter(s => s.status === 'In Progress' && s.uniqueClassCode.startsWith('C') || s.uniqueClassCode.startsWith('D'));

            newSessions.push({
                id: Date.now() + Math.random(),
                title: course?.name || 'AI Class',
                studentCount: studentsInClass.length,
                startTime: sc.time,
                instructorType: InstructorType.AI,
            });
        });

        setLiveSessions(newSessions);
    }, [courses, students, instructors, scheduledClasses]);

    const handleTakePhoto = (studentName: string, dataUrl: string) => {
        setStudentPhotos(prev => ({ ...prev, [studentName]: dataUrl }));
    };

    const handleHardwareCheckComplete = (studentId: number, timestamp: string) => {
        setStudents(prev => prev.map(s => s.id === studentId ? { ...s, audioCheckTimestamp: timestamp } : s));
    };

    const handleMarkAttendance = (studentId: number) => {
        setStudents(prev => prev.map(s => {
            if (s.id === studentId) {
                // In a real app, you would upload the captured image and get a URL here.
                // For the demo, we create a new record.
                const newRecord: import('./types').AttendanceRecord = {
                    id: `att-${Date.now()}`,
                    date: new Date().toISOString(),
                    status: 'Present',
                    // Using a placeholder for now since the camera photo is ephemeral in studentPhotos state
                    // Ideally, handleTakePhoto should return the URL to be used here.
                    selfieUrl: `https://placehold.co/300x200/22c55e/ffffff?text=${s.name.split(' ')[0]}+${new Date().toLocaleDateString()}` 
                };

                return {
                    ...s,
                    status: 'In Progress', // Ensure they are marked active
                    attendance: {
                        ...s.attendance,
                        loginTime: new Date().toISOString(),
                        lastActivity: new Date().toISOString(),
                        percentage: '100%' // Mark as fully attended upon verified login
                    },
                    attendanceRecords: [newRecord, ...(s.attendanceRecords || [])]
                };
            }
            return s;
        }));
    };

    const handleStartClassroom = (student: Student) => {
        setActiveStudent(student);
        const cohortMap: { [key: string]: string } = {
            'A': 'course-dwi-edu',
            'B': 'course-dwi-int',
            'C': 'course-breakout-test',
            'D': 'course-aepm',
            'E': 'course-break-test'
        };
        const courseId = cohortMap[student.cohort];
        const course = courses.find(c => c.id === courseId);
        
        // Handle Makeup Session Logic
        const isMakeupMode = student.makeupSession && student.makeupSession.completed === true;
        
        if (student.status === 'Makeup Required' || (student.makeupSession && student.makeupSession.required)) {
             // For makeup, we force the course context to match the makeup session
             if (course) {
                 setActiveCourse(course);
                 setInstructorType(InstructorType.AI); // Makeups are often AI/Video based replays
                 setInstructorName('Makeup Replay');
             }
        } else if (course) {
            setActiveCourse(course);
            setInstructorType(course.instructorType);
            setInstructorName(course.instructorName);
        }
        setIsInstructor(false);
        setIsAdmin(false);
        setView(View.StudentClassroom);
    };

    const handleEnterInstructorMode = (session: LiveSession) => {
        const course = courses.find(c => c.name === session.title);
        if (course) {
            setActiveCourse(course);
            setInstructorType(session.instructorType);
            setInstructorName(session.instructorName);
            setIsInstructor(true);
            setIsAdmin(false);
            setView(View.StudentClassroom);
        } else {
            alert("Could not find the course for this session.");
        }
    };
    
    const handleEnterAdminMode = (session: LiveSession) => {
        const course = courses.find(c => c.name === session.title);
        if (course) {
            setActiveCourse(course);
            setInstructorType(session.instructorType);
            setInstructorName(session.instructorName);
            setIsInstructor(false);
            setIsAdmin(true);
            setView(View.StudentClassroom);
        } else {
            alert("Could not find the course for this session.");
        }
    };
    
    const handleInstructorLogin = (code: string): boolean => {
        const session = liveSessions.find(s => s.instructorCode === code);
        if (session) {
            handleEnterInstructorMode(session);
            return true;
        }
        return false;
    };
    
    const handleQuizSubmit = (result: QuizResult) => {
        if(activeStudent) {
            setStudents(prev => prev.map(s => 
                s.id === activeStudent.id
                    ? { ...s, quizResults: [...s.quizResults, result] }
                    : s
            ));
        }
    };
    
    const handlePaperworkSubmit = (studentId: number, data: PaperworkData) => {
        setStudents(prev => prev.map(s => {
            if (s.id === studentId) {
                 const updatedStudent = { ...s, paperworkData: data };
                 const ndpResult = calculateNdpScore(updatedStudent.paperworkData);
                 if (ndpResult) {
                     updatedStudent.ndpScore = { score: ndpResult.ndpScore, category: ndpResult.category };
                 }
                 return updatedStudent;
            }
            return s;
        }));
    };
    
    const handleRegistration = (name: string, courseId: string, company: Student['company'], billedToName: string, isExpedited: boolean, couponCode: string | undefined, discountAmount: number, preferredLanguage: Language): string => {
        const course = courses.find(c => c.id === courseId);
        if (!course) return '';
        
        // Simplified cohort assignment based on course index
        const cohortIndex = courses.findIndex(c => c.id === courseId);
        const cohort = String.fromCharCode('A'.charCodeAt(0) + cohortIndex);

        const newCode = `${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        const totalAmount = Math.max(0, course.price + (isExpedited ? 25 : 0) - discountAmount);
        
        const newStudent: Student = {
            id: students.length + 1,
            name: name,
            uniqueClassCode: newCode,
            cohort: cohort,
            company: company,
            status: 'In Progress',
            preferredLanguage: preferredLanguage,
            registrationDate: new Date().toISOString(),
            referralSource: 'Self-Registered', // Default for new registrations
            attendance: { percentage: '0%', loginTime: 'N/A', lastActivity: 'N/A' },
            absences: 0,
            preTestScore: 'N/A',
            postTestScore: 'N/A',
            breakoutHistory: [],
            chatHistory: [],
            pollAnswers: [],
            quizResults: [],
            paymentHistory: [{
                id: `pay_${Date.now()}`,
                date: new Date().toISOString(),
                description: `${course.name} - Course Fee`,
                amount: totalAmount,
                status: 'Paid',
                billedToName: billedToName,
                expedited: isExpedited,
                couponCode: couponCode
            }],
            removalHistory: [],
        };
        setStudents(prev => [...prev, newStudent]);
        setPrefilledCode(newCode);
        return newCode;
    };

    const handleManualExpedite = (studentId: number) => {
        setStudents(prev => prev.map(s => {
            if (s.id === studentId) {
                const newPayment: PaymentRecord = {
                    id: `pay_admin_${Date.now()}`,
                    date: new Date().toISOString(),
                    description: 'Expedited Certificate (Admin Granted)',
                    amount: 0,
                    status: 'Paid',
                    expedited: true,
                    billedToName: 'Admin Override'
                };
                return { ...s, paymentHistory: [...s.paymentHistory, newPayment] };
            }
            return s;
        }));
    };

    const handleStartBreakouts = (assignments: Record<string, string[]>, durationInSeconds: number) => {
        setBreakoutAssignments(assignments);
        // In a real app, you might have a timer here to auto-end them.
        // For the demo, we'll rely on the classroom component's internal timer.
    };

    const handleRemoveStudent = (studentId: number, reason: string = 'Instructor Removed', details: string = 'Removed from classroom interface') => {
         setStudents(prev => prev.map(s => {
            if (s.id === studentId) {
                const record: RemovalRecord = {
                    id: `rem-${Date.now()}`,
                    date: new Date().toISOString(),
                    reason: reason,
                    details: details,
                    adminName: isInstructor ? (instructorName || 'Instructor') : (currentUser.name || 'Admin')
                };
                return { 
                    ...s, 
                    status: 'Withdrawn', 
                    removalHistory: [...(s.removalHistory || []), record] 
                };
            }
            return s;
        }));
    };

    const handleAddStudent = (name: string, courseId: string, referralSource: Student['referralSource'], company: Student['company']) => {
        const course = courses.find(c => c.id === courseId);
        if (!course) return;

        const cohortMap: Record<string, string> = {
            'course-dwi-edu': 'A',
            'course-dwi-int': 'B',
            'course-aepm': 'D',
            'course-break-test': 'E'
        };
        const cohort = cohortMap[courseId] || 'A';
        const newCode = `${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        const newStudent: Student = {
            id: students.length + 1,
            name,
            uniqueClassCode: newCode,
            cohort,
            company,
            status: 'In Progress',
            preferredLanguage: 'en',
            registrationDate: new Date().toISOString(),
            referralSource,
            attendance: { percentage: '0%', loginTime: 'N/A', lastActivity: 'N/A' },
            absences: 0,
            preTestScore: 'N/A',
            postTestScore: 'N/A',
            breakoutHistory: [],
            chatHistory: [],
            pollAnswers: [],
            quizResults: [],
            paymentHistory: [{
                id: `pay_${Date.now()}`,
                date: new Date().toISOString(),
                description: `${course.name} - Course Fee`,
                amount: course.price,
                status: 'Paid'
            }],
            removalHistory: [],
        };
        setStudents(prev => [...prev, newStudent]);
    };

    const handleUpdateStudent = (studentId: number, data: { name?: string; email?: string; phoneNumber?: string }) => {
        setStudents(prev => prev.map(s => s.id === studentId ? { ...s, ...data } : s));
    };

    const handleToggleInactiveStatus = (studentId: number) => {
        setStudents(prev => prev.map(s => {
            if (s.id === studentId) {
                // Toggle between 'Inactive' and 'In Progress'
                const newStatus = s.status === 'Inactive' ? 'In Progress' : 'Inactive';
                return { ...s, status: newStatus };
            }
            return s;
        }));
    };
    
    const handleRescheduleStudent = (studentId: number) => {
        setStudents(prev => prev.map(s => {
            if (s.id === studentId && s.status === 'Reschedule Required') {
                return { ...s, status: 'In Progress' };
            }
            return s;
        }));
    };

    const handleRefundPayment = (studentId: number, paymentId: string) => {
        setStudents(prev => prev.map(s => {
            if (s.id === studentId) {
                const updatedPayments = s.paymentHistory.map(p => 
                    p.id === paymentId ? { ...p, status: 'Refunded' as const } : p
                );
                return { ...s, paymentHistory: updatedPayments };
            }
            return s;
        }));
    };
    
    const handleUploadCertificate = (studentId: number, fileUrl: string) => {
        setStudents(prev => prev.map(s => {
            if (s.id === studentId) {
                const newCertInfo = s.certificateInfo 
                    ? { ...s.certificateInfo, certificatePdfUrl: fileUrl, status: 'Issued' as const }
                    : { 
                        id: `CERT-${new Date().getFullYear()}-${s.id}`,
                        issuanceDate: new Date().toISOString(),
                        status: 'Issued' as const,
                        certificatePdfUrl: fileUrl
                      };
                return { ...s, certificateInfo: newCertInfo };
            }
            return s;
        }));
    };
    
    // User Management (Settings)
    // FIX: Updated handleAddUser to accept permissions as per AdminDashboard requirements.
    const handleAddUser = (name: string, email: string, permissions: string[]) => {
        const newUser: User = {
            id: users.length + 1,
            name,
            email,
            role: UserRole.Assistant,
            permissions
        };
        setUsers(prev => [...prev, newUser]);
    };

    // FIX: Implemented handleUpdateUser to resolve "onUpdateUser is missing" error when rendering AdminDashboard.
    const handleUpdateUser = (userId: number, name: string, email: string, permissions: string[]) => {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, name, email, permissions } : u));
        if (currentUser.id === userId) {
            setCurrentUser(prev => ({ ...prev, name, email, permissions }));
        }
    };

    const handleRemoveUser = (userId: number) => {
        setUsers(prev => prev.filter(u => u.id !== userId));
    };
    
    // Coupon Management
    const handleAddCoupon = (code: string, discountAmount: number) => {
        setCoupons(prev => [...prev, { code, discountAmount }]);
    };

    const handleDeleteCoupon = (code: string) => {
        setCoupons(prev => prev.filter(c => c.code !== code));
    };

    // Schedule Management
    const handleAddScheduledClass = (newClass: Omit<ScheduledClass, 'id'>) => {
        const fullClass: ScheduledClass = {
            id: `sc-${Date.now()}`,
            ...newClass,
        };
        setScheduledClasses(prev => [...prev, fullClass]);
    };
    const handleUpdateScheduledClass = (updatedClass: ScheduledClass) => {
        setScheduledClasses(prev => prev.map(sc => sc.id === updatedClass.id ? updatedClass : sc));
    };
    const onDeleteScheduledClass = (classId: string) => {
        setScheduledClasses(prev => prev.filter(sc => sc.id !== classId));
    };
    
    // Instructor Management
    const handleAddInstructor = (name: string, assignedCourseIds: string[]) => {
        const newInstructor: Instructor = {
            id: instructors.length + 1,
            name,
            assignedCourseIds,
        };
        setInstructors(prev => [...prev, newInstructor]);
    };
    
    const handleUpdateInstructor = (instructorId: number, updatedData: Partial<Instructor>) => {
        setInstructors(prev => prev.map(i => i.id === instructorId ? { ...i, ...updatedData } : i));
    };

    const handleDeleteInstructor = (instructorId: number) => {
        setInstructors(prev => prev.filter(i => i.id !== instructorId));
    };
    
    // New function to handle tech support requests
    const handleRequestSupport = () => {
        if (activeStudent) {
            const notificationId = `notif-support-${Date.now()}`;
            const newMessage = `Tech Support requested by ${activeStudent.name} in ${activeCourse.name}.`;

            setUsers(prev => prev.map(u => {
                if (u.role === UserRole.Admin) {
                    const updatedNotifications = [
                        { id: notificationId, title: 'Tech Support Request', message: newMessage, timestamp: new Date().toISOString(), read: false },
                        ...(u.notifications || [])
                    ];
                    return { ...u, notifications: updatedNotifications };
                }
                return u;
            }));

            // If current logged in user is admin, update their state directly for immediate feedback if applicable
            if (currentUser.role === UserRole.Admin) {
                 setCurrentUser(prev => ({
                    ...prev,
                    notifications: [
                        { id: notificationId, title: 'Tech Support Request', message: newMessage, timestamp: new Date().toISOString(), read: false },
                        ...(prev.notifications || [])
                    ]
                }));
            }
        }
    };

    // Notification Handlers
    const handleMarkNotificationRead = (notificationId: string) => {
        if (activeStudent) {
            setStudents(prev => prev.map(s => {
                if (s.id === activeStudent.id) {
                    const updatedNotifications = s.notifications?.map(n => n.id === notificationId ? { ...n, read: true } : n);
                    return { ...s, notifications: updatedNotifications };
                }
                return s;
            }));
        }
    };

    const handleMarkAllNotificationsRead = () => {
         if (activeStudent) {
            setStudents(prev => prev.map(s => {
                if (s.id === activeStudent.id) {
                    const updatedNotifications = s.notifications?.map(n => ({ ...n, read: true }));
                    return { ...s, notifications: updatedNotifications };
                }
                return s;
            }));
        }
    };
    
    const handleMarkAdminNotificationRead = (notificationId: string) => {
         setUsers(prev => prev.map(u => {
            if (u.id === currentUser.id) {
                const updatedNotifications = u.notifications?.map(n => n.id === notificationId ? { ...n, read: true } : n);
                return { ...u, notifications: updatedNotifications };
            }
            return u;
        }));
        // Also update the currentUser state to reflect changes immediately
        setCurrentUser(prev => ({
            ...prev,
            notifications: prev.notifications?.map(n => n.id === notificationId ? { ...n, read: true } : n)
        }));
    };

    const handleMarkAllAdminNotificationsRead = () => {
        setUsers(prev => prev.map(u => {
            if (u.id === currentUser.id) {
                const updatedNotifications = u.notifications?.map(n => ({ ...n, read: true }));
                return { ...u, notifications: updatedNotifications };
            }
            return u;
        }));
        setCurrentUser(prev => ({
            ...prev,
            notifications: prev.notifications?.map(n => ({ ...n, read: true }))
        }));
    };

    const handleAdminSendChatMessage = (text: string, recipient?: string) => {
        setChatLog(prev => [...prev, { user: 'Admin', question: text, answer: '', recipient }]);
    };

    // New handler for voice recording completion
    const handleVoiceRecordingComplete = (studentId: number, audioUrl: string) => {
        setStudents(prev => prev.map(s => {
            if (s.id === studentId) {
                return { ...s, voiceVerificationUrl: audioUrl };
            }
            return s;
        }));
    };

    // New handler for makeup payment
    const handleMakeupPayment = (studentId: number) => {
        setStudents(prev => prev.map(s => {
            if (s.id === studentId) {
                const fee = s.makeupSession?.fee || 50;
                const newPayment: PaymentRecord = {
                    id: `pay_makeup_${Date.now()}`,
                    date: new Date().toISOString(),
                    description: 'Makeup Session Fee',
                    amount: fee,
                    status: 'Paid',
                    billedToName: s.name
                };
                return {
                    ...s,
                    status: 'In Progress', // Temporary status to allow entry, could be 'Makeup In Progress'
                    makeupSession: s.makeupSession ? { ...s.makeupSession, completed: true, completionDate: new Date().toISOString() } : undefined, // Mark as paid/ready
                    paymentHistory: [...s.paymentHistory, newPayment]
                };
            }
            return s;
        }));
    };

    const handlePurchaseDuplicateCertificate = (studentId: number) => {
        setStudents(prev => prev.map(s => {
            if (s.id === studentId) {
                const newPayment: PaymentRecord = {
                    id: `pay_dup_${Date.now()}`,
                    date: new Date().toISOString(),
                    description: 'Duplicate Certificate Fee',
                    amount: 25.00,
                    status: 'Paid',
                    billedToName: s.name
                };
                return {
                    ...s,
                    paymentHistory: [...s.paymentHistory, newPayment]
                };
            }
            return s;
        }));
    };


    const renderView = () => {
        switch (view) {
            case View.RoleSelector:
                return <RoleSelector setView={setView} language={language} setLanguage={setLanguage} />;
            case View.Website:
                return <Website setView={setView} courses={courses} onRegister={handleRegistration} language={language} setLanguage={setLanguage} coupons={coupons} websiteContent={websiteContent} />;
            case View.StudentLogin:
                return <StudentLogin 
                            setView={setView} 
                            startClassroom={handleStartClassroom} 
                            mediaStream={mediaStream}
                            startCamera={startCamera}
                            cameraError={cameraError}
                            handleTakePhoto={handleTakePhoto}
                            prefilledCode={prefilledCode}
                            students={students}
                            courses={courses}
                            onPaperworkSubmit={handlePaperworkSubmit}
                            language={language}
                            setLanguage={setLanguage}
                            onMarkAttendance={handleMarkAttendance}
                            onVoiceRecordingComplete={handleVoiceRecordingComplete}
                            onHardwareCheckComplete={handleHardwareCheckComplete}
                            onMakeupPayment={handleMakeupPayment}
                            onPurchaseDuplicateCertificate={handlePurchaseDuplicateCertificate}
                        />;
            case View.StudentClassroom:
                if (activeStudent || isInstructor || isAdmin) {
                    const studentForClassroom = isInstructor || isAdmin ? 
                        // Create a mock student object for instructor/admin view
                        // FIX: Add type assertion to prevent TypeScript from widening literal types (e.g., 'company') to 'string', which causes a type mismatch.
                        ({
                            id: 999, name: isInstructor ? instructorName || 'Instructor' : 'Admin', 
                            uniqueClassCode: '', cohort: '', company: 'West', status: 'In Progress',
                            registrationDate: '', referralSource: 'Other', attendance: { percentage: '', loginTime: '', lastActivity: ''},
                            absences: 0, preferredLanguage: 'en',
                            preTestScore: '', postTestScore: '', breakoutHistory: [], chatHistory: [], pollAnswers: [], quizResults: [], paymentHistory: [],
                        } as Student)
                        : activeStudent!;
                    
                    // Logic to filter modules if in makeup mode
                    const isMakeupMode = activeStudent?.makeupSession && activeStudent.makeupSession.completed === true; // Assuming completed means paid and ready to start
                    const modulesToUse = (isMakeupMode && activeStudent?.makeupSession?.missedModuleId) 
                        ? activeCourse.modules.filter(m => m.id === activeStudent.makeupSession!.missedModuleId)
                        : activeCourse.modules;

                    return <StudentClassroom 
                                setView={setView} 
                                student={studentForClassroom}
                                setChatLog={setChatLog} 
                                chatLog={chatLog}
                                mediaStream={mediaStream}
                                stopCamera={stopCamera}
                                instructorType={instructorType}
                                instructorName={instructorName}
                                isInstructor={isInstructor}
                                isAdmin={isAdmin}
                                onQuizSubmit={handleQuizSubmit}
                                sampleQuizItem={sampleQuiz}
                                modules={modulesToUse}
                                allStudents={students}
                                breakoutAssignments={breakoutAssignments}
                                onStartBreakouts={handleStartBreakouts}
                                // FIX: Removed 'onUpdateStudent' prop which is not defined in StudentClassroomProps.
                                onRemoveStudent={handleRemoveStudent}
                                activeCourse={activeCourse}
                                onMarkNotificationRead={handleMarkNotificationRead}
                                onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
                                onRequestSupport={handleRequestSupport}
                           />;
                }
                // Fallback if no student is active
                return <RoleSelector setView={setView} language={language} setLanguage={setLanguage} />;
            case View.AdminDashboard:
                return <AdminDashboard 
                            setView={setView} 
                            chatLog={chatLog} 
                            studentPhotos={studentPhotos} 
                            liveSessions={liveSessions}
                            enterInstructorMode={handleEnterInstructorMode}
                            enterAdminMode={handleEnterAdminMode}
                            courses={courses}
                            setCourses={setCourses}
                            students={students}
                            instructors={instructors}
                            scheduledClasses={scheduledClasses}
                            onAddStudent={handleAddStudent}
                            onUpdateStudent={handleUpdateStudent}
                            onToggleInactiveStatus={handleToggleInactiveStatus}
                            onRescheduleStudent={handleRescheduleStudent}
                            onRefundPayment={handleRefundPayment}
                            onUploadCertificate={handleUploadCertificate}
                            currentUser={currentUser}
                            users={users}
                            onAddUser={handleAddUser}
                            // FIX: Added missing onUpdateUser prop to AdminDashboard.
                            onUpdateUser={handleUpdateUser}
                            onRemoveUser={handleRemoveUser}
                            onAddScheduledClass={handleAddScheduledClass}
                            onUpdateScheduledClass={handleUpdateScheduledClass}
                            onDeleteScheduledClass={onDeleteScheduledClass}
                            onAddInstructor={handleAddInstructor}
                            onUpdateInstructor={handleUpdateInstructor}
                            onDeleteInstructor={handleDeleteInstructor}
                            onMarkAdminNotificationRead={handleMarkAdminNotificationRead}
                            onMarkAllAdminNotificationsRead={handleMarkAllAdminNotificationsRead}
                            onSendChatMessage={handleAdminSendChatMessage}
                            onRemoveStudent={handleRemoveStudent}
                            onManualExpedite={handleManualExpedite}
                            coupons={coupons}
                            onAddCoupon={handleAddCoupon}
                            onDeleteCoupon={handleDeleteCoupon}
                            websiteContent={websiteContent}
                            onUpdateWebsiteContent={handleUpdateWebsiteContent}
                        />;
            case View.StudentRegistration:
                return <StudentRegistration 
                    setView={setView} 
                    courses={courses} 
                    onRegister={(name, courseId, company, billedToName, isExpedited, couponCode, discountAmount, preferredLanguage) => handleRegistration(name, courseId, company, billedToName, isExpedited, couponCode, discountAmount, preferredLanguage)}
                    coupons={coupons}
                    websiteContent={websiteContent}
                />;
            case View.AdminLogin:
                return <AdminLogin setView={setView} />;
            case View.InstructorLogin:
                 return <InstructorLogin setView={setView} onLogin={handleInstructorLogin} />;
            default:
                return <RoleSelector setView={setView} language={language} setLanguage={setLanguage} />;
        }
    };

    return <>{renderView()}</>;
};

export default App;