
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChatLogEntry, LiveSession, InstructorType, Student } from '../../types';
import { IconCameraOff, IconMic, IconMuted, IconRobot, IconSend, IconUserX, IconGavel, IconClose, IconWarning, IconActivity, IconRefreshCw, IconVideoOn } from '../icons';

interface AdminMonitorProps {
    session: LiveSession | null;
    chatLog: ChatLogEntry[];
    studentPhotos: Record<string, string>;
    onSendMessage: (message: string, recipient?: string) => void;
    students: Student[];
    onRemoveStudent: (studentId: number, reason: string, details: string) => void;
}

interface StudentTileProps {
    studentId: number;
    name: string;
    status: 'active' | 'alert' | 'idle';
    photoUrl?: string | null;
    isMuted: boolean;
    onRemove: (id: number, name: string) => void;
    onAlert: (name: string) => void;
    forceLive?: boolean;
}

const StudentTile: React.FC<StudentTileProps> = ({ studentId, name, status, photoUrl, isMuted, onRemove, onAlert, forceLive }) => {
    const [isLiveView, setIsLiveView] = useState(false);
    const [bitrate, setBitrate] = useState('1.2');
    const [latency, setLatency] = useState('45');

    // Effect to sync with global "Live" toggle
    useEffect(() => {
        if (forceLive !== undefined) {
            setIsLiveView(forceLive);
        }
    }, [forceLive]);

    // Simulate jittery telemetry
    useEffect(() => {
        if (!isLiveView) return;
        const interval = setInterval(() => {
            setBitrate((1 + Math.random() * 0.5).toFixed(1));
            setLatency(Math.floor(30 + Math.random() * 40).toString());
        }, 3000);
        return () => clearInterval(interval);
    }, [isLiveView]);

    const borderColor = status === 'alert' ? 'border-4 border-red-500 animate-pulse' : 'border border-gray-200';
    const statusColor = status === 'alert' ? 'bg-red-500' : 'bg-green-500';

    const handleToggleView = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (status !== 'alert') {
            setIsLiveView(prev => !prev);
        }
    };

    // Use a unique-ish video for each student to simulate variety
    const videoId = (studentId % 3) + 1;
    const mockVideoUrl = `https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4#t=${studentId * 10}`;

    return (
        <div className={`relative p-2 bg-white rounded-lg shadow ${borderColor} group transition-all hover:shadow-lg`}>
            <div className="w-full aspect-video rounded flex items-center justify-center overflow-hidden bg-gray-900 relative">
                {status === 'alert' ? (
                    <div className="w-full h-full bg-black flex flex-col items-center justify-center gap-2">
                         <IconCameraOff className="text-red-500 w-10 h-10 animate-pulse"/>
                         <span className="text-[10px] font-black text-red-500 uppercase tracking-tighter">Signal Lost</span>
                    </div>
                ) : isLiveView ? (
                     <div className="w-full h-full bg-black flex items-center justify-center relative">
                        <video 
                            src={mockVideoUrl} 
                            autoPlay 
                            loop 
                            muted 
                            playsInline
                            className="w-full h-full object-cover opacity-80"
                        />
                        {/* Stream Technical Overlay */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 bg-red-600 px-1.5 py-0.5 rounded-sm shadow-sm">
                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                                <span className="text-white text-[9px] font-black tracking-tighter">LIVE</span>
                            </div>
                            <div className="bg-black/40 backdrop-blur-md px-1 py-0.5 rounded text-[8px] font-mono text-green-400 border border-white/10">
                                {bitrate} Mbps | {latency}ms
                            </div>
                        </div>
                        {/* Simulated Scanline Effect */}
                        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
                    </div>
                ) : photoUrl ? (
                    <img src={photoUrl} alt={`Attendance view of ${name}`} className="object-cover w-full h-full" />
                ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <span className="text-gray-400 text-sm font-black uppercase tracking-widest">CAM ON</span>
                    </div>
                )}
                
                {/* Overlay for actions */}
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onAlert(name); }}
                        className="flex items-center gap-2 px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 shadow-md font-bold text-xs w-32 justify-center transition-transform transform active:scale-95"
                        title="Send Camera Warning"
                    >
                        <IconWarning className="w-4 h-4" />
                        Alert Camera
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onRemove(studentId, name); }}
                        className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 shadow-md font-bold text-xs w-32 justify-center transition-transform transform active:scale-95"
                    >
                        <IconUserX className="w-4 h-4" />
                        Remove User
                    </button>
                </div>
            </div>
            
            {/* Bottom Info Bar */}
            <div className="mt-2 flex justify-between items-center min-h-[28px]">
                <div className="flex items-center gap-2 truncate flex-1">
                    {isMuted ? 
                        <IconMuted className="w-3.5 h-3.5 text-red-500 flex-shrink-0" title="Muted" /> : 
                        <IconMic className="w-3.5 h-3.5 text-green-500 flex-shrink-0 animate-pulse" title="Unmuted" />
                    }
                    <p className="text-xs font-bold text-gray-700 truncate" title={name}>{name}</p>
                </div>

                <div className="flex items-center gap-1">
                    {status !== 'alert' && (
                        <button 
                            onClick={handleToggleView} 
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded transition-all flex items-center gap-1 ${isLiveView ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                            aria-label={`Switch to ${isLiveView ? 'selfie' : 'live'} view for ${name}`}
                        >
                            {isLiveView ? <><IconVideoOn className="w-2.5 h-2.5" /> Live</> : 'Selfie'}
                        </button>
                    )}
                    <span className={`w-2 h-2 rounded-full ${statusColor}`} title={status === 'alert' ? 'Camera Off' : 'Active Connection'}></span>
                </div>
            </div>
        </div>
    );
};

const AdminMonitor: React.FC<AdminMonitorProps> = ({ session, chatLog, studentPhotos, onSendMessage, students, onRemoveStudent }) => {
    const [chatInput, setChatInput] = useState('');
    const [recipient, setRecipient] = useState<string>('Broadcast');
    const [studentToRemove, setStudentToRemove] = useState<{ id: number, name: string } | null>(null);
    const [removalReason, setRemovalReason] = useState('Disruptive Behavior');
    const [removalDetails, setRemovalDetails] = useState('');
    const [globalLiveMode, setGlobalLiveMode] = useState(false);
    
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatLog]);

    const activeStudents = useMemo(() => {
        return students.filter(s => s.status !== 'Withdrawn' && s.status !== 'Completed' && s.status !== 'Inactive').sort((a, b) => {
            const lastNameA = a.name.trim().split(' ').pop() || '';
            const lastNameB = b.name.trim().split(' ').pop() || '';
            return lastNameA.localeCompare(lastNameB);
        });
    }, [students]);

    const isAISession = session?.instructorType === InstructorType.AI;

    const handleSend = () => {
        if (chatInput.trim()) {
            const recipientName = recipient === 'Broadcast' ? undefined : recipient;
            onSendMessage(chatInput.trim(), recipientName);
            setChatInput('');
        }
    };

    const handleCameraAlert = (name: string) => {
        onSendMessage("⚠️ ATTENTION: Please ensure your camera is ON and you are clearly visible.", name);
    };

    const handleRemoveClick = (id: number, name: string) => {
        setStudentToRemove({ id, name });
        setRemovalReason('Disruptive Behavior');
        setRemovalDetails('');
    };

    const handleConfirmRemoval = () => {
        if (studentToRemove) {
            onRemoveStudent(studentToRemove.id, removalReason, removalDetails);
            setStudentToRemove(null);
        }
    };

    const StudentGrid = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {activeStudents.map(s => {
                const photoUrl = studentPhotos[s.name];
                return <StudentTile 
                    key={s.id}
                    studentId={s.id}
                    name={s.name} 
                    status={s.status === 'On Watch' ? 'alert' : 'active'} 
                    photoUrl={photoUrl}
                    isMuted={true}
                    onRemove={handleRemoveClick}
                    onAlert={handleCameraAlert}
                    forceLive={globalLiveMode}
                />
            })}
        </div>
    );

    const RemovalModal = () => {
        if (!studentToRemove) return null;

        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-md border border-red-200 overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-red-50">
                        <div className="flex items-center gap-2 text-red-800">
                            <IconGavel className="w-6 h-6" />
                            <h2 className="text-lg font-bold">Remove Student</h2>
                        </div>
                        <button onClick={() => setStudentToRemove(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <IconClose className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="p-6 space-y-4">
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <IconWarning className="h-5 w-5 text-yellow-400" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-xs text-yellow-700">
                                        Removal of <strong>{studentToRemove.name}</strong> will be logged as a failure to meet program standards.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="removalReason" className="block text-xs font-black text-gray-400 uppercase mb-1">Reason</label>
                            <select
                                id="removalReason"
                                value={removalReason}
                                onChange={(e) => setRemovalReason(e.target.value)}
                                className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                            >
                                <option value="Disruptive Behavior">Disruptive Behavior</option>
                                <option value="Inappropriate Content">Inappropriate Content</option>
                                <option value="Non-Participation">Non-Participation / Sleeping</option>
                                <option value="Attendance Violation">Attendance Policy Violation</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="removalDetails" className="block text-xs font-black text-gray-400 uppercase mb-1">Incident Notes</label>
                            <textarea
                                id="removalDetails"
                                rows={3}
                                value={removalDetails}
                                onChange={(e) => setRemovalDetails(e.target.value)}
                                className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                                placeholder="Describe the incident for the final report..."
                            />
                        </div>
                    </div>

                    <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                        <button onClick={() => setStudentToRemove(null)} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg text-xs hover:bg-gray-100">Cancel</button>
                        <button onClick={handleConfirmRemoval} className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg text-xs hover:bg-red-700 shadow-md transform active:scale-95 transition-all">Revoke Enrollment</button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="animate-fade-in">
            {/* Monitor Header Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div>
                    <h3 className="text-xl font-black text-gray-900 leading-tight">Live Student Monitor</h3>
                    <p className="text-xs text-gray-500 font-medium">{activeStudents.length} Students Connected &bull; Tracking Latency</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button 
                            onClick={() => setGlobalLiveMode(false)}
                            className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-md transition-all ${!globalLiveMode ? 'bg-white shadow text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Selfie View
                        </button>
                        <button 
                            onClick={() => setGlobalLiveMode(true)}
                            className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-md transition-all ${globalLiveMode ? 'bg-white shadow text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Live Feeds
                        </button>
                    </div>
                    <button 
                        onClick={() => window.location.reload()}
                        className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 rounded-lg border border-gray-100 transition-colors"
                        title="Reconnect All Feeds"
                    >
                        <IconRefreshCw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {isAISession ? (
                <div className="flex flex-col gap-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 p-6 bg-white rounded-xl shadow-sm border border-gray-200 min-h-[400px] flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-900">AI Instructor Stream</h3>
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-black uppercase rounded">Source: Digital Avatar V2</span>
                            </div>
                            <div className="flex-grow bg-gray-900 rounded-xl flex flex-col items-center justify-center text-white relative group overflow-hidden">
                                <IconRobot className="w-24 h-24 text-blue-400/40 group-hover:scale-110 transition-transform duration-700" />
                                <div className="mt-4 text-center">
                                    <p className="text-lg font-bold">Broadcasting Session Data</p>
                                    <p className="text-xs text-gray-500">Curriculum: {session?.title}</p>
                                </div>
                                <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-[10px] font-mono text-green-400 tracking-tighter">HD 1080p | 4.8 Mbps</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 min-h-[400px] flex flex-col">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Interaction Log</h3>
                            <div className="flex-grow bg-gray-50 p-4 rounded-xl overflow-y-auto space-y-4 border border-gray-100">
                                <div className="p-3 bg-white rounded-lg shadow-sm border-l-4 border-blue-500">
                                    <p className="text-[10px] font-black text-blue-600 uppercase mb-1">Instructor Prompt</p>
                                    <p className="text-xs text-gray-700 leading-relaxed italic">"Welcome class. Today we'll define intoxication according to the Texas Penal Code."</p>
                                </div>
                                <div className="p-3 bg-white rounded-lg shadow-sm border-l-4 border-green-500">
                                    <p className="text-[10px] font-black text-green-600 uppercase mb-1">System Action</p>
                                    <p className="text-xs text-gray-700 leading-relaxed italic">"Triggering Poll #1: Student knowledge check..."</p>
                                </div>
                                <div className="p-3 bg-white rounded-lg shadow-sm border-l-4 border-purple-500">
                                    <p className="text-[10px] font-black text-purple-600 uppercase mb-1">RAG Response</p>
                                    <p className="text-xs text-gray-700 leading-relaxed italic">"Student Alex J asked about ALR. AI providing legal context from Session 1."</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <StudentGrid />
                    </div>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-grow lg:w-2/3">
                        <StudentGrid />
                    </div>
                    <div className="lg:w-1/3 flex-shrink-0">
                        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 h-[80vh] flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                        <IconActivity className="w-4 h-4" />
                                    </div>
                                    <h3 className="font-bold text-gray-900">Communication Hub</h3>
                                </div>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-black uppercase rounded-full">
                                    {recipient}
                                </div>
                            </div>
                            
                            <div id="admin-chat-monitor" className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-inner" aria-live="polite">
                                {chatLog.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full opacity-30">
                                        <IconSend className="w-12 h-12 mb-2" />
                                        <p className="text-xs italic">No messages sent during this session</p>
                                    </div>
                                ) : (
                                    chatLog.map((msg, index) => {
                                        const isBroadcast = msg.recipient === undefined || msg.recipient === 'Broadcast';
                                        
                                        if (msg.user === 'Admin' && !msg.answer) {
                                            return (
                                                <div key={index} className={`p-3 border rounded-xl rounded-tr-none shadow-sm ml-6 animate-fade-in ${isBroadcast ? 'bg-blue-600 border-blue-700' : 'bg-purple-600 border-purple-700'}`}>
                                                    <p className="text-[9px] font-black mb-1 text-white/70 uppercase tracking-widest">
                                                        {isBroadcast ? 'Global Broadcast' : `Direct to: ${msg.recipient}`}
                                                    </p>
                                                    <p className="text-sm text-white font-medium leading-relaxed">{msg.question}</p>
                                                </div>
                                            );
                                        } else {
                                            return (
                                                <div key={index} className="p-3 bg-white rounded-xl shadow-sm border border-gray-200 animate-fade-in">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">{msg.user}</p>
                                                        <span className="text-[8px] text-gray-400 font-bold uppercase">Student Inquiry</span>
                                                    </div>
                                                    <p className="text-xs text-gray-900 font-bold leading-relaxed mb-2">Q: {msg.question}</p>
                                                    <div className="pt-2 border-t border-gray-50">
                                                        <p className="text-xs text-blue-700 font-medium leading-relaxed"><span className="font-black">AI:</span> {msg.answer}</p>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    })
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="col-span-1">
                                        <label htmlFor="recipient-select" className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Target</label>
                                        <select
                                            id="recipient-select"
                                            value={recipient}
                                            onChange={(e) => setRecipient(e.target.value)}
                                            className="block w-full py-2 px-3 border border-gray-200 bg-gray-50 rounded-lg text-xs font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 appearance-none shadow-sm cursor-pointer"
                                        >
                                            <option value="Broadcast">Broadcast</option>
                                            {activeStudents.map(s => (
                                                <option key={s.id} value={s.name}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-span-1 flex flex-col justify-end">
                                        <button 
                                            onClick={() => handleCameraAlert(recipient === 'Broadcast' ? 'everyone' : recipient)}
                                            className="w-full py-2 bg-yellow-50 text-yellow-700 font-black text-[10px] uppercase rounded-lg border border-yellow-200 hover:bg-yellow-100 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                                        >
                                            <IconWarning className="w-3.5 h-3.5" />
                                            Alert Cam
                                        </button>
                                    </div>
                                </div>
                                <div className="relative group">
                                    <input
                                        id="admin-chat-input"
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                        placeholder={`Message ${recipient}...`}
                                        className="block w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={!chatInput.trim()}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-200 transition-all shadow-md active:scale-95"
                                        aria-label="Send"
                                    >
                                        <IconSend className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <RemovalModal />
        </div>
    );
};

export default AdminMonitor;
