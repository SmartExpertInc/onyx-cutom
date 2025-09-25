"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { format, subDays } from 'date-fns';
import { 
  Download, RefreshCw, ChevronDown, ChevronUp, AlertTriangle, Filter, X, Calendar, ArrowUpDown, ArrowUp, ArrowDown
} from 'lucide-react';
import SlideTypeUsageBarChart from '../../../../components/SlideTypeUsageBarChart';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { getAllTemplates } from '@/components/templates/registry';
import SmartSlideDeckViewer from '../../../../components/SmartSlideDeckViewer';


export const DEFAULT_SLIDE_DECK_JSON_EXAMPLE_FOR_LLM = {
  "lessonTitle": "Digital Marketing Strategy: A Complete Guide",
  "slides": [
    {
      "slideId": "slide_1_intro",
      "slideNumber": 1,
      "slideTitle": "Introduction",
      "templateId": "hero-title-slide",
      "props": {
        "title": "Digital Marketing Strategy",
        "subtitle": "A comprehensive guide to building effective online presence and driving business growth",
        "author": "Marketing Excellence Team",
        "date": "2024",
        "backgroundColor": "#1e40af",
        "titleColor": "#ffffff",
        "subtitleColor": "#bfdbfe"
      }
    },
    {
      "slideId": "slide_2_agenda",
      "slideNumber": 2,
      "slideTitle": "Learning Agenda",
      "templateId": "bullet-points",
      "props": {
        "title": "What We'll Cover Today",
        "bullets": [
          "Understanding digital marketing fundamentals",
          "Market research and target audience analysis",
          "Content strategy development",
          "Social media marketing tactics",
          "Email marketing best practices",
          "SEO and search marketing"
        ],
        "maxColumns": 2,
        "bulletStyle": "number",
        "imagePrompt": "A roadmap or pathway illustration showing the learning journey, modern flat design with blue and purple accents",
        "imageAlt": "Learning roadmap illustration"
      }
    },
    {
      "slideId": "slide_3_stats",
      "slideNumber": 3,
      "slideTitle": "Digital Marketing by the Numbers",
      "templateId": "big-numbers",
      "props": {
        "title": "Digital Marketing Impact",
        "numbers": [
          {
            "value": "4.8B",
            "label": "Internet Users Worldwide",
            "color": "#3b82f6"
          },
          {
            "value": "68%",
            "label": "Of Online Experiences Start with Search",
            "color": "#8b5cf6"
          },
          {
            "value": "$42",
            "label": "ROI for Every $1 Spent on Email Marketing",
            "color": "#10b981"
          }
        ]
      }
    },
    {
      "slideId": "slide_4_ecosystem",
      "slideNumber": 4,
      "slideTitle": "Digital Marketing Ecosystem",
      "templateId": "big-image-top",
      "props": {
        "title": "The Digital Marketing Landscape",
        "content": "Understanding the interconnected nature of digital marketing channels and how they work together to create a cohesive customer experience across all touchpoints.",
        "imageUrl": "https://via.placeholder.com/800x400?text=Digital+Ecosystem",
        "imageAlt": "Digital marketing ecosystem diagram",
        "imagePrompt": "A comprehensive diagram showing interconnected digital marketing channels including social media, email, SEO, PPC, content marketing, and analytics in a modern network visualization",
        "imageSize": "large"
      }
    },
    {
      "slideId": "slide_5_audience_vs_market",
      "slideNumber": 5,
      "slideTitle": "Audience vs Market Research",
      "templateId": "two-column",
      "props": {
        "title": "Understanding the Difference",
        "leftTitle": "Market Research",
        "leftContent": "• Industry trends and size\n• Competitive landscape\n• Market opportunities\n• Overall demand patterns\n• Economic factors",
        "rightTitle": "Audience Research",
        "rightContent": "• Customer demographics\n• Behavioral patterns\n• Pain points and needs\n• Communication preferences\n• Decision-making process"
      }
    },
    {
      "slideId": "slide_6_personas",
      "slideNumber": 6,
      "slideTitle": "Buyer Persona Development",
      "templateId": "process-steps",
      "props": {
        "title": "Creating Effective Buyer Personas",
        "steps": [
          "Collect demographic and psychographic data",
          "Conduct customer interviews and surveys",
          "Analyze behavioral patterns and preferences",
          "Identify goals, challenges, and pain points",
          "Map the customer journey and touchpoints",
          "Validate personas with real customer data"
        ]
      }
    },
    {
      "slideId": "slide_7_content_strategy",
      "slideNumber": 7,
      "slideTitle": "Content Strategy Foundation",
      "templateId": "pyramid",
      "props": {
        "title": "Content Strategy Pyramid",
        "levels": [
          {
            "text": "Content Distribution & Promotion",
            "description": "Multi-channel amplification strategy"
          },
          {
            "text": "Content Creation & Production",
            "description": "High-quality, engaging content development"
          },
          {
            "text": "Content Planning & Calendar",
            "description": "Strategic planning and scheduling"
          },
          {
            "text": "Content Audit & Analysis",
            "description": "Understanding current content performance"
          },
          {
            "text": "Goals, Audience & Brand Foundation",
            "description": "Strategic foundation and core objectives"
          }
        ]
      }
    },
    {
      "slideId": "slide_8_content_types",
      "slideNumber": 8,
      "slideTitle": "Content Format Matrix",
      "templateId": "four-box-grid",
      "props": {
        "title": "Content Formats for Different Goals",
        "boxes": [
          {
            "title": "Educational Content",
            "content": "Blog posts, tutorials, webinars, how-to guides",
            "icon": "📚"
          },
          {
            "title": "Engagement Content", 
            "content": "Social media posts, polls, user-generated content",
            "icon": "💬"
          },
          {
            "title": "Conversion Content",
            "content": "Case studies, testimonials, product demos",
            "icon": "🎯"
          },
          {
            "title": "Entertainment Content",
            "content": "Videos, memes, interactive content, stories",
            "icon": "🎭"
          }
        ]
      }
    },
    {
      "slideId": "slide_9_social_challenges",
      "slideNumber": 9,
      "slideTitle": "Social Media Challenges & Solutions",
      "templateId": "challenges-solutions",
      "props": {
        "title": "Overcoming Social Media Obstacles",
        "challenges": [
          "Low organic reach and engagement",
          "Creating consistent, quality content",
          "Managing multiple platform requirements"
        ],
        "solutions": [
          "Focus on community building and authentic interactions",
          "Develop content pillars and batch creation workflows", 
          "Use scheduling tools and platform-specific strategies"
        ]
      }
    },
    {
      "slideId": "slide_10_email_timeline",
      "slideNumber": 10,
      "slideTitle": "Email Marketing Campaign Timeline",
      "templateId": "timeline",
      "props": {
        "title": "Building Your Email Marketing Program",
        "events": [
          {
            "date": "Week 1-2",
            "title": "Foundation Setup",
            "description": "Choose platform, design templates, set up automation"
          },
          {
            "date": "Week 3-4", 
            "title": "List Building",
            "description": "Create lead magnets, optimize signup forms"
          },
          {
            "date": "Week 5-8",
            "title": "Content Creation",
            "description": "Develop welcome series, newsletters, promotional campaigns"
          },
          {
            "date": "Week 9-12",
            "title": "Optimization",
            "description": "A/B testing, segmentation, performance analysis"
          }
        ]
      }
    },
    {
      "slideId": "slide_11_seo_quote",
      "slideNumber": 11,
      "slideTitle": "SEO Philosophy",
      "templateId": "quote-center",
      "props": {
        "quote": "The best place to hide a dead body is page 2 of Google search results.",
        "author": "Digital Marketing Wisdom",
        "context": "This humorous quote highlights the critical importance of ranking on the first page of search results for visibility and traffic."
      }
    },
    {
      "slideId": "slide_12_seo_factors",
      "slideNumber": 12,
      "slideTitle": "SEO Success Factors",
      "templateId": "bullet-points-right",
      "props": {
        "title": "Key SEO Elements",
        "bullets": [
          "Keyword research and strategic implementation",
          "High-quality, original content creation",
          "Technical SEO and site speed optimization",
          "Mobile-first design and user experience",
          "Authority building through quality backlinks",
          "Local SEO for geographic targeting"
        ],
        "bulletStyle": "dot",
        "imagePrompt": "SEO optimization illustration with search elements, website structure, and ranking factors in a modern, clean style",
        "imageAlt": "SEO optimization visual guide"
      }
    },
    {
      "slideId": "slide_13_paid_advertising",
      "slideNumber": 13,
      "slideTitle": "Paid Advertising Strategy",
      "templateId": "big-image-left",
      "props": {
        "title": "Maximizing Paid Campaign ROI",
        "subtitle": "Strategic paid advertising accelerates reach and drives targeted traffic when organic efforts need support.",
        "imageUrl": "https://via.placeholder.com/600x400?text=Paid+Advertising",
        "imageAlt": "Digital advertising dashboard",
        "imagePrompt": "A modern advertising dashboard showing campaign performance metrics, targeting options, and ROI indicators across multiple platforms",
        "imageSize": "large"
      }
    },
    {
      "slideId": "slide_14_implementation",
      "slideNumber": 14,
      "slideTitle": "90-Day Implementation Plan",
      "templateId": "process-steps",
      "props": {
        "title": "Your Digital Marketing Roadmap",
        "steps": [
          "Month 1: Foundation - Research, audit, and strategy development",
          "Month 2: Launch - Implement core channels and begin content creation",
          "Month 3: Optimize - Analyze data, refine approach, and scale success"
        ]
      }
    },
    {
      "slideId": "slide_15_conclusion",
      "slideNumber": 15,
      "slideTitle": "Success Principles",
      "templateId": "title-slide",
      "props": {
        "title": "Your Digital Marketing Success Formula",
        "subtitle": "Strategy + Consistency + Measurement = Growth",
        "author": "Remember: Digital marketing is a marathon, not a sprint",
        "backgroundColor": "#059669",
        "titleColor": "#ffffff",
        "subtitleColor": "#d1fae5"
      }
    },
    {
      "slideId": "slide_16_table_dark",
      "slideNumber": 16,
      "slideTitle": "Technology Comparison",
      "templateId": "table-dark",
      "props": {
        "title": "Technology Comparison",
        "tableData": {
          "headers": ["Technology", "Performance", "Security", "Cost"],
          "rows": [
            ["React", "High", "Good", "Free"],
            ["Vue.js", "Medium", "Excellent", "Free"],
            ["Angular", "High", "Excellent", "Free"]
          ]
        }
      }
    },
    {
      "slideId": "slide_17_table_light",
      "slideNumber": 17,
      "slideTitle": "Product Features",
      "templateId": "table-light",
      "props": {
        "title": "Product Features Comparison",
        "tableData": {
          "headers": ["Feature", "Basic Plan", "Pro Plan", "Enterprise"],
          "rows": [
            ["Storage", "10GB", "100GB", "Unlimited"],
            ["Users", "5", "25", "Unlimited"],
            ["Support", "Email", "Priority", "24/7"]
          ]
        }
      }
    }
  ],
  "currentSlideId": "slide_1_intro",
  "detectedLanguage": "en"
};

