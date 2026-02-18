import React from 'react';

const AdminLetterTrack: React.FC = () => {
    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden h-[calc(100vh-200px)] flex flex-col">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Letter Track Pro Portal</h3>
                    <p className="text-sm text-gray-500">Manage and track physical certificate mailings via USPS.</p>
                </div>
                <a 
                    href="https://www.lettertrackpro.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                    Open in new tab
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </a>
            </div>
            <div className="flex-1 w-full bg-gray-100">
                <iframe 
                    src="https://www.lettertrackpro.com/" 
                    title="Letter Track Pro" 
                    className="w-full h-full border-none"
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                />
            </div>
            <div className="p-3 bg-blue-50 text-blue-800 text-xs text-center border-t border-blue-100">
                Tracking numbers and labels are generated securely through the Letter-Track Pro platform.
            </div>
        </div>
    );
};

export default AdminLetterTrack;
