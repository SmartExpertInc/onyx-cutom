'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ImageIcon, Replace, MoreVertical, Download, Trash2 } from 'lucide-react';
import PresentationImageUpload from './PresentationImageUpload';
import Moveable from 'react-moveable';
import ImageEditModal from './ImageEditModal';

// Global context menu management - SIMPLIFIED but more effective
const globalContextMenuState = {
  currentMenu: null as { instanceId: string, closeMenu: () => void } | null,
  
  setActiveMenu: (instanceId: string, closeMenu: () => void) => {
    // Close previous menu if different instance
    if (globalContextMenuState.currentMenu && globalContextMenuState.currentMenu.instanceId !== instanceId) {
      globalContextMenuState.currentMenu.closeMenu();
    }
    globalContextMenuState.currentMenu = { instanceId, closeMenu };
  },
  
  closeAll: () => {
    if (globalContextMenuState.currentMenu) {
      globalContextMenuState.currentMenu.closeMenu();
      globalContextMenuState.currentMenu = null;
    }
  }
};

// Enhanced debug logging utility
const DEBUG = typeof window !== 'undefined' && ((window as any).__MOVEABLE_DEBUG__ || true);
const log = (source: string, event: string, data: any) => {
  if (DEBUG) {
    console.log(`[ImageEdit] ${source} | ${event}`, { 
      ts: Date.now(), 
      ...data 
    });
  }
};

export interface ClickableImagePlaceholderProps {
  imagePath?: string;
  onImageUploaded: (imagePath: string) => void;
  size?: 'SMALL' | 'MEDIUM' | 'LARGE';
  position?: 'LEFT' | 'RIGHT' | 'CENTER' | 'BACKGROUND';
  description?: string;
  prompt?: string;
  isEditable?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onSizeTransformChange?: (payload: any) => void;
  // New props for integration
  elementId?: string;
  elementRef?: React.RefObject<HTMLDivElement | null>;
  cropMode?: 'cover' | 'contain' | 'fill';
  onCropModeChange?: (mode: 'cover' | 'contain' | 'fill') => void;
  // New prop for slide context
  slideContainerRef?: React.RefObject<HTMLElement | null>;
  // Saved position and size for persistence
  savedImagePosition?: { x: number; y: number };
  savedImageSize?: { width: number; height: number };
}

  // Context Menu Component - SIMPLIFIED like the working example
  interface ContextMenuProps {
    visible: boolean;
    x: number;
    y: number;
    onClose: () => void;
    onReplaceImage: () => void;
    onRemoveImage?: () => void;
    targetElementId?: string;
    instanceId?: string;
    debugInfo?: {
      slideId?: string;
      elementId?: string;
      imagePath?: string;
      clickPosition?: { x: number; y: number };
    };
  }

  const ContextMenu: React.FC<ContextMenuProps> = ({
    visible,
    x,
    y,
    onClose,
    onReplaceImage,
    onRemoveImage,
    targetElementId,
    instanceId,
    debugInfo
  }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    // Detailed logging for context menu lifecycle
    useEffect(() => {
      if (visible) {
        console.log('🔍 [ContextMenu] OPENED', {
          instanceId,
          targetElementId,
          position: { x, y },
          viewportSize: { width: window.innerWidth, height: window.innerHeight },
          debugInfo,
          timestamp: Date.now()
        });
      } else {
        console.log('🔍 [ContextMenu] CLOSED', {
          instanceId,
          targetElementId,
          timestamp: Date.now()
        });
      }
    }, [visible, instanceId, targetElementId, x, y, debugInfo]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
          console.log('🔍 [ContextMenu] Click outside detected', {
            instanceId,
            targetElementId,
            clickedElement: event.target,
            menuElement: menuRef.current
          });
          onClose();
        }
      };

      if (visible) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [visible, onClose, instanceId, targetElementId]);

    if (!visible) return null;

    return (
              <div
          ref={menuRef}
          className="fixed bg-white border border-gray-300 rounded-lg shadow-lg py-2 z-50"
          style={{
            left: `${x}px`,
            top: `${y}px`,
          }}
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the menu itself
          data-context-menu-for={targetElementId}
          data-instance-id={instanceId}
          data-debug-slide={debugInfo?.slideId}
          data-debug-element={debugInfo?.elementId}
        >
          <button
            className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors duration-150 flex items-center space-x-2"
            onClick={() => {
              console.log('🔍 [ContextMenu] Replace Image clicked', {
                instanceId,
                targetElementId,
                debugInfo
              });
              onReplaceImage();
            }}
          >
            <Replace className="w-4 h-4" />
            <span>Replace Image</span>
          </button>
          {onRemoveImage && (
            <>
              <div className="border-t border-gray-200"></div>
              <button
                className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors duration-150 flex items-center space-x-2"
                onClick={() => {
                  console.log('🔍 [ContextMenu] Remove Image clicked', {
                    instanceId,
                    targetElementId,
                    debugInfo
                  });
                  onRemoveImage();
                }}
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove Image</span>
              </button>
            </>
          )}
                </div>
      );
    };