interface AnalyticsDashboard {
  recent_errors: Array<{
    id: number;
    user_id: string;
    template_id: string;
    props: string;
    error_message: string;
    created_at: string;
  }>;
  usage_by_template: Array<{
    template_id: string;
    total_generated: number;
    client_count: number;
    error_count: number;
    last_usage: string;
  }>;
}

const SlidesAnalyticsTab: React.FC = () => {
  const { t } = useLanguage();
  const [dashboard, setDashboard] = useState<AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    from: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd')
  });
  const [refreshKey, setRefreshKey] = useState(0);

  // Expandable sections state
  const [isChartExpanded, setIsChartExpanded] = useState(false);
  const [isUsageTableExpanded, setIsUsageTableExpanded] = useState(true);
  const [isFallbacksExpanded, setIsFallbacksExpanded] = useState(false);

  // Table sorting state
  const [sortField, setSortField] = useState<keyof AnalyticsDashboard['usage_by_template'][0] | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Modal state
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [selectedTemplateForErrors, setSelectedTemplateForErrors] = useState<string | null>(null);
  
  // Preview modal state
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewSlideData, setPreviewSlideData] = useState<any>(null);

  // Get available templates
  const availableTemplates = getAllTemplates().map(t => t.id);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>(availableTemplates.slice(0, 23)); // Default to first 23 templates
  const [showTemplatesDropdown, setShowTemplatesDropdown] = useState(false);

  // Click outside handler for styles dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.styles-dropdown')) {
        setShowTemplatesDropdown(false);
      }
    };

    if (showTemplatesDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTemplatesDropdown]);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
      const params = new URLSearchParams();
      if (dateRange.from) params.append('date_from', dateRange.from);
      if (dateRange.to) params.append('date_to', dateRange.to);
      
      // Fetch both endpoints
      const [errorsResponse, slidesResponse] = await Promise.all([
        fetch(`${CUSTOM_BACKEND_URL}/admin/analytics/slides-errors${params.toString() ? `?${params.toString()}` : ''}`, {
          credentials: 'same-origin'
        }),
        fetch(`${CUSTOM_BACKEND_URL}/admin/analytics/slides${params.toString() ? `?${params.toString()}` : ''}`, {
          credentials: 'same-origin'
        })
      ]);
      
      if (!errorsResponse.ok) {
        throw new Error(`Failed to fetch errors analytics: ${errorsResponse.status}`);
      }
      if (!slidesResponse.ok) {
        throw new Error(`Failed to fetch slides analytics: ${slidesResponse.status}`);
      }
      
      const errorsData = await errorsResponse.json();
      const slidesData = await slidesResponse.json();
      
      // Ensure id is present and is a number for each error
      if (errorsData && Array.isArray(errorsData.recent_errors)) {
        errorsData.recent_errors = errorsData.recent_errors.map((err: any, idx: number) => ({
          id: typeof err.id === 'number' ? err.id : idx + 1,
          ...err
        }));
      }

      // Filter out items with total_generated === 0
      const filteredUsageData = (slidesData.usage_by_template || []).filter((item: any) => item.total_generated > 0);
      
      // Combine the data
      const combinedData: AnalyticsDashboard = {
        recent_errors: errorsData.recent_errors || [],
        usage_by_template: filteredUsageData
      };
      
      setDashboard(combinedData);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [dateRange, refreshKey]);

  // Sorting function
  const handleSort = (field: keyof AnalyticsDashboard['usage_by_template'][0]) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Group usage_by_template by template_id and aggregate values
  const sortedUsageData = useMemo(() => {
    if (!dashboard?.usage_by_template) return [];

    // Group by template_id
    const grouped: Record<string, typeof dashboard.usage_by_template[0]> = {};
    for (const item of dashboard.usage_by_template) {
      if (!grouped[item.template_id]) {
        grouped[item.template_id] = { ...item };
      } else {
        // Aggregate numeric fields (sum), and take the latest last_usage
        grouped[item.template_id].total_generated += item.total_generated;
        grouped[item.template_id].client_count += item.client_count;
        grouped[item.template_id].error_count += item.error_count;
        // For last_usage, take the max (latest)
        if (item.last_usage && (!grouped[item.template_id].last_usage || new Date(item.last_usage) > new Date(grouped[item.template_id].last_usage))) {
          grouped[item.template_id].last_usage = item.last_usage;
        }
      }
    }
    const groupedArr = Object.values(grouped);
    if (sortField) {
      groupedArr.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        if (sortDirection === 'asc') {
          return aStr.localeCompare(bStr);
        } else {
          return bStr.localeCompare(aStr);
        }
      });
    }
    return groupedArr;
  }, [dashboard?.usage_by_template, sortField, sortDirection]);

  // TODO: Implement export functionality
  const handleExport = async (exportFormat: 'csv' | 'json') => {
    try {
      const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      const devUserId = "dummy-onyx-user-id-for-testing";
      if (devUserId && process.env.NODE_ENV === 'development') {
        headers['X-Dev-Onyx-User-ID'] = devUserId;
      }

      const params = new URLSearchParams();
      if (dateRange.from) params.append('date_from', dateRange.from);
      if (dateRange.to) params.append('date_to', dateRange.to);
      params.append('format', exportFormat);

      const response = await fetch(`${CUSTOM_BACKEND_URL}/analytics/export?${params}`, {
        headers,
        cache: 'no-store',
        credentials: 'same-origin'
      });
      if (!response.ok) {
        throw new Error(`Failed to export: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_export_${exportFormat}_${format(new Date(), 'yyyyMMdd_HHmmss')}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting data:', err);
      alert('Failed to export data');
    }
  };

  // Handle preview button click
  const handlePreview = (templateId: string, slideId: string) => {
    const defaultSlide = DEFAULT_SLIDE_DECK_JSON_EXAMPLE_FOR_LLM.slides.find(
      (s) => s.templateId === templateId
    );

    const props = defaultSlide
      ? { ...defaultSlide.props }
      : {
          title: `Preview: ${templateId}`,
          content: 'This is a preview of the slide template.',
        };

    const mockSlideData = {
      slides: [
        {
          slideId: slideId,
          templateId: templateId,
          slideNumber: 1,
          props,
          metadata: {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      ],
      theme: 'default',
    };

    setPreviewSlideData(mockSlideData);
    setShowPreviewModal(true);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">{t('interface.analytics.loadingData', 'Loading analytics data...')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-red-600" />
          <p className="text-red-600 mb-4">{t('interface.analytics.errorLoading', 'Error loading analytics')}</p>
          <p className="text-gray-600 text-sm">{error}</p>
          <button
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t('interface.analytics.retry', 'Retry')}
          </button>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="p-6">
        <p className="text-gray-600">{t('interface.analytics.noDataAvailable', 'No analytics data available')}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Slides Analytics Dashboard</h2>
          <p className="text-gray-600 mt-1">Tracking of slides types creation across all accounts</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title={t('interface.analytics.refreshData', 'Refresh data')}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          {/* 
          <div className="flex space-x-2">
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>{t('interface.analytics.exportCsv', 'Export CSV')}</span>
            </button>
            <button
              onClick={() => handleExport('json')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>{t('interface.analytics.exportJson', 'Export JSON')}</span>
            </button>
          </div>
          */}
        </div>
      </div>

      {/* Chart and Filters Section */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <button
          onClick={() => setIsChartExpanded(!isChartExpanded)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="text-lg font-semibold text-gray-900">Charts & Filters</div>
            <span className="text-sm text-gray-500">Analytics visualization and filter options</span>
          </div>
          {isChartExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>
        
        {isChartExpanded && (
          <div className="px-6 pb-6">
            {/* Filters Section */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <Filter className="w-4 h-4 text-gray-600" />
                <h3 className="text-sm font-medium text-gray-700">{t('interface.analytics.filters', 'Filters')}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Date Range */}
                <div className="lg:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">{t('interface.analytics.dateRange', 'Date Range')}</label>
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        value={dateRange.from}
                        onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <span className="text-gray-500 text-sm">{t('interface.analytics.to', 'to')}</span>
                    <div className="relative flex-1">
                      <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        value={dateRange.to}
                        onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Template Type Checklist */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Select Template Types</label>
                  <div className="relative styles-dropdown">
                    <button
                      type="button"
                      onClick={() => {
                        setShowTemplatesDropdown(!showTemplatesDropdown);
                      }}
                      className="flex items-center justify-between w-full px-4 py-2 rounded-lg border border-gray-300 bg-white/90 text-sm text-black min-w-[200px]"
                    >
                      <span>{selectedTemplateIds.length > 0 ? `${selectedTemplateIds.length} ${t('interface.generate.stylesSelected', 'styles selected')}` : t('interface.generate.selectStyles', 'Select styles')}</span>
                      <ChevronDown size={14} className={`transition-transform ${showTemplatesDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    {showTemplatesDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                        {availableTemplates.map((id) => (
                          <label key={id} className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedTemplateIds.includes(id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedTemplateIds([...selectedTemplateIds, id]);
                                } else {
                                  setSelectedTemplateIds(selectedTemplateIds.filter(s => s !== id));
                                }
                              }}
                              className="mr-3"
                            />
                            <span className="text-sm">{id}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bar chart */}
            <div className="flex gap-6">
              <div className="w-full">
                <SlideTypeUsageBarChart 
                  template_ids={selectedTemplateIds} 
                  usage_by_template={dashboard?.usage_by_template || []}
                  loading={loading}
                  error={error}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Usage Table Section */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <button
          onClick={() => setIsUsageTableExpanded(!isUsageTableExpanded)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="text-lg font-semibold text-gray-900">Usage by Template</div>
            <span className="text-sm text-gray-500">Detailed usage statistics for each template</span>
          </div>
          {isUsageTableExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>
        
        {isUsageTableExpanded && (
          <div className="px-6 pb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('template_id')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Template ID</span>
                        {sortField === 'template_id' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('total_generated')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Total Generated</span>
                        {sortField === 'total_generated' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('client_count')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Client Count</span>
                        {sortField === 'client_count' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('error_count')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Errors</span>
                        {sortField === 'error_count' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('last_usage')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Last Usage</span>
                        {sortField === 'last_usage' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Preview
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedUsageData.map((item, index) => (
                    <tr key={`${item.template_id}-${index}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={item.template_id}>
                        {item.template_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.total_generated.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.client_count.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {item.error_count > 0 ? (
                          <button
                            onClick={() => {
                              setSelectedTemplateForErrors(item.template_id);
                              setShowErrorModal(true);
                            }}
                            className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium hover:bg-red-200 transition-colors cursor-pointer"
                          >
                            {item.error_count} errors
                          </button>
                        ) : (
                          <span className="text-gray-500">0 errors</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.last_usage ? format(new Date(item.last_usage), 'MMM dd, yyyy HH:mm') : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handlePreview(item.template_id, "mock-slide-id")}
                          className="text-blue-600 hover:text-blue-800 text-xs underline cursor-pointer"
                        >
                          Preview
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Fallbacks Section */}
      <div className="bg-white rounded-lg border border-gray-200">
        <button
          onClick={() => setIsFallbacksExpanded(!isFallbacksExpanded)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="text-lg font-semibold text-gray-900">{t('interface.analytics.recentErrors', 'Fallbacks')}</div>
            <span className="text-sm text-gray-500">Recent slide generation errors and fallbacks</span>
          </div>
          {isFallbacksExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>
        
        {isFallbacksExpanded && (
          <div className="px-6 pb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('interface.analytics.time', 'Time')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('interface.analytics.method', 'Slide type')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('interface.analytics.endpoint', 'Props')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('interface.analytics.user', 'User')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('interface.analytics.status', 'Error')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(dashboard.recent_errors || []).slice(0, 20).map((error) => (
                    <tr key={error.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(error.created_at), 'MMM dd, HH:mm:ss')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={error.template_id }>
                        {error.template_id }
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={error.props}>
                        {error.props}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {error.user_id ? (
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                            {error.user_id.substring(0, 8)}...
                          </span>
                        ) : (
                          <span className="text-gray-400">{t('interface.analytics.anonymous', 'Anonymous')}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                        <div className="text-red-600 text-xs" title={error.error_message || t('interface.analytics.noErrorMessage', 'No error message')}>
                          {error.error_message && error.error_message.length > 50 
                            ? `${error.error_message.substring(0, 50)}...`
                            : error.error_message || t('interface.analytics.noErrorMessage', 'No error message')
                            }
                          </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Error Modal */}
      {showErrorModal && selectedTemplateForErrors && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Errors for {selectedTemplateForErrors}
              </h3>
              <button
                onClick={() => {
                  setShowErrorModal(false);
                  setSelectedTemplateForErrors(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Props</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Error</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(dashboard?.recent_errors || [])
                    .filter(error => error.template_id === selectedTemplateForErrors)
                    .map((error) => (
                    <tr key={error.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(error.created_at), 'MMM dd, HH:mm:ss')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {error.user_id ? (
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                            {error.user_id.substring(0, 8)}...
                          </span>
                        ) : (
                          <span className="text-gray-400">Anonymous</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs" title={error.props}>
                        <div className="truncate">
                          {error.props}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                        <div className="text-red-600 text-xs break-words" title={error.error_message}>
                          {error.error_message || 'No error message'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewSlideData && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl max-h-[90vh] w-full mx-4 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Slide Preview
              </h3>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setPreviewSlideData(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-auto max-h-[calc(90vh-80px)]">
              <SmartSlideDeckViewer
                deck={previewSlideData}
                isEditable={false}
                showFormatInfo={false}
                enableAutomaticImageGeneration={false}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlidesAnalyticsTab; 