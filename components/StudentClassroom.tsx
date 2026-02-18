
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, ChatMessage, ChatLogEntry, InstructorType, TimelineItem, QuizResult, Student, Module, Course, Notification } from '../types';
import { IconMuted, IconCameraOff, IconVideoOn, IconChat, IconLeave, IconClose, IconSend, IconWarning, IconClock, IconCC, IconUnmuted, IconStudents, IconFilm, IconFile, IconUserX, IconHelpCircle, IconFolder, IconScreenShare, IconStopScreenShare, IconGlobe } from './icons';
import { generateChatResponse } from '../services/geminiService';
import VideoFeed from './VideoFeed';
import BreakoutManagerModal from './admin/BreakoutManagerModal';
import QuizView from './QuizView';
import QuizResultsView from './QuizResultsView';
import NotificationBell from './student/NotificationBell';
import CourseResourcesModal from './CourseResourcesModal';

const BREAK_DURATION_SECONDS = 5;
const BREAKOUT_DURATION_SECONDS = 5;

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const useAudioAlerts = () => {
    const audioContextRef = useRef<AudioContext | null>(null);
    const beepIntervalRef = useRef<number | null>(null);

    const initializeAudioContext = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
    }, []);

    const stopBeeping = useCallback(() => {
        if (beepIntervalRef.current) {
            clearInterval(beepIntervalRef.current);
            beepIntervalRef.current = null;
        }
    }, []);

    const startBeeping = useCallback(() => {
        initializeAudioContext();
        if (beepIntervalRef.current) return;

        const playBeepBurst = () => {
            const audioContext = audioContextRef.current;
            if(!audioContext) return;

            const beepDuration = 0.1;
            const gapDuration = 0.1;
            const numBeeps = 10;
            const startTime = audioContext.currentTime;

            for (let i = 0; i < numBeeps; i++) {
                const beepStartTime = startTime + i * (beepDuration + gapDuration);
                const gain = audioContext.createGain();
                gain.connect(audioContext.destination);
                gain.gain.setValueAtTime(0.3, beepStartTime);
                gain.gain.exponentialRampToValueAtTime(0.001, beepStartTime + beepDuration - 0.01);
                const osc1 = audioContext.createOscillator();
                osc1.type = 'sine';
                osc1.frequency.setValueAtTime(853, beepStartTime);
                osc1.connect(gain);
                const osc2 = audioContext.createOscillator();
                osc2.type = 'sine';
                osc2.frequency.setValueAtTime(960, beepStartTime);
                osc2.connect(gain);
                osc1.start(beepStartTime);
                osc2.start(beepStartTime);
                osc1.stop(beepStartTime + beepDuration);
                osc2.stop(beepStartTime + beepDuration);
            }
        };

        playBeepBurst();
        beepIntervalRef.current = window.setInterval(playBeepBurst, 3000);
    }, [initializeAudioContext]);
    
    const playBreakOverSound = useCallback(() => {
        initializeAudioContext();
        const audioContext = audioContextRef.current;
        if (!audioContext) return;

        const now = audioContext.currentTime;
        const gainNode = audioContext.createGain();
        gainNode.connect(audioContext.destination);
        gainNode.gain.setValueAtTime(0.8, now); // Increased gain for a "loud" beep
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        const osc = audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, now); // A sharp 1000Hz beep
        osc.connect(gainNode);

        osc.start(now);
        osc.stop(now + 0.5); // Beep for 0.5 seconds
    }, [initializeAudioContext]);
    
    const playChimeSound = useCallback(() => {
        initializeAudioContext();
        const audioContext = audioContextRef.current;
        if (!audioContext) return;

        const now = audioContext.currentTime;
        const gainNode = audioContext.createGain();
        gainNode.connect(audioContext.destination);
        gainNode.gain.setValueAtTime(0.5, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        const osc = audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now); // A slightly higher chime
        osc.connect(gainNode);

        osc.start(now);
        osc.stop(now + 0.2); // Short chime
    }, [initializeAudioContext]);


    useEffect(() => {
      return () => stopBeeping();
    }, [stopBeeping]);

    return { startBeeping, stopBeeping, playBreakOverSound, playChimeSound };
};

const ProgressRing = ({ progress, total }: { progress: number, total: number }) => {
    const radius = 80;
    const stroke = 8;
    const normalizedRadius = radius - stroke / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const safeProgress = Math.max(0, progress);
    const strokeDashoffset = circumference - (safeProgress / total) * circumference;

    return (
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
            <circle stroke="rgba(255, 255, 255, 0.2)" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} />
            <circle
                stroke="white"
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference + ' ' + circumference}
                style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s linear' }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
            />
        </svg>
    );
};


interface StudentClassroomProps {
    setView: (view: View) => void;
    student: Student;
    setChatLog: React.Dispatch<React.SetStateAction<ChatLogEntry[]>>;
    chatLog: ChatLogEntry[];
    mediaStream: MediaStream | null;
    stopCamera: () => void;
    instructorType: InstructorType;
    instructorName?: string;
    isInstructor?: boolean;
    isAdmin?: boolean;
    onQuizSubmit: (result: QuizResult) => void;
    sampleQuizItem: TimelineItem | null;
    modules: Module[];
    allStudents: Student[];
    breakoutAssignments: Record<string, string[]> | null;
    onStartBreakouts: (assignments: Record<string, string[]>, durationInSeconds: number) => void;
    onRemoveStudent: (studentId: number) => void;
    activeCourse: Course;
    onMarkNotificationRead: (notificationId: string) => void;
    onMarkAllNotificationsRead: () => void;
    onRequestSupport: () => void;
}

