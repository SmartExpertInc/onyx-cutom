"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function EventPosterResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract data from URL parameters
  const eventName = searchParams?.get('eventName') || '';
  const mainSpeaker = searchParams?.get('mainSpeaker') || '';
  const speakerDescription = searchParams?.get('speakerDescription') || '';
  const date = searchParams?.get('date') || '';
  const topic = searchParams?.get('topic') || '';
  const additionalSpeakers = searchParams?.get('additionalSpeakers') || '';
  const ticketPrice = searchParams?.get('ticketPrice') || '';
  const ticketType = searchParams?.get('ticketType') || '';
  const freeAccessConditions = searchParams?.get('freeAccessConditions') || '';

  const handleBackToQuestionnaire = () => {
    router.push('/create/event-poster/questionnaire');
  };

  const handleBackToProjects = () => {
    router.push('/projects');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-sans relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-6xl flex flex-col bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 px-8 py-12 flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
            </div>
            
            <div className="relative z-10">
              <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24" className="text-white">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" fill="currentColor"/>
                  </svg>
                </div>
                Event Poster Results
              </h1>
              <p className="text-green-100 text-lg">
                Your event poster data has been generated successfully
              </p>
            </div>
          </div>
          
          {/* Results Content */}
          <div className="p-8 lg:p-12 flex flex-col justify-center bg-white/90 backdrop-blur-sm">
            <div className="space-y-8">
              {/* Event Information Section */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-blue-200 pb-2">
                  Event Information
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Назва події (Event Name)</label>
                    <h1 className="text-3xl font-bold text-gray-900 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                      {eventName}
                    </h1>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Дата (Date)</label>
                    <h1 className="text-3xl font-bold text-gray-900 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                      {date}
                    </h1>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Тема/Заголовок (Topic/Title)</label>
                    <h1 className="text-3xl font-bold text-gray-900 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                      {topic}
                    </h1>
                  </div>
                </div>
              </div>
              
              {/* Speaker Information Section */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-green-200 pb-2">
                  Speaker Information
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Головний спікер (Main Speaker)</label>
                    <h1 className="text-3xl font-bold text-gray-900 bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                      {mainSpeaker}
                    </h1>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Опис спікера (Speaker Description)</label>
                    <h1 className="text-3xl font-bold text-gray-900 bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                      {speakerDescription}
                    </h1>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Додаткові спікери (Additional Speakers)</label>
                    <h1 className="text-3xl font-bold text-gray-900 bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                      {additionalSpeakers}
                    </h1>
                  </div>
                </div>
              </div>
              
              {/* Ticket Information Section */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-purple-200 pb-2">
                  Ticket Information
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Ціна квитка (Ticket Price)</label>
                    <h1 className="text-3xl font-bold text-gray-900 bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                      {ticketPrice}
                    </h1>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Тип квитка (Ticket Type)</label>
                    <h1 className="text-3xl font-bold text-gray-900 bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                      {ticketType}
                    </h1>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Умови безкоштовного доступу (Free Access Conditions)</label>
                    <h1 className="text-3xl font-bold text-gray-900 bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                      {freeAccessConditions}
                    </h1>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleBackToQuestionnaire}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              >
                <div className="flex items-center justify-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                  </svg>
                  Edit Questionnaire
                </div>
              </button>
              
              <button
                onClick={handleBackToProjects}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              >
                <div className="flex items-center justify-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                  </svg>
                  Back to Projects
                </div>
              </button>
            </div>
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

export default function EventPosterResults() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event poster results...</p>
        </div>
      </div>
    }>
      <EventPosterResultsContent />
    </Suspense>
  );
}
