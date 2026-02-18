import React, { useState, useEffect, DragEvent } from 'react';
import { IconCamera, IconClock, IconCurriculum, IconStudents, IconHuman, IconEdit, IconTrash, IconEye, IconFile, IconFilm, IconChat, IconPlus, IconArrowUp, IconArrowDown, IconCalendar, IconForm } from '../icons';
import { InstructorType, Course, Module, TimelineItem, ScheduledClass, Instructor } from '../../types';
import EditTimelineBlockModal from './EditTimelineBlockModal';
import NewCourseModal from './NewCourseModal';
import ModulePreviewModal from './ModulePreviewModal';
import QuizEditorModal from './QuizEditorModal';
import RagQuestionModal from './RagQuestionModal';
import ScheduleSessionModal from './ScheduleSessionModal';
import { RagQuestion } from '../../types';

const blockTypes = [
    { type: 'ai-script', icon: <IconCamera className="text-blue-600" />, label: "AI Avatar Script" },
    { type: 'content', icon: <IconCurriculum className="text-purple-600" />, label: "Upload Content (PDF/Video)" },
    { type: 'quiz', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>, label: "Quiz" },
    { type: 'poll', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600"><path d="M3 15h4v-4H3v4z"></path><path d="M7 15h4v-4H7v4z"></path><path d="M11 15h4v-4h-4v4z"></path><path d="M15 15h4v-4h-4v4z"></path></svg>, label: "Poll" },
    { type: 'breakout', icon: <IconStudents className="text-indigo-600" />, label: "Breakout Rooms" },
    { type: 'break', icon: <IconClock className="text-red-600 w-5 h-5" />, label: "Automated Break" },
    { type: 'google-form', icon: <IconForm className="text-orange-600" />, label: "Google Form Embed" },
];

interface ContentBlockProps {
    icon: React.ReactNode;
    label: string;
    type: string;
    onDragStart: (e: DragEvent, type: string) => void;
}

const ContentBlock: React.FC<ContentBlockProps> = ({ icon, label, type, onDragStart }) => {
    return (
        <div 
            draggable
            onDragStart={(e) => onDragStart(e, type)}
            className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg cursor-grab active:cursor-grabbing shadow-sm border border-gray-200"
        >
            {icon}
            <span className="font-medium">{label}</span>
        </div>
    );
};

const TimelineBlock = ({ item, onEdit, onDelete, onDragStart, onDragEnd, onMove, isFirst, isLast }: { item: TimelineItem, onEdit: (item: TimelineItem) => void, onDelete: (itemId: string) => void, onDragStart: (e: DragEvent, item: TimelineItem) => void, onDragEnd: (e: DragEvent) => void, onMove: (itemId: string, direction: 'up' | 'down') => void, isFirst: boolean, isLast: boolean }) => {
    const blockMeta = blockTypes.find(b => b.type === item.type);
    return (
        <div 
            draggable
            onDragStart={(e) => onDragStart(e, item)}
            onDragEnd={onDragEnd}
            className="timeline-item cursor-grab active:cursor-grabbing"
        >
            <div className="timeline-icon">
                {blockMeta && React.isValidElement<{ className?: string }>(blockMeta.icon) ?
                    React.cloneElement(blockMeta.icon, { className: `${blockMeta.icon.props.className || ''} w-3 h-3` })
                    : blockMeta?.icon
                }
            </div>
            <div className="group p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200 relative">
                <p className="font-medium pr-16">{item.title}</p>
                <p className="text-sm text-gray-600 truncate">{item.description}</p>
                {item.type === 'content' && item.fileName && (
                    <div className="mt-2 flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                        <IconFile className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span className="text-sm text-blue-800 font-medium truncate">{item.fileName}</span>
                    </div>
                )}
                {item.type === 'content' && item.videoFileName && (
                    <div className="mt-2 flex items-center gap-2 p-2 bg-purple-50 border border-purple-200 rounded-md">
                        <IconFilm className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        <span className="text-sm text-purple-800 font-medium truncate">{item.videoFileName}</span>
                    </div>
                )}
                {item.type === 'google-form' && item.googleFormUrl && (
                    <div className="mt-2 flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded-md">
                        <IconForm className="w-4 h-4 text-orange-600 flex-shrink-0" />
                        <span className="text-sm text-orange-800 font-medium truncate">{item.googleFormUrl}</span>
                    </div>
                )}
                 <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onMove(item.id, 'up')} disabled={isFirst} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed" title="Move up"><IconArrowUp /></button>
                    <button onClick={() => onMove(item.id, 'down')} disabled={isLast} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed" title="Move down"><IconArrowDown /></button>
                    <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-200 rounded-md" title="Edit block"><IconEdit /></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-gray-200 rounded-md" title="Delete block"><IconTrash /></button>
                </div>
            </div>
        </div>
    );
};