interface ClassroomStudentStatus {
    isMuted: boolean;
    cameraOn: boolean;
}

const StudentClassroom: React.FC<StudentClassroomProps> = ({ setView, student, setChatLog, mediaStream, stopCamera, instructorType, instructorName, isInstructor, isAdmin, onQuizSubmit, sampleQuizItem, modules, allStudents, breakoutAssignments, onStartBreakouts, onRemoveStudent, activeCourse, onMarkNotificationRead, onMarkAllNotificationsRead, onRequestSupport }) => {
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatLanguage, setChatLanguage] = useState<'en' | 'es'>('en');
    const [areCaptionsVisible, setAreCaptionsVisible] = useState(true);
    const [activeQuiz, setActiveQuiz] = useState<TimelineItem | null>(null);
    const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
    const [currentItem, setCurrentItem] = useState<TimelineItem | null>(null);
    const [showWelcome, setShowWelcome] = useState(true);
    const [loopCount, setLoopCount] = useState(0);
    const timelineItems = modules.flatMap(m => m.items);
    
    const [supportRequested, setSupportRequested] = useState(false);
    const [isResourcesOpen, setIsResourcesOpen] = useState(false);
    const [screenShareStream, setScreenShareStream] = useState<MediaStream | null>(null);

    const isMakeupSession = student.makeupSession && student.makeupSession.completed === false; // In our flow, we set completed=true when starting, but we use the status for check mostly.
    // Better check: If modules length is 1 and it matches the missed module logic from App.tsx
    const isMakeupMode = modules.length === 1 && student.status === 'Makeup Required' || (student.makeupSession && modules[0].id === student.makeupSession.missedModuleId);


    const aiWelcomeMessage = instructorType === InstructorType.AI 
        ? `Hi ${student.name}! I'm your AI assistant. Ask me a question about the course, or select one below.`
        : `Hi ${student.name}! I'm the AI Teaching Assistant for ${instructorName}'s class. How can I help you?`;

    const [messages, setMessages] = useState<ChatMessage[]>([{ user: 'AI', text: aiWelcomeMessage }]);
    const [chatInput, setChatInput] = useState('');
    const [isSending, setIsSending] = useState(false);

    const [cameraAlertState, setCameraAlertState] = useState<'none' | 'warning' | 'locked'>('none');
    const [isBreakActive, setIsBreakActive] = useState(false);
    const [breakTime, setBreakTime] = useState(BREAK_DURATION_SECONDS); 
    const [resumeTime, setResumeTime] = useState<string>('');
    const [isMuted, setIsMuted] = useState(true);
    const [isBreakoutManagerOpen, setIsBreakoutManagerOpen] = useState(false);

    const [studentStatuses, setStudentStatuses] = useState<Record<number, ClassroomStudentStatus>>({});
    useEffect(() => {
        const initialStatuses: Record<number, ClassroomStudentStatus> = {};
        allStudents.forEach(s => {
            initialStatuses[s.id] = { isMuted: true, cameraOn: true };
        });
        setStudentStatuses(initialStatuses);
    }, [allStudents]);

    const studentsInClass = useMemo(() => {
        if (!activeCourse) return [];
        // The cohort is the primary key for a class session in this data model.
        // Filter all students to find those in the same cohort as the logged-in user.
        return allStudents.filter(s => 
            s.cohort === student.cohort &&
            s.id !== student.id && // Exclude self from classmate list
            s.status !== 'Withdrawn' && s.status !== 'Completed'
        ).sort((a, b) => {
            const lastNameA = a.name.trim().split(' ').pop() || '';
            const lastNameB = b.name.trim().split(' ').pop() || '';
            return lastNameA.localeCompare(lastNameB);
        });
    }, [allStudents, student.id, student.cohort, activeCourse]);

    const [breakoutState, setBreakoutState] = useState({
        isActive: false,
        timeRemaining: 0,
        participants: [] as string[]
    });
    
    const { startBeeping, stopBeeping, playBreakOverSound, playChimeSound } = useAudioAlerts();
    const cameraLockTimeoutRef = useRef<number | null>(null);
    const chatHistoryRef = useRef<HTMLDivElement>(null);
    
    const timelineTimeoutRef = useRef<number | null>(null);
    const timelineIndexRef = useRef<number>(-1);
    
    const breakIntervalRef = useRef<number | null>(null);
    const breakoutIntervalRef = useRef<number | null>(null);
    
    const breakoutParticipants = breakoutState.participants.map(name => {
        const participantStudent = allStudents.find(s => s.name === name);
        const status = participantStudent ? studentStatuses[participantStudent.id] : { isMuted: true, cameraOn: true };
        return { 
            ...(participantStudent || {}),
            id: participantStudent?.id || Math.random(),
            name: name, 
            cameraOn: status?.cameraOn ?? true, 
            isMuted: status?.isMuted ?? true
        };
    }).sort((a, b) => {
        const lastNameA = a.name.trim().split(' ').pop() || '';
        const lastNameB = b.name.trim().split(' ').pop() || '';
        return lastNameA.localeCompare(lastNameB);
    });

    const classmatesWithStatus = studentsInClass.map(s => ({
        ...s,
        isMuted: studentStatuses[s.id]?.isMuted ?? true,
        cameraOn: studentStatuses[s.id]?.cameraOn ?? true,
    }));
    
    const displayedClassmates = breakoutState.isActive ? breakoutParticipants : classmatesWithStatus;
    const classmateHeader = breakoutState.isActive ? `In Breakout (${breakoutState.participants.length + 1})` : `Classmates (${studentsInClass.length})`;
    
    const stopTimeline = useCallback(() => {
        if (timelineTimeoutRef.current) {
            clearTimeout(timelineTimeoutRef.current);
            timelineTimeoutRef.current = null;
        }
    }, []);

    const advanceTimeline = useCallback(() => {
        if (timelineItems.length === 0) return;
        const nextIndex = (timelineIndexRef.current + 1) % timelineItems.length;
        timelineIndexRef.current = nextIndex;
        const nextItem = timelineItems[nextIndex];
        setCurrentItem(nextItem);
    }, [timelineItems]);

    const advanceTimelineRef = useRef(advanceTimeline);
    useEffect(() => {
        advanceTimelineRef.current = advanceTimeline;
    }, [advanceTimeline]);

    useEffect(() => {
        if (isInstructor || isAdmin) {
            setShowWelcome(false);
            return;
        }
        const timer = setTimeout(() => {
            setShowWelcome(false);
        }, 5000); // Hide after 5 seconds

        return () => clearTimeout(timer);
    }, [isInstructor, isAdmin]);
    
    useEffect(() => {
        stopTimeline();
        
        if (!currentItem || isInstructor || isAdmin || showWelcome) return;
        
        if (currentItem.type === 'ai-script' || currentItem.type === 'content' || currentItem.type === 'google-form') {
            // Default 7 seconds unless specified for content blocks
            // For google form, usually we want more time, but let's stick to the pattern or rely on duration if set
            const durationMs = (currentItem.duration || 7) * 1000 * 60; // duration is in minutes
            // If duration is minimal (like < 1 min in test data), default to short demo time
            const demoDuration = (currentItem.duration && currentItem.duration > 0) ? currentItem.duration * 60 * 1000 : 7000;
            
            timelineTimeoutRef.current = window.setTimeout(advanceTimeline, demoDuration);
        } else if (currentItem.type === 'quiz') {
            const alreadyTaken = student.quizResults.some(r => r.quizId === currentItem.id);
            if (!alreadyTaken) {
                setActiveQuiz(currentItem);
            } else {
                advanceTimeline();
            }
        } else if (currentItem.type === 'break') {
            const breakDurationInSeconds = BREAK_DURATION_SECONDS;
            setBreakTime(breakDurationInSeconds);
            setIsBreakActive(true);
            setActiveQuiz(null);

            const now = new Date();
            now.setSeconds(now.getSeconds() + breakDurationInSeconds);
            setResumeTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

        } else if (currentItem.type === 'breakout') {
             if (!breakoutAssignments && !(isInstructor || isAdmin)) {
                // Get all 'In Progress' students from the same cohort to put them in the breakout.
                const studentsForBreakout = allStudents.filter(s => 
                    s.cohort === student.cohort && s.status === 'In Progress'
                );

                // Assign all of them to one room for the simulation
                const assignments = { "Room 1": studentsForBreakout.map(s => s.name) };
                const durationInSeconds = BREAKOUT_DURATION_SECONDS;
                onStartBreakouts(assignments, durationInSeconds);
            }
            stopTimeline();
        } else {
             const durationMs = 7 * 1000;
             timelineTimeoutRef.current = window.setTimeout(advanceTimeline, durationMs);
        }
    }, [currentItem, isInstructor, isAdmin, advanceTimeline, stopTimeline, student.quizResults, allStudents, onStartBreakouts, student.id, student.name, showWelcome, breakoutAssignments, student.cohort]);

    useEffect(() => {
        if (!showWelcome && timelineItems.length > 0) {
            timelineIndexRef.current = -1;
            advanceTimeline();
        }
        if (showWelcome) {
            stopTimeline();
        }
        return () => {
            stopTimeline();
        };
    }, [showWelcome, timelineItems, advanceTimeline, stopTimeline]);

    useEffect(() => {
        if(mediaStream) {
            mediaStream.getVideoTracks().forEach(track => track.enabled = true);
        }
        setIsCameraOn(true);
    }, [mediaStream]);

    useEffect(() => {
        if (breakoutAssignments && !(isInstructor || isAdmin)) {
            const studentName = student.name;
            let myRoomParticipants: string[] = [];
            let inBreakout = false;
    
            for (const room in breakoutAssignments) {
                const participants = room in breakoutAssignments ? breakoutAssignments[room] : [];
                if (participants.includes(studentName)) {
                    inBreakout = true;
                    myRoomParticipants = participants.filter(p => p !== studentName);
                    break;
                }
            }
    
            if (inBreakout) {
                const durationInSeconds = BREAKOUT_DURATION_SECONDS;
                setBreakoutState({
                    isActive: true,
                    timeRemaining: durationInSeconds,
                    participants: myRoomParticipants,
                });
                setIsMuted(false); // Automatically unmute student when breakout starts
            }
        } else {
            if (breakoutState.isActive) {
                 setBreakoutState({ isActive: false, timeRemaining: 0, participants: [] });
            }
        }
    }, [breakoutAssignments, isInstructor, isAdmin, student.name, breakoutState.isActive]);
    
    useEffect(() => {
        if (isBreakActive) {
            breakIntervalRef.current = window.setInterval(() => {
                setBreakTime(prev => prev > 0 ? prev - 1 : 0);
            }, 1000);
        } else if (breakIntervalRef.current) {
            clearInterval(breakIntervalRef.current);
            breakIntervalRef.current = null;
        }
        return () => {
            if (breakIntervalRef.current) {
                clearInterval(breakIntervalRef.current);
                breakIntervalRef.current = null;
            }
        };
    }, [isBreakActive]);

    useEffect(() => {
        if (breakTime <= 0 && isBreakActive) {
            playBreakOverSound();
            setIsBreakActive(false);
            setTimeout(() => advanceTimelineRef.current(), 100);
        }
    }, [breakTime, isBreakActive, playBreakOverSound]);
    
    useEffect(() => {
        if (breakoutState.isActive) {
            breakoutIntervalRef.current = window.setInterval(() => {
                setBreakoutState(prev => ({ ...prev, timeRemaining: prev.timeRemaining > 0 ? prev.timeRemaining - 1 : 0 }));
            }, 1000);
        } else if (breakoutIntervalRef.current) {
            clearInterval(breakoutIntervalRef.current);
            breakoutIntervalRef.current = null;
        }
        return () => {
            if (breakoutIntervalRef.current) {
                clearInterval(breakoutIntervalRef.current);
                breakoutIntervalRef.current = null;
            }
        };
    }, [breakoutState.isActive]);

    useEffect(() => {
        if (breakoutState.timeRemaining <= 0 && breakoutState.isActive) {
            playChimeSound();
            setBreakoutState({ isActive: false, timeRemaining: 0, participants: [] });

            if (activeCourse.id === 'course-aepm') {
                if (loopCount < 1) { // This is the first return
                    setLoopCount(prev => prev + 1);
                    
                    // Re-trigger the breakout immediately for the second loop
                    const studentsForBreakout = allStudents.filter(s => 
                        s.cohort === student.cohort && s.status === 'In Progress'
                    );
                    const assignments = { "Room 1": studentsForBreakout.map(s => s.name) };
                    onStartBreakouts(assignments, BREAKOUT_DURATION_SECONDS);
                } else {
                    // This is the second (final) return. Stop the timeline to stay in the main room.
                    stopTimeline();
                    setCurrentItem({
                        id: 'end-of-sim',
                        type: 'content',
                        title: 'Breakout Simulation Complete',
                        description: 'You have returned to the main session.'
                    });
                }
            } else {
                // For all other courses, just advance the timeline normally.
                advanceTimelineRef.current();
            }
        }
    }, [
        breakoutState.isActive, 
        breakoutState.timeRemaining, 
        playChimeSound, 
        activeCourse.id, 
        loopCount, 
        allStudents, 
        student.cohort, 
        onStartBreakouts,
        stopTimeline
    ]);
    
    useEffect(() => {
        // When returning to the main session from a breakout, automatically mute the student.
        if (!breakoutState.isActive && !isInstructor && !isAdmin) {
            setIsMuted(true);
        }
    }, [breakoutState.isActive, isInstructor, isAdmin]);

    useEffect(() => {
        if (isInstructor || isAdmin) return;
        if (!isCameraOn) {
            if (cameraAlertState === 'locked') return;

            setCameraAlertState('warning');
            startBeeping();

            if (cameraLockTimeoutRef.current) {
                clearTimeout(cameraLockTimeoutRef.current);
            }
            cameraLockTimeoutRef.current = window.setTimeout(() => {
                setCameraAlertState('locked');
            }, 3000);
        } else {
            if (cameraLockTimeoutRef.current) {
                clearTimeout(cameraLockTimeoutRef.current);
            }
            if(cameraAlertState === 'warning' || cameraAlertState === 'locked'){
               setCameraAlertState('none');
            }
            stopBeeping();
        }
        return () => {
             if (cameraLockTimeoutRef.current) {
                clearTimeout(cameraLockTimeoutRef.current);
            }
        }
    }, [isCameraOn, startBeeping, stopBeeping, cameraAlertState, isInstructor, isAdmin]);

    useEffect(() => {
      if(chatHistoryRef.current) {
        chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
      }
    }, [messages]);

    const handleLeave = () => {
        stopBeeping();
        stopCamera();
        if (screenShareStream) {
            screenShareStream.getTracks().forEach(track => track.stop());
        }
        setView(isInstructor || isAdmin ? View.AdminDashboard : View.RoleSelector);
    };

    const handleToggleCamera = () => {
        if (mediaStream) {
            const newCameraState = !isCameraOn;
            mediaStream.getVideoTracks().forEach(track => {
                track.enabled = newCameraState;
            });
            setIsCameraOn(newCameraState);
        }
    };

    const handleToggleMute = () => {
        if (breakoutState.isActive || isInstructor || isAdmin) {
            setIsMuted(!isMuted);
        }
    };

    const handleToggleStudentMute = (studentId: number) => {
        setStudentStatuses(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], isMuted: !prev[studentId].isMuted }
        }));
    };
    
    const handleToggleStudentCamera = (studentId: number) => {
        setStudentStatuses(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], cameraOn: !prev[studentId].cameraOn }
        }));
    };

    const handleRequestSupportClick = () => {
        onRequestSupport();
        setSupportRequested(true);
        // Reset local state after a delay to allow another request if needed later
        setTimeout(() => setSupportRequested(false), 5000);
    };

    const handleSendChatMessage = async (prefilledMessage?: string) => {
        const question = prefilledMessage || chatInput;
        if (!question.trim() || isSending) return;

        setIsSending(true);
        const user = isInstructor ? 'Instructor' : isAdmin ? 'Admin' : student.name;
        const newMessages: ChatMessage[] = [...messages, { user, text: question }];
        setMessages(newMessages);
        setChatInput('');

        const answer = await generateChatResponse(question, activeCourse, chatLanguage);

        setMessages(prev => [...prev, { user: 'AI', text: answer }]);
        setChatLog(prev => [...prev, { user, question, answer }]);
        setIsSending(false);
    };

    const handleQuizSubmission = (result: QuizResult) => {
        onQuizSubmit(result);
        setQuizResult(result);
        setActiveQuiz(null);
    };

    const handleCloseQuizResults = () => {
        setQuizResult(null);
        advanceTimeline();
    };

    const handleToggleScreenShare = async () => {
        if (screenShareStream) {
            screenShareStream.getTracks().forEach(track => track.stop());
            setScreenShareStream(null);
        } else {
            try {
                const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                setScreenShareStream(stream);
                stream.getVideoTracks()[0].onended = () => {
                    setScreenShareStream(null);
                };
            } catch (err) {
                console.error("Error sharing screen:", err);
            }
        }
    };

    const MainContent = () => {
        if (screenShareStream) {
             return (
                <div className="w-full max-w-6xl aspect-video bg-black rounded-lg shadow-2xl flex flex-col items-center justify-center overflow-hidden relative">
                    <VideoFeed stream={screenShareStream} muted={true} />
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full flex items-center gap-2">
                        <IconScreenShare className="w-4 h-4" />
                        <span>You are sharing your screen</span>
                    </div>
                </div>
            )
        }

        if (!currentItem) {
            return (
                <div className="w-full max-w-6xl aspect-video bg-gray-800 rounded-lg shadow-2xl flex items-center justify-center">
                    <p className="text-gray-400">Loading class content...</p>
                </div>
            );
        }
        
        if (currentItem.type === 'content' && currentItem.videoFileName) {
            return (
                <div className="w-full max-w-6xl aspect-video bg-black rounded-lg shadow-2xl flex flex-col items-center justify-center text-white">
                    <IconFilm className="w-24 h-24 text-gray-500 mb-4" />
                    <h3 className="text-2xl font-bold">{currentItem.title}</h3>
                    <p className="text-lg text-gray-400">Playing video: {currentItem.videoFileName}</p>
                    <p className="text-sm mt-4">(Video playback placeholder)</p>
                </div>
            )
        }
        
        if (currentItem.type === 'content' && currentItem.fileName) {
             return (
                <div className="w-full max-w-6xl aspect-video bg-gray-200 text-gray-800 rounded-lg shadow-2xl flex flex-col items-center justify-center">
                    <IconFile className="w-24 h-24 text-gray-500 mb-4" />
                    <h3 className="text-2xl font-bold">{currentItem.title}</h3>
                    <p className="text-lg text-gray-600">Displaying document: {currentItem.fileName}</p>
                     <p className="text-sm mt-4">(Document viewer placeholder)</p>
                </div>
            )
        }

        if (currentItem.type === 'google-form' && currentItem.googleFormUrl) {
            return (
                <div className="w-full max-w-6xl h-[80vh] bg-white rounded-lg shadow-2xl overflow-hidden relative">
                    <iframe 
                        src={currentItem.googleFormUrl} 
                        width="100%" 
                        height="100%" 
                        frameBorder="0" 
                        marginHeight={0} 
                        marginWidth={0}
                    >
                        Loading…
                    </iframe>
                </div>
            );
        }


        if (instructorType === InstructorType.AI || isMakeupMode) { // Makeup mode uses AI-style rendering
            return (
                <div className="w-full max-w-6xl aspect-video bg-gray-800 rounded-lg shadow-2xl flex flex-col justify-end relative">
                    {areCaptionsVisible && (
                        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-4/5 text-center">
                            <p className="text-xl md:text-2xl font-semibold p-2 bg-black/60 rounded">
                                {currentItem.title}
                            </p>
                        </div>
                    )}
                    <div className="p-4 bg-black/30">
                        <p className="text-lg font-medium">AI Avatar: "{currentItem.description}"</p>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="w-full max-w-6xl aspect-video bg-gray-800 rounded-lg shadow-2xl flex flex-col">
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-gray-400 text-2xl">[Live Instructor & Screen Share Area]</p>
                         <p className="absolute top-4 left-4 text-white bg-black/50 p-2 rounded">Current Topic: {currentItem.title}</p>
                    </div>
                    <div className="p-4 bg-black/30">
                        <p className="text-lg font-medium">{instructorName}: "{currentItem.description}"</p>
                    </div>
                </div>
            );
        }
    };

    const selfViewName = isInstructor ? (instructorName || 'Instructor') : isAdmin ? 'Admin (You)' : `${student.name} (You)`;

    return (
        <div className="relative min-h-screen flex flex-col bg-gray-900 text-white">
            <header className="flex-shrink-0 bg-gray-800 border-b border-gray-700 p-3 flex justify-between items-center z-20 shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        {/* Fixed LIVE CLASS badge (Non-blinking) */}
                        <div className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded flex items-center gap-1.5 shadow-md">
                            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                            LIVE CLASS
                        </div>
                        <div>
                            <h1 className="text-lg font-bold">{activeCourse.name}</h1>
                            <p className="text-xs text-gray-400">{currentItem?.title || 'Starting session...'}</p>
                        </div>
                    </div>
                    {isMakeupMode && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-yellow-300">
                            Makeup Session - Replay
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <NotificationBell
                        notifications={student.notifications || []}
                        onMarkAsRead={onMarkNotificationRead}
                        onMarkAllAsRead={onMarkAllNotificationsRead}
                    />
                </div>
            </header>

            <div className={`flex-1 flex overflow-hidden ${breakoutState.isActive ? 'pt-28' : ''}`}>
                <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-black relative overflow-hidden">
                    <MainContent />
                </main>

                <aside className="w-64 md:w-80 bg-gray-800 p-4 space-y-3 overflow-y-auto border-l border-gray-700 flex-shrink-0">
                    <h3 className="text-lg font-semibold text-white mb-3">{classmateHeader}</h3>
                    <div className="relative p-2 bg-gray-700 rounded-lg border-2 border-blue-500">
                        <div className="w-full aspect-video bg-gray-900 rounded flex items-center justify-center overflow-hidden">
                             {isCameraOn && mediaStream ? (
                                <VideoFeed stream={mediaStream} />
                            ) : (
                                <IconCameraOff className="text-gray-500 w-8 h-8" />
                            )}
                        </div>
                        <span className="absolute bottom-4 left-4 text-sm font-medium text-white">{selfViewName}</span>
                        <span className={`absolute top-4 right-4 p-1 rounded-full ${isMuted ? 'bg-red-600' : 'bg-gray-700'}`}>
                            {isMuted ? <IconMuted className="w-4 h-4" /> : <IconUnmuted className="w-4 h-4 text-green-400" />}
                        </span>
                    </div>
                    {displayedClassmates.map(classmate => {
                        const studentData = classmate;
                        if (!studentData) return null;
                        const status = studentStatuses[studentData.id] || { isMuted: true, cameraOn: true };

                        return (
                        <div key={studentData.id} className="relative p-2 bg-gray-700 rounded-lg group">
                             {status.cameraOn ? (
                                <div className="w-full aspect-video bg-gray-600 rounded flex items-center justify-center"><span className="text-gray-400 text-sm">Cam On</span></div>
                             ) : (
                                <div className="w-full aspect-video bg-gray-900 rounded flex items-center justify-center"><IconCameraOff className="text-gray-600 w-8 h-8" /></div>
                             )}
                            <span className="absolute bottom-4 left-4 text-sm font-medium text-white">{studentData.name}</span>
                            <span className={`absolute top-4 right-4 p-1 rounded-full ${status.isMuted ? 'bg-red-600' : 'bg-gray-700'}`}>
                                {status.isMuted ? <IconMuted className="w-4 h-4" /> : <IconUnmuted className="w-4 h-4 text-green-400" />}
                            </span>

                            {(isInstructor || isAdmin) && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleToggleStudentMute(studentData.id)}
                                        className="p-2 bg-gray-800/80 rounded-full text-white hover:bg-blue-600"
                                        title={status.isMuted ? `Unmute ${studentData.name}` : `Mute ${studentData.name}`}
                                    >
                                        {status.isMuted ? <IconMuted className="w-5 h-5"/> : <IconUnmuted className="w-5 h-5"/>}
                                    </button>
                                    <button
                                        onClick={() => handleToggleStudentCamera(studentData.id)}
                                        className="p-2 bg-gray-800/80 rounded-full text-white hover:bg-blue-600"
                                        title={status.cameraOn ? `Turn camera off for ${studentData.name}` : `Turn camera on for ${studentData.name}`}
                                    >
                                        {status.cameraOn ? <IconCameraOff className="w-5 h-5"/> : <IconVideoOn className="w-5 h-5"/>}
                                    </button>
                                    <button
                                        onClick={() => onRemoveStudent(studentData.id)}
                                        className="p-2 bg-red-800/80 rounded-full text-white hover:bg-red-600"
                                        title={`Remove ${studentData.name} from class`}
                                    >
                                        <IconUserX className="w-5 h-5"/>
                                    </button>
                                </div>
                            )}
                        </div>
                    )})}
                </aside>
                
                <aside className={`flex-shrink-0 transition-all duration-300 ease-in-out bg-white flex flex-col ${isChatOpen ? 'w-96' : 'w-0'}`}>
                    <div className={`w-96 h-full flex flex-col overflow-hidden transition-opacity duration-200 ${isChatOpen ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="flex justify-between items-center p-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                            <h3 className="text-lg font-semibold text-gray-900">AI Assistant Chat</h3>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setChatLanguage(prev => prev === 'en' ? 'es' : 'en')}
                                    className="flex items-center gap-1 text-xs font-medium px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-700"
                                    title="Toggle Language"
                                >
                                    <IconGlobe className="w-3 h-3" />
                                    {chatLanguage === 'en' ? 'EN' : 'ES'}
                                </button>
                                <button onClick={() => setIsChatOpen(false)} className="text-gray-500 hover:text-gray-800" aria-label="Close chat">
                                    <IconClose />
                                </button>
                            </div>
                        </div>
                        <div ref={chatHistoryRef} id="chat-history" className="flex-1 p-4 space-y-4 overflow-y-auto text-black" aria-live="polite" aria-atomic="false">
                            {messages.map((msg, index) => (
                                 <div key={index} className={`flex ${msg.user === 'AI' ? '' : 'justify-end'}`}>
                                    <div className={`p-3 rounded-lg ${msg.user === 'AI' ? 'bg-blue-100 text-blue-900 rounded-bl-none' : 'bg-gray-200 text-gray-900 rounded-br-none'}`}>
                                        <p className="text-sm">{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                            {isSending && <div className="flex"><div className="p-3 bg-blue-100 text-blue-900 rounded-lg rounded-bl-none"><p className="text-sm italic">AI is thinking...</p></div></div>}
                        </div>
                         <div className="p-3 border-t border-gray-200 bg-gray-50">
                            <p className="text-xs text-gray-500 mb-2">Suggested questions:</p>
                            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                                {activeCourse?.ragQuestions && activeCourse.ragQuestions.length > 0 ? (
                                    activeCourse.ragQuestions.map(rq => (
                                        <button key={rq.question} onClick={() => handleSendChatMessage(rq.question)} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300 text-left">"{rq.question}"</button>
                                    ))
                                ) : (
                                     <button onClick={() => handleSendChatMessage('When is our next break?')} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">"When is our next break?"</button>
                                )}
                            </div>
                        </div>
                         <div className="p-3 border-t border-gray-200 flex gap-2 flex-shrink-0">
                            <label htmlFor="chat-input" className="sr-only">Ask a question</label>
                            <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendChatMessage()} id="chat-input" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ask a question..." disabled={isSending} />
                            <button onClick={() => handleSendChatMessage()} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300" disabled={isSending} aria-label="Send message">
                                <IconSend />
                            </button>
                        </div>
                    </div>
                </aside>
            </div>

            <footer className="w-full p-4 bg-gray-900 border-t border-gray-700 flex justify-center items-center gap-4">
                 <button
                    onClick={handleToggleMute}
                    disabled={!breakoutState.isActive && !isInstructor && !isAdmin}
                    aria-label={isMuted ? "Unmute" : "Mute"}
                    className={`p-3 rounded-full transition ${
                        !breakoutState.isActive && !isInstructor && !isAdmin
                            ? 'bg-red-600 cursor-not-allowed opacity-70'
                            : isMuted
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                >
                    {isMuted ? <IconMuted className="w-6 h-6" /> : <IconUnmuted className="w-6 h-6" />}
                </button>
                <button onClick={handleToggleCamera} aria-label={isCameraOn ? "Stop Video" : "Start Video"} className={`p-3 rounded-full transition ${isCameraOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'}`} >
                    {isCameraOn ? <IconVideoOn /> : <IconCameraOff className="w-6 h-6" />}
                </button>
                <button onClick={() => setAreCaptionsVisible(!areCaptionsVisible)} className={`p-3 rounded-full transition ${areCaptionsVisible ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'}`} aria-label={areCaptionsVisible ? "Hide captions" : "Show captions"} aria-pressed={areCaptionsVisible}>
                    <IconCC />
                </button>
                {(isInstructor || isAdmin) && (
                    <>
                        <button
                            onClick={handleToggleScreenShare}
                            className={`p-3 rounded-full transition ${screenShareStream ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'}`}
                            aria-label={screenShareStream ? "Stop Sharing Screen" : "Share Screen"}
                            title={screenShareStream ? "Stop Sharing" : "Share Screen"}
                        >
                            {screenShareStream ? <IconStopScreenShare className="w-6 h-6" /> : <IconScreenShare className="w-6 h-6" />}
                        </button>
                        <button onClick={() => setIsBreakoutManagerOpen(true)} className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition" aria-label="Manage Breakout Rooms">
                            <IconStudents />
                        </button>
                        <button 
                            onClick={() => setIsResourcesOpen(true)} 
                            className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition" 
                            aria-label="Course Files"
                            title="Course Files"
                        >
                            <IconFolder />
                        </button>
                    </>
                )}
                 {!isInstructor && !isAdmin && (
                    <button
                        onClick={handleRequestSupportClick}
                        className={`p-3 rounded-full transition flex items-center gap-2 ${supportRequested ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'}`}
                        aria-label="Request Technical Support"
                    >
                        <IconHelpCircle className="w-6 h-6" />
                        <span className="hidden md:inline text-sm font-medium">{supportRequested ? 'Sent!' : 'Tech Support'}</span>
                    </button>
                )}
                <button onClick={() => setIsChatOpen(!isChatOpen)} className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition" aria-label="Open AI Chat">
                    <IconChat />
                </button>
                <button onClick={handleLeave} className="p-3 bg-red-600 rounded-full hover:bg-red-700 transition" aria-label="Leave Session">
                    <IconLeave />
                </button>
            </footer>
            
            {showWelcome && (
                <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm flex flex-col items-center justify-center z-50 text-white p-4 text-center animate-fade-in">
                    <h2 className="text-4xl font-bold">Welcome, {student.name}!</h2>
                    <p className="text-xl text-gray-300 mt-4">Your class is about to begin.</p>
                    <p className="text-lg text-gray-400 mt-2">Please ensure your camera is on and you are in a quiet environment.</p>
                    <button
                        onClick={() => setShowWelcome(false)}
                        className="mt-8 px-6 py-3 bg-blue-600 font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
                    >
                        Enter Classroom
                    </button>
                    <p className="text-sm text-gray-500 mt-4 animate-pulse">This window will close automatically...</p>
                </div>
            )}

            {cameraAlertState === 'warning' && (
                <div id="alert-camera-warning" role="alert" aria-live="assertive" className="absolute top-0 left-0 w-full p-4 bg-yellow-500 text-black text-center font-bold text-lg animate-pulse z-30">
                    <IconWarning className="inline-block mr-2"/>
                    (LOUD BEEP) Please return to your camera. You are not visible.
                </div>
            )}

            {cameraAlertState === 'locked' && (
                <div id="alert-session-lock" role="alert" aria-live="assertive" className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="text-center p-10 bg-gray-800 rounded-lg shadow-xl border border-red-500">
                        <IconCameraOff className="text-red-500 mx-auto mb-4 w-16 h-16"/>
                        <h2 className="text-3xl font-bold text-white mb-2">ATTENDANCE ALERT</h2>
                        <p className="text-xl text-gray-300">You are not visible on camera.</p>
                        <p className="text-lg text-gray-300 mb-8">The session is paused until you return.</p>
                        <button
                            onClick={handleToggleCamera}
                            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 flex items-center justify-center gap-2 mx-auto"
                        >
                            <IconVideoOn />
                            Return to Class
                        </button>
                    </div>
                </div>
            )}
            
            {isBreakActive && (
                <div id="alert-break-timer" className="absolute inset-0 bg-animated-gradient flex flex-col items-center justify-center z-50 text-white p-4 text-center">
                    <div className="relative flex items-center justify-center w-44 h-44">
                        <ProgressRing progress={breakTime} total={BREAK_DURATION_SECONDS} />
                        <div className="absolute">
                            <p className="text-5xl font-bold tabular-nums drop-shadow-lg">{formatTime(breakTime)}</p>
                            <p className="text-md font-medium opacity-80">Break Time</p>
                        </div>
                    </div>
                    <div className="mt-8">
                        <p className="text-2xl font-semibold drop-shadow">Session resumes at {resumeTime}</p>
                    </div>
                </div>
            )}

            {breakoutState.isActive && !isInstructor && !isAdmin && (
                <div className="absolute top-0 left-0 right-0 p-4 bg-blue-900/90 backdrop-blur-sm z-40 text-white shadow-lg border-b border-blue-700 animate-fade-in">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                            <IconStudents className="w-8 h-8 text-blue-300 flex-shrink-0" />
                            <div>
                                <h3 className="font-bold text-lg">In Breakout Room</h3>
                                <div className="flex flex-wrap items-center gap-x-2 text-sm text-blue-200">
                                    <span>With:</span>
                                    {breakoutState.participants.map((name, index) => (
                                        <span key={name} className="font-medium px-2 py-1 bg-blue-800/50 rounded-full">{name}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-gray-900/50 p-2 rounded-lg">
                            <p key={breakoutState.timeRemaining} className="text-3xl font-bold tabular-nums text-white animate-pulse-timer">{formatTime(breakoutState.timeRemaining)}</p>
                            <p className="text-sm text-blue-200 animate-pulse">Returning soon...</p>
                        </div>
                    </div>
                </div>
            )}
            
            {activeQuiz && <QuizView quizItem={activeQuiz} onSubmit={handleQuizSubmission} />}
            {quizResult && <QuizResultsView result={quizResult} onClose={handleCloseQuizResults} quizItem={currentItem} />}

            {(isInstructor || isAdmin) && (
                <BreakoutManagerModal
                    isOpen={isBreakoutManagerOpen}
                    onClose={() => setIsBreakoutManagerOpen(false)}
                    students={allStudents.map(s => ({ name: s.name }))}
                    onStartBreakouts={(assignments) => {
                        const durationInSeconds = BREAKOUT_DURATION_SECONDS;
                        onStartBreakouts(assignments, durationInSeconds);
                        setIsBreakoutManagerOpen(false);
                    }}
                />
            )}

            {(isInstructor || isAdmin) && isResourcesOpen && (
                <CourseResourcesModal 
                    isOpen={isResourcesOpen}
                    onClose={() => setIsResourcesOpen(false)}
                    resources={activeCourse.resources || []}
                    title={`Course Files: ${activeCourse.name}`}
                />
            )}
        </div>
    );
};

export default StudentClassroom;