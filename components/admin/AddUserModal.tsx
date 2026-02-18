import React, { useState, useEffect } from 'react';
import { IconClose, IconShield } from '../icons';
import { User } from '../../types';

interface AddUserModalProps {
    onClose: () => void;
    onSave: (name: string, email: string, permissions: string[]) => void;
    editingUser?: User | null;
}

interface PermissionItem {
    id: string;
    title: string;
    description: string;
    checked: boolean;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ onClose, onSave, editingUser }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const [permissions, setPermissions] = useState<PermissionItem[]>([
        { id: 'curriculum', title: 'CURRICULUM', description: 'Manage courses, modules, and content blocks', checked: false },
        { id: 'schedule', title: 'CLASS SCHEDULE', description: 'View and manage upcoming class sessions', checked: true },
        { id: 'monitor', title: 'LIVE MONITOR', description: 'Watch active classes and send alerts', checked: true },
        { id: 'students', title: 'STUDENTS', description: 'Manage student profiles, paperwork, and certificates', checked: true },
        { id: 'instructors', title: 'INSTRUCTORS', description: 'Manage instructor assignments and files', checked: false },
        { id: 'inbox', title: 'UNIFIED INBOX', description: 'Communicate with students via Email & SMS', checked: true },
    ]);

    useEffect(() => {
        if (editingUser) {
            setName(editingUser.name);
            setEmail(editingUser.email);
            // If user has saved permissions, apply them
            if (editingUser.permissions) {
                setPermissions(prev => prev.map(p => ({
                    ...p,
                    checked: editingUser.permissions!.includes(p.id)
                })));
            }
        }
    }, [editingUser]);

    const togglePermission = (id: string) => {
        setPermissions(prev => prev.map(p => p.id === id ? { ...p, checked: !p.checked } : p));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !email.trim()) {
            alert('Please fill out Name and Email.');
            return;
        }
        const activePermissions = permissions.filter(p => p.checked).map(p => p.id);
        onSave(name, email, activePermissions);
    };

    const inputClasses = "mt-1 block w-full px-4 py-3 bg-[#3f3f3f] border-none rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all";
    const labelClasses = "block text-sm font-semibold text-[#4a5568] mb-1";

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-2xl w-full max-w-2xl border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                    <h2 className="text-2xl font-bold text-[#2d3748]">{editingUser ? 'Edit Assistant' : 'Add Assistant'}</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close modal">
                        <IconClose className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8 space-y-6 max-h-[85vh] overflow-y-auto">
                    {/* Top Row: Name and Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="userName" className={labelClasses}>Full Name</label>
                            <input
                                type="text"
                                id="userName"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={inputClasses}
                                placeholder="e.g. Sarah Jones"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="userEmail" className={labelClasses}>Email Address</label>
                            <input
                                type="email"
                                id="userEmail"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={inputClasses}
                                placeholder="sarah.j@school.com"
                                required
                            />
                        </div>
                    </div>

                    {/* Middle Row: Password */}
                    <div>
                        <label htmlFor="userPassword" className={labelClasses}>{editingUser ? 'New Temporary Password' : 'Temporary Password'}</label>
                        <input
                            type="password"
                            id="userPassword"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={inputClasses}
                            placeholder={editingUser ? "Leave blank to keep current" : ""}
                        />
                         <p className="text-xs text-[#718096] mt-2 font-medium">The user will be prompted to change this on first login.</p>
                    </div>

                    <hr className="border-gray-100 my-8" />

                    {/* Permissions Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <IconShield className="w-5 h-5 text-blue-500" />
                            <h3 className="text-sm font-black text-[#4a5568] tracking-widest uppercase">Access Permissions</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {permissions.map((perm) => (
                                <div 
                                    key={perm.id}
                                    onClick={() => togglePermission(perm.id)}
                                    className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer group"
                                >
                                    <div className="pt-1">
                                        <input
                                            type="checkbox"
                                            checked={perm.checked}
                                            readOnly
                                            className="h-5 w-5 text-pink-500 border-gray-300 rounded-md focus:ring-pink-500 transition-colors cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-blue-600 tracking-tight leading-none mb-1 uppercase group-hover:text-blue-700">
                                            {perm.title}
                                        </h4>
                                        <p className="text-xs text-[#718096] leading-relaxed font-medium">
                                            {perm.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-4">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg shadow-sm hover:bg-gray-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition-all transform active:scale-95"
                    >
                        {editingUser ? 'Save Changes' : 'Save Assistant'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddUserModal;