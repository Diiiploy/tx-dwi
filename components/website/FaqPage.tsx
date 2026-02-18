
import React, { useState } from 'react';
import { Course } from '../../types';
import SeoHead from './SeoHead';

interface FaqPageProps {
    courses: Course[];
}

const FaqPage: React.FC<FaqPageProps> = ({ courses }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const faqs = courses.flatMap(course => 
        (course.ragQuestions || []).map(rq => ({
            question: rq.question,
            answer: rq.context,
            course: course.name
        }))
    );
    
    // Generate FAQ Schema
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };
    
    const toggleFaq = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="bg-white py-16">
            <SeoHead 
                title="FAQ" 
                description="Frequently asked questions about our DWI classes, registration process, and certificates." 
                structuredData={faqSchema}
            />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">Frequently Asked Questions</h2>
                    <p className="mt-4 text-lg text-gray-500">
                        Find answers to common questions about our courses and processes.
                    </p>
                </div>

                <div className="mt-12 space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg">
                            <button
                                onClick={() => toggleFaq(index)}
                                className="w-full flex justify-between items-center text-left p-4 hover:bg-gray-50"
                                aria-expanded={openIndex === index}
                            >
                                <span className="font-medium text-gray-900">{faq.question}</span>
                                <span className="text-2xl text-gray-400 font-light transition-transform transform-gpu" style={{ transform: openIndex === index ? 'rotate(45deg)' : 'rotate(0)' }}>+</span>
                            </button>
                            {openIndex === index && (
                                <div className="p-4 border-t border-gray-200 text-gray-600 bg-gray-50">
                                    <p>{faq.answer}</p>
                                    <p className="text-xs text-gray-400 mt-2">Related Course: {faq.course}</p>
                                </div>
                            )}
                        </div>
                    ))}
                    {faqs.length === 0 && <p className="text-center text-gray-500 py-8">No FAQs available at this time.</p>}
                </div>
            </div>
        </div>
    );
};

export default FaqPage;
