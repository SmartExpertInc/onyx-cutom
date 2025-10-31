"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogOverlay } from '@/components/ui/dialog';
import { X, Copy, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ContactSalesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Country {
  code: string;
  dialCode: string;
  name: string;
  flag: React.ReactNode;
}

const USFlag = () => (
  <svg width="20" height="15" viewBox="0 0 20 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="20" height="15" rx="2" fill="#B22234"/>
    <path d="M0 1.5h20M0 3h20M0 4.5h20M0 6h20M0 7.5h20M0 9h20M0 10.5h20M0 12h20M0 13.5h20" stroke="white" strokeWidth="1"/>
    <rect width="8" height="6.5" rx="1" fill="#3C3B6E"/>
  </svg>
);

const UAFlag = () => (
  <svg width="20" height="15" viewBox="0 0 20 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="20" height="7.5" rx="1" fill="#0057B7"/>
    <rect y="7.5" width="20" height="7.5" fill="#FFD700"/>
  </svg>
);

const ESFlag = () => (
  <svg width="20" height="15" viewBox="0 0 20 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="20" height="15" rx="2" fill="#C60B1E"/>
    <rect y="3.75" width="20" height="7.5" fill="#FFC400"/>
  </svg>
);

const ContactSalesModal: React.FC<ContactSalesModalProps> = ({ open, onOpenChange }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    fullName: '',
    workEmail: '',
    companyName: '',
    teamSize: '',
    companyWebsite: '',
    phoneCountry: '+1',
    phoneNumber: '',
    useCase: '',
  });
  const [copied, setCopied] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const countries: Country[] = [
    { code: 'US', dialCode: '+1', name: 'United States', flag: <USFlag /> },
    { code: 'UA', dialCode: '+380', name: 'Ukraine', flag: <UAFlag /> },
    { code: 'ES', dialCode: '+34', name: 'Spain', flag: <ESFlag /> },
  ];

  const selectedCountry = countries.find(c => c.dialCode === formData.phoneCountry) || countries[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
    };

    if (showCountryDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCountryDropdown]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('contact@contentbuilder.ai');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission
    console.log('Form submitted:', formData);
  };

  const teamSizes = [
    '1-10',
    '11-50',
    '51-200',
    '201-500',
    '501-1000',
    '1000+',
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay className="bg-black/20 backdrop-blur-sm" />
      <DialogContent className="sm:max-w-[1100px] max-w-[95vw] rounded-2xl p-0 max-h-[95vh] bg-white/90 backdrop-blur-sm my-auto" hideCloseIcon>
        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-10 p-1 bg-white hover:bg-gray-100 rounded-full shadow-xl transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="px-8 py-13">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Section - Textual Information */}
            <div className="flex flex-col">
              <h2 className="text-[40px] font-bold text-[#171718] mb-4 leading-tight">
                Let's find the <span className="text-[#0F58F9]">right Enterprise plan</span> for your team
              </h2>
              
              <p className="text-[#878787] text-base leading-relaxed mb-6">
                Tell us a bit about your company and needs — our team will get in touch to customize the right ContentBuilder setup, integrations, and pricing for your workflow.
              </p>

              {/* Contact Email */}
              <div className="flex items-center gap-2 border border-[#E6E6E6] rounded-full px-4 py-1.5 w-fit">
                <span className="text-[#4D4D4D] text-sm">contact@contentbuilder.ai</span>
                <button
                  onClick={handleCopyEmail}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  aria-label="Copy email"
                >
                  <Copy className={`w-4 h-4 ${copied ? 'text-[#0F58F9]' : 'text-gray-500'}`} />
                </button>
              </div>
            </div>

            {/* Right Section - Form */}
            <div className="flex flex-col">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name and Work Email */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Full name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-sm text-sm text-[#171718] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F58F9] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      name="workEmail"
                      placeholder="Work email"
                      value={formData.workEmail}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-sm text-sm text-[#171718] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F58F9] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Company Name and Team Size */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      name="companyName"
                      placeholder="Company name"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-sm text-sm text-[#171718] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F58F9] focus:border-transparent"
                    />
                  </div>
                  <div className="relative">
                    <select
                      name="teamSize"
                      value={formData.teamSize}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-sm text-sm text-[#878787] appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-[#0F58F9] focus:border-transparent"
                    >
                      <option className="text-gray-400" value="" disabled hidden>Team size</option>
                      {teamSizes.map((size) => (
                        <option className="text-gray-600" key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Company Website */}
                <div>
                  <input
                    type="url"
                    name="companyWebsite"
                    placeholder="Company website"
                    value={formData.companyWebsite}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-sm text-sm text-[#171718] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F58F9] focus:border-transparent"
                  />
                </div>

                {/* Phone Number with integrated country selector */}
                <div className="relative" ref={dropdownRef}>
                  <div className="flex items-center border border-gray-200 rounded-sm overflow-hidden focus-within:ring-2 focus-within:ring-[#0F58F9] focus-within:border-transparent">
                    {/* Country Selector inside input */}
                    <button
                      type="button"
                      onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                      className="flex items-center gap-2 px-3 py-2.5 bg-white hover:bg-gray-50 transition-colors"
                    >
                      {selectedCountry.flag}
                      <span className="text-sm text-[#878787] font-medium">{selectedCountry.dialCode}</span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                    
                    {/* Phone number input */}
                    <input
                      type="tel"
                      name="phoneNumber"
                      placeholder="Phone number"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="flex-1 px-4 py-2.5 text-sm text-[#171718] placeholder:text-gray-400 focus:outline-none bg-white"
                    />
                  </div>

                  {/* Country Dropdown */}
                  {showCountryDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                      {countries.map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, phoneCountry: country.dialCode }));
                            setShowCountryDropdown(false);
                          }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                        >
                          {country.flag}
                          <span className="text-sm text-[#171718]">{country.name}</span>
                          <span className="text-sm text-gray-500 ml-auto">{country.dialCode}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Use Case */}
                <div>
                  <textarea
                    name="useCase"
                    placeholder="How do you plan to use ContentBuilder?"
                    value={formData.useCase}
                    onChange={handleInputChange}
                    rows={1}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-sm text-sm text-[#171718] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F58F9] focus:border-transparent resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3 bg-[#0F58F9] text-white rounded-md font-medium text-sm hover:bg-[#0E4FD9] transition-colors"
                >
                  Talk to sales
                </button>

                {/* Privacy Notice */}
                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  By submitting my personal data, I consent to ContentBuilder collecting, processing, and storing my information in accordance with the{' '}
                  <a href="#" className="text-[#0F58F9] underline">
                    ContentBuilder Privacy Notice
                  </a>
                  .
                </p>
              </form>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactSalesModal;

