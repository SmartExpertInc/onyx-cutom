'use client';

import { useState } from 'react';

interface GenerationCompletedModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoTitle: string;
}

export default function GenerationCompletedModal({ isOpen, onClose, videoTitle }: GenerationCompletedModalProps) {
  const [isDownloadDropdownOpen, setIsDownloadDropdownOpen] = useState(false);
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background overlay */}
      <div 
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
        onClick={onClose}
      ></div>
      
      {/* Modal content */}
      <div className="relative bg-white shadow-xl w-[700px] max-w-[95vw] flex flex-col z-10" style={{ borderRadius: '12px' }}>
        {/* Header */}
        <div className="p-6 pb-3 border-b border-gray-200">
          <div className="flex justify-between items-center">
            {/* Video title on the left */}
            <h2 className="text-lg font-semibold truncate max-w-[300px]" title={videoTitle}>
              {videoTitle}
            </h2>
            
            {/* Buttons on the right */}
            <div className="flex items-center gap-2">
              {/* Download dropdown button */}
              <div className="relative">
                <button 
                  onClick={() => setIsDownloadDropdownOpen(!isDownloadDropdownOpen)}
                  className="bg-white text-black border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors text-sm flex items-center gap-2"
                >
                  Download
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Download dropdown popup */}
                {isDownloadDropdownOpen && (
                  <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 w-56">
                    <div className="py-2">
                      <button className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors text-sm flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 1360 1000" className="w-4 h-4 text-gray-600">
                          <path fill="currentColor" d="M1360 1v1000H0V1h1360zm-200 160h120V81h-120v80zm-200 0h120V81H960v80zm-240 0h120V81H720v80zm240 600h320V241H960v520zM520 161h120V81H520v80zm640 760h120v-80h-120v80zM280 161h120V81H280v80zm240 600h320V241H520v520zm440 160h120v-80H960v80zM80 161h120V81H80v80zm640 760h120v-80H720v80zM80 761h320V241H80v520zm440 160h120v-80H520v80zm-240 0h120v-80H280v80zm-200 0h120v-80H80v80z"/>
                        </svg>
                        Video (.mp4)
                      </button>
                      <button className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors text-sm flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" className="w-4 h-4 text-gray-600">
                          <path fill="currentColor" d="M.5 6c-.275 0-.5.225-.5.5v3c0 .275.225.5.5.5s.5-.225.5-.5v-3C1 6.225.775 6 .5 6m14 0c-.275 0-.5.225-.5.5v3c0 .275.225.5.5.5s.5-.225.5-.5v-3c0-.275-.225-.5-.5-.5m-12-3c-.275 0-.5.225-.5.5v9c0 .275.225.5.5.5s.5-.225.5-.5v-9c0-.275-.225-.5-.5-.5m2 2c-.275 0-.5.225-.5.5v5c0 .275.225.5.5.5s.5-.225.5-.5v-5c0-.275-.225-.5-.5-.5m2 2c-.275 0-.5.225-.5.5v1c0 .275.225.5.5.5s.5-.225.5-.5v-1c0-.275-.225-.5-.5-.5m2-2c-.275 0-.5.225-.5.5v5c0 .275.225.5.5.5s.5-.225.5-.5v-5c0-.275-.225-.5-.5-.5m2-4c-.275 0-.5.225-.5.5v13c0 .275.225.5.5.5s.5-.225.5-.5v-13c0-.275-.225-.5-.5-.5m2 2c-.275 0-.5.225-.5.5v9c0 .275.225.5.5.5s.5-.225.5-.5v-9c0-.275-.225-.5-.5-.5"/>
                        </svg>
                        Audio (.MP3)
                      </button>
                      <button className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors text-sm flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className="w-4 h-4 text-gray-600">
                          <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 6.1H3m18 6H3M15.1 18H3"/>
                        </svg>
                        Closed captions (.SRT)
                      </button>
                      
                      {/* Divider */}
                      <div className="border-t border-gray-200 my-1"></div>
                      
                      <button className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors text-sm flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className="w-4 h-4 text-gray-600">
                          <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 6.1H3m18 6H3M15.1 18H3"/>
                        </svg>
                        Closed captions (.VTT)
                      </button>
                      <button className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors text-sm flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className="w-4 h-4 text-gray-600">
                          <g fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2">
                            <path strokeLinecap="round" d="M4 4v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.342a2 2 0 0 0-.602-1.43l-4.44-4.342A2 2 0 0 0 13.56 2H6a2 2 0 0 0-2 2Z"/>
                            <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
                          </g>
                        </svg>
                        Script (.PDF)
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Copy link button */}
              <button className="bg-black text-white px-3 py-1.5 rounded-md hover:bg-gray-800 transition-colors text-sm flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" className="w-4 h-4 text-white">
                  <path fill="currentColor" fillRule="evenodd" d="M9.929 3.132a2.078 2.078 0 1 1 2.94 2.94l-.65.648a.75.75 0 0 0 1.061 1.06l.649-.648a3.579 3.579 0 0 0-5.06-5.06L6.218 4.72a3.578 3.578 0 0 0 0 5.06a.75.75 0 0 0 1.061-1.06a2.078 2.078 0 0 1 0-2.94L9.93 3.132Zm-.15 3.086a.75.75 0 0 0-1.057 1.064c.816.81.818 2.13.004 2.942l-2.654 2.647a2.08 2.08 0 0 1-2.94-2.944l.647-.647a.75.75 0 0 0-1.06-1.06l-.648.647a3.58 3.58 0 0 0 5.06 5.066l2.654-2.647a3.575 3.575 0 0 0-.007-5.068Z" clipRule="evenodd"/>
                </svg>
                Copy link
              </button>
              
              {/* More options button */}
              <div className="relative">
                <button 
                  onClick={() => setIsMoreOptionsOpen(!isMoreOptionsOpen)}
                  className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                  </svg>
                </button>
                
                {/* More options dropdown popup */}
                {isMoreOptionsOpen && (
                  <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 w-48">
                    <div className="py-2">
                      {/* Exit to section */}
                      <div className="px-4 py-1">
                        <span className="text-xs text-gray-500">Exit to</span>
                      </div>
                      
                      <button className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors text-sm flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className="w-4 h-4 text-gray-600">
                          <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                          <polyline points="9,22 9,12 15,12 15,22"/>
                        </svg>
                        Home
                      </button>
                      
                      {/* Divider */}
                      <div className="border-t border-gray-200 my-1"></div>
                      
                      <button className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors text-sm flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className="w-4 h-4 text-gray-600">
                          <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v14M5 12h14"/>
                        </svg>
                        New draft
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-6 py-6 bg-gray-50 flex items-center justify-center">
          {/* Video placeholder - grey rectangle */}
          <div className="w-80 h-48 bg-gray-300 rounded-lg flex items-center justify-center">
            <span className="text-gray-500 text-sm">Video will be displayed here</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-3 border-t border-gray-200">
          <div className="flex justify-end">
            <button className="bg-white text-black border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors text-sm flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" className="w-4 h-4 text-black">
                <path fill="currentColor" fillRule="evenodd" d="M9.929 3.132a2.078 2.078 0 1 1 2.94 2.94l-.65.648a.75.75 0 0 0 1.061 1.06l.649-.648a3.579 3.579 0 0 0-5.06-5.06L6.218 4.72a3.578 3.578 0 0 0 0 5.06a.75.75 0 0 0 1.061-1.06a2.078 2.078 0 0 1 0-2.94L9.93 3.132Zm-.15 3.086a.75.75 0 0 0-1.057 1.064c.816.81.818 2.13.004 2.942l-2.654 2.647a2.08 2.08 0 0 1-2.94-2.944l.647-.647a.75.75 0 0 0-1.06-1.06l-.648.647a3.58 3.58 0 0 0 5.06 5.066l2.654-2.647a3.575 3.575 0 0 0-.007-5.068Z" clipRule="evenodd"/>
              </svg>
              Copy invite link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
