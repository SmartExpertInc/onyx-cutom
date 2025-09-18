import React from 'react';
import { LucideIcon, Check } from 'lucide-react';
import Image from 'next/image';

export interface ConnectorCardProps {
  title: string;
  value?: string | number;
  icon?: LucideIcon;
  iconSrc?: string;
  gradientColors?: {
    from: string;
    to: string;
  };
  textColor?: string;
  iconColor?: string;
  className?: string;
  // Selection props
  isSelected?: boolean;
  onSelect?: () => void;
  selectable?: boolean;
  // Hover effect props
  showHoverEffect?: boolean;
  hoverGradientColors?: {
    from: string;
    to: string;
  };
}

export const ConnectorCard: React.FC<ConnectorCardProps> = ({
  title,
  value,
  icon: Icon,
  iconSrc,
  gradientColors = { from: 'blue-300', to: 'indigo-200' },
  textColor = 'blue-600',
  iconColor = 'blue-600',
  className = '',
  isSelected = false,
  onSelect,
  selectable = false,
  showHoverEffect = false,
  hoverGradientColors = { from: 'blue-500', to: 'purple-500' }
}) => {
  // Create a mapping for gradient classes to ensure Tailwind includes them

  const getIconColorClass = (color: string) => {
    const iconColorMap: Record<string, string> = {
      'green-500': 'text-green-500',
      'yellow-500': 'text-yellow-500',
      'red-500': 'text-red-500',
      'gray-500': 'text-gray-500',
      'blue-600': 'text-blue-600',
      'purple-600': 'text-purple-600'
    };
    return iconColorMap[color] || 'text-blue-600';
  };

  const getIconBgClass = (color: string) => {
    const iconBgMap: Record<string, string> = {
      'green-500': 'bg-green-500',
      'yellow-500': 'bg-yellow-500',
      'red-500': 'bg-red-500',
      'gray-500': 'bg-gray-500'
    };
    return iconBgMap[color] || 'bg-blue-600';
  };

  const getHoverGradientClass = (from: string, to: string) => {
    const hoverGradientMap: Record<string, string> = {
      'blue-500-purple-500': 'from-blue-500/5 to-purple-500/5',
      'blue-500-blue-600': 'from-blue-500/5 to-blue-600/5',
      'purple-500-pink-500': 'from-purple-500/5 to-pink-500/5',
      'green-500-emerald-500': 'from-green-500/5 to-emerald-500/5'
    };
    const key = `${from}-${to}`;
    return hoverGradientMap[key] || 'from-blue-500/5 to-purple-500/5';
  };

  return (
    <div 
      className={`group bg-linear-to-b from-white via-[#F2F9FC] to-[#F2F9FC] rounded-lg relative overflow-hidden transition-all duration-200 w-full h-full ${
        selectable 
          ? `cursor-pointer ${
              isSelected 
                ? 'border-blue-300 shadow-lg bg-blue-50' 
                : 'border-gray-200 hover:shadow-xl hover:border-blue-300'
            }`
          : 'border-gray-200'
      } ${className}`}
      onClick={selectable ? onSelect : undefined}
    >
      {/* Selection Indicator */}
      {selectable && (
        <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
          isSelected
            ? 'bg-blue-600 border-blue-600'
            : 'border-gray-300 group-hover:border-blue-400'
        }`}>
          {isSelected && (
            <Check size={14} className="text-white" />
          )}
        </div>
      )}

      {/* Gradient at top right corner */}
      <div className="absolute -top-20 -left-22 w-110 h-110 bg-blue-50/50 rounded-full border-indigo-100/80" />
      <div className="absolute -top-12 -left-12 w-80 h-80 bg-blue-100/30 rounded-full border-indigo-100/80" />

      <div className="relative p-6 h-full flex flex-col">
        {/* Icon section */}
        <div className="flex items-start justify-start h-16 relative mb-3">
          {iconSrc ? (
            <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden">
              <Image
                src={iconSrc}
                alt={`${title} logo`}
                width={32}
                height={32}
                className="object-contain w-8 h-8"
                priority={false}
                unoptimized={true}
              />
            </div>
          ) : Icon ? (
            <Icon size={40} className={getIconColorClass(iconColor)} />
          ) : (
            <div className={`w-6 h-6 rounded-full ${getIconBgClass(iconColor)}`}></div>
          )}
        </div>
        
        {/* Text section */}
        <div className="flex flex-col items-start gap-3 flex-1 justify-start">
          <h3 className={`text-xl font-semibold text-blue-600`}>
            {title}
          </h3>
          {value !== undefined && (
            <p className="text-lg text-gray-600">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
          )}
        </div>
      </div>

      {/* Hover Effect */}
      {showHoverEffect && (
        <div className={`absolute inset-0 bg-gradient-to-br ${getHoverGradientClass(hoverGradientColors.from, hoverGradientColors.to)} rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}></div>
      )}
    </div>
  );
};

export default ConnectorCard;