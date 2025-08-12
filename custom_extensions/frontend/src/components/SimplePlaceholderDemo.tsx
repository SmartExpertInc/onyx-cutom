'use client';

import React, { useState } from 'react';
import { SimplePlaceholder } from './SimplePlaceholder';
import RefactoredClickableImagePlaceholder from './RefactoredClickableImagePlaceholder';

/**
 * Demo component to test the new SimplePlaceholder implementation
 * following react-moveable official examples exactly.
 */
export const SimplePlaceholderDemo: React.FC = () => {
  const [isEditable, setIsEditable] = useState(true);
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [sizes, setSizes] = useState<Record<string, { width: number; height: number }}>({});

  const handlePositionChange = (elementId: string, position: { x: number; y: number }) => {
    console.log('Position changed:', elementId, position);
    setPositions(prev => ({ ...prev, [elementId]: position }));
  };

  const handleSizeChange = (elementId: string, size: { width: number; height: number }) => {
    console.log('Size changed:', elementId, size);
    setSizes(prev => ({ ...prev, [elementId]: size }));
  };

  const handleImageUploaded = (imagePath: string) => {
    console.log('Image uploaded:', imagePath);
  };

  return (
    <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
          SimplePlaceholder Demo
        </h1>
        <p style={{ color: '#666', marginBottom: '10px' }}>
          Testing the new react-moveable implementation following official examples.
        </p>
        <button
          onClick={() => setIsEditable(!isEditable)}
          style={{
            padding: '8px 16px',
            backgroundColor: isEditable ? '#10b981' : '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isEditable ? 'Editing ON' : 'Editing OFF'}
        </button>
      </div>

      <div style={{ position: 'relative', width: '100%', height: '600px', border: '2px dashed #ccc', borderRadius: '8px' }}>
        {/* Simple text placeholder */}
        <SimplePlaceholder
          elementId="text-placeholder-1"
          isEditable={isEditable}
          onPositionChange={handlePositionChange}
          onSizeChange={handleSizeChange}
          initialPosition={{ x: 50, y: 50 }}
          initialSize={{ width: 200, height: 100 }}
          minWidth={100}
          minHeight={50}
          style={{ backgroundColor: '#e0f2fe', border: '1px solid #0891b2', borderRadius: '4px' }}
        >
          <div style={{ padding: '16px', textAlign: 'center' }}>
            <h3 style={{ margin: 0, color: '#0891b2' }}>Text Placeholder</h3>
            <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#0369a1' }}>
              Drag me around!
            </p>
          </div>
        </SimplePlaceholder>

        {/* Simple image placeholder */}
        <SimplePlaceholder
          elementId="image-placeholder-1"
          isEditable={isEditable}
          onPositionChange={handlePositionChange}
          onSizeChange={handleSizeChange}
          initialPosition={{ x: 300, y: 50 }}
          initialSize={{ width: 250, height: 150 }}
          minWidth={100}
          minHeight={100}
          keepRatio={true}
          style={{ backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '4px' }}
        >
          <div style={{ 
            padding: '16px', 
            textAlign: 'center', 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center' 
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🖼️</div>
            <h3 style={{ margin: 0, color: '#d97706' }}>Image Placeholder</h3>
            <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#92400e' }}>
              Resize with aspect ratio!
            </p>
          </div>
        </SimplePlaceholder>

        {/* Refactored ClickableImagePlaceholder */}
        <div style={{ position: 'absolute', left: '50px', top: '250px' }}>
          <RefactoredClickableImagePlaceholder
            elementId="refactored-image-1"
            isEditable={isEditable}
            onImageUploaded={handleImageUploaded}
            size="MEDIUM"
            position="CENTER"
            description="Refactored Image Placeholder"
            prompt="Click to upload an image"
          />
        </div>

        {/* Another text placeholder */}
        <SimplePlaceholder
          elementId="text-placeholder-2"
          isEditable={isEditable}
          onPositionChange={handlePositionChange}
          onSizeChange={handleSizeChange}
          initialPosition={{ x: 100, y: 400 }}
          initialSize={{ width: 300, height: 80 }}
          minWidth={150}
          minHeight={40}
          style={{ backgroundColor: '#dcfce7', border: '1px solid #16a34a', borderRadius: '4px' }}
        >
          <div style={{ padding: '16px', textAlign: 'center' }}>
            <h3 style={{ margin: 0, color: '#16a34a' }}>Another Text Block</h3>
            <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#15803d' }}>
              Free form resizing
            </p>
          </div>
        </SimplePlaceholder>
      </div>

      {/* Debug info */}
      <div style={{ marginTop: '20px', padding: '16px', backgroundColor: 'white', borderRadius: '8px' }}>
        <h3>Debug Info</h3>
        <div style={{ fontSize: '14px', fontFamily: 'monospace' }}>
          <div><strong>Positions:</strong> {JSON.stringify(positions, null, 2)}</div>
          <div><strong>Sizes:</strong> {JSON.stringify(sizes, null, 2)}</div>
        </div>
      </div>
    </div>
  );
};

export default SimplePlaceholderDemo;
