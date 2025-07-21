import React from 'react';
import { BulletPointsProps } from '@/types/slideTemplates';

export const BulletPoints: React.FC<BulletPointsProps> = ({ 
  slideId, 
  slideNumber, 
  title, 
  bullets, 
  layout = 'single-column' 
}) => {
  const isTwoColumn = layout === 'two-column' && bullets.length >= 4;
  const midpoint = isTwoColumn ? Math.ceil(bullets.length / 2) : bullets.length;
  const leftBullets = bullets.slice(0, midpoint);
  const rightBullets = isTwoColumn ? bullets.slice(midpoint) : [];

  return (
    <div 
      className="bullet-points-template"
      style={{
        minHeight: '100vh',
        padding: '3rem',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '3rem',
        }}
      >
        <h1 
          style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            fontWeight: '700',
            color: '#1F2937',
            margin: '0',
          }}
        >
          {title.text}
        </h1>
        
        <div 
          style={{
            fontSize: '1rem',
            color: '#6B7280',
            fontWeight: '500',
          }}
        >
          Slide {slideNumber}
        </div>
      </div>

      {/* Bullets container */}
      <div 
        style={{
          flex: '1',
          display: 'grid',
          gridTemplateColumns: isTwoColumn ? '1fr 1fr' : '1fr',
          gap: isTwoColumn ? '3rem' : '0',
          alignContent: 'start',
        }}
      >
        {/* Left column or single column */}
        <div>
          {leftBullets.map((bullet, index) => (
            <div 
              key={index}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: '1.5rem',
                padding: '1rem',
                background: '#F8FAFC',
                borderRadius: '0.75rem',
                border: '1px solid #E2E8F0',
                transition: 'all 0.2s ease',
              }}
            >
              <div 
                style={{
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  marginRight: '1rem',
                  flexShrink: 0,
                }}
              >
                {index + 1}
              </div>
              <div 
                style={{
                  fontSize: '1.1rem',
                  color: '#374151',
                  lineHeight: '1.5',
                }}
              >
                {bullet.text}
              </div>
            </div>
          ))}
        </div>

        {/* Right column for two-column layout */}
        {isTwoColumn && (
          <div>
            {rightBullets.map((bullet, index) => (
              <div 
                key={midpoint + index}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  background: '#F8FAFC',
                  borderRadius: '0.75rem',
                  border: '1px solid #E2E8F0',
                  transition: 'all 0.2s ease',
                }}
              >
                <div 
                  style={{
                    width: '2rem',
                    height: '2rem',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10B981, #047857)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    marginRight: '1rem',
                    flexShrink: 0,
                  }}
                >
                  {midpoint + index + 1}
                </div>
                <div 
                  style={{
                    fontSize: '1.1rem',
                    color: '#374151',
                    lineHeight: '1.5',
                  }}
                >
                  {bullet.text}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer decoration */}
      <div 
        style={{
          marginTop: '2rem',
          textAlign: 'center',
        }}
      >
        <div 
          style={{
            width: '4rem',
            height: '2px',
            background: 'linear-gradient(90deg, #3B82F6, #10B981)',
            margin: '0 auto',
            borderRadius: '1px',
          }}
        />
      </div>
    </div>
  );
};

export default BulletPoints; 