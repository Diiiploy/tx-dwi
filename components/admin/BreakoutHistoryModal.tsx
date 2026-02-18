import React from 'react';
import { Student } from '../../types';
import { IconClose, IconStudents } from '../icons';

interface BreakoutHistoryModalProps {
    student: Student;
    onClose: () => void;
}

const BreakoutHistoryModal: React.FC<BreakoutHistoryModalProps> = ({ student, onClose }) => {
    
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            aria-labelledby="breakout-history-title"
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg m-4 border border-gray-200">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
                    <h2 id="breakout-history-title" className="text-xl font-semibold text-gray-800">
                        Breakout History for <span className="text-blue-600">{student.name}</span>
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800" aria-label="Close modal">
                        <IconClose className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {student.breakoutHistory.length > 0 ? (
                        <ul className="space-y-4">
                            {student.breakoutHistory.map(session => (
                                <li key={session.sessionId} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="text-sm font-semibold text-gray-700">{formatDate(session.timestamp)}</p>
                                    <div className="flex items-start gap-2 mt-2">
                                        <IconStudents className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-800">In room with:</h4>
                                            <p className="text-sm text-gray-600">
                                                {session.participants.join(', ')}
                                            </p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-8">
                            <IconStudents className="w-12 h-12 mx-auto text-gray-400" />
                            <p className="mt-4 text-gray-600">No breakout room history available for this student.</p>
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

export default BreakoutHistoryModal;
