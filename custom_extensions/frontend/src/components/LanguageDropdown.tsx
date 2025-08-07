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
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 36 36"
    className={className}
  >
    <path
      fill="#B22334"
      d="M35.445 7C34.752 5.809 33.477 5 32 5H18v2h17.445zM0 25h36v2H0zm18-8h18v2H18zm0-4h18v2H18zM0 21h36v2H0zm4 10h28c1.477 0 2.752-.809 3.445-2H.555c.693 1.191 1.968 2 3.445 2zM18 9h18v2H18z"
    />
    <path
      fill="#EEE"
      d="M.068 27.679c.017.093.036.186.059.277c.026.101.058.198.092.296c.089.259.197.509.333.743L.555 29h34.89l.002-.004a4.22 4.22 0 0 0 .332-.741a3.75 3.75 0 0 0 .152-.576c.041-.22.069-.446.069-.679H0c0 .233.028.458.068.679zM0 23h36v2H0zm0-4v2h36v-2H18zm18-4h18v2H18zm0-4h18v2H18zM0 9zm.555-2l-.003.005L.555 7zM.128 8.044c.025-.102.06-.199.092-.297a3.78 3.78 0 0 0-.092.297zM18 9h18c0-.233-.028-.459-.069-.68a3.606 3.606 0 0 0-.153-.576A4.21 4.21 0 0 0 35.445 7H18v2z"
    />
    <path fill="#3C3B6E" d="M18 5H4a4 4 0 0 0-4 4v10h18V5z" />
    <path
      fill="#FFF"
      d="m2.001 7.726l.618.449l-.236.725L3 8.452l.618.448l-.236-.725L4 7.726h-.764L3 7l-.235.726zm2 2l.618.449l-.236.725l.617-.448l.618.448l-.236-.725L6 9.726h-.764L5 9l-.235.726zm4 0l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L9 9l-.235.726zm4 0l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L13 9l-.235.726zm-8 4l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L5 13l-.235.726zm4 0l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L9 13l-.235.726zm4 0l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L13 13l-.235.726zm-6-6l.618.449l-.236.725L7 8.452l.618.448l-.236-.725L8 7.726h-.764L7 7l-.235.726zm4 0l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L11 7l-.235.726zm4 0l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L15 7l-.235.726zm-12 4l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L3 11l-.235.726zM6.383 12.9L7 12.452l.618.448l-.236-.725l.618-.449h-.764L7 11l-.235.726h-.764l.618.449zm3.618-1.174l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L11 11l-.235.726zm4 0l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L15 11l-.235.726zm-12 4l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L3 15l-.235.726zM6.383 16.9L7 16.452l.618.448l-.236-.725l.618-.449h-.764L7 15l-.235.726h-.764l.618.449zm3.618-1.174l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L11 15l-.235.726zm4 0l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L15 15l-.235.726z"
    />
  </svg>
);

const UkraineFlag: React.FC<{ className?: string }> = ({
  className = "w-5 h-4",
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 36 36"
    className={className}
  >
    <path fill="#005BBB" d="M32 5H4a4 4 0 0 0-4 4v9h36V9a4 4 0 0 0-4-4z" />
    <path fill="#FFD500" d="M36 27a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4v-9h36v9z" />
  </svg>
);

const SpainFlag: React.FC<{ className?: string }> = ({
  className = "w-5 h-4",
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 36 36"
    className={className}
  >
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
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 36 36"
    className={className}
  >
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
        className="w-40 flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
