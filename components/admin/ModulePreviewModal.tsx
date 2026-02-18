
import React from 'react';
import { Module, TimelineItem } from '../../types';
import { IconClose, IconCamera, IconClock, IconCurriculum, IconStudents, IconFile, IconForm } from '../icons';

const blockTypes: { [key in TimelineItem['type']]: { icon: React.ReactNode; label: string } } = {
    'ai-script': { icon: <IconCamera className="text-blue-600 w-5 h-5" />, label: "AI Avatar Script" },
    'content': { icon: <IconCurriculum className="text-purple-600 w-5 h-5" />, label: "Content" },
    'quiz': { icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>, label: "Quiz" },
    'poll': { icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600"><path d="M3 15h4v-4H3v4z"></path><path d="M7 15h4v-4H7v4z"></path><path d="M11 15h4v-4h-4v4z"></path><path d="M15 15h4v-4h-4v4z"></path></svg>, label: "Poll" },
    'breakout': { icon: <IconStudents className="text-indigo-600 w-5 h-5" />, label: "Breakout Rooms" },
    'break': { icon: <IconClock className="text-red-600 w-5 h-5" />, label: "Automated Break" },
    'google-form': { icon: <IconForm className="text-orange-600 w-5 h-5" />, label: "Google Form" },
};

const PreviewTimelineItem: React.FC<{ item: TimelineItem }> = ({ item }) => {
    const meta = blockTypes[item.type];
    return (
        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex-shrink-0 mt-1">{meta.icon}</div>
            <div className="flex-grow">
                <h4 className="font-semibold text-gray-800">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.description}</p>
                 {item.type === 'content' && item.fileName && (
                    <div className="mt-2 flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                        <IconFile className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span className="text-sm text-blue-800 font-medium truncate">{item.fileName}</span>
                    </div>
                )}
                {item.type === 'google-form' && item.googleFormUrl && (
                    <div className="mt-2 flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded-md">
                        <IconForm className="w-4 h-4 text-orange-600 flex-shrink-0" />
                        <span className="text-sm text-orange-800 font-medium truncate">{item.googleFormUrl}</span>
                    </div>
                )}
                {item.duration && (
                    <p className="text-xs text-gray-500 mt-2 font-medium">{item.duration} minutes</p>
                )}
            </div>
        </div>
    );
};

interface ModulePreviewModalProps {
    module: Module | null;
    onClose: () => void;
}

const ModulePreviewModal: React.FC<ModulePreviewModalProps> = ({ module, onClose }) => {
    if (!module) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl m-4 border border-gray-200 flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Preview: <span className="text-blue-600">{module.name}</span>
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800" aria-label="Close modal">
                        <IconClose className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto space-y-4">
                    {module.items.length > 0 ? (
                        module.items.map(item => <PreviewTimelineItem key={item.id} item={item} />)
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <p className="font-semibold">This module is empty.</p>
                            <p>Drag content blocks onto the timeline to build it.</p>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50 text-right">
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

export default ModulePreviewModal;