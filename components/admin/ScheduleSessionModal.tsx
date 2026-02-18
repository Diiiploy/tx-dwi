import React, { useState, useEffect } from 'react';
import { Course, ScheduledClass, InstructorType, Instructor } from '../../types';
import { IconClose } from '../icons';

interface ScheduleSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (session: ScheduledClass | Omit<ScheduledClass, 'id'>) => void;
    course: Course;
    sessionToEdit: ScheduledClass | null;
    instructors: Instructor[];
}

const ScheduleSessionModal: React.FC<ScheduleSessionModalProps> = ({ isOpen, onClose, onSave, course, sessionToEdit, instructors }) => {
    const [formData, setFormData] = useState({
        moduleId: course.modules[0]?.id || '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        instructorType: course.instructorType,
        instructorId: course.instructorType === InstructorType.Human ? (instructors[0]?.id || undefined) : undefined,
    });

    useEffect(() => {
        if (sessionToEdit) {
            setFormData({
                moduleId: sessionToEdit.moduleId,
                date: sessionToEdit.date,
                time: sessionToEdit.time,
                instructorType: sessionToEdit.instructorType,
                instructorId: sessionToEdit.instructorId,
            });
        } else {
            // Reset to defaults when adding a new session
             setFormData({
                moduleId: course.modules[0]?.id || '',
                date: new Date().toISOString().split('T')[0],
                time: '09:00',
                instructorType: course.instructorType,
                instructorId: course.instructorType === InstructorType.Human ? (instructors[0]?.id || undefined) : undefined,
            });
        }
    }, [sessionToEdit, course, instructors]);
    
    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.moduleId) {
            alert('Please select a module.');
            return;
        }
        const sessionData: Omit<ScheduledClass, 'id'> = {
            courseId: course.id,
            moduleId: formData.moduleId,
            date: formData.date,
            time: formData.time,
            instructorType: formData.instructorType,
            instructorId: formData.instructorType === InstructorType.Human ? formData.instructorId : undefined,
        };
        if (sessionToEdit) {
            onSave({ ...sessionToEdit, ...sessionData });
        } else {
            onSave(sessionData);
        }
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleInstructorTypeChange = (type: InstructorType) => {
        setFormData(prev => ({ 
            ...prev, 
            instructorType: type,
            instructorId: type === InstructorType.Human ? (instructors[0]?.id || undefined) : undefined
        }));
    };

    const isEditing = sessionToEdit !== null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" role="dialog" aria-modal="true">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-lg m-4 border border-gray-200">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {isEditing ? 'Edit Scheduled Session' : 'Add Scheduled Session'}
                    </h2>
                    <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800" aria-label="Close modal">
                        <IconClose />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="moduleId" className="block text-sm font-medium text-gray-700">Module</label>
                        <select
                            id="moduleId"
                            name="moduleId"
                            value={formData.moduleId}
                            onChange={handleChange}
                            className="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            required
                        >
                            {course.modules.map(module => (
                                <option key={module.id} value={module.id}>{module.name}</option>
                            ))}
                        </select>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                            <input
                                type="date"
                                id="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="time" className="block text-sm font-medium text-gray-700">Time</label>
                            <input
                                type="time"
                                id="time"
                                name="time"
                                value={formData.time}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                required
                            />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Instructor Type</label>
                        <div className="flex">
                            <div className="flex items-center rounded-lg bg-gray-200 p-1">
                                <button
                                    type="button"
                                    onClick={() => handleInstructorTypeChange(InstructorType.AI)}
                                    className={`px-3 py-1 text-sm rounded-md transition ${formData.instructorType === InstructorType.AI ? 'bg-white shadow' : 'text-gray-600'}`}
                                >
                                    AI Instructor
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleInstructorTypeChange(InstructorType.Human)}
                                    className={`px-3 py-1 text-sm rounded-md transition ${formData.instructorType === InstructorType.Human ? 'bg-white shadow' : 'text-gray-600'}`}
                                >
                                    Human Instructor
                                </button>
                            </div>
                        </div>
                    </div>
                    {formData.instructorType === InstructorType.Human && (
                        <div>
                            <label htmlFor="instructorId" className="block text-sm font-medium text-gray-700">Assign Instructor</label>
                            <select
                                id="instructorId"
                                name="instructorId"
                                value={formData.instructorId || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, instructorId: parseInt(e.target.value) }))}
                                className="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                required
                            >
                                <option value="" disabled>Select an instructor</option>
                                {instructors.map(instructor => (
                                    <option key={instructor.id} value={instructor.id}>{instructor.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-sm hover:bg-gray-700 transition">
                        Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition">
                        Save Session
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ScheduleSessionModal;