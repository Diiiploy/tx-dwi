import React from 'react';
import { View, Language } from '../types';
import { IconGlobe } from './icons';

interface RoleSelectorProps {
    setView: (view: View) => void;
    language: Language;
    setLanguage: (lang: Language) => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ setView, language, setLanguage }) => {
    
    const translations = {
        en: {
            title: 'DWI Classroom Portal',
            selectRole: 'Please select your role to log in.',
            studentLogin: 'Log In as Student',
            instructorLogin: 'Log In as Instructor',
            adminLogin: 'Log In as Admin',
            newStudent: 'New student?',
            registerHere: 'Register here',
            whitelabel: 'Whitelabel Platform'
        },
        es: {
            title: 'Portal del Aula DWI',
            selectRole: 'Seleccione su rol para iniciar sesión.',
            studentLogin: 'Entrar como Estudiante',
            instructorLogin: 'Entrar como Instructor',
            adminLogin: 'Entrar como Administrador',
            newStudent: '¿Nuevo estudiante?',
            registerHere: 'Regístrese aquí',
            whitelabel: 'Plataforma de Marca Blanca'
        }
    };

    const t = translations[language];

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'es' : 'en');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 relative">
            <button 
                onClick={toggleLanguage} 
                className="absolute top-6 right-6 flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-full hover:bg-gray-700 transition"
            >
                <IconGlobe className="w-5 h-5" />
                <span className="text-sm font-semibold">{language === 'en' ? 'Español' : 'English'}</span>
            </button>

            <div className="text-center p-10 bg-white shadow-xl rounded-lg max-w-lg w-full">
                <div className="mb-8 flex justify-center">
                    <img src="https://lh3.googleusercontent.com/d/1bRJC1lQAOJDUeCA5XB6FnlgSPCzA5km3" alt="DWI Education of Central Texas Logo" className="h-20" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-6">{t.title}</h1>
                <p className="text-gray-600 mb-8">{t.selectRole}</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                        onClick={() => setView(View.StudentLogin)} 
                        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
                    >
                        {t.studentLogin}
                    </button>
                     <button 
                        onClick={() => setView(View.InstructorLogin)} 
                        className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition duration-300"
                    >
                        {t.instructorLogin}
                    </button>
                    <button 
                        onClick={() => setView(View.AdminLogin)} 
                        className="px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 transition duration-300"
                    >
                        {t.adminLogin}
                    </button>
                </div>
                <div className="mt-8 text-sm">
                    <p className="text-gray-600">
                        {t.newStudent}{' '}
                        <button 
                            onClick={() => setView(View.Website)}
                            className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                        >
                            {t.registerHere}
                        </button>
                    </p>
                </div>
                 <div className="mt-10 text-xs text-gray-400">
                    <p>{t.whitelabel}</p>
                </div>
            </div>
        </div>
    );
};

export default RoleSelector;