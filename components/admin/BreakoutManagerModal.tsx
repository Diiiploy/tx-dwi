import React, { useState, useEffect, useCallback } from 'react';
import { IconClose } from '../icons';

// Simple student type for the modal
interface Student {
    name: string;
}

interface BreakoutManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    students: Student[];
    onStartBreakouts: (assignments: Record<string, string[]>) => void;
}

const BreakoutManagerModal: React.FC<BreakoutManagerModalProps> = ({ isOpen, onClose, students, onStartBreakouts }) => {
    const [numRooms, setNumRooms] = useState(2);
    const [assignments, setAssignments] = useState<Record<string, string[]>>({});

    const autoAssign = useCallback(() => {
        const shuffledStudents = [...students].sort(() => 0.5 - Math.random());
        const newAssignments: Record<string, string[]> = {};
        const numberOfRooms = Math.max(1, numRooms);

        for (let i = 1; i <= numberOfRooms; i++) {
            newAssignments[`Room ${i}`] = [];
        }
        
        shuffledStudents.forEach((student, index) => {
            const roomIndex = index % numberOfRooms;
            newAssignments[`Room ${roomIndex + 1}`].push(student.name);
        });
        setAssignments(newAssignments);
    }, [students, numRooms]);

    useEffect(() => {
        if (isOpen) {
            autoAssign();
        }
    }, [isOpen, autoAssign]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" role="dialog" aria-modal="true">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl m-4 border border-gray-200 flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-xl font-semibold text-gray-800">Manage Breakout Rooms</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800" aria-label="Close modal">
                        <IconClose />
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                    <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                            <label htmlFor="num-rooms" className="font-medium text-gray-700">Number of rooms:</label>
                            <input
                                type="number"
                                id="num-rooms"
                                value={numRooms}
                                onChange={(e) => setNumRooms(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-20 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                min="1"
                                max={students.length}
                            />
                        </div>
                        <button onClick={autoAssign} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition text-sm">
                            Re-assign Automatically
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {/* FIX: Explicitly type the destructured array from Object.entries to resolve type inference issue. */}
                        {Object.entries(assignments).map(([room, assignedStudents]: [string, string[]]) => (
                            <div key={room} className="p-3 bg-gray-50 rounded-lg border border-gray-200 min-h-[100px]">
                                <h3 className="font-bold text-gray-800 mb-2">{room}</h3>
                                <ul className="space-y-1">
                                    {assignedStudents.map(name => (
                                        <li key={name} className="text-sm text-gray-700 bg-white p-2 rounded border border-gray-100 shadow-sm">{name}</li>
                                    ))}
                                    {assignedStudents.length === 0 && <p className="text-sm text-gray-500 italic pt-4 text-center">Empty</p>}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-sm hover:bg-gray-700 transition">
                        Cancel
                    </button>
                    <button onClick={() => { onStartBreakouts(assignments); onClose(); }} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-sm hover:bg-green-700 transition">
                        Start Breakouts
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BreakoutManagerModal;