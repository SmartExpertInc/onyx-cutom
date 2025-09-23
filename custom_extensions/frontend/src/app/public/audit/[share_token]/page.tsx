"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

// Types for the audit data
interface LandingPageData {
  projectId: number
  projectName: string
  companyName: string
  companyDescription: string
  jobPositions: Array<{
    title: string
    description: string
    icon: string
  }>
  workforceCrisis: {
    industry: string
    burnout: {
      months: string
      industryName: string
    }
    turnover: {
      percentage: string
      earlyExit: {
        percentage: string
        months: string
      }
    }
    losses: {
      amount: string
    }
    searchTime: {
      days: string
    }
    chartData: any
    yearlyShortage: {
      yearlyShortage: number
      industry: string
      description: string
    }
  }
  courseOutlineModules: Array<{
    title: string
    lessons: string[]
  }>
  courseTemplates: Array<{
    title: string
    description: string
    modules: number
    lessons: number
    rating: string
    image: string
  }>
  language?: string
  isPublicView?: boolean
  sharedAt?: string
}

// Localization helper function
const getLocalizedText = (language: string | undefined, texts: { en: any; es: any; ua: any; ru: any }) => {
  if (!language) return texts.en;
  return texts[language as keyof typeof texts] || texts.en;
}

export default function PublicAuditPage() {
  const params = useParams()
  const shareToken = params?.share_token as string
  const [auditData, setAuditData] = useState<LandingPageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedModules, setExpandedModules] = useState<{ [key: string]: boolean }>({})

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }))
  }

  useEffect(() => {
    const fetchAuditData = async () => {
      try {
        console.log(`🔍 [PUBLIC VIEWER] Fetching audit data for token: ${shareToken}`)
        
        if (!shareToken) {
          setError('Share token is required')
          setLoading(false)
          return
        }
        
        const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || "/api/custom-projects-backend";
        const apiUrl = `${CUSTOM_BACKEND_URL}/public/audits/${shareToken}`
        
        console.log(`📡 [PUBLIC VIEWER] Making API request to: ${apiUrl}`)
        
        const response = await fetch(apiUrl)
        
        console.log(`📡 [PUBLIC VIEWER] API response status: ${response.status}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Shared audit not found or link is invalid')
          } else if (response.status === 410) {
            throw new Error('This shared audit link has expired')
          } else {
            throw new Error(`Failed to load shared audit: ${response.status}`)
          }
        }
        
        const data = await response.json()
        console.log(`📥 [PUBLIC VIEWER] Data received:`, data)
        
        setAuditData(data)
        console.log(`✅ [PUBLIC VIEWER] Audit data loaded successfully`)
        
      } catch (err) {
        console.error(`❌ [PUBLIC VIEWER] Error loading audit:`, err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (shareToken) {
      fetchAuditData()
    } else {
      setError('Share token not found')
      setLoading(false)
    }
  }, [shareToken])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#0F58F9] mx-auto"></div>
          <p className="mt-4 text-[#71717A]">Loading shared audit...</p>
        </div>
      </div>
    )
  }

  if (error || !auditData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-red-100 rounded-full">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Audit</h1>
          <p className="text-[#71717A] mb-4">
            {error || 'The shared audit could not be found or loaded.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#0F58F9] text-white rounded-md hover:bg-[#0F58F9]/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const { companyName, companyDescription, jobPositions } = auditData

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');
        
        .module-item:last-child {
          border-bottom: none !important;
        }
        
        body, html {
          color: #09090B;
          font-weight: 400;
        }
      `}</style>
      
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col" style={{ fontFamily: 'Inter, sans-serif' }}>
        
        {/* Public View Header */}
        <header className="bg-white border-b border-gray-200 py-4">
          <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#0F58F9] rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">SmartExpert AI Audit</h1>
                <p className="text-sm text-gray-500">
                  {getLocalizedText(auditData?.language, {
                    en: 'Public View',
                    es: 'Vista Pública',
                    ua: 'Публічний перегляд',
                    ru: 'Публичный просмотр'
                  })}
                </p>
              </div>
            </div>
            
            {auditData.sharedAt && (
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  {getLocalizedText(auditData?.language, {
                    en: 'Shared on',
                    es: 'Compartido el',
                    ua: 'Поділено',
                    ru: 'Поделено'
                  })}
                </p>
                <p className="text-sm font-medium text-gray-700">
                  {new Date(auditData.sharedAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
          
          {/* Hero Section */}
          <section className="text-center mb-12">
            <div className="bg-white border border-[#E4E4E7] rounded-full w-fit px-6 py-2 flex items-center gap-2 mx-auto mb-6">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#0F58F9] to-[#6496F8]"></div>
              <span className="font-medium text-sm text-[#71717A] tracking-wide">
                {getLocalizedText(auditData?.language, {
                  en: 'Implement AI onboarding in 7 days',
                  es: 'Implemente incorporación con IA en 7 días',
                  ua: 'Впровадьте AI-онбординг за 7 днів',
                  ru: 'Внедрите AI-онбординг за 7 дней'
                })}
              </span>
            </div>
            
            <h1 className="font-semibold text-4xl md:text-5xl text-[#0F58F9] leading-tight mb-4">
              {getLocalizedText(auditData?.language, {
                en: 'AI Audit',
                es: 'Auditoría IA',
                ua: 'AI-аудит',
                ru: 'AI-аудит'
              })}{' '}
              <span className="text-[#09090B]">
                {getLocalizedText(auditData?.language, {
                  en: 'for company',
                  es: 'para empresa',
                  ua: 'для компанії',
                  ru: 'для компании'
                })} {companyName}
              </span>
            </h1>
            
            <p className="font-normal text-lg text-[#71717A] max-w-2xl mx-auto">
              {companyDescription}
            </p>
          </section>

          {/* Job Positions Section */}
          {jobPositions && jobPositions.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-[#09090B] mb-6 text-center">
                {getLocalizedText(auditData?.language, {
                  en: 'Key Positions',
                  es: 'Posiciones Clave',
                  ua: 'Ключові Позиції',
                  ru: 'Ключевые Позиции'
                })}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobPositions.map((position, index) => (
                  <div key={index} className="bg-white rounded-lg border border-[#E4E4E7] p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{position.icon}</span>
                      <h3 className="font-semibold text-lg text-[#09090B]">{position.title}</h3>
                    </div>
                    <p className="text-[#71717A] text-sm leading-relaxed">{position.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Course Outline Section */}
          {auditData.courseOutlineModules && auditData.courseOutlineModules.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-[#09090B] mb-6 text-center">
                {getLocalizedText(auditData?.language, {
                  en: 'Training Plan',
                  es: 'Plan de Entrenamiento',
                  ua: 'План Навчання',
                  ru: 'План Обучения'
                })}
              </h2>
              
              <div className="bg-white rounded-lg border border-[#E4E4E7] overflow-hidden">
                {auditData.courseOutlineModules.map((module, index) => (
                  <div key={index} className="border-b border-[#E4E4E7] last:border-b-0">
                    <button
                      onClick={() => toggleModule(`module-${index}`)}
                      className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
                    >
                      <div>
                        <h3 className="font-semibold text-[#09090B] mb-1">{module.title}</h3>
                        <p className="text-sm text-[#71717A]">
                          {module.lessons?.length || 0} {getLocalizedText(auditData?.language, {
                            en: 'lessons',
                            es: 'lecciones',
                            ua: 'уроків',
                            ru: 'уроков'
                          })}
                        </p>
                      </div>
                      <svg 
                        className={`w-5 h-5 text-[#71717A] transition-transform ${
                          expandedModules[`module-${index}`] ? 'rotate-180' : ''
                        }`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {expandedModules[`module-${index}`] && module.lessons && (
                      <div className="px-6 pb-4 bg-gray-50">
                        <ul className="space-y-2">
                          {module.lessons.map((lesson, lessonIndex) => (
                            <li key={lessonIndex} className="flex items-center gap-2 text-sm text-[#71717A]">
                              <div className="w-1.5 h-1.5 bg-[#0F58F9] rounded-full"></div>
                              {lesson}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Footer */}
          <footer className="text-center pt-8 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2 mb-4">
              <svg width="24" height="24" viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M8.38153 36.965H9.90545L22.8587 37H24.1203V36.3542C24.1203 34.9919 25.2183 33.8875 26.5726 33.8875H26.6685C27.0308 33.8875 27.3729 33.8974 27.6932 33.9067C29.5775 33.9613 30.7034 33.9939 30.7034 31.8567V25.0572L33.5088 24.6725C34.1842 24.4976 34.6344 24.1479 34.8596 23.6059C35.2406 22.7316 34.9288 21.5775 34.5479 20.8606L32.1927 16.1569C31.9156 15.6498 31.688 12.6792 31.6706 12.277C31.2204 4.11111 24.4173 0 15.7414 0C7.20396 0 0 6.83696 0 14.9154C0 21.0529 2.6149 25.914 7.56763 28.939C8.06983 29.2538 8.38153 30.2155 8.38153 31.5444V36.965Z" fill="#0F58F9"/>
              </svg>
              <span className="text-[#71717A] font-normal text-sm">
                © 2025 SmartExpert, Inc.
              </span>
            </div>
            <p className="text-xs text-[#A1A1AA]">
              {getLocalizedText(auditData?.language, {
                en: 'This is a shared audit view',
                es: 'Esta es una vista de auditoría compartida',
                ua: 'Це спільний перегляд аудиту',
                ru: 'Это общий просмотр аудита'
              })}
            </p>
          </footer>
        </main>
      </div>
    </>
  )
}
