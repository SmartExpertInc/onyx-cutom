import { useEffect, useState } from 'react';
import { Coins, Workflow, Server, LucideIcon, HardDrive, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';

interface AddOn {
  id: string;
  name: string;
  description: string;
  amount: string;
  price: string | number;
  priceNote?: string;
  isEnterprise?: boolean;
}

interface ManageAddonsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AddOnCardProps {
  addOn: AddOn;
  icon: LucideIcon | React.ComponentType<{ size?: number }>;
  quantity: number;
  onQuantityChange: (delta: number) => void;
  showAmount?: boolean;
  catalog?: Record<string, { unit_amount: number; currency: string; interval?: string }>;
}

const CoinsIcon: React.FC<{ size?: number }> = ({ size }) => (
  <svg width="27" height="27" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
  <mask id="mask0_600_36680" style={{maskType: 'luminance'}} maskUnits="userSpaceOnUse" x="0" y="0" width="25" height="25">
  <path d="M0.125 0.125002H24.875V24.875H0.125V0.125002Z" fill="white"/>
  </mask>
  <g mask="url(#mask0_600_36680)">
  <path d="M23.6333 14.0775C24.0136 14.9767 24.224 15.9652 24.224 17.0028C24.224 21.1534 20.8592 24.5181 16.7087 24.5181C12.5581 24.5181 9.19336 21.1534 9.19336 17.0028C9.19336 12.8522 12.5581 9.48752 16.7087 9.48752C19.2187 9.48752 21.4414 10.7181 22.8063 12.6088" stroke="#0F58F9" stroke-width="0.703124" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M22.4712 16.9973C22.4712 20.1801 19.8911 22.7603 16.7083 22.7603C13.5255 22.7603 10.9453 20.1801 10.9453 16.9973C10.9453 13.8145 13.5255 11.2344 16.7083 11.2344C19.8911 11.2344 22.4712 13.8145 22.4712 16.9973Z" stroke="#0F58F9" stroke-width="0.703124" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M15.6133 16.3238V14.288C15.6133 14.0153 15.8342 13.7944 16.1068 13.7944H17.3105C17.5831 13.7944 17.8041 14.0153 17.8041 14.288V19.7101C17.8041 19.9827 17.5831 20.2036 17.3105 20.2036H16.1068C15.8342 20.2036 15.6133 19.9827 15.6133 19.7101V18.0157" stroke="#0F58F9" stroke-width="0.703124" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M4.24219 22.9871V24.5181" stroke="#0F58F9" stroke-width="0.703124" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M6.73438 22.9871V24.5181" stroke="#0F58F9" stroke-width="0.703124" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M9.23047 22.9871V24.5181" stroke="#0F58F9" stroke-width="0.703124" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M11.7207 22.9871V24.5181" stroke="#0F58F9" stroke-width="0.703124" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M5.74414 19.9784V21.5093" stroke="#0F58F9" stroke-width="0.703124" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M8.23828 19.9784V21.5093" stroke="#0F58F9" stroke-width="0.703124" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M3.33984 16.9754V18.5063" stroke="#0F58F9" stroke-width="0.703124" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M5.83203 16.9754V18.5063" stroke="#0F58F9" stroke-width="0.703124" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M8.32617 16.9754V18.5063" stroke="#0F58F9" stroke-width="0.703124" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M4.24219 13.9725V15.5034" stroke="#0F58F9" stroke-width="0.703124" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M6.73438 13.9725V15.5034" stroke="#0F58F9" stroke-width="0.703124" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M9.23047 13.9725V15.5034" stroke="#0F58F9" stroke-width="0.703124" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M4.84375 10.9735V12.5044" stroke="#0F58F9" stroke-width="0.703124" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M7.33594 10.9735V12.5044" stroke="#0F58F9" stroke-width="0.703124" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M9.83008 10.9735V12.5044" stroke="#0F58F9" stroke-width="0.703124" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M16.4774 9.49658H1.91264C1.784 9.49658 1.67969 9.39231 1.67969 9.26373V6.72608C1.67969 6.5974 1.784 6.49313 1.91264 6.49313H16.4774C16.606 6.49313 16.7103 6.5974 16.7103 6.72608V9.26373C16.7103 9.39231 16.606 9.49658 16.4774 9.49658Z" stroke="#0F58F9" stroke-width="0.703124" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M4.24219 7.96571V9.49658" stroke="#0F58F9" stroke-width="0.703124" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M6.73438 7.96571V9.49658" stroke="#0F58F9" stroke-width="0.703124" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M9.23047 7.96571V9.49658" stroke="#0F58F9" stroke-width="0.703124" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M11.7207 7.96571V9.49658" stroke="#0F58F9" stroke-width="0.703124" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M14.2148 7.96571V9.49658" stroke="#0F58F9" stroke-width="0.703124" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M15.8739 6.49756H1.30912C1.18049 6.49756 1.07617 6.39329 1.07617 6.26466V3.72701C1.07617 3.59833 1.18049 3.49411 1.30912 3.49411H15.8739C16.0025 3.49411 16.1067 3.59833 16.1067 3.72701V6.26466C16.1067 6.39329 16.0025 6.49756 15.8739 6.49756Z" stroke="#0F58F9" stroke-width="0.703124" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M3.63867 4.96664V6.49756" stroke="#0F58F9" stroke-width="0.703124" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M6.13477 4.96664V6.49756" stroke="#0F58F9" stroke-width="0.703124" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M8.625 4.96664V6.49756" stroke="#0F58F9" stroke-width="0.703124" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M11.1211 4.96664V6.49756" stroke="#0F58F9" stroke-width="0.703124" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M13.6152 4.96664V6.49756" stroke="#0F58F9" stroke-width="0.703124" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M6.53405 0.491178H18.2781C18.4067 0.491178 18.5111 0.595447 18.5111 0.724079V3.26173C18.5111 3.39036 18.4067 3.49463 18.2781 3.49463H3.71337C3.58474 3.49463 3.48047 3.39036 3.48047 3.26173V0.724079C3.48047 0.595447 3.58474 0.491178 3.71337 0.491178H4.84215" stroke="#0F58F9" stroke-width="0.703124" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M6.04688 1.96375V3.49463" stroke="#0F58F9" stroke-width="0.703124" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M8.53711 1.96375V3.49463" stroke="#0F58F9" stroke-width="0.703124" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M11.0312 1.96375V3.49463" stroke="#0F58F9" stroke-width="0.703124" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M13.5273 1.96375V3.49463" stroke="#0F58F9" stroke-width="0.703124" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M16.0176 1.96375V3.49463" stroke="#0F58F9" stroke-width="0.703124" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M3.41064 18.5058C3.282 18.5058 3.17773 18.6101 3.17773 18.7387V21.2764C3.17773 21.4051 3.282 21.5093 3.41064 21.5093" stroke="#0F58F9" stroke-width="0.703124" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M2.5122 9.50094C2.38357 9.50094 2.2793 9.60516 2.2793 9.7338V12.2714C2.2793 12.4001 2.38357 12.5044 2.5122 12.5044" stroke="#0F58F9" stroke-width="0.703124" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M10.6888 12.5H1.91259C1.78396 12.5 1.67969 12.6042 1.67969 12.7329V15.2705C1.67969 15.3991 1.78396 15.5034 1.91259 15.5034H9.34353" stroke="#0F58F9" stroke-width="0.703124" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M9.34287 15.5028H1.01029C0.881613 15.5028 0.777344 15.6072 0.777344 15.7358V18.2734C0.777344 18.4021 0.881613 18.5063 1.01029 18.5063H9.34573" stroke="#0F58F9" stroke-width="0.703124" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M10.6995 21.5146H1.91259C1.78396 21.5146 1.67969 21.6189 1.67969 21.7475V24.2851C1.67969 24.4138 1.78396 24.5181 1.91259 24.5181H16.4773" stroke="#0F58F9" stroke-width="0.703124" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  </svg>
);

const StorageIcon: React.FC<{ size?: number }> = ({ size }) => (
  <svg width="27" height="27" viewBox="0 0 25 26" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M14.1768 23.9265H10.0332C9.78945 23.9265 9.62695 23.764 9.62695 23.5203C9.62695 23.2765 9.78945 23.114 10.0332 23.114H14.1768C14.4206 23.114 14.5831 23.2765 14.5831 23.5203C14.5831 23.764 14.4206 23.9265 14.1768 23.9265Z" fill="#0F58F9"/>
  <path d="M4.46863 14.6246H5.52485V24.74C5.52485 25.4306 6.09358 25.9993 6.82481 25.9993H17.387C18.0776 25.9993 18.6464 25.4306 18.6464 24.74V14.6246H19.7026C22.1806 14.6246 24.2118 12.5934 24.2118 10.1153C24.2118 7.92166 22.6275 6.05296 20.5151 5.68734C19.4995 3.7374 17.2652 2.80305 15.1933 3.41241C14.259 1.34059 12.1872 0 9.91223 0C6.62169 0 4.14364 2.7218 4.10301 5.64672C1.82808 5.84984 0 7.79979 0 10.1153C0 12.5934 1.99057 14.6246 4.46863 14.6246ZM15.6808 25.1868H8.53102V20.2307C8.53102 19.8651 8.85601 19.5401 9.22162 19.5401H15.0308C15.3965 19.5401 15.7214 19.8651 15.7214 20.2307V25.1868H15.6808ZM17.8745 24.74C17.8745 24.9837 17.6714 25.1868 17.4277 25.1868H16.5339V20.2307C16.5339 19.4182 15.8839 18.7276 15.0308 18.7276H9.22162C8.40915 18.7276 7.71854 19.3776 7.71854 20.2307V25.1868H6.82481C6.58107 25.1868 6.33733 24.9837 6.33733 24.74V12.1465C6.33733 11.9028 6.54045 11.6997 6.82481 11.6997H8.20603V14.259C8.20603 14.5027 8.36852 14.6652 8.61227 14.6652H14.259C14.5027 14.6652 14.6652 14.5027 14.6652 14.259V11.6997H15.9246L17.8339 13.4871V24.74H17.8745ZM9.0185 13.8527V11.6997H13.8527V13.8527H9.0185ZM4.50925 6.41857C4.63112 6.41857 4.71237 6.37795 4.79362 6.2967C4.87487 6.21546 4.91549 6.09358 4.91549 6.01234C4.753 3.37178 6.94669 0.812478 9.91223 0.812478C11.984 0.812478 13.8527 2.11244 14.584 4.06239C14.6246 4.18426 14.7058 4.26551 14.7871 4.30613C14.8683 4.34676 14.9902 4.34676 15.1121 4.30613C16.9402 3.5749 19.0526 4.38738 19.8651 6.21546C19.9057 6.33733 20.0276 6.41857 20.1901 6.4592C22.0182 6.70294 23.3994 8.24665 23.3994 10.1153C23.3994 12.1465 21.7338 13.8121 19.7026 13.8121H18.6464V13.284C18.6464 13.1621 18.6057 13.0809 18.5245 12.9996L16.3714 11.0091C16.2902 10.9278 16.2089 10.8872 16.0871 10.8872C6.05296 10.8872 9.83098 10.8872 6.82481 10.8872C6.13421 10.8872 5.52485 11.4559 5.52485 12.1465V13.8121H4.46863C2.43743 13.8121 0.771854 12.1465 0.771854 10.1153C0.812478 8.08415 2.43743 6.41857 4.50925 6.41857Z" fill="#0F58F9"/>
  <path d="M19.9867 8.04526C21.0023 8.16713 21.7742 9.06086 21.7742 10.0765C21.7742 10.3202 21.9367 10.4827 22.1804 10.4827C22.4241 10.4827 22.5866 10.3202 22.5866 10.0765C22.5866 8.614 21.4898 7.39528 20.068 7.23278C19.8648 7.19216 19.6617 7.35466 19.6211 7.5984C19.6211 7.84214 19.7836 8.04526 19.9867 8.04526Z" fill="#0F58F9"/>
  <path d="M16.4941 5.64695C17.3066 5.64695 18.0378 6.13444 18.4035 6.86567C18.4847 7.06879 18.7284 7.15003 18.9316 7.06879C19.1347 6.98754 19.2159 6.7438 19.1347 6.54068C18.6878 5.52508 17.6316 4.83447 16.4941 4.83447C16.2504 4.83447 16.0879 4.99697 16.0879 5.24071C16.0879 5.48445 16.291 5.64695 16.4941 5.64695Z" fill="#0F58F9"/>
  <path d="M6.09244 6.33432C6.13306 6.33432 6.13306 6.33432 6.09244 6.33432C6.33618 6.33432 6.49868 6.1312 6.49868 5.88746C6.41743 4.14063 7.92051 2.43443 9.91108 2.43443C10.1548 2.43443 10.3173 2.27193 10.3173 2.02819C10.3173 1.78444 10.1548 1.62195 9.91108 1.62195C7.43303 1.62195 5.60495 3.73439 5.6862 5.92808C5.72682 6.1312 5.88932 6.33432 6.09244 6.33432Z" fill="#0F58F9"/>
  <path d="M2.43943 10.1157C2.43943 8.97827 3.37378 8.04392 4.51125 8.04392C4.75499 8.04392 4.91749 7.88143 4.91749 7.63768C4.91749 7.39394 4.75499 7.23145 4.51125 7.23145C2.92692 7.23145 1.62695 8.53141 1.62695 10.1157C1.62695 10.3595 1.78945 10.522 2.03319 10.522C2.23631 10.522 2.43943 10.3189 2.43943 10.1157Z" fill="#0F58F9"/>
  <path d="M14.1768 20.7998H10.0332C9.78945 20.7998 9.62695 20.9623 9.62695 21.206C9.62695 21.4498 9.78945 21.6123 10.0332 21.6123H14.1768C14.4206 21.6123 14.5831 21.4498 14.5831 21.206C14.5831 20.9623 14.4206 20.7998 14.1768 20.7998Z" fill="#0F58F9"/>
  </svg>
);

const ConnectorsIcon: React.FC<{ size?: number }> = ({ size }) => (
  <svg width="27" height="27" viewBox="0 0 28 22" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M9.83063 15.6013C9.6775 15.6013 9.55063 15.7281 9.55063 15.8813V19.32C9.55063 19.7575 9.19188 20.1163 8.75438 20.1163H4.7075C4.7075 20.1163 4.71625 20.0813 4.72063 20.0638C4.75125 19.9719 4.77313 19.8756 4.795 19.7794C4.79938 19.7531 4.80813 19.7269 4.80813 19.705C4.83 19.5781 4.84313 19.4513 4.84313 19.3244C4.84313 19.1975 4.83 19.0706 4.80813 18.9438C4.80375 18.9131 4.795 18.8869 4.79063 18.8606C4.77313 18.7688 4.75125 18.6769 4.72063 18.5894C4.71625 18.5719 4.71188 18.55 4.7075 18.5325H7.6825C7.83563 18.5325 7.9625 18.4056 7.9625 18.2525V11.9525C7.9625 11.7994 7.83563 11.6725 7.6825 11.6725H4.7075C4.7075 11.6725 4.71625 11.6331 4.725 11.6112C4.75125 11.5281 4.77313 11.445 4.79063 11.3575C4.79938 11.3225 4.80813 11.2831 4.8125 11.2481C4.83 11.1256 4.84313 11.0031 4.84313 10.8762C4.84313 10.7494 4.83 10.6269 4.8125 10.5044C4.80813 10.465 4.79938 10.43 4.79063 10.395C4.77313 10.3075 4.75125 10.2244 4.725 10.1413C4.72063 10.1194 4.71625 10.0975 4.7075 10.08H7.6825C7.83563 10.08 7.9625 9.95312 7.9625 9.8V3.49125C7.9625 3.33812 7.83563 3.21125 7.6825 3.21125H4.7075C4.7075 3.21125 4.71625 3.17188 4.72063 3.15C4.75125 3.0625 4.77313 2.97062 4.79063 2.87875C4.795 2.8525 4.80375 2.82188 4.80813 2.79563C4.83 2.66875 4.84313 2.54187 4.84313 2.415C4.84313 2.28812 4.83 2.15687 4.80813 2.03437C4.80813 2.00812 4.79938 1.98187 4.795 1.96C4.7775 1.86375 4.75125 1.7675 4.72063 1.67562C4.71625 1.65812 4.71188 1.64062 4.7075 1.62313H8.75438C9.19625 1.62313 9.55063 1.98187 9.55063 2.41937V3.57438C9.55063 3.7275 9.6775 3.85437 9.83063 3.85437C9.98375 3.85437 10.1106 3.7275 10.1106 3.57438V2.41937C10.1106 1.67125 9.5025 1.06313 8.75438 1.06313H4.41875C3.96813 0.406875 3.22 0 2.41937 0C1.085 0 0 1.085 0 2.41937C0 3.75375 1.085 4.83875 2.41937 4.83875C3.22 4.83875 3.96813 4.43188 4.41438 3.77562H7.39375V9.52437H4.41438C3.96813 8.86375 3.22 8.45687 2.415 8.45687C1.295 8.45687 0.328125 9.21812 0.065625 10.3075C0.030625 10.4563 0.1225 10.6094 0.27125 10.6444C0.42 10.6838 0.573125 10.5875 0.608125 10.4388C0.809375 9.59875 1.55313 9.01688 2.415 9.01688C3.07563 9.01688 3.6925 9.37125 4.025 9.94875C4.18688 10.2244 4.27438 10.5481 4.27438 10.8806C4.27438 10.9638 4.27 11.0469 4.25688 11.13C4.22625 11.375 4.1475 11.6069 4.025 11.8169C3.6925 12.3856 3.07563 12.74 2.415 12.74C1.88125 12.74 1.37375 12.5125 1.02375 12.11C0.923125 11.9919 0.74375 11.9831 0.63 12.0838C0.51625 12.1844 0.503125 12.3594 0.60375 12.4775C1.05875 12.9981 1.71938 13.2956 2.415 13.2956C3.21563 13.2956 3.96375 12.8931 4.41438 12.2369H7.39813V17.9769H4.41875C3.96813 17.3206 3.22 16.9138 2.42375 16.9138C1.08938 16.9138 0.004375 17.9988 0.004375 19.3331C0.004375 20.6675 1.08938 21.7525 2.42375 21.7525C3.22438 21.7525 3.9725 21.3456 4.42313 20.6894H8.75875C9.50688 20.6894 10.115 20.0813 10.115 19.3331V15.8944C10.115 15.7413 9.98813 15.6144 9.835 15.6144L9.83063 15.6013ZM4.13875 3.12812C4.10813 3.2025 4.07313 3.27688 4.02938 3.3425C3.68813 3.92 3.08875 4.27 2.41937 4.27C1.39125 4.27 0.56 3.43438 0.56 2.41062C0.56 1.38688 1.39562 0.55125 2.41937 0.55125C3.08875 0.55125 3.68813 0.896875 4.02938 1.47438C4.19125 1.75 4.27875 2.07375 4.27875 2.40625C4.27875 2.65563 4.23063 2.90063 4.13875 3.12375V3.12812ZM4.02938 20.2519C3.68813 20.8294 3.08875 21.175 2.41937 21.175C1.39125 21.175 0.56 20.3394 0.56 19.3156C0.56 18.2919 1.39562 17.4563 2.41937 17.4563C3.08875 17.4563 3.68813 17.8019 4.02938 18.3837C4.06875 18.4537 4.10813 18.5238 4.13875 18.5981C4.23063 18.8213 4.27875 19.0662 4.27875 19.3156C4.27875 19.6525 4.19125 19.9719 4.02938 20.2475V20.2519Z" fill="#0F58F9"/>
  <path d="M10.1108 9.51172V5.52609C10.1108 5.37297 9.98391 5.24609 9.83078 5.24609C9.67766 5.24609 9.55078 5.37297 9.55078 5.52609V9.79172C9.55078 9.94484 9.67766 10.0717 9.83078 10.0717H13.3789V9.51609H10.1108V9.51172Z" fill="#0F58F9"/>
  <path d="M9.83078 11.6641C9.67766 11.6641 9.55078 11.7909 9.55078 11.9441V13.9172C9.55078 14.0703 9.67766 14.1972 9.83078 14.1972C9.98391 14.1972 10.1108 14.0703 10.1108 13.9172V12.2241H13.3789V11.6684H9.83078V11.6641Z" fill="#0F58F9"/>
  <path d="M21.4156 7.62109H16.2094C15.7762 7.62109 15.4219 7.97547 15.4219 8.40859V13.3217C15.4219 13.7548 15.7762 14.1092 16.2094 14.1092H21.4156C21.8487 14.1092 22.2031 13.7548 22.2031 13.3217V8.40859C22.2031 7.97547 21.8487 7.62109 21.4156 7.62109ZM21.6475 13.3217C21.6475 13.4486 21.5425 13.5536 21.4156 13.5536H16.2094C16.0825 13.5536 15.9775 13.4486 15.9775 13.3217V8.40859C15.9775 8.28172 16.0825 8.17672 16.2094 8.17672H21.4156C21.5425 8.17672 21.6475 8.28172 21.6475 8.40859V13.3217Z" fill="#0F58F9"/>
  <path d="M25.8296 9.9325C26.5471 9.9325 27.129 9.35063 27.129 8.63312C27.129 7.91563 26.5471 7.33375 25.8296 7.33375H24.2371C24.2065 6.3625 23.4102 5.57938 22.4302 5.57938H22.334V3.98688C22.334 3.26938 21.7521 2.6875 21.0346 2.6875C20.3171 2.6875 19.7352 3.26938 19.7352 3.98688V5.57938H17.8715V3.98688C17.8715 3.26938 17.2896 2.6875 16.5721 2.6875C15.8546 2.6875 15.2727 3.26938 15.2727 3.98688V5.57938H15.1765C14.179 5.57938 13.3652 6.38875 13.3652 7.38625V14.3338C13.3652 15.3313 14.179 16.1406 15.1765 16.1406H15.2727V17.7331C15.2727 18.4463 15.8546 19.0325 16.5721 19.0325C17.2896 19.0325 17.8715 18.4506 17.8715 17.7331V16.1406H19.7352V17.7331C19.7352 18.4463 20.3171 19.0325 21.0346 19.0325C21.7521 19.0325 22.334 18.4506 22.334 17.7331V16.1406H22.4259C23.4059 16.1406 24.2021 15.3575 24.2327 14.3862H25.8252C26.5427 14.3862 27.1246 13.8044 27.1246 13.0869C27.1246 12.3694 26.5427 11.7875 25.8252 11.7875H24.2371V9.92375H25.8252L25.8296 9.9325ZM24.2415 7.89375H25.8296C26.2365 7.89375 26.569 8.22625 26.569 8.63312C26.569 9.04 26.2365 9.3725 25.8296 9.3725H24.2415V7.89375ZM20.2996 3.99125C20.2996 3.58438 20.6321 3.25188 21.039 3.25188C21.4459 3.25188 21.7784 3.58438 21.7784 3.99125V5.57938H20.2996V3.99125ZM15.8415 3.99125C15.8415 3.58438 16.174 3.25188 16.5809 3.25188C16.9877 3.25188 17.3202 3.58438 17.3202 3.99125V5.57938H15.8415V3.99125ZM17.3246 17.7331C17.3246 18.14 16.9921 18.4725 16.5852 18.4725C16.1784 18.4725 15.8459 18.14 15.8459 17.7331V16.145H17.3246V17.7331ZM21.7827 17.7331C21.7827 18.14 21.4502 18.4725 21.0434 18.4725C20.6365 18.4725 20.304 18.14 20.304 17.7331V16.145H21.7827V17.7331ZM23.6859 7.61375V14.3338C23.6859 15.0206 23.1215 15.5806 22.4302 15.5806H15.1852C14.494 15.5806 13.934 15.0206 13.934 14.3338V7.38625C13.934 6.69937 14.494 6.135 15.1852 6.135H22.4302C23.1215 6.135 23.6859 6.695 23.6859 7.38625V7.61375ZM25.8296 12.3519C26.2365 12.3519 26.569 12.6844 26.569 13.0913C26.569 13.4981 26.2365 13.8306 25.8296 13.8306H24.2415V12.3519H25.8296Z" fill="#0F58F9"/>
  </svg>
);

function AddOnCard({ addOn, icon: Icon, quantity, onQuantityChange, showAmount = true, catalog }: AddOnCardProps) {
  const { t } = useLanguage();
  const BACKEND = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <Card className="border border-gray-200">
      <CardHeader className='px-4 pt-4 pb-3'>
        <div className="flex items-start gap-4">
          <div className="border border-[#0F58F9] rounded-full p-2">
            <Icon className="text-white" size={24} />
          </div>
          <div>
            <CardTitle className="text-base -mt-1 font-semibold text-[#434343]">{addOn.name}</CardTitle>
            <CardDescription className="text-[#949CA8] pt-1 !leading-none font-light text-[10px]">{addOn.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-3 pt-0">
          <div>
            {showAmount && (
              <div className="flex items-center gap-2 text-sm text-[#71717A] font-semibold">
                <span>{addOn.amount}</span>
                      </div>
            )}
            <div className="text-3xl pb-2 font-bold text-gray-900">
              {typeof addOn.price === 'number' ? `$${addOn.price}` : addOn.price}
              {addOn.priceNote === 'per month' && (
                <span className="text-xs font-normal text-[#0D001B]">/month</span>
              )}
            </div>
            {!addOn.isEnterprise && (
              <div className="flex border border-[#E0E0E0] rounded-sm py-0.5 px-1 mb-2 items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onQuantityChange(-1)}
                  className="h-5 w-5 bg-[#CCDBFC] rounded-xs hover:bg-[#C0CEED] text-sm text-[#0F58F9]"
                >
                  <span className='text-lg font-light'>-</span>
                </Button>
                <div className="flex-1 text-center font-regular text-[#71717A]">{quantity}</div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onQuantityChange(1)}
                  className="h-5 w-5 bg-white rounded-xs bg-[#CCDBFC] hover:bg-[#C0CEED] text-sm text-[#0F58F9]"
                >
                  <span className='text-lg font-light'>+</span>
                </Button>
              </div>
            )}
            {addOn.isEnterprise && (
              <div className="h-2"></div>
            )}
            <Button className={`w-full pt-1 ${addOn.isEnterprise ? 'bg-[#CCDBFC] text-[#0F58F9] hover:bg-[#C2D1F0]' : 'bg-[#0F58F9] text-white'} cursor-pointer rounded-full`} variant="download">
              {addOn.isEnterprise ? t('addOns.contactSales', 'Contact Sales') : t('addOns.buyNow', 'Buy now')}
            </Button>
          </div>
        <Button
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
          variant="download"
          disabled={busy}
          onClick={async () => {
            if (addOn.isEnterprise) {
              window.open('https://calendly.com/k-torhonska-smartexpert/30min', '_blank');
              return;
            }
            setBusy(true); setErr(null);
            try {
              // Decide SKU by id
              const idToSku: Record<string, string> = {
                small: 'credits_100', medium: 'credits_300', large: 'credits_1000',
                single: 'connectors_1', five: 'connectors_5', ten: 'connectors_10',
                oneGb: 'storage_1gb', fiveGb: 'storage_5gb', tenGb: 'storage_10gb'
              };
              const sku = idToSku[(addOn as any).id] || '';
              const isCredits = sku.startsWith('credits_');
              const endpoint = isCredits ? `${BACKEND}/billing/credits/checkout` : `${BACKEND}/billing/addons/checkout`;
              const body = isCredits
                ? { sku, quantity }
                : { items: [{ sku, quantity }] };
              const res = await fetch(endpoint, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
              if (!res.ok) throw new Error(await res.text());
              const data = await res.json();
              if (data?.url) window.location.href = data.url;
            } catch (e: any) {
              setErr(e?.message || 'Checkout failed');
            } finally { setBusy(false); }
          }}
        >
          {busy ? t('addOns.processing', 'Processing...') : (addOn.isEnterprise ? t('addOns.contactSales', 'Contact Sales') : t('addOns.buyNow', 'Buy Now'))}
        </Button>
        {err && <p className="text-center text-sm text-red-600">{err}</p>}
        {addOn.priceNote && addOn.priceNote !== 'per month' && (
          <p className="text-center text-sm text-gray-500">{addOn.priceNote}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function ManageAddonsModal({ isOpen, onClose }: ManageAddonsModalProps) {
  const { t } = useLanguage();
  const BACKEND = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
  const [loading, setLoading] = useState(false);
  const [activeAddons, setActiveAddons] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<Record<string, { unit_amount: number; currency: string; interval?: string }>>({});
  const [error, setError] = useState<string | null>(null);
  
  const CREDITS_DATA_TRANSLATED: AddOn[] = [
    {
      id: 'small',
      name: t('addOns.packages.credits.small.name', 'Small'),
      description: t('addOns.packages.credits.small.description', 'Perfect for individual users getting started with basic credit needs.'),
      amount: t('addOns.packages.credits.small.amount', '100 credits'),
      price: 20,
      priceNote: 'per month',
    },
    {
      id: 'medium',
      name: t('addOns.packages.credits.medium.name', 'Medium'),
      description: t('addOns.packages.credits.medium.description', 'Great for growing teams with moderate usage requirements.'),
      amount: t('addOns.packages.credits.medium.amount', '300 credits'),
      price: 50,
      priceNote: 'per month',
    },
    {
      id: 'large',
      name: t('addOns.packages.credits.large.name', 'Large'),
      description: t('addOns.packages.credits.large.description', 'Ideal for businesses with high-volume processing demands.'),
      amount: t('addOns.packages.credits.large.amount', '1,000 credits'),
      price: 150,
      priceNote: 'per month',
    },
    {
      id: 'enterprise',
      name: t('addOns.packages.credits.enterprise.name', 'Enterprise'),
      description: t('addOns.packages.credits.enterprise.description', 'Tailored solutions for large organizations with unique needs.'),
      amount: t('addOns.packages.credits.enterprise.amount', 'Custom credits'),
      price: t('addOns.packages.credits.enterprise.price', 'Custom'),
      isEnterprise: true,
    },
  ];

  const CONNECTORS_DATA_TRANSLATED: AddOn[] = [
    {
      id: 'single',
      name: t('addOns.packages.connectors.single.name', 'Single Connector'),
      description: t('addOns.packages.connectors.single.description', 'Perfect for connecting one data source to your platform.'),
      amount: t('addOns.packages.connectors.single.amount', '1 connector'),
      price: 5,
      priceNote: 'per month',
    },
    {
      id: 'five',
      name: t('addOns.packages.connectors.five.name', '5 Connectors'),
      description: t('addOns.packages.connectors.five.description', 'Great for teams managing multiple data sources.'),
      amount: t('addOns.packages.connectors.five.amount', '5 connectors'),
      price: 25,
      priceNote: 'per month',
    },
    {
      id: 'ten',
      name: t('addOns.packages.connectors.ten.name', '10 Connectors'),
      description: t('addOns.packages.connectors.ten.description', 'Ideal for businesses with extensive integration needs.'),
      amount: t('addOns.packages.connectors.ten.amount', '10 connectors'),
      price: 50,
      priceNote: 'per month',
    },
    {
      id: 'all',
      name: t('addOns.packages.connectors.all.name', 'All Connectors'),
      description: t('addOns.packages.connectors.all.description', 'Unlimited access to all available connectors.'),
      amount: t('addOns.packages.connectors.all.amount', 'Unlimited connectors'),
      price: 500,
      priceNote: 'per month',
    },
  ];

  const STORAGE_DATA_TRANSLATED: AddOn[] = [
    {
      id: 'oneGb',
      name: t('addOns.packages.storage.oneGb.name', '1 GB Storage'),
      description: t('addOns.packages.storage.oneGb.description', 'Perfect for small projects with minimal storage needs.'),
      amount: t('addOns.packages.storage.oneGb.amount', '1 GB storage'),
      price: 30,
      priceNote: 'per month',
    },
    {
      id: 'fiveGb',
      name: t('addOns.packages.storage.fiveGb.name', '5 GB Storage'),
      description: t('addOns.packages.storage.fiveGb.description', 'Great for growing teams with moderate storage requirements.'),
      amount: t('addOns.packages.storage.fiveGb.amount', '5 GB storage'),
      price: 150,
      priceNote: 'per month',
    },
    {
      id: 'tenGb',
      name: t('addOns.packages.storage.tenGb.name', '10 GB Storage'),
      description: t('addOns.packages.storage.tenGb.description', 'Ideal for businesses with extensive data storage needs.'),
      amount: t('addOns.packages.storage.tenGb.amount', '10 GB storage'),
      price: 300,
      priceNote: 'per month',
    },
    {
      id: 'all',
      name: t('addOns.packages.connectors.all.name', '1 TB Storage'),
      description: t('addOns.packages.connectors.all.description', 'Perfect for large projects with extensive storage needs.'),
      amount: t('addOns.packages.connectors.all.amount', '1 TB storage'),
      price: 500,
      priceNote: 'per month',
    },
  ];
  
  const [quantities, setQuantities] = useState<Record<string, number>>(
    [...CREDITS_DATA_TRANSLATED, ...CONNECTORS_DATA_TRANSLATED, ...STORAGE_DATA_TRANSLATED].reduce(
      (acc, item) => ({ ...acc, [item.id]: 1 }),
      {}
    )
  );

  const handleQuantityChange = (id: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, prev[id] + delta),
    }));
  };

  // Map UI ids to backend SKUs
  const toSku = (id: string): string | null => {
    switch (id) {
      // credits
      case 'small': return 'credits_100';
      case 'medium': return 'credits_300';
      case 'large': return 'credits_1000';
      // connectors
      case 'single': return 'connectors_1';
      case 'five': return 'connectors_5';
      case 'ten': return 'connectors_10';
      // storage
      case 'oneGb': return 'storage_1gb';
      case 'fiveGb': return 'storage_5gb';
      case 'tenGb': return 'storage_10gb';
      default: return null;
    }
  };

  // Checkout helpers
  const startCreditsCheckout = async (sku: string, qty: number) => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${BACKEND}/billing/credits/checkout`, {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku, quantity: qty })
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (data?.url) window.location.href = data.url;
    } catch (e: any) {
      setError(e?.message || 'Failed to start checkout');
    } finally { setLoading(false); }
  };

  const startAddonCheckout = async (sku: string, qty: number) => {
    setLoading(true); setError(null);
    try {
      const body = { items: [{ sku, quantity: qty }] };
      const res = await fetch(`${BACKEND}/billing/addons/checkout`, {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (data?.url) window.location.href = data.url;
    } catch (e: any) {
      setError(e?.message || 'Failed to start checkout');
    } finally { setLoading(false); }
  };

  // Load active add-ons
  const loadActiveAddons = async () => {
    try {
      const res = await fetch(`${BACKEND}/billing/addons`, { credentials: 'same-origin' });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setActiveAddons(Array.isArray(data) ? data : []);
    } catch (e) { /* ignore in modal */ }
  };

  useEffect(() => {
    if (isOpen) {
      loadActiveAddons();
      // load catalog for dynamic prices
      (async () => {
        try {
          const res = await fetch(`${BACKEND}/billing/catalog`, { credentials: 'same-origin' });
          if (res.ok) {
            const list = await res.json();
            const map: Record<string, any> = {};
            list.forEach((p: any) => { map[p.sku] = { unit_amount: p.unit_amount, currency: p.currency, interval: p.interval }; });
            setCatalog(map);
          }
        } catch {}
      })();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[94vh] !bg-white/90 bg-blur-md overflow-hidden flex flex-col p-0 rounded-xl">
        <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 w-7 h-7 xl:w-8 xl:h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
            aria-label="Close modal"
        >
          <X className="w-5 h-5 xl:w-6 xl:h-6 text-[#71717A]" />
        </button>
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl text-[#434343] sora-font-bold">{t('addOns.title', 'Manage Add-ons')}</DialogTitle>
          <DialogDescription className="text-[11px] text-[#949CA8]">
            {t('addOns.description', 'Review your current add-ons, adjust quantities, or explore more options to get the most out of your plan.')}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="credits" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="ml-6 w-fit bg-transparent">
            <TabsTrigger 
              value="credits" 
              className="group rounded-none flex flex-col items-center gap-2 bg-transparent text-[#8C8C94] data-[state=active]:text-[#719AF5] py-2 border-b border-[#B5B5B9] data-[state=active]:border-b-2 data-[state=active]:border-b-[#719AF5]"
            >
              <div className="flex items-center gap-2">
                <Coins size={16} />
                <span className="font-semibold">{t('addOns.credits', 'Credits')}</span>
              </div>
              {/* <div className="border-b-2 -mt-1 group-data-[state=active]:border-[#719AF5] group-data-[state=active]:border-b-2 w-full border-[#B5B5B9] border-b" /> */}
            </TabsTrigger>
            <TabsTrigger 
              value="storage" 
              className="group rounded-none flex flex-col items-center gap-2 bg-transparent text-[#8C8C94] data-[state=active]:text-[#719AF5] py-2 border-b border-[#B5B5B9] data-[state=active]:border-b-2 data-[state=active]:border-b-[#719AF5]"
            >
              <div className="flex items-center gap-2">
                <HardDrive size={16} />
                <span className="font-semibold">{t('addOns.driveStorage', 'Drive storage')}</span>
              </div>
              {/* <div className="border-b-2 -mt-1 group-data-[state=active]:border-[#719AF5] group-data-[state=active]:border-b-2 w-full border-[#B5B5B9] border-b" /> */}
            </TabsTrigger>
            <TabsTrigger 
              value="connectors" 
              className="group rounded-none flex flex-col items-center gap-2 bg-transparent text-[#8C8C94] data-[state=active]:text-[#719AF5] py-2 border-b border-[#B5B5B9] data-[state=active]:border-b-2 data-[state=active]:border-b-[#719AF5]"
            >
              <div className="flex items-center gap-2">
                <Workflow size={16} />
                <span className="font-semibold">{t('addOns.connectors', 'Connectors')}</span>
              </div>
              {/* <div className="border-b-2 -mt-1 group-data-[state=active]:border-[#719AF5] group-data-[state=active]:border-b-2 w-full border-[#B5B5B9] border-b" /> */}
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="overflow-y-auto flex-1 px-6 py-5">
            {/* Active Add-ons */}
            {activeAddons.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">{t('addOns.activeAddons', 'Your Active Add-ons')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeAddons.map((a) => (
                    <div key={a.id} className="flex items-center justify-between bg-gray-50 rounded-lg border border-gray-200 p-3">
                      <div className="text-sm text-gray-800">
                        <div className="font-medium capitalize">{a.type}</div>
                        <div className="text-gray-600">{t('addOns.quantity', 'Quantity')}: {a.quantity} · {t('addOns.status', 'Status')}: {a.status || 'active'}</div>
                        {a.next_billing_at && (
                          <div className="text-gray-500 text-xs">{t('addOns.nextBilling', 'Next billing')}: {a.next_billing_at}</div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          setLoading(true); setError(null);
                          try {
                            const body: any = a.stripe_subscription_item_id ? { subscriptionItemId: a.stripe_subscription_item_id } : { subscriptionId: a.stripe_subscription_id };
                            const res = await fetch(`${BACKEND}/billing/addons/cancel`, {
                              method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(body)
                            });
                            if (!res.ok) throw new Error(await res.text());
                            await loadActiveAddons();
                          } catch (e: any) {
                            setError(e?.message || 'Failed to cancel');
                          } finally { setLoading(false); }
                        }}
                      >
                        {t('addOns.cancel', 'Cancel')}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
            <TabsContent value="credits" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 bg-white border border-[var(--border-light)] rounded-lg px-3 py-5 lg:grid-cols-3 gap-5">
                    {CREDITS_DATA_TRANSLATED.map((credit) => (
                      <AddOnCard
                        key={credit.id}
                        addOn={credit}
                        icon={CoinsIcon}
                        quantity={quantities[credit.id]}
                        onQuantityChange={(delta) => handleQuantityChange(credit.id, delta)}
                        catalog={catalog}
                  />
                    ))}
                  </div>
            </TabsContent>

            <TabsContent value="connectors" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {CONNECTORS_DATA_TRANSLATED.map((connector) => (
                  <AddOnCard
                    key={connector.id}
                    addOn={connector}
                    icon={Workflow}
                    quantity={quantities[connector.id]}
                    onQuantityChange={(delta) => handleQuantityChange(connector.id, delta)}
                    showAmount={false}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="storage" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 bg-white border border-[var(--border-light)] rounded-lg px-3 py-4">
                {STORAGE_DATA_TRANSLATED.map((storage) => (
                  <AddOnCard
                    key={storage.id}
                    addOn={storage}
                    icon={StorageIcon}
                    quantity={quantities[storage.id]}
                    onQuantityChange={(delta) => handleQuantityChange(storage.id, delta)}
                    showAmount={false}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="connectors" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 bg-white border border-[var(--border-light)] rounded-lg px-3 py-4 gap-5">
                {CONNECTORS_DATA_TRANSLATED.map((connector) => (
                  <AddOnCard
                    key={connector.id}
                    addOn={connector}
                    icon={ConnectorsIcon}
                    quantity={quantities[connector.id]}
                    onQuantityChange={(delta) => handleQuantityChange(connector.id, delta)}
                    showAmount={true}
                  />
                ))}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
