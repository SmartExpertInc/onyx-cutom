export default function Toolbar() {
  const tools = [
    {
      id: 'script',
      label: 'Script',
      icon: 'https://api.builder.io/api/v1/image/assets/TEMP/938b59e2c0325ef5e4e47fd23bfe23fdfed31200?width=54',
      isActive: true
    },
    {
      id: 'avatar',
      label: 'Avatar',
      icon: 'https://api.builder.io/api/v1/image/assets/TEMP/9c1741292fbcf3b4862d22074643d72d0c36e71f?width=40'
    },
    {
      id: 'background',
      label: 'Background',
      icon: 'https://api.builder.io/api/v1/image/assets/TEMP/8e4491ad76d9db0eae15b60d5216d1273b670e81?width=48'
    },
    {
      id: 'shapes',
      label: 'Shapes',
      icon: 'https://api.builder.io/api/v1/image/assets/TEMP/f8fbcbd7ed83115a6edbff112313712a757f6608?width=54'
    },
    {
      id: 'media',
      label: 'Media',
      icon: 'https://api.builder.io/api/v1/image/assets/TEMP/f0bfbc987a1645ed029a1c3292cbca28e436d02d?width=48'
    },
    {
      id: 'text',
      label: 'Text',
      icon: 'https://api.builder.io/api/v1/image/assets/TEMP/82d167e32c88ee8b47e6a0f690289e846de2b40b?width=54'
    },
    {
      id: 'music',
      label: 'Music',
      icon: 'https://api.builder.io/api/v1/image/assets/TEMP/9953019089c548b87a939243996b460f3a5c7568?width=46'
    },
    {
      id: 'transition',
      label: 'Transition',
      icon: 'https://api.builder.io/api/v1/image/assets/TEMP/0f2a43eb4a1de2af1e3e13c484d876bf1eddeb46?width=54'
    },
    {
      id: 'interaction',
      label: 'Interaction',
      icon: 'https://api.builder.io/api/v1/image/assets/TEMP/4698a6bd3738fe5d573643dc4616d69f6c9aff67?width=36'
    },
    {
      id: 'comments',
      label: 'Comments',
      icon: 'https://api.builder.io/api/v1/image/assets/TEMP/e9ae7d5d6f3792c90db574ba1b512427c3cbc99c?width=58'
    },
    {
      id: 'default',
      label: 'Default',
      icon: 'https://api.builder.io/api/v1/image/assets/TEMP/9ea1710a702c96371536cdb0e31e384e5aa4a9da?width=74',
      chevron: 'https://api.builder.io/api/v1/image/assets/TEMP/bce9e1a7d3f2817c31d0c49a3cf34108a9fbabb5?width=30'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Main toolbar container - matches Figma dimensions exactly */}
      <div className="w-full bg-white relative" style={{ height: '187px' }}>
        {/* Toolbar positioned like in Figma */}
        <div className="absolute top-[84px] left-0 w-full" style={{ height: '103px' }}>
          {/* Desktop layout */}
          <div className="flex items-start justify-between px-2 max-w-full h-full">
            {/* Left side - all tools except Default */}
            <div className="flex items-start gap-4">
              {tools.filter(tool => tool.id !== 'default').map((tool) => {

                return (
                  <div
                    key={tool.id}
                    className={`flex flex-col items-center cursor-pointer transition-all duration-200 hover:bg-gray-50 p-3 ${
                      tool.isActive ? 'bg-gray-200 border border-gray-300 rounded-lg' : ''
                    }`}
                  >
                    {/* Icon */}
                    <div className="flex items-center justify-center mb-2 w-6 h-6">
                                            <img
                        src={tool.icon}
                        alt={tool.label}
                        className="object-contain w-full h-full"
                      />
                    </div>

                    {/* Label with exact font styling */}
                    <span
                        className="font-normal whitespace-nowrap"
                        style={{
                          color: '#000000',
                          fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
                          fontSize: tool.id === 'default' ? '18px' : '16px',

                          lineHeight: 'normal'
                        }}
                    >
                      {tool.label}
                    </span>

                  </div>
                );
              })}
            </div>
            
            {/* Right side - Default button */}
            <div className="flex items-start">
              {tools.filter(tool => tool.id === 'default').map((tool) => (
                <div
                  key={tool.id}
                  className={`flex flex-col items-center cursor-pointer transition-all duration-200 hover:bg-gray-50 p-3 ${
                    tool.isActive ? 'bg-gray-200 border border-gray-300 rounded-lg' : ''
                  }`}
                >
                  {/* Icon */}
                  <div className="flex items-center justify-center mb-2 w-8 h-8">
                    <img
                      src={tool.icon}
                      alt={tool.label}
                      className="object-contain w-full h-full"
                    />
                  </div>

                  {/* Label */}
                  <span
                    className="font-normal whitespace-nowrap text-center"
                    style={{
                      color: '#000000',
                      fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
                      fontSize: '18px',
                      lineHeight: 'normal'
                    }}
                  >
                    {tool.label}
                  </span>

                  {/* Chevron */}
                  {tool.chevron && (
                    <div className="flex items-center justify-center mt-1">
                      <img
                        src={tool.chevron}
                        alt="expand"
                        className="object-contain w-4 h-2"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
