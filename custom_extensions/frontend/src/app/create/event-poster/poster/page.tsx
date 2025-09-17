"use client";

import React from "react";
import Image from "next/image";

export default function EventPosterPage() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/create/event-poster/background.jpg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top Section */}
        <div className="flex justify-between items-start p-8 pt-12">
          {/* Left Side - Main Title */}
          <div className="flex-1">
            <h1 className="text-6xl font-bold text-white mb-8 leading-tight">
              ВЕЛИКА ОНЛАЙН-КОНФЕРЕНЦІЯ:
            </h1>
          </div>
          
          {/* Right Side - Logo and Date */}
          <div className="text-right">
            <div className="text-white text-2xl font-bold mb-4">
              <div>FUTURE</div>
              <div>BUSINESS</div>
              <div>CLUB</div>
            </div>
            <div className="bg-purple-600 text-white text-4xl font-bold px-6 py-3 rounded-lg">
              08.10.2025
            </div>
          </div>
        </div>
        
        {/* Middle Section */}
        <div className="flex-1 flex items-center px-8 py-12">
          <div className="flex w-full">
            {/* Left Side - Speaker Info and Topic */}
            <div className="flex-1 pr-8">
              {/* Main Speaker Name */}
              <h2 className="text-5xl font-bold text-white mb-6">
                Денис Довгополий
              </h2>
              
              {/* Speaker Description */}
              <p className="text-white text-lg mb-8 leading-relaxed max-w-2xl">
                засновник QNICORN NEST (Luxemburg), першого штучного інтелекту, який вже 8 років шукає фінансування та автоматизує процес спілкування з інвесторами
              </p>
              
              {/* Event Topic */}
              <h3 className="text-4xl font-bold text-white mb-6">
                Тренди та пріоритети ринку VC у 2025-2026 роках
              </h3>
              
              {/* Additional Speakers */}
              <p className="text-white text-lg">
                Та ще 4 зіркових спікерів: Сергій Рабенко, Олександр Борняков, Антон Вайсбурд та Андрій Лазоренко
              </p>
            </div>
            
            {/* Right Side - Speaker Photo */}
            <div className="w-80 h-80 relative">
              <Image
                src="/create/event-poster/person.png"
                alt="Денис Довгополий"
                fill
                className="object-cover rounded-lg"
                priority
              />
            </div>
          </div>
        </div>
        
        {/* Bottom Section - Ticket Information */}
        <div className="px-8 pb-12">
          <div className="flex justify-between items-center">
            {/* Left - Ticket Price */}
            <div className="bg-gray-800 border-2 border-gray-600 text-white text-2xl font-bold px-8 py-4 rounded-lg">
              Квиток STANDART 150€
            </div>
            
            {/* Right - Free Access */}
            <div className="bg-purple-600 text-white text-xl font-bold px-8 py-4 rounded-lg">
              БЕЗКОШТОВНО ДЛЯ ЧЛЕНІВ FUTURE BUSINESS CLUB
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
