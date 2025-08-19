"use client";

import React, { useState } from 'react';
import { Info, Search, Plus, Play, Trash2, ChevronDown } from 'lucide-react';

interface DictionaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// US Flag component
const USFlag = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 36 36">
    <path fill="#B22334" d="M35.445 7C34.752 5.809 33.477 5 32 5H18v2h17.445zM0 25h36v2H0zm18-8h18v2H18zm0-4h18v2H18zM0 21h36v2H0zm4 10h28c1.477 0 2.752-.809 3.445-2H.555c.693 1.191 1.968 2 3.445 2zM18 9h18v2H18z"/>
    <path fill="#EEE" d="M.068 27.679c.017.093.036.186.059.277c.026.101.058.198.092.296c.089.259.197.509.333.743L.555 29h34.89l.002-.004a4.22 4.22 0 0 0 .332-.741a3.75 3.75 0 0 0 .152-.576c.041-.22.069-.446.069-.679H0c0 .233.028.458.068.679zM0 23h36v2H0zm0-4v2h36v-2H18zm18-4h18v2H18zm0-4h18v2H18zM0 9zm.555-2l-.003.005L.555 7zM.128 8.044c.025-.102.06-.199.092-.297a3.78 3.78 0 0 0-.092.297zM18 9h18c0-.233-.028-.459-.069-.68a3.606 3.606 0 0 0-.153-.576A4.21 4.21 0 0 0 35.445 7H18v2z"/>
    <path fill="#3C3B6E" d="M18 5H4a4 4 0 0 0-4 4v10h18V5z"/>
    <path fill="#FFF" d="m2.001 7.726l.618.449l-.236.725L3 8.452l.618.448l-.236-.725L4 7.726h-.764L3 7l-.235.726zm2 2l.618.449l-.236.725l.617-.448l.618.448l-.236-.725L6 9.726h-.764L5 9l-.235.726zm4 0l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L9 9l-.235.726zm4 0l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L13 9l-.235.726zm-8 4l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L5 13l-.235.726zm4 0l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L9 13l-.235.726zm4 0l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L13 13l-.235.726zm-6-6l.618.449l-.236.725L7 8.452l.618.448l-.236-.725L8 7.726h-.764L7 7l-.235.726zm4 0l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L11 7l-.235.726zm4 0l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L15 7l-.235.726zm-12 4l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L3 11l-.235.726zM6.383 12.9L7 12.452l.618.448l-.236-.725l.618-.449h-.764L7 11l-.235.726h-.764l.618.449zm3.618-1.174l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L11 11l-.235.726zm4 0l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L15 11l-.235.726zm-12 4l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L3 15l-.235.726zM6.383 16.9L7 16.452l.618.448l-.236-.725l.618-.449h-.764L7 15l-.235.726h-.764l.618.449zm3.618-1.174l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L11 15l-.235.726zm4 0l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L15 15l-.235.726z"/>
  </svg>
);

