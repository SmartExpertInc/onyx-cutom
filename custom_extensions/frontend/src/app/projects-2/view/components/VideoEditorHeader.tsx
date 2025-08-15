'use client';

import { useState, useRef, useEffect } from 'react';

interface EmailInput {
  id: string;
  email: string;
  role: 'viewer' | 'editor' | 'admin';
}

export default function VideoEditorHeader() {
  const [isResizePopupOpen, setIsResizePopupOpen] = useState(false);
  const [isSharePopupOpen, setIsSharePopupOpen] = useState(false);
  const [emailInputs, setEmailInputs] = useState<EmailInput[]>([
    { id: '1', email: '', role: 'editor' }
  ]);
  const resizeButtonRef = useRef<HTMLButtonElement>(null);
  const shareButtonRef = useRef<HTMLButtonElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resizeButtonRef.current && !resizeButtonRef.current.contains(event.target as Node)) {
        setIsResizePopupOpen(false);
      }
      if (shareButtonRef.current && !shareButtonRef.current.contains(event.target as Node)) {
        setIsSharePopupOpen(false);
      }
    };

    if (isResizePopupOpen || isSharePopupOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isResizePopupOpen, isSharePopupOpen]);

  const handleResizeClick = () => {
    setIsResizePopupOpen(!isResizePopupOpen);
  };

  const handleShareClick = () => {
    setIsSharePopupOpen(!isSharePopupOpen);
  };

  const handleEmailChange = (id: string, email: string) => {
    setEmailInputs(prev => prev.map(input => 
      input.id === id ? { ...input, email } : input
    ));
  };

  const handleRoleChange = (id: string, role: 'viewer' | 'editor' | 'admin') => {
    setEmailInputs(prev => prev.map(input => 
      input.id === id ? { ...input, role } : input
    ));
  };

  const addEmailInput = () => {
    const newId = (emailInputs.length + 1).toString();
    setEmailInputs(prev => [...prev, { id: newId, email: '', role: 'editor' }]);
  };

  // Envelope icon component
  const EnvelopeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-gray-400">
      <path
        d="M2.67 3.33H13.33C14.07 3.33 14.67 3.93 14.67 4.67V11.33C14.67 12.07 14.07 12.67 13.33 12.67H2.67C1.93 12.67 1.33 12.07 1.33 11.33V4.67C1.33 3.93 1.93 3.33 2.67 3.33Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M14.67 4.67L8 8.67L1.33 4.67"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  // Dropdown icon component
  const DropdownIcon = () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="w-3 h-3 text-gray-500">
      <path
        d="M3 4.5L6 7.5L9 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const resizeOptions = [
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="w-4 h-4">
          <rect x="2" y="5" width="12" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      ),
      text: "16:9 Desktop video, Youtube"
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="w-4 h-4">
          <rect x="5" y="2" width="6" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      ),
      text: "9:16 Instagram story"
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="w-4 h-4">
          <rect x="3" y="3" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      ),
      text: "1:1 Square, instagram post"
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="w-4 h-4">
          <rect x="3" y="3" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" fill="none"/>
        </svg>
      ),
      text: "Custom set a custom size"
    }
  ];

  return (
    <header className="w-full bg-white h-[68px] flex items-center px-6">
      <div className="flex items-center justify-between w-full">
        {/* Left section - Logo and tools */}
        <div className="flex items-center gap-4 lg:gap-6">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/9b71665e2dee95dc0f540b8501037f291f63ef3c?width=96"
              alt="Logo"
              className="w-12 h-6"
            />
          </div>

          {/* Tool icons - hidden on mobile, visible on tablet+ */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            <button className="p-1 hover:bg-gray-100 rounded transition-colors flex items-center justify-center">
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/60296c8d8172d9ab8392adf60a696e5288c8807d?width=40"
                alt="Tool"
                className="w-3 h-3"
              />
            </button>

            <button className="p-1 hover:bg-gray-100 rounded transition-colors flex items-center justify-center">
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/2b3f3c7afc27ca26f9322d487e50a8435d666ff4?width=40"
                alt="Tool"
                className="w-3 h-3"
              />
            </button>

            <div className="w-0.5 h-[18px] bg-gray-300"></div>

            <button className="p-1 hover:bg-gray-100 rounded transition-colors flex items-center justify-center">
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/22e7f5026e7be941193d1729124a7ba85fb26df7?width=46"
                alt="Tool"
                className="w-3 h-3"
              />
            </button>

            <div className="w-0.5 h-[18px] bg-gray-300"></div>

            {/* Resize tool - hidden on smaller screens */}
            <div className="hidden lg:flex items-center relative">
              <button
                ref={resizeButtonRef}
                onClick={handleResizeClick}
                className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/8574a9b72f54dd9d3d4b47f6ff7ae4fd1526bd0a?width=44"
                  alt="Resize"
                  className="w-3 h-3"
                />
                <span className="text-editor-resize-text text-xs font-normal">Resize</span>
              </button>

              {/* Resize popup */}
              {isResizePopupOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-64 py-2">
                  {resizeOptions.map((option, index) => (
                    <button
                      key={index}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors text-left"
                      onClick={() => {
                        // Handle resize option selection here
                        setIsResizePopupOpen(false);
                      }}
                    >
                      <div className="text-gray-600">
                        {option.icon}
                      </div>
                      <span className="text-sm text-gray-700">{option.text}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="hidden lg:block w-0.5 h-[18px] bg-gray-300"></div>

            {/* Grid tool - hidden on smaller screens */}
            <div className="hidden lg:flex items-center gap-2">
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/2d90825e49d8a04eeafdd5bea6924bcd90f97ef3?width=44"
                alt="Grid"
                className="w-3 h-3"
              />
              <span className="text-editor-icon-text text-xs font-normal">Grid</span>
            </div>

            <div className="hidden lg:block w-0.5 h-[20px] bg-gray-300"></div>

            {/* Upgrade button */}
            <button
              className="bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-[7px] px-3 py-1.5 gap-2 lg:gap-3 flex items-center h-8"
            >
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/e6fe4a219f32df67b6826887f30a0297ba8af2db?width=40"
                alt="Crown"
                className="w-3 h-3"
              />
              <span className="text-xs font-normal">Upgrade</span>
            </button>
          </div>
        </div>

        {/* Center section - Create video text (hidden on mobile) */}
        <div className="hidden lg:flex flex-1 justify-center">
          <div className="flex items-center gap-3">
            <span className="text-editor-gray-text text-xs font-medium whitespace-nowrap">Create your first AI video</span>
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/0dfa92304b25765dd8a203dc550f8d5fac95163b?width=42"
              alt="AI"
              className="w-3 h-3"
            />
          </div>
        </div>

        {/* Right section - Share and Generate buttons */}
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="flex items-center gap-3 lg:gap-4">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/3ff68570baf0004ced57daf86b108cb061230776?width=32"
              alt="Profile"
              className="w-3 h-3"
            />

            <div className="w-0.5 h-[18px] bg-gray-300"></div>

            {/* Share button */}
            <div className="relative">
              <button
                ref={shareButtonRef}
                onClick={handleShareClick}
                className="bg-editor-light-bg border-editor-border text-editor-medium-text hover:bg-gray-50 rounded-[7px] px-3 py-1.5 border flex items-center h-8"
              >
                <span className="text-xs font-normal">Share</span>
              </button>

              {/* Share popup */}
              {isSharePopupOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-80 p-4">
                  {/* Title */}
                  <h3 className="text-xs font-medium text-gray-700 mb-4">Invite team members</h3>
                  
                  {/* Top section */}
                  <div className="space-y-3 mb-4">
                    {emailInputs.map((emailInput) => (
                      <div key={emailInput.id} className="flex items-center gap-2">
                        {/* Email input with envelope icon */}
                        <div className="flex-1 relative">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                            <EnvelopeIcon />
                          </div>
                          <input
                            type="email"
                            value={emailInput.email}
                            onChange={(e) => handleEmailChange(emailInput.id, e.target.value)}
                            placeholder="Work email e.g. john@company.com"
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        
                        {/* Role dropdown */}
                        <div className="relative">
                          <select
                            value={emailInput.role}
                            onChange={(e) => handleRoleChange(emailInput.id, e.target.value as 'viewer' | 'editor' | 'admin')}
                            className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                          >
                            <option value="viewer">Viewer</option>
                            <option value="editor">Editor</option>
                            <option value="admin">Admin</option>
                          </select>
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <DropdownIcon />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Horizontal line */}
                  <div className="border-t border-gray-200 mb-4"></div>
                  
                  {/* Bottom section */}
                  <div className="flex justify-start">
                    <button
                      onClick={addEmailInput}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                    >
                      <span className="text-base">+</span>
                      <span>add another</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Generate button */}
            <button
              className="bg-black text-white hover:bg-gray-800 rounded-[7px] px-3 py-1.5 flex items-center h-8 border"
            >
              <span className="text-xs font-normal">Generate</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}