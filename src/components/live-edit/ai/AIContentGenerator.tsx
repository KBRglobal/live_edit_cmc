'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type {
  ContentType,
  ContentTone,
  ContentLanguage,
  ContentGenerationRequest,
} from '@/types/ai';
import { generateContent, rewriteText, improveHeadline, suggestCTA } from '@/lib/ai/aiService';

interface AIContentGeneratorProps {
  initialContent?: string;
  contentType?: ContentType;
  onSelectContent: (content: string) => void;
  onClose?: () => void;
  context?: {
    industry?: string;
    targetAudience?: string;
    pageType?: string;
  };
}

const CONTENT_TYPES: { type: ContentType; label: string; icon: string }[] = [
  { type: 'headline', label: 'כותרת ראשית', icon: '📰' },
  { type: 'subheadline', label: 'כותרת משנה', icon: '📝' },
  { type: 'paragraph', label: 'פסקה', icon: '📄' },
  { type: 'bullet-points', label: 'נקודות', icon: '📋' },
  { type: 'call-to-action', label: 'קריאה לפעולה', icon: '🎯' },
  { type: 'product-description', label: 'תיאור מוצר', icon: '🏷️' },
  { type: 'testimonial', label: 'המלצה', icon: '💬' },
  { type: 'faq', label: 'שאלה ותשובה', icon: '❓' },
  { type: 'meta-description', label: 'תיאור מטא', icon: '🔍' },
  { type: 'social-post', label: 'פוסט חברתי', icon: '📱' },
];

const TONES: { tone: ContentTone; label: string }[] = [
  { tone: 'professional', label: 'מקצועי' },
  { tone: 'friendly', label: 'ידידותי' },
  { tone: 'formal', label: 'רשמי' },
  { tone: 'casual', label: 'לא רשמי' },
  { tone: 'persuasive', label: 'משכנע' },
  { tone: 'informative', label: 'אינפורמטיבי' },
  { tone: 'urgent', label: 'דחוף' },
  { tone: 'playful', label: 'שובב' },
];

const REWRITE_STYLES = [
  { style: 'shorter' as const, label: 'קצר יותר', icon: '📐' },
  { style: 'longer' as const, label: 'ארוך יותר', icon: '📏' },
  { style: 'formal' as const, label: 'פורמלי', icon: '👔' },
  { style: 'casual' as const, label: 'קז\'ואל', icon: '😊' },
  { style: 'persuasive' as const, label: 'משכנע', icon: '💪' },
];