// Australian Flag component
const AustralianFlag = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 36 36">
    <path fill="#00247D" d="M32 5H4c-.205 0-.407.015-.604.045l-.004 1.754l-2.73-.004A3.984 3.984 0 0 0 0 9v18a4 4 0 0 0 4 4h28a4 4 0 0 0 4-4V9a4 4 0 0 0-4-4z"/>
    <path fill="#FFF" d="m9 26.023l-1.222 1.129l.121-1.66l-1.645-.251l1.373-.94l-.829-1.443l1.591.488L9 21.797l.612 1.549l1.591-.488l-.83 1.443l1.374.94l-1.645.251l.121 1.66zM27.95 9.562l-.799.738l.079-1.086l-1.077-.164l.899-.615l-.542-.944l1.04.319l.4-1.013l.401 1.013l1.041-.319l-.543.944l.898.615l-1.076.164l.079 1.086zm-4 6l-.799.739l.079-1.086l-1.077-.164l.899-.616l-.542-.944l1.04.319l.4-1.013l.401 1.013l1.041-.319l-.543.944l.898.616l-1.076.164l.079 1.086zm9-2l-.799.739l.079-1.086l-1.077-.164l.899-.616l-.542-.944l1.04.319l.4-1.013l.401 1.013l1.041-.319l-.543.944l.898.616l-1.076.164l.079 1.086zm-5 14l-.799.739l.079-1.086l-1.077-.164l.899-.616l-.542-.944l1.04.319l.4-1.013l.401 1.013l1.041-.319l-.543.944l.898.616l-1.076.164l.079 1.086zM31 16l.294.596l.657.095l-.475.463l.112.655L31 17.5l-.588.309l.112-.655l-.475-.463l.657-.095z"/>
    <path fill="#00247D" d="M19 18V5H4c-.32 0-.604.045-.604.045l-.004 1.754l-2.73-.004S.62 6.854.535 7A3.988 3.988 0 0 0 0 9v9h19z"/>
    <path fill="#EEE" d="M19 5h-2.331L12 8.269V5H7v2.569L3.396 5.045a3.942 3.942 0 0 0-1.672.665L6.426 9H4.69L.967 6.391a4.15 4.15 0 0 0-.305.404L3.813 9H0v5h3.885L0 16.766V18h3.332L7 15.432V18h5v-3.269L16.668 18H19v-2.029L16.185 14H19V9h-2.814L19 7.029V5z"/>
    <path fill="#CF1B2B" d="M11 5H8v5H0v3h8v5h3v-5h8v-3h-8z"/>
    <path fill="#CF1B2B" d="M19 5h-1.461L12 8.879V9h1.571L19 5.198zm-17.276.71a4.052 4.052 0 0 0-.757.681L4.69 9h1.735L1.724 5.71zM6.437 14L.734 18h1.727L7 14.822V14zM19 17.802v-1.22L15.313 14H13.57z"/>
  </svg>
);

