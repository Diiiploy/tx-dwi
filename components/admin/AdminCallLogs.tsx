import React, { useState, useEffect, useMemo } from 'react';
import { TelzioRecording, Student } from '../../types';
import { fetchRecordings, updateRecordingNotesAndTags, reconcileCall } from '../../services/telzioService';
import { IconPhone, IconClock, IconHeadphones, IconEdit, IconCheckCircle, IconRefreshCw, IconSearch, IconFilter, IconVolume2, IconClose, IconSend, IconPlus, IconTrash, IconTag, IconXCircle, IconCornerUpLeft } from '../icons';

const PRESET_TAGS = ['Urgent', 'Follow-up', 'Sales', 'Support', 'New Student', 'Legal', 'Certificates', 'Complaint'];

interface AdminCallLogsProps {
    students: Student[];
}

const AdminCallLogs: React.FC<AdminCallLogsProps> = ({ students }) => {
    const [recordings, setRecordings] = useState<TelzioRecording[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [directionFilter, setDirectionFilter] = useState<'all' | 'inbound' | 'outbound' | 'missed'>('all');
    const [selectedRecording, setSelectedRecording] = useState<TelzioRecording | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [noteInput, setNoteInput] = useState('');
    const [tagsInput, setTagsInput] = useState<string[]>([]);
    const [customTag, setCustomTag] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        const data = await fetchRecordings();
        setRecordings(data);
        setIsLoading(false);
    };

    // Helper to normalize phone numbers for matching
    const normalizePhone = (phone: string) => phone.replace(/\D/g, '').slice(-10);

    const getMatchedStudent = (recording: TelzioRecording) => {
        const fromNorm = normalizePhone(recording.from);
        const toNorm = normalizePhone(recording.to);
        
        return students.find(s => {
            if (!s.phoneNumber) return false;
            const sNorm = normalizePhone(s.phoneNumber);
            return sNorm === fromNorm || sNorm === toNorm;
        });
    };

    /**
     * Checks if a missed call has been "returned" (an outbound call to that number later in time).
     */
    const isCallReturned = (missedCall: TelzioRecording) => {
        if (!missedCall.is_missed) return false;
        
        const missedTime = new Date(missedCall.created_at).getTime();
        const contactNum = normalizePhone(missedCall.from);

        return recordings.some(rec => 
            rec.direction === 'outbound' && 
            normalizePhone(rec.to) === contactNum && 
            new Date(rec.created_at).getTime() > missedTime
        );
    };

    const filteredRecordings = useMemo(() => {
        return recordings
            .filter(r => {
                const query = searchQuery.toLowerCase();
                const matchedStudent = getMatchedStudent(r);
                const matchesSearch = 
                    r.from.includes(searchQuery) || 
                    r.to.includes(searchQuery) || 
                    (r.internal_notes?.toLowerCase().includes(query)) ||
                    (r.tags?.some(tag => tag.toLowerCase().includes(query))) ||
                    (matchedStudent?.name.toLowerCase().includes(query));
                
                let matchesDirection = false;
                if (directionFilter === 'all') matchesDirection = true;
                else if (directionFilter === 'missed') matchesDirection = !!r.is_missed;
                else matchesDirection = r.direction === directionFilter;

                return matchesSearch && matchesDirection;
            })
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [recordings, searchQuery, directionFilter, students]);

    const formatDuration = (seconds: number) => {
        if (seconds === 0) return '--';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    const handleEditNote = (recording: TelzioRecording) => {
        setSelectedRecording(recording);
        setNoteInput(recording.internal_notes || '');
        setTagsInput(recording.tags || []);
        setCustomTag('');
    };

    const handleToggleReconcile = async (recId: string, currentState: boolean) => {
        const success = await reconcileCall(recId, !currentState);
        if (success) {
            setRecordings(prev => prev.map(r => r.id === recId ? { ...r, reconciled: !currentState } : r));
        }
    };

    const handleSaveNoteAndTags = async () => {
        if (!selectedRecording) return;
        setIsSaving(true);
        const success = await updateRecordingNotesAndTags(selectedRecording.id, noteInput, tagsInput);
        if (success) {
            setRecordings(prev => prev.map(r => 
                r.id === selectedRecording.id ? { ...r, internal_notes: noteInput, tags: tagsInput } : r
            ));
            setSelectedRecording(null);
        }
        setIsSaving(false);
    };

    const toggleTag = (tag: string) => {
        setTagsInput(prev => 
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const addCustomTag = (e: React.FormEvent | React.MouseEvent) => {
        e.preventDefault();
        const trimmed = customTag.trim();
        if (trimmed && !tagsInput.includes(trimmed)) {
            setTagsInput([...tagsInput, trimmed]);
            setCustomTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTagsInput(prev => prev.filter(t => t !== tagToRemove));
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <IconPhone className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Calls</p>
                        <p className="text-2xl font-black text-gray-900">{recordings.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                        <IconXCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Missed Calls</p>
                        <p className="text-2xl font-black text-gray-900">{recordings.filter(r => r.is_missed).length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                        <IconRefreshCw className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Returned</p>
                        <p className="text-2xl font-black text-gray-900">{recordings.filter(r => r.is_missed && isCallReturned(r)).length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                        <IconCheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Reconciled</p>
                        <p className="text-2xl font-black text-gray-900">{recordings.filter(r => r.is_missed && (r.reconciled || isCallReturned(r))).length}</p>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col lg:flex-row justify-between items-center gap-6">
                <div className="flex bg-gray-100 p-1.5 rounded-xl w-full md:w-auto">
                    <button 
                        onClick={() => setDirectionFilter('all')}
                        className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${directionFilter === 'all' ? 'bg-white shadow-md text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        All
                    </button>
                    <button 
                        onClick={() => setDirectionFilter('inbound')}
                        className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${directionFilter === 'inbound' ? 'bg-white shadow-md text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Inbound
                    </button>
                    <button 
                        onClick={() => setDirectionFilter('outbound')}
                        className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${directionFilter === 'outbound' ? 'bg-white shadow-md text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Outbound
                    </button>
                    <button 
                        onClick={() => setDirectionFilter('missed')}
                        className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${directionFilter === 'missed' ? 'bg-white shadow-md text-red-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Missed
                    </button>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto flex-grow justify-end">
                    <div className="relative w-full md:w-96 group">
                        <input 
                            type="text" 
                            placeholder="Search numbers, tags, notes or student names..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner"
                        />
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <IconSearch className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500" />
                        </div>
                    </div>
                    <button onClick={loadData} className="p-3 bg-gray-100 text-gray-500 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100">
                        <IconRefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Call Status</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Contact/Student</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Number Info</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Dur.</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Follow-up</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Internal Log</th>
                            <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {isLoading ? (
                            <tr>
                                <td colSpan={7} className="py-20 text-center">
                                    <IconRefreshCw className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
                                    <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Polling Telzio API...</p>
                                </td>
                            </tr>
                        ) : filteredRecordings.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-20 text-center">
                                    <IconPhone className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                    <p className="text-gray-400 font-bold">No call recordings found.</p>
                                </td>
                            </tr>
                        ) : (
                            filteredRecordings.map((rec) => {
                                const studentMatch = getMatchedStudent(rec);
                                const returned = isCallReturned(rec);
                                const isMissed = !!rec.is_missed;
                                const isReconciled = rec.reconciled || returned;

                                return (
                                    <tr key={rec.id} className={`hover:bg-gray-50/80 transition-colors group ${isMissed && !isReconciled ? 'bg-red-50/30' : ''}`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {isMissed ? (
                                                <span className="px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter bg-red-100 text-red-700 border border-red-200 shadow-sm">
                                                    Missed
                                                </span>
                                            ) : (
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${rec.direction === 'inbound' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-purple-100 text-purple-700 border border-purple-200'}`}>
                                                    {rec.direction}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {studentMatch ? (
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center text-[10px] font-black ${isMissed && !isReconciled ? 'bg-red-500 shadow-lg shadow-red-200' : 'bg-blue-600'}`}>
                                                        {studentMatch.name.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-black text-gray-900">{studentMatch.name}</span>
                                                        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter">Student Matched</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-gray-400 italic">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">Unmapped Contact</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-gray-900">{rec.direction === 'inbound' ? rec.from : rec.to}</span>
                                                <span className="text-[10px] font-medium text-gray-300 mt-0.5">{new Date(rec.created_at).toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
                                                {formatDuration(rec.duration)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {isMissed ? (
                                                <div className="flex items-center gap-2">
                                                    {returned ? (
                                                        <div className="flex items-center gap-1.5 px-2 py-1 bg-green-100 text-green-700 rounded-lg border border-green-200 animate-fade-in shadow-sm">
                                                            <IconCornerUpLeft className="w-3.5 h-3.5" />
                                                            <span className="text-[9px] font-black uppercase">Call Returned</span>
                                                        </div>
                                                    ) : rec.reconciled ? (
                                                        <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg border border-blue-200 shadow-sm">
                                                            <IconCheckCircle className="w-3.5 h-3.5" />
                                                            <span className="text-[9px] font-black uppercase">Handled</span>
                                                        </div>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleToggleReconcile(rec.id, false)}
                                                            className="flex items-center gap-1.5 px-2 py-1 bg-white hover:bg-red-50 text-red-500 rounded-lg border border-red-200 transition-all active:scale-95 shadow-sm"
                                                        >
                                                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                                                            <span className="text-[9px] font-black uppercase">Pending Follow-up</span>
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest italic">N/A</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-2 max-w-xs">
                                                <p className="text-xs text-gray-500 line-clamp-1 font-medium leading-relaxed italic">
                                                    {rec.internal_notes || "No log entry..."}
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
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                {isMissed && !isReconciled && (
                                                    <button 
                                                        onClick={() => handleToggleReconcile(rec.id, false)}
                                                        className="p-2.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all"
                                                        title="Reconcile Missed Call"
                                                    >
                                                        <IconCheckCircle className="w-5 h-5" />
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => handleEditNote(rec)}
                                                    className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all active:scale-95"
                                                    title="Edit Log & Tags"
                                                >
                                                    <IconEdit className="w-5 h-5" />
                                                </button>
                                                {rec.uri && (
                                                     <button 
                                                        onClick={() => { /* Play logic */ }}
                                                        className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                        title="Play Recording"
                                                    >
                                                        <IconVolume2 className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Note & Tag Editor Modal */}
            {selectedRecording && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-gray-200 overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-lg font-black text-gray-900 tracking-tight">Log Detail</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">UUID: {selectedRecording.call_id}</p>
                            </div>
                            <button onClick={() => setSelectedRecording(null)} className="p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-all">
                                <IconClose className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6 overflow-y-auto">
                            <div className={`${selectedRecording.is_missed ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'} p-4 rounded-2xl border space-y-2`}>
                                <div className="flex justify-between items-center">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${selectedRecording.is_missed ? 'text-red-400' : 'text-blue-400'}`}>Call Metadata</span>
                                    <span className={`text-[10px] font-bold ${selectedRecording.is_missed ? 'text-red-600' : 'text-blue-600'}`}>{formatDuration(selectedRecording.duration)}</span>
                                </div>
                                {getMatchedStudent(selectedRecording) ? (
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className={`w-6 h-6 rounded-full text-white flex items-center justify-center text-[10px] font-black ${selectedRecording.is_missed ? 'bg-red-500' : 'bg-blue-600'}`}>
                                            {getMatchedStudent(selectedRecording)?.name.charAt(0)}
                                        </div>
                                        <p className="text-xs font-black text-gray-900">Student: {getMatchedStudent(selectedRecording)?.name}</p>
                                    </div>
                                ) : null}
                                <p className="text-xs font-bold text-gray-800">Phone: {selectedRecording.from}</p>
                                <p className="text-[10px] text-gray-500">{new Date(selectedRecording.created_at).toLocaleString()}</p>
                            </div>

                            {/* Tags Section */}
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1 flex items-center gap-2">
                                    <IconTag className="w-3 h-3" /> Categorization
                                </label>
                                
                                <div className="space-y-3">
                                    {/* Active Tags */}
                                    <div className="flex flex-wrap gap-2 min-h-[32px] p-3 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                                        {tagsInput.length > 0 ? tagsInput.map(tag => (
                                            <span key={tag} className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-600 text-white text-[10px] font-black uppercase rounded-lg shadow-sm group">
                                                {tag}
                                                <button onClick={() => removeTag(tag)} className="hover:text-red-200 transition-colors">
                                                    <IconXCircle className="w-3.5 h-3.5" />
                                                </button>
                                            </span>
                                        )) : (
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter italic">No labels applied...</span>
                                        )}
                                    </div>

                                    {/* Preset Tags Grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                                        {PRESET_TAGS.map(tag => (
                                            <button
                                                key={tag}
                                                onClick={() => toggleTag(tag)}
                                                className={`px-2 py-1.5 text-[9px] font-black uppercase rounded-lg border transition-all ${tagsInput.includes(tag) ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-200 text-gray-500 hover:border-blue-300 hover:bg-blue-50/30'}`}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Add Custom Tag */}
                                    <div className="flex gap-2">
                                        <div className="relative flex-grow group">
                                            <input 
                                                type="text" 
                                                value={customTag}
                                                onChange={(e) => setCustomTag(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && addCustomTag(e)}
                                                placeholder="Custom label..."
                                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[10px] font-bold focus:ring-2 focus:ring-blue-500 shadow-inner"
                                            />
                                            <div className="absolute inset-y-0 left-3 flex items-center">
                                                <IconPlus className="w-3.5 h-3.5 text-gray-400" />
                                            </div>
                                        </div>
                                        <button 
                                            onClick={addCustomTag}
                                            className="px-4 py-2 bg-gray-800 text-white text-[10px] font-black uppercase rounded-xl hover:bg-black transition-all"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Notes Section */}
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1 flex items-center gap-2">
                                    <IconEdit className="w-3 h-3" /> Call Summary
                                </label>
                                <textarea 
                                    value={noteInput}
                                    onChange={(e) => setNoteInput(e.target.value)}
                                    placeholder="Add call notes, follow-up results, or case updates..."
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 shadow-inner h-32 resize-none font-medium text-gray-800"
                                />
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
                            <button 
                                onClick={() => setSelectedRecording(null)}
                                className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-gray-500 hover:bg-white rounded-xl transition-all border border-transparent hover:border-gray-100"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSaveNoteAndTags}
                                disabled={isSaving}
                                className="flex-1 py-3 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                            >
                                {isSaving ? <IconRefreshCw className="w-4 h-4 animate-spin" /> : <IconCheckCircle className="w-4 h-4" />}
                                Commit Log
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCallLogs;