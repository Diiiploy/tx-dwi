
import React from 'react';
import { WebsitePage } from './Website';

interface FooterProps {
    setPage: (page: WebsitePage) => void;
}

const Footer: React.FC<FooterProps> = ({ setPage }) => {
    return (
        <footer className="bg-gray-800 text-white">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center">
                <p>&copy; {new Date().getFullYear()} DWI Education of Central Texas. All Rights Reserved.</p>
                <p className="text-sm text-gray-400 mt-2">This is a whitelabel platform for educational purposes.</p>
                
                <div className="mt-6 flex justify-center gap-6 text-sm text-gray-400">
                    <button onClick={() => setPage('terms')} className="hover:text-white transition-colors">Terms & Conditions</button>
                    <span className="text-gray-600">|</span>
                    <button onClick={() => setPage('privacy')} className="hover:text-white transition-colors">Privacy Policy</button>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
