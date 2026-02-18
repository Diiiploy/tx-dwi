import React, { useState } from 'react';
import { Course, Student } from '../../types';
import { IconClose } from '../icons';

interface AddStudentModalProps {
    onClose: () => void;
    onSave: (data: { name: string; courseId: string; referralSource: Student['referralSource']; company: Student['company'] }) => void;
    courses: Course[];
}

const AddStudentModal: React.FC<AddStudentModalProps> = ({ onClose, onSave, courses }) => {
    const [name, setName] = useState('');
    const [courseId, setCourseId] = useState(courses[0]?.id || '');
    const [referralSource, setReferralSource] = useState<Student['referralSource']>('Self-Registered');
    const [company, setCompany] = useState<Student['company']>('West');

    const referralOptions: Student['referralSource'][] = [
        'Travis County Court',
        'Williamson County Probation',
        'Self-Registered',
        'Other'
    ];
    
    const companyOptions: Student['company'][] = ['West', 'North', 'South', 'Southeast'];


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !courseId) {
            alert('Please fill out all required fields.');
            return;
        }
        onSave({ name, courseId, referralSource, company });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" role="dialog" aria-modal="true">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-lg m-4 border border-gray-200">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-xl font-semibold text-gray-800">Add New Student</h2>
                    <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800" aria-label="Close modal">
                        <IconClose />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="studentName" className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            type="text"
                            id="studentName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="courseId" className="block text-sm font-medium text-gray-700">Course</label>
                        <select
                            id="courseId"
                            value={courseId}
                            onChange={(e) => setCourseId(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            required
                        >
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>{course.name}</option>
                            ))}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="company" className="block text-sm font-medium text-gray-700">Company</label>
                        <select
                            id="company"
                            value={company}
                            onChange={(e) => setCompany(e.target.value as Student['company'])}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            required
                        >
                            {companyOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="referralSource" className="block text-sm font-medium text-gray-700">Referral Source</label>
                        <select
                            id="referralSource"
                            value={referralSource}
                            onChange={(e) => setReferralSource(e.target.value as Student['referralSource'])}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                            {referralOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-sm hover:bg-gray-700 transition">
                        Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition">
                        Add Student
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddStudentModal;