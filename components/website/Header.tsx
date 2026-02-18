import React from 'react';
import { WebsitePage } from './Website';
import { Language, WebsiteContent } from '../../types';
import { IconGlobe } from '../icons';

interface HeaderProps {
    activePage: WebsitePage;
    setPage: (page: WebsitePage) => void;
    language: Language;
    setLanguage: (lang: Language) => void;
    branding: WebsiteContent['branding'];
}

const NavLink: React.FC<{ page: WebsitePage, label: string, activePage: WebsitePage, setPage: (page: WebsitePage) => void, branding: WebsiteContent['branding'] }> = ({ page, label, activePage, setPage, branding }) => {
    const isActive = activePage === page;
    return (
        <button
            onClick={() => setPage(page)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? '' : 'text-gray-700 hover:text-gray-900'}`}
            style={isActive ? { color: branding.primaryColor } : {}}
        >
            {label}
        </button>
    );
}

const Header: React.FC<HeaderProps> = ({ activePage, setPage, language, setLanguage, branding }) => {
    
    const t = {
        en: {
            home: 'Home',
            courses: 'Courses',
            about: 'About Us',
            contact: 'Contact',
            faq: 'FAQ',
            resources: 'Resources',
            register: 'Register Now',
            title: 'DWI Education of Central Texas'
        },
        es: {
            home: 'Inicio',
            courses: 'Cursos',
            about: 'Nosotros',
            contact: 'Contacto',
            faq: 'Preguntas',
            resources: 'Recursos',
            register: 'Registrarse',
            title: 'Educación DWI de Central Texas'
        }
    }[language];

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'es' : 'en');
    };

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center cursor-pointer" onClick={() => setPage('home')}>
                        {branding.logoUrl ? (
                            <img src={branding.logoUrl} alt="Logo" className="h-12 w-auto" />
                        ) : (
                            <img src="https://lh3.googleusercontent.com/d/1bRJC1lQAOJDUeCA5XB6FnlgSPCzA5km3" alt="DWI Education of Central Texas Logo" className="h-12 w-auto" />
                        )}
                        <span className="font-bold text-lg ml-3 text-gray-800 hidden sm:block">{t.title}</span>
                    </div>
                    <nav className="hidden md:flex items-center space-x-2">
                        <NavLink page="home" label={t.home} activePage={activePage} setPage={setPage} branding={branding} />
                        <NavLink page="courses" label={t.courses} activePage={activePage} setPage={setPage} branding={branding} />
                        <NavLink page="about" label={t.about} activePage={activePage} setPage={setPage} branding={branding} />
                        <NavLink page="contact" label={t.contact} activePage={activePage} setPage={setPage} branding={branding} />
                        <NavLink page="faq" label={t.faq} activePage={activePage} setPage={setPage} branding={branding} />
                        <NavLink page="resources" label={t.resources} activePage={activePage} setPage={setPage} branding={branding} />
                        <button
                            onClick={() => setPage('register')}
                            className="ml-4 px-5 py-2.5 text-white font-semibold rounded-lg shadow-md hover:brightness-110 transition"
                            style={{ backgroundColor: branding.primaryColor }}
                        >
                            {t.register}
                        </button>
                         <button 
                            onClick={toggleLanguage} 
                            className="ml-4 flex items-center gap-1 text-gray-500 hover:text-blue-600 transition"
                            aria-label="Toggle Language"
                        >
                            <IconGlobe className="w-5 h-5" />
                            <span className="text-sm font-medium">{language === 'en' ? 'ES' : 'EN'}</span>
                        </button>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;