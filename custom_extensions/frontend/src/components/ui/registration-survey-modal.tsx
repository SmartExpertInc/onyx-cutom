"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, User, Briefcase, Heart, CheckCircle, Building, Users, Target, Lightbulb, BookCopy, BriefcaseBusiness, TabletSmartphone, Clapperboard, ChartNoAxesCombined, GraduationCap, MessageSquareText, Palette, Zap } from "lucide-react";
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
      <DialogContent className="sm:max-w-[700px] rounded-xl p-0 max-h-[85vh] overflow-y-auto" hideCloseIcon preventCloseOnOverlayClick>
        <div className="bg-white rounded-3xl">
          <DialogHeader className="space-y-4 p-6 pb-4">
            <div className="flex items-center space-x-4">
              <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg flex-shrink-0 transition-all duration-300 ease-in-out ${
                isTransitioning ? 'opacity-0 transform scale-90' : 'opacity-100 transform scale-100'
              }`}>
                {surveyStep === 1 && <Target className="w-8 h-8 text-white" />}
                {surveyStep === 2 && selectedCategory === 'work' && <Building className="w-8 h-8 text-white" />}
                {surveyStep === 3 && selectedCategory === 'work' && <Users className="w-8 h-8 text-white" />}
                {surveyStep === 4 && selectedCategory === 'work' && <Target className="w-8 h-8 text-white" />}
                {surveyStep === 2 && selectedCategory === 'personal' && <Lightbulb className="w-8 h-8 text-white" />}
              </div>
              <div className={`space-y-2 transition-all duration-300 ease-in-out ${
                isTransitioning ? 'opacity-0 transform translate-y-2' : 'opacity-100 transform translate-y-0'
              }`}>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  {surveyStep === 1 && t('survey.step1.title', "What do you plan to use ContentBuilder for?")}
                  {surveyStep === 2 && selectedCategory === 'work' && t('survey.step2Work.title', "What best describes your role")}
                  {surveyStep === 3 && selectedCategory === 'work' && t('survey.step3.title', "What is the size of your company?")}
                  {surveyStep === 4 && selectedCategory === 'work' && t('survey.step4.title', "What's your primary use case?")}
                  {surveyStep === 2 && selectedCategory === 'personal' && t('survey.step2Personal.title', "What will you mainly use the platform for?")}
                </DialogTitle>
                <DialogDescription className="text-base text-gray-600">
                  {t('survey.description', "This helps us recommend the best features for you")}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        
        <div className="px-6 pb-6">
          <div className={`transition-all duration-300 ease-in-out ${
            isTransitioning ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'
          }`}>
            {/* Step 1: Main Category Selection */}
            {surveyStep === 1 && (
            <div className="grid md:grid-cols-2 gap-4">
              <div
                onClick={() => setSelectedCategory('work')}
                className={`p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 cursor-pointer ${
                  selectedCategory === 'work'
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`w-12 h-12 rounded-lg mb-3 flex items-center justify-center ${
                    selectedCategory === 'work' ? 'bg-blue-500' : 'bg-gray-100'
                  }`}>
                    <Briefcase className={`w-6 h-6 ${selectedCategory === 'work' ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{t('survey.category.work', 'Work')}</h3>
                  <p className="text-sm text-gray-600">{t('survey.category.workDescription', 'Professional use for business, marketing, or team collaboration')}</p>
                </div>
              </div>
              
              <div
                onClick={() => setSelectedCategory('personal')}
                className={`p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 cursor-pointer ${
                  selectedCategory === 'personal'
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`w-12 h-12 rounded-lg mb-3 flex items-center justify-center ${
                    selectedCategory === 'personal' ? 'bg-blue-500' : 'bg-gray-100'
                  }`}>
                    <Heart className={`w-6 h-6 ${selectedCategory === 'personal' ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{t('survey.category.personal', 'Personal')}</h3>
                  <p className="text-sm text-gray-600">{t('survey.category.personalDescription', 'Personal projects, learning, or creative endeavors')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Work Role */}
          {surveyStep === 2 && selectedCategory === 'work' && (
            <div className="space-y-6">
              <div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { value: 'marketer', label: t('survey.role.marketer', 'Marketer') },
                    { value: 'hr-ld', label: t('survey.role.hrLd', 'HR / L&D') },
                    { value: 'business-owner', label: t('survey.role.businessOwner', 'Business Owner') },
                    { value: 'content-creator', label: t('survey.role.contentCreator', 'Content Creator') },
                    { value: 'developer', label: t('survey.role.developer', 'Developer') },
                    { value: 'other', label: t('survey.role.other', 'Other') }
                  ].map((option) => (
                    <div
                      key={option.value}
                      onClick={() => setSurveyData(prev => ({ ...prev, workRole: option.value }))}
                      className={`p-3 text-center rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                        surveyData.workRole === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <span className="font-medium">{option.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Company Size */}
          {surveyStep === 3 && selectedCategory === 'work' && (
            <div className="space-y-6">
              <div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: '1-10', label: '1–10', icon: 1 },
                    { value: '11-50', label: '11–50', icon: 2 },
                    { value: '51-500', label: '51–500', icon: 3 },
                    { value: '500+', label: '500+', icon: 4 }
                  ].map((option) => (
                    <div
                      key={option.value}
                      onClick={() => setSurveyData(prev => ({ ...prev, companySize: option.value }))}
                      className={`p-3 text-center rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                        surveyData.companySize === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <Users className="w-5 h-5 mx-auto mb-1" />
                      <span className="font-medium">{option.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Industry */}
          {surveyStep === 4 && selectedCategory === 'work' && (
            <div className="space-y-6">
              <div>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { value: 'video-production', label: t('survey.industry.videoProduction', 'Video Production'), icon: <Clapperboard width={20} /> },
                    { value: 'digital-marketing', label: t('survey.industry.digitalMarketing', 'Digital Marketing'), icon: <ChartNoAxesCombined width={20} /> },
                    { value: 'learning-development', label: t('survey.industry.learningDevelopment', 'Learning & Development'), icon: <GraduationCap width={20} /> },
                    { value: 'internal-communications', label: t('survey.industry.internalCommunications', 'Internal Communications'), icon: <MessageSquareText width={20} /> },
                    { value: 'creative-branding', label: t('survey.industry.creativeBranding', 'Creative / Branding'), icon: <Palette width={20} /> },
                    { value: 'other', label: t('survey.industry.other', 'Other'), icon: <Zap width={20} /> }
                  ].map((option) => (
                    <div
                      key={option.value}
                      onClick={() => setSurveyData(prev => ({ ...prev, industry: option.value }))}
                      className={`p-4 text-left rounded-lg border-2 transition-all duration-200 transform hover:scale-105 cursor-pointer ${
                        surveyData.industry === option.value
                          ? 'border-blue-500 bg-blue-50 shadow-lg'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-lg mr-3 flex items-center justify-center ${
                          surveyData.industry === option.value ? 'bg-blue-500' : 'bg-gray-100'
                        }`}>
                          <span className={`text-lg ${surveyData.industry === option.value ? 'text-white' : 'text-gray-600'}`}>
                            {option.icon}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">{option.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Personal Use */}
          {surveyStep === 2 && selectedCategory === 'personal' && (
            <div className="space-y-6">
              <div>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { value: 'personal-projects', label: t('survey.personalUse.personalProjects', 'Personal projects'), icon: <User width={20} /> },
                    { value: 'learning-skills', label: t('survey.personalUse.learningSkills', 'Learning new skills'), icon: <BookCopy width={20} /> },
                    { value: 'portfolio-creation', label: t('survey.personalUse.portfolioCreation', 'Portfolio creation'), icon: <BriefcaseBusiness width={20} /> },
                    { value: 'social-media', label: t('survey.personalUse.socialMedia', 'Social media content'), icon: <TabletSmartphone width={20} /> }
                  ].map((option) => (
                    <div
                      key={option.value}
                      onClick={() => setSurveyData(prev => ({ ...prev, personalUse: option.value }))}
                      className={`p-4 text-left rounded-lg border-2 transition-all duration-200 transform hover:scale-105 cursor-pointer ${
                        surveyData.personalUse === option.value
                          ? 'border-blue-500 bg-blue-50 shadow-lg'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-lg mr-3 flex items-center justify-center ${
                          surveyData.personalUse === option.value ? 'bg-blue-500' : 'bg-gray-100'
                        }`}>
                          <span className={`text-lg ${surveyData.personalUse === option.value ? 'text-white' : 'text-gray-600'}`}>
                            {option.icon}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">{option.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={surveyStep === 1}
            className={`flex items-center px-4 py-2 rounded-full font-medium transition-all duration-200 ${
              surveyStep === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 transform hover:scale-105'
            }`}
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            {t('survey.navigation.previous', 'Previous')}
          </Button>

          <div className="text-xs text-gray-500 font-medium">
            {t('survey.navigation.step', 'Step')} {surveyStep} {t('survey.navigation.of', 'of')} {selectedCategory === 'work' ? '4' : '2'}
          </div>

          {surveyStep === 4 && selectedCategory === 'work' ? (
            <Button
              onClick={completeSurvey}
              disabled={!surveyData.industry}
              className={`flex items-center px-6 py-3 rounded-full font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                surveyData.industry 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {t('survey.navigation.completeSetup', 'Complete Setup')}
              <CheckCircle className="w-5 h-5 ml-2" />
            </Button>
          ) : surveyStep === 2 && selectedCategory === 'personal' ? (
            <Button
              onClick={completeSurvey}
              disabled={!surveyData.personalUse}
              className={`flex items-center px-6 py-3 rounded-full font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                surveyData.personalUse 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {t('survey.navigation.completeSetup', 'Complete Setup')}
              <CheckCircle className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={
                (surveyStep === 1 && !selectedCategory) ||
                (surveyStep === 2 && selectedCategory === 'work' && !surveyData.workRole) ||
                (surveyStep === 2 && selectedCategory === 'personal' && !surveyData.personalUse) ||
                (surveyStep === 3 && !surveyData.companySize) ||
                (surveyStep === 4 && !surveyData.industry)
              }
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-medium hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              {t('survey.navigation.continue', 'Continue')}
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          )}
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegistrationSurveyModal;
