"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogOverlay } from '@/components/ui/dialog';
import { X, Copy, ChevronDown, Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ContactSalesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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
      <DialogContent className="sm:max-w-[900px] max-w-[95vw] rounded-2xl p-0 max-h-[95vh] bg-white" hideCloseIcon>
        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Section - Textual Information */}
            <div className="flex flex-col">
              <h2 className="text-3xl font-bold text-[#171718] mb-4 leading-tight">
                Let's find the <span className="text-[#0F58F9]">right Enterprise plan</span> for your team
              </h2>
              
              <p className="text-[#4D4D4D] text-base leading-relaxed mb-6">
                Tell us a bit about your company and needs — our team will get in touch to customize the right ContentBuilder setup, integrations, and pricing for your workflow.
              </p>

              {/* Contact Email */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2.5 w-fit">
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
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-[#171718] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F58F9] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      name="workEmail"
                      placeholder="Work email"
                      value={formData.workEmail}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-[#171718] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F58F9] focus:border-transparent"
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
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-[#171718] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F58F9] focus:border-transparent"
                    />
                  </div>
                  <div className="relative">
                    <select
                      name="teamSize"
                      value={formData.teamSize}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-[#171718] appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-[#0F58F9] focus:border-transparent"
                    >
                      <option value="" disabled hidden>Team size</option>
                      {teamSizes.map((size) => (
                        <option key={size} value={size}>
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
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-[#171718] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F58F9] focus:border-transparent"
                  />
                </div>

                {/* Phone Number */}
                <div className="flex gap-2">
                  <div className="relative flex items-center border border-gray-200 rounded-lg px-3 bg-white">
                    <Globe className="w-4 h-4 text-gray-400 mr-1" />
                    <span className="text-sm text-[#171718]">{formData.phoneCountry}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
                  </div>
                  <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="Phone number"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-[#171718] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F58F9] focus:border-transparent"
                  />
                </div>

                {/* Use Case */}
                <div>
                  <textarea
                    name="useCase"
                    placeholder="How do you plan to use ContentBuilder?"
                    value={formData.useCase}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-[#171718] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F58F9] focus:border-transparent resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3 bg-[#0F58F9] text-white rounded-lg font-semibold text-sm hover:bg-[#0E4FD9] transition-colors"
                >
                  Talk to sales
                </button>

                {/* Privacy Notice */}
                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  By submitting my personal data, I consent to ContentBuilder collecting, processing, and storing my information in accordance with the{' '}
                  <a href="#" className="text-[#0F58F9] hover:underline">
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

