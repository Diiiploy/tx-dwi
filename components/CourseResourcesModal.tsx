import React, { useRef } from 'react';
import { CourseResource } from '../types';
import { IconClose, IconFile, IconFilm, IconLink, IconSlides, IconUpload } from './icons';

interface CourseResourcesModalProps {
    isOpen: boolean;
    onClose: () => void;
    resources: CourseResource[];
    title?: string;
    onUpload?: (file: File) => void;
}

const CourseResourcesModal: React.FC<CourseResourcesModalProps> = ({ isOpen, onClose, resources, title = "Course Files & Resources", onUpload }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const getIcon = (type: CourseResource['type']) => {
        switch (type) {
            case 'video': return <IconFilm className="w-5 h-5 text-purple-600" />;
            case 'presentation': return <IconSlides className="w-5 h-5 text-orange-600" />;
            case 'link': return <IconLink className="w-5 h-5 text-blue-600" />;
            case 'document': default: return <IconFile className="w-5 h-5 text-gray-600" />;
        }
    };

    const getTypeLabel = (type: CourseResource['type']) => {
        switch (type) {
            case 'video': return 'Video Link';
            case 'presentation': return 'Presentation';
            case 'link': return 'External Link';
            case 'document': default: return 'Document';
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && onUpload) {
            onUpload(e.target.files[0]);
            // Reset input so same file can be selected again if needed
            e.target.value = '';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl border border-gray-200 flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                    <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
                    <div className="flex items-center gap-2">
                        {onUpload && (
                            <>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 px-3 py-1.5 bg-blue-50 rounded-md transition"
                                >
                                    <IconUpload className="w-4 h-4" /> Upload
                                </button>
                            </>
                        )}
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800" aria-label="Close modal">
                            <IconClose className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                    {resources.length > 0 ? (
                        <div className="grid gap-4">
                            {resources.map(resource => (
                                <div key={resource.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-white rounded-full border border-gray-200">
                                            {getIcon(resource.type)}
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900">{resource.title}</h3>
                                            <p className="text-xs text-gray-500">{getTypeLabel(resource.type)}</p>
                                        </div>
                                    </div>
                                    <a 
                                        href={resource.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition"
                                    >
                                        View
                                    </a>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <p>No resources available for this course.</p>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg flex justify-end">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-sm hover:bg-gray-700 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CourseResourcesModal;