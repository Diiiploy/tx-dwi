




import React from 'react';
import SeoHead from './SeoHead';
import { WebsiteContent } from '../../types';

interface ContactPageProps {
    address: string;
    phone: string;
    email: string;
    imageUrl: string;
    branding: WebsiteContent['branding'];
}

const ContactPage: React.FC<ContactPageProps> = ({ address, phone, email, imageUrl, branding }) => {
    return (
        <div className="bg-white py-16">
            <SeoHead 
                title="Contact Us" 
                description="Get in touch with DWI Education of Central Texas. We are here to help with your court-mandated education requirements." 
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                 <div className="text-center mb-12">
                    <h2 className="text-3xl font-extrabold text-gray-900">Contact Us</h2>
                    <p className="mt-4 text-lg text-gray-500">
                        We're here to help. Reach out with any questions you may have.
                    </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-8">
                        <div className="p-6 border border-gray-200 rounded-lg shadow-sm">
                            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4" style={{ borderColor: branding.primaryColor }}>Contact Information</h3>
                            <div className="space-y-4 text-gray-600">
                                <p><strong>Address:</strong><br/>{address}</p>
                                <p><strong>Phone:</strong><br/><a href={`tel:${phone.replace(/[^0-9]/g, '')}`} className="hover:underline" style={{ color: branding.primaryColor }}>{phone}</a></p>
                                <p><strong>Email:</strong><br/><a href={`mailto:${email}`} className="hover:underline" style={{ color: branding.primaryColor }}>{email}</a></p>
                            </div>
                        </div>
                        {imageUrl && (
                            <div className="rounded-lg overflow-hidden shadow-md aspect-video">
                                <img src={imageUrl} alt="Office Location" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>
                    
                     <form onSubmit={e => e.preventDefault()} className="p-8 border border-gray-200 rounded-lg shadow-lg bg-gray-50">
                         <h3 className="text-xl font-bold text-gray-900 mb-6">Send us a Message</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                                <input type="text" id="name" placeholder="Your Name" className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                <input type="email" id="email" placeholder="Your Email" className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                                <textarea id="message" rows={4} placeholder="Your Message" className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"></textarea>
                            </div>
                            <button 
                                type="submit" 
                                className="w-full px-6 py-3 text-white font-semibold rounded-lg shadow-md hover:brightness-110 transition mt-2"
                                style={{ backgroundColor: branding.primaryColor }}
                            >
                                Send Message
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;