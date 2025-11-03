"use client";

import React, { useState, useEffect } from 'react';
import { Check, ArrowRight, Star, Users, Database, Zap, Shield, Clock, CreditCard, ArrowLeft, Coins, X, Server, ShieldUser, MessagesSquare, Workflow, Minus, Plus, InfoIcon, Sparkle, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import ContactSalesModal from '@/components/ui/contact-sales-modal';
import PlanComparisonModal from '@/components/ui/plan-comparison-modal';

const CoinsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg width="10" height="10" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
  <mask id="mask0_600_36680" style={{maskType: 'luminance'}} maskUnits="userSpaceOnUse" x="0" y="0" width="25" height="25">
  <path d="M0.125 0.125002H24.875V24.875H0.125V0.125002Z" fill="white"/>
  </mask>
  <g mask="url(#mask0_600_36680)">
  <path d="M23.6333 14.0775C24.0136 14.9767 24.224 15.9652 24.224 17.0028C24.224 21.1534 20.8592 24.5181 16.7087 24.5181C12.5581 24.5181 9.19336 21.1534 9.19336 17.0028C9.19336 12.8522 12.5581 9.48752 16.7087 9.48752C19.2187 9.48752 21.4414 10.7181 22.8063 12.6088" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M22.4712 16.9973C22.4712 20.1801 19.8911 22.7603 16.7083 22.7603C13.5255 22.7603 10.9453 20.1801 10.9453 16.9973C10.9453 13.8145 13.5255 11.2344 16.7083 11.2344C19.8911 11.2344 22.4712 13.8145 22.4712 16.9973Z" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M15.6133 16.3238V14.288C15.6133 14.0153 15.8342 13.7944 16.1068 13.7944H17.3105C17.5831 13.7944 17.8041 14.0153 17.8041 14.288V19.7101C17.8041 19.9827 17.5831 20.2036 17.3105 20.2036H16.1068C15.8342 20.2036 15.6133 19.9827 15.6133 19.7101V18.0157" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M4.24219 22.9871V24.5181" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M6.73438 22.9871V24.5181" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M9.23047 22.9871V24.5181" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M11.7207 22.9871V24.5181" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M5.74414 19.9784V21.5093" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M8.23828 19.9784V21.5093" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M3.33984 16.9754V18.5063" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M5.83203 16.9754V18.5063" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M8.32617 16.9754V18.5063" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M4.24219 13.9725V15.5034" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M6.73438 13.9725V15.5034" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M9.23047 13.9725V15.5034" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M4.84375 10.9735V12.5044" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M7.33594 10.9735V12.5044" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M9.83008 10.9735V12.5044" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M16.4774 9.49658H1.91264C1.784 9.49658 1.67969 9.39231 1.67969 9.26373V6.72608C1.67969 6.5974 1.784 6.49313 1.91264 6.49313H16.4774C16.606 6.49313 16.7103 6.5974 16.7103 6.72608V9.26373C16.7103 9.39231 16.606 9.49658 16.4774 9.49658Z" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M4.24219 7.96571V9.49658" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M6.73438 7.96571V9.49658" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M9.23047 7.96571V9.49658" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M11.7207 7.96571V9.49658" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M14.2148 7.96571V9.49658" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M15.8739 6.49756H1.30912C1.18049 6.49756 1.07617 6.39329 1.07617 6.26466V3.72701C1.07617 3.59833 1.18049 3.49411 1.30912 3.49411H15.8739C16.0025 3.49411 16.1067 3.59833 16.1067 3.72701V6.26466C16.1067 6.39329 16.0025 6.49756 15.8739 6.49756Z" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M3.63867 4.96664V6.49756" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M6.13477 4.96664V6.49756" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M8.625 4.96664V6.49756" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M11.1211 4.96664V6.49756" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M13.6152 4.96664V6.49756" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M6.53405 0.491178H18.2781C18.4067 0.491178 18.5111 0.595447 18.5111 0.724079V3.26173C18.5111 3.39036 18.4067 3.49463 18.2781 3.49463H3.71337C3.58474 3.49463 3.48047 3.39036 3.48047 3.26173V0.724079C3.48047 0.595447 3.58474 0.491178 3.71337 0.491178H4.84215" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M6.04688 1.96375V3.49463" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M8.53711 1.96375V3.49463" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M11.0312 1.96375V3.49463" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M13.5273 1.96375V3.49463" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M16.0176 1.96375V3.49463" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M3.41064 18.5058C3.282 18.5058 3.17773 18.6101 3.17773 18.7387V21.2764C3.17773 21.4051 3.282 21.5093 3.41064 21.5093" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M2.5122 9.50094C2.38357 9.50094 2.2793 9.60516 2.2793 9.7338V12.2714C2.2793 12.4001 2.38357 12.5044 2.5122 12.5044" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M10.6888 12.5H1.91259C1.78396 12.5 1.67969 12.6042 1.67969 12.7329V15.2705C1.67969 15.3991 1.78396 15.5034 1.91259 15.5034H9.34353" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M9.34287 15.5028H1.01029C0.881613 15.5028 0.777344 15.6072 0.777344 15.7358V18.2734C0.777344 18.4021 0.881613 18.5063 1.01029 18.5063H9.34573" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M10.6995 21.5146H1.91259C1.78396 21.5146 1.67969 21.6189 1.67969 21.7475V24.2851C1.67969 24.4138 1.78396 24.5181 1.91259 24.5181H16.4773" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </g>
  </svg>
);

const StorageIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M5.99922 10.1232H4.24609C4.14297 10.1232 4.07422 10.0545 4.07422 9.95135C4.07422 9.84823 4.14297 9.77948 4.24609 9.77948H5.99922C6.10234 9.77948 6.17109 9.84823 6.17109 9.95135C6.17109 10.0545 6.10234 10.1232 5.99922 10.1232Z" fill="#0F58F9"/>
  <path d="M1.89063 6.1875H2.3375V10.4672C2.3375 10.7594 2.57812 11 2.8875 11H7.35625C7.64844 11 7.88906 10.7594 7.88906 10.4672V6.1875H8.33594C9.38438 6.1875 10.2438 5.32812 10.2438 4.27969C10.2438 3.35156 9.57344 2.56094 8.67969 2.40625C8.25 1.58125 7.30469 1.18594 6.42813 1.44375C6.03281 0.567187 5.15625 0 4.19375 0C2.80156 0 1.75313 1.15156 1.73594 2.38906C0.773438 2.475 0 3.3 0 4.27969C0 5.32812 0.842188 6.1875 1.89063 6.1875ZM6.63438 10.6562H3.60938V8.55937C3.60938 8.40469 3.74688 8.26719 3.90156 8.26719H6.35938C6.51406 8.26719 6.65156 8.40469 6.65156 8.55937V10.6562H6.63438ZM7.5625 10.4672C7.5625 10.5703 7.47656 10.6562 7.37344 10.6562H6.99531V8.55937C6.99531 8.21562 6.72031 7.92344 6.35938 7.92344H3.90156C3.55781 7.92344 3.26563 8.19844 3.26563 8.55937V10.6562H2.8875C2.78438 10.6562 2.68125 10.5703 2.68125 10.4672V5.13906C2.68125 5.03594 2.76719 4.95 2.8875 4.95H3.47188V6.03281C3.47188 6.13594 3.54063 6.20469 3.64375 6.20469H6.03281C6.13594 6.20469 6.20469 6.13594 6.20469 6.03281V4.95H6.7375L7.54531 5.70625V10.4672H7.5625ZM3.81563 5.86094V4.95H5.86094V5.86094H3.81563ZM1.90781 2.71562C1.95938 2.71562 1.99375 2.69844 2.02813 2.66406C2.0625 2.62969 2.07969 2.57812 2.07969 2.54375C2.01094 1.42656 2.93906 0.34375 4.19375 0.34375C5.07031 0.34375 5.86094 0.89375 6.17031 1.71875C6.1875 1.77031 6.22188 1.80469 6.25625 1.82188C6.29063 1.83906 6.34219 1.83906 6.39375 1.82188C7.16719 1.5125 8.06094 1.85625 8.40469 2.62969C8.42188 2.68125 8.47344 2.71563 8.54219 2.73281C9.31563 2.83594 9.9 3.48906 9.9 4.27969C9.9 5.13906 9.19531 5.84375 8.33594 5.84375H7.88906V5.62031C7.88906 5.56875 7.87188 5.53438 7.8375 5.5L6.92656 4.65781C6.89219 4.62344 6.85781 4.60625 6.80625 4.60625C2.56094 4.60625 4.15938 4.60625 2.8875 4.60625C2.59531 4.60625 2.3375 4.84687 2.3375 5.13906V5.84375H1.89063C1.03125 5.84375 0.326562 5.13906 0.326562 4.27969C0.34375 3.42031 1.03125 2.71562 1.90781 2.71562Z" fill="#0F58F9"/>
  <path d="M8.45547 3.40473C8.88516 3.45629 9.21172 3.83442 9.21172 4.26411C9.21172 4.36723 9.28047 4.43598 9.38359 4.43598C9.48672 4.43598 9.55547 4.36723 9.55547 4.26411C9.55547 3.64536 9.09141 3.12973 8.48984 3.06098C8.40391 3.04379 8.31797 3.11254 8.30078 3.21567C8.30078 3.31879 8.36953 3.40473 8.45547 3.40473Z" fill="#0F58F9"/>
  <path d="M6.97852 2.38928C7.32227 2.38928 7.63164 2.59553 7.78633 2.90491C7.8207 2.99084 7.92383 3.02522 8.00977 2.99084C8.0957 2.95647 8.13008 2.85334 8.0957 2.76741C7.90664 2.33772 7.45977 2.04553 6.97852 2.04553C6.87539 2.04553 6.80664 2.11428 6.80664 2.21741C6.80664 2.32053 6.89258 2.38928 6.97852 2.38928Z" fill="#0F58F9"/>
  <path d="M2.57532 2.68076C2.59251 2.68076 2.59251 2.68076 2.57532 2.68076C2.67845 2.68076 2.7472 2.59482 2.7472 2.4917C2.71282 1.75264 3.34876 1.03076 4.19095 1.03076C4.29407 1.03076 4.36282 0.962012 4.36282 0.858887C4.36282 0.755762 4.29407 0.687012 4.19095 0.687012C3.14251 0.687012 2.36907 1.58076 2.40345 2.50889C2.42063 2.59482 2.48938 2.68076 2.57532 2.68076Z" fill="#0F58F9"/>
  <path d="M1.03125 4.27982C1.03125 3.79857 1.42656 3.40326 1.90781 3.40326C2.01094 3.40326 2.07969 3.33451 2.07969 3.23138C2.07969 3.12826 2.01094 3.05951 1.90781 3.05951C1.2375 3.05951 0.6875 3.60951 0.6875 4.27982C0.6875 4.38295 0.75625 4.4517 0.859375 4.4517C0.945312 4.4517 1.03125 4.36576 1.03125 4.27982Z" fill="#0F58F9"/>
  <path d="M5.99922 8.80054H4.24609C4.14297 8.80054 4.07422 8.86929 4.07422 8.97241C4.07422 9.07554 4.14297 9.14429 4.24609 9.14429H5.99922C6.10234 9.14429 6.17109 9.07554 6.17109 8.97241C6.17109 8.86929 6.10234 8.80054 5.99922 8.80054Z" fill="#0F58F9"/>
  </svg>
);

const ConnectorsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg width="11" height="9" viewBox="0 0 11 9" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M3.98574 6.32539C3.92366 6.32539 3.87222 6.37683 3.87222 6.43891V7.83312C3.87222 8.0105 3.72676 8.15596 3.54938 8.15596H1.90861C1.90861 8.15596 1.91216 8.14177 1.91394 8.13467C1.92635 8.09742 1.93522 8.0584 1.94409 8.01937C1.94586 8.00873 1.94941 7.99809 1.94941 7.98922C1.95828 7.93778 1.9636 7.88634 1.9636 7.8349C1.9636 7.78346 1.95828 7.73202 1.94941 7.68058C1.94764 7.66816 1.94409 7.65752 1.94232 7.64687C1.93522 7.60962 1.92635 7.57237 1.91394 7.5369C1.91216 7.5298 1.91039 7.52093 1.90861 7.51384H3.1148C3.17689 7.51384 3.22833 7.4624 3.22833 7.40032V4.84604C3.22833 4.78395 3.17689 4.73251 3.1148 4.73251H1.90861C1.90861 4.73251 1.91216 4.71655 1.91571 4.70768C1.92635 4.67398 1.93522 4.64027 1.94232 4.6048C1.94586 4.59061 1.94941 4.57464 1.95119 4.56045C1.95828 4.51079 1.9636 4.46112 1.9636 4.40968C1.9636 4.35824 1.95828 4.30857 1.95119 4.25891C1.94941 4.24294 1.94586 4.22875 1.94232 4.21456C1.93522 4.17909 1.92635 4.14538 1.91571 4.11168C1.91394 4.10281 1.91216 4.09394 1.90861 4.08685H3.1148C3.17689 4.08685 3.22833 4.03541 3.22833 3.97332V1.4155C3.22833 1.35341 3.17689 1.30197 3.1148 1.30197H1.90861C1.90861 1.30197 1.91216 1.28601 1.91394 1.27714C1.92635 1.24166 1.93522 1.20441 1.94232 1.16716C1.94409 1.15652 1.94764 1.1441 1.94941 1.13346C1.95828 1.08202 1.9636 1.03058 1.9636 0.97914C1.9636 0.9277 1.95828 0.874486 1.94941 0.824819C1.94941 0.814176 1.94586 0.803534 1.94409 0.794665C1.937 0.755641 1.92635 0.716617 1.91394 0.679367C1.91216 0.672272 1.91039 0.665177 1.90861 0.658082H3.54938C3.72854 0.658082 3.87222 0.803534 3.87222 0.980914V1.4492C3.87222 1.51128 3.92366 1.56272 3.98574 1.56272C4.04782 1.56272 4.09926 1.51128 4.09926 1.4492V0.980914C4.09926 0.677594 3.85271 0.431035 3.54938 0.431035H1.79154C1.60884 0.164964 1.30552 0 0.980914 0C0.439904 0 0 0.439904 0 0.980914C0 1.52192 0.439904 1.96183 0.980914 1.96183C1.30552 1.96183 1.60884 1.79686 1.78977 1.53079H2.99773V3.86157H1.78977C1.60884 3.59373 1.30552 3.42877 0.979141 3.42877C0.525046 3.42877 0.133035 3.73741 0.0266071 4.17908C0.0124166 4.23939 0.0496666 4.30148 0.109976 4.31567C0.170285 4.33163 0.232369 4.29261 0.246559 4.2323C0.328154 3.89173 0.629701 3.65581 0.979141 3.65581C1.24699 3.65581 1.49709 3.79949 1.6319 4.03363C1.69753 4.14538 1.73301 4.27664 1.73301 4.41145C1.73301 4.44516 1.73123 4.47886 1.72591 4.51256C1.7135 4.61189 1.68157 4.7059 1.6319 4.79105C1.49709 5.02164 1.24699 5.16532 0.979141 5.16532C0.762736 5.16532 0.556975 5.07308 0.41507 4.90989C0.374273 4.862 0.301547 4.85845 0.255428 4.89925C0.209309 4.94005 0.203988 5.011 0.244785 5.05889C0.429261 5.26997 0.697106 5.39059 0.979141 5.39059C1.30375 5.39059 1.60707 5.2274 1.78977 4.96133H2.9995V7.28856H1.79154C1.60884 7.02249 1.30552 6.85753 0.982688 6.85753C0.441678 6.85753 0.0017738 7.29743 0.0017738 7.83845C0.0017738 8.37946 0.441678 8.81936 0.982688 8.81936C1.30729 8.81936 1.61062 8.6544 1.79332 8.38832H3.55116C3.85448 8.38832 4.10104 8.14177 4.10104 7.83845V6.44423C4.10104 6.38215 4.0496 6.33071 3.98751 6.33071L3.98574 6.32539ZM1.67802 1.26827C1.6656 1.29843 1.65141 1.32858 1.63367 1.35519C1.49532 1.58933 1.25231 1.73123 0.980914 1.73123C0.56407 1.73123 0.227047 1.39244 0.227047 0.977367C0.227047 0.562296 0.565844 0.223499 0.980914 0.223499C1.25231 0.223499 1.49532 0.36363 1.63367 0.597772C1.69931 0.709522 1.73478 0.840784 1.73478 0.975593C1.73478 1.0767 1.71527 1.17603 1.67802 1.2665V1.26827ZM1.63367 8.21094C1.49532 8.44509 1.25231 8.58522 0.980914 8.58522C0.56407 8.58522 0.227047 8.24642 0.227047 7.83135C0.227047 7.41628 0.565844 7.07748 0.980914 7.07748C1.25231 7.07748 1.49532 7.21761 1.63367 7.45353C1.64964 7.48191 1.6656 7.51029 1.67802 7.54045C1.71527 7.63091 1.73478 7.73024 1.73478 7.83135C1.73478 7.96793 1.69931 8.09742 1.63367 8.20917V8.21094Z" fill="#0F58F9"/>
  <path d="M4.09912 3.85644V2.24051C4.09912 2.17842 4.04768 2.12698 3.98559 2.12698C3.92351 2.12698 3.87207 2.17842 3.87207 2.24051V3.96997C3.87207 4.03205 3.92351 4.08349 3.98559 4.08349H5.42415V3.85822H4.09912V3.85644Z" fill="#0F58F9"/>
  <path d="M3.98559 4.72906C3.92351 4.72906 3.87207 4.78051 3.87207 4.84259V5.64257C3.87207 5.70466 3.92351 5.7561 3.98559 5.7561C4.04768 5.7561 4.09912 5.70466 4.09912 5.64257V4.95611H5.42415V4.73084H3.98559V4.72906Z" fill="#0F58F9"/>
  <path d="M8.68304 3.0899H6.57221C6.39661 3.0899 6.25293 3.23358 6.25293 3.40919V5.40117C6.25293 5.57678 6.39661 5.72046 6.57221 5.72046H8.68304C8.85865 5.72046 9.00233 5.57678 9.00233 5.40117V3.40919C9.00233 3.23358 8.85865 3.0899 8.68304 3.0899ZM8.77705 5.40117C8.77705 5.45261 8.73448 5.49518 8.68304 5.49518H6.57221C6.52077 5.49518 6.4782 5.45261 6.4782 5.40117V3.40919C6.4782 3.35775 6.52077 3.31518 6.57221 3.31518H8.68304C8.73448 3.31518 8.77705 3.35775 8.77705 3.40919V5.40117Z" fill="#0F58F9"/>
  <path d="M10.4735 4.02702C10.7644 4.02702 11.0003 3.79111 11.0003 3.5002C11.0003 3.2093 10.7644 2.97338 10.4735 2.97338H9.82783C9.81541 2.5796 9.49258 2.26208 9.09525 2.26208H9.05622V1.61642C9.05622 1.32552 8.82031 1.0896 8.5294 1.0896C8.2385 1.0896 8.00258 1.32552 8.00258 1.61642V2.26208H7.24694V1.61642C7.24694 1.32552 7.01102 1.0896 6.72012 1.0896C6.42922 1.0896 6.1933 1.32552 6.1933 1.61642V2.26208H6.15428C5.74985 2.26208 5.41992 2.59024 5.41992 2.99467V5.81147C5.41992 6.2159 5.74985 6.54405 6.15428 6.54405H6.1933V7.18972C6.1933 7.47885 6.42922 7.71654 6.72012 7.71654C7.01102 7.71654 7.24694 7.48062 7.24694 7.18972V6.54405H8.00258V7.18972C8.00258 7.47885 8.2385 7.71654 8.5294 7.71654C8.82031 7.71654 9.05622 7.48062 9.05622 7.18972V6.54405H9.09347C9.49081 6.54405 9.81364 6.22654 9.82605 5.83276H10.4717C10.7626 5.83276 10.9985 5.59684 10.9985 5.30594C10.9985 5.01503 10.7626 4.77911 10.4717 4.77911H9.82783V4.02347H10.4717L10.4735 4.02702ZM9.8296 3.20043H10.4735C10.6385 3.20043 10.7733 3.33524 10.7733 3.5002C10.7733 3.66516 10.6385 3.79997 10.4735 3.79997H9.8296V3.20043ZM8.2314 1.61819C8.2314 1.45323 8.36621 1.31842 8.53118 1.31842C8.69614 1.31842 8.83095 1.45323 8.83095 1.61819V2.26208H8.2314V1.61819ZM6.4239 1.61819C6.4239 1.45323 6.5587 1.31842 6.72367 1.31842C6.88863 1.31842 7.02344 1.45323 7.02344 1.61819V2.26208H6.4239V1.61819ZM7.02522 7.18972C7.02522 7.35468 6.89041 7.48949 6.72544 7.48949C6.56048 7.48949 6.42567 7.35468 6.42567 7.18972V6.54583H7.02522V7.18972ZM8.83272 7.18972C8.83272 7.35468 8.69791 7.48949 8.53295 7.48949C8.36799 7.48949 8.23318 7.35468 8.23318 7.18972V6.54583H8.83272V7.18972ZM9.60433 3.0869V5.81147C9.60433 6.08996 9.37551 6.317 9.09525 6.317H6.15782C5.87756 6.317 5.65052 6.08996 5.65052 5.81147V2.99467C5.65052 2.71618 5.87756 2.48736 6.15782 2.48736H9.09525C9.37551 2.48736 9.60433 2.71441 9.60433 2.99467V3.0869ZM10.4735 5.00794C10.6385 5.00794 10.7733 5.14275 10.7733 5.30771C10.7733 5.47267 10.6385 5.60748 10.4735 5.60748H9.8296V5.00794H10.4735Z" fill="#0F58F9"/>
  </svg>
);

