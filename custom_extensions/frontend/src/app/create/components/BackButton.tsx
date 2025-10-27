import React from "react";
import Link from "next/link";
import { useLanguage } from "../../../contexts/LanguageContext";

interface BackButtonProps {
  href?: string;
  onClick?: () => void;
}

export const BackButton: React.FC<BackButtonProps> = ({ 
  href = "/projects",
  onClick 
}) => {
  const { t } = useLanguage();

  return (
    <div className="absolute top-6 left-6 z-10">
      <div 
        className="rounded-lg"
        style={{
          padding: '1px',
          background: 'rgba(200, 200, 200, 0.5)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0px 10px 10px 0px #0000001A, 0px 4px 4px 0px #0000000D, 0px 1px 0px 0px #0000000D'
        }}
      >
        <Link
          href={href}
          onClick={onClick}
          className="flex items-center gap-1 text-sm rounded-lg px-3 py-1 backdrop-blur-sm transition-all duration-200 border border-white/60 shadow-md hover:shadow-xl active:shadow-xl transition-shadow cursor-pointer"
          style={{ 
            color: '#171718',
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.72) 100%)',
            display: 'flex'
          }}
        >
          <span>&lt;</span>
          <span>{t('interface.generate.back', 'Back')}</span>
        </Link>
      </div>
    </div>
  );
};