export function AIContentGenerator({
  initialContent = '',
  contentType: initialType = 'paragraph',
  onSelectContent,
  onClose,
  context,
}: AIContentGeneratorProps) {
  const [activeTab, setActiveTab] = useState<'generate' | 'rewrite' | 'improve'>('generate');
  const [selectedType, setSelectedType] = useState<ContentType>(initialType);
  const [selectedTone, setSelectedTone] = useState<ContentTone>('professional');
  const [language, setLanguage] = useState<ContentLanguage>('he');
  const [contextInput, setContextInput] = useState('');
  const [keywords, setKeywords] = useState('');
  const [generatedOptions, setGeneratedOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputText, setInputText] = useState(initialContent);

  // Generate new content
  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const request: ContentGenerationRequest = {
        type: selectedType,
        tone: selectedTone,
        language,
        context: contextInput || undefined,
        keywords: keywords ? keywords.split(',').map((k) => k.trim()) : undefined,
        industry: context?.industry,
        targetAudience: context?.targetAudience,
        count: 3,
      };

      const response = await generateContent(request);
      setGeneratedOptions(response.content);
    } catch (err) {
      setError('שגיאה ביצירת תוכן. נסה שוב.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedType, selectedTone, language, contextInput, keywords, context]);

  // Rewrite existing content
  const handleRewrite = useCallback(
    async (style: 'shorter' | 'longer' | 'formal' | 'casual' | 'persuasive') => {
      if (!inputText.trim()) return;

      setIsLoading(true);
      setError(null);

      try {
        const rewritten = await rewriteText(inputText, style);
        setGeneratedOptions([rewritten]);
      } catch (err) {
        setError('שגיאה בשכתוב. נסה שוב.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
    [inputText]
  );

  // Improve headline
  const handleImproveHeadline = useCallback(async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const improved = await improveHeadline(inputText);
      setGeneratedOptions(improved);
    } catch (err) {
      setError('שגיאה בשיפור הכותרת. נסה שוב.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [inputText]);

  // Suggest CTAs
  const handleSuggestCTA = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const ctas = await suggestCTA(contextInput || 'אתר עסקי');
      setGeneratedOptions(ctas);
    } catch (err) {
      setError('שגיאה ביצירת קריאות לפעולה. נסה שוב.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [contextInput]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="ai-content-generator bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden max-w-2xl w-full"
    >
      {/* Header */}
      <div className="bg-gradient-to-l from-blue-500 to-purple-600 px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✨</span>
            <div>
              <h2 className="text-lg font-semibold">יוצר תוכן AI</h2>
              <p className="text-sm text-white/80">צור תוכן מקצועי בקליק</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        {[
          { id: 'generate', label: 'יצירה חדשה', icon: '✨' },
          { id: 'rewrite', label: 'שכתוב', icon: '🔄' },
          { id: 'improve', label: 'שיפור', icon: '⬆️' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'generate' | 'rewrite' | 'improve')}
            className={`
              flex-1 px-4 py-3 text-sm font-medium transition-colors
              ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800'
              }
            `}
          >
            <span className="ml-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* Generate Tab */}
        {activeTab === 'generate' && (
          <div className="space-y-4">
            {/* Content Type */}
            <div>
              <label className="block text-sm font-medium mb-2">סוג תוכן</label>
              <div className="grid grid-cols-5 gap-2">
                {CONTENT_TYPES.map((item) => (
                  <button
                    key={item.type}
                    onClick={() => setSelectedType(item.type)}
                    className={`
                      p-2 rounded-lg text-center text-xs transition-all
                      ${
                        selectedType === item.type
                          ? 'bg-blue-100 dark:bg-blue-900/40 border-2 border-blue-500'
                          : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="text-xl mb-1">{item.icon}</div>
                    <div className="truncate">{item.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tone */}
            <div>
              <label className="block text-sm font-medium mb-2">טון</label>
              <div className="flex flex-wrap gap-2">
                {TONES.map((item) => (
                  <button
                    key={item.tone}
                    onClick={() => setSelectedTone(item.tone)}
                    className={`
                      px-3 py-1.5 rounded-full text-sm transition-all
                      ${
                        selectedTone === item.tone
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium mb-2">שפה</label>
              <div className="flex gap-2">
                {[
                  { code: 'he' as const, label: 'עברית', flag: '🇮🇱' },
                  { code: 'en' as const, label: 'English', flag: '🇺🇸' },
                  { code: 'ar' as const, label: 'العربية', flag: '🇸🇦' },
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                      ${
                        language === lang.code
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Context */}
            <div>
              <label className="block text-sm font-medium mb-2">
                הקשר (אופציונלי)
              </label>
              <textarea
                value={contextInput}
                onChange={(e) => setContextInput(e.target.value)}
                placeholder="תאר את ההקשר, המוצר, או השירות..."
                className="w-full px-4 py-3 border rounded-lg resize-none h-24 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-sm font-medium mb-2">
                מילות מפתח (מופרדות בפסיק)
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="לדוגמה: חדשנות, איכות, שירות"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-l from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  יוצר תוכן...
                </>
              ) : (
                <>
                  <span>✨</span>
                  צור תוכן
                </>
              )}
            </button>
          </div>
        )}

        {/* Rewrite Tab */}
        {activeTab === 'rewrite' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                טקסט לשכתוב
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="הדבק כאן את הטקסט שברצונך לשכתב..."
                className="w-full px-4 py-3 border rounded-lg resize-none h-32 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                בחר סגנון שכתוב
              </label>
              <div className="grid grid-cols-5 gap-2">
                {REWRITE_STYLES.map((item) => (
                  <button
                    key={item.style}
                    onClick={() => handleRewrite(item.style)}
                    disabled={isLoading || !inputText.trim()}
                    className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    <div className="text-xl mb-1">{item.icon}</div>
                    <div className="text-xs">{item.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Improve Tab */}
        {activeTab === 'improve' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                כותרת או טקסט לשיפור
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="הכנס את הכותרת או הטקסט..."
                className="w-full px-4 py-3 border rounded-lg resize-none h-24 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleImproveHeadline}
                disabled={isLoading || !inputText.trim()}
                className="py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                📰 שפר כותרת
              </button>
              <button
                onClick={handleSuggestCTA}
                disabled={isLoading}
                className="py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors disabled:opacity-50"
              >
                🎯 הצע CTA
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Generated Options */}
        <AnimatePresence>
          {generatedOptions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-6 space-y-3"
            >
              <h3 className="text-sm font-medium">תוצאות ({generatedOptions.length})</h3>
              {generatedOptions.map((option, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-colors"
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {option}
                  </p>
                  <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onSelectContent(option)}
                      className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      ✓ השתמש
                    </button>
                    <button
                      onClick={() => navigator.clipboard.writeText(option)}
                      className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      📋 העתק
                    </button>
                    <button
                      onClick={() => setInputText(option)}
                      className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      🔄 ערוך
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default AIContentGenerator;
