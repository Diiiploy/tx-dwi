
import React, { useState } from 'react';
import { View, Course, Student, Language, Coupon, WebsiteContent } from '../../types';
import Header from './Header';
import Footer from './Footer';
import HomePage from './HomePage';
import CoursesPage from './CoursesPage';
import AboutPage from './AboutPage';
import ContactPage from './ContactPage';
import FaqPage from './FaqPage';
import TermsPage from './TermsPage';
import PrivacyPage from './PrivacyPage';
import ResourcesPage from './ResourcesPage';
import StudentRegistration from '../StudentRegistration';

export type WebsitePage = 'home' | 'courses' | 'about' | 'contact' | 'faq' | 'register' | 'terms' | 'privacy' | 'resources';

interface WebsiteProps {
    setView: (view: View) => void;
    courses: Course[];
    // FIX: Updated onRegister signature to include preferredLanguage, fixing the "provides too few arguments" error.
    onRegister: (name: string, courseId: string, company: Student['company'], billedToName: string, isExpedited: boolean, couponCode: string | undefined, discountAmount: number, preferredLanguage: Language) => string;
    language: Language;
    setLanguage: (lang: Language) => void;
    coupons: Coupon[];
    websiteContent: WebsiteContent;
}

const Website: React.FC<WebsiteProps> = ({ setView, courses, onRegister, language, setLanguage, coupons, websiteContent }) => {
    const [page, setPage] = useState<WebsitePage>('home');

    const handleStartRegistration = () => {
        setPage('register');
    };
    
    const wrappedSetView = (view: View) => {
        if (view === View.RoleSelector) {
            setPage('home');
        } else if (view === View.StudentLogin) {
            setView(View.StudentLogin);
        } else {
            setView(view);
        }
    };
    
    if (page === 'register') {
        return <StudentRegistration setView={wrappedSetView} courses={courses} onRegister={onRegister} coupons={coupons} websiteContent={websiteContent} />;
    }

    const renderContent = () => {
        switch(page) {
            case 'home':
                return <HomePage setPage={setPage} courses={courses} heroTitle={websiteContent.home.heroTitle} heroSubtitle={websiteContent.home.heroSubtitle} branding={websiteContent.branding} heroMedia={{ type: websiteContent.home.heroMediaType, url: websiteContent.home.heroMediaUrl }} reviews={websiteContent.reviews} />;
            case 'courses':
                return <CoursesPage courses={courses} onStartRegistration={handleStartRegistration} branding={websiteContent.branding} />;
            case 'about':
                return <AboutPage title={websiteContent.about.title} content={websiteContent.about.content} media={{ type: websiteContent.about.mediaType, url: websiteContent.about.mediaUrl }} branding={websiteContent.branding} />;
            case 'contact':
                return <ContactPage address={websiteContent.contact.address} phone={websiteContent.contact.phone} email={websiteContent.contact.email} imageUrl={websiteContent.contact.imageUrl} branding={websiteContent.branding} />;
            case 'faq':
                return <FaqPage courses={courses} />;
            case 'resources':
                // FIX: Pass the resources configuration from websiteContent to the ResourcesPage component.
                return <ResourcesPage branding={websiteContent.branding} resources={websiteContent.resources} />;
            case 'terms':
                return <TermsPage title={websiteContent.terms.title} content={websiteContent.terms.content} />;
            case 'privacy':
                return <PrivacyPage title={websiteContent.privacy.title} content={websiteContent.privacy.content} />;
            default:
                return <HomePage setPage={setPage} courses={courses} heroTitle={websiteContent.home.heroTitle} heroSubtitle={websiteContent.home.heroSubtitle} branding={websiteContent.branding} heroMedia={{ type: websiteContent.home.heroMediaType, url: websiteContent.home.heroMediaUrl }} reviews={websiteContent.reviews} />;
        }
    };

    return (
        <div className="bg-gray-50 text-gray-800 min-h-screen flex flex-col">
            <Header activePage={page} setPage={setPage} language={language} setLanguage={setLanguage} branding={websiteContent.branding} />
            <main className="flex-grow">
                {renderContent()}
            </main>
            <Footer setPage={setPage} />
        </div>
    );
};

export default Website;
