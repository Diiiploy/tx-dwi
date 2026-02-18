
import React from 'react';
import SeoHead from './SeoHead';

interface TermsPageProps {
    title: string;
    content: string;
}

const TermsPage: React.FC<TermsPageProps> = ({ title, content }) => {
    return (
        <div className="bg-white py-16">
            <SeoHead 
                title="Terms and Conditions" 
                description="Terms and conditions for using the DWI Education of Central Texas website and services." 
            />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-extrabold text-gray-900">{title}</h2>
                </div>
                <div className="prose prose-blue prose-lg text-gray-600 mx-auto whitespace-pre-wrap">
                    {content}
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
