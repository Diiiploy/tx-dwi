







import React, { useState } from 'react';
import { WebsiteContent, Review } from '../../types';
import { IconFileText, IconMail, IconPalette, IconStar, IconTrash, IconPlus } from '../icons';

interface AdminCMSProps {
    websiteContent: WebsiteContent;
    onUpdateWebsiteContent: (newContent: Partial<WebsiteContent>) => void;
}

const AdminCMS: React.FC<AdminCMSProps> = ({ websiteContent, onUpdateWebsiteContent }) => {
    const [activeTab, setActiveTab] = useState<'pages' | 'communication' | 'branding' | 'reviews'>('pages');
    const [activePageSection, setActivePageSection] = useState<'home' | 'about' | 'contact' | 'registration' | 'terms' | 'privacy'>('home');

    // New review state
    const [newReview, setNewReview] = useState<Partial<Review>>({
        name: '',
        rating: 5,
        text: '',
        date: ''
    });

    // Generic handler for nested object updates
    const handleChange = (section: keyof WebsiteContent, key: string, value: string) => {
        const currentSection = websiteContent[section] as any;
        onUpdateWebsiteContent({
            [section]: {
                ...currentSection,
                [key]: value
            }
        });
    };

    // Specific handler for communication templates which are one level deeper
    const handleCommunicationChange = (template: keyof WebsiteContent['communication'], key: string, value: string) => {
        const currentComm = websiteContent.communication;
        const currentTemplate = currentComm[template] as any;
        onUpdateWebsiteContent({
            communication: {
                ...currentComm,
                [template]: {
                    ...currentTemplate,
                    [key]: value
                }
            }
        });
    };

    const handleAddReview = () => {
        if (newReview.name && newReview.text && newReview.date) {
            const reviewToAdd: Review = {
                id: Date.now().toString(),
                name: newReview.name,
                rating: newReview.rating || 5,
                text: newReview.text,
                date: newReview.date
            };
            onUpdateWebsiteContent({
                reviews: [...websiteContent.reviews, reviewToAdd]
            });
            setNewReview({ name: '', rating: 5, text: '', date: '' });
        } else {
            alert("Please fill in all review fields.");
        }
    };

    const handleDeleteReview = (id: string) => {
        if(window.confirm("Are you sure you want to delete this review?")) {
            onUpdateWebsiteContent({
                reviews: websiteContent.reviews.filter(r => r.id !== id)
            });
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('pages')}
                        className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                            activeTab === 'pages'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <IconFileText className="w-5 h-5" />
                            Website Pages
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('communication')}
                        className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                            activeTab === 'communication'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <IconMail className="w-5 h-5" />
                            Email & SMS
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('branding')}
                        className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                            activeTab === 'branding'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <IconPalette className="w-5 h-5" />
                            Branding
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('reviews')}
                        className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                            activeTab === 'reviews'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <IconStar className="w-5 h-5" />
                            Reviews
                        </div>
                    </button>
                </nav>
            </div>

            <div className="p-6">
                {activeTab === 'pages' && (
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-1/4">
                            <nav className="space-y-1">
                                {['home', 'about', 'contact', 'registration', 'terms', 'privacy'].map((section) => (
                                    <button
                                        key={section}
                                        onClick={() => setActivePageSection(section as any)}
                                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md capitalize ${
                                            activePageSection === section
                                                ? 'bg-blue-50 text-blue-700'
                                                : 'text-gray-900 hover:bg-gray-50'
                                        }`}
                                    >
                                        {section}
                                    </button>
                                ))}
                            </nav>
                        </div>
                        <div className="md:w-3/4 space-y-6">
                            {activePageSection === 'home' && (
                                <>
                                    <h3 className="text-lg font-medium text-gray-900">Home Page</h3>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Hero Title</label>
                                        <input
                                            type="text"
                                            value={websiteContent.home.heroTitle}
                                            onChange={(e) => handleChange('home', 'heroTitle', e.target.value)}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Hero Subtitle</label>
                                        <textarea
                                            value={websiteContent.home.heroSubtitle}
                                            onChange={(e) => handleChange('home', 'heroSubtitle', e.target.value)}
                                            rows={3}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Hero Media Type</label>
                                            <select
                                                value={websiteContent.home.heroMediaType}
                                                onChange={(e) => handleChange('home', 'heroMediaType', e.target.value)}
                                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
                                            >
                                                <option value="image">Image</option>
                                                <option value="video">Video</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Hero Media URL</label>
                                            <input
                                                type="text"
                                                value={websiteContent.home.heroMediaUrl}
                                                onChange={(e) => handleChange('home', 'heroMediaUrl', e.target.value)}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                                                placeholder="https://example.com/image.jpg"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                            {activePageSection === 'about' && (
                                <>
                                    <h3 className="text-lg font-medium text-gray-900">About Page</h3>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Title</label>
                                        <input
                                            type="text"
                                            value={websiteContent.about.title}
                                            onChange={(e) => handleChange('about', 'title', e.target.value)}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Content</label>
                                        <textarea
                                            value={websiteContent.about.content}
                                            onChange={(e) => handleChange('about', 'content', e.target.value)}
                                            rows={10}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Media Type</label>
                                            <select
                                                value={websiteContent.about.mediaType}
                                                onChange={(e) => handleChange('about', 'mediaType', e.target.value)}
                                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
                                            >
                                                <option value="image">Image</option>
                                                <option value="video">Video</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Media URL</label>
                                            <input
                                                type="text"
                                                value={websiteContent.about.mediaUrl}
                                                onChange={(e) => handleChange('about', 'mediaUrl', e.target.value)}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                                                placeholder="https://example.com/about.jpg"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                            {activePageSection === 'contact' && (
                                <>
                                    <h3 className="text-lg font-medium text-gray-900">Contact Page</h3>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Address</label>
                                        <input
                                            type="text"
                                            value={websiteContent.contact.address}
                                            onChange={(e) => handleChange('contact', 'address', e.target.value)}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                                        <input
                                            type="text"
                                            value={websiteContent.contact.phone}
                                            onChange={(e) => handleChange('contact', 'phone', e.target.value)}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email</label>
                                        <input
                                            type="text"
                                            value={websiteContent.contact.email}
                                            onChange={(e) => handleChange('contact', 'email', e.target.value)}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Image URL</label>
                                        <input
                                            type="text"
                                            value={websiteContent.contact.imageUrl}
                                            onChange={(e) => handleChange('contact', 'imageUrl', e.target.value)}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                                            placeholder="https://example.com/contact.jpg"
                                        />
                                    </div>
                                </>
                            )}
                            {activePageSection === 'registration' && (
                                <>
                                    <h3 className="text-lg font-medium text-gray-900">Registration Page</h3>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Page Title</label>
                                        <input
                                            type="text"
                                            value={websiteContent.registration.title}
                                            onChange={(e) => handleChange('registration', 'title', e.target.value)}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Subtitle / Instructions</label>
                                        <input
                                            type="text"
                                            value={websiteContent.registration.subtitle}
                                            onChange={(e) => handleChange('registration', 'subtitle', e.target.value)}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                                        />
                                    </div>
                                </>
                            )}
                            {activePageSection === 'terms' && (
                                <>
                                    <h3 className="text-lg font-medium text-gray-900">Terms and Conditions</h3>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Page Title</label>
                                        <input
                                            type="text"
                                            value={websiteContent.terms.title}
                                            onChange={(e) => handleChange('terms', 'title', e.target.value)}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Content</label>
                                        <textarea
                                            value={websiteContent.terms.content}
                                            onChange={(e) => handleChange('terms', 'content', e.target.value)}
                                            rows={15}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border font-mono"
                                        />
                                    </div>
                                </>
                            )}
                            {activePageSection === 'privacy' && (
                                <>
                                    <h3 className="text-lg font-medium text-gray-900">Privacy Policy</h3>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Page Title</label>
                                        <input
                                            type="text"
                                            value={websiteContent.privacy.title}
                                            onChange={(e) => handleChange('privacy', 'title', e.target.value)}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Content</label>
                                        <textarea
                                            value={websiteContent.privacy.content}
                                            onChange={(e) => handleChange('privacy', 'content', e.target.value)}
                                            rows={15}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border font-mono"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'branding' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-medium text-gray-900">Website Branding</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Primary Brand Color</label>
                            <div className="mt-1 flex items-center gap-3">
                                <input
                                    type="color"
                                    value={websiteContent.branding.primaryColor}
                                    onChange={(e) => handleChange('branding', 'primaryColor', e.target.value)}
                                    className="h-10 w-20 border border-gray-300 rounded-md shadow-sm p-1 cursor-pointer"
                                />
                                <span className="text-sm text-gray-600 font-mono">{websiteContent.branding.primaryColor}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Used for buttons, links, and hero backgrounds.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Logo URL</label>
                            <input
                                type="text"
                                value={websiteContent.branding.logoUrl}
                                onChange={(e) => handleChange('branding', 'logoUrl', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                                placeholder="https://example.com/logo.png"
                            />
                            <p className="text-xs text-gray-500 mt-1">URL to your organization's logo.</p>
                        </div>
                    </div>
                )}

                {activeTab === 'communication' && (
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Welcome Email</h3>
                            <div className="grid gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                                    <input
                                        type="text"
                                        value={websiteContent.communication.welcomeEmail.subject}
                                        onChange={(e) => handleCommunicationChange('welcomeEmail', 'subject', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Body <span className="text-xs text-gray-500 font-normal">(Available variables: {'{name}'}, {'{courseName}'}, {'{classCode}'})</span>
                                    </label>
                                    <textarea
                                        value={websiteContent.communication.welcomeEmail.body}
                                        onChange={(e) => handleCommunicationChange('welcomeEmail', 'body', e.target.value)}
                                        rows={6}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border font-mono"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Course Completion Email</h3>
                            <div className="grid gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                                    <input
                                        type="text"
                                        value={websiteContent.communication.completionEmail.subject}
                                        onChange={(e) => handleCommunicationChange('completionEmail', 'subject', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Body <span className="text-xs text-gray-500 font-normal">(Available variables: {'{name}'}, {'{courseName}'})</span>
                                    </label>
                                    <textarea
                                        value={websiteContent.communication.completionEmail.body}
                                        onChange={(e) => handleCommunicationChange('completionEmail', 'body', e.target.value)}
                                        rows={6}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border font-mono"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">SMS Reminder</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Message Template <span className="text-xs text-gray-500 font-normal">(Available variables: {'{courseName}'})</span>
                                </label>
                                <textarea
                                    value={websiteContent.communication.smsReminder.message}
                                    onChange={(e) => handleCommunicationChange('smsReminder', 'message', e.target.value)}
                                    rows={3}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border font-mono"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-medium text-gray-900">Manage Reviews</h3>
                        </div>
                        
                        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {websiteContent.reviews.map(review => (
                                <div key={review.id} className="p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm relative group">
                                    <button 
                                        onClick={() => handleDeleteReview(review.id)}
                                        className="absolute top-2 right-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-gray-200"
                                        title="Delete Review"
                                    >
                                        <IconTrash className="w-4 h-4" />
                                    </button>
                                    <div className="flex items-center gap-1 mb-2">
                                        {[...Array(5)].map((_, i) => (
                                            <IconStar 
                                                key={i} 
                                                className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                            />
                                        ))}
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 mb-1">{review.name}</p>
                                    <p className="text-xs text-gray-500 mb-2">{review.date}</p>
                                    <p className="text-sm text-gray-600 italic">"{review.text}"</p>
                                </div>
                            ))}
                        </div>

                        <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <IconPlus className="w-4 h-4" /> Add New Review
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Reviewer Name</label>
                                    <input 
                                        type="text" 
                                        value={newReview.name}
                                        onChange={(e) => setNewReview(prev => ({ ...prev, name: e.target.value }))}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                                        placeholder="e.g. John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date (Text)</label>
                                    <input 
                                        type="text" 
                                        value={newReview.date}
                                        onChange={(e) => setNewReview(prev => ({ ...prev, date: e.target.value }))}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                                        placeholder="e.g. 2 weeks ago"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Rating</label>
                                    <select 
                                        value={newReview.rating}
                                        onChange={(e) => setNewReview(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                                    >
                                        <option value="5">5 Stars</option>
                                        <option value="4">4 Stars</option>
                                        <option value="3">3 Stars</option>
                                        <option value="2">2 Stars</option>
                                        <option value="1">1 Star</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Review Text</label>
                                    <textarea 
                                        value={newReview.text}
                                        onChange={(e) => setNewReview(prev => ({ ...prev, text: e.target.value }))}
                                        rows={3}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                                        placeholder="Enter the review content..."
                                    />
                                </div>
                            </div>
                            <button 
                                onClick={handleAddReview}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition"
                            >
                                Add Review
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminCMS;
