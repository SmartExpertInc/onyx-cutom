"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  CheckSquare, 
  Square,
  MoreHorizontal,
  Lock,
  TableOfContents,
  HelpCircle,
  Presentation,
  Video,
  FileText
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Product } from '../types/lmsTypes';

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

const LMSProductCard: React.FC<LMSProductCardProps> = ({
  product,
  isSelected,
  onToggleSelect,
}) => {
  const { t, language } = useLanguage();

  // Determine display title - copied logic from ProjectsTable
  const displayTitle = product.title || product.microproduct_name || product.projectName || product.name || 'Product';

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

  return (
    <div
      className={`bg-white rounded-xl shadow-sm group transition-all duration-200 hover:shadow-lg border border-gray-200 relative cursor-pointer ${
        isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
      }`}
      onClick={handleCardClick}
    >
      {/* Selection indicator */}
      <div className="absolute top-2 right-2 z-10">
        {isSelected ? (
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
            <CheckSquare size={14} className="text-white" />
          </div>
        ) : (
          <div className="w-6 h-6 border-2 border-gray-300 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity">
            <Square size={14} className="text-gray-600" />
          </div>
        )}
      </div>

      {/* Card content - exact copy from ProjectsTable */}
      <div className="block">
        <div
          className="relative h-40 rounded-t-lg"
          style={{
            backgroundColor: bgColor,
            backgroundImage: `linear-gradient(45deg, ${bgColor}99, ${stringToColor(
              displayTitle.split("").reverse().join("")
            )}99)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              background: "#fff",
              borderRadius: "6px",
              padding: "4px",
              zIndex: 2,
              backdropFilter: "blur(2px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {getDesignMicroproductIcon("Training Plan")}
          </div>
          <div className="absolute inset-0 flex items-center justify-center p-4 text-white">
            <h3
              className="font-bold text-lg text-center truncate max-w-full"
              title={displayTitle}
            >
              {displayTitle}
            </h3>
          </div>
        </div>
        <div className="p-4">
          <h3
            className="font-semibold text-gray-800 mb-2 truncate text-sm max-w-full"
            title={displayTitle}
          >
            {displayTitle}
          </h3>
          <div className="flex items-center text-xs text-gray-500 mb-3">
            <div className="flex items-center gap-1.5 bg-gray-100 rounded-md px-2 py-0.5">
                             <span className="text-gray-700">
                 Course Outline
               </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs"
                style={{ backgroundColor: avatarColor }}
              >
                {(product.user_id || 'U').slice(0, 1).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">
                  {t("interface.createdByYou", "Created by you")}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDate(product.created_at || product.createdAt || new Date().toISOString())}
                </span>
              </div>
            </div>
            <div className="w-7 h-7" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LMSProductCard; 