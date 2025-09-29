"use client";

import React, { useState } from "react";
import { UserCog } from "lucide-react";
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <UserCog size={46} className="text-blue-600" />
            <div>
              <DialogTitle>
                {surveyStep === 1 && "What do you plan to use the ContentBuilder for?"}
                {surveyStep === 2 && selectedCategory === 'work' && "What best describes your role?"}
                {surveyStep === 3 && selectedCategory === 'work' && "What is the size of your company?"}
                {surveyStep === 4 && selectedCategory === 'work' && "What industry are you in?"}
                {surveyStep === 2 && selectedCategory === 'personal' && "What will you mainly use the platform for?"}
              </DialogTitle>
              <DialogDescription>
                Help us understand your needs and provide you with the best ContentBuilder experience.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* Step 1: Main Category Selection */}
          {surveyStep === 1 && (
            <div className="space-y-4">
              <RadioGroup value={selectedCategory} onValueChange={setSelectedCategory}>
                <div className="flex items-center space-x-2">
                            <RadioGroupItem value="work" id="work" className="border-gray-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 [&[data-state=checked]]:before:opacity-0" />
                  <Label htmlFor="work" className="text-sm font-medium">Work</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="personal" id="personal" className="border-gray-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 [&[data-state=checked]]:before:opacity-0" />
                  <Label htmlFor="personal" className="text-sm font-medium">Personal</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Step 2: Work Role */}
          {surveyStep === 2 && selectedCategory === 'work' && (
            <div className="space-y-4">
              <RadioGroup value={surveyData.workRole} onValueChange={(value) => setSurveyData(prev => ({ ...prev, workRole: value }))}>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="marketer" id="marketer" className="border-gray-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 [&[data-state=checked]]:before:opacity-0" />
                    <Label htmlFor="marketer" className="text-sm">Marketer</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hr-ld" id="hr-ld" className="border-gray-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 [&[data-state=checked]]:before:opacity-0" />
                    <Label htmlFor="hr-ld" className="text-sm">HR / L&D</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="business-owner" id="business-owner" className="border-gray-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 [&[data-state=checked]]:before:opacity-0" />
                    <Label htmlFor="business-owner" className="text-sm">Business Owner</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="content-creator" id="content-creator" className="border-gray-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 [&[data-state=checked]]:before:opacity-0" />
                    <Label htmlFor="content-creator" className="text-sm">Content Creator</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="developer" id="developer" className="border-gray-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 [&[data-state=checked]]:before:opacity-0" />
                    <Label htmlFor="developer" className="text-sm">Developer</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="work-other" className="border-gray-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 [&[data-state=checked]]:before:opacity-0" />
                    <Label htmlFor="work-other" className="text-sm">Other</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Step 3: Company Size */}
          {surveyStep === 3 && selectedCategory === 'work' && (
            <div className="space-y-4">
              <RadioGroup value={surveyData.companySize} onValueChange={(value) => setSurveyData(prev => ({ ...prev, companySize: value }))}>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1-10" id="size-1-10" className="border-gray-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 [&[data-state=checked]]:before:opacity-0" />
                    <Label htmlFor="size-1-10" className="text-sm">1–10</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="11-50" id="size-11-50" className="border-gray-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 [&[data-state=checked]]:before:opacity-0" />
                    <Label htmlFor="size-11-50" className="text-sm">11–50</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="51-500" id="size-51-500" className="border-gray-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 [&[data-state=checked]]:before:opacity-0" />
                    <Label htmlFor="size-51-500" className="text-sm">51–500</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="500+" id="size-500-plus" className="border-gray-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 [&[data-state=checked]]:before:opacity-0" />
                    <Label htmlFor="size-500-plus" className="text-sm">500+</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Step 4: Industry */}
          {surveyStep === 4 && selectedCategory === 'work' && (
            <div className="space-y-4">
              <RadioGroup value={surveyData.industry} onValueChange={(value) => setSurveyData(prev => ({ ...prev, industry: value }))}>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="video-production" id="video-production" className="border-gray-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 [&[data-state=checked]]:before:opacity-0" />
                    <Label htmlFor="video-production" className="text-sm">Video Production</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="digital-marketing" id="digital-marketing" className="border-gray-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 [&[data-state=checked]]:before:opacity-0" />
                    <Label htmlFor="digital-marketing" className="text-sm">Digital Marketing</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="learning-development" id="learning-development" className="border-gray-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 [&[data-state=checked]]:before:opacity-0" />
                    <Label htmlFor="learning-development" className="text-sm">Learning & Development</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="internal-communications" id="internal-communications" className="border-gray-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 [&[data-state=checked]]:before:opacity-0" />
                    <Label htmlFor="internal-communications" className="text-sm">Internal Communications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="creative-branding" id="creative-branding" className="border-gray-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 [&[data-state=checked]]:before:opacity-0" />
                    <Label htmlFor="creative-branding" className="text-sm">Creative / Branding</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="work-industry-other" className="border-gray-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 [&[data-state=checked]]:before:opacity-0" />
                    <Label htmlFor="work-industry-other" className="text-sm">Other</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Step 2: Personal Use */}
          {surveyStep === 2 && selectedCategory === 'personal' && (
            <div className="space-y-4">
              <RadioGroup value={surveyData.personalUse} onValueChange={(value) => setSurveyData(prev => ({ ...prev, personalUse: value }))}>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="personal-projects" id="personal-projects" className="border-gray-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 [&[data-state=checked]]:before:opacity-0" />
                    <Label htmlFor="personal-projects" className="text-sm">Personal projects</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="learning-skills" id="learning-skills" className="border-gray-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 [&[data-state=checked]]:before:opacity-0" />
                    <Label htmlFor="learning-skills" className="text-sm">Learning new skills</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="portfolio-creation" id="portfolio-creation" className="border-gray-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 [&[data-state=checked]]:before:opacity-0" />
                    <Label htmlFor="portfolio-creation" className="text-sm">Portfolio creation</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="social-media" id="social-media" className="border-gray-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 [&[data-state=checked]]:before:opacity-0" />
                    <Label htmlFor="social-media" className="text-sm">Social media content</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-between">
          {surveyStep > 1 && (
            <Button variant="outline" onClick={handleBack} className="rounded-full">
              Back
            </Button>
          )}
          <div className="flex-1" />
          {surveyStep === 4 && selectedCategory === 'work' ? (
            <Button 
              onClick={completeSurvey}
              disabled={!surveyData.industry}
              className={`rounded-full ${surveyData.industry ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
            >
              Complete Registration
            </Button>
          ) : surveyStep === 2 && selectedCategory === 'personal' ? (
            <Button 
              onClick={completeSurvey}
              disabled={!surveyData.personalUse}
              className={`rounded-full ${surveyData.personalUse ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
            >
              Complete Registration
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
              className="rounded-full"
              disabled={
                (surveyStep === 1 && !selectedCategory) ||
                (surveyStep === 2 && selectedCategory === 'work' && !surveyData.workRole) ||
                (surveyStep === 2 && selectedCategory === 'personal' && !surveyData.personalUse) ||
                (surveyStep === 3 && !surveyData.companySize) ||
                (surveyStep === 4 && !surveyData.industry)
              }
            >
              Next
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RegistrationSurveyModal;
