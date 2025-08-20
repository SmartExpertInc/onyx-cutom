'use client';

import { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, Play, Undo2, Redo2, Gem } from 'lucide-react';

interface EmailInput {
  id: string;
  email: string;
  role: 'viewer' | 'editor' | 'admin';
}

export default function VideoEditorHeader() {
  const [isResizePopupOpen, setIsResizePopupOpen] = useState(false);
  const [isSharePopupOpen, setIsSharePopupOpen] = useState(false);
  const [isEyeVisible, setIsEyeVisible] = useState(false);
  const [emailInputs, setEmailInputs] = useState<EmailInput[]>([
    { id: '1', email: '', role: 'editor' }
  ]);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
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
          setOpenDropdownId(null); // Close any open dropdown when share popup closes
        }
      }
      
      // Close dropdown when clicking outside
      if (openDropdownId) {
        const dropdownElement = document.getElementById(`dropdown-${openDropdownId}`);
        if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
          setOpenDropdownId(null);
        }
      }
    };

    if (isResizePopupOpen || isSharePopupOpen || openDropdownId) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isResizePopupOpen, isSharePopupOpen, openDropdownId]);

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

  const handleDropdownToggle = (id: string) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const handleRoleSelect = (id: string, role: 'viewer' | 'editor' | 'admin') => {
    handleRoleChange(id, role);
    setOpenDropdownId(null);
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
    <svg width="16" height="16" viewBox="0 0 12 12" fill="none" className="w-4 h-4 text-gray-500">
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
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" className="w-4 h-4 text-gray-600">
      <path fill="currentColor" fillRule="evenodd" d="M9.929 3.132a2.078 2.078 0 1 1 2.94 2.94l-.65.648a.75.75 0 0 0 1.061 1.06l.649-.648a3.579 3.579 0 0 0-5.06-5.06L6.218 4.72a3.578 3.578 0 0 0 0 5.06a.75.75 0 0 0 1.061-1.06a2.078 2.078 0 0 1 0-2.94L9.93 3.132Zm-.15 3.086a.75.75 0 0 0-1.057 1.064c.816.81.818 2.13.004 2.942l-2.654 2.647a2.08 2.08 0 0 1-2.94-2.944l.647-.647a.75.75 0 0 0-1.06-1.06l-.648.647a3.58 3.58 0 0 0 5.06 5.066l2.654-2.647a3.575 3.575 0 0 0-.007-5.068Z" clipRule="evenodd"/>
    </svg>
  );

  // Plus icon component
  const PlusIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-current">
      <path
        d="M8 3v10M3 8h10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  // Garbage bin icon component
  const GarbageIcon = () => (
    <svg width="20" height="20" viewBox="0 0 16 16" fill="none" className="w-5 h-5 text-black">
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
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="w-5 h-5 text-gray-500">
          <rect x="2" y="5" width="12" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      ),
      ratio: "16:9",
      description: "Desktop video, Youtube"
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="w-5 h-5 text-gray-500">
          <rect x="5" y="2" width="6" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      ),
      ratio: "9:16",
      description: "Instagram story"
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="w-5 h-5 text-gray-500">
          <rect x="3" y="3" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      ),
      ratio: "1:1",
      description: "Square, instagram post"
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="w-5 h-5 text-gray-500">
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
          <div className="flex-shrink-0 overflow-visible">

            <svg
              width="24"
              height="24"
              viewBox="0 0 278 249"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              preserveAspectRatio="xMidYMid meet"
            >
              <path d="M139 13 C147.16184686 19.98231085 151.81195791 28.920144 153 39.5625 C153.37326734 49.13171717 150.42707335 55.9326699 145.3046875 63.87109375 C140.86443818 71.11641075 143.24787943 79.5359105 145.03125 87.296875 C147.42218866 96.43643086 150.82735186 104.98226803 155 113.4375 C155.3199292 114.0876709 155.6398584 114.7378418 155.96948242 115.40771484 C156.93403454 117.30178869 157.94595175 119.15431505 159 121 C159.3614209 121.64090576 159.7228418 122.28181152 160.09521484 122.94213867 C162.6571086 127.02598631 164.70673142 128.77588475 169.57104492 129.98608398 C170.2488501 130.13505127 170.92665527 130.28401855 171.625 130.4375 C180.56248009 132.81067141 188.22040747 136.82944149 193.6875 144.5625 C195.83495969 147.39555525 195.83495969 147.39555525 199.4375 147.125 C200.9704413 146.80305279 202.48999676 146.41647239 204 146 C205.19753906 145.67644531 206.39507812 145.35289062 207.62890625 145.01953125 C211.10013764 144.05961831 214.55220047 143.04111924 218 142 C218.14695313 141.09378906 218.29390625 140.18757812 218.4453125 139.25390625 C220.74464537 126.76615016 225.45298695 118.35799493 236 111 C243.9828076 106.80163452 252.06887923 105.55575992 260.85546875 107.6953125 C271.29525773 111.12244323 278.79731349 117.15279628 284 126.8671875 C287.52098114 135.02638417 288.0414951 144.25632828 285.07421875 152.62109375 C280.60706905 162.5137998 274.10136922 169.1777273 264.0546875 173.25390625 C255.27609112 176.44157148 246.55833977 175.43209871 238 172 C234.6875 170.0625 234.6875 170.0625 232 168 C231.113125 167.34 230.22625 166.68 229.3125 166 C227.16186404 164.13999052 225.59071215 162.34420738 224 160 C216.16008251 160.47039505 209.27928865 163.22937188 202 166 C201.89042969 166.78503906 201.78085938 167.57007813 201.66796875 168.37890625 C200.21411871 178.01214029 200.21411871 178.01214029 198.3125 181.9375 C196.83450214 185.38616167 196.66972743 186.54129132 198 190 C200.85021864 195.10664172 204.7378196 199.32626713 208.734375 203.57421875 C211 206 211 206 212.578125 208.08203125 C214.35695975 210.15577808 215.3970635 211.10538106 218 212 C221.3948995 211.64322291 224.56114101 211.03024568 227.87524414 210.24902344 C236.13499985 208.34064603 243.59212269 209.51842545 251.03125 213.6953125 C259.96722417 219.6171684 265.37681035 226.71200817 268.63671875 237.01171875 C270.53260855 247.38814787 268.15893448 256.1334074 263.25 265.25 C257.09364606 272.7744326 249.67080956 278.11516098 240 280 C228.53851624 280.89063759 219.12229442 279.77986089 210.125 272.25 C201.69397608 264.12062273 198.85417854 255.58349955 198.02734375 244.0078125 C197.98286974 239.11567122 198.6338079 234.32862984 201.13671875 230.0625 C202.32066654 227.23388265 201.96594418 225.89783255 201 223 C196.09664679 214.90220711 188.82833904 205.00352463 179.390625 202.234375 C176.66141241 201.96680514 174.77851997 202.69262929 172.19921875 203.50390625 C163.74619078 205.41071718 155.9347195 204.15780234 148.046875 200.875 C140.08569053 198.58871113 134.04304781 200.23570434 126.8125 203.875 C125.98878906 204.27847656 125.16507812 204.68195313 124.31640625 205.09765625 C117.22860581 208.67457417 110.81076851 212.87957669 104.57128906 217.77246094 C103.01209375 218.99055199 101.4239738 220.17131824 99.8359375 221.3515625 C94.43912979 225.49528557 89.65395121 229.17453937 88 236 C87.67412399 239.25040431 87.49392177 242.49183707 87.32421875 245.75390625 C86.3384475 255.62349553 80.83200802 264.05393198 73.3125 270.3125 C65.6801357 275.63774277 56.12792106 277.14905937 47 276 C37.00004855 273.57867113 29.11606004 268.60710203 23.25390625 260.109375 C18.0316381 251.32425101 17.53530744 241.089112 19.5859375 231.1640625 C22.66758299 222.2018458 29.81619269 214.50040588 38.03515625 209.89453125 C46.89006491 205.86317124 55.81852018 206.34875874 65 209 C65.804375 209.391875 66.60875 209.78375 67.4375 210.1875 C73.15460336 212.00024009 79.35430243 210.55770977 84.67578125 208.06640625 C86.23256977 207.25288217 87.77807243 206.4174526 89.3125 205.5625 C90.13355225 205.11656494 90.95460449 204.67062988 91.80053711 204.21118164 C99.13458906 200.12491328 105.60331679 195.43196604 112 190 C113.423125 188.83791016 113.423125 188.83791016 114.875 187.65234375 C124.31624742 179.65198438 126.05971035 173.85866679 127.44921875 161.69140625 C128.43913493 155.05686166 130.65233214 149.70758841 134.75 144.4375 C139.21946985 137.39808498 138.04624588 128.02426999 136.41992188 120.21435547 C133.30478035 107.58614892 128.74346069 96.11205044 122 85 C121.20335938 83.61554688 121.20335938 83.61554688 120.390625 82.203125 C117.58786518 77.76279764 113.67558315 76.87411972 108.8125 75.6875 C99.78288593 73.3388268 92.23747196 68.83158033 87 61 C81.9105509 52.27756793 80.52502145 43.84390048 82.68359375 33.828125 C85.82310422 23.56283765 91.67009286 15.01094569 101.234375 9.77734375 C113.98898039 3.8066476 127.35762289 5.0771789 139 13 Z" fill="white" stroke="black" stroke-width="3"/>
            </svg>
          </div>

          {/* Tool icons - hidden on mobile, visible on tablet+ */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            <button className="p-1 hover:bg-gray-100 rounded transition-colors flex items-center justify-center cursor-pointer">
              <Undo2 className="w-4 h-4" />
            </button>

            <button className="p-1 hover:bg-gray-100 rounded transition-colors flex items-center justify-center cursor-pointer">
              <Redo2 className="w-4 h-4" />
            </button>

            <div className="w-0.5 h-[18px] bg-gray-300"></div>

            {/* New button with document SVG - hidden on smaller screens */}
            <div className="hidden lg:flex items-center">
              <button className="p-1 hover:bg-gray-100 rounded transition-colors flex items-center justify-center cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 28 28" className="w-4 h-4">
                  <path fill="currentColor" d="M6.25 4.5A1.75 1.75 0 0 0 4.5 6.25v15.5A1.75 1.75 0 0 0 6 23.482V16.25A2.25 2.25 0 0 1 8.25 14h11.5A2.25 2.25 0 0 1 22 16.25v7.232a1.75 1.75 0 0 0 1.5-1.732V8.786c0-.465-.184-.91-.513-1.238l-2.535-2.535a1.75 1.75 0 0 0-1.238-.513H19v4.25A2.25 2.25 0 0 1 16.75 11h-6.5A2.25 2.25 0 0 1 8 8.75V4.5H6.25Zm3.25 0v4.25c0 .414.336.75.75.75h6.5a.75.75 0 0 0 .75-.75V4.5h-8Zm11 19v-7.25a.75.75 0 0 0-.75-.75H8.25a.75.75 0 0 0-.75.75v7.25h13ZM3 6.25A3.25 3.25 0 0 1 6.25 3h12.965a3.25 3.25 0 0 1 2.298.952l2.535 2.535c.61.61.952 1.437.952 2.299V21.75A3.25 3.25 0 0 1 21.75 25H6.25A3.25 3.25 0 0 1 3 21.75V6.25Z"/>
                </svg>
              </button>
            </div>

            <div className="hidden lg:block w-0.5 h-[18px] bg-gray-300"></div>

            {/* Resize tool - hidden on smaller screens */}
            <div className="hidden lg:flex items-center relative">
              <button
                ref={resizeButtonRef}
                onClick={handleResizeClick}
                className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className="w-4 h-4">
                  <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12c0-4.243 0-6.364 1.318-7.682C5.636 3 7.758 3 12 3c4.243 0 6.364 0 7.682 1.318C21 5.636 21 7.758 21 12c0 4.243 0 6.364-1.318 7.682C18.364 21 16.242 21 12 21c-4.243 0-6.364 0-7.682-1.318C3 18.364 3 16.242 3 12Z"/>
                </svg>
                <span className="text-editor-resize-text text-sm font-normal">Resize</span>
              </button>

              {/* Resize popup */}
              {isResizePopupOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg z-50 w-80">
                  <div className="py-2">
                    {resizeOptions.map((option, index) => (
                      <button
                        key={index}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors text-left cursor-pointer"
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
                  
                  {/* Warning text - extends to side borders with bottom spacing */}
                  <div className="pb-3">
                    <div className="bg-amber-50 text-amber-800 text-sm p-3 mx-0">
                      Existing content on the scene will not be reorganised automatically.
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="hidden lg:block w-0.5 h-[18px] bg-gray-300"></div>

            {/* Grid tool - hidden on smaller screens */}
            <div className="hidden lg:flex items-center">
              <button 
                onClick={handleEyeToggle}
                className="p-1 hover:bg-gray-100 rounded transition-colors flex items-center justify-center cursor-pointer gap-2"
              >
                {isEyeVisible ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
                <span className="text-editor-icon-text text-sm font-normal">Grid</span>
              </button>
            </div>

            <div className="hidden lg:block w-0.5 h-[20px] bg-gray-300"></div>

            {/* Upgrade button */}
            <button
              className="bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-[7px] px-3 py-1.5 gap-2 lg:gap-3 flex items-center h-8 cursor-pointer"
            >
              <Gem className="w-4 h-4 text-purple-700" />
              <span className="text-sm font-normal">Upgrade</span>
            </button>
          </div>
        </div>

        {/* Center section - Create video text (hidden on mobile) */}
        <div className="hidden lg:flex flex-1 justify-center">
          <div className="flex items-center gap-3">
            <span className="text-editor-gray-text text-sm font-medium whitespace-nowrap">Create your first AI video</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className="w-4 h-4">
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
            <button className="bg-editor-light-bg border-gray-300 text-editor-medium-text hover:bg-gray-50 rounded-[7px] px-3 py-1.5 border flex items-center h-8 cursor-pointer">
              <Play className="w-4 h-4" />
            </button>

            <div className="w-0.5 h-[18px] bg-gray-300"></div>

            {/* Share button */}
            <div className="relative">
              <button
                ref={shareButtonRef}
                onClick={handleShareClick}
                className="bg-editor-light-bg border-gray-300 text-editor-medium-text hover:bg-gray-50 rounded-[7px] px-3 py-1.5 border flex items-center h-8 cursor-pointer"
              >
                <span className="text-sm font-normal">Share</span>
              </button>

              {/* Share popup */}
              {isSharePopupOpen && (
                <div 
                  ref={sharePopupRef}
                  className="fixed top-[76px] right-4 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-[480px] p-4"
                >
                  {/* Title */}
                  <h3 className="text-sm font-medium text-gray-700 mb-4">Invite team members</h3>
                  
                  {/* Content wrapper with grey rounded borders */}
                  <div className="border border-gray-200 rounded-lg p-4">
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
                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-black focus:border-[2px]"
                          />
                        </div>
                        
                        {/* Role dropdown */}
                        <div className="relative" id={`dropdown-${emailInput.id}`}>
                          <button
                            type="button"
                            onClick={() => handleDropdownToggle(emailInput.id)}
                            className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-3 pr-2 text-sm focus:outline-none focus:border-black focus:border-[2px] cursor-pointer w-24 text-left flex items-center justify-between"
                          >
                            <span className="capitalize">{emailInput.role}</span>
                            <DropdownIcon />
                          </button>
                          
                          {/* Custom dropdown menu */}
                          {openDropdownId === emailInput.id && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                              {(['viewer', 'editor', 'admin'] as const).map((role) => (
                                <button
                                  key={role}
                                  type="button"
                                  onClick={() => handleRoleSelect(emailInput.id, role)}
                                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors capitalize cursor-pointer ${
                                    emailInput.role === role ? 'bg-gray-50 text-black' : 'text-gray-700'
                                  } ${role === 'viewer' ? 'rounded-t-md' : role === 'admin' ? 'rounded-b-md' : ''}`}
                                >
                                  {role}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Delete button or placeholder space */}
                        {emailInput.id === '1' ? (
                          emailInputs.length > 1 ? (
                            <div className="w-10 h-10 flex items-center justify-center">
                              {/* Empty placeholder to maintain consistent spacing when multiple inputs exist */}
                            </div>
                          ) : null
                        ) : (
                          <button
                            onClick={() => deleteEmailInput(emailInput.id)}
                            className="w-10 h-10 p-2 hover:bg-gray-200 rounded-full transition-colors flex items-center justify-center cursor-pointer"
                            title="Delete this email input"
                          >
                            <GarbageIcon />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  
                   
                   {/* Horizontal line */}
                   <div className="border-t border-gray-200 mb-4 -mx-4"></div>
                   
                                      {/* Bottom section */}
                   <div className="flex justify-between items-center">
                     <button
                       onClick={addEmailInput}
                       className="text-black hover:text-gray-800 text-sm font-medium flex items-center gap-1 border border-gray-300 hover:border-gray-400 rounded px-3 py-2 transition-colors cursor-pointer"
                     >
                       <PlusIcon />
                       <span>Add another</span>
                     </button>
                     
                     {/* Right side container with link and invite buttons */}
                     <div className="flex items-center gap-2">
                       <button className="p-2 hover:bg-gray-100 rounded transition-colors cursor-pointer">
                         <LinkIcon />
                       </button>
                       <button className="bg-black text-white hover:bg-gray-800 rounded px-4 py-2 text-sm font-medium transition-colors cursor-pointer">
                         Invite
                       </button>
                     </div>
                   </div>
                  </div>
                </div>
              )}
            </div>

            {/* Generate button */}
            <button
              className="bg-black text-white hover:bg-gray-800 rounded-[7px] px-3 py-1.5 flex items-center h-8 border cursor-pointer"
            >
              <span className="text-sm font-normal">Generate</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}