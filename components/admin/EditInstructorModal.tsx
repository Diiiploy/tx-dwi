
import React, { useState, useEffect } from 'react';
import { Instructor, Course } from '../../types';
import { IconClose, IconMail, IconPhone, IconHuman } from '../icons';

interface EditInstructorModalProps {
    instructor: Instructor | null;
    courses: Course[];
    onClose: () => void;
    onSave: (data: { id?: number; name: string; email?: string; phoneNumber?: string; assignedCourseIds: string[] }) => void;
}

const EditInstructorModal: React.FC<EditInstructorModalProps> = ({ instructor, courses, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [assignedCourseIds, setAssignedCourseIds] = useState<string[]>([]);

    useEffect(() => {
        if (instructor) {
            setName(instructor.name);
            setEmail(instructor.email || '');
            setPhoneNumber(instructor.phoneNumber || '');
            setAssignedCourseIds(instructor.assignedCourseIds);
        } else {
            setName('');
            setEmail('');
            setPhoneNumber('');
            setAssignedCourseIds([]);
        }
    }, [instructor]);

    const handleCourseToggle = (courseId: string) => {
        setAssignedCourseIds(prev =>
            prev.includes(courseId)
                ? prev.filter(id => id !== courseId)
                : [...prev, courseId]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            alert('Please enter the instructor\'s name.');
            return;
        }
        onSave({ 
            id: instructor?.id, 
            name, 
            email: email.trim() || undefined, 
            phoneNumber: phoneNumber.trim() || undefined, 
            assignedCourseIds 
        });
    };

    const isEditing = instructor !== null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" role="dialog" aria-modal="true">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-lg m-4 border border-gray-200">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {isEditing ? 'Edit Instructor' : 'Add New Instructor'}
                    </h2>
                    <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800" aria-label="Close modal">
                        <IconClose />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="instructorName" className="block text-sm font-medium text-gray-700">Full Name</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <IconHuman className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                id="instructorName"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="instructorEmail" className="block text-sm font-medium text-gray-700">Email Address</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <IconMail className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    id="instructorEmail"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="mt-1 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="email@example.com"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="instructorPhone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <IconPhone className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="tel"
                                    id="instructorPhone"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="mt-1 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="(555) 000-0000"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Assign Courses</label>
                        <div className="mt-2 space-y-2 p-3 border border-gray-200 rounded-lg max-h-60 overflow-y-auto bg-gray-50">
                            {courses.map(course => (
                                <label key={course.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-white transition-colors cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={assignedCourseIds.includes(course.id)}
                                        onChange={() => handleCourseToggle(course.id)}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-800">{course.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-sm hover:bg-gray-700 transition">
                        Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition">
                        {isEditing ? 'Save Changes' : 'Add Instructor'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditInstructorModal;
