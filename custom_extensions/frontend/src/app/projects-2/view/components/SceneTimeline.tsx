import React, { useState } from 'react';

interface Scene {
  id: string;
  name: string;
  order: number;
}

interface SceneTimelineProps {
  scenes: Scene[];
  aspectRatio: string;
  onAddScene: () => void;
  onMenuClick: (sceneId: string, event: React.MouseEvent) => void;
  onSceneRename?: (sceneId: string, newName: string) => void;
}

export default function SceneTimeline({ 
  scenes, 
  aspectRatio, 
  onAddScene, 
  onMenuClick,
  onSceneRename 
}: SceneTimelineProps) {
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  // Function to get scene rectangle dimensions based on aspect ratio
  const getSceneRectangleStyles = () => {
    const baseHeight = 64; // 16 * 4 (h-16)
    
    switch (aspectRatio) {
      case '16:9':
        return {
          width: `${Math.round(baseHeight * 16 / 9)}px`,
          height: `${baseHeight}px`,
        };
      case '9:16':
        return {
          width: `${Math.round(baseHeight * 9 / 16)}px`,
          height: `${baseHeight}px`,
        };
      case '1:1':
        return {
          width: `${baseHeight}px`,
          height: `${baseHeight}px`,
        };
      default:
        return {
          width: `${Math.round(baseHeight * 16 / 9)}px`,
          height: `${baseHeight}px`,
        };
    }
  };

  const handleRenameClick = (scene: Scene) => {
    setEditingSceneId(scene.id);
    setEditingName(scene.name);
  };

  const handleRenameSave = () => {
    if (editingSceneId && editingName.trim() && onSceneRename) {
      onSceneRename(editingSceneId, editingName.trim());
    }
    setEditingSceneId(null);
    setEditingName('');
  };

  const handleRenameCancel = () => {
    setEditingSceneId(null);
    setEditingName('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameSave();
    } else if (e.key === 'Escape') {
      handleRenameCancel();
    }
  };

  return (
    <div className="bg-white rounded-md overflow-visible p-4" style={{ height: 'calc(25% + 20px)' }}>
      <div className="flex items-end gap-10">
          {/* Play Button with Time */}
          <div className="relative flex items-center justify-center h-16">
            <button className="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors cursor-pointer">
              <div className="w-0 h-0 border-l-[8px] border-l-white border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1"></div>
            </button>
            <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 text-sm text-gray-600">00:00</span>
          </div>

          {/* Dynamic Scene Rectangles */}
          {scenes.map((scene, index) => (
            <React.Fragment key={scene.id}>
              <div className="relative group">
                <div 
                  className="bg-gray-100 border border-gray-300 rounded-md flex items-center justify-center relative"
                  style={getSceneRectangleStyles()}
                >
                  <div className="w-8 h-8 bg-blue-500 rounded"></div>
                  
                  {/* Three-dot menu button - visible on hover */}
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button 
                      className="w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMenuClick(scene.id, e);
                      }}
                    >
                      <svg 
                        className="w-3 h-3 text-gray-600" 
                        fill="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <circle cx="6" cy="12" r="2"/>
                        <circle cx="12" cy="12" r="2"/>
                        <circle cx="18" cy="12" r="2"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 flex items-center gap-2 min-w-[120px] justify-center">
                  {editingSceneId === scene.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={handleKeyPress}
                        onBlur={handleRenameSave}
                        className="text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[80px]"
                        autoFocus
                      />
                      <button
                        onClick={handleRenameSave}
                        className="w-4 h-4 text-green-600 hover:text-green-700 cursor-pointer"
                        title="Save"
                      >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        onClick={handleRenameCancel}
                        className="w-4 h-4 text-red-600 hover:text-red-700 cursor-pointer"
                        title="Cancel"
                      >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm font-medium text-gray-700">{scene.name}</span>
                      <svg 
                        className="w-4 h-4 text-gray-500 hover:text-gray-700 cursor-pointer" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        onClick={() => handleRenameClick(scene)}
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" 
                        />
                      </svg>
                    </>
                  )}
                </div>
              </div>

              {/* Transition button - show between scenes (not after the last one) */}
              {index < scenes.length - 1 && (
                <div className="relative group flex items-center h-16">
                  <button className="w-16 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer">
                    <svg 
                      className="w-4 h-4 text-gray-600" 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h5v18zm7 0q-.425 0-.712-.288T11 20q0-.425.288-.712T12 19q.425 0 .713.288T13 20q0 .425-.288.713T12 21m0-4q-.425 0-.712-.288T11 16q0-.425.288-.712T12 15q.425 0 .713.288T13 16q0 .425-.288.713T12 17m0-4q-.425 0-.712-.288T11 12q0-.425.288-.712T12 11q.425 0 .713.288T13 12q0 .425-.288.713T12 13m0-4q-.425 0-.712-.288T11 8q0-.425.288-.712T12 7q.425 0 .713.288T13 8q0 .425-.288.713T12 9m0-4q-.425 0-.712-.288T11 4q0-.425.288-.712T12 3q.425 0 .713.288T13 4q0 .425-.288.713T12 5m2 14q-.425 0-.712-.288T13 18q0-.425.288-.712T14 17q.425 0 .713.288T15 18q0 .425-.288.713T14 19m0-4q-.425 0-.712-.288T13 14q0-.425.288-.712T14 13q.425 0 .713.288T15 14q0 .425-.288.713T14 15m0-4q-.425 0-.712-.288T13 10q0-.425.288-.712T14 9q.425 0 .713.288T15 10q0 .425-.288.713T14 11m0-4q-.425 0-.712-.288T13 6q0-.425.288-.712T14 5q.425 0 .713.288T15 6q0 .425-.288.713T14 7m2 14q-.425 0-.712-.288T15 20q0-.425.288-.712T16 19q.425 0 .713.288T17 20q0 .425-.288.713T16 21m0-4q-.425 0-.712-.288T15 16q0-.425.288-.712T16 15q.425 0 .713.288T17 16q0 .425-.288.713T16 17m0-4q-.425 0-.712-.288T15 12q0-.425.288-.712T16 11q.425 0 .713.288T17 12q0 .425-.288.713T16 13m0-4q-.425 0-.712-.288T15 8q0-.425.288-.712T16 7q.425 0 .713.288T17 8q0 .425-.288.713T16 9m0-4q-.425 0-.712-.288T15 4q0-.425.288-.712T16 3q.425 0 .713.288T17 4q0 .425-.288.713T16 5"/>
                    </svg>
                  </button>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[9999]">
                    <div className="bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      Add transition
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black"></div>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}

          {/* Add Scene Rectangle */}
          <div className="relative">
            <div 
              className="bg-gray-300 rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-400 transition-colors"
              style={getSceneRectangleStyles()}
              onClick={onAddScene}
            >
              <svg 
                className="w-8 h-8 text-gray-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
}
