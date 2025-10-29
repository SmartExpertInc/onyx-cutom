import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Upload } from 'lucide-react';

const XLSFileIcon = () => (
  <svg width="41" height="41" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g filter="url(#filter0_ddd_867_16085)">
      <rect x="2" y="2" width="36.1169" height="36.1169" rx="7.73933" fill="url(#paint0_linear_867_16085)"/>
      <g clipPath="url(#clip0_867_16085)">
        <path d="M17.3475 15.0391H14.5889V15.7287H17.3475V15.0391Z" fill="#797979"/>
        <path d="M17.3475 16.418H14.5889V17.1076H17.3475V16.418Z" fill="#797979"/>
        <path d="M24.5888 16.418H18.0371V17.1076H24.5888V16.418Z" fill="#797979"/>
        <path d="M24.5888 20.5566H18.0371V21.2463H24.5888V20.5566Z" fill="#797979"/>
        <path d="M24.5888 17.7988H18.0371V18.4885H24.5888V17.7988Z" fill="#797979"/>
        <path d="M17.3475 17.7988H14.5889V18.4885H17.3475V17.7988Z" fill="#797979"/>
        <path d="M24.5888 19.1777H18.0371V19.8674H24.5888V19.1777Z" fill="#797979"/>
        <path d="M11.8301 24.0059V29.1783C11.8301 29.5262 12.2508 29.8679 12.6794 29.8679H26.498C26.9266 29.8679 27.3473 29.5262 27.3473 29.1783V24.0059H11.8301ZM17.8425 28.4886H17.1873L16.6356 27.1779H16.5884L15.9942 28.4886H15.339L16.2208 26.8007L15.2825 25.0138H15.9284L16.5411 26.4283H16.5884L17.2532 25.0138H17.899L16.9608 26.8007L17.8425 28.4886ZM20.8549 28.4886H18.6815V25.0141H19.2566V28.0597H20.8549V28.4886ZM23.318 27.9017C23.2663 28.0197 23.1932 28.1234 23.0987 28.2128C23.0042 28.3021 22.888 28.3738 22.7497 28.4272C22.6115 28.4807 22.4542 28.5072 22.2784 28.5072C22.2028 28.5072 22.1253 28.5031 22.0449 28.4955C21.9646 28.4879 21.8839 28.4741 21.8021 28.4555C21.7204 28.4365 21.6425 28.4107 21.5687 28.3776C21.4949 28.3445 21.4311 28.3045 21.3777 28.2572L21.4766 27.8517C21.5204 27.8769 21.5763 27.9014 21.6439 27.9248C21.7115 27.9483 21.7811 27.9703 21.8535 27.9907C21.9256 28.0114 21.998 28.0276 22.0704 28.0403C22.1425 28.0528 22.2101 28.0593 22.2732 28.0593C22.4649 28.0593 22.6118 28.0145 22.7139 27.9248C22.8159 27.8352 22.867 27.7024 22.867 27.5265C22.867 27.4197 22.8308 27.3286 22.7587 27.2531C22.6863 27.1776 22.5959 27.1093 22.4877 27.0479C22.3794 26.9865 22.2621 26.9255 22.1363 26.8641C22.0104 26.8028 21.8925 26.7303 21.7828 26.6472C21.6728 26.5641 21.5818 26.4659 21.5094 26.3528C21.437 26.2397 21.4011 26.0983 21.4011 25.9286C21.4011 25.7748 21.4294 25.6379 21.4859 25.5186C21.5425 25.3993 21.6187 25.2976 21.7146 25.2145C21.8104 25.1314 21.9221 25.0676 22.0494 25.0234C22.1766 24.9793 22.3111 24.9576 22.4525 24.9576C22.597 24.9576 22.7432 24.971 22.8908 24.9976C23.0384 25.0241 23.1577 25.0676 23.249 25.1272C23.2301 25.1679 23.208 25.2128 23.1832 25.2617C23.158 25.3107 23.1342 25.3559 23.1125 25.3983C23.0904 25.4407 23.0715 25.4762 23.0559 25.5045C23.0401 25.5328 23.0308 25.5486 23.0277 25.5517C23.0087 25.5424 22.9877 25.53 22.9639 25.5141C22.9401 25.4983 22.9063 25.4828 22.8625 25.4669C22.8184 25.451 22.7604 25.4403 22.688 25.4338C22.6156 25.4272 22.5228 25.429 22.4097 25.4386C22.3466 25.4452 22.2873 25.4628 22.2304 25.4928C22.1735 25.5228 22.1235 25.5593 22.0794 25.6034C22.0353 25.6476 22.0008 25.6969 21.9756 25.7521C21.9504 25.8069 21.938 25.86 21.938 25.91C21.938 26.0355 21.9739 26.1369 22.0463 26.2141C22.1184 26.2914 22.208 26.3586 22.3149 26.4169C22.4218 26.4752 22.538 26.5317 22.6639 26.5865C22.7894 26.6414 22.9066 26.7086 23.0153 26.7869C23.1239 26.8652 23.2139 26.9638 23.2863 27.0814C23.3584 27.1993 23.3946 27.3507 23.3946 27.5362C23.3959 27.6621 23.3701 27.7838 23.318 27.9017Z" fill="#797979"/>
        <path d="M27.3473 23.3155V14.6872C27.3473 14.423 27.3156 14.2275 27.1577 14.0693L23.1449 10.0568C23.0246 9.9365 22.8577 9.86719 22.687 9.86719H12.6794C12.2704 9.86719 11.8301 10.183 11.8301 10.8762V23.3155H27.3473ZM22.5197 11.0365C22.5197 10.8786 22.7104 10.7996 22.8221 10.9113L26.3032 14.3924C26.4149 14.5041 26.3359 14.6948 26.178 14.6948H22.5197V11.0365ZM13.899 20.5568V19.8672V19.1775V18.4879V17.7982V17.1086V16.4189V15.7293V14.3499H18.037V15.7293H25.2784V17.1086V17.7982V18.4879V19.1775V19.8672V20.5568V21.9362H18.037H17.3473H13.899V20.5568Z" fill="#797979"/>
        <path d="M17.3475 19.1777H14.5889V19.8674H17.3475V19.1777Z" fill="#797979"/>
        <path d="M17.3475 20.5566H14.5889V21.2463H17.3475V20.5566Z" fill="#797979"/>
      </g>
    </g>
    <defs>
      <filter id="filter0_ddd_867_16085" x="0.0651685" y="0.710112" width="39.9869" height="39.9869" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feMorphology radius="0.644944" operator="erode" in="SourceAlpha" result="effect1_dropShadow_867_16085"/>
        <feOffset dy="0.644944"/>
        <feGaussianBlur stdDeviation="0.644944"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_867_16085"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="0.644944"/>
        <feGaussianBlur stdDeviation="0.967416"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
        <feBlend mode="normal" in2="effect1_dropShadow_867_16085" result="effect2_dropShadow_867_16085"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feMorphology radius="0.644944" operator="dilate" in="SourceAlpha" result="effect3_dropShadow_867_16085"/>
        <feOffset/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0"/>
        <feBlend mode="normal" in2="effect2_dropShadow_867_16085" result="effect3_dropShadow_867_16085"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect3_dropShadow_867_16085" result="shape"/>
      </filter>
      <linearGradient id="paint0_linear_867_16085" x1="20.0584" y1="2" x2="20.0584" y2="38.1169" gradientUnits="userSpaceOnUse">
        <stop offset="0.25" stopColor="white"/>
        <stop offset="1" stopColor="#F9FAFB"/>
      </linearGradient>
      <clipPath id="clip0_867_16085">
        <rect width="20" height="20" fill="white" transform="translate(9.58984 9.86719)"/>
      </clipPath>
    </defs>
  </svg>
);

