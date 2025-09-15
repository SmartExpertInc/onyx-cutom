"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  MoreHorizontal,
  Lock,
  TableOfContents,
  HelpCircle,
  Presentation,
  Video,
  FileText,
  List
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Product } from '../types/lmsTypes';
import { Checkbox } from './ui/checkbox';

interface LMSProductCardProps {
  product: Product;
  isSelected: boolean;
  onToggleSelect: (productId: number) => void;
}

// Helper function to get product type icon - copied from ProjectsTable
const getDesignMicroproductIcon = (type: string): React.ReactElement => {
  const iconSize = 16;
  const iconClass = "text-black";

  switch (type) {
    case "Training Plan":
      return <TableOfContents size={iconSize} className={iconClass} />;
    case "Quiz":
      return <HelpCircle size={iconSize} className={iconClass} />;
    case "Slide Deck":
      return <Presentation size={iconSize} className={iconClass} />;
    case "Video Lesson Presentation":
      return <Video size={iconSize} className={iconClass} />;
    case "Text Presentation":
      return <FileText size={iconSize} className={iconClass} />;
    default:
      return <FileText size={iconSize} className={iconClass} />;
  }
};

// Helper function to get product type display name - copied from project-card
const getProductTypeDisplayName = (type: string): string => {
  switch (type) {
    case "Training Plan":
      return "Training Plan";
    case "Quiz":
      return "Quiz";
    case "Slide Deck":
      return "Slide Deck";
    case "Video Lesson Presentation":
      return "Video Lesson";
    case "Text Presentation":
      return "One-pager";
    default:
      return type;
  }
};

const LMSProductCard: React.FC<LMSProductCardProps> = ({
  product,
  isSelected,
  onToggleSelect,
}) => {
  const { t, language } = useLanguage();

  // Determine display title - use projectName as primary source
  const displayTitle = product.projectName || product.title || product.microproduct_name || product.name || 'Product';

  // String to color function - exact copy from ProjectsTable
  const stringToColor = (str: string): string => {
    let hash = 0;
    if (!str) return "#CCCCCC";
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = "#";
    for (let i = 0; i < 3; i++) {
      let value = (hash >> (i * 8)) & 0xff;
      color += ("00" + value.toString(16)).substr(-2);
    }
    return color;
  };

  const bgColor = stringToColor(displayTitle);
  const avatarColor = stringToColor(product.user_id || 'user');

  // Format date function - copied from ProjectsTable
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(
      language === "en"
        ? "en-US"
        : language === "es"
        ? "es-ES"
        : language === "ru"
        ? "ru-RU"
        : "uk-UA",
      options
    );
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onToggleSelect(product.id);
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSelect(product.id);
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-sm group transition-all duration-200 hover:shadow-lg border border-gray-200 relative cursor-pointer ${
        isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
      }`}
      onClick={handleCardClick}
    >
      {/* Selection checkbox */}
      <div className={`absolute top-3 right-3 z-10 transition-opacity duration-200 ${
        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(product.id)}
          onClick={handleCheckboxClick}
          className="w-5 h-5"
        />
      </div>

      {/* Card content - exact copy from ProjectsTable */}
      <div className="block">
        <div 
          className="relative rounded-t-xl h-40 bg-gradient-to-br from-blue-300 to-blue-500 shadow-md flex flex-col justify-between p-4"
          style={{
            backgroundColor: bgColor,
            backgroundImage: `linear-gradient(45deg, ${bgColor}99, ${stringToColor(
              displayTitle.split("").reverse().join("")
            )}99)`,
          }}
        >
          {/* Top row with icon and badge */}
          <div className="flex justify-between items-start">
            {/* List icon in top-left */}
            <div className="w-6 h-6 flex items-center justify-center">
              <List size={16} className="text-gray-500/60" />
            </div>
            
            {/* Course type badge in top-right */}
            <div className="flex items-center gap-2">
              <div 
                className="flex items-center gap-1 backdrop-blur-sm rounded-full px-2 py-1 border"
                style={{
                  backgroundColor: `${bgColor}`,
                  borderColor: `${bgColor}40`,
                  color: "white"
                }}
              >
                <span className="text-xs font-medium">
                  {getProductTypeDisplayName("Training Plan")}
                </span>
              </div>
            </div>
          </div>
          
          {/* Project type icon overlay */}
          <div className="absolute top-3 left-3 w-6 h-6 bg-white/20 backdrop-blur-sm rounded-md flex items-center justify-center">
            {getDesignMicroproductIcon("Training Plan")}
          </div>
          
          {/* Truncated title in center */}
          <div className="flex items-center justify-center flex-1 px-2">
            <h3 
              className="font-semibold text-md text-center leading-tight line-clamp-2"
              style={{ color: "white" }}
            >
              {displayTitle.length > 30 ? `${displayTitle.substring(0, 30)}...` : displayTitle}
            </h3>
          </div>
        </div>
        
        {/* Lower section with white background */}
        <div className="bg-white p-4 h-25 flex flex-col justify-between rounded-b-xl">
          {/* Full title */}
          <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-1" title={displayTitle}>
            {displayTitle}
          </h3>
          
          {/* Creator info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Avatar */}
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs"
                style={{ backgroundColor: avatarColor }}
              >
                {(product.user_id || 'U').slice(0, 1).toUpperCase()}
              </div>
              
              {/* Creator info */}
              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-900 leading-tight">
                  {t("interface.createdByYou", "Created by you")}
                </span>
                <span className="text-xs text-gray-500 leading-tight">
                  {formatDate(product.created_at || product.createdAt || new Date().toISOString())}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LMSProductCard; 