
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Conversation, CommunicationChannel, Message } from '../../types';
import { IconMail, IconPhone, IconSend, IconFilter, IconCheckCircle, IconRefreshCw, IconClose, IconMessageSquare, IconGlobe, IconChatGPT, IconZap, IconPlus, IconClipboardList, IconPlusSquare, IconTag } from '../icons';
import { generateSuggestedReplies } from '../../services/geminiService';

const mockAccounts = [
    { id: 'acc-1', name: 'PRIMARY GMAIL', type: CommunicationChannel.Email, detail: 'admin@school.com' },
    { id: 'acc-2', name: 'SECONDARY OUTLOOK', type: CommunicationChannel.Email, detail: 'support@dwitexas.org' },
    { id: 'acc-3', name: 'MAIN SMS LINE', type: CommunicationChannel.SMS, detail: '(512) 555-0100' },
];

const mockConversations: (Conversation & { accountId: string })[] = [
    {
        id: 'conv-1',
        accountId: 'acc-1',
        contactName: 'Alex Johnson',
        contactDetail: 'alex.j@example.com',
        lastMessageText: "I've sent my pre-course paperwork, let me know if you need anything else.",
        lastMessageTimestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        channel: CommunicationChannel.Email,
        unread: true,
        tags: ['URGENT', 'FOLLOW-UP'],
        messages: [
            { id: 'm1', text: "Hello Alex, welcome to the DWI Education program.", timestamp: new Date(Date.now() - 15 * 60 * 1000 - 3600000).toISOString(), isOutgoing: true, channel: CommunicationChannel.Email },
            { id: 'm2', text: "Thanks! I'm looking forward to the class.", timestamp: new Date(Date.now() - 15 * 60 * 1000 - 1800000).toISOString(), isOutgoing: false, channel: CommunicationChannel.Email },
            { id: 'm3', text: "I've sent my pre-course paperwork, let me know if you need anything else.", timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), isOutgoing: false, channel: CommunicationChannel.Email }
        ]
    },
    {
        id: 'conv-2',
        accountId: 'acc-3',
        contactName: 'Maria Garcia',
        contactDetail: '(512) 555-8888',
        lastMessageText: "Thank you for the reminder!",
        lastMessageTimestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        channel: CommunicationChannel.SMS,
        unread: false,
        tags: ['PENDING'],
        messages: [
            { id: 'm4', text: "Reminder: Your class starts in 1 hour. Please log in promptly.", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 - 900000).toISOString(), isOutgoing: true, channel: CommunicationChannel.SMS },
            { id: 'm5', text: "Thank you for the reminder!", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), isOutgoing: false, channel: CommunicationChannel.SMS }
        ]
    },
    {
        id: 'conv-3',
        accountId: 'acc-2',
        contactName: 'David Lee',
        contactDetail: 'david.lee@example.com',
        lastMessageText: "Can I reschedule my session for next Tuesday?",
        lastMessageTimestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        channel: CommunicationChannel.Email,
        unread: true,
        messages: [
            { id: 'm6', text: "Can I reschedule my session for next Tuesday?", timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), isOutgoing: false, channel: CommunicationChannel.Email }
        ]
    },
    {
        id: 'conv-4',
        accountId: 'acc-3',
        contactName: 'Samantha Jones',
        contactDetail: '(512) 555-1234',
        lastMessageText: "Got the link, thanks.",
        lastMessageTimestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        channel: CommunicationChannel.SMS,
        unread: false,
        messages: [
            { id: 'm7', text: "Got the link, thanks.", timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), isOutgoing: false, channel: CommunicationChannel.SMS }
        ]
    }
];

const templates = [
    { name: 'Paperwork Reminder', text: "Hi [Name], we noticed your pre-course paperwork is still incomplete. Please log in to your student portal to complete it before your first session." },
    { name: 'Reschedule Policy', text: "Hi [Name], according to our policy, rescheduling requires at least 24 hours notice. Please call our office at (512) 555-1234 to discuss available dates." },
    { name: 'Certificate Timeline', text: "Hello [Name], your certificate of completion will be processed and sent to the court within 3-5 business days. You will also receive a copy via email." },
    { name: 'Login Support', text: "Hi [Name], if you are having trouble logging in, please ensure you are using the unique class code sent to your phone. Try clearing your browser cache or using a different browser." }
];