const PDFFileIcon = () => (
  <svg width="41" height="41" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g filter="url(#filter0_ddd_867_16126)">
      <rect x="2.82812" y="2.13281" width="36.1169" height="36.1169" rx="7.73933" fill="url(#paint0_linear_867_16126)"/>
      <g clipPath="url(#clip0_867_16126)">
        <path d="M24.7423 18.5763C24.7937 18.5042 24.8137 18.458 24.8216 18.4332C24.7792 18.4108 24.723 18.3652 24.4165 18.3652C24.2423 18.3652 24.0237 18.3728 23.792 18.4025C24.073 18.6187 24.1416 18.728 24.3254 18.728C24.4058 18.7283 24.6361 18.7249 24.7423 18.5763Z" fill="#797979"/>
        <path d="M18.1791 21.1204C18.2305 21.1042 18.5305 20.9673 19.0895 19.9355C18.3522 20.3497 18.0522 20.69 18.0309 20.8818C18.0271 20.9135 18.0177 20.9969 18.1791 21.1204Z" fill="#797979"/>
        <path d="M28.8571 23.3155V14.6872C28.8571 14.423 28.8254 14.2275 28.6674 14.0693L24.6547 10.0568C24.5343 9.9365 24.3674 9.86719 24.1967 9.86719H14.1892C13.7802 9.86719 13.3398 10.183 13.3398 10.8762V23.3155H28.8571ZM24.0295 11.0365C24.0295 10.8786 24.2202 10.7996 24.3319 10.9113L27.8129 14.3924C27.9247 14.5041 27.8457 14.6948 27.6878 14.6948H24.0295V11.0365ZM17.4543 20.8172C17.5171 20.2558 18.2112 19.6682 19.5181 19.0696C20.0367 17.9331 20.5302 16.5327 20.8243 15.3627C20.4802 14.6137 20.1457 13.642 20.3895 13.072C20.475 12.8724 20.5816 12.7193 20.7805 12.653C20.8592 12.6268 21.0578 12.5937 21.1309 12.5937C21.3047 12.5937 21.4574 12.8175 21.5657 12.9555C21.6674 13.0851 21.8981 13.3599 21.4371 15.301C21.9019 16.261 22.5605 17.2389 23.1916 17.9086C23.6436 17.8268 24.0326 17.7851 24.3495 17.7851C24.8895 17.7851 25.2167 17.911 25.3502 18.1703C25.4605 18.3848 25.4154 18.6355 25.2157 18.9151C25.0236 19.1837 24.7588 19.3258 24.4502 19.3258C24.0309 19.3258 23.5426 19.061 22.9981 18.5379C22.0198 18.7424 20.8771 19.1072 19.954 19.511C19.6657 20.1227 19.3895 20.6155 19.1323 20.9768C18.7795 21.4727 18.4747 21.7034 18.1729 21.7034C18.0529 21.7034 17.9378 21.6644 17.8395 21.591C17.4798 21.321 17.4316 21.0213 17.4543 20.8172Z" fill="#797979"/>
        <path d="M18.4168 25.6793C18.3678 25.6118 18.2995 25.5552 18.2116 25.5097C18.1236 25.4642 18.0071 25.4414 17.8626 25.4414H17.4385V26.818H17.9571C18.0261 26.818 18.0943 26.8062 18.1623 26.7824C18.2299 26.759 18.2919 26.7204 18.3485 26.6669C18.405 26.6135 18.4505 26.539 18.485 26.4431C18.5195 26.3473 18.5368 26.2286 18.5368 26.0873C18.5368 26.0307 18.5288 25.9652 18.5133 25.8918C18.4974 25.818 18.4654 25.7473 18.4168 25.6793Z" fill="#797979"/>
        <path d="M21.216 16.1348C20.9691 16.9879 20.6439 17.9089 20.2939 18.743C21.0146 18.4634 21.7981 18.2192 22.5339 18.0465C22.0684 17.5058 21.6033 16.8306 21.216 16.1348Z" fill="#797979"/>
        <path d="M13.3398 24.0059V29.1783C13.3398 29.5262 13.7605 29.8679 14.1892 29.8679H28.0078C28.4364 29.8679 28.8571 29.5262 28.8571 29.1783V24.0059H13.3398ZM18.9936 26.5676C18.934 26.7107 18.8505 26.831 18.7436 26.9283C18.6367 27.0255 18.5078 27.101 18.3571 27.1545C18.2064 27.2079 18.0395 27.2345 17.8574 27.2345H17.4378V28.4886H16.8719V25.0141H17.8712C18.0188 25.0141 18.165 25.0376 18.3095 25.0848C18.454 25.1321 18.5836 25.2028 18.6985 25.2969C18.8133 25.391 18.9061 25.5052 18.9767 25.6386C19.0474 25.7721 19.0829 25.9221 19.0829 26.089C19.0833 26.2652 19.0533 26.4245 18.9936 26.5676ZM22.4612 27.3879C22.3998 27.5907 22.3223 27.7603 22.2278 27.8972C22.1333 28.0341 22.0274 28.1417 21.9095 28.2203C21.7916 28.299 21.6778 28.3576 21.5678 28.3972C21.4578 28.4365 21.3571 28.4617 21.2661 28.4728C21.175 28.4831 21.1074 28.4886 21.0633 28.4886H19.7481V25.0141H20.7947C21.0871 25.0141 21.344 25.0607 21.5654 25.1531C21.7867 25.2455 21.9709 25.3693 22.1171 25.5231C22.2633 25.6769 22.3723 25.8524 22.4447 26.0486C22.5167 26.2448 22.5529 26.4469 22.5529 26.6545C22.5533 26.9407 22.5226 27.1852 22.4612 27.3879ZM25.5467 25.4431H23.9485V26.5369H25.4005V26.9234H23.9485V28.4886H23.3733V25.0141H25.5467V25.4431Z" fill="#797979"/>
        <path d="M21.7076 25.8259C21.6086 25.7111 21.4741 25.6183 21.3045 25.5476C21.1348 25.4769 20.9148 25.4414 20.6445 25.4414H20.3145V28.0721H20.8755C21.2589 28.0721 21.5355 27.9497 21.7051 27.7045C21.8748 27.4593 21.9596 27.1042 21.9596 26.639C21.9596 26.4945 21.9424 26.3514 21.9079 26.21C21.8731 26.0686 21.8065 25.9407 21.7076 25.8259Z" fill="#797979"/>
        <path d="M21.0073 13.2168C20.9735 13.2282 20.5487 13.8227 21.0404 14.3258C21.3676 13.5965 21.0221 13.212 21.0073 13.2168Z" fill="#797979"/>
      </g>
    </g>
    <defs>
      <filter id="filter0_ddd_867_16126" x="0.893293" y="0.842925" width="39.9869" height="39.9869" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feMorphology radius="0.644944" operator="erode" in="SourceAlpha" result="effect1_dropShadow_867_16126"/>
        <feOffset dy="0.644944"/>
        <feGaussianBlur stdDeviation="0.644944"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_867_16126"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="0.644944"/>
        <feGaussianBlur stdDeviation="0.967416"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
        <feBlend mode="normal" in2="effect1_dropShadow_867_16126" result="effect2_dropShadow_867_16126"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feMorphology radius="0.644944" operator="dilate" in="SourceAlpha" result="effect3_dropShadow_867_16126"/>
        <feOffset/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0"/>
        <feBlend mode="normal" in2="effect2_dropShadow_867_16126" result="effect3_dropShadow_867_16126"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect3_dropShadow_867_16126" result="shape"/>
      </filter>
      <linearGradient id="paint0_linear_867_16126" x1="20.8866" y1="2.13281" x2="20.8866" y2="38.2497" gradientUnits="userSpaceOnUse">
        <stop offset="0.25" stopColor="white"/>
        <stop offset="1" stopColor="#F9FAFB"/>
      </linearGradient>
      <clipPath id="clip0_867_16126">
        <rect width="20" height="20" fill="white" transform="translate(11.0977 9.86719)"/>
      </clipPath>
    </defs>
  </svg>
);

const DOCFileIcon = () => (
  <svg width="41" height="41" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g filter="url(#filter0_ddd_867_16106)">
      <rect x="2.82812" y="1.56641" width="36.1169" height="36.1169" rx="7.73933" fill="url(#paint0_linear_867_16106)"/>
      <g clipPath="url(#clip0_867_16106)">
        <path d="M13.8174 28.3164C14.1044 29.2145 14.9369 29.8659 15.917 29.8659H26.3523C27.3324 29.8659 28.1649 29.2145 28.4519 28.3164H13.8174Z" fill="#797979"/>
        <path d="M27.9111 13.0818L25.3442 10.5149C25.2384 10.409 25.1239 10.3156 25.002 10.2344V13.41C25.002 13.4822 25.0609 13.5409 25.1332 13.5409H28.2639C28.1686 13.3748 28.0502 13.2209 27.9111 13.0818Z" fill="#797979"/>
        <path d="M28.5656 14.7118H25.1415C24.4227 14.7118 23.8382 14.1273 23.8382 13.4089V9.86797C23.8229 9.86719 23.8073 9.86719 23.7921 9.86719H15.9234C14.7068 9.86719 13.7168 10.8572 13.7168 12.0742V18.0937H28.5656L28.5656 14.7118Z" fill="#797979"/>
        <path d="M21.1493 21.8066C20.7919 21.8066 20.6133 22.0075 20.6133 22.4089V24.0047C20.6133 24.4062 20.7919 24.607 21.1493 24.607C21.5106 24.607 21.6913 24.4062 21.6913 24.0047V22.4089C21.6912 22.0075 21.5105 21.8066 21.1493 21.8066Z" fill="#797979"/>
        <path d="M28.6324 19.2656H13.6311C12.8146 19.2656 12.1504 19.9298 12.1504 20.7463V25.6647C12.1504 26.4812 12.8146 27.1454 13.6311 27.1454H28.6324C29.4488 27.1454 30.1131 26.4812 30.1131 25.6647V20.7463C30.1131 19.9298 29.4489 19.2656 28.6324 19.2656ZM19.1207 23.9686C19.1207 24.4584 18.9861 24.8177 18.7172 25.0465C18.4482 25.2754 18.0888 25.3898 17.6393 25.3898H16.5734C16.4529 25.3898 16.3545 25.3618 16.2783 25.3055C16.202 25.2493 16.1638 25.1831 16.1638 25.1068V21.2707C16.1638 21.1945 16.202 21.1282 16.2783 21.072C16.3545 21.0158 16.4529 20.9877 16.5734 20.9877H17.6393C18.0888 20.9877 18.4482 21.1021 18.7172 21.331C18.9861 21.5598 19.1207 21.9192 19.1207 22.4089V23.9686ZM22.6255 24.0047C22.6255 24.4946 22.4909 24.8538 22.222 25.0827C21.953 25.3115 21.5937 25.4259 21.1441 25.4259C20.6985 25.4259 20.3411 25.3115 20.0722 25.0827C19.8032 24.8538 19.6687 24.4946 19.6687 24.0047V22.4089C19.6687 21.9191 19.8032 21.5598 20.0722 21.3309C20.3411 21.1021 20.6985 20.9877 21.1441 20.9877C21.5937 20.9877 21.953 21.1021 22.222 21.3309C22.4909 21.5598 22.6255 21.9191 22.6255 22.4089V24.0047ZM24.6669 24.607C24.7793 24.607 24.8726 24.5889 24.9469 24.5528C25.0211 24.5166 25.0743 24.4615 25.1065 24.3871C25.1386 24.3129 25.1596 24.2516 25.1697 24.2035C25.1797 24.1553 25.1887 24.089 25.1968 24.0048C25.2128 23.8161 25.3674 23.7217 25.6605 23.7217C25.8331 23.7217 25.9556 23.7529 26.0279 23.815C26.1001 23.8773 26.1362 23.9948 26.1362 24.1673C26.1362 24.5568 25.9947 24.8639 25.7116 25.0887C25.4286 25.3136 25.0663 25.426 24.6247 25.426C24.195 25.426 23.8468 25.3115 23.5798 25.0827C23.3128 24.8539 23.1794 24.4946 23.1794 24.0048V22.4089C23.1794 21.9191 23.3128 21.5598 23.5798 21.331C23.8468 21.1021 24.195 20.9877 24.6247 20.9877C25.0663 20.9877 25.4286 21.0941 25.7116 21.3069C25.9947 21.5197 26.1362 21.8127 26.1362 22.1861C26.1362 22.3587 26.1001 22.4762 26.0279 22.5384C25.9556 22.6007 25.8352 22.6317 25.6665 22.6317C25.3654 22.6317 25.2089 22.5375 25.1968 22.3487C25.1848 21.9873 25.0061 21.8067 24.6608 21.8067C24.2995 21.8067 24.1188 22.0075 24.1188 22.4089V24.0048C24.1189 24.4062 24.3015 24.607 24.6669 24.607Z" fill="#797979"/>
        <path d="M17.6454 21.8066H17.1094V24.5708H17.6454C18.0067 24.5708 18.1873 24.3701 18.1873 23.9686V22.4089C18.1873 22.0075 18.0067 21.8066 17.6454 21.8066Z" fill="#797979"/>
      </g>
    </g>
    <defs>
      <filter id="filter0_ddd_867_16106" x="0.893293" y="0.276519" width="39.9869" height="39.9869" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feMorphology radius="0.644944" operator="erode" in="SourceAlpha" result="effect1_dropShadow_867_16106"/>
        <feOffset dy="0.644944"/>
        <feGaussianBlur stdDeviation="0.644944"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_867_16106"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="0.644944"/>
        <feGaussianBlur stdDeviation="0.967416"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
        <feBlend mode="normal" in2="effect1_dropShadow_867_16106" result="effect2_dropShadow_867_16106"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feMorphology radius="0.644944" operator="dilate" in="SourceAlpha" result="effect3_dropShadow_867_16106"/>
        <feOffset/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0"/>
        <feBlend mode="normal" in2="effect2_dropShadow_867_16106" result="effect3_dropShadow_867_16106"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect3_dropShadow_867_16106" result="shape"/>
      </filter>
      <linearGradient id="paint0_linear_867_16106" x1="20.8866" y1="1.56641" x2="20.8866" y2="37.6833" gradientUnits="userSpaceOnUse">
        <stop offset="0.25" stopColor="white"/>
        <stop offset="1" stopColor="#F9FAFB"/>
      </linearGradient>
      <clipPath id="clip0_867_16106">
        <rect width="20" height="20" fill="white" transform="translate(11.1367 9.86719)"/>
      </clipPath>
    </defs>
  </svg>
);

const ZIPFileIcon = () => (
  <svg width="41" height="41" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g filter="url(#filter0_ddd_867_16099)">
      <rect x="2" y="2" width="36.1169" height="36.1169" rx="7.73933" fill="url(#paint0_linear_867_16099)"/>
      <g clipPath="url(#clip0_867_16099)">
        <path d="M19.9202 21.2467C20.4906 21.2467 20.9547 20.7826 20.9547 20.2122V19.1777H18.8857V20.2122C18.8857 20.7826 19.3499 21.2467 19.9202 21.2467ZM19.5754 19.8674H20.2651C20.4554 19.8674 20.6099 20.0215 20.6099 20.2122C20.6099 20.4029 20.4554 20.557 20.2651 20.557H19.5754C19.3851 20.557 19.2306 20.4029 19.2306 20.2122C19.2306 20.0215 19.3851 19.8674 19.5754 19.8674Z" fill="#797979"/>
        <path d="M27.8512 23.3155V14.6872C27.8512 14.423 27.8195 14.2275 27.6616 14.0693L23.6488 10.0568C23.5285 9.9365 23.3616 9.86719 23.1909 9.86719H13.1833C12.7743 9.86719 12.334 10.183 12.334 10.8762V23.3155H27.8512ZM23.0236 11.0365C23.0236 10.8786 23.2143 10.7996 23.3261 10.9113L26.8071 14.3924C26.9188 14.5041 26.8398 14.6948 26.6819 14.6948H23.0236V11.0365ZM18.1961 18.4879H19.5754V17.7982H18.8857V17.1086H19.5754V16.4189H18.8857V15.7293H19.5754V15.0396H18.8857V14.3499H19.5754V13.6603H18.8857V12.9706H19.5754V12.281H20.265V12.9706H20.9547V13.6603H20.265V14.3499H20.9547V15.0396H20.265V15.7293H20.9547V16.4189H20.265V17.1086H20.9547V17.7982H20.265V18.4879H21.6443V20.212C21.6443 21.1627 20.8709 21.9362 19.9202 21.9362C18.9695 21.9362 18.1961 21.1627 18.1961 20.212V18.4879Z" fill="#797979"/>
        <path d="M22.9382 25.6793C22.8893 25.6118 22.821 25.5552 22.7331 25.5097C22.6451 25.4642 22.5286 25.4414 22.3841 25.4414H21.96V26.818H22.4786C22.5475 26.818 22.6158 26.8062 22.6838 26.7824C22.7513 26.759 22.8134 26.7204 22.87 26.6669C22.9265 26.6135 22.972 26.539 23.0065 26.4431C23.041 26.3473 23.0582 26.2286 23.0582 26.0873C23.0582 26.0307 23.0503 25.9652 23.0348 25.8918C23.0189 25.818 22.9869 25.7473 22.9382 25.6793Z" fill="#797979"/>
        <path d="M12.334 24.0059V29.1783C12.334 29.5262 12.7547 29.8679 13.1833 29.8679H27.0019C27.4305 29.8679 27.8512 29.5262 27.8512 29.1783V24.0059H12.334ZM19.1498 25.4714L17.495 27.9559L17.4009 28.0314H19.1498V28.4886H16.8398V28.0314L18.4947 25.5469L18.5936 25.4714H16.8398V25.0141H19.1498V25.4714ZM20.5309 28.4886H19.9557V25.0141H20.5309V28.4886ZM23.5154 26.5676C23.4557 26.7107 23.3723 26.831 23.2654 26.9283C23.1585 27.0255 23.0295 27.101 22.8788 27.1545C22.7281 27.2079 22.5612 27.2345 22.3792 27.2345H21.9595V28.4886H21.3936V25.0141H22.393C22.5405 25.0141 22.6867 25.0376 22.8312 25.0848C22.9757 25.1321 23.1054 25.2028 23.2202 25.2969C23.335 25.391 23.4278 25.5052 23.4985 25.6386C23.5692 25.7721 23.6047 25.9221 23.6047 26.089C23.605 26.2652 23.575 26.4245 23.5154 26.5676Z" fill="#797979"/>
      </g>
    </g>
    <defs>
      <filter id="filter0_ddd_867_16099" x="0.0651685" y="0.710112" width="39.9869" height="39.9869" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feMorphology radius="0.644944" operator="erode" in="SourceAlpha" result="effect1_dropShadow_867_16099"/>
        <feOffset dy="0.644944"/>
        <feGaussianBlur stdDeviation="0.644944"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_867_16099"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="0.644944"/>
        <feGaussianBlur stdDeviation="0.967416"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
        <feBlend mode="normal" in2="effect1_dropShadow_867_16099" result="effect2_dropShadow_867_16099"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feMorphology radius="0.644944" operator="dilate" in="SourceAlpha" result="effect3_dropShadow_867_16099"/>
        <feOffset/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0"/>
        <feBlend mode="normal" in2="effect2_dropShadow_867_16099" result="effect3_dropShadow_867_16099"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect3_dropShadow_867_16099" result="shape"/>
      </filter>
      <linearGradient id="paint0_linear_867_16099" x1="20.0584" y1="2" x2="20.0584" y2="38.1169" gradientUnits="userSpaceOnUse">
        <stop offset="0.25" stopColor="white"/>
        <stop offset="1" stopColor="#F9FAFB"/>
      </linearGradient>
      <clipPath id="clip0_867_16099">
        <rect width="20" height="20" fill="white" transform="translate(10.0938 9.86719)"/>
      </clipPath>
    </defs>
  </svg>
);

const PNGFileIcon = () => (
  <svg width="41" height="41" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g filter="url(#filter0_ddd_867_16137)">
      <rect x="2.82812" y="2.13281" width="36.1169" height="36.1169" rx="7.73933" fill="url(#paint0_linear_867_16137)"/>
      <g clipPath="url(#clip0_867_16137)">
        <path d="M28.2084 14.0696L24.1957 10.0568C24.0753 9.9365 23.9084 9.86719 23.7378 9.86719H13.7302C13.3212 9.86719 12.8809 10.183 12.8809 10.8762V23.3155H13.0991L18.8702 18.4034C19.0071 18.2872 19.2102 18.2951 19.3374 18.4224L20.9729 20.0579L24.3505 16.3589C24.4129 16.2906 24.5002 16.2503 24.5929 16.2468C24.6902 16.2437 24.7757 16.2779 24.8429 16.3413L28.2912 19.6172L28.3984 19.7196V14.6872C28.3981 14.423 28.3664 14.2275 28.2084 14.0696ZM16.3291 18.0182C15.2702 18.0182 14.4088 17.1568 14.4088 16.0979C14.4088 15.0389 15.2702 14.1775 16.3291 14.1775C17.3881 14.1775 18.2495 15.0389 18.2495 16.0979C18.2495 17.1568 17.3881 18.0182 16.3291 18.0182ZM27.2288 14.6948H23.5705V11.0365C23.5705 10.8786 23.7612 10.7996 23.8729 10.9113L27.354 14.3924C27.4657 14.5041 27.3867 14.6948 27.2288 14.6948Z" fill="#797979"/>
        <path d="M21.4614 20.5464L23.1189 22.204C23.2538 22.3388 23.2538 22.5567 23.1189 22.6916C22.9841 22.8264 22.7662 22.8264 22.6314 22.6916L19.0748 19.135L14.1631 23.3157H28.3983V20.6826L24.6227 17.084L21.4614 20.5464Z" fill="#797979"/>
        <path d="M17.8195 26.784C17.8871 26.7606 17.9492 26.722 18.0057 26.6685C18.0623 26.6151 18.1078 26.5406 18.1423 26.4447C18.1767 26.3489 18.194 26.2303 18.194 26.0889C18.194 26.0323 18.186 25.9668 18.1705 25.8934C18.1547 25.8196 18.1226 25.7489 18.074 25.6813C18.025 25.6137 17.9567 25.5572 17.8688 25.5116C17.7809 25.4661 17.6643 25.4434 17.5198 25.4434H17.0957V26.8199H17.6143C17.6836 26.8192 17.7519 26.8075 17.8195 26.784Z" fill="#797979"/>
        <path d="M16.3293 14.8672C15.6507 14.8672 15.0986 15.4193 15.0986 16.0979C15.0986 16.7765 15.6507 17.3286 16.3293 17.3286C17.0079 17.3286 17.56 16.7765 17.56 16.0979C17.56 15.4193 17.0079 14.8672 16.3293 14.8672Z" fill="#797979"/>
        <path d="M13.3464 24.0059H12.8809V24.3783V24.6955V29.1783C12.8809 29.5262 13.3015 29.8679 13.7302 29.8679H27.5488C27.9774 29.8679 28.3981 29.5262 28.3981 29.1783V24.0059H13.5705H13.3464ZM22.8126 25.9641C22.8864 25.7424 22.9884 25.5579 23.1191 25.4103C23.2495 25.2624 23.4026 25.1503 23.5788 25.0731C23.7547 24.9959 23.945 24.9576 24.1491 24.9576C24.3378 24.9576 24.5136 24.989 24.6771 25.0517C24.8405 25.1148 24.9864 25.209 25.1153 25.3345L24.724 25.6834C24.6484 25.5921 24.5619 25.5262 24.4647 25.4855C24.3671 25.4448 24.2667 25.4241 24.1629 25.4241C24.0467 25.4241 23.9357 25.4459 23.8305 25.49C23.725 25.5341 23.6309 25.6086 23.5478 25.7138C23.4643 25.8193 23.3991 25.9548 23.3522 26.1217C23.3053 26.2886 23.2798 26.4924 23.2767 26.7345C23.2798 26.9703 23.3043 27.1745 23.3498 27.3472C23.3953 27.52 23.4581 27.6614 23.5384 27.7714C23.6188 27.8814 23.7098 27.9631 23.8119 28.0165C23.914 28.07 24.0215 28.0965 24.135 28.0965C24.1695 28.0965 24.2157 28.0941 24.274 28.0893C24.3319 28.0845 24.3902 28.0769 24.4484 28.0659C24.5064 28.0548 24.5622 28.04 24.6157 28.021C24.6691 28.0021 24.7084 27.9755 24.7336 27.941V27.0831H24.1443V26.6965H25.2947V28.04C25.2222 28.1314 25.1416 28.2055 25.0519 28.2638C24.9622 28.3221 24.8681 28.37 24.7691 28.4076C24.6702 28.4452 24.5678 28.4728 24.4626 28.4886C24.3571 28.5045 24.2529 28.5121 24.1491 28.5121C23.9415 28.5121 23.7509 28.4745 23.5764 28.399C23.4019 28.3234 23.2495 28.2121 23.1191 28.0641C22.9888 27.9162 22.8864 27.731 22.8126 27.5079C22.7388 27.2848 22.7019 27.0269 22.7019 26.7348C22.7019 26.4428 22.7384 26.1855 22.8126 25.9641ZM19.3874 25.0141H19.9626L21.325 27.409V25.0141H21.9002V28.4886H21.325L19.9626 26.0938V28.4886H19.3874V25.0141ZM16.5305 25.0141H17.5298C17.6774 25.0141 17.8236 25.0376 17.9681 25.0848C18.1126 25.1321 18.2422 25.2028 18.3571 25.2969C18.4719 25.391 18.5647 25.5052 18.6353 25.6386C18.706 25.7721 18.7415 25.9221 18.7415 26.089C18.7415 26.2652 18.7115 26.4245 18.6519 26.5676C18.5922 26.7107 18.5088 26.831 18.4019 26.9283C18.295 27.0255 18.166 27.101 18.0153 27.1545C17.8647 27.2079 17.6978 27.2345 17.5157 27.2345H17.096V28.4886H16.5302L16.5305 25.0141Z" fill="#797979"/>
      </g>
    </g>
    <defs>
      <filter id="filter0_ddd_867_16137" x="0.893293" y="0.842925" width="39.9869" height="39.9869" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feMorphology radius="0.644944" operator="erode" in="SourceAlpha" result="effect1_dropShadow_867_16137"/>
        <feOffset dy="0.644944"/>
        <feGaussianBlur stdDeviation="0.644944"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_867_16137"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="0.644944"/>
        <feGaussianBlur stdDeviation="0.967416"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
        <feBlend mode="normal" in2="effect1_dropShadow_867_16137" result="effect2_dropShadow_867_16137"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feMorphology radius="0.644944" operator="dilate" in="SourceAlpha" result="effect3_dropShadow_867_16137"/>
        <feOffset/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0"/>
        <feBlend mode="normal" in2="effect2_dropShadow_867_16137" result="effect3_dropShadow_867_16137"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect3_dropShadow_867_16137" result="shape"/>
      </filter>
      <linearGradient id="paint0_linear_867_16137" x1="20.8866" y1="2.13281" x2="20.8866" y2="38.2497" gradientUnits="userSpaceOnUse">
        <stop offset="0.25" stopColor="white"/>
        <stop offset="1" stopColor="#F9FAFB"/>
      </linearGradient>
      <clipPath id="clip0_867_16137">
        <rect width="20" height="20" fill="white" transform="translate(10.6406 9.86719)"/>
      </clipPath>
    </defs>
  </svg>
);

interface EmptySmartDriveProps {
  onUploadClick?: () => void;
  variant?: 'smartdrive' | 'knowledgebase';
}

export const EmptySmartDrive: React.FC<EmptySmartDriveProps> = ({ onUploadClick, variant = 'smartdrive' }) => {
  const { t } = useLanguage();
  
  const isKnowledgeBase = variant === 'knowledgebase';
  
  return (
    <div className="bg-white rounded-lg p-6 flex flex-col items-center" style={{ height: '60vh' }}>
      <div className="relative" style={{ borderBottom: '1px solid #EEEEF0' }}>
        {/* Background SVG */}
        <svg width="826" height="241" viewBox="0 0 826 241" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clip-path="url(#clip0_1339_33567)">
            <rect opacity="0.5" x="393.963" y="226.807" width="38.0738" height="38.0517" rx="19.0258" stroke="#719AF5" stroke-width="0.644944"/>
            <rect opacity="0.5" x="368.151" y="201.01" width="89.6988" height="89.6472" rx="44.8236" stroke="#719AF5" stroke-width="0.644944"/>
            <rect opacity="0.5" x="342.338" y="175.213" width="141.324" height="141.243" rx="70.6213" stroke="#719AF5" stroke-width="0.644944"/>
            <rect opacity="0.5" x="316.526" y="149.414" width="192.949" height="192.838" rx="96.4191" stroke="#719AF5" stroke-width="0.644944"/>
            <rect opacity="0.5" x="290.713" y="123.617" width="244.574" height="244.434" rx="122.217" stroke="#719AF5" stroke-width="0.644944"/>
            <rect opacity="0.5" x="264.901" y="97.8186" width="296.199" height="296.029" rx="148.015" stroke="#719AF5" stroke-width="0.644944"/>
            <rect opacity="0.5" x="239.088" y="72.0217" width="347.824" height="347.625" rx="173.812" stroke="#719AF5" stroke-width="0.644944"/>
            <rect opacity="0.5" x="213.276" y="46.2229" width="399.449" height="399.22" rx="199.61" stroke="#719AF5" stroke-width="0.644944"/>
          </g>
          <defs>
            <clipPath id="clip0_1339_33567">
              <rect width="826" height="241" fill="white"/>
            </clipPath>
          </defs>
        </svg>

        {/* Small floating SVG icons */}
        <div className="absolute" style={{ top: '100px', left: '265px' }}>
          <XLSFileIcon />
        </div>

        <div className="absolute" style={{ top: '185px', left: '310px' }}>
          <PDFFileIcon />
        </div>
        
        <div className="absolute" style={{ top: '138px', left: '395px' }}>
          <DOCFileIcon />
        </div>
        
        <div className="absolute" style={{ top: '100px', left: '520px' }}>
          <ZIPFileIcon />
        </div>
        
        <div className="absolute" style={{ top: '185px', left: '475px' }}>
          <PNGFileIcon />
        </div>
      </div>

      {/* Title below SVG */}
      <h3 className="text-xl font-semibold text-[#0D001B] mt-4">
        {isKnowledgeBase 
          ? t('interface.knowledgeBasePage.empty.title', 'No files yet')
          : t('interface.smartDrivePage.empty.title', 'Your Smart Drive is empty')
        }
      </h3>

      {/* Description text */}
      <div className="text-center mt-2 mb-4">
        {isKnowledgeBase ? (
          <p className="text-sm" style={{ color: '#353537CC' }}>
            {t('interface.knowledgeBasePage.empty.description', 'Drag and drop files here or click "Create" to add them.')}
          </p>
        ) : (
          <>
            <p className="text-sm" style={{ color: '#353537CC' }}>
              {t('interface.smartDrivePage.empty.noMaterials', "You haven't added any materials yet.")}
            </p>
            <p className="text-sm" style={{ color: '#353537CC' }}>
              {t('interface.smartDrivePage.empty.goToKnowledgeBase', 'Go to your Knowledge Base to upload files and manage your content.')}
            </p>
          </>
        )}
      </div>

      {/* Upload files button */}
      <button
        className="px-4 py-2 rounded-md text-sm font-medium text-white"
        style={{ backgroundColor: '#0F58F9' }}
        onClick={onUploadClick}
      >
        {isKnowledgeBase 
          ? <><Upload strokeWidth={1.5} className="w-4 h-4 mr-2"/> t('interface.knowledgeBasePage.empty.uploadFiles', 'Upload files')</>
          : t('interface.smartDrivePage.empty.connect', 'Connect')
        }
      </button>
    </div>
  );
};

