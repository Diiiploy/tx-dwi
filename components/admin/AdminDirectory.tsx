
import React, { useState, useMemo } from 'react';
import { Student } from '../../types';
// FIX: Added IconCheckCircle to imports to resolve "Cannot find name 'IconCheckCircle'" error on line 160.
import { IconShield, IconGavel, IconMail, IconSearch, IconFilter, IconLink, IconCopy, IconRefreshCw, IconCheckCircle, IconGrid, IconList, IconExport, IconClose } from '../icons';

interface AdminDirectoryProps {
    students: Student[];
    onViewStudent: (student: Student) => void;
}

type DirectoryType = 'po' | 'lawyer';
type ViewMode = 'grid' | 'list';

interface DirectoryEntry {
    name: string;
    email: string;
    type: DirectoryType;
    firmOrDepartment?: string;
    studentIds: number[];
}

const AdminDirectory: React.FC<AdminDirectoryProps> = ({ students, onViewStudent }) => {
    const [activeTab, setActiveTab] = useState<DirectoryType>('po');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
    const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());

    // Extract unique POs and Lawyers from student data
    const directory = useMemo(() => {
        const poMap = new Map<string, DirectoryEntry>();
        const lawyerMap = new Map<string, DirectoryEntry>();

        students.forEach(student => {
            const cert = student.certificateInfo;
            if (!cert) return;

            // Process PO
            if (cert.probationOfficerName && cert.probationOfficerEmail) {
                const key = cert.probationOfficerEmail.toLowerCase().trim();
                const existing = poMap.get(key);
                if (existing) {
                    if (!existing.studentIds.includes(student.id)) {
                        existing.studentIds.push(student.id);
                    }
                } else {
                    poMap.set(key, {
                        name: cert.probationOfficerName,
                        email: cert.probationOfficerEmail,
                        type: 'po',
                        studentIds: [student.id]
                    });
                }
            }

            // Process Lawyer
            if (cert.lawyerName && cert.lawyerEmail) {
                const key = cert.lawyerEmail.toLowerCase().trim();
                const existing = lawyerMap.get(key);
                if (existing) {
                    if (!existing.studentIds.includes(student.id)) {
                        existing.studentIds.push(student.id);
                    }
                } else {
                    lawyerMap.set(key, {
                        name: cert.lawyerName,
                        email: cert.lawyerEmail,
                        type: 'lawyer',
                        firmOrDepartment: cert.lawFirmName,
                        studentIds: [student.id]
                    });
                }
            }
        });

        return {
            pos: Array.from(poMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
            lawyers: Array.from(lawyerMap.values()).sort((a, b) => a.name.localeCompare(b.name))
        };
    }, [students]);

    const filteredEntries = useMemo(() => {
        const entries = activeTab === 'po' ? directory.pos : directory.lawyers;
        const query = searchQuery.toLowerCase().trim();
        if (!query) return entries;

        return entries.filter(e => 
            e.name.toLowerCase().includes(query) || 
            e.email.toLowerCase().includes(query) ||
            (e.firmOrDepartment && e.firmOrDepartment.toLowerCase().includes(query))
        );
    }, [directory, activeTab, searchQuery]);

    const handleCopyEmail = (email: string) => {
        navigator.clipboard.writeText(email);
        setCopiedEmail(email);
        setTimeout(() => setCopiedEmail(null), 2000);
    };

    const toggleSelection = (email: string) => {
        const newSelected = new Set(selectedEmails);
        if (newSelected.has(email)) {
            newSelected.delete(email);
        } else {
            newSelected.add(email);
        }
        setSelectedEmails(newSelected);
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const allEmails = new Set(filteredEntries.map(entry => entry.email));
            setSelectedEmails(allEmails);
        } else {
            setSelectedEmails(new Set());
        }
    };

    // Bulk Action Handlers
    const handleBulkCopyEmails = () => {
        const emailsString = Array.from(selectedEmails).join('; ');
        navigator.clipboard.writeText(emailsString);
        alert(`Copied ${selectedEmails.size} emails to clipboard.`);
    };

    const handleBulkSendReport = () => {
        if (window.confirm(`Queue progress reports for ${selectedEmails.size} recipients?`)) {
            alert(`Queued ${selectedEmails.size} reports for automated delivery.`);
            setSelectedEmails(new Set());
        }
    };

    const handleBulkExportCSV = () => {
        const selectedData = filteredEntries.filter(entry => selectedEmails.has(entry.email));
        const headers = ['Name', 'Email', 'Type', 'Firm/Department', 'Associated Student Count'];
        const csvRows = selectedData.map(entry => [
            `"${entry.name}"`,
            entry.email,
            entry.type === 'po' ? 'Probation Officer' : 'Attorney',
            `"${entry.firmOrDepartment || ''}"`,
            entry.studentIds.length
        ].join(','));
        
        const csvContent = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.setAttribute('href', URL.createObjectURL(blob));
        link.setAttribute('download', `directory_export_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
        link.click();
    };

    return (
        <div className="space-y-6 animate-fade-in relative pb-20">
            {/* Bulk Action Toolbar */}
            {selectedEmails.size > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-2xl bg-slate-900 text-white rounded-2xl shadow-2xl p-4 flex items-center justify-between border border-white/10 animate-fade-in">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setSelectedEmails(new Set())}
                            className="p-1 hover:bg-white/10 rounded-full transition"
                        >
                            <IconClose className="w-5 h-5 text-slate-400" />
                        </button>
                        <div>
                            <p className="text-sm font-black uppercase tracking-widest">{selectedEmails.size} Selected</p>
                            <p className="text-[10px] text-slate-400 font-bold">BATCH ACTIONS ACTIVE</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handleBulkCopyEmails}
                            className="px-4 py-2 bg-slate-800 text-xs font-bold rounded-lg hover:bg-slate-700 transition flex items-center gap-2"
                        >
                            <IconCopy className="w-4 h-4" />
                            Copy Emails
                        </button>
                        <button 
                            onClick={handleBulkExportCSV}
                            className="px-4 py-2 bg-slate-800 text-xs font-bold rounded-lg hover:bg-slate-700 transition flex items-center gap-2"
                        >
                            <IconExport className="w-4 h-4" />
                            Export CSV
                        </button>
                        <button 
                            onClick={handleBulkSendReport}
                            className="px-4 py-2 bg-blue-600 text-xs font-bold rounded-lg hover:bg-blue-500 transition shadow-lg shadow-blue-500/20 flex items-center gap-2"
                        >
                            <IconRefreshCw className="w-4 h-4" />
                            Send Reports
                        </button>
                    </div>
                </div>
            )}

            {/* Header Controls */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col xl:flex-row justify-between items-center gap-6">
                <div className="flex bg-gray-100 p-1.5 rounded-xl w-full md:w-auto">
                    <button 
                        onClick={() => { setActiveTab('po'); setSelectedEmails(new Set()); }}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-black uppercase tracking-wider transition-all ${activeTab === 'po' ? 'bg-white shadow-md text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <IconShield className="w-4 h-4" />
                        Probation Officers
                    </button>
                    <button 
                        onClick={() => { setActiveTab('lawyer'); setSelectedEmails(new Set()); }}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-black uppercase tracking-wider transition-all ${activeTab === 'lawyer' ? 'bg-white shadow-md text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <IconGavel className="w-4 h-4" />
                        Legal Directory
                    </button>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto flex-grow justify-end">
                    <div className="relative w-full md:w-96 group">
                        <input 
                            type="text" 
                            placeholder={`Search ${activeTab === 'po' ? 'officers' : 'lawyers'} by name or email...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner"
                        />
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <IconSearch className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500" />
                        </div>
                    </div>

                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                            title="Grid View"
                        >
                            <IconGrid className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                            title="List View"
                        >
                            <IconList className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Directory Content */}
            {filteredEntries.length > 0 ? (
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEntries.map((entry) => (
                            <div 
                                key={entry.email} 
                                onClick={() => toggleSelection(entry.email)}
                                className={`bg-white rounded-2xl p-6 border-2 transition-all group flex flex-col cursor-pointer relative ${selectedEmails.has(entry.email) ? 'border-blue-500 shadow-xl shadow-blue-500/10' : 'border-transparent shadow-sm hover:shadow-xl hover:border-blue-200'}`}
                            >
                                <div className="absolute top-4 right-4 z-10">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedEmails.has(entry.email) ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200 opacity-0 group-hover:opacity-100'}`}>
                                        {selectedEmails.has(entry.email) && <IconCheckCircle className="w-4 h-4 text-white" />}
                                    </div>
                                </div>

                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-xl ${activeTab === 'po' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                        {activeTab === 'po' ? <IconShield className="w-6 h-6" /> : <IconGavel className="w-6 h-6" />}
                                    </div>
                                    <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter ${activeTab === 'po' ? 'bg-blue-100 text-blue-700' : 'bg-indigo-100 text-indigo-700'} mr-8`}>
                                        {entry.studentIds.length} Active {entry.studentIds.length === 1 ? 'Case' : 'Cases'}
                                    </span>
                                </div>

                                <div className="flex-grow">
                                    <h3 className="text-lg font-black text-gray-900 group-hover:text-blue-600 transition-colors">{entry.name}</h3>
                                    {entry.firmOrDepartment && (
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                                            {entry.firmOrDepartment}
                                        </p>
                                    )}
                                    
                                    <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between group/email">
                                        <div className="flex items-center gap-2 truncate">
                                            <IconMail className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-600 truncate font-medium">{entry.email}</span>
                                        </div>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleCopyEmail(entry.email); }}
                                            className="p-1.5 hover:bg-white rounded-lg text-gray-400 hover:text-blue-600 transition-all opacity-0 group-hover/email:opacity-100"
                                            title="Copy Email"
                                        >
                                            {copiedEmail === entry.email ? <IconCheckCircle className="w-4 h-4 text-green-500" /> : <IconCopy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-100 flex gap-3">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); /* Single report logic */ }}
                                        className="flex-1 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 shadow-md shadow-blue-100 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <IconRefreshCw className="w-3.5 h-3.5" />
                                        Send Report
                                    </button>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const firstStudent = students.find(s => s.id === entry.studentIds[0]);
                                            if (firstStudent) onViewStudent(firstStudent);
                                        }}
                                        className="px-3 py-2 bg-white border border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-200 rounded-lg transition-all"
                                        title="View Associated Students"
                                    >
                                        <IconLink className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden animate-fade-in">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left w-10">
                                        <div className="flex items-center">
                                            <input 
                                                type="checkbox" 
                                                checked={filteredEntries.length > 0 && selectedEmails.size === filteredEntries.length}
                                                onChange={handleSelectAll}
                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer" 
                                            />
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Contact Name</th>
                                    <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Office / Firm</th>
                                    <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Email Address</th>
                                    <th scope="col" className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Cases</th>
                                    <th scope="col" className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {filteredEntries.map((entry) => (
                                    <tr 
                                        key={entry.email} 
                                        className={`hover:bg-gray-50/80 transition-colors group cursor-pointer ${selectedEmails.has(entry.email) ? 'bg-blue-50/50' : ''}`}
                                        onClick={() => toggleSelection(entry.email)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedEmails.has(entry.email)}
                                                    onChange={() => {}} // Controlled by row click
                                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer" 
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${activeTab === 'po' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                                    {activeTab === 'po' ? <IconShield className="w-4 h-4" /> : <IconGavel className="w-4 h-4" />}
                                                </div>
                                                <span className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{entry.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-tight">{entry.firmOrDepartment || '---'}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 group/email">
                                                <span className="text-sm text-gray-600 font-medium">{entry.email}</span>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleCopyEmail(entry.email); }}
                                                    className="p-1 text-gray-300 hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    {copiedEmail === entry.email ? <IconCheckCircle className="w-3.5 h-3.5 text-green-500" /> : <IconCopy className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${activeTab === 'po' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                                                {entry.studentIds.length}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md shadow-blue-100 transition-all transform active:scale-95"
                                                    title="Send Report"
                                                    onClick={(e) => { e.stopPropagation(); }}
                                                >
                                                    <IconRefreshCw className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const firstStudent = students.find(s => s.id === entry.studentIds[0]);
                                                        if (firstStudent) onViewStudent(firstStudent);
                                                    }}
                                                    className="p-2 bg-white border border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-200 rounded-lg transition-all"
                                                    title="View Associated Students"
                                                >
                                                    <IconLink className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            ) : (
                <div className="py-20 flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-gray-200 text-center p-8">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                        <IconSearch className="w-10 h-10 text-gray-200" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Directory Entries Found</h3>
                    <p className="text-gray-500 max-w-sm">We couldn't find any {activeTab === 'po' ? 'Probation Officers' : 'Lawyers'} matching your current search criteria.</p>
                    <button 
                        onClick={() => { setSearchQuery(''); setSelectedEmails(new Set()); }}
                        className="mt-6 text-sm font-bold text-blue-600 hover:underline"
                    >
                        Clear Search Filter
                    </button>
                </div>
            )}

            {/* Directory Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-slate-900 rounded-2xl text-white shadow-xl">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Network Reach</p>
                    <div className="flex items-end gap-3">
                        <span className="text-4xl font-black">{directory.pos.length + directory.lawyers.length}</span>
                        <span className="text-xs font-bold text-slate-400 pb-1.5">Active External Contacts</span>
                    </div>
                    <div className="mt-4 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, ((directory.pos.length + directory.lawyers.length) / 50) * 100)}%` }}></div>
                    </div>
                </div>
                <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Probation Volume</p>
                    <div className="flex items-end gap-3 text-blue-600">
                        <span className="text-4xl font-black">{directory.pos.length}</span>
                        <span className="text-xs font-bold text-gray-400 pb-1.5">Unique Officers</span>
                    </div>
                </div>
                <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Legal Volume</p>
                    <div className="flex items-end gap-3 text-indigo-600">
                        <span className="text-4xl font-black">{directory.lawyers.length}</span>
                        <span className="text-xs font-bold text-gray-400 pb-1.5">Unique Attorneys</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDirectory;
