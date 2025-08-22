"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '../../../contexts/LanguageContext';
import { CheckCircle, Clock, User, Calendar, Building, FileText } from 'lucide-react';

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
  lessons: number;
  learningDuration: string;
  productionTime: string;
}

interface QualityLevel {
  level: string;
  learningDuration: string;
  productionRatio: string;
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

  const totalLessons = courseModules.reduce((sum, module) => sum + module.lessons, 0);
  const totalLearningContent = `${totalLessons}h of learning content`;
  const totalProductionTime = `${offer.total_hours}h production`;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-black mb-2">
            Custom Offer for {offer.company_name}
          </h1>
          <div className="space-y-1 text-sm text-black">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span><strong>Client:</strong> {offer.company_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span><strong>Manager:</strong> {offer.manager}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span><strong>Date:</strong> {formatDate(offer.created_on)}</span>
            </div>
          </div>
        </div>

        {/* Block 1: Course Overview */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-black mb-4">Block 1. Course Overview</h2>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-black border-r border-gray-300">Course Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-black border-r border-gray-300">Modules</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-black border-r border-gray-300">Lessons</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-black border-r border-gray-300">Learning Duration (h)</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-black">Production Time</th>
                </tr>
              </thead>
              <tbody>
                {courseModules.map((module, index) => (
                  <tr key={index} className="border-t border-gray-300">
                    <td className="px-4 py-3 text-sm text-black border-r border-gray-300">{module.title}</td>
                    <td className="px-4 py-3 text-sm text-black border-r border-gray-300">1</td>
                    <td className="px-4 py-3 text-sm text-black border-r border-gray-300">{module.lessons}</td>
                    <td className="px-4 py-3 text-sm text-black border-r border-gray-300">{module.learningDuration}</td>
                    <td className="px-4 py-3 text-sm text-black">{module.productionTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-3 bg-gray-50 border border-gray-300 rounded">
            <p className="text-sm text-black">
              <strong>Subtotal:</strong> {totalLearningContent}, {totalProductionTime}
            </p>
          </div>
        </div>

        {/* Block 2: Production Hours by Quality Level */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-black mb-4">Block 2. Production Hours by Quality Level</h2>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-black border-r border-gray-300">Quality Level</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-black border-r border-gray-300">Learning Duration (h)</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-black border-r border-gray-300">Production Ratio (0 min / 1h learning)</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-black">Production Time</th>
                </tr>
              </thead>
              <tbody>
                {qualityLevels.map((level, index) => (
                  <tr key={index} className="border-t border-gray-300">
                    <td className="px-4 py-3 text-sm text-black border-r border-gray-300">{level.level}</td>
                    <td className="px-4 py-3 text-sm text-black border-r border-gray-300">{level.learningDuration}</td>
                    <td className="px-4 py-3 text-sm text-black border-r border-gray-300">{level.productionRatio}</td>
                    <td className="px-4 py-3 text-sm text-black">{level.productionTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-black">Summary:</span>
          </div>
          <ul className="space-y-2 text-sm text-black ml-7">
            <li>• Total: {totalLessons} hours of learning content</li>
            <li>• Estimated Production Time: {offer.total_hours} hours</li>
            <li>• Production scaling depends on chosen quality tier (200-800h per 1h learning)</li>
          </ul>
        </div>

        {/* Print/Export Actions */}
        <div className="flex gap-4 pt-6 border-t border-gray-300">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Print Offer
          </button>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Back to Offers
          </button>
        </div>
      </div>
    </div>
  );
} 