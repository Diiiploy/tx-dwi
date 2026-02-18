
import React, { useState, useEffect } from 'react';
import { Student } from '../../types';
import { IconClose, IconMail, IconPhone, IconHuman } from '../icons';

interface EditStudentModalProps {
    student: Student;
    onClose: () => void;
    onSave: (id: number, data: { name: string; email: string; phoneNumber: string }) => void;
}

const EditStudentModal: React.FC<EditStudentModalProps> = ({ student, onClose, onSave }) => {
    const [name, setName] = useState(student.name);
    const [email, setEmail] = useState(student.email || '');
    const [phoneNumber, setPhoneNumber] = useState(student.phoneNumber || '');

    useEffect(() => {
        setName(student.name);
        setEmail(student.email || '');
        setPhoneNumber(student.phoneNumber || '');
    }, [student]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            alert('Name is required.');
            return;
        }
        onSave(student.id, { name, email, phoneNumber });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" role="dialog" aria-modal="true">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-md m-4 border border-gray-200">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-xl font-semibold text-gray-800">Edit Student Info</h2>
                    <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800" aria-label="Close modal">
                        <IconClose />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="editName" className="block text-sm font-medium text-gray-700">Full Name</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <IconHuman className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                id="editName"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="editEmail" className="block text-sm font-medium text-gray-700">Email Address</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <IconMail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                id="editEmail"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="editPhone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <IconPhone className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                id="editPhone"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition">
                        Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition">
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditStudentModal;
