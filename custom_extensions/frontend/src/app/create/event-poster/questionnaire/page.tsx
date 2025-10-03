"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from '../../../../contexts/LanguageContext';
import { Home as HomeIcon, Image as ImageIcon, Scissors } from "lucide-react";
import PresentationImageUpload from '../../../../components/PresentationImageUpload';
import ImageEditModal from '../../../../components/ImageEditModal';

export default function EventPosterQuestionnaire() {
  const router = useRouter();
  const { t } = useLanguage();
  
  // Pre-populated data as specified
  const [eventName, setEventName] = useState("Велика онлайн-конференція");
  const [mainSpeaker, setMainSpeaker] = useState("Денис Довгополий");
  const [speakerDescription, setSpeakerDescription] = useState("засновник QNICORN NEST (Luxemburg), першого штучного інтелекту, який вже 8 років шукає фінансування та автоматизує процес спілкування з інвесторами");
  const [date, setDate] = useState("08.10.2025");
  const [topic, setTopic] = useState("Тренди та пріоритети ринку VC у 2025-2026 роках");
  const [additionalSpeakers, setAdditionalSpeakers] = useState("Та ще 4 зіркових спікерів: Сергій Рабенко, Олександр Борняков, Антон Вайсбурд та Андрій Лазоренко");
  const [ticketPrice, setTicketPrice] = useState("150€");
  const [ticketType, setTicketType] = useState("STANDART");
  const [freeAccessConditions, setFreeAccessConditions] = useState("безкоштовно для членів business club");
  const [speakerImage, setSpeakerImage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Upload + crop state (reuse same flow as poster editor)
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showImageEditModal, setShowImageEditModal] = useState(false);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);

  // Open upload modal
  const openUpload = () => {
    setShowUploadModal(true);
  };

  // When image is uploaded in modal
  const handlePosterImageUploaded = (imagePath: string, imageFile?: File) => {
    if (imageFile) {
      setPendingImageFile(imageFile);
      setShowImageEditModal(true);
    } else if (imagePath) {
      setSpeakerImage(imagePath);
    }
    setFormError(null);
    setShowUploadModal(false);
  };

  const handleConfirmCrop = (croppedImagePath: string) => {
    setSpeakerImage(croppedImagePath);
    setShowImageEditModal(false);
    setPendingImageFile(null);
    setFormError(null);
  };

  const handleDoNotCrop = (originalImagePath: string) => {
    setSpeakerImage(originalImagePath);
    setShowImageEditModal(false);
    setPendingImageFile(null);
    setFormError(null);
  };

  const handleCancelEdit = () => {
    setShowImageEditModal(false);
    setPendingImageFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Enforce required image
    if (!speakerImage) {
      setFormError(t('interface.eventPosterForm.imageRequired', 'Please upload and crop a speaker image before continuing.'));
      // Scroll to image section
      const el = document.getElementById('speaker-image-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    
    // Prepare all data for the poster
    const eventData = {
      eventName,
      mainSpeaker,
      speakerDescription,
      date,
      topic,
      additionalSpeakers,
      ticketPrice,
      ticketType,
      freeAccessConditions,
      speakerImageSrc: speakerImage || null
    };

    try {
      console.log('🔄 [EVENT_POSTER_QUESTIONNAIRE] Auto-saving poster as product', eventData);

      // Automatically save as product (same as "Save as Product" button)
      const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || "/api/custom-projects-backend";
      
      const response = await fetch(`${CUSTOM_BACKEND_URL}/event-poster/save-as-product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error(`Failed to save poster: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ [EVENT_POSTER_QUESTIONNAIRE] Poster saved as product:', result);
      
      // Redirect to the saved poster's results page
      router.push(`/create/event-poster/results/${result.id}`);
      
    } catch (error) {
      console.error('❌ [EVENT_POSTER_QUESTIONNAIRE] Error saving poster:', error);
      alert('Failed to save poster. Please try again.');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-sans relative overflow-hidden">
      {/* Top-left home button */}
      <button
        type="button"
        onClick={() => router.push('/projects')}
        className="absolute top-6 left-6 z-50 flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-white/80 rounded-full px-4 py-2 border border-gray-200 bg-white/60 backdrop-blur-sm transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <HomeIcon className="w-4 h-4" />
        {t('interface.home', 'Home')}
      </button>

      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-4xl flex flex-col bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-8 py-12 flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
            </div>
            
            <div className="relative z-10">
              <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24" className="text-white">
                    <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" fill="currentColor"/>
                  </svg>
                </div>
                {t('interface.eventPosterForm.title', 'Event Poster Questionnaire')}
              </h1>
              <p className="text-blue-100 text-lg">
                {t('interface.eventPosterForm.subtitle', 'Fill out the form below to create your event poster template')}
              </p>
            </div>
          </div>
          
          {/* Form */}
          <div className="p-8 lg:p-12 flex flex-col justify-center bg-white/90 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Event Information Section */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  {t('interface.eventPosterForm.eventInformation', 'Event Information')}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                                         <label className="block font-semibold mb-2 text-gray-700">{t('interface.eventPosterForm.eventName', 'Event Name')}</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white hover:border-blue-300 focus:border-blue-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-800 placeholder-gray-400"
                        value={eventName}
                        onChange={e => setEventName(e.target.value)}
                        placeholder={t('interface.eventPosterForm.eventNamePlaceholder', 'Enter event name')}
                      />
                  </div>
                  
                  <div>
                                         <label className="block font-semibold mb-2 text-gray-700">{t('interface.eventPosterForm.date', 'Date')}</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white hover:border-blue-300 focus:border-blue-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-800 placeholder-gray-400"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        placeholder={t('interface.eventPosterForm.datePlaceholder', 'Enter date')}
                      />
                  </div>
                </div>
                
                <div>
                  <label className="block font-semibold mb-2 text-gray-700">{t('interface.eventPosterForm.topic', 'Topic/Title')}</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white hover:border-blue-300 focus:border-blue-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-800 placeholder-gray-400"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    placeholder={t('interface.eventPosterForm.topicPlaceholder', 'Enter topic/title')}
                  />
                </div>
              </div>
              
              {/* Speaker Information Section */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  {t('interface.eventPosterForm.speakerInformation', 'Speaker Information')}
                </h3>
                
                <div>
                  <label className="block font-semibold mb-2 text-gray-700">{t('interface.eventPosterForm.mainSpeaker', 'Main Speaker')}</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white hover:border-blue-300 focus:border-blue-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-800 placeholder-gray-400"
                    value={mainSpeaker}
                    onChange={e => setMainSpeaker(e.target.value)}
                    placeholder={t('interface.eventPosterForm.mainSpeakerPlaceholder', 'Enter main speaker name')}
                  />
                </div>
                
                <div>
                  <label className="block font-semibold mb-2 text-gray-700">{t('interface.eventPosterForm.speakerDescription', 'Speaker Description')}</label>
                  <textarea
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white hover:border-blue-300 focus:border-blue-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-800 placeholder-gray-400 resize-none"
                    value={speakerDescription}
                    onChange={e => setSpeakerDescription(e.target.value)}
                    placeholder={t('interface.eventPosterForm.speakerDescriptionPlaceholder', 'Enter speaker description')}
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block font-semibold mb-2 text-gray-700">{t('interface.eventPosterForm.additionalSpeakers', 'Additional Speakers')}</label>
                  <textarea
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white hover:border-blue-300 focus:border-blue-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-800 placeholder-gray-400 resize-none"
                    value={additionalSpeakers}
                    onChange={e => setAdditionalSpeakers(e.target.value)}
                    placeholder={t('interface.eventPosterForm.additionalSpeakersPlaceholder', 'Enter additional speakers')}
                    rows={2}
                  />
                </div>
              </div>
              
              {/* Ticket Information Section */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  {t('interface.eventPosterForm.ticketInformation', 'Ticket Information')}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-semibold mb-2 text-gray-700">{t('interface.eventPosterForm.ticketPrice', 'Ticket Price')}</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white hover:border-blue-300 focus:border-blue-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-800 placeholder-gray-400"
                      value={ticketPrice}
                      onChange={e => setTicketPrice(e.target.value)}
                      placeholder={t('interface.eventPosterForm.ticketPricePlaceholder', 'Enter ticket price')}
                    />
                  </div>
                  
                  <div>
                    <label className="block font-semibold mb-2 text-gray-700">{t('interface.eventPosterForm.ticketType', 'Ticket Type')}</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white hover:border-blue-300 focus:border-blue-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-800 placeholder-gray-400"
                      value={ticketType}
                      onChange={e => setTicketType(e.target.value)}
                      placeholder={t('interface.eventPosterForm.ticketTypePlaceholder', 'Enter ticket type')}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block font-semibold mb-2 text-gray-700">{t('interface.eventPosterForm.freeAccessConditions', 'Free Access Conditions')}</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white hover:border-blue-300 focus:border-blue-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-800 placeholder-gray-400"
                    value={freeAccessConditions}
                    onChange={e => setFreeAccessConditions(e.target.value)}
                    placeholder={t('interface.eventPosterForm.freeAccessConditionsPlaceholder', 'Enter free access conditions')}
                  />
                </div>

                <div id="speaker-image-section">
                  <label className="block font-semibold mb-2 text-gray-700">{t('interface.eventPosterForm.speakerPhoto', 'Speaker Photo')}</label>
                  {/* Portrait preview + action */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div
                      className="relative border-2 border-dashed rounded-xl bg-gray-50 overflow-hidden"
                      style={{ width: '259.5px', height: '356.5px' }}
                    >
                      {speakerImage ? (
                        <img src={speakerImage} alt="Speaker preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                          <ImageIcon className="w-10 h-10 mb-2" />
                          <span className="text-sm">{t('interface.eventPosterForm.portraitImageRequired', 'Portrait image required')}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={openUpload}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow"
                      >
                        <ImageIcon className="w-4 h-4" />
                        {speakerImage ? t('interface.eventPosterForm.changeImage', 'Change Image') : t('interface.eventPosterForm.uploadImage', 'Upload Image')}
                      </button>
                      {speakerImage && (
                        <button
                          type="button"
                          onClick={() => setShowImageEditModal(true)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow"
                        >
                          <Scissors className="w-4 h-4" />
                          {t('interface.eventPosterForm.recropImage', 'Re-crop')}
                        </button>
                      )}
                    </div>
                  </div>

                  {formError && (
                    <p className="mt-2 text-sm text-red-600">{formError}</p>
                  )}
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-center gap-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {t('interface.eventPosterForm.generateEventPoster', 'Generate Event Poster')}
                  </div>
                </button>
              </div>
            </form>
            {/* Upload and crop modals */}
            <PresentationImageUpload
              isOpen={showUploadModal}
              onClose={() => setShowUploadModal(false)}
              onImageUploaded={handlePosterImageUploaded}
              title={t('interface.modals.aiImageGeneration.uploadImage', 'Upload Image')}
            />
            <ImageEditModal
              isOpen={showImageEditModal}
              onClose={handleCancelEdit}
              imageFile={pendingImageFile}
              // Use the same portrait dimensions as poster image area: 519x713
              placeholderDimensions={{ width: 519, height: 713 }}
              onConfirmCrop={handleConfirmCrop}
              onDoNotCrop={handleDoNotCrop}
              onCancel={handleCancelEdit}
            />
          </div>
        </div>
      </div>
      
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </main>
  );
}
