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
  return (
    <div className={`group rounded-3xl relative overflow-hidden transition-all duration-300 bg-white border border-gray-200 shadow-lg hover:shadow-xl ${className}`}>
      {/* Gradient at top right corner */}
      <div className={`absolute top-0 right-0 w-44 rotate-45 blur-2xl h-34 bg-gradient-to-br from-${gradientColors.from} to-${gradientColors.to} rounded-bl-3xl opacity-60`} />
      
      <div className="relative p-6 h-full flex flex-col">
        {/* Icon section */}
        <div className="flex items-start justify-start h-16 relative mb-3">
          {Icon ? (
            <Icon size={40} className={`text-${iconColor}`} />
          ) : (
            <div className={`w-6 h-6 rounded-full bg-${iconColor}`}></div>
          )}
        </div>
        
        {/* Text section */}
        <div className="flex flex-col items-start gap-3 flex-1 justify-start">
          <h3 className={`text-xl font-semibold text-${textColor}`}>
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