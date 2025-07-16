import React, { useState } from 'react';
import { Check, Folder, FileText, Layers } from 'lucide-react';

interface TierScopeModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (scope: 'current' | 'all_courses' | 'courses_in_folder') => void;
  changeType: 'folder' | 'project';
  folderName?: string;
  projectName?: string;
  newTier: string;
  affectedCoursesCount: number;
}

type ScopeOption = {
  id: 'current' | 'all_courses' | 'courses_in_folder';
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
};

const TierScopeModal: React.FC<TierScopeModalProps> = ({
  open,
  onClose,
  onConfirm,
  changeType,
  folderName,
  projectName,
  newTier,
  affectedCoursesCount
}) => {
  const [selectedScope, setSelectedScope] = useState<'current' | 'all_courses' | 'courses_in_folder'>('current');

  if (!open) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm(selectedScope);
    onClose();
  };

  const tierDisplayNames = {
    basic: 'Basic',
    interactive: 'Interactive', 
    advanced: 'Advanced',
    immersive: 'Immersive'
  };

  const scopeOptions: ScopeOption[] = [
    {
      id: 'current',
      title: changeType === 'folder' ? 'Only Folder Settings' : 'Only Project Settings',
      description: changeType === 'folder' 
        ? 'Update only the folder\'s default tier. Course outlines keep their current individual lesson tiers.'
        : 'Update only this project\'s default tier. Individual lesson tiers remain unchanged.',
      icon: changeType === 'folder' ? <Folder className="w-5 h-5" /> : <FileText className="w-5 h-5" />,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    },
    {
      id: 'courses_in_folder',
      title: changeType === 'folder' ? 'All Course Outlines in Folder' : 'This Course Outline Only',
      description: changeType === 'folder'
        ? `Override all manually set lesson tiers in ${affectedCoursesCount} course outline(s) within this folder.`
        : 'Override all manually set lesson tiers in this course outline.',
      icon: <Layers className="w-5 h-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50', 
      borderColor: 'border-blue-200'
    }
  ];

  // Add "All Course Outlines" option only for folder changes
  if (changeType === 'folder') {
    scopeOptions.push({
      id: 'all_courses',
      title: 'All Course Outlines (Entire Account)',
      description: 'Override all manually set lesson tiers in every course outline across your entire account.',
      icon: <Layers className="w-5 h-5" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    });
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm bg-black/20" onClick={handleBackdropClick}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] p-6 relative mx-4 flex flex-col">
        <button 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10" 
          onClick={onClose}
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Apply Tier Change</h2>
          <p className="text-gray-600">
            You're changing the tier to <span className="font-semibold text-blue-600">{tierDisplayNames[newTier as keyof typeof tierDisplayNames]}</span>
            {changeType === 'folder' && folderName && (
              <> for <span className="font-semibold">{folderName}</span></>
            )}
            {changeType === 'project' && projectName && (
              <> for <span className="font-semibold">{projectName}</span></>
            )}
          </p>
        </div>

        {/* Scope Options */}
        <div className="flex-1 space-y-3 mb-6">
          {scopeOptions.map((option) => (
            <div
              key={option.id}
              className={`cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 hover:shadow-md ${
                selectedScope === option.id
                  ? `${option.borderColor} ${option.bgColor} shadow-md`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedScope(option.id)}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${selectedScope === option.id ? option.bgColor : 'bg-gray-100'}`}>
                  <div className={selectedScope === option.id ? option.color : 'text-gray-500'}>
                    {option.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-semibold ${selectedScope === option.id ? option.color : 'text-gray-700'}`}>
                      {option.title}
                    </h3>
                    {selectedScope === option.id && (
                      <Check className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {option.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Warning for scope changes */}
        {selectedScope !== 'current' && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="font-semibold text-yellow-800 mb-1">Warning</h4>
                <p className="text-sm text-yellow-700">
                  This will override any manually set lesson tiers and recalculate hours. This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 active:scale-95"
            onClick={handleConfirm}
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default TierScopeModal; 