// Add New Word Modal Component
const AddNewWordModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [writtenForm, setWrittenForm] = useState('');
  const [phoneticSpelling, setPhoneticSpelling] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('');
  const [isVoiceDropdownOpen, setIsVoiceDropdownOpen] = useState(false);

  const voices = [
    { name: 'Annette', type: 'Australian English', flag: <AustralianFlag size={16} /> },
    { name: 'Darren', type: 'Australian English', flag: <AustralianFlag size={16} /> },
    { name: 'Duncan', type: 'Australian English', flag: <AustralianFlag size={16} /> },
  ];

  const isFormValid = writtenForm.trim() && phoneticSpelling.trim() && selectedVoice;

  const handleSave = () => {
    if (isFormValid) {
      // Handle save logic here
      console.log('Saving word:', { writtenForm, phoneticSpelling, selectedVoice });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Background overlay - darker for second modal */}
      <div 
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
        onClick={onClose}
      ></div>
      
      {/* Modal content */}
      <div 
        className="relative bg-white shadow-xl w-[600px] max-w-[90vw] flex flex-col z-10"
        style={{ borderRadius: '12px', overflow: 'visible' }}
      >
        
        {/* Header */}
        <div className="p-6 pb-3">
          <h2 className="text-lg text-gray-900 font-medium">Add new word</h2>
        </div>

        {/* Content */}
        <div className="px-6 pb-6" style={{ overflow: 'visible' }}>
          {/* Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
            {/* Table Header */}
            <div className="bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-3 px-4 py-2">
                <div className="text-sm font-medium text-gray-700">Written form</div>
                <div className="text-sm font-medium text-gray-700">Phonetic spelling</div>
                <div className="text-sm font-medium text-gray-700">Voice</div>
              </div>
            </div>
            
            {/* Input Row */}
            <div className="bg-white">
              <div className="grid grid-cols-3 px-4 py-2 gap-3">
                {/* Written form input */}
                <div>
                  <input
                    type="text"
                    placeholder="written form"
                    value={writtenForm}
                    onChange={(e) => setWrittenForm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                {/* Phonetic spelling input */}
                <div>
                  <input
                    type="text"
                    placeholder="new spelling"
                    value={phoneticSpelling}
                    onChange={(e) => setPhoneticSpelling(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                {/* Voice dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsVoiceDropdownOpen(!isVoiceDropdownOpen)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between"
                  >
                    <span className={selectedVoice ? "text-gray-900" : "text-gray-400"}>
                      {selectedVoice || "search"}
                    </span>
                    <ChevronDown size={16} className="text-gray-400" />
                  </button>
                  
                  {/* Dropdown menu */}
                  {isVoiceDropdownOpen && (
                    <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                         style={{
                           zIndex: 999999
                         }}>
                      <div className="p-2">
                        <div className="px-2 py-1 text-xs text-gray-500 font-medium">All languages</div>
                        {voices.map((voice, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setSelectedVoice(voice.name);
                              setIsVoiceDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-2 py-2 hover:bg-gray-50 rounded text-left"
                          >
                            {voice.flag}
                            <div className="flex flex-col">
                              <span className="text-sm text-gray-900">{voice.name}</span>
                              <span className="text-xs text-gray-500">{voice.type}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!isFormValid}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isFormValid
                  ? 'bg-black text-white hover:bg-gray-800'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DictionaryModal({ isOpen, onClose }: DictionaryModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddWordModalOpen, setIsAddWordModalOpen] = useState(false);

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
      <div 
        className="relative bg-white shadow-xl w-[900px] max-w-[96vw] max-h-[90vh] flex flex-col z-10"
        style={{ borderRadius: '12px' }}
      >
        


        {/* Content Area */}
        <div className="flex-1 p-6">
          {/* Row 1: Pronunciations + Info + Help */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg font-medium text-gray-900">Pronunciations</span>
            <Info size={16} className="text-gray-500" />
            <span className="text-sm text-gray-500">Help</span>
          </div>

          {/* Row 2: Search bar + Add new word button */}
          <div className="flex items-center justify-between mb-6">
            {/* Search bar */}
            <div className="w-48 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-3.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Add new word button */}
            <button 
              onClick={() => setIsAddWordModalOpen(true)}
              className="flex items-center gap-2 px-4 py-3.5 bg-white text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
            >
              <Plus size={16} />
              <span>Add new word</span>
            </button>
          </div>

          {/* Row 3: Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-3 px-4 py-3">
                <div className="text-sm font-medium text-gray-700 pr-4 border-r border-gray-200">Written form</div>
                <div className="text-sm font-medium text-gray-700 px-4 border-r border-gray-200">Phonetic spelling</div>
                <div className="text-sm font-medium text-gray-700 pl-4">Voice</div>
              </div>
            </div>
            
            {/* Table Body */}
            <div className="bg-white">
              {/* Sample row */}
              <div className="grid grid-cols-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50">
                {/* Column 1: Written form */}
                <div className="flex items-center gap-2 pr-4 border-r border-gray-200">
                  <span className="text-gray-900">conexwest</span>
                  <div className="w-5 h-5 bg-white border border-black rounded-full flex items-center justify-center">
                    <Plus size={12} className="text-black" />
                  </div>
                </div>
                
                {/* Column 2: Phonetic spelling */}
                <div className="flex items-center px-4 border-r border-gray-200">
                  <span className="text-gray-700">'conexwest</span>
                </div>
                
                {/* Column 3: Voice */}
                <div className="flex items-center justify-between pl-4">
                  <div className="flex items-center gap-2">
                    <USFlag size={16} />
                    <span className="text-gray-900">Bill</span>
                  </div>
                  <button className="p-1 text-black hover:text-gray-700 hover:bg-gray-100 rounded transition-colors">
                    <Play size={18} />
                  </button>
                  <button className="p-1 text-black hover:text-red-600 hover:bg-gray-100 rounded transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>


      </div>

      {/* Add New Word Modal */}
      <AddNewWordModal
        isOpen={isAddWordModalOpen}
        onClose={() => setIsAddWordModalOpen(false)}
      />
    </div>
  );
}
