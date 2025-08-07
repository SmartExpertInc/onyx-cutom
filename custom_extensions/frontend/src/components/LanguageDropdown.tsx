"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { useLanguage, Language } from "../contexts/LanguageContext";

interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: React.ComponentType<{ className?: string }>;
}

// Flag Icon Components
const USFlag: React.FC<{ className?: string }> = ({
  className = "w-5 h-4",
}) => (
  <svg viewBox="0 0 36 36" className={className}>
    <rect fill="#bd3d44" rx="2" width="36" height="36" />
    <rect fill="#ffffff" x="0" y="2" width="36" height="2" />
    <rect fill="#ffffff" x="0" y="6" width="36" height="2" />
    <rect fill="#ffffff" x="0" y="10" width="36" height="2" />
    <rect fill="#ffffff" x="0" y="14" width="36" height="2" />
    <rect fill="#ffffff" x="0" y="18" width="36" height="2" />
    <rect fill="#ffffff" x="0" y="22" width="36" height="2" />
    <rect fill="#192f5d" rx="1" x="0" y="0" width="14" height="10" />
    <g fill="#ffffff">
      <path d="M2 2l0.2 0.6h0.6l-0.5 0.4 0.2 0.6-0.5-0.4-0.5 0.4 0.2-0.6-0.5-0.4h0.6z" />
      <path d="M6 2l0.2 0.6h0.6l-0.5 0.4 0.2 0.6-0.5-0.4-0.5 0.4 0.2-0.6-0.5-0.4h0.6z" />
      <path d="M10 2l0.2 0.6h0.6l-0.5 0.4 0.2 0.6-0.5-0.4-0.5 0.4 0.2-0.6-0.5-0.4h0.6z" />
      <path d="M14 2l0.2 0.6h0.6l-0.5 0.4 0.2 0.6-0.5-0.4-0.5 0.4 0.2-0.6-0.5-0.4h0.6z" />
      <path d="M4 4l0.2 0.6h0.6l-0.5 0.4 0.2 0.6-0.5-0.4-0.5 0.4 0.2-0.6-0.5-0.4h0.6z" />
      <path d="M8 4l0.2 0.6h0.6l-0.5 0.4 0.2 0.6-0.5-0.4-0.5 0.4 0.2-0.6-0.5-0.4h0.6z" />
      <path d="M12 4l0.2 0.6h0.6l-0.5 0.4 0.2 0.6-0.5-0.4-0.5 0.4 0.2-0.6-0.5-0.4h0.6z" />
      <path d="M2 6l0.2 0.6h0.6l-0.5 0.4 0.2 0.6-0.5-0.4-0.5 0.4 0.2-0.6-0.5-0.4h0.6z" />
      <path d="M6 6l0.2 0.6h0.6l-0.5 0.4 0.2 0.6-0.5-0.4-0.5 0.4 0.2-0.6-0.5-0.4h0.6z" />
      <path d="M10 6l0.2 0.6h0.6l-0.5 0.4 0.2 0.6-0.5-0.4-0.5 0.4 0.2-0.6-0.5-0.4h0.6z" />
      <path d="M14 6l0.2 0.6h0.6l-0.5 0.4 0.2 0.6-0.5-0.4-0.5 0.4 0.2-0.6-0.5-0.4h0.6z" />
      <path d="M4 8l0.2 0.6h0.6l-0.5 0.4 0.2 0.6-0.5-0.4-0.5 0.4 0.2-0.6-0.5-0.4h0.6z" />
      <path d="M8 8l0.2 0.6h0.6l-0.5 0.4 0.2 0.6-0.5-0.4-0.5 0.4 0.2-0.6-0.5-0.4h0.6z" />
      <path d="M12 8l0.2 0.6h0.6l-0.5 0.4 0.2 0.6-0.5-0.4-0.5 0.4 0.2-0.6-0.5-0.4h0.6z" />
    </g>
  </svg>
);

const UkraineFlag: React.FC<{ className?: string }> = ({
  className = "w-5 h-4",
}) => (
  <svg viewBox="0 0 36 36" className={className}>
    <path fill="#005BBB" d="M32 5H4a4 4 0 0 0-4 4v9h36V9a4 4 0 0 0-4-4z" />
    <path fill="#FFD500" d="M36 27a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4v-9h36v9z" />
  </svg>
);

const SpainFlag: React.FC<{ className?: string }> = ({
  className = "w-5 h-4",
}) => (
  <svg viewBox="0 0 36 36" className={className}>
    <path
      fill="#C60A1D"
      d="M36 27a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V9a4 4 0 0 1 4-4h28a4 4 0 0 1 4 4v18z"
    />
    <path fill="#FFC400" d="M0 12h36v12H0z" />
    <path fill="#EA596E" d="M9 17v3a3 3 0 1 0 6 0v-3H9z" />
    <path fill="#F4A2B2" d="M12 16h3v3h-3z" />
    <path fill="#DD2E44" d="M9 16h3v3H9z" />
    <ellipse cx="12" cy="14.5" fill="#EA596E" rx="3" ry="1.5" />
    <ellipse cx="12" cy="13.75" fill="#FFAC33" rx="3" ry=".75" />
    <path fill="#99AAB5" d="M7 16h1v7H7zm9 0h1v7h-1z" />
    <path fill="#66757F" d="M6 22h3v1H6zm9 0h3v1h-3zm-8-7h1v1H7zm9 0h1v1h-1z" />
  </svg>
);

const RussiaFlag: React.FC<{ className?: string }> = ({
  className = "w-5 h-4",
}) => (
  <svg viewBox="0 0 36 36" className={className}>
    <path fill="#CE2028" d="M36 27a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4v-4h36v4z" />
    <path fill="#22408C" d="M0 13h36v10H0z" />
    <path fill="#EEE" d="M32 5H4a4 4 0 0 0-4 4v4h36V9a4 4 0 0 0-4-4z" />
  </svg>
);

const languageOptions: LanguageOption[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: USFlag,
  },
  {
    code: "uk",
    name: "Ukrainian",
    nativeName: "Українська",
    flag: UkraineFlag,
  },
  {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    flag: SpainFlag,
  },
  {
    code: "ru",
    name: "Russian",
    nativeName: "Русский",
    flag: RussiaFlag,
  },
];

const LanguageDropdown: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languageOptions.find(
    (lang) => lang.code === language
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLanguageSelect = (langCode: Language) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        aria-label="Select language"
      >
        <span className="hidden sm:inline">
          {currentLanguage && <currentLanguage.flag className="w-5 h-4" />}
        </span>
        <span className="hidden md:inline">{currentLanguage?.nativeName}</span>
        <ChevronDown
          size={14}
          className={`text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <div className="py-1">
            {languageOptions.map((option) => {
              const FlagComponent = option.flag;
              return (
                <button
                  key={option.code}
                  onClick={() => handleLanguageSelect(option.code)}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left hover:bg-gray-100 transition-colors ${
                    language === option.code
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700"
                  }`}
                >
                  <FlagComponent className="w-5 h-4" />
                  <div className="flex flex-col">
                    <span className="font-medium">{option.nativeName}</span>
                    {option.nativeName !== option.name && (
                      <span className="text-xs text-gray-500">
                        {option.name}
                      </span>
                    )}
                  </div>
                  {language === option.code && (
                    <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageDropdown;
