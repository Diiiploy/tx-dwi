import React, { useState } from 'react';
import { View, RegistrationStep, Course, Student, Coupon, WebsiteContent, Language } from '../types';
import { IconCreditCard, IconArrowLeft, IconCheckCircle, IconUserPlus, IconClock, IconTag, IconGlobe } from './icons';

interface StudentRegistrationProps {
    setView: (view: View) => void;
    courses: Course[];
    onRegister: (name: string, courseId: string, company: Student['company'], billedToName: string, isExpedited: boolean, couponCode: string | undefined, discountAmount: number, preferredLanguage: Language) => string;
    coupons: Coupon[];
    websiteContent?: WebsiteContent;
}

const StudentRegistration: React.FC<StudentRegistrationProps> = ({ setView, courses, onRegister, coupons, websiteContent }) => {
    const [step, setStep] = useState<RegistrationStep>(RegistrationStep.CourseSelection);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [userInfo, setUserInfo] = useState({ name: '', email: '', company: 'West' as Student['company'], preferredLanguage: 'en' as Language });
    const [uniqueCode, setUniqueCode] = useState<string>('');
    
    // Billing state
    const [isParticipant, setIsParticipant] = useState(true);
    const [billingName, setBillingName] = useState('');
    const [isExpedited, setIsExpedited] = useState(false);
    
    // Coupon state
    const [couponCode, setCouponCode] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [couponMessage, setCouponMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    
    const expeditedPrice = 25.00;
    const companyOptions: Student['company'][] = ['West', 'North', 'South', 'Southeast'];

    const pageTitle = websiteContent?.registration?.title || "Select a Course";
    const pageSubtitle = websiteContent?.registration?.subtitle || "Choose the program you wish to enroll in.";
    const primaryColor = websiteContent?.branding?.primaryColor || '#2563eb'; // Default to blue if no branding

    const handleApplyCoupon = () => {
        setCouponMessage(null);
        const code = couponCode.trim().toUpperCase();
        
        if (!code) return;

        const validCoupon = coupons.find(c => c.code === code);

        if (validCoupon) {
            const amount = validCoupon.discountAmount;
            // Ensure discount doesn't exceed total price
            const basePrice = selectedCourse?.price || 0;
            if (amount > basePrice) {
                 setDiscountAmount(basePrice); // Free, but not negative
                 setCouponMessage({ text: `Coupon applied! $${basePrice.toFixed(2)} off`, type: 'success' });
            } else {
                 setDiscountAmount(amount);
                 setCouponMessage({ text: `Coupon applied! $${amount.toFixed(2)} off`, type: 'success' });
            }
        } else {
            setDiscountAmount(0);
            setCouponMessage({ text: 'Invalid coupon code', type: 'error' });
        }
    };

    const handleSelectCourse = (course: Course) => {
        setSelectedCourse(course);
        // Reset coupon state when changing courses
        setDiscountAmount(0);
        setCouponCode('');
        setCouponMessage(null);
        setStep(RegistrationStep.UserInfo);
    };

    const handleUserInfoSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (userInfo.name && userInfo.email) {
            setStep(RegistrationStep.Payment);
        }
    };
    
    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedCourse) {
            const finalBilledToName = isParticipant ? userInfo.name : billingName;
            
            if (!isParticipant && !billingName.trim()) {
                alert("Please enter the name of the person paying for the course.");
                return;
            }

            const code = onRegister(
                userInfo.name, 
                selectedCourse.id, 
                userInfo.company, 
                finalBilledToName, 
                isExpedited,
                discountAmount > 0 ? couponCode.trim().toUpperCase() : undefined,
                discountAmount,
                userInfo.preferredLanguage
            );
            setUniqueCode(code);
            setStep(RegistrationStep.Confirmation);
        }
    };

    const calculateTotal = () => {
        const base = selectedCourse?.price || 0;
        const expedited = isExpedited ? expeditedPrice : 0;
        const total = base + expedited - discountAmount;
        return Math.max(0, total); // Ensure no negative total
    };

    const renderStep = () => {
        switch (step) {
            case RegistrationStep.CourseSelection:
                return (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">{pageTitle}</h2>
                        <p className="text-center text-gray-600 mb-8">{pageSubtitle}</p>
                        <div className="space-y-4">
                            {courses.map(course => (
                                <div key={course.id} className="p-4 border border-gray-200 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800">{course.name}</h3>
                                        <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                                    </div>
                                    <div className="text-left sm:text-right flex-shrink-0">
                                        <p className="text-xl font-bold text-gray-900">${course.price}</p>
                                        <button 
                                            onClick={() => handleSelectCourse(course)} 
                                            className="mt-1 px-4 py-2 text-white text-sm font-semibold rounded-lg shadow-md hover:brightness-110 transition"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            Select & Continue
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            
            case RegistrationStep.UserInfo:
                 return (
                    <div>
                        <button onClick={() => setStep(RegistrationStep.CourseSelection)} className="flex items-center gap-1 text-sm text-gray-600 hover:underline mb-4"><IconArrowLeft className="w-4 h-4" /> Back to Courses</button>
                        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Your Information</h2>
                        <p className="text-center text-gray-600 mb-8">Please enter your personal details and language preference.</p>
                        <form onSubmit={handleUserInfoSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input type="text" id="name" value={userInfo.name} onChange={(e) => setUserInfo({...userInfo, name: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                                <input type="email" id="email" value={userInfo.email} onChange={(e) => setUserInfo({...userInfo, email: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="company" className="block text-sm font-medium text-gray-700">Reporting Company</label>
                                    <select
                                        id="company"
                                        value={userInfo.company}
                                        onChange={(e) => setUserInfo({...userInfo, company: e.target.value as Student['company']})}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                        required
                                    >
                                        {companyOptions.map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Preferred Class Language</label>
                                    <div className="mt-1 flex items-center bg-gray-100 p-1 rounded-lg">
                                        <button
                                            type="button"
                                            onClick={() => setUserInfo({...userInfo, preferredLanguage: 'en'})}
                                            className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-bold rounded-md transition-all ${userInfo.preferredLanguage === 'en' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                                        >
                                            <IconGlobe className="w-3 h-3" />
                                            English
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setUserInfo({...userInfo, preferredLanguage: 'es'})}
                                            className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-bold rounded-md transition-all ${userInfo.preferredLanguage === 'es' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                                        >
                                            <IconGlobe className="w-3 h-3" />
                                            Español
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                className="w-full mt-2 px-6 py-3 text-white font-semibold rounded-lg shadow-md hover:brightness-110 transition"
                                style={{ backgroundColor: primaryColor }}
                            >
                                Continue to Payment
                            </button>
                        </form>
                    </div>
                );

            case RegistrationStep.Payment:
                return (
                     <div>
                        <button onClick={() => setStep(RegistrationStep.UserInfo)} className="flex items-center gap-1 text-sm text-gray-600 hover:underline mb-4"><IconArrowLeft className="w-4 h-4" /> Back to Information</button>
                        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Payment Details</h2>
                        <p className="text-center text-gray-600 mb-8">Please enter your payment information.</p>
                        
                        <div className="p-4 bg-gray-100 rounded-lg border border-gray-200 mb-6 shadow-inner">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-medium text-gray-800">{selectedCourse?.name}</span>
                                <span className="text-gray-900">${selectedCourse?.price.toFixed(2)}</span>
                            </div>
                            {isExpedited && (
                                <div className="flex justify-between items-center mb-2 text-sm">
                                    <span className="text-gray-600 flex items-center gap-1"><IconClock className="w-3 h-3"/> Expedited Processing</span>
                                    <span className="text-gray-900">${expeditedPrice.toFixed(2)}</span>
                                </div>
                            )}
                            {discountAmount > 0 && (
                                <div className="flex justify-between items-center mb-2 text-sm text-green-700">
                                    <span className="flex items-center gap-1"><IconTag className="w-3 h-3"/> Discount Applied ({couponCode.toUpperCase()})</span>
                                    <span>-${discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center border-t border-gray-300 pt-2 mt-2">
                                <span className="font-bold text-gray-900">Total</span>
                                <span className="font-bold text-lg text-gray-900">${calculateTotal().toFixed(2)}</span>
                            </div>
                        </div>

                        <form onSubmit={handlePaymentSubmit} className="space-y-6">
                            
                            {/* Billing Identity & Options */}
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <label className="block text-sm font-medium text-gray-800 mb-2">Are you the participant?</label>
                                <div className="flex gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name="isParticipant" 
                                            checked={isParticipant} 
                                            onChange={() => setIsParticipant(true)} 
                                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">Yes, I am {userInfo.name}</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name="isParticipant" 
                                            checked={!isParticipant} 
                                            onChange={() => setIsParticipant(false)} 
                                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">No, I am paying for them</span>
                                    </label>
                                </div>

                                {!isParticipant && (
                                    <div className="mt-4 animate-fade-in">
                                        <label htmlFor="billingName" className="block text-sm font-medium text-gray-700 mb-1">Payer's Full Name (for Billing)</label>
                                        <div className="relative">
                                            <input 
                                                type="text" 
                                                id="billingName" 
                                                value={billingName} 
                                                onChange={(e) => setBillingName(e.target.value)} 
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 pl-10" 
                                                placeholder="e.g. John Doe"
                                                required={!isParticipant}
                                            />
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><IconUserPlus className="h-5 w-5 text-gray-400" /></div>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-4 pt-4 border-t border-blue-200">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={isExpedited} 
                                            onChange={(e) => setIsExpedited(e.target.checked)} 
                                            className="mt-1 h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                        />
                                        <div>
                                            <span className="font-medium text-gray-900">Expedited Certificate Processing (+${expeditedPrice.toFixed(2)})</span>
                                            <p className="text-xs text-gray-600">Receive your certificate within 24 hours of course completion.</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Coupon Code Section */}
                            <div className="space-y-2">
                                <label htmlFor="coupon" className="block text-sm font-medium text-gray-700">Coupon Code</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        id="coupon"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 uppercase font-mono"
                                        placeholder="Enter code"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleApplyCoupon}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition text-sm"
                                    >
                                        Apply
                                    </button>
                                </div>
                                {couponMessage && (
                                    <p className={`text-xs ${couponMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                        {couponMessage.text}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-4 border-t border-gray-200 pt-6">
                                <div>
                                    <label htmlFor="card-number" className="block text-sm font-medium text-gray-700">Card Number</label>
                                    <div className="relative mt-1">
                                        <input type="text" id="card-number" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 pl-10" placeholder="0000 0000 0000 0000" required />
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><IconCreditCard className="h-5 w-5 text-gray-400" /></div>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label htmlFor="expiry" className="block text-sm font-medium text-gray-700">Expiration Date</label>
                                        <input type="text" id="expiry" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="MM / YY" required />
                                    </div>
                                    <div className="flex-1">
                                        <label htmlFor="cvc" className="block text-sm font-medium text-gray-700">CVC</label>
                                        <input type="text" id="cvc" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="123" required />
                                    </div>
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                className="w-full mt-2 px-6 py-3 text-white font-semibold rounded-lg shadow-md hover:brightness-110 transition"
                                style={{ backgroundColor: primaryColor }}
                            >
                                Pay ${calculateTotal().toFixed(2)} & Complete Registration
                            </button>
                        </form>
                    </div>
                );

            case RegistrationStep.Confirmation:
                return (
                     <div className="text-center">
                        <IconCheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Complete!</h2>
                        <p className="text-gray-600 mb-6">Welcome, {userInfo.name}! You are now enrolled in {selectedCourse?.name}. Your preferred language is set to {userInfo.preferredLanguage === 'es' ? 'Spanish' : 'English'}.</p>
                        
                        <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800">
                            <h3 className="font-bold">Your Unique Class Code</h3>
                            <p className="mt-1">Please save this code. You will need it to log into your class sessions.</p>
                            <p className="mt-4 text-2xl font-bold text-gray-900 font-mono bg-white p-3 rounded-md tracking-widest shadow-sm">{uniqueCode}</p>
                        </div>

                        <button 
                            onClick={() => setView(View.StudentLogin)} 
                            className="w-full mt-8 px-6 py-3 text-white font-semibold rounded-lg shadow-md hover:brightness-110 transition"
                            style={{ backgroundColor: primaryColor }}
                        >
                            Proceed to Login
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="max-w-2xl w-full p-8 bg-white shadow-2xl rounded-xl border border-gray-200">
                {renderStep()}
                {step !== RegistrationStep.Confirmation && (
                    <div className="mt-6 text-center border-t border-gray-200 pt-4">
                        <button
                            onClick={() => setView(View.RoleSelector)}
                            className="text-sm font-medium text-gray-600 hover:text-gray-800 hover:underline"
                        >
                            Cancel and return to login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentRegistration;
