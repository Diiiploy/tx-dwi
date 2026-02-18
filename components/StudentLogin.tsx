
import React, { useState, useEffect, useRef } from 'react';
import { View, StudentLoginStep, Student, Course, PaperworkData, FormConfiguration, Language } from '../types';
import { IconCamera, IconCameraOff, IconEye, IconCheckCircle, IconXCircle, IconGlobe, IconUserX, IconMic, IconStopCircle, IconClock, IconCreditCard, IconChat, IconSend, IconRobot, IconFileText, IconDownload, IconArrowLeft, IconUnmuted } from './icons';
import VideoFeed from './VideoFeed';
import DwiEducationPaperwork from './dwi/DwiEducationPaperwork';
import { generateChatResponse } from '../services/geminiService';

interface StudentLoginProps {
    setView: (view: View) => void;
    startClassroom: (student: Student) => void;
    mediaStream: MediaStream | null;
    startCamera: () => Promise<void>;
    cameraError: string | null;
    handleTakePhoto: (studentName: string, dataUrl: string) => void;
    prefilledCode: string | null;
    students: Student[];
    courses: Course[];
    onPaperworkSubmit: (studentId: number, data: PaperworkData) => void;
    language: Language;
    setLanguage: (lang: Language) => void;
    onMarkAttendance: (studentId: number) => void;
    onVoiceRecordingComplete: (studentId: number, audioUrl: string) => void;
    onHardwareCheckComplete: (studentId: number, timestamp: string) => void;
    onMakeupPayment?: (studentId: number) => void; // New prop for makeup payment
    onPurchaseDuplicateCertificate?: (studentId: number) => void;
}

