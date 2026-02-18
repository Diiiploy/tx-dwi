


import React from 'react';
import { Course, WebsiteContent } from '../../types';
import SeoHead from './SeoHead';

interface CoursesPageProps {
    courses: Course[];
    onStartRegistration: () => void;
    branding: WebsiteContent['branding'];
}

const CoursesPage: React.FC<CoursesPageProps> = ({ courses, onStartRegistration, branding }) => {
    
    // Generate structured data for the courses list
    const courseListSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": courses
            .filter(c => c.price > 0)
            .map((course, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                    "@type": "Course",
                    "name": course.name,
                    "description": course.description,
                    "provider": {
                        "@type": "Organization",
                        "name": "DWI Education of Central Texas"
                    },
                    "offers": {
                        "@type": "Offer",
                        "price": course.price,
                        "priceCurrency": "USD"
                    }
                }
            }))
    };

    return (
        <div className="bg-white py-12">
            <SeoHead 
                title="Our Courses" 
                description="Browse our state-certified DWI courses including Texas DWI Education Program, DWI Intervention Program, and Alcohol Education Program for Minors." 
                structuredData={courseListSchema}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">Our Courses</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500">
                        Find the state-certified program that meets your requirements.
                    </p>
                </div>
                <div className="mt-10 space-y-8">
                    {courses.filter(c => c.price > 0).map(course => ( // Filter out internal/test courses
                        <div key={course.id} className="p-6 border border-gray-200 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex-1">
                                <h3 className="font-bold text-2xl text-gray-800">{course.name}</h3>
                                <p className="text-md text-gray-600 mt-2">{course.description}</p>
                            </div>
                            <div className="text-left md:text-right flex-shrink-0 w-full md:w-auto">
                                <p className="text-3xl font-bold text-gray-900">${course.price.toFixed(2)}</p>
                                <button
                                    onClick={onStartRegistration}
                                    className="mt-2 w-full md:w-auto px-6 py-3 text-white font-semibold rounded-lg shadow-md hover:brightness-110 transition"
                                    style={{ backgroundColor: branding.primaryColor }}
                                >
                                    Register Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CoursesPage;