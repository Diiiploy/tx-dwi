import React, { useState, useEffect } from 'react';
import { RagQuestion } from '../../types';
import { IconClose } from '../icons';

interface RagQuestionModalProps {
    question: RagQuestion | null;
    onClose: () => void;
    onSave: (question: RagQuestion) => void;
}

const RagQuestionModal: React.FC<RagQuestionModalProps> = ({ question, onClose, onSave }) => {
    const [formData, setFormData] = useState<RagQuestion>({ question: '', context: '' });

    useEffect(() => {
        if (question) {
            setFormData(question);
        } else {
            setFormData({ question: '', context: '' });
        }
    }, [question]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.question.trim() && formData.context.trim()) {
            onSave(formData);
        } else {
            alert('Both "Suggested Question" and "Context / Answer" fields are required.');
        }
    };

    const isEditing = question !== null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" role="dialog" aria-modal="true">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-lg m-4 border border-gray-200">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {isEditing ? 'Edit AI Question' : 'Add AI Question'}
                    </h2>
                    <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800" aria-label="Close modal">
                        <IconClose />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="question" className="block text-sm font-medium text-gray-700">Suggested Question</label>
                        <p className="text-xs text-gray-500 mb-1">This is the question text the student will see as a suggestion.</p>
                        <input
                            id="question"
                            name="question"
                            value={formData.question}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., What are the penalties for a first-time DWI?"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="context" className="block text-sm font-medium text-gray-700">Context / Answer</label>
                        <p className="text-xs text-gray-500 mb-1">This is the information the AI will use to answer the question. It should be a complete answer or sufficient context.</p>
                        <textarea
                            id="context"
                            name="context"
                            value={formData.context}
                            onChange={handleChange}
                            rows={6}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., The penalties for a first DWI in Texas include fines up to $2,000, license suspension..."
                            required
                        />
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-sm hover:bg-gray-700 transition">
                        Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition">
                        Save Question
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RagQuestionModal;