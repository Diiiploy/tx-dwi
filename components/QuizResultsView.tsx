import React from 'react';
import { QuizResult, TimelineItem } from '../types';
import { IconCheckCircle, IconXCircle, IconHelpCircle, IconArrowLeft } from './icons';

interface QuizResultsViewProps {
    result: QuizResult;
    onClose: () => void;
    // We pass this to get question details like explanations
    quizItem?: TimelineItem | null;
}

const QuizResultsView: React.FC<QuizResultsViewProps> = ({ result, onClose, quizItem }) => {
    const scoreVal = parseInt(result.score);
    const passingScore = result.passingScore ?? 70;
    const isPassing = scoreVal >= passingScore;

    return (
        <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl text-black flex flex-col max-h-[90vh]">
                <div className="p-8 text-center border-b border-gray-100 flex-shrink-0 bg-gray-50/50 rounded-t-lg">
                    {isPassing ? (
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
                                <IconCheckCircle className="w-10 h-10" />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900">Excellent Work!</h2>
                            <p className="text-green-600 font-bold uppercase tracking-widest text-xs mt-1">Assessment Passed</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
                                <IconXCircle className="w-10 h-10" />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900">Try Again</h2>
                            <p className="text-red-600 font-bold uppercase tracking-widest text-xs mt-1">Below Passing Threshold ({passingScore}%)</p>
                        </div>
                    )}
                    
                    <div className="mt-8 flex justify-center items-end gap-1">
                        <span className={`text-7xl font-black tabular-nums leading-none ${isPassing ? 'text-green-600' : 'text-red-600'}`}>
                            {scoreVal}
                        </span>
                        <span className="text-2xl font-bold text-gray-300 mb-1">%</span>
                    </div>
                </div>

                <div className="flex-grow p-6 overflow-y-auto bg-white space-y-6">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Review Your Answers</h3>
                    
                    {result.studentAnswers.map((answer, index) => {
                        const question = quizItem?.questions?.find(q => q.id === answer.questionId);
                        const selectedOpt = question?.options.find(o => o.id === answer.selectedOptionId);
                        const correctOpt = question?.options.find(o => o.id === question.correctOptionId);

                        return (
                            <div key={answer.questionId} className={`p-4 rounded-xl border-l-4 ${answer.isCorrect ? 'bg-green-50/50 border-green-500' : 'bg-red-50/50 border-red-500'}`}>
                                <div className="flex justify-between items-start gap-4 mb-2">
                                    <p className="font-bold text-gray-800 text-sm">{index + 1}. {question?.text || 'Question'}</p>
                                    {answer.isCorrect ? (
                                        <IconCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                    ) : (
                                        <IconXCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                    )}
                                </div>
                                
                                <div className="text-xs space-y-2 mt-3">
                                    <div className="flex items-center gap-2">
                                        <span className="font-black text-gray-400 uppercase">Your Answer:</span>
                                        <span className={`font-semibold ${answer.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                            {selectedOpt?.text || 'Unanswered'}
                                        </span>
                                    </div>
                                    {!answer.isCorrect && (
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-gray-400 uppercase">Correct:</span>
                                            <span className="font-semibold text-green-700">{correctOpt?.text}</span>
                                        </div>
                                    )}
                                    {question?.explanation && (
                                        <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg flex gap-3">
                                            <IconHelpCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <span className="text-[10px] font-black text-blue-400 uppercase block mb-1">Expert Explanation</span>
                                                <p className="text-blue-900 leading-relaxed italic">{question.explanation}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="p-6 border-t border-gray-100 flex-shrink-0 bg-gray-50 rounded-b-lg flex justify-center">
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-black rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition transform active:scale-95"
                    >
                        {isPassing ? 'Continue to Next Topic' : 'Retake Assessment'}
                        <IconArrowLeft className="w-4 h-4 rotate-180" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizResultsView;