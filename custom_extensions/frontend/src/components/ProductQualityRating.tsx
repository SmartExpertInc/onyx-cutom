import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProductQualityRatingProps {
  questionText?: string;
  fullWidth?: boolean;
  className?: string;
  isAuthorized?: boolean;
}

const ProductQualityRating = ({
  questionText,
  fullWidth = false,
  className,
  isAuthorized = true,
}: ProductQualityRatingProps): React.ReactElement | null => {
  const { t } = useLanguage();
  const [_hoveredStar, setHoveredStar] = useState<number | null>(null);

  const displayQuestion =
    questionText ?? t('modals.play.rateQuality', "How's the video and voice quality?");

  const containerClasses = [
    'flex flex-col gap-3 flex-shrink-0',
    fullWidth ? 'items-stretch' : 'items-center',
    fullWidth ? 'w-full' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  const ratingBoxClasses = [
    'items-center gap-3 bg-[#FFFFFF] border border-[#E0E0E0] shadow-xl rounded-md px-3 py-3',
    fullWidth ? 'flex justify-between w-full' : 'inline-flex',
  ]
    .filter(Boolean)
    .join(' ');

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className={containerClasses}>
      <div className={ratingBoxClasses}>
        <span className="text-[#171718] text-xs">{displayQuestion}</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              className="transition-colors hover:scale-110 cursor-pointer"
              onClick={() => console.log(`Rated ${star} stars`)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(null)}
            >
              <svg
                width="15"
                height="14"
                viewBox="0 0 15 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.23047 1.01367L7.25195 1.06738L8.71582 4.58594C8.83392 4.86975 9.10084 5.06328 9.40723 5.08789L13.2061 5.39258L13.2637 5.39746L13.5059 5.41602L13.3213 5.5752L13.2773 5.61328L10.3838 8.09277C10.1503 8.29282 10.0478 8.60627 10.1191 8.90527L11.0029 12.6113L11.0039 12.6123L11.0166 12.6689L11.0723 12.9043L10.8652 12.7783L10.8154 12.748L7.56348 10.7617C7.30116 10.6017 6.97126 10.6016 6.70898 10.7617L3.45703 12.748L3.40723 12.7783L3.19922 12.9053L3.25586 12.668L3.26953 12.6113L4.15332 8.90527C4.22466 8.60628 4.12291 8.2928 3.88965 8.09277L0.995117 5.61328L0.951172 5.5752L0.765625 5.41602L1.00977 5.39746L1.06738 5.39258L4.86523 5.08789C5.17162 5.06333 5.43849 4.86971 5.55664 4.58594L7.02051 1.06738L7.04297 1.01367L7.13574 0.788086L7.23047 1.01367ZM6.6748 2.07227L5.61914 4.61133C5.49149 4.91824 5.20241 5.12763 4.87109 5.1543L2.12988 5.37402L0.931641 5.4707L1.84473 6.25293L3.93262 8.04199C4.18511 8.2583 4.29589 8.5975 4.21875 8.9209L3.58008 11.5957L3.30176 12.7646L4.32715 12.1387L6.67383 10.7051C6.95758 10.5318 7.31488 10.5318 7.59863 10.7051L9.94531 12.1387L10.9717 12.7646L10.6924 11.5957L10.0547 8.9209C9.97756 8.59758 10.0875 8.25831 10.3398 8.04199L12.4287 6.25293L13.3418 5.4707L12.1436 5.37402L9.40234 5.1543C9.07091 5.12772 8.78198 4.91833 8.6543 4.61133L7.59766 2.07227L7.13672 0.961914L6.6748 2.07227Z"
                  fill="#171718"
                  stroke="#171718"
                />
              </svg>
            </button>
          ))}
        </div>
      </div>
      <span className="text-[#878787] text-xs text-center">
        {t('modals.play.helpImprove', 'Help us improve ContentBuilder')}
      </span>
    </div>
  );
};

export default ProductQualityRating;

