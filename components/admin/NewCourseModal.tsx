import React, { useState } from 'react';
import { Course, InstructorType } from '../../types';
import { IconClose, IconCamera, IconHuman } from '../icons';

interface NewCourseModalProps {
    onClose: () => void;
    onSave: (courseData: Pick<Course, 'name' | 'instructorType' | 'instructorName'>) => void;
}

const NewCourseModal: React.FC<NewCourseModalProps> = ({ onClose, onSave }) => {
    const [name, setName] = useState('');
    const [instructorType, setInstructorType] = useState<InstructorType>(InstructorType.AI);
    const [instructorName, setInstructorName] = useState('');

    const handleSave = () => {
        if (!name.trim()) {
            alert('Please enter a course title.');
            return;
        }
        onSave({
            name,
            instructorType,
            instructorName: instructorType === InstructorType.Human ? instructorName : undefined,
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" role="dialog" aria-modal="true">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg m-4 border border-gray-200">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-xl font-semibold text-gray-800">Create New Course</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800" aria-label="Close modal">
                        <IconClose />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="courseName" className="block text-sm font-medium text-gray-700">Course Title</label>
                        <input
                            type="text"
                            id="courseName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 w-full px-3 py-1.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                            placeholder="e.g., Advanced JavaScript"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Instructor Type</label>
                        <div className="flex">
                            <div className="flex items-center rounded-lg bg-gray-200 p-1">
                                <button
                                    onClick={() => setInstructorType(InstructorType.AI)}
                                    className={`px-3 py-1 text-sm rounded-md transition flex items-center gap-1.5 ${instructorType === InstructorType.AI ? 'bg-white shadow' : 'text-gray-600'}`}
                                >
                                    <IconCamera className="w-4 h-4" /> AI Instructor
                                </button>
                                <button
                                    onClick={() => setInstructorType(InstructorType.Human)}
                                    className={`px-3 py-1 text-sm rounded-md transition flex items-center gap-1.5 ${instructorType === InstructorType.Human ? 'bg-white shadow' : 'text-gray-600'}`}
                                >
                                    <IconHuman className="w-4 h-4" /> Human Instructor
                                </button>
                            </div>
                        </div>
                    </div>
                    {instructorType === InstructorType.Human && (
                        <div>
                            <label htmlFor="instructorName" className="block text-sm font-medium text-gray-700">Instructor Name</label>
                            <input
                                type="text"
                                id="instructorName"
                                value={instructorName}
                                onChange={(e) => setInstructorName(e.target.value)}
                                className="mt-1 w-full px-3 py-1.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                                placeholder="e.g., Jane Smith"
                            />
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-sm hover:bg-gray-700 transition">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition">
                        Create Course
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewCourseModal;