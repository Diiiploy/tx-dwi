
import React, { useState, useEffect } from 'react';
import { Course, WebsiteContent } from '../../types';
import { IconDownload, IconRobot, IconRefreshCw, IconZap, IconPlus, IconCheckCircle, IconEye, IconPalette, IconAnnouncement } from '../icons';
import { generateAdCopy } from '../../services/geminiService';

interface AdminAdvertisementsProps {
    courses: Course[];
    websiteContent: WebsiteContent;
}

type TemplateType = 'modern' | 'minimal' | 'bold' | 'classic';

const AdminAdvertisements: React.FC<AdminAdvertisementsProps> = ({ courses, websiteContent }) => {
    const [selectedCourse, setSelectedCourse] = useState<Course>(courses[0]);
    const [template, setTemplate] = useState<TemplateType>('modern');
    const [isGenerating, setIsGenerating] = useState(false);
    const [adCopy, setAdCopy] = useState({
        headline: "State-Certified DWI Education",
        body: "Fulfill your court requirements with our professional, accessible online courses. Start today and move forward.",
        cta: "Register Now"
    });
    const [brandColor, setBrandColor] = useState(websiteContent.branding.primaryColor);
    const [showBadge, setShowBadge] = useState(true);

    const handleGenerateAI = async () => {
        setIsGenerating(true);
        const result = await generateAdCopy(selectedCourse.name);
        setAdCopy(result);
        setIsGenerating(false);
    };

    const handleDownload = () => {
        window.print();
    };

    // Style helper based on template
    const getFlyerStyles = () => {
        switch (template) {
            case 'bold':
                return {
                    container: "bg-slate-900 text-white p-12",
                    headline: "text-6xl font-black uppercase tracking-tighter leading-none mb-6",
                    body: "text-xl font-medium opacity-80 mb-8 border-l-4 border-white pl-6",
                    footer: "mt-auto flex justify-between items-end border-t border-white/20 pt-8"
                };
            case 'minimal':
                return {
                    container: "bg-white text-slate-800 p-16 font-sans border-[12px] border-gray-50",
                    headline: "text-5xl font-light tracking-tight mb-10 text-center",
                    body: "text-lg text-gray-500 leading-relaxed mb-12 text-center max-w-lg mx-auto",
                    footer: "mt-auto text-center pt-8 border-t border-gray-100"
                };
            case 'classic':
                return {
                    container: "bg-gray-50 text-gray-900 p-10 border-[1px] border-gray-300",
                    headline: "text-4xl font-serif font-bold border-b-4 border-black pb-4 mb-8",
                    body: "text-lg font-serif leading-relaxed mb-8",
                    footer: "mt-auto grid grid-cols-2 gap-8 border-t border-black pt-8"
                };
            default: // modern
                return {
                    container: "bg-white text-slate-900 p-10",
                    headline: "text-5xl font-extrabold tracking-tight mb-6 leading-[1.1]",
                    body: "text-lg text-slate-600 mb-8 leading-relaxed",
                    footer: "mt-auto flex items-center justify-between bg-slate-50 p-6 rounded-2xl"
                };
        }
    };

    const styles = getFlyerStyles();

    return (
        <div className="flex flex-col lg:flex-row gap-8 animate-fade-in no-print">
            {/* Controls Sidebar */}
            <div className="w-full lg:w-96 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Target Program</label>
                        <select 
                            value={selectedCourse.id}
                            onChange={(e) => setSelectedCourse(courses.find(c => c.id === e.target.value) || courses[0])}
                            className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 appearance-none shadow-inner"
                        >
                            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Design Preset</label>
                        <div className="grid grid-cols-2 gap-2">
                            {(['modern', 'minimal', 'bold', 'classic'] as TemplateType[]).map(t => (
                                <button 
                                    key={t}
                                    onClick={() => setTemplate(t)}
                                    className={`py-2 text-[10px] font-black uppercase rounded-lg border transition-all ${template === t ? 'bg-blue-600 text-white border-blue-700 shadow-lg' : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">AI Copywriter</label>
                            <button 
                                onClick={handleGenerateAI}
                                disabled={isGenerating}
                                className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase hover:text-emerald-700 transition"
                            >
                                <IconRefreshCw className={`w-3 h-3 ${isGenerating && 'animate-spin'}`} />
                                Re-write
                            </button>
                        </div>
                        <div className="space-y-4 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                            <div className="flex items-center gap-2 mb-2">
                                <IconRobot className="w-4 h-4 text-emerald-600" />
                                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-tighter">Magic Copy Suggestions</span>
                            </div>
                            <input 
                                value={adCopy.headline}
                                onChange={e => setAdCopy({...adCopy, headline: e.target.value})}
                                className="w-full p-2 bg-white border border-emerald-100 rounded-lg text-xs font-bold focus:ring-emerald-500"
                                placeholder="Headline"
                            />
                            <textarea 
                                value={adCopy.body}
                                onChange={e => setAdCopy({...adCopy, body: e.target.value})}
                                className="w-full p-2 bg-white border border-emerald-100 rounded-lg text-xs focus:ring-emerald-500 h-20 resize-none"
                                placeholder="Persuasive Body"
                            />
                            <input 
                                value={adCopy.cta}
                                onChange={e => setAdCopy({...adCopy, cta: e.target.value})}
                                className="w-full p-2 bg-white border border-emerald-100 rounded-lg text-xs font-black uppercase tracking-wider focus:ring-emerald-500"
                                placeholder="CTA"
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Brand Color</label>
                            <input type="color" value={brandColor} onChange={e => setBrandColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trust Badges</label>
                            <button 
                                onClick={() => setShowBadge(!showBadge)}
                                className={`w-10 h-5 rounded-full transition-colors relative ${showBadge ? 'bg-blue-600' : 'bg-gray-200'}`}
                            >
                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${showBadge ? 'left-5.5 translate-x-5' : 'left-0.5'}`} />
                            </button>
                        </div>
                    </div>

                    <button 
                        onClick={handleDownload}
                        className="w-full py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-black transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95"
                    >
                        <IconDownload className="w-5 h-5" />
                        Export Flyer PDF
                    </button>
                </div>
            </div>

            {/* Live Preview Area */}
            <div className="flex-grow">
                <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-sm mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><IconEye className="w-4 h-4" /></div>
                        <div>
                            <p className="text-xs font-black text-gray-900 uppercase tracking-widest">Flyer Preview</p>
                            <p className="text-[10px] text-gray-400 font-bold">Standard 8.5" x 11" US Letter</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-tighter">
                        <IconCheckCircle className="w-3.5 h-3.5" />
                        Ready to Print
                    </div>
                </div>

                {/* The Virtual Canvas */}
                <div className="flex justify-center bg-gray-200 p-12 rounded-3xl overflow-hidden min-h-[800px] border-4 border-dashed border-gray-300">
                    <div 
                        id="printable-paperwork"
                        className={`w-[600px] aspect-[1/1.41] shadow-[0_40px_100px_rgba(0,0,0,0.2)] rounded-sm overflow-hidden flex flex-col transition-all duration-700 ${styles.container}`}
                    >
                        {/* Flyer Header: Logo & Badge */}
                        <div className="flex justify-between items-start mb-12">
                            {websiteContent.branding.logoUrl ? (
                                <img src={websiteContent.branding.logoUrl} className="h-16 w-auto grayscale" alt="Logo" />
                            ) : (
                                <div className="text-2xl font-black tracking-tighter uppercase italic opacity-20">PLATFORM LOGO</div>
                            )}
                            {showBadge && (
                                <div className="p-4 bg-slate-100 rounded-full flex flex-col items-center justify-center text-slate-900 border border-slate-200">
                                    <IconCheckCircle className="w-6 h-6 mb-1" />
                                    <span className="text-[8px] font-black uppercase tracking-widest">STATE CERTIFIED</span>
                                </div>
                            )}
                        </div>

                        {/* Main Copy */}
                        <h1 className={styles.headline} style={template === 'modern' ? { color: brandColor } : {}}>
                            {adCopy.headline}
                        </h1>
                        
                        <p className={styles.body}>
                            {adCopy.body}
                        </p>

                        <div className="grid grid-cols-2 gap-12 mt-8">
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Why Join Us?</h4>
                                <ul className="space-y-2 text-sm font-bold opacity-70 list-disc pl-4">
                                    <li>100% Online Classroom</li>
                                    <li>Instant Certificate Access</li>
                                    <li>Court-Approved Curriculum</li>
                                    <li>Affordable Payment Plans</li>
                                </ul>
                            </div>
                            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-2xl bg-white/5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Program Starting At</p>
                                <p className="text-4xl font-black" style={{ color: brandColor }}>${selectedCourse.price}</p>
                            </div>
                        </div>

                        {/* CTA Section */}
                        <div className="mt-16 text-center">
                            <div className="inline-block px-12 py-6 rounded-2xl shadow-xl transform rotate-1 text-white font-black text-2xl uppercase tracking-widest" style={{ backgroundColor: brandColor }}>
                                {adCopy.cta}
                            </div>
                        </div>

                        {/* Footer Details */}
                        <div className={styles.footer}>
                            <div className="space-y-1">
                                <p className="text-xs font-black uppercase tracking-widest opacity-40">Contact Info</p>
                                <p className="text-sm font-bold">{websiteContent.contact.phone}</p>
                                <p className="text-[10px] font-medium opacity-60">{websiteContent.contact.email}</p>
                            </div>
                            <div className="text-right max-w-xs">
                                <p className="text-xs font-black uppercase tracking-widest opacity-40 mb-1">Location</p>
                                <p className="text-[10px] font-bold leading-tight opacity-60">{websiteContent.contact.address}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-6">
                    <div className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100"><IconZap className="w-6 h-6" /></div>
                    <div>
                        <h4 className="font-black text-blue-900 uppercase text-xs tracking-widest mb-1">Pro Tip: Local Awareness</h4>
                        <p className="text-sm text-blue-800 opacity-80">Download this flyer and distribute it at local courthouses, legal offices, or community centers. The clean professional design increases trust with probation officers.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAdvertisements;
