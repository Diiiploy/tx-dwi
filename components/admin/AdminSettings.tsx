
import React, { useState } from 'react';
import { User, UserRole, Coupon, AddOn } from '../../types';
import { IconTrash, IconUserPlus, IconTag, IconPlus, IconZap, IconCheckCircle, IconShield, IconLink, IconFolder, IconClipboardList, IconMail, IconClock, IconGmail, IconOutlook, IconRefreshCw, IconEdit, IconChatGPT, IconMic, IconClapperboard, IconRocket } from '../icons';
import AddUserModal from './AddUserModal';

interface AdminSettingsProps {
    users: User[];
    onAddUser: (name: string, email: string, permissions: string[]) => void;
    onUpdateUser: (userId: number, name: string, email: string, permissions: string[]) => void;
    onRemoveUser: (userId: number) => void;
    coupons: Coupon[];
    onAddCoupon: (code: string, discountAmount: number) => void;
    onDeleteCoupon: (code: string) => void;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ users, onAddUser, onUpdateUser, onRemoveUser, coupons, onAddCoupon, onDeleteCoupon }) => {
    const [activeTab, setActiveTab] = useState<'users' | 'coupons' | 'email-sync' | 'subscription' | 'integrations'>('users');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [newCouponCode, setNewCouponCode] = useState('');
    const [newCouponAmount, setNewCouponAmount] = useState<number | ''>('');

    // Email Sync State
    const [emailConnection, setEmailConnection] = useState<{ provider: string | null, status: 'connected' | 'disconnected' | 'connecting', account: string | null }>({
        provider: null,
        status: 'disconnected',
        account: null
    });
    const [syncSettings, setSyncSettings] = useState({ incoming: true, outgoing: true, trackOpens: true });

    // Mock Add-ons Data
    const [addOns, setAddOns] = useState<AddOn[]>([
        { id: 'addon-1', name: 'SMS Attendance Reminders', description: 'Automated text alerts 1 hour before class.', price: 19, isActive: true },
        { id: 'addon-2', name: 'Court Reporting Integration', description: 'Auto-send secure certificates to county clerks.', price: 49, isActive: false },
        { id: 'addon-3', name: 'Custom AI Avatar Cloning', description: 'Clone your head instructor for AI classes.', price: 99, isActive: false },
        { id: 'addon-4', name: 'Biometric Security Suite', description: 'Voice verification + Frequent facial checks.', price: 29, isActive: true },
        { id: 'addon-5', name: 'White-Label Domain (CNAME)', description: 'Use your own domain (e.g. classroom.yourschool.com).', price: 59, isActive: false },
        { id: 'addon-6', name: 'USPS Letter-Track Pro', description: 'Real-time USPS tracking and delivery confirmation for physical certificates.', price: 25, isActive: false },
    ]);

    // Mock Integrations Data
    const [integrations, setIntegrations] = useState([
        { id: 'chatgpt', name: 'ChatGPT / OpenAI', description: 'Automate student essay summaries, auto-grade open-ended responses, and draft professional instructor responses.', status: 'disconnected' as const },
        { id: 'retell', name: 'Retell AI', description: 'Deploy AI voice agents to conduct student follow-ups, verify attendance via phone, and handle routine inquiries.', status: 'disconnected' as const },
        { id: 'screencastify', name: 'Screencastify', description: 'Enable instructors to record personal video feedback and screen recordings directly within the student management portal.', status: 'disconnected' as const },
        { id: 'gohighlevel', name: 'Go High Level', description: 'Sync student registration data, trigger automated marketing workflows, and manage lead pipelines directly with GoHighLevel CRM integration.', status: 'disconnected' as const },
        { id: 'google-drive', name: 'Google Drive', description: 'Automatically backup student certificates and paperwork to a designated Drive folder.', status: 'disconnected' as const },
        { id: 'classmarker', name: 'ClassMarker', description: 'Sync external quiz scores directly into student profiles for automated grading.', status: 'disconnected' as const },
        { id: 'zapier', name: 'Zapier', description: 'Trigger actions in 5,000+ other apps when a student registers or completes a course.', status: 'connected' as const },
        { id: 'letter-track', name: 'Letter-Track', description: 'Add USPS tracking to physical mailings sent to students or courts.', status: 'disconnected' as const },
        { id: 'fedex', name: 'FedEx Tracking', description: 'Real-time tracking for expedited physical certificate shipments.', status: 'disconnected' as const },
    ]);

    const basePlanPrice = 199;

    const handleAddCouponSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCouponCode.trim() && newCouponAmount !== '' && Number(newCouponAmount) > 0) {
            onAddCoupon(newCouponCode.trim().toUpperCase(), Number(newCouponAmount));
            setNewCouponCode('');
            setNewCouponAmount('');
        }
    };

    const toggleAddOn = (id: string) => {
        setAddOns(prev => prev.map(addon => 
            addon.id === id ? { ...addon, isActive: !addon.isActive } : addon
        ));
    };

    const toggleIntegration = (id: string) => {
        setIntegrations(prev => prev.map(int => 
            int.id === id ? { ...int, status: int.status === 'connected' ? 'disconnected' : 'connected' } : int
        ));
    };

    const handleConnectEmail = (provider: string) => {
        setEmailConnection({ provider, status: 'connecting', account: null });
        setTimeout(() => {
            setEmailConnection({
                provider,
                status: 'connected',
                account: `admin@${provider.toLowerCase()}.com`
            });
        }, 1500);
    };

    const handleDisconnectEmail = () => {
        if (window.confirm("Disconnect your email account? Outgoing emails from the CRM will no longer be synced.")) {
            setEmailConnection({ provider: null, status: 'disconnected', account: null });
        }
    };

    const calculateTotalMonthly = () => {
        const activeAddonsTotal = addOns.filter(a => a.isActive).reduce((sum, a) => sum + a.price, 0);
        return basePlanPrice + activeAddonsTotal;
    };

    const getIntegrationIcon = (id: string) => {
        switch(id) {
            case 'chatgpt': return <IconChatGPT className="w-6 h-6 text-emerald-600" />;
            case 'retell': return <IconMic className="w-6 h-6 text-indigo-500" />;
            case 'screencastify': return <IconClapperboard className="w-6 h-6 text-red-500" />;
            case 'gohighlevel': return <IconRocket className="w-6 h-6 text-blue-500" />;
            case 'google-drive': return <IconFolder className="w-6 h-6 text-blue-600" />;
            case 'classmarker': return <IconClipboardList className="w-6 h-6 text-green-600" />;
            case 'zapier': return <IconZap className="w-6 h-6 text-orange-600" />;
            case 'letter-track': return <IconMail className="w-6 h-6 text-blue-500" />;
            case 'fedex': return <IconClock className="w-6 h-6 text-purple-700" />;
            default: return <IconLink className="w-6 h-6 text-gray-600" />;
        }
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleSaveUser = (name: string, email: string, permissions: string[]) => {
        if (editingUser) {
            onUpdateUser(editingUser.id, name, email, permissions);
        } else {
            onAddUser(name, email, permissions);
        }
        setIsModalOpen(false);
        setEditingUser(null);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>

            <div className="bg-white rounded-lg shadow-md border border-gray-200">
                <div className="border-b border-gray-200 overflow-x-auto">
                    <nav className="-mb-px flex min-w-max" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'users'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                            }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <IconUserPlus className="w-5 h-5" />
                                Users
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('coupons')}
                            className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'coupons'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                            }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <IconTag className="w-5 h-5" />
                                Coupons
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('email-sync')}
                            className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'email-sync'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                            }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <IconMail className="w-5 h-5" />
                                Email Sync
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('subscription')}
                            className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'subscription'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                            }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <IconZap className="w-5 h-5" />
                                Subscription
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('integrations')}
                            className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'integrations'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                            }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <IconLink className="w-5 h-5" />
                                Integrations
                            </div>
                        </button>
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === 'users' && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
                                <button
                                    onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
                                >
                                    <IconUserPlus className="w-5 h-5" />
                                    Add Admin Assistant
                                </button>
                            </div>

                            <p className="text-sm text-gray-600 mb-4">
                                Admin Assistants have limited access. They can view student data, monitor classes, and see analytics, but cannot change curriculum or manage system settings.
                            </p>

                            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {users.map(user => (
                                            <tr key={user.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === UserRole.Admin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                                    {user.role === UserRole.Assistant ? (
                                                        <div className="flex justify-center gap-3">
                                                            <button
                                                                onClick={() => handleEditUser(user)}
                                                                className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                                                            >
                                                                <IconEdit className="w-4 h-4" /> Edit
                                                            </button>
                                                            <button
                                                                onClick={() => onRemoveUser(user.id)}
                                                                className="text-red-600 hover:text-red-800 hover:underline flex items-center gap-1"
                                                            >
                                                                <IconTrash className="w-4 h-4" /> Remove
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">N/A</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'coupons' && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <IconTag className="w-5 h-5 text-gray-500" />
                                Coupon Codes
                            </h2>
                            
                            <form onSubmit={handleAddCouponSubmit} className="flex gap-4 mb-6 items-end bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div>
                                    <label htmlFor="couponCode" className="block text-sm font-medium text-gray-700">Code</label>
                                    <input
                                        type="text"
                                        id="couponCode"
                                        value={newCouponCode}
                                        onChange={(e) => setNewCouponCode(e.target.value)}
                                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 uppercase font-mono"
                                        placeholder="e.g. SAVE20"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="discountAmount" className="block text-sm font-medium text-gray-700">Discount Amount ($)</label>
                                    <input
                                        type="number"
                                        id="discountAmount"
                                        value={newCouponAmount}
                                        onChange={(e) => setNewCouponAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="20"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <button type="submit" className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md shadow-sm hover:bg-green-700 transition flex items-center gap-1">
                                    <IconPlus className="w-4 h-4" /> Add Coupon
                                </button>
                            </form>

                            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {coupons.length > 0 ? (
                                            coupons.map(coupon => (
                                                <tr key={coupon.code}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-mono tracking-wider">{coupon.code}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${coupon.discountAmount.toFixed(2)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                                        <button
                                                            onClick={() => onDeleteCoupon(coupon.code)}
                                                            className="text-red-600 hover:text-red-800 hover:underline flex items-center gap-1 justify-center"
                                                        >
                                                            <IconTrash className="w-4 h-4" /> Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500 italic">No coupons created yet.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'email-sync' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800">Email (2-way sync)</h2>
                                    <p className="text-sm text-gray-600 mt-1">Connect your personal email account to sync incoming and outgoing emails directly with the CRM.</p>
                                </div>
                                {emailConnection.status === 'connected' && (
                                    <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                                        <IconCheckCircle className="w-3 h-3" /> Connected
                                    </span>
                                )}
                            </div>

                            {emailConnection.status === 'disconnected' ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                                    <div className="p-6 border border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all group bg-white">
                                        <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center mb-4 border border-gray-100 group-hover:bg-blue-50">
                                            <IconGmail className="w-7 h-7 text-red-500" />
                                        </div>
                                        <h3 className="font-bold text-gray-900">Gmail</h3>
                                        <p className="text-xs text-gray-500 mt-1 mb-6">Connect your Google Workspace or personal Gmail account.</p>
                                        <button 
                                            onClick={() => handleConnectEmail('Gmail')}
                                            className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg text-sm hover:bg-blue-700 shadow-sm"
                                        >
                                            Connect Gmail
                                        </button>
                                    </div>

                                    <div className="p-6 border border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all group bg-white">
                                        <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center mb-4 border border-gray-100 group-hover:bg-blue-50">
                                            <IconOutlook className="w-7 h-7 text-blue-600" />
                                        </div>
                                        <h3 className="font-bold text-gray-900">Outlook</h3>
                                        <p className="text-xs text-gray-500 mt-1 mb-6">Connect your Microsoft 365 or Outlook.com account.</p>
                                        <button 
                                            onClick={() => handleConnectEmail('Outlook')}
                                            className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg text-sm hover:bg-blue-700 shadow-sm"
                                        >
                                            Connect Outlook
                                        </button>
                                    </div>

                                    <div className="p-6 border border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all group bg-white">
                                        <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center mb-4 border border-gray-100 group-hover:bg-blue-50">
                                            <IconMail className="w-7 h-7 text-gray-600" />
                                        </div>
                                        <h3 className="font-bold text-gray-900">Other (IMAP)</h3>
                                        <p className="text-xs text-gray-500 mt-1 mb-6">Use IMAP/SMTP to connect other email providers.</p>
                                        <button 
                                            onClick={() => handleConnectEmail('IMAP')}
                                            className="w-full py-2 bg-gray-200 text-gray-800 font-bold rounded-lg text-sm hover:bg-gray-300 shadow-sm"
                                        >
                                            Custom Setup
                                        </button>
                                    </div>
                                </div>
                            ) : emailConnection.status === 'connecting' ? (
                                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                                    <IconRefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
                                    <p className="font-bold text-gray-700">Connecting to {emailConnection.provider}...</p>
                                    <p className="text-sm text-gray-500">Establishing secure 2-way sync bridge</p>
                                </div>
                            ) : (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white rounded-full shadow-sm">
                                                {emailConnection.provider === 'Gmail' ? <IconGmail className="w-6 h-6 text-red-500" /> : <IconOutlook className="w-6 h-6 text-blue-600" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{emailConnection.account}</p>
                                                <p className="text-xs text-gray-500">Last synced: Just now</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={handleDisconnectEmail}
                                            className="text-xs font-bold text-red-600 hover:underline"
                                        >
                                            Disconnect Account
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <h3 className="font-bold text-gray-800 uppercase tracking-widest text-xs">Sync Settings</h3>
                                            <div className="space-y-3">
                                                <label className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-800">Incoming Emails</p>
                                                        <p className="text-[10px] text-gray-500 italic">Sync emails from your inbox to the CRM</p>
                                                    </div>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={syncSettings.incoming} 
                                                        onChange={(e) => setSyncSettings({...syncSettings, incoming: e.target.checked})}
                                                        className="w-10 h-5 bg-gray-200 rounded-full appearance-none checked:bg-blue-600 transition-colors cursor-pointer relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:w-4 after:h-4 after:rounded-full after:transition-transform checked:after:translate-x-5"
                                                    />
                                                </label>
                                                <label className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-800">Outgoing Emails</p>
                                                        <p className="text-[10px] text-gray-500 italic">CRM emails will appear in your "Sent" folder</p>
                                                    </div>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={syncSettings.outgoing} 
                                                        onChange={(e) => setSyncSettings({...syncSettings, outgoing: e.target.checked})}
                                                        className="w-10 h-5 bg-gray-200 rounded-full appearance-none checked:bg-blue-600 transition-colors cursor-pointer relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:w-4 after:h-4 after:rounded-full after:transition-transform checked:after:translate-x-5"
                                                    />
                                                </label>
                                                <label className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-800">Open Tracking</p>
                                                        <p className="text-[10px] text-gray-500 italic">Notify you when students open your emails</p>
                                                    </div>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={syncSettings.trackOpens} 
                                                        onChange={(e) => setSyncSettings({...syncSettings, trackOpens: e.target.checked})}
                                                        className="w-10 h-5 bg-gray-200 rounded-full appearance-none checked:bg-blue-600 transition-colors cursor-pointer relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:w-4 after:h-4 after:rounded-full after:transition-transform checked:after:translate-x-5"
                                                    />
                                                </label>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="font-bold text-gray-800 uppercase tracking-widest text-xs">Email Signature</h3>
                                            <textarea 
                                                className="w-full p-3 border border-gray-200 rounded-lg text-sm font-sans min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Best regards,&#10;Your Name&#10;DWI Education Lead"
                                                defaultValue="Best regards,&#10;Main Admin&#10;DWI Education of Central Texas"
                                            ></textarea>
                                            <button className="text-xs font-bold text-blue-600 hover:underline">Preview Signature</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'subscription' && (
                        <div>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-xl text-white shadow-lg">
                                <div>
                                    <h2 className="text-2xl font-bold mb-1">Professional Plan</h2>
                                    <p className="text-blue-100 text-sm">Your base subscription allows for up to 500 active students.</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs uppercase tracking-wide opacity-80">Total Monthly Cost</p>
                                    <p className="text-4xl font-bold">${calculateTotalMonthly()}<span className="text-lg font-normal opacity-80">/mo</span></p>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <IconPlus className="w-6 h-6 text-blue-600" />
                                Available Add-ons
                            </h3>
                            <p className="text-gray-600 mb-6">Enhance your white-label platform with these premium features. Changes are applied immediately to your billing cycle.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {addOns.map(addon => (
                                    <div key={addon.id} className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${addon.isActive ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white hover:border-blue-300'}`}>
                                        {addon.isActive && (
                                            <div className="absolute top-4 right-4 text-green-600">
                                                <IconCheckCircle className="w-6 h-6" />
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3 mb-3">
                                            {addon.name.includes("Security") ? <IconShield className={`w-8 h-8 ${addon.isActive ? 'text-green-600' : 'text-gray-400'}`} /> : 
                                             addon.name.includes("SMS") ? <IconTag className={`w-8 h-8 ${addon.isActive ? 'text-green-600' : 'text-gray-400'}`} /> :
                                             addon.name.includes("Letter") ? <IconMail className={`w-8 h-8 ${addon.isActive ? 'text-green-600' : 'text-gray-400'}`} /> :
                                             <IconZap className={`w-8 h-8 ${addon.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                                            }
                                            <h4 className="font-bold text-gray-900 leading-tight">{addon.name}</h4>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-6 min-h-[40px]">{addon.description}</p>
                                        <div className="flex items-center justify-between mt-auto">
                                            <span className="text-lg font-bold text-gray-900">${addon.price}<span className="text-xs font-normal text-gray-500">/mo</span></span>
                                            <button
                                                onClick={() => toggleAddOn(addon.id)}
                                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                                    addon.isActive 
                                                    ? 'bg-white border border-green-600 text-green-700 hover:bg-green-50' 
                                                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                                                }`}
                                            >
                                                {addon.isActive ? 'Remove' : 'Add Feature'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'integrations' && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <IconLink className="w-5 h-5 text-gray-500" />
                                Third-Party Integrations
                            </h2>
                            <p className="text-gray-600 mb-6">Connect your favorite tools to streamline your workflow.</p>

                            <div className="space-y-4">
                                {integrations.map(integration => (
                                    <div key={integration.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors bg-white">
                                        <div className="flex items-start sm:items-center gap-4 mb-4 sm:mb-0">
                                            <div className="p-3 bg-gray-50 rounded-full flex-shrink-0 border border-gray-100">
                                                {getIntegrationIcon(integration.id)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                                    {integration.name}
                                                    {integration.status === 'connected' && (
                                                        <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-medium border border-green-200">Connected</span>
                                                    )}
                                                </h4>
                                                <p className="text-sm text-gray-600 mt-1">{integration.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 sm:ml-4">
                                            <button
                                                onClick={() => toggleIntegration(integration.id)}
                                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors w-full sm:w-auto ${
                                                    integration.status === 'connected'
                                                        ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-red-600'
                                                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                                                }`}
                                            >
                                                {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <AddUserModal
                    editingUser={editingUser}
                    onClose={() => { setIsModalOpen(false); setEditingUser(null); }}
                    onSave={handleSaveUser}
                />
            )}
        </div>
    );
};

export default AdminSettings;
