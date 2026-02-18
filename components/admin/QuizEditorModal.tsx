import React, { useState, useEffect } from 'react';
import { TimelineItem, Question, AnswerOption } from '../../types';
import { IconClose, IconTrash, IconPlus, IconCheckCircle, IconHelpCircle, IconClock } from '../icons';

interface QuizEditorModalProps {
    item: TimelineItem | null;
    onClose: () => void;
    onSave: (updatedItem: TimelineItem) => void;
}

const QuizEditorModal: React.FC<QuizEditorModalProps> = ({ item, onClose, onSave }) => {
    const [quiz, setQuiz] = useState<TimelineItem | null>(null);

    useEffect(() => {
        if (item && item.type === 'quiz') {
            const initialQuiz = JSON.parse(JSON.stringify(item));
            if (!initialQuiz.questions) {
                initialQuiz.questions = [];
            }
            if (initialQuiz.passingScore === undefined) {
                initialQuiz.passingScore = 70;
            }
            if (initialQuiz.timeLimit === undefined) {
                initialQuiz.timeLimit = 0; // 0 means no limit
            }
            setQuiz(initialQuiz);
        }
    }, [item]);

    if (!quiz) return null;

    const handleQuizChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setQuiz(prev => prev ? { 
            ...prev, 
            [name]: (name === 'passingScore' || name === 'timeLimit') ? parseInt(value) || 0 : value 
        } : null);
    };

    const handleAddQuestion = () => {
        const timestamp = Date.now();
        const option1Id = `o-${timestamp}-1`;
        const option2Id = `o-${timestamp}-2`;

        const newQuestion: Question = {
            id: `q-${timestamp}`,
            text: 'New Question',
            options: [
                { id: option1Id, text: 'Option 1' },
                { id: option2Id, text: 'Option 2' },
            ],
            correctOptionId: option1Id,
            explanation: '',
        };
        setQuiz(prev => prev ? { ...prev, questions: [...(prev.questions || []), newQuestion] } : null);
    };

    const handleDeleteQuestion = (questionId: string) => {
        setQuiz(prev => prev ? { ...prev, questions: (prev.questions || []).filter(q => q.id !== questionId) } : null);
    };

    const handleQuestionUpdate = (questionId: string, updates: Partial<Question>) => {
        setQuiz(prev => prev ? {
            ...prev,
            questions: (prev.questions || []).map(q => q.id === questionId ? { ...q, ...updates } : q)
        } : null);
    };

    const handleAddOption = (questionId: string) => {
        const newOption: AnswerOption = { id: `o-${Date.now()}`, text: 'New Option' };
        setQuiz(prev => prev ? {
            ...prev,
            questions: (prev.questions || []).map(q => q.id === questionId ? { ...q, options: [...q.options, newOption] } : q)
        } : null);
    };

    const handleOptionTextChange = (questionId: string, optionId: string, text: string) => {
        setQuiz(prev => prev ? {
            ...prev,
            questions: (prev.questions || []).map(q => q.id === questionId ? {
                ...q,
                options: q.options.map(o => o.id === optionId ? { ...o, text } : o)
            } : q)
        } : null);
    };

    const handleDeleteOption = (questionId: string, optionId: string) => {
         setQuiz(prev => prev ? {
            ...prev,
            questions: (prev.questions || []).map(q => {
                if (q.id === questionId) {
                    if (q.options.length <= 2) {
                        alert("A question must have at least two options.");
                        return q;
                    }
                    const newOptions = q.options.filter(o => o.id !== optionId);
                    const newCorrectOptionId = q.correctOptionId === optionId ? newOptions[0].id : q.correctOptionId;
                    return { ...q, options: newOptions, correctOptionId: newCorrectOptionId };
                }
                return q;
            })
        } : null);
    };

    const handleSaveChanges = () => {
        if (quiz) {
            onSave(quiz);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" role="dialog" aria-modal="true">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl m-4 border border-gray-200 flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-lg text-white">
                            <IconCheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Quiz Assessment Builder</h2>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Configure questions and passing requirements</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close modal">
                        <IconClose className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-8 overflow-y-auto">
                    {/* Quiz Settings Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 bg-blue-50/50 rounded-xl border border-blue-100 shadow-inner">
                        <div className="md:col-span-1 space-y-4">
                            <div>
                                <label htmlFor="title" className="block text-xs font-black text-blue-900 uppercase tracking-widest mb-1.5">Quiz Title</label>
                                <input type="text" id="title" name="title" value={quiz.title} onChange={handleQuizChange} className="block w-full px-4 py-2.5 bg-white border border-blue-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-semibold" placeholder="e.g. Module 1 Knowledge Check"/>
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-xs font-black text-blue-900 uppercase tracking-widest mb-1.5">Instructions</label>
                                <textarea id="description" name="description" value={quiz.description} onChange={handleQuizChange as any} rows={2} className="block w-full px-4 py-2.5 bg-white border border-blue-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" placeholder="Tell the students what to expect..."/>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="passingScore" className="block text-xs font-black text-blue-900 uppercase tracking-widest mb-1.5">Passing Score (%)</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        id="passingScore" 
                                        name="passingScore" 
                                        value={quiz.passingScore} 
                                        onChange={handleQuizChange} 
                                        min="0" 
                                        max="100"
                                        className="block w-full px-4 py-2.5 bg-white border border-blue-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-bold"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300 font-black">%</span>
                                </div>
                                <p className="mt-1.5 text-[10px] text-blue-600 font-medium">Students must achieve this to pass.</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="timeLimit" className="block text-xs font-black text-blue-900 uppercase tracking-widest mb-1.5">Time Limit (Minutes)</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        id="timeLimit" 
                                        name="timeLimit" 
                                        value={quiz.timeLimit} 
                                        onChange={handleQuizChange} 
                                        min="0" 
                                        className="block w-full px-4 py-2.5 bg-white border border-blue-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-bold"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300">
                                        <IconClock className="w-4 h-4" />
                                    </div>
                                </div>
                                <p className="mt-1.5 text-[10px] text-blue-600 font-medium">Set to 0 for no time limit.</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                         <div className="flex justify-between items-center px-1">
                             <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Assessment Questions ({(quiz.questions || []).length})</h3>
                             <button onClick={handleAddQuestion} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-md shadow-blue-200 text-sm">
                                <IconPlus className="w-4 h-4" /> Add Question
                            </button>
                         </div>

                        <div className="space-y-6">
                            {(quiz.questions || []).map((q, qIndex) => (
                                <div key={q.id} className="relative p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-blue-200 transition-colors">
                                    <button 
                                        onClick={() => handleDeleteQuestion(q.id)} 
                                        className="absolute -top-3 -right-3 p-1.5 bg-white border border-red-100 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full shadow-md transition-all"
                                        title="Remove Question"
                                    >
                                        <IconTrash className="w-4 h-4" />
                                    </button>
                                    
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-black text-sm border border-gray-200">
                                            {qIndex + 1}
                                        </div>
                                        <div className="flex-grow space-y-5">
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Question Text</label>
                                                <textarea 
                                                    value={q.text} 
                                                    onChange={(e) => handleQuestionUpdate(q.id, { text: e.target.value })} 
                                                    rows={2} 
                                                    className="w-full text-base font-bold text-gray-800 border-none bg-gray-50 rounded-lg p-3 focus:ring-2 focus:ring-blue-500" 
                                                    placeholder="Enter your question here..."
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Options & Correct Answer</label>
                                                {q.options.map((o, oIdx) => {
                                                    const isCorrect = q.correctOptionId === o.id;
                                                    return (
                                                        <div key={o.id} className="flex items-center gap-3 group/opt">
                                                            <div className="relative">
                                                                <input 
                                                                    type="radio" 
                                                                    id={`correct-${q.id}-${o.id}`}
                                                                    name={`correct-opt-${q.id}`} 
                                                                    checked={isCorrect} 
                                                                    onChange={() => handleQuestionUpdate(q.id, { correctOptionId: o.id })} 
                                                                    className="sr-only"
                                                                />
                                                                <label 
                                                                    htmlFor={`correct-${q.id}-${o.id}`}
                                                                    className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-all border-2 ${isCorrect ? 'bg-green-500 border-green-500 text-white' : 'border-gray-200 text-transparent hover:border-green-300'}`}
                                                                >
                                                                    <IconCheckCircle className="w-4 h-4" />
                                                                </label>
                                                            </div>
                                                            <div className="relative flex-grow">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 uppercase">{String.fromCharCode(65 + oIdx)}</span>
                                                                <input 
                                                                    type="text" 
                                                                    value={o.text} 
                                                                    onChange={(e) => handleOptionTextChange(q.id, o.id, e.target.value)} 
                                                                    className={`w-full pl-8 pr-10 py-2.5 rounded-lg text-sm transition-all focus:ring-2 focus:ring-blue-500 ${isCorrect ? 'bg-green-50 border-2 border-green-100 text-green-900 font-bold' : 'bg-white border border-gray-200 text-gray-700'}`} 
                                                                />
                                                                <button 
                                                                    onClick={() => handleDeleteOption(q.id, o.id)} 
                                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-500 opacity-0 group-hover/opt:opacity-100 transition-opacity"
                                                                >
                                                                    <IconTrash className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                <button onClick={() => handleAddOption(q.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                                                    <IconPlus className="w-3.5 h-3.5" /> Add another option
                                                </button>
                                            </div>

                                            <div className="pt-2 border-t border-gray-100">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <IconHelpCircle className="w-4 h-4 text-blue-400" />
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Explanatory Feedback (Optional)</label>
                                                </div>
                                                <textarea 
                                                    value={q.explanation || ''} 
                                                    onChange={(e) => handleQuestionUpdate(q.id, { explanation: e.target.value })} 
                                                    rows={2} 
                                                    className="w-full bg-blue-50/30 border border-blue-100 rounded-lg p-3 text-sm italic text-blue-800 placeholder-blue-200 focus:ring-2 focus:ring-blue-200" 
                                                    placeholder="Explain why the correct answer is right. This will be shown to students after they submit."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-5 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 flex-shrink-0 rounded-b-lg">
                    <button onClick={onClose} className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg shadow-sm hover:bg-gray-50 transition-all text-sm">
                        Discard Changes
                    </button>
                    <button onClick={handleSaveChanges} className="px-10 py-2.5 bg-blue-600 text-white font-bold rounded-lg shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all transform active:scale-95 text-sm">
                        Save Assessment
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizEditorModal;