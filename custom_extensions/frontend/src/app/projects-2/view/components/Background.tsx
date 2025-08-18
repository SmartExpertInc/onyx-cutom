import { useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Light background overlay */}
      <div 
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
        onClick={onClose}
      ></div>
      
      {/* Modal content */}
      <div 
        className="relative bg-white shadow-xl max-w-4xl w-full mx-4 z-10 h-[500px]"
        style={{ borderRadius: '12px' }}
      >
        {/* Header */}
        <div className="border-b border-gray-200">
        </div>
        
        {/* Main content area with sidebar */}
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 bg-white p-4 flex flex-col" style={{ borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' }}>
            {/* My assets section */}
            <div className="mb-3 pt-6">
              <h4 className="text-sm font-medium text-black mb-1 px-3">My assets</h4>
              <div className="flex items-center px-3 py-2 bg-gray-200 rounded-lg cursor-pointer transition-colors">
                {/* Folder icon */}
                <svg className="w-5 h-5 text-black mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <span className="text-sm text-black">Library</span>
              </div>
            </div>

            {/* Stock assets section */}
            <div className="mb-6 flex-1">
              <h4 className="text-sm font-medium text-black mb-1 px-3">Stock assets</h4>
              
              {/* Image option */}
              <div className="flex items-center px-3 py-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors mb-2">
                <svg className="w-5 h-5 text-black mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-black">Image</span>
              </div>

              {/* Video option */}
              <div className="flex items-center px-3 py-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors mb-2">
                <svg className="w-5 h-5 text-black mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="4" ry="4" strokeWidth="2" />
                  <polygon points="10,8 16,12 10,16" fill="currentColor" />
                </svg>
                <span className="text-sm text-black">Video</span>
              </div>

              {/* AI image option */}
              <div className="flex items-center px-3 py-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
                <svg className="w-5 h-5 text-black mr-3" fill="currentColor" viewBox="0 0 24 24">
                  {/* Main sparkle - 4-pointed star */}
                  <path d="M12 1l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" />
                  {/* Small sparkle - top right */}
                  <path d="M18 5l1 2 2 0-1.5 1.5 0.5 2-1.5-1-1.5 1 0.5-2-1.5-1.5 2 0z" opacity="0.6" />
                  {/* Tiny sparkle - bottom left */}
                  <circle cx="6" cy="18" r="1" opacity="0.4" />
                  {/* Cross sparkle - top left */}
                  <path d="M5 8v-2M5 8v2M3 8h2M7 8h-2" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5" />
                </svg>
                <span className="text-sm text-black">AI image</span>
              </div>
            </div>

            {/* Bottom buttons */}
            <div className="space-y-3">
              {/* Upload button */}
              <button className="w-full flex items-center justify-center px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8l0 8M8 12l4-4 4 4" />
                </svg>
                <span className="text-sm text-gray-700">Upload</span>
              </button>

              {/* Record button */}
              <button className="w-full flex items-center justify-center px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="white" stroke="#ef4444" strokeWidth="1" />
                  <circle cx="12" cy="12" r="6" fill="#ef4444" />
                </svg>
                <span className="text-sm text-gray-700">Record</span>
              </button>
            </div>
          </div>

          {/* Vertical divider */}
          <div className="w-px bg-gray-200"></div>

          {/* Main content area */}
          <div className="flex-1 flex flex-col">
            {/* Tabs */}
            <div className="relative border-b border-gray-200">
              <div className="flex px-6 pt-6">
                <button className="relative px-4 py-2 text-sm font-medium text-gray-900 mr-8">
                  Media library
                  {/* Active tab indicator */}
                  <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-black"></div>
                </button>
                <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                  Brand kit
                </button>
              </div>
                        </div>
            
            {/* Search bar and upload button */}
            <div className="flex items-center gap-4 px-6 py-4">
              {/* Search bar */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {/* Magnifying glass icon */}
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search media library"
                  className="w-full pl-10 pr-4 py-1.5 border border-gray-400 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Upload button */}
              <button className="flex items-center px-4 py-1.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8l0 8M8 12l4-4 4 4" />
                </svg>
                <span className="text-sm font-medium">Upload to Library</span>
              </button>
            </div>
            
            {/* Tab content */}
            <div className="flex-1 p-6 pb-8 overflow-y-auto">
              {/* Demo rectangles in three columns */}
              <div className="grid grid-cols-3 gap-4 pb-6">
                {/* Column 1 */}
                <div className="space-y-4">
                  <div className="bg-gray-200 rounded-lg h-32"></div>
                  <div className="bg-gray-200 rounded-lg h-24"></div>
                  <div className="bg-gray-200 rounded-lg h-40"></div>
                  <div className="bg-gray-200 rounded-lg h-28"></div>
                  <div className="bg-gray-200 rounded-lg h-36"></div>
                  <div className="bg-gray-200 rounded-lg h-32"></div>
                  <div className="bg-gray-200 rounded-lg h-44"></div>
                </div>
                
                {/* Column 2 */}
                <div className="space-y-4">
                  <div className="bg-gray-200 rounded-lg h-36"></div>
                  <div className="bg-gray-200 rounded-lg h-32"></div>
                  <div className="bg-gray-200 rounded-lg h-20"></div>
                  <div className="bg-gray-200 rounded-lg h-44"></div>
                  <div className="bg-gray-200 rounded-lg h-28"></div>
                  <div className="bg-gray-200 rounded-lg h-40"></div>
                  <div className="bg-gray-200 rounded-lg h-32"></div>
                </div>
                
                {/* Column 3 */}
                <div className="space-y-4">
                  <div className="bg-gray-200 rounded-lg h-28"></div>
                  <div className="bg-gray-200 rounded-lg h-36"></div>
                  <div className="bg-gray-200 rounded-lg h-24"></div>
                  <div className="bg-gray-200 rounded-lg h-32"></div>
                  <div className="bg-gray-200 rounded-lg h-40"></div>
                  <div className="bg-gray-200 rounded-lg h-28"></div>
                  <div className="bg-gray-200 rounded-lg h-36"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Background() {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Helper function to darken a hex color
  const darkenColor = (hex: string, amount: number = 0.3) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, Math.floor((num >> 16) * (1 - amount)));
    const g = Math.max(0, Math.floor(((num >> 8) & 0x00FF) * (1 - amount)));
    const b = Math.max(0, Math.floor((num & 0x0000FF) * (1 - amount)));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  };
  // Generate color styles and names for the rectangles
  const rectangleData = [
    { color: '#A0BD86', name: 'Green screen' },
    { color: '#F1F1F1', name: 'Off-white' }, 
    { color: '#616F70', name: 'Dark gray' },
    { color: '#EBE7EA', name: 'Light pink' },
    { color: '#B3A3AC', name: 'Dark pink' },
    { color: '#E4E7EC', name: 'Light blue' },
    { color: '#A0ACC4', name: 'Dark blue' },
    { color: '#F0E6DD', name: 'Light gold' },
    { color: '#DDBA92', name: 'Dark gold' }
  ];

  return (
    <div className="h-full bg-white relative w-full border-0 overflow-y-auto">
      <div className="relative z-10 flex flex-col items-start justify-start w-full p-4">
        
        {/* Selected color preview */}
        {selectedColor && (
          <div className="w-full bg-gray-100 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-8 h-8 rounded-md"
                style={{ backgroundColor: selectedColor }}
              ></div>
              <span className="font-medium" style={{ color: '#616161' }}>Color</span>
            </div>
            <button 
              onClick={() => setSelectedColor(null)}
              className="p-2 bg-white border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Media upload section */}
        <div 
          className="w-full border border-gray-300 rounded-lg p-4 mb-6 flex flex-row items-center justify-center bg-white hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        >
          <svg className="w-5 h-5 text-black mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="font-medium text-black">Choose media</span>
        </div>

        {/* OR divider */}
        <div className="w-full flex justify-center mb-6">
          <div className="flex items-center">
            <div className="w-24 h-px bg-gray-300"></div>
            <span className="px-4 text-gray-500 font-medium">OR</span>
            <div className="w-24 h-px bg-gray-300"></div>
          </div>
        </div>

        {/* Two columns with color options */}
        <div className="w-full grid grid-cols-2 gap-4">
          {/* First column */}
          <div className="flex flex-col space-y-4">
            {/* Inactive + button with label */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center cursor-not-allowed opacity-50 mb-2">
                <span className="text-2xl text-gray-400 font-light">+</span>
              </div>
              <span className="text-sm text-center" style={{ color: '#616161' }}>Custom</span>
            </div>
            
            {/* Color rectangles for first column - first half of items */}
            {rectangleData.slice(0, Math.ceil(rectangleData.length / 2)).map((item, index) => (
              <div key={`col1-${index}`} className="flex flex-col items-center">
                <div
                  className="w-full h-12 rounded-lg cursor-pointer hover:opacity-80 transition-all mb-2"
                  style={{ 
                    backgroundColor: item.color,
                    border: selectedColor === item.color ? `5px solid ${darkenColor(item.color)}` : 'none'
                  }}
                  onClick={() => setSelectedColor(item.color)}
                ></div>
                <span className="text-sm text-center" style={{ color: '#616161' }}>{item.name}</span>
              </div>
            ))}
          </div>

          {/* Second column */}
          <div className="flex flex-col space-y-4">
            {/* Color rectangles for second column - second half of items */}
            {rectangleData.slice(Math.ceil(rectangleData.length / 2)).map((item, index) => (
              <div key={`col2-${index}`} className="flex flex-col items-center">
                <div
                  className="w-full h-12 rounded-lg cursor-pointer hover:opacity-80 transition-all mb-2"
                  style={{ 
                    backgroundColor: item.color,
                    border: selectedColor === item.color ? `5px solid ${darkenColor(item.color)}` : 'none'
                  }}
                  onClick={() => setSelectedColor(item.color)}
                ></div>
                <span className="text-sm text-center" style={{ color: '#616161' }}>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Modal for media selection */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Choose Media"
      >
        <div className="flex items-center justify-center h-full">
        <div className="text-center py-8">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
            <p className="text-gray-600 mb-4">Select a category from the sidebar to browse media</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
