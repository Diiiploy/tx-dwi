
import React, { useState } from 'react';
import VideoFeed from '../VideoFeed';
import SignaturePad from '../SignaturePad';
import { IconCameraOff, IconEye } from '../icons';
import { PaperworkData, FormConfiguration, Language } from '../../types';

interface DwiEducationPaperworkProps {
    onComplete: (data: PaperworkData) => void;
    courseName: string;
    mediaStream: MediaStream | null;
    cameraError: string | null;
    studentName: string;
    formConfiguration: FormConfiguration;
    language: Language;
}

const DwiEducationPaperwork: React.FC<DwiEducationPaperworkProps> = ({ onComplete, courseName, mediaStream, cameraError, studentName, formConfiguration, language }) => {
    const nameParts = studentName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Translation map
    const t = {
        en: {
            title: 'Pre-Course Forms',
            instructions: 'Please complete the following forms while the AI Proctor monitors.',
            aiProctor: 'AI Proctor Starting...',
            personalData: 'Personal Data Form',
            lastName: 'Last Name',
            firstName: 'First Name',
            dob: 'Date of Birth',
            address: 'Full Address',
            emergencyName: 'Emergency Contact Name',
            emergencyPhone: 'Emergency Contact Phone',
            problemDrinker: 'Problem Drinker Screening',
            yes: 'Yes',
            no: 'No',
            notSure: 'Not Sure',
            preTest: 'Knowledge Pre-Test',
            ndp: 'Numerical Drinking Profile Screening',
            ndpQ1: 'In the last year, how many times have you had 5 or more drinks (for men) or 4 or more drinks (for women) in a day?',
            ndpQ1_0: '0 times',
            ndpQ1_1: '1 time',
            ndpQ1_2: '2 or more times',
            ndpQ2: 'Have you ever felt you should cut down on your drinking?',
            ndpQ3: 'In the past 6 months, who have you gotten drunk with?',
            ndpQ3Select: 'Select an option',
            friend: 'Friend(s)',
            relative: 'Relative(s)',
            stranger: 'Stranger(s)',
            alone: 'Alone',
            ndpQ4: 'Has a friend or relative ever told you about things you said or did while you were drinking that you could not remember?',
            ndpQ5: 'Are you able to stop drinking when you want to?',
            mastHeader: 'Additional Screening Questions (MAST)',
            mast6: 'Do you feel you are a normal drinker? (By normal we mean you drink less than or as much as most other people.)',
            mast7: 'Does your spouse, a parent, or other near relative ever worry or complain about your drinking?',
            mast8: 'Do you ever feel guilty about your drinking?',
            mast10: 'Have you ever attended a meeting of Alcoholics Anonymous (AA)?',
            mast12: 'Have you ever gotten into physical fights when drinking?',
            electronicSignature: 'Electronic Signature',
            signatureLabel: 'Please sign within the box below',
            submit: 'Submit Paperwork & Continue'
        },
        es: {
            title: 'Formularios Previos al Curso',
            instructions: 'Por favor complete los siguientes formularios mientras el Proctor de IA supervisa.',
            aiProctor: 'Iniciando Proctor de IA...',
            personalData: 'Formulario de Datos Personales',
            lastName: 'Apellido',
            firstName: 'Nombre',
            dob: 'Fecha de Nacimiento',
            address: 'Dirección Completa',
            emergencyName: 'Nombre de Contacto de Emergencia',
            emergencyPhone: 'Teléfono de Contacto de Emergencia',
            problemDrinker: 'Cuestionario de Bebedor Problemático',
            yes: 'Sí',
            no: 'No',
            notSure: 'No estoy seguro',
            preTest: 'Prueba de Conocimientos Previos',
            ndp: 'Perfil Numérico de Bebida',
            ndpQ1: 'En el último año, ¿cuántas veces ha tomado 5 o más bebidas (hombres) o 4 o más (mujeres) en un día?',
            ndpQ1_0: '0 veces',
            ndpQ1_1: '1 vez',
            ndpQ1_2: '2 o más veces',
            ndpQ2: '¿Alguna vez ha sentido que debería reducir su consumo de alcohol?',
            ndpQ3: 'En los últimos 6 meses, ¿con quién se ha emborrachado?',
            ndpQ3Select: 'Seleccione una opción',
            friend: 'Amigo(s)',
            relative: 'Pariente(s)',
            stranger: 'Desconocido(s)',
            alone: 'Solo',
            ndpQ4: '¿Algún amigo o pariente le ha contado cosas que dijo o hizo mientras bebía que usted no podía recordar?',
            ndpQ5: '¿Es capaz de dejar de beber cuando quiere?',
            mastHeader: 'Preguntas Adicionales de Detección (MAST)',
            mast6: '¿Siente que es un bebedor normal? (Por normal entendemos que bebe menos o tanto como la mayoría de las personas).',
            mast7: '¿Su cónyuge, padre u otro pariente cercano se preocupa o se queja de su forma de beber?',
            mast8: '¿Alguna vez se siente culpable por beber?',
            mast10: '¿Alguna vez ha asistido a una reunión de Alcohólicos Anónimos (AA)?',
            mast12: '¿Alguna vez se ha metido en peleas físicas al beber?',
            electronicSignature: 'Firma Electrónica',
            signatureLabel: 'Por favor firme dentro del cuadro a continuación',
            submit: 'Enviar Documentación y Continuar'
        }
    }[language];

    const [formData, setFormData] = useState<PaperworkData>({
        lastName: lastName,
        firstName: firstName,
        dob: '1990-05-15',
        bac: '0.12',
        isSomeoneConcerned: 'yes',
        canStopDrinking: 'no',
        preTestQ1: 'b',
        preTestQ2: 'a',
        ndpScreening: {
            q1: 2,
            q2: 'yes',
            q3: 'ALONE',
            q4: 'yes',
            q5: 'yes',
            mast_q6_30: {
                6: 'no',
                7: 'yes',
                8: 'yes',
                10: 'yes',
                12: 'yes',
            }
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNdpChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
    
        setFormData(prev => {
            const newNdpScreening = { ...(prev.ndpScreening || { mast_q6_30: {} }) };
    
            if (name.startsWith('mast_')) {
                const questionNumber = parseInt(name.split('_')[1]);
                const newMastAnswers = { ...(newNdpScreening.mast_q6_30 || {}) };
                newMastAnswers[questionNumber] = value as 'yes' | 'no';
                newNdpScreening.mast_q6_30 = newMastAnswers;
            } else if (name === 'q1') {
                newNdpScreening.q1 = parseInt(value);
            } else {
                // For q2, q3, q4, q5
                (newNdpScreening as any)[name] = value;
            }
    
            return {
                ...prev,
                ndpScreening: newNdpScreening
            };
        });
    };

    const handleSignatureSave = (signatureUrl: string) => {
        setFormData(prev => ({ ...prev, signatureUrl }));
    };

    const RadioGroup: React.FC<{legend: string, name: string, value: 'yes' | 'no' | undefined, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void}> = ({ legend, name, value, onChange }) => (
        <div className="space-y-3">
            <p className="text-sm text-gray-700">{legend}</p>
            <div className="flex gap-4">
                <label className="flex items-center gap-2">
                    <input type="radio" name={name} value="yes" checked={value === 'yes'} onChange={onChange} className="h-4 w-4 text-blue-600 border-gray-300"/> {t.yes}
                </label>
                <label className="flex items-center gap-2">
                    <input type="radio" name={name} value="no" checked={value === 'no'} onChange={onChange} className="h-4 w-4 text-blue-600 border-gray-300"/> {t.no}
                </label>
            </div>
        </div>
    );
    
    const RadioGroupNotSure: React.FC<{legend: string, name: string, value: 'yes' | 'no' | 'not sure' | undefined, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void}> = ({ legend, name, value, onChange }) => (
        <div className="space-y-3">
            <p className="text-sm text-gray-700">{legend}</p>
            <div className="flex gap-4">
                <label className="flex items-center gap-2">
                    <input type="radio" name={name} value="yes" checked={value === 'yes'} onChange={onChange} className="h-4 w-4 text-blue-600 border-gray-300"/> {t.yes}
                </label>
                <label className="flex items-center gap-2">
                    <input type="radio" name={name} value="no" checked={value === 'no'} onChange={onChange} className="h-4 w-4 text-blue-600 border-gray-300"/> {t.no}
                </label>
                <label className="flex items-center gap-2">
                    <input type="radio" name={name} value="not sure" checked={value === 'not sure'} onChange={onChange} className="h-4 w-4 text-blue-600 border-gray-300"/> {t.notSure}
                </label>
            </div>
        </div>
    );

    // Simple helper to "translate" hardcoded known questions if in Spanish mode, otherwise return original text
    const getQuestionText = (id: string, originalText: string) => {
        if (language === 'en') return originalText;
        
        // Map for known IDs
        const map: {[key: string]: string} = {
            'isSomeoneConcerned': '¿Alguien cercano a usted está preocupado por su consumo de alcohol?',
            'canStopDrinking': '¿Puede dejar de beber sin luchar después de uno o dos tragos?',
            'preTestQ1': 'La multa por la primera ofensa de DWI en Texas es:',
            'preTestQ2': 'La capacidad relacionada con la conducción que tiende a verse afectada primero por el alcohol u otras drogas es:'
        };
        return map[id] || originalText;
    };

    const getOptionText = (id: string, optionId: string, originalText: string) => {
        if (language === 'en') return originalText;
        // Very specific mapping for demo
        if (id === 'preTestQ1') {
             if (optionId === 'a') return 'Hasta $1,000';
             if (optionId === 'b') return 'Hasta $2,000';
             if (optionId === 'c') return 'Hasta $5,000';
        }
        if (id === 'preTestQ2') {
             if (optionId === 'a') return 'Juicio';
             if (optionId === 'b') return 'Control muscular';
             if (optionId === 'c') return 'Tiempo de reacción';
        }
        return originalText;
    }


    return (
        <div>
            <h3 className="text-xl font-bold text-gray-800 text-center mb-2">{t.title}</h3>
            <p className="text-center text-gray-600 mb-6">{t.instructions}</p>
            
            <div className="w-full aspect-video bg-gray-900 rounded-lg flex flex-col items-center justify-center overflow-hidden border-4 border-blue-400/50 relative mb-4">
                 {cameraError ? (
                    <div role="alert" className="w-full h-full bg-red-900/50 flex flex-col items-center justify-center p-4 text-center">
                        <IconCameraOff className="w-12 h-12 text-red-400 mb-4" />
                        <p className="text-red-300 font-semibold">Camera Error</p>
                        <p className="text-red-400 text-sm mt-2">{cameraError}</p>
                    </div>
                ) : mediaStream ? (
                    <VideoFeed stream={mediaStream} />
                ) : (
                    <>
                        <IconEye className="w-12 h-12 text-blue-400 animate-pulse" />
                        <p className="text-blue-200 mt-2 text-sm font-medium">{t.aiProctor}</p>
                    </>
                )}
                <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
                    <span className="w-2 h-2 bg-red-500 rounded-full inline-block mr-1"></span> REC
                </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); onComplete(formData); }} className="space-y-6 max-h-[40vh] overflow-y-auto pr-4 -mr-4">
                
                <fieldset className="space-y-4 p-4 border border-gray-200 rounded-lg">
                    <legend className="text-lg font-semibold text-gray-800 px-2">{t.personalData}</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">{t.lastName}</label>
                            <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} readOnly className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-100 cursor-not-allowed" />
                        </div>
                        <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">{t.firstName}</label>
                            <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} readOnly className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-100 cursor-not-allowed" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="dob" className="block text-sm font-medium text-gray-700">{t.dob}</label>
                        <input type="date" id="dob" name="dob" value={formData.dob} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    {courseName.includes('DWI') && (
                        <div>
                            <label htmlFor="bac" className="block text-sm font-medium text-gray-700">{language === 'es' ? 'Si fue acusado de DWI, ¿cuál fue el BAC?' : formConfiguration.personalData.bacLabel}</label>
                            <input type="text" id="bac" name="bac" value={formData.bac} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                    )}
                     <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">{t.address}</label>
                        <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                        <label htmlFor="emergencyContactName" className="block text-sm font-medium text-gray-700">{t.emergencyName}</label>
                        <input type="text" id="emergencyContactName" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                     <div>
                        <label htmlFor="emergencyContactPhone" className="block text-sm font-medium text-gray-700">{t.emergencyPhone}</label>
                        <input type="tel" id="emergencyContactPhone" name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                </fieldset>

                <fieldset className="space-y-4 p-4 border border-gray-200 rounded-lg">
                    <legend className="text-lg font-semibold text-gray-800 px-2">{t.problemDrinker}</legend>
                    {formConfiguration.screeningQuestions.map(q => (
                         <div key={q.id} className="space-y-3">
                            <p className="text-sm text-gray-700">{getQuestionText(q.id, q.text)}</p>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2">
                                    <input type="radio" name={q.id} value="yes" checked={formData[q.id as keyof PaperworkData] === 'yes'} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300"/> {t.yes}
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="radio" name={q.id} value="no" checked={formData[q.id as keyof PaperworkData] === 'no'} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300"/> {t.no}
                                </label>
                            </div>
                        </div>
                    ))}
                </fieldset>

                <fieldset className="space-y-4 p-4 border border-gray-200 rounded-lg">
                    <legend className="text-lg font-semibold text-gray-800 px-2">{t.preTest}</legend>
                    {formConfiguration.preTestQuestions.map((q, index) => (
                        <div key={q.id} className="space-y-3">
                            <p className="text-sm text-gray-700">{index + 1}. {getQuestionText(q.id, q.text)}</p>
                            <div className="flex flex-col gap-2 pl-4">
                                {q.options.map(opt => (
                                     <label key={opt.id} className="flex items-center gap-2">
                                        <input type="radio" name={q.id} value={opt.id} checked={formData[q.id as keyof PaperworkData] === opt.id} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300"/> {getOptionText(q.id, opt.id, opt.text)}
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </fieldset>

                <fieldset className="space-y-4 p-4 border border-gray-200 rounded-lg">
                    <legend className="text-lg font-semibold text-gray-800 px-2">{t.ndp}</legend>
                    
                    <div className="space-y-3">
                        <p className="text-sm text-gray-700">{t.ndpQ1}</p>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                                <input type="radio" name="q1" value="0" checked={formData.ndpScreening?.q1 === 0} onChange={handleNdpChange} className="h-4 w-4 text-blue-600 border-gray-300"/> {t.ndpQ1_0}
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="radio" name="q1" value="1" checked={formData.ndpScreening?.q1 === 1} onChange={handleNdpChange} className="h-4 w-4 text-blue-600 border-gray-300"/> {t.ndpQ1_1}
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="radio" name="q1" value="2" checked={formData.ndpScreening?.q1 === 2} onChange={handleNdpChange} className="h-4 w-4 text-blue-600 border-gray-300"/> {t.ndpQ1_2}
                            </label>
                        </div>
                    </div>

                    <RadioGroup legend={t.ndpQ2} name="q2" value={formData.ndpScreening?.q2} onChange={handleNdpChange} />
                    
                    <div>
                        <label htmlFor="q3" className="block text-sm font-medium text-gray-700">{t.ndpQ3}</label>
                        <select id="q3" name="q3" value={formData.ndpScreening?.q3 || ''} onChange={handleNdpChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                            <option value="">{t.ndpQ3Select}</option>
                            <option value="FRIEND">{t.friend}</option>
                            <option value="RELATIVE">{t.relative}</option>
                            <option value="STRANGER">{t.stranger}</option>
                            <option value="ALONE">{t.alone}</option>
                        </select>
                    </div>

                    <RadioGroupNotSure legend={t.ndpQ4} name="q4" value={formData.ndpScreening?.q4} onChange={handleNdpChange} />
                    <RadioGroupNotSure legend={t.ndpQ5} name="q5" value={formData.ndpScreening?.q5} onChange={handleNdpChange} />

                    <div className="pt-4">
                        <h4 className="font-semibold text-gray-800 mb-2">{t.mastHeader}</h4>
                        <div className="space-y-4">
                            <RadioGroup legend={t.mast6} name="mast_6" value={formData.ndpScreening?.mast_q6_30?.[6]} onChange={handleNdpChange} />
                            <RadioGroup legend={t.mast7} name="mast_7" value={formData.ndpScreening?.mast_q6_30?.[7]} onChange={handleNdpChange} />
                            <RadioGroup legend={t.mast8} name="mast_8" value={formData.ndpScreening?.mast_q6_30?.[8]} onChange={handleNdpChange} />
                            <RadioGroup legend={t.mast10} name="mast_10" value={formData.ndpScreening?.mast_q6_30?.[10]} onChange={handleNdpChange} />
                            <RadioGroup legend={t.mast12} name="mast_12" value={formData.ndpScreening?.mast_q6_30?.[12]} onChange={handleNdpChange} />
                        </div>
                    </div>
                </fieldset>

                <fieldset className="space-y-4 p-4 border border-gray-200 rounded-lg">
                    <legend className="text-lg font-semibold text-gray-800 px-2">{t.electronicSignature}</legend>
                    <SignaturePad 
                        language={language}
                        label={t.signatureLabel}
                        studentName={studentName}
                        onSave={handleSignatureSave}
                    />
                </fieldset>

                 <button 
                    type="submit"
                    disabled={!formData.signatureUrl}
                    className="mt-6 w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    {t.submit}
                </button>
            </form>
        </div>
    );
};

export default DwiEducationPaperwork;
