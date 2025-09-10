'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'

interface LandingPageData {
  projectId: number
  projectName: string
  companyName: string
  companyDescription: string
}

export default function DynamicAuditLandingPage() {
  const params = useParams()
  const projectId = params?.projectId as string
  const [landingPageData, setLandingPageData] = useState<LandingPageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLandingPageData = async () => {
      try {
        if (!projectId) {
          setError('Project ID is required')
          setLoading(false)
          return
        }
        
        const response = await fetch(`/api/custom/ai-audit/landing-page/${projectId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch landing page data')
        }
        const data = await response.json()
        setLandingPageData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (projectId) {
      fetchLandingPageData()
    } else {
      setError('Project ID not found')
      setLoading(false)
    }
  }, [projectId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#0F58F9] mx-auto"></div>
          <p className="mt-4 text-[#71717A]">Загрузка данных...</p>
        </div>
      </div>
    )
  }

  if (error || !landingPageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">Ошибка: {error || 'Данные не найдены'}</p>
        </div>
      </div>
    )
  }

  const { companyName, companyDescription } = landingPageData

  return (
    <div className="min-h-screen bg-white">
      {/* First Section */}
      <section className="relative bg-white pt-[50px] xl:pt-[100px] pb-[60px] xl:pb-[100px] px-[20px] xl:px-[120px]">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col xl:flex-row items-center gap-[40px] xl:gap-[60px]">
            {/* Text Content */}
            <div className="flex-1 xl:max-w-[600px]">
              {/* Title with colored text and span */}
              <h1 className="font-semibold text-[34px] xl:text-[64px] text-[#0F58F9] leading-[120%] tracking-[0%]">
                AI-аудит <span className="text-[#09090B]">для компании {companyName}</span>
              </h1>
              
              {/* Description text */}
              <p className="font-normal text-[18px] xl:text-[20px] text-[#71717A] tracking-[0%]">
                {companyDescription}
              </p>
            </div>
            
            {/* Image */}
            <div className="-mx-[20px] xl:absolute xl:left-[770px] xl:top-0 xl:-mx-0 xl:z-10">
              <Image
                src="/images/audit-hero.png"
                alt="AI Audit Hero"
                width={400}
                height={400}
                className="w-full max-w-[400px] h-auto"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Second Section */}
      <section className="bg-[#FAFAFA] pt-[50px] xl:pt-[100px] pb-[60px] xl:pb-[100px] px-[20px] xl:px-[120px]">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="font-medium text-[32px] xl:text-[46px] leading-[120%] xl:leading-[115%] tracking-[-0.03em] mb-[30px] xl:mb-[50px]">
            Что включает в себя AI-аудит?
          </h2>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-[30px] xl:gap-[40px]">
            {/* Module 1 */}
            <div className="bg-white rounded-[16px] p-[30px] xl:p-[40px] shadow-sm">
              <div className="flex items-center gap-[16px] mb-[20px]">
                <div className="w-[48px] h-[48px] bg-[#0F58F9] rounded-[12px] flex items-center justify-center">
                  <span className="text-white font-semibold text-[20px]">1</span>
                </div>
                <h3 className="font-semibold text-[20px] xl:text-[24px] text-[#09090B]">
                  Анализ текущих процессов
                </h3>
              </div>
              <p className="text-[#71717A] text-[16px] xl:text-[18px] leading-[150%]">
                Детальный анализ существующих процессов адаптации новых сотрудников, выявление узких мест и возможностей для улучшения.
              </p>
            </div>

            {/* Module 2 */}
            <div className="bg-white rounded-[16px] p-[30px] xl:p-[40px] shadow-sm">
              <div className="flex items-center gap-[16px] mb-[20px]">
                <div className="w-[48px] h-[48px] bg-[#0F58F9] rounded-[12px] flex items-center justify-center">
                  <span className="text-white font-semibold text-[20px]">2</span>
                </div>
                <h3 className="font-semibold text-[20px] xl:text-[24px] text-[#09090B]">
                  Рекомендации по улучшению
                </h3>
              </div>
              <p className="text-[#71717A] text-[16px] xl:text-[18px] leading-[150%]">
                Конкретные рекомендации по оптимизации процессов адаптации с использованием современных технологий и лучших практик.
              </p>
            </div>

            {/* Module 3 */}
            <div className="bg-white rounded-[16px] p-[30px] xl:p-[40px] shadow-sm">
              <div className="flex items-center gap-[16px] mb-[20px]">
                <div className="w-[48px] h-[48px] bg-[#0F58F9] rounded-[12px] flex items-center justify-center">
                  <span className="text-white font-semibold text-[20px]">3</span>
                </div>
                <h3 className="font-semibold text-[20px] xl:text-[24px] text-[#09090B]">
                  План внедрения
                </h3>
              </div>
              <p className="text-[#71717A] text-[16px] xl:text-[18px] leading-[150%]">
                Пошаговый план внедрения рекомендаций с учетом специфики вашей компании и доступных ресурсов.
              </p>
            </div>

            {/* Module 4 */}
            <div className="bg-white rounded-[16px] p-[30px] xl:p-[40px] shadow-sm">
              <div className="flex items-center gap-[16px] mb-[20px]">
                <div className="w-[48px] h-[48px] bg-[#0F58F9] rounded-[12px] flex items-center justify-center">
                  <span className="text-white font-semibold text-[20px]">4</span>
                </div>
                <h3 className="font-semibold text-[20px] xl:text-[24px] text-[#09090B]">
                  Оценка эффективности
                </h3>
              </div>
              <p className="text-[#71717A] text-[16px] xl:text-[18px] leading-[150%]">
                Метрики и показатели для оценки эффективности внедренных изменений и их влияния на адаптацию сотрудников.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Third Section */}
      <section className="bg-[#FAFAFA] pt-[50px] xl:pt-[100px] pb-[60px] xl:pb-[100px] px-[20px] xl:px-[120px] ">
        <h2 className="font-medium text-[32px] xl:text-[46px] leading-[120%] xl:leading-[115%] tracking-[-0.03em] mb-[30px] xl:mb-[50px]">
          Открытые вакансии <br className="xl:hidden"/> {companyName}
        </h2>
        
        <div className="flex flex-col xl:flex-row gap-[20px] xl:gap-[30px]">
          {/* Job Card 1 */}
          <div className="flex-1 bg-white rounded-[16px] p-[30px] xl:p-[40px] shadow-sm">
            <div className="flex items-center gap-[16px] mb-[20px]">
              <div className="w-[48px] h-[48px] bg-[#0F58F9] rounded-[12px] flex items-center justify-center">
                <span className="text-white font-semibold text-[20px]">👷</span>
              </div>
              <h3 className="font-semibold text-[20px] xl:text-[24px] text-[#09090B]">
                Техник HVAC
              </h3>
            </div>
            <p className="text-[#71717A] text-[16px] xl:text-[18px] leading-[150%] mb-[20px]">
              Установка и обслуживание систем отопления, вентиляции и кондиционирования воздуха.
            </p>
            <div className="flex items-center gap-[8px] text-[#0F58F9] font-medium text-[14px] xl:text-[16px]">
              <span>Подробнее</span>
              <span>→</span>
            </div>
          </div>

          {/* Job Card 2 */}
          <div className="flex-1 bg-white rounded-[16px] p-[30px] xl:p-[40px] shadow-sm">
            <div className="flex items-center gap-[16px] mb-[20px]">
              <div className="w-[48px] h-[48px] bg-[#0F58F9] rounded-[12px] flex items-center justify-center">
                <span className="text-white font-semibold text-[20px]">⚡</span>
              </div>
              <h3 className="font-semibold text-[20px] xl:text-[24px] text-[#09090B]">
                Электрик
              </h3>
            </div>
            <p className="text-[#71717A] text-[16px] xl:text-[18px] leading-[150%] mb-[20px]">
              Монтаж и обслуживание электрических систем в жилых и коммерческих зданиях.
            </p>
            <div className="flex items-center gap-[8px] text-[#0F58F9] font-medium text-[14px] xl:text-[16px]">
              <span>Подробнее</span>
              <span>→</span>
            </div>
          </div>

          {/* Job Card 3 */}
          <div className="flex-1 bg-white rounded-[16px] p-[30px] xl:p-[40px] shadow-sm">
            <div className="flex items-center gap-[16px] mb-[20px]">
              <div className="w-[48px] h-[48px] bg-[#0F58F9] rounded-[12px] flex items-center justify-center">
                <span className="text-white font-semibold text-[20px]">☀️</span>
              </div>
              <h3 className="font-semibold text-[20px] xl:text-[24px] text-[#09090B]">
                Специалист по солнечным панелям
              </h3>
            </div>
            <p className="text-[#71717A] text-[16px] xl:text-[18px] leading-[150%] mb-[20px]">
              Установка и настройка солнечных энергетических систем для частных и коммерческих клиентов.
            </p>
            <div className="flex items-center gap-[8px] text-[#0F58F9] font-medium text-[14px] xl:text-[16px]">
              <span>Подробнее</span>
              <span>→</span>
            </div>
          </div>
        </div>
      </section>

      {/* Fourth Section */}
      <section className="bg-white pt-[50px] xl:pt-[100px] pb-[60px] xl:pb-[100px] px-[20px] xl:px-[120px]">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="font-medium text-[32px] xl:text-[46px] leading-[120%] xl:leading-[115%] tracking-[-0.03em] mb-[30px] xl:mb-[50px] text-center">
            Преимущества AI-аудита
          </h2>
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-[30px] xl:gap-[40px]">
            {/* Benefit 1 */}
            <div className="text-center">
              <div className="w-[80px] h-[80px] bg-[#0F58F9] rounded-[20px] flex items-center justify-center mx-auto mb-[20px]">
                <span className="text-white text-[32px]">📊</span>
              </div>
              <h3 className="font-semibold text-[20px] xl:text-[24px] text-[#09090B] mb-[12px]">
                Объективный анализ
              </h3>
              <p className="text-[#71717A] text-[16px] xl:text-[18px] leading-[150%]">
                Независимая оценка текущих процессов адаптации с использованием данных и аналитики.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="text-center">
              <div className="w-[80px] h-[80px] bg-[#0F58F9] rounded-[20px] flex items-center justify-center mx-auto mb-[20px]">
                <span className="text-white text-[32px]">⚡</span>
              </div>
              <h3 className="font-semibold text-[20px] xl:text-[24px] text-[#09090B] mb-[12px]">
                Быстрые результаты
              </h3>
              <p className="text-[#71717A] text-[16px] xl:text-[18px] leading-[150%]">
                Получите детальный отчет и рекомендации в течение нескольких дней.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="text-center">
              <div className="w-[80px] h-[80px] bg-[#0F58F9] rounded-[20px] flex items-center justify-center mx-auto mb-[20px]">
                <span className="text-white text-[32px]">🎯</span>
              </div>
              <h3 className="font-semibold text-[20px] xl:text-[24px] text-[#09090B] mb-[12px]">
                Персонализированные решения
              </h3>
              <p className="text-[#71717A] text-[16px] xl:text-[18px] leading-[150%]">
                Рекомендации, адаптированные под специфику вашей компании и отрасли.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Fifth Section */}
      <section className="bg-[#0F58F9] pt-[50px] xl:pt-[100px] pb-[60px] xl:pb-[100px] px-[20px] xl:px-[120px]">
        <div className="max-w-[1200px] mx-auto text-center">
          <h2 className="font-medium text-[32px] xl:text-[46px] leading-[120%] xl:leading-[115%] tracking-[-0.03em] mb-[20px] xl:mb-[30px] text-white">
            Готовы начать AI-аудит?
          </h2>
          <p className="text-[18px] xl:text-[20px] text-white/80 mb-[40px] xl:mb-[50px] max-w-[600px] mx-auto">
            Получите детальный анализ ваших процессов адаптации и рекомендации по их улучшению
          </p>
          
          <button className="bg-white text-[#0F58F9] font-semibold text-[16px] xl:text-[18px] px-[40px] xl:px-[50px] py-[16px] xl:py-[20px] rounded-[12px] hover:bg-gray-50 transition-colors">
            Начать AI-аудит
          </button>
        </div>
      </section>
    </div>
  )
}