interface AdminCurriculumProps {
    courses: Course[];
    setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
    scheduledClasses: ScheduledClass[];
    onAddScheduledClass: (newClass: Omit<ScheduledClass, 'id'>) => void;
    onUpdateScheduledClass: (updatedClass: ScheduledClass) => void;
    onDeleteScheduledClass: (classId: string) => void;
    instructors: Instructor[];
}

const AdminCurriculum: React.FC<AdminCurriculumProps> = ({ courses, setCourses, scheduledClasses, onAddScheduledClass, onUpdateScheduledClass, onDeleteScheduledClass, instructors }) => {
    const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
    const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
    const [editingItem, setEditingItem] = useState<TimelineItem | null>(null);
    const [isNewCourseModalOpen, setIsNewCourseModalOpen] = useState(false);
    const [courseSettings, setCourseSettings] = useState<Course | null>(null);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [previewingModule, setPreviewingModule] = useState<Module | null>(null);
    const [settingsTab, setSettingsTab] = useState<'general' | 'forms' | 'rag' | 'schedule'>('general');
    
    // Drag and drop state
    const [draggedItem, setDraggedItem] = useState<TimelineItem | { type: string } | null>(null);
    const [dropIndex, setDropIndex] = useState<number | null>(null);

    // RAG Question Modal State
    const [isRagModalOpen, setIsRagModalOpen] = useState(false);
    const [editingRagQuestion, setEditingRagQuestion] = useState<RagQuestion | null>(null);
    const [editingRagQuestionIndex, setEditingRagQuestionIndex] = useState<number | null>(null);
    
    // Schedule Session Modal State
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [editingSession, setEditingSession] = useState<ScheduledClass | null>(null);
    
    // New state for easier timeline editing
    const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
    const [editingModuleName, setEditingModuleName] = useState('');
    const [addBlockPopoverIndex, setAddBlockPopoverIndex] = useState<number | null>(null);


    const selectedCourse = courses.find(c => c.id === selectedCourseId);
    const selectedModule = selectedCourse?.modules.find(m => m.id === selectedModuleId);

    useEffect(() => {
        if (!courses.find(c => c.id === selectedCourseId)) {
            setSelectedCourseId(courses[0]?.id || '');
        }
    }, [courses, selectedCourseId]);

    useEffect(() => {
        setSelectedModuleId(null);
    }, [selectedCourseId]);

    useEffect(() => {
        const currentCourse = courses.find(c => c.id === selectedCourseId);
        setCourseSettings(currentCourse ? JSON.parse(JSON.stringify(currentCourse)) : null);
    }, [selectedCourseId, courses]);

    const handleDeleteItem = (itemId: string) => {
        if (!selectedModuleId) return;
        setCourses(prevCourses => prevCourses.map(course => {
            if (course.id !== selectedCourseId) return course;
            const updatedModules = course.modules.map(module => {
                if (module.id !== selectedModuleId) return module;
                return { ...module, items: module.items.filter(item => item.id !== itemId) };
            });
            return { ...course, modules: updatedModules };
        }));
    };
    
    const handleSaveItem = (updatedItem: TimelineItem) => {
        if (!selectedModuleId) return;
         setCourses(prevCourses => prevCourses.map(course => {
            if (course.id !== selectedCourseId) return course;
            const updatedModules = course.modules.map(module => {
                if (module.id !== selectedModuleId) return module;
                return { ...module, items: module.items.map(item => item.id === updatedItem.id ? updatedItem : item) };
            });
            return { ...course, modules: updatedModules };
        }));
        setEditingItem(null);
    };

    const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCourseSettings(prev => {
            if (!prev) return null;
            if ((e.target as HTMLInputElement).type === 'number') {
                const numValue = parseFloat(value);
                return { ...prev, [name]: isNaN(numValue) ? 0 : numValue };
            }
            return { ...prev, [name]: value };
        });
    };

    const handlePolicyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCourseSettings(prev => {
            if (!prev) return null;
            const parsedValue = parseFloat(value) || 0;
            return {
                ...prev,
                deactivationPolicy: {
                    maxMinutesLate: 15, // defaults
                    maxWarnings: 3,
                    maxAbsences: 2,
                    ...(prev.deactivationPolicy || {}),
                    [name]: parsedValue
                }
            };
        });
    };

    const handleInstructorTypeChange = (type: InstructorType) => {
        setCourseSettings(prev => {
            if (!prev) return null;
            const updatedCourse: Course = { ...prev, instructorType: type };
            if (type === InstructorType.AI) delete updatedCourse.instructorName;
            else if (!updatedCourse.instructorName) updatedCourse.instructorName = '';
            return updatedCourse;
        });
    };
    
    const handleSaveChanges = () => {
        if (!courseSettings) return;
        setSaveStatus('saving');
        setCourses(prevCourses => prevCourses.map(c => (c.id === selectedCourseId ? courseSettings : c)));
        setTimeout(() => {
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        }, 500);
    };

    const handleDeleteCourse = (courseIdToDelete: string) => {
        if (courses.length <= 1) {
            alert("You cannot delete the last course.");
            return;
        }
        if (window.confirm('Are you sure you want to delete this course and all its content? This action cannot be undone.')) {
            const newCourses = courses.filter(c => c.id !== courseIdToDelete);
            setCourses(newCourses);
            if (selectedCourseId === courseIdToDelete) setSelectedCourseId(newCourses[0].id);
        }
    };

    const handleCreateCourse = (newCourseData: Pick<Course, 'name' | 'instructorType' | 'instructorName'>) => {
        const newCourse: Course = {
            ...newCourseData,
            id: `course-${Date.now()}`,
            description: "A new course description. Please update it.",
            price: 0,
            modules: [],
            formConfiguration: JSON.parse(JSON.stringify(courses[0]?.formConfiguration || {})), // Copy from an existing course
            deactivationPolicy: { maxMinutesLate: 15, maxWarnings: 3, maxAbsences: 2, duplicateCertificateFee: 25.00 } // Default policy
        };
        setCourses(prev => [...prev, newCourse]);
        setSelectedCourseId(newCourse.id);
        setIsNewCourseModalOpen(false);
    };

    const handleAddModule = () => {
        if (!selectedCourse) return;
        setCourses(prevCourses => prevCourses.map(course => {
            if (course.id !== selectedCourseId) return course;
            
            const newModuleNumber = course.modules.length + 1;
            const newModule: Module = {
                id: `mod-${Date.now()}`,
                name: `Module ${newModuleNumber}`,
                items: [],
            };
            
            return { ...course, modules: [...course.modules, newModule] };
        }));
    };

    const handleDeleteModule = (moduleIdToDelete: string) => {
        if (!selectedCourse) return;
    
        const moduleToDelete = selectedCourse.modules.find(m => m.id === moduleIdToDelete);
        if (!moduleToDelete) return;
    
        const confirmationMessage = moduleToDelete.items.length > 0
            ? `Are you sure you want to delete "${moduleToDelete.name}"? It contains curriculum content that will be permanently lost.`
            : `Are you sure you want to delete "${moduleToDelete.name}"?`;
    
        if (window.confirm(confirmationMessage)) {
            setCourses(prevCourses =>
                prevCourses.map(course => {
                    if (course.id !== selectedCourseId) {
                        return course;
                    }
                    const updatedModules = course.modules
                        .filter(module => module.id !== moduleIdToDelete)
                        // Do not automatically rename modules, allow manual renaming.
                        .map((module, index) => ({
                            ...module,
                        }));
                    return { ...course, modules: updatedModules };
                })
            );
        }
    };
    
    const handleUpdateModuleName = () => {
        if (!editingModuleId || !editingModuleName.trim()) {
            setEditingModuleId(null);
            return;
        };
        setCourses(prev => prev.map(course => {
            if (course.id !== selectedCourseId) return course;
            return {
                ...course,
                modules: course.modules.map(mod => mod.id === editingModuleId ? { ...mod, name: editingModuleName.trim() } : mod)
            };
        }));
        setEditingModuleId(null);
        setEditingModuleName('');
    };

    const handleDragStart = (e: DragEvent, itemOrType: TimelineItem | string) => {
        const data = typeof itemOrType === 'string' ? { type: itemOrType } : itemOrType;
        e.dataTransfer.setData('application/json', JSON.stringify(data));
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: DragEvent, index: number) => {
        e.preventDefault();
        setDropIndex(index);
    };

    const handleDragLeave = (e: DragEvent) => {
        setDropIndex(null);
    };

    const handleDrop = (e: DragEvent, index: number) => {
        e.preventDefault();
        const draggedData = e.dataTransfer.getData('application/json');
        if (!draggedData || !selectedModuleId || !selectedModule) return;

        const draggedItem = JSON.parse(draggedData) as TimelineItem | { type: string };
        
        let newItems = [...selectedModule.items];
        
        if ('id' in draggedItem) { // Reordering existing item
            const itemToMove = newItems.find(item => item.id === draggedItem.id);
            if (!itemToMove) return;
            const remainingItems = newItems.filter(item => item.id !== draggedItem.id);
            remainingItems.splice(index, 0, itemToMove);
            newItems = remainingItems;
        } else { // Adding new item
            const { type } = draggedItem;
            const blockMeta = blockTypes.find(b => b.type === type);
            if (!blockMeta) return;
            const newItem: TimelineItem = {
                id: `item-${Date.now()}`,
                type: blockMeta.type as TimelineItem['type'],
                title: blockMeta.label,
                description: `Default description for ${blockMeta.label}`,
                duration: blockMeta.type === 'break' ? undefined : 10,
                questions: blockMeta.type === 'quiz' ? [] : undefined,
            };
            newItems.splice(index, 0, newItem);
        }

        setCourses(prev => prev.map(course => {
            if (course.id !== selectedCourseId) return course;
            return {
                ...course,
                modules: course.modules.map(mod => mod.id === selectedModuleId ? { ...mod, items: newItems } : mod)
            };
        }));
        setDropIndex(null);
    };
    
    const handleInsertBlock = (type: TimelineItem['type'], index: number) => {
        if (!selectedModuleId) return;

        const blockMeta = blockTypes.find(b => b.type === type);
        if (!blockMeta) return;

        const newItem: TimelineItem = {
            id: `item-${Date.now()}`,
            type: blockMeta.type as TimelineItem['type'],
            title: blockMeta.label,
            description: `Default description for ${blockMeta.label}`,
            duration: blockMeta.type === 'break' ? undefined : 10,
            questions: blockMeta.type === 'quiz' ? [] : undefined,
        };
        
        setCourses(prev => prev.map(course => {
            if (course.id !== selectedCourseId) return course;
            return {
                ...course,
                modules: course.modules.map(mod => {
                    if (mod.id !== selectedModuleId) return mod;
                    const newItems = [...mod.items];
                    newItems.splice(index, 0, newItem);
                    return { ...mod, items: newItems };
                })
            };
        }));

        setAddBlockPopoverIndex(null);
    };
    
    const handleMoveItem = (itemId: string, direction: 'up' | 'down') => {
        if (!selectedModuleId || !selectedModule) return;

        const items = selectedModule.items;
        const index = items.findIndex(item => item.id === itemId);

        if (index === -1) return;
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === items.length - 1) return;

        const newIndex = direction === 'up' ? index - 1 : index + 1;
        const newItems = [...items];
        const [movedItem] = newItems.splice(index, 1);
        newItems.splice(newIndex, 0, movedItem);

        setCourses(prev => prev.map(course => {
            if (course.id !== selectedCourseId) return course;
            return {
                ...course,
                modules: course.modules.map(mod => mod.id === selectedModuleId ? { ...mod, items: newItems } : mod)
            };
        }));
    };


    const handleDragEnd = (e: DragEvent) => {
        setDropIndex(null);
    };

    const handleFormConfigChange = (path: string, value: any) => {
        setCourseSettings(prev => {
            if (!prev) return null;
            const keys = path.split('.');
            const newSettings = JSON.parse(JSON.stringify(prev));
            let current = newSettings;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return newSettings;
        });
    };

    const handleOpenRagModal = (question: RagQuestion | null, index: number | null) => {
        setEditingRagQuestion(question);
        setEditingRagQuestionIndex(index);
        setIsRagModalOpen(true);
    };

    const handleSaveRagQuestion = (savedQuestion: RagQuestion) => {
        if (!courseSettings) return;

        const updatedRagQuestions = [...(courseSettings.ragQuestions || [])];

        if (editingRagQuestionIndex !== null) {
            updatedRagQuestions[editingRagQuestionIndex] = savedQuestion;
        } else {
            updatedRagQuestions.push(savedQuestion);
        }
        
        setCourseSettings({ ...courseSettings, ragQuestions: updatedRagQuestions });
        setIsRagModalOpen(false);
    };
    
    const handleDeleteRagQuestion = (indexToDelete: number) => {
        if (!courseSettings || !window.confirm('Are you sure you want to delete this question? This action will affect the AI assistant for this course.')) return;
        
        const updatedRagQuestions = (courseSettings.ragQuestions || []).filter((_, index) => index !== indexToDelete);
        setCourseSettings({ ...courseSettings, ragQuestions: updatedRagQuestions });
    };

    const handleSaveSession = (sessionData: ScheduledClass | Omit<ScheduledClass, 'id'>) => {
        if ('id' in sessionData) {
            onUpdateScheduledClass(sessionData);
        } else {
            onAddScheduledClass(sessionData);
        }
        setIsScheduleModalOpen(false);
    };

    const AddBlockDivider = ({ index }: { index: number }) => (
        <div 
            onDragOver={(e) => handleDragOver(e, index)} 
            onDrop={(e) => handleDrop(e, index)} 
            className={`relative group transition-all duration-150 ${dropIndex === index ? 'h-10 my-2' : 'h-2'}`}
        >
            <div className={`absolute inset-0 transition-colors ${dropIndex === index ? 'bg-blue-300 rounded-md' : ''}`}></div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" onMouseLeave={() => setAddBlockPopoverIndex(null)}>
                <div className="h-px w-full bg-blue-400"></div>
                <div className="relative">
                    <button 
                        onMouseEnter={() => setAddBlockPopoverIndex(index)}
                        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 p-1 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600"
                    >
                        <IconPlus className="w-4 h-4" />
                    </button>
                    {addBlockPopoverIndex === index && (
                        <div className="absolute left-1/2 -translate-x-1/2 mt-4 w-48 bg-white rounded-md shadow-lg border z-20">
                            {blockTypes.map(block => (
                                <button 
                                    key={block.type}
                                    onClick={() => handleInsertBlock(block.type as TimelineItem['type'], index)}
                                    className="w-full text-left flex items-center gap-2 p-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    {block.icon} {block.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderTimelineEditor = () => {
        if (!selectedModule) return null;
        return (
            <div className="flex-grow flex gap-6">
                <div className="w-2/3 p-6 bg-white rounded-lg shadow-md border border-gray-200 flex flex-col">
                    <div className="flex items-center gap-4 mb-4">
                        <button onClick={() => setSelectedModuleId(null)} className="text-sm text-blue-600 hover:underline">&larr; Back to Modules</button>
                        <h3 className="text-xl font-semibold text-gray-900">{selectedModule.name} Timeline</h3>
                        <button 
                            onClick={() => setPreviewingModule(selectedModule)}
                            className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition text-sm"
                        >
                            <IconEye className="w-4 h-4" />
                            Preview Module
                        </button>
                    </div>
                    <div className="flex-grow rounded-lg overflow-y-auto" onDragLeave={handleDragLeave}>
                        <AddBlockDivider index={0} />
                        {selectedModule.items.map((item, index) => (
                            <React.Fragment key={item.id}>
                                <TimelineBlock 
                                    item={item} 
                                    onEdit={setEditingItem} 
                                    onDelete={handleDeleteItem} 
                                    onDragStart={(e) => handleDragStart(e, item)}
                                    onDragEnd={handleDragEnd}
                                    onMove={handleMoveItem}
                                    isFirst={index === 0}
                                    isLast={index === selectedModule.items.length - 1}
                                />
                                <AddBlockDivider index={index + 1} />
                            </React.Fragment>
                        ))}
                        {selectedModule.items.length === 0 && (
                             <div className="flex-grow border-2 border-dashed rounded-lg p-4 text-center text-gray-500 min-h-[150px] flex items-center justify-center">
                                Drag new blocks here or use the '+' button to start building.
                            </div>
                        )}
                    </div>
                </div>
                <div className="w-1/3 p-6 bg-white rounded-lg shadow-md border border-gray-200">
                    <h3 className="text-xl font-semibold mb-4">Content Blocks</h3>
                    <p className="text-sm text-gray-500 mb-4">Drag blocks onto the timeline to build your course.</p>
                    <div className="space-y-3">{blockTypes.map(block => <ContentBlock key={block.label} icon={block.icon} label={block.label} type={block.type} onDragStart={handleDragStart} />)}</div>
                </div>
            </div>
        );
    };

    const renderModuleSelector = () => {
        if (!selectedCourse) return null;
        return (
            <div className="flex-grow p-6 bg-white rounded-lg shadow-md border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">Modules ({selectedCourse.modules.length})</h3>
                    <button 
                        onClick={handleAddModule}
                        className="px-4 py-2 bg-blue-100 text-blue-800 font-semibold rounded-lg hover:bg-blue-200 transition text-sm"
                    >
                        + Add Module
                    </button>
                </div>
                 {selectedCourse.modules.length > 0 ? (
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {selectedCourse.modules.map(module => (
                            <div key={module.id} className="relative group">
                                <div onClick={() => setSelectedModuleId(module.id)} className="w-full p-4 aspect-square flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-100 border border-gray-200 hover:border-blue-300 rounded-lg transition-colors cursor-pointer">
                                    {editingModuleId === module.id ? (
                                        <input
                                            type="text"
                                            value={editingModuleName}
                                            onChange={(e) => setEditingModuleName(e.target.value)}
                                            onBlur={handleUpdateModuleName}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleUpdateModuleName();
                                                if (e.key === 'Escape') setEditingModuleId(null);
                                            }}
                                            className="w-full text-center bg-white border border-blue-400 rounded-md"
                                            autoFocus
                                        />
                                    ) : (
                                        <>
                                            <span className="text-2xl font-bold text-gray-700">{module.name.split(' ').pop()}</span>
                                            <span className="text-sm text-gray-500 text-center">{module.name}</span>
                                        </>
                                    )}
                                </div>
                                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => { setEditingModuleId(module.id); setEditingModuleName(module.name); }}
                                        className="p-1.5 text-gray-400 bg-white/50 hover:text-blue-600 hover:bg-blue-100 rounded-full" 
                                        title={`Rename ${module.name}`}
                                    >
                                        <IconEdit className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteModule(module.id)}
                                        className="p-1.5 text-gray-400 bg-white/50 hover:text-red-600 hover:bg-red-100 rounded-full" 
                                        title={`Delete ${module.name}`}
                                    >
                                        <IconTrash className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        <p className="font-semibold">This course has no modules.</p>
                        <p>Click "+ Add Module" to get started.</p>
                    </div>
                )}
            </div>
        );
    };

    if (!courseSettings) {
        return (
             <div className="flex gap-6">
                <aside className="w-1/4 p-6 bg-white rounded-lg shadow-md border border-gray-200 flex flex-col">
                    <h3 className="text-xl font-semibold mb-4">Courses</h3>
                    <div className="flex-1 overflow-y-auto text-center text-gray-500 pt-10">No courses available.</div>
                    <button onClick={() => setIsNewCourseModalOpen(true)} className="w-full mt-4 py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition text-sm">+ New Course</button>
                </aside>
                <main className="w-3/4 flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md border border-gray-200">
                     <h1 className="text-2xl font-bold text-gray-700">Welcome to the Curriculum Builder</h1>
                     <p className="text-gray-500 mt-2">Create a new course to get started.</p>
                </main>
                 {isNewCourseModalOpen && <NewCourseModal onClose={() => setIsNewCourseModalOpen(false)} onSave={handleCreateCourse} />}
            </div>
        );
    }

    const itemToEdit = editingItem;
    const isQuiz = itemToEdit?.type === 'quiz';
    
    return (
        <div className="flex gap-6">
            <aside className="w-1/4 p-6 bg-white rounded-lg shadow-md border border-gray-200 flex flex-col">
                 <h3 className="text-xl font-semibold mb-4">Courses</h3>
                 <div className="space-y-2 flex-1 overflow-y-auto">
                     {courses.map(course => (
                         <div key={course.id} className="relative group">
                             <button onClick={() => setSelectedCourseId(course.id)} className={`w-full text-left p-3 rounded-lg text-sm font-medium transition ${selectedCourseId === course.id ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}>{course.name}</button>
                             <button onClick={() => handleDeleteCourse(course.id)} className="absolute top-1/2 right-2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-md opacity-0 group-hover:opacity-100 transition-opacity" title="Delete course"><IconTrash /></button>
                         </div>
                     ))}
                 </div>
                 <button onClick={() => setIsNewCourseModalOpen(true)} className="w-full mt-4 py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition text-sm">+ New Course</button>
            </aside>
            <main className="w-3/4 flex flex-col gap-6">
                 <div className="flex justify-end items-center flex-shrink-0">
                    <div className="flex items-center gap-4">
                        {saveStatus === 'saved' && <span className="text-green-600 text-sm font-medium transition-opacity duration-300">Changes saved!</span>}
                        <button onClick={handleSaveChanges} className="px-5 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition disabled:bg-green-400" disabled={saveStatus === 'saving'}>{saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}</button>
                    </div>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200 flex-shrink-0">
                    <div className="border-b border-gray-200 mb-4">
                        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                            <button onClick={() => setSettingsTab('general')} className={`py-2 px-1 border-b-2 text-sm font-medium ${settingsTab === 'general' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Course Settings</button>
                            <button onClick={() => setSettingsTab('schedule')} className={`flex items-center gap-1.5 py-2 px-1 border-b-2 text-sm font-medium ${settingsTab === 'schedule' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}><IconCalendar className="w-4 h-4" /> Schedule</button>
                            <button onClick={() => setSettingsTab('forms')} className={`py-2 px-1 border-b-2 text-sm font-medium ${settingsTab === 'forms' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Pre-Course Forms</button>
                            <button onClick={() => setSettingsTab('rag')} className={`flex items-center gap-1.5 py-2 px-1 border-b-2 text-sm font-medium ${settingsTab === 'rag' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}><IconChat className="w-4 h-4" /> AI Chat (RAG)</button>
                        </nav>
                    </div>

                    {settingsTab === 'general' && (
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="courseName" className="block text-sm font-medium text-gray-700">Course Title</label>
                                <input type="text" id="courseName" name="name" value={courseSettings.name} onChange={handleSettingsChange} className="mt-1 w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900" placeholder="e.g., Intro to Python"/>
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Course Description</label>
                                <textarea id="description" name="description" value={courseSettings.description} onChange={handleSettingsChange} rows={3} className="mt-1 w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900" placeholder="A brief summary of the course content."/>
                            </div>
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price ($)</label>
                                <input type="number" id="price" name="price" value={courseSettings.price} onChange={handleSettingsChange} min="0" className="mt-1 w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900" placeholder="e.g., 499"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Instructor Type</label>
                                <div className="flex"><div className="flex items-center rounded-lg bg-gray-200 p-1">
                                    <button onClick={() => handleInstructorTypeChange(InstructorType.AI)} className={`px-3 py-1 text-sm rounded-md transition flex items-center gap-1.5 ${courseSettings.instructorType === InstructorType.AI ? 'bg-white shadow' : 'text-gray-600'}`}><IconCamera className="w-4 h-4" /> AI Instructor</button>
                                    <button onClick={() => handleInstructorTypeChange(InstructorType.Human)} className={`px-3 py-1 text-sm rounded-md transition flex items-center gap-1.5 ${courseSettings.instructorType === InstructorType.Human ? 'bg-white shadow' : 'text-gray-600'}`}><IconHuman className="w-4 h-4" /> Human Instructor</button>
                                </div></div>
                            </div>
                            {courseSettings.instructorType === InstructorType.Human && (
                                <div>
                                    <label htmlFor="instructorName" className="block text-sm font-medium text-gray-700">Default Instructor Name</label>
                                    <input type="text" id="instructorName" name="instructorName" value={courseSettings.instructorName || ''} onChange={handleSettingsChange} className="mt-1 w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900" placeholder="e.g., Dr. Evelyn Reed"/>
                                </div>
                            )}
                            
                            <div className="mt-6 border-t border-gray-200 pt-4">
                                <h4 className="font-semibold text-gray-800 mb-3">Deactivation & Attendance Policy</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div>
                                        <label htmlFor="maxMinutesLate" className="block text-sm font-medium text-gray-700">Late Allowance (Minutes)</label>
                                        <input 
                                            type="number" 
                                            id="maxMinutesLate" 
                                            name="maxMinutesLate" 
                                            value={courseSettings.deactivationPolicy?.maxMinutesLate ?? 15} 
                                            onChange={handlePolicyChange} 
                                            min="0"
                                            className="mt-1 w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900" 
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Minutes allowed late before absent.</p>
                                    </div>
                                    <div>
                                        <label htmlFor="maxWarnings" className="block text-sm font-medium text-gray-700">Max Warnings Allowed</label>
                                        <input 
                                            type="number" 
                                            id="maxWarnings" 
                                            name="maxWarnings" 
                                            value={courseSettings.deactivationPolicy?.maxWarnings ?? 3} 
                                            onChange={handlePolicyChange} 
                                            min="0"
                                            className="mt-1 w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900" 
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Warnings before deactivation.</p>
                                    </div>
                                    <div>
                                        <label htmlFor="maxAbsences" className="block text-sm font-medium text-gray-700">Max Missed Classes</label>
                                        <input 
                                            type="number" 
                                            id="maxAbsences" 
                                            name="maxAbsences" 
                                            value={courseSettings.deactivationPolicy?.maxAbsences ?? 2} 
                                            onChange={handlePolicyChange} 
                                            min="0"
                                            className="mt-1 w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900" 
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Absences before deactivation.</p>
                                    </div>
                                    <div>
                                        <label htmlFor="makeupSessionFee" className="block text-sm font-medium text-gray-700">Makeup Session Fee ($)</label>
                                        <input 
                                            type="number" 
                                            id="makeupSessionFee" 
                                            name="makeupSessionFee" 
                                            value={courseSettings.deactivationPolicy?.makeupSessionFee ?? 50} 
                                            onChange={handlePolicyChange} 
                                            min="0" 
                                            step="0.01"
                                            className="mt-1 w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900" 
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Fee for required makeup session.</p>
                                    </div>
                                    <div>
                                        <label htmlFor="duplicateCertificateFee" className="block text-sm font-medium text-gray-700">Duplicate Certificate Fee ($)</label>
                                        <input 
                                            type="number" 
                                            id="duplicateCertificateFee" 
                                            name="duplicateCertificateFee" 
                                            value={courseSettings.deactivationPolicy?.duplicateCertificateFee ?? 25} 
                                            onChange={handlePolicyChange} 
                                            min="0" 
                                            step="0.01"
                                            className="mt-1 w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900" 
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Fee for requesting a second copy.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {settingsTab === 'schedule' && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h4 className="font-semibold text-gray-800">Course Schedule</h4>
                                    <p className="text-sm text-gray-500">Plan the dates, times, and instructor types for each session of this course.</p>
                                </div>
                                <button
                                    onClick={() => { setEditingSession(null); setIsScheduleModalOpen(true); }}
                                    className="px-4 py-2 bg-blue-100 text-blue-800 font-semibold rounded-lg hover:bg-blue-200 transition text-sm"
                                >
                                    + Add Session
                                </button>
                            </div>
                             <div className="space-y-2 max-h-96 overflow-y-auto pr-2 border-t pt-4">
                                {scheduledClasses.filter(sc => sc.courseId === selectedCourseId)
                                .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                .map(session => {
                                    const module = selectedCourse?.modules.find(m => m.id === session.moduleId);
                                    const instructor = instructors.find(i => i.id === session.instructorId);
                                    return (
                                        <div key={session.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold text-gray-800">{module?.name || 'Unknown Module'}</p>
                                                <p className="text-sm text-gray-600">{new Date(session.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })} at {session.time}</p>
                                                <p className={`text-xs font-semibold mt-1 inline-block px-2 py-0.5 rounded-full ${session.instructorType === InstructorType.AI ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                                    {session.instructorType === InstructorType.AI ? 'AI Instructor' : instructor?.name || 'Human Instructor'}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => { setEditingSession(session); setIsScheduleModalOpen(true); }} className="text-xs font-semibold text-blue-600 hover:underline">Edit</button>
                                                <button onClick={() => onDeleteScheduledClass(session.id)} className="text-xs font-semibold text-red-600 hover:underline">Delete</button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {settingsTab === 'forms' && courseSettings.formConfiguration && (
                        <div className="space-y-6">
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">Personal Data Form</h4>
                                <label htmlFor="bacLabel" className="block text-sm font-medium text-gray-700">BAC Question Label</label>
                                <input type="text" id="bacLabel" value={courseSettings.formConfiguration.personalData.bacLabel} onChange={(e) => handleFormConfigChange('formConfiguration.personalData.bacLabel', e.target.value)} className="mt-1 w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"/>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">Problem Drinker Screening</h4>
                                {courseSettings.formConfiguration.screeningQuestions.map((q, index) => (
                                     <div key={q.id} className="mt-2">
                                        <label htmlFor={`screeningQ${index}`} className="block text-sm font-medium text-gray-700">Screening Question {index + 1}</label>
                                        <textarea id={`screeningQ${index}`} value={q.text} onChange={(e) => handleFormConfigChange(`formConfiguration.screeningQuestions.${index}.text`, e.target.value)} rows={2} className="mt-1 w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"/>
                                    </div>
                                ))}
                            </div>
                             <div>
                                <h4 className="font-semibold text-gray-800 mb-2">Knowledge Pre-Test</h4>
                                {courseSettings.formConfiguration.preTestQuestions.map((q, qIndex) => (
                                     <div key={q.id} className="mt-3 p-3 bg-gray-50 rounded-lg border">
                                        <label htmlFor={`preTestQ${qIndex}`} className="block text-sm font-medium text-gray-700">Pre-Test Question {qIndex + 1}</label>
                                        <textarea id={`preTestQ${qIndex}`} value={q.text} onChange={(e) => handleFormConfigChange(`formConfiguration.preTestQuestions.${qIndex}.text`, e.target.value)} rows={2} className="mt-1 w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"/>
                                        <div className="mt-2 space-y-1">
                                            {q.options.map((opt, optIndex) => (
                                                <div key={opt.id} className="flex items-center gap-2">
                                                    <span className="font-mono text-sm text-gray-500">{String.fromCharCode(65 + optIndex)}.</span>
                                                    <input type="text" value={opt.text} onChange={(e) => handleFormConfigChange(`formConfiguration.preTestQuestions.${qIndex}.options.${optIndex}.text`, e.target.value)} className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900"/>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {settingsTab === 'rag' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="font-semibold text-gray-800">Pre-selected Questions</h4>
                                    <p className="text-sm text-gray-500">Manage the suggested questions and context for the AI chat assistant.</p>
                                </div>
                                <button
                                    onClick={() => handleOpenRagModal(null, null)}
                                    className="px-4 py-2 bg-blue-100 text-blue-800 font-semibold rounded-lg hover:bg-blue-200 transition text-sm"
                                >
                                    + Add Question
                                </button>
                            </div>
                             <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                {(courseSettings.ragQuestions || []).map((q, index) => (
                                    <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-800">Q: {q.question}</p>
                                                <p className="text-sm text-gray-600 mt-2">
                                                    <span className="font-medium text-gray-500">Context/Answer:</span> {q.context}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                                <button onClick={() => handleOpenRagModal(q, index)} className="text-xs font-semibold text-blue-600 hover:underline">Edit</button>
                                                <button onClick={() => handleDeleteRagQuestion(index)} className="text-xs font-semibold text-red-600 hover:underline">Delete</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {(!courseSettings.ragQuestions || courseSettings.ragQuestions.length === 0) && (
                                    <p className="text-center text-gray-500 py-8">No pre-selected questions have been added for this course.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                {selectedModuleId ? renderTimelineEditor() : renderModuleSelector()}
            </main>
            {itemToEdit && isQuiz && <QuizEditorModal item={itemToEdit} onClose={() => setEditingItem(null)} onSave={handleSaveItem} />}
            {itemToEdit && !isQuiz && <EditTimelineBlockModal item={itemToEdit} onClose={() => setEditingItem(null)} onSave={handleSaveItem} />}
            {isNewCourseModalOpen && <NewCourseModal onClose={() => setIsNewCourseModalOpen(false)} onSave={handleCreateCourse} />}
            {previewingModule && <ModulePreviewModal module={previewingModule} onClose={() => setPreviewingModule(null)} />}
            {isRagModalOpen && (
                <RagQuestionModal
                    question={editingRagQuestion}
                    onClose={() => setIsRagModalOpen(false)}
                    onSave={handleSaveRagQuestion}
                />
            )}
            {isScheduleModalOpen && selectedCourse && (
                <ScheduleSessionModal
                    isOpen={isScheduleModalOpen}
                    onClose={() => setIsScheduleModalOpen(false)}
                    onSave={handleSaveSession}
                    course={selectedCourse}
                    sessionToEdit={editingSession}
                    instructors={instructors}
                />
            )}
        </div>
    );
};

export default AdminCurriculum;