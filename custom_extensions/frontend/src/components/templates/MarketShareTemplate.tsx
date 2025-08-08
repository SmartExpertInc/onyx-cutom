// custom_extensions/frontend/src/components/templates/MarketShareTemplate.tsx

'use client';

import React from 'react';
import { BaseTemplateProps } from '@/types/slideTemplates';

// Market Share Template Props
export interface MarketShareTemplateProps extends BaseTemplateProps {
  title: string;
  subtitle?: string;
  primaryMetric: {
    label: string;
    description: string;
    percentage?: number;
    color?: string;
  };
  secondaryMetric: {
    label: string;
    description: string;
    percentage?: number;
    color?: string;
  };
  chartData?: {
    primaryValue: number;
    secondaryValue: number;
    primaryColor?: string;
    secondaryColor?: string;
  };
  backgroundColor?: string;
  titleColor?: string;
  textColor?: string;
  accentColor?: string;
  theme?: any;
}

export const MarketShareTemplate: React.FC<MarketShareTemplateProps> = ({
  title = 'Market share',
  subtitle,
  primaryMetric = {
    label: 'Mercury',
    description: 'Mercury is the closest planet to the Sun',
    percentage: 85,
    color: '#2a5490'
  },
  secondaryMetric = {
    label: 'Mars',
    description: 'Despite being red, Mars is a cold place',
    percentage: 40,
    color: '#9ca3af'
  },
  chartData = {
    primaryValue: 85,
    secondaryValue: 40,
    primaryColor: '#2a5490',
    secondaryColor: '#9ca3af'
  },
  backgroundColor = '#ffffff',
  titleColor = '#1f2937',
  textColor = '#374151',
  accentColor = '#2a5490',
  theme
}) => {
  // Theme-based color adaptation
  const getThemeAwareColor = (lightColor: string, darkColor?: string) => {
    if (theme?.name === 'dark' || theme?.backgroundColor === '#1a1a2e') {
      return darkColor || lightColor;
    }
    return lightColor;
  };

  const themeBackgroundColor = theme?.backgroundColor || backgroundColor;
  const themeTitleColor = theme?.headingColor || titleColor;
  const themeTextColor = theme?.textColor || textColor;
  const themeAccentColor = theme?.accentColor || accentColor;

  // Adjust chart colors for theme
  const finalPrimaryColor = getThemeAwareColor(chartData.primaryColor || '#2a5490', '#4f83cc');
  const finalSecondaryColor = getThemeAwareColor(chartData.secondaryColor || '#9ca3af', '#d1d5db');

  // Create chart bars with relative heights
  const maxValue = Math.max(chartData.primaryValue, chartData.secondaryValue, 100);
  const primaryHeight = (chartData.primaryValue / maxValue) * 100;
  const secondaryHeight = (chartData.secondaryValue / maxValue) * 100;

  return (
    <div 
      className="relative w-full h-full flex flex-col justify-center items-center p-8 font-sans"
      style={{ 
        backgroundColor: themeBackgroundColor,
        minHeight: '600px'
      }}
    >
      {/* Main Content Container */}
      <div className="w-full max-w-5xl mx-auto">
        
        {/* Title */}
        <div className="text-center mb-12">
          <h1 
            className="text-5xl font-bold mb-4"
            style={{ color: themeTitleColor }}
          >
            {title}
          </h1>
          {subtitle && (
            <p 
              className="text-xl opacity-80"
              style={{ color: themeTextColor }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Main Chart and Legend Container */}
        <div className="flex items-center justify-center gap-16">
          
          {/* Chart Section */}
          <div className="flex flex-col items-center">
            
            {/* Chart Container */}
            <div className="flex items-end justify-center gap-8 mb-8 h-72">
              
              {/* Time Period Labels */}
              <div className="flex flex-col items-center gap-16">
                <div className="w-24 text-center">
                  <div 
                    className="rounded-lg shadow-lg mb-3 transition-all duration-300 hover:shadow-xl"
                    style={{ 
                      backgroundColor: finalPrimaryColor,
                      height: `${primaryHeight * 2}px`,
                      minHeight: '120px',
                      width: '60px'
                    }}
                  ></div>
                  <p 
                    className="text-sm font-medium opacity-70"
                    style={{ color: themeTextColor }}
                  >
                    20XX
                  </p>
                </div>

                <div className="w-24 text-center">
                  <div 
                    className="rounded-lg shadow-lg mb-3 transition-all duration-300 hover:shadow-xl"
                    style={{ 
                      backgroundColor: finalSecondaryColor,
                      height: `${secondaryHeight * 2}px`,
                      minHeight: '80px',
                      width: '60px'
                    }}
                  ></div>
                  <p 
                    className="text-sm font-medium opacity-70"
                    style={{ color: themeTextColor }}
                  >
                    20XX
                  </p>
                </div>
              </div>
            </div>

            {/* Chart Legend Note */}
            <div className="text-center max-w-md">
              <p 
                className="text-sm opacity-70 leading-relaxed"
                style={{ color: themeTextColor }}
              >
                Follow the link in the graph to modify its data and then paste the new one here. <span className="font-semibold">For more info, click here</span>
              </p>
            </div>
          </div>

          {/* Legend Section */}
          <div className="flex flex-col gap-8">
            
            {/* Primary Metric */}
            <div className="flex items-start gap-4">
              <div 
                className="w-4 h-4 rounded-full mt-1 flex-shrink-0"
                style={{ backgroundColor: finalPrimaryColor }}
              ></div>
              <div>
                <h3 
                  className="text-2xl font-bold mb-2"
                  style={{ color: themeTitleColor }}
                >
                  {primaryMetric.label}
                </h3>
                <p 
                  className="text-base leading-relaxed max-w-xs"
                  style={{ color: themeTextColor }}
                >
                  {primaryMetric.description}
                </p>
              </div>
            </div>

            {/* Secondary Metric */}
            <div className="flex items-start gap-4">
              <div 
                className="w-4 h-4 rounded-full mt-1 flex-shrink-0"
                style={{ backgroundColor: finalSecondaryColor }}
              ></div>
              <div>
                <h3 
                  className="text-2xl font-bold mb-2"
                  style={{ color: themeTitleColor }}
                >
                  {secondaryMetric.label}
                </h3>
                <p 
                  className="text-base leading-relaxed max-w-xs"
                  style={{ color: themeTextColor }}
                >
                  {secondaryMetric.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Navigation Dots */}
      <div className="absolute bottom-8 left-8 flex gap-3">
        <div 
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: themeTextColor, opacity: 0.3 }}
        ></div>
        <div 
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: themeTextColor, opacity: 0.7 }}
        ></div>
      </div>
      
      <div className="absolute bottom-8 right-8 flex gap-3">
        <div 
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: themeTextColor, opacity: 0.3 }}
        ></div>
        <div 
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: themeTextColor, opacity: 0.7 }}
        ></div>
      </div>
    </div>
  );
};

export default MarketShareTemplate;