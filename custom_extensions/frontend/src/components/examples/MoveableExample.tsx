'use client';

import React, { useRef } from 'react';
import Moveable from 'react-moveable';

/**
 * Simple example demonstrating the refactored moveable functionality
 * following the exact pattern from official react-moveable examples.
 */
export const MoveableExample: React.FC = () => {
  const targetRef = useRef<HTMLDivElement>(null);

  return (
    <div className="root" style={{ padding: '20px' }}>
      <h2>Moveable Example - Following Official Pattern</h2>
      
      <div className="container" style={{ position: 'relative', width: '600px', height: '400px', border: '1px solid #ccc' }}>
        {/* Draggable and Resizable Target */}
        <div 
          className="target" 
          ref={targetRef} 
          style={{
            position: 'absolute',
            top: '50px',
            left: '50px',
            width: '200px',
            height: '150px',
            backgroundColor: '#3b82f6',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 'bold',
            borderRadius: '8px',
            maxWidth: "auto",
            maxHeight: "auto",
            minWidth: "auto",
            minHeight: "auto",
          }}
        >
          Drag & Resize Me
        </div>
        
        {/* Moveable Controls - EXACT PATTERN FROM OFFICIAL EXAMPLES */}
        <Moveable
          target={targetRef.current}
          draggable={true}
          resizable={true}
          keepRatio={false}
          throttleResize={1}
          renderDirections={["nw","n","ne","w","e","sw","s","se"]}
          onDrag={e => {
            e.target.style.transform = e.transform;
          }}
          onResize={e => {
            e.target.style.width = `${e.width}px`;
            e.target.style.height = `${e.height}px`;
            e.target.style.transform = e.drag.transform;
          }}
        />
      </div>
      
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p><strong>Features:</strong></p>
        <ul>
          <li>✅ Draggable anywhere within the container</li>
          <li>✅ Resizable from all 8 handles</li>
          <li>✅ Smooth, instant updates without flicker</li>
          <li>✅ No custom logic - pure react-moveable</li>
          <li>✅ Follows official example pattern exactly</li>
        </ul>
      </div>
    </div>
  );
};

export default MoveableExample;
