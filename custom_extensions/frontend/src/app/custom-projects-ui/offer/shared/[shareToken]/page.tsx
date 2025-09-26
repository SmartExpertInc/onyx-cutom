"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '../../../../../contexts/LanguageContext';
import { CheckCircle, Clock, User, Calendar, Building, FileText, Printer } from 'lucide-react';

interface OfferDetail {
  id: number;
  offer_name: string;
  company_name: string;
  manager: string;
  created_on: string;
  status: string;
  total_hours: number;
}

interface CourseModule {
  title: string;
  modules: number;
  lessons: number;
  learningDuration: string;
  productionTime: string;
}

interface QualityLevel {
  level: string;
  learningDuration: string;
  productionTime: string;
}

export default function SharedOfferDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const [offer, setOffer] = useState<OfferDetail | null>(null);
  const [courseModules, setCourseModules] = useState<CourseModule[]>([]);
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

  useEffect(() => {
    const fetchSharedOfferDetails = async () => {
      try {
        setLoading(true);
        
        // Check if params and shareToken exist
        if (!params?.shareToken) {
          setError('Share token is required');
          setLoading(false);
          return;
        }
        
        // Fetch shared offer details - no authentication required
        const offerResponse = await fetch(`${CUSTOM_BACKEND_URL}/offers/shared/${params.shareToken}/details`);

        if (!offerResponse.ok) {
          if (offerResponse.status === 404) {
            setError('This shared offer was not found or the link has expired.');
          } else {
            setError('Failed to load shared offer details');
          }
          setLoading(false);
          return;
        }

        const offerData = await offerResponse.json();
        
        setOffer(offerData.offer);
        setCourseModules(offerData.courseModules);
        setQualityLevels(offerData.qualityLevels);
      } catch (error) {
        console.error('Error fetching shared offer details:', error);
        setError('Failed to load shared offer details');
      } finally {
        setLoading(false);
      }
    };

    if (params?.shareToken) {
      fetchSharedOfferDetails();
    }
  }, [params?.shareToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shared offer...</p>
        </div>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error || 'Shared offer not found'}</p>
          <p className="text-gray-500 text-sm mb-4">
            This link may have expired or been removed.
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatHoursToHoursMinutes = (decimalHours: number) => {
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    
    if (hours === 0 && minutes === 0) return '0h';
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  const totalLessons = courseModules.reduce((sum, module) => sum + module.lessons, 0);
  const totalLearningDuration = courseModules.reduce((sum, module) => {
    const hours = parseFloat(module.learningDuration.replace('h', ''));
    return sum + hours;
  }, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'text-gray-600 bg-gray-100';
      case 'Internal Review': return 'text-blue-600 bg-blue-100';
      case 'Approved': return 'text-green-600 bg-green-100';
      case 'Sent to Client': return 'text-purple-600 bg-purple-100';
      case 'Viewed by Client': return 'text-orange-600 bg-orange-100';
      case 'Negotiation': return 'text-yellow-600 bg-yellow-100';
      case 'Accepted': return 'text-green-700 bg-green-100';
      case 'Rejected': return 'text-red-600 bg-red-100';
      case 'Archived': return 'text-gray-500 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{offer.offer_name}</h1>
              <p className="text-sm text-gray-600 mt-1">
                Training Proposal - {offer.company_name}
              </p>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(offer.status)}`}>
                {offer.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Offer Overview */}
        <div className="bg-white rounded-lg shadow-sm border mb-8 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Offer Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center">
              <Building className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Company</p>
                <p className="text-sm font-medium text-gray-900">{offer.company_name}</p>
              </div>
            </div>
            <div className="flex items-center">
              <User className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Manager</p>
                <p className="text-sm font-medium text-gray-900">{offer.manager}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Created On</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(offer.created_on)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Course Structure */}
        {courseModules.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border mb-8 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Course Structure</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  {totalLessons} Total Lessons
                </span>
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatHoursToHoursMinutes(totalLearningDuration)} Learning Duration
                </span>
              </div>
            </div>
            
            <div className="grid gap-4">
              {courseModules.map((module, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{module.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {module.modules} modules • {module.lessons} lessons
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <div className="text-gray-900 font-medium">
                        Learning: {module.learningDuration}
                      </div>
                      <div className="text-gray-600">
                        Production: {module.productionTime}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quality Levels */}
        {qualityLevels.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Quality Levels & Pricing</h2>
            <div className="grid gap-4">
              {qualityLevels.map((level, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{level.level}</h3>
                    </div>
                    <div className="text-right text-sm">
                      <div className="text-gray-900 font-medium">
                        Learning: {level.learningDuration}
                      </div>
                      <div className="text-gray-600">
                        Production: {level.productionTime}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center py-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            This is a shared training proposal. Contact {offer.manager} for more information.
          </p>
        </div>
      </div>
    </div>
  );
} 