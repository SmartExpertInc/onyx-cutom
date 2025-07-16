import React, { useState, useEffect } from 'react';
import { Check, FileText, Search } from 'lucide-react';

interface CourseOutline {
  id: number;
  name: string;
  project_name: string;
  lessonCount: number;
  currentHours: number;
  estimatedNewHours: number;
}

interface CourseOutlineSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (selectedOutlineIds: number[]) => void;
  folderName: string;
  folderId: number;
  newTier: string;
  newCustomRate: number;
}

const CourseOutlineSelectionModal: React.FC<CourseOutlineSelectionModalProps> = ({
  open,
  onClose,
  onConfirm,
  folderName,
  folderId,
  newTier,
  newCustomRate,
}) => {
  const [courseOutlines, setCourseOutlines] = useState<CourseOutline[]>([]);
  const [selectedOutlines, setSelectedOutlines] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Load course outlines when modal opens
  useEffect(() => {
    if (open) {
      loadCourseOutlines();
    }
  }, [open, folderId]);

  const loadCourseOutlines = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/custom-projects-backend/projects/folders/${folderId}/course-outlines`, {
        credentials: 'same-origin',
      });
      
      if (response.ok) {
        const outlines = await response.json();
        setCourseOutlines(outlines);
        
        // Select all by default
        const allIds = new Set<number>(outlines.map((outline: CourseOutline) => outline.id));
        setSelectedOutlines(allIds);
        setSelectAll(true);
      }
    } catch (error) {
      console.error('Error loading course outlines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOutlineToggle = (outlineId: number) => {
    const newSelected = new Set(selectedOutlines);
    if (newSelected.has(outlineId)) {
      newSelected.delete(outlineId);
    } else {
      newSelected.add(outlineId);
    }
    setSelectedOutlines(newSelected);
    setSelectAll(newSelected.size === courseOutlines.length);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedOutlines(new Set());
      setSelectAll(false);
    } else {
      const allIds = new Set<number>(courseOutlines.map(outline => outline.id));
      setSelectedOutlines(allIds);
      setSelectAll(true);
    }
  };

  const handleConfirm = () => {
    onConfirm(Array.from(selectedOutlines));
  };

  const filteredOutlines = courseOutlines.filter(outline =>
    outline.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    outline.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTierDisplayName = (tier: string) => {
    const tierNames: Record<string, string> = {
      basic: 'Basic',
      interactive: 'Interactive', 
      advanced: 'Advanced',
      immersive: 'Immersive'
    };
    return tierNames[tier] || tier;
  };

  if (!open) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center backdrop-blur-sm bg-black/40" onClick={handleBackdropClick}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] p-6 relative mx-4 flex flex-col">
        <button 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10" 
          onClick={onClose}
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Header */}
        <div className="mb-6 text-center flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Apply Tier Changes</h2>
          <p className="text-gray-600">
            Select which course outlines should use the new{' '}
            <span className="font-semibold text-blue-600">{getTierDisplayName(newTier)}</span> tier 
            ({newCustomRate}h rate) from folder{' '}
            <span className="font-semibold text-blue-600">{folderName}</span>
          </p>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading course outlines...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Search and Select All */}
            <div className="mb-4 flex gap-4 items-center flex-shrink-0">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search course outlines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleSelectAll}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                {selectAll ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {/* Course Outlines List */}
            <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
              {filteredOutlines.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  {searchTerm ? 'No course outlines match your search.' : 'No course outlines found in this folder.'}
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredOutlines.map((outline) => (
                    <div
                      key={outline.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedOutlines.has(outline.id) ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                      onClick={() => handleOutlineToggle(outline.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            selectedOutlines.has(outline.id)
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-gray-300'
                          }`}>
                            {selectedOutlines.has(outline.id) && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <h4 className="font-semibold text-gray-900 truncate">{outline.project_name}</h4>
                          </div>
                          <p className="text-sm text-gray-600 truncate">{outline.name}</p>
                        </div>
                        
                        <div className="flex-shrink-0 text-right">
                          <div className="text-sm text-gray-600">
                            {outline.lessonCount} lesson{outline.lessonCount !== 1 ? 's' : ''}
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-500">{outline.currentHours}h</span>
                            <span className="mx-2 text-gray-400">→</span>
                            <span className="font-semibold text-blue-600">{outline.estimatedNewHours}h</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200 flex-shrink-0 mt-4">
          <div className="text-sm text-gray-600">
            {selectedOutlines.size} of {courseOutlines.length} course outline{courseOutlines.length !== 1 ? 's' : ''} selected
          </div>
          <div className="flex gap-3">
            <button
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleConfirm}
              disabled={selectedOutlines.size === 0}
            >
              Apply Changes ({selectedOutlines.size})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseOutlineSelectionModal; 