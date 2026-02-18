import React, { useState, useEffect, useCallback } from 'react';
import { TimelineItem, QuizResult, StudentAnswer } from '../types';
import { IconClipboardList, IconClock, IconWarning } from './icons';

interface QuizViewProps {
    quizItem: TimelineItem;
    onSubmit: (result: QuizResult) => void;
}

const QuizView: React.FC<QuizViewProps> = ({ quizItem, onSubmit }) => {
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const questions = quizItem.questions || [];
    const [timeLeft, setTimeLeft] = useState<number | null>(
        quizItem.timeLimit ? quizItem.timeLimit * 60 : null
    );
    const [isTimeUp, setIsTimeUp] = useState(false);

    const handleAnswerChange = (questionId: string, optionId: string) => {
        if (isTimeUp) return;
        setAnswers(prev => ({ ...prev, [questionId]: optionId }));
    };

    const handleSubmit = useCallback(() => {
        let correctCount = 0;
        const studentAnswers: StudentAnswer[] = questions.map(q => {
            const selectedOptionId = answers[q.id];
            const isCorrect = selectedOptionId === q.correctOptionId;
            if (isCorrect) {
                correctCount++;
            }
            return {
                questionId: q.id,
                selectedOptionId: selectedOptionId || 'unanswered',
                isCorrect,
            };
        });

        const score = questions.length > 0
            ? `${Math.round((correctCount / questions.length) * 100)}%`
            : '100%';

        const result: QuizResult = {
            quizId: quizItem.id,
            title: quizItem.title,
            score,
            studentAnswers,
            passingScore: quizItem.passingScore ?? 70,
        };
        
        onSubmit(result);
    }, [answers, questions, quizItem, onSubmit]);

    useEffect(() => {
        if (timeLeft === null) return;
        if (timeLeft <= 0) {
            setIsTimeUp(true);
            handleSubmit();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => (prev !== null ? prev - 1 : null));
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, handleSubmit]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const allQuestionsAnswered = questions.length === Object.keys(answers).length;
    const isLowTime = timeLeft !== null && timeLeft <= 60;

    return (
        <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl text-black flex flex-col max-h-[90vh]">
                 <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                    <div className="flex items-center">
                        <IconClipboardList className="w-6 h-6 text-blue-600 mr-3" />
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">{quizItem.title}</h2>
                            <p className="text-sm text-gray-600">{quizItem.description}</p>
                        </div>
                    </div>
                    {timeLeft !== null && (
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                            isLowTime 
                                ? 'bg-red-50 border-red-200 text-red-600 animate-pulse shadow-red-100 shadow-lg' 
                                : 'bg-white border-gray-200 text-gray-700'
                        }`}>
                            <IconClock className={`w-4 h-4 ${isLowTime ? 'text-red-500' : 'text-gray-400'}`} />
                            <span className="text-lg font-black tabular-nums">{formatTime(timeLeft)}</span>
                        </div>
                    )}
                </div>

                <div className="p-6 space-y-6 overflow-y-auto">
                    {isTimeUp && (
                        <div className="p-4 bg-red-100 border border-red-200 text-red-800 rounded-lg flex items-center gap-3">
                            <IconWarning className="w-5 h-5 flex-shrink-0" />
                            <p className="font-bold">Time is up! Your answers are being submitted automatically.</p>
                        </div>
                    )}
                    {questions.map((q, index) => (
                        <div key={q.id} role="group" aria-labelledby={`question-title-${q.id}`}>
                            <p id={`question-title-${q.id}`} className="font-semibold text-gray-800">{index + 1}. {q.text}</p>
                            <div className="mt-2 space-y-2 pl-4">
                                {q.options.map(o => (
                                    <label key={o.id} className={`flex items-center gap-3 p-3 rounded-md transition-colors border border-transparent ${
                                        isTimeUp ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:bg-gray-200'
                                    } bg-gray-100 has-[:checked]:bg-blue-100 has-[:checked]:border-blue-400`}>
                                        <input
                                            type="radio"
                                            name={q.id}
                                            value={o.id}
                                            checked={answers[q.id] === o.id}
                                            onChange={() => handleAnswerChange(q.id, o.id)}
                                            disabled={isTimeUp}
                                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="text-gray-700">{o.text}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50 text-right rounded-b-lg flex justify-between items-center">
                    <div className="text-xs text-gray-400 font-medium italic">
                        {allQuestionsAnswered ? 'All questions answered' : `${questions.length - Object.keys(answers).length} questions remaining`}
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={!allQuestionsAnswered || isTimeUp}
                        className="px-8 py-2.5 bg-green-600 text-white font-bold rounded-lg shadow-sm hover:bg-green-700 transition disabled:bg-green-300 disabled:cursor-not-allowed transform active:scale-95"
                    >
                        Submit Quiz
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizView;