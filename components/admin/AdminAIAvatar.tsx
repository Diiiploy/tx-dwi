import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { IconMic, IconRobot, IconUpload, IconClapperboard } from '../icons';
import { createBlob, decode, decodeAudioData } from '../../utils/audio';

// --- Start of New Avatar Video Studio Component ---
const AvatarVideoStudio = () => {
    const [avatarImage, setAvatarImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [script, setScript] = useState('Hello, welcome to the course. Today we will be discussing the importance of responsible decision-making.');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerateVideo = () => {
        if (!avatarImage || !script.trim()) {
            alert('Please upload an avatar image and provide a script.');
            return;
        }
        setIsGenerating(true);
        setGeneratedVideoUrl(null);

        // Simulate video generation process which can take time
        setTimeout(() => {
            // In a real application, this URL would come from a backend service after processing
            setGeneratedVideoUrl('https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
            setIsGenerating(false);
        }, 5000); // 5-second delay for simulation
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            {/* Left Column: Inputs */}
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">1. Upload Avatar Image</label>
                    <input
                        type="file"
                        accept="image/png, image/jpeg"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        className="hidden"
                    />
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-1 flex justify-center items-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-blue-500 bg-gray-50"
                    >
                        {imagePreview ? (
                            <img src={imagePreview} alt="Avatar Preview" className="max-h-48 rounded-md object-contain" />
                        ) : (
                            <div className="space-y-1 text-center">
                                <IconUpload className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600">
                                    <p className="pl-1">Upload a file or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                            </div>
                        )}
                    </div>
                </div>
                <div>
                    <label htmlFor="script" className="block text-sm font-medium text-gray-700">2. Enter Script</label>
                    <textarea
                        id="script"
                        rows={10}
                        value={script}
                        onChange={(e) => setScript(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Type the script for your avatar here..."
                    />
                </div>
                 <button
                    onClick={handleGenerateVideo}
                    disabled={isGenerating || !avatarImage || !script.trim()}
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    <IconClapperboard className="w-5 h-5" />
                    {isGenerating ? 'Generating Video...' : 'Generate Video'}
                </button>
            </div>
             {/* Right Column: Preview */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">3. Preview & Download</label>
                <div className="mt-1 w-full aspect-video bg-gray-900 rounded-lg flex flex-col items-center justify-center text-white relative">
                    {isGenerating ? (
                        <div className="flex flex-col items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="mt-4">Generating your video, please wait...</p>
                        </div>
                    ) : generatedVideoUrl ? (
                        <video src={generatedVideoUrl} controls className="w-full h-full rounded-lg" />
                    ) : (
                        <div className="text-center">
                            <IconClapperboard className="mx-auto h-12 w-12 text-gray-500" />
                            <p className="mt-2 text-sm text-gray-400">Your generated video will appear here.</p>
                        </div>
                    )}
                </div>
                {generatedVideoUrl && !isGenerating && (
                    <a
                        href={generatedVideoUrl}
                        download="avatar-video.mp4"
                        className="mt-4 w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Download Video
                    </a>
                )}
            </div>
        </div>
    );
};

const RealInteractionTraining = () => {
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [fullTranscript, setFullTranscript] = useState<{ speaker: 'user' | 'ai'; text: string }[]>([]);
    const transcriptEndRef = useRef<HTMLDivElement>(null);

    const ai = useRef<GoogleGenAI | null>(null);
    const sessionPromise = useRef<ReturnType<InstanceType<typeof GoogleGenAI>['live']['connect']> | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const nextStartTime = useRef(0);
    const sources = useRef(new Set<AudioBufferSourceNode>());


    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [fullTranscript]);

    const stopSession = useCallback(() => {
        sessionPromise.current?.then(session => session.close());

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (sourceRef.current) {
            sourceRef.current.disconnect();
            sourceRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(console.error);
            audioContextRef.current = null;
        }
        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
            outputAudioContextRef.current.close().catch(console.error);
            outputAudioContextRef.current = null;
        }

        setIsSessionActive(false);
    }, []);

    const startSession = useCallback(async () => {
        if (!process.env.API_KEY) {
            alert('API_KEY environment variable not set.');
            return;
        }
        ai.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
        setIsSessionActive(true);
        setFullTranscript([]);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            nextStartTime.current = 0;
            sources.current.clear();

            let currentInputTranscription = '';
            let currentOutputTranscription = '';

            sessionPromise.current = ai.current.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        console.log('Live session opened.');
                        if (!streamRef.current) return;

                        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                        sourceRef.current = audioContextRef.current.createMediaStreamSource(streamRef.current);
                        scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

                        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromise.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };

                        sourceRef.current.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(audioContextRef.current.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            const text = message.serverContent.inputTranscription.text;
                            currentInputTranscription += text;
                        }
                        
                        if (message.serverContent?.outputTranscription) {
                            const text = message.serverContent.outputTranscription.text;
                            currentOutputTranscription += text;
                        }

                        if (message.serverContent?.turnComplete) {
                            const fullInput = currentInputTranscription.trim();
                            const fullOutput = currentOutputTranscription.trim();
                            
                            setFullTranscript(prev => {
                                const newTranscript = [...prev];
                                if (fullInput) {
                                    newTranscript.push({ speaker: 'user', text: fullInput });
                                }
                                if (fullOutput) {
                                     newTranscript.push({ speaker: 'ai', text: fullOutput });
                                }
                                return newTranscript;
                            });

                            currentInputTranscription = '';
                            currentOutputTranscription = '';
                        }
                        
                        const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                        if (base64EncodedAudioString && outputAudioContextRef.current) {
                            const outputCtx = outputAudioContextRef.current;
                            nextStartTime.current = Math.max(nextStartTime.current, outputCtx.currentTime);
                            
                            const audioBuffer = await decodeAudioData(
                                decode(base64EncodedAudioString),
                                outputCtx,
                                24000,
                                1,
                            );

                            const source = outputCtx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputCtx.destination);
                            source.addEventListener('ended', () => {
                                sources.current.delete(source);
                            });

                            source.start(nextStartTime.current);
                            nextStartTime.current += audioBuffer.duration;
                            sources.current.add(source);
                        }

                        if (message.serverContent?.interrupted) {
                             for (const source of sources.current.values()) {
                                source.stop();
                                sources.current.delete(source);
                            }
                            nextStartTime.current = 0;
                        }

                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live session error:', e);
                        alert(`Session Error: ${e.message}. The session will now close.`);
                        stopSession();
                    },
                    onclose: (e: CloseEvent) => {
                        console.log('Live session closed.');
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    systemInstruction: 'You are an AI assistant for a DWI course. Keep your answers helpful and concise.',
                },
            });
        } catch (error) {
            console.error("Failed to start session:", error);
            alert(`Could not start session: ${error instanceof Error ? error.message : String(error)}`);
            setIsSessionActive(false);
        }
    }, [stopSession]);

    useEffect(() => {
        return () => {
            stopSession();
        };
    }, [stopSession]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            {/* Left Column: Controls */}
            <div className="bg-gray-800 rounded-lg flex flex-col items-center justify-between text-white p-6 text-center aspect-square lg:aspect-auto">
                <div>
                    <IconRobot className={`w-32 h-32 transition-colors ${isSessionActive ? 'text-blue-400' : 'text-gray-500'}`} />
                    <p className="mt-4 text-xl font-semibold">Real-Interaction Training</p>
                    <p className="text-sm text-gray-400">Speak to the AI and hear its response.</p>
                </div>
                
                <div className="flex flex-col items-center justify-center my-6">
                    <button
                        onClick={isSessionActive ? stopSession : startSession}
                        className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 transform active:scale-95 ${
                            isSessionActive
                                ? 'bg-red-500 hover:bg-red-600 focus:ring-red-400 shadow-lg shadow-red-500/30'
                                : 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-400 shadow-lg shadow-blue-500/30'
                        } ${isSessionActive && 'animate-pulse'}`}
                        aria-label={isSessionActive ? 'Stop training session' : 'Start training session'}
                    >
                        <IconMic className="w-12 h-12 text-white" />
                    </button>
                    <p className="mt-4 text-md text-gray-300">
                        {isSessionActive ? 'Listening... Press to stop.' : 'Press to start training.'}
                    </p>
                </div>
            </div>

            {/* Right Column: Transcript */}
            <div className="flex flex-col h-full">
                <div className="flex-grow bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col">
                    <h4 className="text-md font-semibold text-gray-700 mb-2 flex-shrink-0">Live Transcript</h4>
                    <div className="text-sm text-gray-800 whitespace-pre-wrap font-sans flex-grow overflow-y-auto min-h-[200px] space-y-2">
                        {fullTranscript.length > 0 ? (
                            fullTranscript.map((entry, index) => (
                                <div key={index} className={`flex ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`p-2 rounded-lg max-w-[80%] ${entry.speaker === 'user' ? 'bg-blue-100' : 'bg-gray-200'}`}>
                                        <p>{entry.text}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                             <p className="text-gray-500 italic">Transcript will appear here...</p>
                        )}
                         <div ref={transcriptEndRef} />
                    </div>
                </div>
            </div>
        </div>
    );
};


const AdminAIAvatar: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'training' | 'studio'>('training');

    return (
        <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
            <h3 className="text-xl font-semibold mb-1 text-gray-900">AI Avatar Tools</h3>
            <p className="text-sm text-gray-500 mb-4">Train the AI for live interaction or generate pre-recorded video content.</p>
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('training')}
                        className={`py-2 px-1 border-b-2 text-sm font-medium ${activeTab === 'training' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Real-Interaction Training
                    </button>
                    <button
                        onClick={() => setActiveTab('studio')}
                        className={`py-2 px-1 border-b-2 text-sm font-medium ${activeTab === 'studio' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Video Studio
                    </button>
                </nav>
            </div>
            {activeTab === 'training' ? <RealInteractionTraining /> : <AvatarVideoStudio />}
        </div>
    );
};

export default AdminAIAvatar;