const StudentLogin: React.FC<StudentLoginProps> = ({ setView, startClassroom, mediaStream, startCamera, cameraError, handleTakePhoto, prefilledCode, students, courses, onPaperworkSubmit, language, setLanguage, onMarkAttendance, onVoiceRecordingComplete, onHardwareCheckComplete, onMakeupPayment, onPurchaseDuplicateCertificate }) => {
    const [step, setStep] = useState<StudentLoginStep>(StudentLoginStep.Code);
    const [isRetrievingCode, setIsRetrievingCode] = useState(false);
    const [retrievalInput, setRetrievalInput] = useState('');
    const [retrievalSent, setRetrievalSent] = useState(false);
    const [classCode, setClassCode] = useState('');
    const [loginError, setLoginError] = useState<string | null>(null);
    const [foundStudent, setFoundStudent] = useState<Student | null>(null);
    const [paperworkData, setPaperworkData] = useState<PaperworkData>({
        dob: '',
        address: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
    });
    const [acknowledged, setAcknowledged] = useState(false);
    const [terms, setTerms] = useState({
        cameraOn: false,
        muted: false,
        recording: false,
    });
    const [isVideoWatched, setIsVideoWatched] = useState(false);

    // Recording state
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'success' | 'failed'>('idle');
    const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
    
    // Hardware Sub-steps
    const [hardwarePhase, setHardwarePhase] = useState<'sound' | 'mic'>('sound');
    const [soundVerified, setSoundVerified] = useState(false);

    // Duplicate Certificate State
    const [isPurchasingCert, setIsPurchasingCert] = useState(false);
    const [certPurchaseSuccess, setCertPurchaseSuccess] = useState(false);
    const [showCertPaymentForm, setShowCertPaymentForm] = useState(false);
    const [certCardInfo, setCertCardInfo] = useState({ number: '', expiry: '', cvc: '' });

    // FAQ Chat State
    const [faqMessages, setFaqMessages] = useState<{user: string, text: string}[]>([
        { user: 'AI', text: "Hi! I'm your pre-class assistant. Have any questions before we start?" }
    ]);
    const [faqInput, setFaqInput] = useState('');
    const [isFaqSending, setIsFaqSending] = useState(false);
    const faqScrollRef = useRef<HTMLDivElement>(null);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    
    const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    const t = {
        en: {
            retrieveCode: "Retrieve Code",
            codeSent: "If an account matches, your code has been sent.",
            enterEmail: "Enter your email or phone number to have your code sent to you again.",
            emailPlaceholder: "example@email.com",
            sendCode: "Send Code",
            backToLogin: "Back to Login",
            codeInstruction: "Your class code was sent to your email and phone.",
            uniqueClassCode: "Unique Class Code",
            verifyCode: "Verify Code",
            forgotCode: "Forgot your code?",
            welcomeConfirm: "Welcome! Please confirm your identity.",
            loading: "Loading...",
            isThisYou: "Is this you?",
            noBack: "No, Go Back",
            yesContinue: "Yes, Continue",
            invalidCode: "Invalid class code. Please check the code and try again.",
            welcomeUser: "Welcome, {name}!",
            nextClassIn: "Your Next Class Begins In:",
            days: "Days",
            hours: "Hours",
            minutes: "Minutes",
            seconds: "Seconds",
            preClassSetup: "You can complete the pre-class setup now to be ready for your session.",
            setupChecklist: "Setup Checklist",
            checklist1: "1. Complete Pre-Course Paperwork",
            checklist2: "2. Daily Attendance Selfie",
            checklist3: "3. Agree to Classroom Terms",
            startSetup: "Start Pre-Class Setup",
            continueSetup: "Continue Pre-Class Setup",
            logOut: "Log Out",
            preCoursePaperwork: "Pre-Course Paperwork",
            paperworkInstruction: "Please complete the required data collection form below.",
            aiProctor: "AI Proctor Starting...",
            cameraError: "Camera Error",
            fullName: "Full Name",
            dob: "Date of Birth",
            address: "Full Address",
            emergencyName: "Emergency Contact Name",
            emergencyPhone: "Emergency Contact Phone",
            acknowledge: "I acknowledge that the information provided is accurate to the best of my knowledge.",
            submitPaperwork: "Submit Paperwork & Continue",
            selfieInstruction: "Please position your face in the frame for a daily attendance selfie.",
            takePhoto: "Take Photo",
            termsInstruction: "Please review and agree to the classroom terms.",
            termCamera: "I agree to keep my camera on and remain visible at all times.",
            termMuted: "I understand that I will be muted in the main session and can only unmute in breakout rooms.",
            termRecording: "I consent to this session being recorded for educational and compliance purposes.",
            agreeEnter: "Agree & Enter Classroom",
            courseCompleted: "Course Already Completed",
            welcomeBack: "Welcome back, {name}! Our records show that you have already successfully completed this course.",
            course: "Course",
            completionDate: "Completion Date",
            contactAdminError: "If you believe this is an error, please contact administration.",
            rescheduleRequired: "Reschedule Required",
            loggedLate: "Welcome, {name}. Our records show you logged in at {time}, which is past the grace period for your scheduled class.",
            markedAbsent: "You have been marked as absent and will need to reschedule to a future session to receive credit.",
            contactReschedule: "To reschedule, please contact administration at",
            accountInactive: "Account Inactive",
            inactiveMessage: "Welcome, {name}. Your account is currently inactive and cannot access the classroom.",
            paymentHold: "This may be due to a pending payment or other administrative hold.",
            reactivateMessage: "To reactivate your account, please contact administration at",
            identityMismatch: "Identity Verification Failed",
            identityMismatchMessage: "Our system could not verify your identity. Please ensure you are the registered student.",
            retakePhoto: "Retake Photo",
            contactSupport: "Contact Support",
            accountWithdrawn: "Account Access Revoked",
            withdrawnMessage: "Welcome, {name}. Your access to this classroom has been revoked.",
            contactAdminWithdrawn: "This action was taken by an administrator. For more information, please contact support.",
            voiceVerification: "Hardware & Voice Audit",
            voiceInstruction: "Please read the following phrase aloud:",
            voicePrompt: "\"My name is {name} and I am verifying my attendance.\"",
            startRecording: "Press to Record",
            stopRecording: "Stop Recording",
            verifying: "Analyzing Biometric Voice Print...",
            voiceVerified: "Verification Successful",
            voiceContinue: "Continue to Terms",
            voiceFailed: "Verification failed. Please ensure you are speaking clearly.",
            recording: "Recording...",
            instructorMessageTitle: "IMPORTANT MESSAGE",
            instructorMessageDesc: "Please watch this brief message from your instructor.",
            makeupRequired: "Makeup Session Required",
            makeupMessage: "You have missed a required session. Per policy (2 absences allowed), you must complete a makeup session to remain in the program.",
            payAndStart: "Pay & Start Replay",
            missedModule: "Missed Module",
            absences: "Absences",
            watchToContinue: "Watch Video to Continue",
            mandatoryVideo: "Mandatory - Watch to Proceed",
            needCert: "Need a duplicate copy of your certificate?",
            purchaseCert: "Purchase Duplicate Certificate",
            processing: "Processing Payment...",
            certSuccess: "Success! A copy has been emailed to you.",
            enterCard: "Enter Payment Details",
            payAmount: "Pay {amount}",
            cancel: "Cancel",
            soundCheck: "Sound Check",
            soundInstruction: "Press the button below to play a test tone. If you hear it, click 'Verified'.",
            playSound: "Play Test Sound",
            soundVerifiedBtn: "I Hear the Sound - Verified",
            hardwareAuditLog: "Biometric Hardware Audit Logged"
        },
        es: {
            retrieveCode: "Recuperar Código",
            codeSent: "Si una cuenta coincide, se ha enviado su código.",
            enterEmail: "Ingrese su correo electrónico o número de teléfono para que se le envíe su código nuevamente.",
            emailPlaceholder: "ejemplo@email.com",
            sendCode: "Enviar Código",
            backToLogin: "Volver al Inicio de Sesión",
            codeInstruction: "Su código de clase fue enviado a su correo electrónico y teléfono.",
            uniqueClassCode: "Código Único de Clase",
            verifyCode: "Verificar Código",
            forgotCode: "¿Olvidó su código?",
            welcomeConfirm: "¡Bienvenido! Por favor confirme su identidad.",
            loading: "Cargando...",
            isThisYou: "¿Es usted?",
            noBack: "No, Volver",
            yesContinue: "Sí, Continuar",
            invalidCode: "Código de clase inválido. Por favor verifique el código e intente nuevamente.",
            welcomeUser: "¡Bienvenido, {name}!",
            nextClassIn: "Su Próxima Clase Comienza En:",
            days: "Días",
            hours: "Horas",
            minutes: "Minutos",
            seconds: "Segundos",
            preClassSetup: "Puede completar la configuración previa a la clase ahora para estar listo para su sesión.",
            setupChecklist: "Lista de Verificación de Configuración",
            checklist1: "1. Completar Documentación Previa al Curso",
            checklist2: "2. Selfie de Asistencia Diaria",
            checklist3: "3. Aceptar Términos del Aula",
            startSetup: "Iniciar Configuración Previa",
            continueSetup: "Continuar Configuración Previa",
            logOut: "Cerrar Sesión",
            preCoursePaperwork: "Documentación Previa al Curso",
            paperworkInstruction: "Por favor complete el formulario de recolección de datos requerido a continuación.",
            aiProctor: "Iniciando Proctor de IA...",
            cameraError: "Error de Cámara",
            fullName: "Nombre Completo",
            dob: "Fecha de Nacimiento",
            address: "Dirección Completa",
            emergencyName: "Nombre de Contacto de Emergencia",
            emergencyPhone: "Teléfono de Contacto de Emergencia",
            acknowledge: "Reconozco que la información proporcionada es precisa a mi leal saber y entender.",
            submitPaperwork: "Enviar Documentación y Continuar",
            selfieInstruction: "Por favor porcione su rostro en el marco para una selfie de asistencia diaria.",
            takePhoto: "Tomar Foto",
            termsInstruction: "Por favor revise y acepte los términos del aula.",
            termCamera: "Acepto mantener mi cámara encendida y permanecer visible en todo momento.",
            termMuted: "Entiendo que seré silenciado en la sesión principal y solo podré activar el sonido en salas de grupos.",
            termRecording: "Doy mi consentimiento para que esta sesión sea grabada con fines educativos y de cumplimiento.",
            agreeEnter: "Aceptar y Entrar al Aula",
            courseCompleted: "Curso Ya Completado",
            welcomeBack: "¡Bienvenido de nuevo, {name}! Nuestros registros muestran que ya ha completado exitosamente este curso.",
            course: "Curso",
            completionDate: "Fecha de Finalización",
            contactAdminError: "Si cree que esto es un error, por favor contacte a la administración.",
            rescheduleRequired: "Reprogramación Requerida",
            loggedLate: "Bienvenido, {name}. Nuestros registros muestran que inició sesión a las {time}, lo cual pasa el período de gracia para su clase programada.",
            markedAbsent: "Ha sido marcado como ausente y necesitará reprogramar para una sesión futura para recibir crédito.",
            contactReschedule: "Para reprogramar, por favor contacte a la administración al",
            accountInactive: "Cuenta Inactiva",
            inactiveMessage: "Bienvenido, {name}. Su cuenta está actualmente inactiva y no puede acceder al aula.",
            paymentHold: "Esto puede deberse a un pago pendiente u otra retención administrativa.",
            reactivateMessage: "Para reactivar su cuenta, por favor contacte a la administración al",
            identityMismatch: "Verificación de Identidad Fallida",
            identityMismatchMessage: "Nuestro sistema no pudo verificar su identidad. Por favor asegúrese de ser el estudiante registrado.",
            retakePhoto: "Volver a Tomar Foto",
            contactSupport: "Contactar Soporte",
            accountWithdrawn: "Acceso a Cuenta Revocado",
            withdrawnMessage: "Bienvenido, {name}. Su acceso a esta aula ha sido revocado.",
            contactAdminWithdrawn: "Esta acción fue tomada por un administrador. Para más información, por favor contacte a soporte.",
            voiceVerification: "Auditoría de Hardware y Voz",
            voiceInstruction: "Por favor lea la siguiente frase en voz alta:",
            voicePrompt: "\"Mi nombre es {name} y estoy verificando mi asistencia.\"",
            startRecording: "Presione para Grabar",
            stopRecording: "Detener Grabación",
            verifying: "Analizando Huella de Voz Biométrica...",
            voiceVerified: "Verificación Exitosa",
            voiceContinue: "Continuar a Términos",
            voiceFailed: "Verificación fallida. Por favor asegúrese de hablar claramente.",
            recording: "Grabando...",
            instructorMessageTitle: "MENSAJE IMPORTANTE",
            instructorMessageDesc: "Por favor vea este breve mensaje de su instructor.",
            makeupRequired: "Sesión de Recuperación Requerida",
            makeupMessage: "Ha perdido una sesión requerida. Según la política (se permiten 2 ausencias), debe completar una sesión de recuperación para permanecer en el programa.",
            payAndStart: "Pagar e Iniciar Repetición",
            missedModule: "Módulo Perdido",
            absences: "Ausencias",
            watchToContinue: "Ver Video para Continuar",
            mandatoryVideo: "Obligatorio - Ver para Proceder",
            needCert: "¿Necesita una copia de su certificado?",
            purchaseCert: "Comprar Certificado Duplicado",
            processing: "Procesando Pago...",
            certSuccess: "¡Éxito! Se le ha enviado una copia por correo electrónico.",
            enterCard: "Ingresar Detalles de Pago",
            payAmount: "Pagar {amount}",
            cancel: "Cancelar",
            soundCheck: "Prueba de Sonido",
            soundInstruction: "Presione el botón de abajo para reproducir un tono de prueba. Si lo escucha, haga clic en 'Verificado'.",
            playSound: "Reproducir Tono de Prueba",
            soundVerifiedBtn: "Escucho el Sonido - Verificado",
            hardwareAuditLog: "Auditoría de Hardware Registrada"
        }
    }[language];

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'es' : 'en');
    };


    useEffect(() => {
        setClassCode(prefilledCode || 'A83K-9B1P');
    }, [prefilledCode]);

    useEffect(() => {
        if (step === StudentLoginStep.Selfie || step === StudentLoginStep.Paperwork) {
            startCamera();
        }
    }, [step, startCamera]);

    // Audio Instruction for Voice Verification
    useEffect(() => {
        if (step === StudentLoginStep.VoiceVerification && hardwarePhase === 'mic') {
            const playAudioInstruction = () => {
                if ('speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                    // Choose message based on language
                    const instructionText = language === 'en' 
                        ? "To test your audio, please say your name first and last name after the beep."
                        : "Para probar su audio, por favor diga su nombre y apellido después del tono.";
                        
                    const utterance = new SpeechSynthesisUtterance(instructionText);
                    utterance.rate = 0.9;

                    utterance.onend = () => {
                        handlePlayBeep();
                    };

                    window.speechSynthesis.speak(utterance);
                }
            };

            const timer = setTimeout(playAudioInstruction, 600);
            
            return () => {
                clearTimeout(timer);
                window.speechSynthesis.cancel();
            };
        }
    }, [step, language, hardwarePhase]);

    const handlePlayBeep = () => {
        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioContextClass();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            
            osc.start();
            osc.stop(ctx.currentTime + 0.4);
        } catch (e) {
            console.error("Failed to play beep", e);
        }
    };

    useEffect(() => {
        if (step !== StudentLoginStep.Countdown) return;

        const calculateTimeRemaining = () => {
            const now = new Date();
            let nextClass = new Date();
            // Set target time to 9:00 AM
            nextClass.setHours(9, 0, 0, 0);

            // If it's already past 9:00 AM today, set the target for 9:00 AM tomorrow
            if (now.getTime() >= nextClass.getTime()) {
                nextClass.setDate(nextClass.getDate() + 1);
            }

            const totalSeconds = Math.floor((nextClass.getTime() - now.getTime()) / 1000);

            if (totalSeconds <= 0) {
                setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                // Optional: Automatically proceed if countdown finishes
                // setStep(StudentLoginStep.Paperwork);
                return;
            }

            const days = Math.floor(totalSeconds / (3600 * 24));
            const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            setTimeRemaining({ days, hours, minutes, seconds });
        };

        calculateTimeRemaining();
        const interval = setInterval(calculateTimeRemaining, 1000);
        return () => clearInterval(interval);
    }, [step]);
    
    // Auto-scroll FAQ chat
    useEffect(() => {
        if (faqScrollRef.current) {
            faqScrollRef.current.scrollTop = faqScrollRef.current.scrollHeight;
        }
    }, [faqMessages]);

    const handleVerifyCode = () => {
        setLoginError(null);
        setIsVideoWatched(false); // Reset video state for new login/verification
        const student = students.find(s => s.uniqueClassCode.replace(/-/g, '') === classCode.replace(/-/g, ''));
        if (student) {
            setFoundStudent(student);
            if (student.status === 'Completed') {
                setStep(StudentLoginStep.Completed);
            } else if (student.status === 'Reschedule Required') {
                setStep(StudentLoginStep.Reschedule);
            } else if (student.status === 'Inactive') {
                setStep(StudentLoginStep.Inactive);
            } else if (student.status === 'Withdrawn') {
                setStep(StudentLoginStep.Withdrawn);
            } else if (student.status === 'Makeup Required') {
                setStep(StudentLoginStep.MakeupRequired);
            } else {
                setStep(StudentLoginStep.Verify);
            }
        } else {
            setLoginError(t.invalidCode);
        }
    };

    const takePhotoAndProceed = () => {
        if (videoRef.current && canvasRef.current && foundStudent) {
            // Simulate verification delay
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            
            // Show loading state if needed, but for now we just proceed
            
            if (context) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg');
                
                // Simulate Identity Verification Logic
                setTimeout(() => {
                    if (foundStudent.name.includes("Fail")) {
                        setStep(StudentLoginStep.IdentityMismatch);
                    } else {
                        handleTakePhoto(foundStudent.name, dataUrl);
                        onMarkAttendance(foundStudent.id); // Mark attendance upon successful verification
                        // Reset sub-steps
                        setHardwarePhase('sound');
                        setSoundVerified(false);
                        setStep(StudentLoginStep.VoiceVerification);
                    }
                }, 1500); // 1.5s simulated delay
            }
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                setAudioBlob(audioBlob);
                stream.getTracks().forEach(track => track.stop());
                
                // Simulate verification process
                setVerificationStatus('verifying');
                setTimeout(() => {
                    setVerificationStatus('success');
                    // Create URL for the recording and pass it up
                    const audioUrl = URL.createObjectURL(audioBlob);
                    const timestamp = new Date().toISOString();
                    setRecordedAudioUrl(audioUrl);
                    if (foundStudent) {
                        onVoiceRecordingComplete(foundStudent.id, audioUrl);
                        onHardwareCheckComplete(foundStudent.id, timestamp);
                    }
                }, 2000);
            };

            mediaRecorder.start();
            setIsRecording(true);
            setAudioBlob(null);
            setVerificationStatus('idle');
        } catch (error) {
            console.error('Error accessing microphone:', error);
            setVerificationStatus('failed');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setTerms(prev => ({
            ...prev,
            [name]: checked
        }));
    };
    
    const handlePaperworkSubmit = () => {
        if (foundStudent) {
            onPaperworkSubmit(foundStudent.id, paperworkData);
        }
        setStep(StudentLoginStep.Selfie);
    };

    const handleMakeupPay = () => {
        if (foundStudent && onMakeupPayment) {
            onMakeupPayment(foundStudent.id);
            setStep(StudentLoginStep.Verify); // Proceed to verification after payment
        }
    };
    
    // Handler for duplicate certificate purchase
    const handleBuyCert = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!foundStudent || isPurchasingCert) return;
        setIsPurchasingCert(true);
        // Simulate processing
        setTimeout(() => {
            if (foundStudent && onPurchaseDuplicateCertificate) {
                onPurchaseDuplicateCertificate(foundStudent.id);
                setCertPurchaseSuccess(true);
                setShowCertPaymentForm(false);
                setCertCardInfo({ number: '', expiry: '', cvc: '' });
            }
            setIsPurchasingCert(false);
        }, 1500);
    };
    
    // Logic for FAQ Chat Widget in Countdown Screen
    const handleFaqSubmit = async (messageText?: string) => {
        const question = messageText || faqInput;
        if (!question.trim() || isFaqSending || !foundStudent) return;

        setIsFaqSending(true);
        setFaqMessages(prev => [...prev, { user: foundStudent.name, text: question }]);
        setFaqInput('');

        // Find current course for context
        const cohortMap: { [key: string]: string } = {
            'A': 'course-dwi-edu',
            'B': 'course-dwi-int',
            'C': 'course-breakout-test',
            'D': 'course-aepm',
            'E': 'course-break-test'
        };
        const courseId = cohortMap[foundStudent.cohort];
        const currentCourse = courses.find(c => c.id === courseId) || null;

        const response = await generateChatResponse(question, currentCourse, language);
        setFaqMessages(prev => [...prev, { user: 'AI', text: response }]);
        setIsFaqSending(false);
    };

    // Shared helper to retrieve student's current course object
    const getCourseForStudent = (student: Student) => {
        const cohortMap: { [key: string]: string } = {
            'A': 'course-dwi-edu',
            'B': 'course-dwi-int',
            'C': 'course-breakout-test',
            'D': 'course-aepm',
            'E': 'course-break-test'
        };
        const courseId = cohortMap[student.cohort];
        return courses.find(c => c.id === courseId);
    };

    const hasCompletedPaperwork = (student: Student, associatedCourse: Course | undefined): boolean => {
        if (!student.paperworkData) {
            return false;
        }

        const { paperworkData } = student;
        
        // Check for DWI/AEPM specific paperwork completeness
        if (associatedCourse && (associatedCourse.name === 'Texas DWI Education Program' || associatedCourse.name === 'DWI Intervention Program' || associatedCourse.name === 'AEPM')) {
            return !!(paperworkData.lastName &&
                  paperworkData.firstName &&
                  paperworkData.dob &&
                  paperworkData.bac &&
                  paperworkData.isSomeoneConcerned !== undefined &&
                  paperworkData.canStopDrinking !== undefined &&
                  paperworkData.preTestQ1 &&
                  paperworkData.preTestQ2 &&
                  paperworkData.ndpScreening);
        }
        
        // Fallback to generic paperwork check
        return !!(paperworkData.dob &&
                  paperworkData.address &&
                  paperworkData.emergencyContactName &&
                  paperworkData.emergencyContactPhone);
    };


    const renderStep = () => {
        switch (step) {
            case StudentLoginStep.Code:
                if (isRetrievingCode) {
                    return (
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 text-center mb-2">{t.retrieveCode}</h3>
                            <p className="text-center text-gray-600 mb-4">
                                {retrievalSent 
                                    ? t.codeSent
                                    : t.enterEmail
                                }
                            </p>
                            {!retrievalSent ? (
                                <>
                                    <div>
                                        <label htmlFor="retrieval-input" className="block text-sm font-medium text-gray-700">{t.emailPlaceholder.split('@')[0] + ' / Phone'}</label>
                                        <input 
                                            type="text" 
                                            id="retrieval-input" 
                                            value={retrievalInput}
                                            onChange={(e) => setRetrievalInput(e.target.value)}
                                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900" 
                                            placeholder={t.emailPlaceholder} 
                                        />
                                    </div>
                                    <button 
                                        onClick={() => setRetrievalSent(true)} 
                                        disabled={!retrievalInput}
                                        className="mt-6 w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 disabled:bg-blue-300"
                                    >
                                        {t.sendCode}
                                    </button>
                                </>
                            ) : null}
                            <button 
                                onClick={() => {
                                    setIsRetrievingCode(false);
                                    setRetrievalSent(false);
                                    setRetrievalInput('');
                                }} 
                                className="mt-4 w-full text-center text-sm font-medium text-blue-600 hover:text-blue-800"
                            >
                                {t.backToLogin}
                            </button>
                        </div>
                    );
                }
                return (
                    <div>
                        <p className="text-center text-gray-600 mb-4">{t.codeInstruction}</p>
                        <div>
                            <label htmlFor="class-code" className="block text-sm font-medium text-gray-700">{t.uniqueClassCode}</label>
                            <input 
                                type="text" 
                                id="class-code" 
                                value={classCode}
                                onChange={(e) => {
                                    setClassCode(e.target.value);
                                    if (loginError) setLoginError(null);
                                }}
                                className={`mt-1 block w-full px-4 py-3 border ${loginError ? 'border-red-500 ring-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-lg tracking-widest text-center font-mono bg-white text-gray-900`} 
                                placeholder="XXXX-XXXX" 
                            />
                            {loginError && (
                                <p className="mt-2 text-sm text-red-600 text-center font-medium animate-pulse">
                                    {loginError}
                                </p>
                            )}
                        </div>
                        <button onClick={handleVerifyCode} className="mt-6 w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300">
                            {t.verifyCode}
                        </button>
                        <div className="mt-4 text-center">
                            <button 
                                onClick={() => setIsRetrievingCode(true)}
                                className="text-sm font-medium text-blue-600 hover:text-blue-800"
                            >
                                {t.forgotCode}
                            </button>
                        </div>
                    </div>
                );
            case StudentLoginStep.Verify:
                return (
                    <div>
                        <p className="text-center text-gray-600 mb-6">{t.welcomeConfirm}</p>
                        <div className="p-4 bg-gray-100 rounded-lg text-center">
                            <span className="text-2xl font-bold text-gray-900">{foundStudent?.name || t.loading}</span>
                        </div>
                        <p className="text-center text-gray-600 my-6">{t.isThisYou}</p>
                        <div className="flex gap-4">
                            <button onClick={() => { setStep(StudentLoginStep.Code); setFoundStudent(null); }} className="w-full px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition duration-300">
                                {t.noBack}
                            </button>
                            <button onClick={() => setStep(StudentLoginStep.Countdown)} disabled={!foundStudent} className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 disabled:bg-blue-300">
                                {t.yesContinue}
                            </button>
                        </div>
                    </div>
                );
            case StudentLoginStep.MakeupRequired:
                if (!foundStudent || !foundStudent.makeupSession) return null;
                const missedModuleId = foundStudent.makeupSession.missedModuleId;
                // Find course and module name
                const studentCourse = getCourseForStudent(foundStudent);
                const missedModule = studentCourse?.modules.find(m => m.id === missedModuleId);
                const moduleName = missedModule ? missedModule.name : 'Unknown Module';
                const fee = foundStudent.makeupSession.fee || 50;

                return (
                    <div className="text-center">
                        <IconClock className="w-16 h-16 mx-auto text-orange-500 mb-4" />
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{t.makeupRequired}</h3>
                        <p className="text-gray-600 mb-6 px-4">
                            {t.makeupMessage}
                        </p>
                        
                        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6 text-left rounded-r-lg">
                            <div className="flex justify-between mb-2">
                                <span className="font-semibold text-gray-700">{t.missedModule}:</span>
                                <span className="text-gray-900">{moduleName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-gray-700">{t.absences}:</span>
                                <span className="text-red-600 font-bold">{foundStudent.absences} / 2 Allowed</span>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                            <div className="flex justify-between items-center mb-4 px-2">
                                <span className="text-lg font-medium text-gray-800">Makeup Session Fee</span>
                                <span className="text-2xl font-bold text-gray-900">${fee.toFixed(2)}</span>
                            </div>
                            
                            <div className="mb-4">
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <IconCreditCard className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border"
                                        placeholder="0000 0000 0000 0000"
                                        disabled // Mock input
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={handleMakeupPay}
                                className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 flex items-center justify-center gap-2"
                            >
                                <IconCreditCard className="w-5 h-5" />
                                {t.payAndStart}
                            </button>
                            <button
                                onClick={() => { setStep(StudentLoginStep.Code); setFoundStudent(null); }}
                                className="mt-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                            >
                                {t.logOut}
                            </button>
                        </div>
                    </div>
                );
            case StudentLoginStep.Countdown:
                if (!foundStudent) return null;

                const courseForStudent = getCourseForStudent(foundStudent);
                const paperworkComplete = hasCompletedPaperwork(foundStudent, courseForStudent);

                const handleStartPreClassSetup = () => {
                    if (paperworkComplete) {
                        setStep(StudentLoginStep.Selfie);
                    } else {
                        setStep(StudentLoginStep.Paperwork);
                    }
                };

                const CountdownUnit = ({ value, label }: { value: number, label: string }) => (
                    <div className="flex flex-col items-center p-2 rounded-lg bg-gray-100 min-w-[70px]">
                        <span className="text-4xl lg:text-5xl font-bold text-gray-900 tabular-nums">{String(value).padStart(2, '0')}</span>
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
                    </div>
                );

                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Side: Countdown and Setup */}
                        <div className="flex flex-col h-full">
                            <p className="text-center text-gray-600 mb-2">{t.welcomeUser.replace('{name}', foundStudent.name)}</p>
                            
                            <h3 className="text-xl font-bold text-gray-800 text-center mb-6">{t.nextClassIn}</h3>
                            
                            <div className="flex justify-center items-center gap-2 lg:gap-4 my-8" aria-live="off" aria-atomic="true">
                                <CountdownUnit value={timeRemaining.days} label={t.days} />
                                <span className="text-4xl font-light text-gray-300">:</span>
                                <CountdownUnit value={timeRemaining.hours} label={t.hours} />
                                <span className="text-4xl font-light text-gray-300">:</span>
                                <CountdownUnit value={timeRemaining.minutes} label={t.minutes} />
                                <span className="text-4xl font-light text-gray-300">:</span>
                                <CountdownUnit value={timeRemaining.seconds} label={t.seconds} />
                            </div>

                            <p className="text-center text-sm text-gray-600 mb-6">{t.preClassSetup}</p>
                            
                            <div className="my-6 p-4 border border-gray-200 rounded-lg space-y-3 bg-white">
                                <h4 className="font-semibold text-gray-800 text-center">{t.setupChecklist}</h4>
                                <div className={`flex items-center gap-3 p-2 rounded ${paperworkComplete ? 'bg-green-50' : 'bg-gray-50'}`}>
                                    {paperworkComplete ? <IconCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /> : <div className="w-5 h-5 border-2 border-gray-300 rounded-full flex-shrink-0" />}
                                    <span className={`${paperworkComplete ? 'text-gray-500 line-through' : 'text-gray-800'}`}>{t.checklist1}</span>
                                </div>
                                <div className="flex items-center gap-3 p-2 bg-gray-50">
                                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full flex-shrink-0" />
                                    <span className="text-gray-800">{t.checklist2}</span>
                                </div>
                                <div className="flex items-center gap-3 p-2 bg-gray-50">
                                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full flex-shrink-0" />
                                    <span className="text-gray-800">{t.checklist3}</span>
                                </div>
                            </div>

                            <button onClick={handleStartPreClassSetup} className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300">
                                {paperworkComplete ? t.continueSetup : t.startSetup}
                            </button>
                            <button 
                                onClick={() => { setStep(StudentLoginStep.Code); setFoundStudent(null); }} 
                                className="mt-4 w-full text-center text-sm font-medium text-gray-600 hover:text-gray-800"
                            >
                                {t.logOut}
                            </button>
                        </div>

                        {/* Right Side: FAQ Chat Widget */}
                        <div className="flex flex-col bg-gray-50 rounded-xl border border-gray-200 h-[500px] md:h-auto overflow-hidden">
                            <div className="bg-blue-600 p-4 text-white flex items-center gap-2">
                                <IconRobot className="w-6 h-6" />
                                <h4 className="font-semibold">Classroom FAQ & Support</h4>
                            </div>
                            
                            <div ref={faqScrollRef} className="flex-1 p-4 overflow-y-auto space-y-4">
                                {faqMessages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.user === 'AI' ? 'justify-start' : 'justify-end'}`}>
                                        <div className={`max-w-[85%] p-3 rounded-lg text-sm ${msg.user === 'AI' ? 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm' : 'bg-blue-600 text-white rounded-tr-none shadow-md'}`}>
                                            <p>{msg.text}</p>
                                        </div>
                                    </div>
                                ))}
                                {isFaqSending && (
                                    <div className="flex justify-start">
                                        <div className="bg-white border border-gray-200 p-3 rounded-lg rounded-tl-none shadow-sm">
                                            <div className="flex space-x-1">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-gray-200 bg-white">
                                <div className="mb-3 flex flex-wrap gap-2">
                                    <button onClick={() => handleFaqSubmit("Will we have breaks?")} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100 hover:bg-blue-100 transition">Will we have breaks?</button>
                                    <button onClick={() => handleFaqSubmit("Can I work during class?")} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100 hover:bg-blue-100 transition">Can I work during class?</button>
                                    <button onClick={() => handleFaqSubmit("Do I have to watch the video first?")} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100 hover:bg-blue-100 transition">Do I have to watch the video first?</button>
                                    <button onClick={() => handleFaqSubmit("Can I drive during class?")} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100 hover:bg-blue-100 transition">Can I drive during class?</button>
                                </div>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={faqInput} 
                                        onChange={(e) => setFaqInput(e.target.value)} 
                                        onKeyPress={(e) => e.key === 'Enter' && handleFaqSubmit()} 
                                        placeholder="Ask a question..." 
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                        disabled={isFaqSending}
                                    />
                                    <button onClick={() => handleFaqSubmit()} disabled={!faqInput.trim() || isFaqSending} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300">
                                        <IconSend className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case StudentLoginStep.Paperwork:
                if (foundStudent) {
                    const course = getCourseForStudent(foundStudent);
                    if (course && (course.name === 'Texas DWI Education Program' || course.name === 'DWI Intervention Program' || course.name === 'AEPM')) {
                        return <DwiEducationPaperwork 
                                    studentName={foundStudent.name}
                                    onComplete={(data) => {
                                        if (foundStudent) onPaperworkSubmit(foundStudent.id, data);
                                        setStep(StudentLoginStep.Selfie);
                                    }} 
                                    courseName={course.name} 
                                    mediaStream={mediaStream} 
                                    cameraError={cameraError} 
                                    formConfiguration={course.formConfiguration}
                                    language={language}
                                />;
                    }
                }
                
                // Fallback to original paperwork for all other courses
                const isPaperworkComplete = 
                    paperworkData.dob &&
                    paperworkData.address &&
                    paperworkData.emergencyContactName &&
                    paperworkData.emergencyContactPhone &&
                    acknowledged;
            
                const handlePaperworkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                    const { name, value, type, checked } = e.target;
                    if (name === 'acknowledged') {
                        setAcknowledged(checked);
                    } else {
                         setPaperworkData(prev => ({
                            ...prev,
                            [name]: value
                        }));
                    }
                };
            
                return (
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 text-center mb-2">{t.preCoursePaperwork}</h3>
                        <p className="text-center text-gray-600 mb-4">{t.paperworkInstruction}</p>
            
                        <div className="w-full aspect-video bg-gray-900 rounded-lg flex flex-col items-center justify-center overflow-hidden border-4 border-blue-400/50 relative mb-4">
                            {cameraError ? (
                                <div role="alert" className="w-full h-full bg-red-900/50 flex flex-col items-center justify-center p-4 text-center">
                                    <IconCameraOff className="w-12 h-12 text-red-400 mb-4" />
                                    <p className="text-red-300 font-semibold">{t.cameraError}</p>
                                    <p className="text-red-400 text-sm mt-2">{cameraError}</p>
                                </div>
                            ) : mediaStream ? (
                                <VideoFeed stream={mediaStream} />
                            ) : (
                                <div className="flex flex-col items-center justify-center">
                                    <IconEye className="w-12 h-12 text-blue-400 animate-pulse" />
                                    <p className="text-blue-200 mt-2 text-sm font-medium">{t.aiProctor}</p>
                                </div>
                            )}
                            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
                                <span className="w-2 h-2 bg-red-500 rounded-full inline-block mr-1"></span> REC
                            </div>
                        </div>
            
                        <form className="space-y-3 max-h-[40vh] overflow-y-auto pr-4 -mr-4">
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">{t.fullName}</label>
                                <input 
                                    type="text" 
                                    id="fullName" 
                                    value={foundStudent?.name || ''}
                                    readOnly
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label htmlFor="dob" className="block text-sm font-medium text-gray-700">{t.dob}</label>
                                <input 
                                    type="date" 
                                    id="dob" 
                                    name="dob"
                                    value={paperworkData.dob}
                                    onChange={handlePaperworkChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700">{t.address}</label>
                                <input 
                                    type="text" 
                                    id="address" 
                                    name="address"
                                    value={paperworkData.address}
                                    onChange={handlePaperworkChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="123 Main St, Anytown, USA"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="emergencyContactName" className="block text-sm font-medium text-gray-700">{t.emergencyName}</label>
                                <input 
                                    type="text" 
                                    id="emergencyContactName" 
                                    name="emergencyContactName"
                                    value={paperworkData.emergencyContactName}
                                    onChange={handlePaperworkChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                             <div>
                                <label htmlFor="emergencyContactPhone" className="block text-sm font-medium text-gray-700">{t.emergencyPhone}</label>
                                <input 
                                    type="tel" 
                                    id="emergencyContactPhone" 
                                    name="emergencyContactPhone"
                                    value={paperworkData.emergencyContactPhone}
                                    onChange={handlePaperworkChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="(555) 555-5555"
                                    required
                                />
                            </div>
                             <div className="pt-2">
                                <label className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        name="acknowledged"
                                        checked={acknowledged}
                                        onChange={(e) => setAcknowledged(e.target.checked)}
                                        className="mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-gray-700 text-sm">{t.acknowledge}</span>
                                </label>
                            </div>
                        </form>
                        
                        <button 
                            onClick={handlePaperworkSubmit}
                            disabled={!isPaperworkComplete}
                            className="mt-6 w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 disabled:bg-blue-300 disabled:cursor-not-allowed"
                        >
                            {t.submitPaperwork}
                        </button>
                    </div>
                );
            case StudentLoginStep.Selfie:
                return (
                    <div>
                        <p className="text-center text-gray-600 mb-4">{t.selfieInstruction}</p>
                         {cameraError ? (
                            <div role="alert" className="w-full aspect-square bg-red-100 rounded-lg flex flex-col items-center justify-center p-4 text-center border-4 border-red-200">
                                <IconCameraOff className="w-12 h-12 text-red-500 mb-4" />
                                <p className="text-red-700 font-semibold">{t.cameraError}</p>
                                <p className="text-red-600 text-sm mt-2">{cameraError}</p>
                            </div>
                        ) : (
                            <div className="w-full aspect-square bg-gray-900 rounded-lg flex items-center justify-center overflow-hidden border-4 border-gray-200 relative">
                                {mediaStream ? <VideoFeed stream={mediaStream} ref={videoRef} /> : <p className="text-white animate-pulse">{t.loading}</p>}
                                {/* Overlay for verification process feedback */}
                                {step === StudentLoginStep.Selfie && (
                                    <div className="absolute bottom-4 left-0 right-0 text-center">
                                        <p className="text-white bg-black/50 inline-block px-3 py-1 rounded-full text-sm">Align face in center</p>
                                    </div>
                                )}
                            </div>
                        )}
                        <canvas ref={canvasRef} className="hidden"></canvas>
                        <button 
                            onClick={takePhotoAndProceed}
                            disabled={!mediaStream || !!cameraError}
                            className="mt-6 w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed">
                            <IconCamera />
                            {t.takePhoto}
                        </button>
                    </div>
                );
            case StudentLoginStep.VoiceVerification:
                return (
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{t.voiceVerification}</h3>
                        
                        {hardwarePhase === 'sound' ? (
                            <div className="animate-fade-in space-y-6 py-4">
                                <div className="flex flex-col items-center">
                                    <div className={`w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-4 border-2 ${soundVerified ? 'border-green-500' : 'border-blue-200 shadow-lg shadow-blue-100'}`}>
                                        <IconUnmuted className={`w-10 h-10 ${soundVerified ? 'text-green-500' : 'text-blue-600'}`} />
                                    </div>
                                    <p className="text-gray-600 mb-4 px-8">{t.soundInstruction}</p>
                                </div>
                                
                                <div className="space-y-4">
                                    <button
                                        onClick={handlePlayBeep}
                                        className="w-full px-6 py-4 bg-white border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <IconUnmuted className="w-5 h-5" />
                                        {t.playSound}
                                    </button>
                                    
                                    <button
                                        onClick={() => setHardwarePhase('mic')}
                                        className="w-full px-6 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-md"
                                    >
                                        <IconCheckCircle className="w-5 h-5" />
                                        {t.soundVerifiedBtn}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="animate-fade-in">
                                <p className="text-gray-600 mb-2">{t.voiceInstruction}</p>
                                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-inner">
                                    <p className="text-lg font-medium text-blue-900 italic">
                                        {t.voicePrompt.replace('{name}', foundStudent?.name || 'Student')}
                                    </p>
                                </div>
                                
                                <div className="mb-8 flex flex-col items-center justify-center relative min-h-[120px]">
                                    {verificationStatus === 'verifying' ? (
                                        <div className="flex flex-col items-center animate-fade-in">
                                            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                                            <p className="text-blue-600 font-semibold">{t.verifying}</p>
                                        </div>
                                    ) : verificationStatus === 'success' ? (
                                        <div className="flex flex-col items-center animate-fade-in w-full">
                                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
                                                <IconCheckCircle className="w-10 h-10 text-green-600" />
                                            </div>
                                            <p className="text-green-600 font-bold text-lg mb-1">{t.voiceVerified}</p>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                                                <IconCheckCircle className="w-3 h-3" /> {t.hardwareAuditLog}
                                            </p>
                                            {recordedAudioUrl && (
                                                <div className="w-full max-w-xs mt-2 border border-gray-100 rounded-lg p-2 bg-gray-50 shadow-inner">
                                                    <audio controls src={recordedAudioUrl} className="w-full h-8" />
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <button
                                                onClick={isRecording ? stopRecording : startRecording}
                                                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all transform shadow-xl border-4 ${
                                                    isRecording 
                                                        ? 'bg-red-600 border-red-300 animate-pulse scale-110' 
                                                        : 'bg-blue-600 border-blue-200 hover:bg-blue-700 hover:scale-105'
                                                }`}
                                            >
                                                {isRecording ? (
                                                    <IconStopCircle className="w-12 h-12 text-white" />
                                                ) : (
                                                    <IconMic className="w-12 h-12 text-white" />
                                                )}
                                            </button>
                                            
                                            {isRecording && (
                                                <div className="mt-4 flex gap-1 h-6 items-end">
                                                    {[...Array(5)].map((_, i) => (
                                                        <div 
                                                            key={i} 
                                                            className="w-1.5 bg-blue-500 rounded-full animate-pulse" 
                                                            style={{ 
                                                                height: `${Math.random() * 100}%`,
                                                                animationDuration: '0.5s',
                                                                animationDelay: `${i * 0.1}s` 
                                                            }}
                                                        ></div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    
                                    {!isRecording && verificationStatus === 'idle' && (
                                        <p className="mt-4 text-sm font-medium text-gray-500">{t.startRecording}</p>
                                    )}
                                    {isRecording && (
                                        <p className="mt-2 text-sm text-red-600 font-bold uppercase tracking-wider animate-pulse">{t.recording}</p>
                                    )}
                                    {verificationStatus === 'failed' && (
                                        <p className="mt-4 text-sm text-red-600 font-medium bg-red-50 px-3 py-1 rounded">{t.voiceFailed}</p>
                                    )}
                                </div>

                                {verificationStatus === 'success' && (
                                    <button
                                        onClick={() => setStep(StudentLoginStep.Terms)}
                                        className="w-full px-6 py-4 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                                    >
                                        {t.voiceContinue} <span aria-hidden="true">&rarr;</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                );
            case StudentLoginStep.IdentityMismatch:
                return (
                    <div className="text-center">
                        <IconXCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{t.identityMismatch}</h3>
                        <p className="text-gray-600 mb-6">{t.identityMismatchMessage}</p>
                        <div className="space-y-4">
                            <button
                                onClick={() => setStep(StudentLoginStep.Selfie)}
                                className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
                            >
                                {t.retakePhoto}
                            </button>
                            <button
                                onClick={() => { /* Placeholder for support action */ alert("Support ticket created."); }}
                                className="w-full px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
                            >
                                {t.contactSupport}
                            </button>
                        </div>
                    </div>
                );
            case StudentLoginStep.Withdrawn:
                 if (!foundStudent) return null;

                return (
                    <div className="text-center">
                        <IconUserX className="w-16 h-16 mx-auto text-red-600 mb-4" />
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{t.accountWithdrawn}</h3>
                        <p className="text-gray-600 mb-6">
                            {t.withdrawnMessage.replace('{name}', foundStudent.name)}
                        </p>
                         <div className="p-4 bg-red-50 rounded-lg text-left space-y-2 border border-red-200">
                             <p className="text-sm text-red-700">{t.contactAdminWithdrawn}</p>
                        </div>
                        <button
                            onClick={() => { setStep(StudentLoginStep.Code); setFoundStudent(null); }}
                            className="mt-6 w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
                        >
                            {t.logOut}
                        </button>
                    </div>
                );
            case StudentLoginStep.Terms:
                const allTermsAgreed = Object.values(terms).every(Boolean);
                return (
                    <div>
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-lg font-bold text-red-600 uppercase">{t.instructorMessageTitle}</h4>
                                {isVideoWatched && <span className="text-green-600 font-bold flex items-center gap-1 text-sm animate-fade-in"><IconCheckCircle className="w-4 h-4" /> Watched</span>}
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{t.instructorMessageDesc}</p>
                            <div className="w-full aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-md border border-gray-200 relative group">
                                <video 
                                    controls 
                                    className="w-full h-full object-cover"
                                    poster="https://placehold.co/640x360/333/FFF?text=Instructor+Video"
                                    onEnded={() => setIsVideoWatched(true)}
                                >
                                    <source src="https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                                {!isVideoWatched && (
                                    <div className="absolute top-4 left-4 pointer-events-none">
                                        <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded shadow-lg animate-pulse uppercase tracking-wide">
                                            {t.mandatoryVideo}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <p className="text-center text-gray-600 mb-4">{t.termsInstruction}</p>
                        <div className={`space-y-4 p-4 border border-gray-200 rounded-lg max-h-60 overflow-y-auto transition-all duration-300 ${!isVideoWatched ? 'bg-gray-100 opacity-60' : 'bg-white'}`}>
                            <label className={`flex items-start gap-3 ${!isVideoWatched ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                                <input
                                    type="checkbox"
                                    name="cameraOn"
                                    checked={terms.cameraOn}
                                    onChange={handleTermChange}
                                    disabled={!isVideoWatched}
                                    className="mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:text-gray-400"
                                />
                                <span className="text-gray-700">{t.termCamera}</span>
                            </label>
                            <label className={`flex items-start gap-3 ${!isVideoWatched ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                                <input
                                    type="checkbox"
                                    name="muted"
                                    checked={terms.muted}
                                    onChange={handleTermChange}
                                    disabled={!isVideoWatched}
                                    className="mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:text-gray-400"
                                />
                                <span className="text-gray-700">{t.termMuted}</span>
                            </label>
                            <label className={`flex items-start gap-3 ${!isVideoWatched ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                                <input
                                    type="checkbox"
                                    name="recording"
                                    checked={terms.recording}
                                    onChange={handleTermChange}
                                    disabled={!isVideoWatched}
                                    className="mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:text-gray-400"
                                />
                                <span className="text-gray-700">{t.termRecording}</span>
                            </label>
                        </div>
                        <button
                            onClick={() => foundStudent && startClassroom(foundStudent)}
                            disabled={!allTermsAgreed || !foundStudent || !isVideoWatched}
                            className={`mt-6 w-full px-6 py-3 font-semibold rounded-lg shadow-md transition duration-300 flex items-center justify-center gap-2 ${
                                !isVideoWatched 
                                    ? 'bg-gray-400 text-gray-100 cursor-not-allowed' 
                                    : !allTermsAgreed 
                                        ? 'bg-green-300 text-white cursor-not-allowed' 
                                        : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                        >
                            {!isVideoWatched ? t.watchToContinue : t.agreeEnter}
                        </button>
                    </div>
                );
            case StudentLoginStep.Completed:
                if (!foundStudent) return null;
                const completedCourse = getCourseForStudent(foundStudent);
                const duplicateCertFee = completedCourse?.deactivationPolicy?.duplicateCertificateFee ?? 25.00;

                return (
                    <div className="text-center">
                        <IconCheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{t.courseCompleted}</h3>
                        <p className="text-gray-600 mb-6">
                            {t.welcomeBack.replace('{name}', foundStudent.name)}
                        </p>
                        <div className="p-4 bg-gray-100 rounded-lg text-left space-y-2">
                            <p><span className="font-semibold text-gray-700">{t.course}:</span> <span className="text-gray-900">{completedCourse?.name || 'N/A'}</span></p>
                            <p><span className="font-semibold text-gray-700">{t.completionDate}:</span> <span className="text-gray-900">{new Date(foundStudent.attendance.lastActivity).toLocaleDateString()}</span></p>
                        </div>
                        
                        <div className="mt-6 border-t border-gray-200 pt-4">
                            <p className="text-sm text-gray-600 mb-3">{t.needCert}</p>
                            {certPurchaseSuccess ? (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-center gap-2 text-green-700 animate-fade-in">
                                    <IconCheckCircle className="w-5 h-5" />
                                    {t.certSuccess}
                                </div>
                            ) : showCertPaymentForm ? (
                                <form onSubmit={handleBuyCert} className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-left animate-fade-in">
                                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <IconCreditCard className="w-4 h-4"/> {t.enterCard}
                                    </h4>
                                    <div className="space-y-3 mb-4">
                                        <input 
                                            type="text" 
                                            placeholder="Card Number" 
                                            required 
                                            className="w-full p-2 border border-gray-300 rounded text-sm"
                                            value={certCardInfo.number}
                                            onChange={(e) => setCertCardInfo({...certCardInfo, number: e.target.value})}
                                        />
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                placeholder="MM/YY" 
                                                required 
                                                className="w-1/2 p-2 border border-gray-300 rounded text-sm"
                                                value={certCardInfo.expiry}
                                                onChange={(e) => setCertCardInfo({...certCardInfo, expiry: e.target.value})}
                                            />
                                            <input 
                                                type="text" 
                                                placeholder="CVC" 
                                                required 
                                                className="w-1/2 p-2 border border-gray-300 rounded text-sm"
                                                value={certCardInfo.cvc}
                                                onChange={(e) => setCertCardInfo({...certCardInfo, cvc: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            type="button" 
                                            onClick={() => setShowCertPaymentForm(false)}
                                            className="w-1/2 px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition text-sm"
                                        >
                                            {t.cancel}
                                        </button>
                                        <button 
                                            type="submit"
                                            disabled={isPurchasingCert}
                                            className="w-1/2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:bg-blue-400 text-sm"
                                        >
                                            {isPurchasingCert ? (
                                                <IconClock className="w-4 h-4 animate-spin" />
                                            ) : t.payAmount.replace('{amount}', `$${duplicateCertFee.toFixed(2)}`)}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <button 
                                    onClick={() => setShowCertPaymentForm(true)}
                                    className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition flex items-center justify-center gap-2"
                                >
                                    <IconFileText className="w-4 h-4" />
                                    {t.purchaseCert} {`($${duplicateCertFee.toFixed(2)})`}
                                </button>
                            )}
                        </div>

                        <p className="text-sm text-gray-500 mt-6">
                            {t.contactAdminError}
                        </p>
                        <button
                            onClick={() => { setStep(StudentLoginStep.Code); setFoundStudent(null); }}
                            className="mt-6 w-full px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-300 transition"
                        >
                            {t.logOut}
                        </button>
                    </div>
                );
            case StudentLoginStep.Reschedule:
                if (!foundStudent) return null;
                const courseForReschedule = getCourseForStudent(foundStudent);
                const loginTime = new Date(foundStudent.attendance.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                    <div className="text-center">
                        <IconXCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{t.rescheduleRequired}</h3>
                        <p className="text-gray-600 mb-6">
                            {t.loggedLate.replace('{name}', foundStudent.name).replace('{time}', loginTime)}
                        </p>
                        <div className="p-4 bg-red-50 rounded-lg text-left space-y-2 border border-red-200">
                             <p><span className="font-semibold text-gray-700">{t.course}:</span> <span className="text-gray-900">{courseForReschedule?.name || 'N/A'}</span></p>
                             <p className="text-sm text-red-700">{t.markedAbsent}</p>
                        </div>
                        <p className="text-sm text-gray-500 mt-6">
                            {t.contactReschedule} <a href="tel:555-123-4567" className="font-semibold text-blue-600 hover:underline">555-123-4567</a>.
                        </p>
                        <button
                            onClick={() => { setStep(StudentLoginStep.Code); setFoundStudent(null); }}
                            className="mt-6 w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
                        >
                            {t.logOut}
                        </button>
                    </div>
                );
            case StudentLoginStep.Inactive:
                 if (!foundStudent) return null;

                return (
                    <div className="text-center">
                        <IconXCircle className="w-16 h-16 mx-auto text-orange-500 mb-4" />
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{t.accountInactive}</h3>
                        <p className="text-gray-600 mb-6">
                            {t.inactiveMessage.replace('{name}', foundStudent.name)}
                        </p>
                         <div className="p-4 bg-orange-50 rounded-lg text-left space-y-2 border border-orange-200">
                             <p className="text-sm text-orange-700">{t.paymentHold}</p>
                        </div>
                        <p className="text-sm text-gray-500 mt-6">
                            {t.reactivateMessage} <a href="tel:555-123-4567" className="font-semibold text-blue-600 hover:underline">555-123-4567</a>.
                        </p>
                        <button
                            onClick={() => { setStep(StudentLoginStep.Code); setFoundStudent(null); }}
                            className="mt-6 w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
                        >
                            {t.logOut}
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    // Calculate if current step should be wide
    const isWideStep = step === StudentLoginStep.Countdown || 
                       step === StudentLoginStep.Paperwork || 
                       step === StudentLoginStep.Terms || 
                       step === StudentLoginStep.Completed || 
                       step === StudentLoginStep.VoiceVerification;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 relative p-4">
             <button 
                type="button"
                onClick={toggleLanguage} 
                className="fixed top-6 right-6 flex items-center gap-2 bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-full hover:bg-gray-100 transition shadow-sm z-50 cursor-pointer"
            >
                <IconGlobe className="w-5 h-5" />
                <span className="text-sm font-semibold">{language === 'en' ? 'Español' : 'English'}</span>
            </button>

            <div className={`w-full p-8 bg-white shadow-2xl rounded-xl border border-gray-200 transition-all duration-500 ${isWideStep ? 'max-w-5xl' : 'max-w-md'}`}>
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Student Class Login</h2>
                </div>
                {renderStep()}
            </div>
        </div>
    );
};

export default StudentLogin;
