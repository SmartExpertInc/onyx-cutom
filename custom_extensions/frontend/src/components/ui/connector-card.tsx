import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface ConnectorCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  gradientColors?: {
    from: string;
    to: string;
  };
  textColor?: string;
  iconColor?: string;
  className?: string;
}

export const ConnectorCard: React.FC<ConnectorCardProps> = ({
  title,
  value,
  icon: Icon,
  gradientColors = { from: 'blue-300', to: 'indigo-200' },
  textColor = 'blue-600',
  iconColor = 'blue-600',
  className = ''
}) => {
  // Create a mapping for gradient classes to ensure Tailwind includes them
  const getGradientClass = (from: string, to: string) => {
    const gradientMap: Record<string, string> = {
      'green-300-emerald-200': 'bg-gradient-to-br from-green-300 to-emerald-200',
      'yellow-300-amber-200': 'bg-gradient-to-br from-yellow-300 to-amber-200',
      'red-300-rose-200': 'bg-gradient-to-br from-red-300 to-rose-200',
      'gray-300-slate-200': 'bg-gradient-to-br from-gray-300 to-slate-200',
      'blue-300-indigo-200': 'bg-gradient-to-br from-blue-300 to-indigo-200',
      'purple-300-pink-200': 'bg-gradient-to-br from-purple-300 to-pink-200'
    };
    const key = `${from}-${to}`;
    return gradientMap[key] || 'bg-gradient-to-br from-blue-300 to-indigo-200';
  };

  const getTextColorClass = (color: string) => {
    const textColorMap: Record<string, string> = {
      'green-600': 'text-green-600',
      'yellow-600': 'text-yellow-600',
      'red-600': 'text-red-600',
      'gray-600': 'text-gray-600',
      'blue-600': 'text-blue-600',
      'purple-600': 'text-purple-600'
    };
    return textColorMap[color] || 'text-blue-600';
  };

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

  return (
    <div className={`group rounded-3xl relative overflow-hidden transition-all duration-300 bg-white border border-gray-200 shadow-lg hover:shadow-xl ${className}`}>
      {/* Gradient at top right corner */}
      <div className={`absolute top-0 right-0 w-44 rotate-45 blur-2xl h-34 ${getGradientClass(gradientColors.from, gradientColors.to)} rounded-bl-3xl opacity-60`} />
      
      <div className="relative p-6 h-full flex flex-col">
        {/* Icon section */}
        <div className="flex items-start justify-start h-16 relative mb-3">
          {Icon ? (
            <Icon size={40} className={getIconColorClass(iconColor)} />
          ) : (
            <div className={`w-6 h-6 rounded-full ${getIconBgClass(iconColor)}`}></div>
          )}
        </div>
        
        {/* Text section */}
        <div className="flex flex-col items-start gap-3 flex-1 justify-start">
          <h3 className={`text-xl font-semibold ${getTextColorClass(textColor)}`}>
            {title}
          </h3>
          <p className="text-lg text-gray-600">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConnectorCard;