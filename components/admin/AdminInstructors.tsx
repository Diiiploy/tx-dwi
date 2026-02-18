
import React, { useState } from 'react';
import { Instructor, Course, LiveSession, CourseResource } from '../../types';
import { IconHuman, IconUserPlus, IconEdit, IconTrash, IconFolder, IconStar, IconMail, IconPhone } from '../icons';
import EditInstructorModal from './EditInstructorModal';
import CourseResourcesModal from '../CourseResourcesModal';
import InstructorEvaluationsModal from './InstructorEvaluationsModal';

interface AdminInstructorsProps {
    instructors: Instructor[];
    courses: Course[];
    liveSessions: LiveSession[];
    onAddInstructor: (name: string, assignedCourseIds: string[], email?: string, phoneNumber?: string) => void;
    onUpdateInstructor: (instructorId: number, updatedData: Partial<Instructor>) => void;
    onDeleteInstructor: (instructorId: number) => void;
}

const AdminInstructors: React.FC<AdminInstructorsProps> = ({ instructors, courses, liveSessions, onAddInstructor, onUpdateInstructor, onDeleteInstructor }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);
    const [viewingResourcesInstructor, setViewingResourcesInstructor] = useState<Instructor | null>(null);
    const [viewingEvaluationsInstructor, setViewingEvaluationsInstructor] = useState<Instructor | null>(null);

    const handleOpenModal = (instructor: Instructor | null) => {
        setEditingInstructor(instructor);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingInstructor(null);
    };

    const handleSave = (data: { id?: number; name: string; email?: string; phoneNumber?: string; assignedCourseIds: string[] }) => {
        if (data.id) { // Editing
            onUpdateInstructor(data.id, { 
                name: data.name, 
                email: data.email, 
                phoneNumber: data.phoneNumber, 
                assignedCourseIds: data.assignedCourseIds 
            });
        } else { // Adding
            onAddInstructor(data.name, data.assignedCourseIds, data.email, data.phoneNumber);
        }
        handleCloseModal();
    };

    const getAggregatedResources = (instructor: Instructor) => {
        const assignedCourses = instructor.assignedCourseIds
            .map(id => courses.find(c => c.id === id))
            .filter((c): c is Course => !!c);
        
        const courseResources = assignedCourses.flatMap(c => c.resources || []);
        const instructorResources = instructor.resources || [];
        return [...instructorResources, ...courseResources];
    };

    const handleUploadResource = (file: File) => {
        if (!viewingResourcesInstructor) return;
        const type = file.type.startsWith('video/') ? 'video' : file.type.includes('pdf') ? 'document' : 'document';
        const newResource: CourseResource = {
            id: `res-inst-${Date.now()}`,
            title: file.name,
            type: type as any,
            url: URL.createObjectURL(file)
        };
        
        const updatedResources = [...(viewingResourcesInstructor.resources || []), newResource];
        const updatedInstructor = { ...viewingResourcesInstructor, resources: updatedResources };
        
        setViewingResourcesInstructor(updatedInstructor);
        onUpdateInstructor(viewingResourcesInstructor.id, { resources: updatedResources });
    };

    const getAverageRating = (evals?: Instructor['evaluations']) => {
        if (!evals || evals.length === 0) return 'N/A';
        const sum = evals.reduce((acc, curr) => acc + curr.rating, 0);
        return (sum / evals.length).toFixed(1);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Instructor Management</h1>
                 <button
                    onClick={() => handleOpenModal(null)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
                >
                    <IconUserPlus className="w-5 h-5" />
                    Add Instructor
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructor Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Information</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Courses</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Live Session Code</th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {instructors.map(instructor => {
                            const assignedCourses = instructor.assignedCourseIds.map(id => courses.find(c => c.id === id)).filter(Boolean);
                            const session = liveSessions.find(s => s.instructorId === instructor.id);
                            const avgRating = getAverageRating(instructor.evaluations);

                            return (
                                <tr key={instructor.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gray-200 rounded-full">
                                                <IconHuman className="h-6 w-6 text-gray-600" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{instructor.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="space-y-1">
                                            {instructor.email && (
                                                <a href={`mailto:${instructor.email}`} className="flex items-center gap-2 text-xs text-blue-600 hover:underline">
                                                    <IconMail className="w-3 h-3" />
                                                    {instructor.email}
                                                </a>
                                            )}
                                            {instructor.phoneNumber && (
                                                <a href={`tel:${instructor.phoneNumber.replace(/\D/g, '')}`} className="flex items-center gap-2 text-xs text-gray-600 hover:text-blue-600">
                                                    <IconPhone className="w-3 h-3" />
                                                    {instructor.phoneNumber}
                                                </a>
                                            )}
                                            {!instructor.email && !instructor.phoneNumber && (
                                                <span className="text-xs text-gray-400 italic">No contact provided</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-1">
                                            <IconStar className={`w-4 h-4 ${avgRating === 'N/A' ? 'text-gray-300' : 'text-yellow-400 fill-current'}`} />
                                            <span className="text-sm font-bold text-gray-700">{avgRating}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        <div className="flex flex-wrap gap-1">
                                            {assignedCourses.length > 0 ? assignedCourses.map(course => (
                                                <span key={course!.id} className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full">
                                                    {course!.name}
                                                </span>
                                            )) : <span className="text-xs text-gray-400 italic">Not Assigned</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {session && session.instructorCode ? (
                                            <span className="font-mono bg-gray-200 px-3 py-1 rounded-full text-sm text-gray-800">
                                                {session.instructorCode}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-gray-400 italic">No active session</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <button onClick={() => setViewingEvaluationsInstructor(instructor)} className="text-yellow-600 hover:text-yellow-700 p-2 mr-1" title="View Evaluations">
                                            <IconStar className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setViewingResourcesInstructor(instructor)} className="text-gray-600 hover:text-gray-900 p-2 mr-1" title="View/Manage Files">
                                            <IconFolder className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleOpenModal(instructor)} className="text-blue-600 hover:text-blue-900 p-2" title="Edit Instructor">
                                            <IconEdit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => onDeleteInstructor(instructor.id)} className="text-red-600 hover:text-red-900 p-2 ml-2" title="Delete Instructor">
                                            <IconTrash className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (
                <EditInstructorModal
                    instructor={editingInstructor}
                    courses={courses}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                />
            )}
            {viewingResourcesInstructor && (
                <CourseResourcesModal 
                    isOpen={!!viewingResourcesInstructor}
                    onClose={() => setViewingResourcesInstructor(null)}
                    resources={getAggregatedResources(viewingResourcesInstructor)}
                    title={`Files for ${viewingResourcesInstructor.name}`}
                    onUpload={handleUploadResource}
                />
            )}
            {viewingEvaluationsInstructor && (
                <InstructorEvaluationsModal
                    instructor={viewingEvaluationsInstructor}
                    onClose={() => setViewingEvaluationsInstructor(null)}
                />
            )}
        </div>
    );
};

export default AdminInstructors;