interface Plan {
  id: string;
  name: string;
  price: number;
  yearlyPrice?: number;
  credits: string;
  connectors?: string;
  support?: string;
  lmsExport?: string;
  slides?: string;
  storage?: string;
  collaboration?: string;
  avatars?: string;
  voiceover?: string;
  watermarkRemoval?: boolean;
  brandKit?: string;
  videoExport?: string;
  scormExport?: string;
  workspace?: string;
  apiAccess?: string;
  security?: string;
  customization?: string;
  popular?: boolean;
  features: string[];
}

interface TariffPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TariffPlanModal: React.FC<TariffPlanModalProps> = ({ open, onOpenChange }) => {
  const { t } = useLanguage();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState<'starter' | 'pro' | 'business' | 'enterprise'>('starter');
  const [lastLoadedPlanId, setLastLoadedPlanId] = useState<'starter' | 'pro' | 'business' | 'enterprise'>('starter');
  const [modalHeight, setModalHeight] = useState(0);
  const [teamSeats, setTeamSeats] = useState(2);
  const [creditQuantities, setCreditQuantities] = useState<Record<string, number>>({
    credits: 1,
    storage: 1,
    connectors: 1
  });
  const [showContactSales, setShowContactSales] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const modalRef = React.useRef<HTMLDivElement>(null);
  
  const mapPlan = (planRaw?: string): 'starter' | 'pro' | 'business' | 'enterprise' => {
    const p = (planRaw || 'starter').toLowerCase();
    if (p.includes('business')) return 'business';
    if (p.includes('pro')) return 'pro';
    if (p.includes('enterprise')) return 'enterprise';
    return 'starter';
  };

  useEffect(() => {
    if (modalRef.current) {
      const height = modalRef.current.offsetHeight;
      setModalHeight(height);
    }
  }, [open, billingCycle]);

  useEffect(() => {
    const loadCurrentPlan = async () => {
      try {
        const res = await fetch('/api/custom-projects-backend/billing/me', { credentials: 'same-origin' });
        if (!res.ok) return;
        const data = await res.json();
        const mapped = mapPlan(data?.plan);
        setLastLoadedPlanId(mapped);
        setCurrentPlanId(prev => (prev !== mapped ? mapped : prev));
      } catch {}
    };
    if (open) loadCurrentPlan();
  }, [open]);

  // Utility after returning from Stripe to force-refresh once (no flicker elsewhere)
  useEffect(() => {
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    if (params.has('session_id')) {
      (async () => {
        try {
          const res = await fetch('/api/custom-projects-backend/billing/me?refresh=1', { credentials: 'same-origin' });
          if (res.ok) {
            const data = await res.json();
            const mapped = mapPlan(data?.plan);
            setLastLoadedPlanId(mapped);
            setCurrentPlanId(mapped);
          }
        } catch {}
      })();
    }
  }, []);


  const creditAddOns = [
    {
      id: 'credits',
      type: 'credits',
      name: 'Generative Credit Pack',
      description: 'Add credits to access powerful generative features.',
      amount: '600 Generative Credits',
      price: 25,
      priceNote: 'per month',
    },
    {
      id: 'storage',
      type: 'storage',
      name: 'Smart Drive Storage',
      description: 'Add extra storage to keep all your files in one secure place.',
      amount: '10 GB',
      price: 10,
      priceNote: 'per month',
    },
    {
      id: 'connectors',
      type: 'connectors',
      name: 'Integration Connectors',
      description: 'Add extra storage to keep all your files in one secure place.',
      amount: '3 Connectors',
      price: 10,
      priceNote: 'per month',
    },
    // {
    //   id: 'enterprise',
    //   name: t('addOns.packages.credits.enterprise.name', 'Enterprise'),
    //   description: t('addOns.packages.credits.enterprise.description', 'Custom solutions tailored to your organization\'s specific needs.'),
    //   amount: t('addOns.packages.credits.enterprise.amount', 'Custom credit allocation'),
    //   price: 'Custom' as any,
    //   isEnterprise: true,
    // },
  ];

  const plans: Plan[] = [
    {
      id: 'starter',
      name: t('tariffPlan.plans.starter.name', 'Free'),
      price: 0,
      credits: '200',
      storage: '100 MB',
      connectors: '1 active',
      avatars: '10 basic',
      voiceover: 'all languages, standard voices',
      slides: '20 per project',
      workspace: '1 seat',
      features: []
    },
    {
      id: 'pro',
      name: t('tariffPlan.plans.pro.name', 'Creator'),
      price: 30,
      yearlyPrice: 25,
      credits: '600',
      storage: '10 GB',
      connectors: '3 active',
      avatars: '25 basic',
      voiceover: 'all languages, standard voices',
      slides: 'unlimited',
      watermarkRemoval: true,
      scormExport: 'included',
      workspace: '1 seat',
      features: []
    },
    {
      id: 'business',
      name: t('tariffPlan.plans.business.name', 'Team'),
      price: 90,
      yearlyPrice: 37,
      credits: '2000',
      storage: '50 GB',
      connectors: '10 active',
      avatars: 'all basic',
      voiceover: 'upload your own or cloned voice',
      watermarkRemoval: true,
      slides: 'unlimited',
      brandKit: 'custom fonts & music',
      videoExport: '4K available',
      scormExport: 'included',
      workspace: '2 seats (minimum) + $37 per extra seat',
      support: 'priority email support',
      popular: true,
      features: []
    },
    {
      id: 'enterprise',
      name: t('tariffPlan.plans.enterprise.name', 'Enterprise'),
      price: 0,
      credits: '10,000+',
      storage: '200 GB +',
      connectors: 'all integrations available',
      avatars: 'custom brand avatars',
      voiceover: 'brand voice / fully customized',
      apiAccess: 'full documentation',
      security: 'SAML/SSO + audit log',
      customization: 'white-label & domain',
      workspace: 'unlimited seats',
      support: 'dedicated success manager',
      features: []
    }
  ];

