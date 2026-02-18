import React from 'react';
import SeoHead from './SeoHead';
import { WebsiteContent, ResourceCard } from '../../types';
import { IconClipboardList, IconPhone, IconGlobe, IconCheckCircle, IconGavel, IconShield, IconActivity } from '../icons';

interface ResourcesPageProps {
    branding: WebsiteContent['branding'];
    resources: WebsiteContent['resources'];
}

const ResourcesPage: React.FC<ResourcesPageProps> = ({ branding, resources }) => {
    const getIcon = (iconName: ResourceCard['icon']) => {
        const props = { className: "w-6 h-6" };
        switch (iconName) {
            case 'check': return <IconCheckCircle {...props} />;
            case 'list': return <IconClipboardList {...props} />;
            case 'phone': return <IconPhone {...props} />;
            case 'shield': return <IconShield {...props} />;
            case 'gavel': return <IconGavel {...props} />;
            case 'activity': return <IconActivity {...props} />;
            default: return <IconGlobe {...props} />;
        }
    };

    return (
        <div className="bg-white py-16">
            <SeoHead 
                title={resources.title} 
                description={resources.subtitle} 
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-extrabold text-gray-900">{resources.title}</h2>
                    <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
                        {resources.subtitle}
                    </p>
                </div>

                {/* Still Have Questions Banner moved to top as per user request */}
                <div className="mb-12 p-8 rounded-2xl bg-blue-50 border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <h3 className="text-2xl font-bold text-blue-900 mb-2">Still Have Questions?</h3>
                        <p className="text-blue-800 opacity-80">Our team is happy to help you understand your certificate requirements and the program process.</p>
                    </div>
                    <button 
                        className="px-8 py-4 text-white font-bold rounded-xl shadow-lg hover:brightness-110 transition-all flex-shrink-0"
                        style={{ backgroundColor: branding.primaryColor }}
                    >
                        Contact Support
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {resources.cards.map((card) => (
                        <div key={card.id} className="p-6 border border-gray-200 rounded-xl shadow-sm bg-gray-50 hover:shadow-md transition-shadow flex flex-col">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 text-white flex-shrink-0" style={{ backgroundColor: branding.primaryColor }}>
                                {getIcon(card.icon)}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{card.title}</h3>
                            <p className="text-gray-600 text-sm mb-6 flex-grow">{card.description}</p>
                            <div className="space-y-4">
                                {card.links.map((link, idx) => (
                                    <div key={idx}>
                                        <h4 className="font-bold text-gray-800 text-sm">{link.label}</h4>
                                        {link.url && (
                                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:underline flex items-center gap-1" style={{ color: branding.primaryColor }}>
                                                <IconGlobe className="w-3 h-3" /> Visit Website
                                            </a>
                                        )}
                                        {link.phone && (
                                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                <IconPhone className="w-3 h-3"/> {link.phone}
                                            </p>
                                        )}
                                        {link.address && (
                                            <p className="text-xs text-gray-400 mt-1 italic">
                                                {link.address}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ResourcesPage;