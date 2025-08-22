"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '../../../contexts/LanguageContext';
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

export default function OfferDetailPage() {
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
    const fetchOfferDetails = async () => {
      try {
        setLoading(true);
        
        // Check if params and offerId exist
        if (!params?.offerId) {
          setError('Offer ID is required');
          setLoading(false);
          return;
        }
        
        const headers: HeadersInit = { "Content-Type": "application/json" };
        const devUserId = "dummy-onyx-user-id-for-testing";
        if (devUserId && process.env.NODE_ENV === "development") {
          headers["X-Dev-Onyx-User-ID"] = devUserId;
        }

        // Fetch offer details
        const offerResponse = await fetch(`${CUSTOM_BACKEND_URL}/offers/${params.offerId}/details`, {
          headers,
          credentials: 'same-origin',
        });

        if (!offerResponse.ok) {
          if (offerResponse.status === 401 || offerResponse.status === 403) {
            router.push('/auth/login');
            return;
          }
          throw new Error('Failed to fetch offer details');
        }

        const offerData = await offerResponse.json();
        setOffer(offerData.offer);
        setCourseModules(offerData.courseModules);
        setQualityLevels(offerData.qualityLevels);
      } catch (error) {
        console.error('Error fetching offer details:', error);
        setError(error instanceof Error ? error.message : 'Failed to load offer details');
      } finally {
        setLoading(false);
      }
    };

    if (params?.offerId) {
      fetchOfferDetails();
    }
  }, [params?.offerId, router, CUSTOM_BACKEND_URL]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading offer details...</p>
        </div>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error || 'Offer not found'}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
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
  const totalLearningContent = `${formatHoursToHoursMinutes(totalLearningDuration)} of learning content`;
  const totalProductionTime = `${formatHoursToHoursMinutes(offer.total_hours)} production`;

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      <div className="max-w-6xl mx-auto p-6 print:p-4">
        <style jsx global>{`
          @media print {
            body { -webkit-print-color-adjust: exact; }
            .print\\:hidden { display: none !important; }
            .print\\:bg-white { background-color: white !important; }
            .print\\:p-4 { padding: 1rem !important; }
            .shadow-sm { box-shadow: none !important; }
            .border { border-color: #e5e7eb !important; }
          }
        `}</style>
        {/* Header with Print Button */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Custom Offer for {offer.company_name}
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-gray-400" />
                  <span><strong className="text-gray-700">Client:</strong> {offer.company_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span><strong className="text-gray-700">Manager:</strong> {offer.manager}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span><strong className="text-gray-700">Date:</strong> {formatDate(offer.created_on)}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors print:hidden"
              title="Print Offer"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>

        {/* Block 1: Course Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Block 1. Course Overview</h2>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-200">Course Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-200">Modules</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-200">Lessons</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-200">Learning Duration (h)</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Production Time</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courseModules.map((module, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200 font-medium">{module.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 border-r border-gray-200">{module.modules}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 border-r border-gray-200">{module.lessons}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 border-r border-gray-200">
                      {(() => {
                        // Parse and format learning duration
                        const hours = parseFloat(module.learningDuration.replace('h', ''));
                        return formatHoursToHoursMinutes(hours);
                      })()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {(() => {
                        // Parse and format production time
                        const hours = parseFloat(module.productionTime.replace('h', ''));
                        return formatHoursToHoursMinutes(hours);
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Subtotal:</strong> {totalLearningContent}, {totalProductionTime}
            </p>
          </div>
        </div>

        {/* Block 2: Production Hours by Quality Level */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Block 2. Production Hours by Quality Level</h2>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-200">Quality Level</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-200">Learning Duration (h)</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Production Time</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {qualityLevels.map((level, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200 font-medium">{level.level}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 border-r border-gray-200">
                      {(() => {
                        // Parse and format learning duration
                        const hours = parseFloat(level.learningDuration.replace('h', ''));
                        return formatHoursToHoursMinutes(hours);
                      })()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {(() => {
                        // Parse and format production time
                        const hours = parseFloat(level.productionTime.replace('h', ''));
                        return formatHoursToHoursMinutes(hours);
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-xl font-semibold text-gray-900">Summary</span>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-medium">•</span>
                <span>Total: <strong className="text-gray-900">{formatHoursToHoursMinutes(totalLearningDuration)}</strong> of learning content</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-medium">•</span>
                <span>Estimated Production Time: <strong className="text-gray-900">{formatHoursToHoursMinutes(offer.total_hours)}</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-medium">•</span>
                <span>Production scaling depends on chosen quality tier (200-800h per 1h learning)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 