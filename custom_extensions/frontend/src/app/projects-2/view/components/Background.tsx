export default function Background() {
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
    <div className="h-full bg-white relative overflow-hidden w-full">
      <div className="relative z-10 flex flex-col items-start justify-start px-4 py-8 sm:px-8 md:px-12 lg:px-20 md:py-16 lg:py-24">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Background</h2>
        
        {/* Media upload section */}
        <div className="w-full border-2 border-gray-300 border-dashed rounded-lg p-8 mb-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
          <div className="mb-3">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="font-medium" style={{ color: '#494949' }}>Choose media</span>
        </div>

        {/* OR divider */}
        <div className="w-full flex items-center mb-6">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="px-4 text-gray-500 font-medium">OR</span>
          <div className="flex-1 h-px bg-gray-300"></div>
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
            
            {/* Color rectangles for first column */}
            {rectangleData.map((item, index) => (
              <div key={`col1-${index}`} className="flex flex-col items-center">
                <div
                  className="w-full h-12 rounded-lg cursor-pointer hover:opacity-80 transition-opacity mb-2"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-center" style={{ color: '#616161' }}>{item.name}</span>
              </div>
            ))}
          </div>

          {/* Second column */}
          <div className="flex flex-col space-y-4">
            {/* Color rectangles for second column */}
            {rectangleData.map((item, index) => (
              <div key={`col2-${index}`} className="flex flex-col items-center">
                <div
                  className="w-full h-12 rounded-lg cursor-pointer hover:opacity-80 transition-opacity mb-2"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-center" style={{ color: '#616161' }}>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