const availableTags = [
    { name: 'URGENT', color: 'bg-red-500 text-white border-red-600' },
    { name: 'FOLLOW-UP', color: 'bg-amber-500 text-white border-amber-600' },
    { name: 'PENDING', color: 'bg-blue-500 text-white border-blue-600' },
    { name: 'ACTION REQUIRED', color: 'bg-purple-500 text-white border-purple-600' },
    { name: 'LOW PRIORITY', color: 'bg-slate-400 text-white border-slate-500' },
];

const AdminConversations: React.FC = () => {
    const [conversations, setConversations] = useState<(Conversation & { accountId: string })[]>(mockConversations);
    const [selectedConvId, setSelectedConvId] = useState<string | null>(mockConversations[0].id);
    const [channelFilter, setChannelFilter] = useState<'ALL' | 'EMAIL' | 'SMS'>('ALL');
    const [accountFilter, setAccountFilter] = useState<string>('all');
    const [replyText, setReplyText] = useState('');

    // UI state
    const [suggestedReplies, setSuggestedReplies] = useState<string[]>([]);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [showTagPicker, setShowTagPicker] = useState(false);
    
    const tagPickerRef = useRef<HTMLDivElement>(null);

    const filteredConversations = useMemo(() => {
        return conversations.filter(conv => {
            const matchesChannel = channelFilter === 'ALL' || conv.channel.toUpperCase() === channelFilter;
            const matchesAccount = accountFilter === 'all' || conv.accountId === accountFilter;
            return matchesChannel && matchesAccount;
        }).sort((a, b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime());
    }, [conversations, channelFilter, accountFilter]);

    const selectedConversation = useMemo(() => {
        return conversations.find(c => c.id === selectedConvId) || null;
    }, [conversations, selectedConvId]);

    // Fetch AI suggestions when conversation changes
    useEffect(() => {
        if (selectedConversation && !selectedConversation.messages[selectedConversation.messages.length - 1].isOutgoing) {
            handleFetchSuggestions();
        } else {
            setSuggestedReplies([]);
        }
        setShowTagPicker(false);
    }, [selectedConvId]);

    // Close tag picker on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (tagPickerRef.current && !tagPickerRef.current.contains(event.target as Node)) {
                setShowTagPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleFetchSuggestions = async () => {
        if (!selectedConversation) return;
        setIsSuggesting(true);
        const suggestions = await generateSuggestedReplies(selectedConversation.messages);
        setSuggestedReplies(suggestions);
        setIsSuggesting(false);
    };

    const handleSendReply = () => {
        if (!replyText.trim() || !selectedConversation) return;

        const newMessage: Message = {
            id: `m-new-${Date.now()}`,
            text: replyText,
            timestamp: new Date().toISOString(),
            isOutgoing: true,
            channel: selectedConversation.channel
        };

        setConversations(prev => prev.map(conv => {
            if (conv.id === selectedConversation.id) {
                return {
                    ...conv,
                    lastMessageText: replyText,
                    lastMessageTimestamp: newMessage.timestamp,
                    messages: [...conv.messages, newMessage]
                };
            }
            return conv;
        }));

        setReplyText('');
        setSuggestedReplies([]);
    };

    const applyTemplate = (templateText: string) => {
        if (!selectedConversation) return;
        const personalized = templateText.replace('[Name]', selectedConversation.contactName.split(' ')[0]);
        setReplyText(personalized);
        setShowTemplates(false);
    };

    const toggleTag = (tagName: string) => {
        if (!selectedConversation) return;
        
        setConversations(prev => prev.map(conv => {
            if (conv.id === selectedConversation.id) {
                const currentTags = conv.tags || [];
                const newTags = currentTags.includes(tagName)
                    ? currentTags.filter(t => t !== tagName)
                    : [...currentTags, tagName];
                return { ...conv, tags: newTags };
            }
            return conv;
        }));
    };

    const getTimeLabel = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' });
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const currentAccount = useMemo(() => {
        if (!selectedConversation) return null;
        return mockAccounts.find(a => a.id === selectedConversation.accountId);
    }, [selectedConversation]);

    const getTagStyle = (tagName: string) => {
        return availableTags.find(t => t.name === tagName)?.color || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden flex h-[calc(100vh-160px)] animate-fade-in">
            {/* Sidebar: Conversation List */}
            <div className="w-1/3 border-r border-gray-100 flex flex-col bg-white">
                <div className="p-5 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-black text-gray-900 tracking-tight">Inbox</h3>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button onClick={() => setChannelFilter('ALL')} className={`px-3 py-1 text-[10px] font-black uppercase rounded-md transition-all ${channelFilter === 'ALL' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}>All</button>
                            <button onClick={() => setChannelFilter('EMAIL')} className={`px-3 py-1 text-[10px] font-black uppercase rounded-md transition-all ${channelFilter === 'EMAIL' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}>Email</button>
                            <button onClick={() => setChannelFilter('SMS')} className={`px-3 py-1 text-[10px] font-black uppercase rounded-md transition-all ${channelFilter === 'SMS' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}>SMS</button>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                             <div className="relative flex-grow">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <IconRefreshCw className="w-3.5 h-3.5 text-gray-400" />
                                </div>
                                <select 
                                    value={accountFilter}
                                    onChange={(e) => setAccountFilter(e.target.value)}
                                    className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-100 rounded-xl text-[11px] font-bold text-gray-500 focus:ring-2 focus:ring-blue-500 appearance-none shadow-inner"
                                >
                                    <option value="all">Syncing: All Accounts</option>
                                    {mockAccounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Search inbox..." 
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 shadow-inner" 
                            />
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                <IconFilter className="w-5 h-5 text-gray-300" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto divide-y divide-gray-50">
                    {filteredConversations.length > 0 ? (
                        filteredConversations.map(conv => {
                             const acc = mockAccounts.find(a => a.id === conv.accountId);
                             return (
                                <button
                                    key={conv.id}
                                    onClick={() => setSelectedConvId(conv.id)}
                                    className={`w-full text-left p-5 transition-all flex gap-4 relative group ${selectedConvId === conv.id ? 'bg-blue-50/40 border-l-4 border-blue-600' : 'hover:bg-gray-50/80 bg-white border-l-4 border-transparent'}`}
                                >
                                    {conv.unread && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full shadow-lg shadow-blue-200"></div>}
                                    <div className="flex-shrink-0">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${conv.channel === CommunicationChannel.Email ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-100' : 'bg-green-50 text-green-600 shadow-sm border border-green-100'}`}>
                                            {conv.channel === CommunicationChannel.Email ? <IconMail className="w-6 h-6" /> : <IconPhone className="w-6 h-6" />}
                                        </div>
                                    </div>
                                    <div className="min-w-0 flex-grow">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className={`text-sm font-black truncate tracking-tight ${conv.unread ? 'text-gray-900' : 'text-gray-600'}`}>{conv.contactName}</h4>
                                            <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap ml-2">{getTimeLabel(conv.lastMessageTimestamp)}</span>
                                        </div>
                                        <p className={`text-xs truncate leading-relaxed ${conv.unread ? 'text-gray-700 font-bold' : 'text-gray-400 font-medium'}`}>{conv.lastMessageText}</p>
                                        
                                        <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                                            <span className="text-[9px] font-black text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded uppercase tracking-wider">{acc?.name}</span>
                                            {conv.tags && conv.tags.map(tagName => (
                                                <span 
                                                    key={tagName} 
                                                    className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${getTagStyle(tagName)} border`}
                                                >
                                                    {tagName}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </button>
                             );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full p-12 text-center text-gray-400 grayscale">
                            <IconRefreshCw className="w-12 h-12 mb-4 opacity-10" />
                            <p className="text-sm font-bold uppercase tracking-widest opacity-20">No results found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Main: Conversation Detail */}
            <div className="flex-grow flex flex-col bg-white relative">
                {selectedConversation ? (
                    <>
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white z-10">
                            <div className="flex items-center gap-5">
                                <div className={`p-2.5 rounded-2xl ${selectedConversation.channel === CommunicationChannel.Email ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                                    {selectedConversation.channel === CommunicationChannel.Email ? <IconMail className="w-6 h-6" /> : <IconPhone className="w-6 h-6" />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-black text-xl text-gray-900 tracking-tight">{selectedConversation.contactName}</h3>
                                        <span className="text-[10px] font-black px-2 py-0.5 bg-gray-50 text-gray-400 rounded-md border border-gray-100 tracking-widest uppercase">VIA {currentAccount?.name}</span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                        <p className="text-xs font-bold text-gray-400 mr-2">{selectedConversation.contactDetail}</p>
                                        
                                        {/* Dynamic Tags Area */}
                                        <div className="flex items-center gap-1.5">
                                            {selectedConversation.tags && selectedConversation.tags.map(tagName => (
                                                <button 
                                                    key={tagName}
                                                    onClick={() => toggleTag(tagName)}
                                                    className={`text-[9px] font-black px-2 py-0.5 rounded-full border shadow-sm transition-all hover:opacity-80 active:scale-95 ${getTagStyle(tagName)}`}
                                                >
                                                    {tagName}
                                                </button>
                                            ))}
                                            
                                            <div className="relative" ref={tagPickerRef}>
                                                <button 
                                                    onClick={() => setShowTagPicker(!showTagPicker)}
                                                    className={`p-1 rounded-full border border-dashed border-gray-300 text-gray-400 hover:text-blue-500 hover:border-blue-400 transition-all ${showTagPicker ? 'bg-blue-50 text-blue-600 border-blue-400' : ''}`}
                                                    title="Manage Tags"
                                                >
                                                    <IconPlus className="w-3.5 h-3.5" />
                                                </button>

                                                {showTagPicker && (
                                                    <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border-2 border-gray-100 overflow-hidden z-[60] animate-fade-in">
                                                        <div className="p-3 bg-gray-50 border-b border-gray-100">
                                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Apply Labels</span>
                                                        </div>
                                                        <div className="p-2 space-y-1">
                                                            {availableTags.map(tag => (
                                                                <button 
                                                                    key={tag.name}
                                                                    onClick={() => toggleTag(tag.name)}
                                                                    className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-black uppercase transition-all flex items-center justify-between group ${
                                                                        selectedConversation.tags?.includes(tag.name) 
                                                                        ? 'bg-blue-50 text-blue-700' 
                                                                        : 'text-gray-600 hover:bg-gray-100'
                                                                    }`}
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <div className={`w-2 h-2 rounded-full ${tag.color.split(' ')[0]}`}></div>
                                                                        {tag.name}
                                                                    </div>
                                                                    {selectedConversation.tags?.includes(tag.name) && (
                                                                        <IconCheckCircle className="w-3.5 h-3.5 text-blue-600" />
                                                                    )}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="p-2.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all border border-transparent hover:border-green-100" title="Mark Resolved"><IconCheckCircle className="w-6 h-6" /></button>
                                <button className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100" title="Close Thread"><IconClose className="w-6 h-6" /></button>
                            </div>
                        </div>

                        <div className="flex-grow overflow-y-auto p-8 space-y-8 bg-gray-50/30">
                            {selectedConversation.messages.map((msg, idx) => (
                                <div key={msg.id} className={`flex flex-col ${msg.isOutgoing ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-center gap-2 mb-2 px-1">
                                        {!msg.isOutgoing && <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{selectedConversation.contactName}</span>}
                                        <span className="text-[10px] text-gray-300 font-bold">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        {msg.isOutgoing && <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">YOU ({currentAccount?.name})</span>}
                                    </div>
                                    <div className={`max-w-[75%] p-5 rounded-3xl text-sm shadow-sm leading-relaxed ${msg.isOutgoing ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'}`}>
                                        <p className="font-medium">{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Suggested Replies & Input */}
                        <div className="p-6 bg-white border-t border-gray-100">
                            
                            {/* AI Suggestions Row - Matching screenshot style */}
                            <div className="mb-5 space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-1 bg-emerald-100 rounded-md">
                                        <IconChatGPT className="w-3.5 h-3.5 text-emerald-600" />
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">AI Suggestions</span>
                                    {isSuggesting && <IconRefreshCw className="w-3 h-3 text-emerald-500 animate-spin" />}
                                </div>
                                <div className="flex flex-wrap gap-2.5 min-h-[36px]">
                                    {isSuggesting ? (
                                        [1, 2, 3].map(i => <div key={i} className="h-9 w-40 bg-gray-50 rounded-full animate-pulse border border-gray-100"></div>)
                                    ) : (
                                        suggestedReplies.map((reply, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setReplyText(reply)}
                                                className="px-4 py-2 bg-white text-emerald-700 text-[11px] font-bold rounded-full border-2 border-emerald-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all shadow-sm animate-fade-in text-left max-w-sm truncate"
                                            >
                                                {reply}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="relative group p-3 bg-gray-50 border border-gray-200 rounded-2xl shadow-inner focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition-all">
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder={`Type your reply...`}
                                    className="w-full bg-transparent border-none text-sm font-bold text-gray-800 focus:ring-0 resize-none min-h-[60px] max-h-[150px]"
                                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(); } }}
                                />
                                
                                <div className="flex items-center justify-between mt-3">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Shift + Enter for new line</p>
                                    <div className="flex items-center gap-2">
                                        {/* Templates Trigger - Redesigned to match screenshot plus inside box */}
                                        <div className="relative">
                                            <button 
                                                onClick={() => setShowTemplates(!showTemplates)}
                                                className={`p-2 rounded-xl transition-all border-2 ${showTemplates ? 'bg-blue-100 border-blue-400 text-blue-600' : 'bg-white text-gray-400 border-gray-100 hover:border-blue-300 shadow-sm'}`}
                                                title="Add Template"
                                            >
                                                <IconPlusSquare className="w-6 h-6" />
                                            </button>
                                            
                                            {showTemplates && (
                                                <div className="absolute bottom-full right-0 mb-4 w-72 bg-white rounded-2xl shadow-2xl border-2 border-gray-100 overflow-hidden z-50 animate-fade-in">
                                                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                                                        <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Saved Templates</span>
                                                        <div className="flex items-center gap-2">
                                                            <button className="p-1 px-2 bg-blue-100 text-blue-600 rounded text-[9px] font-black uppercase tracking-tighter hover:bg-blue-200 transition-colors">Add</button>
                                                            <button onClick={() => setShowTemplates(false)} className="text-gray-300 hover:text-gray-500"><IconClose className="w-4 h-4" /></button>
                                                        </div>
                                                    </div>
                                                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                                                        {templates.map(t => (
                                                            <button 
                                                                key={t.name}
                                                                onClick={() => applyTemplate(t.text)}
                                                                className="w-full text-left p-4 hover:bg-blue-50/50 transition-colors"
                                                            >
                                                                <p className="text-xs font-black text-gray-800 mb-1">{t.name}</p>
                                                                <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed font-medium">{t.text}</p>
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <div className="p-3 bg-gray-50/50 text-center border-t border-gray-50">
                                                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest italic cursor-default">manually add templates</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={handleSendReply}
                                            disabled={!replyText.trim()}
                                            className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 transition-all shadow-xl shadow-blue-600/30 transform active:scale-95"
                                        >
                                            <IconSend className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 flex justify-end">
                                <p className="flex items-center gap-1.5 text-[10px] font-black text-green-500 uppercase tracking-widest"><IconCheckCircle className="w-3.5 h-3.5" /> Account synced and active</p>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-20 bg-gray-50/20">
                        <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mb-8 border-2 border-gray-50"><IconMessageSquare className="w-12 h-12 text-gray-200" /></div>
                        <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Unified Inbox (Email & SMS)</h3>
                        <p className="text-gray-400 max-w-xs font-bold text-sm leading-relaxed">Select a conversation to begin synchronized communication across all active channels.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminConversations;
