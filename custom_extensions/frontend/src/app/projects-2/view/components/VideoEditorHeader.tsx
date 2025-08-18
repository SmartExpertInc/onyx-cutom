'use client';

import { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, Play } from 'lucide-react';

interface EmailInput {
  id: string;
  email: string;
  role: 'viewer' | 'editor' | 'admin';
}

export default function VideoEditorHeader() {
  const [isResizePopupOpen, setIsResizePopupOpen] = useState(false);
  const [isSharePopupOpen, setIsSharePopupOpen] = useState(false);
  const [isEyeVisible, setIsEyeVisible] = useState(true);
  const [emailInputs, setEmailInputs] = useState<EmailInput[]>([
    { id: '1', email: '', role: 'editor' }
  ]);
  const resizeButtonRef = useRef<HTMLButtonElement>(null);
  const shareButtonRef = useRef<HTMLButtonElement>(null);
  const sharePopupRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resizeButtonRef.current && !resizeButtonRef.current.contains(event.target as Node)) {
        setIsResizePopupOpen(false);
      }
      
      // For share popup, check if click is outside both button and popup
      if (isSharePopupOpen) {
        const isClickInButton = shareButtonRef.current?.contains(event.target as Node);
        const isClickInPopup = sharePopupRef.current?.contains(event.target as Node);
        
        if (!isClickInButton && !isClickInPopup) {
          setIsSharePopupOpen(false);
        }
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

  const handleEyeToggle = () => {
    setIsEyeVisible(!isEyeVisible);
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

  const deleteEmailInput = (id: string) => {
    // Don't allow deleting the first input
    if (id === '1') return;
    setEmailInputs(prev => prev.filter(input => input.id !== id));
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

  // Link icon component
  const LinkIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-gray-600">
      <path
        d="M6.5 9.5C6.83333 9.83333 7.16667 10 7.5 10H8.5C9.5 10 10.5 9 10.5 8C10.5 7 9.5 6 8.5 6H7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 6.5C9.16667 6.16667 8.83333 6 8.5 6H7.5C6.5 6 5.5 7 5.5 8C5.5 9 6.5 10 7.5 10H8.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  // Garbage bin icon component
  const GarbageIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-gray-400 hover:text-red-500">
      <path
        d="M2 4h12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.33 4V2.67a1.33 1.33 0 0 1 1.34-1.34h2.66a1.33 1.33 0 0 1 1.34 1.34V4M12.67 4v9.33a1.33 1.33 0 0 1-1.34 1.34H4.67a1.33 1.33 0 0 1-1.34-1.34V4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.67 7.33v4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.33 7.33v4"
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
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-gray-500">
          <rect x="2" y="5" width="12" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      ),
      ratio: "16:9",
      description: "Desktop video, Youtube"
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-gray-500">
          <rect x="5" y="2" width="6" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      ),
      ratio: "9:16",
      description: "Instagram story"
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-gray-500">
          <rect x="3" y="3" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      ),
      ratio: "1:1",
      description: "Square, instagram post"
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-gray-500">
          <rect x="3" y="3" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" fill="none"/>
        </svg>
      ),
      ratio: "Custom",
      description: "set a custom size"
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
              className="h-8 w-auto object-contain"
            />
          </div>

          {/* Tool icons - hidden on mobile, visible on tablet+ */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            <button className="p-1 hover:bg-gray-100 rounded transition-colors flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" className="w-3 h-3">
                <path fill="none" stroke="currentColor" strokeWidth="2" d="M8 3L3 8l5 5m4 7h3a6 6 0 1 0 0-12H4"/>
              </svg>
            </button>

            <button className="p-1 hover:bg-gray-100 rounded transition-colors flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" className="w-3 h-3 rotate-180">
                <path fill="none" stroke="currentColor" strokeWidth="2" d="M8 3L3 8l5 5m4 7h3a6 6 0 1 0 0-12H4"/>
              </svg>
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
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-64">
                  <div className="py-2">
                    {resizeOptions.map((option, index) => (
                      <button
                        key={index}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors text-left"
                        onClick={() => {
                          // Handle resize option selection here
                          setIsResizePopupOpen(false);
                        }}
                      >
                        <div>
                          {option.icon}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm text-black">{option.ratio}</span>
                          <span className="text-sm text-gray-500">{option.description}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {/* Warning text */}
                  <div className="px-4 pb-3">
                    <div className="bg-amber-50 text-amber-800 text-xs p-3 rounded-md">
                      Existing content on the scene will not be reorganised automatically.
                    </div>
                  </div>
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
              <button 
                onClick={handleEyeToggle}
                className="p-1 hover:bg-gray-100 rounded transition-colors flex items-center justify-center ml-2"
              >
                {isEyeVisible ? (
                  <Eye className="w-3 h-3" />
                ) : (
                  <EyeOff className="w-3 h-3" />
                )}
              </button>
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
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" className="w-3 h-3">
              <g fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" d="M4 22h16"/>
                <path d="m13.888 3.663l.742-.742a3.146 3.146 0 1 1 4.449 4.45l-.742.74m-4.449-4.448s.093 1.576 1.483 2.966c1.39 1.39 2.966 1.483 2.966 1.483m-4.449-4.45L7.071 10.48c-.462.462-.693.692-.891.947a5.24 5.24 0 0 0-.599.969c-.139.291-.242.601-.449 1.22l-.875 2.626m14.08-8.13l-6.817 6.817c-.462.462-.692.692-.947.891c-.3.234-.625.435-.969.599c-.291.139-.601.242-1.22.448l-2.626.876m0 0l-.641.213a.848.848 0 0 1-1.073-1.073l.213-.641m1.501 1.5l-1.5-1.5"/>
              </g>
            </svg>
          </div>
        </div>

        {/* Right section - Share and Generate buttons */}
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="flex items-center gap-3 lg:gap-4">
            <button className="bg-editor-light-bg border-gray-300 text-editor-medium-text hover:bg-gray-50 rounded-[7px] px-3 py-1.5 border flex items-center h-8">
              <Play className="w-3 h-3" />
            </button>

            <div className="w-0.5 h-[18px] bg-gray-300"></div>

            {/* Share button */}
            <div className="relative">
              <button
                ref={shareButtonRef}
                onClick={handleShareClick}
                className="bg-editor-light-bg border-gray-300 text-editor-medium-text hover:bg-gray-50 rounded-[7px] px-3 py-1.5 border flex items-center h-8"
              >
                <span className="text-xs font-normal">Share</span>
              </button>

              {/* Share popup */}
              {isSharePopupOpen && (
                <div 
                  ref={sharePopupRef}
                  className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-96 p-4"
                >
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
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-black focus:border-[3px]"
                          />
                        </div>
                        
                        {/* Role dropdown */}
                        <div className="relative">
                          <select
                            value={emailInput.role}
                            onChange={(e) => handleRoleChange(emailInput.id, e.target.value as 'viewer' | 'editor' | 'admin')}
                            className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:border-black focus:border-[3px] cursor-pointer"
                          >
                            <option value="viewer">Viewer</option>
                            <option value="editor">Editor</option>
                            <option value="admin">Admin</option>
                          </select>
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <DropdownIcon />
                          </div>
                        </div>

                        {/* Delete button - only show for inputs other than the first one */}
                        {emailInput.id !== '1' && (
                          <button
                            onClick={() => deleteEmailInput(emailInput.id)}
                            className="p-2 hover:bg-red-50 rounded transition-colors"
                            title="Delete this email input"
                          >
                            <GarbageIcon />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  
                   
                   {/* Horizontal line */}
                   <div className="border-t border-gray-200 mb-4"></div>
                   
                                      {/* Bottom section */}
                   <div className="flex justify-between items-center">
                     <button
                       onClick={addEmailInput}
                       className="text-black hover:text-gray-800 text-sm font-medium flex items-center gap-1 border border-gray-300 hover:border-gray-400 rounded px-3 py-2 transition-colors"
                     >
                       <span className="text-base">+</span>
                       <span>add another</span>
                     </button>
                     
                     {/* Right side container with link and invite buttons */}
                     <div className="flex items-center gap-2">
                       <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                         <LinkIcon />
                       </button>
                       <button className="bg-black text-white hover:bg-gray-800 rounded px-4 py-2 text-sm font-medium transition-colors">
                         Invite
                       </button>
                     </div>
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