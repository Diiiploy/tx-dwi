import React from 'react';
import { Instructor } from '../../types';
import { IconClose, IconStar, IconCalendar, IconUserPlus, IconFileText } from '../icons';

interface InstructorEvaluationsModalProps {
    instructor: Instructor;
    onClose: () => void;
}

const InstructorEvaluationsModal: React.FC<InstructorEvaluationsModalProps> = ({ instructor, onClose }) => {
    const evals = instructor.evaluations || [];

    const getAverageRating = () => {
        if (evals.length === 0) return 0;
        return evals.reduce((acc, curr) => acc + curr.rating, 0) / evals.length;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl border border-gray-200 flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-white">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            Evaluations for {instructor.name}
                        </h2>
                        <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                                <IconStar key={i} className={`w-3.5 h-3.5 ${i < Math.round(getAverageRating()) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                            ))}
                            <span className="text-xs text-gray-500 ml-1">({evals.length} total reviews)</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close modal">
                        <IconClose className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto space-y-4">
                    {evals.length > 0 ? evals.map((evaluation) => (
                        <div key={evaluation.id} className="p-5 bg-gray-50 border border-gray-100 rounded-xl hover:bg-white hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                                        <IconUserPlus className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{evaluation.studentName}</p>
                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{evaluation.courseName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <IconStar key={i} className={`w-3 h-3 ${i < evaluation.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
                                    ))}
                                </div>
                            </div>
                            
                            <p className="text-sm text-gray-700 leading-relaxed italic mt-3 mb-3">
                                "{evaluation.comment}"
                            </p>
                            
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase">
                                <IconCalendar className="w-3 h-3" />
                                <span>{formatDate(evaluation.date)}</span>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-20 opacity-40">
                            <IconFileText className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                            <p className="text-lg font-bold text-gray-400">No evaluations found</p>
                            <p className="text-sm text-gray-500">Reviews will appear here once students complete their course.</p>
                        </div>
                    )}
                </div>

                <div className="p-5 border-t border-gray-100 bg-white flex justify-end">
                    <button onClick={onClose} className="px-6 py-2.5 bg-slate-700 text-white text-sm font-bold rounded-lg shadow hover:bg-slate-800 transition">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstructorEvaluationsModal;