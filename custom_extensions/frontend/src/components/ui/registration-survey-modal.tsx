"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, User, Briefcase, Heart, CheckCircle, Building, Users, Target, Lightbulb, BookCopy, BriefcaseBusiness, TabletSmartphone, Clapperboard, ChartNoAxesCombined, GraduationCap, MessageSquareText, Palette, Zap, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";

interface SurveyData {
  category: string;
  workRole: string;
  companySize: string;
  industry: string;
  personalUse: string;
  additionalInfo: string;
}

interface RegistrationSurveyModalProps {
  onComplete: (surveyData: SurveyData) => void;
  children?: React.ReactNode;
}

const USFlag: React.FC<{ className?: string }> = ({
  className = "w-5 h-4",
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 36 36"
    className={className}
  >
    <path
      fill="#B22334"
      d="M35.445 7C34.752 5.809 33.477 5 32 5H18v2h17.445zM0 25h36v2H0zm18-8h18v2H18zm0-4h18v2H18zM0 21h36v2H0zm4 10h28c1.477 0 2.752-.809 3.445-2H.555c.693 1.191 1.968 2 3.445 2zM18 9h18v2H18z"
    />
    <path
      fill="#EEE"
      d="M.068 27.679c.017.093.036.186.059.277c.026.101.058.198.092.296c.089.259.197.509.333.743L.555 29h34.89l.002-.004a4.22 4.22 0 0 0 .332-.741a3.75 3.75 0 0 0 .152-.576c.041-.22.069-.446.069-.679H0c0 .233.028.458.068.679zM0 23h36v2H0zm0-4v2h36v-2H18zm18-4h18v2H18zm0-4h18v2H18zM0 9zm.555-2l-.003.005L.555 7zM.128 8.044c.025-.102.06-.199.092-.297a3.78 3.78 0 0 0-.092.297zM18 9h18c0-.233-.028-.459-.069-.68a3.606 3.606 0 0 0-.153-.576A4.21 4.21 0 0 0 35.445 7H18v2z"
    />
    <path fill="#3C3B6E" d="M18 5H4a4 4 0 0 0-4 4v10h18V5z" />
    <path
      fill="#FFF"
      d="m2.001 7.726l.618.449l-.236.725L3 8.452l.618.448l-.236-.725L4 7.726h-.764L3 7l-.235.726zm2 2l.618.449l-.236.725l.617-.448l.618.448l-.236-.725L6 9.726h-.764L5 9l-.235.726zm4 0l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L9 9l-.235.726zm4 0l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L13 9l-.235.726zm-8 4l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L5 13l-.235.726zm4 0l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L9 13l-.235.726zm4 0l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L13 13l-.235.726zm-6-6l.618.449l-.236.725L7 8.452l.618.448l-.236-.725L8 7.726h-.764L7 7l-.235.726zm4 0l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L11 7l-.235.726zm4 0l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L15 7l-.235.726zm-12 4l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L3 11l-.235.726zM6.383 12.9L7 12.452l.618.448l-.236-.725l.618-.449h-.764L7 11l-.235.726h-.764l.618.449zm3.618-1.174l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L11 11l-.235.726zm4 0l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L15 11l-.235.726zm-12 4l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L3 15l-.235.726zM6.383 16.9L7 16.452l.618.448l-.236-.725l.618-.449h-.764L7 15l-.235.726h-.764l.618.449zm3.618-1.174l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L11 15l-.235.726zm4 0l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L15 15l-.235.726z"
    />
  </svg>
);

const UkraineFlag: React.FC<{ className?: string }> = ({
  className = "w-5 h-4",
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 36 36"
    className={className}
  >
    <path fill="#005BBB" d="M32 5H4a4 4 0 0 0-4 4v9h36V9a4 4 0 0 0-4-4z" />
    <path fill="#FFD500" d="M36 27a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4v-9h36v9z" />
  </svg>
);

const SpainFlag: React.FC<{ className?: string }> = ({
  className = "w-5 h-4",
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 36 36"
    className={className}
  >
    <path
      fill="#C60A1D"
      d="M36 27a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V9a4 4 0 0 1 4-4h28a4 4 0 0 1 4 4v18z"
    />
    <path fill="#FFC400" d="M0 12h36v12H0z" />
    <path fill="#EA596E" d="M9 17v3a3 3 0 1 0 6 0v-3H9z" />
    <path fill="#F4A2B2" d="M12 16h3v3h-3z" />
    <path fill="#DD2E44" d="M9 16h3v3H9z" />
    <ellipse cx="12" cy="14.5" fill="#EA596E" rx="3" ry="1.5" />
    <ellipse cx="12" cy="13.75" fill="#FFAC33" rx="3" ry=".75" />
    <path fill="#99AAB5" d="M7 16h1v7H7zm9 0h1v7h-1z" />
    <path fill="#66757F" d="M6 22h3v1H6zm9 0h3v1h-3zm-8-7h1v1H7zm9 0h1v1h-1z" />
  </svg>
);

const RussiaFlag: React.FC<{ className?: string }> = ({
  className = "w-5 h-4",
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 36 36"
    className={className}
  >
    <path fill="#CE2028" d="M36 27a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4v-4h36v4z" />
    <path fill="#22408C" d="M0 13h36v10H0z" />
    <path fill="#EEE" d="M32 5H4a4 4 0 0 0-4 4v4h36V9a4 4 0 0 0-4-4z" />
  </svg>
);

const PersonalIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg className={className} viewBox="0 0 15 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.8866 11.7423L9.84952 10.4211C10.111 9.67575 10.052 8.84327 9.67315 8.13678L11.344 6.64409C12.2619 7.2167 13.4851 7.10494 14.2829 6.307C15.2117 5.37826 15.2117 3.87235 14.2829 2.94357C13.3541 2.01479 11.8481 2.01479 10.9194 2.94357C10.1878 3.67523 10.0329 4.76459 10.4537 5.64832L8.78271 7.14124C7.98282 6.58766 6.96245 6.49089 6.08558 6.85206L4.15864 4.20036C4.84987 3.29285 4.78169 1.99171 3.95258 1.16251C3.0484 0.258329 1.58241 0.258329 0.678174 1.16251C-0.226058 2.06674 -0.226058 3.53278 0.678174 4.43697C1.32743 5.08623 2.26606 5.26917 3.07856 4.98626L5.00573 7.6382C4.05407 8.75444 4.10479 10.4324 5.15998 11.4876C5.18025 11.5079 5.20109 11.5268 5.22198 11.5464L3.3549 14.8234C2.57889 14.6399 1.72871 14.8502 1.12351 15.4555C0.194727 16.3843 0.194727 17.8903 1.12351 18.819C2.05229 19.7478 3.55825 19.7478 4.48698 18.819C5.40606 17.9 5.41515 16.4162 4.5152 15.4852L6.38214 12.2086C7.31967 12.4778 8.36792 12.2552 9.12138 11.541L11.1604 12.8632C11.0302 13.4677 11.1994 14.1239 11.6693 14.5937C12.4053 15.3297 13.5983 15.3297 14.3342 14.5937C15.0702 13.8579 15.0702 12.6647 14.3342 11.9288C13.667 11.2618 12.6239 11.1995 11.8866 11.7423ZM1.92925 16.6091C1.88401 16.6603 1.84142 16.7088 1.79965 16.7505C1.7476 16.8025 1.67647 16.8659 1.58821 16.8931C1.47735 16.9274 1.36407 16.8972 1.27724 16.8104C1.05019 16.5834 1.13702 16.1539 1.47925 15.8118C1.82158 15.4694 2.25093 15.3826 2.47807 15.6097C2.56486 15.6964 2.59497 15.8098 2.56072 15.9207C2.5335 16.0089 2.47013 16.0803 2.41812 16.1321C2.37635 16.1738 2.32791 16.2164 2.27658 16.2616C2.21734 16.3138 2.15597 16.3677 2.09554 16.428C2.03516 16.4884 1.98135 16.5498 1.92925 16.6091ZM11.2752 3.2996C11.6174 2.95737 12.0468 2.87044 12.2739 3.09754C12.3606 3.18427 12.3908 3.2976 12.3565 3.40856C12.3293 3.49686 12.2659 3.56814 12.2139 3.62009C12.1723 3.66172 12.1238 3.7043 12.0724 3.7495C12.0132 3.8017 11.9519 3.85556 11.8914 3.91593C11.8309 3.97641 11.7771 4.03783 11.7249 4.09711C11.6798 4.14831 11.6371 4.19689 11.5955 4.23857C11.5435 4.29057 11.4722 4.35394 11.3839 4.38121C11.273 4.41542 11.1597 4.3853 11.073 4.29847C10.8461 4.07137 10.9329 3.64179 11.2752 3.2996ZM1.46265 2.28542C1.4185 2.33537 1.37706 2.38257 1.33666 2.42316C1.28609 2.47373 1.21672 2.53535 1.13069 2.56204C1.02274 2.59525 0.912451 2.56599 0.827904 2.48158C0.606853 2.26048 0.691543 1.84232 1.02478 1.50917C1.35798 1.17593 1.77596 1.09134 1.9971 1.31243C2.0816 1.39693 2.11105 1.50727 2.0776 1.61518C2.05091 1.70115 1.98939 1.77052 1.93877 1.821C1.89814 1.86163 1.85094 1.90317 1.80098 1.94699C1.74327 1.99771 1.68351 2.05023 1.62475 2.10904C1.5659 2.1679 1.51332 2.22775 1.46265 2.28542ZM5.5851 7.89522C5.99394 7.48633 6.50674 7.38261 6.77804 7.65385C6.88176 7.75762 6.91778 7.89289 6.87691 8.02544C6.84417 8.13097 6.76857 8.21599 6.70643 8.27818C6.65662 8.32799 6.59867 8.37867 6.53738 8.43272C6.46668 8.49509 6.39341 8.55937 6.32119 8.63155C6.24896 8.70382 6.18464 8.77704 6.1224 8.84789C6.06835 8.90912 6.01749 8.96707 5.96773 9.01679C5.90559 9.07912 5.82057 9.15458 5.71504 9.18722C5.58258 9.22809 5.44726 9.19216 5.3434 9.0884C5.0723 8.81691 5.17626 8.30411 5.5851 7.89522ZM12.2053 12.9549C12.164 12.9961 12.1075 13.0464 12.0377 13.0679C11.9498 13.095 11.8602 13.0712 11.7913 13.0024C11.6113 12.8225 11.6801 12.4822 11.9514 12.211C12.2225 11.9398 12.5627 11.871 12.7427 12.0511C12.8114 12.1197 12.8353 12.2095 12.8082 12.2975C12.7866 12.3675 12.7364 12.4238 12.6952 12.465C12.6622 12.4979 12.6238 12.5317 12.5832 12.5675C12.5363 12.6087 12.4876 12.6516 12.4398 12.6994C12.3919 12.7472 12.3491 12.7958 12.308 12.8429C12.272 12.8836 12.2383 12.9219 12.2053 12.9549Z" fill="#0F58F9"/>
  </svg>
);

const WorklIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg className={className} viewBox="0 0 60 51" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M31.217 35.6365H28.783C28.596 35.6365 28.4176 35.5632 28.2845 35.4313L25.4448 32.5916C25.3128 32.4596 25.2395 32.28 25.2395 32.0943V26.8181C25.2395 26.4296 25.5535 26.1155 25.9421 26.1155H34.0579C34.4465 26.1155 34.7605 26.4296 34.7605 26.8181V32.0943C34.7605 32.28 34.6872 32.4596 34.5552 32.5916L31.7143 35.4313C31.5824 35.5632 31.404 35.6365 31.217 35.6365ZM55.6488 41.4271H4.35117C1.95259 41.4271 0 39.4757 0 37.0772V18.4652L23.7732 28.8733V32.0943C23.7732 32.6698 24.0017 33.2209 24.4086 33.6277L27.2483 36.4674C27.6552 36.8743 28.2075 37.1028 28.783 37.1028H31.217C31.7925 37.1028 32.3448 36.8743 32.7517 36.4674L35.5914 33.6277C35.9983 33.2209 36.2268 32.6686 36.2268 32.0943V28.8526L60 18.183V37.0772C59.9988 39.4757 58.0474 41.4271 55.6488 41.4271ZM23.7732 27.3386L0 16.9305V14.2265C0 11.8279 1.95259 9.8753 4.35117 9.8753H26.272V24.6493H25.9421C24.7446 24.6493 23.7732 25.6207 23.7732 26.8181V27.3386ZM33.728 24.6493V9.8753H55.6488C58.0474 9.8753 60 11.8279 60 14.2265V16.6422L36.2268 27.3118V26.8181C36.2268 25.6207 35.2554 24.6493 34.0579 24.6493H33.728ZM27.6784 9.8753H32.3216V24.6493H27.6784V9.8753ZM54.9132 50.182H5.08675C3.26613 50.182 1.78397 48.6998 1.78397 46.8792V42.8934H58.216V46.8792C58.216 48.6998 56.7339 50.182 54.9132 50.182ZM43.7463 47.2409H16.2537C15.8651 47.2409 15.5499 46.9269 15.5499 46.5383C15.5499 46.1497 15.8651 45.8345 16.2537 45.8345H43.7463C44.1349 45.8345 44.4489 46.1497 44.4489 46.5383C44.4489 46.9269 44.1349 47.2409 43.7463 47.2409ZM34.7739 8.40902V6.30859C34.5711 6.24993 34.2656 6.19617 34.0848 6.19617H25.914C25.7344 6.19617 25.4289 6.24993 25.2261 6.30859V8.40902H18.5997V5.9298C18.5997 2.72965 22.3192 0.817383 25.914 0.817383H34.0848C37.6808 0.817383 41.4003 2.72965 41.4003 5.9298V8.40902H34.7739Z" fill="#0F58F9"/>
  </svg>
);

const RegistrationSurveyModal: React.FC<RegistrationSurveyModalProps> = ({
  onComplete,
  children,
}) => {
  const { t } = useLanguage();
  const [surveyStep, setSurveyStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [surveyModalOpen, setSurveyModalOpen] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [surveyData, setSurveyData] = useState<SurveyData>({
    category: '',
    workRole: '',
    companySize: '',
    industry: '',
    personalUse: '',
    additionalInfo: ''
  });

  // Navigation functions
  const handleNext = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSurveyStep(prev => prev + 1);
      setIsTransitioning(false);
    }, 150);
  };

  const handleBack = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSurveyStep(prev => prev - 1);
      setIsTransitioning(false);
    }, 150);
  };

  // Complete survey
  const completeSurvey = () => {
    const finalSurveyData = {
      ...surveyData,
      category: selectedCategory
    };
    onComplete(finalSurveyData);
    setSurveyModalOpen(false);
  };

  // Reset survey when modal opens
  const resetSurvey = () => {
    setSurveyStep(1);
    setSelectedCategory('');
    setSurveyModalOpen(true);
    setSurveyData({
      category: '',
      workRole: '',
      companySize: '',
      industry: '',
      personalUse: '',
      additionalInfo: ''
    });
  };

  return (
    <Dialog open={surveyModalOpen} onOpenChange={(open: boolean) => {
      setSurveyModalOpen(open);
      if (open) resetSurvey();
    }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[90vw] rounded-3xl p-0 max-h-[90vh] overflow-y-auto border-0 shadow-2xl bg-transparent [&>div]:bg-transparent" hideCloseIcon preventCloseOnOverlayClick>
        {/* Custom Background with Provided Images */}
        <div className="fixed inset-0 z-0">
          {/* First background image - gradient with curved shape */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('/bgGradientBlue.png')`
            }}
          />
          
          {/* Second background image - vertical gradient with black shape */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
            style={{
              backgroundImage: `url('/bgGradientPink.png')`
            }}
          />
        </div>
        
        {/* Custom overlay for better background visibility */}
        <div className="fixed inset-0 bg-black/20 z-5"></div>
        
        <div className="relative z-10 bg-white rounded-3xl shadow-2xl backdrop-blur-sm">
          {/* Header with Logo and Progress */}
          <div className="p-8 pb-6">
            {/* ContentBuilder Logo */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 flex items-center justify-center">
                  <svg width="15" height="19" viewBox="0 0 15 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.8866 11.7423L9.84952 10.4211C10.111 9.67575 10.052 8.84327 9.67315 8.13678L11.344 6.64409C12.2619 7.2167 13.4851 7.10494 14.2829 6.307C15.2117 5.37826 15.2117 3.87235 14.2829 2.94357C13.3541 2.01479 11.8481 2.01479 10.9194 2.94357C10.1878 3.67523 10.0329 4.76459 10.4537 5.64832L8.78271 7.14124C7.98282 6.58766 6.96245 6.49089 6.08558 6.85206L4.15864 4.20036C4.84987 3.29285 4.78169 1.99171 3.95258 1.16251C3.0484 0.258329 1.58241 0.258329 0.678174 1.16251C-0.226058 2.06674 -0.226058 3.53278 0.678174 4.43697C1.32743 5.08623 2.26606 5.26917 3.07856 4.98626L5.00573 7.6382C4.05407 8.75444 4.10479 10.4324 5.15998 11.4876C5.18025 11.5079 5.20109 11.5268 5.22198 11.5464L3.3549 14.8234C2.57889 14.6399 1.72871 14.8502 1.12351 15.4555C0.194727 16.3843 0.194727 17.8903 1.12351 18.819C2.05229 19.7478 3.55825 19.7478 4.48698 18.819C5.40606 17.9 5.41515 16.4162 4.5152 15.4852L6.38214 12.2086C7.31967 12.4778 8.36792 12.2552 9.12138 11.541L11.1604 12.8632C11.0302 13.4677 11.1994 14.1239 11.6693 14.5937C12.4053 15.3297 13.5983 15.3297 14.3342 14.5937C15.0702 13.8579 15.0702 12.6647 14.3342 11.9288C13.667 11.2618 12.6239 11.1995 11.8866 11.7423ZM1.92925 16.6091C1.88401 16.6603 1.84142 16.7088 1.79965 16.7505C1.7476 16.8025 1.67647 16.8659 1.58821 16.8931C1.47735 16.9274 1.36407 16.8972 1.27724 16.8104C1.05019 16.5834 1.13702 16.1539 1.47925 15.8118C1.82158 15.4694 2.25093 15.3826 2.47807 15.6097C2.56486 15.6964 2.59497 15.8098 2.56072 15.9207C2.5335 16.0089 2.47013 16.0803 2.41812 16.1321C2.37635 16.1738 2.32791 16.2164 2.27658 16.2616C2.21734 16.3138 2.15597 16.3677 2.09554 16.428C2.03516 16.4884 1.98135 16.5498 1.92925 16.6091ZM11.2752 3.2996C11.6174 2.95737 12.0468 2.87044 12.2739 3.09754C12.3606 3.18427 12.3908 3.2976 12.3565 3.40856C12.3293 3.49686 12.2659 3.56814 12.2139 3.62009C12.1723 3.66172 12.1238 3.7043 12.0724 3.7495C12.0132 3.8017 11.9519 3.85556 11.8914 3.91593C11.8309 3.97641 11.7771 4.03783 11.7249 4.09711C11.6798 4.14831 11.6371 4.19689 11.5955 4.23857C11.5435 4.29057 11.4722 4.35394 11.3839 4.38121C11.273 4.41542 11.1597 4.3853 11.073 4.29847C10.8461 4.07137 10.9329 3.64179 11.2752 3.2996ZM1.46265 2.28542C1.4185 2.33537 1.37706 2.38257 1.33666 2.42316C1.28609 2.47373 1.21672 2.53535 1.13069 2.56204C1.02274 2.59525 0.912451 2.56599 0.827904 2.48158C0.606853 2.26048 0.691543 1.84232 1.02478 1.50917C1.35798 1.17593 1.77596 1.09134 1.9971 1.31243C2.0816 1.39693 2.11105 1.50727 2.0776 1.61518C2.05091 1.70115 1.98939 1.77052 1.93877 1.821C1.89814 1.86163 1.85094 1.90317 1.80098 1.94699C1.74327 1.99771 1.68351 2.05023 1.62475 2.10904C1.5659 2.1679 1.51332 2.22775 1.46265 2.28542ZM5.5851 7.89522C5.99394 7.48633 6.50674 7.38261 6.77804 7.65385C6.88176 7.75762 6.91778 7.89289 6.87691 8.02544C6.84417 8.13097 6.76857 8.21599 6.70643 8.27818C6.65662 8.32799 6.59867 8.37867 6.53738 8.43272C6.46668 8.49509 6.39341 8.55937 6.32119 8.63155C6.24896 8.70382 6.18464 8.77704 6.1224 8.84789C6.06835 8.90912 6.01749 8.96707 5.96773 9.01679C5.90559 9.07912 5.82057 9.15458 5.71504 9.18722C5.58258 9.22809 5.44726 9.19216 5.3434 9.0884C5.0723 8.81691 5.17626 8.30411 5.5851 7.89522ZM12.2053 12.9549C12.164 12.9961 12.1075 13.0464 12.0377 13.0679C11.9498 13.095 11.8602 13.0712 11.7913 13.0024C11.6113 12.8225 11.6801 12.4822 11.9514 12.211C12.2225 11.9398 12.5627 11.871 12.7427 12.0511C12.8114 12.1197 12.8353 12.2095 12.8082 12.2975C12.7866 12.3675 12.7364 12.4238 12.6952 12.465C12.6622 12.4979 12.6238 12.5317 12.5832 12.5675C12.5363 12.6087 12.4876 12.6516 12.4398 12.6994C12.3919 12.7472 12.3491 12.7958 12.308 12.8429C12.272 12.8836 12.2383 12.9219 12.2053 12.9549Z" fill="#0F58F9"/>
                  </svg>
                </div>
                <span className="text-base font-medium text-blue-600">ContentBuilder</span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-white rounded-full h-2 mb-6">
              <div 
                className="bg-blue-500 h-2 transition-all duration-300"
                style={{ width: `${(surveyStep / (selectedCategory === 'work' ? 4 : 2)) * 100}%` }}
              ></div>
            </div>
            
            {/* Language Selection */}
            <div className="mb-8">
              <h3 className="text-sm font-regular text-[var(--secondary-foreground)] mb-3 text-center">Select your preferred language</h3>
              <div className="relative">
                <select  className="w-full p-2 border border-[var(--border-light)] rounded-lg bg-white text-[#434343] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option className="flex" value="en"><USFlag /> English</option>
                  <option className="flex" value="es"><SpainFlag /> Español</option>
                  <option className="flex" value="uk"><UkraineFlag /> Ukraine</option>
                  <option className="flex" value="ru"><RussiaFlag /> Russian</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
            
            {/* Main Question */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-[#434343] mb-3 sora-font-bold">
                  {surveyStep === 1 && t('survey.step1.title', "What do you plan to use ContentBuilder for?")}
                  {surveyStep === 2 && selectedCategory === 'work' && t('survey.step2Work.title', "What best describes your role")}
                  {surveyStep === 3 && selectedCategory === 'work' && t('survey.step3.title', "What is the size of your company?")}
                  {surveyStep === 4 && selectedCategory === 'work' && t('survey.step4.title', "What's your primary use case?")}
                  {surveyStep === 2 && selectedCategory === 'personal' && t('survey.step2Personal.title', "What will you mainly use the platform for?")}
              </h2>
              <p className="text-[var(--secondary-foreground)] sora-font">
                  {t('survey.description', "This helps us recommend the best features for you")}
              </p>
            </div>
          </div>
        
          {/* Main Content */}
          <div className="px-8 pb-8">
          <div className={`transition-all duration-300 ease-in-out ${
            isTransitioning ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'
          }`}>
            {/* Step 1: Main Category Selection */}
            {surveyStep === 1 && (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Personal Card */}
                  <div
                    onClick={() => setSelectedCategory('personal')}
                    className={`relative p-8 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 cursor-pointer ${
                      selectedCategory === 'personal'
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-[var(--border-light)] bg-white hover:border-blue-300 hover:shadow-md'
                }`}
              >
                    {/* Selection indicator */}
                    <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedCategory === 'personal'
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-[var(--border-light)]'
                    }`}>
                      {selectedCategory === 'personal' && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                    
                <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 mb-4 flex items-center justify-center">
                        <PersonalIcon className={'w-10 h-10'} />
                  </div>
                      <h3 className="text-2xl font-bold text-[var(--secondary-foreground)] mb-3 sora-font-bold">{t('survey.category.personal', 'Personal')}</h3>
                      <p className="text-[#71717A] text-xs leading-relaxed sora-font">{t('survey.category.personalDescription', 'Personal projects, learning, or creative endeavors')}</p>
                </div>
              </div>
              
                  {/* Work Card */}
                  <div
                    onClick={() => setSelectedCategory('work')}
                    className={`relative p-8 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 cursor-pointer ${
                      selectedCategory === 'work'
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-[var(--border-light)] bg-white hover:border-blue-300 hover:shadow-md'
                }`}
              >
                    {/* Selection indicator */}
                    <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedCategory === 'work'
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-[var(--border-light)]'
                    }`}>
                      {selectedCategory === 'work' && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                    
                <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 mb-4 flex items-center justify-center">
                        <WorklIcon className={'w-10 h-10'} />
                      </div>
                      <h3 className="text-2xl font-bold text-[var(--secondary-foreground)] mb-3 sora-font-bold">{t('survey.category.work', 'Work')}</h3>
                      <p className="text-[#71717A] text-xs leading-relaxed sora-font">{t('survey.category.workDescription', 'Professional use for business, marketing, or team collaboration')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Work Role */}
          {surveyStep === 2 && selectedCategory === 'work' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { value: 'marketer', label: t('survey.role.marketer', 'Marketer'), icon: <Target className="w-6 h-6" /> },
                  { value: 'hr-ld', label: t('survey.role.hrLd', 'HR / L&D'), icon: <Users className="w-6 h-6" /> },
                  { value: 'business-owner', label: t('survey.role.businessOwner', 'Business Owner'), icon: <Building className="w-6 h-6" /> },
                  { value: 'content-creator', label: t('survey.role.contentCreator', 'Content Creator'), icon: <TabletSmartphone className="w-6 h-6" /> },
                  { value: 'developer', label: t('survey.role.developer', 'Developer'), icon: <Lightbulb className="w-6 h-6" /> },
                  { value: 'other', label: t('survey.role.other', 'Other'), icon: <User className="w-6 h-6" /> }
                ].map((option) => (
                  <div
                    key={option.value}
                    onClick={() => setSurveyData(prev => ({ ...prev, workRole: option.value }))}
                    className={`p-6 text-center rounded-xl border-2 transition-all duration-200 cursor-pointer hover:scale-105 ${
                      surveyData.workRole === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg'
                        : 'border-[var(--border-light)] bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-xl mb-3 flex items-center justify-center ${
                        surveyData.workRole === option.value ? 'bg-blue-500' : 'bg-gray-100'
                      }`}>
                        <span className={`text-blue-600 ${surveyData.workRole === option.value ? 'text-white' : 'text-blue-600'}`}>
                          {option.icon}
                        </span>
                      </div>
                      <span className="font-semibold text-[var(--secondary-foreground)]">{option.label}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Other role input field - appears when "Other" is selected */}
              {surveyData.workRole === 'other' && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-[var(--secondary-foreground)] mb-2 sora-font-medium">
                    Describe your role
                  </label>
                  <input
                    type="text"
                    placeholder="Describe your role"
                    value={surveyData.additionalInfo}
                    onChange={(e) => setSurveyData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                    className="w-full p-3 border border-[var(--border-light)] rounded-lg bg-white text-[#434343] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sora-font"
                  />
                </div>
              )}
            </div>
          )}

              {/* Step 3: Company Size */}
              {surveyStep === 3 && selectedCategory === 'work' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { value: '1-10', label: '1–10', icon: 1 },
                      { value: '11-50', label: '11–50', icon: 2 },
                      { value: '51-500', label: '51–500', icon: 3 },
                      { value: '500+', label: '500+', icon: 4 }
                    ].map((option) => (
                      <div
                        key={option.value}
                        onClick={() => setSurveyData(prev => ({ ...prev, companySize: option.value }))}
                        className={`p-6 text-center rounded-xl border-2 transition-all duration-200 cursor-pointer hover:scale-105 ${
                          surveyData.companySize === option.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        <Users className="w-8 h-8 mx-auto mb-3" />
                        <span className="font-semibold text-lg">{option.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Industry */}
              {surveyStep === 4 && selectedCategory === 'work' && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { value: 'video-production', label: t('survey.industry.videoProduction', 'Video Production'), icon: <Clapperboard width={24} /> },
                      { value: 'digital-marketing', label: t('survey.industry.digitalMarketing', 'Digital Marketing'), icon: <ChartNoAxesCombined width={24} /> },
                      { value: 'learning-development', label: t('survey.industry.learningDevelopment', 'Learning & Development'), icon: <GraduationCap width={24} /> },
                      { value: 'internal-communications', label: t('survey.industry.internalCommunications', 'Internal Communications'), icon: <MessageSquareText width={24} /> },
                      { value: 'creative-branding', label: t('survey.industry.creativeBranding', 'Creative / Branding'), icon: <Palette width={24} /> },
                      { value: 'other', label: t('survey.industry.other', 'Other'), icon: <Zap width={24} /> }
                    ].map((option) => (
                      <div
                        key={option.value}
                        onClick={() => setSurveyData(prev => ({ ...prev, industry: option.value }))}
                        className={`p-6 text-left rounded-xl border-2 transition-all duration-200 transform hover:scale-105 cursor-pointer ${
                          surveyData.industry === option.value
                            ? 'border-blue-500 bg-blue-50 shadow-lg'
                            : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`w-12 h-12 rounded-xl mr-4 flex items-center justify-center ${
                            surveyData.industry === option.value ? 'bg-blue-500' : 'bg-gray-100'
                          }`}>
                            <span className={`text-xl ${surveyData.industry === option.value ? 'text-white' : 'text-gray-600'}`}>
                              {option.icon}
                            </span>
                          </div>
                          <span className="font-semibold text-lg text-gray-900">{option.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Personal Use */}
              {surveyStep === 2 && selectedCategory === 'personal' && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { value: 'personal-projects', label: t('survey.personalUse.personalProjects', 'Personal projects'), icon: <User width={24} /> },
                      { value: 'learning-skills', label: t('survey.personalUse.learningSkills', 'Learning new skills'), icon: <BookCopy width={24} /> },
                      { value: 'portfolio-creation', label: t('survey.personalUse.portfolioCreation', 'Portfolio creation'), icon: <BriefcaseBusiness width={24} /> },
                      { value: 'social-media', label: t('survey.personalUse.socialMedia', 'Social media content'), icon: <TabletSmartphone width={24} /> }
                    ].map((option) => (
                      <div
                        key={option.value}
                        onClick={() => setSurveyData(prev => ({ ...prev, personalUse: option.value }))}
                        className={`p-6 text-left rounded-xl border-2 transition-all duration-200 transform hover:scale-105 cursor-pointer ${
                          surveyData.personalUse === option.value
                            ? 'border-blue-500 bg-blue-50 shadow-lg'
                            : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`w-12 h-12 rounded-xl mr-4 flex items-center justify-center ${
                            surveyData.personalUse === option.value ? 'bg-blue-500' : 'bg-gray-100'
                          }`}>
                            <span className={`text-xl ${surveyData.personalUse === option.value ? 'text-white' : 'text-gray-600'}`}>
                              {option.icon}
                            </span>
                          </div>
                          <span className="font-semibold text-lg text-gray-900">{option.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        
        {/* Navigation Buttons */}
            <div className="flex justify-end items-center px-8 py-6">
          {surveyStep === 4 && selectedCategory === 'work' ? (
            <Button
              onClick={completeSurvey}
              disabled={!surveyData.industry}
                  className={`flex items-center px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                surveyData.industry 
                      ? 'hover:bg-blue-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {t('survey.navigation.completeSetup', 'Complete Setup')}
                  <CheckCircle className="w-6 h-6 ml-3" />
            </Button>
          ) : surveyStep === 2 && selectedCategory === 'personal' ? (
            <Button
              onClick={completeSurvey}
              disabled={!surveyData.personalUse}
                  className={`flex items-center px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                surveyData.personalUse 
                      ? 'hover:bg-blue-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {t('survey.navigation.completeSetup', 'Complete Setup')}
                  <CheckCircle className="w-6 h-6 ml-3" />
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={
                (surveyStep === 1 && !selectedCategory) ||
                (surveyStep === 2 && selectedCategory === 'work' && (!surveyData.workRole || (surveyData.workRole === 'other' && !surveyData.additionalInfo.trim()))) ||
                (surveyStep === 2 && selectedCategory === 'personal' && !surveyData.personalUse) ||
                (surveyStep === 3 && !surveyData.companySize) ||
                (surveyStep === 4 && !surveyData.industry)
              }
                  className="flex items-center px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              {t('survey.navigation.continue', 'Continue')}
                  <ChevronRight className="w-6 h-6 ml-3" />
            </Button>
          )}
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegistrationSurveyModal;
