




import React from 'react';
import SeoHead from './SeoHead';
import { WebsiteContent } from '../../types';

interface AboutPageProps {
    title: string;
    content: string;
    media: {
        type: 'image' | 'video';
        url: string;
    };
    branding: WebsiteContent['branding'];
}

const AboutPage: React.FC<AboutPageProps> = ({ title, content, media, branding }) => {
    return (
        <div className="bg-white py-16">
            <SeoHead 
                title="About Us" 
                description="Learn about DWI Education of Central Texas, our mission to provide accessible, non-judgmental, and effective alcohol education." 
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-extrabold text-gray-900">{title}</h2>
                    <p className="mt-4 text-lg text-gray-500">
                        Your trusted partner in fulfilling state-mandated educational requirements.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="order-2 lg:order-1">
                        <div className="text-gray-600 space-y-6 prose lg:prose-lg max-w-none whitespace-pre-line">
                            <p>
                                {content}
                            </p>
                        </div>
                    </div>
                    <div className="order-1 lg:order-2">
                        {media.url && (
                            <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-100 aspect-video relative">
                                {media.type === 'video' ? (
                                    <video 
                                        src={media.url} 
                                        controls 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <img 
                                        src={media.url} 
                                        alt="About Us" 
                                        className="w-full h-full object-cover"
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;