  const handlePurchasePlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowPayment(true);
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      alert(`Successfully subscribed to ${selectedPlan?.name} plan!`);
      setShowPayment(false);
      setSelectedPlan(null);
    }, 2000);
  };

  const getPrice = (plan: Plan) => {
    if (plan.price === 0) return plan.name.includes('Enterprise') ? 'Custom' : '$0';
    if (billingCycle === 'yearly' && plan.yearlyPrice) {
      return `$${plan.yearlyPrice}`;
    }
    return `$${plan.price}`;
  };

  if (showPayment && selectedPlan) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl w-[85vw] h-[80vh] overflow-y-auto p-0 bg-gradient-to-br from-white/80 to-white/70 backdrop-blur-sm">
          <div className="min-h-full">
            <div className="container mx-auto px-4 py-12">
              <div className="max-w-2xl mx-auto">
                {/* Back Button */}
                <button
                  onClick={() => setShowPayment(false)}
                  className="flex items-center text-blue-600 hover:text-blue-700 mb-8 transition-colors duration-200"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  {t('tariffPlan.backToPlans', 'Back to plans')}
                </button>

                {/* Payment Header */}
                <div className="text-center mb-12">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl mb-6 shadow-xl">
                    <CreditCard className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('tariffPlan.completeYourPurchase', 'Complete Your Purchase')}</h1>
                  <p className="text-xl text-gray-600">{t('tariffPlan.subscribeTo', 'Subscribe to')} {selectedPlan.name}</p>
                </div>

                {/* Plan Summary */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{selectedPlan.name}</h3>
                      <p className="text-gray-600">
                        {billingCycle === 'monthly' ? t('tariffPlan.monthly', 'Monthly') : t('tariffPlan.yearly', 'Yearly')} {t('tariffPlan.subscription', 'subscription')}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-600">
                        {getPrice(selectedPlan)}
                        {selectedPlan.price > 0 && (
                          <span className="text-xs text-[#0D001B] font-normal">
                            /{billingCycle === 'monthly' ? t('tariffPlan.month', 'month') : t('tariffPlan.year', 'year')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-2xl p-6">
                    <h4 className="font-bold text-gray-900 mb-4">{t('tariffPlan.whatsIncluded', "What's included:")}</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {selectedPlan.features.map((feature, index) => (
                        <div key={index} className="flex items-center">
                          <Check className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Stripe Portal CTA */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('tariffPlan.checkoutInStripe', 'Checkout in Stripe')}</h3>
                  <p className="text-gray-600 mb-6">{t('tariffPlan.redirectToStripe', 'You will be redirected to Stripe to complete your purchase and manage billing.')}</p>
                  <button
                    disabled={portalLoading || selectedPlan.name.includes('Enterprise')}
                    onClick={async () => {
                      try {
                        setPortalLoading(true);
                        
                        // Map plan to Stripe price ID
                        const priceIdMap: Record<string, string> = {
                          'pro': billingCycle === 'yearly' ? 'price_1SEBUCH2U2KQUmUhkym5Q9TS' : 'price_1SEBM4H2U2KQUmUhkn6A7Hlm',
                          'business': billingCycle === 'yearly' ? 'price_1SEBUoH2U2KQUmUhMktbhCsm' : 'price_1SEBTeH2U2KQUmUhi02e1uC9'
                        };
                        
                        const priceId = priceIdMap[selectedPlan.id];
                        if (!priceId) {
                          throw new Error('Price ID not configured for this plan');
                        }
                        
                        const res = await fetch('/api/custom-projects-backend/billing/checkout', { 
                          method: 'POST', 
                          credentials: 'same-origin',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ 
                            priceId: priceId,
                            planName: selectedPlan.name 
                          })
                        });
                        if (!res.ok) throw new Error('Failed to create checkout session');
                        const data = await res.json();
                        if (data?.url) window.location.href = data.url;
                      } catch (e) {
                        console.error(e);
                        alert('Failed to start checkout. Please try again.');
                      } finally {
                        setPortalLoading(false);
                      }
                    }}
                    className={`w-full py-4 rounded-2xl font-bold text-lg text-white transition-all duration-300 transform hover:scale-105 flex items-center justify-center ${
                      portalLoading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : selectedPlan.name.includes('Enterprise')
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-xl hover:shadow-2xl'
                    }`}
                  >
                    {portalLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                        {t('tariffPlan.openingStripe', 'Opening Stripe...')}
                      </>
                    ) : (
                      <>
                        {t('tariffPlan.continueInStripe', 'Continue in Stripe')}
                        <ArrowRight className="w-6 h-6 ml-3" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogOverlay className="bg-black/20 backdrop-blur-sm" />
      <DialogContent className="sm:max-w-[1350px] max-w-[1250px] xl:max-w-[1450px] xl:w-[95vw] w-[93vw] rounded-2xl p-0 max-h-[90vh] min-w-[980px] bg-gradient-to-b from-white/80 to-white/70 backdrop-blur-sm" hideCloseIcon>
        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-50 w-7 h-7 xl:w-8 xl:h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 xl:w-6 xl:h-6 text-[#71717A]" />
        </button>
        
        <div className="h-[90vh] max-h-[750px] w-full overflow-y-auto custom-scrollbar">
          <style jsx>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 10px;
              border-radius: 50px;
            }

            .custom-scrollbar::-webkit-scrollbar-track {
              background: #f1f5f9;
              border-radius: 5px;
              margin: 10px 0;
            }

            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #A5A5A5;
              border-radius: 5px;
            }

            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background:rgb(135, 135, 135);
            }

            .custom-scrollbar {
              scrollbar-width: thin;
              scrollbar-color: #A5A5A5 #f1f5f9;
              scroll-behavior: smooth;
              border-radius: 50px;
            }
          `}</style>
          <div ref={modalRef} className="h-[90vh] min-h-[600px] max-h-[750px]">
          <div className="container mx-auto px-4 py-4 xl:py-8 xl:px-4">
            <div className="max-w-8xl mx-auto">
              {/* Header - ContentBuilder Logo and Title - Outside White Box */}
              <div className="text-center mb-10">
                <div className="flex items-center justify-center mb-3">
                  <div className="flex items-center gap-1">
                    <div className="w-7 h-7 xl:w-8 xl:h-8 flex items-center justify-center">
                      <svg width="15" height="19" viewBox="0 0 15 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.8866 11.7423L9.84952 10.4211C10.111 9.67575 10.052 8.84327 9.67315 8.13678L11.344 6.64409C12.2619 7.2167 13.4851 7.10494 14.2829 6.307C15.2117 5.37826 15.2117 3.87235 14.2829 2.94357C13.3541 2.01479 11.8481 2.01479 10.9194 2.94357C10.1878 3.67523 10.0329 4.76459 10.4537 5.64832L8.78271 7.14124C7.98282 6.58766 6.96245 6.49089 6.08558 6.85206L4.15864 4.20036C4.84987 3.29285 4.78169 1.99171 3.95258 1.16251C3.0484 0.258329 1.58241 0.258329 0.678174 1.16251C-0.226058 2.06674 -0.226058 3.53278 0.678174 4.43697C1.32743 5.08623 2.26606 5.26917 3.07856 4.98626L5.00573 7.6382C4.05407 8.75444 4.10479 10.4324 5.15998 11.4876C5.18025 11.5079 5.20109 11.5268 5.22198 11.5464L3.3549 14.8234C2.57889 14.6399 1.72871 14.8502 1.12351 15.4555C0.194727 16.3843 0.194727 17.8903 1.12351 18.819C2.05229 19.7478 3.55825 19.7478 4.48698 18.819C5.40606 17.9 5.41515 16.4162 4.5152 15.4852L6.38214 12.2086C7.31967 12.4778 8.36792 12.2552 9.12138 11.541L11.1604 12.8632C11.0302 13.4677 11.1994 14.1239 11.6693 14.5937C12.4053 15.3297 13.5983 15.3297 14.3342 14.5937C15.0702 13.8579 15.0702 12.6647 14.3342 11.9288C13.667 11.2618 12.6239 11.1995 11.8866 11.7423ZM1.92925 16.6091C1.88401 16.6603 1.84142 16.7088 1.79965 16.7505C1.7476 16.8025 1.67647 16.8659 1.58821 16.8931C1.47735 16.9274 1.36407 16.8972 1.27724 16.8104C1.05019 16.5834 1.13702 16.1539 1.47925 15.8118C1.82158 15.4694 2.25093 15.3826 2.47807 15.6097C2.56486 15.6964 2.59497 15.8098 2.56072 15.9207C2.5335 16.0089 2.47013 16.0803 2.41812 16.1321C2.37635 16.1738 2.32791 16.2164 2.27658 16.2616C2.21734 16.3138 2.15597 16.3677 2.09554 16.428C2.03516 16.4884 1.98135 16.5498 1.92925 16.6091ZM11.2752 3.2996C11.6174 2.95737 12.0468 2.87044 12.2739 3.09754C12.3606 3.18427 12.3908 3.2976 12.3565 3.40856C12.3293 3.49686 12.2659 3.56814 12.2139 3.62009C12.1723 3.66172 12.1238 3.7043 12.0724 3.7495C12.0132 3.8017 11.9519 3.85556 11.8914 3.91593C11.8309 3.97641 11.7771 4.03783 11.7249 4.09711C11.6798 4.14831 11.6371 4.19689 11.5955 4.23857C11.5435 4.29057 11.4722 4.35394 11.3839 4.38121C11.273 4.41542 11.1597 4.3853 11.073 4.29847C10.8461 4.07137 10.9329 3.64179 11.2752 3.2996ZM1.46265 2.28542C1.4185 2.33537 1.37706 2.38257 1.33666 2.42316C1.28609 2.47373 1.21672 2.53535 1.13069 2.56204C1.02274 2.59525 0.912451 2.56599 0.827904 2.48158C0.606853 2.26048 0.691543 1.84232 1.02478 1.50917C1.35798 1.17593 1.77596 1.09134 1.9971 1.31243C2.0816 1.39693 2.11105 1.50727 2.0776 1.61518C2.05091 1.70115 1.98939 1.77052 1.93877 1.821C1.89814 1.86163 1.85094 1.90317 1.80098 1.94699C1.74327 1.99771 1.68351 2.05023 1.62475 2.10904C1.5659 2.1679 1.51332 2.22775 1.46265 2.28542ZM5.5851 7.89522C5.99394 7.48633 6.50674 7.38261 6.77804 7.65385C6.88176 7.75762 6.91778 7.89289 6.87691 8.02544C6.84417 8.13097 6.76857 8.21599 6.70643 8.27818C6.65662 8.32799 6.59867 8.37867 6.53738 8.43272C6.46668 8.49509 6.39341 8.55937 6.32119 8.63155C6.24896 8.70382 6.18464 8.77704 6.1224 8.84789C6.06835 8.90912 6.01749 8.96707 5.96773 9.01679C5.90559 9.07912 5.82057 9.15458 5.71504 9.18722C5.58258 9.22809 5.44726 9.19216 5.3434 9.0884C5.0723 8.81691 5.17626 8.30411 5.5851 7.89522ZM12.2053 12.9549C12.164 12.9961 12.1075 13.0464 12.0377 13.0679C11.9498 13.095 11.8602 13.0712 11.7913 13.0024C11.6113 12.8225 11.6801 12.4822 11.9514 12.211C12.2225 11.9398 12.5627 11.871 12.7427 12.0511C12.8114 12.1197 12.8353 12.2095 12.8082 12.2975C12.7866 12.3675 12.7364 12.4238 12.6952 12.465C12.6622 12.4979 12.6238 12.5317 12.5832 12.5675C12.5363 12.6087 12.4876 12.6516 12.4398 12.6994C12.3919 12.7472 12.3491 12.7958 12.308 12.8429C12.272 12.8836 12.2383 12.9219 12.2053 12.9549Z" fill="#0F58F9"/>
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-blue-600 font-public-sans">ContentBuilder</span>
                  </div>
                </div>
                <h1 className="text-xl xl:text-2xl font-bold text-[#434343] sora-font">{t('tariffPlan.customizeYourSubscription', "Customize your subscription")}</h1>
              </div>

              {/* Pricing Cards */}
              <div className="bg-white rounded-md pt-5 px-5 pb-3 flex flex-col gap-4">
                {/* Billing Toggle Section - Centered */}
                <div className="flex flex-col items-center gap-2 mb-10">
                  <p className="text-blue-700 font-normal text-xs font-public-sans"><span className="font-bold">Save 15%</span>on yearly plan!</p>
                {/* Billing Toggle */}
                  <div className="inline-flex items-center bg-white rounded-full p-1 border border-gray-200">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-4 py-1.5 rounded-full text-xs xl:text-sm font-public-sans font-normal transition-all duration-300 ${
                      billingCycle === 'monthly'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-[#A1A1AA] hover:text-blue-600'
                    }`}
                  >
                    {t('tariffPlan.billMonthly', 'Monthly')}
                  </button>
                  <button
                    onClick={() => setBillingCycle('yearly')}
                    className={`px-4 py-1.5 rounded-full text-xs xl:text-sm font-public-sans font-normal transition-all duration-300 ${
                      billingCycle === 'yearly'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-[#A1A1AA] hover:text-blue-600'
                    }`}
                  >
                    {t('tariffPlan.billYearly', 'Yearly')}
                  </button>
                </div>
              </div>
              <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-4">
                {plans.map((plan) => (
                    <div key={plan.id} className="relative flex flex-col">
                      {/* Most Popular Badge - Outside Card */}
                      {plan.popular && (
                        <div className="absolute -top-8 left-0 right-0 z-10 bg-blue-600 text-white py-1.5 rounded-t-md text-xs xl:text-sm font-medium font-public-sans flex items-center justify-center gap-1.5 shadow-md">
                          {t('tariffPlan.mostPopular', 'Most Popular')}
                          <Sparkles className="w-3 h-3 fill-white" />
                        </div>
                      )}
                      
                      <div
                        className={`shadow-[0_2px_8px_rgba(0,0,0,0.08)] border transition-all duration-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] flex flex-col h-full overflow-hidden bg-white ${
                          plan.popular 
                          ? 'border-blue-500 rounded-b-2xl' 
                          : 'border-gray-200 rounded-2xl'
                        }`}
                      >
                    
                    {/* Card Header */}
                    <div className='p-4 bg-white'>
                      <h3 className='text-lg xl:text-xl font-bold font-public-sans mb-2 text-[#0D001B]'>
                        {plan.name}
                      </h3>
                      <div className='text-gray-900'>
                        {plan.id === 'enterprise' ? (
                          <>
                            <div className="text-3xl xl:text-4xl font-public-sans font-bold">
                              Let's talk
                            </div>
                            <p className="text-xs mt-1 text-[#A5A5A5] font-light">Custom plans</p>
                          </>
                        ) : (
                          <>
                            <div className="flex items-baseline gap-1 flex-wrap">
                              <span className="text-3xl text-[#171718] xl:text-4xl font-public-sans font-bold">
                          {getPrice(plan)}
                        </span>
                              {plan.price > 0 && plan.id !== 'business' && (
                                <span className="text-sm font-public-sans text-[#878787] font-normal">
                                  /{billingCycle === 'monthly' ? t('tariffPlan.month', 'month') : t('tariffPlan.month', 'month')}
                          </span>
                              )}
                              {plan.id === 'business' && (
                                <>
                                  <span className="text-sm text-[#171718] font-public-sans font-normal">/seat/month</span>
                                  <div className="ml-2 flex items-center gap-1 border border-[#E0E0E0] rounded-md">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setTeamSeats(Math.max(2, teamSeats - 1));
                                      }}
                                      className="w-5 h-5 py-1 flex items-center justify-center border-r border-[#E0E0E0] text-[#4D4D4D] rounded-l-md text-lg font-bold"
                                    >
                                      -
                                    </button>
                                    <span className="text-sm py-1 text-[#4D4D4D] font-medium min-w-[60px] text-center whitespace-nowrap">{teamSeats} seats</span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setTeamSeats(teamSeats + 1);
                                      }}
                                      className="w-5 h-5 flex py-1 items-center justify-center border-l border-[#E0E0E0] text-[#4D4D4D] rounded-r-md text-lg font-bold"
                                    >
                                      +
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                            {plan.price === 0 && plan.id === 'starter' && (
                              <p className="text-xs mt-1 text-[#A5A5A5] font-light">No commitment</p>
                            )}
                            {plan.price > 0 && plan.id !== 'business' && billingCycle === 'yearly' && plan.yearlyPrice && (
                              <p className="text-xs mt-1 text-[#A5A5A5] font-light">${plan.yearlyPrice} Billed annually</p>
                            )}
                            {plan.id === 'business' && (
                              <p className="text-xs mt-1 text-[#A5A5A5] font-light">
                                <span className="font-semibold">Minimum 2 seats,</span> ${billingCycle === 'yearly' ? (plan.yearlyPrice || 0) * teamSeats : plan.price * teamSeats * 12} Billed annually
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className={`px-4 pb-4 pt-3 flex flex-col flex-grow bg-white`}>
                      {/* Credits Info */}
                      <div className="mb-4">
                        <div className="flex items-center text-regular font-bold text-[#4D4D4D]">
                          <span className="font-bold">{plan.credits} Credits</span>
                          <span className="ml-1 text-[#878787] text-xs font-light">
                            {plan.id === 'starter' ? ' / one-time on registration' : ' /month'}
                          </span>
                          <div className="ml-1 w-4 h-4 items-center justify-center">
                            <InfoIcon className="w-3 h-3 text-[#A5A5A5]" />
                          </div>
                        </div>
                      </div>

                      {/* Section Title */}
                      <h4 className="text-base font-semibold text-[#4D4D4D] mb-3">
                        {plan.id === 'enterprise' 
                          ? t('tariffPlan.allTeamFeaturesPlus', 'All Team features, plus:')
                          : t('tariffPlan.ourPlanIncludes', `Our ${plan.name} plan includes:`)}
                      </h4>

                      {/* Features List */}
                      <div className="space-y-2.5 mb-4 font-public-sans flex-grow">
                        {plan.storage && (
                          <div className="flex items-start">
                            <Check className="w-4 h-4 mr-2.5 flex-shrink-0 mt-0.5 text-blue-600" />
                            <span className="text-sm text-[#878787] leading-relaxed">
                              <span className="font-semibold">Storage:</span> {plan.storage}
                            </span>
                          </div>
                        )}
                        
                        {plan.connectors && plan.connectors !== '-' && (
                          <div className="flex items-start">
                            <Check className="w-4 h-4 mr-2.5 flex-shrink-0 mt-0.5 text-blue-600" />
                            <span className="text-sm text-[#878787] leading-relaxed">
                              <span className="font-semibold">Connectors:</span> {plan.connectors}
                            </span>
                          </div>
                        )}

                        {plan.avatars && (
                          <div className="flex items-start">
                            <Check className="w-4 h-4 mr-2.5 flex-shrink-0 mt-0.5 text-blue-600" />
                            <span className="text-sm text-[#878787] leading-relaxed">
                              <span className="font-semibold">Avatars:</span> {plan.avatars}
                            </span>
                          </div>
                        )}

                        {plan.voiceover && (
                          <div className="flex items-start">
                            <Check className="w-4 h-4 mr-2.5 flex-shrink-0 mt-0.5 text-blue-600" />
                            <span className="text-sm text-[#878787] leading-relaxed">
                              <span className="font-semibold">Voiceover:</span> {plan.voiceover}
                            </span>
                          </div>
                        )}

                        {plan.watermarkRemoval && (
                          <div className="flex items-start">
                            <Check className="w-4 h-4 mr-2.5 flex-shrink-0 mt-0.5 text-blue-600" />
                            <span className="text-sm text-[#878787] leading-relaxed">
                              <span className="font-semibold">Watermark removal</span>
                            </span>
                          </div>
                        )}

                        {plan.slides && (
                          <div className="flex items-start">
                            <Check className="w-4 h-4 mr-2.5 flex-shrink-0 mt-0.5 text-blue-600" />
                            <span className="text-sm text-[#878787] leading-relaxed">
                              <span className="font-semibold">Slides:</span> {plan.slides}
                            </span>
                          </div>
                        )}

                        {plan.brandKit && (
                          <div className="flex items-start">
                            <Check className="w-4 h-4 mr-2.5 flex-shrink-0 mt-0.5 text-blue-600" />
                            <span className="text-sm text-[#878787] leading-relaxed">
                              <span className="font-semibold">Brand Kit:</span> {plan.brandKit}
                            </span>
                          </div>
                        )}

                        {plan.videoExport && (
                          <div className="flex items-start">
                            <Check className="w-4 h-4 mr-2.5 flex-shrink-0 mt-0.5 text-blue-600" />
                            <span className="text-sm text-[#878787] leading-relaxed">
                              <span className="font-semibold">Video export:</span> {plan.videoExport}
                            </span>
                          </div>
                        )}

                        {plan.scormExport && (
                          <div className="flex items-start">
                            <Check className="w-4 h-4 mr-2.5 flex-shrink-0 mt-0.5 text-blue-600" />
                            <span className="text-sm text-[#878787] leading-relaxed">
                              <span className="font-semibold">SCORM export:</span> {plan.scormExport}
                            </span>
                          </div>
                        )}

                        {plan.apiAccess && (
                          <div className="flex items-start">
                            <Check className="w-4 h-4 mr-2.5 flex-shrink-0 mt-0.5 text-blue-600" />
                            <span className="text-sm text-[#878787] leading-relaxed">
                              <span className="font-semibold">API access:</span> {plan.apiAccess}
                            </span>
                          </div>
                        )}

                        {plan.security && (
                          <div className="flex items-start">
                            <Check className="w-4 h-4 mr-2.5 flex-shrink-0 mt-0.5 text-blue-600" />
                            <span className="text-sm text-[#878787] leading-relaxed">
                              <span className="font-semibold">Security:</span> {plan.security}
                            </span>
                          </div>
                        )}

                        {plan.customization && (
                          <div className="flex items-start">
                            <Check className="w-4 h-4 mr-2.5 flex-shrink-0 mt-0.5 text-blue-600" />
                            <span className="text-sm text-[#878787] leading-relaxed">
                              <span className="font-semibold">Customization:</span> {plan.customization}
                            </span>
                          </div>
                        )}

                        {plan.workspace && (
                          <div className="flex items-start">
                            <Check className="w-4 h-4 mr-2.5 flex-shrink-0 mt-0.5 text-blue-600" />
                            <span className="text-sm text-[#878787] leading-relaxed">
                              <span className="font-semibold">Workspace:</span> {plan.workspace}
                            </span>
                          </div>
                        )}

                        {plan.support && (
                          <div className="flex items-start">
                            <Check className="w-4 h-4 mr-2.5 flex-shrink-0 mt-0.5 text-blue-600" />
                            <span className="text-sm text-[#878787] leading-relaxed">
                              <span className="font-semibold">Support:</span> {plan.support}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* CTA Button */}
                    <button
                        onClick={() => {
                          if (plan.name.includes('Enterprise')) {
                            onOpenChange(false);
                            setShowContactSales(true);
                          } else if (plan.id !== 'starter' && plan.id !== currentPlanId) {
                            handlePurchasePlan(plan);
                          }
                        }}
                        className={`w-full py-2.5 rounded-full font-public-sans font-semibold text-sm transition-all duration-300 ${
                          plan.id === currentPlanId
                            ? 'bg-gray-200 text-[#878787] cursor-not-allowed'
                            : plan.name.includes('Enterprise')
                            ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                        }`}
                        disabled={plan.id === currentPlanId}
                      >
                        {plan.id === currentPlanId
                          ? t('tariffPlan.current', 'Current')
                          : plan.name.includes('Enterprise')
                          ? t('tariffPlan.contactSales', 'Contact Sales')
                          : t('tariffPlan.upgrade', 'Upgrade')}
                      </button>
                    </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-4 mb-2">
                <button 
                  onClick={() => {
                    onOpenChange(false);
                    setShowComparison(true);
                  }}
                  className="text-blue-600 hover:text-blue-700 p-2 border border-blue-600 rounded-md font-medium text-sm inline-flex items-center gap-1 transition-colors"
                >
                  {t('tariffPlan.seeFullComparison', 'See Full Comparison')}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              {/* Credit Add-Ons Section */}
              <div className="mt-6 pt-3">
                <h2 className="text-xl font-semibold text-[#4D4D4D] mb-1 text-center">
                  Additional services
                </h2>
                <p className="text-sm text-[#878787] text-center mb-6">
                  Add more power with extra credits, storage, or integrations.
                </p>
                
                <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-10 justify-items-center max-w-5xl mx-auto">
                  {creditAddOns.map((addOn: any) => {
                    const IconComponent = addOn.type === 'credits' ? CoinsIcon : addOn.type === 'storage' ? StorageIcon : ConnectorsIcon;
                    const amountIcon = addOn.type === 'credits' ? (
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.2267 6.08C11.8569 6.31495 12.4177 6.70502 12.8572 7.21413C13.2967 7.72324 13.6007 8.33496 13.7412 8.99271C13.8816 9.65046 13.8539 10.333 13.6607 10.9772C13.4675 11.6215 13.1149 12.2065 12.6356 12.6784C12.1563 13.1503 11.5658 13.4937 10.9187 13.6768C10.2715 13.86 9.5886 13.877 8.93312 13.7263C8.27764 13.5756 7.67074 13.2621 7.16855 12.8147C6.66636 12.3673 6.28509 11.8005 6.06 11.1667M3.83333 3.16667H4.5V5.83333M10.3067 8.42L10.7733 8.89333L8.89333 10.7733M8.5 4.5C8.5 6.70914 6.70914 8.5 4.5 8.5C2.29086 8.5 0.5 6.70914 0.5 4.5C0.5 2.29086 2.29086 0.5 4.5 0.5C6.70914 0.5 8.5 2.29086 8.5 4.5Z" stroke="#4D4D4D" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    ) : addOn.type === 'storage' ? (
                      <svg width="15" height="12" viewBox="0 0 15 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.8333 5.83333H0.5M13.8333 5.83333V9.83333C13.8333 10.187 13.6929 10.5261 13.4428 10.7761C13.1928 11.0262 12.8536 11.1667 12.5 11.1667H1.83333C1.47971 11.1667 1.14057 11.0262 0.890524 10.7761C0.640476 10.5261 0.5 10.187 0.5 9.83333V5.83333M13.8333 5.83333L11.5333 1.24C11.4229 1.01786 11.2528 0.830914 11.042 0.700186C10.8312 0.569459 10.5881 0.500132 10.34 0.5H3.99333C3.74528 0.500132 3.50218 0.569459 3.29136 0.700186C3.08055 0.830914 2.91038 1.01786 2.8 1.24L0.5 5.83333M3.16667 8.5H3.17333M5.83333 8.5H5.84" stroke="#4D4D4D" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3.46222 6.42444V9.38667C3.46222 9.77948 3.61827 10.1562 3.89603 10.434C4.17379 10.7117 4.55052 10.8678 4.94333 10.8678H7.90556M1.98111 0.5H4.94333C5.76133 0.5 6.42444 1.16312 6.42444 1.98111V4.94333C6.42444 5.76133 5.76133 6.42444 4.94333 6.42444H1.98111C1.16312 6.42444 0.5 5.76133 0.5 4.94333V1.98111C0.5 1.16312 1.16312 0.5 1.98111 0.5ZM9.38667 7.90556H12.3489C13.1669 7.90556 13.83 8.56867 13.83 9.38667V12.3489C13.83 13.1669 13.1669 13.83 12.3489 13.83H9.38667C8.56867 13.83 7.90556 13.1669 7.90556 12.3489V9.38667C7.90556 8.56867 8.56867 7.90556 9.38667 7.90556Z" stroke="#4D4D4D" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    );
                    
                    return (
                    <div key={addOn.id} className="bg-white rounded-lg border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-all p-5">
                      {/* Header Section - Icon and Title */}
                      <div className="flex items-start gap-1 mb-1">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border border-blue-600">
                          <IconComponent className="w-4 h-4" />
                        </div>
                          <h3 className="text-lg font-semibold text-[#333333] leading-tight mb-1">
                            {addOn.name}
                          </h3>
                        </div>
                      <p className="text-xs text-[#878787] mb-3 font-light leading-relaxed">
                        {addOn.description}
                      </p>
                      {/* Amount Info */}
                      <div className="flex items-center gap-1.5 mb-4">
                        {amountIcon}
                        <span className="text-sm font-bold text-[#4D4D4D]">
                          {addOn.amount}
                          </span>
                        </div>

                      {/* Price and Quantity */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold text-[#333333]">
                            {typeof addOn.price === 'number' ? `$${addOn.price}` : addOn.price}
                          </span>
                          {addOn.priceNote === 'per month' && (
                            <span className="text-sm text-[#171718] font-normal">/month</span>
                          )}
                        </div>

                          <div className="flex border border-[#D0D0D0] rounded-md overflow-hidden bg-white">
                            <button
                              onClick={() => setCreditQuantities(prev => ({
                                ...prev,
                                [addOn.id]: Math.max(1, prev[addOn.id] - 1)
                              }))}
                              className="px-1 py-0 text-[#333333] hover:bg-gray-50 border-r border-[#D0D0D0] font-bold"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <div className="px-1 py-0 text-xs text-[#4D4D4D] font-medium min-w-[40px] text-center">
                              {creditQuantities[addOn.id]}
                          </div>
                            <button
                              onClick={() => setCreditQuantities(prev => ({
                                ...prev,
                                [addOn.id]: prev[addOn.id] + 1
                              }))}
                              className="px-1 text-[#333333] hover:bg-gray-50 border-l border-[#D0D0D0] font-bold"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                      </div>
                      
                      {/* Buy Now Button */}
                      <button
                        className='w-full py-2.5 rounded-full font-semibold text-sm transition-all bg-[#CCDBFC] text-[#0F58F9] hover:bg-[#8BB4FF] shadow-sm'
                      >
                           {t('addOns.buyNow', 'Buy now')}
                      </button>
                    </div>
                    );
                  })}
                    </div>
                  </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </DialogContent>
      </Dialog>
      <ContactSalesModal open={showContactSales} onOpenChange={setShowContactSales} />
      <PlanComparisonModal open={showComparison} onOpenChange={setShowComparison} />
    </>
  );
};

export default TariffPlanModal;
