"use client";

import React, { useEffect, Suspense } from "react";
import Link from "next/link";
import { FileText, Sparkles, UploadCloud, Home as HomeIcon } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLanguage } from "../../contexts/LanguageContext";
import { CustomCard } from "@/components/ui/custom-card";
import { HeadTextCustom } from "@/components/ui/head-text-custom";

// ---------------------------------------------------------------------------
// Card shown on the landing page. It tries to mimic the folder-looking cards
// from the reference screenshot (image header + label area).
// ---------------------------------------------------------------------------
interface OptionCardProps {
  Icon: React.ElementType;
  title: string;
  description: string;
  href?: string;
  disabled?: boolean;
  pillLabel?: string;
  gradientFrom: string;
  gradientTo: string;
  iconColor: string;
  labelColor: string;
}

const ImportIcon: React.FC<{ size?: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 56 47" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="9.33337" y="-0.000244141" width="37.3333" height="18.6667" rx="6.22222" fill="url(#paint0_linear_886_2508)"/>
  <foreignObject x="-9.33333" y="-3.11129" width="74.6667" height="59.1111"><div style={{backdropFilter:'blur(4.67px)',clipPath:'url(#bgblur_0_886_2508_clip_path)',height:'100%',width:'100%'}}></div></foreignObject><g filter="url(#filter0_i_886_2508)" data-figma-bg-blur-radius="9.33333">
  <rect y="6.22205" width="56" height="40.4444" rx="9.33333" fill="#0088FF" fill-opacity="0.2"/>
  <rect x="0.311111" y="6.53316" width="55.3778" height="39.8222" rx="9.02222" stroke="url(#paint1_linear_886_2508)" stroke-opacity="0.1" stroke-width="0.622222"/>
  </g>
  <g filter="url(#filter1_i_886_2508)">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M28 12.4442C29.7182 12.4442 31.1111 13.8371 31.1111 15.5553V29.8222L35.1334 25.7999C36.3484 24.5849 38.3182 24.5849 39.5332 25.7999C40.7482 27.0148 40.7482 28.9847 39.5332 30.1997L30.1999 39.533C28.9849 40.748 27.0151 40.748 25.8001 39.533L16.4668 30.1997C15.2518 28.9847 15.2518 27.0148 16.4668 25.7999C17.6817 24.5849 19.6516 24.5849 20.8665 25.7999L24.8889 29.8222V15.5553C24.8889 13.8371 26.2818 12.4442 28 12.4442Z" fill="white" fill-opacity="0.7"/>
  </g>
  <defs>
  <filter id="filter0_i_886_2508" x="-9.33333" y="-3.11129" width="74.6667" height="59.1111" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
  <feFlood flood-opacity="0" result="BackgroundImageFix"/>
  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
  <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
  <feOffset dy="1.55556"/>
  <feGaussianBlur stdDeviation="3.11111"/>
  <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
  <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.4 0"/>
  <feBlend mode="normal" in2="shape" result="effect1_innerShadow_886_2508"/>
  </filter>
  <clipPath id="bgblur_0_886_2508_clip_path" transform="translate(9.33333 3.11129)"><rect y="6.22205" width="56" height="40.4444" rx="9.33333"/>
  </clipPath><filter id="filter1_i_886_2508" x="15.5555" y="12.4442" width="24.8889" height="29.5556" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
  <feFlood flood-opacity="0" result="BackgroundImageFix"/>
  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
  <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
  <feOffset dy="1.55556"/>
  <feGaussianBlur stdDeviation="0.777778"/>
  <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
  <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.4 0"/>
  <feBlend mode="normal" in2="shape" result="effect1_innerShadow_886_2508"/>
  </filter>
  <linearGradient id="paint0_linear_886_2508" x1="9.39998" y1="14.2741" x2="47" y2="14.2741" gradientUnits="userSpaceOnUse">
  <stop stop-color="#1158C3"/>
  <stop offset="0.297014" stop-color="#2979DD"/>
  <stop offset="0.666416" stop-color="#388DED" stop-opacity="0.95"/>
  <stop offset="1" stop-color="#49A4FF" stop-opacity="0.71"/>
  </linearGradient>
  <linearGradient id="paint1_linear_886_2508" x1="1.75" y1="8.06043" x2="56" y2="8.06043" gradientUnits="userSpaceOnUse">
  <stop stop-color="#7EE5FF"/>
  <stop offset="1" stop-color="#41A9FF"/>
  </linearGradient>
  </defs>
  </svg>
);

const GenerateIcon: React.FC<{ size?: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 53 53" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="26.5" cy="26.5" r="16.5625" fill="url(#paint0_linear_886_2483)"/>
  <foreignObject x="-9.9375" y="-9.9375" width="72.875" height="72.875"><div style={{backdropFilter:'blur(4.97px)',clipPath:'url(#bgblur_0_886_2483_clip_path)',height:'100%',width:'100%'}}></div></foreignObject><g filter="url(#filter0_i_886_2483)" data-figma-bg-blur-radius="9.9375">
  <path d="M0 6.625C0 2.96611 2.96611 0 6.625 0L16.5625 0C20.2214 0 23.1875 2.96611 23.1875 6.625V16.5625C23.1875 20.2214 20.2214 23.1875 16.5625 23.1875H6.625C2.96611 23.1875 0 20.2214 0 16.5625L0 6.625Z" fill="#0088FF" fill-opacity="0.2"/>
  <path d="M0 36.4375C0 32.7786 2.96611 29.8125 6.625 29.8125H16.5625C20.2214 29.8125 23.1875 32.7786 23.1875 36.4375V46.375C23.1875 50.0339 20.2214 53 16.5625 53H6.625C2.96611 53 0 50.0339 0 46.375L0 36.4375Z" fill="#0088FF" fill-opacity="0.2"/>
  <path d="M29.8125 6.625C29.8125 2.96611 32.7786 0 36.4375 0L46.375 0C50.0339 0 53 2.96611 53 6.625V16.5625C53 20.2214 50.0339 23.1875 46.375 23.1875H36.4375C32.7786 23.1875 29.8125 20.2214 29.8125 16.5625V6.625Z" fill="#0088FF" fill-opacity="0.2"/>
  <path d="M29.8125 36.4375C29.8125 32.7786 32.7786 29.8125 36.4375 29.8125H46.375C50.0339 29.8125 53 32.7786 53 36.4375V46.375C53 50.0339 50.0339 53 46.375 53H36.4375C32.7786 53 29.8125 50.0339 29.8125 46.375V36.4375Z" fill="#0088FF" fill-opacity="0.2"/>
  <path d="M6.625 30.1436H16.5625C20.0384 30.1436 22.8564 32.9616 22.8564 36.4375V46.375C22.8564 49.8509 20.0384 52.6689 16.5625 52.6689H6.625C3.14906 52.6689 0.331055 49.8509 0.331055 46.375V36.4375C0.331055 32.9616 3.14906 30.1436 6.625 30.1436ZM36.4375 30.1436H46.375C49.8509 30.1436 52.6689 32.9616 52.6689 36.4375V46.375C52.6689 49.8509 49.8509 52.6689 46.375 52.6689H36.4375C32.9616 52.6689 30.1436 49.8509 30.1436 46.375V36.4375C30.1436 32.9616 32.9616 30.1436 36.4375 30.1436ZM6.625 0.331055H16.5625C20.0384 0.331055 22.8564 3.14906 22.8564 6.625V16.5625C22.8564 20.0384 20.0384 22.8564 16.5625 22.8564H6.625C3.14906 22.8564 0.331055 20.0384 0.331055 16.5625V6.625C0.331055 3.14906 3.14906 0.331055 6.625 0.331055ZM36.4375 0.331055H46.375C49.8509 0.331055 52.6689 3.14906 52.6689 6.625V16.5625C52.6689 20.0384 49.8509 22.8564 46.375 22.8564H36.4375C32.9616 22.8564 30.1436 20.0384 30.1436 16.5625V6.625C30.1436 3.14906 32.9616 0.331055 36.4375 0.331055Z" stroke="url(#paint1_linear_886_2483)" stroke-opacity="0.1" stroke-width="0.6625"/>
  </g>
  <defs>
  <filter id="filter0_i_886_2483" x="-9.9375" y="-9.9375" width="72.875" height="72.875" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
  <feFlood flood-opacity="0" result="BackgroundImageFix"/>
  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
  <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
  <feOffset dy="1.65625"/>
  <feGaussianBlur stdDeviation="3.3125"/>
  <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
  <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.4 0"/>
  <feBlend mode="normal" in2="shape" result="effect1_innerShadow_886_2483"/>
  </filter>
  <clipPath id="bgblur_0_886_2483_clip_path" transform="translate(9.9375 9.9375)"><path d="M0 6.625C0 2.96611 2.96611 0 6.625 0L16.5625 0C20.2214 0 23.1875 2.96611 23.1875 6.625V16.5625C23.1875 20.2214 20.2214 23.1875 16.5625 23.1875H6.625C2.96611 23.1875 0 20.2214 0 16.5625L0 6.625Z"/>
  <path d="M0 36.4375C0 32.7786 2.96611 29.8125 6.625 29.8125H16.5625C20.2214 29.8125 23.1875 32.7786 23.1875 36.4375V46.375C23.1875 50.0339 20.2214 53 16.5625 53H6.625C2.96611 53 0 50.0339 0 46.375L0 36.4375Z"/>
  <path d="M29.8125 6.625C29.8125 2.96611 32.7786 0 36.4375 0L46.375 0C50.0339 0 53 2.96611 53 6.625V16.5625C53 20.2214 50.0339 23.1875 46.375 23.1875H36.4375C32.7786 23.1875 29.8125 20.2214 29.8125 16.5625V6.625Z"/>
  <path d="M29.8125 36.4375C29.8125 32.7786 32.7786 29.8125 36.4375 29.8125H46.375C50.0339 29.8125 53 32.7786 53 36.4375V46.375C53 50.0339 50.0339 53 46.375 53H36.4375C32.7786 53 29.8125 50.0339 29.8125 46.375V36.4375Z"/>
  </clipPath><linearGradient id="paint0_linear_886_2483" x1="9.99659" y1="35.2681" x2="43.3582" y2="35.2681" gradientUnits="userSpaceOnUse">
  <stop stop-color="#1158C3"/>
  <stop offset="0.297014" stop-color="#2979DD"/>
  <stop offset="0.666416" stop-color="#388DED" stop-opacity="0.95"/>
  <stop offset="1" stop-color="#49A4FF" stop-opacity="0.71"/>
  </linearGradient>
  <linearGradient id="paint1_linear_886_2483" x1="1.65625" y1="2.40909" x2="53" y2="2.40909" gradientUnits="userSpaceOnUse">
  <stop stop-color="#7EE5FF"/>
  <stop offset="1" stop-color="#41A9FF"/>
  </linearGradient>
  </defs>
  </svg>
);

const TextIcon: React.FC<{ size?: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 53 53" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M14.5833 2.91675C16.1942 2.91675 17.5 4.22258 17.5 5.83341L17.5 46.6667C17.5 48.2776 16.1942 49.5834 14.5833 49.5834L5.83333 49.5834C2.61167 49.5834 -1.83564e-08 46.9717 1.22467e-07 43.7501L1.65237e-06 8.75008C1.79319e-06 5.52842 2.61167 2.91675 5.83333 2.91675L14.5833 2.91675Z" fill="url(#paint0_linear_886_2462)"/>
  <foreignObject x="5.83325" y="-8.75" width="55.4167" height="70"><div style={{backdropFilter:'blur(4.38px)',clipPath:'url(#bgblur_0_886_2462_clip_path)',height:'100%',width:'100%'}}></div></foreignObject><g filter="url(#filter0_i_886_2462)" data-figma-bg-blur-radius="8.75">
  <path d="M14.5833 5.83333C14.5833 3.08347 14.5833 1.70854 15.4375 0.854272C16.2918 0 17.6667 0 20.4166 0L40.8332 0C46.333 0 49.0828 0 50.7914 1.70854C52.4999 3.41709 52.4999 6.16695 52.4999 11.6667V40.8333C52.4999 46.3331 52.4999 49.0829 50.7914 50.7915C49.0828 52.5 46.333 52.5 40.8333 52.5H20.4166C17.6667 52.5 16.2918 52.5 15.4375 51.6457C14.5833 50.7915 14.5833 49.4165 14.5833 46.6667V5.83333Z" fill="#0088FF" fill-opacity="0.2"/>
  <path d="M20.4163 0.291992H40.8333C43.5914 0.291992 45.631 0.292582 47.1956 0.50293C48.7515 0.712168 49.7942 1.12407 50.5852 1.91504C51.3761 2.70605 51.7881 3.74869 51.9973 5.30469C52.2077 6.86923 52.2083 8.90889 52.2083 11.667V40.833C52.2083 43.5911 52.2077 45.6308 51.9973 47.1953C51.7881 48.7513 51.3761 49.7939 50.5852 50.585C49.7942 51.3759 48.7515 51.7878 47.1956 51.9971C45.631 52.2074 43.5914 52.208 40.8333 52.208H20.4163C19.0333 52.208 18.0254 52.208 17.2551 52.1045C16.4932 52.0021 16.0077 51.8034 15.6438 51.4395C15.2799 51.0755 15.0812 50.59 14.9788 49.8281C14.8752 49.0579 14.8752 48.0499 14.8752 46.667V5.83301C14.8752 4.45006 14.8752 3.4421 14.9788 2.67188C15.0812 1.90997 15.2799 1.42446 15.6438 1.06055C16.0077 0.696635 16.4932 0.497943 17.2551 0.395508C18.0254 0.291965 19.0333 0.291992 20.4163 0.291992Z" stroke="url(#paint1_linear_886_2462)" stroke-opacity="0.1" stroke-width="0.583333"/>
  </g>
  <g filter="url(#filter1_i_886_2462)">
  <rect x="20.4167" y="11.6667" width="17.5" height="5.83333" rx="2.91667" fill="white" fill-opacity="0.7"/>
  </g>
  <g filter="url(#filter2_i_886_2462)">
  <rect x="20.4167" y="23.3333" width="26.25" height="5.83333" rx="2.91667" fill="white" fill-opacity="0.7"/>
  </g>
  <g filter="url(#filter3_i_886_2462)">
  <rect x="20.4167" y="35" width="26.25" height="5.83333" rx="2.91667" fill="white" fill-opacity="0.7"/>
  </g>
  <defs>
  <filter id="filter0_i_886_2462" x="5.83325" y="-8.75" width="55.4167" height="70" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
  <feFlood flood-opacity="0" result="BackgroundImageFix"/>
  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
  <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
  <feOffset dy="1.45833"/>
  <feGaussianBlur stdDeviation="2.91667"/>
  <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
  <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.4 0"/>
  <feBlend mode="normal" in2="shape" result="effect1_innerShadow_886_2462"/>
  </filter>
  <clipPath id="bgblur_0_886_2462_clip_path" transform="translate(-5.83325 8.75)"><path d="M14.5833 5.83333C14.5833 3.08347 14.5833 1.70854 15.4375 0.854272C16.2918 0 17.6667 0 20.4166 0L40.8332 0C46.333 0 49.0828 0 50.7914 1.70854C52.4999 3.41709 52.4999 6.16695 52.4999 11.6667V40.8333C52.4999 46.3331 52.4999 49.0829 50.7914 50.7915C49.0828 52.5 46.333 52.5 40.8333 52.5H20.4166C17.6667 52.5 16.2918 52.5 15.4375 51.6457C14.5833 50.7915 14.5833 49.4165 14.5833 46.6667V5.83333Z"/>
  </clipPath><filter id="filter1_i_886_2462" x="20.4167" y="11.6667" width="17.5" height="7.29171" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
  <feFlood flood-opacity="0" result="BackgroundImageFix"/>
  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
  <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
  <feOffset dy="1.45833"/>
  <feGaussianBlur stdDeviation="0.729167"/>
  <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
  <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.4 0"/>
  <feBlend mode="normal" in2="shape" result="effect1_innerShadow_886_2462"/>
  </filter>
  <filter id="filter2_i_886_2462" x="20.4167" y="23.3333" width="26.25" height="7.29171" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
  <feFlood flood-opacity="0" result="BackgroundImageFix"/>
  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
  <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
  <feOffset dy="1.45833"/>
  <feGaussianBlur stdDeviation="0.729167"/>
  <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
  <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.4 0"/>
  <feBlend mode="normal" in2="shape" result="effect1_innerShadow_886_2462"/>
  </filter>
  <filter id="filter3_i_886_2462" x="20.4167" y="35" width="26.25" height="7.29171" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
  <feFlood flood-opacity="0" result="BackgroundImageFix"/>
  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
  <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
  <feOffset dy="1.45833"/>
  <feGaussianBlur stdDeviation="0.729167"/>
  <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
  <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.4 0"/>
  <feBlend mode="normal" in2="shape" result="effect1_innerShadow_886_2462"/>
  </filter>
  <linearGradient id="paint0_linear_886_2462" x1="4.11777" y1="3" x2="4.11777" y2="50" gradientUnits="userSpaceOnUse">
  <stop stop-color="#1158C3"/>
  <stop offset="0.297014" stop-color="#2979DD"/>
  <stop offset="0.666416" stop-color="#388DED" stop-opacity="0.95"/>
  <stop offset="1" stop-color="#49A4FF" stop-opacity="0.71"/>
  </linearGradient>
  <linearGradient id="paint1_linear_886_2462" x1="15.7681" y1="2.38636" x2="52.4999" y2="2.38636" gradientUnits="userSpaceOnUse">
  <stop stop-color="#7EE5FF"/>
  <stop offset="1" stop-color="#41A9FF"/>
  </linearGradient>
  </defs>
  </svg>
);

const OptionCard: React.FC<OptionCardProps> = ({
  Icon,
  title,
  description,
  href,
  disabled,
  pillLabel,
  gradientFrom,
  gradientTo,
  iconColor,
  labelColor,
}: OptionCardProps) => {
  const router = useRouter();
  
  const handleClick = (e: React.MouseEvent) => {
    if (disabled || !href) return;
    
    // Check if we have lesson/quiz/text-presentation context in sessionStorage
    try {
      const lessonContextData = sessionStorage.getItem('lessonContext');
      if (lessonContextData) {
        const lessonContext = JSON.parse(lessonContextData);
        // Check if data is recent (within 1 hour)
        if (lessonContext.timestamp && (Date.now() - lessonContext.timestamp < 3600000)) {
          e.preventDefault();
          
          // Build URL with lesson/quiz/text-presentation parameters
          const params = new URLSearchParams();
          Object.entries(lessonContext).forEach(([key, value]) => {
            if (key !== 'timestamp') {
              params.set(key, String(value));
            }
          });
          
          const targetUrl = `${href}?${params.toString()}`;
          router.push(targetUrl);
          return;
        }
      }
    } catch (error) {
      console.error('Error handling lesson/quiz/text-presentation context:', error);
    }
    
    // Fallback to normal navigation
  };

  return (
    <CustomCard
      Icon={Icon}
      title={title}
      description={description}
      pillLabel={pillLabel}
      gradientFrom={gradientFrom}
      gradientTo={gradientTo}
      iconColor={iconColor}
      labelColor={labelColor}
      disabled={disabled}
      href={href}
      onClick={handleClick}
    />
  );
};

// Component to handle URL parameters and pass them to all creation paths
function CreatePageHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Store lesson/quiz/text-presentation parameters in sessionStorage for use across all creation paths
  useEffect(() => {
    const product = searchParams?.get('product');
    const lessonType = searchParams?.get('lessonType');
    const lessonTitle = searchParams?.get('lessonTitle');
    const moduleName = searchParams?.get('moduleName');
    const lessonNumber = searchParams?.get('lessonNumber');
    const folderId = searchParams?.get('folderId');

    if ((product === 'lesson' || product === 'quiz' || product === 'text-presentation') && lessonType && lessonTitle && moduleName && lessonNumber) {
      // Store lesson/quiz/text-presentation context in sessionStorage for use across all creation paths
      const lessonContext = {
        product: product,
        lessonType: lessonType,
        lessonTitle: lessonTitle,
        moduleName: moduleName,
        lessonNumber: lessonNumber,
        timestamp: Date.now()
      };
      sessionStorage.setItem('lessonContext', JSON.stringify(lessonContext));
    } else {
      // If no lesson/quiz/text-presentation parameters are present, clear any existing context
      // This ensures that if user navigates directly to /create, they don't carry over old context
      try {
        sessionStorage.removeItem('lessonContext');
        sessionStorage.removeItem('lessonContextForDropdowns');
      } catch (error) {
        console.error('Error clearing lesson context:', error);
      }
    }

    // Store folder context if present
    if (folderId) {
      const folderContext = {
        folderId: folderId,
        timestamp: Date.now()
      };
      sessionStorage.setItem('folderContext', JSON.stringify(folderContext));
    } else {
      // Clear folder context if not present
      try {
        sessionStorage.removeItem('folderContext');
      } catch (error) {
        console.error('Error clearing folder context:', error);
      }
    }
  }, [searchParams]);

  return null;
}

export default function DataSourceLanding() {
  const { t } = useLanguage();

  return (
    <>
      <Suspense fallback={null}>
        <CreatePageHandler />
      </Suspense>
      <main
        className="min-h-screen flex flex-col items-center pt-24 pb-20 px-6 bg-gradient-to-r from-[#00BBFF66]/40 to-[#00BBFF66]/10"
      >
      {/* Top-left home button */}
      <Link
        href="/projects"
        className="absolute top-6 left-6 flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-white/80 rounded-full px-4 py-2 border border-gray-200 bg-white/60 backdrop-blur-sm transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <HomeIcon size={16} />
        {t('interface.home', 'Home')}
      </Link>

      {/* Main content */}
      <div className="w-full max-w-6xl flex flex-col gap-10 items-center">
        {/* Headings */}
        <HeadTextCustom
          text={t('interface.createWithAI', 'Create with AI')}
          description={t('interface.howToGetStarted', 'How would you like to get started?')}
          className="max-w-2xl"
        />

        {/* Option cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-16 w-full max-w-6xl">
          <OptionCard
            Icon={TextIcon}
            title={t('interface.pasteInText', 'Paste in text')}
            description={t('interface.pasteInTextDescription', 'Create from notes, an outline, or existing content')}
            href="/create/paste-text"
            gradientFrom="from-blue-300"
            gradientTo="to-purple-200"
            iconColor="text-blue-600"
            labelColor="text-blue-600"
          />
          <OptionCard
            Icon={GenerateIcon}
            title={t('interface.generate.title', 'Generate')}
            description={t('interface.generateDescription', 'Create from a one-line prompt in a few seconds')}
            href="/create/generate"
            pillLabel={t('interface.popular', 'Popular')}
            gradientFrom="from-orange-300"
            gradientTo="to-pink-200"
            iconColor="text-orange-600"
            labelColor="text-orange-600"
          />
          <OptionCard
            Icon={ImportIcon}
            title={t('interface.importFileOrUrl', 'Create from files')}
            description={t('interface.importFileOrUrlDescription', 'Enhance existing docs, presentations, or webpages')}
            href="/create/from-files"
            gradientFrom="from-purple-300"
            gradientTo="to-pink-200"
            iconColor="text-purple-600"
            labelColor="text-purple-600"
          />
        </div>

        {/* Recent prompts section removed as per request */}
      </div>
    </main>
    </>
  );
} 