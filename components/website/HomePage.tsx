
import React, { useState, useRef, useEffect } from 'react';
import { WebsitePage } from './Website';
import { Course, WebsiteContent, Review } from '../../types';
import { generateWebsiteChatResponse } from '../../services/geminiService';
import { IconChat, IconClose, IconSend, IconStar, IconArrowLeft } from '../icons';
import SeoHead from './SeoHead';

interface HomePageProps {
    setPage: (page: WebsitePage) => void;
    courses: Course[];
    heroTitle: string;
    heroSubtitle: string;
    branding: WebsiteContent['branding'];
    heroMedia: {
        type: 'image' | 'video';
        url: string;
    };
    reviews: Review[];
}

interface ChatUIMessage {
    user: 'AI' | 'User';
    text: string;
}

const HomePage: React.FC<HomePageProps> = ({ setPage, courses, heroTitle, heroSubtitle, branding, heroMedia, reviews }) => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [messages, setMessages] = useState<ChatUIMessage[]>([
        { user: 'AI', text: "Hello! I'm an AI assistant. How can I help you with our DWI courses today?" }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const chatBodyRef = useRef<HTMLDivElement>(null);

    // Carousel State
    const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages]);

    // Auto-rotate reviews
    useEffect(() => {
        if (isPaused || reviews.length === 0) return;
        const interval = setInterval(() => {
            setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [isPaused, reviews.length]);

    const nextReview = () => {
        setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
        setIsPaused(true);
    };

    const prevReview = () => {
        setCurrentReviewIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
        setIsPaused(true);
    };

    const handleSendChatMessage = async () => {
        const question = chatInput.trim();
        if (!question || isSending) return;

        const newMessages: ChatUIMessage[] = [...messages, { user: 'User', text: question }];
        setMessages(newMessages);
        setChatInput('');
        setIsSending(true);

        try {
            const historyForApi = newMessages.map(m => ({ user: m.user, text: m.text }));
            const answer = await generateWebsiteChatResponse(question, courses, historyForApi);
            setMessages(prev => [...prev, { user: 'AI', text: answer }]);
        } catch (error) {
            setMessages(prev => [...prev, { user: 'AI', text: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setIsSending(false);
        }
    };

    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        "name": "DWI Education of Central Texas",
        "url": "https://dwicentraltx.com", // Placeholder
        "logo": branding.logoUrl || "https://lh3.googleusercontent.com/d/1bRJC1lQAOJDUeCA5XB6FnlgSPCzA5km3",
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+1-512-555-1234",
            "contactType": "customer service"
        },
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "123 Main Street",
            "addressLocality": "Austin",
            "addressRegion": "TX",
            "postalCode": "78701",
            "addressCountry": "US"
        },
        "sameAs": [
            "https://www.facebook.com/example",
            "https://twitter.com/example"
        ]
    };

    const getReview = (offset: number) => {
        if (reviews.length === 0) return null;
        return reviews[(currentReviewIndex + offset) % reviews.length];
    };

    const ReviewCard = ({ review }: { review: Review | null }) => {
        if (!review) return null;
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col h-full transition-all duration-500 transform">
                <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                        <IconStar
                            key={i}
                            className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                    ))}
                </div>
                <p className="text-gray-600 mb-6 flex-grow italic">"{review.text}"</p>
                <div className="flex justify-between items-end mt-auto">
                    <div>
                        <p className="font-bold text-gray-900">{review.name}</p>
                        <p className="text-xs text-gray-500">Verified Student</p>
                    </div>
                    <span className="text-xs text-gray-400">{review.date}</span>
                </div>
            </div>
        );
    };

    return (
        <div>
            <SeoHead 
                title="Home" 
                description="State-Certified DWI Education Programs in Central Texas. Accessible online courses for DWI Education, Intervention, and Minors. Enroll today."
                structuredData={organizationSchema}
            />
            <section className="relative text-white overflow-hidden" style={{ backgroundColor: branding.primaryColor }}>
                {heroMedia.url && (
                    <div className="absolute inset-0 z-0 opacity-20">
                        {heroMedia.type === 'video' ? (
                            <video 
                                src={heroMedia.url} 
                                autoPlay 
                                loop 
                                muted 
                                playsInline 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <img 
                                src={heroMedia.url} 
                                alt="Hero Background" 
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>
                )}
                
                <div className="relative z-10 max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl drop-shadow-md">{heroTitle}</h1>
                    <p className="mt-6 max-w-2xl mx-auto text-xl text-white/90 drop-shadow">
                        {heroSubtitle}
                    </p>
                    <div className="mt-10 flex justify-center gap-4">
                        <button
                            onClick={() => setPage('courses')}
                            className="px-8 py-3 bg-white text-gray-900 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition"
                            style={{ color: branding.primaryColor }}
                        >
                            View Courses
                        </button>
                        <button
                            onClick={() => setPage('register')}
                            className="px-8 py-3 bg-gray-900 text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 transition"
                        >
                            Register Now
                        </button>
                    </div>
                </div>
            </section>
            
            <section className="py-16">
                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900">Why Choose Us?</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500">
                            We are committed to providing a supportive and educational environment to help you move forward.
                        </p>
                    </div>
                    <div className="mt-12 grid gap-8 md:grid-cols-3">
                        <div className="text-center p-6 border border-gray-200 rounded-lg">
                            <h3 className="text-lg font-medium text-gray-900">State-Certified Curriculum</h3>
                            <p className="mt-2 text-base text-gray-500">
                                Our courses are fully certified and meet all Texas state requirements for DWI education and intervention.
                            </p>
                        </div>
                        <div className="text-center p-6 border border-gray-200 rounded-lg">
                            <h3 className="text-lg font-medium text-gray-900">Convenient Online Platform</h3>
                            <p className="mt-2 text-base text-gray-500">
                                Complete your required courses from the comfort of your home with our user-friendly online classroom.
                            </p>
                        </div>
                        <div className="text-center p-6 border border-gray-200 rounded-lg">
                             <h3 className="text-lg font-medium text-gray-900">Experienced Instructors</h3>
                            <p className="mt-2 text-base text-gray-500">
                                Learn from licensed professionals dedicated to providing a non-judgmental and impactful learning experience.
                            </p>
                        </div>
                    </div>
                 </div>
            </section>

            <section className="py-16 bg-gray-50 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-extrabold text-gray-900">What Our Students Say</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500">
                            Read testimonials from students who have successfully completed our programs.
                        </p>
                    </div>
                    
                    {reviews.length > 0 ? (
                        <div 
                            className="relative px-8 md:px-12"
                            onMouseEnter={() => setIsPaused(true)}
                            onMouseLeave={() => setIsPaused(false)}
                        >
                            {/* Navigation Buttons */}
                            <button 
                                onClick={prevReview}
                                className="absolute left-0 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow-md border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition z-10"
                                aria-label="Previous review"
                            >
                                <IconArrowLeft className="w-6 h-6" />
                            </button>
                            <button 
                                onClick={nextReview}
                                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow-md border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition z-10"
                                aria-label="Next review"
                            >
                                <IconArrowLeft className="w-6 h-6 rotate-180" />
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-300">
                                {/* Mobile: Show only current index */}
                                <div className="block">
                                    <ReviewCard review={getReview(0)} />
                                </div>
                                
                                {/* Tablet: Show current + 1 */}
                                <div className="hidden md:block">
                                    <ReviewCard review={getReview(1)} />
                                </div>

                                {/* Desktop: Show current + 2 */}
                                <div className="hidden lg:block">
                                    <ReviewCard review={getReview(2)} />
                                </div>
                            </div>

                            {/* Dots Indicator */}
                            <div className="flex justify-center gap-2 mt-8">
                                {reviews.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => { setCurrentReviewIndex(idx); setIsPaused(true); }}
                                        className={`w-2.5 h-2.5 rounded-full transition-colors ${
                                            idx === currentReviewIndex 
                                                ? 'bg-blue-600' 
                                                : 'bg-gray-300 hover:bg-gray-400'
                                        }`}
                                        aria-label={`Go to review ${idx + 1}`}
                                        style={idx === currentReviewIndex ? { backgroundColor: branding.primaryColor } : {}}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 italic">No reviews available at this time.</div>
                    )}
                </div>
            </section>

            {/* AI Chat Widget */}
            <div className="fixed bottom-5 right-5 z-50">
                {/* Chat Window */}
                <div className={`transition-all duration-300 ease-in-out ${isChatOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                    <div className="w-80 h-[28rem] bg-white rounded-lg shadow-2xl flex flex-col border border-gray-200">
                        {/* Header */}
                        <div className="flex justify-between items-center p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                            <h3 className="text-md font-semibold text-gray-800">AI Assistant</h3>
                            <button onClick={() => setIsChatOpen(false)} className="text-gray-500 hover:text-gray-800" aria-label="Close chat">
                                <IconClose className="w-5 h-5" />
                            </button>
                        </div>
                        {/* Body */}
                        <div ref={chatBodyRef} className="flex-1 p-3 space-y-3 overflow-y-auto">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.user === 'AI' ? 'justify-start' : 'justify-end'}`}>
                                    <div 
                                        className={`p-2.5 rounded-lg max-w-[85%] text-sm ${msg.user === 'AI' ? 'bg-gray-200 text-gray-800 rounded-bl-none' : 'text-white rounded-br-none'}`}
                                        style={msg.user !== 'AI' ? { backgroundColor: branding.primaryColor } : {}}
                                    >
                                        <p>{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                            {isSending && (
                                <div className="flex justify-start">
                                    <div className="p-2.5 bg-gray-200 text-gray-800 rounded-lg rounded-bl-none">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Input */}
                        <div className="p-3 border-t border-gray-200">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={e => setChatInput(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && handleSendChatMessage()}
                                    placeholder="Ask a question..."
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={isSending}
                                />
                                <button
                                    onClick={handleSendChatMessage}
                                    disabled={isSending || !chatInput.trim()}
                                    className="p-2 text-white rounded-lg hover:brightness-110 disabled:bg-blue-300 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: branding.primaryColor }}
                                    aria-label="Send message"
                                >
                                    <IconSend className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chat Bubble */}
                <button
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    className={`text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center hover:brightness-110 transition transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isChatOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}
                    style={{ backgroundColor: branding.primaryColor }}
                    aria-label="Open chat"
                >
                    <IconChat className="w-8 h-8" />
                </button>
            </div>
        </div>
    );
};

export default HomePage;