const ClickableImagePlaceholder: React.FC<ClickableImagePlaceholderProps> = ({
  imagePath,
  onImageUploaded,
  size = 'MEDIUM',
  position = 'CENTER',
  description = 'Click to upload image',
  prompt,
  isEditable = false,
  className = '',
  style = {},
  onSizeTransformChange,
  elementId,
  elementRef,
  cropMode = 'contain',
  onCropModeChange,
  slideContainerRef,
  savedImagePosition,
  savedImageSize
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [displayedImage, setDisplayedImage] = useState<string | undefined>(imagePath);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  
  // Modal state
  const [showImageEditModal, setShowImageEditModal] = useState(false);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);

  // ✅ NEW: Click-to-activate interaction model
  const [isSelected, setIsSelected] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  
  // Context menu state - SIMPLIFIED like the working example
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
  }>({
    visible: false,
    x: 0,
    y: 0
  });
  
  // Debug info for context menu
  const [contextMenuDebugInfo, setContextMenuDebugInfo] = useState<{
    slideId?: string;
    elementId?: string;
    imagePath?: string;
    clickPosition?: { x: number; y: number };
  }>({});

  const internalRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Use provided ref or internal ref
  const containerRef = elementRef || internalRef;

  // IMPROVED: Create unique instance ID that includes slide context
  const instanceId = useRef(`${elementId || 'img'}-${Math.random().toString(36).substr(2, 9)}`).current;
  
  // Component lifecycle logging
  useEffect(() => {
    console.log('🔍 [ComponentLifecycle] MOUNTED', {
      elementId,
      instanceId,
      displayedImage: !!displayedImage,
      isEditable,
      timestamp: Date.now()
    });
    
    return () => {
      console.log('🔍 [ComponentLifecycle] UNMOUNTING', {
        elementId,
        instanceId,
        contextMenuVisible: contextMenu.visible,
        timestamp: Date.now()
      });
    };
  }, [elementId, instanceId, displayedImage, isEditable, contextMenu.visible]);

  const sizeClasses = {
    'LARGE': 'h-48 md:h-64',
    'MEDIUM': 'h-32 md:h-40', 
    'SMALL': 'h-24 md:h-32'
  };

  const positionClasses = {
    'LEFT': 'float-left mr-6 mb-4',
    'RIGHT': 'float-right ml-6 mb-4',
    'CENTER': 'mx-auto mb-6',
    'BACKGROUND': 'absolute inset-0 z-0'
  };

  // SIMPLIFIED: Context menu management like the working example
  const hideContextMenu = useCallback(() => {
    console.log('🔍 [HideContextMenu] Hiding menu', {
      elementId,
      instanceId,
      wasActive: globalContextMenuState.currentMenu?.instanceId === instanceId,
      currentActiveMenu: globalContextMenuState.currentMenu?.instanceId
    });
    
    setContextMenu({ visible: false, x: 0, y: 0 });
    setContextMenuDebugInfo({});
    
    // Clear from global state if this was the active menu
    if (globalContextMenuState.currentMenu?.instanceId === instanceId) {
      globalContextMenuState.currentMenu = null;
      console.log('🔍 [HideContextMenu] Cleared from global state', { instanceId });
    }
  }, [elementId, instanceId]);

  // SIMPLIFIED: No need for complex registration
  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (globalContextMenuState.currentMenu?.instanceId === instanceId) {
        globalContextMenuState.currentMenu = null;
      }
    };
  }, [instanceId]);

  // Keep local displayed image in sync with prop
  useEffect(() => {
    if (imagePath) {
      setDisplayedImage(imagePath);
    }
  }, [imagePath]);

  // Apply saved position and size when component mounts or saved values change
  useEffect(() => {
    if (containerRef.current && (savedImagePosition || savedImageSize)) {
      const element = containerRef.current;
      
      log('ClickableImagePlaceholder', 'applySavedState_start', {
        elementId,
        instanceId,
        hasSavedPosition: !!savedImagePosition,
        hasSavedSize: !!savedImageSize,
        savedPosition: savedImagePosition,
        savedSize: savedImageSize
      });
      
      // Apply saved position
      if (savedImagePosition && (savedImagePosition.x !== 0 || savedImagePosition.y !== 0)) {
        element.style.transform = `translate(${savedImagePosition.x}px, ${savedImagePosition.y}px)`;
        log('ClickableImagePlaceholder', 'applySavedPosition', {
          elementId,
          instanceId,
          position: savedImagePosition,
          appliedTransform: element.style.transform
        });
      }
      
      // Apply saved size
      if (savedImageSize && savedImageSize.width && savedImageSize.height) {
        element.style.width = `${savedImageSize.width}px`;
        element.style.height = `${savedImageSize.height}px`;
        log('ClickableImagePlaceholder', 'applySavedSize', {
          elementId,
          instanceId,
          size: savedImageSize,
          appliedWidth: element.style.width,
          appliedHeight: element.style.height
        });
      }
      
      log('ClickableImagePlaceholder', 'applySavedState_complete', {
        elementId,
        instanceId,
        finalWidth: element.style.width,
        finalHeight: element.style.height,
        finalTransform: element.style.transform
      });
    }
  }, [containerRef, savedImagePosition, savedImageSize, elementId, instanceId]);

  // ✅ IMPROVED: Click outside detection to deselect
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsSelected(false);
        log('ClickableImagePlaceholder', 'deselected', { 
          elementId, 
          instanceId 
        });
      }
    };

    if (isSelected) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isSelected, containerRef, elementId, instanceId]);

  // ✅ NEW: Simplified drag/resize callbacks
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    log('ClickableImagePlaceholder', 'dragStart', { elementId, instanceId });
  }, [elementId, instanceId]);

  const handleDrag = useCallback((e: any) => {
    e.target.style.transform = e.transform;
    
    // Extract position from transform
    const transformMatch = e.transform.match(/translate\(([^)]+)\)/);
    if (transformMatch) {
      const [, translate] = transformMatch;
      const [x, y] = translate.split(',').map((v: string) => parseFloat(v.replace('px', '')));
      
      // Call onSizeTransformChange with position update
      onSizeTransformChange?.({
        imagePosition: { x, y },
        elementId: elementId
      });
    }
  }, [onSizeTransformChange, elementId]);

  const handleDragEnd = useCallback((e: any) => {
    setIsDragging(false);
    log('ClickableImagePlaceholder', 'dragEnd', { elementId, instanceId });
    
    // Final position update after drag ends
    const transformMatch = e.target.style.transform.match(/translate\(([^)]+)\)/);
    if (transformMatch) {
      const [, translate] = transformMatch;
      const [x, y] = translate.split(',').map((v: string) => parseFloat(v.replace('px', '')));
      
      onSizeTransformChange?.({
        imagePosition: { x, y },
        elementId: elementId,
        final: true
      });
    }
  }, [onSizeTransformChange, elementId, instanceId]);

  const handleResizeStart = useCallback(() => {
    setIsResizing(true);
    log('ClickableImagePlaceholder', 'resizeStart', { elementId, instanceId });
  }, [elementId, instanceId]);

  const handleResizeEnd = useCallback((e: any) => {
    setIsResizing(false);
    log('ClickableImagePlaceholder', 'resizeEnd', { elementId, instanceId });
    
    // Final size update after resize ends
    const transformMatch = e.target.style.transform.match(/translate\(([^)]+)\)/);
    const x = transformMatch ? parseFloat(transformMatch[1].split(',')[0].replace('px', '')) : 0;
    const y = transformMatch ? parseFloat(transformMatch[1].split(',')[1].replace('px', '')) : 0;
    
    // Get numeric width and height from the resize event
    const width = parseFloat(e.target.style.width.replace('px', ''));
    const height = parseFloat(e.target.style.height.replace('px', ''));
    
    log('ClickableImagePlaceholder', 'onResizeEnd', {
      elementId,
      instanceId,
      width,
      height,
      position: { x, y },
      finalWidth: e.target.style.width,
      finalHeight: e.target.style.height,
      isFinal: true
    });
    
    onSizeTransformChange?.({
      imagePosition: { x, y },
      imageSize: { width, height },
      elementId: elementId,
      final: true
    });
  }, [onSizeTransformChange, elementId, instanceId]);

  const handleRotateStart = useCallback(() => {
    setIsRotating(true);
    log('ClickableImagePlaceholder', 'rotateStart', { elementId, instanceId });
  }, [elementId, instanceId]);

  const handleRotateEnd = useCallback(() => {
    setIsRotating(false);
    log('ClickableImagePlaceholder', 'rotateEnd', { elementId, instanceId });
  }, [elementId, instanceId]);

  // ✅ NEW: Click handler for activating anchors
  const handleImageClick = useCallback((e: React.MouseEvent) => {
    if (!isEditable) return;
    
    // Prevent event bubbling
    e.stopPropagation();
    
    // Toggle selection state
    setIsSelected(!isSelected);
    log('ClickableImagePlaceholder', 'imageClick', { 
      elementId, 
      instanceId,
      newSelectionState: !isSelected 
    });
  }, [isEditable, isSelected, elementId, instanceId]);

  // ✅ ENHANCED: Right-click handler with comprehensive logging and targeting
  const handleRightClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditable || !displayedImage) {
      console.log('🔍 [RightClick] BLOCKED', {
        elementId,
        instanceId,
        isEditable,
        hasDisplayedImage: !!displayedImage,
        timestamp: Date.now()
      });
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    // Add visual feedback - flash the element
    const targetElement = e.currentTarget as HTMLElement;
    targetElement.style.transition = 'box-shadow 0.2s ease-in-out';
    targetElement.style.boxShadow = '0 0 0 4px rgba(34, 197, 94, 0.5)';
    setTimeout(() => {
      targetElement.style.boxShadow = '';
    }, 300);
    
    // Capture detailed event information
    const eventDetails = {
      elementId,
      instanceId,
      clientX: e.clientX,
      clientY: e.clientY,
      pageX: e.pageX,
      pageY: e.pageY,
      target: targetElement,
      targetTagName: targetElement.tagName,
      targetClassName: targetElement.className,
      targetDataset: targetElement.dataset,
      currentActiveMenu: globalContextMenuState.currentMenu?.instanceId,
      displayedImage,
      containerRef: containerRef.current,
      containerRefExists: !!containerRef.current,
      timestamp: Date.now()
    };
    
    console.log('🔍 [RightClick] EVENT CAPTURED', eventDetails);
    
    // Verify the target element
    const targetInstanceId = targetElement.getAttribute('data-instance-id');
    const targetElementId = targetElement.getAttribute('data-moveable-element');
    
    console.log('🔍 [RightClick] TARGET VERIFICATION', {
      expectedInstanceId: instanceId,
      actualInstanceId: targetInstanceId,
      expectedElementId: elementId,
      actualElementId: targetElementId,
      match: targetInstanceId === instanceId && targetElementId === elementId
    });
    
    // Close any existing menu first
    console.log('🔍 [RightClick] Closing existing menus...');
    globalContextMenuState.closeAll();
    
    // Set this as the active menu
    console.log('🔍 [RightClick] Setting active menu', { instanceId });
    globalContextMenuState.setActiveMenu(instanceId, hideContextMenu);
    
    // Prepare debug info for context menu
    const debugInfo = {
      slideId: elementId?.split('-')[0], // Extract slide ID from element ID
      elementId,
      imagePath: displayedImage,
      clickPosition: { x: e.clientX, y: e.clientY }
    };
    
    // Open the context menu for THIS instance - SIMPLIFIED like the working example
    console.log('🔍 [RightClick] Opening context menu', {
      instanceId,
      position: { x: e.clientX, y: e.clientY },
      targetElementRect: targetElement.getBoundingClientRect(),
      debugInfo
    });
    
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY
    });
    
    // Store debug info for context menu
    setContextMenuDebugInfo(debugInfo);
    
  }, [isEditable, displayedImage, elementId, instanceId, hideContextMenu]);

  // ✅ SIMPLIFIED: Context menu handlers like the working example
  const handleReplaceImage = useCallback(() => {
    console.log('🔍 [HandleReplaceImage] Executing', { 
      elementId,
      instanceId,
      contextMenuVisible: contextMenu.visible,
      currentImage: !!displayedImage,
      debugInfo: contextMenuDebugInfo,
      timestamp: Date.now()
    });
    
    hideContextMenu();
    setShowUploadModal(true);
  }, [elementId, instanceId, contextMenu.visible, displayedImage, hideContextMenu, contextMenuDebugInfo]);

  const handleRemoveImage = useCallback(() => {
    console.log('🔍 [HandleRemoveImage] Executing', { 
      elementId,
      instanceId,
      contextMenuVisible: contextMenu.visible,
      currentImage: !!displayedImage,
      debugInfo: contextMenuDebugInfo,
      timestamp: Date.now()
    });
    
    hideContextMenu();
    setDisplayedImage(undefined);
    onImageUploaded('');
    setIsSelected(false);
  }, [onImageUploaded, elementId, instanceId, contextMenu.visible, displayedImage, hideContextMenu, contextMenuDebugInfo]);

  // ✅ NEW: Click handler for empty placeholder
  const handlePlaceholderClick = useCallback(() => {
    if (!isEditable) return;
      setShowUploadModal(true);
    log('ClickableImagePlaceholder', 'placeholderClick', { 
      elementId, 
      instanceId 
    });
  }, [isEditable, elementId, instanceId]);

  // Handle image upload and open edit modal
  const handleImageUploaded = (newImagePath: string, imageFile?: File) => {
    log('ClickableImagePlaceholder', 'handleImageUploaded', {
      elementId,
      instanceId,
      hasImageFile: !!imageFile,
      newImagePath: !!newImagePath
    });

    if (imageFile) {
      // Store the file and open the edit modal
      setPendingImageFile(imageFile);
      setShowImageEditModal(true);
    } else {
      // Direct upload without file (fallback)
      onImageUploaded(newImagePath);
      setDisplayedImage(newImagePath);
    }
  };

  // Get placeholder dimensions for the modal
  const getPlaceholderDimensions = useCallback(() => {
    if (!containerRef.current) {
      // Fallback dimensions based on size prop
      const fallbackDimensions = {
        'LARGE': { width: 400, height: 300 },
        'MEDIUM': { width: 300, height: 200 },
        'SMALL': { width: 200, height: 150 }
      };
      return fallbackDimensions[size];
    }

    const rect = containerRef.current.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }, [containerRef, size]);

  // Handle modal confirm crop
  const handleConfirmCrop = useCallback((croppedImagePath: string) => {
    log('ClickableImagePlaceholder', 'handleConfirmCrop', {
      elementId,
      instanceId,
      croppedImagePath: !!croppedImagePath
    });

    onImageUploaded(croppedImagePath);
    setDisplayedImage(croppedImagePath);
    setShowImageEditModal(false);
    setPendingImageFile(null);
  }, [onImageUploaded, elementId, instanceId]);

  // Handle modal do not crop
  const handleDoNotCrop = useCallback((originalImagePath: string) => {
    log('ClickableImagePlaceholder', 'handleDoNotCrop', {
      elementId,
      instanceId,
      originalImagePath: !!originalImagePath
    });

    onImageUploaded(originalImagePath);
    setDisplayedImage(originalImagePath);
    setShowImageEditModal(false);
    setPendingImageFile(null);
  }, [onImageUploaded, elementId, instanceId]);

  // Handle modal cancel
  const handleModalCancel = useCallback(() => {
    log('ClickableImagePlaceholder', 'handleModalCancel', { 
      elementId, 
      instanceId 
    });

    setShowImageEditModal(false);
    setPendingImageFile(null);
  }, [elementId, instanceId]);

  // Finalize image upload
  const finalizeImageUpload = useCallback(async (imagePath: string) => {
    log('ClickableImagePlaceholder', 'finalizeImageUpload', {
      elementId,
      instanceId,
      imagePath: !!imagePath
    });

    onImageUploaded(imagePath);
    setDisplayedImage(imagePath);
    
    // Load image to get dimensions
    const tmp = new window.Image();
    tmp.onload = () => {
      const imgW = tmp.naturalWidth || tmp.width;
      const imgH = tmp.naturalHeight || tmp.height;
      
      if (imgW > 0 && imgH > 0) {
        setImageDimensions({ width: imgW, height: imgH });
        
        onSizeTransformChange?.({
          objectFit: cropMode,
          imageScale: 1,
          imageOffset: { x: 0, y: 0 }
        });
      }
    };
    tmp.src = imagePath;
  }, [onImageUploaded, onSizeTransformChange, cropMode, elementId, instanceId]);

  // ✅ NEW: Updated Moveable component with click-to-activate
  const renderMoveable = () => {
    if (!isEditable || !containerRef.current || !isSelected) return null;

    return (
      <Moveable
        target={containerRef.current}
        draggable={true}
        throttleDrag={1}
        edgeDraggable={false}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        resizable={true}
        keepRatio={false}
        throttleResize={1}
        renderDirections={["nw","n","ne","w","e","sw","s","se"]}
        onResizeStart={handleResizeStart}
        onResize={e => {
          e.target.style.width = `${e.width}px`;
          e.target.style.height = `${e.height}px`;
          e.target.style.transform = e.drag.transform;
          
          // Extract position and size
          const transformMatch = e.drag.transform.match(/translate\(([^)]+)\)/);
          const x = transformMatch ? parseFloat(transformMatch[1].split(',')[0].replace('px', '')) : 0;
          const y = transformMatch ? parseFloat(transformMatch[1].split(',')[1].replace('px', '')) : 0;
          
          log('ClickableImagePlaceholder', 'onResize', {
            elementId,
            instanceId,
            width: e.width,
            height: e.height,
            position: { x, y },
            appliedWidth: e.target.style.width,
            appliedHeight: e.target.style.height
          });
          
          // Call onSizeTransformChange with both position and size
          onSizeTransformChange?.({
            imagePosition: { x, y },
            imageSize: { width: e.width, height: e.height },
            elementId: elementId
          });
        }}
        onResizeEnd={handleResizeEnd}
        rotatable={true}
        onRotateStart={handleRotateStart}
        onRotate={(e) => {
          e.target.style.transform = e.drag.transform;
        }}
        onRotateEnd={handleRotateEnd}
      />
    );
  };

  // Regular image display
  if (displayedImage) {
    return (
      <>
        <div 
          ref={containerRef}
          data-moveable-element={elementId}
          data-instance-id={instanceId}
          data-debug-slide={elementId?.split('-')[0]}
          data-debug-element={elementId}
                      className={`
              ${positionClasses[position]} 
              relative overflow-hidden rounded-lg
              ${isEditable ? 'cursor-pointer' : ''}
              ${isSelected ? 'ring-2 ring-blue-500' : ''}
              ${contextMenu.visible ? 'ring-2 ring-green-500 ring-opacity-75' : ''}
              ${className}
            `}
          style={{
            ...(style || {}),
          }}
          onClick={handleImageClick}
          onContextMenu={handleRightClick}
        >
          <img 
            ref={imgRef}
            src={displayedImage}
            alt="Uploaded content"
            className="w-full h-full object-cover"
              style={{
              objectFit: cropMode
            }}
          />
          
          {/* ✅ NEW: Selection indicator */}
          {isSelected && (
            <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
              <MoreVertical className="w-4 h-4" />
            </div>
          )}
        </div>

        {renderMoveable()}

        <PresentationImageUpload
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onImageUploaded={handleImageUploaded}
          title="Replace Image"
        />

        <ImageEditModal
          isOpen={showImageEditModal}
          onClose={() => setShowImageEditModal(false)}
          imageFile={pendingImageFile}
          placeholderDimensions={getPlaceholderDimensions()}
          onConfirmCrop={handleConfirmCrop}
          onDoNotCrop={handleDoNotCrop}
          onCancel={handleModalCancel}
        />

        <ContextMenu
          visible={contextMenu.visible}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={hideContextMenu}
          onReplaceImage={handleReplaceImage}
          onRemoveImage={handleRemoveImage}
          targetElementId={elementId}
          instanceId={instanceId}
          debugInfo={contextMenuDebugInfo}
        />
      </>
    );
  }

  // Placeholder when no image
  return (
    <>
      <div 
        ref={containerRef}
        data-moveable-element={elementId}
        data-instance-id={instanceId} // NEW: Add instance tracking
        className={`
          ${positionClasses[position]} 
          bg-gradient-to-br from-blue-100 to-purple-100 
          border-2 border-dashed border-gray-300 
          rounded-lg flex items-center justify-center 
          text-gray-500 text-sm
          ${position === 'BACKGROUND' ? 'opacity-20' : ''}
          ${isEditable ? 'hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer' : ''}
          ${className}
        `}
        style={{
          ...(style || {}),
        }}
        onClick={handlePlaceholderClick}
      >
        <div className="text-center p-4">
          <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <div className="font-medium">{size} Image</div>
          <div className="text-xs mt-1 opacity-75">{description}</div>
          {prompt && (
            <div className="text-xs mt-1 opacity-60 italic">
              "{prompt}"
            </div>
          )}
          {isEditable && (
            <div className="text-xs mt-2 text-blue-600 font-medium">
              Click to upload
            </div>
          )}
        </div>
      </div>

      <PresentationImageUpload
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onImageUploaded={handleImageUploaded}
        title="Upload Image"
      />

      <ImageEditModal
        isOpen={showImageEditModal}
        onClose={() => setShowImageEditModal(false)}
        imageFile={pendingImageFile}
        placeholderDimensions={getPlaceholderDimensions()}
        onConfirmCrop={handleConfirmCrop}
        onDoNotCrop={handleDoNotCrop}
        onCancel={handleModalCancel}
      />
    </>
  );
};

export default ClickableImagePlaceholder; 