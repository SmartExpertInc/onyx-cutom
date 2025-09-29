"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, User, Briefcase, Heart, CheckCircle, Building, Users, Target, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  children: React.ReactNode;
}

const RegistrationSurveyModal: React.FC<RegistrationSurveyModalProps> = ({
  onComplete,
  children,
}) => {
  const [surveyStep, setSurveyStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [surveyModalOpen, setSurveyModalOpen] = useState(false);
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
    setSurveyStep(prev => prev + 1);
  };

  const handleBack = () => {
    setSurveyStep(prev => prev - 1);
  };

  // Complete survey
  const completeSurvey = () => {
    console.log('Survey completed:', surveyData);
    onComplete(surveyData);
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
    <Dialog open={surveyModalOpen} onOpenChange={(open) => {
      setSurveyModalOpen(open);
      if (open) resetSurvey();
    }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] p-0 max-h-[90vh] overflow-hidden">
        <div className="bg-white rounded-3xl">
          <DialogHeader className="text-center space-y-6 p-8 pb-6">
            <div className="flex justify-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                {surveyStep === 1 && <Target className="w-10 h-10 text-white" />}
                {surveyStep === 2 && selectedCategory === 'work' && <Building className="w-10 h-10 text-white" />}
                {surveyStep === 3 && selectedCategory === 'work' && <Users className="w-10 h-10 text-white" />}
                {surveyStep === 4 && selectedCategory === 'work' && <Target className="w-10 h-10 text-white" />}
                {surveyStep === 2 && selectedCategory === 'personal' && <Lightbulb className="w-10 h-10 text-white" />}
              </div>
            </div>
            <div className="space-y-2">
              <DialogTitle className="text-3xl font-bold text-gray-900">
                {surveyStep === 1 && "What do you plan to use ContentBuilder for?"}
                {surveyStep === 2 && selectedCategory === 'work' && "Tell us about your work"}
                {surveyStep === 3 && selectedCategory === 'work' && "What is the size of your company?"}
                {surveyStep === 4 && selectedCategory === 'work' && "What's your primary use case?"}
                {surveyStep === 2 && selectedCategory === 'personal' && "What will you mainly use the platform for?"}
              </DialogTitle>
              <DialogDescription className="text-lg text-gray-600">
                {surveyStep === 1 && "This helps us customize your experience"}
                {surveyStep === 2 && selectedCategory === 'work' && "Help us understand your professional context"}
                {surveyStep === 3 && selectedCategory === 'work' && "This helps us recommend the best features for you"}
                {surveyStep === 4 && selectedCategory === 'work' && "This helps us recommend the best features for you"}
                {surveyStep === 2 && selectedCategory === 'personal' && "Let us know your primary focus"}
              </DialogDescription>
            </div>
          </DialogHeader>
        
        <div className="px-8 pb-8">
          {/* Step 1: Main Category Selection */}
          {surveyStep === 1 && (
            <div className="grid md:grid-cols-2 gap-6">
              <button
                onClick={() => setSelectedCategory('work')}
                className={`p-8 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === 'work'
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`w-16 h-16 rounded-xl mb-4 flex items-center justify-center ${
                    selectedCategory === 'work' ? 'bg-blue-500' : 'bg-gray-100'
                  }`}>
                    <Briefcase className={`w-8 h-8 ${selectedCategory === 'work' ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Work</h3>
                  <p className="text-gray-600">Professional use for business, marketing, or team collaboration</p>
                </div>
              </button>
              
              <button
                onClick={() => setSelectedCategory('personal')}
                className={`p-8 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === 'personal'
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`w-16 h-16 rounded-xl mb-4 flex items-center justify-center ${
                    selectedCategory === 'personal' ? 'bg-blue-500' : 'bg-gray-100'
                  }`}>
                    <Heart className={`w-8 h-8 ${selectedCategory === 'personal' ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Personal</h3>
                  <p className="text-gray-600">Personal projects, learning, or creative endeavors</p>
                </div>
              </button>
            </div>
          )}

          {/* Step 2: Work Role */}
          {surveyStep === 2 && selectedCategory === 'work' && (
            <div className="space-y-8">
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-4">
                  What best describes your role? *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { value: 'marketer', label: 'Marketer' },
                    { value: 'hr-ld', label: 'HR / L&D' },
                    { value: 'business-owner', label: 'Business Owner' },
                    { value: 'content-creator', label: 'Content Creator' },
                    { value: 'developer', label: 'Developer' },
                    { value: 'other', label: 'Other' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSurveyData(prev => ({ ...prev, workRole: option.value }))}
                      className={`p-4 text-center rounded-xl border-2 transition-all duration-200 ${
                        surveyData.workRole === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <span className="font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Company Size */}
          {surveyStep === 3 && selectedCategory === 'work' && (
            <div className="space-y-8">
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-4">
                  What is the size of your company? *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { value: '1-10', label: '1–10', icon: 1 },
                    { value: '11-50', label: '11–50', icon: 2 },
                    { value: '51-500', label: '51–500', icon: 3 },
                    { value: '500+', label: '500+', icon: 4 }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSurveyData(prev => ({ ...prev, companySize: option.value }))}
                      className={`p-4 text-center rounded-xl border-2 transition-all duration-200 ${
                        surveyData.companySize === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <Users className="w-6 h-6 mx-auto mb-2" />
                      <span className="font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Industry */}
          {surveyStep === 4 && selectedCategory === 'work' && (
            <div className="space-y-8">
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-4">
                  What's your primary use case?
                </label>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    { value: 'video-production', label: 'Video Production', icon: '🎬' },
                    { value: 'digital-marketing', label: 'Digital Marketing', icon: '📈' },
                    { value: 'learning-development', label: 'Learning & Development', icon: '🎓' },
                    { value: 'internal-communications', label: 'Internal Communications', icon: '💬' },
                    { value: 'creative-branding', label: 'Creative / Branding', icon: '🎨' },
                    { value: 'other', label: 'Other', icon: '⚡' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSurveyData(prev => ({ ...prev, industry: option.value }))}
                      className={`p-6 text-left rounded-xl border-2 transition-all duration-200 transform hover:scale-105 ${
                        surveyData.industry === option.value
                          ? 'border-blue-500 bg-blue-50 shadow-lg'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-12 h-12 rounded-lg mr-4 flex items-center justify-center ${
                          surveyData.industry === option.value ? 'bg-blue-500' : 'bg-gray-100'
                        }`}>
                          <span className={`text-2xl ${surveyData.industry === option.value ? 'text-white' : 'text-gray-600'}`}>
                            {option.icon}
                          </span>
                        </div>
                        <span className="font-semibold text-gray-900">{option.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Personal Use */}
          {surveyStep === 2 && selectedCategory === 'personal' && (
            <div className="space-y-8">
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-4">
                  What will you mainly use the platform for?
                </label>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    { value: 'personal-projects', label: 'Personal projects', icon: '🚀' },
                    { value: 'learning-skills', label: 'Learning new skills', icon: '📚' },
                    { value: 'portfolio-creation', label: 'Portfolio creation', icon: '💼' },
                    { value: 'social-media', label: 'Social media content', icon: '📱' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSurveyData(prev => ({ ...prev, personalUse: option.value }))}
                      className={`p-6 text-left rounded-xl border-2 transition-all duration-200 transform hover:scale-105 ${
                        surveyData.personalUse === option.value
                          ? 'border-blue-500 bg-blue-50 shadow-lg'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-12 h-12 rounded-lg mr-4 flex items-center justify-center ${
                          surveyData.personalUse === option.value ? 'bg-blue-500' : 'bg-gray-100'
                        }`}>
                          <span className={`text-2xl ${surveyData.personalUse === option.value ? 'text-white' : 'text-gray-600'}`}>
                            {option.icon}
                          </span>
                        </div>
                        <span className="font-semibold text-gray-900">{option.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex justify-between items-center px-8 py-6 border-t border-gray-100">
          <button
            onClick={handleBack}
            disabled={surveyStep === 1}
            className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              surveyStep === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 transform hover:scale-105'
            }`}
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Previous
          </button>

          <div className="text-sm text-gray-500 font-medium">
            Step {surveyStep} of {selectedCategory === 'work' ? '4' : '2'}
          </div>

          {surveyStep === 4 && selectedCategory === 'work' ? (
            <button
              onClick={completeSurvey}
              disabled={!surveyData.industry}
              className={`flex items-center px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                surveyData.industry 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Complete Setup
              <CheckCircle className="w-5 h-5 ml-2" />
            </button>
          ) : surveyStep === 2 && selectedCategory === 'personal' ? (
            <button
              onClick={completeSurvey}
              disabled={!surveyData.personalUse}
              className={`flex items-center px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                surveyData.personalUse 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Complete Setup
              <CheckCircle className="w-5 h-5 ml-2" />
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={
                (surveyStep === 1 && !selectedCategory) ||
                (surveyStep === 2 && selectedCategory === 'work' && !surveyData.workRole) ||
                (surveyStep === 2 && selectedCategory === 'personal' && !surveyData.personalUse) ||
                (surveyStep === 3 && !surveyData.companySize) ||
                (surveyStep === 4 && !surveyData.industry)
              }
              className="flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              Continue
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          )}
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegistrationSurveyModal;
