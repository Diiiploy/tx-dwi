
import React, { useState, useEffect, useRef } from 'react';
import { TimelineItem } from '../../types';
import { IconClose, IconFile, IconFilm } from '../icons';

interface EditTimelineBlockModalProps {
    item: TimelineItem | null;
    onClose: () => void;
    onSave: (updatedItem: TimelineItem) => void;
}

const EditTimelineBlockModal: React.FC<EditTimelineBlockModalProps> = ({ item, onClose, onSave }) => {
    const [formData, setFormData] = useState<TimelineItem | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoFileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setFormData(item);
    }, [item]);

    if (!formData) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? { ...prev, [name]: name === 'duration' ? parseInt(value) || 0 : value } : null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData(prev => {
                if (!prev) return null;
                const { videoFileName, ...rest } = prev;
                return { ...rest, fileName: file.name };
            });
        }
    };

    const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData(prev => {
                if (!prev) return null;
                const { fileName, ...rest } = prev;
                return { ...rest, videoFileName: file.name };
            });
        }
    };

    const handleRemoveFile = () => {
        setFormData(prev => {
            if (!prev) return null;
            const { fileName, ...rest } = prev;
            return rest;
        });
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleRemoveVideoFile = () => {
        setFormData(prev => {
            if (!prev) return null;
            const { videoFileName, ...rest } = prev;
            return rest;
        });
        if (videoFileInputRef.current) {
            videoFileInputRef.current.value = "";
        }
    };

    const handleSave = () => {
        if (formData) {
            onSave(formData);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" role="dialog" aria-modal="true">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg m-4 border border-gray-200">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-xl font-semibold text-gray-800">Edit Timeline Block</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800" aria-label="Close modal">
                        <IconClose />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description / Script</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange as React.ChangeEventHandler<HTMLTextAreaElement>}
                            rows={4}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    {formData.type === 'content' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Associated Content</label>
                            {formData.fileName ? (
                                <div className="mt-1 flex items-center justify-between p-2 bg-gray-100 border border-gray-200 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <IconFile className="w-5 h-5 text-gray-500" />
                                        <span className="text-sm font-medium text-gray-800">{formData.fileName}</span>
                                    </div>
                                    <button onClick={handleRemoveFile} className="text-sm text-red-600 hover:underline font-semibold">Remove</button>
                                </div>
                            ) : formData.videoFileName ? (
                                <div className="mt-1 flex items-center justify-between p-2 bg-gray-100 border border-gray-200 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <IconFilm className="w-5 h-5 text-gray-500" />
                                        <span className="text-sm font-medium text-gray-800">{formData.videoFileName}</span>
                                    </div>
                                    <button onClick={handleRemoveVideoFile} className="text-sm text-red-600 hover:underline font-semibold">Remove</button>
                                </div>
                            ) : (
                                <div className="mt-1 grid grid-cols-2 gap-2">
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.ppt,.pptx,.doc,.docx"/>
                                    <button onClick={() => fileInputRef.current?.click()} className="w-full px-4 py-2 bg-white text-blue-600 font-semibold border-2 border-blue-600 rounded-lg shadow-sm hover:bg-blue-50 transition">
                                        Import Document
                                    </button>
                                    <input type="file" ref={videoFileInputRef} onChange={handleVideoFileChange} className="hidden" accept="video/*"/>
                                    <button onClick={() => videoFileInputRef.current?.click()} className="w-full px-4 py-2 bg-white text-purple-600 font-semibold border-2 border-purple-600 rounded-lg shadow-sm hover:bg-purple-50 transition">
                                        Import Video
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    {formData.type === 'google-form' && (
                        <div>
                            <label htmlFor="googleFormUrl" className="block text-sm font-medium text-gray-700">Google Form URL</label>
                            <input
                                type="url"
                                id="googleFormUrl"
                                name="googleFormUrl"
                                value={formData.googleFormUrl || ''}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="https://docs.google.com/forms/d/e/.../viewform?embedded=true"
                            />
                            <p className="text-xs text-gray-500 mt-1">Paste the embed URL or the public link to the form.</p>
                        </div>
                    )}
                    {formData.type !== 'break' && (
                         <div>
                            <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                            <input
                                type="number"
                                id="duration"
                                name="duration"
                                value={formData.duration || ''}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-sm hover:bg-gray-700 transition">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditTimelineBlockModal;