// custom_extensions/frontend/src/app/projects/edit/[id]/page.tsx
"use client";

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
// import Image from 'next/image'; // No longer needed
import {
  TrainingPlanData,
  Section as SectionType,
  Lesson as LessonType,
  StatusInfo,
  ProjectDetailDataForEdit, 
} from '@/types/trainingPlan'; 
import { DesignTemplateResponse } from '@/types/designTemplates'; 
import { PlusCircle, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

const CUSTOM_API_BASE_URL = '/api/custom-projects-backend';
// const CUSTOM_BACKEND_ROOT_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_ROOT_URL || ''; // No longer needed

// Helper Functions (keep as is)
const createEmptyStatusInfo = (): StatusInfo => ({ type: 'unknown', text: '' });
const createEmptyLesson = (idSuffix: string | number = Date.now()): LessonType => ({
  id: `L${idSuffix}_${Math.random().toString(36).substr(2, 5)}`, title: '',
  check: createEmptyStatusInfo(), contentAvailable: createEmptyStatusInfo(), source: '', hours: 0,
  completionTime: '5m', // Default completion time
});
const createEmptySection = (idSuffix: string | number = Date.now()): SectionType => ({
  id: `S_${idSuffix}_${Math.random().toString(36).substr(2, 5)}`, title: '', totalHours: 0,
  lessons: [createEmptyLesson(1)], autoCalculateHours: true,
});
const createEmptyTrainingPlan = (initialProjectName?: string): TrainingPlanData => ({
  mainTitle: initialProjectName || "New Training Plan", sections: [createEmptySection(1)], detectedLanguage: 'en',
});


const EditProjectPageComponent = () => {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : null;

  const [projectName, setProjectName] = useState('');
  const [microProductName, setMicroProductName] = useState(''); 
  const [selectedDesignTemplateId, setSelectedDesignTemplateId] = useState<string>('');
  
  const [trainingPlanData, setTrainingPlanData] = useState<TrainingPlanData | null>(null);
  const [designTemplates, setDesignTemplates] = useState<DesignTemplateResponse[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  
  // imagePath removed from currentDesignInfo state
  const [currentDesignInfo, setCurrentDesignInfo] = useState<{ name: string, component: string } | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoadingTemplates(true);
      try {
        const response = await fetch(`${CUSTOM_API_BASE_URL}/design_templates`);
        if (!response.ok) throw new Error('Failed to fetch design templates');
        const data: DesignTemplateResponse[] = await response.json();
        setDesignTemplates(data);
      } catch (error) {
        console.error("Error fetching design templates:", error);
      } finally {
        setIsLoadingTemplates(false);
      }
    };
    fetchTemplates();
  }, []);

  const loadProjectData = useCallback(async (currentProjectId: string) => {
    // ... (loadProjectData logic remains similar, just don't use/set imagePath from data)
    if (!currentProjectId) return;
    setIsLoading(true);
    setError(null);
    try {
      const headers: HeadersInit = {};
      const devUserId = "dummy-onyx-user-id-for-testing";
      if (devUserId && process.env.NODE_ENV === 'development') {
        headers['X-Dev-Onyx-User-ID'] = devUserId;
      }

      const response = await fetch(`${CUSTOM_API_BASE_URL}/projects/${currentProjectId}/edit`, { headers }); 
      if (!response.ok) {
        const errorDataText = await response.text();
        let errorDetail = `HTTP error! status: ${response.status}`;
        try { const errorJson = JSON.parse(errorDataText); errorDetail = errorJson.detail || errorDetail; } 
        catch(e) { errorDetail = `${errorDetail} - ${errorDataText.substring(0,100)}`; }
        throw new Error(errorDetail);
      }
      const data: ProjectDetailDataForEdit = await response.json();

      setProjectName(data.projectName || '');
      setMicroProductName(data.microProductName || '');
      const designIdStr = data.design_template_id?.toString() || '';
      setSelectedDesignTemplateId(designIdStr);
      
      setCurrentDesignInfo({ 
          name: data.design_template_name || 'N/A', 
          component: data.design_component_name || 'N/A',
          // imagePath: data.design_image_path // Removed
      });

      if (data.microProductContent) {
        const sectionsWithAutoCalc = data.microProductContent.sections.map(section => ({
          ...section,
          autoCalculateHours: section.autoCalculateHours === undefined ? true : section.autoCalculateHours,
        }));
        setTrainingPlanData({...data.microProductContent, sections: sectionsWithAutoCalc});
      } else {
        setTrainingPlanData(createEmptyTrainingPlan(data.projectName));
      }
      setInitialDataLoaded(true);
    } catch (err: any) {
      console.error("Failed to fetch project:", err);
      setError(err.message || "Could not load project data.");
      setTrainingPlanData(createEmptyTrainingPlan('Error Loading Project Name'));
    } finally {
      setIsLoading(false);
    }
  }, []); 

  useEffect(() => {
    if (projectId && !initialDataLoaded && !isLoadingTemplates) { 
        if(designTemplates.length > 0 || !isLoadingTemplates) {
            loadProjectData(projectId);
        }
    }
  }, [projectId, initialDataLoaded, loadProjectData, designTemplates, isLoadingTemplates]);
  
   useEffect(() => { 
    if (selectedDesignTemplateId && designTemplates.length > 0) {
      const template = designTemplates.find(dt => dt.id.toString() === selectedDesignTemplateId);
      if (template) {
        setCurrentDesignInfo({ 
            name: template.template_name, 
            component: template.component_name ?? 'UnknownComponent',
            // imagePath: template.design_image_path // Removed
        });
      }
    } else if (!selectedDesignTemplateId && initialDataLoaded) { 
        //setCurrentDesignInfo(null); // Or clear parts of it
    }
  }, [selectedDesignTemplateId, designTemplates, initialDataLoaded]);

  // ... (handleSubmit and other handlers remain the same) ...
  const handleSave = async () => {
    if (!projectId ) { 
      alert("Project data is missing.");
      return;
    }
     if (!selectedDesignTemplateId) {
        alert("Please select a design template.");
        return;
    }
    setIsSaving(true);
    setError(null);

    const finalMicroProductName = microProductName.trim() || currentDesignInfo?.name || projectName;

    // Clean up tier data before sending to backend
    const cleanTierData = (data: any) => {
      if (!data) return data;
      
      const cleaned = JSON.parse(JSON.stringify(data)); // Deep clone
      
      // Clean module-level tier data
      if (cleaned.sections) {
        cleaned.sections.forEach((section: any) => {
          // Remove empty/invalid custom_rate values
          if (section.custom_rate === '' || section.custom_rate === null || section.custom_rate === undefined) {
            delete section.custom_rate;
          }
          // Remove empty/invalid quality_tier values
          if (section.quality_tier === '' || section.quality_tier === null || section.quality_tier === undefined) {
            delete section.quality_tier;
          }
          
          // Clean lesson-level tier data
          if (section.lessons) {
            section.lessons.forEach((lesson: any) => {
              // Remove empty/invalid custom_rate values
              if (lesson.custom_rate === '' || lesson.custom_rate === null || lesson.custom_rate === undefined) {
                delete lesson.custom_rate;
              }
              // Remove empty/invalid quality_tier values
              if (lesson.quality_tier === '' || lesson.quality_tier === null || lesson.quality_tier === undefined) {
                delete lesson.quality_tier;
              }
            });
          }
        });
      }
      
      // Note: Data cleaning removes empty/null tier values to prevent validation errors
      
      return cleaned;
    };

    const payload = {
      projectName,
      design_template_id: parseInt(selectedDesignTemplateId, 10),
      microProductName: finalMicroProductName,
      microProductContent: cleanTierData(trainingPlanData), 
    };

    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      const devUserId = "dummy-onyx-user-id-for-testing";
      if (devUserId && process.env.NODE_ENV === 'development') {
        headers['X-Dev-Onyx-User-ID'] = devUserId;
      }

      const response = await fetch(`/api/custom-projects-backend/projects/update/${projectId}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorDataText = await response.text();
        let errorDetail = `HTTP error! status: ${response.status}`;
        try { 
          const errorJson = JSON.parse(errorDataText); 
          if (errorJson.detail) {
            // Handle Pydantic validation errors (array of objects) vs regular string errors
            if (Array.isArray(errorJson.detail)) {
              // Format validation errors nicely
              const validationErrors = errorJson.detail.map((err: any) => {
                const location = err.loc ? err.loc.join('.') : 'unknown';
                return `${location}: ${err.msg || 'Validation error'}`;
              }).join('; ');
              errorDetail = `Validation errors: ${validationErrors}`;
            } else {
              errorDetail = errorJson.detail;
            }
          }
        } 
        catch(e) { errorDetail = `${errorDetail} - ${errorDataText.substring(0,100)}`;}
        throw new Error(errorDetail);
      }
      alert("Project updated successfully!");
      router.push('/projects');
    } catch (err: any) {
      console.error("Failed to save project:", err);
      setError(err.message || "Could not save project data.");
      alert(`Error: ${err.message || "Could not save project data."}`);
    } finally {
      setIsSaving(false);
    }
  };
  const handleTrainingPlanDataChange = (field: keyof TrainingPlanData, value: any) => {
    setTrainingPlanData(prev => {
        const basePlan = prev || createEmptyTrainingPlan(projectName);
        return { ...basePlan, [field]: value };
    });
  };
  const handleSectionChange = (sectionIndex: number, field: keyof SectionType, value: any) => {
    if (!trainingPlanData) return;
    const newSections = trainingPlanData.sections.map((s, idx) =>
      idx === sectionIndex ? { ...s, [field]: value } : s
    );
    setTrainingPlanData({ ...trainingPlanData, sections: newSections });
  };
  const handleLessonChange = (sectionIndex: number, lessonIndex: number, field: keyof LessonType, value: any) => {
    if (!trainingPlanData) return;
    const newSections = [...trainingPlanData.sections];
    const currentSection = { ...newSections[sectionIndex] };
    const newLessons = [...currentSection.lessons];
    const updatedLesson = { ...newLessons[lessonIndex], [field]: value };
    newLessons[lessonIndex] = updatedLesson;
    currentSection.lessons = newLessons;

    if (field === 'hours' && currentSection.autoCalculateHours) {
      currentSection.totalHours = newLessons.reduce((sum, lesson) => sum + (Number(lesson.hours) || 0), 0);
    }
    newSections[sectionIndex] = currentSection;
    setTrainingPlanData({ ...trainingPlanData, sections: newSections });
  };
  const handleLessonStatusChange = (sectionIndex: number, lessonIndex: number, field: 'check' | 'contentAvailable', subField: keyof StatusInfo, value: string) => {
      if (!trainingPlanData) return;
      const newSections = [...trainingPlanData.sections];
      const currentSection = { ...newSections[sectionIndex] };
      const newLessons = [...currentSection.lessons];
      const lesson = { ...newLessons[lessonIndex] };
      const updatedStatusInfo = { ...(lesson[field] || createEmptyStatusInfo()), [subField]: value };
      (lesson as any)[field] = updatedStatusInfo;
      newLessons[lessonIndex] = lesson;
      currentSection.lessons = newLessons;
      newSections[sectionIndex] = currentSection;
      setTrainingPlanData({ ...trainingPlanData, sections: newSections });
  };
  const addSection = () => {
    if (!trainingPlanData) return;
    const newSections = [...trainingPlanData.sections, createEmptySection()];
    setTrainingPlanData({ ...trainingPlanData, sections: newSections });
  };
  const removeSection = (sectionIndex: number) => {
    if (!trainingPlanData) return;
    const newSections = trainingPlanData.sections.filter((_, i) => i !== sectionIndex);
    setTrainingPlanData({ ...trainingPlanData, sections: newSections });
  };
  const addLesson = (sectionIndex: number) => {
    if (!trainingPlanData) return;
    const newSections = [...trainingPlanData.sections];
    if (newSections[sectionIndex]) {
        const currentSection = { ...newSections[sectionIndex] };
        currentSection.lessons = [...(currentSection.lessons || []), createEmptyLesson(currentSection.lessons?.length ? currentSection.lessons.length + 1 : 1)];
        newSections[sectionIndex] = currentSection;
        setTrainingPlanData({ ...trainingPlanData, sections: newSections });
    }
  };
  const removeLesson = (sectionIndex: number, lessonIndex: number) => {
    if (!trainingPlanData) return;
    const newSections = [...trainingPlanData.sections];
    if (newSections[sectionIndex]) {
        const currentSection = { ...newSections[sectionIndex] };
        currentSection.lessons = currentSection.lessons.filter((_, i) => i !== lessonIndex);
        if (currentSection.autoCalculateHours) {
          currentSection.totalHours = currentSection.lessons.reduce((sum, lesson) => sum + (Number(lesson.hours) || 0), 0);
        }
        newSections[sectionIndex] = currentSection;
        setTrainingPlanData({ ...trainingPlanData, sections: newSections });
    }
  };
   const moveLesson = (sectionIndex: number, lessonIndex: number, direction: 'up' | 'down') => {
    if (!trainingPlanData) return;
    const newSections = [...trainingPlanData.sections];
    if (!newSections[sectionIndex]) return;
    const currentSection = { ...newSections[sectionIndex] };
    const lessons = [...currentSection.lessons];
    const targetIndex = direction === 'up' ? lessonIndex - 1 : lessonIndex + 1;
    if (targetIndex < 0 || targetIndex >= lessons.length) return;
    const temp = lessons[lessonIndex];
    lessons[lessonIndex] = lessons[targetIndex];
    lessons[targetIndex] = temp;
    currentSection.lessons = lessons;
    newSections[sectionIndex] = currentSection;
    setTrainingPlanData({ ...trainingPlanData, sections: newSections });
  };
  const toggleAutoCalculateHours = (sectionIndex: number) => {
    if (!trainingPlanData) return;
    const newSections = [...trainingPlanData.sections];
    const section = newSections[sectionIndex];
    if (section) {
      const newAutoCalculateState = !section.autoCalculateHours;
      newSections[sectionIndex] = { ...section, autoCalculateHours: newAutoCalculateState };
      if (newAutoCalculateState) {
        newSections[sectionIndex].totalHours = section.lessons.reduce((sum, lesson) => sum + (Number(lesson.hours) || 0), 0);
      }
      setTrainingPlanData({ ...trainingPlanData, sections: newSections });
    }
  };

  if (isLoading && !initialDataLoaded) return <div className="p-8 text-center font-['Inter',_sans-serif]">Loading project details...</div>;
  if (error && (!trainingPlanData && !initialDataLoaded)) return <div className="p-8 text-center text-red-500 font-['Inter',_sans-serif]">Error: {error}</div>;
  if (!projectId) return <div className="p-8 text-center text-red-500 font-['Inter',_sans-serif]">Error: Project ID missing.</div>;
  
  const inputBaseClasses = "block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
  const labelBaseClasses = "block text-sm font-medium text-black mb-1";
  const smallInputClasses = `${inputBaseClasses} text-black`;
  const sectionTitleClasses = "text-lg font-semibold text-black p-2 border border-gray-300 rounded-md w-full";
  const lessonTitleClasses = `${inputBaseClasses} text-black`;
  const switchContainerClasses = "flex items-center space-x-2";
  const switchBaseClasses = "relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500";
  const switchKnobClasses = "inline-block w-4 h-4 transform bg-white rounded-full transition-transform";


  return (
    <main className="p-4 md:p-8 bg-gray-50 min-h-screen font-['Inter',_sans-serif]">
      <div className="max-w-6xl mx-auto bg-white p-6 md:p-8 shadow-lg rounded-lg border border-gray-200">
        <h1 className="text-2xl font-bold mb-6 text-black">Edit Project Instance (ID: {projectId})</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-8 pb-6 border-b border-gray-200">
          <div>
            <label htmlFor="projectName" className={labelBaseClasses}>Project Name:</label>
            <input type="text" id="projectName" value={projectName} onChange={(e) => setProjectName(e.target.value)} className={`${inputBaseClasses} text-black`}/>
          </div>
          
          <div>
            <label htmlFor="designTemplate" className={labelBaseClasses}>Design Template:</label>
            <select 
              id="designTemplate" 
              value={selectedDesignTemplateId} 
              onChange={(e) => setSelectedDesignTemplateId(e.target.value)} 
              className={`${inputBaseClasses} text-black bg-white`}
              disabled={isLoadingTemplates || designTemplates.length === 0}
            >
              <option value="">-- Choose Design Template --</option>
              {isLoadingTemplates ? (
                <option disabled>Loading templates...</option>
              ) : (
                designTemplates.map(template => (
                  <option key={template.id} value={template.id.toString()}>{template.template_name}</option>
                ))
              )}
            </select>
            {currentDesignInfo && (
                 <p className="mt-1 text-xs text-gray-500">
                    Using: {currentDesignInfo.name} (Component: {currentDesignInfo.component})
                 </p>
            )}
            {/* Image display removed */}
          </div>
          
          <div>
            <label htmlFor="microProductName" className={labelBaseClasses}>Instance Name (Optional):</label>
            <input
              type="text" id="microProductName" value={microProductName}
              onChange={(e) => setMicroProductName(e.target.value)}
              className={`${inputBaseClasses} text-black`}
              placeholder="Custom name (e.g., Q1 Onboarding Plan)"
            />
             <p className="mt-1 text-xs text-gray-500">If blank, Design Template name will be used.</p>
          </div>
        </div>

        {trainingPlanData && currentDesignInfo?.component === 'TrainingPlanTable' ? (
          <div className="pt-6">
            {/* ... TrainingPlanTable editor UI ... */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-black">
                  Content Details
                  {trainingPlanData.detectedLanguage && ` (${trainingPlanData.detectedLanguage.toUpperCase()})`}
                </h2>
                <button onClick={addSection} className="flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    <PlusCircle size={16} className="mr-2"/> Add Section
                </button>
            </div>
            <div className="mb-4">
                <label htmlFor="mainTitle" className={labelBaseClasses}>Main Content Title:</label>
                <input
                  type="text" id="mainTitle" value={trainingPlanData.mainTitle || ''}
                  onChange={(e) => handleTrainingPlanDataChange('mainTitle', e.target.value)}
                  placeholder="Main Content Title" className={`${inputBaseClasses} text-black`}
                />
            </div>
            {trainingPlanData.sections.map((section, sectionIdx) => (
              <div key={section.id || `section-${sectionIdx}`} className="mb-6 p-4 border border-gray-300 rounded-lg bg-slate-50 shadow">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex-grow mr-2">
                         <label className="block text-xs font-medium text-black">Section Title (e.g., Module 1: Introduction)</label>
                        <input type="text" value={section.title} onChange={(e) => handleSectionChange(sectionIdx, 'title', e.target.value)} placeholder="Section Title" className={sectionTitleClasses}/>
                    </div>
                  <button onClick={() => removeSection(sectionIdx)} className="p-1.5 text-red-500 hover:text-red-700" title="Remove Section"><Trash2 size={20} /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-xs font-medium text-black">Section ID (e.g., №1, Mod1):</label>
                        <input type="text" value={section.id} onChange={(e) => handleSectionChange(sectionIdx, 'id', e.target.value)} placeholder="Section ID" className={smallInputClasses} />
                    </div>
                    <div className="flex items-end space-x-3">
                        <div className="flex-grow">
                            <label className="block text-xs font-medium text-black">Total Hours {section.autoCalculateHours ? "(auto-calculated)" : "(manual)"}:</label>
                            <input type="number" value={Math.round(section.totalHours)} readOnly={section.autoCalculateHours} onChange={(e) => !section.autoCalculateHours && handleSectionChange(sectionIdx, 'totalHours', parseInt(e.target.value) || 0)} className={`${smallInputClasses} ${section.autoCalculateHours ? 'bg-gray-100' : 'bg-white'}`} />
                        </div>
                        <div className={switchContainerClasses} title="Toggle auto-calculation of total hours">
                            <button type="button" onClick={() => toggleAutoCalculateHours(sectionIdx)} className={`${switchBaseClasses} ${section.autoCalculateHours ? 'bg-green-600' : 'bg-gray-300'}`} aria-pressed={section.autoCalculateHours}>
                                <span className="sr-only">Toggle auto-calculate hours</span>
                                <span className={`${switchKnobClasses} ${section.autoCalculateHours ? 'translate-x-5' : 'translate-x-1'}`} />
                            </button>
                             <span className="text-xs text-gray-600">{section.autoCalculateHours ? "Auto" : "Manual"}</span>
                        </div>
                    </div>
                </div>
                <h4 className="text-md font-semibold text-black mb-2 mt-4">Lessons/Items:</h4>
                {section.lessons.map((lesson, lessonIdx) => (
                  <div key={lesson.id || `lesson-${sectionIdx}-${lessonIdx}`} className="ml-4 mb-4 p-3 border border-gray-200 rounded-md bg-white shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex-grow">
                            <label className="block text-xs font-medium text-black">Item {lessonIdx + 1} Title:</label>
                            <input type="text" value={lesson.title} onChange={(e) => handleLessonChange(sectionIdx, lessonIdx, 'title', e.target.value)} placeholder="Item Title" className={lessonTitleClasses}/>
                        </div>
                        <div className="flex items-center ml-2 flex-shrink-0">
                            <button onClick={() => moveLesson(sectionIdx, lessonIdx, 'up')} disabled={lessonIdx === 0} className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30" title="Move Up"><ArrowUp size={16}/></button>
                            <button onClick={() => moveLesson(sectionIdx, lessonIdx, 'down')} disabled={lessonIdx === section.lessons.length - 1} className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30" title="Move Down"><ArrowDown size={16}/></button>
                            <button onClick={() => removeLesson(sectionIdx, lessonIdx)} className="p-1 text-red-500 hover:text-red-700 ml-1" title="Remove Item"><Trash2 size={16}/></button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                            <label className="block text-xs font-medium text-black">Hours (if applicable):</label>
                            <input type="number" step="1" value={Math.round(lesson.hours)} onChange={(e) => handleLessonChange(sectionIdx, lessonIdx, 'hours', parseInt(e.target.value) || 0)} placeholder="Hours" className={smallInputClasses}/>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-black">Source (if applicable):</label>
                            <input type="text" value={lesson.source} onChange={(e) => handleLessonChange(sectionIdx, lessonIdx, 'source', e.target.value)} placeholder="Source" className={smallInputClasses}/>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-black">Detail/Check Text:</label>
                            <input type="text" value={lesson.check.text} onChange={(e) => handleLessonStatusChange(sectionIdx, lessonIdx, 'check', 'text', e.target.value)} placeholder="Detail/Check Text" className={smallInputClasses}/>
                        </div>
                         <div>
                            <label className="block text-xs font-medium text-black">Availability Text:</label>
                            <input type="text" value={lesson.contentAvailable.text} onChange={(e) => handleLessonStatusChange(sectionIdx, lessonIdx, 'contentAvailable', 'text', e.target.value)} placeholder="Availability Text" className={smallInputClasses}/>
                        </div>
                    </div>
                  </div>
                ))}
                <button onClick={() => addLesson(sectionIdx)} className="mt-2 flex items-center text-sm text-green-600 hover:text-green-800">
                  <PlusCircle size={16} className="mr-1"/> Add Item to this Section
                </button>
              </div>
            ))}
          </div>
        ) : trainingPlanData && currentDesignInfo ? (
             <div className="pt-6 text-center text-gray-600">
                <p>This project uses the design &quot;{currentDesignInfo.name}&quot; which is displayed using the &quot;{currentDesignInfo.component}&quot; component.</p>
                <p>Currently, detailed content editing is primarily supported for &quot;TrainingPlanTable&quot; components via this interface.</p>
                <p>You can still edit the Project Name, Instance Name, and selected Design Template above.</p>
                <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Raw Content Preview (Read-Only):</h3>
                    <textarea 
                        value={JSON.stringify(trainingPlanData, null, 2)} 
                        readOnly 
                        className="w-full h-64 p-2 border border-gray-300 rounded-md font-mono text-xs bg-gray-100"
                    />
                     <p className="mt-1 text-xs text-gray-500">
                        Note: The content structure is defined by the selected design template. Changes to raw content here are not directly supported and might not persist correctly for non-TrainingPlanTable designs.
                    </p>
                </div>
            </div>
        ) : null}

        <div className="flex justify-end gap-3 mt-8">
          <button type="button" onClick={() => router.push('/projects')} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || isLoading || !projectName || !selectedDesignTemplateId}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </main>
  );
};

export default function EditProjectPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-['Inter',_sans-serif]">Loading page...</div>}>
      <EditProjectPageComponent />
    </Suspense>
  );
}
